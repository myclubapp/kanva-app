import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for auth errors in URL hash
    const hash = window.location.hash;
    if (hash.includes('error=')) {
      const params = new URLSearchParams(hash.substring(1));
      const error = params.get('error');
      const errorCode = params.get('error_code');
      const errorDescription = params.get('error_description');

      console.error('[AuthContext] Auth error in URL:', {
        error,
        errorCode,
        errorDescription: decodeURIComponent(errorDescription || '')
      });

      // Clear the error from URL
      window.history.replaceState({}, document.title, window.location.pathname);

      // Show user-friendly error message
      if (errorCode === 'otp_expired') {
        alert('❌ Der Magic Link ist abgelaufen. Bitte fordere einen neuen Link an.');
        window.location.href = '/login';
        return;
      }
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[AuthContext] Initial session loaded:', session ? 'User found' : 'No user');
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('[AuthContext] Loading profile for user:', session.user.id);
        loadProfile(session.user.id);
      } else {
        console.log('[AuthContext] No user, setting loading to false');
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthContext] Auth state changed:', event, session ? 'User found' : 'No user');
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('[AuthContext] Loading profile for user:', session.user.id);
        loadProfile(session.user.id);
      } else {
        console.log('[AuthContext] No user, clearing profile');
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) return { error };

      // Create profile
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName || null,
        } as any);
      }

      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signInWithMagicLink = async (email: string) => {
    // For production: Use your domain for Universal Links
    // For development: Use localhost
    const isProd = import.meta.env.PROD;
    const isCapacitor = window.location.protocol === 'capacitor:';

    let redirectUrl: string;

    if (isProd || isCapacitor) {
      // Production: Use getkanva.io for Universal/App Links
      redirectUrl = 'https://www.getkanva.io/auth/callback';
    } else {
      // Development: Use localhost
      const origin = window.location.origin;
      redirectUrl = `${origin}/tabs/profile`;
    }

    console.log('[AuthContext] Environment:', { isProd, isCapacitor });
    console.log('[AuthContext] Sending magic link with redirect:', redirectUrl);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
        shouldCreateUser: true,
      },
    });

    if (error) {
      console.error('[AuthContext] Error sending magic link:', error);
    } else {
      console.log('[AuthContext] Magic link sent successfully to:', email);
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates as any)
        .eq('id', user.id);

      if (error) throw error;

      // Reload profile
      await loadProfile(user.id);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signInWithMagicLink,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
