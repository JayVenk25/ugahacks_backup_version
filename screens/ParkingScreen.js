import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';

export default function ParkingScreen() {
  const { parkingLots, parkingData } = useData();
  
  const totalParkingSpots = parkingLots.reduce((sum, lot) => sum + lot.totalSpots, 0);
  const totalOccupied = parkingLots.reduce(
    (sum, lot) => sum + (parkingData[lot.id]?.occupied || 0),
    0
  );
  const availableParking = totalParkingSpots - totalOccupied;

  const getAvailabilityColor = (occupied, total) => {
    const percentage = (occupied / total) * 100;
    if (percentage < 50) return '#4CAF50';
    if (percentage < 80) return '#FF9800';
    return '#F44336';
  };

  const getAvailabilityText = (occupied, total) => {
    const available = total - occupied;
    if (available === 0) return 'Full';
    if (available <= 5) return 'Almost Full';
    return 'Available';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Parking Lots</Text>
        <Text style={styles.headerSubtitle}>
          Real-time parking availability
        </Text>
      </View>

      <View style={styles.statsCard}>
        <Ionicons name="car" size={40} color="#2E7D32" />
        <Text style={styles.statNumber}>{availableParking}</Text>
        <Text style={styles.statLabel}>Parking Spots Available</Text>
        <Text style={styles.statSubtext}>
          {totalOccupied} of {totalParkingSpots} occupied
        </Text>
      </View>

      {parkingLots.map((lot) => {
        const data = parkingData[lot.id] || { occupied: 0 };
        const available = lot.totalSpots - data.occupied;
        const percentage = (data.occupied / lot.totalSpots) * 100;

        return (
          <View key={lot.id} style={styles.lotCard}>
            <View style={styles.lotHeader}>
              <View style={styles.lotInfo}>
                <Ionicons name="location" size={24} color="#2E7D32" />
                <View style={styles.lotNameContainer}>
                  <Text style={styles.lotName}>{lot.name}</Text>
                  <Text style={styles.lotSpots}>
                    {lot.totalSpots} total spots
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.availabilityBadge,
                  { backgroundColor: getAvailabilityColor(data.occupied, lot.totalSpots) },
                ]}
              >
                <Text style={styles.availabilityText}>
                  {getAvailabilityText(data.occupied, lot.totalSpots)}
                </Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${percentage}%`,
                      backgroundColor: getAvailabilityColor(data.occupied, lot.totalSpots),
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {available} spots available • {data.occupied} occupied
              </Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="car" size={20} color="#666" />
                <Text style={styles.statValue}>{available}</Text>
                <Text style={styles.statLabel}>Available</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="time" size={20} color="#666" />
                <Text style={styles.statValue}>
                  {data.lastUpdated
                    ? new Date(data.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'N/A'}
                </Text>
                <Text style={styles.statLabel}>Last Updated</Text>
              </View>
            </View>
          </View>
        );
      })}

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={24} color="#2196F3" />
        <Text style={styles.infoText}>
          Parking availability is automatically updated based on user locations
          within the park. If you're in the park, your location helps track
          parking spots.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  lotCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  lotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lotNameContainer: {
    marginLeft: 12,
  },
  lotName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  lotSpots: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  availabilityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  availabilityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  statsCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 12,
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  statSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
});

