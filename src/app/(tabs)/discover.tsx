import DiscoverOverlay from '@/components/ui/discover/discoverOverlay';
import { Colors } from '@/src/constants/constant';
import { useSaveListing as useSaveListingHook } from '@/src/hooks/useApiSavedListings';
import { useOptimizedVideoPlayer, useVideoManager } from '@/src/hooks/useVideoManager';
import { useBunnyVideoUrls, useMarkVideoViewed, useOptimizedVideoFeed, useToggleVideoLike } from '@/src/hooks/useVideos';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { VideoView } from 'expo-video';
import React, { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, RefreshControl, Share, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const LazyWriteReviewModal = lazy(() => import('@/components/WriteReviewModal'));

const { width, height } = Dimensions.get('window');

const DiscoverLoading = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.black }}>
        <ActivityIndicator size="large" color={Colors.primary} />
    </View>
);

const DiscoverContent = () => {
    const [activeTab, setActiveTab] = useState<'Following' | 'Near You' | 'For You'>('For You');
    const [showSearch, setShowSearch] = useState(false);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(true);  
    const flatListRef = useRef<FlatList>(null);

    const feedFilters = {
        algorithm: (activeTab === 'For You' ? 'for_you' : 
                   activeTab === 'Following' ? 'following' : 'nearby') as 'for_you' | 'following' | 'nearby',
    };

    const {
        isLoading: feedLoading,
        error: feedError,
        refetch: refetchFeed,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        videos,
    } = useOptimizedVideoFeed(feedFilters);
    
    const [refreshing, setRefreshing] = useState(false);

    const {
        setCurrentVideoId,
        preloadAdjacentVideos,
        cleanupVideo,
        isVideoPreloaded,
    } = useVideoManager(videos, {
        preloadRange: 2, 
        maxPreloadedVideos: 5,
        preloadDuration: 3,
    });

    // Video interaction hooks
    const markViewedMutation = useMarkVideoViewed();
    const toggleLikeMutation = useToggleVideoLike();
    const saveListingMutation = useSaveListingHook();

    const handleVideoPress = useCallback((videoId: string) => {
        console.log('Video pressed:', videoId);
    }, []);

    const handleLike = useCallback(async (videoId: string) => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            
            await toggleLikeMutation.mutateAsync(videoId);
            showSuccessToast('Video liked!');
        } catch {
            showErrorToast('Failed to like video');
        }
    }, [toggleLikeMutation]);

    const handleFollow = useCallback((videoId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        console.log('Follow pressed:', videoId);
        // TODO: Implement follow functionality
    }, []);

    const handleShare = useCallback(async (videoId: string) => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            
            const video = videos.find(v => v.id === videoId);
            if (video) {
                const shareMessage = `Check out this video: ${video.title}`;
                const shareUrl = `https://kikwetu.app/video/${videoId}`;
                
                await Share.share({
                    message: `${shareMessage}\n${shareUrl}`,
                    url: shareUrl,
                });
                
                showSuccessToast('Video shared!');
            }
        } catch (error) {
            console.error('Share error:', error);
            showErrorToast('Failed to share video');
        }
    }, [videos]);

    const handleSave = useCallback(async (videoId: string) => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            
            await saveListingMutation.mutateAsync({ listingId: videoId });
            showSuccessToast('Video saved!');
        } catch {
            showErrorToast('Failed to save video');
        }
    }, [saveListingMutation]);

    const handleMessage = useCallback((videoId: string) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        console.log('Message pressed:', videoId);
        // TODO: Implement message functionality - navigate to chat
    }, []);

    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedListing, setSelectedListing] = useState<{ id: string; title: string } | null>(null);

    const handleReview = useCallback((videoId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        // Find the video to get its listing info
        const video = videos.find(v => v.id === videoId);
        if (video?.listing) {
            setSelectedListing({
                id: video.listing.id,
                title: video.listing.title,
            });
            setShowReviewModal(true);
        }
    }, [videos]);

    const handleSearch = () => {
        setShowSearch(!showSearch);
    };

    const handleToggleMute = useCallback(() => {
        Haptics.selectionAsync();
        
        setIsMuted(prev => !prev);
    }, []);

    const VideoItemComponent = ({ item, index }: { item: any; index: number }) => {
        const [watchTime, setWatchTime] = useState(0);
        const isActive = index === currentVideoIndex;
        
        const getBunnyUrls = useBunnyVideoUrls(item.id);
        const bunnyUrls = getBunnyUrls();
        
        const {
            player,
            isPlaying,
            togglePlayPause,
        } = useOptimizedVideoPlayer(
            bunnyUrls.videoUrl,
            bunnyUrls.hlsUrl,
            isActive,
            isMuted 
        );

        useEffect(() => {
            if (isActive) {
                setCurrentVideoId(item.id);
                
                markViewedMutation.mutate({ 
                    videoId: item.id, 
                    watchTime: watchTime 
                });
                
                preloadAdjacentVideos(index);
            }
        }, [isActive, item.id, watchTime, index]);

        useEffect(() => {
            if (isActive && isPlaying) {
                const interval = setInterval(() => {
                    setWatchTime(prev => prev + 1);
                }, 1000);
                
                return () => clearInterval(interval);
            }
        }, [isActive, isPlaying]);

        useEffect(() => {
            return () => {
                if (!isActive && isVideoPreloaded(item.id)) {
                    cleanupVideo(item.id);
                }
            };
        }, [isActive, item.id]);

        return (
            <View style={styles.videoContainer}>
                <TouchableOpacity 
                    style={styles.videoTouchable}
                    activeOpacity={1}
                    onPress={togglePlayPause}
                >
                    <VideoView
                        style={styles.video}
                        player={player}
                        allowsPictureInPicture={false}
                        contentFit="cover"
                        nativeControls={false}
                    />
                </TouchableOpacity>
                
                <DiscoverOverlay
                    video={item}
                    activeTab={activeTab}
                    showSearch={showSearch}
                    onTabChange={setActiveTab}
                    onSearch={handleSearch}
                    onVideoPress={handleVideoPress}
                    onLike={handleLike}
                    onFollow={handleFollow}
                    onShare={handleShare}
                    onSave={handleSave}
                    onMessage={handleMessage}
                    onReview={handleReview}
                    isMuted={isMuted}
                    onToggleMute={handleToggleMute}
                />
            </View>
        );
    };

    const renderVideoItem = ({ item, index }: { item: any; index: number }) => (
        <VideoItemComponent item={item} index={index} />
    );

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setCurrentVideoIndex(viewableItems[0].index);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refetchFeed();
        } finally {
            setRefreshing(false);
        }
    }, [refetchFeed]);

    // Create placeholder video for empty/error states to show overlay
    const placeholderVideo = {
        id: 'placeholder',
        title: '',
        user: {
            id: '',
            username: '',
            avatar_url: undefined,
            verified: false,
        },
        engagement: {
            isLiked: false,
            isFollowing: false,
        },
        likes: 0,
        views: 0,
        comments: 0,
        tags: [],
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <FlatList
                ref={flatListRef}
                data={videos.length > 0 ? videos : [placeholderVideo]}
                renderItem={({ item, index }) => {
                    if (item.id === 'placeholder') {
                        // Empty or Error State with Overlay
                        return (
                            <View style={styles.videoContainer}>
                                <View style={styles.emptyVideoPlaceholder} />
                                
                                {/* Show overlay even without media */}
                                <DiscoverOverlay
                                    video={placeholderVideo as any}
                                    activeTab={activeTab}
                                    showSearch={showSearch}
                                    onTabChange={setActiveTab}
                                    onSearch={handleSearch}
                                    onVideoPress={handleVideoPress}
                                    onLike={handleLike}
                                    onFollow={handleFollow}
                                    onShare={handleShare}
                                    onSave={handleSave}
                                    onMessage={handleMessage}
                                    onReview={handleReview}
                                    isMuted={isMuted}
                                    onToggleMute={handleToggleMute}
                                />
                                
                                {/* Empty/Error State Content */}
                                <View style={styles.emptyStateContainer}>
                                    {feedError ? (
                                        <>
                                            <Text style={styles.emptyStateTitle}>Failed to load</Text>
                                            <TouchableOpacity 
                                                style={styles.retryButton}
                                                onPress={() => refetchFeed()}
                                            >
                                                <Ionicons name="refresh-outline" size={24} color={Colors.white} />
                                            </TouchableOpacity>
                                        </>
                                    ) : feedLoading ? (
                                        <ActivityIndicator size="large" color={Colors.primary} />
                                    ) : (
                                        <Text style={styles.emptyStateText}>Oops. Nothing here</Text>
                                    )}
                                </View>
                            </View>
                        );
                    }
                    return renderVideoItem({ item, index });
                }}
                keyExtractor={(item) => item.id}
                pagingEnabled={videos.length > 0}
                showsVerticalScrollIndicator={false}
                onViewableItemsChanged={videos.length > 0 ? onViewableItemsChanged : undefined}
                viewabilityConfig={viewabilityConfig}
                snapToInterval={videos.length > 0 ? height : undefined}
                snapToAlignment="start"
                decelerationRate="fast"
                removeClippedSubviews={true}
                maxToRenderPerBatch={3}
                windowSize={5}
                initialNumToRender={2}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.primary}
                        colors={[Colors.primary]}
                    />
                }
                ListFooterComponent={() => 
                    isFetchingNextPage ? (
                        <View style={styles.loadingFooter}>
                            <ActivityIndicator size="small" color={Colors.primary} />
                        </View>
                    ) : null
                }
                getItemLayout={(data, index) => ({
                    length: height,
                    offset: height * index,
                    index,
                })}
            />

            {/* Review Modal */}
            {showReviewModal && selectedListing && (
                <Suspense fallback={null}>
                    <LazyWriteReviewModal
                        visible={showReviewModal}
                        onClose={() => {
                            setShowReviewModal(false);
                            setSelectedListing(null);
                        }}
                        listingTitle={selectedListing.title}
                    />
                </Suspense>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.black,
    },
    videoContainer: {
        width: width,
        height: height,
        position: 'relative',
    },
    videoTouchable: {
        width: '100%',
        height: '100%',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.black,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.black,
    },
    errorText: {
        color: Colors.white,
        fontSize: 16,
        textAlign: 'center',
    },
    emptyVideoPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: Colors.black,
    },
    emptyStateContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    emptyStateText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 18,
        fontWeight: '500',
        textAlign: 'center',
    },
    emptyStateTitle: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 24,
    },
    retryButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    loadingFooter: {
        paddingVertical: 20,
        alignItems: 'center',
    },
});

const Discover = () => (
    <Suspense fallback={<DiscoverLoading />}>
        <DiscoverContent />
    </Suspense>
);

export default Discover;