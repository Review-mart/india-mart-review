import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOtpLog extends Document {
  id: string;
  mobileNumber: string;
  otp: string;
  createdAt: string;
  status: 'Verified' | 'Pending';
}

const OtpLogSchema = new Schema<IOtpLog>(
  {
    id: { type: String, required: true, unique: true },
    mobileNumber: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    createdAt: { type: String, required: true, default: () => new Date().toISOString() },
    status: { type: String, enum: ['Verified', 'Pending'], required: true, default: 'Pending' },
  },
  { timestamps: true }
);

export const OtpLogModel: Model<IOtpLog> =
  mongoose.models.OtpLog || mongoose.model<IOtpLog>('OtpLog', OtpLogSchema);
