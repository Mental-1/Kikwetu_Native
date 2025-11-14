import AvatarDropdown from '@/components/AvatarDropdown';
import ListingCard from '@/components/ListingCard';
import NotificationBadge from '@/components/NotificationBadge';
import CustomDialog from '@/components/ui/CustomDialog';
import VideoCard from '@/components/VideoCard';
import { useAuth } from '@/contexts/authContext';
import { useCategories, useCategoryMutations } from '@/hooks/useCategories';
import ForgotPasswordScreen from '@/src/app/(screens)/(auth)/forgot-password';
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
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ActiveModal = 'none' | 'signOutDialog';

type Props = Record<string, never>;

const Home = (props: Props) => {
    const router = useRouter();
    const { user, signOut } = useAuth();
    const [activeModal, setActiveModal] = useState<ActiveModal>('none');
    const { searchQuery, setSearchQuery } = useAppStore();
    const [loadingCategoryId, setLoadingCategoryId] = useState<number | null>(null);

    const signInRef = useRef<BottomSheetModal>(null);
    const signUpRef = useRef<BottomSheetModal>(null);
    const forgotPasswordRef = useRef<BottomSheetModal>(null);
    const avatarDropdownRef = useRef<BottomSheetModal>(null);

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
            avatarDropdownRef.current?.present();
        } else {
            signInRef.current?.present();
        }
    }, [user]);

    const handleDashboard = useCallback(() => {
        avatarDropdownRef.current?.dismiss();
        router.push('/(screens)/(dashboard)');
    }, [router]);

    const handleSignOut = useCallback(() => {
        avatarDropdownRef.current?.dismiss();
        setActiveModal('signOutDialog');
    }, []);

    const handleConfirmSignOut = useCallback(async () => {
        try {
            const { error } = await signOut();
            setActiveModal('none');
            if (error) {
                console.error('Sign out error:', error);
            } else {
                showSuccessToast('Successfully signed out!', 'Goodbye');
            }
        } catch (error) {
            console.error('Sign out error:', error);
            setActiveModal('none');
        }
    }, [signOut]);

    const handleSwitchToSignUp = () => {
        signInRef.current?.dismiss();
        signUpRef.current?.present();
    };

    const handleSwitchToSignIn = () => {
        signUpRef.current?.dismiss();
        forgotPasswordRef.current?.dismiss();
        signInRef.current?.present();
    };

    const handleSwitchToForgotPassword = () => {
        signInRef.current?.dismiss();
        forgotPasswordRef.current?.present();
    };

    const handleCloseAuth = () => {
        signInRef.current?.dismiss();
        signUpRef.current?.dismiss();
        forgotPasswordRef.current?.dismiss();
    };

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

    useEffect(() => {
        if (categories && categories.length > 0) {
            prefetchSubcategories();
        }
    }, [categories, prefetchSubcategories]);

    const handleCategoryPress = useCallback((categoryId: number) => {
        setLoadingCategoryId(categoryId);
        router.push(`/(screens)/subcategories/${categoryId}`);
    }, [router]);

    useEffect(() => {
      let timer: ReturnType<typeof setTimeout>;
      if (loadingCategoryId !== null) {
        timer = setTimeout(() => {
          setLoadingCategoryId(null);
        }, 1000);
      }
      return () => {
        if (timer) {
          clearTimeout(timer);
        }
      };
    }, [loadingCategoryId]);

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
        <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
            <StatusBar style="light" />
            {/* Header with status bar background */}
            <View style={styles.header}>
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
                    <Pressable style={({ pressed }) => [styles.avatarContainer, { opacity: pressed ? 0.7 : 1 }]} onPress={handleAccountPress}>
                        <View style={[styles.avatar, user && styles.authenticatedAvatar]}>
                            {user ? (
                                <Text style={styles.avatarText}>
                                    {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                                </Text>
                            ) : (
                                <Ionicons name="person-outline" size={20} color={Colors.white} />
                            )}
                        </View>
                    </Pressable>
                </View>
                </View>
            </View>
            
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
                                        <Pressable 
                                            key={category.id} 
                                            style={({ pressed }) => [
                                                styles.categoryItem,
                                                loadingCategoryId === category.id && styles.categoryItemLoading,
                                                { opacity: pressed ? 0.7 : 1 },
                                            ]}
                                            onPress={() => handleCategoryPress(category.id)}
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
                                        </Pressable>
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
                        <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })} onPress={() => router.push('/(tabs)/discover')}>
                            <Text style={styles.seeAllText}>See More</Text>
                        </Pressable>
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
                        <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })} onPress={() => router.push('/(tabs)/listings')}>
                            <Text style={styles.seeAllText}>See More</Text>
                        </Pressable>
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
                ref={signInRef}
                onClose={handleCloseAuth}
                onSwitchToSignUp={handleSwitchToSignUp}
                onSwitchToForgotPassword={handleSwitchToForgotPassword}
            />
            <SignUp
                ref={signUpRef}
                onClose={handleCloseAuth}
                onSwitchToSignIn={handleSwitchToSignIn}
            />
            <ForgotPasswordScreen
                ref={forgotPasswordRef}
                onClose={handleCloseAuth}
                onSwitchToSignIn={handleSwitchToSignIn}
            />

            {/* Avatar Dropdown */}
            <AvatarDropdown
                ref={avatarDropdownRef}
                onClose={() => avatarDropdownRef.current?.dismiss()}
                onDashboard={handleDashboard}
                onSignOut={handleSignOut}
                userName={user?.full_name}
                userEmail={user?.email}
            />

            {/* Sign Out Confirmation Dialog */}
            <CustomDialog
                visible={activeModal === 'signOutDialog'}
                title="Sign Out"
                message="Are you sure you want to sign out?"
                confirmText="Sign Out"
                denyText="Cancel"
                onConfirm={handleConfirmSignOut}
                onDeny={() => setActiveModal('none')}
                icon="log-out-outline"
                iconColor={Colors.red}
                confirmColor={Colors.red}
                denyColor={Colors.grey}
                confirmWeight="600"
                denyWeight="400"
            />
        </SafeAreaView>
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
