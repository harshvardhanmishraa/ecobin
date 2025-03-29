'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { motion } from 'framer-motion';

export default function ContributionManager() {
  const supabase = createClient();

  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    title: '',
    description: '',
    reward: 1,
    status: 'Open',
  });
  const [editFormData, setEditFormData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Check if the user is an admin based on auth.users metadata
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setError('Please log in to manage contributions.');
        setLoading(false);
        return;
      }

      const isAdmin = user.user_metadata?.designation === 'admin';
      setIsAdmin(isAdmin);
      if (!isAdmin) {
        setError('You must be an admin to manage contributions.');
      }
      setLoading(false);
    };
    checkAdmin();
  }, []);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('community_work')
        .select('id, title, description, reward, status');

      if (error) throw error;

      setContributions(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching contributions:', err.message);
      setError('Failed to load contributions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchContributions();
  }, [isAdmin]);

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData((prev) => ({
      ...prev,
      [name]: name === 'reward' ? parseInt(value, 10) || 1 : value,
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: name === 'reward' ? parseInt(value, 10) || 1 : value,
    }));
  };

  const handleCreateContribution = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('community_work').insert([createFormData]);

      if (error) throw error;

      alert('Contribution created successfully!');
      setCreateFormData({ title: '', description: '', reward: 1, status: 'Open' });
      fetchContributions();
    } catch (err) {
      console.error('Error creating contribution:', err.message);
      alert('Failed to create contribution: ' + err.message);
    }
  };

  const handleUpdateContribution = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('community_work')
        .update(editFormData)
        .eq('id', editFormData.id);

      if (error) throw error;

      alert('Contribution updated successfully!');
      setEditFormData(null);
      setShowEditModal(false);
      fetchContributions();
    } catch (err) {
      console.error('Error updating contribution:', err.message);
      alert('Failed to update contribution: ' + err.message);
    }
  };

  const handleCompleteContribution = async (contributionId) => {
    if (!isAdmin) {
      alert('Only admins can complete contributions.');
      return;
    }
  
    try {
      const { data: contributionData, error: fetchError } = await supabase
        .from('community_work')
        .select('reward, status')
        .eq('id', contributionId)
        .single();
  
      if (fetchError) throw fetchError;
      if (contributionData.status === 'Completed') {
        alert('Contribution is already completed!');
        return;
      }
  
      const { data: participants, error: participantsError } = await supabase
        .from('active_contributions')
        .select('user_id')
        .eq('work_id', contributionId);
  
      if (participantsError) throw participantsError;
      if (participants.length === 0) {
        console.warn('No participants found for this contribution.');
      } else {
        const reward = contributionData.reward || 0;
        const completedRecords = participants.map((participant) => ({
          user_id: participant.user_id,
          work_id: contributionId,
          points_earned: reward/2,
        }));
  
        const { error: insertError } = await supabase
          .from('completed_contributions')
          .insert(completedRecords);
  
        if (insertError) throw insertError;
  
        const { error: completeError } = await supabase
          .from('community_work')
          .update({ status: 'Completed' })
          .eq('id', contributionId);
  
        if (completeError) throw completeError;
  
        alert(`Contribution marked as completed! ${participants.length} participants awarded ${reward} points each.`);
      }
      fetchContributions();
    } catch (err) {
      console.error('Error completing contribution:', err.message);
      alert('Failed to complete contribution: ' + err.message);
    }
  };

  const handleDeleteContribution = async (contributionId) => {
    if (!isAdmin) {
      alert('Only admins can delete contributions.');
      return;
    }
  
    if (!window.confirm('Are you sure you want to delete this contribution?')) return;
  
    try {
      console.log('Attempting to delete contribution with ID:', contributionId);
      const { error } = await supabase.from('community_work').delete().eq('id', contributionId);
  
      if (error) {
        console.error('Delete error:', error);
        throw error;
      }
  
      console.log('Contribution deleted successfully');
      alert('Contribution deleted successfully!');
      fetchContributions();
    } catch (err) {
      console.error('Error deleting contribution:', err);
      alert('Failed to delete contribution: ' + (err.message || 'Unknown error'));
    }
  };

  const handleEditClick = (contribution) => {
    setEditFormData({
      id: contribution.id,
      title: contribution.title || '',
      description: contribution.description || '',
      reward: contribution.reward || 1,
      status: contribution.status || 'Open',
    });
    setShowEditModal(true);
  };

  if (loading) {
    return <div className="p-4 sm:p-6 text-center text-gray-600">Loading...</div>;
  }

  if (!isAdmin) {
    return <div className="p-4 sm:p-6 text-center text-red-500">{error || 'You must be an admin to access this page.'}</div>;
  }

  if (error) {
    return <div className="p-4 sm:p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <motion.div
      className="bg-white p-4 sm:p-6 rounded-lg shadow-lg m-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <h2 className="font-semibold text-gray-800 text-base sm:text-lg">Manage Contributions</h2>
      </div>

      {/* Create Contribution Form */}
      <form onSubmit={handleCreateContribution} className="space-y-4 mb-6">
        <h3 className="font-semibold text-gray-800 text-base sm:text-lg">Create Contribution</h3>
        <div className="space-y-2">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={createFormData.title}
            onChange={handleCreateInputChange}
            className="px-3 py-2 border rounded w-full text-sm text-gray-700 hover:border-green-400"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={createFormData.description}
            onChange={handleCreateInputChange}
            className="px-3 py-2 border rounded w-full text-sm text-gray-700 hover:border-green-400"
            rows="3"
            required
          />
          <input
            type="number"
            name="reward"
            placeholder="Reward Points"
            value={createFormData.reward}
            onChange={handleCreateInputChange}
            className="px-3 py-2 border rounded w-full text-sm text-gray-700 hover:border-green-400"
            min="1"
            required
          />
          <select
            name="status"
            value={createFormData.status}
            onChange={handleCreateInputChange}
            className="px-3 py-2 border rounded w-full text-sm text-gray-700 hover:border-green-400"
            required
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
          </select>
          <motion.button
            type="submit"
            className="bg-green-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded hover:bg-green-700 w-full sm:w-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            Create Contribution
          </motion.button>
        </div>
      </form>

      {/* Edit Contribution Modal */}
      {showEditModal && editFormData && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 backdrop-blur-sm flex justify-center items-center">
          <motion.div
            className="bg-white p-6 rounded-lg shadow-lg w-80 sm:w-96 relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <motion.button
              className="absolute top-2 right-2 text-gray-700 hover:text-gray-900 text-2xl font-bold p-1"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowEditModal(false)}
            >
              ×
            </motion.button>
            <h3 className="font-semibold text-gray-800 text-base sm:text-lg mb-4">Edit Contribution</h3>
            <form onSubmit={handleUpdateContribution} className="space-y-2">
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={editFormData.title}
                onChange={handleEditInputChange}
                className="px-3 py-2 border rounded w-full text-sm text-gray-700 hover:border-green-400"
                required
              />
              <textarea
                name="description"
                placeholder="Description"
                value={editFormData.description}
                onChange={handleEditInputChange}
                className="px-3 py-2 border rounded w-full text-sm text-gray-700 hover:border-green-400"
                rows="3"
                required
              />
              <input
                type="number"
                name="reward"
                placeholder="Reward Points"
                value={editFormData.reward}
                onChange={handleEditInputChange}
                className="px-3 py-2 border rounded w-full text-sm text-gray-700 hover:border-green-400"
                min="1"
                required
              />
              <select
                name="status"
                value={editFormData.status}
                onChange={handleEditInputChange}
                className="px-3 py-2 border rounded w-full text-sm text-gray-700 hover:border-green-400"
                required
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <div className="flex justify-end mt-4">
                <motion.button
                  type="submit"
                  className="bg-green-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded hover:bg-green-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={loading}
                >
                  Update Contribution
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Contribution List */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <table className="w-full text-sm sm:text-base min-w-[1000px]">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="pb-3 px-2 sm:px-4">#</th>
              <th className="pb-3 px-2 sm:px-4">Title</th>
              <th className="pb-3 px-2 sm:px-4">Description</th>
              <th className="pb-3 px-2 sm:px-4">Reward</th>
              <th className="pb-3 px-2 sm:px-4">Status</th>
              <th className="pb-3 px-2 sm:px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contributions.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-3 px-2 sm:px-4 text-gray-600 text-center">
                  No contributions found.
                </td>
              </tr>
            ) : (
              contributions.map((contribution, index) => (
                <motion.tr
                  key={contribution.id}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.1 } }),
                  }}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="py-3 px-2 sm:px-4">{index + 1}</td>
                  <td className="py-3 px-2 sm:px-4">{contribution.title}</td>
                  <td className="py-3 px-2 sm:px-4">{contribution.description}</td>
                  <td className="py-3 px-2 sm:px-4">{contribution.reward} points</td>
                  <td className="py-3 px-2 sm:px-4">{contribution.status}</td>
                  <td className="py-3 px-2 sm:px-4 flex space-x-2">
                    <motion.button
                      className="text-green-600 text-xs sm:text-sm"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEditClick(contribution)}
                    >
                      Edit
                    </motion.button>
                    <motion.button
                      className="text-green-600 text-xs sm:text-sm"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleCompleteContribution(contribution.id)}
                      disabled={loading || contribution.status === 'Completed'}
                    >
                      Complete
                    </motion.button>
                    <motion.button
                      className="text-red-500 text-xs sm:text-sm"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteContribution(contribution.id)}
                      disabled={loading}
                    >
                      Delete
                    </motion.button>
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