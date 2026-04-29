import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import { FaUser, FaEnvelope, FaLock, FaGift, FaTruck, FaShieldAlt, FaStar } from 'react-icons/fa';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      setIsError(true);
      return;
    }
    setLoading(true);
    try {
      await axios.post('/auth/register', { name: formData.name, email: formData.email, password: formData.password });
      setMessage('Account created! Redirecting to login...');
      setIsError(false);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || err.response?.data?.msg || 'Signup failed. Please try again.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { icon: FaUser, name: 'name', type: 'text', placeholder: 'Full Name' },
    { icon: FaEnvelope, name: 'email', type: 'email', placeholder: 'Email Address' },
    { icon: FaLock, name: 'password', type: 'password', placeholder: 'Password' },
    { icon: FaLock, name: 'confirmPassword', type: 'password', placeholder: 'Confirm Password' },
  ];

  return (
    <div className="min-h-screen bg-[#F1F3F6] flex items-center justify-center px-4 py-8 pt-20">
      <div className="w-full max-w-3xl bg-white rounded shadow-md overflow-hidden flex flex-col md:flex-row min-h-[480px]">

        {/* Left blue panel */}
        <div className="bg-[#2874F0] text-white flex flex-col justify-between p-8 md:w-[44%] flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold leading-snug mb-2">Looks like you're new here!</h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              Sign up with your email to get started with PickZo
            </p>
          </div>
          <div className="space-y-4 mt-6">
            <div className="flex items-center gap-3 text-sm text-blue-100">
              <FaGift className="text-yellow-300 flex-shrink-0" size={16} />
              <span>Exclusive welcome offers for new users</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-blue-100">
              <FaTruck className="text-yellow-300 flex-shrink-0" size={16} />
              <span>Free delivery on first 3 orders</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-blue-100">
              <FaShieldAlt className="text-yellow-300 flex-shrink-0" size={16} />
              <span>100% secure payments</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-blue-100">
              <FaStar className="text-yellow-300 flex-shrink-0" size={16} />
              <span>Personalised product recommendations</span>
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
            <div className={`mb-4 px-4 py-3 rounded text-sm font-medium ${isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ icon: Icon, name, type, placeholder }) => (
              <div key={name} className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type={type}
                  name={name}
                  placeholder={placeholder}
                  className="w-full pl-9 pr-4 py-3 border-b-2 border-gray-300 focus:border-blue-600 focus:outline-none text-sm bg-transparent"
                  value={formData[name]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}

            <p className="text-xs text-gray-500 leading-relaxed">
              By continuing, you agree to PickZo's{' '}
              <span className="text-blue-600 cursor-pointer hover:underline">Terms of Use</span> and{' '}
              <span className="text-blue-600 cursor-pointer hover:underline">Privacy Policy</span>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FB641B] hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded text-sm shadow transition"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <hr className="flex-1 border-gray-200" />
            <span className="text-xs text-gray-400">OR</span>
            <hr className="flex-1 border-gray-200" />
          </div>

          <p className="text-sm text-center text-gray-600">
            Existing user?{' '}
            <Link to="/login" className="text-[#2874F0] font-bold hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
