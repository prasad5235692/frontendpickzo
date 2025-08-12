import React, { useState, useEffect, useRef } from "react";
import {
  FaShoppingCart,
  FaUser,
  FaSearch,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef();

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartCount(cart.length);
  }, []);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userDropdownOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setMenuOpen(false);
      setUserDropdownOpen(false);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-500 to-blue-700 text-white fixed w-full top-0 z-50 shadow-lg">
      <div className="container mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="text-3xl font-extrabold cursor-pointer select-none tracking-wide"
          aria-label="Homepage"
        >
          PickZo
        </div>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="flex flex-grow max-w-2xl mx-6 min-w-0"
          role="search"
        >
          <input
            type="search"
            placeholder="Search products, brands and more"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow rounded-l-md px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-sm"
          />
          <button
            type="submit"
            aria-label="Search"
            className="bg-yellow-400 hover:bg-yellow-500 px-5 rounded-r-md flex items-center justify-center transition-shadow shadow-md"
          >
            <FaSearch className="text-gray-900" />
          </button>
        </form>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8 relative select-none">
          {username ? (
            <>
              {/* User Dropdown */}
              <div
                className="relative"
                ref={userDropdownRef}
                tabIndex={0}
                onBlur={() => setUserDropdownOpen(false)}
              >
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 hover:text-yellow-300 transition font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"
                  aria-haspopup="true"
                  aria-expanded={userDropdownOpen}
                >
                  <FaUser size={20} />
                  <span className="max-w-[120px] truncate">{username}</span>
                  <svg
                    className={`w-4 h-4 ml-1 transition-transform duration-300 ${
                      userDropdownOpen ? "rotate-180" : "rotate-0"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-900 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-2 z-50">
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setUserDropdownOpen(false);
                      }}
                      className="block px-4 py-2 hover:bg-yellow-400 hover:text-white w-full text-left"
                    >
                      Profile
                    </button>

                    <button
                      onClick={() => {
                        const userId = localStorage.getItem("userId");
                        if (userId) navigate("/cart");
                        else {
                          alert("Please login first!");
                          navigate("/login");
                        }
                        setUserDropdownOpen(false);
                      }}
                      className="block px-4 py-2 hover:bg-yellow-400 hover:text-white w-full text-left"
                    >
                      Cart {cartCount > 0 && `(${cartCount})`}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="flex items-center space-x-2 hover:text-yellow-300 font-semibold transition"
            >
              <FaUser size={20} />
              <span>Login</span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden focus:outline-none"
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <FaTimes size={28} />
          ) : (
            <FaBars size={28} />
          )}
        </button>
      </div>

      {/* Mobile Fullscreen Menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-blue-800 bg-opacity-95 backdrop-blur-sm z-40 flex flex-col items-center justify-center space-y-8 text-white text-xl font-semibold"
          role="dialog"
          aria-modal="true"
        >
          {username ? (
            <>
              <button
                onClick={() => {
                  navigate("/profile");
                  setMenuOpen(false);
                }}
                className="flex items-center space-x-3 hover:text-yellow-400 transition"
              >
                <FaUser size={24} />
                <span>{username}</span>
              </button>

              <button
                onClick={() => {
                  const userId = localStorage.getItem("userId");
                  if (userId) {
                    navigate("/cart");
                  } else {
                    alert("Please login first!");
                    navigate("/login");
                  }
                  setMenuOpen(false);
                }}
                className="flex items-center space-x-3 hover:text-yellow-400 transition relative"
              >
                <FaShoppingCart size={24} />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-4 bg-red-600 text-xs px-2 rounded-full font-bold select-none">
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
              className="flex items-center space-x-3 hover:text-yellow-400 transition"
            >
              <FaUser size={24} />
              <span>Login</span>
            </button>
          )}

          {/* Search bar inside mobile menu for easier access */}
          <form
            onSubmit={handleSearch}
            className="w-full px-10"
            role="search"
          >
            <input
              type="search"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-md"
            />
          </form>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
