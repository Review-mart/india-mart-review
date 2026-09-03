import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFeedback extends Document {
  id: string;
  mobileNumber: string;
  userName?: string;
  overallRating: number;
  aspectRatings: {
    quality: number;
    communication: number;
    fulfillment: number;
    value: number;
  };
  category: string;
  supplierName?: string;
  title: string;
  comments: string;
  recommend: boolean;
  attachedImages: string[];
  status: 'Pending' | 'Approved' | 'Rejected';
  adminReply?: string;
  createdAt: string;
  updatedAt?: string;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    id: { type: String, required: true, unique: true },
    mobileNumber: { type: String, required: true, index: true },
    userName: { type: String },
    overallRating: { type: Number, required: true },
    aspectRatings: {
      quality: { type: Number, required: true },
      communication: { type: Number, required: true },
      fulfillment: { type: Number, required: true },
      value: { type: Number, required: true },
    },
    category: { type: String, required: true },
    supplierName: { type: String },
    title: { type: String, required: true },
    comments: { type: String, required: true },
    recommend: { type: Boolean, default: true },
    attachedImages: [{ type: String }],
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    adminReply: { type: String },
    createdAt: { type: String, required: true, default: () => new Date().toISOString() },
    updatedAt: { type: String },
  },
  { timestamps: true }
);

export const FeedbackModel: Model<IFeedback> =
  mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);
