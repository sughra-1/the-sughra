import React from 'react';
import { Loader2 } from 'lucide-react';

const TypingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="flex items-center space-x-2 bg-white rounded-2xl px-4 py-3 shadow-md">
        <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
        <span className="text-sm text-gray-600">Sophie is thinking...</span>
      </div>
    </div>
  );
};

export default TypingIndicator;