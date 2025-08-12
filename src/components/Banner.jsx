import React, { useState, useEffect } from "react";
import localBanner from "../assets/banner (4).png";
import app from "../assets/banner (3).png";
import app1 from "../assets/banner (1).png";
import app2 from "../assets/banner (5).png";

const banners = [
  { id: 1, img: localBanner, alt: "Big Sale" },
  { id: 2, img: app, alt: "Discount Offers" },
  { id: 3, img: app1, alt: "Festive Deals" },
  { id: 4, img: app2, alt: "Special Offers" },
];

const Banner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full max-w-full overflow-hidden select-none">
      <div
        className="flex transition-transform duration-700 ease-in-out"
  style={{ transform: `translateX(-${currentIndex * 100}%)` }}
>
  {banners.map((banner) => (
    <img
      key={banner.id}
      src={banner.img}
      alt={banner.alt}
      className="w-full flex-shrink-1 h-auto sm :h-[55vh] object-cover"
    />
  ))}


      </div>

      {/* Arrows */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-3 transform -translate-y-1/2 bg-black bg-opacity-40 text-white p-2 rounded-full hover:bg-opacity-70 transition"
        aria-label="Previous Slide"
      >
        &#10094;
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-3 transform -translate-y-1/2 bg-black bg-opacity-40 text-white p-2 rounded-full hover:bg-opacity-70 transition"
        aria-label="Next Slide"
      >
        &#10095;
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-3 h-3 rounded-full ${
              idx === currentIndex ? "bg-yellow-400" : "bg-gray-300"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;
