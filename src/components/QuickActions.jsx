import React from 'react';
import { Package, Search, Tag, HelpCircle, ArrowLeft, User } from 'lucide-react';

const QuickActions = ({ onAction }) => {
  const actions = [
    { text: "Track my order", icon: Package },
    { text: "Browse products", icon: Search },
    { text: "Current deals", icon: Tag },
    { text: "Need help", icon: HelpCircle },
    { text: "Return item", icon: ArrowLeft },
    { text: "Contact support", icon: User }
  ];

  return (
    <div className="bg-white border-t px-4 py-3">
      <div className="max-w-4xl mx-auto flex gap-2 overflow-x-auto">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => onAction(action.text)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-purple-100 rounded-full text-sm whitespace-nowrap transition-colors"
          >
            <action.icon className="w-4 h-4" />
            <span>{action.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;