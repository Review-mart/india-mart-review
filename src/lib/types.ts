export interface RatingBreakdown {
  quality: number;
  communication: number;
  fulfillment: number;
  value: number;
}

export type FeedbackCategory =
  | 'Supplier Experience'
  | 'Platform Usability'
  | 'Buying Process'
  | 'Customer Support'
  | 'Technical Issue / Suggestion';

export type FeedbackStatus = 'Pending' | 'Approved' | 'Rejected';

export interface FeedbackItem {
  id: string;
  mobileNumber: string;
  userName?: string;
  overallRating: number;
  aspectRatings: RatingBreakdown;
  category: FeedbackCategory;
  supplierName?: string;
  title: string;
  comments: string;
  recommend: boolean;
  attachedImages?: string[];
  status: FeedbackStatus;
  adminReply?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserSession {
  mobileNumber: string;
  isVerified: boolean;
  verifiedAt?: string;
}

export interface AdminUser {
  username: string;
  role: 'admin';
  name: string;
  lastLogin: string;
}

export interface OtpLogEntry {
  id: string;
  mobileNumber: string;
  otp: string;
  createdAt: string;
  status: 'Verified' | 'Pending';
}

