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
    <Box flex={1} justifyContent="center" alignItems="center">
      <VStack space="md" w="$full" p="$4">
        <Heading>Forgot Password</Heading>
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
        <Button onPress={handleSubmit(onSubmit)}>
          <ButtonText>Send Reset Link</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}