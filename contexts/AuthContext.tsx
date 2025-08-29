'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import {
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  PasswordResetRequest,
  User,
  UserRole,
} from '@/types';

interface AuthContextType extends AuthState {
  // Authentication methods
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (request: PasswordResetRequest) => Promise<void>;
  
  // User profile
  userProfile: User | null;
  refreshUserProfile: () => Promise<void>;
  
  // Role-based access
  hasRole: (role: UserRole | UserRole[]) => boolean;
  isStudent: boolean;
  isInstructor: boolean;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid: string): Promise<User | null> => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          id: uid,
          ...userData,
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (user) {
      const profile = await fetchUserProfile(user.uid);
      setUserProfile(profile);
    }
  };

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setError(null);

      if (firebaseUser) {
        // Fetch user profile
        const profile = await fetchUserProfile(firebaseUser.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    try {
      setError(null);
      setLoading(true);
      
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      
      // User profile will be fetched by the auth state listener
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed';
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed login attempts. Please try again later';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        default:
          errorMessage = error.message || 'Login failed';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (credentials: RegisterCredentials) => {
    try {
      setError(null);
      setLoading(true);
      
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      
      const firebaseUser = userCredential.user;

      // Update the user's display name
      await updateProfile(firebaseUser, {
        displayName: credentials.displayName,
      });

      // Create user document in Firestore
      const userData: Omit<User, 'id'> = {
        email: firebaseUser.email!,
        displayName: credentials.displayName,
        role: credentials.role,
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      
      // User profile will be fetched by the auth state listener
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled';
          break;
        default:
          errorMessage = error.message || 'Registration failed';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (error: any) {
      console.error('Logout error:', error);
      setError('Logout failed');
      throw new Error('Logout failed');
    }
  };

  // Reset password function
  const resetPassword = async (request: PasswordResetRequest) => {
    try {
      setError(null);
      
      await sendPasswordResetEmail(auth, request.email, {
        url: `${window.location.origin}/auth/login`,
        handleCodeInApp: false,
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      let errorMessage = 'Password reset failed';
      switch (error.code) {
        case 'auth/user-not-found':
          // Don't reveal if user exists for security
          errorMessage = 'If an account with this email exists, a password reset link has been sent.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many password reset requests. Please try again later';
          break;
        default:
          errorMessage = 'Password reset failed. Please try again.';
      }
      
      // For user-not-found, don't throw error for security
      if (error.code !== 'auth/user-not-found') {
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    }
  };

  // Role-based access helpers
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!userProfile) return false;
    
    if (Array.isArray(role)) {
      return role.includes(userProfile.role);
    }
    
    return userProfile.role === role;
  };

  const isStudent = hasRole('student');
  const isInstructor = hasRole('instructor');
  const isAdmin = hasRole('admin');

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
    refreshUserProfile,
    hasRole,
    isStudent,
    isInstructor,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// useAuth hook is exported from hooks/useAuth.ts to avoid circular imports