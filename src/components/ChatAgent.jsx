import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Search, Tag, Package } from 'lucide-react';
import Message from './Message';
import ProductCard from './ProductCard';
import DealCard from './DealCard';
import TypingIndicator from './TypingIndicator';
import { processMessage } from '../services/chatService';

const ChatAgent = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Welcome to TheSughra! ✨ I'm Sophie, your shopping assistant.\n\nI can help you:\n• 🛍️ Browse our products\n• 📦 Track your orders\n• 💰 Find amazing deals\n\nWhat would you like to do today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(`session-${Date.now()}`);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await processMessage(input, { messages, sessionId });
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        timestamp: new Date(),
        ...response
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const quickActions = [
    { text: "Browse Products", icon: Search, action: "show me all products" },
    { text: "Current Deals", icon: Tag, action: "what deals do you have" },
    { text: "Track Order", icon: Package, action: "I want to track my order" },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">TheSughra</h1>
              <p className="text-sm opacity-90">Discover Amazing Products & Deals</p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg) => (
            <Message key={msg.id} message={msg} sessionId={sessionId}>
              {msg.products && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                  {msg.products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
              {msg.deals && (
                <div className="space-y-3 mt-4">
                  {msg.deals.map(deal => (
                    <DealCard key={deal.id} deal={deal} />
                  ))}
                </div>
              )}
            </Message>
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border-t px-4 py-3">
        <div className="max-w-4xl mx-auto flex gap-2 overflow-x-auto">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInput(action.action);
                setTimeout(() => handleSend(), 100);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 rounded-full text-sm whitespace-nowrap transition-colors"
            >
              <action.icon className="w-4 h-4" />
              <span>{action.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t px-4 py-4">
        <div className="max-w-4xl mx-auto flex space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder="Ask me anything... Try 'show products' or 'track order'"
            className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAgent;