'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Sidebar({ isCollapsed, setIsCollapsed, links, currentView }) {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if we're on mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };
    
    // Check on initial load
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsCollapsed]);

  const menuIconVariants = {
    collapsed: { width: 32, height: 32, strokeWidth: 2 },
    expanded: { width: 24, height: 24, strokeWidth: 1.5 },
  };

  const MobileMenu = () => (
    <div className="fixed inset-0 z-30 bg-gray-800 bg-opacity-50">
      <motion.div 
        className="fixed right-0 top-0 h-screen bg-white w-64 shadow-lg"
        initial={{ x: 300 }}
        animate={{ x: 0 }}
        exit={{ x: 300 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="flex justify-between items-center p-4 bg-green-50">
          <span className="font-semibold text-green-600">Menu</span>
          <button onClick={() => setMobileMenuOpen(false)}>
            <XMarkIcon className="h-6 w-6 text-green-600" />
          </button>
        </div>
        <nav className="mt-4">
          {links && links.length > 0 ? (
            links.map((item, index) => {
              const isActive = item.label.toLowerCase() === currentView.toLowerCase();
              return (
                <div
                  key={index}
                  className={`flex items-center p-4 cursor-pointer transition-colors duration-200 ${
                    isActive ? 'bg-green-100 border-l-4 border-green-600' : 'hover:bg-green-50'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    item.onClick();
                    setMobileMenuOpen(false);
                  }}
                >
                  {item.icon}
                  <span
                    className={`ml-4 text-sm sm:text-base ${
                      isActive ? 'text-green-800 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    {item.label}
                    {item.badge > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="p-4 text-sm text-gray-500">No navigation items available</p>
          )}
        </nav>
      </motion.div>
    </div>
  );

  // For mobile: show hamburger icon
  if (isMobile) {
    return (
      <>
        <button
          className="fixed top-4 left-4 z-20 p-2 rounded-md bg-white shadow-md"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Bars3Icon className="h-6 w-6 text-green-600" />
        </button>
        
        <AnimatePresence>
          {mobileMenuOpen && <MobileMenu />}
        </AnimatePresence>
      </>
    );
  }

  // For desktop: show regular sidebar
  return (
    <motion.div
      className="fixed h-screen top-0 left-0 z-20"
      animate={{ width: isCollapsed ? 64 : 200 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="h-screen bg-white shadow-lg">
        <button
          className="p-4 flex items-center justify-center w-full bg-green-50 hover:bg-green-100 transition-colors duration-200"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-8 w-8 text-green-600 animate-pulse" strokeWidth={2} />
            ) : (
              <ChevronLeftIcon className="h-8 w-8 text-green-600 animate-pulse" strokeWidth={2} />
            )}
          </motion.div>
        </button>
        <nav className="mt-4">
          {links && links.length > 0 ? (
            links.map((item, index) => {
              const isActive = item.label.toLowerCase() === currentView.toLowerCase();
              return (
                <motion.div
                  key={index}
                  whileHover={{ backgroundColor: '#f0fdf4', x: 5 }}
                  className={`flex items-center p-4 cursor-pointer transition-colors duration-200 ${
                    isActive ? 'bg-green-100 border-l-4 border-green-600' : 'hover:bg-green-50'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    item.onClick();
                  }}
                  transition={{ ease: 'easeInOut' }}
                >
                  <motion.div
                    variants={menuIconVariants}
                    animate={isCollapsed ? 'collapsed' : 'expanded'}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    {item.icon}
                  </motion.div>
                  {!isCollapsed && (
                    <motion.span
                      className={`ml-4 text-sm sm:text-base flex items-center ${
                        isActive ? 'text-green-800 font-semibold' : 'text-gray-700'
                      }`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1, ease: 'easeInOut' }}
                    >
                      {item.label}
                      {item.badge > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </motion.span>
                  )}
                </motion.div>
              );
            })
          ) : (
            <p className="p-4 text-sm text-gray-500">No navigation items available</p>
          )}
        </nav>
      </div>
    </motion.div>
  );
}