# Ahangama Circle

Promo-only web app extracted from the Ahangama Pass promo flow.

## Included

- Promo landing page
- Promo Stripe checkout session creation
- Promo Stripe webhook handling
- Promo status recovery flow
- Promo pass verification page
- Promo email helpers
- Promo Drizzle schema

## Required Environment Variables

- `NETLIFY_DATABASE_URL`
- `STRIPE_SECRET_KEY_TEST`
- `STRIPE_SECRET_KEY_LIVE`
- `STRIPE_PROMO_PRICE_15_TEST`
- `STRIPE_PROMO_PRICE_15`
- `STRIPE_PROMO_WEBHOOK_SECRET`
- `PASSKIT_DISTRIBUTION_URL`
- `PASSKIT_SMARTPASS_KEY` - PassKit project encryption key for SmartPass links
- `PASSKIT_SMARTPASS_SECRET`
- `SENDGRID_API_KEY`
- `PROMO_TRIAL_DAYS`
- `PROMO_BILLING_DAYS`
- `PROMO_TIMEZONE`
- `SITE_URL`

## Run

```bash
npm install
npm run build
```