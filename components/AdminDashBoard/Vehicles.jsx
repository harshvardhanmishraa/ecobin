import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/utils';
export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [newVehicle, setNewVehicle] = useState({
    current_location: '',
    capacity: '',
    color: '',
    driver_id: '',
  });
  const [newVehicleId, setNewVehicleId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching vehicles:', error.message);
    } else {
      setVehicles(data);
    }
  };

  const generateVehicleId = async () => {
    const { data, error } = await supabase
      .from('vehicles')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching latest vehicle ID:', error);
      return 'V000001';
    }

    const lastId = data[0]?.id || 'V000000';
    const numericPart = parseInt(lastId.replace('V', ''), 10);
    const newNumericPart = numericPart + 1;
    return `V${String(newNumericPart).padStart(6, '0')}`;
  };

  const validateVehicle = (vehicle) => {
    const newErrors = {};
    if (!vehicle.current_location) newErrors.current_location = 'Current location is required';
    if (!vehicle.capacity || isNaN(vehicle.capacity) || vehicle.capacity <= 0)
      newErrors.capacity = 'Valid capacity (greater than 0) is required';
    if (!vehicle.color) newErrors.color = 'Color is required';
    return newErrors;
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setNewVehicle((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingVehicle((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddVehicle = async () => {
    const vehicleData = {
      id: newVehicleId,
      current_location: newVehicle.current_location,
      fill_percentage: 0,
      capacity: parseInt(newVehicle.capacity) || 1000,
      current_load: 0,
      status: 'Active',
      current_route: 'Unassigned',
      color: newVehicle.color,
      driver_id: newVehicle.driver_id || null,
    };

    const validationErrors = validateVehicle(vehicleData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const { data, error } = await supabase
      .from('vehicles')
      .insert([vehicleData])
      .select();

    if (error) {
      console.error('Error adding vehicle:', error.message);
    } else {
      setVehicles([...vehicles, data[0]]);
      setNewVehicle({ current_location: '', capacity: '', color: '', driver_id: '' });
      setNewVehicleId('');
      setShowModal(false);
      setErrors({});
    }
  };

  const handleEditVehicle = async () => {
    const updatedVehicle = {
      current_location: editingVehicle.current_location,
      capacity: parseInt(editingVehicle.capacity),
      color: editingVehicle.color,
      driver_id: editingVehicle.driver_id || null,
      status: editingVehicle.status,
      fill_percentage: parseFloat(editingVehicle.fill_percentage),
      current_load: parseInt(editingVehicle.current_load),
      current_route: editingVehicle.current_route,
    };

    const validationErrors = validateVehicle(updatedVehicle);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const { error } = await supabase
      .from('vehicles')
      .update(updatedVehicle)
      .eq('id', editingVehicle.id);

    if (error) {
      console.error('Error updating vehicle:', error.message);
    } else {
      const updatedVehicles = vehicles.map((v) =>
        v.id === editingVehicle.id ? { ...v, ...updatedVehicle } : v
      );
      setVehicles(updatedVehicles);
      setEditingVehicle(null);
      setShowModal(false);
      setErrors({});
    }
  };

  const handleDeleteVehicle = async (id) => {
    try {
      const updatedDriver = {
        assigned_vehicle_id: null,
        status: 'notAssigned',      
      };
      const { error: driverError } = await supabase
        .from('drivers')
        .update(updatedDriver)
        .eq('assigned_vehicle_id', id); 
  
      if (driverError) {
        console.error('Error updating driver:', driverError.message);
        return; 
      }

      setShowModal(false);
      setErrors({});
      const { error: vehicleError } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);  
  
      if (vehicleError) {
        console.error('Error deleting vehicle:', vehicleError.message);
        return; 
      }
  
      // Step 5: Update the local vehicles state
      setVehicles(vehicles.filter((v) => v.id !== id));
  
    } catch (err) {
      console.error('Unexpected error:', err.message);
    }
  };
  

  const openAddModal = async () => {
    const generatedId = await generateVehicleId();
    setNewVehicleId(generatedId);
    setEditingVehicle(null);
    setShowModal(true);
  };

  const filteredVehicles = vehicles.filter((vehicle) =>
    vehicle.current_location.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h2 className="font-semibold text-gray-800 text-base sm:text-lg">Vehicles</h2>
        <input
          type="text"
          placeholder="Search by location"
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
          + Add Vehicle
        </motion.button>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center">
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
                setEditingVehicle(null);
                setNewVehicleId('');
                setErrors({});
              }}
            >
              ×
            </motion.button>
            <h3 className="font-semibold text-lg text-gray-700 mb-4">{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</h3>
            <div className="flex flex-col space-y-2">
              <input
                type="text"
                name="id"
                value={editingVehicle ? editingVehicle.id : newVehicleId}
                disabled
                className="px-3 py-2 border rounded bg-gray-200"
              />
              <div>
                <input
                  type="text"
                  name="current_location"
                  placeholder="Current Location"
                  value={editingVehicle ? editingVehicle.current_location : newVehicle.current_location}
                  onChange={editingVehicle ? handleEditChange : handleAddChange}
                  className="px-3 py-2 border rounded w-full"
                />
                {errors.current_location && (
                  <p className="text-red-500 text-xs">{errors.current_location}</p>
                )}
              </div>
              <div>
                <input
                  type="number"
                  name="capacity"
                  placeholder="Capacity (kg)"
                  value={editingVehicle ? editingVehicle.capacity : newVehicle.capacity}
                  onChange={editingVehicle ? handleEditChange : handleAddChange}
                  className="px-3 py-2 border rounded w-full"
                />
                {errors.capacity && <p className="text-red-500 text-xs">{errors.capacity}</p>}
              </div>
              <div>
                <input
                  type="text"
                  name="color"
                  placeholder="Color"
                  value={editingVehicle ? editingVehicle.color : newVehicle.color}
                  onChange={editingVehicle ? handleEditChange : handleAddChange}
                  className="px-3 py-2 border rounded w-full"
                />
                {errors.color && <p className="text-red-500 text-xs">{errors.color}</p>}
              </div>
              <input
                type="text"
                name="driver_id"
                placeholder="Driver ID (optional)"
                value={editingVehicle ? editingVehicle.driver_id : newVehicle.driver_id}
                onChange={editingVehicle ? handleEditChange : handleAddChange}
                className="px-3 py-2 border rounded"
              />
              {editingVehicle && (
                <>
                  <input
                    type="number"
                    name="fill_percentage"
                    placeholder="Fill Percentage (%)"
                    value={editingVehicle.fill_percentage}
                    onChange={handleEditChange}
                    className="px-3 py-2 border rounded"
                  />
                  <input
                    type="number"
                    name="current_load"
                    placeholder="Current Load (kg)"
                    value={editingVehicle.current_load}
                    onChange={handleEditChange}
                    className="px-3 py-2 border rounded"
                  />
                  <input
                    type="text"
                    name="current_route"
                    placeholder="Current Route"
                    value={editingVehicle.current_route}
                    onChange={handleEditChange}
                    className="px-3 py-2 border rounded"
                  />
                  <select
                    name="status"
                    value={editingVehicle.status}
                    onChange={handleEditChange}
                    className="px-3 py-2 border rounded"
                  >
                    <option value="" disabled>Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Full">Full</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                  </select>
                </>
              )}
              <div className="flex justify-end mt-4">
                <motion.button
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={editingVehicle ? handleEditVehicle : handleAddVehicle}
                >
                  {editingVehicle ? 'Update' : 'Add'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Vehicle List Table */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <table className="w-full text-sm sm:text-base min-w-[1000px]">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="pb-3 px-2 sm:px-4">ID</th>
              <th className="pb-3 px-2 sm:px-4">Current Location</th>
              <th className="pb-3 px-2 sm:px-4">Fill %</th>
              <th className="pb-3 px-2 sm:px-4">Capacity</th>
              <th className="pb-3 px-2 sm:px-4">Current Load</th>
              <th className="pb-3 px-2 sm:px-4">Status</th>
              <th className="pb-3 px-2 sm:px-4">Current Route</th>
              <th className="pb-3 px-2 sm:px-4">Color</th>
              <th className="pb-3 px-2 sm:px-4">Driver ID</th>
              <th className="pb-3 px-2 sm:px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map((vehicle, index) => (
              <motion.tr
                key={vehicle.id}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                custom={index}
                className="border-b"
              >
                <td className="py-3 px-2 sm:px-4">{vehicle.id}</td>
                <td className="py-3 px-2 sm:px-4">{vehicle.current_location}</td>
                <td className="py-3 px-2 sm:px-4">{vehicle.fill_percentage}%</td>
                <td className="py-3 px-2 sm:px-4">{vehicle.capacity} kg</td>
                <td className="py-3 px-2 sm:px-4">{vehicle.current_load} kg</td>
                <td className="py-3 px-2 sm:px-4">{vehicle.status}</td>
                <td className="py-3 px-2 sm:px-4">
                  <Link href={`/routes/${vehicle.current_route}`} className="text-blue-500 hover:underline">
                    {vehicle.current_route}
                  </Link>
                </td>
                <td className="py-3 px-2 sm:px-4">{vehicle.color}</td>
                <td className="py-3 px-2 sm:px-4">{vehicle.driver_id || 'None'}</td>
                <td className="py-3 px-2 sm:px-4 flex space-x-2">
                  <motion.button
                    className="text-blue-500 text-xs sm:text-sm"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setEditingVehicle(vehicle);
                      setShowModal(true);
                    }}
                  >
                    Edit
                  </motion.button>
                  <motion.button
                    className="text-red-500 text-xs sm:text-sm"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                  >
                    Delete
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