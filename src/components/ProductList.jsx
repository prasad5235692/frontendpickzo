import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import ProductCard from "./ProductCard";

const SkeletonCard = () => (
  <div className="w-[230px] flex-shrink-0 animate-pulse overflow-hidden rounded-[26px] border border-slate-200 bg-white">
    <div className="h-52 bg-slate-200" />
    <div className="space-y-3 p-4">
      <div className="h-3 w-1/3 rounded bg-slate-200" />
      <div className="h-4 w-4/5 rounded bg-slate-200" />
      <div className="h-4 w-3/5 rounded bg-slate-200" />
      <div className="h-5 w-1/2 rounded bg-slate-200" />
    </div>
  </div>
);

const CategoryRow = ({ name, items, loading, limit, onViewAll, blurb, accentClass }) => {
  const rowRef = useRef(null);

  const scroll = (dir) => {
    rowRef.current?.scrollBy({ left: dir * 260, behavior: "smooth" });
  };

  return (
    <div className="section-card overflow-hidden p-4 sm:p-5">
      <div className="grid gap-5 xl:grid-cols-[240px_1fr]">
        <div className={`hidden rounded-[28px] bg-gradient-to-br p-6 text-white xl:flex xl:flex-col xl:justify-between ${accentClass}`}>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/66">Featured aisle</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em]">{name}</h2>
            <p className="mt-4 text-sm leading-7 text-white/82">{blurb}</p>
          </div>

          <button
            onClick={onViewAll}
            className="mt-6 inline-flex w-fit rounded-full bg-white/92 px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-white"
          >
            View all deals
          </button>
        </div>

        <div className="min-w-0">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="heading-kicker">Retail shelf</p>
              <h2 className="mt-1 font-display text-xl font-semibold tracking-[-0.03em] text-slate-900 sm:text-2xl">
                {name}
              </h2>
            </div>

            <button
              onClick={onViewAll}
              className="inline-flex w-fit rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-[var(--brand-blue)] transition hover:border-[var(--brand-blue)] hover:bg-[var(--brand-soft)]"
            >
              View all →
            </button>
          </div>

          <div className="group relative">
            <button
              onClick={() => scroll(-1)}
              className="absolute left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[var(--brand-blue)] shadow-[0_16px_30px_rgba(15,23,42,0.14)] transition hover:bg-[var(--brand-soft)] md:flex"
              aria-label="Scroll left"
            >
              ‹
            </button>

            <div
              ref={rowRef}
              className="flex gap-4 overflow-x-auto no-scrollbar pb-2"
            >
              {loading
                ? Array.from({ length: limit }).map((_, i) => <SkeletonCard key={i} />)
                : items.map((product) => (
                    <div key={product._id} className="w-[230px] flex-shrink-0">
                      <ProductCard product={product} />
                    </div>
                  ))}
            </div>

            <button
              onClick={() => scroll(1)}
              className="absolute right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[var(--brand-blue)] shadow-[0_16px_30px_rgba(15,23,42,0.14)] transition hover:bg-[var(--brand-soft)] md:flex"
              aria-label="Scroll right"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/products");
        setProducts(res.data);
      } catch {
        // products failed to load; setLoading(false) will still run
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categoryOrder = [
    {
      name: "iPhone",
      limit: 8,
      blurb: "Premium Apple devices surfaced with clean pricing, ratings, and quick path navigation.",
      accentClass: "from-[#2874f0] via-[#1f63d3] to-[#153e87]",
    },
    {
      name: "Android",
      limit: 8,
      blurb: "Comparison-friendly cards for value phones, everyday upgrades, and camera-first picks.",
      accentClass: "from-[#0f766e] via-[#0f9d8d] to-[#53c0ad]",
    },
    {
      name: "Laptop",
      limit: 8,
      blurb: "A stronger electronics shelf with room for premium notebooks and work-from-home gear.",
      accentClass: "from-[#172337] via-[#203a5f] to-[#315893]",
    },
    {
      name: "Home",
      limit: 8,
      blurb: "Daily living, decor, and useful home picks grouped in a warm, easy-to-scan retail block.",
      accentClass: "from-[#f59e0b] via-[#fbbf24] to-[#fde68a]",
    },
    {
      name: "Pants",
      limit: 8,
      blurb: "Fashion essentials styled like a seasonal offer zone with fast product discovery.",
      accentClass: "from-[#7c3aed] via-[#8b5cf6] to-[#c4b5fd]",
    },
    {
      name: "Shirts",
      limit: 8,
      blurb: "Shirt collections displayed as merchandised shelves instead of generic card dumps.",
      accentClass: "from-[#ea580c] via-[#f97316] to-[#fdba74]",
    },
    {
      name: "Men Shirt",
      limit: 8,
      blurb: "Marketplace-style menswear rows with pricing clarity and fast visual scanning.",
      accentClass: "from-[#1d4ed8] via-[#2563eb] to-[#93c5fd]",
    },
    {
      name: "Shoes",
      limit: 8,
      blurb: "Footwear cards tuned for promotion-heavy browsing and quick product jumps.",
      accentClass: "from-[#0891b2] via-[#06b6d4] to-[#67e8f9]",
    },
    {
      name: "Tshirt",
      limit: 8,
      blurb: "Impulse-friendly casualwear shelves designed for wide product variety and repeat visits.",
      accentClass: "from-[#be185d] via-[#db2777] to-[#f9a8d4]",
    },
    {
      name: "Kitchen",
      limit: 8,
      blurb: "Kitchen essentials presented like a home deals carousel for dense everyday shopping.",
      accentClass: "from-[#15803d] via-[#16a34a] to-[#86efac]",
    },
    {
      name: "Beauty",
      limit: 8,
      blurb: "Beauty and care products grouped into a polished shelf with cleaner product emphasis.",
      accentClass: "from-[#c026d3] via-[#d946ef] to-[#f5d0fe]",
    },
  ];

  const getCategoryProducts = (categoryName, limit) =>
    products
      .filter((product) =>
        product.category.some((category) => category.toLowerCase() === categoryName.toLowerCase())
      )
      .slice(0, limit);

  return (
    <div className="space-y-6">
      {categoryOrder.map(({ name, limit, blurb, accentClass }) => {
        const items = getCategoryProducts(name, limit);
        if (!loading && items.length === 0) return null;

        return (
          <CategoryRow
            key={name}
            name={name}
            items={items}
            loading={loading}
            limit={limit}
            blurb={blurb}
            accentClass={accentClass}
            onViewAll={() => navigate(`/products?search=${encodeURIComponent(name)}`)}
          />
        );
      })}
    </div>
  );
};

export default ProductList;
