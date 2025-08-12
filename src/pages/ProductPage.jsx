import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { Link, useLocation } from "react-router-dom";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchTerm = searchParams.get("search");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const endpoint = searchTerm
          ? `/products?search=${encodeURIComponent(searchTerm)}`
          : "/products";
        const res = await axios.get(endpoint);
        setProducts(res.data);
        setError("");
      } catch (err) {
        console.error("Product fetch failed:", err.message);
        setError("❌ Failed to load products.");
      }
    };

    fetchProducts();
  }, [searchTerm]);

  const renderStars = (rating) => {
    const stars = [];
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < full) {
        stars.push(<FaStar key={i} className="text-yellow-400 text-sm" />);
      } else if (i === full && half) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400 text-sm" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400 text-sm" />);
      }
    }

    return stars;
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center sm:text-left">
        {searchTerm ? `Search Results for "${searchTerm}"` : "All Products"}
      </h2>

      {error && <p className="text-red-600">{error}</p>}

      {products.length === 0 && !error && (
        <p className="text-gray-600 text-center">No products found.</p>
      )}

      <div
        className="
          grid 
          grid-cols-2 
          sm:grid-cols-3 
          md:grid-cols-4 
          lg:grid-cols-5 
          gap-4 
          sm:gap-6
        "
      >
        {products.map((product) => (
          <Link
            key={product._id}
            to={`/product/${product._id}`}
            className="
              border rounded-lg shadow hover:shadow-lg transition 
              p-3 sm:p-4 bg-white flex flex-col items-center
            "
          >
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-32 sm:h-40 md:h-48 object-contain mb-2"
            />
            <h3 className="font-semibold text-sm sm:text-md text-center line-clamp-2">
              {product.title}
            </h3>
            <p className="text-green-600 font-bold text-sm sm:text-md mb-1">
              ₹{product.price.toLocaleString()}
            </p>
            <div className="flex items-center justify-center gap-1 text-xs sm:text-sm">
              {renderStars(product.rating || 0)}
              <span className="text-gray-500 ml-1">
                ({product.rating || 0})
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductPage;
