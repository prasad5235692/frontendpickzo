import React from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";

const ProductCard = ({ product }) => {
  const price = Number(product.price || 0);
  const originalPrice = Math.max(price, Math.round(price * 1.18));
  const discount = originalPrice > 0 ? Math.max(10, Math.round(((originalPrice - price) / originalPrice) * 100)) : 0;
  const categoryLabel = Array.isArray(product.category)
    ? product.category[0]
    : product.category || "Top pick";
  const rating = Number(product.rating || 0).toFixed(1);

  return (
    <Link to={`/product/${product._id}`} className="group block h-full">
      <div className="flex h-full flex-col overflow-hidden rounded-[26px] border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[var(--brand-blue)]/40 hover:shadow-[0_26px_40px_rgba(15,23,42,0.12)]">
        <div className="relative flex h-52 items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)] px-4">
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 shadow-sm">
              {categoryLabel}
            </span>
            {discount > 0 && (
              <span className="rounded-full bg-[#e8fff3] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#15803d]">
                {discount}% off
              </span>
            )}
          </div>

          <img
            src={product.image}
            alt={product.title}
            className="h-40 w-full object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {Number(product.rating) >= 4.5 && (
            <span className="absolute bottom-4 right-4 rounded-full bg-[var(--brand-search)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-900">
              Top rated
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <h3 className="line-clamp-2 font-display text-base font-semibold leading-6 text-slate-900">
            {product.title}
          </h3>

          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#108934] px-2.5 py-1 font-semibold text-white">
              {rating}
              <FaStar size={10} />
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">
              Free delivery
            </span>
          </div>

          <div className="mt-auto space-y-2">
            <div className="flex items-end gap-2">
              <p className="font-display text-xl font-bold text-slate-900">
                ₹{price.toLocaleString()}
              </p>
              {originalPrice > price && (
                <span className="text-sm font-medium text-slate-400 line-through">
                  ₹{originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
              <span className="font-medium text-[#15803d]">Special price available</span>
              <span className="font-bold text-[var(--brand-blue)]">View details →</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
