import { Colors } from '@/src/constants/constant';
import { useCreateListing, useSaveDraft } from '@/src/hooks/useListings';
import { saveDraft } from '@/src/utils/draftManager';
import { validateCompleteListing } from '@/src/utils/listingValidation';
import { useAppStore } from '@/stores/useAppStore';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Alert, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function Step3() {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
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
    resetPostAd
  } = useAppStore((state) => state.postAd);

  const createListingMutation = useCreateListing();
  const saveDraftMutation = useSaveDraft();

  const handleBack = () => {
    router.back();
  };

  const handlePublish = async () => {
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
    };

    const validation = validateCompleteListing(listingData);
    if (!validation.success) {
      const firstError = Object.values(validation.errors || {})[0];
      showErrorToast(firstError || 'Please check your listing details');
      return;
    }

    Alert.alert(
      'Publish Your Ad',
      'Are you sure you want to publish this listing?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Publish Ad', 
          onPress: async () => {
            try {
              setIsPublishing(true);
              setUploadProgress(0);

              await createListingMutation.mutateAsync({
                listingData: {
                  title: validation.data!.title!,
                  description: validation.data!.description!,
                  price: validation.data!.price!,
                  category_id: validation.data!.category_id!,
                  subcategory_id: validation.data!.subcategory_id,
                  condition: validation.data!.condition!,
                  location: validation.data!.location!,
                  latitude: validation.data!.latitude ?? undefined,
                  longitude: validation.data!.longitude ?? undefined,
                  negotiable: validation.data!.negotiable!,
                  images: validation.data!.images!,
                  videos: validation.data!.videos!,
                  tags: validation.data!.tags!,
                  store_id: validation.data!.store_id ?? undefined,
                  status: 'active',
                },
                imageUris: images,
                onUploadProgress: setUploadProgress,
              });

              showSuccessToast('Your ad has been published successfully!', 'Success');
              resetPostAd();
              router.push('/(tabs)/listings');
            } catch (error: any) {
              console.error('Error publishing listing:', error);
              showErrorToast(error.message || 'Failed to publish listing. Please try again.');
            } finally {
              setIsPublishing(false);
              setUploadProgress(0);
            }
          }
        }
      ]
    );
  };

  const handleSaveDraft = async () => {
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
    };

    const validation = validateCompleteListing(listingData);
    if (!validation.success) {
      const firstError = Object.values(validation.errors || {})[0];
      showErrorToast(firstError || 'Please check your listing details');
      return;
    }

    Alert.alert(
      'Save as Draft',
      'Your listing will be saved as a draft. You can continue editing and publish it later.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Save Draft', 
          onPress: async () => {
            try {
              setIsSavingDraft(true);

              const draftId = await saveDraft({
                title: validation.data!.title!,
                description: validation.data!.description!,
                price: validation.data!.price!,
                category_id: validation.data!.category_id!,
                subcategory_id: validation.data!.subcategory_id,
                condition: validation.data!.condition!,
                location: validation.data!.location!,
                latitude: validation.data!.latitude ?? undefined,
                longitude: validation.data!.longitude ?? undefined,
                negotiable: validation.data!.negotiable!,
                images: validation.data!.images!,
                videos: validation.data!.videos!,
                tags: validation.data!.tags!,
                store_id: validation.data!.store_id ?? undefined,
              });

              showSuccessToast('Your listing has been saved as a draft!', 'Draft Saved');
              resetPostAd();
              router.push('/(tabs)/listings');
            } catch (error: any) {
              console.error('Error saving draft:', error);
              showErrorToast(error.message || 'Failed to save draft. Please try again.');
            } finally {
              setIsSavingDraft(false);
            }
          }
        }
      ]
    );
  };

  const renderImageItem = ({ item }: { item: string }) => (
    <View style={styles.mediaItem}>
      <Image source={{ uri: item }} style={styles.mediaImage} />
    </View>
  );

  const renderVideoItem = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.mediaItem}>
      <View style={styles.videoPlaceholder}>
        <Ionicons name="play-circle" size={40} color={Colors.primary} />
        <Text style={styles.videoText}>Video {index + 1}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
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
                <Text style={styles.moreMediaText}>+{images.length - 3} more images</Text>
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
            <Text style={styles.listingPrice}>Kes {price?.toLocaleString()}</Text>
            <Text style={styles.listingDescription}>{description}</Text>
            
            <View style={styles.listingMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={16} color={Colors.grey} />
                <Text style={styles.metaText}>{location}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color={Colors.grey} />
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
            <Text style={styles.summaryValue}>Kes {price?.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Location:</Text>
            <Text style={styles.summaryValue}>{location}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Condition:</Text>
            <Text style={styles.summaryValue}>{condition}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Media:</Text>
            <Text style={styles.summaryValue}>
              {images.length} image{images.length !== 1 ? 's' : ''}, {videos.length} video{videos.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Tags:</Text>
            <Text style={styles.summaryValue}>{tags.length} tag{tags.length !== 1 ? 's' : ''}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.draftButton, isSavingDraft && styles.disabledButton]} 
          onPress={handleSaveDraft}
          disabled={isSavingDraft || isPublishing}
        >
          <Text style={[styles.draftButtonText, isSavingDraft && styles.disabledButtonText]}>
            {isSavingDraft ? 'Saving...' : 'Save Draft'}
          </Text>
          <Ionicons 
            name={isSavingDraft ? "hourglass-outline" : "bookmark-outline"} 
            size={20} 
            color={isSavingDraft ? Colors.grey : Colors.grey} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.publishButton, (isPublishing || isSavingDraft) && styles.disabledButton]} 
          onPress={handlePublish}
          disabled={isPublishing || isSavingDraft}
        >
          <Text style={[styles.publishButtonText, isPublishing && styles.disabledButtonText]}>
            {isPublishing ? `Publishing... ${Math.round(uploadProgress)}%` : 'Publish Ad'}
          </Text>
          <Ionicons 
            name={isPublishing ? "hourglass-outline" : "checkmark"} 
            size={20} 
            color={isPublishing ? Colors.white : Colors.white} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightgrey,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    color: Colors.grey,
    marginBottom: 24,
  },
  listingCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mediaSection: {
    marginBottom: 16,
  },
  mediaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  mediaList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  mediaItem: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.lightgrey,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  videoText: {
    fontSize: 10,
    color: Colors.grey,
    fontWeight: '500',
  },
  moreMediaText: {
    fontSize: 12,
    color: Colors.grey,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  detailsSection: {
    padding: 16,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 8,
  },
  listingPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  listingDescription: {
    fontSize: 14,
    color: Colors.grey,
    lineHeight: 20,
    marginBottom: 12,
  },
  listingMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.grey,
  },
  tagsSection: {
    marginTop: 8,
  },
  tagsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  summarySection: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 100,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.grey,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: Colors.black,
    flex: 1,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.lightgrey,
    gap: 12,
  },
  draftButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.lightgrey,
  },
  draftButtonText: {
    color: Colors.grey,
    fontSize: 16,
    fontWeight: '600',
  },
  publishButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  publishButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledButtonText: {
    opacity: 0.8,
  },
});
