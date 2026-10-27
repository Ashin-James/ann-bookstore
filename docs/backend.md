# Backend Architecture & Provider Abstraction (`AdminService`)

This document outlines the backend architecture, service abstraction layer, database schema conventions, and provider migration strategy for the Ann's Bookstore Admin Console.

---

## 1. Architectural Philosophy: The `AdminService` Abstraction

To ensure that the bookstore is not permanently locked into Supabase and can run seamlessly on 100% free hosting tiers (Vercel Hobby, Supabase Free, local demo environments), all administrative data interactions are decoupled behind a strongly typed **`AdminService` interface**.

```
┌────────────────────────────────────────────────────────┐
│             Admin UI / Server Actions / API Routes     │
└───────────────────────────┬────────────────────────────┘
                            │ Calls unified interface
                            ▼
┌────────────────────────────────────────────────────────┐
│                 AdminService Interface                 │
│              (Typed Result<T, AdminError>)             │
└──────────────┬───────────────────────────┬─────────────┘
               │                           │
               ▼                           ▼
┌───────────────────────────────┐ ┌───────────────────────────────┐
│     SupabaseAdminService      │ │       DemoAdminService        │
│  (Supabase DB, Auth, Storage) │ │  (IndexedDB / LocalStorage)   │
│  Used in Production / Staging │ │  Used in Demo Mode / Previews │
└───────────────────────────────┘ └───────────────────────────────┘
```

### Benefits
1. **Zero External Dependencies in Demo Mode**: Demonstrators and evaluators can experience the full admin console with 5,000 orders and complete analytics with `NEXT_PUBLIC_DEMO_MODE=true` without setting up external accounts or keys.
2. **Pluggable Persistence**: The application layer and server actions call `getAdminService()` which selects the implementation based on environment configuration.
3. **Database Provider Independence**: Migrating from Supabase to self-hosted Postgres, Prisma, Drizzle, or DynamoDB requires implementing the `AdminService` contract without touching frontend admin pages or server action logic.

---

## 2. Core Service Domain Boundaries

The `AdminService` interface spans the following core domains:

| Domain | Scope & Responsibilities |
|---|---|
| **Auth & Staff** | Multi-factor TOTP login, one-time recovery codes, invite tokens, role-based access control, session revocation. |
| **Audit Log** | Append-only security audit events (user, action, entity, timestamp, salted IP hash, diff). |
| **Sales & Analytics** | Period KPI calculations (Gross Sales, COGS, GM%, Orders, AOV, Units), time-series metrics, billing state choropleths, discount efficiency. |
| **Commerce & Orders** | Order lifecycle management (Pending -> Paid -> Packed -> Shipped -> Delivered -> Cancelled / Refunded), packing slips, return management. |
| **Catalogue & Inventory** | Book metadata, multi-format variants (Paperback, Hardcover, E-book), stock adjustment history, batch price modifiers, cost tracking. |
| **Customers & Reviews** | Customer profiles, computed lifetime value (LTV), review moderation queues, support inbox. |
| **Content & Companion** | Journal CMS with 10-revision history rollback, static policy pages, AI Reading Companion rule and prompt management, site settings. |
| **Translations & Languages** | Multilingual string repository, review statuses (Draft, Reviewed, Approved), import/export. |

---

## 3. Database Schema Conventions & Additive Migration Rules

- **Additive Changes Only**: Never drop, rename, or destructively alter existing tables and columns. All schema evolution happens via forward-only migration scripts in `supabase/migrations`.
- **Row-Level Security (RLS)**: Enforced on every database table. By default, access is denied (`DEFAULT DENY`). Public anon key can only read published storefront books, reviews, and journal entries. All administrative tables require verified staff roles matching `src/config/permissions.ts`.
- **Indexing Strategy**: High-cardinality foreign keys and filter targets are indexed (`orders(date, status, billing_state)`, `order_items(book_id)`, `customers(email)`).
- **Cost Tracking & KPIs**: All variants include a `cost` field. In demo mode, estimated cost badges ("Demo estimate: replace with real costs") display on COGS and Gross Margin KPIs until explicitly overridden by the store owner.

---

## 4. Swapping Supabase for Another Provider

To swap Supabase out in the future:
1. Implement `CustomAdminService` conforming to `AdminService` in `src/lib/services/custom-admin-service.ts`.
2. Update the factory function `getAdminService()` to instantiate your custom service when target environment variables are present.
3. Re-run Vitest test suites (`tests/admin-service.test.ts`) against the new adapter to verify conformance.
