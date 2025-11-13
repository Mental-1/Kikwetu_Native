import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View, LayoutChangeEvent } from 'react-native';

interface ListingCardProps {
    id: string;
    title: string;
    price: string;
    condition: string;
    location: string;
    image: string;
    description?: string;
    views?: number;
    isFavorite?: boolean;
    viewMode?: 'grid' | 'list';
    onPress?: (id: string) => void;
    onFavoritePress?: (id: string) => void;
    onLayout?: (event: LayoutChangeEvent) => void;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

const ListingCard: React.FC<ListingCardProps> = ({
    id,
    title,
    price,
    condition,
    location,
    image,
    description,
    views,
    isFavorite = false,
    viewMode = 'grid',
    onPress,
    onFavoritePress,
    onLayout
}) => {
    const handlePress = () => {
        onPress?.(id);
    };

    const handleFavoritePress = () => {
        onFavoritePress?.(id);
    };

    if (viewMode === 'list') {
        return (
            <TouchableOpacity style={styles.listCard} onPress={handlePress}>
                {/* Image on the left */}
                <View style={styles.listImageContainer}>
                    <Image source={{ uri: image }} style={styles.listImage} resizeMode="cover" />
                </View>

                {/* Content on the right */}
                <View style={styles.listContent}>
                    {/* Title and Favorite Button */}
                    <View style={styles.listTitleRow}>
                        <Text style={styles.listTitle} numberOfLines={1}>
                            {title}
                        </Text>
                        <TouchableOpacity style={styles.listFavoriteButton} onPress={handleFavoritePress}>
                            <Ionicons
                                name={isFavorite ? "heart" : "heart-outline"}
                                size={18}
                                color={isFavorite ? "#ff4444" : Colors.grey}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Price */}
                    <Text style={styles.listPrice}>
                        {price}
                    </Text>

                    {/* Description */}
                    {description && (
                        <Text style={styles.listDescription} numberOfLines={2}>
                            {description}
                        </Text>
                    )}

                    {/* Location and Views */}
                    <View style={styles.listFooter}>
                        <Text style={styles.listLocation} numberOfLines={1}>
                            {location}
                        </Text>
                        {views !== undefined && (
                            <View style={styles.listViewsContainer}>
                                <Ionicons name="eye-outline" size={12} color={Colors.grey} />
                                <Text style={styles.listViewsText}>{views}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    // Grid view (existing layout)
    return (
        <TouchableOpacity style={styles.card} onPress={handlePress}>
            {/* Image Container */}
            <View style={styles.imageContainer}>
                <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
                
                {/* Favorite Button */}
                <TouchableOpacity 
                    style={styles.favoriteButton} 
                    onPress={handleFavoritePress}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons 
                        name={isFavorite ? "heart" : "heart-outline"} 
                        size={20} 
                        color={isFavorite ? "#ff4444" : Colors.white} 
                    />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Title */}
                <Text style={styles.title} numberOfLines={1}>
                    {title}
                </Text>

                {/* Price */}
                <Text style={styles.price}>
                    {price}
                </Text>

                {/* Description */}
                {description && (
                    <Text style={styles.description} numberOfLines={2}>
                        {description}
                    </Text>
                )}

                {/* Condition Tag */}
                <View style={styles.tagsContainer}>
                    <View style={styles.conditionTag}>
                        <Text style={styles.conditionTagText}>{condition}</Text>
                    </View>
                </View>

                {/* Location and Views */}
                <View style={styles.footer}>
                    <Text style={styles.location} numberOfLines={1}>
                        {location}
                    </Text>
                    {views !== undefined && (
                        <View style={styles.viewsContainer}>
                            <Ionicons name="eye-outline" size={12} color={Colors.grey} />
                            <Text style={styles.viewsText}>{views}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        width: cardWidth,
        backgroundColor: Colors.white,
        borderRadius: 12,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
        height: 140,
        backgroundColor: Colors.lightgrey,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    favoriteButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.black,
        marginBottom: 4,
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 4,
    },
    description: {
        fontSize: 12,
        color: Colors.grey,
        lineHeight: 16,
        marginBottom: 8,
    },
    tagsContainer: {
        flexDirection: 'row',
        marginBottom: 8,
        gap: 6,
    },
    conditionTag: {
        backgroundColor: Colors.black,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    conditionTagText: {
        fontSize: 12,
        color: Colors.white,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    location: {
        fontSize: 12,
        color: Colors.grey,
        flex: 1,
        marginRight: 8,
    },
    viewsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewsText: {
        fontSize: 12,
        color: Colors.grey,
        fontWeight: '500',
    },
    // List view styles
    listCard: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderRadius: 8,
        marginBottom: 12,
        marginHorizontal: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: Colors.lightgrey,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    listImageContainer: {
        width: 120,
        height: 100,
        borderRadius: 8,
        marginRight: 12,
    },
    listImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    listTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    listFavoriteButton: {
        padding: 4,
        marginLeft: 8,
    },
    listContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    listTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.black,
        marginBottom: 4,
    },
    listPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 6,
    },
    listDescription: {
        fontSize: 12,
        color: Colors.grey,
        lineHeight: 16,
        marginBottom: 8,
    },
    listFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    listLocation: {
        fontSize: 12,
        color: Colors.grey,
        flex: 1,
        marginRight: 8,
    },
    listViewsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    listViewsText: {
        fontSize: 12,
        color: Colors.grey,
        fontWeight: '500',
    },
});

export default ListingCard;