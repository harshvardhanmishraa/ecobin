'use client'
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/utils';

export default function Driver() {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [newDriver, setNewDriver] = useState({
    driver_name: '',
    driver_email: '',
    driver_password: '',
  });
  const [newDriverId, setNewDriverId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDriver, setEditingDriver] = useState(null);
  const [assignModal, setAssignModal] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchDrivers();
    fetchVehicles();
  }, []);

  const fetchDrivers = async () => {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('driver_id', { ascending: true });

    if (error) {
      console.error('Error fetching drivers:', error.message);
    } else {
      setDrivers(data);
    }
  };

  const fetchVehicles = async () => {
    const { data, error } = await supabase
      .from('vehicles')
      .select('id, current_location, driver_id')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching vehicles:', error.message);
    } else {
      setVehicles(data);
    }
  };

  const generateDriverId = async () => {
    const { data, error } = await supabase
      .from('drivers')
      .select('driver_id')
      .order('driver_id', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching latest driver ID:', error);
      return 'D000001';
    }

    const lastId = data[0]?.driver_id || 'D000000';
    const numericPart = parseInt(lastId.replace('D', ''), 10);
    const newNumericPart = numericPart + 1;
    return `D${String(newNumericPart).padStart(6, '0')}`;
  };

  const validateDriver = (driver) => {
    const newErrors = {};
    if (!driver.driver_name) newErrors.driver_name = 'Driver name is required';
    if (!driver.driver_email || !/\S+@\S+\.\S+/.test(driver.driver_email))
      newErrors.driver_email = 'Valid email is required';
    if (!driver.driver_password || driver.driver_password.length < 6)
      newErrors.driver_password = 'Password must be at least 6 characters';
    return newErrors;
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setNewDriver((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingDriver((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddDriver = async () => {
    const driverData = {
      driver_id: newDriverId,
      driver_name: newDriver.driver_name,
      driver_email: newDriver.driver_email,
      driver_password: newDriver.driver_password,
      assigned_vehicle_id: null,
      status: 'notAssigned',
    };

    const validationErrors = validateDriver(driverData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const { data, error } = await supabase
      .from('drivers')
      .insert([driverData])
      .select();

    if (error) {
      console.error('Error adding driver:', error.message);
    } else {
      setDrivers([...drivers, data[0]]);
      setNewDriver({ driver_name: '', driver_email: '', driver_password: '' });
      setNewDriverId('');
      setShowModal(false);
      setErrors({});
    }
  };

  const handleEditDriver = async () => {
    const updatedDriver = {
      driver_name: editingDriver.driver_name,
      driver_email: editingDriver.driver_email,
      driver_password: editingDriver.driver_password,
      assigned_vehicle_id: editingDriver.assigned_vehicle_id || null,
      status: editingDriver.status,
    };

    const validationErrors = validateDriver(updatedDriver);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const { error } = await supabase
      .from('drivers')
      .update(updatedDriver)
      .eq('driver_id', editingDriver.driver_id);

    if (error) {
      console.error('Error updating driver:', error.message);
    } else {
      const updatedDrivers = drivers.map((d) =>
        d.driver_id === editingDriver.driver_id ? { ...d, ...updatedDriver } : d
      );
      setDrivers(updatedDrivers);
      setEditingDriver(null);
      setShowModal(false);
      setErrors({});
    }
  };

  const handleDeleteDriver = async (driverId) => {
    try {
  
      const updatedVehicle = {
        driver_id: null,
      };
  
      const { error: vehicleError } = await supabase
        .from('vehicles')
        .update(updatedVehicle)
        .eq('driver_id', driverId);
  
      if (vehicleError) {
        console.error('Error updating vehicle:', vehicleError.message);
        return;
      }
  
  
      const { error: driverError } = await supabase
        .from('drivers')
        .delete()
        .eq('driver_id', driverId);
  
      if (driverError) {
        console.error('Error deleting driver:', driverError.message);
        return;
      }
      setDrivers(drivers.filter((d) => d.driver_id !== driverId));
      setShowModal(false);
      setErrors({});
      
    } catch (err) {
      console.error('Unexpected error:', err.message);
    }
  };
  

  const handleAssignVehicle = async () => {
    const { error: driverError } = await supabase
      .from('drivers')
      .update({ assigned_vehicle_id: selectedVehicleId, status: 'isAssigned' })
      .eq('driver_id', selectedDriverId);

    if (driverError) {
      console.error('Error assigning vehicle to driver:', driverError.message);
      return;
    }

    const { error: vehicleError } = await supabase
      .from('vehicles')
      .update({ driver_id: selectedDriverId })
      .eq('id', selectedVehicleId);

    if (vehicleError) {
      console.error('Error updating vehicle with driver:', vehicleError.message);
      return;
    }

    await fetchDrivers();
    await fetchVehicles();
    setAssignModal(false);
    setSelectedVehicleId('');
    setSelectedDriverId(null);
  };

  const openAddModal = async () => {
    const generatedId = await generateDriverId();
    setNewDriverId(generatedId);
    setEditingDriver(null);
    setShowModal(true);
  };

  const filteredDrivers = drivers.filter((driver) =>
    driver.driver_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.1 } }),
  };

  return (
    <motion.div
      className="bg-white p-4 sm:p-6 rounded-lg shadow-lg m-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <h2 className="font-semibold text-gray-800 text-base sm:text-lg">Drivers</h2>
        <input
          type="text"
          placeholder="Search by driver name"
          className="px-3 py-1 rounded border border-gray-300 w-full sm:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <motion.button
          className="bg-green-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded hover:bg-green-700 w-full sm:w-auto"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openAddModal}
        >
          + Add Driver
        </motion.button>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0  bg-opacity-30 backdrop-blur-md flex justify-center items-center">
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
              onClick={() => {
                setShowModal(false);
                setEditingDriver(null);
                setNewDriverId('');
                setErrors({});
              }}
            >
              ×
            </motion.button>
            <h3 className="font-semibold text-lg text-gray-700 mb-4">{editingDriver ? 'Edit Driver' : 'Add Driver'}</h3>
            <div className="flex flex-col space-y-2">
              <input
                type="text"
                name="driver_id"
                value={editingDriver ? editingDriver.driver_id : newDriverId}
                disabled
                className="px-3 py-2 border rounded bg-gray-200"
              />
              <div>
                <input
                  type="text"
                  name="driver_name"
                  placeholder="Driver Name"
                  value={editingDriver ? editingDriver.driver_name : newDriver.driver_name}
                  onChange={editingDriver ? handleEditChange : handleAddChange}
                  className="px-3 py-2 border rounded w-full"
                />
                {errors.driver_name && <p className="text-red-500 text-xs">{errors.driver_name}</p>}
              </div>
              <div>
                <input
                  type="email"
                  name="driver_email"
                  placeholder="Driver Email"
                  value={editingDriver ? editingDriver.driver_email : newDriver.driver_email}
                  onChange={editingDriver ? handleEditChange : handleAddChange}
                  className="px-3 py-2 border rounded w-full"
                />
                {errors.driver_email && <p className="text-red-500 text-xs">{errors.driver_email}</p>}
              </div>
              <div>
                <input
                  type="password"
                  name="driver_password"
                  placeholder="Driver Password"
                  value={editingDriver ? editingDriver.driver_password : newDriver.driver_password}
                  onChange={editingDriver ? handleEditChange : handleAddChange}
                  className="px-3 py-2 border rounded w-full"
                />
                {errors.driver_password && (
                  <p className="text-red-500 text-xs">{errors.driver_password}</p>
                )}
              </div>
              {editingDriver && (
                <>
                  <input
                    type="text"
                    name="assigned_vehicle_id"
                    placeholder="Assigned Vehicle ID"
                    value={editingDriver.assigned_vehicle_id || ''}
                    onChange={handleEditChange}
                    className="px-3 py-2 border rounded"
                  />
                  <select
                    name="status"
                    value={editingDriver.status}
                    onChange={handleEditChange}
                    className="px-3 py-2 border rounded"
                  >
                    <option value="" disabled>Select Status</option>
                    <option value="isAssigned">isAssigned</option>
                    <option value="notAssigned">notAssigned</option>
                  </select>
                </>
              )}
              <div className="flex justify-end mt-4">
                <motion.button
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={editingDriver ? handleEditDriver : handleAddDriver}
                >
                  {editingDriver ? 'Update' : 'Add'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Assign Vehicle Modal */}
      {assignModal && (
        <div className="fixed inset-0  bg-opacity-30 backdrop-blur-md flex justify-center items-center">
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
              onClick={() => setAssignModal(false)}
            >
              ×
            </motion.button>
            <h3 className="font-semibold text-lg text-gray-700 mb-4">Assign Vehicle</h3>
            <div className="flex flex-col space-y-2">
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="px-3 py-2 border rounded"
              >
                <option value="" disabled>Select Vehicle</option>
                {vehicles
                  .filter((v) => !v.driver_id)
                  .map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.id} - {vehicle.current_location}
                    </option>
                  ))}
              </select>
              <div className="flex justify-end mt-4">
                <motion.button
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAssignVehicle}
                  disabled={!selectedVehicleId}
                >
                  Assign
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Driver List Table */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <table className="w-full text-sm sm:text-base min-w-[1000px]">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="pb-3 px-2 sm:px-4">Driver Name</th>
              <th className="pb-3 px-2 sm:px-4">Driver ID</th>
              <th className="pb-3 px-2 sm:px-4">Assigned Vehicle ID</th>
              <th className="pb-3 px-2 sm:px-4">Driver Email</th>
              <th className="pb-3 px-2 sm:px-4">Driver Password</th>
              <th className="pb-3 px-2 sm:px-4">Status</th>
              <th className="pb-3 px-2 sm:px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.map((driver, index) => (
              <motion.tr
                key={driver.driver_id}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                custom={index}
                className="border-b"
              >
                <td className="py-3 px-2 sm:px-4">{driver.driver_name}</td>
                <td className="py-3 px-2 sm:px-4">{driver.driver_id}</td>
                <td className="py-3 px-2 sm:px-4">{driver.assigned_vehicle_id || 'None'}</td>
                <td className="py-3 px-2 sm:px-4">{driver.driver_email}</td>
                <td className="py-3 px-2 sm:px-4">{driver.driver_password}</td>
                <td className="py-3 px-2 sm:px-4">{driver.status}</td>
                <td className="py-3 px-2 sm:px-4 flex space-x-2">
                  <motion.button
                    className="text-blue-500 text-xs sm:text-sm"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setEditingDriver(driver);
                      setShowModal(true);
                    }}
                  >
                    Edit
                  </motion.button>
                  <motion.button
                    className="text-red-500 text-xs sm:text-sm"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteDriver(driver.driver_id)}
                  >
                    Delete
                  </motion.button>
                  <motion.button
                    className="text-green-500 text-xs sm:text-sm"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setSelectedDriverId(driver.driver_id);
                      setAssignModal(true);
                    }}
                    disabled={driver.status === 'isAssigned'}
                  >
                    Assign Vehicle
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}