import { Colors } from "@/src/constants/constant";
import { Review } from "@/src/types/api.types";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const REVIEW_ITEM_WIDTH = SCREEN_WIDTH * 0.7;

interface ReviewsSectionProps {
    reviews: Review[];
    averageRating: number;
    totalReviews: number;
    onShowAll: () => void;
}

const ReviewItem = ({ item }: { item: Review }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <View style={styles.reviewItemContainer}>
            <View style={styles.reviewHeader}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                <Text style={styles.reviewerName} numberOfLines={1}>
                    {item.reviewerName}
                </Text>
            </View>

            <Text style={styles.reviewDate}>{item.date}</Text>

            <Text
                style={styles.reviewComment}
                numberOfLines={isExpanded ? undefined : 3}
            >
                {item.comment}
            </Text>

            {!isExpanded && item.comment.length > 80 && (
                <TouchableOpacity onPress={() => setIsExpanded(true)}>
                    <Text style={styles.showMoreLink}>Show more</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const ReviewsSection = ({
    reviews,
    averageRating,
    totalReviews,
    onShowAll,
}: ReviewsSectionProps) => {
    const renderItem = ({ item, index }: { item: Review; index: number }) => (
        <View style={styles.itemWrapper}>
            <ReviewItem item={item} />
            {index < reviews.length - 1 && <View style={styles.separator} />}
        </View>
    );

    if (reviews.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.sectionTitle}>Reviews</Text>
                </View>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No reviews yet</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={16} color={Colors.black} />
                    <Text style={styles.ratingText}>
                        {averageRating.toFixed(1)}
                    </Text>
                    <Text style={styles.dotSeparator}>•</Text>
                    <Text style={styles.reviewCountText}>
                        {totalReviews} Reviews
                    </Text>
                </View>
            </View>

            {/* Horizontal List */}
            <View style={styles.listContainer}>
                <FlashList
                    data={reviews}
                    renderItem={renderItem}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    keyExtractor={(item) => item.id}
                />
            </View>

            {/* Footer Button */}
            <TouchableOpacity style={styles.showAllButton} onPress={onShowAll}>
                <Text style={styles.showAllText}>
                    Show all ({totalReviews}) reviews
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 16,
        backgroundColor: Colors.white,
    },
    header: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.black,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    ratingText: {
        fontSize: 16,
        fontWeight: "bold",
        color: Colors.black,
    },
    dotSeparator: {
        fontSize: 16,
        color: Colors.grey,
        marginHorizontal: 4,
    },
    reviewCountText: {
        fontSize: 16,
        color: Colors.black,
        fontWeight: "500",
    },
    listContainer: {
        minHeight: 150,
    },
    listContent: {
        paddingHorizontal: 16,
    },
    itemWrapper: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    reviewItemContainer: {
        width: REVIEW_ITEM_WIDTH,
        paddingRight: 16,
    },
    separator: {
        width: 0.8,
        height: "100%",
        backgroundColor: Colors.lightgrey,
        marginRight: 16,
    },
    reviewHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 8,
        backgroundColor: Colors.lightgrey,
    },
    reviewerName: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.black,
        flex: 1,
    },
    reviewDate: {
        fontSize: 12,
        color: Colors.grey,
        marginBottom: 8,
    },
    reviewComment: {
        fontSize: 14,
        color: Colors.black,
        lineHeight: 20,
    },
    showMoreLink: {
        fontSize: 14,
        color: Colors.black,
        fontWeight: "600",
        marginTop: 4,
        textDecorationLine: "underline",
    },
    showAllButton: {
        marginTop: 16,
        paddingVertical: 12,
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
    },
    showAllText: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.black,
    },
    emptyState: {
        padding: 16,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.grey,
        fontStyle: "italic",
    },
});

export default ReviewsSection;
