import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const { height } = Dimensions.get('window');

interface Review {
  id: string;
  reviewerName: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

interface WriteReviewModalProps {
  visible: boolean;
  onClose: () => void;
  listingTitle: string;
}



interface Review {
  id: string;
  reviewerName: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

interface WriteReviewModalProps {
  visible: boolean;
  onClose: () => void;
  listingTitle: string;
}

export default function WriteReviewModal({
  visible,
  onClose,
  listingTitle,
}: WriteReviewModalProps) {
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Format number with K and M notation
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return count.toString();
  };

  const handleSendReview = () => {
    if (newReview.trim() && rating > 0) {
      // TODO: Implement review submission
      console.log('Submitting review:', { rating, comment: newReview });
      setNewReview('');
      setRating(0);
      onClose();
    }
  };

  const renderStars = (rating: number, size: number = 16) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color={star <= rating ? '#FFD700' : Colors.grey}
          />
        ))}
      </View>
    );
  };

  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={styles.reviewItem}>
      <Image source={{ uri: item.avatar }} style={styles.reviewerAvatar} />
      <View style={styles.reviewContent}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewerName}>{item.reviewerName}</Text>
          <Text style={styles.reviewDate}>{item.date}</Text>
        </View>
        <View style={styles.ratingContainer}>{renderStars(item.rating, 14)}</View>
        <Text style={styles.reviewComment} numberOfLines={2}>
          {item.comment}
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
          <TouchableWithoutFeedback>
            <View style={styles.reviewModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Reviews ({formatCount(reviews.length)})</Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Ionicons name="close" size={24} color={Colors.black} />
                </TouchableOpacity>
              </View>

              <View style={styles.reviewsSection}>
                {reviews.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="chatbubble-outline" size={64} color={Colors.grey} />
                    <Text style={styles.emptyTitle}>No reviews yet</Text>
                    <Text style={styles.emptySubtitle}>Be the first one to leave one...</Text>
                  </View>
                ) : (
                  <FlatList
                    data={reviews}
                    renderItem={renderReviewItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={true}
                    style={styles.reviewsList}
                  />
                )}
              </View>

              <View style={styles.writeReviewSection}>
                <View style={styles.ratingInputContainer}>
                  <Text style={styles.ratingLabel}>Rating:</Text>
                  <View style={styles.starsInputContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => setRating(star)}
                        style={styles.starButton}
                      >
                        <Ionicons
                          name={star <= rating ? 'star' : 'star-outline'}
                          size={24}
                          color={star <= rating ? '#FFD700' : Colors.grey}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.commentInputContainer}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Write your review here..."
                    placeholderTextColor={Colors.grey}
                    value={newReview}
                    onChangeText={setNewReview}
                    multiline
                    maxLength={500}
                  />
                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      { opacity: newReview.trim() && rating > 0 ? 1 : 0.5 },
                    ]}
                    onPress={handleSendReview}
                    disabled={!newReview.trim() || rating === 0}
                  >
                    <Ionicons name="send" size={20} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  reviewModal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    height: height * 0.75,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 0.4,
    borderBottomColor: Colors.lightgrey,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
  },
  closeButton: {
    padding: 4,
    position: 'absolute',
    right: 20,
  },
  reviewsSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    minHeight: 0,
  },
  reviewsList: {
    flex: 1,
    minHeight: 0,
  },
  reviewItem: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewContent: {
    flex: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.grey,
  },
  ratingContainer: {
    marginBottom: 8
  },
  starsContainer: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 14,
    color: Colors.black,
    lineHeight: 20,
  },
  writeReviewSection: {
    paddingHorizontal: 20,
    paddingTop: 4,
    borderTopColor: Colors.lightgrey,
  },
  ratingInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingLabel: {
    fontSize: 14,
    color: Colors.black,
    marginRight: 12,
  },
  starsInputContainer: {
    flexDirection: 'row',
  },
  starButton: {
    padding: 4,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.lightgrey,
    gap: 8,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.black,
    maxHeight: 80,
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.grey,
    textAlign: 'center',
  },
});
