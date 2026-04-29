import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { Link, useLocation } from "react-router-dom";
import { FaStar, FaStarHalfAlt, FaRegStar, FaFilter, FaTimes, FaChevronDown, FaChevronUp } from "react-icons/fa";

const renderStars = (rating) => {
  const stars = [];
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  for (let i = 0; i < 5; i++) {
    if (i < full) stars.push(<FaStar key={i} className="text-yellow-400 text-xs" />);
    else if (i === full && half) stars.push(<FaStarHalfAlt key={i} className="text-yellow-400 text-xs" />);
    else stars.push(<FaRegStar key={i} className="text-gray-300 text-xs" />);
  }
  return stars;
};

const SORT_OPTIONS = [
  { label: "Relevance", value: "relevance" },
  { label: "Price — Low to High", value: "price_asc" },
  { label: "Price — High to Low", value: "price_desc" },
  { label: "Popularity", value: "popularity" },
  { label: "Rating", value: "rating" },
];

const PRICE_RANGES = [
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 – ₹1,000", min: 500, max: 1000 },
  { label: "₹1,000 – ₹5,000", min: 1000, max: 5000 },
  { label: "₹5,000 – ₹10,000", min: 5000, max: 10000 },
  { label: "Above ₹10,000", min: 10000, max: Infinity },
];

const RATING_FILTERS = [4, 3, 2];

const SkeletonCard = () => (
  <div className="bg-white border border-gray-200 overflow-hidden animate-pulse">
    <div className="h-44 bg-gray-200" />
    <div className="p-3 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-4/5" />
      <div className="h-3 bg-gray-200 rounded w-3/5" />
      <div className="h-4 bg-gray-200 rounded w-2/5 mt-1" />
    </div>
  </div>
);

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200 py-3">
      <button
        className="flex items-center justify-between w-full text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{title}</span>
        {open ? <FaChevronUp size={10} className="text-gray-400" /> : <FaChevronDown size={10} className="text-gray-400" />}
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
};

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState("relevance");
  const [priceRange, setPriceRange] = useState(null);
  const [minRating, setMinRating] = useState(null);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchTerm = searchParams.get("search");

  useEffect(() => {
    setLoading(true);
    const fetchProducts = async () => {
      try {
        const endpoint = searchTerm
          ? `/products?search=${encodeURIComponent(searchTerm)}`
          : "/products";
        const res = await axios.get(endpoint);
        setProducts(res.data);
        setError("");
      } catch (err) {
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchTerm]);

  const filtered = products
    .filter((p) => {
      if (priceRange && (p.price < priceRange.min || p.price > priceRange.max)) return false;
      if (minRating && (p.rating || 0) < minRating) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "price_asc") return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  const activeFilterCount = (priceRange ? 1 : 0) + (minRating ? 1 : 0);

  const Sidebar = () => (
    <div className="bg-white rounded shadow-sm w-full">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
          <FaFilter size={11} className="text-blue-600" /> Filters
        </h3>
        {activeFilterCount > 0 && (
          <button
            onClick={() => { setPriceRange(null); setMinRating(null); }}
            className="text-xs text-blue-600 font-semibold hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="px-4">
        <FilterSection title="Price">
          {PRICE_RANGES.map((r) => (
            <label key={r.label} className="flex items-center gap-2 py-1 cursor-pointer group">
              <input
                type="radio"
                name="price"
                checked={priceRange?.label === r.label}
                onChange={() => setPriceRange(priceRange?.label === r.label ? null : r)}
                className="accent-blue-600"
              />
              <span className={`text-xs ${priceRange?.label === r.label ? 'text-blue-600 font-semibold' : 'text-gray-600 group-hover:text-blue-600'}`}>
                {r.label}
              </span>
            </label>
          ))}
        </FilterSection>

        <FilterSection title="Customer Ratings">
          {RATING_FILTERS.map((r) => (
            <label key={r} className="flex items-center gap-2 py-1 cursor-pointer group">
              <input
                type="radio"
                name="rating"
                checked={minRating === r}
                onChange={() => setMinRating(minRating === r ? null : r)}
                className="accent-blue-600"
              />
              <span className={`text-xs flex items-center gap-1 ${minRating === r ? 'text-blue-600 font-semibold' : 'text-gray-600 group-hover:text-blue-600'}`}>
                {r}★ &amp; above
              </span>
            </label>
          ))}
        </FilterSection>
      </div>
    </div>
  );

  return (
    <div className="bg-[#F1F3F6] min-h-screen pt-[186px] sm:pt-[148px]">
      <div className="max-w-[1400px] mx-auto px-4 py-4">

        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-gray-800">
              {searchTerm ? (
                <>Search results for <span className="text-blue-600">"{searchTerm}"</span></>
              ) : "All Products"}
            </h2>
            {!loading && !error && (
              <p className="text-xs text-gray-500 mt-0.5">{filtered.length} results</p>
            )}
          </div>
          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowMobileFilter(true)}
            className="lg:hidden flex items-center gap-1.5 text-xs font-semibold text-blue-600 border border-blue-200 px-3 py-1.5 rounded"
          >
            <FaFilter size={10} /> Filter{activeFilterCount > 0 && ` (${activeFilterCount})`}
          </button>
        </div>

        {/* Sort bar */}
        <div className="bg-white rounded shadow-sm px-4 py-2 flex items-center gap-1 mb-3 overflow-x-auto no-scrollbar">
          <span className="text-xs text-gray-500 font-medium mr-2 flex-shrink-0">Sort by:</span>
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setSort(o.value)}
              className={`flex-shrink-0 px-3 py-1 text-xs font-semibold rounded-full transition border ${
                sort === o.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded px-4 py-3 mb-4 text-sm">{error}</div>
        )}

        <div className="flex gap-4">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <Sidebar />
          </aside>

          {/* Product grid */}
          <div className="flex-1">
            {!loading && !error && filtered.length === 0 ? (
              <div className="text-center py-24 text-gray-400 bg-white rounded shadow-sm">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-base font-medium">No products match your filters</p>
                <button
                  onClick={() => { setPriceRange(null); setMinRating(null); }}
                  className="mt-3 text-sm text-blue-600 font-semibold hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-px bg-gray-200 border border-gray-200 rounded overflow-hidden shadow-sm">
                {loading
                  ? Array.from({ length: 20 }).map((_, i) => <SkeletonCard key={i} />)
                  : filtered.map((product) => {
                      const mrp = Math.round(product.price * 1.2);
                      const off = Math.round(((mrp - product.price) / mrp) * 100);
                      return (
                        <Link key={product._id} to={`/product/${product._id}`} className="group block bg-white hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-center h-40 bg-white overflow-hidden px-4 pt-4">
                            <img
                              src={product.image}
                              alt={product.title}
                              className="h-32 w-full object-contain group-hover:scale-105 transition-transform duration-200"
                              loading="lazy"
                            />
                          </div>
                          <div className="p-3">
                            <h3 className="text-xs text-gray-800 line-clamp-2 leading-snug mb-1">
                              {product.title}
                            </h3>
                            <div className="flex items-center gap-1 mb-1">
                              <span className="inline-flex items-center gap-0.5 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                {product.rating || 4.1} <FaStar size={8} />
                              </span>
                              <span className="text-[10px] text-gray-400">(1,245)</span>
                            </div>
                            <div className="flex items-baseline gap-1.5 flex-wrap">
                              <span className="text-sm font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                              <span className="text-[10px] text-gray-400 line-through">₹{mrp.toLocaleString()}</span>
                              <span className="text-[10px] font-semibold text-green-600">{off}% off</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileFilter(false)} />
          <div className="relative ml-auto w-72 bg-white h-full overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-800">Filters</h3>
              <button onClick={() => setShowMobileFilter(false)}><FaTimes size={14} className="text-gray-500" /></button>
            </div>
            <div className="px-4"><Sidebar /></div>
            <div className="px-4 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowMobileFilter(false)}
                className="w-full bg-blue-600 text-white text-sm font-bold py-2.5 rounded"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
