import { NextRequest, NextResponse } from 'next/server';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { RegisterCredentials, User, ApiResponse } from '@/types';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  role: z.enum(['student', 'instructor'], {
    required_error: 'Role is required',
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = registerSchema.safeParse(body);
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

    const { email, password, displayName, role } = validationResult.data as RegisterCredentials;

    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update the user's display name
    await updateProfile(firebaseUser, {
      displayName: displayName,
    });

    // Create user document in Firestore
    const userData: Omit<User, 'id'> = {
      email: firebaseUser.email!,
      displayName: displayName,
      role: role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userData);

    // Return success response (don't include sensitive data)
    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: displayName,
            role: role,
            emailVerified: firebaseUser.emailVerified,
          },
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse,
      { status: 201 }
    );

  } catch (error: unknown) {
    console.error('Registration error:', error);

    // Handle Firebase Auth errors
    let errorMessage = 'Registration failed';
    let errorCode = 'REGISTRATION_ERROR';

    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists';
          errorCode = 'EMAIL_ALREADY_EXISTS';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          errorCode = 'INVALID_EMAIL';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          errorCode = 'WEAK_PASSWORD';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled';
          errorCode = 'OPERATION_NOT_ALLOWED';
          break;
        default:
          errorMessage = error.message || 'Registration failed';
      }
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