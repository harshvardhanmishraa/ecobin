'use client';
import IndexNavBar from '@/components/AdminDashBoard/IndexNavBar';
import Link from 'next/link';
import React from 'react';

const Learn = () => {
  const topics = [
    {
      title: 'Earn with Waste Recycling',
      description: 'Discover how you can generate income by participating in waste recycling programs, government incentives, and our smart waste management system.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m-4 0h8" />
        </svg>
      ),
    },
    {
      title: 'Torrefaction & LFG Rewards',
      description: 'Learn how torrefaction and landfill gas (LFG) can be monetized, helping you earn while contributing to a greener future.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 2v6l4 2" />
        </svg>
      ),
    },
    {
      title: 'Composting for Profit',
      description: 'Turn organic waste into valuable compost and sell it to farmers, gardeners, or landscaping companies.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 12l8-8 8 8m-8 8V4" />
        </svg>
      ),
    },
    {
      title: 'Upcycling & Creative Recycling',
      description: 'Transform discarded materials into artistic or useful products to sell online or at craft fairs.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm4 4h6v6H9V9z" />
        </svg>
      ),
    },
    {
      title: 'Eco-friendly Business Opportunities',
      description: 'Start your own business by offering zero-waste products or waste collection services in your community.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 3v18m12-18v18M3 6h18M3 12h18M3 18h18" />
        </svg>
      ),
    },
    {
      title: 'Plastic Collection Incentives',
      description: 'Join programs that reward individuals for collecting and returning plastic waste for recycling.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V8l-8-6-8 6v4c0 6 8 10 8 10z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-20%] w-[40rem] h-[40rem] bg-green-200/30 rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-[-30%] right-[-20%] w-[50rem] h-[50rem] bg-green-300/20 rounded-full animate-pulse-slow delay-1000"></div>
      
      <section className="px-4 sm:px-8 md:px-16 md:pt-8 relative z-10">
        <div className="max-w-7xl mx-auto min-h-screen flex flex-col">
          <IndexNavBar/>
          <div className="flex-grow flex flex-col items-center mt-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-wide text-gray-800 text-center">
              Learn & Earn with EcoBin
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 mt-4 max-w-3xl text-center">
              Explore opportunities to earn money while contributing to sustainable waste management solutions.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 max-w-5xl">
              {topics.map((topic, idx) => (
                <div key={idx} className="bg-white/50 p-6 rounded-xl border border-green-100 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="text-green-600">{topic.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-800">{topic.title}</h3>
                  </div>
                  <p className="text-gray-600 mt-2">{topic.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link href="/contribute" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-green-700 hover:scale-105 transition-all duration-300 shadow-md">
                Start Earning
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Learn;