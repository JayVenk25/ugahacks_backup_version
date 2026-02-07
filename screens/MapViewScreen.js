import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import { useLocation } from '../context/LocationContext';
import ReportPanel from '../components/ReportPanel';
import ParkEntryNotification from '../components/ParkEntryNotification';

const { width, height } = Dimensions.get('window');

// Court and parking lot positions - adjusted to match actual satellite image
const COURT_POSITIONS = {
  // Pickleball courts (right side, top - 2 clusters)
  pb1: { x: 0.55, y: 0.15, width: 0.12, height: 0.16 },
  pb2: { x: 0.67, y: 0.15, width: 0.12, height: 0.16 },
  pb3: { x: 0.55, y: 0.31, width: 0.12, height: 0.16 },
  pb4: { x: 0.67, y: 0.31, width: 0.12, height: 0.16 },
  pb5: { x: 0.79, y: 0.23, width: 0.12, height: 0.16 },
  // Basketball courts (left side, top - 2 courts side by side)
  bb1: { x: 0.10, y: 0.12, width: 0.20, height: 0.24 },
  bb2: { x: 0.30, y: 0.12, width: 0.20, height: 0.24 },
  // Futsal courts (left side, below basketball)
  fc1: { x: 0.10, y: 0.36, width: 0.20, height: 0.24 },
  fc2: { x: 0.30, y: 0.36, width: 0.20, height: 0.24 },
  // Volleyball courts (bottom left area - 3 courts)
  vb1: { x: 0.12, y: 0.58, width: 0.16, height: 0.20 },
  vb2: { x: 0.28, y: 0.58, width: 0.16, height: 0.20 },
  vb3: { x: 0.44, y: 0.58, width: 0.16, height: 0.20 },
};

const PARKING_POSITIONS = {
  lot1: { x: 0.48, y: 0.62, width: 0.40, height: 0.30 }, // Main parking lot (L-shaped, right side)
  lot2: { x: 0.12, y: 0.78, width: 0.24, height: 0.16 }, // Smaller lot (below volleyball)
  lot3: { x: 0.72, y: 0.68, width: 0.22, height: 0.16 }, // Additional lot area
};

export default function MapViewScreen() {
  const { courts, courtsData, parkingLots, parkingData } = useData();
  const { isInParkArea } = useLocation();
  const [showReportPanel, setShowReportPanel] = useState(false);
  const [showEntryNotification, setShowEntryNotification] = useState(false);
  const [hasShownNotification, setHasShownNotification] = useState(false);

  // Show notification when user enters park
  useEffect(() => {
    if (isInParkArea && !hasShownNotification) {
      setShowEntryNotification(true);
      setHasShownNotification(true);
    } else if (!isInParkArea) {
      setHasShownNotification(false);
    }
  }, [isInParkArea, hasShownNotification]);

  const getActivityLevel = (courtId) => {
    const data = courtsData[courtId];
    if (!data) return 'low';
    // Use availability and condition to determine activity
    if (!data.available) return 'high';
    if (data.condition === 'poor' || data.condition === 'fair') return 'medium';
    return 'low';
  };

  const getParkingActivity = (lotId) => {
    const lot = parkingLots.find(l => l.id === lotId);
    const data = parkingData[lotId];
    if (!lot || !data) return 'low';
    const percentage = (data.occupied / lot.totalSpots) * 100;
    if (percentage >= 80) return 'high';
    if (percentage >= 50) return 'medium';
    return 'low';
  };

  const getActivityColor = (level) => {
    switch (level) {
      case 'high': return 'rgba(244, 67, 54, 0.4)'; // Red
      case 'medium': return 'rgba(255, 152, 0, 0.4)'; // Yellow/Orange
      case 'low': return 'rgba(76, 175, 80, 0.4)'; // Green
      default: return 'rgba(76, 175, 80, 0.4)';
    }
  };

  const renderCourtOverlay = (court) => {
    const position = COURT_POSITIONS[court.id];
    if (!position) return null;
    const activity = getActivityLevel(court.id);
    const color = getActivityColor(activity);
    const imageHeight = height * 1.2;

    return (
      <View
        key={court.id}
        style={[
          styles.overlay,
          {
            left: position.x * width,
            top: position.y * imageHeight,
            width: position.width * width,
            height: position.height * imageHeight,
            backgroundColor: color,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: color.replace('0.4', '1'),
          },
        ]}
      />
    );
  };

  const renderParkingOverlay = (lot) => {
    const position = PARKING_POSITIONS[lot.id];
    if (!position) return null;
    const activity = getParkingActivity(lot.id);
    const color = getActivityColor(activity);
    const imageHeight = height * 1.2;

    return (
      <View
        key={lot.id}
        style={[
          styles.overlay,
          {
            left: position.x * width,
            top: position.y * imageHeight,
            width: position.width * width,
            height: position.height * imageHeight,
            backgroundColor: color,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: color.replace('0.4', '1'),
          },
        ]}
      />
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        maximumZoomScale={2}
        minimumZoomScale={1}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.mapContainer}>
          {/* Satellite image */}
          <Image
            source={require('../assets/satellite-map.png')}
            style={styles.satelliteImage}
            resizeMode="contain"
          />
          
          {/* Court overlays */}
          {courts.map(court => renderCourtOverlay(court))}
          
          {/* Parking overlays */}
          {parkingLots.map(lot => renderParkingOverlay(lot))}
        </View>
      </ScrollView>

      {/* Report Button */}
      <TouchableOpacity
        style={styles.reportButton}
        onPress={() => setShowReportPanel(true)}
      >
        <View style={styles.reportButtonInner}>
          <Ionicons name="chatbubble-ellipses" size={28} color="#2E7D32" />
        </View>
      </TouchableOpacity>

      {/* Report Panel */}
      <ReportPanel
        visible={showReportPanel}
        onClose={() => setShowReportPanel(false)}
      />

      {/* Park Entry Notification */}
      <ParkEntryNotification
        visible={showEntryNotification}
        onClose={() => setShowEntryNotification(false)}
        onReport={() => setShowReportPanel(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mapContainer: {
    width: width,
    minHeight: height,
    position: 'relative',
  },
  satelliteImage: {
    width: width,
    height: height * 1.2, // Allow for taller image
  },
  overlay: {
    position: 'absolute',
  },
  reportButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

