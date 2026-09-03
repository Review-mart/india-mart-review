'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';

export interface CountryCode {
  name: string;
  code: string;
  flag: string;
  iso: string;
}

export const COUNTRY_LIST: CountryCode[] = [
  { name: 'India', code: '+91', flag: '🇮🇳', iso: 'IN' },
  { name: 'United States', code: '+1', flag: '🇺🇸', iso: 'US' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧', iso: 'GB' },
  { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪', iso: 'AE' },
  { name: 'Australia', code: '+61', flag: '🇦🇺', iso: 'AU' },
  { name: 'Canada', code: '+1', flag: '🇨🇦', iso: 'CA' },
  { name: 'Singapore', code: '+65', flag: '🇸🇬', iso: 'SG' },
  { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦', iso: 'SA' },
  { name: 'Germany', code: '+49', flag: '🇩🇪', iso: 'DE' },
  { name: 'France', code: '+33', flag: '🇫🇷', iso: 'FR' },
  { name: 'Japan', code: '+81', flag: '🇯🇵', iso: 'JP' },
  { name: 'China', code: '+86', flag: '🇨🇳', iso: 'CN' },
  { name: 'Nepal', code: '+977', flag: '🇳🇵', iso: 'NP' },
  { name: 'Bangladesh', code: '+880', flag: '🇧🇩', iso: 'BD' },
  { name: 'Sri Lanka', code: '+94', flag: '🇱🇰', iso: 'LK' },
  { name: 'Oman', code: '+968', flag: '🇴🇲', iso: 'OM' },
  { name: 'Qatar', code: '+974', flag: '🇶🇦', iso: 'QA' },
  { name: 'Kuwait', code: '+965', flag: '🇰🇼', iso: 'KW' },
  { name: 'Malaysia', code: '+60', flag: '🇲🇾', iso: 'MY' },
  { name: 'South Korea', code: '+82', flag: '🇰🇷', iso: 'KR' },
  { name: 'Netherlands', code: '+31', flag: '🇳🇱', iso: 'NL' },
  { name: 'Italy', code: '+39', flag: '🇮🇹', iso: 'IT' },
  { name: 'Brazil', code: '+55', flag: '🇧🇷', iso: 'BR' },
];

interface CountryCodeSelectorProps {
  selectedCountry: CountryCode;
  onSelectCountry: (country: CountryCode) => void;
  className?: string;
}

export const CountryCodeSelector: React.FC<CountryCodeSelectorProps> = ({
  selectedCountry,
  onSelectCountry,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = COUNTRY_LIST.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.includes(searchQuery)
  );

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Selector Button matching screenshot */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-full bg-gray-50 hover:bg-gray-100 text-gray-800 px-3 py-2 text-xs sm:text-sm font-semibold flex items-center gap-1.5 border-r border-gray-300 transition-colors cursor-pointer select-none"
      >
        <span className="text-base sm:text-lg">{selectedCountry.flag}</span>
        <span className="font-bold">{selectedCountry.code}</span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
      </button>

      {/* Floating Dropdown Window matching screenshot */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-64 sm:w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-fadeIn text-xs sm:text-sm">
          {/* Search country input */}
          <div className="p-2.5 border-b border-gray-100 flex items-center bg-gray-50">
            <Search className="w-3.5 h-3.5 text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search country"
              className="w-full text-xs text-gray-800 bg-transparent outline-none placeholder:text-gray-400"
              autoFocus
            />
          </div>

          {/* Country List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
            {filteredCountries.length === 0 ? (
              <div className="p-3 text-center text-xs text-gray-400">No country found</div>
            ) : (
              filteredCountries.map((country) => {
                const isSelected = country.code === selectedCountry.code && country.name === selectedCountry.name;
                return (
                  <button
                    key={`${country.iso}-${country.name}`}
                    type="button"
                    onClick={() => {
                      onSelectCountry(country);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-gray-50 text-left transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50/70 font-bold text-[#202670]' : 'text-gray-700 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{country.flag}</span>
                      <span className="text-xs">{country.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-500">{country.code}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
