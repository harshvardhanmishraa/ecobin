'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

const CommunityView = ({ user }) => {
  const supabase = createClient();

  const [topContributors, setTopContributors] = useState([]);
  const [communityWork, setCommunityWork] = useState([]);
  const [joinedWork, setJoinedWork] = useState([]);
  const [completedWork, setCompletedWork] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Handle sidebar collapse based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setIsCollapsed(window.innerWidth < 768);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch all community data
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch top contributors
      const { data: contributorsData, error: contributorsError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, total_points')
        .order('total_points', { ascending: false })
        .limit(3);
      if (contributorsError) throw contributorsError;

      setTopContributors(
        contributorsData.map((contributor) => ({
          id: contributor.id,
          name: `${contributor.first_name} ${contributor.last_name}`,
          points: contributor.total_points,
          avatar: `${contributor.first_name[0]}${contributor.last_name[0]}`.toUpperCase(),
        }))
      );

      // Fetch community work
      const { data: communityWorkData, error: communityWorkError } = await supabase
        .from('community_work')
        .select('id, title, description, reward, status');
      if (communityWorkError) throw communityWorkError;

      setCommunityWork(communityWorkData || []);

      // Fetch user's joined work
      const { data: joinedWorkData, error: joinedWorkError } = await supabase
        .from('active_contributions')
        .select('work_id')
        .eq('user_id', user.id);
      if (joinedWorkError) throw joinedWorkError;

      setJoinedWork(joinedWorkData.map((work) => work.work_id));

      // Fetch user's completed work
      const { data: completedWorkData, error: completedWorkError } = await supabase
        .from('completed_contributions')
        .select('work_id')
        .eq('user_id', user.id);
      if (completedWorkError) throw completedWorkError;

      setCompletedWork(completedWorkData.map((work) => work.work_id));

      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err.message);
      setError('Failed to load community data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe to real-time updates for community_work and completed_contributions
    const workSubscription = supabase
      .channel('community_work_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'community_work' },
        () => fetchData()
      )
      .subscribe();

    const completedSubscription = supabase
      .channel('completed_contributions_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'completed_contributions', filter: `user_id=eq.${user.id}` },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(workSubscription);
      supabase.removeChannel(completedSubscription);
    };
  }, [user.id]);

  // Handle joining a community work
  const handleJoin = async (work) => {
    try {
      if (joinedWork.includes(work.id)) {
        alert(`You’ve already joined: ${work.title}!`);
        return;
      }

      if (work.status === 'Completed') {
        alert('This contribution is already completed and cannot be joined.');
        return;
      }

      // Insert into active_contributions
      const { error: joinError } = await supabase.from('active_contributions').insert({
        user_id: user.id,
        work_id: work.id,
        status: 'Open',
      });

      if (joinError) throw joinError;

      // Optimistic update
      setJoinedWork((prev) => [...prev, work.id]);

      alert(`You’ve joined: ${work.title}! You’ll earn ${work.reward} points when it’s completed.`);
    } catch (err) {
      console.error('Error joining work:', err.message);
      alert('Failed to join work: ' + err.message);
    }
  };

  // Filter available, active, and completed contributions
  const availableContributions = communityWork.filter(
    (work) => !joinedWork.includes(work.id) && work.status !== 'Completed'
  );
  const activeContributions = communityWork.filter(
    (work) => joinedWork.includes(work.id) && !completedWork.includes(work.id) && work.status !== 'Completed'
  );
  const completedContributions = communityWork.filter((work) => completedWork.includes(work.id));

  if (loading) {
    return <div className="text-center text-gray-600">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800">Community</h2>

      <div>
        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="bg-green-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-green-700 transition-all"
        >
          {isCollapsed ? 'Expand' : 'Collapse'} Sidebar
        </button>
      </div>

      {/* Top Contributors */}
      <div className={`bg-white p-6 rounded-lg shadow-md transition-all duration-300 ${isCollapsed ? 'hidden' : ''}`}>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Top Contributors</h3>
        <ul className="space-y-4">
          {topContributors.map((contributor) => (
            <li
              key={contributor.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-xl font-bold text-green-700">
                  {contributor.avatar}
                </div>
                <span className="text-gray-800 font-medium">{contributor.name}</span>
              </div>
              <span className="text-green-600 font-medium">{contributor.points} points</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Community Work Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Community Work */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Available Community Work</h3>
          <div className="space-y-4">
            {availableContributions.length > 0 ? (
              availableContributions.map((work) => (
                <div key={work.id} className="p-4 bg-gray-50 rounded-lg hover:bg-green-50 border flex flex-col">
                  <div className="flex justify-between items-start">
                    <h4 className="text-lg font-semibold text-gray-800">{work.title}</h4>
                    <span className="text-green-600 font-medium text-sm">{work.reward} pts</span>
                  </div>
                  <p className="text-sm text-gray-500">{work.description}</p>
                  <button
                    onClick={() => handleJoin(work)}
                    className="mt-4 px-4 py-2 font-semibold text-white rounded-full bg-green-600 hover:bg-green-700 hover:scale-105 transition-all"
                  >
                    Join
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No available community work at the moment.</p>
            )}
          </div>
        </div>

        {/* Current Active Contributions */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Current Active Contributions</h3>
          <div className="space-y-4">
            {activeContributions.length > 0 ? (
              activeContributions.map((work) => (
                <div key={work.id} className="p-4 bg-gray-50 rounded-lg hover:bg-green-50 border flex flex-col">
                  <div className="flex justify-between items-start">
                    <h4 className="text-lg font-semibold text-gray-800">{work.title}</h4>
                    <span className="text-green-600 font-medium text-sm">{work.reward} pts</span>
                  </div>
                  <p className="text-sm text-gray-500">{work.description}</p>
                  <p className="text-sm text-gray-600 mt-2">Status: {work.status}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-600">You haven’t joined any active community work yet.</p>
            )}
          </div>
        </div>

        {/* Completed Contributions */}
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 lg:col-span-2">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Completed Contributions</h3>
          <div className="space-y-4">
            {completedContributions.length > 0 ? (
              completedContributions.map((work) => (
                <div key={work.id} className="p-4 bg-gray-50 rounded-lg hover:bg-green-50 border flex flex-col">
                  <div className="flex justify-between items-start">
                    <h4 className="text-lg font-semibold text-gray-800">{work.title}</h4>
                    <span className="text-green-600 font-medium text-sm">{work.reward} pts</span>
                  </div>
                  <p className="text-sm text-gray-500">{work.description}</p>
                  <p className="text-sm text-gray-600 mt-2">Status: Completed</p>
                </div>
              ))
            ) : (
              <p className="text-gray-600">You haven’t completed any community work yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityView;