'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { FeedbackItem, FeedbackStatus, OtpLogEntry } from '@/lib/types';
import { StarRating } from './StarRating';
import { FeedbackDetailModal } from './FeedbackDetailModal';
import { EditReviewModal } from './EditReviewModal';
import {
  updateFeedbackStatus,
  addAdminReplyToFeedback,
  deleteFeedback,
  bulkUpdateFeedbackStatus,
  bulkDeleteFeedbacks,
  resetFeedbacksToDefault,
  getStoredOtpLogs,
  fetchOtpLogsFromMongoDB,
  fetchFeedbacksFromMongoDB,
  deleteOtpLog,
  clearOtpLogs,
} from '@/lib/storage';
import {
  ShieldCheck,
  Search,
  Download,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Trash2,
  LogOut,
  Filter,
  BarChart3,
  MessageSquare,
  Edit3,
  KeyRound,
  Copy,
  Check,
  Radio,
  RefreshCw,
  PhoneCall
} from 'lucide-react';

interface AdminDashboardProps {
  feedbacks: FeedbackItem[];
  onRefreshData: () => void;
  onAdminLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  feedbacks,
  onRefreshData,
  onAdminLogout,
}) => {
  // Tab view: default to 'otp_logs' as requested by user
  const [activeTab, setActiveTab] = useState<'otp_logs' | 'reviews'>('otp_logs');
  const [otpLogs, setOtpLogs] = useState<OtpLogEntry[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Search & Filter state for Reviews
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeModalItem, setActiveModalItem] = useState<FeedbackItem | null>(null);
  const [editingModalItem, setEditingModalItem] = useState<FeedbackItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Search state for OTP logs
  const [otpSearchQuery, setOtpSearchQuery] = useState('');

  // Real-time subscription to MongoDB OTP log updates
  const refreshOtpLogs = useCallback(() => {
    setOtpLogs(getStoredOtpLogs());
    fetchOtpLogsFromMongoDB().then((data) => {
      if (Array.isArray(data)) setOtpLogs(data);
    });
  }, []);

  useEffect(() => {
    refreshOtpLogs();

    const handleOtpUpdate = () => setOtpLogs(getStoredOtpLogs());
    const handleStorageUpdate = () => setOtpLogs(getStoredOtpLogs());

    window.addEventListener('indiamart_otp_updated', handleOtpUpdate);
    window.addEventListener('indiamart_storage_updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('indiamart_otp_updated', handleOtpUpdate);
      window.removeEventListener('indiamart_storage_updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [refreshOtpLogs]);

  const handleCopyOtp = (id: string, otp: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteOtp = (id: string) => {
    const updated = deleteOtpLog(id);
    setOtpLogs(updated);
  };

  const handleClearAllOtps = () => {
    if (confirm('Are you sure you want to clear all user OTP records?')) {
      clearOtpLogs();
      setOtpLogs([]);
    }
  };

  // Filtered OTP Logs
  const filteredOtpLogs = useMemo(() => {
    const term = otpSearchQuery.toLowerCase().trim();
    if (!term) return otpLogs;
    return otpLogs.filter(
      (log) =>
        log.mobileNumber.toLowerCase().includes(term) ||
        log.otp.toLowerCase().includes(term)
    );
  }, [otpLogs, otpSearchQuery]);

  // Compute Overview Metrics for Reviews
  const totalCount = feedbacks.length;
  const avgRating = totalCount
    ? (feedbacks.reduce((acc, curr) => acc + curr.overallRating, 0) / totalCount).toFixed(1)
    : '0.0';

  const pendingCount = feedbacks.filter((f) => f.status === 'Pending').length;
  const approvedCount = feedbacks.filter((f) => f.status === 'Approved').length;

  // Rating Distribution Calculation
  const ratingDistribution = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    feedbacks.forEach((f) => {
      const r = Math.round(f.overallRating) as 1 | 2 | 3 | 4 | 5;
      if (dist[r] !== undefined) dist[r] += 1;
    });
    return dist;
  }, [feedbacks]);

  // Filtered feedbacks
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((item) => {
      const term = searchQuery.toLowerCase();
      const matchesSearch =
        !term ||
        item.mobileNumber.toLowerCase().includes(term) ||
        (item.userName && item.userName.toLowerCase().includes(term)) ||
        (item.supplierName && item.supplierName.toLowerCase().includes(term)) ||
        item.title.toLowerCase().includes(term) ||
        item.comments.toLowerCase().includes(term);

      const matchesRating =
        selectedRating === 'all' || item.overallRating === parseInt(selectedRating, 10);
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchesStatus =
        selectedStatus === 'all' || item.status === selectedStatus;

      return matchesSearch && matchesRating && matchesCategory && matchesStatus;
    });
  }, [feedbacks, searchQuery, selectedRating, selectedCategory, selectedStatus]);

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredFeedbacks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredFeedbacks.map((f) => f.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = (status: FeedbackStatus) => {
    if (selectedIds.length === 0) return;
    bulkUpdateFeedbackStatus(selectedIds, status);
    onRefreshData();
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Delete ${selectedIds.length} selected feedback entries permanently?`)) {
      bulkDeleteFeedbacks(selectedIds);
      onRefreshData();
      setSelectedIds([]);
    }
  };

  const handleUpdateStatus = (id: string, status: FeedbackStatus) => {
    updateFeedbackStatus(id, status);
    onRefreshData();
    if (activeModalItem?.id === id) {
      setActiveModalItem((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const handleAddReply = (id: string, reply: string) => {
    addAdminReplyToFeedback(id, reply);
    onRefreshData();
    if (activeModalItem?.id === id) {
      setActiveModalItem((prev) => (prev ? { ...prev, adminReply: reply } : null));
    }
  };

  const handleDelete = (id: string) => {
    deleteFeedback(id);
    onRefreshData();
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  const handleResetData = () => {
    if (confirm('Reset feedbacks to initial default IndiaMART test reviews?')) {
      resetFeedbacksToDefault();
      onRefreshData();
    }
  };

  const handleExportCSV = () => {
    if (feedbacks.length === 0) return;
    const headers = [
      'ID',
      'Mobile Number',
      'User Name',
      'Overall Rating',
      'Category',
      'Supplier Name',
      'Title',
      'Comments',
      'Status',
      'Date',
    ];
    const rows = feedbacks.map((f) => [
      f.id,
      `"${f.mobileNumber}"`,
      `"${f.userName || ''}"`,
      f.overallRating,
      `"${f.category}"`,
      `"${f.supplierName || ''}"`,
      `"${f.title.replace(/"/g, '""')}"`,
      `"${f.comments.replace(/"/g, '""')}"`,
      f.status,
      `"${f.createdAt}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `indiamart_feedbacks_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Admin Control Header */}
      <div className="bg-gradient-to-r from-[#1c1e69] via-[#2e3192] to-[#00a699] text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-400 text-gray-900 font-extrabold text-[11px] px-2.5 py-0.5 rounded tracking-wide uppercase">
              IndiaMART Admin Panel
            </span>
            <span className="text-xs text-emerald-200 font-semibold flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              Real-Time Direct Storage Sync
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1 flex items-center gap-2">
            <span>Admin Control Panel</span>
          </h1>
          <p className="text-xs text-gray-200 mt-1">
            Live OTP logs database feed & user feedback moderation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-xs border border-white/20 px-3.5 py-2 rounded-xl text-right hidden sm:block">
            <div className="text-[10px] text-emerald-300 font-bold uppercase">LoggedIn Admin</div>
            <div className="text-xs font-bold text-white">System Administrator</div>
          </div>
          <button
            onClick={onAdminLogout}
            className="bg-red-500/80 hover:bg-red-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout Admin
          </button>
        </div>
      </div>

      {/* ADMIN NAVIGATION TABS SWITCHER */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex gap-2 w-full sm:w-auto">
          {/* Tab 1: User Number & OTP Logs (Primary/Direct View) */}
          <button
            onClick={() => setActiveTab('otp_logs')}
            className={`flex-1 sm:flex-none px-5 py-3 rounded-lg font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'otp_logs'
                ? 'bg-[#282a8c] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>User Number &amp; OTP Logs</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'otp_logs' ? 'bg-amber-400 text-gray-900' : 'bg-gray-300 text-gray-800'
              }`}
            >
              {otpLogs.length}
            </span>
          </button>

          {/* Tab 2: Reviews & Feedback Moderation */}
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 sm:flex-none px-5 py-3 rounded-lg font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-[#282a8c] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>User Reviews Moderation</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === 'reviews' ? 'bg-emerald-400 text-gray-900' : 'bg-gray-300 text-gray-800'
              }`}
            >
              {feedbacks.length}
            </span>
          </button>
        </div>

        {/* Live Status Indicator */}
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
          </span>
          <span>Live Direct Feed (No Refresh Required)</span>
        </div>
      </div>

      {/* TAB 1: USER NUMBER & OTP LOGS (SHOW ONLY USER NUMBER & OTP) */}
      {activeTab === 'otp_logs' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Header Info Box */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-xl shadow-md border border-indigo-800/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold flex items-center gap-2 text-amber-300">
                <KeyRound className="w-5 h-5 text-amber-400" />
                Captured User Mobile Numbers &amp; OTP Database
              </h2>
              <p className="text-xs text-gray-300">
                Shows strictly <strong>User Mobile Number</strong> and <strong>OTP Code</strong> as entered by users in real-time. Updates live without reloading page.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={refreshOtpLogs}
                className="bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh Now
              </button>
              {otpLogs.length > 0 && (
                <button
                  onClick={handleClearAllOtps}
                  className="bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All OTPs
                </button>
              )}
            </div>
          </div>

          {/* Search Box for OTP Logs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3.5 py-2.5 focus-within:border-[#282a8c] focus-within:bg-white transition-colors">
              <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
              <input
                type="text"
                value={otpSearchQuery}
                onChange={(e) => setOtpSearchQuery(e.target.value)}
                placeholder="Filter by Mobile Number or OTP Code..."
                className="w-full text-xs text-gray-800 bg-transparent outline-none font-medium"
              />
              {otpSearchQuery && (
                <button
                  onClick={() => setOtpSearchQuery('')}
                  className="text-xs text-gray-400 hover:text-gray-600 font-bold ml-2"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* DEDICATED TABLE SHOWING ONLY USER NUMBER AND OTP */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <div className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                <span>User OTP Records ({filteredOtpLogs.length} Total)</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                ● Live Updates Active
              </span>
            </div>

            {filteredOtpLogs.length === 0 ? (
              <div className="p-12 text-center text-gray-500 space-y-3">
                <KeyRound className="w-10 h-10 text-gray-300 mx-auto animate-pulse" />
                <div className="text-sm font-bold text-gray-800">No OTP Records Found</div>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  When a user enters an OTP code anywhere on the portal, their Mobile Number and OTP code will automatically appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-800">
                  <thead className="bg-[#112347] text-white text-[11px] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5 w-14 text-center">#</th>
                      <th className="p-3.5">User Mobile Number</th>
                      <th className="p-3.5">Entered OTP Code</th>
                      <th className="p-3.5">Submitted Date &amp; Time</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOtpLogs.map((log, index) => (
                      <tr key={log.id} className="hover:bg-amber-50/40 transition-colors">
                        <td className="p-3.5 text-center font-bold text-gray-500">
                          {index + 1}
                        </td>

                        {/* ONLY User Number */}
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="font-extrabold text-sm text-[#112347] flex items-center gap-2">
                            <PhoneCall className="w-4 h-4 text-emerald-600" />
                            <span>{log.mobileNumber}</span>
                          </div>
                        </td>

                        {/* ONLY OTP Code */}
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="inline-flex items-center gap-2 bg-amber-100 border border-amber-300 text-amber-950 px-3 py-1 rounded-lg font-mono font-black text-base tracking-widest shadow-2xs">
                            <KeyRound className="w-4 h-4 text-amber-700" />
                            <span>
                              {log.otp ? log.otp.padEnd(4, '_').split('').join(' ') : '_ _ _ _'}
                            </span>
                          </div>
                        </td>

                        {/* Time */}
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="font-semibold text-gray-700">
                            {new Date(log.createdAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {new Date(log.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-3.5 text-center whitespace-nowrap">
                          {log.status === 'Verified' ? (
                            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-[10px] px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              Verified OTP
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[10px] px-2.5 py-1 rounded-full inline-flex items-center gap-1 animate-pulse">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              Typing... ({log.otp ? log.otp.length : 0}/4)
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleCopyOtp(log.id, log.otp)}
                              className="bg-indigo-50 hover:bg-indigo-100 text-[#282a8c] border border-indigo-200 px-2.5 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              {copiedId === log.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" /> Copy OTP
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => handleDeleteOtp(log.id)}
                              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 p-1.5 rounded-md text-xs transition-colors cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: REVIEWS & FEEDBACK MODERATION */}
      {activeTab === 'reviews' && (
        <div className="space-y-6 animate-fadeIn">
          {/* KPI METRIC OVERVIEW CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-1">
              <div className="text-xs font-bold text-gray-500 uppercase">Total Feedbacks</div>
              <div className="text-2xl font-black text-gray-800">{totalCount}</div>
              <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> 100% Mobile OTP Verified
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-1">
              <div className="text-xs font-bold text-gray-500 uppercase">Average Rating</div>
              <div className="text-2xl font-black text-amber-500 flex items-center gap-1">
                <span>{avgRating}</span>
                <span className="text-xs text-gray-400 font-normal">/ 5.0</span>
              </div>
              <StarRating value={parseFloat(avgRating)} readOnly size="sm" />
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-1">
              <div className="text-xs font-bold text-gray-500 uppercase">Approved</div>
              <div className="text-2xl font-black text-emerald-600">{approvedCount}</div>
              <div className="text-[10px] text-gray-400 font-medium">Published on portal</div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-1">
              <div className="text-xs font-bold text-gray-500 uppercase">Pending Review</div>
              <div className="text-2xl font-black text-amber-600">{pendingCount}</div>
              <div className="text-[10px] text-amber-600 font-medium">Requires moderation</div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 space-y-1 col-span-2 md:col-span-1">
              <div className="text-xs font-bold text-gray-500 uppercase">Data Tools</div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleExportCSV}
                  className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-[#00a699] border border-emerald-300 py-1.5 px-2 rounded text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Download className="w-3 h-3" /> CSV Export
                </button>
                <button
                  onClick={handleResetData}
                  title="Reset Demo Data"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-1.5 rounded transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* RATING DISTRIBUTION VISUALIZER */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-[#00a699]" />
                Star Rating Distribution Analytics
              </h3>
              <span className="text-[11px] text-gray-500">Breakdown across 5 stars</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingDistribution[star as keyof typeof ratingDistribution] || 0;
                const pct = totalCount ? Math.round((count / totalCount) * 100) : 0;
                return (
                  <div key={star} className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                      <span className="flex items-center gap-1">★ {star} Star</span>
                      <span className="text-gray-500 font-normal">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SEARCH & FILTER CONTROLS */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex-1 w-full flex items-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus-within:border-[#00a699] transition-colors">
                <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by mobile number, supplier name, review title or content..."
                  className="w-full text-xs text-gray-800 bg-transparent outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-gray-400 hover:text-gray-600 ml-1 font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <div className="flex items-center gap-1 text-xs text-gray-500 font-bold">
                  <Filter className="w-3.5 h-3.5 text-[#00a699]" />
                  Filters:
                </div>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 font-medium outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <select
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 font-medium outline-none"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars ★★★★★</option>
                  <option value="4">4 Stars ★★★★</option>
                  <option value="3">3 Stars ★★★</option>
                  <option value="2">2 Stars ★★</option>
                  <option value="1">1 Star ★</option>
                </select>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 font-medium outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="Supplier Experience">Supplier Experience</option>
                  <option value="Platform Usability">Platform Usability</option>
                  <option value="Buying Process">Buying Process</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="Technical Issue / Suggestion">Technical Issue</option>
                </select>
              </div>
            </div>
          </div>

          {/* FEEDBACK MANAGEMENT TABLE */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex flex-wrap justify-between items-center bg-gray-50/50 gap-3">
              <div className="flex items-center gap-3">
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                  Feedback Entries ({filteredFeedbacks.length} items)
                </h3>
                {selectedIds.length > 0 && (
                  <span className="bg-[#2e3192] text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                    {selectedIds.length} selected
                  </span>
                )}
              </div>

              {selectedIds.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2 animate-fadeIn">
                  <span className="text-xs text-gray-600 font-bold">Bulk Actions:</span>
                  <button
                    onClick={() => handleBulkStatusChange('Approved')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve Selected
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('Pending')}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" /> Mark Pending
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('Rejected')}
                    className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject Selected
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="bg-gray-700 hover:bg-red-800 text-white px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Selected
                  </button>
                </div>
              ) : (
                <span className="text-xs text-gray-500">Sorted by newest first</span>
              )}
            </div>

            {filteredFeedbacks.length === 0 ? (
              <div className="p-12 text-center text-gray-500 space-y-2">
                <MessageSquare className="w-8 h-8 text-gray-300 mx-auto" />
                <div className="text-sm font-bold text-gray-700">No matching feedbacks found</div>
                <div className="text-xs text-gray-400">Try adjusting your search term or filters.</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-gray-100 border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                    <tr>
                      <th className="p-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={
                            selectedIds.length === filteredFeedbacks.length &&
                            filteredFeedbacks.length > 0
                          }
                          onChange={handleToggleSelectAll}
                          className="rounded border-gray-300 text-[#2e3192] focus:ring-[#2e3192] cursor-pointer"
                        />
                      </th>
                      <th className="p-3">ID &amp; Date</th>
                      <th className="p-3">Mobile (OTP Verified)</th>
                      <th className="p-3">Category / Supplier</th>
                      <th className="p-3">Rating</th>
                      <th className="p-3">Review Title &amp; Excerpt</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredFeedbacks.map((item) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-gray-50/80 transition-colors ${
                          selectedIds.includes(item.id) ? 'bg-indigo-50/50' : ''
                        }`}
                      >
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item.id)}
                            onChange={() => handleToggleSelectRow(item.id)}
                            className="rounded border-gray-300 text-[#2e3192] focus:ring-[#2e3192] cursor-pointer"
                          />
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          <div className="font-bold text-[#2e3192]">{item.id}</div>
                          <div className="text-[10px] text-gray-400">
                            {new Date(item.createdAt).toLocaleDateString('en-IN')}
                          </div>
                          {item.updatedAt && (
                            <div className="text-[9px] text-amber-600 font-semibold">
                              Edited {new Date(item.updatedAt).toLocaleDateString('en-IN')}
                            </div>
                          )}
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          <div className="font-bold text-gray-800">{item.mobileNumber}</div>
                          <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3" /> {item.userName || 'Verified User'}
                          </div>
                        </td>

                        <td className="p-3">
                          <span className="bg-[#2e3192]/10 text-[#2e3192] font-bold text-[10px] px-2 py-0.5 rounded">
                            {item.category}
                          </span>
                          {item.supplierName && (
                            <div className="text-[11px] font-medium text-gray-600 mt-1 line-clamp-1">
                              🏢 {item.supplierName}
                            </div>
                          )}
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <StarRating value={item.overallRating} readOnly size="sm" />
                            <span className="font-bold text-amber-600">{item.overallRating}</span>
                          </div>
                        </td>

                        <td className="p-3 max-w-xs">
                          <div className="font-bold text-gray-900 line-clamp-1">{item.title}</div>
                          <div className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                            {item.comments}
                          </div>
                          {item.adminReply && (
                            <div className="text-[10px] text-[#00a699] font-semibold mt-1">
                              ✓ Admin Replied
                            </div>
                          )}
                        </td>

                        <td className="p-3 text-center whitespace-nowrap">
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                              item.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : item.status === 'Pending'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-red-100 text-red-800 border border-red-300'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => setEditingModalItem(item)}
                              title="Edit & Update Review"
                              className="bg-amber-500 hover:bg-amber-600 text-white p-1.5 rounded transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setActiveModalItem(item)}
                              title="View Details & Reply"
                              className="bg-[#2e3192] hover:bg-[#1c1e69] text-white p-1.5 rounded transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleUpdateStatus(item.id, 'Approved')}
                              title="Approve"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleUpdateStatus(item.id, 'Pending')}
                              title="Mark Pending"
                              className="bg-amber-600 hover:bg-amber-700 text-white p-1.5 rounded transition-colors cursor-pointer"
                            >
                              <Clock className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleUpdateStatus(item.id, 'Rejected')}
                              title="Reject"
                              className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded transition-colors cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                if (confirm('Delete this feedback entry?')) {
                                  handleDelete(item.id);
                                }
                              }}
                              title="Delete"
                              className="bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-700 p-1.5 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DETAIL & MODERATION MODAL */}
      {activeModalItem && (
        <FeedbackDetailModal
          feedback={activeModalItem}
          onClose={() => setActiveModalItem(null)}
          onUpdateStatus={handleUpdateStatus}
          onAddReply={handleAddReply}
          onDelete={handleDelete}
          onEdit={(fb) => setEditingModalItem(fb)}
        />
      )}

      {/* EDIT & UPDATE REVIEW MODAL */}
      {editingModalItem && (
        <EditReviewModal
          feedback={editingModalItem}
          onClose={() => setEditingModalItem(null)}
          onRefreshData={onRefreshData}
          isAdminMode={true}
        />
      )}
    </div>
  );
};
