import { useRouter } from 'expo-router';
import { View, Button } from 'react-native';
import { useAppStore } from '@/src/stores/useAppStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import Step2Form from '@/components/ui/post-ad/Step2Form';

export default function Step2() {
  const router = useRouter();
  const { description, setDescription } = useAppStore((state) => state.postAd);

  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    >
      <Step2Form description={description} setDescription={setDescription} />
      <View className='flex-row mt-4'>
        <View className='mr-2'>
          <Button title='Back' onPress={() => router.back()} />
        </View>
        <Button title='Submit' onPress={() => alert('Submit ad!')} />
      </View>
    </SafeAreaView>
  );
}
