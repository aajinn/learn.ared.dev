'use client';

import { useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';

/**
 * Hook to handle authentication state persistence
 * This ensures the auth state is properly restored on page refresh
 */
export function useAuthPersistence() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') return;

    // Set up auth state persistence
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setIsInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  return {
    isInitialized,
    user,
  };
}

/**
 * Hook to get the current user's ID token
 * Useful for making authenticated API requests
 */
export function useAuthToken() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setLoading(true);
      
      if (user) {
        try {
          const idToken = await user.getIdToken();
          setToken(idToken);
        } catch (error) {
          console.error('Error getting ID token:', error);
          setToken(null);
        }
      } else {
        setToken(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshToken = async () => {
    if (auth.currentUser) {
      try {
        const idToken = await auth.currentUser.getIdToken(true); // Force refresh
        setToken(idToken);
        return idToken;
      } catch (error) {
        console.error('Error refreshing token:', error);
        setToken(null);
        return null;
      }
    }
    return null;
  };

  return {
    token,
    loading,
    refreshToken,
  };
}

/**
 * Hook for making authenticated API requests
 */
export function useAuthenticatedFetch() {
  const { token, refreshToken } = useAuthToken();

  const authenticatedFetch = async (
    url: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    let currentToken = token;

    // If no token, try to get one
    if (!currentToken) {
      currentToken = await refreshToken();
    }

    // If still no token, throw error
    if (!currentToken) {
      throw new Error('No authentication token available');
    }

    // Add authorization header
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      Authorization: `Bearer ${currentToken}`,
    };

    // Make the request
    let response = await fetch(url, {
      ...options,
      headers,
    });

    // If unauthorized, try refreshing token once
    if (response.status === 401) {
      const newToken = await refreshToken();
      if (newToken) {
        response = await fetch(url, {
          ...options,
          headers: {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          },
        });
      }
    }

    return response;
  };

  return {
    authenticatedFetch,
    hasToken: !!token,
  };
}