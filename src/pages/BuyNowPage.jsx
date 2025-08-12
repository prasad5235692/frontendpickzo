import React, { useEffect, useState } from 'react'; 
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../api/axios';

const BuyNowPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { product } = location.state || {};

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get('/users/profile');
        if (res.data) {
          setAddress(res.data.address || '');
          setPhone(res.data.phone || '');
        }
      } catch (error) {
        console.error('❌ Profile fetch error:', error.message);
      }
    };
    fetchUserProfile();
  }, []);

  // Save updated address & phone
  const handleSaveProfile = async () => {
    try {
      const res = await axios.put('/users/profile', { address, phone });
      setAddress(res.data.address || '');
      setPhone(res.data.phone || '');
      setIsEditingAddress(false);
      setIsEditingPhone(false);
      setError('');
    } catch (error) {
      console.error('❌ Profile update error:', error.message);
      setError('Failed to update profile.');
    }
  };

  // Place order
  const handleOrder = async () => {
    setError('');

    if (!address.trim()) {
      setError('🚫 Address is required.');
      return;
    }
    if (!phone.trim() || !/^\d{10}$/.test(phone)) {
      setError('🚫 Valid 10-digit phone number is required.');
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        items: [
          {
            product: product._id,
            title: product.title || 'Unnamed Product',
            price: product.price,
            quantity: 1,
          },
        ],
        totalAmount: product.price,
        address,
        phone,
        paymentMethod,
      };

      const res = await axios.post('/orders/buy', orderData);

      navigate('/order-success', {
        state: {
          orderId: res.data?._id || 'N/A',
          productTitle: product.title,
          amount: product.price,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Order failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!product)
    return <p className="text-center text-red-500 mt-8">Invalid product</p>;

  return (
    <div className="pt-16">
    <div className="p-6 max-w-xl mx-auto mt-12 bg-white rounded-xl shadow-xl border border-gray-200">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        🛒 Confirm Your Order
      </h2>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center font-medium shadow-sm">
          {error}
        </div>
      )}

      {/* Product Details */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg flex gap-4 items-center">
        <img
          src={product.image}
          alt={product.title}
          className="w-24 h-24 object-contain rounded border"
        />
        <div>
          <h3 className="font-semibold text-lg">
            {product.title  || 'Unnamed Product'}
          </h3>
          <p className="text-gray-600 text-sm mt-1">Price: ₹{product.price}</p>
        </div>
      </div>

      {/* Phone Number */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block font-semibold mb-1">📞 Phone Number</label>
          <button
            onClick={() => setIsEditingPhone(!isEditingPhone)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md"
          >
            {isEditingPhone ? 'Cancel' : 'Edit'}
          </button>
        </div>
        {isEditingPhone ? (
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter 10-digit phone number"
          />
        ) : (
          <p className="bg-gray-50 p-2 rounded border min-h-[40px]">
            {phone || 'No phone number provided.'}
          </p>
        )}
      </div>

      {/* Address */}
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
            rows="2"
            className="w-full p-2 border rounded"
            placeholder="Enter your address"
          />
        ) : (
          <p className="bg-gray-50 p-2 rounded border min-h-[60px]">
            {address || 'No address provided.'}
          </p>
        )}
      </div>

      {/* Save Profile Changes */}
      {(isEditingAddress || isEditingPhone) && (
        <button
          onClick={handleSaveProfile}
          className="w-full bg-blue-600 text-white py-2 rounded mb-4 hover:bg-blue-700"
        >
          💾 Save Profile
        </button>
      )}

      {/* Payment Method */}
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

      {/* Confirm Order */}
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
    </div>
  );
};

export default BuyNowPage;
