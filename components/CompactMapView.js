import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';
import AreaDetailPanel from './AreaDetailPanel';

const { width, height } = Dimensions.get('window');
// Header height - approximately 100px with larger text
const HEADER_HEIGHT = 100;
const MAP_HEIGHT = height - HEADER_HEIGHT;

// Combined area positions - one overlay per area type
// These should match exactly with the areas on the satellite image
const AREA_POSITIONS = {
  // Pickleball courts - all 5 courts combined area (right side, top)
  pickleball: { x: 0.55, y: 0.23, width: 0.35, height: 0.13 },
  // Basketball courts - both courts combined (left side, top)
  basketball: { x: 0.42, y: 0.15, width: 0.3, height: 0.16 },
  // Futsal courts - both courts combined (left side, below basketball)
  futsal: { x: 0.09, y: 0.25, width: 0.29, height: 0.14 },
  // Volleyball courts - all 3 courts combined (typically near other courts)
  volleyball: { x: 0.05, y: 0.39, width: 0.3, height: 0.13 },
  // Parking lot - all parking combined (right side and bottom)
  parking: { x: 0.27, y: 0.29, width: 0.7, height: 0.305 },
};

export default function CompactMapView() {
  const { courts, courtsData, parkingLots, parkingData, getCourtStatus } = useData();
  const [selectedArea, setSelectedArea] = useState(null);

  // Get overall activity level for an area type using time-weighted algorithm
  const getAreaActivity = (areaType) => {
    if (areaType === 'parking') {
      const totalSpots = parkingLots.reduce((sum, lot) => sum + lot.totalSpots, 0);
      const totalOccupied = parkingLots.reduce((sum, lot) => sum + (parkingData[lot.id]?.occupied || 0), 0);
      const percentage = totalSpots > 0 ? (totalOccupied / totalSpots) * 100 : 0;
      if (percentage >= 80) return 'high';
      if (percentage >= 50) return 'medium';
      return 'low';
    } else {
      // Use time-weighted algorithm to get status
      const status = getCourtStatus(areaType);
      // Convert algorithm status to overlay level
      if (status === 'busy') return 'high';
      if (status === 'medium') return 'medium';
      return 'low';
    }
  };

  // Overlay image mapping - all possible combinations
  const OVERLAY_IMAGES = {
    'pickleball': {
      'high': require('../assets/red pb.png'),
      'medium': require('../assets/yellow pb.png'),
      'low': require('../assets/green pb.png'),
    },
    'basketball': {
      'high': require('../assets/red basketball.png'),
      'medium': require('../assets/yellow basketball.png'),
      'low': require('../assets/green basketball.png'),
    },
    'futsal': {
      'high': require('../assets/red futsal.png'),
      'medium': require('../assets/yellow futsal.png'),
      'low': require('../assets/green futsal.png'),
    },
    'volleyball': {
      'high': require('../assets/red vb.png'),
      'medium': require('../assets/yellow vb.png'),
      'low': require('../assets/green vb.png'),
    },
    'parking': {
      'high': require('../assets/red parking.png'),
      'medium': require('../assets/yellow parking.png'),
      'low': require('../assets/green parking.png'),
    },
  };

  const getOverlayImage = (type, level) => {
    return OVERLAY_IMAGES[type]?.[level] || OVERLAY_IMAGES[type]?.['low'];
  };

  const getAreaIcon = (areaType) => {
    const iconMap = {
      'pickleball': 'tennisball',
      'basketball': 'basketball',
      'futsal': 'football',
      'volleyball': 'football',
      'parking': 'car',
    };
    return iconMap[areaType] || 'location';
  };

  const renderAreaOverlay = (areaType, areaName) => {
    const position = AREA_POSITIONS[areaType];
    if (!position) return null;
    const activity = getAreaActivity(areaType);
    const overlayImage = getOverlayImage(areaType, activity);
    const mapWidth = width;
    const overlayWidth = position.width * mapWidth;
    const overlayHeight = position.height * MAP_HEIGHT;

    return (
      <TouchableOpacity
        key={areaType}
        style={[
          styles.overlayContainer,
          {
            left: position.x * mapWidth,
            top: position.y * MAP_HEIGHT,
            width: overlayWidth,
            height: overlayHeight,
            zIndex: areaType === 'parking' ? 1 : areaType === 'futsal' ? 3 : areaType === 'basketball' ? 2 : areaType === 'volleyball' ? 5 : 4,
          },
        ]}
        onPress={() => setSelectedArea({ type: areaType, name: areaName })}
        activeOpacity={0.8}
        hitSlop={0}
      >
        <Image
          source={overlayImage}
          style={styles.overlayImage}
          resizeMode="stretch"
          pointerEvents="none"
        />
        {/* Icon overlay */}
        <View style={styles.iconOverlay} pointerEvents="none">
          <Ionicons
            name={getAreaIcon(areaType)}
            size={Math.max(24, Math.min(overlayWidth, overlayHeight) * 0.25)}
            color="#fff"
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <Image
          source={require('../assets/satellite-map.png')}
          style={styles.satelliteImage}
          resizeMode="contain"
        />
        
        {/* Area overlays - render in reverse order so smaller overlays are on top */}
        {renderAreaOverlay('parking', 'Parking Lot')}
        {renderAreaOverlay('futsal', 'Futsal Courts')}
        {renderAreaOverlay('basketball', 'Basketball Courts')}
        {renderAreaOverlay('volleyball', 'Volleyball Courts')}
        {renderAreaOverlay('pickleball', 'Pickleball Courts')}
      </View>

      {/* Area Detail Panel */}
      <AreaDetailPanel
        visible={selectedArea !== null}
        onClose={() => setSelectedArea(null)}
        areaType={selectedArea?.type}
        areaName={selectedArea?.name}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
  },
  mapContainer: {
    flex: 1,
    width: width,
    position: 'relative',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  satelliteImage: {
    width: width,
    height: MAP_HEIGHT,
    backgroundColor: '#f5f5f5',
  },
  overlayContainer: {
    position: 'absolute',
    overflow: 'hidden',
  },
  overlayImage: {
    width: '100%',
    height: '100%',
  },
  iconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  reportButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

