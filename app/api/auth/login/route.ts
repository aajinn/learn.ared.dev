import { NextRequest, NextResponse } from 'next/server';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { LoginCredentials, User, ApiResponse } from '@/types';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = loginSchema.safeParse(body);
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

    const { email, password } = validationResult.data as LoginCredentials;

    // Sign in user with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Get user profile from Firestore
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_PROFILE_NOT_FOUND',
            message: 'User profile not found',
          },
          timestamp: new Date().toISOString(),
        } as ApiResponse,
        { status: 404 }
      );
    }

    const userData = userDoc.data() as Omit<User, 'id'>;

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            role: userData.role,
            emailVerified: firebaseUser.emailVerified,
          },
          profile: {
            id: firebaseUser.uid,
            ...userData,
          },
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse,
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('Login error:', error);

    // Handle Firebase Auth errors
    let errorMessage = 'Login failed';
    let errorCode = 'LOGIN_ERROR';

    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password';
          errorCode = 'INVALID_CREDENTIALS';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          errorCode = 'ACCOUNT_DISABLED';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed login attempts. Please try again later';
          errorCode = 'TOO_MANY_REQUESTS';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          errorCode = 'INVALID_EMAIL';
          break;
        default:
          errorMessage = error.message || 'Login failed';
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
      { status: 401 }
    );
  }
}