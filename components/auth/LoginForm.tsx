'use client';

import { useState } from 'react';
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
  Divider,
} from '@heroui/react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { LoginCredentials } from '@/types';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  onForgotPassword: () => void;
  onSwitchToRegister: () => void;
  isLoading?: boolean;
  error?: string;
}

export default function LoginForm({
  onSubmit,
  onForgotPassword,
  onSwitchToRegister,
  isLoading = false,
  error,
}: LoginFormProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
  });

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleFormSubmit = async (data: LoginCredentials) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Error handling is managed by parent component
      console.error('Login error:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-col gap-3 pb-0">
        <div className="flex flex-col gap-1 items-center">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-small text-default-500">
            Sign in to your account to continue
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
            placeholder="Enter your email"
            variant="bordered"
            isInvalid={!!errors.email}
            errorMessage={errors.email?.message}
            autoComplete="email"
          />

          <Input
            {...register('password')}
            type={isPasswordVisible ? 'text' : 'password'}
            label="Password"
            placeholder="Enter your password"
            variant="bordered"
            isInvalid={!!errors.password}
            errorMessage={errors.password?.message}
            autoComplete="current-password"
            endContent={
              <button
                className="focus:outline-none"
                type="button"
                onClick={togglePasswordVisibility}
                aria-label="toggle password visibility"
              >
                {isPasswordVisible ? (
                  <EyeSlashIcon className="w-5 h-5 text-default-400 pointer-events-none" />
                ) : (
                  <EyeIcon className="w-5 h-5 text-default-400 pointer-events-none" />
                )}
              </button>
            }
          />

          <div className="flex justify-end">
            <Link
              size="sm"
              onPress={onForgotPassword}
              className="cursor-pointer"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            color="primary"
            size="lg"
            isLoading={isLoading || isSubmitting}
            disabled={isLoading || isSubmitting}
            className="w-full"
          >
            {isLoading || isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <Divider />

        <div className="text-center">
          <p className="text-small text-default-500">
            Don&apos;t have an account?{' '}
            <Link
              size="sm"
              onPress={onSwitchToRegister}
              className="cursor-pointer"
            >
              Sign up
            </Link>
          </p>
        </div>
      </CardBody>
    </Card>
  );
}