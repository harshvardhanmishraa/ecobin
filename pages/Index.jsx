'use client';
import IndexNavBar from '@/components/AdminDashBoard/IndexNavBar';
import Link from 'next/link';
import React from 'react';
const Index = () => {
  const features = [
    'Ensures efficiency',
    'Eco-friendly disposal',
    'Reduce costs',
    'Promotes sustainability',
  ];

  const socialLinks = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24">
          <path fill="#424242" d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3"/>
        </svg>
      ),
      href: '#',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 16 16">
          <path fill="#424242" d="M9.294 6.928L14.357 1h-1.2L8.762 6.147L5.25 1H1.2l5.31 7.784L1.2 15h1.2l4.642-5.436L10.751 15h4.05zM7.651 8.852l-.538-.775L2.832 1.91h1.843l3.454 4.977l.538.775l4.491 6.47h-1.843z"/>
        </svg>
      ),
      href: '#',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24">
          <path fill="#424242" d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z"/>
        </svg>
      ),
      href: '#',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Circular Background Overlays */}
      <div className="absolute top-[-20%] left-[-20%] w-[40rem] h-[40rem] bg-green-200/30 rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-[-30%] right-[-20%] w-[50rem] h-[50rem] bg-green-300/20 rounded-full animate-pulse-slow delay-1000"></div>

      {/* Content Container */}
      <section className="px-4 sm:px-8 md:px-16 md:pt-8 relative z-10">
        <div className="max-w-7xl mx-auto min-h-screen flex flex-col">
          <IndexNavBar/>

          {/* Main Content */}
          <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mt-5 lg:bg-white/50 rounded-3xl lg:p-8 lg:border border-green-100">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-wide text-gray-800">
                Smart Waste Management System
              </h2>
              <p className="text-lg sm:text-xl text-gray-600">
                Automatic waste collection with real-time monitoring, AI-driven analytics, and optimized routes.
              </p>
              <ul className="space-y-3">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-lg font-medium text-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      className="text-green-600"
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M5 14.5s1.5 0 3.5 3.5c0 0 5.559-9.167 10.5-11"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/stats"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-green-700 hover:scale-105 transition-all duration-300 shadow-md transform-origin-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
                Explore Stats
              </Link>
            </div>
            <div className="flex justify-center">
              <img
                src="/indexbanner.png"
                alt="EcoBin System"
                className="w-full max-w-md object-cover rounded-lg"
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="flex justify-center md:justify-end gap-6 mt-8 mb-8">
            {socialLinks.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="text-gray-600 hover:text-green-700 hover:-translate-y-1 transition-all"
              >
                {item.icon}
              </Link>
            ))}
          </div>
        </div>
      </section>

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
  );
};

export default Index;