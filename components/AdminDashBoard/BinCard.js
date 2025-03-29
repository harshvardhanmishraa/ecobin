'use client';

export default function BinCard({ location, bin, isMobile }) {
  const getRingColor = (binType) => {
    return binType === 'red' ? 'red' : binType === 'blue' ? 'blue' : 'green';
  };

  const binTypes = [
    { type: 'red', fillKey: 'redcapacity' },
    { type: 'green', fillKey: 'greencapacity' },
    { type: 'blue', fillKey: 'bluecapacity' },
  ];

  return (
    <div
      className={`p-4 bg-white rounded-lg border border-gray-100 w-full max-w-[400px] mx-auto ${
        isMobile ? 'scale-100' : ''
      }`}
    >
      <h3 className="text-base font-semibold text-gray-800 truncate mb-3">{location}</h3>
      <div className="flex justify-between">
        {bin && typeof bin === 'object' ? (
          binTypes.map(({ type, fillKey }) => {
            // Use the capacity field directly as the percentage (0-100), default to 0 if null/undefined
            const fillPercentage = bin[fillKey] !== null && bin[fillKey] !== undefined ? bin[fillKey] : 0;
            const radius = 15.9155;
            const circumference = 2 * Math.PI * radius;
            const strokeDasharray = circumference;
            const strokeDashoffset = circumference * (1 - fillPercentage / 100);

            // Debug log to verify values
            console.log(`${type} fillPercentage: ${fillPercentage}%`);

            return (
              <div key={type} className="text-center">
                <div className="relative w-14 h-14 mx-auto">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r={radius}
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="4"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r={radius}
                      fill="none"
                      stroke={getRingColor(type)}
                      strokeWidth="4"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      transform="rotate(-90 18 18)"
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm font-semibold text-gray-800">
                    {Math.round(fillPercentage)}%
                  </div>
                </div>
                <p
                  className="text-xs font-semibold tracking-wide capitalize mt-2"
                  style={{ color: getRingColor(type) }}
                >
                  {type} Fill
                </p>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-600">No bin data available</p>
        )}
      </div>
    </div>
  );
}