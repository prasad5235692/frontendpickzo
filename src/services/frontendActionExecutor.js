import { readPage } from './pageReader';

const session = {
  loginStatus: false,
  userName: null,
  email: null,
  phone: null,
  address: null,
  currentPage: null,
  currentUrl: null,
  selectedProduct: null,
  selectedVariant: null,
  selectedQuantity: 1,
  cart: null,
  orders: null,
  checkoutStep: null,
  selectedPaymentMethod: null,
};

export function getSession() {
  return { ...session };
}

function updateSession(updates) {
  Object.assign(session, updates);
}

function getBasePath() {
  return (import.meta.env.BASE_URL || '').replace(/\/$/, '');
}

function getNormalizedCurrentPage() {
  const pathname = window.location.pathname || '/';
  const basePath = getBasePath();

  if (basePath && pathname.startsWith(basePath)) {
    const trimmed = pathname.slice(basePath.length);
    return trimmed || '/';
  }

  return pathname;
}

function loadLocalAuth() {
  const token = localStorage.getItem('token');
  const name = localStorage.getItem('username');
  if (token) {
    session.loginStatus = true;
    session.userName = name || session.userName;
  }
}

loadLocalAuth();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function normalizeString(value = '') {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function escapeAttributeValue(value = '') {
  return String(value || '').replace(/"/g, '\\"');
}

function getNormalizedCurrentRoute() {
  return `${getNormalizedCurrentPage()}${window.location.search || ''}`;
}

function getTokenPreview(token) {
  if (!token || token.length < 10) {
    return token || null;
  }

  return `${token.slice(0, 6)}...${token.slice(-4)}`;
}

let navigateFn = null;
let navigateQueue = [];
let navigateFnReady = null;

if (typeof navigateFnReadyPromise === 'undefined') {
  var navigateFnReadyPromise = new Promise((resolve) => {
    navigateFnReady = resolve;
  });
}

export const registerNavigate = (fn) => {
  navigateFn = fn;
  if (navigateQueue.length > 0) {
    for (const entry of navigateQueue) {
      fn(entry.path);
      entry.resolve();
    }
    navigateQueue = [];
  }
  if (navigateFnReady) {
    navigateFnReady();
    navigateFnReady = null;
  }
};

function updateSessionFromPageData(pageData) {
  const updates = {
    currentPage: getNormalizedCurrentRoute(),
    currentUrl: window.location.href,
  };

  if (pageData?.type === 'product_detail') {
    updates.selectedProduct = {
      ...(session.selectedProduct || {}),
      id: pageData.id || session.selectedProduct?.id || null,
      title: pageData.title || session.selectedProduct?.title || null,
      price: pageData.price || session.selectedProduct?.price || null,
      stock: pageData.inStock !== undefined ? pageData.inStock : (session.selectedProduct?.stock ?? null),
      image: pageData.image || session.selectedProduct?.image || null,
    };
  }

  if (pageData?.type === 'checkout') {
    updates.checkoutStep = 'checkout';
    updates.phone = pageData.phone || session.phone;
    updates.address = pageData.address || session.address;
    updates.selectedPaymentMethod = pageData.paymentMethod || session.selectedPaymentMethod;
  }

  if (pageData?.type === 'order_success') {
    updates.checkoutStep = 'completed';
  }

  if (pageData?.type === 'profile') {
    updates.userName = pageData.name || session.userName;
    updates.email = pageData.email || session.email;
    updates.phone = pageData.phone || session.phone;
    updates.address = pageData.address || session.address;
  }

  if (pageData?.type === 'cart') {
    updates.cart = pageData.items || session.cart;
  }

  if (pageData?.type === 'orders') {
    updates.orders = pageData.orders || session.orders;
  }

  updateSession(updates);
}

function buildDomSummary(pageData) {
  if (!pageData || typeof pageData !== 'object') {
    return null;
  }

  switch (pageData.type) {
    case 'product_list':
      return {
        type: pageData.type,
        count: pageData.count || 0,
        products: (pageData.products || []).slice(0, 5).map((product) => ({
          id: product.id,
          index: product.index,
          title: product.title,
          price: product.price,
        })),
      };
    case 'product_detail':
      return {
        type: pageData.type,
        title: pageData.title,
        price: pageData.price,
        inStock: pageData.inStock,
        hasBuyNowButton: pageData.hasBuyNowButton,
        hasAddToCartButton: pageData.hasAddToCartButton,
      };
    case 'cart':
      return {
        type: pageData.type,
        itemCount: pageData.itemCount || 0,
        totalAmount: pageData.totalAmount || null,
        items: (pageData.items || []).slice(0, 5).map((item) => ({
          title: item.title,
          quantity: item.quantity,
          price: item.price,
        })),
      };
    case 'checkout':
      return {
        type: pageData.type,
        hasPhone: pageData.hasPhone,
        hasAddress: pageData.hasAddress,
        isEditingPhone: pageData.isEditingPhone,
        isEditingAddress: pageData.isEditingAddress,
        paymentMethod: pageData.paymentMethod,
        paymentOptions: pageData.paymentOptions || [],
      };
    case 'orders':
      return {
        type: pageData.type,
        count: pageData.count || 0,
        orders: (pageData.orders || []).slice(0, 5).map((order) => ({
          id: order.id,
          status: order.status,
          total: order.total,
        })),
      };
    case 'profile':
      return {
        type: pageData.type,
        name: pageData.name,
        email: pageData.email,
        phone: pageData.phone,
        address: pageData.address,
        hasEditDialog: pageData.hasEditDialog,
      };
    case 'order_success':
      return {
        type: pageData.type,
        orderId: pageData.orderId,
        amount: pageData.amount,
      };
    default:
      return {
        type: pageData.type || 'unknown',
      };
  }
}

function buildCartSnapshot(pageData) {
  if (pageData?.type === 'cart') {
    return {
      itemCount: pageData.itemCount || 0,
      totalAmount: pageData.totalAmount || null,
      items: pageData.items || [],
    };
  }

  return {
    itemCount: Array.isArray(session.cart) ? session.cart.length : 0,
    totalAmount: null,
  };
}

function buildOrdersSnapshot(pageData) {
  if (pageData?.type === 'orders') {
    return {
      count: pageData.count || 0,
      items: pageData.orders || [],
    };
  }

  return {
    count: Array.isArray(session.orders) ? session.orders.length : 0,
  };
}

function getHeading(pageData) {
  return normalizeString(
    pageData?.heading
      || pageData?.title
      || document.querySelector('h1, h2')?.textContent
      || ''
  ) || null;
}

function collectToastMessages() {
  const selectors = [
    '[role="alert"]',
    '[data-agent="checkout-error"]',
    '.fixed.top-20',
    '.fixed.top-24',
  ];

  const messages = new Set();
  for (const selector of selectors) {
    document.querySelectorAll(selector).forEach((element) => {
      const text = normalizeString(element.textContent || '');
      if (text) {
        messages.add(text);
      }
    });
  }

  return [...messages].slice(0, 5);
}

function collectDialogState(pageData) {
  const dialogElement = document.querySelector(
    '[role="dialog"], [aria-modal="true"], [data-agent="profile-edit-dialog"], [data-agent="order-confirmation"]'
  );
  const title = normalizeString(dialogElement?.querySelector('h1, h2, h3, p')?.textContent || '');

  return {
    isOpen: Boolean(dialogElement || pageData?.hasConfirmationDialog || pageData?.hasEditDialog),
    title: title || null,
  };
}

export function buildFrontendSnapshot() {
  const pageData = readPage();
  const token = localStorage.getItem('token');
  const loginStatus = Verify.loginStatus();

  updateSession({
    loginStatus,
    userName: localStorage.getItem('username') || session.userName,
    currentPage: getNormalizedCurrentRoute(),
    currentUrl: window.location.href,
  });
  updateSessionFromPageData(pageData);

  return {
    currentPage: getNormalizedCurrentRoute(),
    url: window.location.href,
    pageType: pageData?.type || null,
    heading: getHeading(pageData),
    loginStatus,
    auth: {
      hasToken: Boolean(token),
      tokenPreview: getTokenPreview(token),
    },
    user: {
      name: session.userName,
      email: session.email,
      phone: session.phone,
      address: session.address,
    },
    cart: buildCartSnapshot(pageData),
    orders: buildOrdersSnapshot(pageData),
    selectedProduct: session.selectedProduct,
    selectedVariant: session.selectedVariant,
    checkoutStep: pageData?.type === 'checkout'
      ? 'checkout'
      : pageData?.type === 'order_success'
        ? 'completed'
        : session.checkoutStep,
    toasts: collectToastMessages(),
    dialog: collectDialogState(pageData),
    domSummary: buildDomSummary(pageData),
    pageData,
  };
}

function uniqueElements(elements = []) {
  return [...new Set(elements.filter(Boolean))];
}

function isTextMatch(value = '', expected = '') {
  return normalizeString(value).toLowerCase().includes(normalizeString(expected).toLowerCase());
}

function waitForCondition(check, timeoutMs = 8000, intervalMs = 120) {
  return new Promise((resolve) => {
    const startedAt = Date.now();

    const poll = () => {
      const result = check();
      if (result) {
        resolve(result);
        return;
      }

      if (Date.now() - startedAt >= timeoutMs) {
        resolve(null);
        return;
      }

      setTimeout(poll, intervalMs);
    };

    poll();
  });
}

function waitForPageReady(timeoutMs = 7000) {
  return waitForCondition(() => {
    const loading = document.querySelectorAll(
      '.animate-pulse, [class*="skeleton"], .loading, [aria-busy="true"]'
    );

    if (loading.length > 0) return false;

    const path = window.location.pathname;
    if (path.includes('/products')) {
      return document.querySelectorAll('[data-agent="product-card"]').length > 0
        || document.querySelector('.text-gray-500, .empty-state, [data-agent="no-products"]') !== null;
    }
    if (path.includes('/product/')) {
      return document.querySelector('[data-agent="product-title"], h1') !== null;
    }
    if (path.includes('/buy-now')) {
      return document.querySelector('[data-agent="checkout-phone-input"], [data-agent="checkout-place-order"]') !== null
        || document.querySelector('[class*="checkout"]') !== null;
    }
    if (path.includes('/cart')) {
      return document.querySelector('[data-agent="cart-item"], [data-agent="cart-empty"]') !== null;
    }
    if (path.includes('/orders')) {
      return document.querySelector('[data-agent="order-card"], .text-gray-500') !== null;
    }
    if (path.includes('/profile')) {
      return document.querySelector('[data-agent="profile-name"], h2') !== null;
    }

    return true;
  }, timeoutMs, 200).then(() => sleep(300));
}

async function smartClick(el) {
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  await sleep(200);
  el.click();
  await sleep(200);
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const RETRY_MAX = 3;
const RETRY_DELAY = 1000;

const CHECKOUT_SELECTOR_PATTERNS = [
  { name: 'phone', placeholderIncludes: 'phone' },
  { name: 'mobile', placeholderIncludes: 'mobile' },
  { name: 'mobileNumber' },
  { name: 'contact' },
  { name: 'contactNumber' },
  { name: 'billingPhone' },
  { name: 'shippingPhone' },
  { name: 'telephone' },
  { placeholderIncludes: 'phone' },
  { placeholderIncludes: 'mobile' },
  { placeholderIncludes: 'contact' },
  { placeholderIncludes: 'mobile number' },
];

const CHECKOUT_ADDRESS_PATTERNS = [
  { placeholderIncludes: 'Address', tag: 'textarea' },
  { name: 'address', tag: 'textarea' },
  { name: 'street', tag: 'textarea' },
  { name: 'address1', tag: 'textarea' },
  { name: 'shippingAddress', tag: 'textarea' },
  { name: 'billingAddress', tag: 'textarea' },
  { name: 'city' },
  { name: 'state' },
  { name: 'pincode' },
  { name: 'zipCode' },
  { name: 'zip' },
  { placeholderIncludes: 'address' },
  { placeholderIncludes: 'street' },
  { placeholderIncludes: 'city' },
  { placeholderIncludes: 'state' },
  { placeholderIncludes: 'pincode' },
  { placeholderIncludes: 'zip' },
];

const CHECKOUT_PLACE_ORDER_PATTERNS = [
  { dataAgent: 'checkout-place-order', text: 'Place Order', tag: 'button' },
  { text: 'Place Order', tag: 'button' },
  { text: 'Confirm Order', tag: 'button' },
  { text: 'Submit Order', tag: 'button' },
  { text: 'Pay Now', tag: 'button' },
  { text: 'Confirm', tag: 'button' },
  { text: 'Order', tag: 'button' },
];

const CHECKOUT_PAYMENT_PATTERNS = [
  { dataAgent: 'checkout-payment-input' },
  { name: 'paymentMethod' },
  { name: 'payment' },
  { inputType: 'radio' },
];

async function withRetry(action, label, retries = RETRY_MAX) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await action();
      return result;
    } catch (err) {
      if (attempt < retries) {
        await sleep(RETRY_DELAY);
      } else {
        throw new Error(`${label} failed after ${retries} attempts: ${err.message}`);
      }
    }
  }
}

function getCandidateCollections(target = {}) {
  const collections = [];

  if (target.selector) {
    try {
      collections.push([...document.querySelectorAll(target.selector)]);
    } catch {
      collections.push([]);
    }
  }

  if (target.dataAgent) {
    collections.push([...document.querySelectorAll(`[data-agent="${escapeAttributeValue(target.dataAgent)}"]`)]);
  }

  if (target.name) {
    collections.push([...document.querySelectorAll(`[name="${escapeAttributeValue(target.name)}"]`)]);
  }

  if (target.placeholderIncludes) {
    const placeholder = normalizeString(target.placeholderIncludes).toLowerCase();
    collections.push(
      [...document.querySelectorAll('input[placeholder], textarea[placeholder]')].filter((element) =>
        String(element.getAttribute('placeholder') || '').toLowerCase().includes(placeholder)
      )
    );
  }

  if (target.inputType) {
    collections.push([...document.querySelectorAll(`input[type="${escapeAttributeValue(target.inputType)}"]`)]);
  }

  if (target.text) {
    const selector = target.tag || 'button, a, [role="button"], label, span';
    try {
      collections.push(
        [...document.querySelectorAll(selector)].filter((element) => isTextMatch(element.textContent || '', target.text))
      );
    } catch {
      collections.push([]);
    }
  }

  if (collections.length === 0) {
    collections.push([]);
  }

  return collections;
}

function matchesTarget(element, target = {}, mode = 'click') {
  if (!(element instanceof Element)) {
    return false;
  }

  if (target.tag && element.tagName.toLowerCase() !== target.tag.toLowerCase()) {
    return false;
  }

  if (target.name && element.getAttribute('name') && element.getAttribute('name') !== target.name) {
    return false;
  }

  if (target.dataAgent && element.getAttribute('data-agent') !== target.dataAgent) {
    return false;
  }

  if (target.inputType && element instanceof HTMLInputElement) {
    const expectedType = target.inputType.toLowerCase();
    const actualType = (element.type || 'text').toLowerCase();
    if (actualType !== expectedType && !(expectedType === 'tel' && actualType === 'text')) {
      return false;
    }
  }

  if (target.placeholderIncludes) {
    const placeholder = String(element.getAttribute('placeholder') || '').toLowerCase();
    if (!placeholder.includes(String(target.placeholderIncludes).toLowerCase())) {
      return false;
    }
  }

  if (target.text && !isTextMatch(element.textContent || '', target.text)) {
    return false;
  }

  if (mode === 'click') {
    return !element.hasAttribute('disabled');
  }

  if (mode === 'input') {
    return element instanceof HTMLInputElement
      || element instanceof HTMLTextAreaElement
      || element instanceof HTMLSelectElement;
  }

  if (mode === 'choice') {
    return element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLOptionElement;
  }

  return true;
}

function sortCandidates(candidates = [], target = {}) {
  return [...candidates].sort((left, right) => {
    const leftScore = Number(Boolean(target.text && normalizeString(left.textContent || '') === normalizeString(target.text)))
      + Number(Boolean(target.dataAgent && left.getAttribute('data-agent') === target.dataAgent));
    const rightScore = Number(Boolean(target.text && normalizeString(right.textContent || '') === normalizeString(target.text)))
      + Number(Boolean(target.dataAgent && right.getAttribute('data-agent') === target.dataAgent));

    return rightScore - leftScore;
  });
}

function resolveTargetElements(target = {}, mode = 'click') {
  const candidates = uniqueElements(getCandidateCollections(target).flat())
    .filter((element) => matchesTarget(element, target, mode));

  return sortCandidates(candidates, target);
}

async function waitForTarget(target = {}, mode = 'click', timeoutMs = 7000) {
  return waitForCondition(() => resolveTargetElements(target, mode)[0] || null, timeoutMs, 150);
}

function setElementValue(element, value) {
  if (element instanceof HTMLSelectElement) {
    element.value = value;
    element.dispatchEvent(new Event('change', { bubbles: true }));
    return;
  }

  const prototype = element instanceof HTMLTextAreaElement
    ? window.HTMLTextAreaElement.prototype
    : window.HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');

  if (descriptor?.set) {
    descriptor.set.call(element, value);
  } else {
    element.value = value;
  }

  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
}

function readTargetValue(target = {}) {
  const element = resolveTargetElements(target, 'input')[0] || resolveTargetElements(target, 'choice')[0];
  if (!element) {
    return null;
  }

  if (element instanceof HTMLInputElement && element.type === 'radio') {
    const selected = resolveTargetElements(target, 'choice').find((candidate) => candidate.checked);
    return selected?.value || null;
  }

  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
    return element.value;
  }

  return normalizeString(element.textContent || '');
}

async function waitForNavigation(options = {}) {
  const { urlIncludes, urlNotIncludes, timeoutMs = 8000 } = options;

  if (!urlIncludes && !urlNotIncludes) {
    await waitForPageReady(timeoutMs);
    return true;
  }

  const result = await waitForCondition(() => {
    const href = window.location.href;
    if (urlIncludes && !href.includes(urlIncludes)) {
      return false;
    }
    if (urlNotIncludes && href.includes(urlNotIncludes)) {
      return false;
    }

    return true;
  }, timeoutMs, 150);

  await waitForPageReady(timeoutMs);
  return Boolean(result);
}

const Actions = {
  async navigate(path) {
    const targetPath = path || '/';
    const previousRoute = getNormalizedCurrentRoute();

    if (navigateFn) {
      navigateFn(targetPath);
    } else {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          const idx = navigateQueue.indexOf(entry);
          if (idx !== -1) navigateQueue.splice(idx, 1);
          window.location.assign(`${getBasePath()}${targetPath}`);
          resolve();
        }, 5000);

        const entry = {
          path: targetPath,
          resolve: () => {
            clearTimeout(timeout);
            resolve();
          },
          reject,
        };
        navigateQueue.push(entry);
      });
    }

    if (previousRoute !== targetPath) {
      await waitForNavigation({ urlIncludes: targetPath, timeoutMs: 8000 });
    }

    await waitForPageReady();
    updateSession({ currentPage: getNormalizedCurrentRoute(), currentUrl: window.location.href });
    return readPage();
  },

  async click(target, waitForNavigationOptions) {
    const tryPatterns = async (patternList) => {
      for (const pattern of patternList) {
        const merged = { ...target, ...pattern };
        const el = await waitForTarget(merged, 'click', 2000);
        if (el) return el;
      }
      return null;
    };

    return withRetry(async () => {
      let el = await waitForTarget(target, 'click', 7000);

      if (!el) {
        const isPlaceOrder = target.dataAgent === 'checkout-place-order'
          || (target.text || '').toLowerCase().includes('place order');
        if (isPlaceOrder) {
          el = await tryPatterns(CHECKOUT_PLACE_ORDER_PATTERNS);
        }
      }

      if (!el) {
        throw new Error('Requested clickable element was not found.');
      }

      await smartClick(el);
      if (waitForNavigationOptions) {
        await waitForNavigation(waitForNavigationOptions);
      }
      await waitForPageReady();
      return readPage();
    }, 'click');
  },

  async fillInput(target, value) {
    const trySelectors = async (patternList) => {
      for (const pattern of patternList) {
        const merged = { ...target, ...pattern };
        const input = await waitForTarget(merged, 'input', 3000);
        if (input) {
          input.focus();
          setElementValue(input, value ?? '');
          await sleep(200);
          return readPage();
        }
      }
      return null;
    };

    return withRetry(async () => {
      const input = await waitForTarget(target, 'input', 7000);
      if (input) {
        input.focus();
        setElementValue(input, value ?? '');
        await sleep(200);
        return readPage();
      }

      const isPhoneField = target.dataAgent === 'checkout-phone-input'
        || target.name === 'phone'
        || (target.placeholderIncludes || '').toLowerCase().includes('phone')
        || (target.placeholderIncludes || '').toLowerCase().includes('mobile');
      const isAddressField = target.dataAgent === 'checkout-address-input'
        || target.name === 'address'
        || (target.placeholderIncludes || '').toLowerCase().includes('address');

      if (isPhoneField) {
        const result = await trySelectors(CHECKOUT_SELECTOR_PATTERNS);
        if (result) return result;
      }

      if (isAddressField) {
        const result = await trySelectors(CHECKOUT_ADDRESS_PATTERNS);
        if (result) return result;
      }

      throw new Error('Requested input field was not found.');
    }, 'fillInput');
  },

  async callApi(url, method, body) {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    const response = await fetch(fullUrl, {
      method: method || 'GET',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = response.ok ? await response.json().catch(() => ({})) : null;
    return {
      success: response.ok,
      data,
      status: response.status,
      pageData: readPage(),
    };
  },

  async selectDropdown(target, value) {
    const tryPatterns = async (patternList) => {
      for (const pattern of patternList) {
        const merged = { ...target, ...pattern };
        const candidates = resolveTargetElements(merged, 'choice');
        const option = candidates.find((el) => {
          if (el instanceof HTMLInputElement || el instanceof HTMLOptionElement) return el.value === value;
          if (el instanceof HTMLSelectElement) return el.value === value || isTextMatch(Array.from(el.options).find(o => o.selected)?.textContent || '', value);
          return isTextMatch(el.textContent || '', value);
        }) || candidates[0];
        if (option) return option;
      }
      return null;
    };

    return withRetry(async () => {
      let candidates = resolveTargetElements(target, 'choice');
      let option = candidates.find((element) => {
        if (element instanceof HTMLInputElement || element instanceof HTMLOptionElement) {
          return element.value === value;
        }
        return isTextMatch(element.textContent || '', value);
      }) || candidates[0];

      if (!option) {
        const isPaymentField = target.dataAgent === 'checkout-payment-input'
          || target.name === 'paymentMethod'
          || target.name === 'payment';
        if (isPaymentField) {
          option = await tryPatterns(CHECKOUT_PAYMENT_PATTERNS);
        }
        if (!option) {
          option = await tryPatterns(CHECKOUT_SELECTOR_PATTERNS.map(p => ({ ...p, name: undefined, inputType: undefined })));
        }
      }

      if (!option) {
        throw new Error(`No selectable option matched "${value}".`);
      }

      if (option instanceof HTMLInputElement) {
        if (!option.checked) {
          await smartClick(option);
        }
      } else if (option instanceof HTMLSelectElement) {
        setElementValue(option, value);
      } else if (option instanceof HTMLOptionElement) {
        option.selected = true;
        option.parentElement?.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        await smartClick(option);
      }

      await sleep(200);
      return readPage();
    }, 'selectDropdown');
  },

  async readCurrentPage() {
    return withRetry(async () => {
      await waitForPageReady();
      return readPage();
    }, 'readCurrentPage');
  },

  async waitForPageReady(timeoutMs) {
    await waitForPageReady(timeoutMs || 7000);
    return readPage();
  },
};

const Verify = {
  loginStatus() {
    const hasToken = !!localStorage.getItem('token');
    updateSession({ loginStatus: hasToken });
    return hasToken;
  },
};

function matchesExpectedState(pageData, expected = {}) {
  if (!expected || typeof expected !== 'object') {
    return true;
  }

  if (expected.currentPage && !getNormalizedCurrentRoute().includes(expected.currentPage)) {
    return false;
  }

  if (expected.pageType && pageData?.type !== expected.pageType) {
    return false;
  }

  if (expected.fieldValue && typeof expected.fieldValue === 'object') {
    if (readTargetValue(expected.fieldValue.target) !== expected.fieldValue.value) {
      return false;
    }
  }

  if (expected.paymentMethod && pageData?.paymentMethod !== expected.paymentMethod) {
    return false;
  }

  if (expected.orderSuccess && pageData?.type !== 'order_success') {
    return false;
  }

  if (expected.modalVisible !== undefined) {
    const isDialogOpen = Boolean(pageData?.hasConfirmationDialog || pageData?.hasEditDialog || collectDialogState(pageData).isOpen);
    if (isDialogOpen !== Boolean(expected.modalVisible)) {
      return false;
    }
  }

  if (expected.verifiedField && expected.value !== undefined) {
    return pageData?.[expected.verifiedField] === expected.value;
  }

  if (expected.orderCountDelta !== undefined && pageData?.type !== 'order_success') {
    return false;
  }

  if (expected.profileFields && typeof expected.profileFields === 'object') {
    for (const [field, val] of Object.entries(expected.profileFields)) {
      if (val && pageData?.[field] !== val) {
        return false;
      }
    }
  }

  return true;
}

function normalizeLegacyRequest(actionRequest) {
  const args = actionRequest.args || {};

  switch (actionRequest.tool) {
    case 'readPage':
      return { tool: 'readCurrentPage', args: {}, expected: actionRequest.expected || {} };
    case 'clickElement':
      return { tool: 'click', args: { target: { selector: args.selector } }, expected: actionRequest.expected || {} };
    case 'clickButtonWithText':
      return { tool: 'click', args: { target: { text: args.text, tag: 'button' } }, expected: actionRequest.expected || {} };
    case 'fillField':
      return {
        tool: 'fillInput',
        args: {
          target: {
            dataAgent: args.field,
            name: args.field,
            placeholderIncludes: args.placeholder || args.field,
          },
          value: args.value,
        },
        expected: actionRequest.expected || {},
      };
    case 'fillPhone':
      return {
        tool: 'fillInput',
        args: {
          target: { dataAgent: 'checkout-phone-input', name: 'phone', inputType: 'tel', placeholderIncludes: 'phone' },
          value: args.phone,
        },
        expected: actionRequest.expected || {},
      };
    case 'fillAddress':
      return {
        tool: 'fillInput',
        args: {
          target: { dataAgent: 'checkout-address-input', placeholderIncludes: 'Address', tag: 'textarea' },
          value: args.address,
        },
        expected: actionRequest.expected || {},
      };
    case 'selectPayment':
      return {
        tool: 'selectDropdown',
        args: {
          target: { dataAgent: 'checkout-payment-input', inputType: 'radio' },
          value: args.method,
        },
        expected: actionRequest.expected || {},
      };
    case 'clickBuyNow':
      return {
        tool: 'click',
        args: {
          target: { dataAgent: 'buy-now', text: 'BUY NOW', tag: 'button' },
          waitForNavigation: { urlIncludes: '/buy-now', timeoutMs: 10000 },
        },
        expected: actionRequest.expected || {},
      };
    case 'clickAddToCart':
      return {
        tool: 'click',
        args: { target: { dataAgent: 'add-to-cart', text: 'ADD TO CART', tag: 'button' } },
        expected: actionRequest.expected || {},
      };
    case 'placeOrder':
      return {
        tool: 'click',
        args: {
          target: { dataAgent: 'checkout-place-order', text: 'Place Order', tag: 'button' },
          waitForNavigation: { urlIncludes: '/order-success', timeoutMs: 15000 },
        },
        expected: actionRequest.expected || {},
      };
    default:
      return actionRequest;
  }
}

function buildSuccessMessage(tool, args = {}) {
  switch (tool) {
    case 'navigate':
      return `Navigated to ${args.page || args.path || getNormalizedCurrentRoute()}.`;
    case 'click':
      return 'Clicked the requested element.';
    case 'fillInput':
      return 'Filled the requested field.';
    case 'selectDropdown':
      return `Selected ${args.value || 'the requested option'}.`;
    case 'readCurrentPage':
      return 'Read the current page state.';
    case 'waitForPageReady':
      return 'Waited for the page to be fully loaded.';
    default:
      return 'Action completed.';
  }
}

async function executeAction(actionRequest) {
  const normalizedRequest = normalizeLegacyRequest(actionRequest);
  const args = normalizedRequest.args || {};

  try {
    switch (normalizedRequest.tool) {
      case 'navigate': {
        const page = args.page || args.path || '/';
        return {
          success: true,
          pageData: await Actions.navigate(page),
          message: buildSuccessMessage('navigate', args),
        };
        break;
      }
      case 'click':
        return {
          success: true,
          pageData: await Actions.click(args.target || {}, args.waitForNavigation),
          message: buildSuccessMessage('click', args),
        };
      case 'fillInput':
        return {
          success: true,
          pageData: await Actions.fillInput(args.target || {}, args.value),
          message: buildSuccessMessage('fillInput', args),
        };
      case 'selectDropdown':
        return {
          success: true,
          pageData: await Actions.selectDropdown(args.target || {}, args.value),
          message: buildSuccessMessage('selectDropdown', args),
        };
      case 'callApi': {
        const apiResult = await Actions.callApi(args.url, args.method, args.body);
        return {
          success: apiResult.success,
          pageData: apiResult.pageData,
          apiResult: apiResult.data,
          apiStatus: apiResult.status,
          message: apiResult.success ? `API call to ${args.url} succeeded.` : `API call to ${args.url} failed.`,
        };
      }
      case 'readCurrentPage':
        return {
          success: true,
          pageData: await Actions.readCurrentPage(),
          message: buildSuccessMessage('readCurrentPage', args),
        };
      case 'waitForPageReady':
        return {
          success: true,
          pageData: await Actions.waitForPageReady(args.timeoutMs),
          message: 'Waited for page to be ready.',
        };
      default:
        throw new Error(`Unknown frontend tool: ${normalizedRequest.tool}`);
    }
  } catch (err) {
    return {
      success: false,
      pageData: readPage(),
      message: err.message || 'Frontend action failed.',
    };
  }
}

export const executeVerifiedFrontendAction = async (actionRequest) => {
  const normalizedRequest = normalizeLegacyRequest(actionRequest);
  const execution = await executeAction(normalizedRequest);
  const pageData = execution.pageData || readPage();

  updateSessionFromPageData(pageData);

  const verified = execution.success
    ? matchesExpectedState(pageData, normalizedRequest.expected || {})
    : false;
  const status = verified ? 'success' : 'error';
  const message = verified
    ? execution.message || 'Action verified.'
    : execution.message || 'Action verification failed.';

  return {
    tool: normalizedRequest.tool,
    args: normalizedRequest.args || {},
    expected: normalizedRequest.expected || {},
    status,
    message,
    verified,
    currentPage: getNormalizedCurrentRoute(),
    url: window.location.href,
    pageType: pageData?.type || null,
    data: pageData,
    context: {
      loginStatus: Verify.loginStatus(),
      selectedProduct: session.selectedProduct,
      selectedVariant: session.selectedVariant,
      checkoutStep: session.checkoutStep,
      userDraft: {
        name: session.userName,
        email: session.email,
        phone: session.phone,
        address: session.address,
      },
    },
  };
};
