# KANVA Deep Links - Finale Setup-Anleitung

**Domain:** www.getkanva.io
**Bundle ID:** app.myclub.kanva

---

## 📋 Checkliste

### Phase 1: Server-Dateien (10 Min)
- [ ] Apple Team ID in apple-app-site-association eintragen
- [ ] SHA256 Fingerprint in assetlinks.json eintragen
- [ ] Dateien auf www.getkanva.io hochladen
- [ ] Verifizieren: Dateien über Browser erreichbar

### Phase 2: iOS Setup (15 Min)
- [ ] Xcode öffnen
- [ ] Associated Domains hinzufügen
- [ ] App auf echtem iPhone testen

### Phase 3: Android Setup (15 Min)
- [ ] Android Studio öffnen
- [ ] Intent Filter in AndroidManifest.xml
- [ ] App auf echtem Android-Gerät testen

### Phase 4: Supabase (5 Min)
- [ ] Redirect URL in Supabase Dashboard eintragen

---

## 🚀 Phase 1: Server-Dateien hochladen

### Schritt 1.1: Apple Team ID finden

1. Gehe zu https://developer.apple.com/account
2. Klicke auf **Membership** (linke Seite)
3. Kopiere die **Team ID** (z.B. `A1B2C3D4E5`)

### Schritt 1.2: SHA256 Fingerprint finden

Öffne Terminal und führe aus:

**Für Development/Testing:**
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA256
```

**Für Production (wenn Sie einen Release Key haben):**
```bash
keytool -list -v -keystore /path/to/release.keystore -alias your-alias | grep SHA256
```

Kopiere den **kompletten SHA256** Wert (mit Doppelpunkten).

**Beispiel Output:**
```
SHA256: 14:6D:E9:83:C5:73:06:50:D8:EE:B9:95:2F:34:FC:64:16:A0:83:42:E6:1D:BE:A8:8A:04:96:B2:3F:CF:44:E5
```

### Schritt 1.3: Server-Dateien anpassen

1. **Öffne:** `server-files/.well-known/apple-app-site-association`
2. **Ersetze** `YOUR_TEAM_ID` mit Ihrer Team ID:
   ```json
   "appID": "A1B2C3D4E5.app.myclub.kanva",
   ```

3. **Öffne:** `server-files/.well-known/assetlinks.json`
4. **Ersetze** `YOUR_SHA256_FINGERPRINT_HERE` mit Ihrem SHA256:
   ```json
   "sha256_cert_fingerprints": [
     "14:6D:E9:83:C5:73:06:50:D8:EE:B9:95:2F:34:FC:64:16:A0:83:42:E6:1D:BE:A8:8A:04:96:B2:3F:CF:44:E5"
   ]
   ```

### Schritt 1.4: Auf Server hochladen

Lade die Dateien auf **www.getkanva.io** hoch:

```
www.getkanva.io/
├── .well-known/
│   ├── apple-app-site-association
│   └── assetlinks.json
└── auth/
    └── callback/
        └── index.html
```

**Via FTP/SFTP oder cPanel File Manager**

### Schritt 1.5: Verifizieren

Öffne im Browser:

1. ✅ https://www.getkanva.io/.well-known/apple-app-site-association
2. ✅ https://www.getkanva.io/.well-known/assetlinks.json
3. ✅ https://www.getkanva.io/auth/callback

Alle sollten erfolgreich laden (kein 404).

---

## 📱 Phase 2: iOS Setup

### Schritt 2.1: Projekt vorbereiten

```bash
cd /Users/sandro/Projects/myclub/kanva-app
npm run build
npx cap sync
npx cap open ios
```

### Schritt 2.2: Associated Domains in Xcode

1. **Xcode sollte sich öffnen**
2. Wähle das **App** Target (nicht Pods!)
3. Gehe zum Tab **Signing & Capabilities**
4. Klicke **+ Capability** (oben links)
5. Wähle **Associated Domains**
6. Klicke auf das **+** unter Associated Domains
7. Füge hinzu:
   ```
   applinks:www.getkanva.io
   ```

   **WICHTIG:**
   - Kein `https://`!
   - Kein `/` am Ende!
   - Mit `www.` wenn Ihre Domain das braucht!

### Schritt 2.3: App auf echtem iPhone installieren

⚠️ **Universal Links funktionieren NICHT im Simulator!**

1. Schließe Ihr **iPhone** per USB an
2. Wähle Ihr iPhone als Target oben in Xcode
3. Klicke **▶ Run** oder drücke `Cmd+R`
4. Erlauben Sie ggf. Developer Mode auf dem iPhone
5. App sollte auf dem iPhone installiert werden

### Schritt 2.4: iOS Testen

**Methode 1: Via Safari**

1. Öffne **Safari** auf dem iPhone
2. Gehe zu: `https://www.getkanva.io/auth/callback`
3. **Lange auf den Link drücken**
4. ✅ Es sollte "In KANVA öffnen" als Option erscheinen

**Methode 2: Via Notes/Messages**

1. Öffne **Notes** oder **Messages** App
2. Tippe ein: `https://www.getkanva.io/auth/callback`
3. Tippe auf den Link
4. ✅ App sollte sich öffnen

**Falls es nicht funktioniert:**
- Warte 24 Stunden (Apple cached)
- Gehe zu Settings > Safari > Clear History and Website Data
- Gerät neu starten

---

## 🤖 Phase 3: Android Setup

### Schritt 3.1: Projekt öffnen

```bash
cd /Users/sandro/Projects/myclub/kanva-app
npm run build
npx cap sync
npx cap open android
```

### Schritt 3.2: AndroidManifest.xml bearbeiten

**Datei:** `android/app/src/main/AndroidManifest.xml`

Finde das `<activity>` Tag mit `android:name=".MainActivity"` und füge **innerhalb** dieses Tags hinzu:

```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />

    <data
        android:scheme="https"
        android:host="www.getkanva.io"
        android:pathPrefix="/auth" />
</intent-filter>
```

**Vollständiges Beispiel:**

```xml
<activity
    android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
    android:name=".MainActivity"
    android:label="@string/title_activity_main"
    android:theme="@style/AppTheme.NoActionBarLaunch"
    android:launchMode="singleTask"
    android:exported="true">

    <!-- Existing intent-filter for app launch -->
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>

    <!-- NEW: Deep Link Intent Filter -->
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />

        <data
            android:scheme="https"
            android:host="www.getkanva.io"
            android:pathPrefix="/auth" />
    </intent-filter>

</activity>
```

### Schritt 3.3: App auf Android-Gerät installieren

1. Schließe Ihr **Android-Gerät** per USB an
2. Aktiviere **Developer Options** und **USB Debugging** auf dem Gerät
3. In Android Studio: Klicke **▶ Run**
4. Wähle Ihr Gerät aus
5. App wird installiert

### Schritt 3.4: Android Testen

**Methode 1: Via ADB**

```bash
adb shell am start -a android.intent.action.VIEW -d "https://www.getkanva.io/auth/callback"
```

✅ App sollte sich öffnen!

**Methode 2: Via Chrome**

1. Öffne **Chrome** auf Android
2. Gehe zu: `https://www.getkanva.io/auth/callback`
3. Tippe auf den Link
4. ✅ Dialog "In KANVA öffnen" sollte erscheinen

**Verifizierung prüfen:**

```bash
adb shell pm get-app-links app.myclub.kanva
```

Sollte `www.getkanva.io` als **verified** zeigen.

---

## 🔐 Phase 4: Supabase Konfiguration

### Schritt 4.1: Supabase Dashboard öffnen

1. Gehe zu https://supabase.com/dashboard
2. Wähle Ihr Projekt
3. Navigiere zu **Authentication** > **URL Configuration**

### Schritt 4.2: Redirect URLs hinzufügen

Füge unter **Redirect URLs** hinzu:

```
https://www.getkanva.io/**
```

**Für Development auch:**
```
http://localhost:8101/**
http://localhost:5173/**
```

Klicke **Save**.

---

## 🧪 End-to-End Test

### Test-Szenario: Magic Link Login

1. **Öffne die App** auf Ihrem Gerät
2. **Gehe zu Login**
3. **Gib Email ein** und sende Magic Link
4. **Öffne Email** auf dem **gleichen Gerät**
5. **Tippe auf Magic Link**
6. ✅ **App sollte sich öffnen** und Sie sind eingeloggt!

### Was passiert:

```
Email Link: https://www.getkanva.io/auth/callback#access_token=...
     ↓
iOS/Android: System erkennt www.getkanva.io als App Link
     ↓
System öffnet KANVA App (statt Browser)
     ↓
App.tsx: Deep Link Listener empfängt URL
     ↓
AuthContext: Supabase verarbeitet access_token
     ↓
✅ User ist eingeloggt!
```

---

## 🐛 Troubleshooting

### iOS: App öffnet nicht

**Problem 1: Associated Domains falsch**
- Prüfe in Xcode: `applinks:www.getkanva.io` (ohne `https://`)
- Team ID in apple-app-site-association korrekt?

**Problem 2: Server-Datei nicht erreichbar**
```bash
curl https://www.getkanva.io/.well-known/apple-app-site-association
```
- Sollte JSON zurückgeben
- Content-Type muss `application/json` sein

**Problem 3: Apple cached alte Version**
- Warte 24 Stunden
- Settings > Safari > Clear History
- Gerät neu starten

**Problem 4: Link öffnet Safari statt App**
- Erste paar Mal passiert das
- Lange auf Link drücken → "In KANVA öffnen" auswählen
- Danach automatisch

### Android: App öffnet nicht

**Problem 1: Intent Filter falsch**
- `android:autoVerify="true"` muss gesetzt sein
- `android:host="www.getkanva.io"` mit `www.`!

**Problem 2: SHA256 Fingerprint falsch**
```bash
# Prüfe welcher Keystore verwendet wird:
./gradlew signingReport
```

**Problem 3: Asset Links nicht verifiziert**
```bash
adb shell pm get-app-links app.myclub.kanva
```
- Sollte `verified` zeigen für www.getkanva.io
- Falls `none`: assetlinks.json prüfen

---

## 📝 Finale Checklist

- [ ] Server-Dateien hochgeladen und erreichbar
- [ ] Apple Team ID korrekt in apple-app-site-association
- [ ] SHA256 Fingerprint korrekt in assetlinks.json
- [ ] iOS: Associated Domains in Xcode konfiguriert
- [ ] iOS: App auf echtem iPhone installiert und getestet
- [ ] Android: Intent Filter in AndroidManifest.xml
- [ ] Android: App auf echtem Gerät installiert und getestet
- [ ] Supabase: Redirect URLs konfiguriert
- [ ] End-to-End Test: Magic Link öffnet App ✅

---

## 🎉 Geschafft!

Wenn alles funktioniert:
- Magic Links aus Emails öffnen direkt die App
- Keine manuelle Link-Eingabe mehr nötig
- Professionelle User Experience wie WhatsApp, Instagram etc.

Bei Fragen oder Problemen, siehe ausführliche Anleitung in **DEEP_LINKS_SETUP.md**.
