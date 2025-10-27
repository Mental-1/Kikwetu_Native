import { View, Text, TextInput } from 'react-native';

interface Step2FormProps {
  description: string;
  setDescription: (description: string) => void;
}

export default function Step2Form({ description, setDescription }: Step2FormProps) {
  return (
    <View className="w-full px-4">
      <Text className="text-2xl font-bold mb-4">Describe your item</Text>
      <TextInput
        placeholder="Ad Description"
        value={description}
        onChangeText={setDescription}
        className="border border-gray-300 p-3 rounded-lg w-full h-32"
        multiline
        textAlignVertical="top"
        accessibilityLabel="Ad description"
        autoCapitalize="sentences"
        autoCorrect
        maxLength={1000}
      />
    </View>
  );
}
