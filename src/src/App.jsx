import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, User, Menu, Star, Heart, Trash2, Plus, Minus } from 'lucide-react';

// Mock API Service - Can be replaced with real backend
const API_BASE_URL = 'http://localhost:8080/api'; // Change this to your backend URL
const USE_MOCK_DATA = true; // Set to false when backend is ready

// Mock Database
const mockProducts = [
  { id: 1, name: 'Wireless Bluetooth Headphones', price: 4999, rating: 4.5, reviews: 2341, category: 'Electronics', image: '🎧', stock: 15 },
  { id: 2, name: 'Smart Watch Fitness Tracker', price: 12499, rating: 4.3, reviews: 1823, category: 'Electronics', image: '⌚', stock: 8 },
  { id: 3, name: 'Laptop Backpack USB Charging', price: 3299, rating: 4.7, reviews: 5621, category: 'Bags', image: '🎒', stock: 25 },
  { id: 4, name: 'Portable Power Bank 20000mAh', price: 2499, rating: 4.6, reviews: 3456, category: 'Electronics', image: '🔋', stock: 30 },
  { id: 5, name: 'Wireless Gaming Mouse RGB', price: 3799, rating: 4.4, reviews: 1234, category: 'Electronics', image: '🖱️', stock: 12 },
  { id: 6, name: 'Mechanical Keyboard', price: 7499, rating: 4.8, reviews: 2876, category: 'Electronics', image: '⌨️', stock: 7 },
  { id: 7, name: 'USB-C Hub 7-in-1 Adapter', price: 2899, rating: 4.5, reviews: 987, category: 'Accessories', image: '🔌', stock: 20 },
  { id: 8, name: 'Noise Cancelling Earbuds', price: 6699, rating: 4.6, reviews: 4532, category: 'Electronics', image: '🎵', stock: 10 }
];

// API Service with fallback to mock data
class APIService {
  static async fetchProducts() {
    if (USE_MOCK_DATA) {
      return new Promise(resolve => setTimeout(() => resolve(mockProducts), 500));
    }
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) throw new Error('API Error');
      return await response.json();
    } catch (error) {
      console.log('Using mock data due to:', error.message);
      return mockProducts;
    }
  }

  static async createOrder(orderData) {
    if (USE_MOCK_DATA) {
      return new Promise(resolve => 
        setTimeout(() => resolve({ orderId: Math.random().toString(36).substr(2, 9), status: 'success' }), 1000)
      );
    }
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      return await response.json();
    } catch (error) {
      return { orderId: 'MOCK-' + Date.now(), status: 'success' };
    }
  }
}

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCart, setShowCart] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    const data = await APIService.fetchProducts();
    setProducts(data);
    setIsLoading(false);
  };

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const toggleWishlist = (product) => {
    if (wishlist.find(item => item.id === product.id)) {
      setWishlist(wishlist.filter(item => item.id !== product.id));
    } else {
      setWishlist([...wishlist, product]);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    const orderData = {
      items: cart,
      total: cartTotal,
      timestamp: new Date().toISOString()
    };
    
    const result = await APIService.createOrder(orderData);
    if (result.status === 'success') {
      setOrderPlaced(true);
      setTimeout(() => {
        setCart([]);
        setOrderPlaced(false);
        setShowCart(false);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Menu className="w-6 h-6 cursor-pointer hover:text-yellow-400" />
              <h1 className="text-2xl font-bold text-yellow-400">ShopZone</h1>
            </div>
            
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pr-10 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-500" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <User className="w-6 h-6 cursor-pointer hover:text-yellow-400" />
              <div className="relative">
                <Heart className="w-6 h-6 cursor-pointer hover:text-yellow-400" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </div>
              <div className="relative">
                <ShoppingCart 
                  className="w-6 h-6 cursor-pointer hover:text-yellow-400" 
                  onClick={() => setShowCart(!showCart)}
                />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Category Filter */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
                  selectedCategory === category
                    ? 'bg-yellow-400 text-gray-900 font-semibold'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-4">
                <div className="relative">
                  <div className="text-6xl text-center mb-4">{product.image}</div>
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="absolute top-0 right-0 p-2"
                  >
                    <Heart 
                      className={`w-5 h-5 ${
                        wishlist.find(item => item.id === product.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-400'
                      }`}
                    />
                  </button>
                </div>
                
                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({product.reviews})</span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
                  <span className="text-sm text-gray-500">{product.stock} in stock</span>
                </div>

                <button
                  onClick={() => addToCart(product)}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-2 rounded-lg transition"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowCart(false)}>
          <div 
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Shopping Cart ({cartCount})</h2>
              <button onClick={() => setShowCart(false)} className="text-2xl hover:text-yellow-400">×</button>
            </div>

            {orderPlaced && (
              <div className="bg-green-500 text-white p-4 text-center font-semibold">
                ✓ Order Placed Successfully!
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-4 border-b pb-4">
                      <div className="text-4xl">{item.image}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1">{item.name}</h3>
                        <p className="text-lg font-bold text-gray-900">₹{item.price.toLocaleString('en-IN')}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t p-4 bg-gray-50">
                <div className="flex justify-between mb-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-gray-900">₹{cartTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 rounded-lg transition"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
