import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhone, FaShoppingBag, FaPen, FaCheck, FaLock, FaShieldAlt, FaTruck, FaChevronRight } from 'react-icons/fa';
import axios from '../api/axios';

const PAYMENT_OPTIONS = [
  { value: 'COD', label: 'Cash on Delivery', desc: 'Pay when your order arrives', emoji: '\uD83D\uDCB5' },
  { value: 'UPI', label: 'UPI (PhonePe, GPay, etc.)', desc: 'Instant payment via UPI apps', emoji: '\uD83D\uDCF1' },
  { value: 'Card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay', emoji: '\uD83D\uDCB3' },
];

const STEPS = ['Login', 'Delivery Address', 'Order Summary', 'Payment'];

const BuyNowPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { product, cartItems } = location.state || {};

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [activeStep] = useState(2);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get('/users/profile');
        if (res.data) {
          setAddress(res.data.address || '');
          setPhone(res.data.phone || '');
        }
      } catch {}
    };
    fetchUserProfile();
  }, []);

  const handleSaveProfile = async () => {
    try {
      const res = await axios.put('/users/profile', { address, phone });
      setAddress(res.data.address || '');
      setPhone(res.data.phone || '');
      setIsEditingAddress(false);
      setIsEditingPhone(false);
      setError('');
    } catch {
      setError('Failed to update profile.');
    }
  };

  const handleOrder = async () => {
    setError('');
    if (!address.trim()) { setError('Delivery address is required.'); return; }
    if (!phone.trim() || !/^\d{10}$/.test(phone)) { setError('Valid 10-digit phone number is required.'); return; }
    try {
      setLoading(true);
      let orderData;
      if (cartItems) {
        orderData = {
          items: cartItems.map((item) => ({
            product: item.productId || item._id,
            title: item.title || item.name,
            price: item.price,
            image: item.image || '',
            quantity: item.quantity,
          })),
          totalAmount: cartItems.reduce((a, i) => a + i.price * i.quantity, 0),
          address, phone, paymentMethod,
        };
      } else {
        orderData = {
          items: [{
            product: product.productId || product._id,
            title: product.title || product.name || 'Unnamed Product',
            price: product.price,
            image: product.image || '',
            quantity: 1,
          }],
          totalAmount: product.price, address, phone, paymentMethod,
        };
      }
      const res = await axios.post('/orders/buy', orderData);
      navigate('/order-success', {
        state: {
          orderId: res.data?._id || 'N/A',
          productTitle: cartItems ? `${cartItems.length} items` : product.title,
          amount: orderData.totalAmount,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Order failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const displayProduct = product || (cartItems && cartItems[0]);
  if (!displayProduct) return <p className="text-center text-red-500 mt-24 pt-24">Invalid order data</p>;

  const totalAmount = cartItems
    ? cartItems.reduce((a, i) => a + i.price * i.quantity, 0)
    : product.price;

  return (
    <div className="pt-[186px] sm:pt-[148px] bg-[#F1F3F6] min-h-screen">
      {/* Step bar */}
      <div className="bg-white border-b border-gray-200 sticky top-[148px] z-20">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center gap-0">
            {STEPS.map((step, i) => (
              <React.Fragment key={step}>
                <div className={`flex items-center gap-1.5 text-xs font-bold ${i <= activeStep ? 'text-blue-600' : 'text-gray-400'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i < activeStep ? 'bg-blue-600 text-white' : i === activeStep ? 'border-2 border-blue-600 text-blue-600' : 'border-2 border-gray-300 text-gray-400'}`}>
                    {i < activeStep ? <FaCheck size={8} /> : i + 1}
                  </span>
                  <span className="hidden sm:block uppercase tracking-wide">{step}</span>
                </div>
                {i < STEPS.length - 1 && <FaChevronRight size={9} className="mx-3 text-gray-300 flex-shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5">
        <h1 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FaShoppingBag className="text-blue-600" size={16} /> Confirm Your Order
        </h1>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-4">
          {/* -- LEFT: Delivery + Payment -- */}
          <div className="flex-1 space-y-3">

            {/* Phone */}
            <div className="bg-white rounded shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                  <FaPhone className="text-blue-500" size={12} /> Phone Number
                </h3>
                <button
                  onClick={() => setIsEditingPhone(!isEditingPhone)}
                  className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <FaPen size={9} /> {isEditingPhone ? 'Cancel' : 'Edit'}
                </button>
              </div>
              {isEditingPhone ? (
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  placeholder="10-digit phone number"
                />
              ) : (
                <p className="text-gray-700 text-sm">
                  {phone || <span className="text-gray-400 italic">No phone number saved</span>}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="bg-white rounded shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                  <FaMapMarkerAlt className="text-blue-500" size={12} /> Delivery Address
                </h3>
                <button
                  onClick={() => setIsEditingAddress(!isEditingAddress)}
                  className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
                >
                  <FaPen size={9} /> {isEditingAddress ? 'Cancel' : 'Edit'}
                </button>
              </div>
              {isEditingAddress ? (
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
                  placeholder="House No., Street, Area, City, State, PIN"
                />
              ) : (
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                  {address || <span className="text-gray-400 italic">No address saved</span>}
                </p>
              )}
            </div>

            {(isEditingAddress || isEditingPhone) && (
              <button
                onClick={handleSaveProfile}
                className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition"
              >
                <FaCheck size={11} /> Save Changes
              </button>
            )}

            {/* Payment */}
            <div className="bg-white rounded shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4 text-sm flex items-center gap-2">
                <FaLock className="text-green-600" size={12} /> Payment Method
              </h3>
              <div className="space-y-2">
                {PAYMENT_OPTIONS.map(({ value, label, desc, emoji }) => (
                  <label
                    key={value}
                    className={`flex items-center gap-3 p-3 border-2 rounded cursor-pointer transition text-sm ${
                      paymentMethod === value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={value}
                      checked={paymentMethod === value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="accent-blue-600"
                    />
                    <span className="text-base">{emoji}</span>
                    <div>
                      <p className="font-semibold text-gray-800 text-xs">{label}</p>
                      <p className="text-gray-400 text-[11px]">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Assurances */}
            <div className="bg-white rounded shadow-sm p-4 flex flex-wrap gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><FaShieldAlt className="text-blue-600" size={11} /> Safe &amp; Secure Payments</span>
              <span className="flex items-center gap-1.5"><FaTruck className="text-green-600" size={11} /> Free Delivery</span>
              <span className="flex items-center gap-1.5"><FaCheck className="text-orange-500" size={11} /> Easy Returns</span>
            </div>
          </div>

          {/* -- RIGHT: Order Summary -- */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded shadow-sm p-5 sticky top-[152px]">
              <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide border-b border-gray-100 pb-3">
                Price Details
              </h3>

              {cartItems ? (
                <div className="space-y-3 max-h-52 overflow-y-auto no-scrollbar mb-4">
                  {cartItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <img
                        src={item.image?.startsWith('http') ? item.image : `http://localhost:5000${item.image}`}
                        alt={item.title || item.name}
                        className="w-10 h-10 object-contain rounded bg-gray-50 border p-0.5 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 line-clamp-1">{item.title || item.name}</p>
                        <p className="text-xs text-gray-400">×{item.quantity}</p>
                      </div>
                      <p className="text-xs font-bold text-gray-800 flex-shrink-0">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex gap-3 items-center mb-4">
                  <img src={product.image} alt={product.title} className="w-14 h-14 object-contain rounded bg-gray-50 border p-1 flex-shrink-0" />
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2">{product.title}</p>
                </div>
              )}

              <div className="space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-3 mb-3">
                <div className="flex justify-between">
                  <span>Price ({cartItems ? cartItems.length : 1} item{cartItems?.length !== 1 ? 's' : ''})</span>
                  <span>₹{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>- ₹0</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="text-green-600 font-semibold">Free</span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-gray-900 text-base border-t-2 border-dashed border-gray-200 pt-3 mb-5">
                <span>Total Amount</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>

              <p className="text-xs text-green-600 font-semibold mb-4">
                You will save ₹0 on this order
              </p>

              <button
                onClick={handleOrder}
                disabled={loading}
                className="w-full bg-[#FB641B] hover:bg-orange-600 disabled:opacity-60 text-white font-extrabold py-3 rounded text-sm shadow transition"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>

              <p className="text-[10px] text-gray-400 text-center mt-3 leading-relaxed">
                Safe and Secure Payments. Easy returns. 100% Authentic products.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyNowPage;
