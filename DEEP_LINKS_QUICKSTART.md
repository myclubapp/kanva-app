# Deep Links - Quick Start Guide

## ✅ Was bereits gemacht wurde

Ich habe den Code bereits vorbereitet:

1. ✅ **Capacitor Config** - Deep Linking aktiviert
2. ✅ **App.tsx** - Deep Link Listener hinzugefügt
3. ✅ **AuthContext.tsx** - Domain-basierte Redirect URL konfiguriert

## 🎯 Was Sie noch tun müssen

### Schritt 1: Domain festlegen

**In der Datei:** `src/contexts/AuthContext.tsx` (Zeile 171)

Ersetzen Sie:
```typescript
redirectUrl = 'https://kanva.myclub.app/auth/callback';
```

Mit **Ihrer Domain**:
```typescript
redirectUrl = 'https://IHR-DOMAIN.com/auth/callback';
```

---

### Schritt 2: Server-Dateien erstellen

Auf Ihrem Web-Server (z.B. `kanva.myclub.app`):

#### Datei 1: `.well-known/apple-app-site-association`

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "IHRE_TEAM_ID.app.myclub.kanva",
        "paths": ["/auth/*", "/callback/*"]
      }
    ]
  }
}
```

**Team ID finden:**
- Gehe zu https://developer.apple.com/account
- Membership > Team ID

**Wichtig:**
- Keine Datei-Endung (.json)!
- Erreichbar unter: `https://IHR-DOMAIN/.well-known/apple-app-site-association`
- Content-Type: `application/json`

#### Datei 2: `.well-known/assetlinks.json`

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "app.myclub.kanva",
    "sha256_cert_fingerprints": [
      "HIER_IHR_SHA256_FINGERPRINT"
    ]
  }
}]
```

**SHA256 Fingerprint finden:**

```bash
# Debug (für Testing):
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA256

# Production (für Release):
keytool -list -v -keystore /path/to/release.keystore -alias your-alias | grep SHA256
```

**Wichtig:**
- Mit Doppelpunkten (XX:XX:XX:...)
- Erreichbar unter: `https://IHR-DOMAIN/.well-known/assetlinks.json`

---

### Schritt 3: iOS Konfiguration

```bash
# iOS Projekt öffnen
npx cap sync
npx cap open ios
```

**In Xcode:**

1. Wähle **kanva-mobile** Target
2. Gehe zu **Signing & Capabilities**
3. Klicke **+ Capability** → **Associated Domains**
4. Füge hinzu: `applinks:IHR-DOMAIN.com` (ohne `https://`!)

**Beispiel:**
```
applinks:kanva.myclub.app
```

---

### Schritt 4: Android Konfiguration

```bash
# Android Projekt öffnen
npx cap sync
npx cap open android
```

**Datei:** `android/app/src/main/AndroidManifest.xml`

Füge in `<activity>` Tag ein (nach den anderen `<intent-filter>`):

```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />

    <data
        android:scheme="https"
        android:host="IHR-DOMAIN.com"
        android:pathPrefix="/auth" />
</intent-filter>
```

**Beispiel:**
```xml
<data
    android:scheme="https"
    android:host="kanva.myclub.app"
    android:pathPrefix="/auth" />
```

---

### Schritt 5: Supabase Dashboard

Gehe zu: **Supabase Dashboard > Authentication > URL Configuration**

**Füge hinzu unter "Redirect URLs":**
```
https://IHR-DOMAIN.com/**
```

**Beispiel:**
```
https://kanva.myclub.app/**
```

---

### Schritt 6: Web-Server Redirect (Optional aber empfohlen)

Erstelle eine Seite auf: `https://IHR-DOMAIN.com/auth/callback/index.html`

```html
<!DOCTYPE html>
<html>
<head>
    <title>Redirecting to KANVA App...</title>
    <script>
        // Öffne die App mit dem Deep Link
        setTimeout(() => {
            window.location.href = window.location.href;
        }, 500);
    </script>
</head>
<body style="text-align: center; padding: 2rem; font-family: system-ui;">
    <h1>Öffne KANVA App...</h1>
    <p>Du wirst zur App weitergeleitet.</p>
</body>
</html>
```

---

## 🧪 Testing

### iOS testen:

1. **Build:**
   ```bash
   npm run build
   npx cap sync
   npx cap open ios
   ```

2. **Auf echtem iPhone installieren** (Simulator funktioniert nicht zuverlässig)

3. **Testen:**
   - Schicke dir eine Email/SMS mit: `https://IHR-DOMAIN.com/auth/callback`
   - Tippe auf den Link
   - ✅ App sollte sich öffnen!

4. **Safari Test:**
   - Öffne Safari auf iPhone
   - Gib ein: `https://IHR-DOMAIN.com/auth/callback`
   - Lange auf Link drücken
   - ✅ Sollte "In KANVA öffnen" zeigen

### Android testen:

1. **Build:**
   ```bash
   npm run build
   npx cap sync
   npx cap open android
   ```

2. **Auf echtem Android-Gerät installieren**

3. **Via ADB testen:**
   ```bash
   adb shell am start -a android.intent.action.VIEW -d "https://IHR-DOMAIN.com/auth/callback"
   ```
   ✅ App sollte sich öffnen!

---

## ✅ Checklist

- [ ] Domain in `AuthContext.tsx` angepasst
- [ ] `.well-known/apple-app-site-association` auf Server hochgeladen
- [ ] `.well-known/assetlinks.json` auf Server hochgeladen
- [ ] iOS: Associated Domains in Xcode hinzugefügt
- [ ] Android: Intent Filter in AndroidManifest.xml
- [ ] Supabase: Redirect URL konfiguriert
- [ ] iOS: Auf echtem Gerät getestet
- [ ] Android: Auf echtem Gerät getestet

---

## 🐛 Probleme?

Siehe die ausführliche Anleitung: **DEEP_LINKS_SETUP.md**

Oder testen Sie erstmal mit der **manuellen Link-Eingabe** (ist bereits implementiert):
1. Magic Link per Email anfordern
2. Link aus Email kopieren
3. In der App einfügen
4. ✅ Funktioniert sofort!
