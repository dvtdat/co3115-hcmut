# GreenBite — Healthy Food E-Commerce Frontend

Single-vendor storefront for healthy food products. React + Vite frontend backed by a NestJS REST API.

---

## Tech Stack

React 19 · TypeScript · Vite · TanStack Router · TanStack Query · Zustand · openapi-fetch · shadcn/ui · Tailwind CSS v4 · i18next

---

## Getting Started

```bash
npm install
npm run dev        # dev server at http://localhost:3000
```

Requires a running backend at `:3500`. See `.env.development` for environment variables.

---

## Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build (tsc + vite)
npm run lint             # ESLint
npm run format           # Prettier

# API types (requires backend running at :3500)
npm run gen-api          # Regenerate src/api/schema.d.ts

# i18n
npm run i18n:extract     # Extract new keys
npm run i18n:sync        # Sync all locales
npm run i18n:status      # Translation coverage
```

---

## Deployment

**Infrastructure:** AWS S3 (static hosting) + CloudFront CDN

| Resource                | Value                             |
| ----------------------- | --------------------------------- |
| S3 bucket               | `healthy-food-ecommerce-frontend` |
| CloudFront distribution | `EN2M7MB1ED8C7`                   |

**Prerequisites:** AWS CLI configured with S3 write + CloudFront invalidation permissions.

```bash
# 1. Build
npm run build

# 2. Upload to S3
aws s3 sync dist/ s3://healthy-food-ecommerce-frontend --delete

# 3. Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id EN2M7MB1ED8C7 --paths "/*"
```

> CloudFront invalidation typically propagates within 1–2 minutes.

---

## Project Reference

See [`CLAUDE.md`](./CLAUDE.md) for full architecture, folder structure, coding conventions, and feature status.
