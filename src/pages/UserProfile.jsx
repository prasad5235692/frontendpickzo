import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Order from './OrdersPage';

const Toast = ({ message, type, onClose }) => (
  <div
    className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-lg shadow-lg font-semibold cursor-pointer select-none
      ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
    role="alert"
    onClick={onClose}
  >
    {message}
  </div>
);

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editableUser, setEditableUser] = useState({ name: '', email: '', phone: '', address: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  // Fetch user, cart, orders
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchData = async () => {
      try {
        const userRes = await axios.get('/users/profile');
        setUser(userRes.data);
        setEditableUser({
          name: userRes.data.name || '',
          email: userRes.data.email || '',
          phone: userRes.data.phone || '',
          address: userRes.data.address || '',
        });

        const cartRes = await axios.get('/cart');
        setCartItems(cartRes.data.cartItems);

        const ordersRes = await axios.get('/orders');
        setOrders(ordersRes.data);
      } catch (err) {
        if (err.response?.status === 401) {
          showToast('Session expired. Please login again.', 'error');
          localStorage.clear();
          window.location.href = '/login'; // reload on logout
        } else {
          showToast('Something went wrong. Please try again later.', 'error');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // Auto reload page if logout occurs in other tabs (token removed)
  useEffect(() => {
    const onStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        window.location.reload();
      }
    };
    window.addEventListener('storage', onStorageChange);
    return () => window.removeEventListener('storage', onStorageChange);
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3500);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/'; // force reload home page on logout
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      const res = await axios.put('/users/profile', editableUser);
      setUser(res.data);
      showToast('Profile updated successfully!', 'success');
      setIsEditing(false);
    } catch {
      showToast('Failed to update profile. Please try again.', 'error');
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : '?');

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-50 via-white to-blue-50">
        <div className="text-lg text-blue-500 animate-pulse font-semibold">Loading profile...</div>
      </div>
    );

  return (
      <div className="pt-16">
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 via-white to-blue-50 p-6 flex flex-col items-center">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center">
          <div
            className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white text-6xl font-extrabold shadow-lg select-none"
            title={user?.name}
          >
            {getInitial(user?.name)}
          </div>
          <h1 className="mt-6 text-2xl font-bold text-black">{user?.name}</h1>
          <p className="text-gray-700 mt-1 text-sm tracking-wide">{user?.email}</p>

          <div className="mt-8 w-full space-y-4 text-gray-800 font-medium">
            <div className="flex justify-between border-b border-blue-100 pb-2">
              <span>Phone:</span>
              <span>{user?.phone || 'Not provided'}</span>
            </div>
            <div className="flex justify-between border-b border-blue-100 pb-2">
              <span>Address:</span>
              <span>{user?.address || 'Not provided'}</span>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="mt-8 w-full bg-blue-600 hover:bg-blue-700 transition rounded-full text-white py-3 font-semibold shadow-md flex items-center justify-center gap-2"
          >
            ✏️ Edit Profile
          </button>

          <button
            onClick={handleLogout}
            className="mt-4 w-full bg-red-600 hover:bg-red-700 transition rounded-full text-white py-3 font-semibold shadow-md"
          >
            🚪 Logout
          </button>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1 bg-white rounded-3xl shadow-xl p-6 flex flex-col">
          <h2 className="text-xl font-semibold text-blue-700 mb-4 text-center">🛒 Cart Summary</h2>
          {cartItems.length === 0 ? (
            <p className="text-center text-gray-400 italic">No items in your cart.</p>
          ) : (
            <ul className="space-y-3 flex-1 overflow-auto max-h-96">
              {cartItems.map((item, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center bg-blue-50 rounded-xl px-4 py-2 text-black font-medium shadow-sm"
                >
                  <span>{item.title}</span>
                  <span>
                    {item.quantity} × ₹{item.price * item.quantity}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {cartItems.length > 0 && (
            <div className="mt-4 font-bold text-blue-800 text-center">
              Total: ₹{totalPrice} ({totalItems} items)
            </div>
          )}
        </div>

        {/* Orders Section */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl p-6">
          <Order orders={orders} />
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/80 dark:bg-gray-900/70 rounded-3xl max-w-md w-full p-8 shadow-2xl relative border border-white/30 backdrop-filter backdrop-saturate-150">
            <h3 className="text-2xl font-bold mb-6 text-blue-700 text-center">Edit Profile</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveChanges();
              }}
              className="space-y-4"
            >
              {['name', 'email', 'phone', 'address'].map((field) => (
                <input
                  key={field}
                  type={field === 'email' ? 'email' : 'text'}
                  name={field}
                  value={editableUser[field]}
                  onChange={handleInputChange}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  required={field !== 'address'}
                  className="w-full px-5 py-3 rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-medium bg-white/90"
                />
              ))}

              <div className="flex justify-between gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditableUser(user);
                    setToast(null);
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 py-3 rounded-xl font-semibold transition text-black"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
    </div>
  );
};

export default UserProfile;
