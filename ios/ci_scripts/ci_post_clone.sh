#!/bin/sh

# Xcode Cloud Build Script
# Wird nach dem Klonen des Repositories ausgeführt

set -e

echo "=== Starting ci_post_clone.sh ==="

# Gehe zum Root des Projekts
cd $CI_PRIMARY_REPOSITORY_PATH

echo "Working directory: $(pwd)"

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

# 2. Baue die Web-App (Capacitor benötigt den dist Ordner)
echo "🔨 Baue Web-App..."
npm run build

# 3. Synchronisiere Capacitor mit iOS
echo "🔄 Synchronisiere Capacitor mit iOS..."
npx cap sync ios --deployment

# 4. Installiere CocoaPods
echo "📱 Installiere CocoaPods Abhängigkeiten..."
cd ios/App

if ! command -v pod &> /dev/null
then
    echo "CocoaPods nicht gefunden, installiere..."
    sudo gem install cocoapods
fi

pod install

echo "✅ ci_post_clone.sh erfolgreich abgeschlossen"
