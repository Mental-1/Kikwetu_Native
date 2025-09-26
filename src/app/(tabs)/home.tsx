import ListingCard from '@/components/ListingCard';
import NotificationBadge from '@/components/NotificationBadge';
import VideoCard from '@/components/VideoCard';
import { useCategories } from '@/hooks/useCategories';
import SignIn from '@/src/app/(screens)/(auth)/signin';
import SignUp from '@/src/app/(screens)/(auth)/signup';
import { Colors } from '@/src/constants/constant';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = Record<string, never>;

const Home = (props: Props) => {
    const router = useRouter();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isSignIn, setIsSignIn] = useState(true); // Start with sign in
    const [isAuthenticated] = useState(false); // Mock: user is unauthenticated
    const [searchQuery, setSearchQuery] = useState('');
    
    // Fetch categories
    const { data: categories, isLoading: categoriesLoading } = useCategories();
    
    // Map emoji icons to Ionicons
    const getIconFromEmoji = (emoji: string) => {
        const iconMap: { [key: string]: string } = {
            '🎨': 'color-palette-outline',
            '🚗': 'car-outline',
            '🍼': 'nutrition-outline',
            '💄': 'woman-outline',
            '📚': 'book-outline',
            '💻': 'laptop-outline',
            '👗': 'shirt-outline',
            '🍕': 'restaurant-outline',
            '🏠': 'home-outline',
            '📱': 'phone-portrait-outline',
            '🎵': 'musical-notes-outline',
            '⚽': 'football-outline',
        };
        return iconMap[emoji] || 'grid-outline';
    };
    
    // Mock video data - vertical aspect ratio like TikTok/YouTube Shorts
    const mockVideos = [
        { 
            id: '1', 
            title: 'Amazing Product Demo', 
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            thumbnail: 'https://via.placeholder.com/160x280', 
            duration: '1:30' 
        },
        { 
            id: '2', 
            title: 'Tech Review 2024', 
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            thumbnail: 'https://via.placeholder.com/160x280', 
            duration: '1:45' 
        },
        { 
            id: '3', 
            title: 'Unboxing Experience', 
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
            thumbnail: 'https://via.placeholder.com/160x280', 
            duration: '2:00' 
        },
        { 
            id: '4', 
            title: 'How to Use Guide', 
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            thumbnail: 'https://via.placeholder.com/160x280', 
            duration: '1:20' 
        },
        { 
            id: '5', 
            title: 'Behind the Scenes', 
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
            thumbnail: 'https://via.placeholder.com/160x280', 
            duration: '1:50' 
        },
        { 
            id: '6', 
            title: 'Product Comparison', 
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            thumbnail: 'https://via.placeholder.com/160x280', 
            duration: '1:35' 
        },
        { 
            id: '7', 
            title: 'User Testimonials', 
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            thumbnail: 'https://via.placeholder.com/160x280', 
            duration: '1:40' 
        },
        { 
            id: '8', 
            title: 'Feature Spotlight', 
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
            thumbnail: 'https://via.placeholder.com/160x280', 
            duration: '1:55' 
        },
    ];

    // Mock listings data
    const mockListings = [
        {
            id: '1',
            title: 'iPhone 14 Pro Max',
            price: 'Kes 400,000',
            condition: 'New',
            rating: '10/10',
            location: 'Westlands, Nairobi',
            description: 'Brand new iPhone 14 Pro Max in Space Black. Still in original packaging with all accessories included.',
            views: 156,
            image: 'https://via.placeholder.com/200x140',
            isFavorite: false,
        },
        {
            id: '2',
            title: 'MacBook Pro M2',
            price: 'Kes 250,000',
            condition: 'Used',
            rating: '9/10',
            location: 'Kilimani, Nairobi',
            description: 'Excellent condition MacBook Pro M2. Perfect for developers and creative professionals.',
            views: 89,
            image: 'https://via.placeholder.com/200x140',
            isFavorite: true,
        },
        {
            id: '3',
            title: 'Samsung Galaxy S23',
            price: 'Kes 180,000',
            condition: 'New',
            rating: '10/10',
            location: 'Karen, Nairobi',
            description: 'Latest Samsung Galaxy S23 with amazing camera quality and fast performance.',
            views: 234,
            image: 'https://via.placeholder.com/200x140',
            isFavorite: false,
        },
        {
            id: '4',
            title: 'iPad Air 5th Gen',
            price: 'Kes 120,000',
            condition: 'Like New',
            rating: '9/10',
            location: 'Runda, Nairobi',
            description: 'iPad Air 5th generation in mint condition. Great for work and entertainment.',
            views: 67,
            image: 'https://via.placeholder.com/200x140',
            isFavorite: true,
        },
    ];
    
    const handleAccountPress = () => {
        if (isAuthenticated) {
            // Navigate to dashboard if authenticated
            // router.push('/(screens)/(dashboard)/');
        } else {
            // Show auth modal if not authenticated
            setShowAuthModal(true);
        }
    };
    
    const handleSignUpPress = () => {
        setIsSignIn(false);
    };
    
    const handleSignInPress = () => {
        setIsSignIn(true);
    };
    
    const closeAuthModal = () => {
        setShowAuthModal(false);
    };
    
    const handleVideoPress = (videoId: string) => {
        // Navigate to Discover page with video ID
        router.push(`/(tabs)/discover?videoId=${videoId}`);
    };

    const handleListingPress = (listingId: string) => {
        // Navigate to listing details page
        router.push(`/(screens)/listings/${listingId}`);
    };

    const handleListingFavoritePress = (listingId: string) => {
        // Handle favorite toggle - could be API call in real app
        console.log('Toggle favorite for listing:', listingId);
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            {/* Header with status bar background */}
            <SafeAreaView style={styles.header}>
                <View style={styles.headerContent}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Image 
                        source={require('@/assets/images/icon.png')} 
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
                
                {/* Right side icons */}
                <View style={styles.headerRight}>
                    {/* Notifications Badge */}
                    <NotificationBadge hasUnreadNotifications={true} />
                    
                    {/* Account Avatar */}
                    <TouchableOpacity style={styles.avatarContainer} onPress={handleAccountPress}>
                        <View style={styles.avatar}>
                            <Ionicons name="person-outline" size={20} color={Colors.white} />
                        </View>
                    </TouchableOpacity>
                </View>
                </View>
            </SafeAreaView>
            
            {/* Main Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search-outline" size={20} color={Colors.grey} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search Kikwetu"
                            placeholderTextColor={Colors.grey}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {/* Browse Categories Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Browse Categories</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {categoriesLoading ? (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Loading categories...</Text>
                        </View>
                    ) : (
                        <View style={styles.categoriesGrid}>
                            {categories?.slice(0, 8).map((category, index) => (
                                <TouchableOpacity key={category.id} style={styles.categoryItem}>
                                    <View style={styles.categoryIconContainer}>
                                        <Ionicons 
                                            name={getIconFromEmoji(category.icon || "") as any} 
                                            size={24} 
                                            color={Colors.primary} 
                                        />
                                    </View>
                                    <Text style={styles.categoryName}>{category.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* For You Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>For You</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>See More</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.videoScrollContent}
                    >
                        {mockVideos.map((video) => (
                            <VideoCard
                                key={video.id}
                                id={video.id}
                                title={video.title}
                                videoUrl={video.videoUrl}
                                thumbnail={video.thumbnail}
                                duration={video.duration}
                                onPress={handleVideoPress}
                            />
                        ))}
                    </ScrollView>
                </View>

                {/* Listings Near You Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Listings Near You</Text>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/listings')}>
                            <Text style={styles.seeAllText}>See More</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.listingsGrid}>
                        {mockListings.map((listing) => (
                            <ListingCard
                                key={listing.id}
                                id={listing.id}
                                title={listing.title}
                                price={listing.price}
                                condition={listing.condition}
                                rating={listing.rating}
                                location={listing.location}
                                image={listing.image}
                                description={listing.description}
                                views={listing.views}
                                isFavorite={listing.isFavorite}
                                onPress={handleListingPress}
                                onFavoritePress={handleListingFavoritePress}
                            />
                        ))}
                    </View>
                </View>

                {/* Bottom padding for better scrolling */}
                <View style={styles.bottomPadding} />
            </ScrollView>
            
            {/* Auth Modals */}
            <SignIn 
                visible={showAuthModal && isSignIn}
                onClose={closeAuthModal}
                onSwitchToSignUp={handleSignUpPress}
            />
            <SignUp 
                visible={showAuthModal && !isSignIn}
                onClose={closeAuthModal}
                onSwitchToSignIn={handleSignInPress}
            />
        </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        backgroundColor: Colors.primary,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        paddingTop: 0, // Ensure it goes to the very top
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    logoContainer: {
        height: 40,
        width: 40,
    },
    logo: {
        height: '100%',
        width: '100%',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatarContainer: {
        padding: 4,
    },
    avatar: {
        height: 32,
        width: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    content: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    // Search Bar Styles
    searchContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 25,
        paddingHorizontal: 16,
        paddingVertical: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: Colors.black,
    },
    // Section Styles
    section: {
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.black,
        paddingBottom: 10,
    },
    seeAllText: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '600',
    },
    // Categories Styles
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    loadingText: {
        fontSize: 14,
        color: Colors.grey,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryItem: {
        width: '22%',
        alignItems: 'center',
        marginBottom: 20,
    },
    categoryIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    categoryName: {
        fontSize: 12,
        color: Colors.black,
        textAlign: 'center',
        fontWeight: '500',
    },
    // Video Cards Styles
    videoScrollContent: {
        paddingRight: 16,
    },
    // Listings Grid Styles
    listingsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    bottomPadding: {
        paddingBottom: 100,
    },
});

export default Home;
