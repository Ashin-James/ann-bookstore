# Ann's Bookstore Demo: Admin Roadmap & Implementation Plan

Branch: `feat/admin`  
Target: Production-grade Admin Console & Customer Hub on Free Stack (Supabase, Vercel, Resend).

---

## 1. Roadmap Overview & Status

| Phase / Task | Name | Scope & Highlights | Status |
| :--- | :--- | :--- | :--- |
| **Part 0** | Baseline & Foundation | Zero-regression baseline, `/api/health`, ADMIN_ENABLED flag, docs skeleton, keepalive CI | **VERIFIED** |
| **Task 1** | Book Management & Sync | Full book CRUD, title confirmation on delete, required cover alt text, archive toggle, storefront sync | **VERIFIED** |
| **Task A** | Admin Credentials & Auth | Demo credentials via `.env.local`, signed HMAC sessions, lockout after 5 fails, generic error messages, 404 for unauthed | **VERIFIED** |
| **Task A2/A3** | Stateless Signed Sessions | Stateless demo sessions (Web Crypto HMAC-SHA256), rotated secrets, 30m idle refresh, 12h max age | **VERIFIED** |
| **Task SEC1** | Security Hardening | Zero hard-coded credentials in tests/source; load from env with fast failure; negative credential tests | **VERIFIED** |
| **Task B** | Staff Sign-in Link | Subtle text link on `/login` and footer; 14 languages; dynamic "Admin dashboard" when logged in | **VERIFIED** |
| **Task C** | Customer Registration & Auth | `/register`, email verification, password reset, account management, auth isolation, checkout guard | **VERIFIED** |
| **Task G** | Journal Editor & CMS | TipTap editor, required alt text, 10 revisions, sanitization (XSS safe), status & future-dated 404 isolation, RBAC | **VERIFIED** |
| **Task D** | Sales Analytics Dashboard | `/admin/analytics`, KPI strip, metric tabs, state choropleth, sales breakdown, CSV export | **NOT DONE** |
| **Task E** | Commerce Workflows | Orders detail timeline, invoice view, coupons checkout enforcement, returns queue, shipping & tax settings | **NOT DONE** |
| **Task H** | Content, Customers & Audit | Customer management, reviews moderation, messages inbox, newsletter campaigns, pages CMS, media library, companion manager | **NOT DONE** |
| **Part 5** | Completion Audit | Full feature audit (`docs/feature-audit.md`), zero errors, deploy guide (`docs/DEPLOY.md`), security checklist | **NOT DONE** |

---

## 2. Architectural Guidelines & Invariants

1. **RBAC & Route Protection**:
   - Roles: `owner`, `admin`, `editor`, `support`.
   - Permissions defined in `src/config/permissions.ts`.
   - All admin routes and API handlers return real 404 to unauthenticated or unauthorized users.
2. **AdminService Layer**:
   - Universal interface `AdminService` in `lib/admin/admin-service.ts`.
   - Implementations: `DemoAdminService` (browser localStorage / in-memory demo store) and `SupabaseAdminService` (Postgres / RLS).
   - Every mutation records an `audit_log` row with actor email, action, entity, before/after states, and IP hash.
3. **Data Integrity & Security**:
   - Zero hard-coded secrets or credentials.
   - Input sanitization against XSS (script tags, inline event handlers stripped).
   - Mandatory alt text on all images and covers.
   - Published/status isolation: drafts and future-dated posts return 404 publicly.
4. **Testing Invariants**:
   - Never weaken or delete a test assertion.
   - E2E tests run against production build on port 3005 without hardcoded passwords.
