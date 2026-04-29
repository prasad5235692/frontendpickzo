import React, { useState, useEffect } from "react";
import {
  FaShoppingCart,
  FaUser,
  FaSearch,
  FaBars,
  FaTimes,
  FaBoxOpen,
  FaBolt,
  FaHeadset,
  FaGift,
  FaStore,
} from "react-icons/fa";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";

const CATEGORY_LINKS = [
  { label: "Mobiles",    search: "mobiles" },
  { label: "Laptops",    search: "laptops" },
  { label: "Fashion",    search: "fashion" },
  { label: "Beauty",     search: "beauty" },
  { label: "Kitchen",    search: "kitchen" },
  { label: "Home",       search: "home" },
  { label: "Electronics",search: "electronics" },
];

const QUICK_LINKS = [
  { label: "Top Offers", icon: FaBolt },
  { label: "Seller Zone", icon: FaStore },
  { label: "Gift Cards", icon: FaGift },
  { label: "Customer Care", icon: FaHeadset },
];

const desktopLinkClass = ({ isActive }) =>
  `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-white text-[var(--brand-blue)] shadow-[0_10px_20px_rgba(255,255,255,0.18)]"
      : "text-white/88 hover:bg-white/12 hover:text-white"
  }`;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setUsername(localStorage.getItem("username"));
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setMenuOpen(false);
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/80 shadow-[0_14px_36px_rgba(15,23,42,0.12)]">
      <div className="bg-[var(--brand-blue)] text-white">
        <nav className="mx-auto flex max-w-[1580px] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex shrink-0 flex-col leading-none text-white transition hover:opacity-90"
          >
            <span className="font-display text-[1.75rem] font-extrabold tracking-[-0.04em]">PickZo</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/72">
              Smart shopping lane
            </span>
          </Link>

          <form
            onSubmit={handleSearch}
            className="hidden min-w-0 flex-1 items-center lg:flex"
          >
            <div className="relative flex w-full overflow-hidden rounded-xl border border-white/18 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.16)]">
              <input
                type="text"
                placeholder="Search for phones, fashion, appliances and more"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="min-w-0 flex-1 border-0 bg-transparent px-5 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Search"
                className="flex items-center justify-center bg-[var(--brand-search)] px-5 text-[var(--brand-blue)] transition hover:bg-[#ffdb4d]"
              >
                <FaSearch size={17} />
              </button>
            </div>
          </form>

          <div className="hidden items-center gap-2 lg:flex">
            {username ? (
              <>
                <NavLink to="/profile" className={desktopLinkClass}>
                  <FaUser size={14} />
                  <span className="max-w-[120px] truncate">{username}</span>
                </NavLink>
                <NavLink to="/orders" className={desktopLinkClass}>
                  <FaBoxOpen size={14} />
                  Orders
                </NavLink>
                <NavLink to="/cart" className={desktopLinkClass}>
                  <FaShoppingCart size={14} />
                  Cart
                </NavLink>
              </>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[var(--brand-blue)] transition hover:bg-[var(--brand-search)]"
              >
                <FaUser size={14} />
                Login
              </button>
            )}
          </div>

          <button
            className="ml-auto text-xl text-white focus:outline-none lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </nav>
      </div>

      <div className="border-t border-white/10 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1580px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="hidden min-w-0 items-center gap-2 overflow-x-auto no-scrollbar md:flex">
            {CATEGORY_LINKS.map((category) => (
              <button
                key={category.label}
                onClick={() => navigate(`/products?search=${category.search}`)}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[var(--brand-blue)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-blue)]"
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="hidden items-center gap-3 text-xs font-semibold text-slate-500 lg:flex">
            {QUICK_LINKS.map(({ label, icon: Icon }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-slate-600"
              >
                <Icon size={12} className="text-[var(--brand-blue)]" />
                {label}
              </span>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex min-w-0 flex-1 items-center gap-2 lg:hidden">
            <div className="relative flex min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <input
                type="text"
                placeholder="Search products"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="min-w-0 flex-1 border-0 bg-transparent px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Search"
                className="flex items-center justify-center px-4 text-[var(--brand-blue)]"
              >
                <FaSearch size={15} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 bg-[var(--brand-blue-dark)] px-5 py-5 text-sm font-semibold text-white shadow-2xl lg:hidden">
          <div className="space-y-3">
            {username ? (
              <>
                <button
                  onClick={() => {
                    navigate("/profile");
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-2xl bg-white/10 px-4 py-3 transition hover:bg-white/16"
                >
                  <span className="flex items-center gap-3">
                    <FaUser />
                    <span className="truncate">{username}</span>
                  </span>
                  Account
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      navigate("/orders");
                      setMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 transition hover:bg-white/16"
                  >
                    <FaBoxOpen /> Orders
                  </button>
                  <button
                    onClick={() => {
                      navigate("/cart");
                      setMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 transition hover:bg-white/16"
                  >
                    <FaShoppingCart /> Cart
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => {
                  navigate("/login");
                  setMenuOpen(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 font-bold text-[var(--brand-blue)] transition hover:bg-[var(--brand-search)]"
              >
                <FaUser />
                Login
              </button>
            )}

            <div className="rounded-[28px] bg-white px-4 py-4 text-slate-700">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
                Shop by category
              </p>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORY_LINKS.map((category) => (
                  <button
                    key={category.label}
                    onClick={() => {
                      navigate(`/products?search=${category.search}`);
                      setMenuOpen(false);
                    }}
                    className="rounded-2xl border border-slate-200 px-3 py-3 text-left text-sm font-semibold transition hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)]"
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-white/88">
              {QUICK_LINKS.map(({ label, icon: Icon }) => (
                <div key={label} className="rounded-2xl bg-white/10 px-4 py-3">
                  <div className="mb-2 inline-flex rounded-full bg-white/12 p-2 text-[var(--brand-search)]">
                    <Icon size={12} />
                  </div>
                  <p>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
