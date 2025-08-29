#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔥 Setting up Firebase development environment...\n');

// Check if Firebase CLI is installed
function checkFirebaseCLI() {
  try {
    execSync('firebase --version', { stdio: 'pipe' });
    console.log('✅ Firebase CLI is installed');
    return true;
  } catch (error) {
    console.log('❌ Firebase CLI not found');
    console.log('Please install Firebase CLI: npm install -g firebase-tools');
    return false;
  }
}

// Check if firebase.json exists
function checkFirebaseConfig() {
  const configPath = path.join(process.cwd(), 'firebase.json');
  if (fs.existsSync(configPath)) {
    console.log('✅ Firebase configuration found');
    return true;
  } else {
    console.log('❌ Firebase configuration not found');
    return false;
  }
}

// Check environment variables
function checkEnvironmentVariables() {
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];

  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  const missingVars = requiredVars.filter(varName => {
    return !envContent.includes(varName) || envContent.includes(`${varName}=your_`);
  });

  if (missingVars.length === 0) {
    console.log('✅ Environment variables configured');
    return true;
  } else {
    console.log('❌ Missing or incomplete environment variables:');
    missingVars.forEach(varName => console.log(`   - ${varName}`));
    console.log('\nPlease update your .env.local file with your Firebase project configuration.');
    return false;
  }
}

// Initialize Firebase project (if needed)
function initializeFirebaseProject() {
  try {
    // Check if already logged in
    try {
      execSync('firebase projects:list', { stdio: 'pipe' });
      console.log('✅ Firebase CLI authenticated');
    } catch (error) {
      console.log('🔐 Please authenticate with Firebase CLI:');
      console.log('Run: firebase login');
      return false;
    }

    // Check if project is set
    try {
      const result = execSync('firebase use', { encoding: 'utf8' });
      if (result.includes('No active project')) {
        console.log('📋 No Firebase project selected');
        console.log('Run: firebase use --add');
        console.log('Then select your Firebase project');
        return false;
      } else {
        console.log('✅ Firebase project configured');
        return true;
      }
    } catch (error) {
      console.log('📋 Firebase project not configured');
      console.log('Run: firebase use --add');
      return false;
    }
  } catch (error) {
    console.log('❌ Error checking Firebase project:', error.message);
    return false;
  }
}

// Create sample data for emulators
function createSampleData() {
  const sampleDataPath = path.join(process.cwd(), 'firebase-sample-data.json');
  
  const sampleData = {
    users: {
      'admin-user-id': {
        email: 'admin@example.com',
        displayName: 'Admin User',
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      'instructor-user-id': {
        email: 'instructor@example.com',
        displayName: 'John Instructor',
        role: 'instructor',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      'student-user-id': {
        email: 'student@example.com',
        displayName: 'Jane Student',
        role: 'student',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },
    courses: {
      'sample-course-1': {
        title: 'Introduction to Web Development',
        description: 'Learn the basics of HTML, CSS, and JavaScript',
        shortDescription: 'Web development fundamentals',
        instructorId: 'instructor-user-id',
        instructorName: 'John Instructor',
        price: 99.99,
        currency: 'USD',
        thumbnailUrl: 'https://via.placeholder.com/400x300',
        category: 'Programming',
        tags: ['web', 'html', 'css', 'javascript'],
        lessons: [
          {
            id: 'lesson-1',
            title: 'HTML Basics',
            description: 'Introduction to HTML',
            duration: 30,
            order: 1,
            free: true
          },
          {
            id: 'lesson-2',
            title: 'CSS Styling',
            description: 'Learn CSS fundamentals',
            duration: 45,
            order: 2,
            free: false
          }
        ],
        published: true,
        enrollmentCount: 0,
        rating: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },
    categories: {
      'programming': {
        name: 'Programming',
        description: 'Software development and programming courses',
        slug: 'programming'
      },
      'design': {
        name: 'Design',
        description: 'UI/UX and graphic design courses',
        slug: 'design'
      }
    }
  };

  fs.writeFileSync(sampleDataPath, JSON.stringify(sampleData, null, 2));
  console.log('✅ Sample data created at firebase-sample-data.json');
}

// Main setup function
async function setupFirebaseDev() {
  console.log('Checking Firebase development setup...\n');

  const checks = [
    { name: 'Firebase CLI', check: checkFirebaseCLI },
    { name: 'Firebase Config', check: checkFirebaseConfig },
    { name: 'Environment Variables', check: checkEnvironmentVariables },
    { name: 'Firebase Project', check: initializeFirebaseProject }
  ];

  let allPassed = true;

  for (const { name, check } of checks) {
    const passed = check();
    if (!passed) {
      allPassed = false;
    }
    console.log('');
  }

  if (allPassed) {
    console.log('🎉 Firebase development environment is ready!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run emulators');
    console.log('2. Visit: http://localhost:4000 (Firebase Emulator UI)');
    console.log('3. Run: npm run dev (in another terminal)');
    
    // Create sample data
    createSampleData();
  } else {
    console.log('❌ Please fix the issues above before proceeding.');
    process.exit(1);
  }
}

// Run setup
setupFirebaseDev().catch(error => {
  console.error('Setup failed:', error);
  process.exit(1);
});