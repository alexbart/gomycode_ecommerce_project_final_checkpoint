# TODO - Paystack integration (EcoMart)

## Plan summary

Implement Paystack payments so checkout initializes a Paystack transaction, redirects user to Paystack, receives webhook confirmation, and updates order status.

## Steps

- [ ] Create Paystack config variables in `server/env.example`.
- [ ] Extend `Order` model with `paymentReference`.
- [ ] Add `server/src/routes/paystack.ts`:
  - [ ] `POST /api/paystack/initialize`
  - [ ] `POST /api/paystack/webhook`
  - [ ] (optional) `POST /api/paystack/verify`
- [ ] Mount paystack router in `server/src/server.ts`.
- [ ] Update `client/src/api/endpoints.ts` with `paystackAPI.initialize`.
- [ ] Update `client/src/pages/CheckoutPage.tsx` to redirect to Paystack on submit.
- [ ] Update order creation/checkout behavior so cart is cleared **after webhook success**, keeping a commented fallback if needed.
- [ ] Install any required dependencies (Paystack SDK/axios usage) and run build/test.
