import { UserRole, User } from '@/types';

// Type guard removed as it's not used in current implementation

/**
 * Check if a user has a specific role or one of multiple roles
 */
export function hasRole(user: User | null, role: UserRole | UserRole[]): boolean {
  if (!user) return false;
  
  if (Array.isArray(role)) {
    return role.includes(user.role);
  }
  
  return user.role === role;
}

/**
 * Check if a user is a student
 */
export function isStudent(user: User | null): boolean {
  return hasRole(user, 'student');
}

/**
 * Check if a user is an instructor
 */
export function isInstructor(user: User | null): boolean {
  return hasRole(user, 'instructor');
}

/**
 * Check if a user is an admin
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, 'admin');
}

/**
 * Check if a user is an instructor or admin
 */
export function isInstructorOrAdmin(user: User | null): boolean {
  return hasRole(user, ['instructor', 'admin']);
}

/**
 * Get the dashboard route for a user based on their role
 */
export function getDashboardRoute(user: User | null): string {
  if (!user) return '/auth/login';
  
  const role = user.role as string;
  
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'instructor':
      return '/instructor/dashboard';
    case 'student':
      return '/student/dashboard';
    default:
      return '/dashboard';
  }
}

/**
 * Get the appropriate redirect route after login based on user role
 */
export function getPostLoginRedirect(user: User | null, intendedRoute?: string): string {
  // If there's an intended route, use it (after validation)
  if (intendedRoute && intendedRoute !== '/auth/login' && intendedRoute !== '/auth/register') {
    return intendedRoute;
  }
  
  // Otherwise, redirect to role-specific dashboard
  return getDashboardRoute(user);
}

/**
 * Check if a route is accessible to a user based on their role
 */
export function canAccessRoute(user: User | null, route: string): boolean {
  if (!user) {
    // Public routes that don't require authentication
    const publicRoutes = [
      '/',
      '/auth/login',
      '/auth/register',
      '/auth/reset-password',
      '/courses',
      '/about',
      '/contact',
    ];
    
    return publicRoutes.some(publicRoute => 
      route === publicRoute || route.startsWith('/courses/')
    );
  }
  
  const role = user.role as string;
  
  // Admin can access everything
  if (role === 'admin') {
    return true;
  }
  
  // Role-specific route access
  if (route.startsWith('/admin/')) {
    return role === 'admin';
  }
  
  if (route.startsWith('/instructor/')) {
    return role === 'instructor' || role === 'admin';
  }
  
  if (route.startsWith('/student/')) {
    return role === 'student' || role === 'admin';
  }
  
  // General authenticated routes
  const authenticatedRoutes = [
    '/dashboard',
    '/profile',
    '/settings',
    '/my-courses',
  ];
  
  if (authenticatedRoutes.some(authRoute => route.startsWith(authRoute))) {
    return true;
  }
  
  // Course access routes (enrolled users can access)
  if (route.startsWith('/courses/') && route.includes('/learn')) {
    // This would need additional logic to check enrollment
    // For now, allow all authenticated users
    return true;
  }
  
  // Default to allowing access for authenticated users to public routes
  return true;
}

/**
 * Validate user permissions for a specific action
 */
export function canPerformAction(
  user: User | null,
  action: string,
  resource?: unknown
): boolean {
  if (!user) return false;
  
  const role = user.role as string;
  
  switch (action) {
    case 'create_course':
      return hasRole(user, ['instructor', 'admin']);
    
    case 'edit_course':
      if (role === 'admin') return true;
      if (role === 'instructor' && resource?.instructorId === user.id) return true;
      return false;
    
    case 'delete_course':
      if (role === 'admin') return true;
      if (role === 'instructor' && resource?.instructorId === user.id) return true;
      return false;
    
    case 'approve_course':
      return role === 'admin';
    
    case 'manage_users':
      return role === 'admin';
    
    case 'view_analytics':
      if (role === 'admin') return true;
      if (role === 'instructor' && resource?.instructorId === user.id) return true;
      return false;
    
    case 'purchase_course':
      return role === 'student' || role === 'instructor';
    
    case 'access_course':
      // This would need enrollment check in real implementation
      return true;
    
    default:
      return false;
  }
}

/**
 * Get user display information
 */
export function getUserDisplayInfo(user: User | null) {
  if (!user) return null;
  
  return {
    name: user.displayName || 'User',
    email: user.email,
    role: user.role,
    avatar: user.profileImage,
    initials: getInitials(user.displayName || user.email),
  };
}

/**
 * Get initials from a name or email
 */
export function getInitials(name: string): string {
  if (!name) return 'U';
  
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  
  return name.substring(0, 2).toUpperCase();
}

/**
 * Format role name for display
 */
export function formatRole(role: UserRole): string {
  const roleStr = role as string;
  switch (roleStr) {
    case 'student':
      return 'Student';
    case 'instructor':
      return 'Instructor';
    case 'admin':
      return 'Administrator';
    default:
      return 'User';
  }
}