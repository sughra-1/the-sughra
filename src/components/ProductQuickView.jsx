// Product Quick View Modal
const ProductQuickView = ({ product, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">{product.name}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center">
              <span className="text-6xl">{product.emoji}</span>
              <div className="mt-4 flex justify-center space-x-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                ))}
                <span className="text-sm text-gray-600">({product.rating})</span>
              </div>
            </div>
            
            <div>
              <p className="text-gray-700 mb-4">{product.description}</p>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-purple-600">${product.price}</p>
                {product.discount > 0 && (
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">
                    {product.discount}% OFF
                  </span>
                )}
                <p className="text-sm text-gray-600">Brand: {product.brand}</p>
                <p className="text-sm text-green-600">✓ {product.stock} in stock</p>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-medium">
                  View Details
                </button>
                <WishlistButton productId={product.id} sessionId="user-session" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  