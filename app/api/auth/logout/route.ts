import { NextRequest, NextResponse } from 'next/server';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ApiResponse } from '@/types';

export async function POST() {
  try {
    // Sign out user from Firebase Auth
    await signOut(auth);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          message: 'Successfully logged out',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse,
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('Logout error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'LOGOUT_ERROR',
          message: error.message || 'Logout failed',
        },
        timestamp: new Date().toISOString(),
      } as ApiResponse,
      { status: 500 }
    );
  }
}

// Also support GET method for logout (for convenience)
export async function GET() {
  return POST({} as NextRequest);
}