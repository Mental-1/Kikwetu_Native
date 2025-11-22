import { Colors } from '@/src/constants/constant';
import { useMediaUpload } from '@/src/hooks/useMediaUpload';
import { useAppStore } from '@/stores/useAppStore';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MAX_IMAGES = 10;
const MAX_VIDEOS = 3;

export default function Step2() {
  const router = useRouter();
  const { images, videos, uploadedMedia, setImages, setVideos, setUploadedMedia } = useAppStore(
    (state) => state.postAd
  );
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images');

  const [uploadQueue, setUploadQueue] = useState<{ uri: string; type: 'image' | 'video' }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const { uploadMedia } = useMediaUpload();

  React.useEffect(() => {
    const processNext = async () => {
      if (isProcessing || uploadQueue.length === 0) return;

      setIsProcessing(true);
      const nextItem = uploadQueue[0];
      const { uri, type } = nextItem;

      try {
        const mediaId = await uploadMedia(
          { uri, type },
          (progress) => {
            setUploadProgress((prev) => ({ ...prev, [uri]: progress }));
          }
        );

        if (mediaId) {
          setUploadedMedia([
            ...useAppStore.getState().postAd.uploadedMedia, // Get latest state
            { uri, id: mediaId, type },
          ]);
          setUploadProgress((prev) => {
            const newState = { ...prev };
            delete newState[uri];
            return newState;
          });
        }
      } catch (error) {
        console.error('Upload failed for', uri, error);
        Alert.alert('Upload Failed', 'Failed to upload media. Please try again.');
        setUploadProgress((prev) => {
          const newState = { ...prev };
          delete newState[uri];
          return newState;
        });
      } finally {
        setUploadQueue((prev) => prev.slice(1));
        setIsProcessing(false);
      }
    };

    processNext();
  }, [uploadQueue, isProcessing, uploadMedia, setUploadedMedia]);

  const addToQueue = useCallback((items: { uri: string; type: 'image' | 'video' }[]) => {
    setUploadQueue((prev) => [...prev, ...items]);
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleNext = useCallback(() => {
    if (images.length === 0 && videos.length === 0) {
      Alert.alert(
        'Media Required',
        'Please add at least one image or video to your listing'
      );
      return;
    }

    if (uploadQueue.length > 0 || isProcessing) {
      Alert.alert('Uploading', 'Please wait for all uploads to complete.');
      return;
    }

    router.push('/(screens)/post-ad/step3');
  }, [images.length, videos.length, uploadQueue.length, isProcessing, router]);



  const pickImage = useCallback(async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        'Permission Required',
        'Permission to access camera roll is required!'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const availableSlots = MAX_IMAGES - images.length;
      if (availableSlots <= 0) {
        Alert.alert(
          'Limit Reached',
          `You can only add up to ${MAX_IMAGES} images.`
        );
        return;
      }

      const newAssets = result.assets.slice(0, availableSlots);
      const newImageUris = newAssets.map((asset) => asset.uri);

      setImages([...images, ...newImageUris]);

      // Add to sequential queue
      const queueItems = newAssets.map(asset => ({ uri: asset.uri, type: 'image' as const }));
      addToQueue(queueItems);

      if (result.assets.length > availableSlots) {
        Alert.alert(
          'Limit Reached',
          `Only the first ${availableSlots} image${availableSlots > 1 ? 's were' : ' was'
          } added to keep you within the ${MAX_IMAGES}-image limit.`
        );
      }
    }
  }, [images, setImages, addToQueue]);

  const pickVideo = useCallback(async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        'Permission Required',
        'Permission to access camera roll is required!'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (videos.length >= MAX_VIDEOS) {
        Alert.alert(
          'Limit Reached',
          `You can only add up to ${MAX_VIDEOS} videos.`
        );
        return;
      }

      const uri = result.assets[0].uri;
      setVideos([...videos, uri]);

      addToQueue([{ uri, type: 'video' }]);
    }
  }, [videos, setVideos, addToQueue]);

  const removeImage = useCallback(
    (index: number) => {
      const uriToRemove = images[index];
      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);

      const newUploadedMedia = uploadedMedia.filter((media) => media.uri !== uriToRemove);
      setUploadedMedia(newUploadedMedia);

      setUploadQueue(prev => prev.filter(item => item.uri !== uriToRemove));
    },
    [images, setImages, uploadedMedia, setUploadedMedia]
  );

  const removeVideo = useCallback(
    (index: number) => {
      const uriToRemove = videos[index];
      const newVideos = videos.filter((_, i) => i !== index);
      setVideos(newVideos);

      const newUploadedMedia = uploadedMedia.filter((media) => media.uri !== uriToRemove);
      setUploadedMedia(newUploadedMedia);

      setUploadQueue(prev => prev.filter(item => item.uri !== uriToRemove));
    },
    [videos, setVideos, uploadedMedia, setUploadedMedia]
  );

  const renderImageItem = useCallback(
    ({ item, index }: { item: string; index: number }) => {
      const progress = uploadProgress[item];
      const isPending = uploadQueue.some(q => q.uri === item);

      return (
        <View style={styles.mediaItem}>
          <Image source={{ uri: item }} style={styles.mediaImage} />
          {(progress !== undefined || isPending) && (
            <View style={styles.loadingOverlay}>
              {progress !== undefined ? (
                <Text style={styles.progressText}>{Math.round(progress)}%</Text>
              ) : (
                <ActivityIndicator size="small" color={Colors.white} />
              )}
            </View>
          )}
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeImage(index)}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      );
    },
    [removeImage, uploadProgress, uploadQueue]
  );

  const renderVideoItem = useCallback(
    ({ item, index }: { item: string; index: number }) => {
      const progress = uploadProgress[item];
      const isPending = uploadQueue.some(q => q.uri === item);

      return (
        <View style={styles.mediaItem}>
          <View style={styles.videoPlaceholder}>
            <Ionicons name="play-circle" size={40} color={Colors.primary} />
            <Text style={styles.videoText}>Video {index + 1}</Text>
          </View>
          {(progress !== undefined || isPending) && (
            <View style={styles.loadingOverlay}>
              {progress !== undefined ? (
                <Text style={styles.progressText}>{Math.round(progress)}%</Text>
              ) : (
                <ActivityIndicator size="small" color={Colors.white} />
              )}
            </View>
          )}
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeVideo(index)}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      );
    },
    [removeVideo, uploadProgress, uploadQueue]
  );

  const handleTabChange = useCallback((tab: 'images' | 'videos') => {
    setActiveTab(tab);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {/* Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post Ad - Media</Text>
        <View style={styles.placeholder} />
      </SafeAreaView>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'images' && styles.activeTab,
          ]}
          onPress={() => handleTabChange('images')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="images-outline"
            size={20}
            color={activeTab === 'images' ? Colors.primary : Colors.grey}
          />
          <Text
            style={[styles.tabText, activeTab === 'images' && styles.activeTabText]}
          >
            Images ({images.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'videos' && styles.activeTab,
          ]}
          onPress={() => handleTabChange('videos')}
          activeOpacity={0.7}
        >
          <Ionicons
            name="videocam-outline"
            size={20}
            color={activeTab === 'videos' ? Colors.primary : Colors.grey}
          />
          <Text
            style={[styles.tabText, activeTab === 'videos' && styles.activeTabText]}
          >
            Videos ({videos.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Add Media Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Add {activeTab === 'images' ? 'Images' : 'Videos'}
          </Text>
          <Text style={styles.sectionDescription}>
            {activeTab === 'images'
              ? 'Upload photos of your item. You can add up to 10 images.'
              : 'Upload videos of your item. You can add up to 3 videos.'}
          </Text>

          {/* Add Button */}
          <View style={styles.addButtonContainer}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={activeTab === 'images' ? pickImage : pickVideo}
              activeOpacity={0.7}
            >
              <Ionicons
                name={activeTab === 'images' ? 'camera-outline' : 'videocam-outline'}
                size={24}
                color={Colors.primary}
              />
              <Text style={styles.addButtonText}>
                Add {activeTab === 'images' ? 'Photo' : 'Video'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Media Grid */}
        {activeTab === 'images' && images.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Images</Text>
            <FlatList
              data={images}
              renderItem={renderImageItem}
              keyExtractor={(item, index) => index.toString()}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.mediaGrid}
            />
          </View>
        )}

        {activeTab === 'videos' && videos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Videos</Text>
            <FlatList
              data={videos}
              renderItem={renderVideoItem}
              keyExtractor={(item, index) => index.toString()}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.mediaGrid}
            />
          </View>
        )}

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Tips for better listings:</Text>
          <Text style={styles.tipText}>• Use good lighting and clear photos</Text>
          <Text style={styles.tipText}>• Show different angles of your item</Text>
          <Text style={styles.tipText}>
            • Include any defects or wear in photos
          </Text>
          <Text style={styles.tipText}>• Keep videos short and focused</Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <SafeAreaView edges={['bottom']}>
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>Next: Preview</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightgrey,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.grey,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.grey,
    marginBottom: 16,
    lineHeight: 20,
  },
  addButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: '100%',
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  mediaGrid: {
    gap: 12,
  },
  mediaItem: {
    flex: 1,
    marginHorizontal: 6,
    marginBottom: 12,
    position: 'relative',
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
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
    gap: 8,
  },
  videoText: {
    fontSize: 12,
    color: Colors.grey,
    fontWeight: '500',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  progressText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsSection: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
    marginBottom: 100,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: Colors.grey,
    marginBottom: 4,
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.lightgrey,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
