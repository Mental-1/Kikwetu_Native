import ListingCard from "@/components/ListingCard";
import LikeButton from "@/components/animated/LikeButton";
import CustomLoader from "@/components/ui/CustomLoader";
import { useCategories } from "@/hooks/useCategories";
import { Colors } from "@/src/constants/constant";
import { useSimilarListings } from "@/src/hooks/useApiListings";
import {
  useCheckIfSaved,
  useSaveListing,
  useUnsaveListing,
} from "@/src/hooks/useApiSavedListings";
import { useListingDetails } from "@/src/hooks/useListingDetails";
import { useProfileById } from "@/src/hooks/useProfile";
import { ApiListing } from "@/src/types/api.types";
import { openDirections } from "@/src/utils/directionUtils";
import { createAlertHelpers, useCustomAlert } from "@/utils/alertUtils";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { lazy, Suspense, useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_HEIGHT = 370;

const LazyContactSellerModal = lazy(() =>
  import("@/components/ContactSellerModal")
);
const LazyWriteReviewModal = lazy(() =>
  import("@/components/WriteReviewModal")
);
const LazyReportListingModal = lazy(() =>
  import("@/components/ReportListingModal")
);
const LazyContextMenu = lazy(() => import("@/components/ui/ContextMenu"));

interface SpecItemProps {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

const SpecItem = ({ iconName, label, value }: SpecItemProps) => (
  <View style={styles.specItem}>
    <View style={styles.specIconLabel}>
      <Ionicons name={iconName} size={18} color={Colors.grey} />
      <Text style={styles.specLabel}>{label}</Text>
    </View>
    <Text style={styles.specValue} numberOfLines={1}>{value || "None"}</Text>
  </View>
);

// Placeholder for a detailed Specification structure (needs to be adjusted based on actual listing data)
const SpecificationsCard = ({ listing }: { listing: ApiListing }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const specs = useMemo(() => [
    {
      label: "Year",
      value: listing.attributes?.year?.toString() || "N/A",
      icon: "calendar-outline",
    },
    {
      label: "Mileage",
      value: listing.attributes?.mileage
        ? `${listing.attributes.mileage.toLocaleString()} km`
        : "N/A",
      icon: "speedometer-outline",
    },
    {
      label: "Transmission",
      value: listing.attributes?.transmission || "Automatic",
      icon: "settings-outline",
    },
    {
      label: "Color",
      value: listing.attributes?.color || "Not Specified",
      icon: "color-palette-outline",
    },
    {
      label: "Bedrooms",
      value: listing.attributes?.bedrooms?.toString() || "N/A",
      icon: "bed-outline",
    },
  ], [listing]);

  const visibleSpecs = specs.slice(0, 6);
  const hiddenSpecs = specs.slice(6);
  const shouldTruncate = specs.length > 6;

  const specsToRender = isExpanded ? specs : visibleSpecs;

  return (
    <View style={styles.specsContainer}>
      <Text style={styles.sectionTitle}>Specifications</Text>
      <View style={styles.specsCard}>
        <View style={styles.specsGrid}>
          {specsToRender.map((spec, index) => (
            <View key={index} style={styles.specWrapper}>
              <SpecItem
                iconName={spec.icon as keyof typeof Ionicons.glyphMap}
                label={spec.label}
                value={spec.value}
              />
            </View>
          ))}
        </View>
        {shouldTruncate && (
          <TouchableOpacity
            style={styles.expandSpecsButton}
            onPress={() => setIsExpanded(!isExpanded)}
          >
            <Text style={styles.expandSpecsText}>
              {isExpanded ? "Hide" : "See More"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// --- Sticky Bottom Bar ---

const StickyBottomBar = ({
  handleContactSeller,
  handleGetDirections,
  isLoadingDirections,
}: {
  handleContactSeller: () => void;
  handleGetDirections: () => Promise<void>;
  isLoadingDirections: boolean;
}) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
      <TouchableOpacity
        style={styles.bottomContactButton}
        onPress={handleContactSeller}
        activeOpacity={0.7}
      >
        <Ionicons name="chatbubble-outline" size={18} color={Colors.white} />
        <Text style={styles.bottomContactButtonText}>Contact Seller</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.bottomDirectionsButton}
        onPress={handleGetDirections}
        disabled={isLoadingDirections}
        activeOpacity={0.7}
      >
        {isLoadingDirections
          ? <ActivityIndicator size="small" color={Colors.primary} />
          : (
            <Ionicons
              name="navigate-outline"
              size={20}
              color={Colors.primary}
            />
          )}
      </TouchableOpacity>
    </View>
  );
};

// --- Main Component ---

export default function ListingDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: listing, isLoading, error } = useListingDetails(id || "");
  const { data: categories } = useCategories();
  const { data: sellerInfo } = useProfileById(listing?.user_id || "");
  const { data: relatedListings = [], isLoading: relatedLoading } =
    useSimilarListings(id || "", 8);
  const { data: savedStatus } = useCheckIfSaved(id || "");
  const saveListing = useSaveListing();
  const unsaveListing = useUnsaveListing();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isLoadingDirections, setIsLoadingDirections] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [showSafetyTips, setShowSafetyTips] = useState(false);

  const { showAlert, AlertComponent } = useCustomAlert();
  const { success: showSuccessAlert, error: showErrorAlert } =
    createAlertHelpers(showAlert);
  const insets = useSafeAreaInsets();

  const images = useMemo(
    () =>
      listing?.images?.length
        ? listing.images
        : ["https://via.placeholder.com/400x300"],
    [listing?.images],
  );
  const price = useMemo(
    () =>
      listing?.price
        ? `KES ${listing.price.toLocaleString()}`
        : "Price not set",
    [listing?.price],
  );
  const isSaved = useMemo(() => savedStatus?.isSaved || false, [
    savedStatus?.isSaved,
  ]);
  const listingStatus = listing?.is_available ? "Available" : "Sold";

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentImageIndex(viewableItems[0].index);
      }
    },
    [],
  );
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleFavorite = useCallback(async () => {
    if (!id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      if (savedStatus?.isSaved) {
        await unsaveListing.mutateAsync(id);
      } else {
        await saveListing.mutateAsync({ listingId: id });
      }
    } catch (error) {
      showErrorAlert("Error", "Failed to update saved status.");
    }
  }, [
    id,
    savedStatus?.isSaved,
    unsaveListing,
    saveListing,
    showSuccessAlert,
    showErrorAlert,
  ]);

  const handleShare = useCallback(async () => {
    if (!listing) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const shareUrl = `https://ki-kwetu.com/listings/${listing.id}`;
      const shareMessage =
        `Check out this ${listing.title} for KES ${listing.price?.toLocaleString()} on Kikwetu! ${shareUrl}`;
      await Share.share({
        message: shareMessage,
        url: shareUrl,
        title: listing.title,
      });
    } catch (error) {
      // User cancelled share
    }
  }, [listing]);

  const handleContactSeller = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowContactModal(true);
  }, []);

  const handleViewProfile = useCallback(() => {
    if (listing?.user_id) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(`/(screens)/(profile)/profile?id=${listing.user_id}`);
    }
  }, [listing?.user_id, router]);

  const handleReportListing = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setContextMenuVisible(false);
    setShowReportModal(true);
  }, []);

  const handleReportSubmit = useCallback((reason: string) => {
    console.log("Report submitted:", { listingId: listing?.id, reason });
    showSuccessAlert(
      "Listing Reported",
      "Thank you for reporting this listing. We will review it shortly.",
    );
  }, [listing?.id, showSuccessAlert]);

  const handleMarkUnavailable = useCallback(() => {
    // Placeholder logic for marking listing as unavailable
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setContextMenuVisible(false);
    showAlert({
      title: "Mark as Sold/Unavailable?",
      message:
        `Are you sure you want to mark "${listing?.title}" as unavailable?`,
      buttons: [
        { text: "Cancel", color: Colors.grey },
        {
          text: "Mark Unavailable",
          color: Colors.red,
          onPress: () => {
            console.log("Listing marked unavailable:", listing?.id);
            // Implement mutation here
            showSuccessAlert(
              "Status Updated",
              "Listing has been marked as unavailable.",
            );
          },
        },
      ],
      icon: "alert-circle-outline",
      iconColor: Colors.red,
    });
  }, [listing?.title, listing?.id, showAlert, showSuccessAlert]);

  const contextMenuItems = useMemo(() => [
    {
      id: "report",
      title: "Report Listing",
      icon: "flag-outline",
      destructive: true,
    },
    {
      id: "mark_unavailable",
      title: "Mark Unavailable",
      icon: "remove-circle-outline",
      color: Colors.grey,
    },
  ], []);

  const handleContextMenuItemPress = useCallback((item: any) => {
    switch (item.id) {
      case "report":
        handleReportListing();
        break;
      case "mark_unavailable":
        handleMarkUnavailable();
        break;
    }
  }, [handleReportListing, handleMarkUnavailable]);

  const handleGetDirections = useCallback(async () => {
    if (listing?.latitude && listing?.longitude) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsLoadingDirections(true);
      try {
        await openDirections(
          { latitude: listing.latitude, longitude: listing.longitude },
          listing.title,
        );
      } catch (error) {
        showAlert({
          title: "Unable to Open Directions",
          message: error instanceof Error
            ? error.message
            : "Please check your location permissions.",
          buttons: [{ text: "OK", color: "#FF9800" }],
          icon: "alert-circle-outline",
          iconColor: "#FF9800",
        });
      } finally {
        setIsLoadingDirections(false);
      }
    }
  }, [listing, showAlert]);

  const renderImageItem = useCallback(
    ({ item }: { item: string }) => (
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item }}
          style={styles.mainImage}
          contentFit="cover"
          cachePolicy="memory-disk"
          recyclingKey={item}
        />
      </View>
    ),
    [],
  );

  const renderImageDots = useMemo(() => (
    <View style={styles.imageDotsContainer}>
      {images.map((_, index) => (
        <View
          key={index}
          style={[
            styles.imageDot,
            index === currentImageIndex ? styles.activeDot : styles.inactiveDot,
          ]}
        />
      ))}
    </View>
  ), [images, currentImageIndex]);

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
          {error?.message || "Listing not found"}
        </Text>
        <Pressable style={styles.retryButton} onPress={handleBack}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={true}
        // Add padding to ensure content scrolls above the sticky bar
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        {/* Image Section*/}
        <View style={styles.imageSection}>
          <FlashList
            data={images}
            renderItem={renderImageItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            keyExtractor={(_, index) => index.toString()}
          />
          {/* Image Dots */}
          {renderImageDots}
          {/* Image Counter */}
          <View style={styles.imageCounterContainer}>
            <Text style={styles.imageCounter}>
              {currentImageIndex + 1}/{images.length}
            </Text>
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          {/* Title and Like Button Row */}
          <View style={styles.titleRow}>
            <Text style={styles.productTitle}>{listing.title}</Text>
            <LikeButton
              isLiked={isSaved}
              onPress={handleFavorite}
              iconColor={Colors.black}
            />
          </View>

          {/* Location and Views Row */}
          <View style={styles.locationViewsRow}>
            <View style={styles.locationContainer}>
              <Ionicons
                name="location-outline"
                size={14}
                color={Colors.grey}
              />
              <Text style={styles.locationText} numberOfLines={1}>
                {listing.location || "Location not specified"}
              </Text>
            </View>
            <Text style={styles.dotSeparator}>•</Text>
            <View style={styles.viewsContainer}>
              <Ionicons name="eye-outline" size={14} color={Colors.grey} />
              <Text style={styles.viewsText}>{listing.views || 0} views</Text>
            </View>
          </View>

          {/* Price Row */}
          <View style={styles.priceRow}>
            <Text style={styles.currentPrice}>{price}</Text>
          </View>

          {/* Badges */}
          <View style={styles.badgesContainer}>
            {/* Category Badge (Black) */}
            <View style={styles.badgeBlack}>
              <Text style={styles.badgeText}>
                {listing.category_id
                  ? categories?.find((cat) => cat.id === listing.category_id)
                    ?.name || "Category"
                  : "Category"}
              </Text>
            </View>
            {/* Condition Badge (Black) */}
            <View style={styles.badgeBlack}>
              <Text style={styles.badgeText}>
                {listing.condition || "Condition"}
              </Text>
            </View>
            {/* Status Badge */}
            <View
              style={[
                styles.badge,
                listing.is_available ? styles.badgeAvailable : styles.badgeSold,
                { marginLeft: "auto" },
              ]}
            >
              <Text style={styles.badgeText}>{listingStatus}</Text>
            </View>
          </View>

          {/* Specifications Card */}
          <SpecificationsCard listing={listing} />

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <View style={styles.descriptionCard}>
              <Text
                style={styles.description}
                numberOfLines={isDescriptionExpanded ? undefined : 3}
              >
                {listing.description || "No description available"}
              </Text>
              {listing.description && listing.description.length > 150 && (
                <TouchableOpacity
                  style={styles.readMoreButton}
                  onPress={() =>
                    setIsDescriptionExpanded(!isDescriptionExpanded)}
                >
                  <Text style={styles.readMoreText}>
                    {isDescriptionExpanded ? "Read Less" : "Read More"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Seller Info */}
          <Pressable style={styles.sellerInfo} onPress={handleViewProfile}>
            <View style={styles.sellerMain}>
              <Image
                source={{
                  uri: sellerInfo?.avatar_url ||
                    "https://via.placeholder.com/50x50",
                }}
                style={styles.sellerAvatar}
                contentFit="cover"
              />
              <View style={styles.sellerContent}>
                <View style={styles.sellerTopRow}>
                  <View style={styles.nameBadgeRow}>
                    <Text style={styles.sellerName} numberOfLines={1}>
                      {sellerInfo?.full_name || sellerInfo?.username ||
                        "Seller"}
                    </Text>
                    <View style={styles.verifiedBadge}>
                      <Ionicons
                        name="checkmark"
                        size={10}
                        color={Colors.white}
                      />
                    </View>
                  </View>
                  <View style={styles.viewAllAds}>
                    <Text style={styles.viewAllAdsText}>View all ads</Text>
                    <Ionicons
                      name="chevron-forward-outline"
                      size={14}
                      color={Colors.primary}
                    />
                  </View>
                </View>

                <View style={styles.sellerBottomRow}>
                  <View style={styles.infoPill}>
                    <Text style={styles.pillText}>Joined 2022</Text>
                  </View>
                  <View style={styles.infoPill}>
                    <Text style={styles.pillText}>
                      Replies within an hour
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </Pressable>

          {/* Safety Tips */}
          <Pressable
            style={styles.safetyTips}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowSafetyTips(!showSafetyTips);
            }}
          >
            <View style={styles.safetyHeader}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={Colors.primary}
              />
              <Text style={styles.safetyTitle}>Safety Tips</Text>
              <Ionicons
                name={showSafetyTips ? "chevron-up" : "chevron-down"}
                size={20}
                color={Colors.grey}
                style={styles.safetyChevron}
              />
            </View>
            {/* ... Safety tips text remains the same ... */}
            {showSafetyTips && (
              <Text style={styles.safetyText}>
                • Meet in a public place for transactions{"\n"}
                • Inspect the item before payment{"\n"}
                • Use secure payment methods{"\n"}
                • Trust your instincts - if something feels off, walk away{"\n"}
                • Keep all communication within the app
              </Text>
            )}
          </Pressable>

          {/* Related Listings */}
          <View style={styles.relatedListings}>
            <View style={styles.relatedHeader}>
              <Text style={styles.relatedTitle}>Related Listings</Text>
              {relatedListings.length > 0 && (
                <Pressable onPress={() => router.push("/(tabs)/listings")}>
                  <Text style={styles.seeAllText}>See All</Text>
                </Pressable>
              )}
            </View>
            {!relatedLoading && relatedListings.length > 0 && (
              <View style={styles.relatedGrid}>
                {relatedListings.map((item) => (
                  <View key={item.id} style={styles.relatedCardWrapper}>
                    <ListingCard
                      id={item.id}
                      title={item.title || "Untitled"}
                      price={item.price
                        ? `KES ${item.price.toLocaleString()}`
                        : "Price not set"}
                      condition={item.condition || "Used"}
                      location={item.location || "Location not specified"}
                      image={item.images?.[0] ||
                        "https://via.placeholder.com/200"}
                      description={item.description}
                      views={item.views}
                      viewMode="grid"
                      onPress={(id) =>
                        router.push(`/listings/${id}`)}
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Header Buttons */}
      <SafeAreaView style={styles.overlayHeader} edges={["top"]}>
        <Pressable style={styles.overlayButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.black} />
        </Pressable>
        <View style={styles.overlayRightButtons}>
          <Pressable style={styles.overlayButton} onPress={handleShare}>
            <Ionicons
              name="share-social-outline"
              size={24}
              color={Colors.black}
            />
          </Pressable>
          <Pressable
            style={styles.overlayButton}
            onPress={() => setContextMenuVisible(true)}
          >
            <Ionicons
              name="ellipsis-vertical-outline"
              size={24}
              color={Colors.black}
            />
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Sticky Bottom Bar */}
      <StickyBottomBar
        handleContactSeller={handleContactSeller}
        handleGetDirections={handleGetDirections}
        isLoadingDirections={isLoadingDirections}
      />

      {/* Modals */}
      {showContactModal && (
        <Suspense fallback={<View />}>
          <LazyContactSellerModal
            visible={showContactModal}
            onClose={() => setShowContactModal(false)}
            seller={{
              name: sellerInfo?.full_name || sellerInfo?.username || "Seller",
              phone: sellerInfo?.phone_number || "",
              email: sellerInfo?.email || "",
              whatsapp: sellerInfo?.phone_number || "",
            }}
            listingTitle={listing.title}
          />
        </Suspense>
      )}
      {showReportModal && (
        <Suspense fallback={<View />}>
          <LazyReportListingModal
            visible={showReportModal}
            onClose={() => setShowReportModal(false)}
            onSubmit={handleReportSubmit}
          />
        </Suspense>
      )}
      {/* Context Menu */}
      {contextMenuVisible && (
        <Suspense fallback={<View />}>
          <LazyContextMenu
            visible={contextMenuVisible}
            onClose={() => setContextMenuVisible(false)}
            items={contextMenuItems}
            onItemPress={handleContextMenuItemPress}
            position={{ x: SCREEN_WIDTH, y: insets.top + 55 }}
          />
        </Suspense>
      )}
      <AlertComponent />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  // --- Header Overlay Styles ---
  overlayHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10,
  },
  overlayRightButtons: {
    flexDirection: "row",
    gap: 8,
  },
  overlayButton: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  // --- Image Section Styles ---
  imageSection: {
    position: "relative",
    height: IMAGE_HEIGHT,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  imageDotsContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    zIndex: 10,
  },
  imageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.white,
  },
  inactiveDot: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  imageCounterContainer: {
    position: "absolute",
    bottom: 40,
    right: 16,
    zIndex: 10,
  },
  imageCounter: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    overflow: "hidden",
  },
  // --- Product Info Styles ---
  productInfo: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: Colors.white,
    marginTop: -24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  productTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: "900",
    color: Colors.black,
    lineHeight: 30,
    marginRight: 16,
  },
  locationViewsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  dotSeparator: {
    color: Colors.grey,
    marginHorizontal: 6,
    fontSize: 12,
  },
  priceRow: {
    marginBottom: 16,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.primary,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    maxWidth: "60%",
  },
  locationText: {
    fontSize: 12,
    color: Colors.grey,
  },
  viewsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewsText: {
    fontSize: 12,
    color: Colors.grey,
  },
  badgesContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  badgeBlack: {
    backgroundColor: Colors.black,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeAvailable: {
    backgroundColor: Colors.green,
  },
  badgeSold: {
    backgroundColor: Colors.red,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.lightgrey,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  // --- Specifications Card Styles ---
  specsContainer: {
    marginVertical: 12,
  },
  specsCard: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#F0F8FF",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  specWrapper: {
    width: "33.33%",
    marginBottom: 16,
    paddingRight: 8,
  },
  specItem: {},
  specIconLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  specLabel: {
    fontSize: 12,
    color: Colors.grey,
  },
  specValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.black,
    marginLeft: 0,
  },
  expandSpecsButton: {
    marginTop: 8,
    alignSelf: "flex-end",
  },
  expandSpecsText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  // --- Description Styles ---
  descriptionContainer: {
    marginVertical: 12,
  },
  descriptionCard: {
    padding: 16,
    backgroundColor: "#F0F8FF",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  description: {
    fontSize: 16,
    color: Colors.black,
    lineHeight: 24,
    marginBottom: 8,
  },
  readMoreButton: {
    alignSelf: "flex-end",
    marginTop: 4,
  },
  readMoreText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  sellerInfo: {
    backgroundColor: "#F0F8FF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    marginHorizontal: 4,
  },
  sellerMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sellerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  sellerContent: {
    flex: 1,
    gap: 4,
  },
  sellerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nameBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.black,
  },
  verifiedBadge: {
    backgroundColor: Colors.green,
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
  },
  viewAllAds: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewAllAdsText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "600",
  },
  sellerBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoPill: {
    backgroundColor: "#4A4A4A",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pillText: {
    fontSize: 10,
    color: Colors.white,
    fontWeight: "500",
  },
  safetyTips: {
    backgroundColor: "#F0F8FF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E6F3FF",
    marginHorizontal: 4,
  },
  safetyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  safetyChevron: {
    marginLeft: "auto",
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: "bold",
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
    marginBottom: 20,
  },
  relatedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.black,
  },
  relatedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 4,
  },
  relatedCardWrapper: {
    width: (SCREEN_WIDTH - 52) / 2,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.lightgrey,
    gap: 12,
    zIndex: 5,
  },
  bottomContactButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    gap: 6,
    minHeight: 44,
  },
  bottomContactButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  bottomDirectionsButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 8,
    minHeight: 44,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: 16,
    color: Colors.grey,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
