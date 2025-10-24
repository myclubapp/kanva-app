# Deep Links Setup für KANVA Mobile App

Diese Anleitung zeigt, wie Sie Deep Links einrichten, damit Magic Links direkt die App öffnen statt im Browser zu landen.

## 📋 Voraussetzungen

- Eine **eigene Domain** (z.B. `kanva.myclub.app`)
- Zugriff auf den **Web-Server** dieser Domain
- Apple Developer Account (für iOS Universal Links)
- Google Play Console Account (für Android App Links)

---

## 🎯 Was wir erreichen wollen

**Vorher:**
Magic Link → Öffnet Browser → Zeigt Fehler/leitet nicht zur App

**Nachher:**
Magic Link → Öffnet direkt die App → User ist eingeloggt

---

## 📱 Setup-Schritte

### Option A: URL Scheme (Einfach, aber weniger elegant)

Dies ist der **einfachste Weg** für Development/Testing, funktioniert aber nicht mit Magic Links direkt aus der Email.

#### 1. Capacitor Config anpassen

```typescript
// capacitor.config.ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.myclub.kanva',
  appName: 'kanva-mobile',
  webDir: 'dist',

  // Deep Links Setup
  plugins: {
    App: {
      deepLinkingEnabled: true,
      customScheme: 'kanva'  // Wird zu: kanva://
    }
  }
};

export default config;
```

#### 2. iOS: Xcode konfigurieren

```bash
# iOS Projekt öffnen
npx cap open ios
```

In Xcode:
1. Wähle **kanva-mobile** Target
2. Gehe zu **Info** Tab
3. Erweitere **URL Types**
4. Klicke **+** und füge hinzu:
   - **Identifier:** `app.myclub.kanva`
   - **URL Schemes:** `kanva`
   - **Role:** `Editor`

#### 3. Android: Intent Filter konfigurieren

```bash
# Android Projekt öffnen
npx cap open android
```

Datei: `android/app/src/main/AndroidManifest.xml`

Füge innerhalb von `<activity>` hinzu:

```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="kanva" />
</intent-filter>
```

#### 4. Supabase Redirect URL anpassen

```typescript
// src/contexts/AuthContext.tsx
const signInWithMagicLink = async (email: string) => {
  const redirectUrl = 'kanva://auth/callback';  // Custom URL Scheme

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl,
    },
  });

  return { error };
};
```

#### 5. Supabase Dashboard konfigurieren

Gehe zu **Supabase Dashboard > Authentication > URL Configuration**

Füge hinzu:
```
kanva://auth/callback
```

#### ⚠️ Problem mit Option A:

Email-Clients erlauben **keine Custom URL Schemes** in Links aus Sicherheitsgründen. Der Link wird im Browser geöffnet, nicht in der App.

**Lösung:** Option B verwenden (Universal/App Links)

---

### Option B: Universal Links (iOS) + App Links (Android) ✅ Empfohlen

Dies ist der **professionelle Weg**. Magic Links öffnen direkt die App.

#### Voraussetzung: Eigene Domain

Sie brauchen eine Domain, z.B. `kanva.myclub.app` oder `app.myclub.ch`

#### 1. Server-Konfiguration

Erstellen Sie zwei Dateien auf Ihrem Web-Server:

**Datei 1:** `.well-known/apple-app-site-association` (für iOS)

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.app.myclub.kanva",
        "paths": ["/auth/*", "/callback/*"]
      }
    ]
  }
}
```

Ersetzen Sie `TEAM_ID` mit Ihrer Apple Team ID (zu finden in Apple Developer Account).

**Wichtig:**
- Datei hat **KEINE Datei-Endung**
- Content-Type: `application/json`
- Muss über **HTTPS** erreichbar sein
- URL: `https://kanva.myclub.app/.well-known/apple-app-site-association`

**Datei 2:** `.well-known/assetlinks.json` (für Android)

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "app.myclub.kanva",
    "sha256_cert_fingerprints": [
      "XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX"
    ]
  }
}]
```

**SHA256 Fingerprint finden:**

```bash
# Debug Keystore (Development)
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Release Keystore (Production)
keytool -list -v -keystore /path/to/your/release.keystore -alias your-alias
```

Kopiere den **SHA256** Fingerprint (mit Doppelpunkten).

**Wichtig:**
- Content-Type: `application/json`
- Muss über **HTTPS** erreichbar sein
- URL: `https://kanva.myclub.app/.well-known/assetlinks.json`

#### 2. iOS: Associated Domains konfigurieren

```bash
npx cap open ios
```

In Xcode:
1. Wähle **kanva-mobile** Target
2. Gehe zu **Signing & Capabilities** Tab
3. Klicke **+ Capability**
4. Füge **Associated Domains** hinzu
5. Klicke **+** und füge hinzu:
   ```
   applinks:kanva.myclub.app
   ```

**Wichtig:** Kein `https://` Prefix!

#### 3. iOS: Entitlements File prüfen

Datei: `ios/App/App/App.entitlements`

Sollte automatisch erstellt werden mit:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.developer.associated-domains</key>
    <array>
        <string>applinks:kanva.myclub.app</string>
    </array>
</dict>
</plist>
```

#### 4. Android: Intent Filter mit Domain

Datei: `android/app/src/main/AndroidManifest.xml`

Füge innerhalb von `<activity>` hinzu:

```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />

    <data
        android:scheme="https"
        android:host="kanva.myclub.app"
        android:pathPrefix="/auth" />
</intent-filter>
```

**Wichtig:** `android:autoVerify="true"` für automatische Verifizierung.

#### 5. Capacitor: Deep Link Listener

```typescript
// src/App.tsx
import { App as CapApp } from '@capacitor/app';

const App: React.FC = () => {
  useEffect(() => {
    // Listen for app URL open events (Universal Links / App Links)
    CapApp.addListener('appUrlOpen', (event: any) => {
      console.log('[App] Deep link received:', event.url);

      // Extract the URL
      const url = new URL(event.url);

      // Handle auth callback
      if (url.pathname.includes('/auth') || url.pathname.includes('/callback')) {
        // Supabase will automatically handle the hash parameters
        // Just navigate to a route that will process them
        const fullUrl = event.url;

        // If there's a hash with access_token, Supabase auth will pick it up
        if (fullUrl.includes('#access_token=')) {
          window.location.href = '/tabs/profile';
        }
      }
    });

    return () => {
      CapApp.removeAllListeners();
    };
  }, []);

  // ... rest of component
};
```

#### 6. Supabase Redirect URL anpassen

```typescript
// src/contexts/AuthContext.tsx
const signInWithMagicLink = async (email: string) => {
  // Use your domain for Universal/App Links
  const redirectUrl = 'https://kanva.myclub.app/auth/callback';

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl,
    },
  });

  return { error };
};
```

#### 7. Supabase Dashboard konfigurieren

Gehe zu **Supabase Dashboard > Authentication > URL Configuration**

Füge hinzu:
```
https://kanva.myclub.app/**
```

#### 8. Web-Server: Redirect von kanva.myclub.app/auth/callback

Da der Link zuerst auf Ihrem Web-Server landet, brauchen Sie ein Redirect-Script:

**Datei:** `auth/callback/index.html` auf Ihrem Server

```html
<!DOCTYPE html>
<html>
<head>
    <title>Redirecting to KANVA App...</title>
    <meta charset="utf-8">
    <script>
        // Get the full URL with hash
        const fullUrl = window.location.href;
        const hash = window.location.hash;

        // If app is installed, this will open the app
        // If not, it will stay on this page
        setTimeout(() => {
            // Try to open the app with the deep link
            window.location.href = fullUrl;

            // Fallback: Show download links after 2 seconds
            setTimeout(() => {
                document.getElementById('fallback').style.display = 'block';
            }, 2000);
        }, 500);
    </script>
</head>
<body style="font-family: system-ui; text-align: center; padding: 2rem;">
    <h1>Öffne KANVA App...</h1>
    <p>Du wirst zur App weitergeleitet.</p>

    <div id="fallback" style="display: none; margin-top: 2rem;">
        <p>App nicht installiert?</p>
        <a href="https://apps.apple.com/app/kanva/id..." style="margin: 0.5rem;">
            📱 iOS App herunterladen
        </a>
        <br>
        <a href="https://play.google.com/store/apps/details?id=app.myclub.kanva" style="margin: 0.5rem;">
            🤖 Android App herunterladen
        </a>
    </div>
</body>
</html>
```

---

## 🧪 Testing

### iOS Universal Links testen:

1. **Build & Deploy:**
   ```bash
   npm run build
   npx cap sync
   npx cap open ios
   ```

2. **Auf echtem Gerät installieren** (Simulator unterstützt Universal Links nicht zuverlässig)

3. **Link testen:**
   - Schicke dir selbst eine Email oder SMS mit: `https://kanva.myclub.app/auth/callback#access_token=test`
   - Tippe auf den Link
   - ✅ App sollte sich öffnen

4. **Oder via Safari testen:**
   - Öffne Safari
   - Gebe ein: `https://kanva.myclub.app/auth/callback`
   - Lange auf Link drücken
   - ✅ Sollte "In KANVA öffnen" Option zeigen

5. **Apple-Validierung:**
   ```bash
   # Prüfen ob Apple-App-Site-Association valide ist
   curl -v https://kanva.myclub.app/.well-known/apple-app-site-association
   ```

### Android App Links testen:

1. **Build & Deploy:**
   ```bash
   npm run build
   npx cap sync
   npx cap open android
   ```

2. **Auf echtem Gerät installieren**

3. **Link testen via ADB:**
   ```bash
   adb shell am start -a android.intent.action.VIEW -d "https://kanva.myclub.app/auth/callback"
   ```

4. **Google-Validierung:**
   ```bash
   # Prüfen ob assetlinks.json valide ist
   curl https://kanva.myclub.app/.well-known/assetlinks.json
   ```

---

## 🐛 Troubleshooting

### iOS: App öffnet nicht

1. **Associated Domains prüfen:**
   - Xcode > Signing & Capabilities > Associated Domains
   - Muss `applinks:kanva.myclub.app` enthalten (ohne `https://`)

2. **Apple-App-Site-Association prüfen:**
   ```bash
   curl https://kanva.myclub.app/.well-known/apple-app-site-association
   ```
   - Muss 200 OK zurückgeben
   - Content-Type: `application/json`
   - Keine `.json` Dateiendung!

3. **Team ID prüfen:**
   - Muss mit Apple Developer Team ID übereinstimmen
   - Format: `TEAM_ID.app.myclub.kanva`

4. **iOS Cache löschen:**
   - Settings > Safari > Clear History and Website Data
   - Gerät neu starten

### Android: App öffnet nicht

1. **Intent Filter prüfen:**
   - `android:autoVerify="true"` muss gesetzt sein
   - `android:scheme="https"` (nicht `http`)

2. **assetlinks.json prüfen:**
   ```bash
   curl https://kanva.myclub.app/.well-known/assetlinks.json
   ```
   - SHA256 Fingerprint muss korrekt sein
   - package_name muss `app.myclub.kanva` sein

3. **Android Verifizierung prüfen:**
   ```bash
   adb shell pm get-app-links app.myclub.kanva
   ```

4. **Manual Testing:**
   - Settings > Apps > KANVA > Open by default
   - Sollte `kanva.myclub.app` als verifizierte Domain zeigen

---

## 🎯 Zusammenfassung

**Was Sie brauchen:**

1. ✅ **Domain:** z.B. `kanva.myclub.app`
2. ✅ **Web-Server:** Mit HTTPS und Zugriff auf `.well-known/`
3. ✅ **Apple Developer Account:** Für Team ID und Associated Domains
4. ✅ **Android Keystore:** Für SHA256 Fingerprint

**Schritte:**

1. Server-Dateien erstellen (`.well-known/apple-app-site-association` + `assetlinks.json`)
2. iOS: Associated Domains hinzufügen
3. Android: Intent Filter konfigurieren
4. Capacitor: Deep Link Listener einbauen
5. Supabase: Redirect URL auf Ihre Domain setzen
6. Testen auf echten Geräten

**Ergebnis:**

Magic Links aus Emails öffnen direkt die App! 🎉
