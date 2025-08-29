import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { PasswordResetRequest, ApiResponse } from '@/types';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = resetPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: validationResult.error.errors,
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse,
        { status: 400 }
      );
    }

    const { email } = validationResult.data as PasswordResetRequest;

    // Send password reset email
    await sendPasswordResetEmail(auth, email, {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`,
      handleCodeInApp: false,
    });

    // Return success response (don't reveal if email exists or not for security)
    return NextResponse.json(
      {
        success: true,
        data: {
          message: 'If an account with this email exists, a password reset link has been sent.',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse,
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('Password reset error:', error);

    // Handle Firebase Auth errors
    let errorMessage = 'Password reset failed';
    let errorCode = 'PASSWORD_RESET_ERROR';

    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
          // Don't reveal if user exists or not for security
          errorMessage = 'If an account with this email exists, a password reset link has been sent.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          errorCode = 'INVALID_EMAIL';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many password reset requests. Please try again later';
          errorCode = 'TOO_MANY_REQUESTS';
          break;
        default:
          errorMessage = 'Password reset failed. Please try again.';
      }
    }

    // For security, always return success for user-not-found
    if (error.code === 'auth/user-not-found') {
      return NextResponse.json(
        {
          success: true,
          data: {
            message: 'If an account with this email exists, a password reset link has been sent.',
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse,
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse,
      { status: 400 }
    );
  }
}