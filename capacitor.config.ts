import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.myclub.kanva',
  appName: 'kanva-mobile',
  webDir: 'dist',

  // Deep Links / Universal Links Setup
  // Damit Magic Links direkt die App öffnen statt im Browser zu landen
  plugins: {
    App: {
      disableBackButtonHandler: true,
      // customScheme: 'kanva'  // Für URL Scheme (kanva://) - Optional
    }
  }
};

export default config;
