// src/pages/OrderSuccess.jsx
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// 🎉 Confetti Rain Animation
const ConfettiRain = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const confetti = [];
    const colors = ["#22c55e", "#16a34a", "#4ade80", "#bbf7d0", "#86efac"];

    for (let i = 0; i < 150; i++) {
      confetti.push({
        x: Math.random() * W,
        y: Math.random() * H - H,
        r: Math.random() * 6 + 4,
        d: Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngleIncremental: Math.random() * 0.07 + 0.05,
        tiltAngle: 0,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      confetti.forEach((c) => {
        ctx.beginPath();
        ctx.lineWidth = c.r / 2;
        ctx.strokeStyle = c.color;
        ctx.moveTo(c.x + c.tilt + c.r / 4, c.y);
        ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r / 4);
        ctx.stroke();
      });
      update();
    }

    function update() {
      confetti.forEach((c) => {
        c.tiltAngle += c.tiltAngleIncremental;
        c.y += (Math.cos(c.d) + 3 + c.r / 2) / 2;
        c.x += Math.sin(c.d);
        c.tilt = Math.sin(c.tiltAngle - i / 3) * 15;

        if (c.y > H) {
          c.y = -10;
          c.x = Math.random() * W;
        }
      });
    }

    function animate() {
      draw();
      requestAnimationFrame(animate);
    }

    animate();

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed top-0 left-0 w-full h-full z-50"
    />
  );
};

// ✅ Animated Success Badge
const SuccessBadge = () => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: [0, 1.2, 1], rotate: [0, 360, 360] }}
    transition={{ duration: 1, ease: "easeOut" }}
    className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-green-500 flex items-center justify-center bg-green-100 shadow-lg"
  >
    <svg
      className="w-12 h-12 text-green-600"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  </motion.div>
);

const OrderSuccess = () => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-6 sm:px-12 overflow-hidden bg-gradient-to-br from-green-50 to-green-100">
      {/* Background Confetti */}
      <ConfettiRain />

      {/* Success Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-xl text-center p-8 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl relative z-10 border border-green-200"
      >
        <SuccessBadge />

        <h1 className="text-4xl sm:text-5xl font-extrabold text-green-700 mb-6 drop-shadow-md animate-bounce">
          Order Placed Successfully!
        </h1>

        <p className="text-lg sm:text-xl mb-8 leading-relaxed text-gray-700">
          🎉 Thank you for your purchase. Your order has been confirmed and is
          on its way!
        </p>

        <Link
          to="/profile"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-md transition duration-200 text-lg"
        >
          Go to My Orders
        </Link>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
