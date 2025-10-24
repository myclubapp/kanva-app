-- Subscription System Migration for Kanva Mobile App
-- This migration creates all necessary tables and functions for the subscription system

-- Helper function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create subscription tiers enum
CREATE TYPE public.subscription_tier AS ENUM ('free', 'amateur', 'pro', 'premium');

-- Create subscription limits table
CREATE TABLE public.subscription_limits (
  tier subscription_tier PRIMARY KEY,
  max_teams INTEGER NOT NULL,
  max_custom_templates INTEGER NOT NULL,
  max_games_per_template INTEGER NOT NULL,
  can_use_custom_templates BOOLEAN NOT NULL DEFAULT false,
  can_upload_logos BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on subscription_limits
ALTER TABLE public.subscription_limits ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read subscription limits
CREATE POLICY "Authenticated users can view subscription limits"
  ON public.subscription_limits FOR SELECT
  TO authenticated
  USING (true);

-- Insert subscription limits for each tier
-- Free: 1 team, no templates, 1 game per template, no custom features
-- Amateur: 3 teams, 5 templates, 3 games per template, can use templates
-- Pro: 10 teams, 5 templates, 5 games per template, all features
-- Premium: unlimited teams/templates/games, all features
INSERT INTO public.subscription_limits (tier, max_teams, max_custom_templates, max_games_per_template, can_use_custom_templates, can_upload_logos) VALUES
  ('free', 1, 0, 1, false, false),
  ('amateur', 3, 5, 3, true, false),
  ('pro', 10, 5, 5, true, true),
  ('premium', 999, 999, 999, true, true);

-- Create user_subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_product_id TEXT,
  subscription_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Create user_team_slots table for tracking team selections
CREATE TABLE public.user_team_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id TEXT NOT NULL,
  team_name TEXT,
  club_id TEXT,
  sport TEXT,
  last_changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, team_id)
);

ALTER TABLE public.user_team_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own team slots"
  ON public.user_team_slots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own team slots"
  ON public.user_team_slots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own team slots"
  ON public.user_team_slots FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own team slots"
  ON public.user_team_slots FOR DELETE
  USING (auth.uid() = user_id);

-- Create user_logos table for Pro/Premium users
CREATE TABLE public.user_logos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT,
  logo_type TEXT CHECK (logo_type IN ('club', 'sponsor')) NOT NULL DEFAULT 'sponsor',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_logos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own logos"
  ON public.user_logos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Pro users can insert logos"
  ON public.user_logos FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.user_subscriptions us
      JOIN public.subscription_limits sl ON us.tier = sl.tier
      WHERE us.user_id = auth.uid() AND sl.can_upload_logos = true
    )
  );

CREATE POLICY "Users can update their own logos"
  ON public.user_logos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own logos"
  ON public.user_logos FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage bucket for user logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-logos', 'user-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for user logos
CREATE POLICY "Users can view logos in bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-logos');

CREATE POLICY "Pro users can upload logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'user-logos' AND
    auth.uid()::text = (storage.foldername(name))[1] AND
    EXISTS (
      SELECT 1 FROM public.user_subscriptions us
      JOIN public.subscription_limits sl ON us.tier = sl.tier
      WHERE us.user_id = auth.uid() AND sl.can_upload_logos = true
    )
  );

CREATE POLICY "Users can update their own logos in storage"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'user-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own logos from storage"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'user-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to initialize user subscription on signup
CREATE OR REPLACE FUNCTION public.initialize_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, tier)
  VALUES (NEW.id, 'free')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to initialize subscription on user creation
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_subscription();

-- Function to check if user can add more team slots
CREATE OR REPLACE FUNCTION public.can_add_team_slot(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  max_allowed INTEGER;
BEGIN
  -- Get current team count
  SELECT COUNT(*) INTO current_count
  FROM public.user_team_slots
  WHERE user_id = p_user_id;

  -- Get max allowed for user's tier
  SELECT sl.max_teams INTO max_allowed
  FROM public.user_subscriptions us
  JOIN public.subscription_limits sl ON us.tier = sl.tier
  WHERE us.user_id = p_user_id;

  RETURN current_count < max_allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to check if team can be changed (30-day limit)
CREATE OR REPLACE FUNCTION public.can_change_team_slot(p_user_id UUID, p_team_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  last_change TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT last_changed_at INTO last_change
  FROM public.user_team_slots
  WHERE user_id = p_user_id AND team_id = p_team_id;

  -- If no record exists, change is allowed
  IF last_change IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Check if at least 30 days have passed
  RETURN last_change < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RPC Function for checking subscription status (called from app)
CREATE OR REPLACE FUNCTION public.check_subscription()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'subscribed', CASE WHEN tier IN ('amateur', 'pro', 'premium') THEN true ELSE false END,
    'tier', tier,
    'subscription_end', subscription_end,
    'product_id', stripe_product_id
  ) INTO result
  FROM public.user_subscriptions
  WHERE user_id = auth.uid();

  -- If no subscription found, return free tier
  IF result IS NULL THEN
    result := json_build_object(
      'subscribed', false,
      'tier', 'free',
      'subscription_end', null,
      'product_id', null
    );
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update updated_at on user_subscriptions
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update updated_at on user_logos
DROP TRIGGER IF EXISTS update_user_logos_updated_at ON public.user_logos;
CREATE TRIGGER update_user_logos_updated_at
  BEFORE UPDATE ON public.user_logos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Initialize subscriptions for existing users
INSERT INTO public.user_subscriptions (user_id, tier)
SELECT id, 'free'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_subscriptions)
ON CONFLICT (user_id) DO NOTHING;
