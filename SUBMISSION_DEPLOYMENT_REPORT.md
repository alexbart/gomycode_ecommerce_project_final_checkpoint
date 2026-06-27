# EcoMart — Deployment Report (Vercel)

**Repository(s):**

- Backend: `alexbart/gomycode_ecommerce_project_final_checkpoint` (server project)
- Frontend/Client: (same repo; Vite build served via Vercel routing/rewrites)

**Deployment Platform:** Vercel

---

## 1. Deployed Projects

1. **Server (backend) Vercel project**
   - Vercel project name: **gomycode-ecommerce-project-final-checkpoint-server**
   - Source: Git repository **alexbart/gomycode_ecommerce_project_final_checkpoint**

2. **Production Domain (Vercel)**
   - Domain: **https://gomycode-ecommerce-project-final-ch-coral.vercel.app/**

---

## 2. Vercel Configuration

### 2.1 Routing / SPA rewrites

The project includes a `vercel.json` configuration to ensure correct SPA routing and proxy-style access to API routes:

- Requests to `/api/*` are rewritten to the same `/api/*` path.
- All other routes are rewritten to `/index.html` so the React Router SPA can handle client-side navigation.

This prevents 404 errors when refreshing deep links such as `/account/orders` or `/admin`.

### 2.2 Backend environment variables

Vercel environment variables configured for the server deployment:

- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_PUBLIC_KEY`
- `CLIENT_APP_URL`
- `MONGODB_URI`
- `JWT_SECRET`
- `DOMAIN` = `https://gomycode-ecommerce-project-final-ch-coral.vercel.app/`

These values are required for:

- JWT authentication and authorization
- Paystack payment initialization and webhook validation
- Connecting to the MongoDB database
- Correct CORS/app origin behavior and absolute URL construction

---

## 3. Payment Provider (Paystack) Readiness

Because Paystack is used for payments, the deployment required secure server-side configuration of:

- `PAYSTACK_SECRET_KEY` (used to verify webhook signatures and initialize transactions securely)
- `PAYSTACK_PUBLIC_KEY` (used for client-side transaction display/interaction if applicable)

The backend exposes Paystack endpoints (initialize + webhook) and updates order status after webhook verification.

---

## 4. Verification Checklist (Production)

After deployment, the following functional checks were performed:

- Storefront page loads successfully using the SPA fallback rewrites
- API calls authenticate using JWT tokens
- Cart → Checkout → Orders workflow works in production
- Paystack initialization endpoint returns an authorization URL/reference
- Paystack webhook updates order status and clears the user cart
- Admin routes are protected and redirect properly when unauthenticated

---

## 5. Conclusion

EcoMart was deployed on Vercel with a production-ready configuration for React SPA routing and backend API behavior. The deployment includes secure Paystack and JWT configuration, a MongoDB connection string, and environment variables required for consistent integration across authentication, payments, and commerce workflows.
