import ListingCard from '@/components/ListingCard';
import { useCategories } from '@/hooks/useCategories';
import { Colors } from '@/src/constants/constant';
import { useSimilarListings } from '@/src/hooks/useApiListings';
import { useCheckIfSaved, useSaveListing, useUnsaveListing } from '@/src/hooks/useApiSavedListings';
import { useListingDetails } from '@/src/hooks/useListingDetails';
import { useProfileById } from '@/src/hooks/useProfile';
import { openDirections } from '@/src/utils/directionUtils';
import { createAlertHelpers, useCustomAlert } from '@/utils/alertUtils';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { lazy, Suspense, useCallback, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomLoader from '@/components/ui/CustomLoader';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LazyContactSellerModal = lazy(() => import('@/components/ContactSellerModal'));
const LazyWriteReviewModal = lazy(() => import('@/components/WriteReviewModal'));
const LazyReportListingModal = lazy(() => import('@/components/ReportListingModal'));

/**
 * Main listing details screen component
 * Displays comprehensive product information, seller details, and related listings
 * with optimized gesture handling and performance
 */
export default function ListingDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const { data: listing, isLoading, error } = useListingDetails(id || '');
  const { data: categories } = useCategories();
  const { data: sellerInfo, isLoading: sellerLoading } = useProfileById(listing?.user_id || '');
  const { data: relatedListings = [], isLoading: relatedLoading, error: relatedError } = useSimilarListings(id || '', 8);
  
  // Saved listings functionality
  const { data: savedStatus } = useCheckIfSaved(id || '');
  const saveListing = useSaveListing();
  const unsaveListing = useUnsaveListing();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showSafetyTips, setShowSafetyTips] = useState(false);
  const [isLoadingDirections, setIsLoadingDirections] = useState(false);
  
  const wiggleAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  
  const { showAlert, AlertComponent } = useCustomAlert();
  const { success: showSuccessAlert } = createAlertHelpers(showAlert);

  // Reanimated values for image carousel
  const translateX = useSharedValue(0);
  const imageOffset = useSharedValue(0);

  /**
   * Memoized images array with fallback
   */
  const images = useMemo(() => 
    listing?.images?.length ? listing.images : ['https://via.placeholder.com/400x300'], 
    [listing?.images]
  );
  
  /**
   * Memoized formatted price
   */
  const price = useMemo(() => 
    listing?.price ? `KES ${listing.price.toLocaleString()}` : 'Price not set',
    [listing?.price]
  );

  /**
   * Memoized saved status
   */
  const isSaved = useMemo(() => 
    savedStatus?.isSaved || false,
    [savedStatus?.isSaved]
  );

  /**
   * Preload adjacent images for smoother transitions
   */
  const preloadAdjacentImages = useCallback((index: number) => {
    const nextIndex = (index + 1) % images.length;
    const prevIndex = (index - 1 + images.length) % images.length;
    
    if (images[nextIndex]) {
      Image.prefetch(images[nextIndex]);
    }
    if (images[prevIndex]) {
      Image.prefetch(images[prevIndex]);
    }
  }, [images]);

  /**
   * Changes the current image with animation and haptic feedback
   */
  const changeImage = useCallback((newIndex: number) => {
    if (newIndex === currentImageIndex) return;
    
    setCurrentImageIndex(newIndex);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    preloadAdjacentImages(newIndex);
  }, [currentImageIndex, preloadAdjacentImages]);

  /**
   * Pan gesture for horizontal image swiping
   * Properly constrained to prevent conflict with vertical ScrollView
   */
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onStart(() => {
      imageOffset.value = translateX.value;
    })
    .onUpdate((event) => {
      translateX.value = imageOffset.value + event.translationX;
    })
    .onEnd((event) => {
      const threshold = SCREEN_WIDTH * 0.3;
      const velocity = event.velocityX;

      if (event.translationX < -threshold || velocity < -500) {
        // Swipe left - next image
        const nextIndex = (currentImageIndex + 1) % images.length;
        translateX.value = withTiming(-SCREEN_WIDTH, {
          duration: 250,
        }, () => {
          scheduleOnRN(() => changeImage(nextIndex));
          translateX.value = 0;
        });
      } else if (event.translationX > threshold || velocity > 500) {
        // Swipe right - previous image
        const prevIndex = (currentImageIndex - 1 + images.length) % images.length;
        translateX.value = withTiming(SCREEN_WIDTH, {
          duration: 250,
        }, () => {
          scheduleOnRN(() => changeImage(prevIndex));
          translateX.value = 0;
        });
      } else {
        // Return to center
        translateX.value = withTiming(0, { duration: 200 });
      }
    });

  /**
   * Animated style for image carousel
   */
  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  /**
   * Navigates back to previous screen
   */
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  /**
   * Toggles favorite status with optimistic UI update
   */
  const handleFavorite = useCallback(async () => {
    if (!id) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      if (savedStatus?.isSaved) {
        await unsaveListing.mutateAsync(id);
        showSuccessAlert('Removed from Saved', 'Listing removed from your saved items');
      } else {
        await saveListing.mutateAsync({ listingId: id });
        showSuccessAlert('Saved!', 'Listing added to your saved items');
      }
    } catch (error) {
      showAlert({
        title: 'Error',
        message: 'Failed to update saved status. Please try again.',
        buttons: [{ text: 'OK', color: Colors.red }],
        icon: 'alert-circle-outline',
        iconColor: Colors.red,
      });
    }
  }, [id, savedStatus?.isSaved, unsaveListing, saveListing, showSuccessAlert, showAlert]);

  /**
   * Shares the listing via native share sheet
   */
  const handleShare = useCallback(async () => {
    if (!listing) {
      showAlert({
        title: 'Share Unavailable',
        message: 'Listing details are not available for sharing.',
        buttons: [{ text: 'OK', color: '#F44336' }],
        icon: 'alert-circle-outline',
        iconColor: '#F44336',
      });
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      const shareUrl = `https://ki-kwetu.com/listings/${listing.id}`;
      const shareMessage = `Check out this ${listing.title} for KES ${listing.price?.toLocaleString()} on Kikwetu! ${shareUrl}`;

      await Share.share({
        message: shareMessage,
        url: shareUrl,
        title: listing.title,
      });
    } catch (error) {
      // User cancelled share - no need to show error
    }
  }, [listing, showAlert]);

  /**
   * Opens contact seller modal
   */
  const handleContactSeller = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowContactModal(true);
  }, []);

  /**
   * Toggles follow status with wiggle animation
   */
  const handleFollow = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsFollowing(!isFollowing);
    
    // Wiggle animation
    Animated.sequence([
      Animated.timing(wiggleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(wiggleAnim, {
        toValue: -1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(wiggleAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFollowing, wiggleAnim]);

  /**
   * Navigates to seller profile
   */
  const handleViewProfile = useCallback(() => {
    if (listing?.user_id) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(`/(screens)/(profile)/profile?id=${listing.user_id}`);
    }
  }, [listing?.user_id, router]);

  /**
   * Opens report listing modal
   */
  const handleReportListing = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowReportModal(true);
  }, []);

  /**
   * Handles report submission
   */
  const handleReportSubmit = useCallback((reason: string) => {
    console.log('Report submitted:', { listingId: listing?.id, reason });
    showSuccessAlert('Listing Reported', 'Thank you for reporting this listing. We will review it shortly.');
  }, [listing?.id, showSuccessAlert]);

  /**
   * Opens directions to listing location
   */
  const handleGetDirections = useCallback(async () => {
    if (listing?.latitude && listing?.longitude) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsLoadingDirections(true);
      
      try {
        await openDirections(
          { latitude: listing.latitude, longitude: listing.longitude },
          listing.title
        );
      } catch (error) {
        showAlert({
          title: 'Unable to Open Directions',
          message: error instanceof Error ? error.message : 'Please check your location permissions.',
          buttons: [{ text: 'OK', color: '#FF9800' }],
          icon: 'alert-circle-outline',
          iconColor: '#FF9800',
        });
      } finally {
        setIsLoadingDirections(false);
      }
    }
  }, [listing, showAlert]);

  /**
   * Renders star rating display
   */
  const renderStars = useCallback((rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={16} color="#FFD700" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={16} color="#FFD700" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={16} color="#FFD700" />
      );
    }

    return stars;
  }, []);

  /**
   * Handles navigation to listing from related items
   */
  const handleRelatedListingPress = useCallback((listingId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/listings/${listingId}`);
  }, [router]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <CustomLoader />
        <Text style={styles.loadingText}>Loading listing details...</Text>
      </View>
    );
  }

  if (error || !listing) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.grey} />
        <Text style={styles.errorText}>
          {error?.message || 'Listing not found'}
        </Text>
        <Pressable 
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.retryButtonPressed
          ]} 
          onPress={handleBack}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Image Carousel with Gesture Support */}
        <View style={styles.imageSection}>
          <GestureDetector gesture={panGesture}>
            <Reanimated.View style={[styles.imageContainer, animatedImageStyle]}>
              <Image 
                source={{ uri: images[currentImageIndex] }} 
                style={styles.mainImage}
                contentFit="cover"
                priority="high"
                cachePolicy="memory-disk"
                recyclingKey={`listing-${id}-${currentImageIndex}`}
                transition={200}
              /> 
            </Reanimated.View>
          </GestureDetector>
          
          {/* Image Indicators with Better Spacing */}
          {images.length > 1 && (
            <View style={styles.imageIndicators}>
              <View style={styles.dotsContainer}>
                {images.map((_, index) => (
                  <Pressable
                    key={index}
                    onPress={() => changeImage(index)}
                    hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
                  >
                    <View 
                      style={[
                        styles.dot, 
                        index === currentImageIndex && styles.activeDot
                      ]} 
                    />
                  </Pressable>
                ))}
              </View>
            </View>
          )}
          
          {/* Image Counter */}
          <View style={styles.imageCounterContainer}>
            <Text style={styles.imageCounter}>
              {currentImageIndex + 1}/{images.length}
            </Text>
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
         
          {/* Title */}
          <Text style={styles.productTitle}>{listing.title}</Text>

           {/* Rating, Location, and Views */}
           <View style={styles.ratingContainer}>
            <View style={styles.ratingLeft}>
              <View style={styles.starsContainer}>
                {renderStars(sellerInfo?.rating || 0)}
              </View>
              <Text style={styles.ratingText}>
                {sellerInfo?.rating?.toFixed(1) || '0.0'} (0)
              </Text>
            </View>
            <View style={styles.ratingRight}>
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={16} color={Colors.grey} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {listing.location || 'Location not specified'}
                </Text>
              </View>
              <View style={styles.viewsContainer}>
                <Ionicons name="eye-outline" size={16} color={Colors.grey} />
                <Text style={styles.viewsText}>{listing.views || 0} views</Text>
              </View>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>{price}</Text>
            <Pressable 
              style={({ pressed }) => [
                styles.favoriteButton,
                pressed && styles.favoriteButtonPressed
              ]}
              onPress={handleFavorite}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons 
                name={isSaved ? "heart" : "heart-outline"} 
                size={24} 
                color={isSaved ? "#FF0000" : Colors.grey} 
              />
            </Pressable>
          </View>

          {/* Category and Condition Badges */}
          <View style={styles.badgesContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {listing.category_id 
                  ? categories?.find(cat => cat.id === listing.category_id)?.name || 'Category'
                  : 'Category'}
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{listing.condition || 'Condition'}</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.description}>{listing.description || 'No description available'}</Text>

          {/* Seller Info */}
          <View style={styles.sellerInfo}>
            <View style={styles.sellerHeader}>
              <Text style={styles.sellerTitle}>Seller Information</Text>
            </View>
            <View style={styles.sellerDetails}>
              <View style={styles.sellerMain}>
                <Image 
                  source={{ uri: sellerInfo?.avatar_url || 'https://via.placeholder.com/50x50' }} 
                  style={styles.sellerAvatar}
                  contentFit="cover"
                />
                <View style={styles.sellerStats}>
                  <View style={styles.sellerTopRow}>
                    <View style={styles.sellerLeft}>
                      <Text style={styles.sellerName} numberOfLines={1}>
                        {sellerInfo?.full_name || sellerInfo?.username || 'Seller'}
                      </Text>
                      <View style={styles.sellerRating}>
                        <Ionicons name="star" size={16} color="#FFD700" />
                        <Text style={styles.sellerRatingText}>
                          {sellerInfo?.rating?.toFixed(1) || '0.0'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.sellerRight}>
                      <Text style={styles.sellerStatsText}>Active seller</Text>
                      <Text style={styles.sellerStatsText}>Verified</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            
            {/* Action Buttons */}
            <View style={styles.sellerActions}>
              <Animated.View 
                style={[{
                  flex: 1,
                  transform: [{
                    rotate: wiggleAnim.interpolate({
                      inputRange: [-1, 1],
                      outputRange: ['-5deg', '5deg'],
                    }),
                  }],
                }]}
              >
                <Pressable 
                  style={({ pressed }) => [
                    styles.actionButton,
                    isFollowing ? styles.followingButton : styles.followButtonStyle,
                    pressed && styles.actionButtonPressed
                  ]}
                  onPress={handleFollow}
                >
                  <Ionicons 
                    name={isFollowing ? "checkmark" : "person-add"} 
                    size={16} 
                    color={isFollowing ? Colors.white : Colors.primary} 
                  />
                  <Text style={[
                    isFollowing ? styles.followingButtonText : styles.followButtonText
                  ]}>
                    {isFollowing ? "Following" : "Follow"}
                  </Text>
                </Pressable>
              </Animated.View>
              
              <Pressable 
                style={({ pressed }) => [
                  styles.actionButton, 
                  styles.viewProfileButton,
                  pressed && styles.actionButtonPressed
                ]}
                onPress={handleViewProfile}
              >
                <Ionicons name="person" size={16} color={Colors.white} />
                <Text style={styles.viewProfileButtonText}>View Profile</Text>
              </Pressable>
            </View>
          </View>

          {/* Review Input Section */}
          <View style={styles.reviewSection}>
            <Text style={styles.reviewTitle}>Leave a Review</Text>
            <Text style={styles.reviewSubtitle}>Share your experience with this seller</Text>
            <Pressable 
              style={({ pressed }) => [
                styles.reviewButton,
                pressed && styles.reviewButtonPressed
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowReviewModal(true);
              }}
            >
              <Text style={styles.reviewButtonText}>Write Review</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
            </Pressable>
          </View>

          {/* Report Listing */}
          <Pressable 
            style={({ pressed }) => [
              styles.reportButton,
              pressed && styles.reportButtonPressed
            ]} 
            onPress={handleReportListing}
          >
            <Ionicons name="flag-outline" size={20} color={Colors.red} />
            <Text style={styles.reportButtonText}>Report this listing</Text>
          </Pressable>

          {/* Collapsible Safety Tips */}
          <Pressable
            style={styles.safetyTips}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowSafetyTips(!showSafetyTips);
            }}
          >
            <View style={styles.safetyHeader}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} />
              <Text style={styles.safetyTitle}>Safety Tips</Text>
              <Ionicons 
                name={showSafetyTips ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={Colors.grey}
                style={styles.safetyChevron}
              />
            </View>
            {showSafetyTips && (
              <Text style={styles.safetyText}>
                • Meet in a public place for transactions{'\n'}
                • Inspect the item before payment{'\n'}
                • Use secure payment methods{'\n'}
                • Trust your instincts - if something feels off, walk away{'\n'}
                • Keep all communication within the app
              </Text>
            )}
          </Pressable>

          {/* Related Listings - Fixed 2-column Grid */}
          <View style={styles.relatedListings}>
            <View style={styles.relatedHeader}>
              <Text style={styles.relatedTitle}>Related Listings</Text>
              {relatedListings.length > 0 && (
                <Pressable onPress={() => router.push('/(tabs)/listings')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </Pressable>
              )}
            </View>
            {relatedLoading ? (
              <View style={styles.relatedEmptyState}>
                <CustomLoader />
                <Text style={styles.relatedEmptyText}>Loading related listings...</Text>
              </View>
            ) : relatedError ? (
              <View style={styles.relatedEmptyState}>
                <Ionicons name="alert-circle-outline" size={48} color={Colors.grey} />
                <Text style={styles.relatedEmptyText}>Couldn&apos;t fetch related listings</Text>
              </View>
            ) : relatedListings.length === 0 ? (
              <View style={styles.relatedEmptyState}>
                <Ionicons name="cube-outline" size={48} color={Colors.grey} />
                <Text style={styles.relatedEmptyText}>No related listings</Text>
              </View>
            ) : (
              <View style={styles.relatedGrid}>
                {relatedListings.map((item) => (
                  <View key={item.id} style={styles.relatedCardWrapper}>
                    <ListingCard
                      id={item.id}
                      title={item.title || 'Untitled'}
                      price={item.price ? `KES ${item.price.toLocaleString()}` : 'Price not set'}
                      condition={item.condition || 'Used'}
                      location={item.location || 'Location not specified'}
                      image={item.images?.[0] || 'https://via.placeholder.com/200'}
                      description={item.description}
                      views={item.views}
                      viewMode="grid"
                      onPress={handleRelatedListingPress}
                    />
                  </View>
                ))}
              </View>
            )}
          </View>

        </View>
      </ScrollView>

      {/* Header Buttons */}
      <SafeAreaView style={styles.overlayHeader} edges={['top']}>
        <Pressable 
          style={({ pressed }) => [
            styles.overlayButton,
            pressed && styles.overlayButtonPressed
          ]} 
          onPress={handleBack}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.black} />
        </Pressable>
        <Pressable 
          style={({ pressed }) => [
            styles.overlayButton,
            pressed && styles.overlayButtonPressed
          ]} 
          onPress={handleShare}
        >
          <Ionicons name="share-social-outline" size={24} color={Colors.black} />
        </Pressable>
      </SafeAreaView>

      {/* Bottom Action Bar */}
      <SafeAreaView style={styles.bottomBarContainer} edges={['bottom']}>
        <View style={styles.bottomBar}>
          <Pressable 
            style={({ pressed }) => [
              styles.directionsButton,
              pressed && styles.directionsButtonPressed,
              isLoadingDirections && styles.directionsButtonLoading
            ]}
            onPress={handleGetDirections}
            disabled={isLoadingDirections}
          >
            {isLoadingDirections ? (
              <CustomLoader size="small" />
            ) : (
              <>
                <Ionicons name="navigate-outline" size={20} color={Colors.primary} />
                <Text style={styles.directionsButtonText}>Get Directions</Text>
              </>
            )}
          </Pressable>
          <Pressable 
            style={({ pressed }) => [
              styles.contactButton,
              pressed && styles.contactButtonPressed
            ]}
            onPress={handleContactSeller}
          >
            <Ionicons name="chatbubble-outline" size={20} color={Colors.white} />
            <Text style={styles.contactButtonText}>Contact Seller</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Contact Seller Modal - Lazy Loaded */}
      {showContactModal && (
        <Suspense fallback={<View />}>
          <LazyContactSellerModal
            visible={showContactModal}
            onClose={() => setShowContactModal(false)}
            seller={{
              name: sellerInfo?.full_name || sellerInfo?.username || 'Seller',
              phone: sellerInfo?.phone_number || '', 
              email: sellerInfo?.email || '', 
              whatsapp: sellerInfo?.phone_number || ''
            }}
            listingTitle={listing.title}
          />
        </Suspense>
      )}

      {/* Write Review Modal - Lazy Loaded */}
      {showReviewModal && (
        <Suspense fallback={<View />}>
          <LazyWriteReviewModal
            visible={showReviewModal}
            onClose={() => setShowReviewModal(false)}
            listingTitle={listing.title}
          />
        </Suspense>
      )}

      {/* Report Listing Modal - Lazy Loaded */}
      {showReportModal && (
        <Suspense fallback={<View />}>
          <LazyReportListingModal
            visible={showReportModal}
            onClose={() => setShowReportModal(false)}
            onSubmit={handleReportSubmit}
          />
        </Suspense>
      )}

      {/* Custom Alert */}
      <AlertComponent />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  overlayHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 1,
  },
  overlayButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overlayButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  content: {
    flex: 1,
  },
  imageSection: {
    position: 'relative',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: 370,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 28,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  dot: {
    width: 18,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeDot: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  imageCounterContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  imageCounter: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  productInfo: {
    padding: 16,
    backgroundColor: Colors.white,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ratingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
    justifyContent: 'flex-end',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: Colors.grey,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 12,
    lineHeight: 32,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginRight: 8,
  },
  favoriteButton: {
    marginLeft: 'auto',
    padding: 8,
  },
  favoriteButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.9 }],
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    backgroundColor: Colors.black,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: Colors.black,
    lineHeight: 24,
    marginBottom: 24,
  },
  sellerInfo: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.lightgrey,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sellerHeader: {
    marginBottom: 12,
  },
  sellerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.black,
  },
  sellerDetails: {
    gap: 4,
  },
  sellerMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  sellerStats: {
    flex: 1,
  },
  sellerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sellerLeft: {
    flex: 1,
    gap: 4,
  },
  sellerRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
  },
  sellerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sellerRatingText: {
    fontSize: 14,
    color: Colors.grey,
  },
  sellerStatsText: {
    fontSize: 12,
    color: Colors.grey,
  },
  sellerActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonPressed: {
    opacity: 0.8,
  },
  followButtonStyle: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  followingButton: {
    backgroundColor: Colors.primary,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  followButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  followingButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  viewProfileButton: {
    backgroundColor: Colors.primary,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  viewProfileButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: 120,
  },
  locationText: {
    fontSize: 12,
    color: Colors.grey,
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewsText: {
    fontSize: 12,
    color: Colors.grey,
  },
  reviewSection: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.lightgrey,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 4,
  },
  reviewSubtitle: {
    fontSize: 14,
    color: Colors.grey,
    marginBottom: 12,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  reviewButtonPressed: {
    opacity: 0.7,
  },
  reviewButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.red,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  reportButtonPressed: {
    opacity: 0.7,
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
  },
  reportButtonText: {
    fontSize: 14,
    color: Colors.red,
    fontWeight: '600',
  },
  safetyTips: {
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E6F3FF',
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  safetyChevron: {
    marginLeft: 'auto',
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.black,
  },
  safetyText: {
    fontSize: 14,
    color: Colors.grey,
    lineHeight: 22,
    marginTop: 12,
  },
  relatedListings: {
    marginTop: 8,
    marginBottom: 100,
  },
  relatedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
  },
  relatedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  relatedCardWrapper: {
    width: (SCREEN_WIDTH - 48) / 2,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  relatedEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 16,
  },
  relatedEmptyText: {
    fontSize: 14,
    color: Colors.grey,
    marginTop: 12,
    textAlign: 'center',
  },
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
  },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.lightgrey,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Colors.white,
  },
  directionsButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    minHeight: 48,
  },
  directionsButtonPressed: {
    opacity: 0.7,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
  },
  directionsButtonLoading: {
    opacity: 0.6,
  },
  directionsButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  contactButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  contactButtonPressed: {
    opacity: 0.85,
  },
  contactButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.grey,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: 16,
    color: Colors.grey,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});