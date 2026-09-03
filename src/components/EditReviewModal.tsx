'use client';

import React, { useState } from 'react';
import { FeedbackItem, FeedbackCategory, FeedbackStatus, RatingBreakdown } from '@/lib/types';
import { StarRating } from './StarRating';
import { updateFeedback } from '@/lib/storage';
import { X, Save, ShieldCheck, Building2, CheckCircle2, RefreshCw, Star, Edit3 } from 'lucide-react';

interface EditReviewModalProps {
  feedback: FeedbackItem | null;
  onClose: () => void;
  onRefreshData: () => void;
  isAdminMode?: boolean;
}

const CATEGORIES: FeedbackCategory[] = [
  'Supplier Experience',
  'Platform Usability',
  'Buying Process',
  'Customer Support',
  'Technical Issue / Suggestion',
];

export const EditReviewModal: React.FC<EditReviewModalProps> = ({
  feedback,
  onClose,
  onRefreshData,
  isAdminMode = false,
}) => {
  if (!feedback) return null;

  const [title, setTitle] = useState(feedback.title);
  const [comments, setComments] = useState(feedback.comments);
  const [overallRating, setOverallRating] = useState<number>(feedback.overallRating);
  const [aspectRatings, setAspectRatings] = useState<RatingBreakdown>(
    feedback.aspectRatings || { quality: 5, communication: 5, fulfillment: 4, value: 5 }
  );
  const [category, setCategory] = useState<FeedbackCategory>(feedback.category);
  const [supplierName, setSupplierName] = useState(feedback.supplierName || '');
  const [userName, setUserName] = useState(feedback.userName || '');
  const [status, setStatus] = useState<FeedbackStatus>(feedback.status);
  const [adminReply, setAdminReply] = useState(feedback.adminReply || '');
  const [recommend, setRecommend] = useState(feedback.recommend);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMsg('Please enter a review headline/title.');
      return;
    }

    if (!comments.trim() || comments.trim().length < 10) {
      setErrorMsg('Review comments must be at least 10 characters.');
      return;
    }

    setErrorMsg('');
    setIsSaving(true);

    setTimeout(() => {
      const updatedItem: FeedbackItem = {
        ...feedback,
        title: title.trim(),
        comments: comments.trim(),
        overallRating,
        aspectRatings,
        category,
        supplierName: supplierName.trim() || undefined,
        userName: userName.trim() || undefined,
        status,
        adminReply: adminReply.trim() || undefined,
        recommend,
        updatedAt: new Date().toISOString(),
      };

      updateFeedback(updatedItem);
      onRefreshData();
      setIsSaving(false);
      setSuccessMsg('Review updated successfully!');

      setTimeout(() => {
        onClose();
      }, 1000);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 relative max-h-[92vh] flex flex-col">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-[#2e3192] to-[#00a699] text-white p-5 flex justify-between items-center shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-gray-900 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                Edit & Update Review
              </span>
              <span className="text-xs text-emerald-200 font-mono">{feedback.id}</span>
            </div>
            <h2 className="text-base font-bold mt-1">Modify Feedback & Rating Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {successMsg ? (
            <div className="bg-emerald-50 border-2 border-emerald-400 p-6 rounded-xl text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-emerald-900">{successMsg}</h3>
              <p className="text-xs text-emerald-700">All review changes have been saved to local storage.</p>
            </div>
          ) : (
            <>
              {/* Status & User Mobile Banner */}
              <div className="bg-gray-50 border border-gray-200 p-3.5 rounded-xl flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-gray-800">{feedback.mobileNumber}</span>
                  <span className="text-gray-400 text-[11px]">
                    (Created {new Date(feedback.createdAt).toLocaleDateString('en-IN')})
                  </span>
                </div>

                {isAdminMode && (
                  <div className="flex items-center gap-2">
                    <label className="font-bold text-gray-700">Moderation Status:</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as FeedbackStatus)}
                      className="bg-white border border-gray-300 rounded-lg px-2.5 py-1 font-bold text-xs outline-none"
                    >
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Overall Star Rating */}
              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 space-y-2">
                <label className="block font-bold text-gray-800 uppercase tracking-wide">
                  Overall Rating
                </label>
                <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-amber-200">
                  <StarRating value={overallRating} onChange={setOverallRating} size="lg" showLabels={true} />
                </div>
              </div>

              {/* Detailed Aspect Ratings */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                <label className="block font-bold text-gray-800 uppercase tracking-wide">
                  Detailed Criteria Ratings
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white p-2.5 rounded-lg border border-gray-200 flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Product Quality</span>
                    <StarRating
                      value={aspectRatings.quality}
                      onChange={(q) => setAspectRatings((prev) => ({ ...prev, quality: q }))}
                      size="sm"
                    />
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-gray-200 flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Communication</span>
                    <StarRating
                      value={aspectRatings.communication}
                      onChange={(c) => setAspectRatings((prev) => ({ ...prev, communication: c }))}
                      size="sm"
                    />
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-gray-200 flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Delivery / Fulfillment</span>
                    <StarRating
                      value={aspectRatings.fulfillment}
                      onChange={(f) => setAspectRatings((prev) => ({ ...prev, fulfillment: f }))}
                      size="sm"
                    />
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-gray-200 flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Value for Money</span>
                    <StarRating
                      value={aspectRatings.value}
                      onChange={(v) => setAspectRatings((prev) => ({ ...prev, value: v }))}
                      size="sm"
                    />
                  </div>
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Review Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-800 font-semibold outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Review Headline / Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-800 font-bold outline-none"
                    placeholder="Review summary headline"
                    required
                  />
                </div>
              </div>

              {/* User Name & Supplier Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Reviewer Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-800 outline-none"
                    placeholder="e.g. Verified Buyer Name"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Supplier / Company Name
                  </label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-800 outline-none"
                    placeholder="e.g. Supplier Name"
                  />
                </div>
              </div>

              {/* Full Comments */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Detailed Comments & Experience <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 text-xs text-gray-800 outline-none"
                  required
                />
              </div>

              {/* Admin Official Reply (if Admin mode) */}
              {isAdminMode && (
                <div>
                  <label className="block font-bold text-[#00a699] mb-1">
                    Official IndiaMART Admin Response
                  </label>
                  <textarea
                    rows={2}
                    value={adminReply}
                    onChange={(e) => setAdminReply(e.target.value)}
                    placeholder="Type official admin response to be displayed under this review..."
                    className="w-full bg-emerald-50/50 border border-emerald-300 rounded-lg p-2.5 text-xs text-gray-800 outline-none"
                  />
                </div>
              )}

              {errorMsg && <p className="text-xs font-bold text-red-600">{errorMsg}</p>}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-[#00a699] hover:bg-[#008e82] text-white font-bold rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Updated Review
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
