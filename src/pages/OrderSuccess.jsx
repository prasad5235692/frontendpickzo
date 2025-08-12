// src/pages/OrderSuccess.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Confetti = () => {
  // Simple confetti animation using canvas
  // Lightweight and adds that celebratory vibe

  useEffect(() => {
    const canvas = document.getElementById("confetti-canvas");
    const ctx = canvas.getContext("2d");
    let W = window.innerWidth;
    let H = window.innerHeight;

    canvas.width = W;
    canvas.height = H;

    const colors = [
      "#FFC700",
      "#FF0000",
      "#2E3192",
      "#41BBC7",
      "#7325B7",
      "#38B000",
      "#FF8F00",
    ];

    const confettiCount = 150;
    const confetti = [];

    function randomRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    function Confetto() {
      this.x = Math.random() * W;
      this.y = Math.random() * H - H;
      this.rotation = randomRange(0, 2 * Math.PI);
      this.size = randomRange(5, 12);
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.speed = randomRange(1, 3);
      this.opacity = randomRange(0.7, 1);
      this.doppler = 0.03 + Math.random() / 30;
      this.tiltAngle = 0;
      this.tiltAngleIncrement = randomRange(0.05, 0.12);
      this.tilt = 0;
    }

    Confetto.prototype.update = function () {
      this.y += this.speed;
      this.tiltAngle += this.tiltAngleIncrement;
      this.tilt = Math.sin(this.tiltAngle) * 15;

      if (this.y > H) {
        this.x = Math.random() * W;
        this.y = -20;
        this.speed = randomRange(1, 3);
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
    };

    Confetto.prototype.draw = function () {
      ctx.beginPath();
      ctx.lineWidth = this.size / 2;
      ctx.strokeStyle = this.color;
      ctx.moveTo(this.x + this.tilt + this.size / 2, this.y);
      ctx.lineTo(this.x + this.tilt, this.y + this.tilt + this.size / 2);
      ctx.stroke();
    };

    for (let i = 0; i < confettiCount; i++) {
      confetti.push(new Confetto());
    }

    function update() {
      ctx.clearRect(0, 0, W, H);
      confetti.forEach((c) => {
        c.update();
        c.draw();
      });
      requestAnimationFrame(update);
    }

    update();

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };

    window.addEventListener("resize", onResize);

    return () => {
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

const PartyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 animate-bounce"
    fill="none"
    viewBox="0 0 64 64"
    stroke="url(#grad1)"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <defs>
      <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#4ade80" />
        <stop offset="100%" stopColor="#16a34a" />
      </linearGradient>
    </defs>
    <path d="M32 4 L44 24 L40 62 L24 62 L20 24 Z" fill="#22c55e" />
    <circle cx="32" cy="32" r="6" fill="#bbf7d0" />
    <line x1="32" y1="12" x2="32" y2="20" />
    <line x1="25" y1="18" x2="28" y2="22" />
    <line x1="39" y1="18" x2="36" y2="22" />
  </svg>
);

const OrderSuccess = () => {
  const [visible, setVisible] = useState(false);

  // Trigger fade in effect
  React.useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen  px-6 sm:px-12 overflow-hidden">
      <Confetti />

      <div
        className={`max-w-xl text-center p-8 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl transition-opacity duration-700 ease-in-out ${
          visible ? "opacity-100" : "opacity-0 translate-y-6"
        }`}
      >
        <PartyIcon />

        <h1 className="text-4xl sm:text-5xl font-extrabold text-green-700 mb-6 drop-shadow-md">
          Order Placed Successfully!
        </h1>

        <p className="text-lg sm:text-xl  mb-8 leading-relaxed">
          Thank you for your purchase. Your order has been confirmed.
        </p>

        <Link
          to="/profile"
         className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 rounded-lg shadow-md transition duration-200 text-sm sm:text-base"
        >
          Go to My Orders
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
