import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/contexts/authContext';
import { View, Text, TextInput, Button } from 'react-native';
import { Link } from 'expo-router';

const signinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignInFormValues = z.infer<typeof signinSchema>;

export default function SignInScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm<SignInFormValues>({
    resolver: zodResolver(signinSchema),
  });
  const { signInWithPassword, signInWithGoogle } = useAuth();

  const onSubmit = async (data: SignInFormValues) => {
    await signInWithPassword(data.email, data.password);
  };

  return (
    <View className="flex-1 justify-center items-center p-4">
      <Text className="text-2xl font-bold mb-4">Sign In</Text>
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
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className="w-full h-10 border border-gray-400 rounded px-2 mb-4"
            placeholder="Password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry
          />
        )}
      />
      {errors.password && <Text className="text-red-500 mb-4">{errors.password.message}</Text>}
      <Button title="Sign In" onPress={handleSubmit(onSubmit)} />
      <View className="mt-4">
        <Button title="Sign In with Google" onPress={signInWithGoogle} />
      </View>
      <Link href="/forgot-password" className="mt-4">
        <Text className="text-blue-500">Forgot Password?</Text>
      </Link>
    </View>
  );
}