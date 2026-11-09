import React from 'react';
import { User } from 'lucide-react';
import ProductCard from './ProductCard';
import DealCard from './DealCard';

const Message = ({ message }) => {
  const isBot = message.sender === 'bot';
  
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`flex items-start space-x-2 max-w-[85%] ${!isBot && 'flex-row-reverse space-x-reverse'}`}>
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isBot ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gray-400'
        }`}>
          {isBot ? '🤖' : <User className="w-6 h-6 text-white" />}
        </div>
        <div>
          <div className={`rounded-2xl px-4 py-3 ${
            isBot ? 'bg-white shadow-md' : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
          }`}>
            <p className="whitespace-pre-wrap text-sm">{message.text}</p>
          </div>
          
          {/* Product Grid - Fixed for MySQL data */}
          {message.products && message.products.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              {message.products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          {/* Deals List - Fixed for MySQL data */}
          {message.deals && message.deals.length > 0 && (
            <div className="space-y-3 mt-4">
              {message.deals.map(deal => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}
          
          {/* Order Details */}
          {message.order && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold mb-2">Order Details</h4>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-600">Status:</span> <span className="font-medium capitalize">{message.order.status}</span></p>
                <p><span className="text-gray-600">Total:</span> <span className="font-medium">${message.order.total}</span></p>
                {message.order.tracking_number && (
                  <p><span className="text-gray-600">Tracking:</span> <span className="font-medium">{message.order.tracking_number}</span></p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;