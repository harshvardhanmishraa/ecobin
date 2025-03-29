'use client';

import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function Sidebar({ isCollapsed, setIsCollapsed, links, currentView }) {
  const menuIconVariants = {
    collapsed: { width: 32, height: 32, strokeWidth: 2 },
    expanded: { width: 24, height: 24, strokeWidth: 1.5 },
  };

  return (
    <motion.div
      className="md:fixed md:h-screen md:top-0 md:left-0 z-20"
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