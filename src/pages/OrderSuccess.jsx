// src/pages/OrderSuccess.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import { FaCheckCircle } from "react-icons/fa";

const OrderSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 p-6">
      {/* 🎉 Confetti Effect */}
      <Confetti width={window.innerWidth} height={window.innerHeight} />

      {/* Card */}
      <div className="bg-white shadow-2xl rounded-3xl p-10 max-w-md w-full text-center transform transition-all duration-500 hover:scale-105">
        {/* Success Icon */}
        <div className="flex justify-center">
          <FaCheckCircle className="text-green-500 text-7xl animate-bounce" />
        </div>

        {/* Title */}
        <h1 className="mt-6 text-3xl font-extrabold text-gray-800">
          Order Placed Successfully! 🎊
        </h1>

        {/* Description */}
        <p className="mt-3 text-gray-600 text-lg">
          Thank you for shopping with <span className="font-semibold text-blue-500">Pickzo</span>.  
          Your items will be delivered soon 🚚
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col gap-4">
          <button
            onClick={() => navigate("/profile")}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl text-lg font-semibold shadow-lg transition-all duration-300"
          >
            View My Orders
          </button>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl text-lg font-semibold shadow-lg transition-all duration-300"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
