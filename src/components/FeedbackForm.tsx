'use client';

import React, { useState, useEffect } from 'react';
import { UserSession } from '@/lib/types';
import { addFeedback } from '@/lib/storage';
import { CountryCodeSelector, CountryCode, COUNTRY_LIST } from './CountryCodeSelector';
import { StarRating } from './StarRating';
import confetti from 'canvas-confetti';
import { CheckCircle2, MessageCircle, Send, Star } from 'lucide-react';

interface FeedbackFormProps {
  userSession: UserSession | null;
  onOpenLoginModal: () => void;
  onFeedbackSubmitted: () => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  userSession,
  onOpenLoginModal,
  onFeedbackSubmitted,
}) => {
  const [overallRating, setOverallRating] = useState<number>(5);
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_LIST[0]);
  const [mobileInput, setMobileInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Interactive Live Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string }>>([]);

  const handleSendChatMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg = text.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    // Automated helpful response simulation
    setTimeout(() => {
      let botReply = 'Thank you for reaching out! Your enquiry has been received and our IndiaMART support team will get back to you shortly.';
      if (userMsg.toLowerCase().includes('feedback') || userMsg.toLowerCase().includes('review')) {
        botReply = 'You can submit your star rating and review comment using the form on this page!';
      } else if (userMsg.toLowerCase().includes('seller')) {
        botReply = 'For seller catalog & leads support, visit our Seller Tools or call our helpline at 096-9696-9696.';
      } else if (userMsg.toLowerCase().includes('payment')) {
        botReply = 'All IndiaMART transactions under Buyer Payment Protection are 100% safe. Reach us at customercare@indiamart.com for payment queries.';
      }
      setChatMessages((prev) => [...prev, { sender: 'bot', text: botReply }]);
    }, 600);
  };

  useEffect(() => {
    if (userSession?.mobileNumber) {
      // Remove country code if present for display in phone input
      const cleaned = userSession.mobileNumber.replace(/\+91\s?/, '');
      setMobileInput(cleaned);
    }
  }, [userSession]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2b52f6', '#00a699', '#ff9f00'],
      });
    } catch {
      // fallback
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!overallRating || overallRating < 1) {
      setErrorMsg('Please select a star rating.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid communication email address.');
      return;
    }

    if (!description.trim() || description.trim().length < 3) {
      setErrorMsg('Please enter your review comment.');
      return;
    }

    const finalMobile = mobileInput.trim() || (userSession?.mobileNumber ?? '');
    if (!finalMobile) {
      setErrorMsg('Please enter your mobile phone number.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    setTimeout(() => {
      addFeedback({
        mobileNumber: `${selectedCountry.code} ${finalMobile}`,
        userName: email.split('@')[0] || 'IndiaMART User',
        overallRating: overallRating,
        aspectRatings: {
          quality: overallRating,
          communication: overallRating,
          fulfillment: overallRating,
          value: overallRating,
        },
        category: 'Customer Support',
        title: `${overallRating}-Star Review`,
        comments: description.trim(),
        recommend: overallRating >= 4,
      });

      setIsSubmitting(false);
      setSubmittedSuccess(true);
      triggerConfetti();
      onFeedbackSubmitted();
    }, 700);
  };

  const handleResetForm = () => {
    setSubmittedSuccess(false);
    setOverallRating(5);
    setEmail('');
    setDescription('');
    setErrorMsg('');
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 relative py-4">
      {/* MAIN REVIEW CARD (Clean Centered Layout - Left Sidebar Removed) */}
      <main className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-10 space-y-6">
        {submittedSuccess ? (
          <div className="py-12 text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-[#2b52f6]">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Review Submitted</h2>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              Thank you for sharing your {overallRating}-star review with IndiaMART. Your feedback has been recorded successfully.
            </p>
            <button
              onClick={handleResetForm}
              className="bg-[#2b52f6] hover:bg-[#1f40cf] text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow transition-all cursor-pointer"
            >
              Submit Another Review
            </button>
          </div>
        ) : (
          <>
            {/* Header & Subtitle */}
            <div className="text-center space-y-2 pb-4 border-b border-gray-100">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c2250]">
                IndiaMART Review & Feedback
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
                Rate your experience and leave a comment to help us improve IndiaMART services.
              </p>
            </div>

            {/* Main Form: Only Star Rating & One Comment Field */}
            <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
              {/* Field 1: STAR RATING */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 text-center space-y-3">
                <label className="block text-sm font-bold text-[#1c2250]">
                  Select Star Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex justify-center">
                  <StarRating
                    value={overallRating}
                    onChange={(r) => setOverallRating(r)}
                    showLabels
                    size="xl"
                  />
                </div>
              </div>

              {/* Field 2: ONE COMMENT TEXTAREA */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  Your Review Comment <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share details of your experience..."
                  className="w-full px-3.5 py-2.5 text-xs text-gray-800 border border-gray-300 rounded-lg focus:border-[#2b52f6] focus:ring-1 focus:ring-[#2b52f6] outline-none transition-all"
                />
              </div>

              {/* Field 3: Contact Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  Communication Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 text-xs text-gray-800 border border-gray-300 rounded-lg focus:border-[#2b52f6] focus:ring-1 focus:ring-[#2b52f6] outline-none"
                />
              </div>

              {/* Field 4: Mobile Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:border-[#2b52f6]">
                  <CountryCodeSelector
                    selectedCountry={selectedCountry}
                    onSelectCountry={setSelectedCountry}
                  />
                  <input
                    type="tel"
                    required
                    value={mobileInput}
                    onChange={(e) => setMobileInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Mobile / Cell phone *"
                    className="flex-1 px-3 py-2.5 text-xs text-gray-800 outline-none font-medium"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              {/* SUBMIT REVIEW BUTTON */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#2b52f6] hover:bg-[#1f40cf] active:bg-[#1835b0] text-white font-bold text-xs uppercase px-8 py-3.5 rounded-lg shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Star className="w-4 h-4 fill-white" />
                  <span>{isSubmitting ? 'SUBMITTING REVIEW...' : 'SUBMIT REVIEW'}</span>
                </button>
              </div>
            </form>
          </>
        )}
      </main>

      {/* FLOATING CHAT WITH US WIDGET & DRAWER (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Live Chat Popover Drawer */}
        {isChatOpen && (
          <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fadeIn space-y-0">
            {/* Drawer Header */}
            <div className="bg-[#1c2250] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-sm text-white">
                  IM
                </div>
                <div>
                  <div className="font-bold text-xs tracking-wide">IndiaMART Support Chat</div>
                  <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online & Ready to Help
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-gray-300 hover:text-white text-lg font-bold w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Chat Messages */}
            <div className="p-4 bg-gray-50 h-64 overflow-y-auto space-y-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-gray-200 text-gray-700 shadow-xs">
                👋 Hello! Welcome to IndiaMART Customer Care. How can we assist you today?
              </div>

              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-xl max-w-[85%] text-xs shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#2b52f6] text-white ml-auto rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-200 mr-auto rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Instant Quick Action Suggestions */}
            <div className="p-3 bg-white border-t border-gray-100 space-y-1.5">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Quick Enquiries:
              </div>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {[
                  'How to track my review status?',
                  'Seller registration help',
                  'Payment protection query',
                ].map((quickText) => (
                  <button
                    key={quickText}
                    onClick={() => handleSendChatMessage(quickText)}
                    className="bg-gray-100 hover:bg-[#2b52f6]/10 hover:text-[#2b52f6] text-gray-700 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer border border-gray-200"
                  >
                    {quickText}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage(chatInput)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg outline-none focus:border-[#2b52f6]"
                />
                <button
                  onClick={() => handleSendChatMessage(chatInput)}
                  className="p-2 bg-[#2b52f6] hover:bg-[#1f40cf] text-white rounded-lg transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Chat Trigger Button */}
        <button
          type="button"
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-[76px] h-[76px] bg-[#23287a] hover:bg-[#1a1e5c] text-white rounded-full flex flex-col items-center justify-center shadow-2xl transition-all hover:scale-105 cursor-pointer border-2 border-white/20 active:scale-95 group"
          title="Chat With Us"
        >
          {/* Overlapping double chat bubble icon with dots */}
          <div className="relative w-8 h-7 flex items-center justify-center">
            {/* Background chat bubble */}
            <svg
              className="w-5 h-5 text-white/70 absolute -top-0.5 -right-0.5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
            {/* Foreground chat bubble with 3 dots */}
            <svg
              className="w-6 h-6 text-white absolute bottom-0 left-0 drop-shadow-sm"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2z" />
              <circle cx="7" cy="10" r="1.3" fill="#23287a" />
              <circle cx="12" cy="10" r="1.3" fill="#23287a" />
              <circle cx="17" cy="10" r="1.3" fill="#23287a" />
            </svg>
          </div>

          {/* Two-line text: Chat / With Us */}
          <div className="text-[11px] font-extrabold leading-[1.1] text-center mt-1 text-white tracking-tight">
            <div>Chat</div>
            <div>With Us</div>
          </div>
        </button>
      </div>
    </div>
  );
};
