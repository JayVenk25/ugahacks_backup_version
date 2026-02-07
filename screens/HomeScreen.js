import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocation } from '../context/LocationContext';
import CompactMapView from '../components/CompactMapView';

export default function HomeScreen({ navigation }) {
  const { isInParkArea = false } = useLocation();

  const callPolice = (number) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cauley Creek</Text>
        {isInParkArea && (
          <View style={styles.statusBadge}>
            <Ionicons name="location" size={16} color="#fff" />
            <Text style={styles.statusText}>You're in the park</Text>
          </View>
        )}
      </View>

      <CompactMapView />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#2E7D32',
    padding: 8,
    paddingTop: 45,
    paddingBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    minHeight: 80,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#fff',
    fontFamily: 'System',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 6,
  },
  statusText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  statSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionButtonText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d32f2f',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  emergencyButtonContent: {
    flex: 1,
    marginLeft: 12,
  },
  emergencyButtonTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emergencyButtonSubtitle: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
    marginTop: 2,
  },
});

