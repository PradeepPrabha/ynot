# YNOT: premium menswear storefront

React + TypeScript + Vite + Tailwind CSS + React Router. A complete, navigable demo store (home, catalogue, category pages, product detail, search, cart, wishlist, checkout, orders, account, policy pages) that runs entirely in the browser, with service layers ready to be swapped for Supabase and a real payment provider.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-checks, then builds to dist/
npm run preview    # serve the production build
```

Requires Node 18+. Fonts (Playfair Display, Manrope) load from Google Fonts; the site falls back to system serif/sans offline.

## What is in the box

| Route | Page |
|---|---|
| `/` | Home: hero carousel, benefits, category tiles, campaigns, best sellers, fabrics, newsletter |
| `/products` | All products (also `?new=1` for New In and `?sale=1` for Sale) |
| `/category/:slug` | `shirts`, `t-shirts`, `jeans`, `trousers`, `jackets`, `ethnic`, `accessories`. Only that category's products, with its own banner, style chips and filters |
| `/product/:slug` | Gallery, colour/size/quantity, size guide, pincode check, Buy Now, reviews, Similar, Complete the Look |
| `/search?q=` | Search by name, category, tags, description, fabric, colour |
| `/login` `/signup` `/forgot-password` | Auth forms (React Hook Form + Zod) |
| `/account` | Profile, addresses, orders, wishlist, logout (login required) |
| `/account/orders`, `/account/orders/:id` | Order history and detail with shipment timeline and invoice download |
| `/wishlist` `/cart` `/checkout` | Persistent wishlist, cart with coupons and selection, 4-step checkout |
| `/order-success/:orderId` | Only renders "success" after the server-side record says the order is verified |
| `/pages/:slug` | About, FAQs, shipping, returns, terms, privacy, size guide, store locator, contact… |
| `/404`, `*` | Branded not-found page |

Filters, sort, view mode and page number live in the URL, so links are shareable and the back button works.

## Demo behaviour you should know about

- **Catalogue**: 77 typed sample products in `src/data/catalog.ts` (one shared catalogue for listings, search, PDP, cart, wishlist, recommendations). Ratings, review counts, reviews and stock are **demo data** and labelled as such.
- **Product images**: no photography is bundled for the products, so each product is drawn by `src/components/art/ProductArt.tsx`, a parametric SVG illustration that recolours with the selected swatch. To use real photos, set `images[].src` on a product (e.g. a Supabase Storage URL); the illustration is then skipped automatically. The editorial banners in `src/assets/photos` are crops of the supplied mockups. Swap them for full-resolution photography.
- **Coupons** (`src/services/pricing.ts`): `WELCOME10`, `YNOT200`, `FREESHIP`, `FESTIVE20`. Free delivery above ₹999, otherwise ₹79. Cash on delivery up to ₹10,000.
- **Accounts**: stored in localStorage on the device. **Passwords are never stored or checked** in demo mode. Create an account on `/signup`, then log in with the same email or mobile number. Guest orders are attached to the account on login.
- **Payments**: see below. There is a clearly labelled **Demo payment sandbox**; nothing is ever marked paid by the UI.

## How payment confirmation works (and why it can't be faked from the browser)

1. Checkout sends only product id, colour, size and quantity (never prices) to `orderService.place()`.
2. The mock server (`src/services/mock/mockBackend.ts`) re-prices from the catalogue, validates stock, address and coupon, creates the order as `pending` and returns a payment session. COD orders are confirmed immediately as `cod_due`.
3. For online methods the sandbox modal stands in for the provider's hosted checkout (no card or UPI details are collected). Its result goes to `settleDemoPayment`, which plays the role of the provider's webhook and is the **only** code that sets `paymentStatus: 'paid'`.
4. The cart is cleared and `/order-success/:id` opened only after `paymentService.confirm()` reads a verified, ownership-checked order. The success page re-verifies on load and ignores query strings, so a forged URL shows "We couldn't verify this payment".
5. Double submits are blocked by a submit guard plus an idempotency key.

## Going live

Everything behind these interfaces is replaceable without touching the UI:

| Concern | File | Replace with |
|---|---|---|
| Products | `services/productService.ts` | Supabase `products` table, `product-images` bucket |
| Auth | `services/authService.ts` | Supabase Auth (`signUp`, `signInWithPassword`, `resetPasswordForEmail`) |
| Orders | `services/orderService.ts`, `mock/mockBackend.ts` | An edge function / API that re-prices and inserts into `orders` / `order_items` |
| Payments | `services/paymentService.ts`, `DemoGatewayModal.tsx` | Provider SDK (Razorpay, Stripe, Cashfree…) |
| Newsletter, addresses | `newsletterService.ts`, `addressService.ts` | Tables with RLS |

Checklist:

1. Create Supabase tables for products, orders, order_items, addresses and profiles. Enable **Row Level Security** so users can only read their own orders and addresses.
2. Create the payment order **on the server** with the provider's secret key, return only the public order id to the browser, and mark orders paid **only** from the provider's signed webhook. Never trust a client callback alone.
3. Put secrets (payment secret, webhook secret, Supabase service-role key) in your backend environment only. The frontend `.env.example` lists public placeholders and nothing else.
4. Keep `RequireAuth` for `/account`, and enforce ownership on the server for every order read. The demo ownership check mirrors what RLS should do.
5. Social login buttons stay hidden until `VITE_SOCIAL_LOGIN_PROVIDERS` (for example `google,facebook`) is set. Wire them to Supabase OAuth.
6. Replace the sample policy text in `src/pages/InfoPage.tsx` with legally reviewed wording, and the social URLs in `src/data/site.ts`.

## Project structure

```
src/
  app/            App shell, boot progress, providers
  routes/         Router, RequireAuth
  pages/          One component per route (auth/, account/)
  components/     layout/ ui/ products/ cart/ checkout/ auth/ art/
  features/       cart, wishlist, auth, ui (context state, persisted to localStorage)
  services/       products, auth, orders, payments, pricing, mock/ (the mock server)
  data/           catalog, categories + filter config, site copy, states
  hooks/ utils/ types/ styles/ assets/
design-reference/ The original page mockups this build follows
```

## Design tokens

Cream `#F8F3EA`, ivory `#FFFDF8`, beige `#E9DDCC`, warm brown `#6B4226`, dark brown `#422817`, black `#171512`, muted gold `#C39A61`, sale coral `#F0784B`, success green `#258A48`. Defined in `tailwind.config.js` and `src/styles/index.css`.

## Quality notes

- Strict TypeScript, error boundary, lazy-loaded routes, skeleton/empty/error/success states, toasts and confirmation dialogs.
- Keyboard-accessible controls, visible focus rings, labelled forms, focus-trapped modals and drawers, skip link, reduced-motion support.
- The loading screen shows a **real** percentage (fonts, hero image and catalogue actually finished) and never a fake one.
- Verified in headless Chromium at 1366px and 390px: every route renders with no horizontal overflow; category isolation, filters, sort, pagination, search, cart, wishlist, coupons, checkout validation, payment failure and retry, success verification, forged-URL blocking, COD and sign-up flows all pass.
"# ynot" 
