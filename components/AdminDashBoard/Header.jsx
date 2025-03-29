'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bars3Icon, BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function Header({ 
  isCollapsed, 
  setMobileMenuOpen = () => {}, 
  isMobile = false,
  username = "Admin" 
}) {
  return (
    <motion.header
      className="sticky top-0 z-10 w-full bg-white shadow-sm"
      animate={{
        marginLeft: isMobile ? '0px' : '0px',
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Logo and title section */}
        <div className="flex items-center">
          {isMobile && (
            <button
              className="mr-2 p-2 rounded-md text-green-600 hover:bg-green-50"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          )}
          
          <Link href="#" className="flex items-center">
            <div className="h-7 w-8 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-green-600" />
            <span className="ml-2 text-xl font-semibold text-green-800">EcoBin</span>
          </Link>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-green-50 relative">
            <BellIcon className="h-6 w-6 text-gray-600" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
          </button>
          
          <div className="flex items-center">
            <UserCircleIcon className="h-8 w-8 text-gray-600" />
            <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:inline-block">
              {username}
            </span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}