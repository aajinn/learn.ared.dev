'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@heroui/react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: UserRole | UserRole[];
  redirectTo?: string;
  fallback?: ReactNode;
}

export default function AuthGuard({
  children,
  requireAuth = true,
  requiredRole,
  redirectTo = '/auth/login',
  fallback,
}: AuthGuardProps) {
  const { user, loading, userProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // If authentication is required but user is not authenticated
    if (requireAuth && !user) {
      router.push(redirectTo);
      return;
    }

    // If authentication is not required but user is authenticated
    if (!requireAuth && user) {
      router.push('/dashboard');
      return;
    }

    // If specific role is required
    if (requiredRole && user && userProfile) {
      const hasRequiredRole = Array.isArray(requiredRole)
        ? requiredRole.includes(userProfile.role)
        : userProfile.role === requiredRole;

      if (!hasRequiredRole) {
        // Redirect based on user's actual role
        switch (userProfile.role) {
          case 'admin':
            router.push('/admin/dashboard');
            break;
          case 'instructor':
            router.push('/instructor/dashboard');
            break;
          case 'student':
            router.push('/student/dashboard');
            break;
          default:
            router.push('/dashboard');
        }
        return;
      }
    }
  }, [user, loading, userProfile, requireAuth, requiredRole, redirectTo, router]);

  // Show loading state
  if (loading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-default-500">Loading...</p>
          </div>
        </div>
      )
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !user) {
    return null; // Will redirect in useEffect
  }

  // If authentication is not required but user is authenticated
  if (!requireAuth && user) {
    return null; // Will redirect in useEffect
  }

  // If specific role is required but user doesn't have it
  if (requiredRole && user && userProfile) {
    const hasRequiredRole = Array.isArray(requiredRole)
      ? requiredRole.includes(userProfile.role)
      : userProfile.role === requiredRole;

    if (!hasRequiredRole) {
      return null; // Will redirect in useEffect
    }
  }

  // If we're still waiting for user profile data
  if (requireAuth && user && !userProfile) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-default-500">Loading profile...</p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

// Convenience components for specific roles
export function StudentGuard({ children, ...props }: Omit<AuthGuardProps, 'requiredRole'>) {
  return (
    <AuthGuard {...props} requiredRole="student">
      {children}
    </AuthGuard>
  );
}

export function InstructorGuard({ children, ...props }: Omit<AuthGuardProps, 'requiredRole'>) {
  return (
    <AuthGuard {...props} requiredRole="instructor">
      {children}
    </AuthGuard>
  );
}

export function AdminGuard({ children, ...props }: Omit<AuthGuardProps, 'requiredRole'>) {
  return (
    <AuthGuard {...props} requiredRole="admin">
      {children}
    </AuthGuard>
  );
}

export function InstructorOrAdminGuard({ children, ...props }: Omit<AuthGuardProps, 'requiredRole'>) {
  return (
    <AuthGuard {...props} requiredRole={['instructor', 'admin']}>
      {children}
    </AuthGuard>
  );
}