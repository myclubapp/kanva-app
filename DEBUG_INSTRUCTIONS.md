# Magic Link Login - Debug Anleitung

## Problem
Die Session wird nach dem Magic Link Login nicht erkannt ("No user found").

## Mögliche Ursachen

### 1. Supabase Redirect URL nicht konfiguriert
Die Redirect URL muss im Supabase Dashboard als erlaubt eingetragen sein.

**So beheben:**
1. Gehe zu https://supabase.com/dashboard
2. Wähle dein Projekt aus
3. Gehe zu **Authentication > URL Configuration**
4. Füge folgende URLs zu **Redirect URLs** hinzu:
   - `http://localhost:5173/**` (für Development)
   - `https://deine-domain.com/**` (für Production)
5. Speichern

### 2. Browser-Context-Problem
Der Magic Link öffnet sich möglicherweise in einem anderen Browser/Tab als die App läuft.

**Workaround für Development:**
1. Starte die App: `npm run dev`
2. Öffne die App im Browser: `http://localhost:5173`
3. Gehe zu Login-Seite
4. Gib deine Email ein und sende Magic Link
5. **WICHTIG:** Öffne die Email **IM SELBEN BROWSER** wie die App läuft
6. Klicke auf den Magic Link
7. Du solltest zurück zur App weitergeleitet werden

## Debug-Schritte

### Test 1: URL-Parameter prüfen
Nach dem Klick auf den Magic Link sollte die URL so aussehen:
```
http://localhost:5173/tabs/profile#access_token=XXXXX&refresh_token=XXXXX&expires_in=3600&token_type=bearer&type=magiclink
```

**In der Console solltest du sehen:**
```
[AppRoutes] Component state: {
  user: false,
  loading: true,
  url: "http://localhost:5173/tabs/profile#access_token=...",
  hash: "#access_token=..."
}
[AuthContext] Auth state changed: SIGNED_IN User found
[AuthContext] Loading profile for user: xxx-xxx-xxx
```

### Test 2: Session Storage prüfen
1. Öffne Browser DevTools (F12)
2. Gehe zu **Application** Tab (Chrome) oder **Storage** Tab (Firefox)
3. Schau unter **Local Storage > http://localhost:5173**
4. Suche nach Keys die mit `sb-` anfangen (z.B. `sb-xxx-auth-token`)
5. Diese sollten Werte enthalten nach dem Login

### Test 3: Network-Anfragen prüfen
1. Öffne Browser DevTools (F12)
2. Gehe zu **Network** Tab
3. Filter nach "supabase"
4. Klicke auf den Magic Link
5. Du solltest API-Calls zu Supabase sehen (z.B. `/auth/v1/verify`)

## Alternative: Password-Login für Testing

Wenn Magic Links nicht funktionieren, können wir temporär einen Password-Login einbauen:

1. Gehe zu Supabase Dashboard > Authentication > Users
2. Erstelle einen Test-User mit Email + Password
3. In der App: Wir müssen eine Password-Login-Option hinzufügen

## Produktions-Hinweis

Für die **mobile App** (mit Capacitor) funktionieren Magic Links anders:
- Du brauchst **Deep Links** oder **Universal Links**
- Die Redirect URL muss zu deiner App-Scheme passen (z.B. `kanva://callback`)
- Das erfordert zusätzliche Konfiguration in:
  - iOS: Associated Domains
  - Android: App Links / Intent Filters

Aber für **Web Development** sollte der normale Magic Link Flow funktionieren, wenn die Redirect URLs korrekt konfiguriert sind.

## Nächste Schritte

1. **Prüfe die Redirect URLs** in Supabase Dashboard
2. **Teste den Login-Flow** nochmal mit den Debug-Logs
3. **Schicke mir die Console-Logs** wenn es immer noch nicht funktioniert

Achte besonders auf:
- Die URL nach dem Magic Link Click (enthält sie `#access_token=...`?)
- Die Console-Logs von `[AuthContext]` und `[AppRoutes]`
- Gibt es Error-Messages in der Console?
