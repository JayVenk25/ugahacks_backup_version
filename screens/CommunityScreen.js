import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../context/DataContext';

export default function CommunityScreen() {
  const { moves, addMove, updateMoveInterest, addMoveComment } = useData();
  const [showNewMoveModal, setShowNewMoveModal] = useState(false);
  const [newMoveTitle, setNewMoveTitle] = useState('');
  const [newMoveDescription, setNewMoveDescription] = useState('');
  const [expandedMove, setExpandedMove] = useState(null);
  const [commentTexts, setCommentTexts] = useState({});

  const handleCreateMove = () => {
    if (!newMoveTitle.trim() || !newMoveDescription.trim()) {
      return;
    }
    addMove({
      title: newMoveTitle.trim(),
      description: newMoveDescription.trim(),
    });
    setNewMoveTitle('');
    setNewMoveDescription('');
    setShowNewMoveModal(false);
  };

  const handleInterested = (moveId) => {
    updateMoveInterest(moveId, 'interested');
  };

  const handleNotInterested = (moveId) => {
    updateMoveInterest(moveId, 'notInterested');
  };

  const handleAddComment = (moveId) => {
    const comment = commentTexts[moveId];
    if (!comment || !comment.trim()) return;
    addMoveComment(moveId, comment.trim());
    setCommentTexts({ ...commentTexts, [moveId]: '' });
  };

  const getInterestCount = (move) => {
    return (move.interested || []).length;
  };

  // Filter moves to only show those from the last 24 hours
  const getActiveMoves = () => {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    return moves.filter(move => move.timestamp > oneDayAgo);
  };

  const activeMoves = getActiveMoves();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Moves</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {activeMoves.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No moves yet</Text>
            <Text style={styles.emptyStateSubtext}>Create the first move to get started!</Text>
          </View>
        ) : (
          activeMoves.map((move) => (
            <View key={move.id} style={styles.moveCard}>
              <View style={styles.moveHeader}>
                <View style={styles.interestBadge}>
                  <Ionicons name="thumbs-up" size={16} color="#fff" />
                  <Text style={styles.interestCount}>{getInterestCount(move)}</Text>
                </View>
              </View>

              <Text style={styles.moveTitle}>{move.title}</Text>
              <Text style={styles.moveDescription}>{move.description}</Text>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.notInterestedButton}
                  onPress={() => handleNotInterested(move.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="thumbs-down" size={20} color="#333" />
                  <Text style={styles.notInterestedText}>No thanks</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.interestedButton}
                  onPress={() => handleInterested(move.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="thumbs-up" size={20} color="#fff" />
                  <Text style={styles.interestedText}>Interested</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.commentToggle}
                onPress={() => setExpandedMove(expandedMove === move.id ? null : move.id)}
              >
                <Text style={styles.commentToggleText}>
                  {expandedMove === move.id ? 'Hide comments' : 'Leave a comment'}
                </Text>
              </TouchableOpacity>

              {expandedMove === move.id && (
                <View style={styles.commentsSection}>
                  {move.comments && move.comments.length > 0 && (
                    <View style={styles.commentsList}>
                      {move.comments.map((comment, index) => (
                        <View key={index} style={styles.commentItem}>
                          <Text style={styles.commentAuthor}>{comment.author || 'Anonymous'}</Text>
                          <Text style={styles.commentText}>{comment.text}</Text>
                          <Text style={styles.commentTime}>
                            {new Date(comment.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                  <View style={styles.commentInputContainer}>
                    <TextInput
                      style={styles.commentInput}
                      placeholder="Leave a comment..."
                      value={commentTexts[move.id] || ''}
                      onChangeText={(text) => setCommentTexts({ ...commentTexts, [move.id]: text })}
                      multiline
                      placeholderTextColor="#999"
                    />
                    <TouchableOpacity
                      style={styles.commentSubmitButton}
                      onPress={() => handleAddComment(move.id)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="send" size={20} color="#2E7D32" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowNewMoveModal(true)}
        activeOpacity={0.8}
      >
        <View style={styles.fabIcon}>
          <Ionicons name="add" size={24} color="#fff" />
        </View>
      </TouchableOpacity>

      {/* New Move Modal */}
      <Modal
        visible={showNewMoveModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNewMoveModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => {
                    setShowNewMoveModal(false);
                    setNewMoveTitle('');
                    setNewMoveDescription('');
                  }}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>New Move</Text>
                <TouchableOpacity
                  style={styles.modalSubmitButton}
                  onPress={handleCreateMove}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-up" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Title</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="Give it a title"
                  value={newMoveTitle}
                  onChangeText={setNewMoveTitle}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.dividerLine} />

              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.inputField, styles.descriptionInput]}
                  placeholder="What's going on"
                  value={newMoveDescription}
                  onChangeText={setNewMoveDescription}
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  moveCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  moveHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  interestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  interestCount: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  moveTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  moveDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  notInterestedButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  notInterestedText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  interestedButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  interestedText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  commentToggle: {
    paddingVertical: 8,
  },
  commentToggleText: {
    fontSize: 14,
    color: '#999',
  },
  commentsSection: {
    marginTop: 12,
  },
  commentsList: {
    marginBottom: 12,
  },
  commentItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    maxHeight: 100,
  },
  commentSubmitButton: {
    padding: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 40,
    minHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  modalSubmitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  inputField: {
    fontSize: 16,
    color: '#000',
    paddingVertical: 8,
  },
  descriptionInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
    marginHorizontal: 20,
  },
});

