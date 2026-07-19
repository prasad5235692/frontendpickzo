# Frontend — PROJECT_FLOW.md

> Single source of truth for the PickZo frontend architecture, routing, AI assistant, executor, page readers, and all page behaviors.

---

## 1. Folder Structure

frontend/
├── index.html                       # Entry HTML (title: "PickZo")
├── package.json                     # Vite + React 19 + Tailwind + react-router-dom 7 + axios + framer-motion
├── vite.config.js                   # Vite config with base path from env
├── tailwind.config.js               # Tailwind CSS configuration
├── postcss.config.js                # PostCSS pipeline (Tailwind + Autoprefixer)
├── eslint.config.js                 # ESLint flat config
├── vercel.json                      # SPA rewrites for Vercel deployment
├── .gitignore
├── .gitattributes
├── README.md
├── public/                          # Static assets (favicon, etc.)
├── dist/                            # Build output
└── src/
    ├── main.jsx                     # React entry point — mounts App with BrowserRouter
    ├── App.jsx                      # Root component: Router (Routes + Route), Navbar, Footer, AiAssistant, ScrollToTop
    ├── App.css                      # Utility classes: no-scrollbar, scaleIn animation
    ├── index.css                    # Tailwind directives, CSS variables, imported fonts
    │
    ├── api/
    │   └── axios.js                 # Axios instance: baseURL, JWT Bearer token interceptor
    │
    ├── pages/                       # Route page components
    │   ├── Home.jsx                 # / or /home — Banner carousel, Categories grid, ProductList shelves
    │   ├── ProductPage.jsx          # /products — Search results, filter (price/rating), sort, product grid
    │   ├── ProductDetail.jsx        # /product/:id — Full product view, Add to Cart, Buy Now
    │   ├── CartPage.jsx             # /cart — Items list, quantity +/- , remove, subtotal, checkout button
    │   ├── LoginPage.jsx            # /login — Email/username + password form, stores JWT in localStorage
    │   ├── SignupPage.jsx           # /signup — Name, email, password, confirm password registration form
    │   ├── UserProfile.jsx          # /profile — User info, edit modal, cart summary, recent orders
    │   ├── BuyNowPage.jsx           # /buy-now — Checkout: phone + address (editable), payment method, place order
    │   ├── OrdersPage.jsx           # /orders — Order list with cancel/reorder/delete actions
    │   ├── OrderSuccess.jsx         # /order-success — Confetti, delivery tracker animation, order ID
    │   └── ImageUploadPage.jsx      # /upload-image — Cloudinary drag-drop upload
    │
    ├── components/                  # Reusable UI components
    │   ├── Navbar.jsx               # Top navigation: logo, search bar, category pills, cart badge, mobile menu
    │   ├── Footer.jsx               # Site footer with links, about, help/contact sections
    │   ├── Banner.jsx               # Auto-rotating hero carousel (3-4 slides)
    │   ├── Categories.jsx           # Category shortcut grid (6 categories with icons)
    │   ├── ProductList.jsx          # Horizontal scrollable product shelves by category
    │   ├── ProductCard.jsx          # Product card for shelves (image, title, price, rating)
    │   ├── ProductDetail.jsx        # Full product detail component (used by ProductPage route)
    │   ├── ScrollToTop.jsx          # Scrolls to top on route change
    │   └── AiAssistant.jsx          # Floating AI chat assistant (bottom-right)
    │
    ├── services/                    # AI / automation services
    │   ├── chatWorkflowClient.js    # SSE-based chat session client (create, stream, reconnect)
    │   ├── frontendActionExecutor.js # DOM-based action execution engine (navigate, click, fill, etc.)
    │   └── pageReader.js            # Structured page data extractor (per-route readers)
    │
    └── assets/                      # ~150 product images (webp, jpg, png, avif) + banners
```

---

## 2. Routing

### Route Table

| Route | Component | Description | Auth Required |
|-------|-----------|-------------|---------------|
| `/` | `<Home />` | Landing page — hero banner, category grid, featured product shelves | No |
| `/home` | `<Home />` | Alias for `/` | No |
| `/products` | `<ProductPage />` | Full product catalog with `?search=` query param, filters, sorting | No |
| `/product/:id` | `<ProductDetail />` | Single product detail with Add to Cart / Buy Now | No (cart needs auth) |
| `/cart` | `<CartPage />` | Shopping cart management | Yes (redirects to /login) |
| `/login` | `<LoginPage />` | Login form (email/username + password) | No |
| `/signup` | `<SignupPage />` | Registration form (name, email, password, confirm) | No |
| `/profile` | `<UserProfile />` | User profile, edit modal, cart summary, recent orders | Yes |
| `/buy-now` | `<BuyNowPage />` | Checkout page — address, payment, place order | Yes |
| `/orders` | `<OrdersPage />` | Order history with cancel/reorder | Yes |
| `/order-success` | `<OrderSuccess />` | Post-order celebration with confetti | Yes |
| `/upload-image` | `<ImageUploadPage />` | Cloudinary image upload utility | No |

### Router Configuration

- **Library:** react-router-dom v7 (BrowserRouter, Routes, Route)
- **Basename:** `import.meta.env.BASE_URL` (Vite env), defaults to `/frontendpickzo`
- **Layout:** All routes wrapped in Navbar (top) + ScrollToTop + Footer (bottom) + AiAssistant (floating)
- **Link convention:** All internal links use `<Link>` or `navigate()` from react-router-dom
- **SPA nature:** Client-side routing only — no SSR. Vercel rewrites all paths to `index.html`

---

## 3. AI Assistant

### Component: `AiAssistant.jsx`

**Location:** `src/components/AiAssistant.jsx`
**Position:** Fixed bottom-right (floating), z-50

### Architecture

```
┌─────────────────────────────────────────┐
│            AiAssistant.jsx               │
│  ┌─────────────────────────────────────┐ │
│  │           Chat Header               │ │
│  │  "AI Assistant" + username badge    │ │
│  ├─────────────────────────────────────┤ │
│  │           Messages List             │ │
│  │  ┌───────────────────────────────┐  │ │
│  │  │  User message                 │  │ │
│  │  ├───────────────────────────────┤  │ │
│  │  │  AI message with **markdown** │  │ │
│  │  ├───────────────────────────────┤  │ │
│  │  │  Option buttons               │  │ │
│  │  │  [Yes] [No] [COD] [UPI]      │  │ │
│  │  └───────────────────────────────┘  │ │
│  ├─────────────────────────────────────┤ │
│  │           Loading Indicator         │ │
│  ├─────────────────────────────────────┤ │
│  │           Input Area                │ │
│  │  ┌─[Type a message...]───[Send]─┐  │ │
│  │  └───────────────────────────────┘  │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Chat → SSE → Action → Result Loop

```
User types message (or clicks option button)
       │
       ▼
handleSend() / handleOptionSelect()
       │
       ▼
ensureSession()
  ├── Check localStorage for pickzo.aiChatSession
  ├── If exists → restore session (GET /api/chat/sessions/:id)
  └── If not → create session (POST /api/chat/sessions)
       │
       ▼
postWorkflowMessage(message, options)
  ├── Build snapshot from buildFrontendSnapshot()
  ├── POST /api/chat/sessions/:id/messages
  │   body: { message, frontendSnapshot }
  └── On success → openWorkflowSessionStream()
       │
       ▼
openWorkflowSessionStream()
  ├── GET /api/chat/sessions/:id/stream
  │   (fetch with ReadableStream — supports custom headers)
  ├── Uses AbortController for cancellation
  ├── Parse SSE events via parseEventChunk()
  │
  └── For each event:
       │
       ├── "session.state" → replace full message history (reconnect recovery)
       │
       ├── "assistant.message"
       │     → Append AI text to messages[]
       │     → Supports **bold** markdown
       │
       ├── "workflow.question"
       │     → Set pendingQuestion { id, text, options }
       │     → Renders option buttons
       │
       ├── "workflow.action"
       │     → Set pendingAction
       │     → Execute executeVerifiedFrontendAction(action)
       │     │
       │     │  ┌──────────────────────────────────────┐
       │     │  │ frontendActionExecutor                │
       │     │  │  ├── navigate()                       │
       │     │  │  ├── click()                          │
       │     │  │  ├── fillInput()                      │
       │     │  │  ├── selectDropdown()                 │
       │     │  │  ├── readCurrentPage()                │
       │     │  │  └── callApi()                        │
       │     │  └──────────────────────────────────────┘
       │     │
       │     ├── Read page after execution
       │     ├── Verify expected state (if provided)
       │     └── POST /api/chat/sessions/:id/action-results
       │         body: { tool, args, expected,
       │                 status, verified, pageData,
       │                 currentPage, url, pageType,
       │                 context }
       │
       ├── "workflow.sub_workflow_completed"
       │     → Enable loading (next sub-workflow starting)
       │
       ├── "workflow.completed"
       │     → Clear pending state → show completion
       │
       ├── "workflow.error"
       │     → Display error message
       │
       └── "workflow.state"
             → Update pendingQuestion / pendingAction
```

### SSE Reconnection (Exponential Backoff)

```
Connection drops
       │
       ▼
Wait 1s → retry
  Wait 2s → retry
    Wait 4s → retry
      Wait 8s → retry
        Wait 16s → retry (max 5 attempts)
           │
           ▼
    If all fail → show "Connection lost" error
    If reconnect succeeds → backend sends full session.state
```

---

## 4. Frontend Executor

### File: `src/services/frontendActionExecutor.js`

**Purpose:** DOM-based action execution engine. Translates backend decisions into concrete browser actions.

### navigate(path)

```js
navigate(path, options?)
```
- Uses `react-router-dom`'s `navigate` function (passed in at init)
- Falls back to `window.location.assign(path)` if navigate fails
- Waits for page ready (skeleton/spinner elements disappear)
- **Retries:** 3 attempts with 1s delay if navigation target not reached
- **Timeout:** 10s per attempt

### click(target, waitForNavigation?)

```js
click(target, waitForNavigation)
```
- Finds DOM element by **flexible pattern matching:**
  1. `data-agent` attribute match (most specific)
  2. CSS selector string
  3. Text content (case-insensitive, partial match)
  4. Element name/placeholder/inputType attributes
  5. Combined scoring: exact text match + data-agent match
- `waitForTarget()`: polls DOM at 150ms intervals, up to 7s timeout
- `smartClick()`: scrolls element into view, waits 200ms, dispatches click event
- `withRetry()`: retries up to 3 times with 1s delay
- If `waitForNavigation` is true, waits for URL/route change after click
- **Special patterns:**
  - `checkout-place-order` data-agent — clicks Place Order, awaits /order-success navigation
  - `buy-now` data-agent — clicks Buy Now, awaits /buy-now navigation

### fillInput(target, value)

```js
fillInput(target, value)
```
- Finds input element (same flexible matching as click)
- Sets value using `Object.getOwnPropertyDescriptor` prototype pattern (works with React controlled inputs)
- Dispatches native events: `input` → `change` → `blur`
- **Special patterns:**
  - `checkout-phone-input` data-agent — fills phone on /buy-now
  - `checkout-address-input` data-agent — fills address on /buy-now
  - `profile-phone-input`, `profile-address-input` — profile edit fields
  - Input type `tel` → phone matching
  - Input type `textarea` → address/text matching

### selectDropdown(target, value)

```js
selectDropdown(target, value)
```
- Handles multiple DOM patterns:
  1. **Radio group**: Finds radio input matching value → clicks associated label
  2. **`<select>` element**: Sets value and dispatches change event
  3. **Clickable options**: Finds text-matching element and clicks

### selectPaymentMethod(value)

```js
selectPaymentMethod(value)
```
- Dedicated tool for payment radio selection
- Finds radio by:
  1. `data-agent="checkout-payment-input"` with matching `value` attribute
  2. Label text content containing the value (case-insensitive)
  3. Any `input[type="radio"][name="payment"]` with matching value
- Clicks the radio if not already checked
- Verifies `checked=true` after click
- Returns updated page data
- **Retries:** 3 attempts with 1s delay

### readPage()

```js
readPage()
```
- Waits for page ready
- Calls `pageReader.readPage()` auto-detecting route
- Returns structured `PageData` object (see Page Reader section)
- Updates `session` object with current page context

### callApi(url, method, body)

```js
callApi(url, method, body)
```
- Direct `fetch()` call to the backend API
- Auto-attaches JWT Bearer token from localStorage
- Returns `{ success, data, status, pageData }`
- Used for backend-side operations where DOM manipulation is unnecessary

### verify(expected)

```js
verify(expected, actual)
```
- Compares expected vs actual state
- Checks: pageType, paymentMethod, loginStatus, cartItemCount, orderCount, profile fields
- Returns `{ verified: boolean, mismatch: string | null }`

### Retry Strategy

| Condition | Retries | Delay | Total Timeout |
|-----------|---------|-------|---------------|
| Element not found | 3 | 1s | ~7s (waitForTarget) + 3s (retries) |
| Navigation timeout | 3 | 1s | ~10s + 3s |
| Page not ready | 2 | 500ms | ~7s (waitForPageReady) |
| Action failure | 2 (configurable) | 1s | Per action on backend |

### Verification Strategy

After every action, the executor:
1. Calls `readPage()` to get fresh DOM state
2. Compares result against `expected` object from backend
3. Sets `verified: true/false` in the result
4. Backend runs its own 3-layer verification

---

## 5. Page Reader

### File: `src/services/pageReader.js`

**Purpose:** Extracts structured, typed data from the DOM for every page type. Used by the frontend executor to build snapshots for the AI backend.

### readHomePage()

| Extracted Data | Source |
|----------------|--------|
| `type: 'home'` | Route path |
| `bannerCount` | Banner carousel slides count |
| `categoryCount` | Category grid items count |

### readProductPage()

| Extracted Data | Source |
|----------------|--------|
| `type: 'product_list'` | Route path + check product grid |
| `count` | Number of product cards found |
| `products[]` | Array of `{ id, index, title, price, rating, image, availability }` |
| `id` | Product ID from link URL or data attribute |
| `title` | Product title text |
| `price` | Price text (numeric extracted) |
| `rating` | Rating text (numeric extracted) |
| `image` | Image src attribute |
| `availability` | Stock/in stock indicator text |

**Selector strategy:** `data-agent="product-card"` first, then CSS class fallback.

### readProductDetailPage()

| Extracted Data | Source |
|----------------|--------|
| `type: 'product_detail'` | Route path + product title element |
| `id` | From URL params or data attribute |
| `title` | `data-agent="product-title"` or heading |
| `price` | `data-agent="product-price"` or price element |
| `rating` | Rating element |
| `image` | Main product image src |
| `description` | Description text |
| `hasAddToCartButton` | Presence of add-to-cart button |
| `hasBuyNowButton` | Presence of buy-now button |
| `inStock` | Stock indicator |

### readCheckoutPage() (/buy-now)

| Extracted Data | Source |
|----------------|--------|
| `type: 'checkout'` | Route path |
| `phone` | Current phone display text |
| `address` | Current address display text |
| `hasPhone` | Whether phone field has value |
| `hasAddress` | Whether address field has value |
| `paymentMethod` | Currently selected payment radio |
| `paymentOptions[]` | Array of `{ label, value, checked }` — always present (may be empty). Read from DOM radios. |
| `canEditPhone` | Edit button presence for phone |
| `canEditAddress` | Edit button presence for address |
| `isEditingPhone` | Whether phone edit mode is active |
| `isEditingAddress` | Whether address edit mode is active |
| `hasPlaceOrderButton` | Presence of Place Order button |

**`paymentOptions` format:**
```json
[
  { "label": "Cash on Delivery", "value": "COD", "checked": false },
  { "label": "UPI", "value": "UPI", "checked": false },
  { "label": "Credit Card", "value": "Card", "checked": true }
]
```
- `label` — Display text (used in chatbot buttons)
- `value` — Radio button value (used for DOM selection)
- `checked` — Whether this radio is currently selected

### readProfilePage() (/profile)

| Extracted Data | Source |
|----------------|--------|
| `type: 'profile'` | Route path |
| `name` | Profile name display |
| `email` | Profile email display |
| `phone` | Profile phone display |
| `address` | Profile address display |
| `hasEditDialog` | Whether edit modal/dialog is visible |
| `stats[]` | Order/cart summary stat elements |

### readOrdersPage() (/orders)

| Extracted Data | Source |
|----------------|--------|
| `type: 'orders'` | Route path |
| `orders[]` | Array of `{ id, shortId, status, date, total, items[], canCancel, canReorder }` |
| `count` | Number of orders |
| `hasConfirmationDialog` | Cancel confirmation dialog visibility |
| `hasConfirmButton` | Confirm cancel button presence |

### readCartPage() (/cart)

| Extracted Data | Source |
|----------------|--------|
| `type: 'cart'` | Route path |
| `items[]` | Array of `{ id, title, price, quantity, image, hasRemoveButton }` |
| `itemCount` | Total items count |
| `isEmpty` | Boolean — cart has no items |
| `totalAmount` | Total price display |
| `hasCheckoutButton` | Proceed to checkout button presence |
| `hasContinueShoppingButton` | Continue shopping button presence |
| `hasClearCartButton` | Clear cart button presence |

### readLoginPage() (/login)

| Extracted Data | Source |
|----------------|--------|
| `type: 'login'` | Route path |
| `hasEmailField` | Email input field presence |
| `hasPasswordField` | Password input field presence |
| `hasLoginButton` | Submit button presence |
| `emailFilled` | Whether email field has value |
| `passwordFilled` | Whether password field has value |

### readSignupPage() (/signup)

| Extracted Data | Source |
|----------------|--------|
| `type: 'signup'` | Route path |
| `hasNameField` | Name input field presence |
| `hasEmailField` | Email input field presence |
| `hasPasswordField` | Password input field presence |
| `hasConfirmField` | Confirm password field presence |
| `hasSubmitButton` | Submit button presence |
| `nameFilled`, `emailFilled`, `passwordFilled`, `confirmFilled` | Field value states |

### readOrderSuccessPage() (/order-success)

| Extracted Data | Source |
|----------------|--------|
| `type: 'order_success'` | Route path |
| `orderId` | Order ID display text |
| `amount` | Order amount display |

### readGenericPage() (fallback)

| Extracted Data | Source |
|----------------|--------|
| `type: 'page_info'` | Document title |
| `title` | Document title |
| `heading` | First h1/h2 heading text |

### Auto-Detection (readPage)

```
readPage()
  ├── if path === '/' or '/home' → readHomePage()
  ├── if path === '/products' → readProductListPage()
  ├── if path starts with '/product/' → readProductDetailPage()
  ├── if path === '/cart' → readCartPage()
  ├── if path === '/buy-now' → readCheckoutPage()
  ├── if path === '/login' → readLoginPage()
  ├── if path === '/signup' → readSignupPage()
  ├── if path === '/profile' → readProfilePage()
  ├── if path === '/orders' → readOrdersPage()
  ├── if path === '/order-success' → readOrderSuccessPage()
  └── else → readGenericPage()
```

---

## 6. Checkout Page (BuyNowPage.jsx)

### Page Structure

```
/buy-now (BuyNowPage)
├── Delivery Information Section
│   ├── Phone (with edit toggle)
│   │   ├── Display text (editable inline)
│   │   └── Edit input field (data-agent="checkout-phone-input")
│   └── Address (with edit toggle)
│       ├── Display text (editable inline)
│       └── Edit textarea (data-agent="checkout-address-input")
├── Payment Method Section
│   ├── Radio: COD (data-agent="checkout-payment-input" value="COD")
│   ├── Radio: UPI (data-agent="checkout-payment-input" value="UPI")
│   └── Radio: Card (data-agent="checkout-payment-input" value="Card")
├── Order Summary
│   ├── Items, quantities, prices
│   └── Total amount display
└── Place Order Button (data-agent="checkout-place-order")
```

### React State

```js
const [profile, setProfile] = useState(null)       // { phone, address }
const [phone, setPhone] = useState('')              // Editable phone
const [address, setAddress] = useState('')          // Editable address
const [editingPhone, setEditingPhone] = useState(false)
const [editingAddress, setEditingAddress] = useState(false)
const [paymentMethod, setPaymentMethod] = useState('') // 'COD' | 'UPI' | 'Card'
const [loading, setLoading] = useState(true)
const [placing, setPlacing] = useState(false)
```

### Effects

```
useEffect on mount:
  ├── Fetch profile: GET /api/users/profile
  ├── Fetch cart: GET /api/cart (for summary)
  ├── Set phone + address from profile
  └── Set loading = false

useEffect for AI events:
  Listen for:
    ├── "aiCheckoutData" custom event
    │     → Set phone, address, paymentMethod from event detail
    └── "aiPlaceOrder" custom event
          → Trigger place order logic
```

### API Calls

| Call | When | Endpoint |
|------|------|----------|
| Fetch profile | Mount | GET /api/users/profile |
| Fetch cart | Mount | GET /api/cart |
| Update profile | Phone/address save | PUT /api/users/profile |
| Place order | Place Order click | POST /api/orders/buy |

### Events

| Event | Dispatched By | Listener | Detail |
|-------|---------------|----------|--------|
| `aiCheckoutData` | AI executor (fillInput / selectDropdown) | BuyNowPage | `{ phone, address, paymentMethod }` |
| `aiPlaceOrder` | AI executor (click place-order) | BuyNowPage | `{}` triggers `handlePlaceOrder()` |
| `aiSelectPayment` | AI executor (selectPaymentMethod) | BuyNowPage | `{ paymentMethod }` confirms the selected method |

### Checkout Flow (User path)

```
1. User lands on /buy-now
2. Profile loaded → phone + address displayed
3. User can edit phone/address inline (open edit → type → save)
4. Payment options dynamically read from DOM via readCheckoutPage()
5. AI renders payment options as chatbot buttons (Cash on Delivery / UPI / Card)
6. User clicks a payment option in the chatbot
7. AI calls selectPaymentMethod(value) → finds radio → clicks → verifies checked=true
8. AI clicks Place Order
9. POST /api/orders/buy with { items, address, paymentMethod, totalAmount }
10. On success → navigate to /order-success with order data (state)
```

---

## 7. Profile Page (UserProfile.jsx)

### Page Structure

```
/profile (UserProfile)
├── User Info Card
│   ├── Name (display)
│   ├── Email (display)
│   ├── Phone (display)
│   └── Address (display)
├── Edit Button (data-agent="profile-edit")
│   └── Opens Edit Modal/Dialog (data-agent="profile-edit-dialog")
│       ├── Name input (data-agent="profile-input-name")
│       ├── Email input (data-agent="profile-input-email")
│       ├── Phone input (data-agent="profile-input-phone")
│       ├── Address textarea (data-agent="profile-input-address")
│       └── Save Button (data-agent="profile-save")
├── Cart Summary Section
└── Recent Orders Section
```

### Flow

```
Fetch Profile
  │
  ▼
GET /api/users/profile → display name, email, phone, address
  │
  ▼
[User clicks Edit] OR [AI dispatches aiProfileUpdate event]
  │
  ▼
Open edit dialog → pre-fill current values
  │
  ▼
[User edits fields] OR [AI fills via fillInput → dispatches aiProfileUpdate]
  │
  ▼
Click Save (data-agent="profile-save")
  │
  ▼
PUT /api/users/profile { fields }
  │
  ▼
Verify: re-fetch profile → compare values
  │
  ▼
AI: backend mock-verifies (Layer 3) checks MongoDB directly
```

### Events

| Event | Dispatched By | Listener | Detail |
|-------|---------------|----------|--------|
| `aiProfileUpdate` | AI executor (fillInput on profile inputs) | UserProfile | `{ name?, email?, phone?, address? }` — triggers re-fetch |
| `aiGetProfileData` | AI executor (readPage on profile page) | UserProfile | No detail — responds with `CustomEvent('aiProfileData', { detail: profile })` |

---

## 8. Cart Page (CartPage.jsx)

### Page Structure

```
/cart (CartPage)
├── Cart Items List
│   └── For each item:
│       ├── Product image
│       ├── Title
│       ├── Price
│       ├── Quantity selector (+ / -)
│       └── Remove button
├── Cart Totals (subtotal, shipping, total)
├── Proceed to Checkout button
└── Continue Shopping button
```

### Flow

```
Add Item (from ProductDetail)
  ├── POST /api/cart/add { productId, title, price, image }
  └── Verify: fetch cart, check item exists
       │
       ▼
Navigate to /cart
  │
  ├── Remove Item
  │     ├── Click Remove button (data-agent="cart-remove")
  │     └── DELETE /api/cart/remove/:itemId
  │
  ├── Update Quantity
  │     ├── Click +/- button
  │     └── PUT /api/cart/update-quantity { itemId, quantity }
  │
  ├── Clear Cart
  │     └── DELETE /api/cart/clear
  │
  └── Checkout
        ├── Click "Proceed to Checkout"
        └── navigate('/buy-now')
```

---

## 9. Orders Page (OrdersPage.jsx)

### Page Structure

```
/orders (OrdersPage)
├── Order List
│   └── For each order:
│       ├── Order ID + Date
│       ├── Status badge (Placed / Cancelled)
│       ├── Items summary
│       ├── Total amount
│       ├── Cancel button (if status === 'Placed')
│       ├── Reorder button
│       └── Checkbox (for bulk delete)
├── Confirmation Dialog (for cancel)
│   ├── "Are you sure?" text
  │   ├── Confirm action button (data-agent="order-confirm")
  │   └── Dismiss button (data-agent="order-confirm-cancel")
│   └── Cancel (close) button
└── Delete Selected button
```

### Flow

```
List Orders
  ├── GET /api/orders → display list
  │
  ├── Cancel Order
  │     ├── Click Cancel (data-agent="order-cancel")
  │     ├── Confirmation dialog appears
  │     ├── Click Confirm (data-agent="order-confirm")
  │     ├── PUT /api/orders/cancel/:orderId
  │     └── Verify: status changed to 'Cancelled'
  │
  ├── Reorder
  │     ├── POST /api/orders/reorder/:orderId
  │     └── Verify: new order created
  │
  └── Bulk Delete
        ├── Select orders via checkboxes
        ├── Click Delete Selected
        └── DELETE /api/orders/delete { orderIds }
```

---

## 10. Login Page (LoginPage.jsx)

### Page Structure

```
/login (LoginPage)
├── Email/Username input (data-agent="login-identifier")
├── Password input (data-agent="login-password")
└── Login button (data-agent="login-submit")
```

### Flow (Non-AI)

```
User fills email/username + password
  │
  ▼
POST /api/auth/login { identifier, password }
  │
  ├── Success:
  │     ├── Store token, userId, username in localStorage
  │     └── navigate('/')
  │
  └── Failure:
        └── Show error message
```

### Flow (AI-driven)

```
AI navigates to /login
  │
  ▼
AI fills email field via fillInput (data-agent="login-identifier")
AI fills password field via fillInput (data-agent="login-password")
  │
  ▼
AI clicks Login button via click (data-agent="login-submit")
  │
  ▼
AI verifies: loginStatus === true
  │
  ▼
If previous workflow existed → resume it
Else → "Logged in successfully"
```

### State & localStorage

```js
// On login success:
localStorage.setItem('token', jwtToken)
localStorage.setItem('userId', user._id)
localStorage.setItem('username', user.name)
```

---

## 11. Signup Page (SignupPage.jsx)

### Page Structure

```
/signup (SignupPage)
├── Full Name input (data-agent="signup-name")
├── Email input (data-agent="signup-email")
├── Password input (data-agent="signup-password")
├── Confirm Password input (data-agent="signup-confirm-password")
└── Create Account button (data-agent="signup-submit")
```

### Flow (Non-AI)

```
User fills all fields
  │
  ▼
Client-side validation:
  ├── Name: non-empty
  ├── Email: valid format
  ├── Password: min 8 chars
  └── Confirm: matches password
  │
  ▼
POST /api/auth/register { name, email, password }
  │
  ├── Success:
  │     ├── Auto-login (JWT stored)
  │     └── navigate('/')
  │
  └── Failure:
        └── Show error (e.g., email already exists)
```

### Flow (AI-driven)

```
AI navigates to /signup
  │
  ▼
AI asks user for: Name → Email → Password → Confirm Password
  │
  ▼
AI fills fields sequentially:
  └── fillInput(name) → fillInput(email) → fillInput(password) → fillInput(confirm)
  │
  ▼
AI clicks Sign Up / Create Account (data-agent="signup-submit")
  │
  ▼
AI verifies: loginStatus === true, user exists in DB
  │
  ▼
If previous workflow existed → resume it
Else → "Account created! What would you like to do?"
```

---

## 12. Global Workflow Rules

> These rules must be strictly followed by the backend workflow engine. They guarantee consistent user experience across all automation flows.

### Order Flow Sequence

```
Search
  ▼
Open Product
  ▼
Checkout
  ▼
Profile
  ▼
Payment
  ▼
Place Order
  ▼
Success
```

**Rule:** Never restart the search after reaching checkout. If the user changes their mind during checkout, do NOT reopen the product page or restart the search. Ask for confirmation and continue from current state.

### Profile Rule

If profile already has phone and address:

> "Your profile already contains: Phone: <phone> Address: <address> Would you like to change them?"

**If YES:**
```
Ask Phone
  ▼
Ask Address
  ▼
Update Profile
  ▼
Return Checkout
  ▼
Ask Payment
  ▼
Place Order
```

**Do NOT restart product search. Do NOT reopen product. Do NOT reopen checkout. Resume from the current checkout.**

**If NO:**
```
Skip profile update
  ▼
Ask Payment
  ▼
Place Order
```

### Payment Rule

Always ask payment method inside the chatbot.

Available payment methods:
- **COD** (Cash on Delivery)
- **UPI** (Unified Payments Interface)
- **Card** (Credit/Debit Card)

User selects one → Bot selects the same option in the website → Verify selection → Click Place Order.

### Cart Rules

Support these operations:
- **Add item:** Search → Open product → Click Add to Cart → Verify
- **Remove item:** Navigate cart → Find item → Click Remove → Verify
- **Update quantity:** Navigate cart → Find item → Click +/- → Verify
- **Checkout:** Click Checkout button → Enter checkout flow

### Orders Rules

Support these operations:
- **Order list:** Navigate /orders → Read → Summarize
- **Order details:** Show items, status, total, date from read data
- **Cancel order:** Navigate /orders → Find cancellable → Click Cancel → Confirm → Verify

### Profile Rules

Support these operations:
- **View profile:** Navigate /profile → Read → Summarize
- **Edit profile:** Open dialog → Fill fields → Save → Verify
- **Update phone:** Fill phone field → Save → Verify
- **Update address:** Fill address field → Save → Verify

### Authentication Rules

Support these operations:
- **Create account:** Navigate /signup → Ask fields → Fill → Submit → Verify
- **Login:** Navigate /login → Ask fields → Fill → Submit → Verify
- **Logout:** Navigate /profile → Click Logout → Verify

**Critical Rule: After successful login or signup, automatically resume the workflow the user was performing before authentication.** For example:
- User starts checkout → hits auth gate → logs in → checkout continues automatically
- User searches for products → needs to login → after login → search results shown again

---

> **This document must be updated whenever the project changes.**
> Before implementing any new feature or bug fix:
> 1. Read this file
> 2. Update documentation if the workflow changes
> 3. Implement the code
> 4. Verify existing workflows still work end-to-end
