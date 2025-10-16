import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
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

// Mock reviews data
const mockReviews: Review[] = [
  {
    id: '1',
    reviewerName: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    comment: 'Excellent product! Exactly as described. The seller was very responsive and the item arrived in perfect condition. Highly recommend this seller!',
    date: '2 days ago'
  },
  {
    id: '2',
    reviewerName: 'Mike Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    rating: 4,
    comment: 'Good quality item, fast shipping. Would buy again.',
    date: '1 week ago'
  },
  {
    id: '3',
    reviewerName: 'Emily Davis',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    comment: 'Amazing seller! The product exceeded my expectations. Great communication throughout the process.',
    date: '2 weeks ago'
  },
  {
    id: '4',
    reviewerName: 'Alex Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    rating: 3,
    comment: 'Item was okay, but took longer to arrive than expected. Seller was helpful though.',
    date: '3 weeks ago'
  },
  {
    id: '5',
    reviewerName: 'Jessica Martinez',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    comment: 'Perfect transaction! The item was exactly as described and arrived quickly. Seller was very professional and answered all my questions promptly.',
    date: '1 month ago'
  },
  {
    id: '6',
    reviewerName: 'David Wilson',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    rating: 4,
    comment: 'Great seller, fast response time. Item was in good condition. Would definitely recommend to others.',
    date: '1 month ago'
  },
  {
    id: '7',
    reviewerName: 'Lisa Thompson',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    comment: 'Outstanding service! The seller went above and beyond to ensure I was satisfied. Item was packaged perfectly and arrived on time.',
    date: '2 months ago'
  },
  {
    id: '8',
    reviewerName: 'Robert Brown',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    rating: 4,
    comment: 'Good experience overall. The item was as described and the seller was communicative throughout the process.',
    date: '2 months ago'
  },
  {
    id: '9',
    reviewerName: 'Amanda Taylor',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    comment: 'Excellent seller! Very responsive and helpful. The item exceeded my expectations and was delivered quickly.',
    date: '3 months ago'
  },
  {
    id: '10',
    reviewerName: 'Kevin Anderson',
    avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face',
    rating: 3,
    comment: 'Decent experience. The item was okay but took a bit longer to arrive than expected. Seller was responsive to messages.',
    date: '3 months ago'
  }
];

export default function WriteReviewModal({
  visible,
  onClose,
  listingTitle
}: WriteReviewModalProps) {
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(0);

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
        <View style={styles.ratingContainer}>
          {renderStars(item.rating, 14)}
        </View>
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
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableWithoutFeedback>
          <View style={styles.reviewModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Reviews ({formatCount(mockReviews.length)})</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={Colors.black} />
            </TouchableOpacity>
          </View>

          <View style={styles.reviewsSection}>
            <FlatList
              data={mockReviews}
              renderItem={renderReviewItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={true}
              style={styles.reviewsList}
            />
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
                  { opacity: newReview.trim() && rating > 0 ? 1 : 0.5 }
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
});
