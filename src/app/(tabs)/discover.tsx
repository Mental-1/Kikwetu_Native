import DiscoverOverlay from '@/components/ui/discover/discoverOverlay';
import { Colors } from '@/src/constants/constant';
import { useSaveListing as useSaveListingHook } from '@/src/hooks/useApiSavedListings';
import { useOptimizedVideoPlayer, useVideoManager } from '@/src/hooks/useVideoManager';
import { useBunnyVideoUrls, useMarkVideoViewed, useOptimizedVideoFeed, useToggleVideoLike } from '@/src/hooks/useVideos';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import * as Haptics from 'expo-haptics';
import { VideoView } from 'expo-video';
import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Share, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        videos,
    } = useOptimizedVideoFeed(feedFilters);

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

    const handleReview = useCallback((videoId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        
        console.log('Review pressed:', videoId);
        // TODO: Implement review functionality - open review modal
    }, []);

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

    if (feedLoading && videos.length === 0) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </View>
        );
    }
    
    if (feedError) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Failed to load videos</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <FlatList
                ref={flatListRef}
                data={videos}
                renderItem={renderVideoItem}
                keyExtractor={(item) => item.id}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                snapToInterval={height}
                snapToAlignment="start"
                decelerationRate="fast"
                removeClippedSubviews={true}
                maxToRenderPerBatch={3}
                windowSize={5}
                initialNumToRender={2}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
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