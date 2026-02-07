# Cauley Creek Tracker

An all-in-one tracking app for Cauley Creek Park in Duluth, Georgia. Track parking availability, court/field conditions, and report issues in real-time.

## Features

- **Parking Tracking**: Real-time parking availability based on user locations
- **Court & Field Status**: Check availability and conditions for pickleball, volleyball, basketball courts
- **User Reports**: Report suspicious activity, hazards, and maintenance issues
- **Emergency Contacts**: Quick access to local police and park security
- **Community Updates**: User-generated comments on court conditions

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your iOS or Android device

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the Expo development server:
```bash
npx expo start
```

3. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

## Usage

### Parking Tracking
The app automatically tracks parking availability when users are in the park. Your location helps determine which parking lot spots are occupied.

### Court & Field Status
- View real-time availability of all courts and fields
- Check conditions (excellent, good, fair, poor)
- Add comments about court conditions
- Update availability status

### Reporting Issues
Report various issues including:
- Suspicious activity
- Hazardous conditions
- Maintenance issues
- Other concerns

## Location Permissions

The app requires location permissions to:
- Track parking availability
- Determine if you're in the park
- Help the community with real-time updates

## Emergency Contacts

- **Local Police**: 911
- **Cauley Creek Security**: (770) 476-1900

## Technology Stack

- React Native
- Expo
- Expo Location
- AsyncStorage
- React Navigation

## Notes

- Parking data is stored locally on your device
- Court conditions and comments are shared across all users
- Location tracking only works when the app has permission and is running

