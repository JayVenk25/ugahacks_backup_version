import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Animated,
  Dimensions,
  TextInput,
  Alert,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';

const { height } = Dimensions.get('window');

export default function AreaDetailPanel({ visible, onClose, areaType, areaName }) {
  const { courts, courtsData, parkingLots, parkingData, reports, getCourtStatus, addActivityReport, addReport } = useData();
  const [slideAnim] = useState(new Animated.Value(height));
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [customAlertText, setCustomAlertText] = useState('');

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Get all courts of this type
  const areaCourts = courts.filter(c => c.type === areaType);
  const isParking = areaType === 'parking';

  // Calculate overall availability
  const getOverallAvailability = () => {
    if (isParking) {
      const totalSpots = parkingLots.reduce((sum, lot) => sum + lot.totalSpots, 0);
      const totalOccupied = parkingLots.reduce((sum, lot) => sum + (parkingData[lot.id]?.occupied || 0), 0);
      const available = totalSpots - totalOccupied;
      const percentage = (totalOccupied / totalSpots) * 100;
      return { available, total: totalSpots, occupied: totalOccupied, percentage };
    } else {
      const available = areaCourts.filter(c => courtsData[c.id]?.available !== false).length;
      const total = areaCourts.length;
      return { available, total, occupied: total - available };
    }
  };

  const getOverallActivity = () => {
    if (isParking) {
      const stats = getOverallAvailability();
      if (stats.percentage >= 80) return 'high';
      if (stats.percentage >= 50) return 'medium';
      return 'low';
    } else {
      // Use time-weighted algorithm to get status
      const status = getCourtStatus(areaType);
      // Convert algorithm status to display format
      if (status === 'busy') return 'high';
      if (status === 'medium') return 'medium';
      return 'low';
    }
  };

  const handleSetActivity = (level) => {
    if (!areaType) return;
    const status = level === 'High' ? 'busy' : level === 'Medium' ? 'medium' : 'light';
    addActivityReport(areaType, status);
    Alert.alert('Success', `Activity report submitted: ${level} for ${areaName}`);
  };

  const handleCreateAlert = () => {
    if (!customAlertText.trim()) {
      Alert.alert('Error', 'Please enter an alert description');
      return;
    }
    if (!areaType) {
      Alert.alert('Error', 'Area type not specified');
      return;
    }
    addReport({
      type: 'alert',
      alertType: 'custom',
      alertName: customAlertText.trim(),
      areaType: areaType,
      description: customAlertText.trim(),
    });
    Alert.alert('Report Submitted', `Thank you for reporting: ${customAlertText.trim()}`, [
      {
        text: 'OK',
        onPress: () => {
          setShowAlertModal(false);
          setCustomAlertText('');
        },
      },
    ]);
  };

  // Get alerts for this area, grouped by alert name
  const getAreaAlerts = () => {
    if (!areaType) return [];
    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 1 day in milliseconds
    
    // Get area-level alerts and court-specific alerts for courts in this area
    const areaCourtsIds = areaCourts.map(c => c.id);
    const allAlerts = reports.filter(r => {
      if (r.type !== 'alert') return false;
      // Filter out alerts older than 1 day
      if (now - r.timestamp > ONE_DAY_MS) return false;
      // Area-level alert for this area type
      if (r.areaType === areaType && !r.courtId) return true;
      // Court-specific alert for a court in this area
      if (r.courtId && areaCourtsIds.includes(r.courtId)) return true;
      return false;
    });

    // Group alerts by alertName and count them
    const grouped = {};
    allAlerts.forEach(alert => {
      const key = alert.alertName || alert.description || 'Unknown Alert';
      if (!grouped[key]) {
        grouped[key] = {
          alertName: key,
          count: 0,
          latestTimestamp: alert.timestamp,
          courtId: alert.courtId,
        };
      }
      grouped[key].count++;
      // Keep the most recent timestamp
      if (alert.timestamp > grouped[key].latestTimestamp) {
        grouped[key].latestTimestamp = alert.timestamp;
      }
    });

    // Convert to array and sort by latest timestamp
    return Object.values(grouped).sort((a, b) => b.latestTimestamp - a.latestTimestamp);
  };

  const getApplicableAlerts = () => {
    const ALERT_TYPES = [
      { id: 'cold-sand', name: 'Cold sand', icon: 'snow', color: '#81D4FA', applicableSports: ['volleyball'] },
      { id: 'slippery', name: 'Slippery courts', icon: 'warning', color: '#FFC107', applicableSports: ['pickleball', 'basketball', 'futsal'] },
      { id: 'no-lights', name: 'No lights', icon: 'bulb-outline', color: '#9E9E9E', applicableSports: ['volleyball', 'pickleball', 'basketball', 'futsal'] },
    ];
    if (!areaType) return [];
    return ALERT_TYPES.filter(alert => alert.applicableSports.includes(areaType));
  };

  const stats = getOverallAvailability();
  const activity = getOverallActivity();
  const areaAlerts = getAreaAlerts();

  return (
    <Modal visible={visible} transparent={true} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.panel,
            { transform: [{ translateY: slideAnim }] },
          ]}
          onStartShouldSetResponder={() => false}
        >
          <TouchableOpacity style={styles.handle} onPress={onClose}>
            <View style={styles.handleBar} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>{areaName}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              scrollEventThrottle={16}
              keyboardShouldPersistTaps="handled"
            >
            {isParking ? (
              <>
                <View style={styles.statsCard}>
                  <Ionicons name="car" size={40} color="#2E7D32" />
                  <Text style={styles.statNumber}>{stats.available}</Text>
                  <Text style={styles.statLabel}>Parking Spots Available</Text>
                  <Text style={styles.statSubtext}>
                    {stats.occupied} of {stats.total} occupied
                  </Text>
                </View>

                {parkingLots.map((lot) => {
                  const data = parkingData[lot.id] || { occupied: 0 };
                  const available = lot.totalSpots - data.occupied;
                  const percentage = (data.occupied / lot.totalSpots) * 100;
                  const availabilityColor = percentage < 50 ? '#4CAF50' : percentage < 80 ? '#FF9800' : '#F44336';
                  const availabilityText = available === 0 ? 'Full' : available <= 5 ? 'Almost Full' : 'Available';

                  return (
                    <View key={lot.id} style={styles.lotCard}>
                      <View style={styles.lotHeader}>
                        <View style={styles.lotInfo}>
                          <Ionicons name="location" size={24} color="#2E7D32" />
                          <View style={styles.lotNameContainer}>
                            <Text style={styles.lotName}>{lot.name}</Text>
                            <Text style={styles.lotSpots}>{lot.totalSpots} total spots</Text>
                          </View>
                        </View>
                        <View style={[styles.availabilityBadge, { backgroundColor: availabilityColor }]}>
                          <Text style={styles.availabilityText}>{availabilityText}</Text>
                        </View>
                      </View>

                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              { width: `${percentage}%`, backgroundColor: availabilityColor },
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
              </>
            ) : (
              <>
                <View style={styles.statsCard}>
                  <Ionicons name="basketball" size={40} color="#2E7D32" />
                  <Text style={styles.statNumber}>
                    {getCourtStatus(areaType) === 'busy' ? 'High' : getCourtStatus(areaType) === 'medium' ? 'Medium' : 'Low'}
                  </Text>
                  <Text style={styles.statLabel}>Business Level</Text>
                  <Text style={styles.statSubtext}>
                    Based on recent activity reports
                  </Text>
                </View>

                {areaAlerts.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Active Alerts</Text>
                    {areaAlerts.map((alert, index) => {
                      const court = alert.courtId ? areaCourts.find(c => c.id === alert.courtId) : null;
                      return (
                        <View key={index} style={styles.alertCard}>
                          <Ionicons name="warning" size={24} color="#FF9800" />
                          <View style={styles.alertContent}>
                            <View style={styles.alertTitleRow}>
                              <Text style={styles.alertTitle}>{alert.alertName}</Text>
                              {alert.count > 1 && (
                                <View style={styles.alertCountBadge}>
                                  <Text style={styles.alertCountText}>{alert.count}</Text>
                                </View>
                              )}
                            </View>
                            {court && (
                              <Text style={styles.alertCourtName}>{court.name}</Text>
                            )}
                            <Text style={styles.alertTime}>
                              Last reported {new Date(alert.latestTimestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Report Activity Level</Text>
                  <View style={styles.activityButtonsRow}>
                    <TouchableOpacity
                      style={[styles.activityLevelButton, styles.activityLowButton]}
                      onPress={() => handleSetActivity('Low')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.activityLevelButtonText}>Low</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.activityLevelButton, styles.activityMediumButton]}
                      onPress={() => handleSetActivity('Medium')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.activityLevelButtonText}>Medium</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.activityLevelButton, styles.activityHighButton]}
                      onPress={() => handleSetActivity('High')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.activityLevelButtonText}>High</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.activityCurrentText}>
                    Current: {getCourtStatus(areaType) === 'busy' ? 'High' : getCourtStatus(areaType) === 'medium' ? 'Medium' : 'Low'}
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Create Alert</Text>
                  <TouchableOpacity
                    style={styles.alertCreateButton}
                    onPress={() => setShowAlertModal(true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add-circle-outline" size={24} color="#2196F3" />
                    <Text style={styles.alertCreateText}>Report an Issue</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
            </ScrollView>
          </TouchableWithoutFeedback>


          {/* Alert Creation Modal */}
          {showAlertModal && (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback onPress={() => {}}>
                  <View style={[styles.modalContent, { maxWidth: 400 }]}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Create Alert</Text>
                  <TouchableOpacity onPress={() => {
                    setShowAlertModal(false);
                    setCustomAlertText('');
                  }}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalSubtitle}>{areaName}</Text>
                
                <Text style={styles.alertSectionTitle}>Recommended Alerts</Text>
                {getApplicableAlerts().map((alert) => (
                  <TouchableOpacity
                    key={alert.id}
                    style={styles.recommendedAlertButton}
                    onPress={() => {
                      addReport({
                        type: 'alert',
                        alertType: alert.id,
                        alertName: alert.name,
                        areaType: areaType,
                        description: alert.name,
                      });
                      Alert.alert('Report Submitted', `Thank you for reporting: ${alert.name}`, [
                        {
                          text: 'OK',
                          onPress: () => {
                            setShowAlertModal(false);
                          },
                        },
                      ]);
                    }}
                  >
                    <Ionicons name={alert.icon} size={20} color={alert.color} />
                    <Text style={styles.recommendedAlertText}>{alert.name}</Text>
                  </TouchableOpacity>
                ))}

                <Text style={[styles.alertSectionTitle, { marginTop: 16 }]}>Custom Alert</Text>
                <TextInput
                  style={styles.alertInput}
                  placeholder="Enter custom alert description..."
                  value={customAlertText}
                  onChangeText={setCustomAlertText}
                  multiline
                  numberOfLines={3}
                  blurOnSubmit={true}
                />
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelBtn]}
                    onPress={() => {
                      setShowAlertModal(false);
                      setCustomAlertText('');
                    }}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalSubmitBtn]}
                    onPress={handleCreateAlert}
                  >
                    <Text style={styles.modalSubmitText}>Submit</Text>
                  </TouchableOpacity>
                </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.75,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  handle: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statsCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
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
  },
  statSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  courtItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  courtItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courtName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    flex: 1,
  },
  courtStatus: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  conditionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  conditionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  commentButton: {
    backgroundColor: '#2E7D32',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  commentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  commentItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2E7D32',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  commentCourtName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    flex: 1,
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  lotCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  alertContent: {
    flex: 1,
    marginLeft: 12,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  alertCountBadge: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  alertCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  alertTime: {
    fontSize: 12,
    color: '#666',
  },
  alertCourtName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginTop: 4,
    marginBottom: 2,
  },
  activityButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  activityLevelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityLowButton: {
    backgroundColor: '#4CAF50',
  },
  activityMediumButton: {
    backgroundColor: '#FF9800',
  },
  activityHighButton: {
    backgroundColor: '#F44336',
  },
  activityLevelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  activityCurrentText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  alertCreateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
  },
  alertCreateText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#2196F3',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '80%',
    maxWidth: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  activityOption: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  activityOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  modalCancelButton: {
    marginTop: 12,
    padding: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#666',
    fontSize: 16,
  },
  alertSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
    marginTop: 8,
  },
  recommendedAlertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  recommendedAlertText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  alertInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelBtn: {
    backgroundColor: '#f5f5f5',
  },
  modalSubmitBtn: {
    backgroundColor: '#2196F3',
  },
  modalSubmitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

