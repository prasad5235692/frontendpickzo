// src/components/ProductCard.js
import React from "react";
import { Link } from "react-router-dom";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const renderStars = (rating) => {
  const stars = [];
  const rounded = Math.floor(rating);
  const hasHalf = rating - rounded >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < rounded) {
      stars.push(<FaStar key={i} className="text-yellow-400" />);
    } else if (i === rounded && hasHalf) {
      stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
    } else {
      stars.push(<FaRegStar key={i} className="text-yellow-400" />);
    }
  }
  return stars;
};

const ProductCard = ({ product }) => {
  return (
    <Link to={`/product/${product._id}`}>
      <div
        className="
          flex flex-row sm:flex-col items-center sm:items-start
          border rounded-lg p-3 shadow hover:shadow-md transition bg-white
          animate-scaleIn
        "
      >
        {/* Image */}
        <img
          src={product.image}
          alt={product.title}
          className="w-24 h-24 sm:w-full sm:h-40 object-contain mb-0 sm:mb-2"
          loading="lazy" // ✅ lazy loading for speed
        />

        {/* Details */}
        <div className="flex-1 pl-3 sm:pl-0">
          <h3 className="font-semibold text-sm sm:text-base md:text-lg line-clamp-1">
            {product.title}
          </h3>
          <p className="text-green-600 font-bold text-sm sm:text-md md:text-lg mb-1">
            ₹{product.price.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 text-xs sm:text-sm">
            {renderStars(product.rating || 0)}
            <span className="ml-1 text-gray-600">
              ({product.rating || "0"})
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
