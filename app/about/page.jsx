'use client';
import IndexNavBar from '@/components/AdminDashBoard/IndexNavBar';
import Link from 'next/link';
import React from 'react';
const About = () => {
  const features = [
    {
      title: 'Smart Dustbins',
      description: 'Our bins automatically detect when they’re full using advanced sensors, ensuring timely waste collection without overflow.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6h18z" />
        </svg>
      ),
    },
    {
      title: 'Real-Time Monitoring',
      description: 'Check the live status of each dustbin through our platform, providing transparency and control over waste management.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 2v6l4 2" />
        </svg>
      ),
    },
    {
      title: 'Automatic Driver Assignment',
      description: 'Once a dustbin is full, our system assigns a driver automatically, streamlining the collection process.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 3a2 2 0 0 1 2 2v14l-4-4H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12z" />
        </svg>
      ),
    },
    {
      title: 'Optimized Routes',
      description: 'AI-driven analytics calculate the most efficient routes for waste collection, saving time and reducing emissions.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10h-6l-2 4H9l-2-4H3m0-2h18M9 4l3 3 3-3" />
        </svg>
      ),
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
          <div className="flex-grow flex flex-col items-center mt-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-wide text-gray-800 text-center">
              About EcoBin
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mt-4 max-w-3xl text-center">
              EcoBin is revolutionizing waste management with cutting-edge technology. Our mission is to create a cleaner, greener future through smart solutions that enhance efficiency and sustainability.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 max-w-5xl">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="bg-white/50 p-6 rounded-xl border border-green-100 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-green-600">{feature.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-800">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600 mt-2">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Call to Action */}
            <div className="mt-12 text-center">
              <Link
                href="/learn"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-green-700 hover:scale-105 transition-all duration-300 shadow-md"
              >
                Learn More
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            </div>
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

export default About;