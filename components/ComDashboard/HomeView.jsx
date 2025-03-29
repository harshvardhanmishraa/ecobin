'use client';
import Loader from '@/components/AdminDashBoard/Loader'; 
import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client'; 

const HomeView = ({ user }) => {
  const supabase = createClient(); // Initialize Supabase client

  const [reportFilter, setReportFilter] = useState('All');
  const [location, setLocation] = useState('');
  const [wasteType, setWasteType] = useState('');
  const [description, setDescription] = useState('');
  const [reports, setReports] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [topContributors, setTopContributors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileResponse, reportsResponse, contributorsResponse] = await Promise.all([
          supabase.from('profiles').select('total_points').eq('id', user.id).single(),
          supabase
            .from('waste_reports')
            .select('id, location, waste_type, status, waste_amount, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('profiles')
            .select('first_name, last_name, total_points')
            .order('total_points', { ascending: false })
            .limit(3),
        ]);

        if (profileResponse.error) throw profileResponse.error;
        if (reportsResponse.error) throw reportsResponse.error;
        if (contributorsResponse.error) throw contributorsResponse.error;

        setTotalPoints(profileResponse.data?.total_points || 0);
        setReports(reportsResponse.data || []);
        setTopContributors(
          contributorsResponse.data.map((p) => ({
            name: `${p.first_name} ${p.last_name}`,
            points: p.total_points,
          }))
        );
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err.message);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  // Filter reports based on the selected filter
  const filteredReports =
    reportFilter === 'All' ? reports : reports.filter((report) => report.status === reportFilter);

  // Handle report submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate input fields
    if (!location || !wasteType || !description) {
      setError('Please fill in all fields!');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('waste_reports').insert({
        user_id: user.id,
        location,
        waste_type: wasteType,
        description,
        status: 'Pending',
      });

      if (error) throw error;

      alert('Report submitted successfully!');
      setLocation('');
      setWasteType('');
      setDescription('');

      // Refresh reports after submission
      const { data: updatedReports, error: fetchError } = await supabase
        .from('waste_reports')
        .select('id, location, waste_type, status, waste_amount, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setReports(updatedReports || []);
      setError(null);
    } catch (err) {
      console.error('Error submitting report:', err.message);
      setError('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Environmental impact calculations
  const totalWaste = reports.reduce((acc, report) => acc + (report.waste_amount || 0), 0);
  const co2Saved = (totalWaste * 0.5).toFixed(1); // Assuming 0.5 kg CO2 saved per kg waste
  const treesSaved = Math.round(totalWaste / 10); // Assuming 1 tree saved per 10 kg waste

  // Show loading state
  if (loading) {
    return <Loader message="Loading data..." />;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800">
        Welcome, {user.user_metadata?.first_name || 'User'}!
      </h2>
      <p className="text-lg text-gray-600">Help keep our community clean and earn rewards!</p>

      {error && <div className="text-red-600 text-center mb-4">{error}</div>}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-md transition-all duration-300">
          <h3 className="text-lg font-semibold text-green-700">Total Points</h3>
          <p className="text-2xl text-gray-800 font-bold">{totalPoints}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-md transition-all duration-300">
          <h3 className="text-lg font-semibold text-green-700">Total Reports</h3>
          <p className="text-2xl text-gray-800 font-bold">{reports.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-md transition-all duration-300">
          <h3 className="text-lg font-semibold text-green-700">Waste Cleaned</h3>
          <p className="text-2xl text-gray-800 font-bold">{totalWaste} kg</p>
        </div>
      </div>

      {/* Report Form and Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-md transition-all duration-300">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Raise a Waste Report</h3>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-green-400"
            />
            <select
              value={wasteType}
              onChange={(e) => setWasteType(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-green-400"
            >
              <option value="">Select Waste Type</option>
              <option value="Plastic">Plastic</option>
              <option value="Organic">Organic</option>
              <option value="Hazardous">Hazardous</option>
              <option value="General">General</option>
            </select>
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-green-400"
              rows="3"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-fit bg-green-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-700 hover:scale-105 transition-all duration-300 disabled:bg-gray-400 disabled:scale-100"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-md transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Recent Reports</h3>
            <select
              value={reportFilter}
              onChange={(e) => setReportFilter(e.target.value)}
              className="p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 transition-all duration-200 hover:border-green-400"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Verified">Verified</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <ul className="space-y-2 max-h-96 overflow-y-auto">
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <li
                  key={report.id}
                  className="p-3 rounded-lg bg-gray-50 hover:bg-green-100 transition-colors duration-200 flex justify-between items-center cursor-pointer"
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
              ))
            ) : (
              <li className="p-3 text-gray-600">No reports found.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Environmental Impact */}
      <div className="bg-white p-6 rounded-lg border shadow-md transition-all duration-300">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Environmental Impact</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-green-100 rounded-lg hover:bg-green-200 transition-colors duration-200">
            <p className="text-lg font-semibold text-green-800">CO2 Saved</p>
            <p className="text-2xl text-gray-800">{co2Saved} kg</p>
            <p className="text-sm text-gray-600">Reducing carbon emissions!</p>
          </div>
          <div className="p-4 bg-green-100 rounded-lg hover:bg-green-200 transition-colors duration-200">
            <p className="text-lg font-semibold text-green-800">Trees Saved</p>
            <p className="text-2xl text-gray-800">{treesSaved}</p>
            <p className="text-sm text-gray-600">Preserving our forests!</p>
          </div>
        </div>
      </div>

      {/* Mini Leaderboard */}
      <div className="bg-white p-6 rounded-lg border shadow-md transition-all duration-300">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Top Contributors</h3>
        <ul className="space-y-2">
          {topContributors.length > 0 ? (
            topContributors.map((contributor, index) => (
              <li
                key={index}
                className="p-3 rounded-lg bg-gray-50 hover:bg-green-100 transition-colors duration-200 flex justify-between items-center"
              >
                <span>
                  {index + 1}. {contributor.name}
                </span>
                <span className="text-green-600 font-medium">{contributor.points} points</span>
              </li>
            ))
          ) : (
            <li className="p-3 text-gray-600">No contributors found.</li>
          )}
          {!topContributors.some(
            (c) => c.name === `${user.user_metadata?.first_name} ${user.user_metadata?.last_name}`
          ) && (
            <li className="p-3 rounded-lg bg-gray-50 hover:bg-green-100 transition-colors duration-200 flex justify-between items-center">
              <span>You</span>
              <span className="text-green-600 font-medium">{totalPoints} points</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
export default HomeView