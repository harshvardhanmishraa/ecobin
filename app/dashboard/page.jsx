// app/dashboard/page.js
'use server'
import AdminDashboard from '@/pages/AdminDashboard';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import CommunityDashboard from '@/pages/CommunityDashboard';

export default async function DashboardPage() {
  const supabase = await createClient(); // Add await here
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/sign-in');
  }
  
  const designation = user.user_metadata?.designation || 'community';
  
  switch (designation.toLowerCase()) {
    case 'admin':
      return <AdminDashboard user={user} />;
    case 'community':
      return <CommunityDashboard user={user} />;
    default:
      return <CommunityDashboard user={user} />;
  }
}