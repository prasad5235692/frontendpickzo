// src/pages/OrderSuccess.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Confetti from "react-confetti";
import { motion } from "framer-motion";
import { FaCheckCircle, FaBoxOpen, FaTruck, FaShoppingBag, FaHome } from "react-icons/fa";

const DELIVERY_STEPS = [
  { icon: FaBoxOpen, label: "Order Confirmed" },
  { icon: FaBoxOpen, label: "Processing" },
  { icon: FaTruck, label: "Shipped" },
  { icon: FaHome, label: "Delivered" },
];

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, productTitle, amount } = location.state || {};
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [confettiActive, setConfettiActive] = useState(true);

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    const t = setTimeout(() => setConfettiActive(false), 5000);
    return () => { window.removeEventListener("resize", handleResize); clearTimeout(t); };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#F1F3F6] flex items-center justify-center px-4 py-10 pt-20">
      {confettiActive && <Confetti width={windowSize.width} height={windowSize.height} numberOfPieces={180} />}

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        {/* Main card */}
        <div className="bg-white rounded shadow-md overflow-hidden">
          {/* Green header */}
          <div className="bg-green-500 px-6 py-6 text-white text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 160, delay: 0.2 }}
              className="flex justify-center mb-3"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <FaCheckCircle className="text-green-500 text-4xl" />
              </div>
            </motion.div>
            <h1 className="text-xl font-bold">Order Placed Successfully!</h1>
            <p className="text-green-100 text-sm mt-1">
              Thank you for shopping with <span className="font-bold">PickZo</span>
            </p>
          </div>

          {/* Order details */}
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Order ID</p>
                <p className="font-semibold text-gray-800 truncate">{orderId || 'PKZ-2024-XXXXX'}</p>
              </div>
              {productTitle && (
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Item(s)</p>
                  <p className="font-semibold text-gray-800 truncate">{productTitle}</p>
                </div>
              )}
              {amount && (
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Amount Paid</p>
                  <p className="font-bold text-gray-900">₹{Number(amount).toLocaleString()}</p>
                </div>
              )}
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Estimated Delivery</p>
                <p className="font-semibold text-green-600">
                  {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>
          </div>

          {/* Delivery tracker */}
          <div className="px-6 py-5 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Delivery Progress</p>
            <div className="flex items-center">
              {DELIVERY_STEPS.map((step, i) => (
                <React.Fragment key={step.label}>
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i === 0 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                      <step.icon size={13} />
                    </div>
                    <p className={`text-[10px] mt-1 text-center leading-tight ${i === 0 ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                  </div>
                  {i < DELIVERY_STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 -mt-4 ${i === 0 ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* CTA buttons */}
          <div className="px-6 py-5 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/orders")}
              className="flex-1 flex items-center justify-center gap-2 bg-[#2874F0] hover:bg-blue-700 text-white font-bold py-3 rounded text-sm transition"
            >
              <FaShoppingBag size={13} /> View My Orders
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-blue-400 text-gray-700 hover:text-blue-600 font-bold py-3 rounded text-sm transition"
            >
              Continue Shopping
            </button>
          </div>
        </div>

        {/* Assurance strip */}
        <div className="mt-4 bg-white rounded shadow-sm px-6 py-3 flex flex-wrap justify-center gap-6 text-xs text-gray-500">
          <span>✓ Secure Payment</span>
          <span>✓ Easy Returns</span>
          <span>✓ 100% Authentic</span>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
