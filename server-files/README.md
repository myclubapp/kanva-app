# Server-Dateien für Deep Links

Diese Dateien müssen auf Ihren Web-Server `www.getkanva.io` hochgeladen werden.

## 📁 Dateistruktur auf dem Server

```
www.getkanva.io/
├── .well-known/
│   ├── apple-app-site-association    (KEINE Dateiendung!)
│   └── assetlinks.json
└── auth/
    └── callback/
        └── index.html
```

---

## 🔧 Vor dem Upload anpassen:

### 1. `.well-known/apple-app-site-association`

**Zeile 6** - Ersetzen Sie `YOUR_TEAM_ID`:

```json
"appID": "YOUR_TEAM_ID.app.myclub.kanva",
```

**Ihre Apple Team ID finden:**
1. Gehe zu https://developer.apple.com/account
2. Klicke auf **Membership**
3. Kopiere die **Team ID** (z.B. `A1B2C3D4E5`)

**Beispiel:**
```json
"appID": "A1B2C3D4E5.app.myclub.kanva",
```

---

### 2. `.well-known/assetlinks.json`

**Zeile 7** - Ersetzen Sie `YOUR_SHA256_FINGERPRINT_HERE`:

**SHA256 Fingerprint finden:**

```bash
# Für Development/Testing (Debug Keystore):
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Für Production (Release Keystore):
keytool -list -v -keystore /path/to/your/release.keystore -alias your-key-alias

# Suche nach dieser Zeile:
# SHA256: AB:CD:EF:12:34:56:78:90:...
```

Kopiere den **kompletten SHA256 Wert** (mit Doppelpunkten).

**Beispiel:**
```json
"sha256_cert_fingerprints": [
  "14:6D:E9:83:C5:73:06:50:D8:EE:B9:95:2F:34:FC:64:16:A0:83:42:E6:1D:BE:A8:8A:04:96:B2:3F:CF:44:E5"
]
```

**Hinweis:** Sie können **mehrere** Fingerprints hinzufügen (z.B. Debug + Production):

```json
"sha256_cert_fingerprints": [
  "DEBUG_FINGERPRINT_HERE",
  "PRODUCTION_FINGERPRINT_HERE"
]
```

---

### 3. `auth/callback/index.html`

**Optional:** Passe die App Store Links an (Zeile 89-92)

Ersetze `idXXXXXXXXXX` mit Ihrer echten Apple App Store ID, wenn verfügbar.

---

## 📤 Upload Anweisungen

### Via FTP/SFTP:

1. Verbinde dich mit `www.getkanva.io`
2. Navigiere zum **Web-Root** (meist `public_html/` oder `www/`)
3. Lade die Ordner **genau so** wie oben gezeigt hoch

### Via cPanel/Webhosting-Panel:

1. Öffne **File Manager**
2. Navigiere zum **Web-Root**
3. Erstelle Ordner `.well-known` und `auth/callback`
4. Lade Dateien hoch

### Via Command Line (SSH):

```bash
# Verbinden
ssh user@www.getkanva.io

# Navigiere zum Web-Root
cd /var/www/html  # oder /public_html

# Erstelle Verzeichnisse
mkdir -p .well-known
mkdir -p auth/callback

# Dateien hochladen (via scp von lokalem Computer)
# Von Ihrem lokalen Terminal:
scp -r server-files/.well-known user@www.getkanva.io:/var/www/html/
scp -r server-files/auth user@www.getkanva.io:/var/www/html/
```

---

## ✅ Verifizierung

Nach dem Upload, teste ob die Dateien erreichbar sind:

### 1. Apple-App-Site-Association:

```bash
curl -I https://www.getkanva.io/.well-known/apple-app-site-association
```

**Erwartete Antwort:**
```
HTTP/2 200
Content-Type: application/json
```

**Im Browser öffnen:**
https://www.getkanva.io/.well-known/apple-app-site-association

Sollte JSON anzeigen (nicht "File not found").

### 2. Android Asset Links:

```bash
curl -I https://www.getkanva.io/.well-known/assetlinks.json
```

**Im Browser öffnen:**
https://www.getkanva.io/.well-known/assetlinks.json

### 3. Auth Callback Seite:

**Im Browser öffnen:**
https://www.getkanva.io/auth/callback

Sollte eine schöne Redirect-Seite anzeigen.

---

## ⚙️ Server-Konfiguration (wichtig!)

### Apache (.htaccess)

Erstelle/erweitere `.well-known/.htaccess`:

```apache
<Files "apple-app-site-association">
    Header set Content-Type "application/json"
</Files>

<Files "assetlinks.json">
    Header set Content-Type "application/json"
</Files>
```

### Nginx

In Ihrer nginx config:

```nginx
location /.well-known/apple-app-site-association {
    default_type application/json;
}

location /.well-known/assetlinks.json {
    default_type application/json;
}
```

---

## 🐛 Troubleshooting

### "File not found" Fehler:

- Prüfe ob `.well-known` Ordner sichtbar ist (versteckte Dateien anzeigen!)
- Manche FTP-Clients verstecken Dateien die mit `.` beginnen

### "Wrong Content-Type":

- Stelle sicher dass Server `application/json` zurückgibt
- Füge `.htaccess` oder nginx config hinzu (siehe oben)

### Apple/Android erkennt Dateien nicht:

- **WICHTIG:** `apple-app-site-association` hat **KEINE Dateiendung** (nicht `.json`!)
- Dateien müssen über **HTTPS** erreichbar sein (nicht HTTP)
- Cache leeren und nach 24h nochmal testen (Apple cached aggressiv)

---

## 📝 Checklist

Nach Upload:

- [ ] `.well-known/apple-app-site-association` über Browser erreichbar
- [ ] `.well-known/assetlinks.json` über Browser erreichbar
- [ ] `auth/callback/index.html` zeigt Redirect-Seite
- [ ] Apple Team ID in apple-app-site-association korrekt
- [ ] SHA256 Fingerprint in assetlinks.json korrekt
- [ ] Content-Type ist `application/json` für .well-known Dateien
- [ ] HTTPS funktioniert (nicht HTTP)

---

**Danach:** Fahre fort mit der iOS/Android Konfiguration (siehe KANVA_DEEP_LINKS_FINAL_SETUP.md)
