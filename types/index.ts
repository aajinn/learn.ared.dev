import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'student' | 'instructor' | 'admin';
  profileImage?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  instructorId: string;
  instructorName: string;
  price: number;
  currency: string;
  thumbnailUrl: string;
  videoUrl?: string;
  category: string;
  tags: string[];
  lessons: Lesson[];
  published: boolean;
  enrollmentCount: number;
  rating: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  contentUrl?: string;
  duration: number; // in minutes
  order: number;
  free: boolean; // preview lessons
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Timestamp;
  progress: LessonProgress[];
  completed: boolean;
  completedAt?: Timestamp;
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt?: Timestamp;
  watchTime: number; // in seconds
}

export interface Payment {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  currency: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Authentication and Authorization Types
export type UserRole = 'student' | 'instructor' | 'admin';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
}

export interface PasswordResetRequest {
  email: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// Form Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// Course Form Types
export interface CourseFormData {
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  currency: string;
  category: string;
  tags: string[];
  thumbnailFile?: File;
  videoFile?: File;
  lessons: LessonFormData[];
}

export interface LessonFormData {
  title: string;
  description: string;
  duration: number;
  order: number;
  free: boolean;
  videoFile?: File;
  contentFile?: File;
}

// Payment Form Types
export interface PaymentFormData {
  courseId: string;
  amount: number;
  currency: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Search and Filter Types
export interface CourseFilters {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  tags?: string[];
  instructor?: string;
}

export interface SearchParams {
  query?: string;
  filters?: CourseFilters;
  sortBy?: 'price' | 'rating' | 'enrollmentCount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Dashboard Types
export interface StudentDashboardData {
  enrolledCourses: EnrollmentWithCourse[];
  recentActivity: ActivityItem[];
  recommendations: Course[];
  stats: {
    totalCourses: number;
    completedCourses: number;
    totalWatchTime: number;
  };
}

export interface InstructorDashboardData {
  courses: Course[];
  earnings: EarningsData;
  students: StudentEnrollment[];
  analytics: CourseAnalytics[];
}

export interface AdminDashboardData {
  platformStats: PlatformStats;
  recentCourses: Course[];
  recentUsers: User[];
  recentPayments: Payment[];
  pendingApprovals: Course[];
}

// Extended Types for Dashboard
export interface EnrollmentWithCourse extends Enrollment {
  course: Course;
}

export interface ActivityItem {
  id: string;
  type: 'enrollment' | 'lesson_completed' | 'course_completed';
  courseId: string;
  courseName: string;
  timestamp: Timestamp;
  details?: any;
}

export interface EarningsData {
  totalEarnings: number;
  monthlyEarnings: number;
  pendingPayouts: number;
  earningsHistory: {
    month: string;
    amount: number;
  }[];
}

export interface StudentEnrollment {
  userId: string;
  userName: string;
  userEmail: string;
  courseId: string;
  courseName: string;
  enrolledAt: Timestamp;
  progress: number;
}

export interface CourseAnalytics {
  courseId: string;
  courseName: string;
  enrollmentCount: number;
  completionRate: number;
  averageRating: number;
  totalRevenue: number;
  monthlyEnrollments: {
    month: string;
    count: number;
  }[];
}

export interface PlatformStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  monthlyGrowth: {
    users: number;
    courses: number;
    revenue: number;
  };
}

// Utility Types
export type CreateCourseRequest = Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'enrollmentCount' | 'rating'>;
export type UpdateCourseRequest = Partial<CreateCourseRequest>;
export type CreateUserRequest = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateUserRequest = Partial<Omit<User, 'id' | 'email' | 'createdAt' | 'updatedAt'>>;

// Status Types
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';
export type CourseStatus = 'draft' | 'published' | 'archived';
export type EnrollmentStatus = 'active' | 'completed' | 'suspended';