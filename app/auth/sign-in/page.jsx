'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import { login } from '../actions';
import Loader from '@/components/AdminDashBoard/Loader';

const Login = () => {
  const [isLoading,setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState(null); 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form reset
    setIsLoading(true)
    const formDataObj = new FormData();
    formDataObj.append('email', formData.email);
    formDataObj.append('password', formData.password);

    const result = await login(formDataObj);
    if (result?.error) {
      setIsLoading(false)
      setMessage({ type: 'error', text: result.error });
    } else {
      setIsLoading(false)
      setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
    }
  };

  return (
   <>
    {isLoading ? <Loader/>: <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Circular Background Overlay */}
      <div className="absolute top-[-20%] left-[-20%] w-[40rem] h-[40rem] bg-green-200/30 rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-[-30%] right-[-20%] w-[50rem] h-[50rem] bg-green-300/20 rounded-full animate-pulse-slow delay-1000"></div>

      {/* Login Card */}
      <div className="relative z-10 max-w-md w-full bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl p-8 border border-green-100">
        {/* EcoBin Logo */}
        <div className="flex justify-center mb-6">
          <svg width="60" height="60" viewBox="0 0 100 100" className="text-green-600">
            <rect x="35" y="30" width="30" height="40" fill="currentColor" rx="5"/>
            <path d="M40 35 h20 v5 h-20 z" fill="#424242"/>
            <path d="M47 50 l6 6 m0-6 l-6 6" stroke="#fbfbfb" strokeWidth="2"/>
            <circle cx="50" cy="20" r="10" fill="#4fb07a"/>
          </svg>
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800 tracking-wide mb-2">
          Welcome Back to EcoBin
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Log in to continue your sustainability journey
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1 relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 peer"
                placeholder="your@email.com"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 peer-focus:text-green-600"
              >
                <path fill="currentColor" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h16V6H4zm8 5l8 5H4l8-5zm-8-2h16v2H4V9z"/>
              </svg>
            </div>
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 peer"
                placeholder="••••••••"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 peer-focus:text-green-600"
              >
                <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9v2H4v10h16V11h-1V9c0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5v2H7V9c0-2.76 2.24-5 5-5zm-5 9h10v6H7v-6z"/>
              </svg>
            </div>
          </div>

          {/* Display Error or Success Message */}
          {message && (
            <p
              className={`text-center text-sm ${
                message.type === 'error' ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {message.text}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-full text-lg font-semibold hover:bg-green-700 hover:scale-105 transition-all duration-300 shadow-md"
          >
            Log In
          </button>
        </form>

        {/* Additional Links */}
        <div className="mt-6 text-center space-y-2">
          <Link href="/forgot-password" className="text-sm text-green-600 hover:underline">
            Forgot Password?
          </Link>
          <p className="text-sm text-gray-600">
            Don’t have an account?{' '}
            <Link href="/join-community" className="text-green-600 hover:underline font-medium">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* Custom Animation for Pulse Effect */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s infinite ease-in-out;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>}
   </>
  );
};

export default Login;