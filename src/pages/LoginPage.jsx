import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaShoppingBag, FaTruck, FaShieldAlt, FaStar } from "react-icons/fa";

const LoginForm = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token")) navigate("/home");
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/auth/login", { identifier, password });
      const { token, user } = res.data;
      if (!user || !user._id || !token) throw new Error("Invalid login response");
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user._id);
      localStorage.setItem("username", user.name || user.email);
      setMessage("Login successful!");
      setIsError(false);
      navigate('/home', { replace: true });
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed. Please check your credentials.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F3F6] flex items-center justify-center px-4 py-8 pt-20">
      <div className="w-full max-w-3xl bg-white rounded shadow-md overflow-hidden flex flex-col md:flex-row min-h-[420px]">

        {/* Left blue panel */}
        <div className="bg-[#2874F0] text-white flex flex-col justify-between p-8 md:w-[44%] flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold leading-snug mb-2">Login</h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              Get access to your Orders, Wishlist and Recommendations
            </p>
          </div>
          <div className="space-y-4 mt-6">
            <div className="flex items-center gap-3 text-sm text-blue-100">
              <FaShoppingBag className="text-yellow-300 flex-shrink-0" size={16} />
              <span>Track your orders in real time</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-blue-100">
              <FaTruck className="text-yellow-300 flex-shrink-0" size={16} />
              <span>Free delivery on orders above ₹499</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-blue-100">
              <FaShieldAlt className="text-yellow-300 flex-shrink-0" size={16} />
              <span>Safe & secure payments</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-blue-100">
              <FaStar className="text-yellow-300 flex-shrink-0" size={16} />
              <span>Exclusive deals for members</span>
            </div>
          </div>
          <div className="mt-8">
            <span className="text-2xl font-extrabold tracking-tight">
              <span className="text-white">Pick</span>
              <span className="text-yellow-400">Zo</span>
            </span>
            <p className="text-blue-200 text-xs mt-0.5">Smart shopping lane</p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex-1 p-8 flex flex-col justify-center">
          {message && (
            <div
              className={`mb-4 px-4 py-3 rounded text-sm font-medium ${
                isError
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-green-50 text-green-700 border border-green-200"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Email or Username"
                className="w-full pl-9 pr-4 py-3 border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none text-sm bg-transparent"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="password"
                placeholder="Password"
                className="w-full pl-9 pr-4 py-3 border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none text-sm bg-transparent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              By continuing, you agree to PickZo's{" "}
              <span className="text-blue-600 cursor-pointer hover:underline">Terms of Use</span> and{" "}
              <span className="text-blue-600 cursor-pointer hover:underline">Privacy Policy</span>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FB641B] hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded text-sm shadow transition"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <hr className="flex-1 border-gray-200" />
            <span className="text-xs text-gray-400">OR</span>
            <hr className="flex-1 border-gray-200" />
          </div>

          <p className="text-sm text-center text-gray-600">
            New to PickZo?{" "}
            <Link to="/signup" className="text-[#2874F0] font-bold hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
