import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Login from './pages/Login';
import Tabs from './pages/Tabs';
import { IonSpinner } from '@ionic/react';
import { App as CapApp } from '@capacitor/app';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

/* Global styles */
import './global.css';

setupIonicReact();

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  // Log when component mounts and when user state changes
  React.useEffect(() => {
    console.log('[AppRoutes] Component state:', {
      user: !!user,
      loading,
      url: window.location.href,
      hash: window.location.hash
    });
  }, [user, loading]);

  if (loading) {
    console.log('[AppRoutes] Still loading auth state...');
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(180deg, #0A0E27 0%, #1a1f3a 100%)'
      }}>
        <IonSpinner name="crescent" color="primary" style={{ transform: 'scale(1.5)' }} />
      </div>
    );
  }

  console.log('[AppRoutes] Auth loaded, user:', user ? 'Found' : 'Not found');

  return (
    <IonReactRouter>
      <IonRouterOutlet>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/tabs">
          <Tabs />
        </Route>
        <Route exact path="/">
          <Redirect to="/tabs/studio" />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  );
};

const App: React.FC = () => {
  React.useEffect(() => {
    // Listen for Deep Links / Universal Links / App Links
    // Dies wird aufgerufen wenn die App via Link geöffnet wird
    const listener = CapApp.addListener('appUrlOpen', (event: any) => {
      console.log('[App] Deep link received:', event.url);

      const url = event.url;

      // Check if it's an auth callback
      if (url.includes('/auth') || url.includes('/callback') || url.includes('#access_token=')) {
        console.log('[App] Auth callback detected in deep link');

        // Extract the hash part if present
        const hashIndex = url.indexOf('#');
        if (hashIndex !== -1) {
          const hash = url.substring(hashIndex);
          console.log('[App] Auth hash found:', hash);

          // Navigate to a route and let Supabase handle the hash
          // The hash will be automatically processed by Supabase auth
          window.location.href = `/tabs/profile${hash}`;
        } else {
          // No hash, just navigate
          window.location.href = '/tabs/profile';
        }
      }
    });

    return () => {
      listener.then(l => l.remove());
    };
  }, []);

  return (
    <IonApp>
      <LanguageProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </LanguageProvider>
    </IonApp>
  );
};

export default App;
