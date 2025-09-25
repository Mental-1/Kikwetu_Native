import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface VideoItem {
    id: string;
    videoUrl: string;
    username: string;
    title: string;
    location: string;
    price: string;
    hashtags: string[];
    likes: number;
    reviews: number;
    shares: number;
    isFollowing: boolean;
    isLiked: boolean;
    isSaved: boolean;
    userAvatar: string;
}

interface DiscoverOverlayProps {
    video: VideoItem;
    activeTab: 'Following' | 'Near You' | 'For You';
    showSearch: boolean;
    onTabChange: (tab: 'Following' | 'Near You' | 'For You') => void;
    onSearch: () => void;
    onVideoPress: (videoId: string) => void;
    onLike: (videoId: string) => void;
    onFollow: (videoId: string) => void;
    onShare: (videoId: string) => void;
    onSave: (videoId: string) => void;
    onMessage: (videoId: string) => void;
    onReview: (videoId: string) => void;
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
}) => {
    const [expandedHashtags, setExpandedHashtags] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const toggleHashtags = () => {
        setExpandedHashtags(!expandedHashtags);
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    const displayHashtags = expandedHashtags ? video.hashtags : video.hashtags.slice(0, 3);

    return (
        <View style={styles.overlay}>
            {/* Top Header */}
            <SafeAreaView style={styles.topHeader}>
                <View style={styles.headerContent}>
                    {/* Search Icon */}
                    <TouchableOpacity style={styles.searchButton} onPress={onSearch}>
                        <Ionicons name="search-outline" size={24} color={Colors.white} />
                    </TouchableOpacity>

                    {/* Tab Toggles */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'Following' && styles.activeTab]}
                            onPress={() => onTabChange('Following')}
                        >
                            <Text style={[styles.tabText, activeTab === 'Following' && styles.activeTabText]}>
                                Following
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'Near You' && styles.activeTab]}
                            onPress={() => onTabChange('Near You')}
                        >
                            <Text style={[styles.tabText, activeTab === 'Near You' && styles.activeTabText]}>
                                Near You
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'For You' && styles.activeTab]}
                            onPress={() => onTabChange('For You')}
                        >
                            <Text style={[styles.tabText, activeTab === 'For You' && styles.activeTabText]}>
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
                            <Ionicons name="close" size={20} color={Colors.white} />
                        </TouchableOpacity>
                    </View>
                )}
            </SafeAreaView>

            {/* Left Side Content */}
            <View style={styles.leftContent}>
                <SafeAreaView style={styles.leftSafeArea}>
                    {/* User Info */}
                    <View style={styles.userInfo}>
                        <Text style={styles.username}>{video.username}</Text>
                        <Text style={styles.title} numberOfLines={2}>{video.title}</Text>
                    </View>

                    {/* Location and Price */}
                    <View style={styles.locationPriceRow}>
                        <Text style={styles.location}>{video.location}</Text>
                        <Text style={styles.price}>{video.price}</Text>
                    </View>

                    {/* Hashtags */}
                    <View style={styles.hashtagsContainer}>
                        <Text style={styles.hashtags}>
                            {displayHashtags.map((tag, index) => (
                                <Text key={index} style={styles.hashtag}>
                                    {tag}{' '}
                                </Text>
                            ))}
                        </Text>
                        {video.hashtags.length > 3 && (
                            <TouchableOpacity onPress={toggleHashtags} style={styles.seeMoreButton}>
                                <Text style={styles.seeMoreText}>
                                    {expandedHashtags ? 'See Less' : 'See More'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </SafeAreaView>
            </View>

            {/* Right Side Actions */}
            <View style={styles.rightActions}>
                <SafeAreaView style={styles.rightSafeArea}>
                    {/* Account Avatar and Follow */}
                    <View style={styles.actionItem}>
                        <TouchableOpacity
                            style={styles.avatarContainer}
                            onPress={() => onFollow(video.id)}
                        >
                            <Image source={{ uri: video.userAvatar }} style={styles.avatar} />
                            {video.isFollowing ? (
                                <View style={styles.followingBadge}>
                                    <Ionicons name="checkmark" size={12} color={Colors.white} />
                                </View>
                            ) : (
                                <View style={styles.followBadge}>
                                    <Ionicons name="add" size={12} color={Colors.white} />
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Like */}
                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => onLike(video.id)}
                    >
                        <View style={styles.actionIcon}>
                            <Ionicons
                                name={video.isLiked ? "heart" : "heart-outline"}
                                size={32}
                                color={video.isLiked ? "#ff4444" : Colors.white}
                            />
                        </View>
                        <Text style={styles.actionCount}>{formatNumber(video.likes)}</Text>
                    </TouchableOpacity>

                    {/* Review */}
                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => onReview(video.id)}
                    >
                        <View style={styles.actionIcon}>
                            <Ionicons name="star-outline" size={32} color={Colors.white} />
                        </View>
                        <Text style={styles.actionCount}>{formatNumber(video.reviews)}</Text>
                    </TouchableOpacity>

                    {/* Message */}
                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => onMessage(video.id)}
                    >
                        <View style={styles.actionIcon}>
                            <Ionicons name="chatbubble-outline" size={32} color={Colors.white} />
                        </View>
                    </TouchableOpacity>

                    {/* Share */}
                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => onShare(video.id)}
                    >
                        <View style={styles.actionIcon}>
                            <Ionicons name="share-outline" size={32} color={Colors.white} />
                        </View>
                        <Text style={styles.actionCount}>{formatNumber(video.shares)}</Text>
                    </TouchableOpacity>

                    {/* Save */}
                    <TouchableOpacity
                        style={styles.actionItem}
                        onPress={() => onSave(video.id)}
                    >
                        <View style={styles.actionIcon}>
                            <Ionicons
                                name={video.isSaved ? "bookmark" : "bookmark-outline"}
                                size={32}
                                color={video.isSaved ? Colors.primary : Colors.white}
                            />
                        </View>
                    </TouchableOpacity>
                </SafeAreaView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
    },
    topHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchButton: {
        marginRight: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'center',
        gap: 24,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: Colors.white,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.7)',
    },
    activeTabText: {
        color: Colors.white,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
        color: Colors.white,
    },
    leftContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 80,
        zIndex: 2,
    },
    leftSafeArea: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    userInfo: {
        marginBottom: 8,
    },
    username: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.white,
        marginBottom: 4,
    },
    title: {
        fontSize: 14,
        color: Colors.white,
        lineHeight: 18,
    },
    locationPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 12,
    },
    location: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        flex: 1,
    },
    price: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    hashtagsContainer: {
        marginBottom: 8,
    },
    hashtags: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.9)',
        lineHeight: 16,
    },
    hashtag: {
        fontWeight: '600',
    },
    seeMoreButton: {
        marginTop: 4,
    },
    seeMoreText: {
        fontSize: 12,
        color: Colors.primary,
        fontWeight: '600',
    },
    rightActions: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        zIndex: 2,
        width: 60,
    },
    rightSafeArea: {
        paddingHorizontal: 16,
        paddingBottom: 100,
        alignItems: 'center',
    },
    actionItem: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 8,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: Colors.white,
    },
    followBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#ff4444',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.white,
    },
    followingBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.white,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    actionCount: {
        fontSize: 12,
        color: Colors.white,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default DiscoverOverlay;
