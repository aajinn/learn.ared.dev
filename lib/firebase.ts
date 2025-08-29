import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const shouldUseEmulators = () => {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true';
    return isLocalhost || useEmulators;
  };

  if (shouldUseEmulators()) {
    const connectEmulators = () => {
      const authPort = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT || '9099';
      const firestorePort = process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT || '8080';
      const storagePort = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_PORT || '9199';

      try {
        // Connect to Auth emulator
        connectAuthEmulator(auth, `http://localhost:${authPort}`, { disableWarnings: true });
        console.log(`✅ Auth emulator connected on port ${authPort}`);
      } catch (error) {
        console.log('Auth emulator connection skipped (already connected)');
      }

      try {
        // Connect to Firestore emulator
        connectFirestoreEmulator(db, 'localhost', parseInt(firestorePort));
        console.log(`✅ Firestore emulator connected on port ${firestorePort}`);
      } catch (error) {
        console.log('Firestore emulator connection skipped (already connected)');
      }

      try {
        // Connect to Storage emulator
        connectStorageEmulator(storage, 'localhost', parseInt(storagePort));
        console.log(`✅ Storage emulator connected on port ${storagePort}`);
      } catch (error) {
        console.log('Storage emulator connection skipped (already connected)');
      }

      console.log('🔥 Firebase emulators setup complete');
    };

    // Connect emulators
    connectEmulators();
  }
}

export default app;