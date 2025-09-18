
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/contexts/authContext';
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
    <Box flex={1} justifyContent="center" alignItems="center">
      <VStack space="md" w="$full" p="$4">
        <Heading>Sign In</Heading>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input>
              <InputField
                placeholder="Email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            </Input>
          )}
        />
        {errors.email && <Text color="$red500">{errors.email.message}</Text>}
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input>
              <InputField
                placeholder="Password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
              />
            </Input>
          )}
        />
        {errors.password && <Text color="$red500">{errors.password.message}</Text>}
        <Button onPress={handleSubmit(onSubmit)}>
          <ButtonText>Sign In</ButtonText>
        </Button>
        <Button onPress={signInWithGoogle}>
          <ButtonText>Sign In with Google</ButtonText>
        </Button>
        <Link href="/forgot-password">
          <Text>Forgot Password?</Text>
        </Link>
      </VStack>
    </Box>
  );
}
