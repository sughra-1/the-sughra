import React from 'react';
import { Package, CheckCircle, Truck, Clock } from 'lucide-react';

const OrderCard = ({ order }) => {
  const statusIcons = {
    processing: <Clock className="w-4 h-4 text-orange-500" />,
    shipped: <Truck className="w-4 h-4 text-blue-500" />,
    delivered: <CheckCircle className="w-4 h-4 text-green-500" />
  };

  const statusColors = {
    processing: 'bg-orange-50 text-orange-700 border-orange-200',
    shipped: 'bg-blue-50 text-blue-700 border-blue-200',
    delivered: 'bg-green-50 text-green-700 border-green-200'
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-semibold text-gray-900 text-lg">Order #{order.id}</h4>
          <p className="text-sm text-gray-600 mt-1">{order.date}</p>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${statusColors[order.status]}`}>
          {statusIcons[order.status]}
          <span className="capitalize">{order.status}</span>
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-center space-x-3 text-sm">
            <span className="text-lg">{item.emoji}</span>
            <span className="text-gray-700 flex-1">{item.name}</span>
            <span className="text-gray-500 font-medium">x{item.quantity}</span>
          </div>
        ))}
      </div>
      
      <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
        <span className="text-sm text-gray-600 font-medium">Total</span>
        <span className="font-bold text-lg text-blue-600">${order.total.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default OrderCard;