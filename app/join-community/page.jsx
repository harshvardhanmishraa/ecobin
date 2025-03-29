'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion'; // Add this import
import { signup } from '../auth/actions';
import Loader from '@/components/AdminDashBoard/Loader';
import { useRouter } from 'next/navigation';

const Community = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const router = useRouter();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Client-side validation
  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setMessage({ type: 'error', text: 'Invalid email format' });
      return false;
    }
    if (!/^\+?\d{10,15}$/.test(formData.phone)) {
      setMessage({ type: 'error', text: 'Invalid phone number format' });
      return false;
    }
    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return false;
    }
    return true;
  };

  // Handle form submission
  async function handleSignup(e) {
    e.preventDefault();
    setMessage(null); // Clear previous messages

    if (!validateForm()) return;

    setIsLoading(true);
    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataObj.append(key, value);
    });

    const result = await signup(formDataObj);
    setIsLoading(false);

    if (result?.error) {
      setMessage({ type: 'error', text: result.error });
    } else if (result?.success) {
      setMessage({ type: 'success', text: result.success });
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
      });
      // Delay redirect to show success message
      setTimeout(() => {
        router.push('/dashboard/community');
      }, 2000); // 2-second delay
    }
  }

  return (
    <>
      {isLoading && <Loader />}
      <div className={`min-h-screen bg-gray-50 relative overflow-hidden ${isLoading ? 'opacity-50' : ''}`}>
        {/* Circular Background Overlays */}
        <div className="absolute top-[-20%] left-[-20%] w-[40rem] h-[40rem] bg-green-200/30 rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-30%] right-[-20%] w-[50rem] h-[50rem] bg-green-300/20 rounded-full animate-pulse-slow delay-1000"></div>
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10 gap-6">
          {/* Left Side: Text */}
          <div className="lg:w-1/2 w-full flex items-center justify-center lg:h-screen">
            <div className="max-w-md w-full text-center lg:text-left space-y-6">
              {/* EcoBin Community Logo */}
              <div className="flex justify-center lg:justify-start mb-2">
                <svg width="60" height="60" viewBox="0 0 100 100" className="text-green-600">
                  <rect x="35" y="30" width="30" height="40" fill="currentColor" rx="5" />
                  <path d="M40 35 h20 v5 h-20 z" fill="#424242" />
                  <path d="M47 50 l6 6 m0-6 l-6 6" stroke="#fbfbfb" strokeWidth="2" />
                  <circle cx="50" cy="20" r="10" fill="#4fb07a" />
                </svg>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 tracking-wide">
                Join the EcoBin Community
              </h2>
              <p className="text-lg sm:text-xl text-gray-600">
                Become a part of our mission to promote sustainability and cleaner surroundings.
              </p>
              <p className="text-gray-600">
                Register today to connect with like-minded individuals and contribute to a greener planet.
              </p>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="lg:w-1/2 w-full flex items-center justify-center lg:h-screen">
            <div className="max-w-md w-full bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl p-8 border border-green-100">
              <h3 className="text-2xl font-semibold text-center text-gray-800 mb-6">Register Now</h3>
              <form onSubmit={handleSignup} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="John"
                    />
                  </div>
                  <div className="relative">
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                      placeholder="Doe"
                    />
                  </div>
                </div>

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
                      onChange={handleChange}
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
                      <path fill="currentColor" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h16V6H4zm8 5l8 5H4l8-5zm-8-2h16v2H4V9z" />
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 peer"
                      placeholder="+91 12345 67890"
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 peer-focus:text-green-600"
                    >
                      <path fill="currentColor" d="M6.62 10.79a15.915 15.915 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.27 1.12.3 2.33.47 3.57.47.55 0 1 .45 1 1v3.5c0 .55-.45 1-1 1C9.5 22 2 14.5 2 6c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.24.17 2.45.47 3.57.09.35 0 .75-.27 1.02l-2.2 2.2z" />
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
                      onChange={handleChange}
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
                      <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9v2H4v10h16V11h-1V9c0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5v2H7V9c0-2.76 2.24-5 5-5zm-5 9h10v6H7v-6z" />
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
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
                      <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9v2H4v10h16V11h-1V9c0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5v2H7V9c0-2.76 2.24-5 5-5zm-5 9h10v6H7v-6z" />
                    </svg>
                  </div>
                </div>

                {/* Display Error or Success Message */}
                {message && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`text-center text-sm p-2 rounded-md ${
                      message.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}
                  >
                    {message.text}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 text-white py-3 rounded-full text-lg font-semibold hover:bg-green-700 hover:scale-105 transition-all duration-300 shadow-md disabled:bg-gray-400 disabled:scale-100"
                >
                  {isLoading ? 'Registering...' : 'Register'}
                </button>
              </form>

              {/* Back to Home Link */}
              <div className="mt-6 text-center">
                <Link href="/" className="text-sm text-green-600 hover:underline">
                  Back to Home
                </Link>
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/auth/sign-in" className="text-green-600 hover:underline font-medium">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Animation */}
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
      </div>
    </>
  );
};

export default Community;