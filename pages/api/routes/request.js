import axios from 'axios';

const ORS_API_KEY = process.env.ORS_API_KEY;
const DEPOT = [75.7871, 26.9124];
const WASTE_TREATMENT_PLANT = [75.9330, 26.9660];
const MAX_CAPACITY = 1000;
const LOAD_PER_DUSTBIN = 100;
const MAX_DISTANCE = 5;

function calculateDistance(loc1, loc2) {
  const [lon1, lat1] = loc1;
  const [lon2, lat2] = loc2;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calculateRouteDistance(steps) {
  let total = 0;
  for (let i = 0; i < steps.length - 1; i++) {
    total += calculateDistance(steps[i].location, steps[i + 1].location);
  }
  return total;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { dustbin, currentRoutes, vehicles } = req.body;

  let updatedRoutes = currentRoutes || [];
  let updatedVehicles = vehicles || [{ id: 1, capacityUsed: 0 }];

  if (dustbin) {
    const availableVehicles = updatedVehicles
      .filter(v => v.capacityUsed < MAX_CAPACITY)
      .sort((a, b) => (MAX_CAPACITY - b.capacityUsed) - (MAX_CAPACITY - a.capacityUsed));

    let bestRoute = null;
    let bestVehicle = null;
    let minDistance = Infinity;

    for (const vehicle of availableVehicles) {
      const routeIndex = updatedRoutes.findIndex(r => r.vehicle_id === vehicle.id);
      let route = routeIndex >= 0 ? updatedRoutes[routeIndex] : null;

      const jobs = route
        ? route.steps.filter(s => s.dustbin_id !== 'waste_plant').map((s, idx) => ({
            id: idx + 1,
            location: s.location,
            service: 300,
            name: s.name,
          }))
        : [];
      jobs.push({
        id: jobs.length + 1,
        location: dustbin.location,
        service: 300,
        name: dustbin.name,
      });

      const payload = {
        jobs,
        vehicles: [{
          id: vehicle.id,
          start: route ? route.steps[route.steps.length - 1].location : DEPOT,
          end: vehicle.capacityUsed + LOAD_PER_DUSTBIN >= MAX_CAPACITY ? WASTE_TREATMENT_PLANT : undefined,
          capacity: [MAX_CAPACITY],
          profile: 'driving-hgv',
        }],
        options: { g: true },
      };

      if (route) {
        const lastStep = route.steps[route.steps.length - 1];
        const distanceToDustbin = calculateDistance(lastStep.location, dustbin.location);
        if (distanceToDustbin > MAX_DISTANCE) continue;
      }

      try {
        const response = await axios.post('https://api.openrouteservice.org/optimization', payload, {
          headers: { Authorization: ORS_API_KEY, 'Content-Type': 'application/json' },
        });

        const orsRoute = response.data.routes[0];
        if (!orsRoute || typeof orsRoute.geometry !== 'string') {
          console.error('Invalid ORS response:', response.data);
          continue;
        }

        const newRoute = {
          vehicle_id: vehicle.id,
          steps: orsRoute.steps.map(step => ({
            location: step.location,
            dustbin_id: step.id ? String(step.id) : (vehicle.capacityUsed + LOAD_PER_DUSTBIN >= MAX_CAPACITY ? 'waste_plant' : `temp_${vehicle.id}`),
            name: step.id ? jobs.find(j => j.id === step.id)?.name || 'Unknown Dustbin' : 'Waste Treatment Plant',
          })),
          geometry: orsRoute.geometry,
        };

        const routeDistance = calculateRouteDistance(newRoute.steps);
        if (routeDistance < minDistance) {
          minDistance = routeDistance;
          bestRoute = newRoute;
          bestVehicle = vehicle;
        }
      } catch (error) {
        console.error('ORS API Error:', error.response?.data || error.message);
        continue;
      }
    }

    if (!bestRoute) {
      const newVehicleId = updatedVehicles.length + 1;
      const jobs = [{ id: 1, location: dustbin.location, service: 300, name: dustbin.name }];
      const payload = {
        jobs,
        vehicles: [{ id: newVehicleId, start: DEPOT, capacity: [MAX_CAPACITY], profile: 'driving-hgv' }],
        options: { g: true },
      };

      try {
        const response = await axios.post('https://api.openrouteservice.org/optimization', payload, {
          headers: { Authorization: ORS_API_KEY, 'Content-Type': 'application/json' },
        });

        const orsRoute = response.data.routes[0];
        if (!orsRoute || typeof orsRoute.geometry !== 'string') {
          console.error('Invalid ORS response:', response.data);
          return res.status(500).json({ error: 'Invalid geometry from ORS', routes: updatedRoutes, vehicles: updatedVehicles });
        }

        bestRoute = {
          vehicle_id: newVehicleId,
          steps: orsRoute.steps.map(step => ({
            location: step.location,
            dustbin_id: step.id ? String(step.id) : `temp_${newVehicleId}`,
            name: step.id ? jobs.find(j => j.id === step.id)?.name || 'Unknown Dustbin' : 'Waste Treatment Plant',
          })),
          geometry: orsRoute.geometry,
        };
        bestVehicle = { id: newVehicleId, capacityUsed: LOAD_PER_DUSTBIN };
        updatedVehicles.push(bestVehicle);
      } catch (error) {
        console.error('ORS API Error:', error.response?.data || error.message);
        return res.status(500).json({ error: 'Failed to fetch route from ORS', routes: updatedRoutes, vehicles: updatedVehicles });
      }
    }

    const routeIndex = updatedRoutes.findIndex(r => r.vehicle_id === bestRoute.vehicle_id);
    if (routeIndex >= 0) {
      updatedRoutes[routeIndex] = bestRoute;
    } else {
      updatedRoutes.push(bestRoute);
    }
    bestVehicle.capacityUsed = (bestVehicle.capacityUsed || 0) + LOAD_PER_DUSTBIN;
  }

  return res.status(200).json({ routes: updatedRoutes, vehicles: updatedVehicles });
}