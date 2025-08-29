import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  DocumentSnapshot,
  QueryConstraint,
  Timestamp
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from './firebase';

// Generic Firestore service utilities
export class FirestoreService {
  /**
   * Get a document by ID
   */
  static async getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting document from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Get multiple documents with optional query constraints
   */
  static async getDocuments<T>(
    collectionName: string, 
    constraints: QueryConstraint[] = []
  ): Promise<T[]> {
    try {
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    } catch (error) {
      console.error(`Error getting documents from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Add a new document
   */
  static async addDocument<T>(collectionName: string, data: Omit<T, 'id'>): Promise<string> {
    try {
      const collectionRef = collection(db, collectionName);
      const docData = {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      const docRef = await addDoc(collectionRef, docData);
      return docRef.id;
    } catch (error) {
      console.error(`Error adding document to ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Update an existing document
   */
  static async updateDocument<T>(
    collectionName: string, 
    docId: string, 
    data: Partial<Omit<T, 'id' | 'createdAt'>>
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionName, docId);
      const updateData = {
        ...data,
        updatedAt: Timestamp.now()
      };
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a document
   */
  static async deleteDocument(collectionName: string, docId: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Get paginated documents
   */
  static async getPaginatedDocuments<T>(
    collectionName: string,
    pageSize: number = 10,
    lastDoc?: DocumentSnapshot,
    constraints: QueryConstraint[] = []
  ): Promise<{ documents: T[], lastDoc: DocumentSnapshot | null }> {
    try {
      const collectionRef = collection(db, collectionName);
      const queryConstraints = [...constraints, limit(pageSize)];
      
      if (lastDoc) {
        queryConstraints.push(startAfter(lastDoc));
      }
      
      const q = query(collectionRef, ...queryConstraints);
      const querySnapshot = await getDocs(q);
      
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
      
      const lastDocument = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
      
      return { documents, lastDoc: lastDocument };
    } catch (error) {
      console.error(`Error getting paginated documents from ${collectionName}:`, error);
      throw error;
    }
  }
}

// Firebase Storage service utilities
export class StorageService {
  /**
   * Upload a file to Firebase Storage
   */
  static async uploadFile(
    file: File, 
    path: string, 
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Delete a file from Firebase Storage
   */
  static async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Get download URL for a file
   */
  static async getDownloadURL(path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw error;
    }
  }
}

// Connection management utilities
export class ConnectionManager {
  private static connectionStatus: 'connected' | 'disconnected' | 'connecting' = 'disconnected';
  private static listeners: ((status: string) => void)[] = [];

  /**
   * Check Firebase connection status
   */
  static async checkConnection(): Promise<boolean> {
    try {
      // Try to read from Firestore to test connection
      const testCollection = collection(db, 'connection-test');
      await getDocs(query(testCollection, limit(1)));
      this.setConnectionStatus('connected');
      return true;
    } catch (error) {
      console.error('Firebase connection error:', error);
      this.setConnectionStatus('disconnected');
      return false;
    }
  }

  /**
   * Add connection status listener
   */
  static addConnectionListener(callback: (status: string) => void): () => void {
    this.listeners.push(callback);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Get current connection status
   */
  static getConnectionStatus(): string {
    return this.connectionStatus;
  }

  private static setConnectionStatus(status: 'connected' | 'disconnected' | 'connecting'): void {
    this.connectionStatus = status;
    this.listeners.forEach(listener => listener(status));
  }

  /**
   * Initialize connection monitoring
   */
  static initializeConnectionMonitoring(): void {
    // Check connection every 30 seconds
    setInterval(async () => {
      await this.checkConnection();
    }, 30000);

    // Initial connection check
    this.checkConnection();
  }
}

// Error handling utilities
export class FirebaseErrorHandler {
  /**
   * Convert Firebase error codes to user-friendly messages
   */
  static getErrorMessage(error: any): string {
    const errorCode = error?.code || 'unknown';
    
    const errorMessages: Record<string, string> = {
      'auth/user-not-found': 'No user found with this email address.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'permission-denied': 'You do not have permission to perform this action.',
      'not-found': 'The requested resource was not found.',
      'already-exists': 'The resource already exists.',
      'failed-precondition': 'The operation failed due to a precondition.',
      'unavailable': 'The service is currently unavailable. Please try again later.',
      'unknown': 'An unexpected error occurred. Please try again.'
    };

    return errorMessages[errorCode] || errorMessages['unknown'];
  }

  /**
   * Log error with context
   */
  static logError(error: any, context: string): void {
    console.error(`Firebase Error in ${context}:`, {
      code: error?.code,
      message: error?.message,
      stack: error?.stack
    });
  }
}