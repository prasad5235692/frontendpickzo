import React from "react";
import Confetti from "react-confetti";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";

const OrderSuccess = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-green-300">
      <Confetti numberOfPieces={300} recycle={false} />

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 10 }}
        className="bg-white p-10 rounded-2xl shadow-2xl text-center w-[90%] sm:w-[400px]"
      >
        <motion.div
          initial={{ rotate: -180 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 0.8 }}
        >
          <FaCheckCircle className="text-green-500 text-7xl mx-auto drop-shadow-lg" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold mt-4 text-gray-800"
        >
          Order Placed Successfully!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-gray-600 mt-2"
        >
          Thank you for shopping with <span className="font-bold">Pickzo</span>.
        </motion.p>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="mt-6 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-green-600 transition"
        >
          Continue Shopping
        </motion.button>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
