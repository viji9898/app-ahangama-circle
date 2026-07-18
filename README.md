# Ahangama Circle

Ahangama Circle is a React/Vite app deployed on Netlify for Circle membership, promo checkout, verification, venue onboarding, and member perks.

This README is the project knowledge base. Update it whenever new features, production fixes, deploy assumptions, or recurring issues are discovered.

## App Routes

- `/` - Promo landing page.
- `/promo` - Promo landing page alias.
- `/perks` - Circle member perks page powered by live venue data.
- `/join` - Venue/member access request form.
- `/cv` - Circle pass verification page.
- `/pv` - Promo pass verification page.

## Frontend Files

- `src/Promo.jsx` and `src/Promo.css` - Promo landing and checkout experience.
- `src/CirclePerks.jsx` and `src/CirclePerks.css` - Member perks listing.
- `src/Join.jsx` - Access and venue onboarding form.
- `src/CircleVerify.jsx` - Circle pass verification.
- `src/PromoVerify.jsx` - Promo pass verification.
- `src/main.jsx` - React Router route registration.

## Netlify Functions

- `circle-venues.js` - Returns active Circle venues from Neon/Postgres for `/perks`.
- `create-promo-checkout-session.js` - Creates Stripe promo checkout sessions.
- `stripe-webhook-promo.js` - Handles promo Stripe webhook events.
- `promo-status.js` - Recovers promo payment/pass status.
- `passkitSmartPassLink.js` - Creates PassKit SmartPass links.
- `verify-circle-pass.js` - Verifies Circle passes.
- `verify-promo-pass.js` - Verifies promo passes.
- `join-circle.js` and `request-access.js` - Handle access and onboarding requests.

## Edge Functions

- `netlify/edge-functions/perks-meta.js` runs on `/perks` and injects route-specific SEO/Open Graph metadata into the Vite HTML shell.
- When an edge function modifies response HTML, do not forward stale body-specific headers from `context.next()`. Delete `content-encoding` and `content-length` before returning the transformed body.

## Recent Production Fixes

### `/perks` returned 502 from Netlify Edge

Symptom:

```text
HTTP 502
edge function invocation failed
```

Root cause:

- The `/perks` edge function read the upstream HTML, injected metadata, and returned a modified body while preserving upstream body headers.
- Headers such as `content-encoding` and `content-length` can become invalid after the body changes, causing the Netlify Edge invocation to fail before React loads.

Fix:

```js
headers.delete("content-encoding");
headers.delete("content-length");
headers.set("content-type", "text/html; charset=utf-8");
```

Useful checks:

```bash
curl -i https://circle.ahangama.com/perks
curl -i https://circle.ahangama.com/.netlify/functions/circle-venues
npm run build
```

If `/perks` fails but `/.netlify/functions/circle-venues` returns JSON, investigate the edge function first.

## Required Environment Variables

- `NETLIFY_DATABASE_URL`
- `STRIPE_SECRET_KEY_TEST`
- `STRIPE_SECRET_KEY_LIVE`
- `STRIPE_PROMO_PRICE_15_TEST`
- `STRIPE_PROMO_PRICE_15`
- `STRIPE_PROMO_WEBHOOK_SECRET`
- `PASSKIT_DISTRIBUTION_URL`
- `PASSKIT_SMARTPASS_KEY` - PassKit project encryption key for SmartPass links.
- `PASSKIT_SMARTPASS_SECRET`
- `SENDGRID_API_KEY`
- `PROMO_TRIAL_DAYS`
- `PROMO_BILLING_DAYS`
- `PROMO_TIMEZONE`
- `SITE_URL`

## Local Development

```bash
npm install
npm run dev
```

For Netlify functions and edge routing, use Netlify Dev:

```bash
npx netlify dev
```

## Build

```bash
npm run build
```

## Database

- Schema lives in `db/schema.ts`.
- Drizzle migrations live in `migrations/`.
- Generate migrations with `npm run db:generate`.
- Apply migrations through Netlify Dev with `npm run db:migrate`.

## Deployment Notes

- Netlify build command: `npm run build`.
- Publish directory: `dist`.
- Netlify functions directory: `netlify/functions`.
- SPA fallback redirect is configured in `netlify.toml`.
- `/perks` is additionally handled by the `perks-meta` edge function for social metadata.
