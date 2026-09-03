'use client';

import React from 'react';
import { UserSession } from '@/lib/types';
import { ShieldCheck, PhoneCall, LogOut, User, LayoutDashboard, MessageSquarePlus, Search, HelpCircle } from 'lucide-react';

interface HeaderProps {
  currentTab: 'user_feedback' | 'admin' | 'help';
  setCurrentTab: (tab: 'user_feedback' | 'admin' | 'help') => void;
  userSession: UserSession | null;
  onOpenLoginModal: () => void;
  onUserLogout: () => void;
  isAdminLoggedIn: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  userSession,
  onOpenLoginModal,
  onUserLogout,
  isAdminLoggedIn,
}) => {
  return (
    <header className="w-full bg-[#1c2250] text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
        {/* Brand Logo - Using public/image.png */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setCurrentTab('user_feedback')}
        >
          <img
            src="/image.png"
            alt="IndiaMART Logo"
            className="h-9 sm:h-10 w-auto object-contain bg-white/95 p-1 rounded"
          />
        </div>

        {/* Top Navbar Actions */}
        <div className="flex items-center space-x-3 sm:space-x-6 text-xs sm:text-sm font-medium">
          <button className="bg-white text-[#1c2250] font-bold px-3 py-1.5 rounded-md hover:bg-gray-100 transition-all shadow-xs cursor-pointer">
            Get Best Price
          </button>

          <a href="#" className="hover:text-gray-200 hidden md:inline text-gray-200">
            Sell
          </a>
          <a href="#" className="hover:text-gray-200 hidden md:inline text-gray-200">
            Videos
          </a>
          <a href="#" className="hover:text-gray-200 hidden md:inline text-gray-200">
            Messages
          </a>
          <button
            onClick={() => setCurrentTab('user_feedback')}
            className="text-white underline font-bold cursor-pointer"
          >
            Feedback
          </button>

          {/* User Session Status */}
          {userSession?.isVerified ? (
            <div className="flex items-center space-x-2 pl-3 border-l border-white/20">
              <div className="text-right">
                <div className="text-[10px] text-emerald-300 font-bold uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 inline" /> Verified Session
                </div>
                <div className="text-xs font-bold text-white tracking-tight">
                  {userSession.mobileNumber}
                </div>
              </div>
              <button
                onClick={onUserLogout}
                title="Logout"
                className="p-1.5 text-gray-300 hover:text-red-300 hover:bg-white/10 rounded-md transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="flex items-center gap-1 font-semibold text-white hover:text-gray-200 cursor-pointer py-1"
            >
              <User className="w-4 h-4" />
              <span>Sign In ▾</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
