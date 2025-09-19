import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '@/contexts/authContext';
import { View, Text, TextInput, Button } from 'react-native';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(1, 'Full name is required'),
  username: z.string().min(1, 'Username is required'),
  phone_number: z.string().min(1, 'Phone number is required'),
});

type SignUpFormValues = z.infer<typeof signupSchema>;

export default function SignUpScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm<SignUpFormValues>({
    resolver: zodResolver(signupSchema),
  });
  const { signUp } = useAuth();

  const onSubmit = async (data: SignUpFormValues) => {
    await signUp(data.email, data.password, data.full_name, data.username, data.phone_number);
  };

  return (
    <View className="flex-1 justify-center items-center p-4">
      <Text className="text-2xl font-bold mb-4">Sign Up</Text>
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
      <Controller
        control={control}
        name="full_name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className="w-full h-10 border border-gray-400 rounded px-2 mb-4"
            placeholder="Full Name"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />
      {errors.full_name && <Text className="text-red-500 mb-4">{errors.full_name.message}</Text>}
      <Controller
        control={control}
        name="username"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className="w-full h-10 border border-gray-400 rounded px-2 mb-4"
            placeholder="Username"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoCapitalize="none"
          />
        )}
      />
      {errors.username && <Text className="text-red-500 mb-4">{errors.username.message}</Text>}
      <Controller
        control={control}
        name="phone_number"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className="w-full h-10 border border-gray-400 rounded px-2 mb-4"
            placeholder="Phone Number"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />
      {errors.phone_number && <Text className="text-red-500 mb-4">{errors.phone_number.message}</Text>}
      <Button title="Sign Up" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}