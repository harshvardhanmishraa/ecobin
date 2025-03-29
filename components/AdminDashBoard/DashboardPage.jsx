'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BinCard from './BinCard';
import VehicleCard from './VehicleCard';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [binSearch, setBinSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [binsData, setBinsData] = useState([]);
  const [vehiclesData, setVehiclesData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const binsResponse = await fetch('/api/dustbin');
        if (!binsResponse.ok) throw new Error('Failed to fetch dustbins');
        const bins = await binsResponse.json();
        console.log('Bins data:', bins);
        setBinsData(Array.isArray(bins) ? bins : []);

        const vehiclesResponse = await fetch('/api/vehicles');
        if (!vehiclesResponse.ok) throw new Error('Failed to fetch vehicles');
        const vehicles = await vehiclesResponse.json();
        console.log('Vehicles data:', vehicles);
        setVehiclesData(Array.isArray(vehicles) ? vehicles : []);

        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredBins = binsData.filter((bin) => {
    const isValid = bin && bin.location && typeof bin.location === 'string';
    return isValid ? bin.location.toLowerCase().includes(binSearch.toLowerCase()) : false;
  });

  // Updated filtering to only use current_location
  const filteredVehicles = vehiclesData.filter((vehicle) => {
    const isValid = vehicle && vehicle.current_location && typeof vehicle.current_location === 'string';
    if (!isValid) console.log('Invalid vehicle:', vehicle);
    return isValid ? vehicle.current_location.toLowerCase().includes(vehicleSearch.toLowerCase()) : false;
  });

  const displayedBins = binSearch ? filteredBins : binsData.slice(0, 3);
  const displayedVehicles = vehicleSearch ? filteredVehicles : filteredVehicles.slice(0, 3);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-6">
      {isLoading ? (
        <motion.div className="flex items-center justify-center min-h-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.div className="flex space-x-2" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <div className="w-4 h-4 bg-green-600 rounded-full"></div>
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <div className="w-4 h-4 bg-green-400 rounded-full"></div>
          </motion.div>
        </motion.div>
      ) : (
        <>
          <div className='bg-white rounded-md border border-neutral-100'>
            <motion.div
              className="p-4 sm:p-6 rounded-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-800 text-base sm:text-lg">Dustbins</h2>
                <input
                  type="text"
                  placeholder="Search by Location (e.g., Downtown)"
                  value={binSearch}
                  onChange={(e) => setBinSearch(e.target.value)}
                  className="p-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedBins.length > 0 ? (
                  displayedBins.map((bin) => (
                    <BinCard
                      key={bin.id || Math.random()}
                      location={`${bin.id || 'Unknown'} - ${bin.location || 'Unknown'}`}
                      bin={bin}
                      isMobile={window.innerWidth < 768}
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-600">No dustbins found</p>
                )}
              </div>
            </motion.div>

            <motion.div
              className="p-4 sm:p-6 rounded-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-800 text-base sm:text-lg">Vehicles</h2>
                <input
                  type="text"
                  placeholder="Search by Location (e.g., Downtown)"
                  value={vehicleSearch}
                  onChange={(e) => setVehicleSearch(e.target.value)}
                  className="p-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedVehicles.length > 0 ? (
                  displayedVehicles.map((vehicle) => (
                    <VehicleCard
                      key={vehicle.id || Math.random()}
                      id={vehicle.id || 'Unknown'}
                      status={vehicle.status || 'Unknown'}
                      fill_percentage={vehicle.fill_percentage || 0}
                      current_location={vehicle.current_location || 'Unknown'}
                      color={vehicle.color}
                      isMobile={window.innerWidth < 768}
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-600">
                    {vehiclesData.length === 0 ? 'No vehicles available' : 'No vehicles found'}
                  </p>
                )}
              </div>
            </motion.div>
          </div>

          <motion.div
            className="bg-white p-4 sm:p-6 rounded-lg border border-neutral-100"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h2 className="font-semibold text-gray-800 mb-4 text-base sm:text-lg">Quick Stats</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{binsData.length}</p>
                <p className="text-sm text-gray-600">Active Dustbins</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{vehiclesData.filter(v => v && v.status === 'assigned').length}</p>
                <p className="text-sm text-gray-600">Vehicles in Use</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">85%</p>
                <p className="text-sm text-gray-600">Route Efficiency</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white p-4 sm:p-6 rounded-lg border border-neutral-100"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <h2 className="font-semibold text-gray-800 mb-4 text-base sm:text-lg">Recent Activity</h2>
            <ul className="space-y-2">
              <li className="text-sm text-gray-700">Dustbin #3 filled - 10:15 AM</li>
              <li className="text-sm text-gray-700">Vehicle #5 completed route - 9:45 AM</li>
              <li className="text-sm text-gray-700">New route optimized - 8:30 AM</li>
            </ul>
          </motion.div>
        </>
      )}
    </div>
  );
}