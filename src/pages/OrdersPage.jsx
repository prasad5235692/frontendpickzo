import React, { useEffect, useState, useRef } from 'react'; 
import axios from '../api/axios';
import "./OrderPage.css";

const Toast = ({ message, type, onClose }) => (
  <div
    className={`fixed top-6 right-6 z-50 px-6 py-3 rounded shadow-lg text-white font-semibold select-none cursor-pointer
      ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
    role="alert"
    onClick={onClose}
  >
    {message}
  </div>
);

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null); // {message, type}
  const toastTimeoutRef = useRef(null);

  const [confirming, setConfirming] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState(new Set());

const getImageUrl = (image) => {
  if (typeof image === 'string' && image.trim()) {
    if (image.startsWith('http') || image.startsWith('https')) return image;
    return `http://localhost:5000${image}`;
  }
  return '/placeholder.png'; // make sure this file exists in public folder
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
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 3500);
  };

  const handleAction = async () => {
    if (!confirming) return;

    if (confirming.action === 'cancel' || confirming.action === 'reorder') {
      const { orderId, action } = confirming;
      try {
        if (action === 'cancel') {
          await axios.put(`/orders/cancel/${orderId}`);
          showToast('Order cancelled successfully!', 'success');
        } else if (action === 'reorder') {
          await axios.post(`/orders/reorder/${orderId}`);
          showToast('Reorder placed successfully!', 'success');
        }
        await fetchOrders();
      } catch {
        showToast('Operation failed. Please try again.', 'error');
      } finally {
        setConfirming(null);
      }
    } else if (confirming.action === 'delete') {
      try {
        await axios.delete('/orders/delete', {
          data: { orderIds: Array.from(selectedOrders) },
        });
        showToast('Selected order(s) deleted successfully!', 'success');
        await fetchOrders();
      } catch (error) {
        console.error('Delete error:', error.response?.data || error.message);
        showToast('Failed to delete selected order(s). Please try again.', 'error');
      } finally {
        setConfirming(null);
      }
    }
  };

  const confirmDeleteSelected = () => {
    if (selectedOrders.size === 0) {
      showToast('No orders selected to delete.', 'error');
      return;
    }
    setConfirming({ action: 'delete', count: selectedOrders.size });
  };

  const toggleSelectOrder = (orderId) => {
    setSelectedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) newSet.delete(orderId);
      else newSet.add(orderId);
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === orders.length) setSelectedOrders(new Set());
    else setSelectedOrders(new Set(orders.map(o => o._id)));
  };

  const formatDate = (d) => new Date(d).toLocaleDateString();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-900">📦 My Orders</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-200 text-red-800 rounded shadow">{error}</div>
      )}

      {loading ? (
        <p className="text-center text-gray-700 animate-pulse">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-600 italic mt-20">You have no orders yet.</p>
      ) : (
        <>
          {/* Controls */}
          <div className="flex justify-between mb-4 items-center">
            <label className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedOrders.size === orders.length && orders.length > 0}
                onChange={toggleSelectAll}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span>Select All</span>
            </label>

            <button
              onClick={confirmDeleteSelected}
              disabled={selectedOrders.size === 0}
              className={`px-4 py-2 rounded font-semibold text-white ${
                selectedOrders.size === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              Delete Selected
            </button>
          </div>

          {/* Confirmation UI for delete selected */}
          {confirming && confirming.action === 'delete' && (
            <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded shadow-md">
              <p className="mb-3 font-semibold">
                Delete {confirming.count} selected order{confirming.count > 1 ? 's' : ''}? This cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={handleAction}
                  className="px-4 py-2 rounded font-semibold bg-red-600 text-white hover:bg-red-700"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setConfirming(null)}
                  className="px-4 py-2 rounded font-semibold bg-gray-300 hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-8">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-6 flex flex-col md:flex-row md:space-x-6">
                {/* Checkbox */}
                <div className="mb-4 md:mb-0 md:flex md:items-start">
                  <input
                    type="checkbox"
                    checked={selectedOrders.has(order._id)}
                    onChange={() => toggleSelectOrder(order._id)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                </div>

                {/* Left: Order summary and items */}
                <div className="flex-1 border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0 pr-0 md:pr-6">
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                    Order Summary
                  </h2>
                  <p className="mb-4 text-sm text-gray-600">
                    <strong>Placed On:</strong> {formatDate(order.createdAt)} &nbsp;|&nbsp; <strong>Total:</strong> ₹{order.totalAmount.toLocaleString()}
                  </p>
                  <div className="space-y-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        {/* Product Image */}
                       

                        {/* Title and Name */}
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-800 text-lg">
                            {item.title || item.product?.title || item.product?.name || 'No Title'}
                          </span>
                          {(item.product?.name && item.product.name !== (item.title || item.product?.title)) && (
                            <span className="text-gray-600 text-sm">{item.product.name}</span>
                          )}
                          <span className="text-gray-700 font-medium mt-1">Quantity: {item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Order details and actions */}
                <div className="flex flex-col justify-between mt-6 md:mt-0 md:w-1/3">
                  <div>
                    <p className="mb-2 text-gray-700 text-sm">
                      <strong>Status:</strong>{' '}
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'Cancelled'
                            ? 'bg-red-300 text-red-800'
                            : order.status === 'Placed'
                            ? 'bg-blue-300 text-blue-800'
                            : 'bg-green-300 text-green-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </p>
                    <p className="mb-2 text-gray-700 text-sm truncate max-w-full">
                      <strong>Address:</strong> {order.address}
                    </p>
                    <p className="mb-2 text-gray-700 text-sm">
                      <strong>Payment:</strong> {order.paymentMethod}
                    </p>
                  </div>

                  {confirming && confirming.orderId === order._id ? (
                    <div className="bg-gray-100 p-4 rounded-md shadow-inner">
                      <p className="mb-3 font-semibold">
                        Confirm {confirming.action === 'cancel' ? 'Cancel Order' : 'Reorder'}?
                      </p>
                      <div className="flex gap-4">
                        <button
                          onClick={handleAction}
                          className={`flex-1 py-2 rounded-md font-semibold text-white transition ${
                            confirming.action === 'cancel'
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirming(null)}
                          className="flex-1 py-2 rounded-md font-semibold bg-gray-300 hover:bg-gray-400"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3 flex-wrap">
                      {order.status === 'Placed' && (
                        <button
                          onClick={() => setConfirming({ orderId: order._id, action: 'cancel' })}
                          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-md font-semibold transition"
                        >
                          Cancel Order
                        </button>
                      )}
                      {order.status === 'Cancelled' && (
                        <button
                          onClick={() => setConfirming({ orderId: order._id, action: 'reorder' })}
                          className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-md font-semibold transition"
                        >
                          Reorder
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Toast message */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Scrollbar styles */}
      <style>{`
        /* Thin scrollbar */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default OrdersPage;
