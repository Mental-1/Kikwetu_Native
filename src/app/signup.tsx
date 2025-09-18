
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
    <Box flex={1} justifyContent="center" alignItems="center">
      <VStack space="md" w="$full" p="$4">
        <Heading>Sign Up</Heading>
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
        <Controller
          control={control}
          name="full_name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input>
              <InputField
                placeholder="Full Name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            </Input>
          )}
        />
        {errors.full_name && <Text color="$red500">{errors.full_name.message}</Text>}
        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input>
              <InputField
                placeholder="Username"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            </Input>
          )}
        />
        {errors.username && <Text color="$red500">{errors.username.message}</Text>}
        <Controller
          control={control}
          name="phone_number"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input>
              <InputField
                placeholder="Phone Number"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            </Input>
          )}
        />
        {errors.phone_number && <Text color="$red500">{errors.phone_number.message}</Text>}
        <Button onPress={handleSubmit(onSubmit)}>
          <ButtonText>Sign Up</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}
