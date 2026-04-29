import React from "react";
import { useNavigate } from "react-router-dom";
import iphone from "../assets/iphone 16.jpg";
import fos from "../assets/fos.webp";
import laptop from "../assets/Laptop.webp";
import download from "../assets/download.jpg";
import is from "../assets/is.jpg";
import image from "../assets/images.jpg";

const categories = [
  { id: 1, name: "Mobiles", image: iphone, search: "mobiles", note: "5G picks" },
  { id: 2, name: "Fashion", image: fos, search: "fashion", note: "Daily wear" },
  { id: 3, name: "Electronics", image: laptop, search: "electronics", note: "Trending tech" },
  { id: 4, name: "Home", image: download, search: "home", note: "Smart living" },
  { id: 5, name: "Grocery", image: is, search: "grocery", note: "Everyday needs" },
  { id: 6, name: "Beauty", image: image, search: "beauty", note: "Personal care" },
];

const Categories = () => {
  const navigate = useNavigate();

  return (
    <div className="section-card overflow-hidden p-4 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-100 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="heading-kicker">Category shortcuts</p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em] text-slate-900">
            Jump into the most visited shopping aisles.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            The quick-entry strip mirrors a marketplace homepage: bold imagery, short labels, and direct routing into category search results.
          </p>
        </div>

        <button
          onClick={() => navigate('/products')}
          className="inline-flex h-fit rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)]"
        >
          Open all categories
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => navigate(`/products?search=${cat.search}`)}
            className="group rounded-[26px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:border-[var(--brand-blue)] hover:shadow-[0_22px_44px_rgba(37,99,235,0.14)]"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-[var(--brand-soft)] ring-1 ring-slate-100 transition group-hover:ring-[var(--brand-blue)]/20">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 shadow-sm">
                {cat.note}
              </span>
            </div>

            <span className="font-display text-lg font-semibold text-slate-900 transition group-hover:text-[var(--brand-blue)]">
              {cat.name}
            </span>
            <span className="mt-2 block text-sm leading-6 text-slate-500">
              Browse curated {cat.name.toLowerCase()} deals with faster discovery cards.
            </span>
            <span className="mt-4 inline-flex text-sm font-bold text-[var(--brand-blue)]">
              Shop now →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Categories;