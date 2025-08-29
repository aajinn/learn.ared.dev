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
    Select,
    SelectItem,
} from '@heroui/react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { RegisterCredentials } from '@/types';

const registerSchema = z.object({
    displayName: z
        .string()
        .min(1, 'Full name is required')
        .min(2, 'Full name must be at least 2 characters')
        .max(50, 'Full name must be less than 50 characters'),
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    role: z.enum(['student', 'instructor'] as const, {
        required_error: 'Please select a role',
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
    onSubmit: (credentials: RegisterCredentials) => Promise<void>;
    onSwitchToLogin: () => void;
    isLoading?: boolean;
    error?: string;
}

const roleOptions = [
    { key: 'student', label: 'Student', description: 'I want to learn and take courses' },
    { key: 'instructor', label: 'Instructor', description: 'I want to create and sell courses' },
];

export default function RegisterForm({
    onSubmit,
    onSwitchToLogin,
    isLoading = false,
    error,
}: RegisterFormProps) {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const selectedRole = watch('role');

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const toggleConfirmPasswordVisibility = () => {
        setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
    };

    const handleFormSubmit = async (data: RegisterFormData) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { confirmPassword, ...credentials } = data;
            await onSubmit(credentials as RegisterCredentials);
        } catch (error) {
            // Error handling is managed by parent component
            console.error('Registration error:', error);
        }
    };

    const handleRoleChange = (keys: unknown) => {
        const selectedKey = Array.from(keys)[0] as 'student' | 'instructor';
        setValue('role', selectedKey);
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="flex flex-col gap-3 pb-0">
                <div className="flex flex-col gap-1 items-center">
                    <h1 className="text-2xl font-bold">Create Account</h1>
                    <p className="text-small text-default-500">
                        Join our learning platform today
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
                        {...register('displayName')}
                        type="text"
                        label="Full Name"
                        placeholder="Enter your full name"
                        variant="bordered"
                        isInvalid={!!errors.displayName}
                        errorMessage={errors.displayName?.message}
                        autoComplete="name"
                    />

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

                    <Select
                        label="I am a..."
                        placeholder="Select your role"
                        variant="bordered"
                        isInvalid={!!errors.role}
                        errorMessage={errors.role?.message}
                        selectedKeys={selectedRole ? [selectedRole] : []}
                        onSelectionChange={handleRoleChange}
                    >
                        {roleOptions.map((role) => (
                            <SelectItem key={role.key}>
                                <div className="flex flex-col">
                                    <span className="font-medium">{role.label}</span>
                                    <span className="text-small text-default-500">{role.description}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </Select>

                    <Input
                        {...register('password')}
                        type={isPasswordVisible ? 'text' : 'password'}
                        label="Password"
                        placeholder="Create a password"
                        variant="bordered"
                        isInvalid={!!errors.password}
                        errorMessage={errors.password?.message}
                        autoComplete="new-password"
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

                    <Input
                        {...register('confirmPassword')}
                        type={isConfirmPasswordVisible ? 'text' : 'password'}
                        label="Confirm Password"
                        placeholder="Confirm your password"
                        variant="bordered"
                        isInvalid={!!errors.confirmPassword}
                        errorMessage={errors.confirmPassword?.message}
                        autoComplete="new-password"
                        endContent={
                            <button
                                className="focus:outline-none"
                                type="button"
                                onClick={toggleConfirmPasswordVisibility}
                                aria-label="toggle confirm password visibility"
                            >
                                {isConfirmPasswordVisible ? (
                                    <EyeSlashIcon className="w-5 h-5 text-default-400 pointer-events-none" />
                                ) : (
                                    <EyeIcon className="w-5 h-5 text-default-400 pointer-events-none" />
                                )}
                            </button>
                        }
                    />

                    <Button
                        type="submit"
                        color="primary"
                        size="lg"
                        isLoading={isLoading || isSubmitting}
                        disabled={isLoading || isSubmitting}
                        className="w-full"
                    >
                        {isLoading || isSubmitting ? 'Creating account...' : 'Create Account'}
                    </Button>
                </form>

                <Divider />

                <div className="text-center">
                    <p className="text-small text-default-500">
                        Already have an account?{' '}
                        <Link
                            size="sm"
                            onPress={onSwitchToLogin}
                            className="cursor-pointer"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </CardBody>
        </Card>
    );
}