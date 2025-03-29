'use client';
import Link from 'next/link';
import React, { useState } from 'react';

const IndexNavBar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Community', href: '/join-community' },
    { name: 'Learn', href: '/learn' },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex justify-between items-center py-4 bg-transparent">
        <h1 className="text-2xl md:text-3xl font-bold tracking-wide text-green-700">EcoBin</h1>
        <div className="flex flex-wrap justify-center items-center gap-6">
          {navLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-gray-600 hover:text-gray-950 transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>
        <Link
          href="/auth/sign-in"
          className="bg-green-600 text-white px-4 py-1.5 rounded-xl hover:-translate-y-1 hover:shadow-sm transition-all"
        >
          Sign In
        </Link>
      </nav>

      {/* Mobile Toggle Button and Header */}
      <div className="md:hidden flex justify-between items-center py-4">
        <h1 className="text-2xl font-bold tracking-wide text-green-700">EcoBin</h1>
        <button
          className={isSidebarOpen ? 'hidden' : 'p-2 text-gray-600 hover:text-green-700 focus:outline-none'}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:hidden transition-transform duration-300 ease-in-out z-50`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold tracking-wide text-green-700">EcoBin</h1>
            <button
              className="p-2 text-gray-600 hover:text-green-700 focus:outline-none"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="space-y-4">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block text-gray-600 hover:text-green-700 transition-colors text-lg"
                onClick={() => setIsSidebarOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/auth/sign-in"
              className="block bg-green-600 text-white px-4 py-2 rounded-xl text-center hover:bg-green-700 transition-all text-lg mt-4"
              onClick={() => setIsSidebarOpen(false)}
            >
              Sign In
            </Link>
          </nav>
        </div>
      </div>

      {/* Overlay for Mobile Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default IndexNavBar;