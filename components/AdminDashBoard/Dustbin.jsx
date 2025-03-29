import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/utils'; // Adjust the path as needed

export default function Dustbin() {
  const [dustbins, setDustbins] = useState([]);
  const [newBin, setNewBin] = useState({ id: '', location: '', longitude: '', latitude: '', address: '', totalcapacity: '' });
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBin, setEditingBin] = useState(null);

  useEffect(() => {
    fetchDustbins();
  }, []);

  const fetchDustbins = async () => {
    const { data, error } = await supabase
      .from('dustbins')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching dustbins:', error.message || error);
    } else {
      setDustbins(data);
    }
  };

  const generateNewId = async () => {
    const { data, error } = await supabase
      .from('dustbins')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching latest ID:', error);
      return 'D000001';
    }

    const lastId = data[0]?.id || 'D000000';
    const numericPart = parseInt(lastId.replace('D', ''), 10);
    const newNumericPart = numericPart + 1;
    return `D${String(newNumericPart).padStart(6, '0')}`;
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setNewBin((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;
    if (['redcapacity', 'greencapacity', 'bluecapacity'].includes(name)) {
      parsedValue = parseFloat(value) || 0;
      parsedValue = Math.max(0, Math.min(100, parsedValue));
    } else if (name === 'totalcapacity') {
      parsedValue = parseInt(value) || 0;
    }
    setEditingBin((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const handleAddDustbin = async () => {
    const newId = await generateNewId();
    const newDustbin = {
      id: newId,
      location: newBin.location,
      longitude: newBin.longitude,
      latitude: newBin.latitude,
      address: newBin.address,
      redcapacity: 0,
      greencapacity: 0,
      bluecapacity: 0,
      totalcapacity: parseInt(newBin.totalcapacity) || 100,
      status: 'Under Maintenance',
    };

    if (!newDustbin.location || !newDustbin.longitude || !newDustbin.latitude || !newDustbin.address) {
      console.error('Error: All fields (location, longitude, latitude, address) are required');
      return;
    }

    const { data, error } = await supabase
      .from('dustbins')
      .insert([newDustbin])
      .select();

    if (error) {
      console.error('Error adding dustbin:', error.message || error);
    } else {
      setDustbins([...dustbins, data[0]]);
      setNewBin({ id: '', location: '', longitude: '', latitude: '', address: '', totalcapacity: '' });
      setShowModal(false);
    }
  };

  const handleEditDustbin = async () => {
    const updatedDustbin = {
      location: editingBin.location,
      longitude: editingBin.longitude,
      latitude: editingBin.latitude,
      address: editingBin.address,
      redcapacity: parseFloat(editingBin.redcapacity),
      greencapacity: parseFloat(editingBin.greencapacity),
      bluecapacity: parseFloat(editingBin.bluecapacity),
      totalcapacity: parseInt(editingBin.totalcapacity),
      status: editingBin.status,
    };

    const { error } = await supabase
      .from('dustbins')
      .update(updatedDustbin)
      .eq('id', editingBin.id);

    if (error) {
      console.error('Error updating dustbin:', error.message || error);
    } else {
      const updatedDustbins = dustbins.map((bin) =>
        bin.id === editingBin.id ? { ...bin, ...updatedDustbin } : bin
      );
      setDustbins(updatedDustbins);
      setEditingBin(null);
      setShowModal(false);
    }
  };

  const handleDeleteDustbin = async (id) => {
    const { error } = await supabase
      .from('dustbins')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting dustbin:', error.message || error);
    } else {
      setDustbins(dustbins.filter((bin) => bin.id !== id));
    }
  };

  const filteredDustbins = dustbins.filter((bin) =>
    bin.location.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h2 className="font-semibold text-gray-800 text-base sm:text-lg">Dustbins</h2>
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
          onClick={() => {
            setEditingBin(null);
            setShowModal(true);
          }}
        >
          + Add Dustbin
        </motion.button>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center">
          <motion.div
            className="bg-white border border-green-100 p-6 rounded-lg shadow-lg w-80 sm:w-96 relative"
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
                setEditingBin(null);
              }}
            >
              ×
            </motion.button>
            <h3 className="font-semibold text-lg text-gray-700 mb-4">{editingBin ? 'Edit Dustbin' : 'Add Dustbin'}</h3>
            <div className="flex flex-col space-y-2">
              <input
                type="text"
                name="id"
                value="Auto generated"
                disabled
                className="px-3 py-2 border rounded bg-gray-200"
              />
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={editingBin ? editingBin.location : newBin.location}
                onChange={editingBin ? handleEditChange : handleAddChange}
                className="px-3 py-2 border rounded"
              />
              <input
                type="text"
                name="longitude"
                placeholder="Longitude"
                value={editingBin ? editingBin.longitude : newBin.longitude}
                onChange={editingBin ? handleEditChange : handleAddChange}
                className="px-3 py-2 border rounded"
              />
              <input
                type="text"
                name="latitude"
                placeholder="Latitude"
                value={editingBin ? editingBin.latitude : newBin.latitude}
                onChange={editingBin ? handleEditChange : handleAddChange}
                className="px-3 py-2 border rounded"
              />
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={editingBin ? editingBin.address : newBin.address}
                onChange={editingBin ? handleEditChange : handleAddChange}
                className="px-3 py-2 border rounded"
              />
              {editingBin && (
                <>
                  <input
                    type="number"
                    name="redcapacity"
                    placeholder="Red Filled (%)"
                    value={editingBin.redcapacity}
                    onChange={handleEditChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className="px-3 py-2 border rounded"
                  />
                  <input
                    type="number"
                    name="greencapacity"
                    placeholder="Green Filled (%)"
                    value={editingBin.greencapacity}
                    onChange={handleEditChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className="px-3 py-2 border rounded"
                  />
                  <input
                    type="number"
                    name="bluecapacity"
                    placeholder="Blue Filled (%)"
                    value={editingBin.bluecapacity}
                    onChange={handleEditChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className="px-3 py-2 border rounded"
                  />
                </>
              )}
              <input
                type="number"
                name="totalcapacity"
                placeholder="Total Capacity (kg)"
                value={editingBin ? editingBin.totalcapacity : newBin.totalcapacity}
                onChange={editingBin ? handleEditChange : handleAddChange}
                min="0"
                className="px-3 py-2 border rounded"
              />
              {editingBin && (
                <select
                  name="status"
                  value={editingBin.status}
                  onChange={handleEditChange}
                  className="px-3 py-2 border rounded"
                >
                  <option value="" disabled>
                    Select Status
                  </option>
                  <option value="Active">Active</option>
                  <option value="Full">Full</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                </select>
              )}
              <div className="flex justify-end mt-4">
                <motion.button
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={editingBin ? handleEditDustbin : handleAddDustbin}
                >
                  {editingBin ? 'Update' : 'Add'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Dustbin List Table */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <table className="w-full text-sm sm:text-base min-w-[1000px]">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="pb-3 px-2 sm:px-4">ID</th>
              <th className="pb-3 px-2 sm:px-4">Location</th>
              <th className="pb-3 px-2 sm:px-4">Longitude</th>
              <th className="pb-3 px-2 sm:px-4">Latitude</th>
              <th className="pb-3 px-2 sm:px-4">Red Filled (%)</th>
              <th className="pb-3 px-2 sm:px-4">Green Filled (%)</th>
              <th className="pb-3 px-2 sm:px-4">Blue Filled (%)</th>
              <th className="pb-3 px-2 sm:px-4">Total Capacity (kg)</th>
              <th className="pb-3 px-2 sm:px-4">Address</th>
              <th className="pb-3 px-2 sm:px-4">Status</th>
              <th className="pb-3 px-2 sm:px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDustbins.map((bin, index) => (
              <motion.tr
                key={bin.id}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
                custom={index}
                className="border-b"
              >
                <td className="py-3 px-2 sm:px-4">{bin.id}</td>
                <td className="py-3 px-2 sm:px-4">{bin.location}</td>
                <td className="py-3 px-2 sm:px-4">{bin.longitude}</td>
                <td className="py-3 px-2 sm:px-4">{bin.latitude}</td>
                <td className="py-3 px-2 sm:px-4">{bin.redcapacity.toFixed(1)}%</td>
                <td className="py-3 px-2 sm:px-4">{bin.greencapacity.toFixed(1)}%</td>
                <td className="py-3 px-2 sm:px-4">{bin.bluecapacity.toFixed(1)}%</td>
                <td className="py-3 px-2 sm:px-4">{bin.totalcapacity} kg</td>
                <td className="py-3 px-2 sm:px-4">{bin.address}</td>
                <td className="py-3 px-2 sm:px-4">{bin.status}</td>
                <td className="py-3 px-2 sm:px-4 flex space-x-2">
                  <motion.button
                    className="text-blue-500 text-xs sm:text-sm"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setEditingBin(bin);
                      setShowModal(true);
                    }}
                  >
                    Edit
                  </motion.button>
                  <motion.button
                    className="text-red-500 text-xs sm:text-sm"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteDustbin(bin.id)}
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