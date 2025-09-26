import DiscoverOverlay from '@/components/ui/discover/discoverOverlay';
import { Colors } from '@/src/constants/constant';
import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

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

const Discover = () => {
    const [activeTab, setActiveTab] = useState<'Following' | 'Near You' | 'For You'>('For You');
    const [showSearch, setShowSearch] = useState(false);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    // Mock video data - shorter videos (2 min max)
    const mockVideos: VideoItem[] = [
        {
            id: '1',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            username: '@techreviewer',
            title: 'iPhone 14 Pro Max Unboxing',
            location: 'Westlands, Nairobi',
            price: 'Kes 400,000',
            hashtags: ['#iphone', '#unboxing', '#tech', '#nairobi', '#kenya', '#mobile'],
            likes: 1250,
            reviews: 89,
            shares: 45,
            isFollowing: false,
            isLiked: false,
            isSaved: false,
            userAvatar: 'https://via.placeholder.com/40x40',
        },
        {
            id: '2',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            username: '@gadgetguru',
            title: 'MacBook Pro M2 Review',
            location: 'Kilimani, Nairobi',
            price: 'Kes 250,000',
            hashtags: ['#macbook', '#review', '#apple', '#laptop', '#tech'],
            likes: 890,
            reviews: 67,
            shares: 32,
            isFollowing: true,
            isLiked: true,
            isSaved: true,
            userAvatar: 'https://via.placeholder.com/40x40',
        },
        {
            id: '3',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
            username: '@nairobitrader',
            title: 'Samsung Galaxy S23 Demo',
            location: 'Karen, Nairobi',
            price: 'Kes 180,000',
            hashtags: ['#samsung', '#galaxy', '#android', '#camera', '#photography'],
            likes: 2100,
            reviews: 156,
            shares: 78,
            isFollowing: false,
            isLiked: false,
            isSaved: false,
            userAvatar: 'https://via.placeholder.com/40x40',
        },
    ];

    const handleVideoPress = (videoId: string) => {
        console.log('Video pressed:', videoId);
    };

    const handleLike = (videoId: string) => {
        console.log('Like pressed:', videoId);
    };

    const handleFollow = (videoId: string) => {
        console.log('Follow pressed:', videoId);
    };

    const handleShare = (videoId: string) => {
        console.log('Share pressed:', videoId);
    };

    const handleSave = (videoId: string) => {
        console.log('Save pressed:', videoId);
    };

    const handleMessage = (videoId: string) => {
        console.log('Message pressed:', videoId);
    };

    const handleReview = (videoId: string) => {
        console.log('Review pressed:', videoId);
    };

    const handleSearch = () => {
        setShowSearch(!showSearch);
    };

    const VideoItemComponent = ({ item, index }: { item: VideoItem; index: number }) => {
        const [isPlaying, setIsPlaying] = useState(false);
        const [isMuted, setIsMuted] = useState(true);
        
        const player = useVideoPlayer(item.videoUrl, player => {
            player.loop = true;
            player.muted = isMuted;
            player.volume = isMuted ? 0 : 0.8;
        });

        // Handle play/pause based on current video index
        useEffect(() => {
            if (index === currentVideoIndex) {
                player.play();
                setIsPlaying(true);
            } else {
                player.pause();
                setIsPlaying(false);
            }
        }, [currentVideoIndex, index, player]);

        // Handle mute/unmute
        const toggleMute = useCallback(() => {
            const newMutedState = !isMuted;
            setIsMuted(newMutedState);
            player.muted = newMutedState;
            player.volume = newMutedState ? 0 : 0.8;
        }, [isMuted, player]);

        // Handle play/pause toggle
        const togglePlayPause = useCallback(() => {
            if (player.playing) {
                player.pause();
                setIsPlaying(false);
            } else {
                player.play();
                setIsPlaying(true);
            }
        }, [player]);

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
                    onToggleMute={toggleMute}
                />
            </View>
        );
    };

    const renderVideoItem = ({ item, index }: { item: VideoItem; index: number }) => (
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

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <FlatList
                ref={flatListRef}
                data={mockVideos}
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
});

export default Discover;