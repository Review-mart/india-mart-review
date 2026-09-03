'use client';

import React, { useState } from 'react';
import { FeedbackItem, FeedbackStatus } from '@/lib/types';
import { StarRating } from './StarRating';
import { X, ShieldCheck, Building2, Calendar, MessageSquare, Send, CheckCircle2, XCircle, Clock, Trash2, Edit3 } from 'lucide-react';

interface FeedbackDetailModalProps {
  feedback: FeedbackItem | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: FeedbackStatus) => void;
  onAddReply: (id: string, reply: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (feedback: FeedbackItem) => void;
}

export const FeedbackDetailModal: React.FC<FeedbackDetailModalProps> = ({
  feedback,
  onClose,
  onUpdateStatus,
  onAddReply,
  onDelete,
  onEdit,
}) => {
  const [replyText, setReplyText] = useState(feedback?.adminReply || '');
  const [isReplying, setIsReplying] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!feedback) return null;

  const handleSaveReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onAddReply(feedback.id, replyText.trim());
    setSuccessMsg('Official reply saved successfully!');
    setIsReplying(false);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 relative max-h-[90vh] flex flex-col">
        {/* Top Header */}
        <div className="bg-[#2e3192] text-white p-5 flex justify-between items-center shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-400 text-gray-900 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                {feedback.id}
              </span>
              <span className="text-xs text-gray-200 font-medium">{feedback.category}</span>
            </div>
            <h2 className="text-base font-bold mt-1 line-clamp-1">{feedback.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* User Info Bar */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-wrap justify-between items-center gap-3">
            <div>
              <div className="text-gray-500 font-medium">Submitted By:</div>
              <div className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {feedback.userName || 'Verified Buyer'}
              </div>
              <div className="text-gray-600 font-semibold">{feedback.mobileNumber}</div>
            </div>

            {feedback.supplierName && (
              <div className="border-l pl-4 border-gray-300">
                <div className="text-gray-500 font-medium">Reviewed Supplier:</div>
                <div className="text-sm font-bold text-[#00a699] flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {feedback.supplierName}
                </div>
              </div>
            )}

            <div>
              <div className="text-gray-500 font-medium">Submission Date:</div>
              <div className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(feedback.createdAt).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Ratings Grid */}
          <div className="space-y-2">
            <div className="font-bold text-gray-800 uppercase tracking-wide">
              Ratings Breakdown
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-amber-50/60 border border-amber-200 p-3 rounded-lg text-center space-y-1">
                <div className="text-[10px] text-gray-500 font-bold uppercase">Overall</div>
                <StarRating value={feedback.overallRating} readOnly size="sm" />
                <div className="font-extrabold text-amber-700 text-sm">
                  {feedback.overallRating}/5
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-center space-y-1">
                <div className="text-[10px] text-gray-500 font-medium uppercase">Quality</div>
                <StarRating value={feedback.aspectRatings?.quality || 5} readOnly size="sm" />
              </div>

              <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-center space-y-1">
                <div className="text-[10px] text-gray-500 font-medium uppercase">Communication</div>
                <StarRating value={feedback.aspectRatings?.communication || 5} readOnly size="sm" />
              </div>

              <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-center space-y-1">
                <div className="text-[10px] text-gray-500 font-medium uppercase">Delivery</div>
                <StarRating value={feedback.aspectRatings?.fulfillment || 4} readOnly size="sm" />
              </div>
            </div>
          </div>

          {/* Full Comments */}
          <div className="space-y-2">
            <div className="font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1">
              <MessageSquare className="w-4 h-4 text-[#00a699]" />
              Full Review & Comments
            </div>
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg text-gray-800 leading-relaxed text-sm">
              &quot;{feedback.comments}&quot;
            </div>
          </div>

          {/* Admin Action Buttons (Approve / Reject / Delete) */}
          <div className="bg-gray-100/70 border border-gray-200 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-800 uppercase tracking-wide">
                Moderation Status:
              </span>
              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                  feedback.status === 'Approved'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : feedback.status === 'Pending'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}
              >
                ● {feedback.status}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => onUpdateStatus(feedback.id, 'Approved')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-md font-bold flex items-center gap-1 shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Approve Feedback
              </button>

              <button
                type="button"
                onClick={() => onUpdateStatus(feedback.id, 'Pending')}
                className="bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-1.5 rounded-md font-bold flex items-center gap-1 shadow-xs transition-colors"
              >
                <Clock className="w-3.5 h-3.5" />
                Mark Pending
              </button>

              <button
                type="button"
                onClick={() => onUpdateStatus(feedback.id, 'Rejected')}
                className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-md font-bold flex items-center gap-1 shadow-xs transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                Reject Review
              </button>

              {onEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(feedback);
                  }}
                  className="bg-[#2e3192] hover:bg-[#1c1e69] text-white px-3.5 py-1.5 rounded-md font-bold flex items-center gap-1 shadow-xs transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Review Details
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this feedback permanently?')) {
                    onDelete(feedback.id);
                    onClose();
                  }
                }}
                className="ml-auto bg-gray-200 hover:bg-red-100 text-gray-700 hover:text-red-700 px-3.5 py-1.5 rounded-md font-bold flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>

          {/* Official Admin Reply Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-800 uppercase tracking-wide">
                Official IndiaMART Response
              </span>
              {!isReplying && (
                <button
                  type="button"
                  onClick={() => setIsReplying(true)}
                  className="text-xs font-bold text-[#00a699] hover:underline"
                >
                  {feedback.adminReply ? 'Edit Reply' : '+ Add Official Reply'}
                </button>
              )}
            </div>

            {isReplying ? (
              <form onSubmit={handleSaveReply} className="space-y-2">
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type official admin response to user feedback..."
                  className="w-full p-3 border border-gray-300 rounded-lg text-xs outline-none focus:border-[#00a699]"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsReplying(false)}
                    className="px-3 py-1.5 text-gray-600 font-semibold hover:bg-gray-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#00a699] hover:bg-[#008e82] text-white font-bold rounded flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    Save Response
                  </button>
                </div>
              </form>
            ) : (
              feedback.adminReply && (
                <div className="bg-emerald-50 border-l-4 border-[#00a699] p-3 rounded-r-lg text-xs text-gray-800">
                  <div className="font-bold text-[#00a699] mb-1">
                    Official Admin Reply:
                  </div>
                  <p>{feedback.adminReply}</p>
                </div>
              )
            )}

            {successMsg && (
              <p className="text-xs text-emerald-600 font-bold">{successMsg}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
