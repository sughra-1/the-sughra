import React from 'react';
import { Tag, Clock } from 'lucide-react';

const DealCard = ({ deal }) => {
  // Format the date if it's from MySQL
  const formatDate = (dateString) => {
    if (!dateString) return 'Limited time';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(date - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Expires tomorrow';
    if (diffDays <= 7) return `${diffDays} days left`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-purple-800 flex items-center">
            <Tag className="w-4 h-4 mr-2" />
            {deal.title}
          </h4>
          <p className="text-sm text-gray-700 mt-1">{deal.description}</p>
          <div className="mt-3 space-y-1">
            <p className="text-2xl font-bold text-purple-600">{deal.discount}</p>
            {deal.code && (
              <p className="text-sm">
                Use code: <code className="bg-white px-2 py-1 rounded font-mono text-purple-700 border border-purple-300">{deal.code}</code>
              </p>
            )}
          </div>
        </div>
        <div className="text-right ml-4">
          <Clock className="w-4 h-4 text-gray-500 mb-1 ml-auto" />
          <p className="text-xs text-gray-600">Valid until</p>
          <p className="text-sm font-medium text-purple-700">
            {formatDate(deal.valid_until)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DealCard;