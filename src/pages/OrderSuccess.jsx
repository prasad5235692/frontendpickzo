// src/pages/OrderSuccess.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// 🎉 Particle Burst Animation
const ParticleBurst = () => {
  useEffect(() => {
    const canvas = document.getElementById("confetti-canvas");
    const ctx = canvas.getContext("2d");
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const particles = [];
    const colors = ["#22c55e", "#16a34a", "#4ade80", "#bbf7d0", "#86efac"];

    function Particle(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 6 + 4;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.speedX = (Math.random() - 0.5) * 6;
      this.speedY = Math.random() * -4 - 2;
      this.alpha = 1;
    }

    Particle.prototype.update = function () {
      this.x += this.speedX;
      this.y += this.speedY;
      this.alpha -= 0.01;
    };

    Particle.prototype.draw = function () {
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.globalAlpha = 1;
    };

    function animate() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p, i) => {
        p.update();
        p.draw();
        if (p.alpha <= 0) particles.splice(i, 1);
      });
      requestAnimationFrame(animate);
    }

    function burst() {
      const x = W / 2;
      const y = H / 2;
      for (let i = 0; i < 50; i++) {
        particles.push(new Particle(x, y));
      }
    }

    burst(); // first burst
    const interval = setInterval(burst, 2000); // repeat bursts

    animate();

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener("resize", onResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      id="confetti-canvas"
      className="pointer-events-none fixed top-0 left-0 w-full h-full z-50"
    />
  );
};

// ✅ Success Check Icon with Animation
const SuccessCheck = () => (
  <svg
    className="w-24 h-24 mx-auto mb-6 animate-scaleIn"
    viewBox="0 0 52 52"
  >
    <circle
      className="text-green-200"
      cx="26"
      cy="26"
      r="25"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      className="text-green-600"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14 27l7 7 16-16"
    />
  </svg>
);

const OrderSuccess = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-6 sm:px-12 overflow-hidden bg-gradient-to-br from-green-50 to-green-100">
      {/* Background Particles */}
      <ParticleBurst />

      {/* Success Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.9, y: visible ? 0 : 40 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-xl text-center p-8 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl relative z-10"
      >
        <SuccessCheck />

        <h1 className="text-4xl sm:text-5xl font-extrabold text-green-700 mb-6 drop-shadow-md">
          Order Placed Successfully!
        </h1>

        <p className="text-lg sm:text-xl mb-8 leading-relaxed text-gray-700">
          Thank you for your purchase. Your order has been confirmed 🎉
        </p>

        <Link
          to="/profile"
          className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 rounded-lg shadow-md transition duration-200 text-sm sm:text-base"
        >
          Go to My Orders
        </Link>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;

/* ✅ Add this to your global CSS (e.g., index.css or tailwind.css)
@keyframes scaleIn {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.animate-scaleIn {
  animation: scaleIn 0.6s ease forwards;
}
*/
