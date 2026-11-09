import React from 'react';
import { Star, TrendingDown } from 'lucide-react';

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-lg transition-all">
      <div className="text-center">
        <span className="text-4xl">{product.emoji}</span>
        <h4 className="font-semibold text-gray-900 mt-2">{product.name}</h4>
        <p className="text-xs text-gray-600 mt-1">{product.description}</p>
        
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-2xl font-bold text-purple-600">${product.price}</span>
            {product.discount > 0 && (
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                <TrendingDown className="w-3 h-3 mr-1" />
                {product.discount}% OFF
              </span>
            )}
          </div>
          
          <div className="text-sm text-gray-500">
            Brand: {product.brand}
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-sm">
            <span className="text-green-600">✓ {product.stock} in stock</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">{product.category}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;