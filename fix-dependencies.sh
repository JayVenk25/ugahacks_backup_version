#!/bin/bash
# Script to fix dependencies using Expo's install command
# This ensures all packages are compatible with SDK 54

echo "Installing dependencies with Expo..."
npx expo install --fix

echo "Done! Now run: npx expo start -c"

