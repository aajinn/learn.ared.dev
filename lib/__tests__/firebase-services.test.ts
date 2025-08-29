/**
 * @jest-environment jsdom
 */

// Mock Firebase modules
jest.mock('firebase/firestore', () => ({
    collection: jest.fn(),
    doc: jest.fn(),
    getDocs: jest.fn(),
    getDoc: jest.fn(),
    addDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    startAfter: jest.fn(),
    Timestamp: {
        now: jest.fn(() => ({ seconds: 1234567890, nanoseconds: 0 }))
    }
}));

jest.mock('firebase/storage', () => ({
    ref: jest.fn(),
    uploadBytes: jest.fn(),
    getDownloadURL: jest.fn(),
    deleteObject: jest.fn()
}));

jest.mock('../firebase', () => ({
    db: {},
    storage: {}
}));

import { FirestoreService, StorageService, ConnectionManager, FirebaseErrorHandler } from '../firebase-services';
import * as firestore from 'firebase/firestore';
import * as storage from 'firebase/storage';

describe('FirestoreService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getDocument', () => {
        test('should return document data when document exists', async () => {
            const mockDocSnap = {
                exists: () => true,
                id: 'test-id',
                data: () => ({ name: 'Test Document' })
            };

            (firestore.doc as jest.Mock).mockReturnValue({});
            (firestore.getDoc as jest.Mock).mockResolvedValue(mockDocSnap);

            const result = await FirestoreService.getDocument('test-collection', 'test-id');

            expect(result).toEqual({ id: 'test-id', name: 'Test Document' });
            expect(firestore.doc).toHaveBeenCalledWith({}, 'test-collection', 'test-id');
        });

        test('should return null when document does not exist', async () => {
            const mockDocSnap = {
                exists: () => false
            };

            (firestore.doc as jest.Mock).mockReturnValue({});
            (firestore.getDoc as jest.Mock).mockResolvedValue(mockDocSnap);

            const result = await FirestoreService.getDocument('test-collection', 'test-id');

            expect(result).toBeNull();
        });

        test('should throw error when operation fails', async () => {
            (firestore.doc as jest.Mock).mockReturnValue({});
            (firestore.getDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'));

            await expect(FirestoreService.getDocument('test-collection', 'test-id'))
                .rejects.toThrow('Firestore error');
        });
    });

    describe('addDocument', () => {
        test('should add document and return document ID', async () => {
            const mockDocRef = { id: 'new-doc-id' };

            (firestore.collection as jest.Mock).mockReturnValue({});
            (firestore.addDoc as jest.Mock).mockResolvedValue(mockDocRef);

            const result = await FirestoreService.addDocument('test-collection', { name: 'New Document' });

            expect(result).toBe('new-doc-id');
            expect(firestore.addDoc).toHaveBeenCalledWith({}, expect.objectContaining({
                name: 'New Document',
                createdAt: expect.any(Object),
                updatedAt: expect.any(Object)
            }));
        });
    });
});

describe('StorageService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('uploadFile', () => {
        test('should upload file and return download URL', async () => {
            const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
            const mockSnapshot = { ref: {} };
            const mockDownloadURL = 'https://example.com/test.txt';

            (storage.ref as jest.Mock).mockReturnValue({});
            (storage.uploadBytes as jest.Mock).mockResolvedValue(mockSnapshot);
            (storage.getDownloadURL as jest.Mock).mockResolvedValue(mockDownloadURL);

            const result = await StorageService.uploadFile(mockFile, 'test/path');

            expect(result).toBe(mockDownloadURL);
            expect(storage.ref).toHaveBeenCalledWith({}, 'test/path');
            expect(storage.uploadBytes).toHaveBeenCalledWith({}, mockFile);
        });
    });

    describe('deleteFile', () => {
        test('should delete file successfully', async () => {
            (storage.ref as jest.Mock).mockReturnValue({});
            (storage.deleteObject as jest.Mock).mockResolvedValue(undefined);

            await StorageService.deleteFile('test/path');

            expect(storage.ref).toHaveBeenCalledWith({}, 'test/path');
            expect(storage.deleteObject).toHaveBeenCalledWith({});
        });
    });
});

describe('ConnectionManager', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should check connection status', async () => {
        (firestore.collection as jest.Mock).mockReturnValue({});
        (firestore.query as jest.Mock).mockReturnValue({});
        (firestore.getDocs as jest.Mock).mockResolvedValue({});

        const result = await ConnectionManager.checkConnection();

        expect(result).toBe(true);
    });

    test('should return false on connection error', async () => {
        (firestore.collection as jest.Mock).mockReturnValue({});
        (firestore.query as jest.Mock).mockReturnValue({});
        (firestore.getDocs as jest.Mock).mockRejectedValue(new Error('Connection failed'));

        const result = await ConnectionManager.checkConnection();

        expect(result).toBe(false);
    });

    test('should add and remove connection listeners', () => {
        const mockCallback = jest.fn();

        const unsubscribe = ConnectionManager.addConnectionListener(mockCallback);

        expect(typeof unsubscribe).toBe('function');

        // Test unsubscribe
        unsubscribe();
    });
});

describe('FirebaseErrorHandler', () => {
    test('should return user-friendly error messages', () => {
        const authError = { code: 'auth/user-not-found' };
        const firestoreError = { code: 'permission-denied' };
        const unknownError = { code: 'some-unknown-error' };

        expect(FirebaseErrorHandler.getErrorMessage(authError))
            .toBe('No user found with this email address.');

        expect(FirebaseErrorHandler.getErrorMessage(firestoreError))
            .toBe('You do not have permission to perform this action.');

        expect(FirebaseErrorHandler.getErrorMessage(unknownError))
            .toBe('An unexpected error occurred. Please try again.');
    });

    test('should log errors with context', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        const error = new Error('Test error');

        FirebaseErrorHandler.logError(error, 'Test context');

        expect(consoleSpy).toHaveBeenCalledWith(
            'Firebase Error in Test context:',
            expect.objectContaining({
                message: 'Test error'
            })
        );

        consoleSpy.mockRestore();
    });
});