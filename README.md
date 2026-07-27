# MS Wedding Planner — Event Management & Catering Platform

A production-grade event management and catering platform for weddings, birthdays, housewarmings, engagements, corporate events and family functions — built for **MS Wedding Planner** (organiser: Haritha Kotha). Public booking site with a guided step-by-step booking wizard + full admin dashboard, themed from the business's own brochure (black/gold luxury with a rose-pink accent).

## Tech Stack

**Frontend:** React 19 + Vite + TypeScript, Tailwind CSS v4, React Router, TanStack React Query, React Hook Form + Zod, Zustand, Framer Motion, react-helmet-async.
**Backend:** Node.js + Express 5 + TypeScript, PostgreSQL + Prisma ORM 7 (driver adapters), JWT auth, Cloudinary, Nodemailer, ExcelJS, @react-pdf/renderer.

---

## Folder Structure

```
Event_Management/
├── frontend/                        Vite + React + TS single-page app
│   ├── src/
│   │   ├── assets/                    Static images/icons bundled by Vite
│   │   ├── components/
│   │   │   ├── ui/                      Generic primitives: Button, Container, Modal, PageHero, SectionHeading, FadeIn, PageLoader...
│   │   │   └── layout/                  Header, Footer, FloatingActions (WhatsApp/Call), PublicLayout, AdminLayout, ProtectedRoute, Logo
│   │   ├── features/
│   │   │   ├── booking/                 wizard/ — BookingWizard shell, WizardProgress, 5 step components (Select
│   │   │   │                            Package, Configure Package, Review, Customer Details, Confirmation) +
│   │   │   │                            parts/ (GuestCountPrompt, FoodStepPanel, CategoryOptionPanel); also
│   │   │   │                            ContactModal (hero "Contact Us" call/WhatsApp popup), eventTypeOptions
│   │   │   └── admin/                   AdminEntityManager (generic CRUD table+modal), ImageUploadField
│   │   ├── pages/                     One component per route (Home, Services, Packages, Menu, EventTypes, Gallery,
│   │   │   └── admin/                   Testimonials, FAQ, Contact, Booking, BookingStatus, NotFound)
│   │   │                               admin/ — Login, Overview, Bookings, Enquiries, Menu, Packages,
│   │   │                               ServiceCategories, Gallery, Testimonials, FAQs, Settings
│   │   ├── routes/                    router.tsx — route tree; admin routes are React.lazy-loaded (separate bundle)
│   │   ├── store/                     Zustand stores: uiStore (theme), authStore (admin JWT), bookingCartStore
│   │   │                              (the booking wizard's full state machine — step, package, guest count,
│   │   │                              dietary preference, selections, customer details)
│   │   ├── lib/
│   │   │   ├── api/                     One file per backend resource; resourceHooks.ts is a generic React Query
│   │   │   │                            CRUD-hook factory mirroring the backend's crudFactory
│   │   │   ├── axios.ts                 Axios instance with JWT interceptor
│   │   │   ├── queryClient.ts           React Query client config
│   │   │   ├── cn.ts                    clsx + tailwind-merge helper
│   │   │   └── siteConfig.ts            Static fallback business identity (used before /api/settings loads)
│   │   ├── types/api.ts               Shared TS DTOs mirroring the Prisma models
│   │   ├── styles/design-tokens.css   Brand CSS variables (see "Re-theming" below)
│   │   └── main.tsx / App.tsx         Providers: React Query, Helmet, Router, Toaster
│   ├── index.html, vite.config.ts, tailwind.config via CSS, tsconfig.json, .env.example
│
├── backend/                         Express + TS REST API
│   ├── src/
│   │   ├── config/                    env.ts (zod-validated env loader), prisma.ts (Prisma Client + pg driver adapter),
│   │   │                              cloudinary.ts
│   │   ├── modules/                   One folder per domain — each has validator.ts (Zod), service.ts (Prisma calls),
│   │   │                              controller.ts, routes.ts:
│   │   │                              auth, settings, menu, packages (incl. wizard `steps`), serviceCategories
│   │   │                              (categories + options — the admin-extensible wizard catalogue, replacing a
│   │   │                              fixed enum), gallery, testimonials, faqs, enquiries, bookings
│   │   │                              (+ bookings.export.ts), dashboard, uploads
│   │   ├── middlewares/               errorHandler, requireAuth (JWT), validateRequest (Zod), rateLimiter
│   │   ├── utils/                     ApiError, asyncHandler, bookingCode generator, pricingEngine (authoritative
│   │   │                              price calculator), crudFactory (generic CRUD router builder)
│   │   ├── templates/                 QuotationDocument.tsx / BookingsExportDocument.tsx — @react-pdf/renderer PDFs
│   │   ├── jobs/                      emailNotifier (live), whatsappNotifier (future-ready stub for WhatsApp
│   │   │                              Business API) — no payment gateway; bookings are request-only, paid offline
│   │   └── app.ts / server.ts         Express app wiring + entrypoint
│   ├── prisma/schema.prisma           Full data model (see "Database Schema")
│   ├── prisma/seed.ts                 Seeds real business identity + sample menu/packages/service categories +
│   │                                  options/package wizard-step flows/gallery/testimonials/FAQs
│   └── prisma.config.ts, tsconfig.json, .env.example
│
├── .gitignore
└── README.md                        This file
```

---

## Setup Instructions

### Prerequisites
- Node.js 20+ and npm
- A PostgreSQL database (a free tier from [Neon](https://neon.tech) or [Supabase](https://supabase.com) works well)
- A [Cloudinary](https://cloudinary.com) account (free tier) for image uploads
- An SMTP account for admin email notifications (e.g. Gmail App Password, Mailtrap for testing)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # fill in DATABASE_URL, JWT_SECRET, Cloudinary, SMTP (see below)
npx prisma migrate dev --name init   # creates tables in your Postgres database
npm run prisma:seed                  # seeds menu, packages + wizard steps, service categories/options, admin user...
npm run dev                          # starts the API on http://localhost:4000
```

The seed script prints the admin login it created:
`harithakotha6131@gmail.com` / `ChangeMe@123` — **change this password immediately** after first login (or edit `prisma/seed.ts` before seeding).

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_URL — usually fine to leave unset in dev (Vite proxies /api to :4000)
npm run dev                          # starts the site on http://localhost:5173
```

Visit `http://localhost:5173` for the public site and `http://localhost:5173/admin/login` for the dashboard.

### 3. Production build

```bash
cd backend && npm run build && npm start     # compiles to dist/ and runs node dist/server.js
cd frontend && npm run build                 # outputs static assets to frontend/dist/
```

---

## Deployment (free tier)

This stack runs entirely on free hosting tiers — no credit card required to keep it running at small-business scale.

| Piece | Where | Free tier limits |
|---|---|---|
| Database | [Neon](https://neon.tech) (already configured) | 0.5 GB storage, auto-suspends when idle |
| Backend (Express API) | [Render](https://render.com) — Web Service, `render.yaml` at repo root | 750 hrs/month (enough for one always-on service), spins down after 15 min idle, ~30-50s cold start on the next request |
| Frontend (React build) | [Vercel](https://vercel.com) — `frontend/vercel.json` handles SPA routing | 100 GB bandwidth/month, effectively unlimited for this traffic level |
| Images | [Cloudinary](https://cloudinary.com) (already configured) | 25 GB storage/bandwidth credits |
| Email | Gmail SMTP (already configured) | ~500 sends/day |

**Steps:**
1. Push this repo to GitHub (see below).
2. **Render**: New → Blueprint → connect the repo → it reads `render.yaml` and creates the API service. Fill in the `sync: false` env vars in the Render dashboard (`DATABASE_URL` from Neon, `CORS_ORIGIN` = your Vercel URL, Cloudinary/SMTP credentials from `backend/.env`).
3. **Vercel**: New Project → connect the repo → set root directory to `frontend` → add `VITE_API_URL` = your Render URL + `/api`.
4. Once both are live, go back to Render and confirm `CORS_ORIGIN` matches the final Vercel domain exactly (redeploy after changing it).

**Realistic load**: a shared-CPU/512MB free web service comfortably handles the traffic of a real local wedding/catering business — tens of concurrent visitors, hundreds of requests/minute is well within range. The only real caveat is the cold start after 15 minutes idle. Fix it for free by pinging `GET /health` every 10 minutes with a free uptime monitor (e.g. [cron-job.org](https://cron-job.org) or [UptimeRobot](https://uptimerobot.com)) — this keeps Render's free service always warm at no cost. A custom domain (e.g. `.com`) is the only piece that isn't free (~$10-15/year); the `.onrender.com` / `.vercel.app` subdomains work fine without one.

---

## Environment Variables

### `backend/.env`

| Variable | Description |
|---|---|
| `NODE_ENV` | `development` / `production` |
| `PORT` | API port (default `4000`) |
| `CORS_ORIGIN` | Frontend origin allowed to call the API |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Long random string signing admin JWTs |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Image upload credentials |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Outgoing mail for booking notifications |
| `ADMIN_NOTIFICATION_EMAIL` | Where new-booking emails are sent |
| `FAST2SMS_API_KEY` | Optional — mobile OTP for admin password reset; leave blank to disable and use email OTP only |
| `OTP_DAILY_SMS_LIMIT` | Safety cap on OTP SMS sends per day (default `5`) |
| `BUSINESS_NAME` / `BUSINESS_PHONE` | Used in the PDF quotation letterhead |

### `frontend/.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL for production builds (dev uses the Vite proxy, so this can stay unset locally) |

---

## Database Schema (Prisma)

- **AdminUser** — dashboard login (bcrypt-hashed password)
- **MenuCategory → MenuItem** — Sweets, Snacks, Starters, Flavoured Rice, Biryani, Curries, Desserts, Ice Cream, Drinks, Special Items (`isVeg` drives the wizard's Veg/Non-Veg/Both food step)
- **Package** (`SILVER` / `GOLD` / `PLATINUM`) **→ PackageItem** (marketing "included items" bullet list) **→ PackageStep** — the package's ordered guided-wizard flow (e.g. Silver = Food → Welcome Drinks → Stage Decoration → Lighting → DJ & Sound). "Custom Package" has no `Package` row — the wizard instead shows every active `ServiceCategory` freely.
- **ServiceCategory → ServiceOption** — the admin-extensible wizard catalogue (Welcome Drinks, Stage Decoration, Lighting, DJ & Sound, Live Counters, Photography, Videography, Return Gifts, Floral Decoration, Furniture, or any category an admin creates). `allowMultiple` controls whether the wizard lets a customer pick more than one option in that category.
- **GalleryImage**, **Testimonial**, **FAQ** — content management for the public site
- **SiteSettings** — singleton row: contact info, WhatsApp, map embed, hero banner, business intro
- **ContactEnquiry** — quick contact-form submissions (separate from full bookings)
- **Booking** — customer + event details, `dietaryPreference`, snapshot cost fields (`foodCost`/`addOnsCost`/`packageCost`/`grandTotal`), `bookingCode` (public status lookup), `status` (`PENDING`/`CONFIRMED`/`CANCELLED`/`COMPLETED`)
- **BookingMenuItem / BookingServiceOption** — join tables storing `priceAtBooking` snapshots, so historical quotations stay accurate even if catalogue prices change later

Full field-level detail lives in [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma).

---

## API Routes

All routes are prefixed `/api`. Admin routes (`/api/admin/*`) require `Authorization: Bearer <token>` from `POST /api/admin/auth/login`.

**Public (read):** `GET /settings`, `/menu-categories`, `/menu-items`, `/packages` (each includes its ordered wizard `steps`), `/packages/:id`, `/service-categories`, `/service-options`, `/gallery`, `/testimonials`, `/faqs`
**Public (write):** `POST /enquiries`, `POST /bookings/quote` (live price calculator), `POST /bookings` (create), `GET /bookings/lookup?code&phone`, `GET /bookings/:id/quotation.pdf?phone`
**Admin — auth:** `POST /admin/auth/login`
**Admin — catalogue CRUD** (`GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` on each): `/admin/menu-categories`, `/admin/menu-items`, `/admin/packages` (accepts a `steps` array to configure the wizard flow), `/admin/service-categories`, `/admin/service-options`, `/admin/gallery`, `/admin/testimonials`, `/admin/faqs`
**Admin — settings:** `PUT /admin/settings`
**Admin — enquiries:** `GET /admin/enquiries`, `PATCH /admin/enquiries/:id/read`, `DELETE /admin/enquiries/:id`
**Admin — bookings:** `GET /admin/bookings`, `GET /admin/bookings/export.xlsx`, `GET /admin/bookings/export.pdf`, `GET /admin/bookings/:id`, `PATCH /admin/bookings/:id/status`
**Admin — dashboard:** `GET /admin/dashboard/overview`
**Admin — uploads:** `POST /admin/uploads` (multipart, Cloudinary), `DELETE /admin/uploads/:publicId`

---

## Re-theming

Every brand color lives in `frontend/src/styles/design-tokens.css` as CSS variables (`--brand-gold`, `--brand-rose`, `--brand-ink-black`, `--brand-cream`...). Changing the palette is a one-file edit — nothing else in the codebase hardcodes color values.

---

## Implementation Roadmap

**Done:**
- Full public site (Home, Services, Packages, Menu, Event Types, Gallery, Testimonials, FAQ, Contact) wired to a real Express/PostgreSQL API
- Guided 5-step booking wizard (Select Package → Configure Package → Review → Customer Details → Confirmation) with a progress indicator, back-navigation to any completed step, and per-step auto-saved state. Configure Package walks a package's admin-defined category sequence one section at a time (Food with Veg/Non-Veg/Both, then each `ServiceCategory`); Custom Package instead shows every category as a free pick-any-combination grid. Live server-authoritative price calculator throughout.
- Booking submission → PostgreSQL, admin email notification, success step with Booking ID + downloadable PDF quotation (business identity, itemised selections grouped by category, terms & conditions), and booking-status lookup by code + phone
- Admin dashboard: JWT auth, overview analytics, full CRUD for every catalogue resource (including the Service Categories/Options wizard catalogue and each package's step-flow editor), booking status workflow, Excel/PDF export, customer enquiries inbox, site settings editor, Cloudinary image uploads
- Dark/light mode, mobile-first responsive layout (including a collapsible admin sidebar drawer), route-based code-splitting for the admin bundle, basic SEO (meta tags, JSON-LD, sitemap/robots), accessibility labelling on primary forms

**Intentionally stubbed (future-ready interface, not wired to a live provider):**
- `backend/src/jobs/whatsappNotifier.ts` — swap in a real WhatsApp Business API client

**No online payment collection by design** — bookings are requests only; the customer and admin arrange payment offline. There is no payment gateway integration anywhere in the code.

**Recommended next steps for a real launch:**
1. Provision a real PostgreSQL database and Cloudinary account; run `prisma migrate dev` + seed against it.
2. Replace the seed script's placeholder (picsum.photos) images with real photography via the admin Gallery/Menu/Package upload fields.
3. Update `frontend/public/sitemap.xml` with the real production domain.
4. Change the seeded admin password immediately.
5. Wire a real WhatsApp provider behind the existing stub interface when ready.
6. Run a Lighthouse pass against the deployed site and address any environment-specific performance/accessibility findings.
