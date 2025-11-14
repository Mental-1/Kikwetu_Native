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
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const LazyContactSellerModal = lazy(() => import('@/components/ContactSellerModal'));
const LazyWriteReviewModal = lazy(() => import('@/components/WriteReviewModal'));
const LazyReportListingModal = lazy(() => import('@/components/ReportListingModal'));

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
  const wiggleAnim = useRef(new Animated.Value(0)).current;
  
  const { showAlert, AlertComponent } = useCustomAlert();
  const { success: showSuccessAlert } = createAlertHelpers(showAlert);

  const images = useMemo(() => 
    listing?.images?.length ? listing.images : ['https://via.placeholder.com/400x300'], 
    [listing?.images]
  );
  
  const price = useMemo(() => 
    listing?.price ? `KES ${listing.price.toLocaleString()}` : 'Price not set',
    [listing?.price]
  );

  const isSaved = useMemo(() => 
    savedStatus?.isSaved || false,
    [savedStatus?.isSaved]
  );

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleFavorite = useCallback(async () => {
    if (!id) return;
    
    try {
      if (savedStatus?.isSaved) {
        await unsaveListing.mutateAsync(id);
        showSuccessAlert('Removed from Saved', 'Listing removed from your saved items');
      } else {
        await saveListing.mutateAsync({ listingId: id });
        showSuccessAlert('Saved!', 'Listing added to your saved items');
      }
    } catch {
    }
  }, [id, savedStatus?.isSaved, unsaveListing, saveListing, showSuccessAlert]);

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
    
    try {
      const shareUrl = `https://ki-kwetu.com/listings/${listing.id}`;
      const shareMessage = `Check out this ${listing.title} for KES ${listing.price?.toLocaleString()} on Kikwetu! ${shareUrl}`;

      await Share.share({
        message: shareMessage,
        url: shareUrl,
        title: listing.title,
      });
    } catch {
      showAlert({
        title: 'Share Failed',
        message: 'Unable to share this listing. Please try again.',
        buttons: [{ text: 'OK', color: '#F44336' }],
        icon: 'alert-circle-outline',
        iconColor: '#F44336',
      });
    }
  }, [listing, showAlert]);

  const handleContactSeller = useCallback(() => {
    setShowContactModal(true);
  }, []);

  const handleFollow = useCallback(() => {
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

  const handleViewProfile = useCallback(() => {
    if (listing?.user_id) {
      router.push(`/(screens)/(profile)/profile?id=${listing.user_id}`);
    }
  }, [listing?.user_id, router]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading listing details...</Text>
      </View>
    );
  }

  if (error || !listing) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error?.message || 'Listing not found'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }


  const handleReportListing = () => {
    setShowReportModal(true);
  };

  const handleReportSubmit = (reason: string) => {
    console.log('Report submitted:', { listingId: listing.id, reason });
    showSuccessAlert('Listing Reported', 'Thank you for reporting this listing. We will review it shortly.');
  };


  const handleImageSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setCurrentImageIndex((prev) => 
        prev === images.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) => 
        prev === 0 ? images.length - 1 : prev - 1
      );
    }
  };

  const renderStars = (rating: number) => {
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
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View style={styles.imageSection}>
          <TouchableOpacity 
            style={styles.imageContainer}
            onPress={() => handleImageSwipe('left')}
            activeOpacity={0.8}
          >
            <Image 
              source={{ uri: images[currentImageIndex] }} 
              style={styles.mainImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
          
          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <TouchableOpacity 
                style={styles.navButtonLeft}
                onPress={() => handleImageSwipe('right')}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={24} color={Colors.white} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.navButtonRight}
                onPress={() => handleImageSwipe('left')}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-forward" size={24} color={Colors.white} />
              </TouchableOpacity>
            </>
          )}
          
          {/* Image Indicators */}
          <View style={styles.imageIndicators}>
            <View style={styles.dotsContainer}>
              {images.map((_, index) => (
                <View 
                  key={index}
                  style={[
                    styles.dot, 
                    index === currentImageIndex && styles.activeDot
                  ]} 
                />
              ))}
            </View>
          </View>
          
          {/* Image Counter */}
          <View style={styles.imageCounterContainer}>
            <Text style={styles.imageCounter}>
              {currentImageIndex + 1}/{images.length}
            </Text>
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
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
                <Text style={styles.locationText}>{listing.location || 'Location not specified'}</Text>
              </View>
              <View style={styles.viewsContainer}>
                <Ionicons name="eye-outline" size={16} color={Colors.grey} />
                <Text style={styles.viewsText}>{listing.views || 0} views</Text>
              </View>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.productTitle}>{listing.title}</Text>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>{price}</Text>
            <TouchableOpacity 
              style={styles.favoriteButton} 
              onPress={handleFavorite}
            >
              <Ionicons 
                name={isSaved ? "heart" : "heart-outline"} 
                size={24} 
                color={isSaved ? "#FF0000" : Colors.grey} 
              />
            </TouchableOpacity>
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
                />
                <View style={styles.sellerStats}>
                  <View style={styles.sellerTopRow}>
                    <View style={styles.sellerLeft}>
                      <Text style={styles.sellerName}>{sellerInfo?.full_name || sellerInfo?.username || 'Seller'}</Text>
                      <View style={styles.sellerRating}>
                        <Ionicons name="star" size={16} color="#FFD700" />
                        <Text style={styles.sellerRatingText}>{sellerInfo?.rating?.toFixed(1) || '0.0'}</Text>
                      </View>
                    </View>
                    <View style={styles.sellerRight}>
                      <Text style={styles.sellerStatsText}>
                        Active seller
                      </Text>
                      <Text style={styles.sellerStatsText}>
                        Verified
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            
            {/* Action Buttons */}
            <View style={styles.sellerActions}>
              <Animated.View 
                style={{
                  transform: [{
                    rotate: wiggleAnim.interpolate({
                      inputRange: [-1, 1],
                      outputRange: ['-5deg', '5deg'],
                    }),
                  }],
                }}
              >
                <TouchableOpacity 
                  style={[
                    styles.actionButton,
                    isFollowing ? styles.followingButton : styles.followButtonStyle
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
                </TouchableOpacity>
              </Animated.View>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.viewProfileButton]}
                onPress={handleViewProfile}
              >
                <Ionicons name="person" size={16} color={Colors.white} />
                <Text style={styles.viewProfileButtonText}>View Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Review Input Section */}
          <View style={styles.reviewSection}>
            <Text style={styles.reviewTitle}>Leave a Review</Text>
            <Text style={styles.reviewSubtitle}>Share your experience with this seller</Text>
            <TouchableOpacity 
              style={styles.reviewButton}
              onPress={() => setShowReviewModal(true)}
            >
              <Text style={styles.reviewButtonText}>Write Review</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Report Listing */}
          <TouchableOpacity style={styles.reportSection} onPress={handleReportListing} activeOpacity={0.7}>
            <View style={styles.reportButton}>
              <Ionicons name="flag-outline" size={20} color={Colors.grey} />
              <Text style={styles.reportButtonText}>Report this listing</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.grey} />
            </View>
          </TouchableOpacity>

          {/* Safety Tips */}
          <View style={styles.safetyTips}>
            <View style={styles.safetyHeader}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors.red} />
              <Text style={styles.safetyTitle}>Safety Tips</Text>
            </View>
            <Text style={styles.safetyText}>
              • Meet in a public place for transactions{'\n'}
              • Inspect the item before payment{'\n'}
              • Use secure payment methods{'\n'}
              • Trust your instincts - if something feels off, walk away{'\n'}
              • Keep all communication within the app
            </Text>
          </View>

          {/* Related Listings */}
          <View style={styles.relatedListings}>
            <View style={styles.relatedHeader}>
              <Text style={styles.relatedTitle}>Related Listings</Text>
              {relatedListings.length > 0 && (
                <TouchableOpacity onPress={() => router.push('/(tabs)/listings')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              )}
            </View>
            {relatedLoading ? (
              <View style={styles.relatedEmptyState}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.relatedEmptyText}>Loading related listings...</Text>
              </View>
            ) : relatedError ? (
              <View style={styles.relatedEmptyState}>
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
                  <ListingCard
                    key={item.id}
                    id={item.id}
                    title={item.title || 'Untitled'}
                    price={item.price ? `KES ${item.price.toLocaleString()}` : 'Price not set'}
                    condition={item.condition || 'Used'}
                    location={item.location || 'Location not specified'}
                    image={item.images?.[0] || 'https://via.placeholder.com/200'}
                    description={item.description}
                    views={item.views}
                    viewMode="grid"
                    onPress={(listingId) => router.push(`/listings/${listingId}`)}
                  />
                ))}
              </View>
            )}
          </View>

        </View>
      </ScrollView>

      {/* Header Buttons */}
      <SafeAreaView style={styles.overlayHeader} edges={['top']}>
        <TouchableOpacity style={styles.overlayButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.overlayButton} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={24} color={Colors.black} />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.directionsButton} 
          onPress={async () => {
            if (listing?.latitude && listing?.longitude) {
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
              }
            }
          }}
        >
          <Ionicons name="navigate-outline" size={20} color={Colors.primary} />
          <Text style={styles.directionsButtonText}>Get Directions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactButton} onPress={handleContactSeller}>
          <Ionicons name="chatbubble-outline" size={20} color={Colors.white} />
          <Text style={styles.contactButtonText}>Contact Seller</Text>
        </TouchableOpacity>
      </View>

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
    </View>
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
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  imageSection: {
    position: 'relative',
  },
  imageContainer: {
    width: width,
    height: 300,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 16,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeDot: {
    backgroundColor: Colors.primary,
  },
  imageCounterContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  imageCounter: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  navButtonLeft: {
    position: 'absolute',
    left: 16,
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonRight: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 16,
    backgroundColor: Colors.white,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 12,
    lineHeight: 28,
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
  discount: {
    fontSize: 14,
    color: Colors.primary,
    backgroundColor: Colors.lightgrey,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 16,
    color: Colors.grey,
    textDecorationLine: 'line-through',
    marginRight: 16,
  },
  favoriteButton: {
    marginLeft: 'auto',
    padding: 4,
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
    fontSize: 14,
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
  followButtonStyle: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  followingButton: {
    backgroundColor: Colors.primary,
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
  reviewButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  reportSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 0.5,
    borderTopColor: Colors.lightgrey,
    backgroundColor: Colors.white,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  reportButtonText: {
    fontSize: 14,
    color: Colors.grey,
    fontWeight: '400',
    marginLeft: 8,
    flex: 1,
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
    marginBottom: 12,
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.black,
  },
  safetyText: {
    fontSize: 14,
    color: Colors.grey,
    lineHeight: 20,
  },
  relatedListings: {
    marginTop: 8,
    marginBottom: 16,
  },
  relatedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
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
    paddingHorizontal: 16,
    justifyContent: 'space-between',
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
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    padding: 16,
    borderTopWidth: 0.4,
    borderTopColor: Colors.lightgrey,
    flexDirection: 'row',
    gap: 12,
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
    borderWidth: 1,
    borderColor: Colors.primary,
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
  },
  errorText: {
    fontSize: 16,
    color: Colors.grey,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
