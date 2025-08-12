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
    <nav className="bg-blue-900 fixed top-0 left-0 w-full z-50 shadow-lg">
      <div className="container mx-auto px-5 md:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="text-yellow-400 font-serif font-extrabold text-3xl cursor-pointer select-none tracking-wide"
          aria-label="Homepage"
        >
          PickZo
        </div>

        {/* Search form - desktop */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-grow max-w-xl mx-6 relative"
          role="search"
        >
          <input
            type="text"
            placeholder="Search products, brands, and more..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-l-md py-2 px-4 text-blue-900 placeholder-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-yellow-400"
          />
          <button
            type="submit"
            aria-label="Search"
            className="bg-yellow-400 text-blue-900 px-5 rounded-r-md font-semibold hover:bg-yellow-300 transition"
          >
            <FaSearch />
          </button>
        </form>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-10 text-yellow-400 font-semibold">
          {username ? (
            <>
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center space-x-2 hover:text-yellow-300 transition"
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
                className="relative flex items-center space-x-2 hover:text-yellow-300 transition"
                aria-label="Cart"
              >
                <FaShoppingCart />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-4 bg-red-600 text-xs font-bold rounded-full px-1 select-none">
                    {cartCount}
                  </span>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="flex items-center space-x-2 hover:text-yellow-300 transition"
            >
              <FaUser />
              <span>Login</span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-yellow-400 text-3xl focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden fixed top-16 left-0 w-full bg-blue-900 border-t border-yellow-400 shadow-lg z-40">
          <form
            onSubmit={handleSearch}
            className="flex mx-4 my-4"
            role="search"
          >
            <input
              type="text"
              placeholder="Search products, brands, and more..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow rounded-l-md py-2 px-3 text-blue-900 placeholder-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-yellow-400"
            />
            <button
              type="submit"
              aria-label="Search"
              className="bg-yellow-400 text-blue-900 px-4 rounded-r-md font-semibold hover:bg-yellow-300 transition"
            >
              <FaSearch />
            </button>
          </form>

          <div className="flex flex-col space-y-3 px-6 pb-6 text-yellow-400 font-semibold">
            {username ? (
              <>
                <button
                  onClick={() => {
                    navigate("/profile");
                    setMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 hover:text-yellow-300 transition truncate"
                >
                  <FaUser />
                  <span>{username}</span>
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
                  className="relative flex items-center space-x-3 hover:text-yellow-300 transition"
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
                className="flex items-center space-x-3 hover:text-yellow-300 transition"
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
