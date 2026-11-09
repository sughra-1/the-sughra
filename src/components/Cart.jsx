import React from 'react';
import { ShoppingBag, X, Plus, Minus } from 'lucide-react';

const Cart = ({ items, isOpen, onClose, onUpdateQuantity, onCheckout }) => {
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-xl">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <ShoppingBag className="w-5 h-5 mr-3 text-blue-600" />
            Shopping Cart ({items.length})
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium mb-2">Your cart is empty</p>
              <p className="text-sm text-gray-400">Start shopping to add items to your cart</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start space-x-4">
                    <span className="text-2xl">{item.emoji}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{item.name}</h4>
                      <p className="text-sm text-gray-600">${item.price}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="w-8 text-center font-medium text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-blue-600">${total.toFixed(2)}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;