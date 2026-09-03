import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { OtpLogModel } from '@/lib/models/OtpLogModel';
import { OtpLogEntry } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// In-memory fallback database store in case MongoDB instance is starting up
const memoryOtpLogs: OtpLogEntry[] = [];

export async function GET() {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const logs = await OtpLogModel.find({}).sort({ createdAt: -1 }).lean();
      return NextResponse.json({ success: true, source: 'mongodb', data: logs });
    }
  } catch (err) {
    console.warn('GET /api/otp-logs MongoDB error, falling back to memory store:', err);
  }
  return NextResponse.json({ success: true, source: 'memory', data: memoryOtpLogs });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mobileNumber, otp, status = 'Pending', action } = body;

    // Handle clear all request
    if (action === 'clear') {
      const conn = await connectToDatabase();
      if (conn) {
        await OtpLogModel.deleteMany({});
      }
      memoryOtpLogs.length = 0;
      return NextResponse.json({ success: true, message: 'All OTP logs cleared' });
    }

    if (!mobileNumber) {
      return NextResponse.json({ success: false, error: 'Mobile number required' }, { status: 400 });
    }

    const conn = await connectToDatabase();
    let updatedLog: OtpLogEntry;

    if (conn) {
      const existing = await OtpLogModel.findOne({ mobileNumber });
      if (existing) {
        existing.otp = otp;
        existing.status = status;
        existing.createdAt = new Date().toISOString();
        await existing.save();
        updatedLog = existing.toObject() as unknown as OtpLogEntry;
      } else {
        const id = `OTP-${Math.floor(1000 + Math.random() * 9000)}`;
        const created = await OtpLogModel.create({
          id,
          mobileNumber,
          otp,
          status,
          createdAt: new Date().toISOString(),
        });
        updatedLog = created.toObject() as unknown as OtpLogEntry;
      }
    } else {
      // Memory fallback
      const existingIdx = memoryOtpLogs.findIndex((l) => l.mobileNumber === mobileNumber);
      if (existingIdx >= 0) {
        memoryOtpLogs[existingIdx] = {
          ...memoryOtpLogs[existingIdx],
          otp,
          status,
          createdAt: new Date().toISOString(),
        };
        updatedLog = memoryOtpLogs[existingIdx];
      } else {
        updatedLog = {
          id: `OTP-${Math.floor(1000 + Math.random() * 9000)}`,
          mobileNumber,
          otp,
          status,
          createdAt: new Date().toISOString(),
        };
        memoryOtpLogs.unshift(updatedLog);
      }
    }

    return NextResponse.json({ success: true, data: updatedLog });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to update OTP log';
    console.error('POST /api/otp-logs error:', err);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID parameter required' }, { status: 400 });
    }

    const conn = await connectToDatabase();
    if (conn) {
      await OtpLogModel.deleteOne({ id });
    }

    const idx = memoryOtpLogs.findIndex((l) => l.id === id);
    if (idx >= 0) memoryOtpLogs.splice(idx, 1);

    return NextResponse.json({ success: true, message: 'Deleted OTP log entry' });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Delete failed';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
