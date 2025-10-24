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
  },

  // iOS Export Compliance Configuration
  // Gibt an, dass die App keine nicht-exempte Verschlüsselung verwendet
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#ffffff',
    // Info.plist Anpassungen für Export Compliance
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false
    }
  }
};

export default config;
