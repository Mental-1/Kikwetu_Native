import { View, Text, TextInput } from 'react-native';

interface Step1FormProps {
  title: string;
  setTitle: (title: string) => void;
}

export default function Step1Form({ title, setTitle }: Step1FormProps) {
  return (
    <View className="w-full px-4">
      <Text className="text-2xl font-bold mb-4">What are you selling?</Text>
      <TextInput
        placeholder="Ad Title"
        value={title}
        onChangeText={setTitle}
        className="border border-gray-300 p-3 rounded-lg w-full"
      />
    </View>
  );
}
