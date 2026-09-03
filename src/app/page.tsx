'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { FirstPageIndiaMartLogin } from '@/components/FirstPageIndiaMartLogin';
import { IndiaMartHelpCenter } from '@/components/IndiaMartHelpCenter';
import { FeedbackForm } from '@/components/FeedbackForm';
import { IndiaMartFooter } from '@/components/IndiaMartFooter';
import { UserFeedbackList } from '@/components/UserFeedbackList';
import { AdminLogin } from '@/components/AdminLogin';
import { AdminDashboard } from '@/components/AdminDashboard';
import { IndiaMartLoginModal } from '@/components/IndiaMartLoginModal';
import {
  getStoredFeedbacks,
  fetchFeedbacksFromMongoDB,
  fetchOtpLogsFromMongoDB,
  getUserSession,
  setUserSession,
  getAdminSession,
  setAdminSession,
} from '@/lib/storage';
import { FeedbackItem, UserSession } from '@/lib/types';
import { ShieldCheck, Star, Award, Building, Users, ChevronRight, LogOut, HelpCircle } from 'lucide-react';

export default function Home() {
  const [currentView, setCurrentView] = useState<'first_login' | 'feedback_form' | 'admin' | 'help'>('first_login');
  const [userSession, setUserSessionState] = useState<UserSession | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedInState] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);

  const refreshFeedbacks = useCallback(() => {
    setFeedbacks(getStoredFeedbacks());
    fetchFeedbacksFromMongoDB().then((data) => {
      if (Array.isArray(data)) setFeedbacks(data);
    });
    fetchOtpLogsFromMongoDB();
  }, []);

  const changeViewWithUrl = useCallback((view: 'first_login' | 'feedback_form' | 'admin' | 'help') => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      const pageName = view === 'first_login' ? 'login' : view;
      const url = new URL(window.location.href);
      url.searchParams.set('page', pageName);
      window.history.pushState({}, '', url.toString());
    }
  }, []);

  useEffect(() => {
    // Initial sync
    const savedUserSession = getUserSession();
    const savedAdminSession = getAdminSession();

    setUserSessionState(savedUserSession);
    setIsAdminLoggedInState(savedAdminSession);
    refreshFeedbacks();

    // Check URL search params for ?page=help, ?page=login, ?page=admin, ?page=feedback
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const pageParam = params.get('page') || params.get('view');
      if (pageParam === 'help') {
        setCurrentView('help');
        return;
      } else if (pageParam === 'login') {
        setCurrentView('first_login');
        return;
      } else if (pageParam === 'admin') {
        setCurrentView('admin');
        return;
      } else if (pageParam === 'feedback' || pageParam === 'feedback_form') {
        setCurrentView('feedback_form');
        return;
      }
    }

    if (savedUserSession?.isVerified) {
      setCurrentView('feedback_form');
    } else {
      setCurrentView('first_login');
    }

    // Listen for storage events
    const handleStorageUpdate = () => refreshFeedbacks();
    const handleSessionUpdate = () => {
      const s = getUserSession();
      setUserSessionState(s);
      if (s?.isVerified) {
        changeViewWithUrl('feedback_form');
      }
    };
    const handleAdminSessionUpdate = () => setIsAdminLoggedInState(getAdminSession());

    window.addEventListener('indiamart_storage_updated', handleStorageUpdate);
    window.addEventListener('indiamart_session_updated', handleSessionUpdate);
    window.addEventListener('indiamart_admin_session_updated', handleAdminSessionUpdate);

    return () => {
      window.removeEventListener('indiamart_storage_updated', handleStorageUpdate);
      window.removeEventListener('indiamart_session_updated', handleSessionUpdate);
      window.removeEventListener('indiamart_admin_session_updated', handleAdminSessionUpdate);
    };
  }, [refreshFeedbacks, changeViewWithUrl]);

  const handleSuccessUserLogin = (session: UserSession) => {
    setUserSession(session);
    setUserSessionState(session);
    changeViewWithUrl('feedback_form');
  };

  const handleUserLogout = () => {
    setUserSession(null);
    setUserSessionState(null);
    changeViewWithUrl('first_login');
  };

  const handleAdminLoginSuccess = () => {
    setAdminSession(true);
    setIsAdminLoggedInState(true);
  };

  const handleAdminLogout = () => {
    setAdminSession(false);
    setIsAdminLoggedInState(false);
    changeViewWithUrl('first_login');
  };

  // Render Help Center view
  if (currentView === 'help') {
    return (
      <IndiaMartHelpCenter
        onNavigatePage={(p) => {
          if (p === 'login') changeViewWithUrl('first_login');
          else if (p === 'help') changeViewWithUrl('help');
          else if (p === 'feedback') changeViewWithUrl('feedback_form');
          else if (p === 'admin') changeViewWithUrl('admin');
        }}
        onRefreshData={refreshFeedbacks}
      />
    );
  }

  // Render Landing Mobile Login page view
  if (currentView === 'first_login' && !userSession?.isVerified) {
    return (
      <FirstPageIndiaMartLogin
        onSuccessLogin={handleSuccessUserLogin}
        onGoToAdmin={() => changeViewWithUrl('admin')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f5f8]">
      {/* Header Bar */}
      <Header
        currentTab={currentView === 'admin' ? 'admin' : 'user_feedback'}
        setCurrentTab={(tab) => {
          if (tab === 'help') changeViewWithUrl('help');
          else if (tab === 'admin') changeViewWithUrl('admin');
          else changeViewWithUrl('feedback_form');
        }}
        userSession={userSession}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onUserLogout={handleUserLogout}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {currentView === 'admin' ? (
          <div className="animate-fadeIn">
            {isAdminLoggedIn ? (
              <AdminDashboard
                feedbacks={feedbacks}
                onRefreshData={refreshFeedbacks}
                onAdminLogout={handleAdminLogout}
              />
            ) : (
              <AdminLogin onAdminLoginSuccess={handleAdminLoginSuccess} />
            )}
          </div>
        ) : (
          /* FEEDBACK FORM VIEW (Exact IndiaMART Help / Feedback UI matching uploaded screenshots) */
          <div className="animate-fadeIn py-2">
            <FeedbackForm
              userSession={userSession}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
              onFeedbackSubmitted={refreshFeedbacks}
            />
          </div>
        )}
      </main>

      {/* Footer matching uploaded screenshots */}
      <IndiaMartFooter />

      {/* Login Modal */}
      <IndiaMartLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccessLogin={handleSuccessUserLogin}
      />
    </div>
  );
}
