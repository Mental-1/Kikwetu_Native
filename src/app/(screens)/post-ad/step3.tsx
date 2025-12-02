import BottomSheetModal, {
  BottomSheetModalRef,
} from "@/components/BottomSheetModal";
import BottomSheetScrollView from "@/components/BottomSheetScrollView";
import PlanUsageCard from "@/components/PlanUsageCard";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/src/constants/constant";
import { useCreateListing, useSaveDraft } from "@/src/hooks/useListings";
import { useMediaUpload } from "@/src/hooks/useMediaUpload";
import { validateCompleteListing } from "@/src/utils/listingValidation";
import { getUserPlan, useAppStore } from "@/stores/useAppStore";
import { showErrorToast, showSuccessToast } from "@/utils/toast";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Step3() {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentUploadItem, setCurrentUploadItem] = useState<string>("");

  const bottomSheetRef = useRef<BottomSheetModalRef>(null);
  const { uploadMedia } = useMediaUpload();

  const userPlan = getUserPlan();

  const postAd = useAppStore((state) => state.postAd);
  const {
    title,
    description,
    price,
    location,
    condition,
    categoryId,
    subcategoryId,
    tags,
    images,
    videos,
    isNegotiable,
    latitude,
    longitude,
    storeId,
    isDraft,
    resetForm,
  } = postAd;

  const createListingMutation = useCreateListing();
  const saveDraftMutation = useSaveDraft();

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const publishListing = useCallback(async () => {
    const validationData = {
      title,
      description,
      price: price || 0,
      category_id: categoryId || 0,
      subcategory_id: subcategoryId,
      condition,
      location,
      latitude,
      longitude,
      negotiable: isNegotiable || false,
      images,
      videos: videos || [],
      tags: tags || [],
      store_id: storeId,
      isDraft: false,
    };

    const validation = validateCompleteListing(validationData);
    if (!validation.success) {
      const firstError = Object.values(validation.errors || {})[0];
      showErrorToast(firstError || "Please check your listing details");
      return;
    }

    try {
      setIsPublishing(true);
      setUploadProgress(0);

      const uploadedImageIds: string[] = [];
      const totalFiles = images.length + videos.length;
      let completedFiles = 0;

      for (let i = 0; i < images.length; i++) {
        setCurrentUploadItem(`Uploading image ${i + 1} of ${images.length}...`);
        const mediaId = await uploadMedia(
          { uri: images[i], type: "image" },
          (progress: number) => {
            const currentFileContribution = progress / 100;
            const overallProgress =
              ((completedFiles + currentFileContribution) / totalFiles) * 100;
            setUploadProgress(overallProgress);
          },
        );
        if (mediaId) {
          uploadedImageIds.push(mediaId);
        }
        completedFiles++;
      }

      const uploadedVideoIds: string[] = [];
      for (let i = 0; i < videos.length; i++) {
        setCurrentUploadItem(`Uploading video ${i + 1} of ${videos.length}...`);
        const mediaId = await uploadMedia(
          { uri: videos[i], type: "video" },
          (progress: number) => {
            const currentFileContribution = progress / 100;
            const overallProgress =
              ((completedFiles + currentFileContribution) / totalFiles) * 100;
            setUploadProgress(overallProgress);
          },
        );
        if (mediaId) {
          uploadedVideoIds.push(mediaId);
        }
        completedFiles++;
      }

      setCurrentUploadItem("Finalizing listing...");

      await createListingMutation.mutateAsync({
        listingData: {
          title: validation.data!.title!,
          description: validation.data!.description!,
          price: validation.data!.price!,
          category_id: validation.data!.category_id!,
          subcategory_id: validation.data!.subcategory_id,
          condition: validation.data!.condition!,
          location: validation.data!.location!,
          latitude: validation.data!.latitude!,
          longitude: validation.data!.longitude!,
          negotiable: validation.data!.negotiable!,
          images: uploadedImageIds,
          videos: uploadedVideoIds,
          tags: validation.data!.tags!,
          store_id: storeId,
          isDraft: false,
          status: "pending",
        },
      });

      setIsSuccess(true);
      showSuccessToast(
        "Your ad has been published successfully!",
        "Success",
      );
      setTimeout(() => {
        resetForm();
        router.push("/(screens)/(dashboard)/mylistings");
      }, 1500);
    } catch (error: any) {
      console.error("Error publishing listing:", error);
      showErrorToast(
        error.message || "Failed to publish listing. Please try again.",
      );
    } finally {
      setIsPublishing(false);
      setUploadProgress(0);
      setCurrentUploadItem("");
    }
  }, [
    title,
    description,
    price,
    location,
    condition,
    categoryId,
    subcategoryId,
    tags,
    images,
    videos,
    isNegotiable,
    latitude,
    longitude,
    storeId,
    createListingMutation,
    router,
    resetForm,
    uploadMedia,
  ]);

  const handlePublish = useCallback(() => {
    if (userPlan.usedListings >= userPlan.maxListings) {
      bottomSheetRef.current?.present();
      return;
    }

    Alert.alert(
      "Publish Your Ad",
      "Are you sure you want to publish this listing?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Publish Ad",
          onPress: publishListing,
        },
      ],
    );
  }, [publishListing, userPlan]);

  const handleSaveDraft = useCallback(async () => {
    const listingData = {
      title,
      description,
      price: price || 0,
      category_id: categoryId || 0,
      subcategory_id: subcategoryId,
      condition,
      location,
      latitude,
      longitude,
      negotiable: isNegotiable || false,
      images,
      videos: videos || [],
      tags: tags || [],
      store_id: storeId,
      isDraft: true,
    };

    const validation = validateCompleteListing(listingData);
    if (!validation.success) {
      const firstError = Object.values(validation.errors || {})[0];
      showErrorToast(firstError || "Please check your listing details");
      return;
    }

    Alert.alert(
      "Save as Draft",
      "Your listing will be saved as a draft. You can continue editing and publish it later.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save Draft",
          onPress: async () => {
            try {
              setIsSavingDraft(true);

              await saveDraftMutation.mutateAsync({
                ...validation.data,
                store_id: validation.data!.store_id
                  ? String(validation.data!.store_id)
                  : undefined,
                isDraft: true,
              });

              showSuccessToast(
                "Your listing has been saved as a draft!",
                "Draft Saved",
              );
              resetForm();
              router.push("/(tabs)/listings");
            } catch (error: any) {
              console.error("Error saving draft:", error);
              showErrorToast(
                error.message || "Failed to save draft. Please try again.",
              );
            } finally {
              setIsSavingDraft(false);
            }
          },
        },
      ],
    );
  }, [
    title,
    description,
    price,
    categoryId,
    subcategoryId,
    condition,
    location,
    latitude,
    longitude,
    isNegotiable,
    images,
    videos,
    tags,
    storeId,
    saveDraftMutation,
    router,
    resetForm,
  ]);

  const renderImageItem = useCallback(
    ({ item }: { item: string }) => (
      <View style={styles.mediaItem}>
        <Image source={{ uri: item }} style={styles.mediaImage} />
      </View>
    ),
    [],
  );

  const renderVideoItem = useCallback(
    ({ item, index }: { item: string; index: number }) => (
      <View style={styles.mediaItem}>
        <View style={styles.videoPlaceholder}>
          <Ionicons name="play-circle" size={40} color={Colors.primary} />
          <Text style={styles.videoText}>Video {index + 1}</Text>
        </View>
      </View>
    ),
    [],
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/* Header */}
      <SafeAreaView style={styles.header} edges={["top"]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Publish Ad - Preview</Text>
        <View style={styles.placeholder} />
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Preview Title */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preview Your Listing</Text>
          <Text style={styles.sectionDescription}>
            Review all the details before publishing your ad or saving as draft
          </Text>
        </View>

        {/* Listing Card Preview */}
        <View style={styles.listingCard}>
          {/* Media Preview */}
          {images.length > 0 && (
            <View style={styles.mediaSection}>
              <Text style={styles.mediaTitle}>Images ({images.length})</Text>
              <FlatList
                data={images.slice(0, 3)}
                renderItem={renderImageItem}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.mediaList}
              />
              {images.length > 3 && (
                <Text style={styles.moreMediaText}>
                  +{images.length - 3} more images
                </Text>
              )}
            </View>
          )}

          {videos.length > 0 && (
            <View style={styles.mediaSection}>
              <Text style={styles.mediaTitle}>Videos ({videos.length})</Text>
              <FlatList
                data={videos}
                renderItem={renderVideoItem}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.mediaList}
              />
            </View>
          )}

          {/* Listing Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.listingTitle}>{title}</Text>
            <Text style={styles.listingPrice}>
              Kes {price?.toLocaleString()}
            </Text>
            <Text style={styles.listingDescription}>{description}</Text>

            <View style={styles.listingMeta}>
              <View style={styles.metaItem}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={Colors.grey}
                />
                <Text style={styles.metaText}>{location}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={16}
                  color={Colors.grey}
                />
                <Text style={styles.metaText}>{condition}</Text>
              </View>
            </View>

            {/* Tags */}
            {tags.length > 0 && (
              <View style={styles.tagsSection}>
                <Text style={styles.tagsTitle}>Tags:</Text>
                <View style={styles.tagsContainer}>
                  {tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Listing Summary</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Title:</Text>
            <Text style={styles.summaryValue}>{title}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Price:</Text>
            <Text style={styles.summaryValue}>
              Kes {price?.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Plan Usage Card */}
        <PlanUsageCard
          usedListings={userPlan.usedListings}
          maxListings={userPlan.maxListings}
          planName={userPlan.planName}
        />
      </ScrollView>

      {/* Footer Buttons */}
      <SafeAreaView style={styles.footer} edges={["bottom"]}>
        <View style={styles.footerButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.footerButton,
              styles.draftButton,
            ]}
            onPress={handleSaveDraft}
            disabled={isSavingDraft || isPublishing}
            activeOpacity={0.7}
          >
            <Text style={[styles.footerButtonText, styles.draftButtonText]}>
              {isSavingDraft ? "Saving..." : "Save as Draft"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.footerButton,
              styles.publishButton,
              isSuccess && styles.successButton,
            ]}
            onPress={handlePublish}
            disabled={isPublishing || isSavingDraft || isSuccess}
            activeOpacity={0.7}
          >
            {isPublishing && !isSuccess
              ? (
                <Text
                  style={[styles.footerButtonText, styles.publishButtonText]}
                >
                  Publishing... {Math.round(uploadProgress * 100)}%
                </Text>
              )
              : isSuccess
              ? (
                <View style={styles.successContent}>
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={Colors.white}
                  />
                  <Text style={styles.footerButtonText}>Published</Text>
                </View>
              )
              : (
                <Text
                  style={[styles.footerButtonText, styles.publishButtonText]}
                >
                  Publish Ad
                </Text>
              )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Listing Limit Bottom Sheet */}
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={["45%"]}
        enableDynamicSizing={false}
      >
        <BottomSheetScrollView contentContainerStyle={styles.limitSheetContent}>
          <View style={styles.limitSheetHeader}>
            <Ionicons name="alert-circle" size={48} color={Colors.red} />
            <ThemedText type="h3" style={styles.limitSheetTitle}>
              Listing Limit Reached
            </ThemedText>
            <ThemedText type="body" style={styles.limitSheetMessage}>
              You've used all {userPlan.maxListings} listings on your{" "}
              {userPlan.planName} plan.
            </ThemedText>
          </View>

          <View style={styles.limitSheetButtons}>
            <TouchableOpacity
              style={[styles.limitSheetButton, styles.upgradeButton]}
              onPress={() => {
                bottomSheetRef.current?.dismiss();
                router.push("/(screens)/(dashboard)/plans-billing");
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.upgradeButtonText}>Upgrade Plan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.limitSheetButton, styles.payButton]}
              onPress={() => {
                bottomSheetRef.current?.dismiss();
                // TODO: Open payment modal
                showErrorToast("Payment modal not implemented yet");
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.payButtonText}>
                Pay for this listing only
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightgrey,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.black,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.grey,
  },
  listingCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.lightgrey,
    overflow: "hidden",
    marginBottom: 24,
  },
  mediaSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightgrey,
  },
  mediaTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  mediaList: {
    gap: 12,
  },
  mediaItem: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: Colors.lightgrey,
  },
  mediaImage: {
    width: "100%",
    height: "100%",
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  videoText: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.grey,
  },
  moreMediaText: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "500",
  },
  detailsSection: {
    padding: 16,
  },
  listingTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  listingPrice: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 12,
  },
  listingDescription: {
    fontSize: 14,
    color: Colors.grey,
    lineHeight: 20,
    marginBottom: 16,
  },
  listingMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: Colors.grey,
  },
  tagsSection: {
    marginTop: 16,
  },
  tagsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.lightgrey,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  tagText: {
    fontSize: 12,
    color: Colors.grey,
  },
  summarySection: {
    marginTop: 8,
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightgrey,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.grey,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.black,
    maxWidth: "70%",
    textAlign: "right",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.lightgrey,
    backgroundColor: Colors.white,
  },
  footerButtonsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    height: 56,
  },
  draftButton: {
    backgroundColor: Colors.lightgrey,
  },
  publishButton: {
    backgroundColor: Colors.primary,
  },
  successButton: {
    backgroundColor: Colors.green,
  },
  footerButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  draftButtonText: {
    color: Colors.primary,
  },
  publishButtonText: {
    color: Colors.white,
  },
  successContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  limitSheetContent: {
    padding: 20,
  },
  limitSheetHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  limitSheetTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  limitSheetMessage: {
    textAlign: "center",
  },
  limitSheetButtons: {
    gap: 12,
  },
  limitSheetButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  upgradeButton: {
    backgroundColor: Colors.primary,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
  },
  payButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
});
