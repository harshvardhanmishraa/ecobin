import { motion } from 'framer-motion';
import { useState } from 'react';

export default function MapSection() {
  const [selectedBin, setSelectedBin] = useState(null);

  const bins = [
    { id: 1, x: 100, y: 100, fillLevel: 75, status: 'Full', lastEmptied: '2025-03-21' },
    { id: 2, x: 150, y: 150, fillLevel: 40, status: 'Half', lastEmptied: '2025-03-20' },
    { id: 3, x: 200, y: 200, fillLevel: 10, status: 'Empty', lastEmptied: '2025-03-19' },
  ];

  const getColor = (fillLevel) => {
    if (fillLevel >= 70) return '#ef4444';
    if (fillLevel >= 30) return '#eab308';
    return '#22c55e';
  };

  return (
    <motion.div
      className="bg-white p-4 sm:p-6 rounded-lg shadow-lg m-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="font-semibold text-gray-800 mb-4 text-base sm:text-lg">Live Map</h2>
      <div className="h-64 sm:h-96 bg-gray-100 rounded relative overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 400 300">
          <rect width="400" height="300" fill="#e5e7eb" />
          {bins.map((bin) => (
            <motion.g key={bin.id}>
              <motion.circle
                cx={bin.x}
                cy={bin.y}
                r="8"
                fill={getColor(bin.fillLevel)}
                whileHover={{ scale: 1.5 }}
                onClick={() => setSelectedBin(bin)}
              />
              {selectedBin?.id === bin.id && (
                <motion.g
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <rect
                    x={bin.x - 60}
                    y={bin.y - 50}
                    width="120"
                    height="60"
                    fill="white"
                    stroke="#d1d5db"
                    rx="5"
                  />
                  <text x={bin.x - 50} y={bin.y - 30} className="text-xs sm:text-sm">
                    Fill: {bin.fillLevel}%
                  </text>
                  <text x={bin.x - 50} y={bin.y - 15} className="text-xs sm:text-sm">
                    Status: {bin.status}
                  </text>
                  <text x={bin.x - 50} y={bin.y} className="text-xs sm:text-sm">
                    Last Emptied: {bin.lastEmptied}
                  </text>
                </motion.g>
              )}
            </motion.g>
          ))}
          <path d="M100 100 L150 150 L200 200" stroke="#3b82f6" strokeWidth="2" fill="none" />
          <text x="10" y="20" className="text-xs sm:text-sm">Click markers for details</text>
        </svg>
      </div>
    </motion.div>
  );
}