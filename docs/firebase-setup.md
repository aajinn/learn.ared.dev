# Firebase Setup Guide

This guide will help you set up Firebase for the course selling application, including both development (with emulators) and production environments.

## Prerequisites

1. **Firebase CLI**: Install globally
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Project**: Create a new project at [Firebase Console](https://console.firebase.google.com/)

## Quick Setup

Run the automated setup script:
```bash
npm run setup:firebase
```

This will check your configuration and guide you through any missing steps.

## Manual Setup

### 1. Firebase Project Configuration

1. Create a new Firebase project in the [Firebase Console](https://console.firebase.google.com/)
2. Enable the following services:
   - **Authentication** (Email/Password provider)
   - **Firestore Database**
   - **Storage**

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Firebase configuration:

```bash
cp .env.example .env.local
```

Get your Firebase config from Project Settings > General > Your apps > Web app:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
```

### 3. Firebase Admin SDK (Server-side)

For server-side operations, you'll need a service account:

1. Go to Project Settings > Service accounts
2. Generate a new private key
3. Add to your `.env.local`:

```env
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

### 4. Firebase CLI Authentication

```bash
firebase login
firebase use --add
```

Select your Firebase project when prompted.

## Development with Emulators

### Starting Emulators

```bash
# Start all emulators
npm run emulators

# Or start specific emulators
firebase emulators:start --only auth,firestore,storage
```

### Emulator Ports

- **Firestore**: http://localhost:8080
- **Authentication**: http://localhost:9099
- **Storage**: http://localhost:9199
- **Emulator UI**: http://localhost:4000

### Sample Data

The setup script creates `firebase-sample-data.json` with sample users, courses, and categories for testing.

### Importing/Exporting Data

```bash
# Export emulator data
npm run emulators:export

# Start emulators with imported data
npm run emulators:import
```

## Security Rules

### Firestore Rules

The `firestore.rules` file contains comprehensive security rules:

- **Users**: Can read/update own profile, admins can manage all
- **Courses**: Public read for published courses, instructors can manage their courses
- **Enrollments**: Users can read their enrollments, instructors can see their course enrollments
- **Payments**: Users can read their payments, admins can manage all

### Storage Rules

The `storage.rules` file protects file access:

- **Profile Images**: Public read, owner write
- **Course Content**: Enrolled users only
- **Course Images**: Public read, instructors write

## Deployment

### Deploy Security Rules

```bash
npm run firebase:deploy:rules
```

### Deploy Everything

```bash
npm run firebase:deploy
```

## Firestore Indexes

The `firestore.indexes.json` file contains optimized indexes for:

- Course listings with filtering and sorting
- User enrollments and progress
- Payment history
- Course reviews

Deploy indexes with:
```bash
firebase deploy --only firestore:indexes
```

## Authentication Setup

### Enable Providers

In Firebase Console > Authentication > Sign-in method:

1. **Email/Password**: Enable
2. **Google** (optional): Enable and configure
3. **Anonymous** (for testing): Enable

### User Roles

The application supports three user roles:

- **student**: Can browse and purchase courses
- **instructor**: Can create and manage courses
- **admin**: Full platform management

## Storage Setup

### Bucket Configuration

1. Go to Firebase Console > Storage
2. Set up security rules (automatically deployed from `storage.rules`)
3. Configure CORS if needed for web uploads

### File Organization

```
/users/{userId}/profile/     # Profile images
/courses/{courseId}/images/  # Course thumbnails
/courses/{courseId}/videos/  # Course videos (protected)
/courses/{courseId}/documents/ # Course materials (protected)
/public/                     # Public assets
/temp/{userId}/              # Temporary uploads
```

## Monitoring and Analytics

### Enable Analytics

1. Go to Firebase Console > Analytics
2. Enable Google Analytics
3. Configure events for course purchases, enrollments, etc.

### Performance Monitoring

1. Enable Performance Monitoring in Firebase Console
2. Add the Performance SDK to track page loads and API calls

## Troubleshooting

### Common Issues

1. **Emulator Connection Errors**
   - Ensure emulators are running
   - Check port conflicts
   - Clear browser cache

2. **Permission Denied Errors**
   - Check Firestore security rules
   - Verify user authentication
   - Ensure proper user roles

3. **Storage Upload Errors**
   - Check Storage security rules
   - Verify file size limits
   - Check CORS configuration

### Debug Mode

Set environment variable for detailed Firebase logs:
```bash
export FIREBASE_LOG_LEVEL=debug
```

## Production Checklist

- [ ] Environment variables configured
- [ ] Security rules deployed
- [ ] Indexes deployed
- [ ] Authentication providers configured
- [ ] Storage bucket configured
- [ ] Admin user created
- [ ] Analytics enabled
- [ ] Performance monitoring enabled

## Support

For Firebase-specific issues:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Support](https://firebase.google.com/support)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)