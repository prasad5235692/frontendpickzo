import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../api/axios';

const BuyNowPage1 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items = [], totalAmount = 0 } = location.state || {};

  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get('/users/profile');
        if (res.data?.address) {
          setAddress(res.data.address);
        }
      } catch (error) {
        console.error("❌ Profile address fetch error:", error.message);
      }
    };
    fetchUserProfile();
  }, []);

  const handleOrder = async () => {
    setError('');

    if (!address.trim()) {
      setError('🚫 Address is required.');
      return;
    }

    if (!['COD', 'UPI', 'Card'].includes(paymentMethod)) {
      setError('⚠️ Invalid payment method selected.');
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        items: items.map(item => ({
          product: item.productId || item._id || item.product, // Product ID
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount,
        address,
        paymentMethod,
      };

      const res = await axios.post('/orders/buy', orderData);

      navigate('/order-success', {
        state: {
          orderId: res.data.orderId || res.data._id || 'N/A',
          amount: totalAmount,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Order failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return <p className="text-center text-red-500 mt-8">No items to buy.</p>;
  }

  return (
    <div className="p-6 max-w-xl mx-auto mt-12 bg-white rounded-xl shadow-xl border border-gray-200">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        🛒 Confirm Your Order
      </h2>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center font-medium shadow-sm">
          {error}
        </div>
      )}

      <div className="mb-6 space-y-4 max-h-64 overflow-auto border p-4 rounded">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-4 items-center border-b pb-3 last:border-b-0">
            <img
              src={item.image || '/placeholder.png'}
              alt={item.name}
              className="w-20 h-20 object-contain rounded border"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <p className="text-gray-600 text-sm">
                Price: ₹{item.price} × {item.quantity} = ₹{(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 text-right">
        <h3 className="text-xl font-semibold">
          Total Amount: ₹{totalAmount.toLocaleString()}
        </h3>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block font-semibold mb-1">🏠 Delivery Address</label>
          <button
            onClick={() => setIsEditingAddress(!isEditingAddress)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md"
          >
            {isEditingAddress ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {isEditingAddress ? (
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows="3"
            className="w-full p-2 border rounded"
            placeholder="Enter your address"
          />
        ) : (
          <p className="bg-gray-50 p-2 rounded border min-h-[60px]">
            {address || 'No address provided.'}
          </p>
        )}
      </div>

      <div className="mb-6">
        <label className="block font-semibold mb-2">💳 Choose Payment Method</label>
        <div className="space-y-3">
          {['COD', 'UPI', 'Card'].map((method) => (
            <label
              key={method}
              className={`flex items-center p-3 border rounded-lg cursor-pointer shadow-sm transition ${
                paymentMethod === method
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <input
                type="radio"
                name="payment"
                value={method}
                checked={paymentMethod === method}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-3"
              />
              {method === 'COD' && <span>Cash on Delivery</span>}
              {method === 'UPI' && <span>UPI (PhonePe, GPay, etc.)</span>}
              {method === 'Card' && <span>Credit / Debit Card</span>}
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={handleOrder}
        disabled={loading}
        className={`w-full bg-green-600 text-white py-2 text-lg rounded hover:bg-green-700 transition ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {loading ? 'Placing Order...' : '✅ Confirm Order'}
      </button>
    </div>
  );
};

export default BuyNowPage1;
