function getBasePath() {
  return (import.meta.env.BASE_URL || '').replace(/\/$/, '');
}

export function getCurrentPath() {
  const pathname = window.location.pathname || '/';
  const basePath = getBasePath();

  if (basePath && pathname.startsWith(basePath)) {
    const trimmed = pathname.slice(basePath.length);
    return trimmed || '/';
  }

  return pathname;
}

export function getCurrentSearch() {
  return window.location.search;
}

function findAgent(agent) {
  return document.querySelector(`[data-agent="${agent}"]`);
}

function findAgentAll(agent) {
  return document.querySelectorAll(`[data-agent="${agent}"]`);
}

// -------- Product List Page (/products) --------
export function readProductListPage() {
  const agentCards = findAgentAll('product-card');
  const cards = agentCards.length > 0
    ? agentCards
    : document.querySelectorAll('a[href^="/product/"]');
  const products = [];

  cards.forEach((card, index) => {
    const href = card.getAttribute('href');
    const id = card.dataset.agentId || (href ? href.replace('/product/', '') : null);
    const titleEl = card.querySelector('[data-agent="product-card-title"]') || card.querySelector('h3');
    const pEls = card.querySelectorAll('p');
    const priceEl = card.querySelector('[data-agent="product-card-price"]') ||
                   card.querySelector('span.text-sm.font-bold.text-gray-900') ||
                   card.querySelector('p.font-display.text-xl.font-bold') ||
                   pEls[0];
    const ratingEl = card.querySelector('[data-agent="product-card-rating"]') ||
                     card.querySelector('span.inline-flex') ||
                     card.querySelector('[class*="rating"]');
    const imgEl = card.querySelector('[data-agent="product-card-image"]') || card.querySelector('img');
    const availabilityEl = card.querySelector('[data-agent="product-card-availability"]') ||
                           card.querySelector('[class*="stock"]') ||
                           card.querySelector('[class*="in-stock"]') ||
                           card.querySelector('[class*="out-of-stock"]');

    if (!id) return;

    products.push({
      index,
      id,
      title: card.dataset.agentTitle || titleEl?.textContent?.trim() || 'Unknown',
      price: card.dataset.agentPrice
        ? `₹${Number(card.dataset.agentPrice).toLocaleString('en-IN')}`
        : priceEl?.textContent?.trim() || '',
      rating: card.dataset.agentRating || ratingEl?.textContent?.trim() || '',
      image: imgEl?.getAttribute('src') || '',
      availability: card.dataset.agentAvailability || (availabilityEl
        ? availabilityEl.textContent.trim()
        : 'Available'),
    });
  });

  return {
    type: 'product_list',
    path: getCurrentPath(),
    search: getCurrentSearch(),
    count: products.length,
    products,
  };
}

// -------- Product Detail Page (/product/:id) --------
export function readProductDetailPage() {
  const path = getCurrentPath();
  const root = findAgent('product-detail-page');
  const id = root?.dataset.agentId || path.replace('/product/', '');
  const titleEl = findAgent('product-title') ||
                  document.querySelector('h1') ||
                  document.querySelector('h3.font-display.text-xl.font-semibold');
  const priceEl = findAgent('product-price') ||
                  document.querySelector('p.font-display.text-xl.font-bold') ||
                  document.querySelector('[class*="price"]') ||
                  document.querySelector('p.font-bold.text-gray-900');
  const ratingEl = findAgent('product-rating') ||
                   document.querySelector('span.inline-flex') ||
                   document.querySelector('[class*="rating"]');
  const imgEl = findAgent('product-image') ||
                document.querySelector('img.h-40') ||
                document.querySelector('img[alt*="product"]') ||
                document.querySelector('main img') ||
                document.querySelector('img[src*="http"]');
  const descEl = findAgent('product-description') ||
                 document.querySelector('p.text-gray-600') ||
                 document.querySelector('[class*="description"]');

  const hasAddToCart = !!findAgent('add-to-cart') ||
    Array.from(document.querySelectorAll('button')).some((btn) => btn.textContent.toUpperCase().includes('ADD TO CART'));
  const hasBuyNow = !!findAgent('buy-now') ||
    Array.from(document.querySelectorAll('button')).some((btn) => btn.textContent.toUpperCase().includes('BUY NOW'));

  const stockEl = findAgent('product-availability') ||
                  document.querySelector('[class*="stock"]') ||
                  document.querySelector('[class*="Stock"]') ||
                  document.querySelector('[class*="in-stock"]') ||
                  document.querySelector('[class*="out"]');

  return {
    type: 'product_detail',
    path,
    id,
    title: titleEl?.textContent?.trim() || 'Unknown',
    price: priceEl?.textContent?.trim() || '',
    rating: ratingEl?.textContent?.trim() || '',
    image: imgEl?.getAttribute('src') || '',
    description: descEl?.textContent?.trim() || '',
    hasAddToCartButton: hasAddToCart,
    hasBuyNowButton: hasBuyNow,
    inStock: root?.dataset.agentAvailability
      ? !root.dataset.agentAvailability.toLowerCase().includes('out of stock')
      : stockEl
        ? !stockEl.textContent.toLowerCase().includes('out of stock')
        : true,
  };
}

// -------- Cart Page (/cart) --------
export function readCartPage() {
  const items = [];

  const agentItems = findAgentAll('cart-item');
  const articleEls = agentItems.length > 0
    ? agentItems
    : document.querySelectorAll('article');

  articleEls.forEach((article) => {
    const titleEl = article.querySelector('[data-agent="cart-item-title"]') || article.querySelector('h3');
    const qtyEl = article.querySelector('[data-agent="cart-item-quantity"]') ||
                  article.querySelector('span.min-w-\\[8\\]') ||
                  article.querySelector('.min-w-8') ||
                  article.querySelector('span.text-center.text-sm.font-bold');
    const allPriceEls = article.querySelectorAll('p.font-display.text-xl.font-semibold');
    const imgEl = article.querySelector('img');

    let price = '';
    if (allPriceEls.length > 0) {
      price = allPriceEls[0].textContent.trim();
    }

    let qty = 1;
    if (qtyEl) {
      qty = parseInt(qtyEl.textContent.trim(), 10) || 1;
    }

    const hasRemove = !!article.querySelector('[data-agent="cart-remove"]') ||
      Array.from(article.querySelectorAll('button')).some((btn) => btn.textContent.toUpperCase().includes('REMOVE'));
    const hasBuyNow = !!article.querySelector('[data-agent="cart-buy-now"]') ||
      Array.from(article.querySelectorAll('button')).some((btn) => btn.textContent.toUpperCase().includes('BUY NOW'));

    const itemId = article.dataset.agentItemId ||
                   article.querySelector('button')?.getAttribute('onclick')?.match(/\w{24}/)?.[0] ||
                   article.getAttribute('data-item-id') ||
                   article.getAttribute('key') ||
                   '';

    items.push({
      id: itemId,
      title: article.dataset.agentTitle || titleEl?.textContent?.trim() || 'Unknown',
      price: article.dataset.agentPrice
        ? `₹${Number(article.dataset.agentPrice).toLocaleString('en-IN')}`
        : price,
      quantity: article.dataset.agentQuantity ? Number(article.dataset.agentQuantity) || qty : qty,
      image: imgEl?.getAttribute('src') || '',
      hasRemoveButton: hasRemove,
      hasBuyNowButton: hasBuyNow,
    });
  });

  const hasCheckout = !!findAgent('cart-checkout') ||
    Array.from(document.querySelectorAll('button')).some((btn) => btn.textContent.toUpperCase().includes('PROCEED TO CHECKOUT'));
  const hasContinue = !!findAgent('cart-continue-shopping') ||
    Array.from(document.querySelectorAll('button')).some((btn) => btn.textContent.toUpperCase().includes('CONTINUE SHOPPING'));

  const summaryTotal = findAgent('cart-total') ||
                       document.querySelector('[class*="Amount payable"] + p') ||
                       document.querySelector('p.font-display.text-3xl.font-semibold');

  return {
    type: 'cart',
    path: getCurrentPath(),
    items,
    itemCount: items.length,
    isEmpty: items.length === 0,
    totalAmount: summaryTotal?.textContent?.trim() || '',
    hasCheckoutButton: hasCheckout,
    hasContinueShoppingButton: hasContinue,
  };
}

// -------- Checkout Page (/buy-now) --------
export function readCheckoutPage() {
  const phoneInput = findAgent('checkout-phone-input') || document.querySelector('input[placeholder*="phone" i]');
  const addressTextarea = findAgent('checkout-address-input') || document.querySelector('textarea');
  const phoneDisplay = findAgent('checkout-phone-value') ||
                       document.querySelector('h3 ~ p.text-gray-700.text-sm') ||
                       document.querySelector('p.text-gray-700');
  const addressDisplay = findAgent('checkout-address-value') ||
                         document.querySelectorAll('p.text-gray-700.text-sm.leading-relaxed')?.[0] ||
                         document.querySelectorAll('p.text-gray-700.text-sm')[1];

  let phone = phoneDisplay?.textContent?.trim() || '';
  let address = addressDisplay?.textContent?.trim() || '';

  if (phoneInput) phone = phoneInput.value || phone;
  if (addressTextarea) address = addressTextarea.value || address;

  const paymentRadios = findAgentAll('checkout-payment-input').length > 0
    ? findAgentAll('checkout-payment-input')
    : document.querySelectorAll('input[type="radio"][name="payment"]');
  let selectedPayment = 'COD';
  paymentRadios.forEach((radio) => {
    if (radio.checked) selectedPayment = radio.value;
  });

  const paymentOptions = [];
  paymentRadios.forEach((r) => {
    const label = r.closest('label');
    const labelText = label?.querySelector('p.font-semibold')?.textContent?.trim() || r.value;
    paymentOptions.push({ value: r.value, label: labelText });
  });

  const placeOrderBtn = findAgent('checkout-place-order') ||
    Array.from(document.querySelectorAll('button')).find((btn) => btn.textContent.includes('Place Order'));

  const phoneSection = document.querySelector('h3')?.closest('div.bg-white');
  const editButtons = document.querySelectorAll('button');
  let canEditPhone = !!findAgent('checkout-phone-edit');
  let canEditAddress = !!findAgent('checkout-address-edit');

  // Check which sections have Edit buttons
  const sections = document.querySelectorAll('div.bg-white.rounded.shadow-sm');
  sections.forEach((section) => {
    const heading = section.querySelector('h3');
    const editBtn = Array.from(section.querySelectorAll('button'))
      .find((b) => b.textContent.includes('Edit'));
    if (heading && editBtn) {
      if (heading.textContent.toLowerCase().includes('phone')) canEditPhone = true;
      if (heading.textContent.toLowerCase().includes('address')) canEditAddress = true;
    }
  });

  const hasEditPhone = !!findAgent('checkout-phone-input') || !!document.querySelector('input[placeholder*="phone" i]');
  const hasEditAddress = !!findAgent('checkout-address-input') || !!document.querySelector('textarea');

  return {
    type: 'checkout',
    path: getCurrentPath(),
    phone: phone || null,
    address: address || null,
    hasPhone: !!phone && phone !== 'No phone number saved' && phone !== '',
    hasAddress: !!address && address !== 'No address saved' && address !== '',
    paymentMethod: selectedPayment,
    paymentOptions,
    canEditPhone: canEditPhone || hasEditPhone,
    canEditAddress: canEditAddress || hasEditAddress,
    isEditingPhone: hasEditPhone,
    isEditingAddress: hasEditAddress,
    hasPlaceOrderButton: !!placeOrderBtn,
  };
}

// -------- Orders Page (/orders) --------
export function readOrdersPage() {
  const orders = [];

  const agentOrderCards = findAgentAll('order-card');
  const orderCards = agentOrderCards.length > 0
    ? agentOrderCards
    : document.querySelectorAll('.section-card') || document.querySelectorAll('article');

  orderCards.forEach((card) => {
    if (card.getAttribute('data-agent') === 'order-card') {
      const items = Array.from(card.querySelectorAll('[data-agent="order-item"]')).map((row) => ({
        title: row.querySelector('[data-agent="order-item-title"]')?.textContent?.trim() || '',
        info: row.querySelector('p.mt-1.text-sm')?.textContent?.trim() || '',
      }));

      orders.push({
        id: card.dataset.agentOrderId || card.getAttribute('data-order-id') || '',
        shortId: card.querySelector('[data-agent="order-short-id"]')?.textContent?.trim() || '',
        status: card.querySelector('[data-agent="order-status"]')?.textContent?.trim() || card.dataset.agentStatus || '',
        date: card.querySelector('span.text-sm.text-slate-400')?.textContent?.trim() || '',
        total: card.querySelector('[data-agent="order-total"]')?.textContent?.trim() || '',
        items,
        itemCount: items.length,
        canCancel: !!card.querySelector('[data-agent="order-cancel"]'),
        canReorder: !!card.querySelector('[data-agent="order-reorder"]'),
      });
      return;
    }

    // Skip non-order cards (cart summary, etc.)
    if (!card.querySelector('[class*="order"]') && !card.querySelector('span.rounded-full.bg-slate-100') &&
        !card.querySelector('button')?.textContent.includes('Cancel') &&
        !card.querySelector('button')?.textContent.includes('Reorder')) {
      return;
    }

    const idBadge = card.querySelector('span.rounded-full.bg-slate-100') ||
                    card.querySelector('span.rounded-full.bg-white');
    const statusBadge = card.querySelector('span.rounded-full.border') ||
                        card.querySelector('span.rounded-full.bg-\\[var\\(--brand-soft\\)\\]') ||
                        card.querySelector('[class*="status"]');
    const dateEl = card.querySelector('span.text-sm.text-slate-400');
    const totalEl = card.querySelector('span.font-display.text-xl.font-semibold.text-slate-900') ||
                    card.querySelector('[class*="total"]');
    const items = [];

    const itemRows = card.querySelectorAll('div.rounded-\\[24px\\]') ||
                     card.querySelectorAll('div.rounded-2xl.bg-slate-50') ||
                     card.querySelectorAll('div.rounded-2xl.bg-white');
    itemRows.forEach((row) => {
      const titleEl = row.querySelector('p.line-clamp-1') ||
                      row.querySelector('p.font-semibold.text-slate-900');
      const qtyPriceEl = row.querySelector('p.mt-1.text-sm') ||
                         row.querySelector('p.text-slate-500');
      if (titleEl) {
        items.push({
          title: titleEl.textContent.trim(),
          info: qtyPriceEl?.textContent?.trim() || '',
        });
      }
    });

    const cancelBtn = Array.from(card.querySelectorAll('button'))
      .find((btn) => btn.textContent.includes('Cancel'));
    const reorderBtn = Array.from(card.querySelectorAll('button'))
      .find((btn) => btn.textContent.includes('Reorder'));

    const orderId = card.getAttribute('data-order-id') ||
                    card.querySelector('span.rounded-full.bg-white')?.textContent?.trim()?.replace('#', '') ||
                    '';

    orders.push({
      id: orderId,
      shortId: idBadge?.textContent?.trim() || orderId,
      status: statusBadge?.textContent?.trim() || '',
      date: dateEl?.textContent?.trim() || '',
      total: totalEl?.textContent?.trim() || '',
      items,
      itemCount: items.length,
      canCancel: !!cancelBtn,
      canReorder: !!reorderBtn,
    });
  });

  const hasConfirmationDialog = !!findAgent('order-confirmation') ||
                                !!document.querySelector('div.border.border-amber-200') ||
                                !!document.querySelector('[class*="confirmation"]');
  const confirmBtn = findAgent('order-confirm') || (hasConfirmationDialog
    ? Array.from(document.querySelectorAll('button'))
        .find((btn) => btn.textContent.includes('Confirm'))
    : null);

  return {
    type: 'orders',
    path: getCurrentPath(),
    orders,
    count: orders.length,
    hasConfirmationDialog,
    hasConfirmButton: !!confirmBtn,
  };
}

// -------- Order Success Page (/order-success) --------
export function readOrderSuccessPage() {
  const orderIdEl = document.querySelector('[class*="order"]') ||
                    document.querySelector('h2') ||
                    document.querySelector('[class*="order-id"]');
  const amountEl = document.querySelector('[class*="amount"]') ||
                   document.querySelector('[class*="price"]') ||
                   document.querySelector('[class*="total"]') ||
                   document.querySelector('p.font-semibold.text-slate-900');

  return {
    type: 'order_success',
    path: getCurrentPath(),
    orderId: orderIdEl?.textContent?.trim() || '',
    amount: amountEl?.textContent?.trim() || '',
  };
}

// -------- Login Page (/login) --------
export function readLoginPage() {
  const emailInput = findAgent('login-identifier') ||
                     document.querySelector('input[type="text"]') ||
                     document.querySelector('input[placeholder*="email" i]') ||
                     document.querySelector('input[name="identifier"]');
  const passwordInput = findAgent('login-password') || document.querySelector('input[type="password"]');
  const loginBtn = findAgent('login-submit') || Array.from(document.querySelectorAll('button'))
    .find((btn) => btn.textContent.includes('Login') || btn.textContent.includes('Sign in'));

  return {
    type: 'login',
    path: getCurrentPath(),
    hasEmailField: !!emailInput,
    hasPasswordField: !!passwordInput,
    hasLoginButton: !!loginBtn,
    emailFilled: emailInput?.value?.length > 0 || false,
    passwordFilled: passwordInput?.value?.length > 0 || false,
  };
}

// -------- Signup Page (/signup) --------
export function readSignupPage() {
  const nameInput = findAgent('signup-name') || document.querySelector('input[name="name"]');
  const emailInput = findAgent('signup-email') || document.querySelector('input[name="email"]');
  const passwordInput = findAgent('signup-password') || document.querySelector('input[name="password"]');
  const confirmInput = findAgent('signup-confirm-password') || document.querySelector('input[name="confirmPassword"]');
  const submitBtn = findAgent('signup-submit') || Array.from(document.querySelectorAll('button'))
    .find((btn) => btn.textContent.includes('Create Account'));

  return {
    type: 'signup',
    path: getCurrentPath(),
    hasNameField: !!nameInput,
    hasEmailField: !!emailInput,
    hasPasswordField: !!passwordInput,
    hasConfirmField: !!confirmInput,
    hasSubmitButton: !!submitBtn,
    nameFilled: nameInput?.value?.length > 0 || false,
    emailFilled: emailInput?.value?.length > 0 || false,
    passwordFilled: passwordInput?.value?.length > 0 || false,
    confirmPasswordFilled: confirmInput?.value?.length > 0 || false,
  };
}

// -------- Profile Page (/profile) --------
export function readProfilePage() {
  const editDialog = findAgent('profile-edit-dialog');
  const nameInput = findAgent('profile-input-name') || document.querySelector('input[name="name"]');
  const emailInput = findAgent('profile-input-email') || document.querySelector('input[name="email"]');
  const phoneInput = findAgent('profile-input-phone') || document.querySelector('input[name="phone"]');
  const addressInput = findAgent('profile-input-address') || document.querySelector('textarea[name="address"]');
  const nameEl = findAgent('profile-name') ||
                 document.querySelector('h2.font-display.text-2xl') ||
                 document.querySelector('h2.font-display.text-2xl.font-semibold');
  const emailEl = findAgent('profile-email');
  const stats = document.querySelectorAll('[class*="text-lg font-semibold"]');

  if (nameEl || emailEl || findAgent('profile-phone') || findAgent('profile-address')) {
    return {
      type: 'profile',
      path: getCurrentPath(),
      name: nameInput?.value || nameEl?.textContent?.trim() || '',
      email: emailInput?.value || emailEl?.textContent?.trim() || '',
      phone: phoneInput?.value || findAgent('profile-phone')?.textContent?.trim() || '',
      address: addressInput?.value || findAgent('profile-address')?.textContent?.trim() || '',
      hasEditDialog: !!editDialog,
      stats: Array.from(stats).map((s) => s.textContent.trim()),
    };
  }

  // Get phone and address from the contact card
  const contactItems = document.querySelectorAll('div.rounded-2xl.bg-white');
  let phone = '';
  let address = '';
  contactItems.forEach((item) => {
    const text = item.textContent.trim();
    if (text.match(/^\d{10}/) || text.includes('Phone')) phone = text;
    if (text.includes(',') || text.includes('Address')) address = text;
  });

  // Fallback: get from the session display section
  const phoneIcon = document.querySelector('svg.fa-phone-alt') ||
                    document.querySelector('[class*="fa-phone"]');
  const addressIcon = document.querySelector('svg.fa-map-marker-alt') ||
                      document.querySelector('[class*="fa-map"]');
  if (!phone) phone = phoneIcon?.closest('div')?.querySelector('span')?.textContent?.trim() || '';
  if (!address) address = addressIcon?.closest('div')?.querySelector('span')?.textContent?.trim() || '';

  return {
    type: 'profile',
    path: getCurrentPath(),
    name: nameInput?.value || nameEl?.textContent?.trim() || '',
    email: emailInput?.value || '',
    phone: phoneInput?.value || phone || '',
    address: addressInput?.value || address || '',
    hasEditDialog: !!editDialog,
    stats: Array.from(stats).map((s) => s.textContent.trim()),
  };
}

// -------- Home Page (/) --------
export function readHomePage() {
  const banners = document.querySelectorAll('.banner img, [class*="carousel"] img');
  const categories = document.querySelectorAll('[class*="category"]');

  return {
    type: 'home',
    path: getCurrentPath(),
    bannerCount: banners.length,
    categoryCount: categories.length,
  };
}

// -------- Generic Page Reader --------
export function readGenericPage() {
  const mainHeading = document.querySelector('h1') || document.querySelector('h2');
  return {
    type: 'page_info',
    path: getCurrentPath(),
    title: document.title,
    heading: mainHeading?.textContent?.trim() || '',
  };
}

// -------- Main Export --------
export function readPage() {
  const path = getCurrentPath();

  if (path === '/' || path === '/home' || path === '/frontendpickzo/' || path === '/frontendpickzo/home') {
    return readHomePage();
  }
  if (path === '/products' || path.startsWith('/products?')) {
    return readProductListPage();
  }
  if (path.match(/^\/product\//)) {
    return readProductDetailPage();
  }
  if (path === '/cart') {
    return readCartPage();
  }
  if (path === '/orders') {
    return readOrdersPage();
  }
  if (path === '/buy-now') {
    return readCheckoutPage();
  }
  if (path === '/order-success') {
    return readOrderSuccessPage();
  }
  if (path === '/profile') {
    return readProfilePage();
  }
  if (path === '/login') {
    return readLoginPage();
  }
  if (path === '/signup') {
    return readSignupPage();
  }

  return readGenericPage();
}
