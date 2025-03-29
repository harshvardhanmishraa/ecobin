import axios from 'axios';

const ORS_API_KEY = process.env.ORS_API_KEY;
const DEPOT = [75.7871, 26.9124];
const WASTE_TREATMENT_PLANT = [75.9330, 26.9660];
const MAX_CAPACITY = 1000;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { dustbins } = req.body;

  if (!dustbins || !Array.isArray(dustbins)) {
    return res.status(400).json({ error: 'Invalid dustbins data' });
  }

  const priorityDustbins = dustbins.filter(d => d.fill_percentage > 50);
  if (priorityDustbins.length === 0) {
    return res.status(400).json({ error: 'No dustbins to optimize' });
  }

  const jobs = priorityDustbins.map((dustbin, index) => ({
    id: index + 1,
    location: dustbin.location,
    service: 300,
  }));

  const vehicles = [
    { id: 1, start: DEPOT, end: WASTE_TREATMENT_PLANT, capacity: [MAX_CAPACITY], profile: 'driving-hgv' },
    { id: 2, start: DEPOT, end: WASTE_TREATMENT_PLANT, capacity: [MAX_CAPACITY], profile: 'driving-hgv' },
  ];

  const payload = { jobs, vehicles, options: { g: true } };

  try {
    const response = await axios.post('https://api.openrouteservice.org/optimization', payload, {
      headers: { Authorization: ORS_API_KEY, 'Content-Type': 'application/json' },
    });

    const routes = response.data.routes.map(route => ({
      vehicle_id: route.vehicle,
      steps: route.steps.map(step => ({
        location: step.location,
        dustbin_id: step.id || 'waste_plant',
        name: step.id ? priorityDustbins[step.id - 1].name : 'Waste Treatment Plant',
      })),
      geometry: route.geometry,
    }));

    const updatedVehicles = vehicles.map(v => ({
      id: v.id,
      capacityUsed: routes.find(r => r.vehicle_id === v.id)?.steps.length * 100 || 0,
    }));

    res.status(200).json({ routes, vehicles: updatedVehicles });
  } catch (error) {
    console.error('ORS Error:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.error || 'Failed to optimize routes' });
  }
}