import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';

const REPORT_TYPES = [
  { id: 'suspicious', label: 'Suspicious Activity', icon: 'eye', color: '#F44336' },
  { id: 'hazard', label: 'Hazardous Condition', icon: 'warning', color: '#FF9800' },
  { id: 'maintenance', label: 'Maintenance Issue', icon: 'construct', color: '#2196F3' },
  { id: 'other', label: 'Other', icon: 'help-circle', color: '#666' },
];

export default function ReportScreen() {
  const { addReport } = useData();
  const [selectedType, setSelectedType] = useState(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = () => {
    if (!selectedType) {
      Alert.alert('Error', 'Please select a report type');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please provide a description');
      return;
    }

    addReport({
      type: selectedType,
      description: description.trim(),
      location: location.trim() || 'Not specified',
    });

    Alert.alert(
      'Report Submitted',
      'Thank you for your report. It has been logged and will be reviewed.',
      [
        {
          text: 'OK',
          onPress: () => {
            setSelectedType(null);
            setDescription('');
            setLocation('');
          },
        },
      ]
    );
  };

  const callPolice = (number) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Report an Issue</Text>
        <Text style={styles.headerSubtitle}>
          Help keep Cauley Creek Park safe and well-maintained
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Report Type</Text>
        <View style={styles.reportTypesContainer}>
          {REPORT_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.reportTypeCard,
                selectedType === type.id && styles.reportTypeCardSelected,
              ]}
              onPress={() => setSelectedType(type.id)}
            >
              <Ionicons
                name={type.icon}
                size={32}
                color={selectedType === type.id ? type.color : '#999'}
              />
              <Text
                style={[
                  styles.reportTypeLabel,
                  selectedType === type.id && {
                    color: type.color,
                    fontWeight: '600',
                  },
                ]}
              >
                {type.label}
              </Text>
              {selectedType === type.id && (
                <View style={[styles.checkmark, { backgroundColor: type.color }]}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Describe what you observed..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location (Optional)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., Main Parking Lot, Basketball Court 1..."
          value={location}
          onChangeText={setLocation}
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Ionicons name="send" size={24} color="#fff" />
        <Text style={styles.submitButtonText}>Submit Report</Text>
      </TouchableOpacity>

      <View style={styles.emergencySection}>
        <Text style={styles.emergencyTitle}>Emergency Contacts</Text>
        <Text style={styles.emergencySubtitle}>
          For immediate emergencies, call directly:
        </Text>

        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={() => callPolice('911')}
        >
          <View style={styles.emergencyButtonIcon}>
            <Ionicons name="call" size={28} color="#fff" />
          </View>
          <View style={styles.emergencyButtonContent}>
            <Text style={styles.emergencyButtonTitle}>Local Police</Text>
            <Text style={styles.emergencyButtonNumber}>911</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={() => callPolice('7704761900')}
        >
          <View style={styles.emergencyButtonIcon}>
            <Ionicons name="call" size={28} color="#fff" />
          </View>
          <View style={styles.emergencyButtonContent}>
            <Text style={styles.emergencyButtonTitle}>Cauley Creek Security</Text>
            <Text style={styles.emergencyButtonNumber}>(770) 476-1900</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>
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
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  reportTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  reportTypeCard: {
    width: '47%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  reportTypeCardSelected: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  reportTypeLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  emergencySection: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 32,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 4,
  },
  emergencySubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d32f2f',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  emergencyButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
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
  emergencyButtonNumber: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
    marginTop: 2,
  },
});

