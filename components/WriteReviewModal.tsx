import { Colors } from "@/src/constants/constant";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlashList } from "@shopify/flash-list";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BottomSheet from "./BottomSheet";

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
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(0);
  const [reviews] = useState<Review[]>([]);

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return count.toString();
  };

  const handleSendReview = () => {
    if (newReview.trim() && rating > 0) {
      console.log("Submitting review:", { rating, comment: newReview });
      setNewReview("");
      setRating(0);
      Keyboard.dismiss();
    }
  };

  const renderStars = (rating: number, size: number = 16) => (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? "star" : "star-outline"}
          size={size}
          color={star <= rating ? "#FFD700" : Colors.grey}
        />
      ))}
    </View>
  );

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
    <BottomSheet
      visible={visible}
      onClose={onClose}
      snapPoints={["80%"]}
      enableDynamicSizing={false}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Reviews ({formatCount(reviews.length)})
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={20} color={Colors.black} />
            </TouchableOpacity>
          </View>

          {/* List Section */}
          <View style={styles.reviewsSection}>
            {reviews.length === 0
              ? (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={64}
                    color={Colors.grey}
                  />
                  <Text style={styles.emptyTitle}>No reviews yet</Text>
                  <Text style={styles.emptySubtitle}>
                    Be the first one to rate...
                  </Text>
                </View>
              )
              : (
                <FlashList
                  data={reviews}
                  renderItem={renderReviewItem}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
              )}
          </View>

          {/* Input Section */}
          <View style={styles.writeReviewSection}>
            <View style={styles.ratingInputContainer}>
              <Text style={styles.ratingLabel}>Tap to Rate:</Text>
              <View style={styles.starsInputContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starButton}
                  >
                    <Ionicons
                      name={star <= rating ? "star" : "star-outline"}
                      size={28}
                      color={star <= rating ? "#FFD700" : Colors.grey}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.commentInputWrapper}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write your review here..."
                placeholderTextColor={Colors.grey}
                value={newReview}
                onChangeText={setNewReview}
                multiline
                maxLength={500}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  { opacity: newReview.trim() && rating > 0 ? 1 : 0.5 },
                ]}
                onPress={handleSendReview}
                disabled={!newReview.trim() || rating === 0}
              >
                <Ionicons name="send" size={18} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.lightgrey,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.black,
  },
  closeButton: {
    position: "absolute",
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
  },
  reviewsSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  reviewItem: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f0f0f0",
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: Colors.lightgrey,
  },
  reviewContent: {
    flex: 1,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.grey,
  },
  ratingContainer: {
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
  },
  reviewComment: {
    fontSize: 14,
    color: Colors.black,
    lineHeight: 20,
  },
  writeReviewSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: Colors.white,
  },
  ratingInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
  },
  starsInputContainer: {
    flexDirection: "row",
    gap: 8,
  },
  starButton: {
    padding: 2,
  },
  commentInputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#EDEEF0",
  },
  commentInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.black,
    maxHeight: 100,
    minHeight: 40,
    paddingTop: 8,
    paddingBottom: 8,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.grey,
    textAlign: "center",
  },
});
