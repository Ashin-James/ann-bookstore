# HANDOFF: Ann's Bookstore Demo (feat/admin)

## Current Status
- Task A (Admin Login Credentials) and Task A2 (Hardened Signed Sessions) complete and verified.
- Part 0 and Task 1 (Admin Books & Storefront sync) committed.

## Done
- Part 0 baseline verification and health API.
- Task 1 Admin book management and security tests pass.
- Task A Admin login credentials:
  - Demo mode credentials from `ADMIN_DEMO_EMAIL` and `ADMIN_DEMO_PASSWORD` in `.env.local`
  - httpOnly session cookie verification via server route handler (`/api/admin/auth`)
  - No credentials shown on login page; "Demo admin" shown only if env vars unset
  - Added names to `.env.example`
  - Real mode `/admin/setup` creates first owner once with min 12 char password, protected by `SETUP_SECRET`, then disables itself
  - 5-failure lockout (15 minutes), generic error messages, logout, and 404 for signed-out users on all admin routes
- Task A2 Session Hardening:
  - Web Crypto HMAC signing with `SESSION_SECRET`
  - Server-side in-memory session records with 30m idle timeout and 12h max age
  - Hand-typed and tampered cookies return 404 on `/admin/*` and 401 on `/api/admin/*`
  - Edge-compatible Web Crypto verification in `middleware.ts`

## How to Run
- Lint: `npm run lint`
- Typecheck: `npx tsc --noEmit`
- Task A auth suite: `npx playwright test tests/e2e/task-a-auth.spec.ts`

## Exact Next Step
- Begin Part 2: Sales Analytics Dashboard (/admin/analytics) as specified in ADMIN_PROMPT.md.
