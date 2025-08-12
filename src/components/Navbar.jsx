import React, { useState, useEffect } from "react";
import { FaShoppingCart, FaUser, FaSearch, FaBars, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartCount(cart.length);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setMenuOpen(false);
    }
  };

  return (
    <nav className="bg-white fixed top-0 left-0 w-full shadow-md z-50">
      <div className="container mx-auto px-5 md:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="text-gray-800 font-serif font-bold text-3xl cursor-pointer select-none"
          aria-label="Homepage"
        >
          PickZo
        </div>

        {/* Search form */}
        <form
          onSubmit={handleSearch}
          className="flex flex-grow max-w-xl mx-6 relative"
          role="search"
        >
          <input
            type="text"
            placeholder="Search products, brands, and more..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-l-md py-2 px-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            type="submit"
            aria-label="Search"
            className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700 transition"
          >
            <FaSearch />
          </button>
        </form>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-8">
          {username ? (
            <>
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition font-medium"
                title="Profile"
              >
                <FaUser />
                <span className="max-w-xs truncate">{username}</span>
              </button>

              <button
                onClick={() => {
                  const userId = localStorage.getItem("userId");
                  if (userId) navigate("/cart");
                  else {
                    alert("Please login first!");
                    navigate("/login");
                  }
                }}
                className="relative flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition font-medium"
                aria-label="Cart"
              >
                <FaShoppingCart />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-600 text-xs font-bold rounded-full px-1 select-none">
                    {cartCount}
                  </span>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition font-medium"
            >
              <FaUser />
              <span>Login</span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-gray-700 text-2xl focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-inner">
          <form
            onSubmit={handleSearch}
            className="flex mx-4 my-3"
            role="search"
          >
            <input
              type="text"
              placeholder="Search products, brands, and more..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow border border-gray-300 rounded-l-md py-2 px-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              aria-label="Search"
              className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700 transition"
            >
              <FaSearch />
            </button>
          </form>

          <div className="flex flex-col space-y-3 px-5 py-4">
            {username ? (
              <>
                <button
                  onClick={() => {
                    navigate("/profile");
                    setMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition font-medium"
                >
                  <FaUser />
                  <span className="truncate">{username}</span>
                </button>

                <button
                  onClick={() => {
                    const userId = localStorage.getItem("userId");
                    if (userId) {
                      navigate("/cart");
                      setMenuOpen(false);
                    } else {
                      alert("Please login first!");
                      navigate("/login");
                      setMenuOpen(false);
                    }
                  }}
                  className="relative flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition font-medium"
                >
                  <FaShoppingCart />
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-600 text-xs font-bold rounded-full px-1 select-none">
                      {cartCount}
                    </span>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  navigate("/login");
                  setMenuOpen(false);
                }}
                className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition font-medium"
              >
                <FaUser />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
