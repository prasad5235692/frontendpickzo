import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaMinus,
  FaPlus,
  FaShieldAlt,
  FaShoppingBag,
  FaTag,
  FaTrash,
  FaTruck,
} from 'react-icons/fa';
import axios from '../api/axios';

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 120 120%22%3E%3Crect width=%22120%22 height=%22120%22 rx=%2224%22 fill=%22%23e8eef9%22/%3E%3Cpath d=%22M34 77l16-18 12 12 20-24 22 30H34z%22 fill=%22%2394a3b8%22/%3E%3Ccircle cx=%2246%22 cy=%2244%22 r=%228%22 fill=%22%23cbd5e1%22/%3E%3C/svg%3E';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const errorTimeoutRef = useRef(null);
  const navigate = useNavigate();

  const showError = (message) => {
    setError(message);
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
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setCartItems((prev) =>
        prev.map((item) => (item._id === itemId ? { ...item, quantity: newQty } : item)),
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
    return PLACEHOLDER_IMAGE;
  };

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );
  const totalItems = cartItems.reduce((acc, item) => acc + Number(item.quantity || 0), 0);
  const estimatedSavings = Math.round(totalPrice * 0.08);

  const handleCheckoutSingleProduct = (product) => navigate('/buy-now', { state: { product } });
  const handleCheckoutAll = () => {
    if (cartItems.length === 0) return;
    navigate('/buy-now', { state: { cartItems } });
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-12 pt-[136px] sm:pt-[144px]">
        <div className="page-shell grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
          <div className="section-card h-[520px] animate-pulse bg-white/80" />
          <div className="section-card h-[380px] animate-pulse bg-white/80" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 pt-[136px] sm:pt-[144px]">
      <div className="page-shell space-y-6">
     
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {cartItems.length === 0 ? (
          <section className="section-card px-6 py-16 text-center sm:px-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand-blue)]">
              <FaShoppingBag size={22} />
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold text-slate-900">Your cart is empty</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
              Add a few products to see the richer checkout layout, clearer totals, and delivery assurances here.
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-7 inline-flex items-center justify-center rounded-full bg-[var(--brand-blue)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--brand-blue-dark)]"
            >
              Start shopping
            </button>
          </section>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
            <section className="section-card p-4 sm:p-6">
              <div className="mb-5 flex flex-col gap-3 border-b border-slate-100 pb-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="heading-kicker">Cart items</p>
                  <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em] text-slate-900">
                    Shopping bag overview
                  </h2>
                </div>
                <button
                  onClick={() => navigate('/products')}
                  className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-[var(--brand-blue)] transition hover:border-[var(--brand-blue)] hover:bg-[var(--brand-soft)]"
                >
                  Continue shopping
                </button>
              </div>

              <div className="space-y-4">
                {cartItems.map((item) => {
                  const subtotal = Number(item.price || 0) * Number(item.quantity || 0);

                  return (
                    <article
                      key={item._id}
                      className="rounded-[28px] border border-slate-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 shadow-[0_18px_36px_rgba(15,23,42,0.06)] sm:p-5"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row">
                        <div className="flex h-36 items-center justify-center overflow-hidden rounded-[24px] bg-slate-50 p-4 lg:w-40 lg:flex-shrink-0">
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.title || item.name || 'Product'}
                            className="h-full w-full object-contain"
                          />
                        </div>

                        <div className="flex flex-1 flex-col justify-between gap-5">
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 shadow-sm">
                                  In cart
                                </span>
                                <span className="rounded-full bg-[#e8fff3] px-3 py-1 text-xs font-semibold text-[#15803d]">
                                  Eligible for savings
                                </span>
                              </div>
                              <h3 className="mt-3 font-display text-xl font-semibold text-slate-900">
                                {item.title || item.name}
                              </h3>
                              <p className="mt-2 text-sm text-slate-500">
                                Checkout-ready card with faster quantity updates and a clearer subtotal block.
                              </p>
                            </div>

                            <div className="rounded-[24px] bg-white px-4 py-3 shadow-sm">
                              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Unit price</p>
                              <p className="mt-1 font-display text-xl font-semibold text-slate-900">
                                {formatCurrency(item.price)}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2">
                                <button
                                  onClick={() => handleQuantityChange(item._id, Number(item.quantity || 0) - 1)}
                                  disabled={Number(item.quantity || 0) <= 1 || actionLoading}
                                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                                >
                                  <FaMinus size={10} />
                                </button>
                                <span className="min-w-8 text-center text-sm font-bold text-slate-900">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(item._id, Number(item.quantity || 0) + 1)}
                                  disabled={actionLoading}
                                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                                >
                                  <FaPlus size={10} />
                                </button>
                              </div>

                              <div className="text-sm text-slate-500">
                                Subtotal <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                              <button
                                onClick={() => handleCheckoutSingleProduct(item)}
                                disabled={actionLoading}
                                className="inline-flex items-center justify-center rounded-full bg-[var(--brand-blue)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--brand-blue-dark)] disabled:opacity-50"
                              >
                                Buy now
                              </button>
                              <button
                                onClick={() => handleRemove(item._id)}
                                disabled={actionLoading}
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                              >
                                <FaTrash size={12} />
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <aside className="space-y-6">
              <div className="section-card sticky top-[148px] p-6">
                <p className="heading-kicker">Price details</p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-slate-900">Checkout summary</h2>

                <div className="mt-6 space-y-4 text-sm text-slate-600">
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span>Price ({totalItems} item{totalItems > 1 ? 's' : ''})</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span>Delivery</span>
                    <span className="font-semibold text-[#15803d]">Free</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                    <span>Estimated savings</span>
                    <span className="font-semibold text-[#15803d]">{formatCurrency(estimatedSavings)}</span>
                  </div>
                </div>

                <div className="mt-5 rounded-[26px] bg-[linear-gradient(135deg,#eef4ff_0%,#f8fbff_100%)] px-5 py-5">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Amount payable</p>
                  <p className="mt-2 font-display text-3xl font-semibold text-slate-900">{formatCurrency(totalPrice)}</p>
                </div>

                <button
                  onClick={handleCheckoutAll}
                  disabled={actionLoading}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[var(--brand-search)] px-6 py-3 text-sm font-extrabold text-[var(--brand-blue)] transition hover:bg-[#ffdb4d] disabled:opacity-50"
                >
                  Proceed to checkout
                </button>
              </div>

              <div className="section-card p-5">
                <p className="heading-kicker">Assurance</p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <FaShieldAlt className="text-[var(--brand-blue)]" />
                    Secure payments and protected checkout.
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <FaTruck className="text-[var(--brand-blue)]" />
                    Delivery timelines stay visible through the order flow.
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <FaTag className="text-[var(--brand-blue)]" />
                    Promotions and savings stay visible before payment.
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
