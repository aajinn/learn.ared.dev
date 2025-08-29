import Razorpay from 'razorpay';

// Initialize Razorpay instance for server-side operations
export const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Razorpay configuration for client-side
export const razorpayConfig = {
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  currency: 'INR',
  name: 'Learn From Ared',
  description: 'Course Purchase',
  theme: {
    color: '#3B82F6',
  },
};