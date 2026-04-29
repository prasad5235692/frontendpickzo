import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBolt, FaHeadset, FaLock, FaTags } from 'react-icons/fa';
import Banner from '../components/Banner';
import Categories from '../components/Categories';
import ProductList from '../components/ProductList';

const quickBenefits = [
  {
    title: 'Flash deals live',
    description: 'New markdowns across phones, fashion, and home upgrades every day.',
    icon: FaBolt,
  },
  {
    title: 'Trusted payments',
    description: 'Secure checkout with COD, UPI, cards, and saved delivery details.',
    icon: FaLock,
  },
  {
    title: 'Deal-first pricing',
    description: 'Easy discount visibility with curated offers and featured picks.',
    icon: FaTags,
  },
  {
    title: 'Always-on support',
    description: 'Track orders, reorder essentials, and resolve issues without friction.',
    icon: FaHeadset,
  },
];

const sideHighlights = [
  {
    title: 'Mega Electronics Days',
    description: 'Phones, wearables, and laptops lined up in a single fast-scrolling aisle.',
    accent: 'from-[#fff2c4] via-[#ffe180] to-[#ffcd38]',
    textColor: 'text-slate-900',
  },
  {
    title: 'Cart-ready Home Picks',
    description: 'Browse appliances, decor, and kitchen essentials with clear pricing cues.',
    accent: 'from-[#e8f1ff] via-[#d8e7ff] to-[#c0d7ff]',
    textColor: 'text-slate-900',
  },
  {
    title: 'Fashion Window',
    description: 'Seasonal wardrobe picks with quick links into shirts, shoes, and daily wear.',
    accent: 'from-[#172337] via-[#203a5f] to-[#325794]',
    textColor: 'text-white',
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-12 pt-[186px] sm:pt-[144px]">
      <div className="page-shell space-y-6">
        <div className="grid gap-6">
          <div className="space-y-6">
            <Banner />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {quickBenefits.map(({ title, description, icon: Icon }) => (
                <div key={title} className="section-card p-5">
                  <div className="mb-4 inline-flex rounded-2xl bg-[var(--brand-soft)] p-3 text-[var(--brand-blue)]">
                    <Icon size={18} />
                  </div>
                  <h2 className="font-display text-lg font-semibold text-slate-900">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
                </div>
              ))}
            </div>
          </div>

          
        </div>

        <Categories />

        <div className="section-card overflow-hidden p-4 sm:p-6">
          <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="heading-kicker">Featured shelves</p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em] text-slate-900 sm:text-3xl">
                Category-first browsing with retail-style deal sections.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">
                The home flow now mirrors a large online marketplace: high-visibility hero space, quick category access, and horizontal shelves that keep discovery moving.
              </p>
            </div>

            <button
              onClick={() => navigate('/products')}
              className="inline-flex h-fit items-center justify-center rounded-full bg-[var(--brand-blue)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--brand-blue-dark)]"
            >
              Browse all products
            </button>
          </div>

          <ProductList />
        </div>
      </div>
    </div>
  );
};

export default Home;
