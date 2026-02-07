import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';

const { height } = Dimensions.get('window');

const COURT_ACTIVITY = [
  { id: 'volleyball', name: 'Volleyball', icon: 'football', level: 'Medium', color: '#FFC107' },
  { id: 'futsal', name: 'Futsal', icon: 'football', level: 'Low', color: '#4CAF50' },
  { id: 'basketball', name: 'Basketball', icon: 'basketball', level: 'Medium', color: '#FFC107' },
  { id: 'pickleball', name: 'Pickleball', icon: 'tennisball', level: 'High', color: '#F44336' },
];

const ALERT_TYPES = [
  { id: 'cold-sand', name: 'Cold sand', icon: 'snow', color: '#81D4FA', applicableSports: ['volleyball'] },
  { id: 'slippery', name: 'Slippery courts', icon: 'warning', color: '#FFC107', applicableSports: ['pickleball', 'basketball', 'futsal'] },
  { id: 'no-lights', name: 'No lights', icon: 'bulb-outline', color: '#9E9E9E', applicableSports: ['volleyball', 'pickleball', 'basketball', 'futsal'] },
];

export default function ReportPanel({ visible, onClose }) {
  const { addReport, courts, courtsData, updateCourtData, addActivityReport, getCourtStatus } = useData();
  const [slideAnim] = useState(new Animated.Value(height));
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showCustomAlertModal, setShowCustomAlertModal] = useState(false);
  const [showCourtSelection, setShowCourtSelection] = useState(false);
  const [customAlertText, setCustomAlertText] = useState('');
  const [selectedCourts, setSelectedCourts] = useState([]);

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

  const handleReport = (alert) => {
    // Get applicable sports for this alert
    const applicableSports = COURT_ACTIVITY.filter(sport => 
      alert.applicableSports.includes(sport.id)
    );
    
    if (applicableSports.length === 0) return;
    
    Alert.alert(
      'Select Area',
      'Which area is this alert for?',
      [
        { text: 'Cancel', style: 'cancel' },
        ...applicableSports.map(sport => ({
          text: sport.name,
          onPress: () => {
            addReport({
              type: 'alert',
              alertType: alert.id,
              alertName: alert.name,
              areaType: sport.id,
              description: alert.name,
            });
            Alert.alert('Report Submitted', `Thank you for reporting: ${alert.name} for ${sport.name}`, [
              {
                text: 'OK',
                onPress: () => onClose(),
              },
            ]);
          },
        })),
      ]
    );
  };

  const handleCustomAlert = () => {
    setShowCustomAlertModal(true);
  };

  const handleSelectCourts = () => {
    setShowCourtSelection(true);
  };

  const toggleCourtSelection = (courtId) => {
    if (selectedCourts.includes(courtId)) {
      setSelectedCourts(selectedCourts.filter(id => id !== courtId));
    } else {
      setSelectedCourts([...selectedCourts, courtId]);
    }
  };

  const selectAllCourts = () => {
    setSelectedCourts(courts.map(c => c.id));
  };

  const clearSelection = () => {
    setSelectedCourts([]);
  };

  const handleSubmitCustomAlert = () => {
    if (!customAlertText.trim()) {
      Alert.alert('Error', 'Please enter an alert description');
      return;
    }

    if (selectedCourts.length === 0) {
      Alert.alert('Error', 'Please select at least one court');
      return;
    }

    // Create alert for each selected court
    selectedCourts.forEach(courtId => {
      const court = courts.find(c => c.id === courtId);
      if (court) {
        addReport({
          type: 'alert',
          alertType: 'custom',
          alertName: customAlertText.trim(),
          areaType: court.type,
          courtId: courtId,
          description: customAlertText.trim(),
        });
      }
    });

    Alert.alert('Report Submitted', `Thank you for reporting: ${customAlertText.trim()}`, [
      {
        text: 'OK',
        onPress: () => {
          setShowCustomAlertModal(false);
          setCustomAlertText('');
          setSelectedCourts([]);
          onClose();
        },
      },
    ]);
  };

  const handleActivityPress = (sport) => {
    setSelectedActivity(sport);
    setShowActivityModal(true);
  };

  const handleSetActivity = (level) => {
    if (!selectedActivity) return;
    // Convert level to status for algorithm
    const status = level === 'High' ? 'busy' : level === 'Medium' ? 'medium' : 'light';
    // Add activity report using time-weighted algorithm
    addActivityReport(selectedActivity.id, status);
    setShowActivityModal(false);
    setSelectedActivity(null);
    Alert.alert('Success', `Activity report submitted: ${level} for ${selectedActivity.name}`);
  };

  const getCurrentActivityLevel = (sportId) => {
    // Use time-weighted algorithm to get current status
    const status = getCourtStatus(sportId);
    // Convert to display format
    if (status === 'busy') return 'High';
    if (status === 'medium') return 'Medium';
    return 'Low';
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.panel,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
          onStartShouldSetResponder={() => false}
        >
          <TouchableOpacity
            style={styles.handle}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <View style={styles.handleBar} />
          </TouchableOpacity>

          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            scrollEventThrottle={16}
          >
            <Text style={styles.sectionTitle}>Court activity</Text>
            {COURT_ACTIVITY.map((court) => {
              const currentLevel = getCurrentActivityLevel(court.id);
              return (
                <TouchableOpacity
                  key={court.id}
                  style={styles.activityItem}
                  activeOpacity={0.7}
                  onPress={() => handleActivityPress(court)}
                >
                  <View
                    style={[
                      styles.activityIcon,
                      { backgroundColor: `${court.color}20` },
                    ]}
                  >
                    <Ionicons name={court.icon} size={24} color={court.color} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityName}>{court.name}</Text>
                    <Text style={[styles.activityLevel, { color: '#2196F3' }]}>
                      {currentLevel}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
              );
            })}

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recommended Alerts</Text>
            {ALERT_TYPES.map((alert) => (
              <View
                key={alert.id}
                style={styles.alertItem}
              >
                <View
                  style={[
                    styles.alertIcon,
                    { backgroundColor: `${alert.color}20` },
                  ]}
                >
                  <Ionicons name={alert.icon} size={24} color={alert.color} />
                </View>
                <Text style={styles.alertName}>{alert.name}</Text>
                <TouchableOpacity
                  style={styles.reportButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleReport(alert);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.reportButtonText}>+ Report</Text>
                </TouchableOpacity>
              </View>
            ))}

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Custom Alert</Text>
            <TouchableOpacity
              style={styles.customAlertButton}
              onPress={handleCustomAlert}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={24} color="#2196F3" />
              <Text style={styles.customAlertText}>Create Custom Alert</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Activity Level Modal */}
          {showActivityModal && selectedActivity && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Set Activity Level</Text>
                <Text style={styles.modalSubtitle}>{selectedActivity.name}</Text>
                {['Low', 'Medium', 'High'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={styles.activityOption}
                    onPress={() => handleSetActivity(level)}
                  >
                    <Text style={styles.activityOptionText}>{level}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => {
                    setShowActivityModal(false);
                    setSelectedActivity(null);
                  }}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Custom Alert Modal */}
          {showCustomAlertModal && !showCourtSelection && (
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { maxWidth: 400, maxHeight: '80%' }]}>
                <Text style={styles.modalTitle}>Create Custom Alert</Text>
                <TextInput
                  style={styles.alertInput}
                  placeholder="Enter alert description..."
                  value={customAlertText}
                  onChangeText={setCustomAlertText}
                  multiline
                  numberOfLines={3}
                />
                <TouchableOpacity
                  style={styles.selectCourtsButton}
                  onPress={handleSelectCourts}
                  activeOpacity={0.7}
                >
                  <Ionicons name="list" size={20} color="#2196F3" />
                  <Text style={styles.selectCourtsText}>
                    {selectedCourts.length === 0
                      ? 'Select Courts'
                      : `${selectedCourts.length} court${selectedCourts.length > 1 ? 's' : ''} selected`}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#2196F3" style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelBtn]}
                    onPress={() => {
                      setShowCustomAlertModal(false);
                      setCustomAlertText('');
                      setSelectedCourts([]);
                    }}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalSubmitBtn]}
                    onPress={handleSubmitCustomAlert}
                  >
                    <Text style={styles.modalSubmitText}>Submit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Court Selection Modal */}
          {showCourtSelection && (
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { maxWidth: 400, maxHeight: '80%' }]}>
                <View style={styles.courtSelectionHeader}>
                  <Text style={styles.modalTitle}>Select Courts</Text>
                  <TouchableOpacity onPress={() => setShowCourtSelection(false)}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                <View style={styles.courtSelectionActions}>
                  <TouchableOpacity onPress={selectAllCourts} style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Select All</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={clearSelection} style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Clear</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.courtList} nestedScrollEnabled={true}>
                  {courts.map((court) => (
                    <TouchableOpacity
                      key={court.id}
                      style={[
                        styles.courtOption,
                        selectedCourts.includes(court.id) && styles.courtOptionSelected,
                      ]}
                      onPress={() => toggleCourtSelection(court.id)}
                    >
                      <Ionicons
                        name={selectedCourts.includes(court.id) ? 'checkbox' : 'checkbox-outline'}
                        size={24}
                        color={selectedCourts.includes(court.id) ? '#2196F3' : '#ccc'}
                      />
                      <Text style={styles.courtOptionText}>{court.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalSubmitBtn]}
                  onPress={() => setShowCourtSelection(false)}
                >
                  <Text style={styles.modalSubmitText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  overlayTouchable: {
    ...StyleSheet.absoluteFillObject,
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
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  activityLevel: {
    fontSize: 14,
    fontWeight: '500',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  alertIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  reportButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2196F3',
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
    textAlign: 'center',
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
  customAlertButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
  },
  customAlertText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#2196F3',
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
  selectCourtsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
  },
  selectCourtsText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
    flex: 1,
  },
  courtSelectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  courtSelectionActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  courtList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  courtOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
  },
  courtOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  courtOptionText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#000',
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

