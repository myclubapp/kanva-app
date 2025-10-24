#!/bin/sh

# Xcode Cloud Build Script
# Wird nach dem Klonen des Repositories ausgeführt

set -e

echo "Starting ci_post_clone.sh"

# Installiere CocoaPods falls nicht vorhanden
if ! command -v pod &> /dev/null
then
    echo "CocoaPods nicht gefunden, installiere..."
    sudo gem install cocoapods
fi

# Wechsle ins iOS App Verzeichnis
cd ios/App

# Installiere Pods
echo "Installiere CocoaPods Abhängigkeiten..."
pod install

echo "ci_post_clone.sh erfolgreich abgeschlossen"
