// app/components/LoadingPage.js
'use client';
import React from 'react';

const Loader = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center relative overflow-hidden">
      {/* Background Circular Animations */}
      <div className="absolute top-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-green-200/30 rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[40rem] h-[40rem] bg-green-300/20 rounded-full animate-pulse-slow delay-1000"></div>

      {/* Loading Content */}
      <div className="relative z-10 text-center">
        {/* Animated EcoBin Logo */}
        <div className="flex justify-center mb-6">
          <svg
            width="80"
            height="80"
            viewBox="0 0 100 100"
            className="text-green-600 animate-spin-slow"
          >
            <rect x="35" y="30" width="30" height="40" fill="currentColor" rx="5" />
            <path d="M40 35 h20 v5 h-20 z" fill="#424242" />
            <path d="M47 50 l6 6 m0-6 l-6 6" stroke="#fbfbfb" strokeWidth="2" />
            <circle cx="50" cy="20" r="10" fill="#4fb07a" className="animate-pulse" />
          </svg>
        </div>

        {/* Loading Text */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">EcoBin</h2>
        <p className="text-gray-600">Loading your sustainable journey...</p>

        {/* Dot Animation */}
        <div className="flex justify-center space-x-2 mt-4">
          <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce delay-0"></div>
          <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce delay-200"></div>
          <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce delay-400"></div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s infinite ease-in-out;
        }
        .animate-spin-slow {
          animation: spin-slow 4s infinite linear;
        }
        .animate-bounce {
          animation: bounce 1s infinite;
        }
        .delay-0 {
          animation-delay: 0s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-400 {
          animation-delay: 0.4s;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default Loader;