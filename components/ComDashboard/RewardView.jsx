'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client'; // Adjust path if necessary

export function RewardsView({ user }) {
  const supabase = createClient(); // Initialize Supabase client

  const [totalPoints, setTotalPoints] = useState(0); // Total points for the user
  const [offers, setOffers] = useState([]); // Reward offers fetched from the database
  const [redeemedOffers, setRedeemedOffers] = useState([]); // Track redeemed offers
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user points and available offers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch user profile to get total points
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('total_points')
          .eq('id', user.id)
          .single();
        if (profileError) throw profileError;

        setTotalPoints(profileData?.total_points || 0);

        // Fetch available reward offers
        const { data: offersData, error: offersError } = await supabase
          .from('rewards')
          .select('id, name, cost, description');
        if (offersError) throw offersError;

        setOffers(offersData || []);

        // Fetch redeemed rewards
        const { data: redeemedData, error: redeemedError } = await supabase
          .from('redeemed_rewards')
          .select('reward_id')
          .eq('user_id', user.id);
        if (redeemedError) throw redeemedError;

        setRedeemedOffers(redeemedData.map((reward) => reward.reward_id));

        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err.message);
        setError('Failed to load rewards. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  // Handle reward redemption
  const handleRedeem = async (offer) => {
    if (totalPoints >= offer.cost && !redeemedOffers.includes(offer.id)) {
      try {
        // Begin transaction to insert into redeemed_rewards and update total_points
        const { data: redeemedData, error: redeemedError } = await supabase
          .from('redeemed_rewards')
          .insert({
            user_id: user.id,
            reward_id: offer.id,
          });
  
        if (redeemedError) throw redeemedError;
  
        // Now update the user's points in the 'profiles' table
        const { data: updatedProfileData, error: updateError } = await supabase
          .from('profiles')
          .update({
            total_points: totalPoints - offer.cost, // Subtract the offer cost from total points
          })
          .eq('id', user.id)
          .single(); // Ensures only a single row is updated
  
        if (updateError) throw updateError;
  
        // If both operations succeed, update state locally
        setRedeemedOffers((prev) => [...prev, offer.id]); // Add the redeemed offer to the list
        setTotalPoints(updatedProfileData.total_points); // Update the total points in state
  
        alert(`Successfully redeemed: ${offer.name}!`);
      } catch (err) {
        console.error('Error redeeming reward:', err.message);
        alert('Failed to redeem reward. Please try again.');
      }
    } else if (redeemedOffers.includes(offer.id)) {
      alert('You have already redeemed this offer!');
    } else {
      alert('Not enough points to redeem this offer!');
    }
  };
  

  if (loading) {
    return <div>Loading...</div>; // Replace with a custom Loader component if available
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800">Rewards</h2>

      {/* Total Points */}
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Your Total Points</h3>
        <p className="text-3xl font-bold text-green-700">{totalPoints}</p>
        <p className="text-gray-600 mt-2">Redeem your points for exciting rewards below!</p>
      </div>

      {/* Redeemable Offers */}
      <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Available Offers</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="p-4 bg-gray-50 rounded-lg hover:bg-green-50 transition-colors duration-200 border border-gray-200 flex flex-col"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">{offer.name}</h4>
                  <p className="text-sm text-gray-500">{offer.description}</p>
                </div>
                <span className="text-green-600 font-medium text-sm">{offer.cost} pts</span>
              </div>
              <div className="flex justify-end mt-3">
                <button
                  onClick={() => handleRedeem(offer)}
                  className={`w-fit px-4 py-2 rounded-full font-semibold text-white transition-all duration-300 ${
                    redeemedOffers.includes(offer.id)
                      ? 'bg-gray-400 cursor-not-allowed'
                      : totalPoints >= offer.cost
                      ? 'bg-green-600 hover:bg-green-700 hover:scale-105'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                  disabled={redeemedOffers.includes(offer.id)}
                >
                  {redeemedOffers.includes(offer.id) ? 'Redeemed' : 'Redeem'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RewardsView;
