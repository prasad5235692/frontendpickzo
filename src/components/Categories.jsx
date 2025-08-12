import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import iphone from "../assets/iphone 16.jpg";
import fos from "../assets/fos.webp";
import laptop from "../assets/Laptop.webp";
import download from "../assets/download.jpg";
import is from "../assets/is.jpg";
import image from "../assets/images.jpg";

// Category data
const categories = [
  { id: 1, name: "Mobiles", image: iphone },
  { id: 2, name: "Fashion", image: fos },
  { id: 3, name: "Electronics", image: laptop },
  { id: 4, name: "Home", image: download },
  { id: 5, name: "Grocery", image: is },
  { id: 6, name: "Beauty", image: image },
];

const Categories = () => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let scrollInterval;

    const startAutoScroll = () => {
      scrollInterval = setInterval(() => {
        if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
          container.scrollLeft = 0; // Reset scroll to start
        } else {
          container.scrollLeft += 1;
        }
      }, 20); // Adjust speed here (lower = faster)
    };

    startAutoScroll();

    return () => clearInterval(scrollInterval);
  }, []);

  const handleCategoryClick = (categoryName) => {
    navigate(`/category/${categoryName.toLowerCase()}`);
  };

  return (
    <div className="my-8 px-4">
      <h2 className="text-2xl font-bold mb-4">Top Categories</h2>
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto no-scrollbar whitespace-nowrap"
      >
        {[...categories, ...categories].map((category, idx) => (
          <div
            key={idx}
            onClick={() => handleCategoryClick(category.name)}
            className="flex-shrink-0 w-40 inline-block text-center p-4 bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer"
          >
            <img
              src={category.image}
              alt={category.name}
              className="w-16 h-16 mb-2 mx-auto"
            />
            <p className="text-sm font-medium">{category.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
  