'use client';

import { TruckIcon } from '@heroicons/react/24/outline';

export default function VehicleCard({ id, status, fill_percentage, current_location, color, isMobile }) {
  // Removed getStatusColor since we'll use the vehicle's color directly
  const radius = 15.9155;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - fill_percentage / 100);

  return (
    <div
      className={`p-4 bg-white rounded-lg border border-gray-100 w-full max-w-[400px] mx-auto ${
        isMobile ? 'scale-100' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-800 truncate">{id}</h3>
        <TruckIcon className="h-5 w-5" style={{ color: color || '#4b5563' }} /> {/* Using vehicle color with fallback */}
      </div>
      <div className="flex items-center justify-between">
        <div className="relative w-14 h-14">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            {/* Background circle */}
            <circle
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="4"
            />
            {/* Progress circle - using vehicle color */}
            <circle
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              stroke={color || '#16a34a'} // Using vehicle color with fallback to green
              strokeWidth="4"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 18 18)" // Start from the top
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm font-semibold text-gray-800">
            {fill_percentage}%
          </div>
        </div>
        <div className="text-right">
          {/* Using vehicle color for status text */}
          <p className="text-xs capitalize font-semibold tracking-wide" style={{ color: color || '#4b5563' }}>
            {status}
          </p>
          <p className="text-xs text-gray-600">Fill: {fill_percentage}%</p>
          <p className="text-xs text-gray-600">{current_location}</p>
        </div>
      </div>
    </div>
  );
}