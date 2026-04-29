import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaStar, FaStarHalfAlt, FaRegStar, FaShoppingCart, FaBolt,
  FaChevronRight, FaShieldAlt, FaExchangeAlt, FaTruck, FaTag,
  FaCheckCircle, FaShare
} from 'react-icons/fa';
import axios from '../api/axios';

const OFFERS = [
  { icon: FaTag, color: 'text-green-600', title: 'Bank Offer', desc: '10% off on SBI Credit Cards, up to ₹1,500' },
  { icon: FaTag, color: 'text-green-600', title: 'Bank Offer', desc: '5% Cashback on Flipkart Axis Bank Card' },
  { icon: FaExchangeAlt, color: 'text-blue-600', title: 'Exchange Offer', desc: 'Up to ₹1,000 off on exchange' },
  { icon: FaTruck, color: 'text-orange-500', title: 'Free Delivery', desc: 'On orders above ₹499' },
];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [selectedImg, setSelectedImg] = useState(0);
  const [pincode, setPincode] = useState('');
  const [pincodeMsg, setPincodeMsg] = useState(null);

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

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ type: 'error', text: 'Please login to add to cart.' });
      setTimeout(() => navigate('/login'), 1500);
      return;
    }
    try {
      await axios.post(
        '/cart/add',
        { productId: product._id || product.id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: 'success', text: 'Item added to cart!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to add to cart.' });
    }
  };

  const handleBuyNow = () => {
    if (!localStorage.getItem('token')) {
      setMessage({ type: 'error', text: 'Please login before buying.' });
      setTimeout(() => navigate('/login'), 1500);
      return;
    }
    navigate('/buy-now', { state: { product } });
  };

  const handlePincodeCheck = () => {
    if (/^\d{6}$/.test(pincode)) {
      setPincodeMsg({ ok: true, text: `Delivery available to ${pincode} — arrives Tomorrow` });
    } else {
      setPincodeMsg({ ok: false, text: 'Enter a valid 6-digit pincode' });
    }
  };

  if (loading)
    return (
      <div className="pt-20 min-h-screen bg-[#F1F3F6] flex items-center justify-center">
        <div className="max-w-5xl w-full mx-auto p-4 flex flex-col lg:flex-row gap-4 animate-pulse">
          <div className="bg-white rounded w-full lg:w-96 h-80" />
          <div className="bg-white rounded flex-1 p-6 space-y-4">
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-8 bg-gray-200 rounded w-1/3 mt-4" />
          </div>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="pt-20 min-h-screen bg-[#F1F3F6] flex items-center justify-center text-red-500">
        Product not found.
      </div>
    );

  const mrp = Math.round(product.price * 1.25);
  const discount = Math.round(((mrp - product.price) / mrp) * 100);
  const thumbnails = [product.image, product.image, product.image];

  return (
    <div className="pt-[186px] sm:pt-[148px] bg-[#F1F3F6] min-h-screen">
      {/* Toast */}
      {message && (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 px-6 py-2.5 rounded shadow-lg z-50 text-sm font-semibold
            ${message.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}
        >
          {message.text}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-1 text-xs text-gray-500">
          <button onClick={() => navigate('/')} className="hover:text-blue-600">Home</button>
          <FaChevronRight size={8} />
          <button onClick={() => navigate('/products')} className="hover:text-blue-600">Products</button>
          <FaChevronRight size={8} />
          <span className="text-gray-800 line-clamp-1 max-w-xs">{product.name || product.title}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-4">

          {/* ── LEFT: Image Gallery ── */}
          <div className="lg:w-96 flex-shrink-0">
            <div className="bg-white rounded shadow-sm p-4 sticky top-[152px]">
              <div className="flex items-center justify-center h-72 border border-gray-100 rounded mb-3 overflow-hidden">
                <img
                  src={thumbnails[selectedImg]}
                  alt={product.name || product.title}
                  className="max-h-64 max-w-full object-contain"
                />
              </div>
              <div className="flex gap-2 justify-center mb-4">
                {thumbnails.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    className={`w-12 h-12 border-2 rounded flex items-center justify-center overflow-hidden transition ${selectedImg === i ? 'border-blue-600' : 'border-gray-200 hover:border-blue-300'}`}
                  >
                    <img src={img} alt="" className="w-10 h-10 object-contain" />
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-3 rounded text-sm shadow transition"
                >
                  <FaShoppingCart size={14} /> ADD TO CART
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#FB641B] hover:bg-orange-600 text-white font-bold py-3 rounded text-sm shadow transition"
                >
                  <FaBolt size={14} /> BUY NOW
                </button>
              </div>
              <div className="flex items-center justify-center mt-4 text-xs text-gray-500">
                <button className="flex items-center gap-1 hover:text-blue-600 transition">
                  <FaShare size={10} /> Share
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Product Info ── */}
          <div className="flex-1 space-y-3">

            {/* Title + Rating + Price */}
            <div className="bg-white rounded shadow-sm p-5">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">
                {product.category || 'General'}
              </p>
              <h1 className="text-lg font-medium text-gray-900 leading-snug mb-2">
                {product.name || product.title}
              </h1>

              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-1 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                  {product.rating || 4.1} <FaStar size={9} />
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  2,45,678 Ratings &amp; 15,234 Reviews
                </span>
                <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                  Excellent
                </span>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-semibold text-gray-900">
                    ₹{product.price?.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    ₹{mrp.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-green-600">{discount}% off</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Inclusive of all taxes</p>
                <p className="text-xs font-semibold text-green-600 mt-0.5">Special Price — Extra ₹200 off</p>
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Available Offers</h3>
                <div className="space-y-2">
                  {OFFERS.map(({ icon: Icon, color, title, desc }, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-700">
                      <Icon className={`${color} mt-0.5 flex-shrink-0`} size={12} />
                      <p><span className="font-semibold">{title}</span> — {desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Delivery */}
            <div className="bg-white rounded shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <FaTruck className="text-blue-600" size={14} />
                <span className="text-sm font-bold text-gray-800">Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '')); setPincodeMsg(null); }}
                  placeholder="Enter Pincode"
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm w-36 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
                <button onClick={handlePincodeCheck} className="text-blue-600 text-sm font-bold hover:underline">
                  Check
                </button>
              </div>
              {pincodeMsg && (
                <p className={`text-xs mt-1.5 font-medium ${pincodeMsg.ok ? 'text-green-600' : 'text-red-600'}`}>
                  {pincodeMsg.ok && <FaCheckCircle className="inline mr-1" size={10} />}
                  {pincodeMsg.text}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-600">
                <span className="flex items-center gap-1"><FaTruck className="text-green-600" size={10} /> Free Delivery</span>
                <span className="flex items-center gap-1"><FaShieldAlt className="text-blue-600" size={10} /> 7 Days Return</span>
                <span className="flex items-center gap-1"><FaExchangeAlt className="text-orange-500" size={10} /> Easy Exchange</span>
              </div>
            </div>

            {/* Highlights / Description */}
            <div className="bg-white rounded shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Highlights</h3>
              {product.description ? (
                <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
              ) : (
                <ul className="space-y-1.5 text-sm text-gray-600">
                  <li className="flex gap-2"><FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={12} /> Premium quality product</li>
                  <li className="flex gap-2"><FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={12} /> 1 Year brand warranty</li>
                  <li className="flex gap-2"><FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={12} /> In the box: Product, Manual, Warranty card</li>
                </ul>
              )}
            </div>

            {product.about && (
              <div className="bg-white rounded shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Specifications</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{product.about}</p>
              </div>
            )}

            {/* Seller */}
            <div className="bg-white rounded shadow-sm p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Sold by</p>
                  <p className="text-sm font-bold text-blue-600 cursor-pointer hover:underline">PickZo Retail</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs bg-green-600 text-white px-2 py-0.5 rounded font-bold">
                  4.6 <FaStar size={9} />
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">23,458 ratings · Trusted seller since 2019</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
