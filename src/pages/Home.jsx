import React from 'react';
import Banner from '../components/Banner';
import ProductList from '../components/ProductList';

const Home = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="pt-16">
        {/* Banner is already responsive */}
        <Banner />
      </div>

      {/* Product section with responsive padding and spacing */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-3 sm:py-6 lg:py-10">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">
          Featured Products
        </h2>
        <ProductList />
      </div>
    </div>
  );
};

export default Home;
