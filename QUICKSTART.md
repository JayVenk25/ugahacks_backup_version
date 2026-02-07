# Quick Start Guide

## First Time Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the Expo development server:**
   ```bash
   npx expo start
   ```

3. **Run on your device:**
   - **iOS**: Open the Camera app and scan the QR code
   - **Android**: Open the Expo Go app and scan the QR code
   - Or press `i` for iOS simulator, `a` for Android emulator

## Features Overview

### 🏠 Home Screen
- Overview of parking and court availability
- Quick access to all features
- Emergency contact buttons

### 🚗 Parking Screen
- Real-time parking availability for all lots
- Automatic tracking when you're in the park
- Visual indicators (green/yellow/red) for availability

### 🏀 Courts Screen
- List of all courts and fields
- Availability status
- Condition indicators
- Tap any court for detailed view

### 📝 Report Screen
- Report suspicious activity
- Report hazardous conditions
- Report maintenance issues
- Direct emergency contact buttons

## Location Permissions

The app will request location permissions when you first open it. This is required for:
- Tracking parking availability
- Determining if you're in the park
- Helping the community with real-time updates

**Note**: Location data is only used locally and for parking tracking. Your exact location is never shared.

## Troubleshooting

### App won't start
- Make sure you've run `npm install` first
- Check that Node.js version is 14 or higher
- Try clearing cache: `npx expo start -c`

### Location not working
- Check that location permissions are granted
- Make sure location services are enabled on your device
- Try restarting the app

### Data not persisting
- Data is stored locally on your device
- If you uninstall the app, data will be lost
- This is by design for privacy

## Testing the App

1. **Parking Tracking**: 
   - Grant location permission
   - The app will automatically track when you're in the park
   - Check the Parking screen to see availability

2. **Court Conditions**:
   - Go to Courts screen
   - Tap any court to view details
   - Add comments or update conditions

3. **Reporting**:
   - Go to Report screen
   - Select a report type
   - Fill in details and submit

## Emergency Contacts

- **911**: Local Police (tap to call)
- **(770) 476-1900**: Cauley Creek Security (tap to call)

