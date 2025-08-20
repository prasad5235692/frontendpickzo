// src/pages/OrderSuccess.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-blue-100 to-purple-200 overflow-hidden">
      {/* 🎉 Confetti */}
      <Confetti width={windowSize.width} height={windowSize.height} />

      {/* 🔥 Animated background circles */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.7, 0.3] }}
        transition={{ repeat: Infinity, duration: 4 }}
        className="absolute w-64 h-64 rounded-full bg-pink-400 opacity-40 blur-3xl top-20 left-20"
      />
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0.7, 0.3] }}
        transition={{ repeat: Infinity, duration: 5 }}
        className="absolute w-72 h-72 rounded-full bg-yellow-400 opacity-40 blur-3xl bottom-20 right-20"
      />

      {/* ✅ Success Card */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white shadow-2xl rounded-3xl p-10 max-w-md w-full text-center relative z-10"
      >
        {/* ✅ Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1.2 }}
          transition={{ type: "spring", stiffness: 120, delay: 0.2 }}
          className="flex justify-center"
        >
          <FaCheckCircle className="text-green-500 text-9xl drop-shadow-lg animate-pulse" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-4xl font-extrabold text-gray-800"
        >
          🎊 Order Placed Successfully!
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-3 text-gray-600 text-lg"
        >
          Thank you for shopping with{" "}
          <span className="font-semibold text-blue-600">Pickzo</span>. Your items are on the way 🚚
        </motion.p>

        {/* 🚀 Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-10 flex flex-col gap-4"
        >
          <button
            onClick={() => navigate("/profile")}
            className="bg-green-500 hover:bg-green-600 hover:shadow-green-400/50 text-white px-6 py-3 rounded-2xl text-lg font-semibold shadow-lg transition-all duration-300"
          >
            View My Orders
          </button>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-500 hover:bg-blue-600 hover:shadow-blue-400/50 text-white px-6 py-3 rounded-2xl text-lg font-semibold shadow-lg transition-all duration-300"
          >
            Continue Shopping
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
