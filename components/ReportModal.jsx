import React from 'react';

const ReportModal = ({ report, onClose }) => {
  return (
    <div className="fixed  inset-0 z-50 flex justify-center items-center bg-transparent backdrop-blur-sm bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full sm:w-3/4 md:w-1/2 lg:w-1/3">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Report Details</h2>
          <button onClick={onClose} className="text-gray-600 text-xl font-semibold">×</button>
        </div>
        <div className="mt-4">
          <p><strong>Location:</strong> {report.location}</p>
          <p><strong>Waste Type:</strong> {report.waste_type}</p>
          <p><strong>Description:</strong> {report.description}</p>
          <p><strong>Status:</strong> <span className={`text-${report.status === 'Verified' ? 'green' : report.status === 'Pending' ? 'yellow' : 'blue'}-600`}>{report.status}</span></p>
          {report.image_url && (
            <div className="mt-4">
              <p><strong>Image:</strong></p>
              <img 
                src={report.image_url} 
                alt="Waste Report" 
                className="w-full h-auto mt-2 cursor-pointer" 
                onClick={() => window.open(report.image_url, '_blank')}
              />
            </div>
          )}
        </div>
        <div className="mt-4">
          <button 
            onClick={onClose}
            className="w-full bg-green-600 text-white py-2 rounded-full hover:bg-green-700 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportModal;
