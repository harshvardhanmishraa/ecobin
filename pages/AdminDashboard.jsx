'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {
  IconSettings,
  IconTrash,
  IconCar,
  IconMapPin,
  IconReportAnalytics,
  IconLogout2,
  IconLetterD,
} from '@tabler/icons-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LayoutDashboard } from 'lucide-react';
import DashboardPage from '@/components/AdminDashBoard/DashboardPage';
import Dustbin from '@/components/AdminDashBoard/Dustbin';
import Vehicles from '@/components/AdminDashBoard/Vehicles';
const RouteOptimization = dynamic(() => import('@/components/AdminDashBoard/RouteOptimization'), { ssr: false });
import Reports from '@/components/AdminDashBoard/Reports';
import Sidebar from '@/components/AdminDashBoard/Sidebar';
import Driver from '@/components/AdminDashBoard/Driver';
import dynamic from 'next/dynamic';
import ContributionManager from '@/components/AdminDashBoard/Contributions';

export function AdminDashboard({ user: initialUser }) {
  const router = useRouter();
  const supabase = createClient();

  // Use a function to determine initial collapse state safely
  const getInitialCollapsedState = () => (typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [isCollapsed, setIsCollapsed] = useState(getInitialCollapsedState);
  const [currentView, setCurrentView] = useState('Dashboard');
  const [user, setUser] = useState(initialUser);

  // Handle window resize to toggle collapse state
  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 768);
    };

    // Add resize listener only in the browser
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle scroll to collapse sidebar
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 100 && !isCollapsed) {
        setIsCollapsed(true);
      } else if (scrollPosition <= 100 && isCollapsed && window.innerWidth >= 768) {
        setIsCollapsed(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isCollapsed]);

  // Check user authentication
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
      }
    };

    if (!initialUser) {
      checkUser();
    }
  }, [initialUser, router, supabase]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
      return;
    }
    router.push('/');
  };

  const links = [
    {
      label: 'Dashboard',
      href: '#',
      icon: <LayoutDashboard className="h-6 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      onClick: () => setCurrentView('Dashboard'),
    },
    {
      label: 'Dustbin',
      href: '#',
      icon: <IconTrash className="h-6 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      onClick: () => setCurrentView('Dustbin'),
    },
    {
      label: 'Vehicles',
      href: '#',
      icon: <IconCar className="h-6 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      onClick: () => setCurrentView('Vehicles'),
    },
    {
      label: 'Driver',
      href: '#',
      icon: <IconLetterD className="h-6 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      onClick: () => setCurrentView('Driver'),
    },
    {
      label: 'Routes',
      href: '#',
      icon: <IconMapPin className="h-6 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      onClick: () => setCurrentView('Routes'),
    },
    {
      label: 'Reports',
      href: '#',
      icon: <IconReportAnalytics className="h-6 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      onClick: () => setCurrentView('Reports'),
    },
    {
      label: 'Contributions',
      href: '#',
      icon: <IconReportAnalytics className="h-6 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      onClick: () => setCurrentView('Contributions'),
    },
    {
      label: 'Logout',
      href: '#',
      icon: <IconLogout2 className="h-6 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      onClick: handleLogout,
    },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'Dashboard':
        return <DashboardPage />;
      case 'Dustbin':
        return <Dustbin />;
      case 'Vehicles':
        return <Vehicles />;
      case 'Driver':
          return <Driver/>;
      case 'Routes':
        return <RouteOptimization isCollapsed={isCollapsed} />;
      case 'Reports':
        return <Reports />;
      case 'Contributions':
          return <ContributionManager/>;
      default:
        return <DashboardPage />;
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className={cn(
        'flex w-full flex-1 flex-col md:flex-row min-h-screen',
        'bg-gray-50'
      )}
    >
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} links={links} currentView={currentView} />

      {/* Main Content Area */}
      <motion.div
        className="flex flex-1 flex-col"
        animate={{
          marginLeft: typeof window !== 'undefined' && window.innerWidth < 768 ? '0px' : isCollapsed ? '64px' : '200px',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="w-full flex-1 flex-col gap-2 bg-gray-50 p-2 md:p-10 overflow-auto">
          {renderView()}
        </div>
      </motion.div>
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-gray-800"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-green-600" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-gray-800 dark:text-white"
      >
        EcoBin
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-green-600" />
    </Link>
  );
};

export default AdminDashboard;