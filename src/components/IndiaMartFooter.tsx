'use client';

import React from 'react';
import { Phone, Mail, MessageSquare } from 'lucide-react';

export const IndiaMartFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[#f3f4f8] text-gray-700 text-xs border-t border-gray-200 mt-12">
      {/* Top Banner: We are here to help you! */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-200">
        <div className="text-[#1c2250] font-extrabold text-base sm:text-lg tracking-tight">
          We are here to help you!
        </div>

        <div className="flex flex-wrap items-center gap-6 text-gray-600 font-medium">
          {/* Go Mobile */}
          <div className="flex items-center gap-2">
            <span>Go Mobile:</span>
            <div className="flex items-center gap-2 text-gray-800">
              {/* Apple Icon */}
              <svg className="w-4 h-4 fill-current cursor-pointer hover:text-black" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.54c.67-.82 1.13-1.96.99-3.11-1 .04-2.22.67-2.92 1.48-.62.72-1.16 1.88-1.01 3 1.12.09 2.27-.55 2.94-1.37z"/>
              </svg>
              {/* Android Icon */}
              <svg className="w-4 h-4 fill-current cursor-pointer hover:text-green-600" viewBox="0 0 24 24">
                <path d="M6 18c0 .55.45 1 1 1h1v3c0 .55.45 1 1 1s1-.45 1-1v-3h4v3c0 .55.45 1 1 1s1-.45 1-1v-3h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.66 1.23 12.86 1 12 1c-.86 0-1.66.23-2.64.63L7.88.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.3 1.3C6.46 3.39 5 5.51 5 8h14c0-2.49-1.46-4.61-3.47-5.84zM9 5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
              </svg>
              {/* Mobile Icon */}
              <svg className="w-4 h-4 fill-current cursor-pointer hover:text-blue-600" viewBox="0 0 24 24">
                <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
              </svg>
            </div>
          </div>

          {/* Follow us on */}
          <div className="flex items-center gap-2">
            <span>Follow us on:</span>
            <div className="flex items-center gap-1.5">
              {/* Facebook */}
              <div className="w-6 h-6 rounded-full bg-[#1c2250] text-white flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-blue-700">
                f
              </div>
              {/* X */}
              <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-gray-800">
                𝕏
              </div>
              {/* LinkedIn */}
              <div className="w-6 h-6 rounded-full bg-[#0077b5] text-white flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-blue-600">
                in
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* Column 1 */}
        <div className="space-y-2 text-[11px] text-gray-500">
          <div className="hover:text-[#2b52f6] cursor-pointer">Help</div>
          <div className="font-semibold text-gray-800 cursor-pointer">Feedback</div>
          <div className="hover:text-[#2b52f6] cursor-pointer">Complaints</div>
          <div className="hover:text-[#2b52f6] cursor-pointer">Customer Care</div>
          <div className="hover:text-[#2b52f6] cursor-pointer">Contact Us</div>
        </div>

        {/* Column 2 */}
        <div className="space-y-2 text-[11px] text-gray-500">
          <div className="hover:text-[#2b52f6] cursor-pointer">Suppliers Tool Kit</div>
          <div className="hover:text-[#2b52f6] cursor-pointer">Seller Tools</div>
          <div className="hover:text-[#2b52f6] cursor-pointer">Latest BuyLead</div>
          <div className="hover:text-[#2b52f6] cursor-pointer">Learning Centre</div>
          <div className="hover:text-[#2b52f6] cursor-pointer">Ship With IndiaMART</div>
          <div className="hover:text-[#2b52f6] cursor-pointer">Security Tips for Sellers</div>
        </div>

        {/* Column 3 */}
        <div className="space-y-2 text-[11px] text-gray-500">
          <div className="hover:text-[#2b52f6] cursor-pointer">Buyers Tool Kit</div>
          <div className="hover:text-[#2b52f6] cursor-pointer">Post Your Requirement</div>
          <div className="hover:text-[#2b52f6] cursor-pointer">Products You Buy</div>
          <div className="hover:text-[#2b52f6] cursor-pointer">Search Products & Suppliers</div>
          <div className="hover:text-[#2b52f6] cursor-pointer">Security Tips for Buyers</div>
        </div>

        {/* Column 4: Contact Action Pill Cards (Matching Screenshot 2) */}
        <div className="space-y-3">
          {/* WhatsApp Card */}
          <div className="bg-[#1c2250] hover:bg-[#15193d] text-white p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all shadow-sm">
            <div className="text-[11px]">
              <div className="text-gray-300 font-medium">WhatsApp:</div>
              <div className="font-bold text-xs tracking-tight">+91-9696969696</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
              💬
            </div>
          </div>

          {/* Email Card */}
          <div className="bg-[#1c2250] hover:bg-[#15193d] text-white p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all shadow-sm">
            <div className="text-[11px]">
              <div className="text-gray-300 font-medium">Email us:</div>
              <div className="font-bold text-[11px] tracking-tight truncate max-w-[170px]">
                customercare@indiamart.com
              </div>
            </div>
          </div>

          {/* Call Us Card */}
          <div className="bg-[#1c2250] hover:bg-[#15193d] text-white p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all shadow-sm">
            <div className="text-[11px]">
              <div className="text-gray-300 font-medium">Call us:</div>
              <div className="font-bold text-xs tracking-tight">096-9696-9696</div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center text-[10px] sm:text-[11px] text-gray-500 gap-2">
        <div>Copyright © 1996-2026 IndiaMART InterMESH Ltd. All rights reserved.</div>
        <div className="flex gap-3 text-blue-600 font-medium">
          <a href="#" className="hover:underline">Terms of Use</a>
          <span>-</span>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <span>-</span>
          <a href="#" className="hover:underline">Link to Us</a>
        </div>
      </div>
    </footer>
  );
};
