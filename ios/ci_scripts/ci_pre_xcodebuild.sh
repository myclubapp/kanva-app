#!/bin/sh

# Xcode Cloud Pre-Build Script
# Wird direkt VOR dem Xcode Build ausgeführt

set -e
set -x  # Debug mode

echo "=== Starting ci_pre_xcodebuild.sh ==="
echo "CI_WORKSPACE: $CI_WORKSPACE"
echo "CI_PRIMARY_REPOSITORY_PATH: $CI_PRIMARY_REPOSITORY_PATH"

cd $CI_PRIMARY_REPOSITORY_PATH

# Überprüfe ob Pods Verzeichnis existiert
if [ ! -d "ios/App/Pods" ]; then
    echo "⚠️ Pods Verzeichnis nicht gefunden! Führe pod install aus..."
    cd ios/App

    if ! command -v pod &> /dev/null; then
        echo "CocoaPods nicht gefunden, installiere..."
        sudo gem install cocoapods
    fi

    pod install --verbose

    echo "✓ pod install in pre-build abgeschlossen"
else
    echo "✓ Pods Verzeichnis existiert bereits"
    echo "Pods Inhalt:"
    ls -la ios/App/Pods/Target\ Support\ Files/Pods-App/ || echo "Pods-App Verzeichnis nicht gefunden"
fi

# Überprüfe kritische Dateien
echo "Überprüfe kritische xcconfig Dateien:"
if [ -f "ios/App/Pods/Target Support Files/Pods-App/Pods-App.debug.xcconfig" ]; then
    echo "✓ Pods-App.debug.xcconfig gefunden"
else
    echo "❌ Pods-App.debug.xcconfig FEHLT!"
fi

if [ -f "ios/App/Pods/Target Support Files/Pods-App/Pods-App.release.xcconfig" ]; then
    echo "✓ Pods-App.release.xcconfig gefunden"
else
    echo "❌ Pods-App.release.xcconfig FEHLT!"
    echo "Versuche pod install erneut..."
    cd ios/App
    pod install --verbose --repo-update
fi

echo "✅ ci_pre_xcodebuild.sh erfolgreich abgeschlossen"
