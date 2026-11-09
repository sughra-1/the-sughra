import React, { useState, useEffect } from 'react';
import { Heart, X, Star } from 'lucide-react';

// Wishlist Button Component
const WishlistButton = ({ productId, sessionId }) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  
  // Check if product is in wishlist on mount
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await fetch(`/api/wishlist/${sessionId}`);
        if (res.ok) {
          const items = await res.json();
          setIsInWishlist(items.some(item => item.id === productId));
        }
      } catch (e) {
        // Optionally handle error
      }
    };
    fetchWishlist();
  }, [productId, sessionId]);

  const toggleWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, sessionId })
      });
      
      if (response.ok) {
        setIsInWishlist(prev => !prev);
      }
    } catch (error) {
      // Optionally handle error
    }
  };
  
  return (
    <button
      onClick={toggleWishlist}
      className={`p-2 rounded-full ${isInWishlist ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
      aria-pressed={isInWishlist}
      title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
    </button>
  );
};

export default WishlistButton;