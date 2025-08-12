import React, { useState, useEffect } from "react";
import { FaShoppingCart, FaUser, FaSearch, FaBars, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  // Fetch user and cart count on mount
  useEffect(() => {
    const user = localStorage.getItem("username");
    setUsername(user);
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartCount(cart.length);
  }, []);

  // Update cart count if cart changes elsewhere (optional)
  useEffect(() => {
    function onStorageChange() {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartCount(cart.length);
    }
    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    localStorage.removeItem("cart"); // Optional: clear cart on logout
    setUsername(null);
    setCartCount(0);
    setMenuOpen(false); // close mobile menu on logout
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (trimmed) {
      navigate(`/products?search=${encodeURIComponent(trimmed)}`);
      setMenuOpen(false);
    }
  };

  return (
    <nav className="bg-blue-600 text-white fixed w-full top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 sm:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <div
          className="text-2xl font-extrabold cursor-pointer flex-shrink-0 select-none hover:text-yellow-400 transition"
          onClick={() => {
            navigate("/");
            setMenuOpen(false);
          }}
        >
          PickZo
        </div>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="flex flex-grow max-w-xl mx-4 min-w-0"
          role="search"
          aria-label="Product search"
        >
          <input
            type="text"
            placeholder="Search for products, brands and more"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-l-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 min-w-0"
          />
          <button
            type="submit"
            className="bg-yellow-400 px-4 rounded-r-md flex items-center justify-center hover:bg-yellow-500 transition flex-shrink-0"
            aria-label="Search"
          >
            <FaSearch />
          </button>
        </form>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-8 flex-shrink-0">
          {username ? (
            <>
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center space-x-2 hover:text-yellow-300 transition font-medium focus:outline-none"
                aria-label="User profile"
                title={`Logged in as ${username}`}
              >
                <FaUser />
                <span className="truncate max-w-xs">{username}</span>
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold transition focus:outline-none"
                aria-label="Logout"
              >
                Logout
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
                className="relative hover:text-yellow-300 flex items-center space-x-1 transition font-medium focus:outline-none"
                aria-label="Cart"
              >
                <FaShoppingCart />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-xs px-1 rounded-full font-bold select-none">
                    {cartCount}
                  </span>
                )}
                <span>Cart</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="flex items-center space-x-2 hover:text-yellow-300 transition font-medium focus:outline-none"
              aria-label="Login"
            >
              <FaUser />
              <span>Login</span>
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white text-2xl focus:outline-none flex-shrink-0"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-blue-700 px-6 py-5 space-y-4 shadow-lg">
          {username ? (
            <>
              <button
                onClick={() => {
                  navigate("/profile");
                  setMenuOpen(false);
                }}
                className="flex items-center space-x-3 hover:text-yellow-300 w-full text-left font-medium focus:outline-none"
              >
                <FaUser />
                <span className="truncate max-w-xs">{username}</span>
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold w-full text-left transition focus:outline-none"
              >
                Logout
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
                className="relative hover:text-yellow-300 flex items-center space-x-3 w-full text-left font-medium transition focus:outline-none"
              >
                <FaShoppingCart />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="absolute top-1 right-5 bg-red-500 text-xs px-1 rounded-full font-bold select-none">
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
              className="flex items-center space-x-3 hover:text-yellow-300 w-full text-left font-medium focus:outline-none"
            >
              <FaUser />
              <span>Login</span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
