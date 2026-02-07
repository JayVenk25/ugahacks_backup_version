import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';

const CONDITION_OPTIONS = ['excellent', 'good', 'fair', 'poor'];
const CONDITION_COLORS = {
  excellent: '#4CAF50',
  good: '#8BC34A',
  fair: '#FF9800',
  poor: '#F44336',
};

export default function CourtDetailScreen({ route, navigation }) {
  const { courtId } = route.params;
  const { courts, courtsData, updateCourtData, addCourtComment } = useData();
  const [commentText, setCommentText] = useState('');
  const [showConditionModal, setShowConditionModal] = useState(false);

  const court = courts.find((c) => c.id === courtId);
  const data = courtsData[courtId] || {
    available: true,
    condition: 'good',
    comments: [],
  };

  const handleToggleAvailability = () => {
    updateCourtData(courtId, { available: !data.available });
  };

  const handleUpdateCondition = (condition) => {
    updateCourtData(courtId, { condition });
    setShowConditionModal(false);
    Alert.alert('Success', 'Condition updated successfully!');
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      // Pass false for isAreaComment since this is a specific court comment
      addCourtComment(courtId, commentText.trim(), false);
      setCommentText('');
      Alert.alert('Success', 'Comment added successfully!');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.courtName}>{court?.name}</Text>
        <Text style={styles.courtType}>
          {court?.type.charAt(0).toUpperCase() + court?.type.slice(1)} Court
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Availability</Text>
        <TouchableOpacity
          style={[
            styles.availabilityButton,
            {
              backgroundColor: data.available ? '#4CAF50' : '#F44336',
            },
          ]}
          onPress={handleToggleAvailability}
        >
          <Ionicons
            name={data.available ? 'checkmark-circle' : 'close-circle'}
            size={24}
            color="#fff"
          />
          <Text style={styles.availabilityButtonText}>
            {data.available ? 'Available' : 'Occupied'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Condition</Text>
        <TouchableOpacity
          style={styles.conditionButton}
          onPress={() => setShowConditionModal(true)}
        >
          <View
            style={[
              styles.conditionBadge,
              { backgroundColor: CONDITION_COLORS[data.condition] || '#666' },
            ]}
          >
            <Text style={styles.conditionText}>
              {data.condition
                ? data.condition.charAt(0).toUpperCase() + data.condition.slice(1)
                : 'Unknown'}
            </Text>
          </View>
          <Text style={styles.conditionButtonHint}>
            Tap to update condition
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Comments</Text>
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment about the condition..."
            value={commentText}
            onChangeText={setCommentText}
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity
            style={styles.commentButton}
            onPress={handleAddComment}
          >
            <Ionicons name="send" size={20} color="#fff" />
            <Text style={styles.commentButtonText}>Post</Text>
          </TouchableOpacity>
        </View>

        {data.comments && data.comments.length > 0 ? (
          <View style={styles.commentsList}>
            {data.comments
              .slice()
              .reverse()
              .map((comment, index) => (
                <View key={index} style={styles.commentItem}>
                  <View style={styles.commentHeader}>
                    <Ionicons name="person-circle" size={24} color="#666" />
                    <Text style={styles.commentTime}>
                      {formatTime(comment.timestamp)}
                    </Text>
                  </View>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              ))}
          </View>
        ) : (
          <View style={styles.noComments}>
            <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
            <Text style={styles.noCommentsText}>No comments yet</Text>
            <Text style={styles.noCommentsSubtext}>
              Be the first to share information about this court!
            </Text>
          </View>
        )}
      </View>

      <Modal
        visible={showConditionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowConditionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Condition</Text>
            {CONDITION_OPTIONS.map((condition) => (
              <TouchableOpacity
                key={condition}
                style={[
                  styles.conditionOption,
                  {
                    backgroundColor:
                      CONDITION_COLORS[condition] || '#666',
                  },
                ]}
                onPress={() => handleUpdateCondition(condition)}
              >
                <Text style={styles.conditionOptionText}>
                  {condition.charAt(0).toUpperCase() + condition.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowConditionModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  courtName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  courtType: {
    fontSize: 16,
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
  availabilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  availabilityButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  conditionButton: {
    alignItems: 'center',
  },
  conditionBadge: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 8,
  },
  conditionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  conditionButtonHint: {
    fontSize: 14,
    color: '#666',
  },
  commentInputContainer: {
    marginBottom: 16,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  commentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  commentsList: {
    gap: 12,
  },
  commentItem: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2E7D32',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
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
  noComments: {
    alignItems: 'center',
    padding: 32,
  },
  noCommentsText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  noCommentsSubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  conditionOption: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  conditionOptionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalCancelButton: {
    marginTop: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#666',
    fontSize: 16,
  },
});

