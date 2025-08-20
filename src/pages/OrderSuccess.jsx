// src/pages/OrderSuccess.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

//
// 🎊 Confetti Rain
//
const ConfettiRain = () => {
  useEffect(() => {
    const canvas = document.getElementById("confetti-canvas");
    const ctx = canvas.getContext("2d");
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const colors = ["#FFC700", "#FF0000", "#2E3192", "#41BBC7", "#7325B7", "#38B000", "#FF8F00"];
    const confettiCount = 120;
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

    for (let i = 0; i < confettiCount; i++) confetti.push(new Confetto());

    function update() {
      ctx.clearRect(0, 0, W, H);
      confetti.forEach((c) => {
        c.update();
        c.draw();
      });
      requestAnimationFrame(update);
    }
    update();

    window.addEventListener("resize", () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    });
  }, []);

  return <canvas id="confetti-canvas" className="fixed top-0 left-0 w-full h-full pointer-events-none z-50" />;
};

//
// 💥 Particle Burst
//
const ParticleBurst = () => {
  useEffect(() => {
    const canvas = document.getElementById("burst-canvas");
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

    function burst() {
      const x = W / 2;
      const y = H / 2;
      for (let i = 0; i < 50; i++) particles.push(new Particle(x, y));
    }

    function animate() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p, i) => {
        p.update();
        p.draw();
        if (p.alpha <= 0) particles.splice(i, 1);
      });
      requestAnimationFrame(animate);
    }

    burst();
    const interval = setInterval(burst, 2000);
    animate();

    return () => clearInterval(interval);
  }, []);

  return <canvas id="burst-canvas" className="fixed top-0 left-0 w-full h-full pointer-events-none z-50" />;
};

//
// ✨ Floating Stars
//
const FloatingStars = () => {
  useEffect(() => {
    const canvas = document.getElementById("stars-canvas");
    const ctx = canvas.getContext("2d");
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const stars = [];
    for (let i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        radius: Math.random() * 2,
        alpha: Math.random(),
        speed: Math.random() * 0.02,
      });
    }

    function animate() {
      ctx.clearRect(0, 0, W, H);
      stars.forEach((s) => {
        s.alpha += s.speed;
        if (s.alpha > 1 || s.alpha < 0) s.speed = -s.speed;
        ctx.globalAlpha = s.alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#FFD700";
        ctx.fill();
      });
      requestAnimationFrame(animate);
    }
    animate();
  }, []);

  return <canvas id="stars-canvas" className="fixed top-0 left-0 w-full h-full pointer-events-none z-50" />;
};

//
// 🎉 Randomize model
//
const animations = [ConfettiRain, ParticleBurst, FloatingStars];
const RandomAnimation = animations[Math.floor(Math.random() * animations.length)];

//
// ✅ Main Component
//
const OrderSuccess = () => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-6 sm:px-12 overflow-hidden bg-gradient-to-br from-green-50 to-green-100">
      {/* Background Animation */}
      <RandomAnimation />

      {/* Success Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="max-w-xl text-center p-8 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl relative z-10"
      >
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring", stiffness: 200 }}>
          <span className="text-6xl">🎉</span>
        </motion.div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-green-700 mb-6 drop-shadow-md">
          Order Placed Successfully!
        </h1>

        <p className="text-lg sm:text-xl mb-8 leading-relaxed text-gray-700">
          Thank you for your purchase. Your order has been confirmed.
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
