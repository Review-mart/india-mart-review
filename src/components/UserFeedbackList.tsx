'use client';

import React, { useState, useMemo } from 'react';
import { FeedbackItem, FeedbackCategory } from '@/lib/types';
import { StarRating } from './StarRating';
import { EditReviewModal } from './EditReviewModal';
import { FeedbackDetailModal } from './FeedbackDetailModal';
import {
  ShieldCheck,
  Calendar,
  Building2,
  ThumbsUp,
  MessageCircle,
  Edit3,
  Search,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  Clock,
  Eye,
  Share2,
  Award
} from 'lucide-react';

interface UserFeedbackListProps {
  feedbacks: FeedbackItem[];
  userMobile?: string;
  onRefreshData?: () => void;
}

export const UserFeedbackList: React.FC<UserFeedbackListProps> = ({
  feedbacks,
  userMobile,
  onRefreshData,
}) => {
  const [editingItem, setEditingItem] = useState<FeedbackItem | null>(null);
  const [viewingDetailItem, setViewingDetailItem] = useState<FeedbackItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'rating_high' | 'rating_low'>('newest');
  const [expandedAspects, setExpandedAspects] = useState<Record<string, boolean>>({});
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, { count: number; voted: boolean }>>({
    'fb_101': { count: 18, voted: false },
    'fb_102': { count: 12, voted: false },
    'fb_103': { count: 9, voted: false },
  });

  // Calculate statistics across all feedbacks
  const stats = useMemo(() => {
    if (feedbacks.length === 0) {
      return {
        avgRating: 0,
        totalCount: 0,
        recommendPct: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        aspectAvgs: { quality: 0, communication: 0, fulfillment: 0, value: 0 },
      };
    }

    const total = feedbacks.length;
    const sumRating = feedbacks.reduce((acc, f) => acc + f.overallRating, 0);
    const recommendCount = feedbacks.filter((f) => f.recommend).length;

    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let qualitySum = 0;
    let commSum = 0;
    let fulSum = 0;
    let valSum = 0;

    feedbacks.forEach((f) => {
      const r = Math.min(5, Math.max(1, Math.round(f.overallRating))) as 1 | 2 | 3 | 4 | 5;
      dist[r] = (dist[r] || 0) + 1;

      if (f.aspectRatings) {
        qualitySum += f.aspectRatings.quality || 5;
        commSum += f.aspectRatings.communication || 5;
        fulSum += f.aspectRatings.fulfillment || 4;
        valSum += f.aspectRatings.value || 5;
      } else {
        qualitySum += 5;
        commSum += 5;
        fulSum += 4;
        valSum += 5;
      }
    });

    return {
      avgRating: (sumRating / total).toFixed(1),
      totalCount: total,
      recommendPct: Math.round((recommendCount / total) * 100),
      distribution: dist,
      aspectAvgs: {
        quality: (qualitySum / total).toFixed(1),
        communication: (commSum / total).toFixed(1),
        fulfillment: (fulSum / total).toFixed(1),
        value: (valSum / total).toFixed(1),
      },
    };
  }, [feedbacks]);

  // Filter & Sort Feedbacks
  const processedFeedbacks = useMemo(() => {
    let result = userMobile
      ? feedbacks.filter((f) => f.mobileNumber === userMobile)
      : [...feedbacks];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.comments.toLowerCase().includes(q) ||
          (f.supplierName && f.supplierName.toLowerCase().includes(q)) ||
          (f.userName && f.userName.toLowerCase().includes(q)) ||
          f.category.toLowerCase().includes(q)
      );
    }

    // Rating Filter
    if (ratingFilter !== null) {
      result = result.filter((f) => Math.round(f.overallRating) === ratingFilter);
    }

    // Category Filter
    if (categoryFilter !== 'All') {
      result = result.filter((f) => f.category === categoryFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'rating_high') {
        return b.overallRating - a.overallRating;
      }
      if (sortBy === 'rating_low') {
        return a.overallRating - b.overallRating;
      }
      return 0;
    });

    return result;
  }, [feedbacks, userMobile, searchQuery, ratingFilter, categoryFilter, sortBy]);

  const handleHelpfulClick = (id: string) => {
    setHelpfulVotes((prev) => {
      const current = prev[id] || { count: 3, voted: false };
      if (current.voted) {
        return {
          ...prev,
          [id]: { count: current.count - 1, voted: false },
        };
      } else {
        return {
          ...prev,
          [id]: { count: current.count + 1, voted: true },
        };
      }
    });
  };

  const toggleAspects = (id: string) => {
    setExpandedAspects((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const categoriesList: (FeedbackCategory | 'All')[] = [
    'All',
    'Supplier Experience',
    'Platform Usability',
    'Buying Process',
    'Customer Support',
    'Technical Issue / Suggestion',
  ];

  return (
    <div className="space-y-6">
      {/* RATING SUMMARY & ANALYTICS BAR (If viewing public list) */}
      {!userMobile && feedbacks.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-200/80 p-6 space-y-6 animate-fadeIn">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100">
            {/* Main Score Box */}
            <div className="flex items-center gap-5">
              <div className="bg-gradient-to-br from-[#2e3192] to-[#00a699] text-white p-5 rounded-2xl text-center shadow-lg min-w-[130px]">
                <div className="text-4xl font-black tracking-tight">{stats.avgRating}</div>
                <div className="flex justify-center my-1">
                  <StarRating value={Number(stats.avgRating)} readOnly size="sm" />
                </div>
                <div className="text-[11px] font-medium text-emerald-200">
                  out of 5 stars
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900">Buyer Rating Summary</h3>
                  <span className="bg-emerald-100 text-[#00a699] text-xs px-2.5 py-0.5 rounded-full font-extrabold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  Based on <strong className="text-gray-900">{stats.totalCount} verified buyer reviews</strong> across IndiaMART categories.
                </p>
                <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 pt-1">
                  <ThumbsUp className="w-3.5 h-3.5 text-[#00a699]" />
                  <span><strong>{stats.recommendPct}%</strong> of buyers recommend suppliers on IndiaMART</span>
                </div>
              </div>
            </div>

            {/* Star Distribution Progress Bars */}
            <div className="w-full lg:w-72 space-y-1.5 text-xs bg-gray-50/80 p-3.5 rounded-xl border border-gray-200/60">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.distribution[star as 1 | 2 | 3 | 4 | 5] || 0;
                const pct = stats.totalCount ? Math.round((count / stats.totalCount) * 100) : 0;
                const isSelected = ratingFilter === star;

                return (
                  <button
                    key={star}
                    onClick={() => setRatingFilter(isSelected ? null : star)}
                    className={`w-full flex items-center gap-2 group text-left rounded-md px-1.5 py-0.5 transition-colors ${
                      isSelected ? 'bg-amber-100 font-bold' : 'hover:bg-gray-200/60'
                    }`}
                  >
                    <span className="w-8 font-bold text-gray-700 shrink-0 text-right">{star} ★</span>
                    <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 group-hover:bg-amber-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 text-[11px] text-gray-500 font-medium shrink-0 text-right">
                      {count} ({pct}%)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aspect Rating Score Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Product Quality</span>
                <div className="font-extrabold text-slate-800 text-sm">{stats.aspectAvgs.quality} / 5.0</div>
              </div>
              <Award className="w-5 h-5 text-[#00a699]" />
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Communication</span>
                <div className="font-extrabold text-slate-800 text-sm">{stats.aspectAvgs.communication} / 5.0</div>
              </div>
              <MessageCircle className="w-5 h-5 text-[#2e3192]" />
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Fulfillment</span>
                <div className="font-extrabold text-slate-800 text-sm">{stats.aspectAvgs.fulfillment} / 5.0</div>
              </div>
              <Building2 className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Value for Money</span>
                <div className="font-extrabold text-slate-800 text-sm">{stats.aspectAvgs.value} / 5.0</div>
              </div>
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
          </div>
        </div>
      )}

      {/* REVIEWS FILTER & SEARCH TOOLBAR */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-4 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Title & Count */}
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-gray-900">
              {userMobile ? 'My Submitted Reviews' : 'Verified Buyer & Supplier Reviews'}
            </h2>
            <span className="bg-[#2e3192] text-white text-xs px-2.5 py-0.5 rounded-full font-extrabold">
              {processedFeedbacks.length}
            </span>
          </div>

          {/* Search Box & Sort */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reviews or sellers..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg outline-none focus:border-[#00a699] focus:bg-white transition-all placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <SlidersHorizontal className="w-4 h-4 text-gray-500 shrink-0 hidden sm:block" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'rating_high' | 'rating_low')}
                className="w-full sm:w-auto bg-gray-50 border border-gray-300 text-gray-800 text-xs font-semibold rounded-lg px-3 py-1.5 outline-none focus:border-[#00a699]"
              >
                <option value="newest">Sort by: Newest First</option>
                <option value="rating_high">Sort by: Highest Rating</option>
                <option value="rating_low">Sort by: Lowest Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills & Rating Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            <span className="text-[11px] font-bold text-gray-500 mr-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3 text-[#00a699]" /> Category:
            </span>
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
                  categoryFilter === cat
                    ? 'bg-[#00a699] text-white shadow-xs'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {ratingFilter !== null && (
            <button
              onClick={() => setRatingFilter(null)}
              className="text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full font-bold transition-colors"
            >
              Clear Star Filter ({ratingFilter}★) ✕
            </button>
          )}
        </div>
      </div>

      {/* REVIEWS LISTING CARDS */}
      {processedFeedbacks.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center text-gray-500 space-y-3 animate-fadeIn">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
            <MessageCircle className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-gray-800">No Matching Reviews Found</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            {searchQuery || ratingFilter !== null || categoryFilter !== 'All'
              ? 'Try adjusting your search terms or clearing the selected rating/category filters above.'
              : 'Be the first buyer to submit verified feedback on IndiaMART!'}
          </p>
          {(searchQuery || ratingFilter !== null || categoryFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setRatingFilter(null);
                setCategoryFilter('All');
              }}
              className="bg-[#00a699] hover:bg-[#008e82] text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {processedFeedbacks.map((item) => {
            const isOwner = userMobile && item.mobileNumber === userMobile;
            const helpfulState = helpfulVotes[item.id] || { count: 4, voted: false };
            const showAspects = expandedAspects[item.id] || false;
            const reviewerInitials = (item.userName || 'Verified Buyer')
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-md transition-all p-5 md:p-6 space-y-4 relative group"
              >
                {/* Review Header: User Profile & Badges */}
                <div className="flex flex-wrap justify-between items-start gap-3">
                  <div className="flex items-center gap-3">
                    {/* User Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1c1e69] to-[#00a699] text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                      {reviewerInitials}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-gray-900">
                          {item.userName || 'Verified Buyer'}
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-[#00a699]" />
                          Verified Buyer ({item.mobileNumber})
                        </span>
                      </div>

                      <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {new Date(item.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>

                        {item.updatedAt && (
                          <span className="text-amber-700 font-semibold text-[10px] bg-amber-50 px-1.5 py-0.5 rounded">
                            (Updated)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Pill & Action Buttons */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                        item.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : item.status === 'Pending'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {item.status}
                    </span>

                    {/* Owner Edit Button */}
                    {isOwner && (
                      <button
                        onClick={() => setEditingItem(item)}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-600" /> Edit
                      </button>
                    )}

                    {/* View Details Modal Button */}
                    <button
                      onClick={() => setViewingDetailItem(item)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-lg text-xs font-medium transition-colors"
                      title="View Full Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Rating Stars & Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <StarRating value={item.overallRating} readOnly size="md" />
                    <span className="text-xs font-black text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      {item.overallRating}.0 / 5.0
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 group-hover:text-[#2e3192] transition-colors">
                    {item.title}
                  </h3>
                </div>

                {/* Tags Bar: Category & Supplier Name */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="bg-indigo-50 border border-indigo-200 text-[#2e3192] text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                    Category: {item.category}
                  </span>

                  {item.supplierName && (
                    <span className="bg-teal-50 border border-teal-200 text-[#00a699] text-[11px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      Supplier: {item.supplierName}
                    </span>
                  )}
                </div>

                {/* Review Text Comment */}
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed font-normal bg-gray-50/60 p-3.5 rounded-xl border border-gray-100">
                  &quot;{item.comments}&quot;
                </p>

                {/* Detailed Criteria Dropdown Toggle */}
                {item.aspectRatings && (
                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={() => toggleAspects(item.id)}
                      className="text-xs font-semibold text-gray-600 hover:text-[#00a699] flex items-center gap-1 transition-colors"
                    >
                      {showAspects ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      <span>{showAspects ? 'Hide Detailed Criteria Ratings' : 'View Detailed Criteria Ratings'}</span>
                    </button>

                    {showAspects && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div>
                          <span className="text-[10px] text-gray-500 font-bold block">Product Quality</span>
                          <StarRating value={item.aspectRatings.quality} readOnly size="sm" />
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 font-bold block">Communication</span>
                          <StarRating value={item.aspectRatings.communication} readOnly size="sm" />
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 font-bold block">Fulfillment</span>
                          <StarRating value={item.aspectRatings.fulfillment} readOnly size="sm" />
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 font-bold block">Value for Money</span>
                          <StarRating value={item.aspectRatings.value} readOnly size="sm" />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Official IndiaMART Admin Reply */}
                {item.adminReply && (
                  <div className="bg-emerald-50/90 border-l-4 border-[#00a699] p-4 rounded-r-xl text-xs space-y-1.5 shadow-2xs">
                    <div className="font-bold text-[#00a699] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#00a699]" />
                      <span>Official IndiaMART Moderation Response:</span>
                    </div>
                    <p className="text-gray-800 text-xs leading-relaxed italic">
                      &quot;{item.adminReply}&quot;
                    </p>
                  </div>
                )}

                {/* Card Footer Bar: Recommendation & Helpful Vote */}
                <div className="flex flex-wrap justify-between items-center pt-3 border-t border-gray-100 text-xs">
                  <div className="flex items-center gap-4">
                    {item.recommend ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                        <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                        Recommends IndiaMART Marketplace
                      </span>
                    ) : (
                      <span className="text-gray-500 text-[11px]">General Marketplace Feedback</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleHelpfulClick(item.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        helpfulState.voted
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${helpfulState.voted ? 'fill-emerald-600' : ''}`} />
                      <span>Helpful ({helpfulState.count})</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Review Modal */}
      {editingItem && (
        <EditReviewModal
          feedback={editingItem}
          onClose={() => setEditingItem(null)}
          onRefreshData={() => {
            if (onRefreshData) onRefreshData();
          }}
          isAdminMode={false}
        />
      )}

      {/* Feedback Detail Modal */}
      {viewingDetailItem && (
        <FeedbackDetailModal
          feedback={viewingDetailItem}
          onClose={() => setViewingDetailItem(null)}
          onUpdateStatus={() => {}}
          onAddReply={() => {}}
          onDelete={() => {}}
          onEdit={(item) => setEditingItem(item)}
        />
      )}
    </div>
  );
};

