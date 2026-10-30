# HANDOFF: Ann's Bookstore Demo (feat/admin)

## Current Status
- Task A (Admin Login Credentials), Task A2 (Signed Sessions), Task A3 (Stateless Demo Sessions & Secret Rotation), Task SEC1 (Remove Hard-coded Credentials), Task B (Staff Sign-in Link), Task C (Customer Registration & Auth), Task G (Journal Editor), and Task H (Thoughts and About Page) completed and verified.

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
- Task C Customer Registration & Auth:
  - Registration page (`/register`): name, email, password (min 12 chars), confirm; Zod validation; rate limit; duplicate email generic handling. Demo mode stores hashed passwords (SHA-256 + salt, never plain text); real mode stubs Supabase Auth.
  - Email verification: demo mode shows verification link on screen and logs it; real mode sends via Resend if `RESEND_API_KEY` is configured. Unverified accounts cannot check out (checkout guard disables submission and displays warning banner).
  - Auth flows: login, logout, forgot password and reset password (single-use, 1-hour expiry, link displayed on screen in demo mode), change password, delete account with confirmation.
  - Header: visible "Sign in" and "Register" links when signed out; "Account" when signed in; translated across all 14 shipped languages.
  - Failed logins: generic error message, 5 failed attempts lock the account for 15 minutes.
  - Auth isolation: customer session cookie `ann_session` is isolated from admin routes; customer cookies return 404 on `/admin/*`.
  - Existing `/account` pages preserved and functional (`account-hub.spec.ts` 24/24 passing).
- Task G Journal Editor (admin):
  - Installed `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-link`, and `@tiptap/extension-image` (install size: 6.25 MB).
  - Admin page `/admin/journal`: RBAC restricted to `owner`, `admin`, `editor` (`support` and customer/signed-out users receive 404). Editor role restricted from `/admin/orders` (404).
  - AdminService integration: Journal operations (`create`, `update`, `delete`, `restore_revision`) route through `AdminService` (`DemoAdminService` & `SupabaseAdminService`) and record immutable `audit_log` entries with actor email, action, entity, before/after states, and IP hash.
  - Hardening & Security verified:
    - Alt text strictly required: Cover image without alt text and editor images without alt text are refused with descriptive error alerts.
    - XSS sanitization: Pasted `<script>` and `onerror=` handlers are sanitized in `saveJournalPostSync` and never appear in saved demo store or public storefront HTML.
    - Status & future date isolation: Drafts and future-dated scheduled posts return 404 publicly on direct URL `/journal/[slug]` and never appear in public listing `/journal`.
    - Revision history: Restoring revision 1 re-applies revision 1 content, increments revision count, records audit log, and reflects immediately on public storefront.
  - Multi-language: UI strings translated across all 14 shipped languages.
  - Additive Supabase migration in `supabase/migrations/20261030000000_journal.sql`.
- Task H Thoughts and About Page:
  - Admin page `/admin/thoughts`: RBAC restricted to `owner`, `admin`, `editor` (`support` and signed-out users receive 404).
  - Short notes and quotes with optional attribution; add, edit, delete (requires typing DELETE or thought content to confirm), drag-and-drop & keyboard move up/move down buttons (min 44px touch target), publish/unpublish toggle.
  - Storefront sync: Published thoughts feed the homepage author stationery note and quote sanctuary block without altering visual styles; unpublished thoughts never appear publicly.
  - Admin page `/admin/about`: RBAC restricted to `owner`, `admin`, `editor`. TipTap rich text editor, status draft/published, last 10 revisions with one-click restore, "needs legal review" toggle.
  - Invariant guard: Facts about Ann remain as `[PLACEHOLDER]` unless supplied; prominent warning banner displayed.
  - AdminService integration: Thoughts and About operations route through `AdminService` (`DemoAdminService`) with immutable `audit_log` rows (`thoughts.create`, `thoughts.update`, `thoughts.reorder`, `thoughts.delete`, `about.update`, `about.restore_revision`).
  - Translations in all 14 shipped languages (en, es, fr, de, pt-BR, it, hi, ml, ta, ar, zh-Hans, ja, ko, ru).
  - Additive Supabase migration in `supabase/migrations/20261031000000_thoughts_about.sql` (BUILT-NOT-VERIFIED).

## NOT DONE
- Real-mode session revocation: persistent Supabase `sessions` table is not yet wired up; in demo mode, session invalidation on logout is cookie-deletion only (copied tokens remain valid until expiry).
- Real-mode customer persistence: persistent Supabase Auth customer user tables not wired up in demo mode (in-memory demo store used).
- Real-mode Supabase journal persistence live verification: `supabase/migrations/20261030000000_journal.sql` and service methods are implemented but marked BUILT-NOT-VERIFIED due to absent live Supabase credentials.
- Real-mode Supabase thoughts & about persistence live verification: `supabase/migrations/20261031000000_thoughts_about.sql` is implemented but marked BUILT-NOT-VERIFIED due to absent live Supabase credentials.

## How to Run
- Lint: `npm run lint`
- Typecheck: `npx tsc --noEmit`
- Production Build: `npm run build`
- Task H e2e: `PLAYWRIGHT_TEST_BASE_URL=http://localhost:3005 npx playwright test tests/e2e/task-h-thoughts-about.spec.ts`
- Task G e2e: `PLAYWRIGHT_TEST_BASE_URL=http://localhost:3005 npx playwright test tests/e2e/task-g-journal.spec.ts`
- Task C e2e: `PLAYWRIGHT_TEST_BASE_URL=http://localhost:3005 npx playwright test tests/e2e/task-c-customer-auth.spec.ts`
- Account Hub e2e: `PLAYWRIGHT_TEST_BASE_URL=http://localhost:3005 npx playwright test tests/e2e/account-hub.spec.ts`
- Task B e2e: `PLAYWRIGHT_TEST_BASE_URL=http://localhost:3005 npx playwright test tests/e2e/task-b-staff-link.spec.ts`
- Languages e2e: `PLAYWRIGHT_TEST_BASE_URL=http://localhost:3005 npx playwright test tests/e2e/languages.spec.ts`
- Task A e2e: `PLAYWRIGHT_TEST_BASE_URL=http://localhost:3005 npx playwright test tests/e2e/task-a-auth.spec.ts`

## Exact Next Step
- Task I: Await user request for Task I. Do not start Task I.
