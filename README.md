# Learn From Ared - Course Selling Platform

This is a course selling web application built with Next.js, Firebase, HeroUI, and Razorpay. It allows instructors to create and sell courses, and students to browse, purchase, and access course content.

## Tech Stack

- **Frontend**: Next.js 15 with App Router, React 19
- **UI Library**: HeroUI (successor to NextUI) with Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **Payment**: Razorpay
- **Forms**: React Hook Form with Zod validation
- **TypeScript**: Full type safety

## Setup Instructions

### 1. Environment Configuration

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env.local
```

Update `.env.local` with your actual Firebase and Razorpay credentials.

### 2. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication, Firestore, and Storage
3. Get your Firebase config from Project Settings
4. Generate a service account key for Firebase Admin SDK

### 3. Razorpay Setup

1. Create a Razorpay account at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Get your API keys from the dashboard
3. Add them to your environment variables

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
