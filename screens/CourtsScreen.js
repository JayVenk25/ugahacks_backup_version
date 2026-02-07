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

const COURT_ICONS = {
  pickleball: 'tennisball',
  volleyball: 'football',
  basketball: 'basketball',
  tennis: 'tennisball',
  soccer: 'football',
  futsal: 'football',
};

const CONDITION_COLORS = {
  excellent: '#4CAF50',
  good: '#8BC34A',
  fair: '#FF9800',
  poor: '#F44336',
};

export default function CourtsScreen({ navigation }) {
  const { courts, courtsData } = useData();
  
  const availableCourts = courts.filter(
    court => courtsData[court.id]?.available !== false
  ).length;

  const getCourtIcon = (type) => {
    return COURT_ICONS[type] || 'basketball';
  };

  const getConditionColor = (condition) => {
    return CONDITION_COLORS[condition] || '#666';
  };

  const getConditionText = (condition) => {
    return condition ? condition.charAt(0).toUpperCase() + condition.slice(1) : 'Unknown';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Courts & Fields</Text>
        <Text style={styles.headerSubtitle}>
          Check availability and conditions
        </Text>
      </View>

      <View style={styles.statsCard}>
        <Ionicons name="basketball" size={40} color="#2E7D32" />
        <Text style={styles.statNumber}>{availableCourts}</Text>
        <Text style={styles.statLabel}>Courts Available</Text>
        <Text style={styles.statSubtext}>
          {courts.length} total courts/fields
        </Text>
      </View>

      {courts.map((court) => {
        const data = courtsData[court.id] || {
          available: true,
          condition: 'good',
          comments: [],
        };
        const isAvailable = data.available !== false;

        return (
          <TouchableOpacity
            key={court.id}
            style={styles.courtCard}
            onPress={() =>
              navigation.navigate('CourtDetail', { courtId: court.id })
            }
          >
            <View style={styles.courtHeader}>
              <View style={styles.courtInfo}>
                <Ionicons
                  name={getCourtIcon(court.type)}
                  size={28}
                  color="#2E7D32"
                />
                <View style={styles.courtNameContainer}>
                  <Text style={styles.courtName}>{court.name}</Text>
                  <Text style={styles.courtType}>
                    {court.type.charAt(0).toUpperCase() + court.type.slice(1)}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: isAvailable ? '#4CAF50' : '#F44336',
                  },
                ]}
              >
                <Text style={styles.statusText}>
                  {isAvailable ? 'Available' : 'Occupied'}
                </Text>
              </View>
            </View>

            <View style={styles.conditionRow}>
              <View style={styles.conditionItem}>
                <Ionicons name="checkmark-circle" size={20} color="#666" />
                <Text style={styles.conditionLabel}>Condition:</Text>
                <View
                  style={[
                    styles.conditionBadge,
                    { backgroundColor: getConditionColor(data.condition) },
                  ]}
                >
                  <Text style={styles.conditionText}>
                    {getConditionText(data.condition)}
                  </Text>
                </View>
              </View>
            </View>

            {data.comments && data.comments.length > 0 && (
              <View style={styles.commentsPreview}>
                <Ionicons name="chatbubble" size={16} color="#666" />
                <Text style={styles.commentsText}>
                  {data.comments.length} comment{data.comments.length !== 1 ? 's' : ''}
                </Text>
              </View>
            )}

            <View style={styles.arrowContainer}>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
          </TouchableOpacity>
        );
      })}
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
  courtCard: {
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
  courtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  courtInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  courtNameContainer: {
    marginLeft: 12,
  },
  courtName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  courtType: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  conditionRow: {
    marginTop: 8,
  },
  conditionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  conditionLabel: {
    fontSize: 14,
    color: '#666',
  },
  conditionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  conditionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  commentsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  commentsText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  arrowContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -10,
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

