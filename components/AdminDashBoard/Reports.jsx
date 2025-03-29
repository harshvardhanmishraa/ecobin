'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { motion } from 'framer-motion';

export default function Reports() {
  const supabase = createClient();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc' for created_at
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Pending', 'Verified', 'Completed'

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('waste_reports')
          .select('id, location, waste_type, description, status, user_id, created_at');

        if (statusFilter !== 'All') {
          query = query.eq('status', statusFilter);
        }

        query = query.order('created_at', { ascending: sortOrder === 'asc' });

        const { data, error } = await query;

        if (error) throw error;

        setReports(data || []);
      } catch (err) {
        console.error('Error fetching reports:', err.message);
        setError('Failed to load reports: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [sortOrder, statusFilter]);

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      const { error } = await supabase
        .from('waste_reports')
        .update({ status: newStatus })
        .eq('id', reportId);

      if (error) throw error;

      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === reportId ? { ...report, status: newStatus } : report
        )
      );

      alert('Status updated successfully!');
    } catch (err) {
      console.error('Error updating status:', err.message);
      alert('Failed to update status: ' + err.message);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.1 } }),
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 text-center text-gray-600">
        Loading reports...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <motion.div
      className="bg-white p-4 sm:p-6 rounded-lg shadow-lg m-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <h2 className="font-semibold text-gray-800 text-base sm:text-lg">Waste Reports</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <motion.select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1 sm:py-2 rounded border border-gray-300 text-sm text-gray-700 hover:border-green-400 w-full sm:w-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            <option value="All">All Reports</option>
            <option value="Pending">Pending</option>
            <option value="Verified">Verified</option>
            <option value="Completed">Completed</option>
          </motion.select>
          <motion.button
            className="bg-green-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded hover:bg-green-700 w-full sm:w-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSortOrder}
            disabled={loading}
          >
            Sort by Date ({sortOrder === 'desc' ? '↓' : '↑'})
          </motion.button>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <table className="w-full text-sm sm:text-base min-w-[1000px]">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="pb-3 px-2 sm:px-4">#</th>
              <th className="pb-3 px-2 sm:px-4">Location</th>
              <th className="pb-3 px-2 sm:px-4">Waste Type</th>
              <th className="pb-3 px-2 sm:px-4">Description</th>
              <th className="pb-3 px-2 sm:px-4">Status</th>
              <th className="pb-3 px-2 sm:px-4">Created At</th>
              <th className="pb-3 px-2 sm:px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-3 px-2 sm:px-4 text-gray-600 text-center">
                  No reports found.
                </td>
              </tr>
            ) : (
              reports.map((report, index) => (
                <motion.tr
                  key={report.id}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="py-3 px-2 sm:px-4">{index + 1}</td>
                  <td className="py-3 px-2 sm:px-4">{report.location}</td>
                  <td className="py-3 px-2 sm:px-4">{report.waste_type}</td>
                  <td className="py-3 px-2 sm:px-4">{report.description}</td>
                  <td className="py-3 px-2 sm:px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        report.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : report.status === 'Verified'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 sm:px-4">
                    {new Date(report.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-2 sm:px-4 flex space-x-2">
                    <motion.select
                      value={report.status}
                      onChange={(e) => handleStatusChange(report.id, e.target.value)}
                      className="px-3 py-2 border rounded text-sm text-gray-700 hover:border-green-400"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Verified">Verified</option>
                      <option value="Completed">Completed</option>
                    </motion.select>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}