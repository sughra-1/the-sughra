import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/api/health', (req, res) => {
  const hasApiKey = !!process.env.VITE_CLAUDE_API;
  res.json({ 
    status: 'OK', 
    message: 'TheSughra backend is running!',
    apiKeyConfigured: hasApiKey
  });
});

// Claude API endpoint with better error handling
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    const apiKey = process.env.VITE_CLAUDE_API;
    
    if (!apiKey) {
      console.error('Claude API key not found in environment variables');
      return res.status(500).json({ 
        error: 'API key not configured',
        details: 'Please add VITE_CLAUDE_API to your .env file'
      });
    }

    console.log('Calling Claude API with message:', message);

    // Prepare messages array
    const messages = [
      ...history,
      { role: 'user', content: message }
    ];

    // Make request to Claude
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        system: "You are Sophie, a friendly shopping assistant for TheSughra store. Be helpful, conversational, and use emojis appropriately. Help customers with product browsing, order tracking (order IDs start with TSO-), returns, and general support.",
        messages: messages
      })
    });

    const responseText = await response.text();
    console.log('Claude API response status:', response.status);

    if (!response.ok) {
      console.error('Claude API error response:', responseText);
      
      // Parse error details
      let errorDetails;
      try {
        errorDetails = JSON.parse(responseText);
      } catch {
        errorDetails = { message: responseText };
      }

      // Common error messages
      if (response.status === 401) {
        return res.status(401).json({ 
          error: 'Invalid API key',
          details: 'Please check your Claude API key in the .env file'
        });
      } else if (response.status === 400) {
        return res.status(400).json({ 
          error: 'Bad request to Claude API',
          details: errorDetails.error?.message || 'Invalid request format'
        });
      } else if (response.status === 429) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded',
          details: 'Too many requests. Please try again later.'
        });
      }

      return res.status(response.status).json({ 
        error: 'Claude API error',
        details: errorDetails
      });
    }

    const data = JSON.parse(responseText);
    console.log('Claude response received successfully');
    
    res.json({ 
      text: data.content[0].text,
      usage: data.usage // Optional: track token usage
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Server error',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Mock endpoints for testing without Claude
app.post('/api/chat/mock', (req, res) => {
  const { message } = req.body;
  res.json({ 
    text: `Mock response: I understand you said "${message}". This is a test response from the backend without using Claude API.`,
    mock: true
  });
});

// Products endpoint
app.get('/api/products', (req, res) => {
  res.json([
    { id: 1, name: "Premium Wireless Headphones", price: 89.99, category: "Electronics" },
    { id: 2, name: "Smart Fitness Watch", price: 249.99, category: "Electronics" }
  ]);
});

// Orders endpoint
app.get('/api/orders/:orderId', (req, res) => {
  const { orderId } = req.params;
  res.json({
    id: orderId,
    status: 'shipped',
    items: [{ name: 'Test Product', quantity: 1, price: 99.99 }],
    total: 99.99
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 TheSughra Backend Server running on http://localhost:${PORT}`);
  console.log(`🔧 Test the API at http://localhost:${PORT}/api/health`);
  console.log(`📝 Claude API Key configured: ${!!process.env.VITE_CLAUDE_API}\n`);
});