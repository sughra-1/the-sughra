import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';
import { URL } from 'url';


// ES6 module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// CORS and JSON middleware MUST come first
app.use(cors());
app.use(express.json());

// MySQL Connection Pool
// const pool = mysql.createPool({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || '',
//   database: process.env.DB_NAME || 'thesughra',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });



// Parse DATABASE_URL or use individual environment variables
let dbConfig;

if (process.env.DATABASE_URL) {
  // Parse Railway's MySQL URL format: mysql://user:password@host:port/database
  const dbUrl = new URL(process.env.DATABASE_URL);
  dbConfig = {
    host: dbUrl.hostname,
    port: parseInt(dbUrl.port) || 3306,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.slice(1), // Remove leading slash
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 10000,
    timeout: 10000,
    reconnect: true
  };
} else {
  // Fallback to individual environment variables (for local development)
  dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'thesughra',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 10000,
    timeout: 10000,
    reconnect: true
  };
}

console.log('🔍 Database configuration:');
console.log('Host:', dbConfig.host);
console.log('Port:', dbConfig.port);
console.log('Database:', dbConfig.database);
console.log('User:', dbConfig.user);

// Create MySQL Connection Pool
const pool = mysql.createPool(dbConfig);

// Test database connection on startup
async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    const [rows] = await pool.execute('SELECT 1 as test');
    console.log('✅ Database connected successfully');
    
    // Test if products table exists
    try {
      const [tables] = await pool.execute("SHOW TABLES LIKE 'products'");
      if (tables.length > 0) {
        console.log('✅ Products table found');
        
        // Check how many products exist
        const [count] = await pool.execute('SELECT COUNT(*) as count FROM products');
        console.log(`📊 Found ${count[0].count} products in database`);
      } else {
        console.log('❌ Products table not found - you need to import your data');
        console.log('💡 Available tables:');
        const [allTables] = await pool.execute('SHOW TABLES');
        console.log(allTables);
      }
    } catch (tableError) {
      console.log('❌ Error checking tables:', tableError.message);
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Database config:', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user
    });
  }
}

// Call this function when server starts
testDatabaseConnection();

// OpenAI Configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Store conversation state
const conversationState = new Map();

// Function to search products with natural language
async function searchProducts(query) {
  try {
    console.log('=== SEARCH PRODUCTS ===');
    console.log('Query:', query);
    
    let sqlQuery = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    const lowerQuery = query.toLowerCase();
    
    // Check if asking for furniture specifically
    if (lowerQuery.includes('furniture')) {
      // We don't have furniture, return empty
      console.log('User asked for furniture - we don\'t have any');
      return [];
    }
    
    // Check for "all products" request
    if (lowerQuery.includes('all') || lowerQuery === 'products' || lowerQuery === 'everything') {
      sqlQuery = 'SELECT * FROM products ORDER BY featured DESC, views DESC LIMIT 50';
      const [products] = await pool.execute(sqlQuery);
      return products;
    }
    
    // Category detection - improved
    const categoryMap = {
      'electronic': 'Electronics',
      'tech': 'Electronics',
      'gadget': 'Electronics',
      'audio': 'Electronics',
      'smart': 'Electronics',
      'accessor': 'Accessories',
      'cable': 'Accessories',
      'case': 'Accessories',
      'office': 'Office',
      'desk': 'Office',
      'work': 'Office',
      'chair': 'Chair',
      'home': 'Home & Living',
      'living': 'Home & Living',
      'kitchen': 'Home & Living',
      'bedroom': 'Home & Living',
      'lifestyle': 'Lifestyle',
      'fitness': 'Lifestyle',
      'exercise': 'Lifestyle',
      'workout': 'Lifestyle',
      'yoga': 'Lifestyle',
      'fashion': 'Fashion & Beauty',
      'beauty': 'Fashion & Beauty',
      'makeup': 'Fashion & Beauty'
    };
    
    let categoryFound = false;
    for (const [keyword, category] of Object.entries(categoryMap)) {
      if (lowerQuery.includes(keyword)) {
        sqlQuery += ' AND category = ?';
        params.push(category);
        categoryFound = true;
        break;
      }
    }
    
    // Price range detection
    const priceMatch = lowerQuery.match(/under \$?(\d+)|below \$?(\d+)|less than \$?(\d+)|cheaper than \$?(\d+)/i);
    if (priceMatch) {
      const price = priceMatch[1] || priceMatch[2] || priceMatch[3] || priceMatch[4];
      sqlQuery += ' AND price < ?';
      params.push(parseFloat(price));
    }
    
    // Discount detection
    if (lowerQuery.includes('sale') || lowerQuery.includes('discount') || lowerQuery.includes('deal') || lowerQuery.includes('offer')) {
      sqlQuery += ' AND discount > 0';
    }
    
    // Dynamic product search using the query string (split into words for better matching)
    if (!categoryFound && lowerQuery.trim().length > 0) {
      const words = lowerQuery.split(' ').filter(Boolean);
      for (const word of words) {
        sqlQuery += `
          AND (
            LOWER(name) LIKE ?
            OR LOWER(tags) LIKE ?
            OR LOWER(category) LIKE ?
            OR LOWER(brand) LIKE ?
            OR LOWER(description) LIKE ?
          )`;
        params.push(`%${word}%`, `%${word}%`, `%${word}%`, `%${word}%`, `%${word}%`);
      }
    }
    
    // Featured products
    if (lowerQuery.includes('featured') || lowerQuery.includes('popular') || lowerQuery.includes('best')) {
      sqlQuery += ' AND featured = TRUE';
    }
    
    // Order by relevance
    sqlQuery += ' ORDER BY featured DESC, discount DESC, views DESC LIMIT 30';
    
    console.log('SQL:', sqlQuery);
    console.log('Params:', params);
    
    const [products] = await pool.execute(sqlQuery, params);
    console.log(`Found ${products.length} products`);
    
    // Update view count for analytics
    if (products.length > 0) {
      const productIds = products.map(p => p.id);
      await pool.execute(
        `UPDATE products SET views = views + 1 WHERE id IN (${productIds.map(() => '?').join(',')})`,
        productIds
      );
    }
    
    return products;
  } catch (error) {
    console.error('Product search error:', error);
    return [];
  }
}

// Add a test route for debugging
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is working!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Add this route for testing
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// New endpoint: Get product details with reviews
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get product
    const [products] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );
    
    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Get reviews
    const [reviews] = await pool.execute(
      'SELECT * FROM product_reviews WHERE product_id = ? ORDER BY created_at DESC',
      [id]
    );
    
    const product = {
      ...products[0],
      reviews: reviews
    };
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product details' });
  }
});

// New endpoint: Add to wishlist
app.post('/api/wishlist', async (req, res) => {
  try {
    const { productId, sessionId } = req.body;
    
    await pool.execute(
      'INSERT INTO wishlists (user_session, product_id) VALUES (?, ?)',
      [sessionId, productId]
    );
    
    res.json({ success: true, message: 'Added to wishlist!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// New endpoint: Get wishlist
app.get('/api/wishlist/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const [items] = await pool.execute(
      `SELECT p.* FROM wishlists w 
       JOIN products p ON w.product_id = p.id 
       WHERE w.user_session = ? 
       ORDER BY w.added_at DESC`,
      [sessionId]
    );
    
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// New endpoint: Get personalized recommendations
app.get('/api/recommendations/:sessionId', async (req, res) => {
  try {
    // Get user's wishlist and order history for personalization
    const [wishlistItems] = await pool.execute(
      `SELECT p.category, p.tags FROM wishlists w 
       JOIN products p ON w.product_id = p.id 
       WHERE w.user_session = ? 
       LIMIT 10`,
      [req.params.sessionId]
    );
    
    // Get popular products from similar categories
    let recommendations = [];
    if (wishlistItems.length > 0) {
      const categories = [...new Set(wishlistItems.map(item => item.category))];
      const [products] = await pool.execute(
        `SELECT * FROM products 
         WHERE category IN (${categories.map(() => '?').join(',')})
         AND featured = TRUE
         ORDER BY views DESC, rating DESC
         LIMIT 6`,
        categories
      );
      recommendations = products;
    } else {
      // Get general popular products
      const [products] = await pool.execute(
        'SELECT * FROM products WHERE featured = TRUE ORDER BY views DESC LIMIT 6'
      );
      recommendations = products;
    }
    
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// New endpoint: Search suggestions (autocomplete)
app.get('/api/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json([]);
    }
    
    const [suggestions] = await pool.execute(
      `SELECT DISTINCT name, category FROM products 
       WHERE name LIKE ? OR tags LIKE ?
       LIMIT 10`,
      [`%${q}%`, `%${q}%`]
    );
    
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// Function to get current deals
async function getCurrentDeals() {
  try {
    const [deals] = await pool.execute(
      'SELECT * FROM deals WHERE active = 1 AND valid_until > NOW() ORDER BY discount DESC'
    );
    return deals;
  } catch (error) {
    console.error('Deals fetch error:', error);
    return [];
  }
}

// Function to track order
async function trackOrder(orderId) {
  try {
    const [orders] = await pool.execute(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    
    if (orders.length > 0) {
      const [items] = await pool.execute(
        'SELECT * FROM order_items WHERE order_id = ?',
        [orderId]
      );
      return { ...orders[0], items };
    }
    return null;
  } catch (error) {
    console.error('Order tracking error:', error);
    return null;
  }
}

// Function to get product recommendations
async function getRecommendations(preferences) {
  try {
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    
    // If user mentions budget
    if (preferences.budget) {
      query += ' AND price <= ?';
      params.push(preferences.budget);
    }
    
    // Get products ordered by discount and stock (removed rating)
    query += ' AND stock > 0 ORDER BY discount DESC, stock DESC LIMIT 5';
    
    const [products] = await pool.execute(query, params);
    return products;
  } catch (error) {
    console.error('Recommendation error:', error);
    return [];
  }
}

// Enhanced chat endpoint with better AI instructions
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default', history = [] } = req.body;
    console.log('Received message:', message);
    
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ 
        error: 'Invalid message',
        text: 'Please provide a valid message.' 
      });
    }
    
    const state = conversationState.get(sessionId) || {};
    
    // Use OpenAI with function calling
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log('Processing with OpenAI...');
        
        // Define available functions for OpenAI
        const functions = [
          {
            name: "search_products",
            description: "Search for products based on user requirements like category, price, features, or general descriptions",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "The search query describing what products to look for"
                }
              },
              required: ["query"]
            }
          },
          {
            name: "show_deals",
            description: "Show current deals, discounts, and special offers",
            parameters: {
              type: "object",
              properties: {}
            }
          },
          {
            name: "track_order",
            description: "Track the status of an order using order ID",
            parameters: {
              type: "object",
              properties: {
                orderId: {
                  type: "string",
                  description: "The order ID to track (format: TSO-XXXX-XXX)"
                }
              },
              required: ["orderId"]
            }
          },
          {
            name: "get_recommendations",
            description: "Get personalized product recommendations based on preferences",
            parameters: {
              type: "object",
              properties: {
                budget: {
                  type: "number",
                  description: "Maximum budget for recommendations"
                },
                category: {
                  type: "string",
                  description: "Preferred product category"
                }
              }
            }
          }
        ];
        
        // Build conversation with IMPROVED system prompt
        const messages = [
          {
            role: "system",
            content: `You are Sophie, a smart and friendly shopping assistant for TheSughra online store. 
            
            IMPORTANT INSTRUCTIONS:
            1. When you call search_products and find products, the system will automatically display them as beautiful product cards
            2. DO NOT list product names in your text response - the cards will show all details
            3. DO NOT create numbered lists of products
            4. DO NOT mention specific product names unless discussing a single specific product
            5. Instead, give a brief, friendly message about what you found
            
            GOOD RESPONSES when products are found:
            - "I found some great options for you! Here are products under $50 that would make perfect gifts! 🎁"
            - "Great news! I have several fitness products that match what you're looking for! 💪"
            - "Here are our electronics on sale! Check out these amazing deals! 🔥"
            
            BAD RESPONSES to avoid:
            - "I found: 1. Product A 2. Product B..." (Don't list products)
            - "Here are the products: [list]" (Don't enumerate)
            
            When NO products are found, then you can suggest alternatives or ask for clarification.
            
            Use the functions when users ask about products, orders, deals, or recommendations.
            Be warm, helpful, and conversational. Use emojis appropriately.`
          }
        ];
        
        // Add conversation history
        if (history && Array.isArray(history)) {
          history.slice(-5).forEach(msg => {
            if (msg && msg.text) {
              messages.push({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
              });
            }
          });
        }
        
        // Check if we're waiting for order number
        if (state.expectingOrderNumber && message.match(/TSO-\d{4}-\d{3}/i)) {
          const orderMatch = message.match(/TSO-\d{4}-\d{3}/i);
          messages.push({ 
            role: "user", 
            content: `Track order ${orderMatch[0]}` 
          });
        } else {
          messages.push({ role: "user", content: message });
        }
        
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: messages,
          functions: functions,
          function_call: "auto",
          temperature: 0.7,
          max_tokens: 150  // Reduced to encourage shorter responses
        });
        
        const responseMessage = completion.choices[0].message;
        
        // Check if OpenAI wants to call a function
        if (responseMessage.function_call) {
          const functionName = responseMessage.function_call.name;
          const functionArgs = JSON.parse(responseMessage.function_call.arguments);
          
          console.log(`AI calling function: ${functionName}`, functionArgs);
          
          let functionResult = null;
          let additionalData = {};
          
          // Execute the requested function
          switch (functionName) {
            case 'search_products':
              const products = await searchProducts(functionArgs.query);
              if (products.length > 0) {
                functionResult = `Found ${products.length} products matching the search criteria. The products are now displayed as cards.`;
                additionalData.products = products;
                additionalData.type = 'products';
              } else {
                functionResult = `No products found matching "${functionArgs.query}"`;
                additionalData.type = 'no_products';
              }
              break;
              
            case 'show_deals':
              const deals = await getCurrentDeals();
              if (deals.length > 0) {
                functionResult = `Found ${deals.length} active deals. They are displayed below.`;
                additionalData.deals = deals;
                additionalData.type = 'deals';
              } else {
                functionResult = "No active deals at the moment";
                additionalData.type = 'no_deals';
              }
              break;
              
            case 'track_order':
              const order = await trackOrder(functionArgs.orderId);
              if (order) {
                functionResult = `Order ${functionArgs.orderId} found: Status is ${order.status}`;
                additionalData.order = order;
                additionalData.type = 'order_tracking';
              } else {
                functionResult = `Order ${functionArgs.orderId} not found`;
                additionalData.type = 'order_not_found';
              }
              conversationState.set(sessionId, { ...state, expectingOrderNumber: false });
              break;
              
            case 'get_recommendations':
              const recommendations = await getRecommendations(functionArgs);
              if (recommendations.length > 0) {
                functionResult = `Found ${recommendations.length} recommended products based on your preferences.`;
                additionalData.products = recommendations;
                additionalData.type = 'recommendations';
              } else {
                functionResult = "No recommendations available";
                additionalData.type = 'no_recommendations';
              }
              break;
          }
          
          // Get final response from OpenAI with function result
          const finalMessages = [...messages, responseMessage, {
            role: "function",
            name: functionName,
            content: functionResult
          }];
          
          const finalCompletion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: finalMessages,
            temperature: 0.7,
            max_tokens: 150
          });
          
          return res.json({
            text: finalCompletion.choices[0].message.content,
            ...additionalData
          });
        } else {
          // Regular response without function call
          if (responseMessage.content.toLowerCase().includes('order number') && 
              responseMessage.content.toLowerCase().includes('provide')) {
            conversationState.set(sessionId, { ...state, expectingOrderNumber: true });
          }
          
          return res.json({
            text: responseMessage.content,
            type: 'ai_response'
          });
        }
        
      } catch (openaiError) {
        console.error('OpenAI error:', openaiError);
        return res.json({
          text: "I'm having trouble processing that request. You can try:\n• 'Show me electronics'\n• 'Track order TSO-2024-001'\n• 'What deals do you have?'\n\nHow can I help you?",
          type: 'error'
        });
      }
    } else {
      // No OpenAI key - use basic responses
      return res.json({
        text: "I'm a basic shopping assistant. Please configure OpenAI API key for smart responses.\n\nYou can still:\n• Browse products\n• Track orders\n• Check deals",
        type: 'no_ai'
      });
    }
    
  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
});

// Add analytics endpoint
app.post('/api/analytics', async (req, res) => {
  try {
    const { event, data } = req.body;
    console.log('Analytics:', event, data);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Analytics error' });
  }
});

// Get popular products
app.get('/api/products/popular', async (req, res) => {
  try {
    const [products] = await pool.execute(
      'SELECT * FROM products WHERE stock > 0 ORDER BY discount DESC, stock DESC LIMIT 6'
    );
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch popular products' });
  }
});

// Serve static files from the React app build directory (for production)
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, 'dist')));
  
//   // Catch all handler: send back React's index.html file for any non-API routes
//   app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'dist/index.html'));
//   });
// }

const PORT = process.env.PORT || 3001;
// Serve static files from the React app build directory (for production)
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, 'dist')));
  
//   // Catch all handler: send back React's index.html file for any non-API routes
//   app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'dist/index.html'));
//   });
// }

// Add this AFTER all your API routes but BEFORE the catch-all route

// Serve static files from the React app build directory (for production)
if (process.env.NODE_ENV === 'production') {
  // Serve static assets with proper MIME types
  app.use('/assets', express.static(path.join(__dirname, 'dist/assets'), {
    setHeaders: (res, path) => {
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
    }
  }));
  
  // Serve other static files
  app.use(express.static(path.join(__dirname, 'dist'), {
    index: false, // Don't serve index.html for directory requests
    setHeaders: (res, path) => {
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
    }
  }));
  
  // Catch all handler: send back React's index.html file ONLY for non-asset routes
  app.get('*', (req, res, next) => {
    // Don't serve index.html for API routes or asset files
    if (req.url.startsWith('/api/') || 
        req.url.startsWith('/assets/') ||
        req.url.endsWith('.js') || 
        req.url.endsWith('.css') ||
        req.url.endsWith('.ico') ||
        req.url.endsWith('.png') ||
        req.url.endsWith('.jpg') ||
        req.url.endsWith('.svg')) {
      return next();
    }
    
    res.sendFile(path.join(__dirname, 'dist/index.html'));
  });
}



app.listen(PORT, () => {
  console.log(`\n✅ TheSughra Smart Shopping Assistant`);
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🤖 AI: ${process.env.OPENAI_API_KEY ? 'OpenAI with Function Calling' : 'No API Key'}`);
  console.log(`🗄️ Database: MySQL Connected`);
  console.log(`\n💡 The AI now understands natural language like:`);
  console.log(`   - "I need something for my home office"`);
  console.log(`   - "Show me your cheapest electronics"`);
  console.log(`   - "What's good for working out?"`);
  console.log(`   - "I want to buy headphones under $100"`);
  console.log('\n');
});