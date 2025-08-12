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
    <nav className="bg-blue-600 text-white fixed w-full top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 sm:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <div
          className="text-2xl font-bold cursor-pointer flex-shrink-0"
          onClick={() => navigate("/")}
        >
          PickZo
        </div>

        {/* Search bar */}
        {/* Search bar */}
<form
  onSubmit={handleSearch}
  className="flex flex-grow max-w-5xl mx-4 min-w-0"  // increased max-w to 5xl (~80rem)
>
  <input
    type="text"
    placeholder="Search for products, brands and more"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full rounded-l-md px-3 py-2 text-black focus:outline-none min-w-0"
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
        <div className="hidden md:flex items-center space-x-6 flex-shrink-0">
          {username ? (
            <>
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center space-x-2 hover:text-yellow-300"
              >
                <FaUser />
                <span>{username}</span>
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
                className="relative hover:text-yellow-300 flex items-center space-x-1"
                aria-label="Cart"
              >
                <FaShoppingCart />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-xs px-1 rounded-full font-bold">
                    {cartCount}
                  </span>
                )}
                <span>Cart</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="flex items-center space-x-2 hover:text-yellow-300"
            >
              <FaUser />
              <span>Login</span>
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white text-xl focus:outline-none flex-shrink-0"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-blue-700 px-4 py-4 space-y-3 shadow-lg">
          {username ? (
            <>
              <button
                onClick={() => {
                  navigate("/profile");
                  setMenuOpen(false);
                }}
                className="flex items-center space-x-2 hover:text-yellow-300 w-full text-left"
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
                className="relative hover:text-yellow-300 flex items-center space-x-2 w-full text-left"
              >
                <FaShoppingCart />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="absolute top-1 right-4 bg-red-500 text-xs px-1 rounded-full font-bold">
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
              className="flex items-center space-x-2 hover:text-yellow-300 w-full text-left"
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
