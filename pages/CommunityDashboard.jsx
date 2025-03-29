'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import {
  IconHome,
  IconUser,
  IconGift,
  IconUsers,
  IconLogout2,
} from '@tabler/icons-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import HomeView from '@/components/ComDashboard/HomeView';
import Sidebar from '@/components/AdminDashBoard/Sidebar';
import ProfileView from '@/components/ComDashboard/ProfileView';
import RewardsView from '@/components/ComDashboard/RewardView';
import CommunityView from '@/components/ComDashboard/CommunityView';

export function CommunityDashboard({ user: initialUser }) {
  const router = useRouter();
  const supabase = createClient();

  const [isCollapsed, setIsCollapsed] = useState(typeof window !== 'undefined' && window.innerWidth < 768); // Ensure no SSR error
  const [currentView, setCurrentView] = useState('Home');
  const [user, setUser] = useState(initialUser);

  // Window resize listener for sidebar state
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setIsCollapsed(window.innerWidth < 768);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  // Check if user is authenticated
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login'); // Redirect unauthenticated users
      } else {
        setUser(user);
      }
    };

    if (!initialUser) {
      checkUser();
    }
  }, [initialUser, router]);

  // Logout functionality
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
      alert('Failed to log out. Please try again.');
      return;
    }
    alert('Logged out successfully!');
    router.push('/');
  };

  const links = [
    {
      label: 'Home',
      icon: <IconHome className="h-6 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      onClick: () => setCurrentView('Home'),
    },
    {
      label: 'Profile',
      icon: <IconUser className="h-6 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      onClick: () => setCurrentView('Profile'),
    },
    {
      label: 'Rewards',
      icon: <IconGift className="h-6 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      onClick: () => setCurrentView('Rewards'),
    },
    {
      label: 'Community',
      icon: <IconUsers className="h-6 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      onClick: () => setCurrentView('Community'),
    },
    {
      label: 'Logout',
      icon: <IconLogout2 className="h-6 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      onClick: handleLogout,
    },
  ];

  const views = {
    Home: <HomeView user={user} />,
    Profile: <ProfileView user={user} />,
    Rewards: <RewardsView user={user} />,
    Community: <CommunityView user={user} />,
  };

  if (!user) {
    return <div>Loading...</div>; // Use a Loader here if available
  }

  return (
    <div className="flex w-full flex-1 flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        links={links}
        currentView={currentView}
      />

      {/* Main Content */}
      <motion.div
        className="flex flex-1 flex-col"
        animate={{
          marginLeft: isCollapsed ? '64px' : '200px',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="w-full flex-1 flex-col gap-2 bg-gray-50 p-2 md:p-10 overflow-auto">
          {views[currentView] || <HomeView user={user} />}
        </div>
      </motion.div>
    </div>
  );
}

export const Logo = () => (
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

export const LogoIcon = () => (
  <Link
    href="#"
    className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
  >
    <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-green-600" />
  </Link>
);

export default CommunityDashboard;
