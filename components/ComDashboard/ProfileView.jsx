'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client'; // Adjust the path if necessary

const ProfileView = ({ user }) => {
  const supabase = createClient(); // Initialize Supabase client

  const [isReportsOpen, setIsReportsOpen] = useState(false); // Toggle for reports
  const [isEditing, setIsEditing] = useState(false); // Toggle for edit mode
  const [firstName, setFirstName] = useState(user?.user_metadata?.first_name || '');
  const [lastName, setLastName] = useState(user?.user_metadata?.last_name || '');
  const [totalPoints, setTotalPoints] = useState(0);
  const [reports, setReports] = useState([]);
  const [communityContributions, setCommunityContributions] = useState([]);
  const [totalWaste, setTotalWaste] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile, reports, and community contributions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch user profile to get total points
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('total_points')
          .eq('id', user?.id)
          .single();
        if (profileError) throw profileError;

        setTotalPoints(profileData?.total_points || 0);

        // Fetch user reports
        const { data: reportsData, error: reportsError } = await supabase
          .from('waste_reports')
          .select('id, location, waste_type, status, waste_amount')
          .eq('user_id', user?.id);
        if (reportsError) throw reportsError;

        setReports(reportsData || []);

        // Calculate total waste
        const totalWasteAmount = reportsData.reduce((acc, report) => acc + (report.waste_amount || 0), 0);
        setTotalWaste(totalWasteAmount);

        // Fetch community contributions
        const { data: contributionsData, error: contributionsError } = await supabase
          .from('completed_contributions')
          .select('id, user_id, work_id, points_earned, completed_at')
          .eq('user_id', user?.id);

        if (contributionsError) {
          console.error('Error fetching contributions:', contributionsError.message);
          throw contributionsError;
        }

        setCommunityContributions(contributionsData || []);

        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err.message);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchData(); // Only fetch if the user ID is available
  }, [user?.id]);

  // Handle saving profile changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ first_name: firstName, last_name: lastName })
        .eq('id', user?.id);

      if (error) throw error;

      alert('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err.message);
      alert('Failed to update profile. Please try again.');
    }
  };

  const co2Saved = (totalWaste * 0.5).toFixed(1); // Hypothetical: 0.5 kg CO2 saved per kg of waste
  const treesSaved = Math.round(totalWaste / 10); // Hypothetical: 1 tree saved per 10 kg of waste

  if (loading) {
    return <div>Loading...</div>; // Replace with a custom Loader component if available
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800">My Profile</h2>

      {/* Profile Card */}
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar Placeholder */}
          <div className="w-24 h-24 rounded-full bg-green-200 flex items-center justify-center text-3xl font-bold text-green-700">
            {firstName[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 space-y-4">
            {isEditing ? (
              <form className="space-y-4" onSubmit={handleSaveProfile}>
                <div>
                  <label className="block text-gray-700 font-medium">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-green-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-green-400"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-green-700 hover:scale-105 transition-all duration-300"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-gray-600 hover:scale-105 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-gray-800">
                  {firstName} {lastName}
                </h3>
                <p className="text-gray-600"><strong>Email:</strong> {user?.email}</p>
                <p className="text-gray-600"><strong>Total Points:</strong> {totalPoints}</p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-2 bg-green-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-green-700 hover:scale-105 transition-all duration-300"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contributions Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contribution Stats */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Contributions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-green-100 rounded-lg text-center">
              <p className="text-lg font-semibold text-green-800">Reports Submitted</p>
              <p className="text-2xl text-gray-800">{reports.length}</p>
            </div>
            <div className="p-4 bg-green-100 rounded-lg text-center">
              <p className="text-lg font-semibold text-green-800">Waste Cleaned</p>
              <p className="text-2xl text-gray-800">{totalWaste} kg</p>
            </div>
            <div className="p-4 bg-green-100 rounded-lg text-center">
              <p className="text-lg font-semibold text-green-800">CO2 Saved</p>
              <p className="text-2xl text-gray-800">{co2Saved} kg</p>
            </div>
            <div className="p-4 bg-green-100 rounded-lg text-center">
              <p className="text-lg font-semibold text-green-800">Trees Saved</p>
              <p className="text-2xl text-gray-800">{treesSaved}</p>
            </div>
          </div>
        </div>

        {/* Community Contributions */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Community Contributions</h3>
          <ul className="space-y-2 max-h-96 overflow-y-auto">
            {communityContributions.map((contrib) => (
              <li
                key={contrib.id}
                className="p-4 rounded-lg bg-gray-50 hover:bg-green-100 transition-colors duration-200 flex justify-between items-center"
              >
                <span>
                  {contrib.work_id} - <span className="text-gray-600">{contrib.completed_at}</span>
                </span>
                <span className="text-green-600 font-medium">{contrib.points_earned} points</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-gray-600">
            <strong>Total Points from Community:</strong>{' '}
            {communityContributions.reduce((acc, c) => acc + c.points_earned, 0)}
          </p>
        </div>
      </div>

      {/* My Reports */}
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
        <button
          onClick={() => setIsReportsOpen(!isReportsOpen)}
          className="w-full text-xl font-semibold text-gray-800 flex justify-between items-center hover:text-green-700 transition-colors duration-200"
        >
          My Reports
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${isReportsOpen ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isReportsOpen && (
          <ul className="space-y-2 mt-4 animate-fade-in">
            {reports.map((report) => (
              <li
                key={report.id}
                className="p-4 rounded-lg bg-gray-50 hover:bg-green-100 transition-colors duration-200 flex justify-between items-center cursor-pointer"
                onClick={() => alert(`Report Details: ${report.location} - ${report.waste_type}`)}
              >
                <span>
                  {report.location} - {report.waste_type} -{' '}
                  <span
                    className={`${
                      report.status === 'Verified'
                        ? 'text-green-600'
                        : report.status === 'Pending'
                        ? 'text-yellow-600'
                        : 'text-blue-600'
                    } font-medium`}
                  >
                    {report.status}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProfileView;
