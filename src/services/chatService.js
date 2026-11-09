const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

export const callBackendAPI = async (message, conversationHistory, sessionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history: conversationHistory.slice(-10).map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        sessionId
      })
    });

    if (!response.ok) {
      console.error('Backend returned error:', response.status);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error calling backend:', error.message);
    return null;
  }
};

export const fetchProducts = async (category = null, onSale = false) => {
  try {
    let url = `${API_BASE_URL}/api/products`;
    const params = new URLSearchParams();
    
    if (category) params.append('category', category);
    if (onSale) params.append('sale', 'true');
    
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch products');
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const fetchDeals = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/deals`);
    if (!response.ok) throw new Error('Failed to fetch deals');
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching deals:', error);
    return [];
  }
};

export const processMessage = async (input, context) => {
  const response = await callBackendAPI(input, context.messages, context.sessionId);
  
  if (response) {
    return response;
  }
  
  // Fallback
  return {
    text: "I'm having trouble connecting to the server. Please try again.",
    type: 'error'
  };
};