import { useRouter } from 'expo-router';
import { View, Button } from 'react-native';
import { useAppStore } from '@/stores/useAppStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import Step1Form from '@/components/ui/post-ad/Step1Form';

export default function Step1() {
  const router = useRouter();
  const { title, setTitle } = useAppStore((state) => state.postAd);

  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    >
      <Step1Form title={title} setTitle={setTitle} />
      <View className='mt-4'>
        <Button
          title='Next'
          onPress={() => router.push('/(screens)/post-ad/step2')}
        />
      </View>
    </SafeAreaView>
  );
}
