import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";
import { motion } from "framer-motion";

const balloons = Array.from({ length: 7 });

const Firework = ({ x, y }) => (
  <motion.div
    className="absolute w-3 h-3 bg-yellow-400 rounded-full"
    initial={{ opacity: 1, scale: 1, x, y }}
    animate={{ opacity: 0, scale: 5 }}
    transition={{ duration: 1 }}
  />
);

const OrderSuccess = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [fireworks, setFireworks] = useState([]);

  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);

    const interval = setInterval(() => {
      setFireworks((fw) => [
        ...fw,
        {
          id: Date.now(),
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
        },
      ]);
    }, 900);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 overflow-hidden">
      {/* 🎉 Confetti */}
      <Confetti width={windowSize.width} height={windowSize.height} />

      {/* 🎈 Balloons */}
      {balloons.map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: "100vh", x: Math.random() * window.innerWidth }}
          animate={{ y: "-10vh" }}
          transition={{
            duration: 6 + Math.random() * 3,
            repeat: Infinity,
            delay: i * 0.5,
          }}
          className="absolute text-4xl"
        >
          🎈
        </motion.div>
      ))}

      {/* 🎆 Fireworks */}
      {fireworks.map((fw) => (
        <Firework key={fw.id} x={fw.x} y={fw.y} />
      ))}

      {/* ✅ Checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 150, damping: 15 }}
        className="bg-green-600 text-white p-6 rounded-full shadow-2xl z-10"
      >
        ✅
      </motion.div>

      {/* 🎁 Rotating gift */}
      <motion.div
        initial={{ rotate: 0, scale: 0 }}
        animate={{ rotate: 360, scale: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
        className="text-6xl mt-6 z-10"
      >
        🎁
      </motion.div>

      {/* 🎊 Title */}
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-4xl font-extrabold text-purple-700 mt-6 z-10 drop-shadow-lg"
      >
        🎉 Order Placed Successfully 🎉
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-3 text-lg text-gray-600 z-10"
      >
        Thank you for shopping with <span className="font-bold">Pickzo</span> 💖
      </motion.p>
    </div>
  );
};

export default OrderSuccess;
