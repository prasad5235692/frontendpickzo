import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import axios from '../api/axios';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // UI Message State
  const [message, setMessage] = useState(null);

  const handleBuyNow = () => {
    if (!localStorage.getItem('token')) {
      setMessage({ type: 'error', text: 'Please login before buying.' });
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    navigate('/buy-now', { state: { product } });
  };

  // Star Rating
  const getStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<FaStar key={i} />);
      } else if (rating >= i - 0.5) {
        stars.push(<FaStarHalfAlt key={i} />);
      } else {
        stars.push(<FaRegStar key={i} />);
      }
    }
    return stars;
  };

  // Fetch Product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/products/${id}`);
        setProduct(res.data);
      } catch {
        setMessage({ type: 'error', text: 'Failed to load product details.' });
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Add to Cart
  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage({ type: 'error', text: 'Please login to add to cart.' });
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      await axios.post(
        '/cart/add',
        { productId: product._id || product.id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ type: 'success', text: 'Product added to cart!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to add to cart. Please try again.' });
    }
  };

  // Auto Clear Message
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading) return <div className="p-6 text-xl">Loading...</div>;
  if (!product) return <div className="p-6 text-xl text-red-500">Product not found</div>;

  return (
    <div className="pt-16">
      <div className="max-w-6xl mx-auto p-12 sm:p-6 flex flex-col md:flex-row gap-12 sm:gap-8">

        {/* Message Box */}
        {message && (
          <div
            className={`fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg transition-opacity duration-300 z-50
              ${message.type === 'error'
                ? 'bg-red-500 text-white'
                : message.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white'
              }`}
            role="alert"
          >
            {message.text}
          </div>
        )}

        {/* Left: Image */}
        <div className="flex-1 flex justify-center items-start">
          <img
            src={product.image}
            alt={product.name || product.title || 'Product Image'}
            className="h-60 sm:h-72 md:h-80 object-contain rounded shadow w-full sm:w-auto"
          />
        </div>

        {/* Right: Details */}
        <div className="flex-1 space-y-3 sm:space-y-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800 text-center md:text-left">
            {product.name || product.title}
          </h1>

          <p className="text-gray-600 text-sm sm:text-base text-center md:text-left">
            {product.description || 'No description available.'}
          </p>

          <p className="text-blue-600 text-lg sm:text-xl md:text-2xl font-bold text-center md:text-left">
            ₹{product.price?.toLocaleString()}
          </p>

          {product.rating && (
            <div className="flex justify-center md:justify-start items-center gap-2 text-yellow-500">
              {getStars(product.rating)}
              <span className="text-xs sm:text-sm text-gray-600 ml-2">
                ({product.rating} / 5)
              </span>
            </div>
          )}

          {product.about && (
            <div className="mt-4">
              <h3 className="text-base sm:text-lg font-semibold">About this product:</h3>
              <p className="text-gray-700 whitespace-pre-line text-sm sm:text-base">{product.about}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={handleAddToCart}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg shadow-md transition duration-200 text-sm sm:text-base"
            >
              Add to Cart
            </button>

            <button
              onClick={handleBuyNow}
              className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 rounded-lg shadow-md transition duration-200 text-sm sm:text-base"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
