# EcoMart — Backend Submission Report (Academic Technical)

**Repository:** EcoMart (MERN)

**Scope of report:** This document reports on the work completed on the **backend/server** side (Express + TypeScript), covering the system design, major features, and how key tasks were implemented.

---

## 1. Backend Technology Stack

The backend is implemented using:

- **Node.js** (runtime)
- **Express.js** (web server + routing)
- **TypeScript** (static typing for request/response contracts and safer refactors)
- **MongoDB** (persistent storage)
- **Mongoose** (ODM layer for schemas/models and querying)
- **JWT** (authentication for customers and role-based access control for vendors/admin)
- **bcryptjs** (secure password hashing)
- **CORS** (cross-origin requests from the Vite frontend)
- **Swagger UI** (API documentation)

---

## 2. High-Level Backend Architecture

### 2.1 Server bootstrap and middleware

Key entry point:

- `server/src/server.ts`
  - Initializes environment configuration via `dotenv`.
  - Configures **CORS allowlist** for local dev origins.
  - Enables **Swagger UI** at `/api/docs`.
  - Serves a **SPA build** when `client/dist/index.html` exists.
  - Mounts API route groups under `/api/*`.
  - Connects to MongoDB using `dbConnect()` before starting the HTTP server.

### 2.2 Route structure

Major route groups:

- `server/src/routes/auth.ts` — customer registration/login/profile
- `server/src/routes/products.ts` — storefront products (filtering/sorting/pagination)
- `server/src/routes/cart.ts` — cart CRUD (add/update/remove/clear)
- `server/src/routes/wishlist.ts` — wishlist management
- `server/src/routes/orders.ts` — order history/creation/cancellation
- `server/src/routes/admin.ts` — vendor + super-admin operations and dashboard stats
- `server/src/routes/paystack.ts` — payment initialization + webhook processing

### 2.3 Authentication/authorization middleware

Authentication is centralized in:

- `server/src/middleware/auth.ts`
  - `authMiddleware` validates `Authorization: Bearer <token>` using `JWT_SECRET`.
  - Decodes `userId`, `role`, and `vendorId` from the JWT payload.
  - Exposes role helpers:
    - `requireVendor` (vendor or super-admin)
    - `requireSuperAdmin` (super-admin)

This approach was preferred because it enforces consistent access rules across all protected endpoints and keeps authorization logic out of route handlers.

---

## 3. Major Features and Implementation Details

## 3.1 Customer authentication and session model (JWT)

Implemented in:

- `server/src/routes/auth.ts`

What was built:

- **Register**: validates required fields, checks for existing users, hashes passwords with `bcryptjs`, creates a user plus empty cart/wishlist documents.
- **Login**: validates email/password, generates a signed JWT with role and vendor linkage (if present).
- **Profile**:
  - `GET /api/auth/me` returns the user record without the password.
  - `PUT /api/auth/me` updates user fields.

Why JWT was preferred:

- Stateless authentication works naturally with a REST API.
- Role and vendor scoping can be embedded in token claims to support vendor-specific behavior.

---

## 3.2 Product browsing API (filtering, sorting, pagination)

Implemented in:

- `server/src/routes/products.ts`

Key capabilities:

- `GET /api/products`
  - Only returns approved products (`isApproved: true`).
  - Supports query-based filtering (category), sorting (price/rating/newest), and pagination (`page`, `limit`).
- `GET /api/products/:id`
  - Returns full product details.
- `GET /api/products/search/:query`
  - Searches across `name`, `description`, and `category` using case-insensitive regex.
- `GET /api/products/categories`
  - Aggregates category counts with MongoDB aggregation.

Additional engineering detail:

- Product images are normalized through `ensureValidImages` to keep response shapes consistent for the frontend UI.

---

## 3.3 Cart management (user-scoped persistence)

Implemented in:

- `server/src/routes/cart.ts`

Key endpoints:

- `GET /api/cart` — fetches cart and populates `items.productId`.
- `POST /api/cart/add` — validates product availability (`isApproved`), merges cart items by `(productId, size, color)`, and recalculates `totalPrice`.
- `PUT /api/cart/update` — updates item quantity and recalculates totals.
- `POST /api/cart/remove` — removes a cart item and recalculates totals.
- `DELETE /api/cart` — clears the cart.

Why this approach:

- Storing cart per user allows cart state to persist across refreshes and sessions.
- Recalculating `totalPrice` on each mutation ensures totals remain consistent even when product pricing changes.

---

## 3.4 Wishlist management

Implemented in:

- `server/src/routes/wishlist.ts`

Key endpoints:

- `GET /api/wishlist` — returns wishlist and populates product details.
- `POST /api/wishlist/add` — adds a product if it is not already present.
- `POST /api/wishlist/remove` — removes by productId.
- `GET /api/wishlist/check/:productId` — returns a boolean indicating whether the product is in the wishlist.

---

## 3.5 Orders: checkout, history, and cancellation

Implemented in:

- `server/src/routes/orders.ts`

Customer flows:

- `GET /api/orders`
  - Returns order history for the authenticated user.
- `GET /api/orders/:id`
  - Ensures the order belongs to the logged-in user.
- `POST /api/orders`
  - Creates a new order from the user cart.
  - Sets `status: 'pending'`.
  - Clears the cart after order creation.
- `PUT /api/orders/:id/cancel`
  - Restricts cancellation based on current status (`pending`/`processing`).

Why it was implemented this way:

- Using the cart as the order source of truth prevents mismatch between the checkout preview and the persisted order.
- Clearing the cart after order creation avoids duplicated items.

---

## 3.6 Admin + Vendor back-office (role-based access)

Implemented in:

- `server/src/routes/admin.ts`

What was built:

- **Vendor creation and management** (super-admin only)
  - `POST /api/admin/vendors` creates a vendor and an associated vendor user.
  - `GET /api/admin/vendors` lists all vendors.
  - `PUT /api/admin/vendors/:id` allows toggling/updates with permission checks.

- **Product administration**
  - `GET /api/admin/products` returns products scoped to vendor users.
  - `POST /api/admin/products` creates products; vendors create as `isApproved: false`, super-admin can create as approved.
  - `PUT /api/admin/products/:id` updates products with vendor ownership rules.
  - `DELETE /api/admin/products/:id` deletes products with ownership checks.
  - `PUT /api/admin/products/:id/approve` is restricted to super-admin.

- **Order administration**
  - `GET /api/admin/orders` returns orders with `items.productId` populated, filtered by vendor scope.
  - `PUT /api/admin/orders/:id/status` updates order status with vendor access validation.

- **Dashboard statistics**
  - `GET /api/admin/dashboard/stats`
  - Uses MongoDB counts and aggregation to compute total revenue and operational metrics.

Why role-based gates were preferred:

- Enforces least privilege: vendors only access their own items; super-admin can access everything.
- Centralized middleware keeps the code maintainable as more admin features are added.

---

## 3.7 Payment integration (Paystack): initialize + webhook processing

Implemented in:

- `server/src/routes/paystack.ts`

Key endpoints:

- `POST /api/paystack/initialize`
  - Validates cart and shipping address.
  - Converts displayed KES totals to Paystack amount (smallest currency unit) using `amountKES = cart.totalPrice * 130`.
  - Creates a payment reference and persists an order in `status: 'pending'`.
  - Calls Paystack `transaction/initialize` and returns `authorization_url` + `reference`.

- `POST /api/paystack/webhook`
  - Verifies the Paystack signature.
  - Handles successful charge events (`charge.success` / `transfer.success`).
  - Finds the order by payment reference and updates status to `processing`.
  - Clears the user cart after confirmed payment.

Why this design:

- The webhook-driven flow ensures the order state changes only after Paystack confirms the transaction.
- Persisting `paymentReference` allows reliable matching between asynchronous webhook events and local order records.

---

## 4. API Documentation

Swagger is configured in `server/src/server.ts` and the auth routes include Swagger annotations.

- API docs are served at:
  - `/api/docs`

This was preferred because it makes the backend easier to verify and reduces ambiguity between frontend and backend payload contracts.

---

## 5. Deployment/Runtime Notes

- The server uses an SPA fallback when `client/dist/index.html` exists.
- The backend supports local development via CORS allowlisting.
- MongoDB connection is required for runtime features; server startup attempts to connect before listening.

---

## Summary of Major Backend Processes (15 lines)

1. Bootstrapped the API server (`server/src/server.ts`) with CORS, Swagger, and SPA fallback.
2. Connected to MongoDB before listening using `dbConnect()`.
3. Implemented customer auth (register/login/me + update) in `routes/auth.ts` using bcrypt + JWT.
4. Implemented request authentication via `middleware/auth.ts` (`authMiddleware`).
5. Implemented role gates for vendor/super-admin actions using `requireVendor` and `requireSuperAdmin`.
6. Built storefront product listing in `routes/products.ts` with approved-only filtering.
7. Added product query features: category filter, sorting, pagination, and regex search.
8. Normalized product image output via `utils/imageUtils.ts` for consistent UI payloads.
9. Implemented user cart persistence in `routes/cart.ts` (add/update/remove/clear) with totalPrice recalculation.
10. Implemented wishlist persistence in `routes/wishlist.ts` (add/remove/check + populated product details).
11. Implemented order history and order creation from cart in `routes/orders.ts`.
12. Implemented order cancellation rules based on order status.
13. Implemented vendor/admin back-office features in `routes/admin.ts` (vendors, product CRUD, approval, dashboard stats).
14. Implemented order status updates for back-office users with vendor scoping.
15. Implemented Paystack payment flow in `routes/paystack.ts` (initialize + signature-verified webhook updates + cart clearing).

## Conclusion

The EcoMart backend is a TypeScript-based Express/MongoDB API that supports a full ecommerce workflow: authentication, product browsing, cart/wishlist persistence, order lifecycle, vendor/admin back-office operations, and Paystack payment confirmation via webhooks. The implementation emphasizes typed authorization middleware, role-based access control, consistent data shaping (e.g., image normalization), and Swagger-based API documentation to enable reliable frontend integration.
