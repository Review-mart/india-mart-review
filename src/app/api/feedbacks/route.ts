import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { FeedbackModel } from '@/lib/models/FeedbackModel';
import { FeedbackItem } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// In-memory fallback database store
const memoryFeedbacks: FeedbackItem[] = [];

export async function GET() {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const items = await FeedbackModel.find({}).sort({ createdAt: -1 }).lean();
      return NextResponse.json({ success: true, source: 'mongodb', data: items });
    }
  } catch (err) {
    console.warn('GET /api/feedbacks MongoDB error, falling back to memory store:', err);
  }
  return NextResponse.json({ success: true, source: 'memory', data: memoryFeedbacks });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = `IM-FB-${Math.floor(1000 + Math.random() * 9000)}`;
    const newFeedback: FeedbackItem = {
      ...body,
      id,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    const conn = await connectToDatabase();
    if (conn) {
      await FeedbackModel.create(newFeedback);
    } else {
      memoryFeedbacks.unshift(newFeedback);
    }

    return NextResponse.json({ success: true, data: newFeedback });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to save feedback';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ids, status, adminReply, action } = body;

    const conn = await connectToDatabase();

    // Bulk status update
    if (action === 'bulk_status' && Array.isArray(ids) && status) {
      if (conn) {
        await FeedbackModel.updateMany({ id: { $in: ids } }, { status, updatedAt: new Date().toISOString() });
      }
      memoryFeedbacks.forEach((item) => {
        if (ids.includes(item.id)) {
          item.status = status;
          item.updatedAt = new Date().toISOString();
        }
      });
      return NextResponse.json({ success: true, message: 'Bulk status updated' });
    }

    // Single item update
    if (!id) {
      return NextResponse.json({ success: false, error: 'Feedback ID required' }, { status: 400 });
    }

    if (conn) {
      const updateData: Partial<FeedbackItem> = { updatedAt: new Date().toISOString() };
      if (status) updateData.status = status;
      if (adminReply !== undefined) updateData.adminReply = adminReply;

      const updated = await FeedbackModel.findOneAndUpdate({ id }, updateData, { new: true }).lean();
      return NextResponse.json({ success: true, data: updated });
    } else {
      const idx = memoryFeedbacks.findIndex((f) => f.id === id);
      if (idx >= 0) {
        if (status) memoryFeedbacks[idx].status = status;
        if (adminReply !== undefined) memoryFeedbacks[idx].adminReply = adminReply;
        memoryFeedbacks[idx].updatedAt = new Date().toISOString();
        return NextResponse.json({ success: true, data: memoryFeedbacks[idx] });
      }
    }

    return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const idsParam = searchParams.get('ids');

    const conn = await connectToDatabase();

    if (idsParam) {
      const ids = idsParam.split(',');
      if (conn) {
        await FeedbackModel.deleteMany({ id: { $in: ids } });
      }
      for (let i = memoryFeedbacks.length - 1; i >= 0; i--) {
        if (ids.includes(memoryFeedbacks[i].id)) {
          memoryFeedbacks.splice(i, 1);
        }
      }
      return NextResponse.json({ success: true, message: 'Bulk feedback deleted' });
    }

    if (id) {
      if (conn) {
        await FeedbackModel.deleteOne({ id });
      }
      const idx = memoryFeedbacks.findIndex((f) => f.id === id);
      if (idx >= 0) memoryFeedbacks.splice(idx, 1);

      return NextResponse.json({ success: true, message: 'Feedback deleted' });
    }

    return NextResponse.json({ success: false, error: 'ID or IDs required' }, { status: 400 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Delete failed';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
