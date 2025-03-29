// components/StaffDashboard.js
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const StaffDashboard = ({ user }) => {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out:', error.message);
      return;
    }

    router.push('/');
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
      <div className="text-center w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Staff Dashboard - Welcome, {user.user_metadata?.first_name} {user.user_metadata?.last_name}!
        </h1>
        <p className="text-gray-600 mb-6">You’re part of the EcoBin Staff team.</p>
        <button
          onClick={handleLogout}
          className="bg-blue-600 text-white py-2 px-4 rounded-full font-semibold hover:bg-blue-700 transition-all duration-300"
        >
          Sign Out
        </button>
        {/* Add staff-specific features here */}
      </div>
    </div>
  );
};

export default StaffDashboard;