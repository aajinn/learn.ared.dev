/**
 * @jest-environment jsdom
 */

// Mock Firebase modules before importing
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({
    options: {
      apiKey: 'test-api-key',
      projectId: 'test-project',
      authDomain: 'test-project.firebaseapp.com',
      storageBucket: 'test-project.appspot.com',
    }
  })),
  getApps: jest.fn(() => [])
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    app: {
      options: {
        apiKey: 'test-api-key',
        projectId: 'test-project',
        authDomain: 'test-project.firebaseapp.com',
      }
    }
  })),
  connectAuthEmulator: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  connectFirestoreEmulator: jest.fn()
}));

jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => ({})),
  connectStorageEmulator: jest.fn()
}));

// Set environment variables for testing
process.env.NODE_ENV;
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project';

import { auth, db, storage } from '../firebase';

describe('Firebase Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize Firebase services', () => {
    expect(auth).toBeDefined();
    expect(db).toBeDefined();
    expect(storage).toBeDefined();
  });

  test('should have correct Firebase app configuration', () => {
    expect(auth.app.options.apiKey).toBe('test-api-key');
    expect(auth.app.options.projectId).toBe('test-project');
  });

  test('should export Firebase services as objects', () => {
    expect(typeof auth).toBe('object');
    expect(typeof db).toBe('object');
    expect(typeof storage).toBe('object');
  });

  test('should have auth service with app reference', () => {
    expect(auth.app).toBeDefined();
    expect(auth.app.options).toBeDefined();
  });

  test('should handle environment variables correctly', () => {
    expect(process.env.NEXT_PUBLIC_FIREBASE_API_KEY).toBe('test-api-key');
    expect(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID).toBe('test-project');
  });
});