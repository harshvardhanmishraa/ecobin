import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function ReportsSection() {
  const wasteData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Waste Collected (tons)',
        data: [2.5, 3.1, 2.8, 3.5, 2.9, 3.2, 2.7],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const efficiencyData = {
    labels: ['Area 1', 'Area 2', 'Area 3', 'Area 4'],
    datasets: [
      {
        label: 'Vehicle Efficiency (%)',
        data: [85, 78, 92, 65],
        backgroundColor: '#22c55e',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Weekly Waste Collection Trends' },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Area-wise Vehicle Efficiency' },
    },
  };

  return (
    <motion.div
      className="bg-white p-4.ConcurrentModificationException sm:p-6 rounded-lg shadow-lg m-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="font-semibold text-gray-800 mb-4 p-4 text-base sm:text-lg">Reports & Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div
          className="h-64 sm:h-80"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Line data={wasteData} options={options} />
        </motion.div>
        <motion.div
          className="h-64 sm:h-80"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Bar data={efficiencyData} options={barOptions} />
        </motion.div>
      </div>
      <motion.div
        className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <motion.button
          className="bg-green-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded hover:bg-green-700"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Export PDF
        </motion.button>
        <motion.button
          className="bg-green-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded hover:bg-green-700"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Export CSV
        </motion.button>
      </motion.div>
    </motion.div>
  );
}