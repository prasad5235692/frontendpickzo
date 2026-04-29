import React from 'react';
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Components
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ProductDetail from './components/ProductDetail';
import ScrollToTop from './components/ScrollToTop';


// Pages
import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UserProfile from './pages/UserProfile';


// Category Pages
import OrdersPage from './pages/OrdersPage';
import BuyNowPage from './pages/BuyNowPage';
import ImageUploadPage from './pages/ImageUploadPage';
import OrderSuccess from './pages/OrderSuccess';




const App = () => {
  const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '');

  return (
    <Router basename={routerBasename || undefined}>
      <div className="store-shell min-h-screen flex flex-col bg-[var(--page-bg)] text-slate-900">
        <ScrollToTop />
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/products" element={<ProductPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/cart" element={<CartPage />} />

            {/* Category Pages */}
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/buy-now" element={<BuyNowPage />} />
            <Route path="/upload-image" element={<ImageUploadPage />} />
            <Route path="/order-success" element={<OrderSuccess />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
