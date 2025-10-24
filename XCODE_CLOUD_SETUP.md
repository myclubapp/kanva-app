# Xcode Cloud Setup für Kanva Mobile

## 📋 Übersicht

Diese Anleitung erklärt, wie Sie Xcode Cloud für Ihr Kanva Mobile Projekt konfigurieren.

## 🔧 Erforderliche Environment-Variablen

In Xcode Cloud müssen Sie folgende Environment-Variablen setzen:

### Pflicht-Variablen:

1. **VITE_SUPABASE_URL**
   - Wert: Ihre Supabase-Projekt-URL
   - Beispiel: `https://xxxxx.supabase.co`

2. **VITE_SUPABASE_ANON_KEY**
   - Wert: Ihr Supabase Anon/Public Key
   - Beispiel: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Optional:

3. **VITE_APP_NAME**
   - Wert: `Kanva` (Standard)

4. **VITE_APP_VERSION**
   - Wert: `1.0.0` (Standard)

## 📱 Xcode Cloud Konfiguration

### 1. Environment-Variablen setzen

1. Öffnen Sie **App Store Connect**
2. Gehen Sie zu **Apps** → **Kanva** → **Xcode Cloud**
3. Wählen Sie Ihren **Workflow**
4. Klicken Sie auf **Environment** → **Environment Variables**
5. Fügen Sie die oben genannten Variablen hinzu:
   - Klicken Sie auf **"+"**
   - Name: `VITE_SUPABASE_URL`
   - Wert: Ihre Supabase-URL
   - Wiederholen Sie für alle anderen Variablen

### 2. Build-Script

Das Build-Script `ios/ci_scripts/ci_post_clone.sh` wird automatisch ausgeführt und:

1. ✅ Erstellt eine `.env` Datei aus den Environment-Variablen
2. ✅ Installiert npm-Abhängigkeiten (`npm ci`)
3. ✅ Baut die Web-App (`npm run build`)
4. ✅ Synchronisiert Capacitor mit iOS (`npx cap sync ios`)
5. ✅ Installiert CocoaPods (`pod install`)

### 3. Workflow-Einstellungen

Empfohlene Workflow-Einstellungen:

- **Start Conditions**:
  - Bei Push auf `main` Branch
  - Oder manuell starten

- **Archive Configuration**:
  - Xcode Version: Latest Release
  - Scheme: `App`
  - Platform: iOS

- **Post-Actions**:
  - TestFlight (optional)
  - App Store Connect (optional)

## 🚀 Erster Build

Nach dem Setup:

1. Committen Sie alle Änderungen:
   ```bash
   git add .
   git commit -m "Add Xcode Cloud configuration"
   git push
   ```

2. Gehen Sie zu App Store Connect → Xcode Cloud
3. Starten Sie einen Build manuell oder warten Sie auf den automatischen Build

## ⚠️ Troubleshooting

### Fehler: "Missing Supabase environment variables"

**Lösung**: Überprüfen Sie, ob die Environment-Variablen in Xcode Cloud korrekt gesetzt sind.

### Fehler: "Unable to open base configuration reference file"

**Lösung**: Das ci_post_clone.sh Script sollte diesen Fehler beheben. Stellen Sie sicher, dass:
- `Podfile` und `Podfile.lock` im Git committed sind
- Das Script ausführbar ist (`chmod +x ios/ci_scripts/ci_post_clone.sh`)

### Build dauert zu lange

**Lösung**: Stellen Sie sicher, dass `node_modules` und `Pods` im `.gitignore` sind (sollte bereits konfiguriert sein).

## 📚 Weitere Informationen

- [Xcode Cloud Dokumentation](https://developer.apple.com/xcode-cloud/)
- [Capacitor iOS Dokumentation](https://capacitorjs.com/docs/ios)

---

**Team ID**: U7DQUX87VS
**Bundle ID**: app.myclub.kanva
**Display Name**: KANVA
