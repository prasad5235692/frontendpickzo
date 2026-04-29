import React, { useEffect, useRef, useState } from 'react';
import axios from '../api/axios';
import { FaBoxOpen, FaRedo, FaTimes, FaTrash } from 'react-icons/fa';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-300',
  placed: 'bg-blue-100 text-blue-700 border-blue-300',
  shipped: 'bg-purple-100 text-purple-700 border-purple-300',
  delivered: 'bg-green-100 text-green-700 border-green-300',
  cancelled: 'bg-red-100 text-red-700 border-red-300',
};

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 120 120%22%3E%3Crect width=%22120%22 height=%22120%22 rx=%2224%22 fill=%22%23e8eef9%22/%3E%3Cpath d=%22M34 77l16-18 12 12 20-24 22 30H34z%22 fill=%22%2394a3b8%22/%3E%3Ccircle cx=%2246%22 cy=%2244%22 r=%228%22 fill=%22%23cbd5e1%22/%3E%3C/svg%3E';

const getImageUrl = (image) => {
  if (typeof image === 'string' && image.trim()) {
    return image.startsWith('http') ? image : `http://localhost:5000${image}`;
  }
  return PLACEHOLDER_IMAGE;
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const toastTimeoutRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3500);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/orders');
      setOrders(res.data);
      setError('');
      setSelectedOrders(new Set());
    } catch {
      setError('Could not load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const handleAction = async () => {
    if (!confirming) return;

    const { orderId, action } = confirming;
    try {
      if (action === 'cancel') {
        await axios.put(`/orders/cancel/${orderId}`);
        showToast('Order cancelled successfully.');
      } else if (action === 'reorder') {
        await axios.post(`/orders/reorder/${orderId}`);
        showToast('Reorder placed successfully.');
      } else if (action === 'delete') {
        await axios.delete('/orders/delete', { data: { orderIds: Array.from(selectedOrders) } });
        showToast('Selected order(s) deleted.');
      }
      await fetchOrders();
    } catch {
      showToast('Operation failed. Please try again.', 'error');
    } finally {
      setConfirming(null);
    }
  };

  const toggleSelectOrder = (id) =>
    setSelectedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleSelectAll = () => {
    if (selectedOrders.size === orders.length) setSelectedOrders(new Set());
    else setSelectedOrders(new Set(orders.map((order) => order._id)));
  };

  const confirmDeleteSelected = () => {
    if (selectedOrders.size === 0) {
      showToast('No orders selected.', 'error');
      return;
    }
    setConfirming({ action: 'delete', count: selectedOrders.size });
  };

  const deliveredCount = orders.filter((order) => String(order.status || '').toLowerCase() === 'delivered').length;
  const activeCount = orders.filter(
    (order) => !['delivered', 'cancelled'].includes(String(order.status || '').toLowerCase()),
  ).length;
  const totalOrderValue = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

  return (
    <div className="min-h-screen pb-12 pt-[136px] sm:pt-[144px]">
      {toast && (
        <div
          className={`fixed right-4 top-24 z-50 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_38px_rgba(15,23,42,0.24)] ${
            toast.type === 'success' ? 'bg-[#15803d]' : 'bg-[#dc2626]'
          }`}
          onClick={() => setToast(null)}
          role="alert"
        >
          {toast.message}
        </div>
      )}

      <div className="page-shell space-y-6">
        
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((value) => (
              <div key={value} className="section-card h-44 animate-pulse bg-white/80" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <section className="section-card px-6 py-16 text-center sm:px-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand-blue)]">
              <FaBoxOpen size={22} />
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold text-slate-900">No orders yet</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
              Once checkout is completed, your order history, statuses, and reorder actions will appear here.
            </p>
          </section>
        ) : (
          <>
            <section className="section-card p-4 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="heading-kicker">Controls</p>
                  <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em] text-slate-900">
                    Manage selections and follow totals
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Selected {selectedOrders.size} of {orders.length} order{orders.length > 1 ? 's' : ''} • Total value {formatCurrency(totalOrderValue)}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label className="inline-flex items-center gap-3 rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={selectedOrders.size === orders.length && orders.length > 0}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 accent-[var(--brand-blue)]"
                    />
                    Select all
                  </label>
                  <button
                    onClick={confirmDeleteSelected}
                    disabled={selectedOrders.size === 0}
                    className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition ${
                      selectedOrders.size === 0
                        ? 'cursor-not-allowed border border-slate-200 text-slate-300'
                        : 'border border-red-200 text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <FaTrash size={12} />
                    Delete selected ({selectedOrders.size})
                  </button>
                </div>
              </div>

              {confirming && (
                <div className="mt-5 flex flex-col gap-3 rounded-[26px] border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-medium text-amber-900">
                    {confirming.action === 'delete'
                      ? `Delete ${confirming.count} order(s)? This cannot be undone.`
                      : confirming.action === 'cancel'
                        ? 'Cancel this order?'
                        : 'Place a reorder for the same items?'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAction}
                      className="inline-flex items-center justify-center rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setConfirming(null)}
                      className="inline-flex items-center justify-center rounded-full border border-amber-300 px-4 py-2 text-xs font-bold text-amber-900 transition hover:bg-amber-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </section>

            <div className="space-y-4">
              {orders.map((order) => {
                const statusKey = String(order.status || 'placed').toLowerCase();
                const itemCount = order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

                return (
                  <article key={order._id} className="section-card p-4 sm:p-6">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedOrders.has(order._id)}
                        onChange={() => toggleSelectOrder(order._id)}
                        className="mt-1 h-4 w-4 accent-[var(--brand-blue)]"
                      />

                      <div className="flex-1">
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                #{order._id.slice(-8).toUpperCase()}
                              </span>
                              <span
                                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                  STATUS_COLORS[statusKey] || 'border-slate-300 bg-slate-100 text-slate-700'
                                }`}
                              >
                                {order.status}
                              </span>
                              <span className="text-sm text-slate-400">{formatDate(order.createdAt)}</span>
                            </div>

                            <div className="mt-5 space-y-3">
                              {order.items.map((item, index) => (
                                <div
                                  key={`${order._id}-${index}`}
                                  className="flex flex-col gap-3 rounded-[24px] bg-slate-50 p-4 sm:flex-row sm:items-center"
                                >
                                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white p-3 shadow-sm">
                                    <img
                                      src={getImageUrl(item.image || item.product?.image)}
                                      alt={item.title || item.product?.title || 'Product'}
                                      className="h-full w-full object-contain"
                                    />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="line-clamp-1 font-semibold text-slate-900">
                                      {item.title || item.product?.title || 'Unnamed product'}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                      Qty {item.quantity} • {formatCurrency(item.price)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="w-full rounded-[28px] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-sm xl:max-w-[280px]">
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Order summary</p>
                            <div className="mt-4 space-y-3 text-sm text-slate-600">
                              <div className="flex items-center justify-between">
                                <span>Items</span>
                                <span className="font-semibold text-slate-900">{itemCount}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Payment</span>
                                <span className="font-semibold text-slate-900">{order.paymentMethod || 'N/A'}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Total</span>
                                <span className="font-display text-xl font-semibold text-slate-900">
                                  {formatCurrency(order.totalAmount)}
                                </span>
                              </div>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-3">
                              {!['cancelled', 'delivered'].includes(statusKey) && (
                                <button
                                  onClick={() => setConfirming({ action: 'cancel', orderId: order._id })}
                                  className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
                                >
                                  <FaTimes size={10} />
                                  Cancel
                                </button>
                              )}
                              {['delivered', 'cancelled'].includes(statusKey) && (
                                <button
                                  onClick={() => setConfirming({ action: 'reorder', orderId: order._id })}
                                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--brand-blue)]/20 px-4 py-2 text-xs font-bold text-[var(--brand-blue)] transition hover:bg-[var(--brand-soft)]"
                                >
                                  <FaRedo size={10} />
                                  Reorder
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
