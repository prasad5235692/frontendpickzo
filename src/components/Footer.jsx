import React from 'react';
import { Link } from 'react-router-dom';

const footerSections = [
  {
    title: 'About',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Products', to: '/products' },
      { label: 'Profile', to: '/profile' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Orders', to: '/orders' },
      { label: 'Cart', to: '/cart' },
      { label: 'Login', to: '/login' },
    ],
  },
];

const policyLinks = ['Returns Policy', 'Terms of Use', 'Security', 'Sitemap'];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-[var(--brand-blue)] text-white">
      <div className="mx-auto max-w-[1580px] px-4 pb-5 pt-10 sm:px-6 lg:px-8">
          <div className="mb-8 grid gap-4 rounded-[30px] bg-[linear-gradient(135deg,#1650b8_0%,#0f3082_55%,#0a2060_100%)] px-6 py-6 shadow-[0_20px_50px_rgba(15,23,42,0.32)] md:grid-cols-[1.5fr_auto] md:items-center md:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.26em] text-white/66">PickZo marketplace</p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-[-0.03em] text-white sm:text-3xl">
              Bigger deals, quicker checkout, cleaner browsing.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/78">
              Built with the familiar high-volume marketplace feel: strong blue branding, light content cards, and fast paths to orders, profile, and cart.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center justify-center rounded-full bg-[var(--brand-search)] px-6 py-3 text-sm font-bold text-[var(--brand-blue)] transition hover:bg-[#ffdb4d]"
          >
            Explore Products
          </Link>
        </div>

        <div className="grid gap-8 border-b border-white/10 pb-8 md:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
          <div>
            <Link to="/" className="font-display text-3xl font-extrabold tracking-[-0.04em] text-white">
              PickZo
            </Link>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/80">
              A storefront for electronics, fashion, home, and daily-use shopping with a retail layout inspired by large Indian marketplaces.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs font-semibold text-white/80 sm:max-w-sm">
              <div className="rounded-2xl bg-white/5 px-4 py-3">
                <p className="text-white">24 x 7</p>
                <p className="mt-1 text-white/60">Customer care</p>
              </div>
              <div className="rounded-2xl bg-white/5 px-4 py-3">
                <p className="text-white">Easy</p>
                <p className="mt-1 text-white/60">Returns and tracking</p>
              </div>
            </div>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h2 className="text-xs font-bold uppercase tracking-[0.26em] text-white/55">
                {section.title}
              </h2>
              <div className="mt-4 flex flex-col gap-3 text-sm text-white/82">
                {section.links.map((link) => (
                  <Link key={link.label} to={link.to} className="transition hover:text-white">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.26em] text-white/55">
              Reach Us
            </h2>
            <div className="mt-4 space-y-3 text-sm text-white/82">
              <p>Need help with payments, delivery, or account updates?</p>
              <a href="mailto:support@pickzo.com" className="block transition hover:text-white">
                support@pickzo.com
              </a>
              <p>Mon - Sat, 9:00 AM - 7:00 PM</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-5 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <p>© {currentYear} PickZo. All rights reserved.</p>
            {policyLinks.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          <p>Marketplace UI refresh with a Flipkart-inspired browsing rhythm.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;