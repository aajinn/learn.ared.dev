'use client';


import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Link,
} from '@heroui/react';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { PasswordResetRequest } from '@/types';

const passwordResetSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

interface PasswordResetProps {
  onSubmit: (request: PasswordResetRequest) => Promise<void>;
  onBackToLogin: () => void;
  isLoading?: boolean;
  error?: string;
  success?: boolean;
}

export default function PasswordReset({
  onSubmit,
  onBackToLogin,
  isLoading = false,
  error,
  success = false,
}: PasswordResetProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<PasswordResetRequest>({
    resolver: zodResolver(passwordResetSchema),
  });

  const handleFormSubmit = async (data: PasswordResetRequest) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Error handling is managed by parent component
      console.error('Password reset error:', error);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex flex-col gap-3 pb-0">
          <div className="flex flex-col gap-1 items-center">
            <CheckCircleIcon className="w-12 h-12 text-success" />
            <h1 className="text-2xl font-bold">Check Your Email</h1>
            <p className="text-small text-default-500 text-center">
              We&apos;ve sent a password reset link to
            </p>
            <p className="text-small font-medium text-center">
              {getValues('email')}
            </p>
          </div>
        </CardHeader>
        <CardBody className="gap-4">
          <div className="text-center space-y-4">
            <p className="text-small text-default-500">
              Click the link in the email to reset your password. If you don&apos;t see the email,
              check your spam folder.
            </p>
            
            <Button
              variant="light"
              onPress={onBackToLogin}
              startContent={<ArrowLeftIcon className="w-4 h-4" />}
              className="w-full"
            >
              Back to Sign In
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-col gap-3 pb-0">
        <div className="flex flex-col gap-1 items-center">
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-small text-default-500 text-center">
            Enter your email address and we&apos;ll send you a link to reset your password
          </p>
        </div>
      </CardHeader>
      <CardBody className="gap-4">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          {error && (
            <div className="p-3 rounded-lg bg-danger-50 border border-danger-200">
              <p className="text-danger text-small">{error}</p>
            </div>
          )}

          <Input
            {...register('email')}
            type="email"
            label="Email"
            placeholder="Enter your email address"
            variant="bordered"
            isInvalid={!!errors.email}
            errorMessage={errors.email?.message}
            autoComplete="email"
            autoFocus
          />

          <Button
            type="submit"
            color="primary"
            size="lg"
            isLoading={isLoading || isSubmitting}
            disabled={isLoading || isSubmitting}
            className="w-full"
          >
            {isLoading || isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>

        <div className="text-center">
          <Link
            size="sm"
            onPress={onBackToLogin}
            className="cursor-pointer inline-flex items-center gap-1"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}