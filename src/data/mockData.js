export const products = [
  // Electronics
  { id: 1, name: "Premium Wireless Headphones", price: 89.99, emoji: "🎧", description: "Crystal clear sound with noise cancellation", stock: 15, category: "Electronics", brand: "AudioPro", discount: 20 },
  { id: 2, name: "Smart Fitness Watch", price: 249.99, emoji: "⌚", description: "Track your health & fitness goals", stock: 8, category: "Electronics", brand: "FitTech", discount: 0 },
  { id: 3, name: "Bluetooth Speaker", price: 79.99, emoji: "🔊", description: "360° immersive sound experience", stock: 20, category: "Electronics", brand: "SoundMax", discount: 15 },
  { id: 4, name: "Wireless Earbuds", price: 129.99, emoji: "🎵", description: "True wireless freedom", stock: 25, category: "Electronics", brand: "AudioPro", discount: 0 },
  { id: 5, name: "Smart Home Hub", price: 149.99, emoji: "🏠", description: "Control your entire home", stock: 10, category: "Electronics", brand: "HomeTech", discount: 25 },
  { id: 6, name: "4K Webcam", price: 99.99, emoji: "📹", description: "Crystal clear video calls", stock: 18, category: "Electronics", brand: "VisionPro", discount: 10 },
  
  // Accessories
  { id: 7, name: "Designer Phone Case", price: 34.99, emoji: "📱", description: "Stylish protection for your phone", stock: 50, category: "Accessories", brand: "StyleGuard", discount: 0 },
  { id: 8, name: "Fast Charging Cable", price: 19.99, emoji: "🔌", description: "Rapid charging USB-C cable", stock: 100, category: "Accessories", brand: "ChargePro", discount: 30 },
  { id: 9, name: "Phone Stand", price: 24.99, emoji: "📲", description: "Adjustable desktop phone holder", stock: 40, category: "Accessories", brand: "DeskMate", discount: 0 },
  { id: 10, name: "Screen Protector Pack", price: 14.99, emoji: "🛡️", description: "Premium tempered glass - 3 pack", stock: 75, category: "Accessories", brand: "ScreenShield", discount: 20 },
  
  // Office
  { id: 11, name: "Ergonomic Laptop Stand", price: 59.99, emoji: "💻", description: "Perfect posture for productivity", stock: 12, category: "Office", brand: "ErgoTech", discount: 15 },
  { id: 12, name: "Mechanical Keyboard", price: 139.99, emoji: "⌨️", description: "Premium typing experience", stock: 15, category: "Office", brand: "TypeMaster", discount: 0 },
  { id: 13, name: "Wireless Mouse", price: 49.99, emoji: "🖱️", description: "Precision tracking mouse", stock: 30, category: "Office", brand: "ClickPro", discount: 25 },
  { id: 14, name: "Desk Organizer", price: 29.99, emoji: "🗂️", description: "Keep your workspace tidy", stock: 22, category: "Office", brand: "DeskMate", discount: 0 },
  { id: 15, name: "USB Hub", price: 39.99, emoji: "🔗", description: "7-port USB expansion", stock: 28, category: "Office", brand: "ConnectPro", discount: 10 },
  
  // Lifestyle
  { id: 16, name: "Eco Water Bottle", price: 24.99, emoji: "💧", description: "Stay hydrated sustainably", stock: 60, category: "Lifestyle", brand: "EcoLife", discount: 0 },
  { id: 17, name: "Yoga Mat", price: 44.99, emoji: "🧘", description: "Premium non-slip yoga mat", stock: 35, category: "Lifestyle", brand: "ZenFit", discount: 20 },
  { id: 18, name: "Travel Backpack", price: 89.99, emoji: "🎒", description: "Smart organization backpack", stock: 20, category: "Lifestyle", brand: "TravelPro", discount: 30 },
  { id: 19, name: "Coffee Maker", price: 79.99, emoji: "☕", description: "Brew perfect coffee every time", stock: 15, category: "Lifestyle", brand: "BrewMaster", discount: 0 },
  { id: 20, name: "Fitness Bands Set", price: 34.99, emoji: "💪", description: "Complete resistance bands set", stock: 45, category: "Lifestyle", brand: "FitGear", discount: 25 }
];

export const deals = [
  {
    id: 1,
    title: "Flash Sale - Electronics",
    description: "Save big on all electronics this weekend!",
    discount: "Up to 30% OFF",
    code: "FLASH30",
    validUntil: "Sunday Midnight",
    products: products.filter(p => p.category === "Electronics" && p.discount > 0)
  },
  {
    id: 2,
    title: "Office Essentials Deal",
    description: "Upgrade your workspace for less",
    discount: "25% OFF Office Items",
    code: "OFFICE25",
    validUntil: "Next 48 hours",
    products: products.filter(p => p.category === "Office" && p.discount > 0)
  },
  {
    id: 3,
    title: "Bundle & Save",
    description: "Buy any 2 accessories and save!",
    discount: "Buy 2 Get 20% OFF",
    code: "BUNDLE20",
    validUntil: "This week",
    products: products.filter(p => p.category === "Accessories")
  },
  {
    id: 4,
    title: "New Customer Special",
    description: "First time shopping with us?",
    discount: "15% OFF Everything",
    code: "WELCOME15",
    validUntil: "Limited time",
    products: []
  }
];

export const orders = [
  { 
    id: "TSO-2024-001", 
    date: "2024-01-28", 
    status: "delivered", 
    items: [
      { name: "Smart Fitness Watch", quantity: 1, price: 249.99 },
      { name: "Eco Water Bottle", quantity: 2, price: 24.99 }
    ],
    total: 299.97,
    trackingNumber: "FDX-789456123",
    estimatedDelivery: "2024-01-30",
    deliveredDate: "2024-01-30"
  },
  { 
    id: "TSO-2024-002", 
    date: "2024-01-30", 
    status: "shipped", 
    items: [
      { name: "Premium Wireless Headphones", quantity: 1, price: 89.99 }
    ],
    total: 89.99,
    trackingNumber: "UPS-456789123",
    estimatedDelivery: "2024-02-03"
  },
  { 
    id: "TSO-2024-003", 
    date: "2024-02-01", 
    status: "processing", 
    items: [
      { name: "Mechanical Keyboard", quantity: 1, price: 139.99 },
      { name: "Wireless Mouse", quantity: 1, price: 49.99 }
    ],
    total: 189.98,
    estimatedDelivery: "2024-02-05"
  }
];