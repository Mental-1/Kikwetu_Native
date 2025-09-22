import { useRouter } from 'expo-router';
import { View, Text, Button } from 'react-native';
import { useAppStore } from '@/stores/useAppStore';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Step3() {
  const router = useRouter();
  const { title, description, price, location, condition, tags, images, videos } = useAppStore(
    (state) => state.postAd
  );

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View>
        <Text className="text-2xl font-bold mb-4">Preview Your Ad</Text>
        <Text>Title: {title}</Text>
        <Text>Description: {description}</Text>
        <Text>Price: {price}</Text>
        <Text>Location: {location}</Text>
        <Text>Condition: {condition}</Text>
        <Text>Tags: {tags.join(', ')}</Text>
        <Text>Images: {images.length}</Text>
        <Text>Videos: {videos.length}</Text>
        <View className="flex-row mt-4">
          <View className="mr-2">
            <Button title="Back" onPress={() => router.back()} />
          </View>
          <Button title="Finalize" onPress={() => alert('Ad posted!')} />
        </View>
      </View>
    </SafeAreaView>
  );
}
