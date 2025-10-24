import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonInput,
  IonButton,
  IonText,
  IonLoading,
  IonToast,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [magicLinkUrl, setMagicLinkUrl] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { signInWithMagicLink, user, loading: authLoading } = useAuth();
  const history = useHistory();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      history.replace('/tabs/studio');
    }
  }, [user, authLoading, history]);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const { error } = await signInWithMagicLink(email);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess('Magic Link wurde gesendet! Bitte überprüfe deine E-Mails. Für Capacitor/Mobile: Kopiere den Link aus der E-Mail und füge ihn unten ein.');
      setShowManualInput(true);
      setLoading(false);
    }
  };

  const handleManualLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Extract the token and type from the Supabase verify URL
      const url = new URL(magicLinkUrl);
      const token = url.searchParams.get('token');
      const type = url.searchParams.get('type');

      if (!token || type !== 'magiclink') {
        throw new Error('Ungültiger Magic Link. Bitte überprüfe die URL.');
      }

      console.log('[Login] Manually processing magic link token');

      // Use Supabase's verifyOtp to verify the token
      const { supabase } = await import('../config/supabase');
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'magiclink',
      });

      if (error) {
        throw error;
      }

      if (data?.session) {
        console.log('[Login] Successfully authenticated via manual link!');
        setSuccess('Erfolgreich angemeldet!');
        // The auth context will pick up the session automatically
        setTimeout(() => {
          history.push('/tabs/profile');
        }, 1000);
      }
    } catch (err: any) {
      console.error('[Login] Error processing manual link:', err);
      setError(err.message || 'Fehler beim Verarbeiten des Links');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="login-page" scrollY={false}>
        {/* Animated Background Glow */}
        <div className="animated-background">
          <div className="glow glow-1" />
          <div className="glow glow-2" />
          <div className="glow glow-3" />
          <div className="glow glow-4" />
          <div className="glow glow-5" />
          <div className="glow glow-6" />
          <div className="glow glow-7" />
          <div className="glow glow-8" />
        </div>

        <div className="login-wrapper">
          <div className="login-content">
            <div className="login-card">
              <h1 className="login-title">Willkommen bei KANVA</h1>
              <p className="login-subtitle">
                Melde dich mit deiner E-Mail-Adresse an
              </p>

              <form onSubmit={handleMagicLink} className="email-form">
                <IonInput
                  type="email"
                  value={email}
                  placeholder="deine.email@beispiel.ch"
                  onIonInput={(e) => setEmail(e.detail.value!)}
                  required
                  className="email-input"
                  fill="solid"
                />
                <IonButton
                  expand="block"
                  type="submit"
                  className="login-submit-button"
                  disabled={loading}
                >
                  Login-Link senden
                </IonButton>
              </form>

              <IonText className="info-text">
                <p>Du erhältst eine E-Mail mit einem Login-Link</p>
              </IonText>

              {/* Manual Magic Link Input for Capacitor */}
              {showManualInput && (
                <>
                  <div style={{ margin: '2rem 0 1rem', textAlign: 'center' }}>
                    <IonText color="medium">
                      <p style={{ fontSize: '0.9rem', margin: '0.5rem 0' }}>
                        oder
                      </p>
                    </IonText>
                  </div>
                  <form onSubmit={handleManualLink} className="email-form">
                    <IonInput
                      type="url"
                      value={magicLinkUrl}
                      placeholder="https://supabase.co/auth/v1/verify?token=..."
                      onIonInput={(e) => setMagicLinkUrl(e.detail.value!)}
                      required
                      className="email-input"
                      fill="solid"
                    />
                    <IonButton
                      expand="block"
                      type="submit"
                      className="login-submit-button"
                      disabled={loading}
                      color="secondary"
                    >
                      Mit Link anmelden
                    </IonButton>
                  </form>
                  <IonText className="info-text">
                    <p style={{ fontSize: '0.85rem' }}>Kopiere den kompletten Link aus der E-Mail</p>
                  </IonText>
                </>
              )}
            </div>
          </div>
        </div>

        <IonLoading isOpen={loading} message="Wird gesendet..." />
        <IonToast
          isOpen={!!error}
          message={error}
          duration={3000}
          onDidDismiss={() => setError('')}
          color="danger"
        />
        <IonToast
          isOpen={!!success}
          message={success}
          duration={5000}
          onDidDismiss={() => setSuccess('')}
          color="success"
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
