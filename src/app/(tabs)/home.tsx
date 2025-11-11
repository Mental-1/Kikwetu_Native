import AvatarDropdown from '@/components/AvatarDropdown';
import ListingCard from '@/components/ListingCard';
import NotificationBadge from '@/components/NotificationBadge';
import CustomDialog from '@/components/ui/CustomDialog';
import VideoCard from '@/components/VideoCard';
import { useAuth } from '@/contexts/authContext';
import { useCategories, useCategoryMutations } from '@/hooks/useCategories';
import SignIn from '@/src/app/(screens)/(auth)/signin';
import SignUp from '@/src/app/(screens)/(auth)/signup';
import { Colors, getCategoryImage } from '@/src/constants/constant';
import { useSaveListing, useUnsaveListing } from '@/src/hooks/useApiSavedListings';
import { useListings } from '@/src/hooks/useListings';
import { useNotifications } from '@/src/hooks/useNotifications';
import { useFeaturedVideos } from '@/src/hooks/useVideos';
import { useAppStore } from '@/stores/useAppStore';
import { showSuccessToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


type Props = Record<string, never>;


const Home = (props: Props) => {
    const router = useRouter();
    const { user, signOut } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);
    const [isSignIn, setIsSignIn] = useState(true);
    const { searchQuery, setSearchQuery } = useAppStore();
    const [loadingCategoryId, setLoadingCategoryId] = useState<number | null>(null);

    
    
    const [showSignOutDialog, setShowSignOutDialog] = useState(false);
    
    const { data: categories, isLoading: categoriesLoading } = useCategories();
    const { prefetchSubcategories } = useCategoryMutations();
    
    const { data: featuredVideos, isLoading: videosLoading } = useFeaturedVideos(8);
    const { data: listingsData, isLoading: listingsLoading } = useListings();
    const { notifications, markAllAsRead } = useNotifications();
    
    const saveListingMutation = useSaveListing();
    const unsaveListingMutation = useUnsaveListing();
    const [favoriteStates, setFavoriteStates] = useState<Record<string, boolean>>({});
    
    const listings = listingsData?.pages?.flatMap(page => page.data) || [];
    const displayListings = listings.slice(0, 4);
    
    const handleAccountPress = useCallback(() => {
        if (user) {
            setShowAvatarDropdown(true);
        } else {
            setIsSignIn(true);
            setShowAuthModal(true);
        }
    }, [user]);
    
    const handleSignUpPress = useCallback(() => {
        setIsSignIn(false);
    }, []);
    
    const handleSignInPress = useCallback(() => {
        setIsSignIn(true);
    }, []);
    
    const closeAuthModal = useCallback(() => {
        setShowAuthModal(false);
    }, []);

    const handleDashboard = useCallback(() => {
        setShowAvatarDropdown(false);
        router.push('/(screens)/(dashboard)');
    }, [router]);

    const handleSignOut = useCallback(() => {
        setShowAvatarDropdown(false);
        setShowSignOutDialog(true);
    }, []);

    const handleConfirmSignOut = useCallback(async () => {
        try {
            const { error } = await signOut();
            setShowSignOutDialog(false);
            if (error) {
                console.error('Sign out error:', error);
            } else {
                showSuccessToast('Successfully signed out!', 'Goodbye');
            }
        } catch (error) {
            console.error('Sign out error:', error);
            setShowSignOutDialog(false);
        }
    }, [signOut]);

    const handleCancelSignOut = useCallback(() => {
        setShowSignOutDialog(false);
    }, []);

    const handleSearchSubmit = () => {
        if (searchQuery) {
            router.push('/(tabs)/listings');
        }
    };
    
    const handleVideoPress = useCallback((videoId: string) => {
        router.push(`/(tabs)/discover?videoId=${videoId}`);
    }, [router]);

    const handleListingPress = useCallback((listingId: string) => {
        router.push(`/(screens)/listings/${listingId}`);
    }, [router]);

    const handleListingFavoritePress = useCallback(async (listingId: string) => {
        const isCurrentlyFavorite = favoriteStates[listingId];
        
        try {
            if (isCurrentlyFavorite) {
                await unsaveListingMutation.mutateAsync(listingId);
                setFavoriteStates(prev => ({ ...prev, [listingId]: false }));
                showSuccessToast('Removed from favorites');
            } else {
                await saveListingMutation.mutateAsync({ listingId });
                setFavoriteStates(prev => ({ ...prev, [listingId]: true }));
                showSuccessToast('Added to favorites');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    }, [favoriteStates, saveListingMutation, unsaveListingMutation]);

    React.useEffect(() => {
        if (categories && categories.length > 0) {
            prefetchSubcategories();
        }
    }, [categories, prefetchSubcategories]);

    const handleCategoryPress = useCallback((categoryId: number) => {
        setLoadingCategoryId(categoryId);
        requestAnimationFrame(() => {
            router.push(`/(screens)/subcategories/${categoryId}`);
            setTimeout(() => setLoadingCategoryId(null), 1000);
        });
    }, [router]);

    const categoryRows = useMemo(() => {
        if (!categories || categories.length === 0) return [];
        
        const rows: typeof categories[] = [];
        const categoriesPerRow = 4;
        
        for (let i = 0; i < categories.length; i += categoriesPerRow) {
            rows.push(categories.slice(i, i + categoriesPerRow));
        }
        
        return rows;
    }, [categories]);

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            {/* Header with status bar background */}
            <SafeAreaView style={styles.header} edges={['top']}>
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
                    <NotificationBadge notifications={notifications} onMarkAllAsRead={markAllAsRead} />
                    
                    {/* Account Avatar */}
                    <TouchableOpacity style={styles.avatarContainer} onPress={handleAccountPress}>
                        <View style={[styles.avatar, user && styles.authenticatedAvatar]}>
                            {user ? (
                                <Text style={styles.avatarText}>
                                    {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                                </Text>
                            ) : (
                                <Ionicons name="person-outline" size={20} color={Colors.white} />
                            )}
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
                            onSubmitEditing={handleSearchSubmit}
                            returnKeyType="search"
                        />
                    </View>
                </View>

                {/* Browse Categories Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Explore Our Categories</Text>
                    </View>
                    
                    {categoriesLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                            <Text style={styles.loadingText}>Loading categories...</Text>
                        </View>
                    ) : (
                        <View style={styles.categoriesGrid}>
                            {categoryRows.map((row, rowIndex) => (
                                <View key={rowIndex} style={styles.categoryRow}>
                                    {row.map((category) => (
                                        <TouchableOpacity 
                                            key={category.id} 
                                            style={[
                                                styles.categoryItem,
                                                loadingCategoryId === category.id && styles.categoryItemLoading
                                            ]}
                                            onPress={() => handleCategoryPress(category.id)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.categoryImageContainer}>
                                                {loadingCategoryId === category.id ? (
                                                    <ActivityIndicator size="small" color={Colors.primary} />
                                                ) : (
                                                    <Image 
                                                        source={getCategoryImage(category.name)}
                                                        style={styles.categoryImage}
                                                        resizeMode="cover"
                                                    />
                                                )}
                                            </View>
                                            <Text style={styles.categoryName} numberOfLines={2}>
                                                {category.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* For You Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>See It In Action: For You</Text>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/discover')}>
                            <Text style={styles.seeAllText}>See More</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {videosLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={Colors.primary} />
                            <Text style={styles.loadingText}>Loading videos...</Text>
                        </View>
                    ) : (
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.videoScrollContent}
                        >
                            {featuredVideos?.map((video) => (
                                <VideoCard
                                    key={video.id}
                                    id={video.id}
                                    title={video.title}
                                    videoUrl={video.videoUrl}
                                    thumbnail={video.thumbnail}
                                    duration={video.duration?.toString()}
                                    onPress={handleVideoPress}
                                />
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* Listings Near You Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Listings Near You</Text>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/listings')}>
                            <Text style={styles.seeAllText}>See More</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {listingsLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={Colors.primary} />
                            <Text style={styles.loadingText}>Loading listings...</Text>
                        </View>
                    ) : (
                        <View style={styles.listingsGrid}>
                            {displayListings.map((listing) => (
                                <ListingCard
                                    key={listing.id}
                                    id={listing.id}
                                    title={listing.title}
                                    price={`Kes ${listing.price?.toLocaleString() || '0'}`}
                                    condition={listing.condition || 'Unknown'}
                                    location={listing.location || 'Unknown'}
                                    image={listing.images?.[0] || 'https://via.placeholder.com/200x140'}
                                    description={listing.description}
                                    views={listing.views || 0}
                                    isFavorite={favoriteStates[listing.id] || false}
                                    viewMode="grid"
                                    onPress={handleListingPress}
                                    onFavoritePress={handleListingFavoritePress}
                                />
                            ))}
                        </View>
                    )}
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

            {/* Avatar Dropdown */}
            <AvatarDropdown
                visible={showAvatarDropdown}
                onClose={() => setShowAvatarDropdown(false)}
                onDashboard={handleDashboard}
                onSignOut={handleSignOut}
                userName={user?.full_name}
                userEmail={user?.email}
            />

            {/* Sign Out Confirmation Dialog */}
            <CustomDialog
                visible={showSignOutDialog}
                title="Sign Out"
                message="Are you sure you want to sign out?"
                confirmText="Sign Out"
                denyText="Cancel"
                onConfirm={handleConfirmSignOut}
                onDeny={handleCancelSignOut}
                icon="log-out-outline"
                iconColor={Colors.red}
                confirmColor={Colors.red}
                denyColor={Colors.grey}
                confirmWeight="600"
                denyWeight="400"
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
        paddingTop: 0,
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
    authenticatedAvatar: {
        backgroundColor: Colors.green,
        borderColor: Colors.green,
    },
    avatarText: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: 'bold',
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
        justifyContent: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        fontSize: 14,
        color: Colors.grey,
        marginTop: 12,
    },
    categoriesGrid: {
        paddingRight: 16,
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingHorizontal: 0,
    },
    categoryItem: {
        width: '20%',
        alignItems: 'center',
    },
    categoryImageContainer: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 999,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        overflow: 'hidden',
    },
    categoryImage: {
        width: '100%',
        height: '100%',
    },
    categoryName: {
        fontSize: 10,
        color: Colors.black,
        textAlign: 'center',
        fontWeight: '500',
        lineHeight: 12,
    },
    categoryItemLoading: {
        opacity: 0.7,
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
