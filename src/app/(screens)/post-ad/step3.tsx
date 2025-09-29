import { Colors } from '@/src/constants/constant';
import { useAppStore } from '@/stores/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Alert, Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function Step3() {
  const router = useRouter();
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
    videos 
  } = useAppStore((state) => state.postAd);

  const handleBack = () => {
    router.back();
  };

  const handleFinalize = () => {
    Alert.alert(
      'Post Your Ad',
      'Are you sure you want to post this listing?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Post Ad', 
          onPress: () => {
            // TODO: Implement actual posting logic
            Alert.alert('Success', 'Your ad has been posted successfully!', [
              { text: 'OK', onPress: () => router.push('/(tabs)/listings') }
            ]);
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
        <Text style={styles.headerTitle}>Post Ad - Preview</Text>
        <View style={styles.placeholder} />
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Preview Title */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preview Your Listing</Text>
          <Text style={styles.sectionDescription}>
            Review all the details before posting your ad
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
        <TouchableOpacity style={styles.backButtonFooter} onPress={handleBack}>
          <Text style={styles.backButtonText}>Back to Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.finalizeButton} onPress={handleFinalize}>
          <Text style={styles.finalizeButtonText}>Post Ad</Text>
          <Ionicons name="checkmark" size={20} color={Colors.white} />
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
  backButtonFooter: {
    flex: 1,
    backgroundColor: Colors.lightgrey,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: Colors.black,
    fontSize: 16,
    fontWeight: '600',
  },
  finalizeButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  finalizeButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
