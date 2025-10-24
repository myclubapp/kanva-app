#!/bin/sh

# Xcode Cloud Build Script
# Wird nach dem Klonen des Repositories ausgeführt

set -e
set -x  # Debug mode - zeigt alle Befehle

echo "=== Starting ci_post_clone.sh ==="
echo "CI_PRIMARY_REPOSITORY_PATH: $CI_PRIMARY_REPOSITORY_PATH"
echo "CI_WORKSPACE: $CI_WORKSPACE"

# Gehe zum Root des Projekts
cd $CI_PRIMARY_REPOSITORY_PATH

echo "Working directory: $(pwd)"
echo "Directory contents:"
ls -la

# 0. Erstelle .env Datei aus Xcode Cloud Environment-Variablen
echo "🔧 Erstelle .env Datei..."
cat > .env << EOF
VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
VITE_APP_NAME=${VITE_APP_NAME:-Kanva}
VITE_APP_VERSION=${VITE_APP_VERSION:-1.0.0}
EOF

echo "Environment-Variablen gesetzt:"
echo "- VITE_SUPABASE_URL: ${VITE_SUPABASE_URL:0:20}..."
echo "- VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY:0:20}..."

# 1. Installiere Node-Abhängigkeiten
echo "📦 Installiere npm Abhängigkeiten..."
npm ci
echo "✓ npm ci abgeschlossen"
echo "node_modules Inhalt:"
ls -la node_modules/@capacitor/ | head -20

# 2. Baue die Web-App (Capacitor benötigt den dist Ordner)
echo "🔨 Baue Web-App..."
npm run build
echo "✓ npm run build abgeschlossen"
echo "dist Inhalt:"
ls -la dist/ | head -10

# 3. Synchronisiere Capacitor mit iOS
echo "🔄 Synchronisiere Capacitor mit iOS..."
npx cap sync ios --deployment
echo "✓ cap sync abgeschlossen"

# 4. Installiere CocoaPods
echo "📱 Installiere CocoaPods Abhängigkeiten..."
cd ios/App
echo "Working directory für pod install: $(pwd)"
echo "Podfile vorhanden:"
ls -la Podfile*

if ! command -v pod &> /dev/null
then
    echo "CocoaPods nicht gefunden, installiere..."
    sudo gem install cocoapods
fi

echo "CocoaPods Version:"
pod --version

echo "Starte pod install..."
pod install --verbose
echo "✓ pod install abgeschlossen"

echo "Pods Verzeichnis:"
ls -la Pods/Target\ Support\ Files/Pods-App/ | head -10

echo "✅ ci_post_clone.sh erfolgreich abgeschlossen"
