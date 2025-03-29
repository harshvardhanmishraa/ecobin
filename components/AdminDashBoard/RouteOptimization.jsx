"use client";
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import polyline from '@mapbox/polyline';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

import 'leaflet/dist/leaflet.css';
let L;
if (typeof window !== 'undefined') {
  L = require('leaflet');
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  });
}

export default function RouteOptimization({ isCollapsed }) {
  const [routeRequests, setRouteRequests] = useState([]);
  const [optimizedRoutes, setOptimizedRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  const jaipurDustbins = [
    { dustbin_id: 'hawa_mahal', location: [75.8267, 26.9239], fill_percentage: 80, name: 'Hawa Mahal' },
    { dustbin_id: 'city_palace', location: [75.8236, 26.9258], fill_percentage: 70, name: 'City Palace' },
    { dustbin_id: 'jantar_mantar', location: [75.8246, 26.9248], fill_percentage: 65, name: 'Jantar Mantar' },
    { dustbin_id: 'amer_fort', location: [75.8513, 26.9855], fill_percentage: 85, name: 'Amer Fort' },
    { dustbin_id: 'raja_park', location: [75.8281, 26.8997], fill_percentage: 75, name: 'Raja Park' },
    { dustbin_id: 'mansarovar', location: [75.7500, 26.8430], fill_percentage: 60, name: 'Mansarovar' },
    { dustbin_id: 'vaishali_nagar', location: [75.7350, 26.9470], fill_percentage: 70, name: 'Vaishali Nagar' },
    { dustbin_id: 'malviya_nagar', location: [75.8130, 26.8540], fill_percentage: 68, name: 'Malviya Nagar' },
    { dustbin_id: 'c_scheme', location: [75.8050, 26.9100], fill_percentage: 72, name: 'C-Scheme' },
    { dustbin_id: 'bapu_bazaar', location: [75.8220, 26.9200], fill_percentage: 90, name: 'Bapu Bazaar' },
  ];

  const routeColors = ['#3b82f6', '#ef4444', '#22c55e', '#8b5cf6', '#f97316', '#eab308', '#ec4899', '#06b6d4', '#84cc16', '#14b8a6'];

  const requestCollection = async (dustbinId) => {
    const dustbin = jaipurDustbins.find(d => d.dustbin_id === dustbinId);
    if (!dustbin || routeRequests.some(r => r.dustbin_id === dustbinId)) return;

    setRouteRequests(prev => [...prev, dustbin]);
    try {
      const response = await fetch(`${window.location.origin}/api/routes/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dustbin, currentRoutes: optimizedRoutes, vehicles }),
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();

      const validRoutes = data.routes
        .map(route => {
          if (typeof route.geometry !== 'string') return null;
          return { ...route, geometry: polyline.decode(route.geometry) };
        })
        .filter(Boolean);

      if (validRoutes.length > 0) {
        setOptimizedRoutes(validRoutes);
        setVehicles(data.vehicles || []);
      }
      setRouteRequests(prev => prev.filter(r => r.dustbin_id !== dustbinId));
      setUpdateTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error requesting collection:', error.message);
      setRouteRequests(prev => prev.filter(r => r.dustbin_id !== dustbinId));
    }
  };

  useEffect(() => {
    if (optimizedRoutes.length === 0 || routeRequests.length > 0) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${window.location.origin}/api/routes/request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dustbin: null, currentRoutes: optimizedRoutes, vehicles }),
        });
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();

        const validRoutes = data.routes
          .map(route => {
            if (typeof route.geometry !== 'string') return null;
            return { ...route, geometry: polyline.decode(route.geometry) };
          })
          .filter(Boolean);

        if (validRoutes.length > 0) {
          setOptimizedRoutes(validRoutes);
          setVehicles(data.vehicles || []);
        }
      } catch (error) {
        console.error('Error polling routes:', error.message);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [updateTrigger, optimizedRoutes.length, vehicles.length, routeRequests.length]);

  const center = [26.9124, 75.7871];
  const totalWaste = vehicles.reduce((sum, v) => sum + v.capacityUsed, 0);

  return (
    <div className={`flex-1 p-6 min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">EcoBin: Smart Waste Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-sm">Active Vehicles</p>
          <p className="text-2xl font-semibold">{vehicles.length}</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-sm">Waste Collected</p>
          <p className="text-2xl font-semibold">{totalWaste} kg</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-sm">Pending Requests</p>
          <p className="text-2xl font-semibold">{routeRequests.length}</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Vehicles in Transit</h2>
        {vehicles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map(vehicle => (
              <div
                key={vehicle.id}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col"
              >
                <div className="flex items-center mb-2">
                  <div
                    className="w-5 h-5 mr-3 rounded-full"
                    style={{ backgroundColor: routeColors[(vehicle.id - 1) % routeColors.length] }}
                  ></div>
                  <p className="font-medium">Vehicle {vehicle.id}</p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                  <div
                    className="h-2.5 rounded-full"
                    style={{
                      width: `${(vehicle.capacityUsed / 1000) * 100}%`,
                      backgroundColor: routeColors[(vehicle.id - 1) % routeColors.length],
                    }}
                  ></div>
                </div>
                <p className="text-sm">Capacity: {vehicle.capacityUsed}/1000 kg</p>
                <p className="text-sm truncate">
                  Route: {optimizedRoutes.find(r => r.vehicle_id === vehicle.id)?.steps
                    .filter(s => typeof s.dustbin_id === 'string' && !s.dustbin_id.startsWith('temp_'))
                    .map(s => s.name)
                    .join(' → ') || 'Idle'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 italic">No vehicles in transit yet.</p>
        )}
      </div>

      <div className="mb-8">
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-4 shadow">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Smart Waste Collection</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Request collection manually or let IoT-enabled dustbins auto-trigger when full. Our AI clusters nearby bins and optimizes routes for efficiency—saving fuel and time!
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {jaipurDustbins.map(dustbin => (
            <button
              key={dustbin.dustbin_id}
              onClick={() => requestCollection(dustbin.dustbin_id)}
              disabled={routeRequests.some(r => r.dustbin_id === dustbin.dustbin_id) || optimizedRoutes.some(route => route.steps.some(step => step.dustbin_id === dustbin.dustbin_id))}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                routeRequests.some(r => r.dustbin_id === dustbin.dustbin_id) ? 'bg-yellow-400 text-gray-800 animate-pulse' :
                optimizedRoutes.some(route => route.steps.some(step => step.dustbin_id === dustbin.dustbin_id)) ? 'bg-gray-300 text-gray-600 cursor-not-allowed' :
                'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {routeRequests.some(r => r.dustbin_id === dustbin.dustbin_id) ? 'Requesting...' : dustbin.name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        {typeof window !== 'undefined' && (
          <MapContainer center={center} zoom={12} style={{ height: '500px', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {optimizedRoutes.map((route) => {
              if (!route.geometry) return null;
              const vehicle = vehicles.find(v => v.id === route.vehicle_id);
              const isFull = vehicle?.capacityUsed >= 1000;
              const filteredSteps = isFull ? route.steps : route.steps.filter(s => typeof s.dustbin_id === 'string' && !s.dustbin_id.startsWith('temp_'));
              const color = routeColors[(route.vehicle_id - 1) % routeColors.length];
              return (
                <div key={route.vehicle_id}>
                  <Polyline positions={route.geometry} color={color} weight={5} opacity={0.8} />
                  {filteredSteps.map((step, i) => (
                    <Marker key={`${route.vehicle_id}-${i}`} position={[step.location[1], step.location[0]]}>
                      <Popup>
                        <div>
                          <strong>{step.name}</strong><br />
                          Vehicle: {route.vehicle_id}<br />
                          Stop: {i + 1} of {filteredSteps.length}<br />
                          <span style={{ color }}>Route Color</span>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </div>
              );
            })}
          </MapContainer>
        )}
      </div>
    </div>
  );
}