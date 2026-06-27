# EcoMart — Frontend/Client Submission Report (Academic Technical)

**Repository:** EcoMart (MERN)

**Scope of report:** This document reports on the work completed on the **frontend/client** side (React + TypeScript), including the customer-facing storefront and the embedded admin client experience.

---

## 1. Frontend Technology Stack

The client application is implemented using:

- **React** (component-based UI)
- **TypeScript** (static typing for API payloads and component props)
- **Vite** (modern dev server and build tooling)
- **React Router** (SPA routing)
- **Tailwind CSS** (utility-first styling)
- **Axios** (REST API integration)

---

## 2. High-Level Frontend Architecture

### 2.1 Application entry and routing

Routing is centralized in the client entry component:

- `client/src/App.tsx`
  - Uses `<Routes>` and `<Route>` to map storefront and account pages.
  - Declares admin routes under `/admin/*` via an internal `AdminRoutes()` component.

### 2.2 Separation of concerns

The client is structured into clear layers:

1. **API layer** (network + typing)
   - `client/src/api/client.ts` — Axios instances + auth token interceptors
   - `client/src/api/endpoints.ts` — typed endpoints for customer flows
   - `client/src/api/admin.ts` — typed endpoints for admin/vendor flows

2. **State/Authentication layer** (context)
   - `client/src/context/AuthContext.tsx` — customer JWT, session hydration, cart count refresh
   - `client/src/context/AdminAuthContext.tsx` — adminToken + role gating for customer vs vendor vs super-admin

3. **UI layer** (components and pages)
   - `client/src/components/*` — reusable UI components (e.g., `Navigation`, `ProductCard`)
   - `client/src/pages/*` — storefront pages
   - `client/src/admin/*` — admin layout, sidebar, and admin pages

---

## 3. Authentication & Authorization Model (Client-Side)

### 3.1 Customer authentication (JWT)

Implemented in:

- `client/src/context/AuthContext.tsx`

Key characteristics:

- JWT token stored in `localStorage` under `token`.
- `useEffect` hydrates the session by calling `authAPI.getMe()`.
- A derived state `cartCount` is maintained by calling `cartAPI.get()` via `refreshCart()`.

Customer API requests are authenticated through:

- `client/src/api/client.ts`
  - Axios request interceptor attaches:
    - `Authorization: Bearer <token>`
    - token read from `localStorage.getItem('token')`

### 3.2 Admin/Vendor authentication (role-based client gating)

Implemented in:

- `client/src/context/AdminAuthContext.tsx`

Key characteristics:

- Admin token stored in `localStorage` under `adminToken`.
- `loadUser()` calls `adminApiClient.get('/auth/me')` and validates role:
  - Accepts roles: `vendor` and `super-admin`
  - If user is not an approved admin role, token is removed and authentication is revoked.

Admin API requests are authenticated through:

- `client/src/api/client.ts`
  - A separate Axios instance `adminApiClient`
  - Interceptor attaches `Authorization: Bearer <adminToken>` from `localStorage.getItem('adminToken')`

### 3.3 Admin route protection

The admin interface is guarded by:

- `client/src/admin/components/AdminLayout.tsx`
  - Allows `/admin/login` to render without protection.
  - While loading, a spinner/loading screen is shown.
  - If not authenticated, the client redirects to `/admin/login`.

Additionally, navigation elements are role-aware:

- `client/src/admin/components/AdminSidebar.tsx`
  - Displays the **Vendors** menu only for `super-admin`.

---

## 4. API Integration & Data Contracts

### 4.1 API base URL resolution

API base URL is configured in:

- `client/src/api/client.ts`

Behavior:

- Uses `import.meta.env.VITE_API_URL` with fallback to `http://localhost:5000/api`.

### 4.2 Typed endpoint definitions

Customer endpoints defined in:

- `client/src/api/endpoints.ts`

Includes:

- Auth: `register`, `login`, `getMe`, `updateProfile`
- Products: `getAll`, `getById`, `search`
- Cart: `get`, `add`, `remove`, `update`, `clear`
- Wishlist: `get`, `add`, `remove`, `check`
- Orders: `getAll`, `getById`, `create`, `cancel`

Admin endpoints defined in:

- `client/src/api/admin.ts`

Includes:

- Vendors: `getVendors`, `createVendor`, `updateVendor`, `getVendor`
- Products: `getProducts`, `createProduct`, `updateProduct`, `deleteProduct`, `approveProduct`
- Orders: `getOrders`, `updateOrderStatus`
- Dashboard: `getStats`

### 4.3 Data modeling for consistent UI rendering

Representative types include:

- `Product` and `Order` for storefront
- `AdminProduct`, `AdminOrder`, `Vendor` for admin UI

This ensures predictable rendering and reduces runtime shape errors.

---

## 5. Customer Storefront (Client-Side Implementation)

### 5.1 Navigation & global UX elements

- `client/src/components/Navigation.tsx`
  - Sticky top navigation bar.
  - Conditional rendering based on `isAuthenticated`.
  - Cart badge driven by `cartCount`.
  - Responsive mobile menu behavior.

### 5.2 Product catalog with filtering and sorting

Implemented in:

- `client/src/pages/ProductsPage.tsx`

Mechanisms:

- Uses `useSearchParams()` to persist filter state in the URL.
  - Category: `category`
  - Sort: `sortBy`
  - Pagination: `page` (currently wired to API page param)
- Filters and sorting are applied server-side through:
  - `productsAPI.getAll(page, 12, category?, sortBy, 'asc')`

UX behaviors:

- Mobile filter toggle (`filtersOpen`).
- Active filter indication.

### 5.3 Product details and add-to-cart workflow

Implemented in:

- `client/src/pages/ProductDetailPage.tsx`

Workflow:

1. Fetch product by `id` using `productsAPI.getById(id)`
2. Present size and color selectors when available.
3. Enforce authentication:
   - If not authenticated, redirect to `/login`.
4. Add-to-cart:
   - `cartAPI.add(id, quantity, selectedSize, selectedColor)`
5. Provide feedback via a lightweight toast component.

Notable UX implementation details:

- Quantity controls clamp to valid ranges.
- Toast auto-dismiss via timeout.

### 5.4 Cart management

Implemented in:

- `client/src/pages/CartPage.tsx`

Capabilities:

- Auth guard: redirect unauthenticated users to `/login`.
- Remove item: `cartAPI.remove(itemId)`
- Update quantity: `cartAPI.update(itemId, quantity)`
- Quantity < 1 triggers a remove.
- “Order summary” is derived from `cart.totalPrice`.

### 5.5 Checkout (Shipping + Order creation)

Implemented in:

- `client/src/pages/CheckoutPage.tsx`

Capabilities:

- Auth guard enforced.
- Loads cart for summary using `cartAPI.get()`.
- Shipping form collects:
  - `street`, `city`, `state`, `zipCode`, `country`
- On submit:
  - `ordersAPI.create(formData)`
  - Navigates to `/account/orders`.
- Error UI is displayed if checkout fails.

### 5.6 Customer order history

Implemented in:

- `client/src/pages/OrdersPage.tsx`

Features:

- Auth guard.
- Fetches orders with `ordersAPI.getAll()`.
- Renders status using Tailwind-based conditional styling.

---

## 6. Admin Client (Management Interface)

### 6.1 Admin authentication entry point

Implemented in:

- `client/src/admin/pages/AdminLoginPage.tsx`

Behavior:

- Uses `useAdminAuth().login(email, password)`.
- On successful login navigates to `/admin`.
- Displays server-side errors using structured error extraction.

### 6.2 Admin dashboard with role-specific statistics

Implemented in:

- `client/src/admin/pages/DashboardPage.tsx`

Mechanism:

- Calls `adminAPI.getStats()`.
- Conditional rendering based on `isAdmin`:
  - Super-admin: total products, orders, vendors, users, total revenue.
  - Vendor: my products, my orders, revenue.

### 6.3 Product management (CRUD + approval state)

Primary implementation:

- `client/src/admin/pages/AdminProductsPage.tsx`

Core functionalities:

- Fetch products list using `adminAPI.getProducts()`.
- Table-based management UI.
- Add/Edit Product through a modal form:
  - Form state includes:
    - name, description, price, images, sizes, colors, stock, category, sustainable
  - Supports two operational modes:
    - Create when `editingProduct === null`
    - Update when editing a selected record
- Deletion:
  - `adminAPI.deleteProduct(id)` with confirmation prompt.

Approval/pending display:

- Status chip derives from `product.isApproved`.

### 6.4 Order management (status updates)

Implemented in:

- `client/src/admin/pages/AdminOrdersPage.tsx`

Features:

- Loads orders via `adminAPI.getOrders()`.
- Enables order status updates using a `<select>` control.
- Updates the UI optimistically by mapping local state after successful `adminAPI.updateOrderStatus(orderId, status)`.

### 6.5 Vendor management

Implemented in:

- `client/src/admin/pages/AdminVendorsPage.tsx`

Features:

- Loads vendor list via `adminAPI.getVendors()`.
- Adds vendor through modal with credential fields (email, password) and store info.
- Enables activation/deactivation:
  - `adminAPI.updateVendor(id, { isActive: !isActive })`

---

## 7. UI/UX Engineering Notes (Frontend)

### 7.1 Tailwind-based responsive design

Across storefront and admin UI, Tailwind classes are used to achieve:

- Responsive layout grids (e.g., products grid)
- Consistent card/table styling
- Conditional badges (status chips, sustainable label)

### 7.2 Loading and error handling patterns

Client pages implement:

- `loading` states with fallback “Loading …” screens
- Error UI (notably in checkout and admin login)
- Toast notifications in `ProductDetailPage`

### 7.3 Token-based request interception

The axios clients automatically attach JWT tokens for:

- Customer endpoints (`apiClient`)
- Admin endpoints (`adminApiClient`)

This avoids repetitive header wiring in each page.

---

## 8. Technical Quality and Limitations (Observed)

The following observations are derived from source inspection and should be considered in a grading context:

1. **Search tooling note**: filter/sort UI is wired via URL params, but there is no visible global search bar integration; the Navigation search inputs currently do not connect to API calls.
2. **Admin product approval action**: admin products display approval state (`isApproved`), but the current admin products page code primarily manages create/edit/delete and does not expose an explicit approve/unapprove UI control.
3. **Cart item rendering robustness**: in `CartPage.tsx`, cart item display contains runtime type checks and `as any` usage, suggesting cart payload shape may be broader than the UI assumptions.
4. **Console logging**: `client/src/api/client.ts` prints `API_BASE_URL` to the console, which is acceptable during development but should typically be removed before final submission.

---

## 9. Verification (Manual Check Strategy)

To validate frontend/client behavior during submission, the following manual test paths are recommended:

### 9.1 Storefront

- Browse product catalog and verify category filter + sort via URL params.
- Open a product detail page:
  - Verify size/color selection is reflected in cart payload.
  - Verify add-to-cart requires authentication.
- Cart:
  - Remove items
  - Update quantity
  - Verify order summary total updates.
- Checkout:
  - Submit shipping form while authenticated
  - Confirm navigation to `/account/orders`.
- Orders:
  - Verify order list loads and status badges render.

### 9.2 Admin

- Admin login:
  - Verify correct role acceptance.
- Dashboard:
  - Verify role-specific metrics (super-admin vs vendor).
- Products:
  - Verify create/edit/delete flows with modal UI.
- Orders:
  - Verify status updates via dropdown.
- Vendors:
  - Verify vendor creation modal and activate/deactivate toggle.

---

## 10. Referenced Frontend Files (for Instructor Review)

Customer/client:

- `client/src/App.tsx`
- `client/src/components/Navigation.tsx`
- `client/src/components/ProductCard.tsx`
- `client/src/context/AuthContext.tsx`
- `client/src/api/client.ts`
- `client/src/api/endpoints.ts`
- `client/src/pages/ProductsPage.tsx`
- `client/src/pages/ProductDetailPage.tsx`
- `client/src/pages/CartPage.tsx`
- `client/src/pages/CheckoutPage.tsx`
- `client/src/pages/OrdersPage.tsx`

Admin/client:

- `client/src/admin/components/AdminLayout.tsx`
- `client/src/admin/components/AdminSidebar.tsx`
- `client/src/context/AdminAuthContext.tsx`
- `client/src/api/admin.ts`
- `client/src/admin/pages/AdminLoginPage.tsx`
- `client/src/admin/pages/DashboardPage.tsx`
- `client/src/admin/pages/AdminProductsPage.tsx`
- `client/src/admin/pages/AdminOrdersPage.tsx`
- `client/src/admin/pages/AdminVendorsPage.tsx`

---

## Summary of Major Frontend Processes (15 lines)

1. Set up the React SPA structure and routing in `client/src/App.tsx`.
2. Implemented typed API clients for customer and admin flows (`client/src/api/*`) using axios and token interceptors.
3. Built customer JWT authentication + session hydration with `client/src/context/AuthContext.tsx`.
4. Built admin/vendor role gating with `client/src/context/AdminAuthContext.tsx`.
5. Protected storefront routes by redirecting unauthenticated users (Auth guards in pages like Cart/Checkout).
6. Implemented product browsing with URL-driven filters/sorting/pagination (`client/src/pages/ProductsPage.tsx`).
7. Implemented product details and add-to-cart workflow with quantity + size/color selection (`ProductDetailPage`).
8. Implemented cart UI actions (remove/update quantity) and order summary calculations (`CartPage`).
9. Implemented checkout form submission that creates orders and navigates to orders history (`CheckoutPage`).
10. Implemented order history fetching and status rendering (`OrdersPage`).
11. Implemented admin login using `AdminLoginPage` and role-aware navigation/layout (`AdminLayout`, `AdminSidebar`).
12. Implemented admin dashboard stats using `adminAPI.getStats()` with super-admin vs vendor views (`DashboardPage`).
13. Implemented admin product management CRUD with modal workflows and pending/approved display (`AdminProductsPage`).
14. Implemented admin order management status updates with dropdown control (`AdminOrdersPage`).
15. Implemented admin vendor management (add vendor + activate/deactivate) (`AdminVendorsPage`).

## Conclusion

The EcoMart frontend/client implements a complete end-to-end user experience for a commerce workflow—product browsing, detail viewing, cart management, checkout, and order history—alongside a dedicated admin management interface for dashboard analytics, product administration, order status updates, and vendor management. The design emphasizes typed API contracts, token-based request authentication, role-aware admin gating, and responsive Tailwind-based UI rendering.
