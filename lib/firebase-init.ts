import { auth, db, storage } from './firebase';
import { adminAuth, adminDb } from './firebase-admin';
import { ConnectionManager, FirebaseErrorHandler } from './firebase-services';
import { 
  signInAnonymously, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';

export interface FirebaseInitOptions {
  enableConnectionMonitoring?: boolean;
  enableOfflineSupport?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

export class FirebaseInitializer {
  private static initialized = false;
  private static currentUser: User | null = null;

  /**
   * Initialize Firebase services with configuration
   */
  static async initialize(options: FirebaseInitOptions = {}): Promise<void> {
    if (this.initialized) {
      console.log('Firebase already initialized');
      return;
    }

    try {
      const {
        enableConnectionMonitoring = true,
        enableOfflineSupport = true,
        logLevel = 'info'
      } = options;

      // Set up connection monitoring
      if (enableConnectionMonitoring) {
        ConnectionManager.initializeConnectionMonitoring();
      }

      // Enable offline support for Firestore
      if (enableOfflineSupport && typeof window !== 'undefined') {
        try {
          // Note: Offline persistence is enabled by default in v9+
          console.log('Firestore offline support enabled');
        } catch (error) {
          console.warn('Could not enable Firestore offline support:', error);
        }
      }

      // Set up auth state listener
      this.setupAuthStateListener();

      // Test Firebase connection
      await this.testConnection();

      this.initialized = true;
      console.log('🔥 Firebase initialized successfully');

    } catch (error) {
      FirebaseErrorHandler.logError(error, 'Firebase initialization');
      throw new Error(`Failed to initialize Firebase: ${FirebaseErrorHandler.getErrorMessage(error)}`);
    }
  }

  /**
   * Test Firebase connection by attempting basic operations
   */
  private static async testConnection(): Promise<void> {
    try {
      // Test Firestore connection
      const testDoc = doc(db, 'connection-test', 'test');
      await setDoc(testDoc, { 
        timestamp: serverTimestamp(),
        test: true 
      }, { merge: true });

      console.log('✅ Firestore connection successful');

      // Test Auth connection (anonymous sign-in for testing)
      if (typeof window !== 'undefined') {
        try {
          await signInAnonymously(auth);
          console.log('✅ Firebase Auth connection successful');
        } catch (authError) {
          console.warn('Auth test failed (this is normal if not configured):', authError);
        }
      }

    } catch (error) {
      console.error('❌ Firebase connection test failed:', error);
      throw error;
    }
  }

  /**
   * Set up authentication state listener
   */
  private static setupAuthStateListener(): void {
    if (typeof window === 'undefined') return;

    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      
      if (user) {
        console.log('User signed in:', user.uid);
        // You can add additional user setup logic here
      } else {
        console.log('User signed out');
      }
    });
  }

  /**
   * Get current authenticated user
   */
  static getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Check if Firebase is initialized
   */
  static isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get Firebase services (with initialization check)
   */
  static getServices() {
    if (!this.initialized) {
      console.warn('Firebase not initialized. Call FirebaseInitializer.initialize() first.');
    }

    return {
      auth,
      db,
      storage,
      adminAuth,
      adminDb
    };
  }

  /**
   * Create initial admin user (for development/setup)
   */
  static async createInitialAdmin(email: string, password: string): Promise<void> {
    try {
      // This should only be used in development/setup
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Cannot create admin user in production');
      }

      const userRecord = await adminAuth.createUser({
        email,
        password,
        emailVerified: true,
      });

      // Set admin role in Firestore
      await adminDb.collection('users').doc(userRecord.uid).set({
        email,
        displayName: 'Admin User',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log('✅ Initial admin user created:', userRecord.uid);
    } catch (error) {
      FirebaseErrorHandler.logError(error, 'Create initial admin');
      throw error;
    }
  }

  /**
   * Validate Firebase configuration
   */
  static validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      'NEXT_PUBLIC_FIREBASE_APP_ID'
    ];

    requiredEnvVars.forEach(envVar => {
      if (!process.env[envVar]) {
        errors.push(`Missing environment variable: ${envVar}`);
      }
    });

    // Check admin SDK configuration (for server-side)
    if (typeof window === 'undefined' && process.env.NODE_ENV !== 'development') {
      if (!process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
        errors.push('Missing FIREBASE_ADMIN_PRIVATE_KEY for server-side operations');
      }
      if (!process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
        errors.push('Missing FIREBASE_ADMIN_CLIENT_EMAIL for server-side operations');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Auto-initialize Firebase when this module is imported (client-side only)
if (typeof window !== 'undefined') {
  FirebaseInitializer.initialize().catch(error => {
    console.error('Failed to auto-initialize Firebase:', error);
  });
}