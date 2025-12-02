import { Colors } from "@/src/constants/constant";
import { FeedVideo } from "@/src/services/videos.service";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LikeButton from "../../animated/LikeButton";
import SaveButton from "../../animated/SaveButton";

const { width, height } = Dimensions.get("window");
const scale = Math.min(width / 375, 1.1);
const verticalScale = Math.min(height / 812, 1.1);

interface DiscoverOverlayProps {
    video: FeedVideo;
    activeTab: "Following" | "Near You" | "For You";
    showSearch: boolean;
    onTabChange: (tab: "Following" | "Near You" | "For You") => void;
    onSearch: () => void;
    onVideoPress: (videoId: string) => void;
    onLike: (videoId: string) => void;
    onFollow: (userId: string) => void;
    onShare: (videoId: string) => void;
    onSave: (videoId: string) => void;
    onMessage: (userId: string) => void;
    onReview: (videoId: string) => void;
    isMuted?: boolean;
    onToggleMute?: () => void;
}

const DiscoverOverlay: React.FC<DiscoverOverlayProps> = ({
    video,
    activeTab,
    showSearch,
    onTabChange,
    onSearch,
    onVideoPress,
    onLike,
    onFollow,
    onShare,
    onSave,
    onMessage,
    onReview,
    isMuted = true,
    onToggleMute,
}) => {
    const [expandedHashtags, setExpandedHashtags] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const toggleHashtags = () => {
        setExpandedHashtags(!expandedHashtags);
    };

    const formatNumber = (num: number) => {
        if (num >= 1_000_000) {
            return ((num / 1_000_000).toFixed(1).replace(/\.0$/, "")) + "M";
        }
        if (num >= 1_000) {
            return ((num / 1_000).toFixed(1).replace(/\.0$/, "")) + "K";
        }
        return num.toString();
    };

    const displayHashtags = expandedHashtags
        ? (video.tags || [])
        : (video.tags || []).slice(0, 3);

    return (
        <View style={styles.overlay} pointerEvents="box-none">
            {/* Top Header */}
            <SafeAreaView style={styles.topHeader}>
                <View style={styles.headerContent}>
                    {/* Search Icon */}
                    <TouchableOpacity
                        style={styles.searchButton}
                        onPress={onSearch}
                    >
                        <Ionicons
                            name="search-outline"
                            size={24}
                            color={Colors.white}
                        />
                    </TouchableOpacity>

                    {/* Tab Toggles */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[
                                styles.tab,
                                activeTab === "Following" && styles.activeTab,
                            ]}
                            onPress={() => onTabChange("Following")}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === "Following" &&
                                    styles.activeTabText,
                                ]}
                            >
                                Following
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.tab,
                                activeTab === "Near You" && styles.activeTab,
                            ]}
                            onPress={() => onTabChange("Near You")}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === "Near You" &&
                                    styles.activeTabText,
                                ]}
                            >
                                Near You
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.tab,
                                activeTab === "For You" && styles.activeTab,
                            ]}
                            onPress={() => onTabChange("For You")}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === "For You" &&
                                    styles.activeTabText,
                                ]}
                            >
                                For You
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search Bar */}
                {showSearch && (
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search videos, users, hashtags..."
                            placeholderTextColor={Colors.grey}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        <TouchableOpacity onPress={onSearch}>
                            <Ionicons
                                name="close"
                                size={20}
                                color={Colors.white}
                            />
                        </TouchableOpacity>
                    </View>
                )}
            </SafeAreaView>

            {/* Left Side Content */}
            <View style={styles.leftContent}>
                <View style={styles.leftSafeArea}>
                    {/* User Info */}
                    <View style={styles.userInfo}>
                        <Text style={styles.username}>
                            {video.user.username}
                        </Text>
                        <Text style={styles.title} numberOfLines={2}>
                            {video.title}
                        </Text>
                    </View>

                    {/* Location and Price */}
                    <View style={styles.locationPriceRow}>
                        <Text style={styles.location}>
                            {video.listing?.location || "Unknown Location"}
                        </Text>
                        <Text style={styles.price}>
                            {video.listing
                                ? `Kes ${
                                    video.listing.price?.toLocaleString() || "0"
                                }`
                                : "Price N/A"}
                        </Text>
                    </View>

                    {/* Hashtags */}
                    <View style={styles.hashtagsContainer}>
                        <Text style={styles.hashtags}>
                            {displayHashtags.map((tag, index) => (
                                <Text key={index} style={styles.hashtag}>
                                    {tag}
                                    {" "}
                                </Text>
                            ))}
                        </Text>
                        {video.tags && video.tags.length > 3 && (
                            <TouchableOpacity
                                onPress={toggleHashtags}
                                style={styles.seeMoreButton}
                            >
                                <Text style={styles.seeMoreText}>
                                    {expandedHashtags ? "See Less" : "See More"}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

            {/* Right Side Actions */}
            <View style={styles.rightActions}>
                <View style={styles.rightSafeArea}>
                    {/* Account Avatar and Follow */}
                    <View style={styles.actionItem}>
                        <TouchableOpacity
                            style={styles.avatarContainer}
                            onPress={() => onFollow(video.user.id)}
                        >
                            <Image
                                source={{
                                    uri: video.user.avatar_url ||
                                        "https://via.placeholder.com/50",
                                }}
                                style={styles.avatar}
                            />
                            {video.engagement.isFollowing
                                ? (
                                    <View style={styles.followingBadge}>
                                        <Ionicons
                                            name="checkmark"
                                            size={12}
                                            color={Colors.white}
                                        />
                                    </View>
                                )
                                : (
                                    <View style={styles.followBadge}>
                                        <Ionicons
                                            name="add"
                                            size={12}
                                            color={Colors.white}
                                        />
                                    </View>
                                )}
                        </TouchableOpacity>
                    </View>

                    {/* Like */}
                    <View style={styles.actionItem}>
                        <LikeButton
                            isLiked={video.engagement.isLiked}
                            onPress={() => onLike(video.id)}
                        />
                        <Text style={styles.actionCount}>
                            {formatNumber(video.likes)}
                        </Text>
                    </View>

                    {/* Review */}
                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => onReview(video.id)}
                    >
                        <View style={styles.actionIcon}>
                            <Ionicons
                                name="star-outline"
                                size={24}
                                color={Colors.white}
                            />
                        </View>
                        <Text style={styles.actionCount}>
                            {formatNumber(0)}
                        </Text>
                    </TouchableOpacity>

                    {/* Message */}
                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => onMessage(video.user.id)}
                    >
                        <View style={styles.actionIcon}>
                            <Ionicons
                                name="chatbubble-outline"
                                size={24}
                                color={Colors.white}
                            />
                        </View>
                    </TouchableOpacity>

                    {/* Share */}
                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => onShare(video.id)}
                    >
                        <View style={styles.actionIcon}>
                            <Ionicons
                                name="share-social-outline"
                                size={24}
                                color={Colors.white}
                            />
                        </View>
                        <Text style={styles.actionCount}>
                            {formatNumber(video.shares)}
                        </Text>
                    </TouchableOpacity>

                    {/* Save */}
                    <View style={styles.actionItem}>
                        <SaveButton
                            isSaved={video.engagement.isSaved}
                            onPress={() => onSave(video.id)}
                        />
                    </View>

                    {/* Mute/Unmute */}
                    {onToggleMute && (
                        <TouchableOpacity
                            style={styles.actionItem}
                            onPress={onToggleMute}
                        >
                            <View style={styles.actionIcon}>
                                <Ionicons
                                    name={isMuted
                                        ? "volume-mute"
                                        : "volume-high"}
                                    size={24}
                                    color={Colors.white}
                                />
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 5,
    },
    topHeader: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16 * scale,
        paddingVertical: 12 * verticalScale,
    },
    searchButton: {
        marginRight: 16 * scale,
    },
    tabContainer: {
        flexDirection: "row",
        flex: 1,
        justifyContent: "center",
        gap: 16 * scale, // Reduced gap
    },
    tab: {
        paddingVertical: 6 * verticalScale,
        paddingHorizontal: 10 * scale,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: Colors.white,
    },
    tabText: {
        fontSize: 14 * scale, // Smaller font
        fontWeight: "600",
        color: "rgba(255, 255, 255, 0.7)",
    },
    activeTabText: {
        color: Colors.white,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16 * scale,
        paddingBottom: 12 * verticalScale,
        gap: 10 * scale,
    },
    searchInput: {
        flex: 1,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 20,
        paddingHorizontal: 16 * scale,
        paddingVertical: 8 * verticalScale,
        fontSize: 14 * scale,
        color: Colors.white,
    },
    leftContent: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 70 * scale,
        zIndex: 2,
    },
    leftSafeArea: {
        paddingHorizontal: 16 * scale,
        paddingBottom: 40 * verticalScale,
        alignItems: "flex-start",
    },
    userInfo: {
        marginBottom: 8 * verticalScale,
        alignItems: "flex-start",
    },
    username: {
        fontSize: 15 * scale,
        fontWeight: "bold",
        color: Colors.white,
        marginBottom: 4,
        textAlign: "left",
    },
    title: {
        fontSize: 13 * scale,
        color: Colors.white,
        lineHeight: 18 * scale,
        textAlign: "left",
    },
    locationPriceRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8 * verticalScale,
        gap: 6 * scale,
    },
    location: {
        fontSize: 12 * scale,
        color: "rgba(255, 255, 255, 0.8)",
        flex: 1,
        textAlign: "left",
    },
    price: {
        fontSize: 13 * scale,
        fontWeight: "bold",
        color: Colors.primary,
        textAlign: "left",
    },
    hashtagsContainer: {
        marginBottom: 8 * verticalScale,
        alignItems: "flex-start",
    },
    hashtags: {
        fontSize: 12 * scale,
        color: "rgba(255, 255, 255, 0.9)",
        lineHeight: 16 * scale,
        textAlign: "left",
    },
    hashtag: {
        fontWeight: "600",
    },
    seeMoreButton: {
        marginTop: 4,
    },
    seeMoreText: {
        fontSize: 12 * scale,
        color: Colors.primary,
        fontWeight: "600",
    },
    rightActions: {
        position: "absolute",
        bottom: 0,
        right: 0,
        zIndex: 2,
        width: 56 * scale,
    },
    rightSafeArea: {
        paddingHorizontal: 8 * scale,
        paddingBottom: 50 * verticalScale,
        alignItems: "center",
    },
    actionItem: {
        alignItems: "center",
        marginBottom: 16 * verticalScale,
    },
    avatarContainer: {
        position: "relative",
        marginBottom: 8 * verticalScale,
    },
    avatar: {
        width: 38 * scale,
        height: 38 * scale,
        borderRadius: 19 * scale,
        borderWidth: 2,
        borderColor: Colors.white,
    },
    followBadge: {
        position: "absolute",
        bottom: -2,
        right: -2,
        width: 14 * scale,
        height: 14 * scale,
        borderRadius: 7 * scale,
        backgroundColor: "#ff4444",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: Colors.white,
    },
    followingBadge: {
        position: "absolute",
        bottom: -2,
        right: -2,
        width: 14 * scale,
        height: 14 * scale,
        borderRadius: 7 * scale,
        backgroundColor: Colors.primary,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: Colors.white,
    },
    actionIcon: {
        width: 38 * scale,
        height: 38 * scale,
        borderRadius: 19 * scale,
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 4,
    },
    actionCount: {
        fontSize: 11 * scale,
        color: Colors.white,
        fontWeight: "600",
        textAlign: "center",
    },
});

export default DiscoverOverlay;
