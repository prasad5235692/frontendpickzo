// src/components/ProductList.js
import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import ProductCard from "./ProductCard";
import "./ProductList.css";

const SkeletonCard = () => (
  <div className="border rounded-lg p-3 shadow bg-gray-100 animate-pulse">
    <div className="w-full h-40 bg-gray-300 rounded mb-3"></div>
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
  </div>
);

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/products");
        setProducts(res.data);
      } catch (err) {
        console.error("❌ Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categoryOrder = [
    { name: "iPhone", limit: 8 },
    { name: "Mobile", limit: 8 },
    { name: "Laptop", limit: 8 },
    { name: "Home", limit: 8 },
    { name: "Pants", limit: 8 },
    { name: "Shirts", limit: 8 },
    { name: "Men Shirt", limit: 8 },
    { name: "Shoes", limit: 8 },
    { name: "Tshirt", limit: 8 },
    { name: "Kitchen", limit: 8 },
    { name: "Beauty", limit: 8 },
  ];

  const getCategoryProducts = (categoryName, limit) => {
    return products
      .filter((p) =>
        p.category.some((c) => c.toLowerCase() === categoryName.toLowerCase())
      )
      .slice(0, limit);
  };

  return (
    <div className="my-8 px-2 bg-white py-6 rounded shadow space-y-10">
      {categoryOrder.map(({ name, limit }) => {
        const items = getCategoryProducts(name, limit);
        if (!loading && items.length === 0) return null; // skip empty categories

        return (
          <div key={name}>
            <h2 className="text-2xl font-bold mb-4">{name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {loading
                ? Array.from({ length: limit }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))
                : items.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductList;
