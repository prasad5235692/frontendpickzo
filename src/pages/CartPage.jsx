import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const errorTimeoutRef = useRef(null);
  const navigate = useNavigate();

  const showError = (msg) => {
    setError(msg);
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    errorTimeoutRef.current = setTimeout(() => setError(''), 4000);
  };

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartItems(res.data.cartItems || []);
      } catch {
        showError('Failed to load cart items. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();

    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, [token]);

  const handleRemove = async (itemId) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await axios.delete(`/cart/remove/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems((prev) => prev.filter((item) => item._id !== itemId));
    } catch {
      showError('Failed to remove item.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuantityChange = async (itemId, newQty) => {
    if (newQty < 1 || actionLoading) return;
    setActionLoading(true);
    try {
      await axios.put(
        '/cart/update-quantity',
        { itemId, quantity: newQty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems((prev) =>
        prev.map((item) =>
          item._id === itemId ? { ...item, quantity: newQty } : item
        )
      );
    } catch {
      showError('Failed to update quantity.');
    } finally {
      setActionLoading(false);
    }
  };

  const getImageUrl = (image) => {
    if (typeof image === 'string') {
      if (image.startsWith('http')) return image;
      return `http://localhost:5000${image}`;
    }
    return '/placeholder.png';
  };

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + (item.price || 0) * item.quantity,
    0
  );

  const handleCheckoutSingleProduct = (product) => {
    navigate('/buy-now', { state: { product } });
  };

  const handleCheckoutAll = () => {
    if (cartItems.length === 0) return;
    navigate('/buy-now', { state: { cartItems } });
  };

  if (loading) {
    return <p className="text-center text-lg p-6">Loading cart...</p>;
  }

  return (
    <div className="pt-16">
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow border mt-6">
      <h2 className="text-2xl font-bold mb-4">🛒 My Cart</h2>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">{error}</div>
      )}

      {cartItems.length === 0 ? (
        <p className="text-gray-600 text-lg">Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded"
              >
                <img
                  src={getImageUrl(item.image)}
                  alt={item.title || item.name || 'Product'}
                  className="w-24 h-24 object-contain bg-gray-100 rounded"
                />
                <div className="flex-1">
                  {/* Show both title and name if available */}
                  {item.title && (
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                  )}
                  {item.name && item.name !== item.title && (
                    <p className="text-gray-600 text-sm">{item.name}</p>
                  )}
                  <p className="text-green-600 font-bold mt-1">₹{item.price}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                      disabled={item.quantity <= 1 || actionLoading}
                      className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                      disabled={actionLoading}
                      className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleCheckoutSingleProduct(item)}
                    className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    disabled={actionLoading}
                  >
                    Proceed to Checkout
                  </button>
                  <button
                    onClick={() => handleRemove(item._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                    disabled={actionLoading}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-right mt-6 flex flex-col sm:flex-row sm:justify-end sm:items-center gap-4">
            <h3 className="text-xl font-semibold">
              Total: ₹{totalPrice.toLocaleString()}
            </h3>
           
          </div>
        </>
      )}
    </div>
    </div>
  );
};

export default CartPage;
