# HANDOFF: Ann's Bookstore Demo (feat/admin)

## Current Status
- Task A (Admin Login Credentials), Task A2 (Signed Sessions), Task A3 (Stateless Demo Sessions & Secret Rotation), Task SEC1 (Remove Hard-coded Credentials), and Task B (Staff Sign-in Link) completed and verified.

## Done
- Part 0 baseline verification and health API.
- Task 1 Admin book management and storefront synchronization tests pass.
- Task A Admin login credentials:
  - Demo mode credentials from `ADMIN_DEMO_EMAIL` and `ADMIN_DEMO_PASSWORD` in `.env.local`
  - httpOnly session cookie verification via server route handler (`/api/admin/auth`)
  - No credentials shown on login page; "Demo admin" shown only if env vars unset
  - Added names to `.env.example`
  - Real mode `/admin/setup` creates first owner once with min 12 char password, protected by `SETUP_SECRET`, then disables itself
  - 5-failure lockout (15 minutes), generic error messages, logout, and 404 for signed-out users on all admin routes
- Task A2 & A3 Stateless Signed Sessions:
  - Rotated `SESSION_SECRET`, `SETUP_SECRET`, and `IP_HASH_SALT` to freshly generated 32-byte hex values.
  - Shared Web Crypto session signing and verification (`lib/admin/session.ts`) used across Edge middleware and Node route handlers.
  - Stateless in Demo Mode (`NEXT_PUBLIC_DEMO_MODE=true`): session validity depends purely on HMAC-SHA256 signature and timestamps (30m idle, 12h max), surviving Vercel cold starts and restarts.
  - Automatic idle refresh on admin requests reissues cookie with updated `lastActiveAt` while preserving fixed 12-hour maximum lifetime.
  - Hand-typed cookies, tampered signatures, and expired sessions return 404 on `/admin/*` and 401 on `/api/admin/*`.
- Task SEC1 Remove Hard-coded Admin Credentials:
  - Removed all hard-coded fallback credentials from test suites; tests load from `.env.local` via `process.env` and fail fast if missing.
  - Verified app codebase has no default/fallback credentials for admin login (`ADMIN_DEMO_EMAIL` & `ADMIN_DEMO_PASSWORD` required).
  - Added e2e test verifying login rejection on non-matching or arbitrary credentials.
  - Audited git history: commit `0f51a37` contains the historical string.
- Task B Staff Sign-in Link:
  - Added "Staff sign in" text link (14px minimum, 44px touch target) at bottom of `/login` and in site footer (`components/site-footer.tsx`), pointing to `/admin/login`. Not added to main header.
  - Translated into every shipped language (14 languages: en, es, fr, de, pt-BR, it, hi, ml, ta, ar, zh-Hans, ja, ko, ru).
  - Server-side check `checkAdminSession()` (`actions/admin-session.ts`) returns boolean using `verifySignedSessionToken` from `lib/admin/session.ts`.
  - When valid admin session exists, dynamically renders "Admin dashboard" linking to `/admin/dashboard`.
  - Signed-out and customer users get 404 on protected admin routes (`/admin/books`).
  - Zero layout shift at 390px and 1440px.
  - Screenshots saved to `docs/screenshots/task-b-login.png` and `docs/screenshots/task-b-footer.png`.

## NOT DONE
- Real-mode session revocation: persistent Supabase `sessions` table is not yet wired up; in demo mode, session invalidation on logout is cookie-deletion only (copied tokens remain valid until expiry).

## How to Run
- Lint: `npm run lint`
- Typecheck: `npx tsc --noEmit`
- Production Build: `npm run build`
- Task B e2e: `PLAYWRIGHT_TEST_BASE_URL=http://localhost:3005 npx playwright test tests/e2e/task-b-staff-link.spec.ts`
- Languages e2e: `PLAYWRIGHT_TEST_BASE_URL=http://localhost:3005 npx playwright test tests/e2e/languages.spec.ts`
- Task A e2e: `PLAYWRIGHT_TEST_BASE_URL=http://localhost:3005 npx playwright test tests/e2e/task-a-auth.spec.ts`

## Exact Next Step
- Task C: Proceed to the next designated milestone in ROADMAP / ADMIN_PROMPT when requested.
