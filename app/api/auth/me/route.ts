import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { ApiResponse } from '@/types';

async function handler(request: AuthenticatedRequest) {
  try {
    const user = request.user!;

    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.uid,
            email: user.email,
            displayName: user.profile.displayName,
            role: user.role,
            profileImage: user.profile.profileImage,
          },
          profile: user.profile,
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse,
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('Get user profile error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROFILE_ERROR',
          message: 'Failed to get user profile',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse,
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);