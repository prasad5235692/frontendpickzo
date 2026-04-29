import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBoxOpen,
  FaEdit,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaRupeeSign,
  FaShoppingCart,
  FaSignOutAlt,
  FaUser,
} from 'react-icons/fa';
import axios from '../api/axios';

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

const Toast = ({ message, type, onClose }) => (
  <div
    className={`fixed right-4 top-24 z-50 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_38px_rgba(15,23,42,0.24)] ${
      type === 'success' ? 'bg-[#15803d]' : 'bg-[#dc2626]'
    }`}
    role="alert"
    onClick={onClose}
  >
    {message}
  </div>
);

const getEditableValues = (profile) => ({
  name: profile?.name || '',
  email: profile?.email || '',
  phone: profile?.phone || '',
  address: profile?.address || '',
});

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editableUser, setEditableUser] = useState(getEditableValues(null));
  const [isEditing, setIsEditing] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return undefined;
    }

    const fetchData = async () => {
      try {
        const [userRes, cartRes, ordersRes] = await Promise.all([
          axios.get('/users/profile'),
          axios.get('/cart'),
          axios.get('/orders'),
        ]);

        setUser(userRes.data);
        setEditableUser(getEditableValues(userRes.data));
        setCartItems(cartRes.data.cartItems || []);
        setOrders(ordersRes.data || []);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate('/login', { replace: true });
          return;
        }

        showToast('Something went wrong. Please try again later.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const onStorageChange = (event) => {
      if (event.key === 'token' && !event.newValue) {
        navigate('/login', { replace: true });
      }
    };

    window.addEventListener('storage', onStorageChange);
    return () => window.removeEventListener('storage', onStorageChange);
  }, [navigate]);

  useEffect(() => () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEditableUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      const res = await axios.put('/users/profile', editableUser);
      setUser(res.data);
      setEditableUser(getEditableValues(res.data));
      setIsEditing(false);
      showToast('Profile updated successfully.');
    } catch {
      showToast('Failed to update profile. Please try again.', 'error');
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  const totalSpent = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const totalOrderUnits = orders.reduce(
    (sum, order) =>
      sum + order.items.reduce((itemCount, item) => itemCount + Number(item.quantity || 0), 0),
    0,
  );
  const recentOrders = orders.slice(0, 3);
  const avatarText = user?.name ? user.name.trim().slice(0, 2).toUpperCase() : 'PZ';

  const profileStats = [
    { label: 'Orders placed', value: orders.length },
    { label: 'Items in cart', value: totalItems },
    { label: 'Total spend', value: formatCurrency(totalSpent) },
  ];

  if (loading) {
    return (
      <div className="min-h-screen pb-12 pt-[136px] sm:pt-[144px]">
        <div className="page-shell grid gap-6 xl:grid-cols-[320px_1fr_1fr]">
          {[1, 2, 3].map((card) => (
            <div key={card} className="section-card h-72 animate-pulse bg-white/80" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 pt-[136px] sm:pt-[144px]">
      <div className="page-shell space-y-6">
        <div className="grid gap-6 xl:grid-cols-[320px_1.05fr_0.95fr]">
          <aside className="section-card p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2874f0_0%,#53a0ff_100%)] font-display text-3xl font-bold text-white shadow-[0_24px_50px_rgba(37,99,235,0.28)]">
                {avatarText}
              </div>
              <h2 className="mt-5 font-display text-2xl font-semibold text-slate-900">{user?.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
            </div>

            <div className="mt-6 space-y-3 rounded-[28px] bg-slate-50 p-4">
              <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-slate-600">
                <FaEnvelope className="text-[var(--brand-blue)]" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-slate-600">
                <FaPhoneAlt className="text-[var(--brand-blue)]" />
                <span>{user?.phone || 'Phone not added'}</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-slate-600">
                <FaMapMarkerAlt className="text-[var(--brand-blue)]" />
                <span className="line-clamp-2">{user?.address || 'Address not added'}</span>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--brand-blue)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--brand-blue-dark)]"
              >
                <FaEdit />
                Edit profile
              </button>
              <button
                onClick={() => navigate('/orders')}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)]"
              >
                <FaBoxOpen />
                View all orders
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
              >
                <FaSignOutAlt />
                Logout
              </button>
            </div>
          </aside>

          <section className="section-card p-6">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="heading-kicker">Profile details</p>
                <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em] text-slate-900">
                  Contact and cart overview
                </h2>
              </div>
              <button
                onClick={() => navigate('/cart')}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-[var(--brand-blue)] transition hover:border-[var(--brand-blue)] hover:bg-[var(--brand-soft)]"
              >
                <FaShoppingCart />
                Open cart
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[26px] bg-slate-50 p-5">
                <div className="flex items-center gap-3 text-slate-700">
                  <div className="rounded-2xl bg-white p-3 text-[var(--brand-blue)]">
                    <FaUser />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Primary name</p>
                    <p className="mt-1 font-display text-lg font-semibold text-slate-900">{user?.name || 'Not set'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[26px] bg-slate-50 p-5">
                <div className="flex items-center gap-3 text-slate-700">
                  <div className="rounded-2xl bg-white p-3 text-[var(--brand-blue)]">
                    <FaRupeeSign />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Total spend</p>
                    <p className="mt-1 font-display text-lg font-semibold text-slate-900">{formatCurrency(totalSpent)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[30px] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 ring-1 ring-slate-100">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Cart summary</p>
                  <h3 className="mt-2 font-display text-xl font-semibold text-slate-900">
                    {totalItems > 0 ? `${totalItems} item${totalItems > 1 ? 's' : ''} ready` : 'Your cart is currently empty'}
                  </h3>
                </div>
                <div className="rounded-2xl bg-[var(--brand-soft)] px-4 py-3 text-right">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Cart value</p>
                  <p className="mt-1 font-display text-lg font-semibold text-slate-900">{formatCurrency(totalPrice)}</p>
                </div>
              </div>

              {cartItems.length === 0 ? (
                <p className="mt-5 rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                  Add products to the cart to see a price summary and faster checkout access here.
                </p>
              ) : (
                <div className="mt-5 space-y-3">
                  {cartItems.slice(0, 4).map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{item.title || item.name}</p>
                        <p className="mt-1 text-slate-500">Qty {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-slate-900">
                        {formatCurrency(Number(item.price || 0) * Number(item.quantity || 0))}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="section-card p-6">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="heading-kicker">Recent orders</p>
                <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em] text-slate-900">
                  Order activity at a glance
                </h2>
              </div>
              <button
                onClick={() => navigate('/orders')}
                className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-[var(--brand-blue)] transition hover:border-[var(--brand-blue)] hover:bg-[var(--brand-soft)]"
              >
                Order history
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {recentOrders.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
                  Your recent orders will appear here once checkout is completed.
                </div>
              ) : (
                recentOrders.map((order) => {
                  const status = String(order.status || 'Placed');
                  const itemCount = order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

                  return (
                    <div key={order._id} className="rounded-[26px] bg-slate-50 p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                        <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-semibold text-[var(--brand-blue)]">
                          {status}
                        </span>
                      </div>

                      <div className="mt-4 space-y-3 text-sm text-slate-600">
                        {order.items.slice(0, 2).map((item, index) => (
                          <div key={`${order._id}-${index}`} className="rounded-2xl bg-white px-4 py-3">
                            <p className="font-semibold text-slate-900">{item.title || item.product?.title || 'Product'}</p>
                            <p className="mt-1 text-slate-500">
                              Qty {item.quantity} • {formatCurrency(item.price)}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                        <span>{itemCount} item{itemCount > 1 ? 's' : ''}</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(order.totalAmount)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[32px] bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.28)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="heading-kicker">Edit details</p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-slate-900">Update your account information</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditableUser(getEditableValues(user));
                }}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              >
                Close
              </button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSaveChanges();
              }}
              className="mt-6 space-y-4"
            >
              {['name', 'email', 'phone', 'address'].map((field) => (
                <label key={field} className="block">
                  <span className="mb-2 block text-sm font-semibold capitalize text-slate-700">{field}</span>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    name={field}
                    value={editableUser[field]}
                    onChange={handleInputChange}
                    required={field !== 'address'}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[var(--brand-blue)] focus:bg-white"
                  />
                </label>
              ))}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="submit"
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-[var(--brand-blue)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--brand-blue-dark)]"
                >
                  Save changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditableUser(getEditableValues(user));
                  }}
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default UserProfile;
