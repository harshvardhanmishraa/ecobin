'use client';
import React from 'react';
import { useAuth } from '@some-auth-library'; // Replace with your auth library

const StaffDashboard = () => {
  const { user } = useAuth() || {}; // Fallback to empty object if useAuth fails

  // Safely access user_metadata
  const metadata = user?.user_metadata || {};
  const someData = metadata.someField || 'Default Value';

  return (
    <div>
      <h1>Staff Dashboard</h1>
      <p>Welcome, {user?.name || 'Staff Member'}</p>
      <p>Metadata: {someData}</p>
    </div>
  );
};

export default StaffDashboard;