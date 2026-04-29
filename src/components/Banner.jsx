import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import localBanner from "../assets/banner (4).png";
import app from "../assets/banner (3).png";
import app1 from "../assets/banner (1).png";
import app2 from "../assets/banner (5).png";

const banners = [
  {
    id: 1,
    img: localBanner,
    alt: "Big Sale",

  },
  {
    id: 2,
    img: app,
    alt: "Discount Offers",

  },
  {
    id: 3,
    img: app1,
    alt: "Festive Deals",

  },
  {
    id: 4,
    img: app2,
    alt: "Special Offers",
  },
];

const Banner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  const activeBanner = banners[currentIndex];

  return (
    <div className="section-card relative w-full overflow-hidden select-none rounded-[32px]">
      <div
        className="flex min-h-[340px] transition-transform duration-700 ease-in-out sm:min-h-[420px]"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="relative h-full min-h-[340px] w-full flex-shrink-0 sm:min-h-[420px]">
            <img
              src={banner.img}
              alt={banner.alt}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.84)_0%,rgba(15,23,42,0.52)_34%,rgba(15,23,42,0.08)_72%,rgba(15,23,42,0.12)_100%)]" />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-3">
            <div className="inline-flex w-fit rounded-[22px] bg-white/12 px-4 py-3 text-sm font-semibold text-white backdrop-blur-sm">
              {activeBanner.metric}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate(`/products?search=${encodeURIComponent(activeBanner.search)}`)}
                className="inline-flex items-center justify-center rounded-full bg-[var(--brand-search)] px-5 py-3 text-sm font-bold text-[var(--brand-blue)] transition hover:bg-[#ffdb4d]"
              >
                Shop now
              </button>
              <button
                onClick={() => navigate('/products')}
                className="inline-flex items-center justify-center rounded-full border border-white/28 bg-white/8 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/16"
              >
                Browse all aisles
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start rounded-full bg-white/10 px-3 py-2 backdrop-blur-sm sm:self-auto">
            <button
              onClick={prevSlide}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[var(--brand-blue)] transition hover:bg-white"
              aria-label="Previous Slide"
            >
              &#10094;
            </button>
            <div className="flex gap-1.5">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex ? 'w-8 bg-[var(--brand-search)]' : 'w-2 bg-white/70'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            <button
              onClick={nextSlide}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[var(--brand-blue)] transition hover:bg-white"
              aria-label="Next Slide"
            >
              &#10095;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
