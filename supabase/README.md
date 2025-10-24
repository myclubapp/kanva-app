# Kanva App - Supabase Setup Guide

This guide will help you set up the subscription system for the Kanva mobile app using Supabase and Stripe.

## Prerequisites

- Supabase project set up
- Stripe account with API keys
- Supabase CLI installed (`npm install -g supabase`)

## Step 1: Database Migration

Run the database migration to create all necessary tables and functions:

```bash
# Connect to your Supabase project
supabase login

# Link to your project (replace with your project reference)
supabase link --project-ref your-project-ref

# Run the migration
psql postgres://[YOUR_CONNECTION_STRING] < migrations/20251024_subscription_system.sql
```

Alternatively, you can run the SQL directly in the Supabase SQL Editor:
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the content of `migrations/20251024_subscription_system.sql`
4. Click "Run"

### What this migration creates:

- **Tables:**
  - `subscription_limits` - Defines limits for each subscription tier
  - `user_subscriptions` - Stores user subscription data
  - `user_team_slots` - Tracks team selections with change limits
  - `user_logos` - Stores uploaded logos

- **Functions:**
  - `initialize_user_subscription()` - Auto-creates free subscription on signup
  - `can_add_team_slot()` - Checks if user can add more teams
  - `can_change_team_slot()` - Enforces 30-day cooldown for team changes
  - `check_subscription()` - RPC function for checking subscription status

- **Storage:**
  - `user-logos` bucket - For storing user-uploaded logos

## Step 2: Deploy Supabase Edge Functions

Deploy the three Edge Functions for subscription management:

```bash
# Deploy check-subscription function
supabase functions deploy check-subscription

# Deploy create-checkout function
supabase functions deploy create-checkout

# Deploy customer-portal function
supabase functions deploy customer-portal
```

## Step 3: Set Environment Variables

Set the required environment variables for the Edge Functions:

```bash
# Set Stripe secret key
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Set app URL (for redirect URLs)
supabase secrets set APP_URL=https://kanva.myclub.app
```

## Step 4: Update Stripe Configuration

### Update Product and Price IDs

In `functions/check-subscription/index.ts`, update the product and price mappings with your Stripe IDs:

```typescript
const PRODUCT_TIER_MAP: Record<string, string> = {
  "prod_YOUR_AMATEUR_MONTHLY": "amateur",
  "prod_YOUR_AMATEUR_YEARLY": "amateur",
  "prod_YOUR_PRO_MONTHLY": "pro",
  "prod_YOUR_PRO_YEARLY": "pro",
  "prod_YOUR_PREMIUM_MONTHLY": "premium",
  "prod_YOUR_PREMIUM_YEARLY": "premium",
};

const PRICE_TIER_MAP: Record<string, string> = {
  "price_YOUR_AMATEUR_MONTHLY": "amateur",
  "price_YOUR_AMATEUR_YEARLY": "amateur",
  "price_YOUR_PRO_MONTHLY": "pro",
  "price_YOUR_PRO_YEARLY": "pro",
  "price_YOUR_PREMIUM_MONTHLY": "premium",
  "price_YOUR_PREMIUM_YEARLY": "premium",
};
```

### Update Payment Method Configuration

In `functions/create-checkout/index.ts`, update the payment method configuration:

```typescript
payment_method_configuration: 'pmc_YOUR_PAYMENT_METHOD_CONFIG_ID',
```

You can find this in your Stripe Dashboard under **Settings > Payment methods**.

## Step 5: Configure Stripe Webhooks (Optional but Recommended)

Set up webhooks to automatically sync subscription changes:

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://[YOUR_PROJECT_REF].supabase.co/functions/v1/check-subscription`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the signing secret and set it:

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Step 6: Update Mobile App Configuration

In your React app (`src/hooks/useSubscription.tsx`), the Price IDs are already configured:

```typescript
export const SUBSCRIPTION_PRICES = {
  amateur: {
    monthly: 'price_1SIt38GSAgdOdkjUibu3LJtf',
    yearly: 'price_1SIt3CGSAgdOdkjUDitQ01mm',
  },
  pro: {
    monthly: 'price_1SIt3GGSAgdOdkjUXJNvNa7j',
    yearly: 'price_1SIt3GGSAgdOdkjUvIqxD2n1',
  },
  premium: {
    monthly: 'price_1SIt3HGSAgdOdkjUiURGlI67',
    yearly: 'price_1SIt3HGSAgdOdkjUCP4AgG6c',
  },
};
```

Update these with your actual Stripe Price IDs.

## Step 7: Test the Integration

### Test Free Tier
1. Create a new account in the app
2. Verify that a `user_subscriptions` record is created with `tier = 'free'`
3. Check that Templates and Logos pages show the paywall

### Test Subscription Flow
1. Log in to the app
2. Navigate to Templates or Logos
3. Click "Jetzt upgraden"
4. Complete the Stripe checkout
5. Return to the app
6. Verify that the paywall is now gone and content is accessible

### Test Subscription Limits
1. Check `subscription_limits` table to see limits for each tier
2. Verify that features are enabled/disabled based on tier:
   - Free: No templates, no logos
   - Amateur: 5 templates, no logos
   - Pro: 5 templates, logo upload enabled
   - Premium: Unlimited templates and logos

## Subscription Tiers Overview

| Feature | Free | Amateur | Pro | Premium |
|---------|------|---------|-----|---------|
| **Price** | CHF 0 | CHF 6.90/mo | CHF 15/mo | CHF 30/mo |
| **Max Teams** | 1 | 3 | 10 | Unlimited |
| **Max Templates** | 0 | 5 | 5 | Unlimited |
| **Games per Template** | 1 | 3 | 5 | Unlimited |
| **Custom Templates** | ❌ | ✅ | ✅ | ✅ |
| **Logo Upload** | ❌ | ❌ | ✅ | ✅ |

## Troubleshooting

### Paywall still shows after subscribing

1. Check if `check_subscription()` function is being called
2. Verify Stripe Product/Price IDs are mapped correctly
3. Check Supabase logs for errors:
   ```bash
   supabase functions logs check-subscription
   ```

### Edge Function errors

View logs for debugging:
```bash
supabase functions logs check-subscription --tail
supabase functions logs create-checkout --tail
supabase functions logs customer-portal --tail
```

### Subscription not updating in database

1. Verify the Edge Function has correct permissions
2. Check that `SUPABASE_SERVICE_ROLE_KEY` is set
3. Ensure the user is authenticated when calling functions

## Security Notes

- Never expose `STRIPE_SECRET_KEY` in client-side code
- Always use `SUPABASE_SERVICE_ROLE_KEY` for Edge Functions that modify subscriptions
- Implement proper RLS policies on all tables (already included in migration)
- Use Stripe webhooks to ensure subscription status is always up-to-date

## Support

For issues or questions:
1. Check Supabase logs
2. Check Stripe Dashboard for subscription status
3. Verify all environment variables are set correctly
4. Ensure database migration completed successfully

## Additional Resources

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Stripe Subscriptions Documentation](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Ionic Capacitor Documentation](https://capacitorjs.com/docs)
