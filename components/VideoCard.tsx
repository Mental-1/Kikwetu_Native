import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface VideoCardProps {
    id: string;
    title: string;
    videoUrl: string;
    thumbnail?: string;
    duration?: string;
    onPress?: (id: string) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({
    id,
    title,
    videoUrl,
    thumbnail,
    duration,
    onPress,
}) => {
    const player = useVideoPlayer(videoUrl, player => {
        player.loop = true;
        player.muted = true;
    });
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePress = () => {
        onPress?.(id);
    };

    const handleVideoPress = () => {
        if (isPlaying) {
            player.pause();
            setIsPlaying(false);
        } else {
            player.play();
            setIsPlaying(true);
        }
    };

    const handlePlaybackStatusUpdate = useCallback(() => {
        setIsPlaying(player.playing);
    }, [player.playing]);

    // Listen to player status changes
    React.useEffect(() => {
        const subscription = player.addListener('statusChange', handlePlaybackStatusUpdate);
        return () => subscription?.remove();
    }, [player, handlePlaybackStatusUpdate]);

    return (
        <TouchableOpacity 
            style={styles.card} 
            onPress={handlePress}
        >
            <View style={styles.videoContainer}>
                <VideoView
                    style={styles.video}
                    player={player}
                    allowsFullscreen={false}
                    allowsPictureInPicture={false}
                    contentFit="cover"
                />
                
                {/* Video Overlay */}
                <TouchableOpacity 
                    style={styles.videoOverlay} 
                    onPress={handleVideoPress}
                    activeOpacity={0.8}
                >
                    {!isPlaying && (
                        <View style={styles.playButton}>
                            <Ionicons name="play" size={32} color={Colors.white} />
                        </View>
                    )}
                </TouchableOpacity>

                {/* Duration Badge */}
                {duration && (
                    <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>{duration}</Text>
                    </View>
                )}

            </View>

            {/* Title */}
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>
                    {title}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        width: 160,
        marginRight: 16,
        backgroundColor: Colors.white,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    videoContainer: {
        position: 'relative',
        height: 238,
        backgroundColor: Colors.lightgrey,
        overflow: 'hidden',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    videoOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.white,
    },
    durationBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    durationText: {
        fontSize: 12,
        color: Colors.white,
        fontWeight: '600',
    },
    content: {
        padding: 12,
    },
    title: {
        fontSize: 14,
        color: Colors.black,
        fontWeight: '600',
        lineHeight: 18,
    },
});

export default VideoCard;
