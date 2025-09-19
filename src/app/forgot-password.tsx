
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/contexts/authContext';
import { View, Text, TextInput, Button } from 'react-native';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  const { sendPasswordResetEmail } = useAuth();

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    await sendPasswordResetEmail(data.email);
  };

  return (
    <View className="flex-1 justify-center items-center p-4">
      <Text className="text-2xl font-bold mb-4">Forgot Password</Text>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className="w-full h-10 border border-gray-400 rounded px-2 mb-4"
            placeholder="Email"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoCapitalize="none"
          />
        )}
      />
      {errors.email && <Text className="text-red-500 mb-4">{errors.email.message}</Text>}
      <Button title="Send Reset Link" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}
