import { NextRequest, NextResponse } from 'next/server';
// Firebase admin auth is imported dynamically
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, UserRole, ApiResponse } from '@/types';

// Initialize Firebase Admin (this will be used server-side)
let adminAuth: unknown = null;

async function getAdminAuth() {
  if (!adminAuth) {
    const { getAuth } = await import('firebase-admin/auth');
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    
    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
    
    adminAuth = getAuth();
  }
  return adminAuth;
}

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    uid: string;
    email: string;
    role: UserRole;
    profile: User;
  };
}

export async function authenticateRequest(
  request: NextRequest
): Promise<{ success: boolean; user?: unknown; error?: unknown }> {
  try {
    // Get the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: {
          code: 'MISSING_TOKEN',
          message: 'Authorization token is required',
        },
      };
    }

    // Extract the token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token with Firebase Admin
    const auth = await getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);

    // Get user profile from Firestore
    const userDocRef = doc(db, 'users', decodedToken.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return {
        success: false,
        error: {
          code: 'USER_PROFILE_NOT_FOUND',
          message: 'User profile not found',
        },
      };
    }

    const userData = userDoc.data() as Omit<User, 'id'>;
    const userProfile: User = {
      id: decodedToken.uid,
      ...userData,
    };

    return {
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: userData.role,
        profile: userProfile,
      },
    };

  } catch (error: unknown) {
    console.error('Authentication error:', error);

    let errorCode = 'AUTHENTICATION_ERROR';
    let errorMessage = 'Authentication failed';

    if (error.code) {
      switch (error.code) {
        case 'auth/id-token-expired':
          errorCode = 'TOKEN_EXPIRED';
          errorMessage = 'Authentication token has expired';
          break;
        case 'auth/id-token-revoked':
          errorCode = 'TOKEN_REVOKED';
          errorMessage = 'Authentication token has been revoked';
          break;
        case 'auth/invalid-id-token':
          errorCode = 'INVALID_TOKEN';
          errorMessage = 'Invalid authentication token';
          break;
        default:
          errorMessage = error.message || 'Authentication failed';
      }
    }

    return {
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
      },
    };
  }
}

export function withAuth(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>,
  options: {
    requiredRole?: UserRole | UserRole[];
  } = {}
) {
  return async (request: NextRequest) => {
    // Authenticate the request
    const authResult = await authenticateRequest(request);

    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error,
          timestamp: new Date().toISOString(),
        } as ApiResponse,
        { status: 401 }
      );
    }

    // Check role requirements
    if (options.requiredRole) {
      const userRole = authResult.user.role;
      const hasRequiredRole = Array.isArray(options.requiredRole)
        ? options.requiredRole.includes(userRole)
        : userRole === options.requiredRole;

      if (!hasRequiredRole) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INSUFFICIENT_PERMISSIONS',
              message: 'You do not have permission to access this resource',
            },
            timestamp: new Date().toISOString(),
          } as ApiResponse,
          { status: 403 }
        );
      }
    }

    // Add user to request object
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = authResult.user;

    // Call the handler
    return handler(authenticatedRequest);
  };
}

// Convenience functions for specific roles
export function withStudentAuth(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
) {
  return withAuth(handler, { requiredRole: 'student' });
}

export function withInstructorAuth(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
) {
  return withAuth(handler, { requiredRole: 'instructor' });
}

export function withAdminAuth(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
) {
  return withAuth(handler, { requiredRole: 'admin' });
}

export function withInstructorOrAdminAuth(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
) {
  return withAuth(handler, { requiredRole: ['instructor', 'admin'] });
}