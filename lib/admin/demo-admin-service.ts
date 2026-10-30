import crypto from 'crypto';
import {
  AdminService,
  ThoughtRecord,
  AboutPageRecord,
  AboutRevisionRecord,
  NewsletterSubscriberRecord,
  NewsletterResult,
} from './admin-service';
import {
  AdminRole,
  AdminSession,
  AdminUser,
  AuditLogEntry,
  BookRecord,
  CouponRecord,
  CustomerRecord,
  DashboardKPIs,
  OrderRecord,
  Result,
  ReviewRecord,
  SubscriberRecord,
  VariantRecord,
} from './types';
import {
  DEMO_ADMIN_USER,
  getSeedBooks,
  getSeedCoupons,
  getSeedCustomers,
  getSeedOrders,
  getSeedReviews,
  getSeedSubscribers,
} from './seed-data';
import {
  checkLockout,
  clearFailedAttempts,
  generateRecoveryCodes,
  generateSessionToken,
  generateTotpSecret,
  hashPassword,
  recordFailedAttempt,
  SESSION_IDLE_TIMEOUT_MS,
  SESSION_MAX_AGE_MS,
  verifyPassword,
} from './auth';
import {
  JournalPostRecord,
  JournalRevisionRecord,
  journalPostInputSchema,
  sanitizeHtmlContent,
  calculateReadingTime,
  validateImageAltTags,
  createInitialDemoJournalPosts,
} from '@/data/journal';
import { z } from 'zod';

const STORAGE_PREFIX = 'ann_admin_v1_';

export function createInitialDemoThoughts(): ThoughtRecord[] {
  return [
    {
      id: 'thought-seed-1',
      content: 'Words, like rainfall, find their own level if given enough quiet. Composed unhurriedly on acid-free archival paper.',
      attribution: 'Ann · From The Quiet Hours',
      status: 'published',
      order: 0,
      createdAt: '2026-10-01T10:00:00.000Z',
      updatedAt: '2026-10-01T10:00:00.000Z',
    },
    {
      id: 'thought-seed-2',
      content: 'Somewhere between the rain and the remembering, we find our way home.',
      attribution: 'Ann · From The Quiet Hours · First Edition',
      status: 'published',
      order: 1,
      createdAt: '2026-10-05T14:30:00.000Z',
      updatedAt: '2026-10-05T14:30:00.000Z',
    },
  ];
}

export function createInitialDemoAboutPage(): AboutPageRecord {
  return {
    id: 'about',
    title: 'Stories begin with noticing.',
    subtitle: '“The rain did not begin with thunder; it arrived as a rumor on the veranda wind.”',
    contentHtml: `<p>Ann is an author writing from the rain-swept coast of southern India. Her work examines themes of ancestral homes, silent devotion, coastal folklore, and the delicate trade-offs between communal duty and personal truth.</p><p>Her debut novel, <em>The Quiet Hours</em>, was awarded literary recognition for its atmospheric portrayal of domestic solitude during the south-west monsoon. Composed over three rainy months, it asks how families hold onto love when time and circumstance demand silence.</p>`,
    status: 'published',
    needsLegalReview: false,
    revisions: [
      {
        id: 'rev-about-1',
        revisionNumber: 1,
        title: 'Stories begin with noticing.',
        subtitle: '“The rain did not begin with thunder; it arrived as a rumor on the veranda wind.”',
        contentHtml: `<p>Ann is an author writing from the rain-swept coast of southern India. Her work examines themes of ancestral homes, silent devotion, coastal folklore, and the delicate trade-offs between communal duty and personal truth.</p><p>Her debut novel, <em>The Quiet Hours</em>, was awarded literary recognition for its atmospheric portrayal of domestic solitude during the south-west monsoon. Composed over three rainy months, it asks how families hold onto love when time and circumstance demand silence.</p>`,
        status: 'published',
        needsLegalReview: false,
        createdAt: '2026-10-01T10:00:00.000Z',
        createdBy: 'editor@annsbookstore.demo',
      },
    ],
    updatedAt: '2026-10-01T10:00:00.000Z',
  };
}

interface DemoDataStore {
  staff: AdminUser[];
  sessions: AdminSession[];
  auditLogs: AuditLogEntry[];
  books: BookRecord[];
  orders: OrderRecord[];
  customers: CustomerRecord[];
  coupons: CouponRecord[];
  reviews: ReviewRecord[];
  subscribers: (SubscriberRecord | NewsletterSubscriberRecord)[];
  journalPosts?: JournalPostRecord[];
  thoughts?: ThoughtRecord[];
  aboutPage?: AboutPageRecord;
  setupCompleted: boolean;
  passwords?: Record<string, string>;
}

export class DemoAdminService implements AdminService {
  private store: DemoDataStore;
  private newsletterRateLimits: Map<string, { count: number; firstAttemptAt: number }> = new Map();

  constructor() {
    this.store = this.loadStore();
  }

  private loadStore(): DemoDataStore {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem(STORAGE_PREFIX + 'store');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (!Array.isArray(parsed.journalPosts)) {
            parsed.journalPosts = createInitialDemoJournalPosts();
          }
          if (!Array.isArray(parsed.thoughts)) {
            parsed.thoughts = createInitialDemoThoughts();
          }
          if (!parsed.aboutPage) {
            parsed.aboutPage = createInitialDemoAboutPage();
          }
          return parsed;
        }
      } catch {
        // Fall back to clean state if JSON corrupted
      }
    }
    return this.createInitialStore();
  }

  private persistStore(): void {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_PREFIX + 'store', JSON.stringify(this.store));
      } catch (err) {
        console.error('Failed to persist admin demo store:', err);
      }
    }
  }

  private createInitialStore(): DemoDataStore {
    const seedBooks = getSeedBooks();
    const seedCustomers = getSeedCustomers();
    const seedOrders = getSeedOrders(seedCustomers, seedBooks);
    const seedCoupons = getSeedCoupons();
    const seedReviews = getSeedReviews();
    const seedSubscribers = getSeedSubscribers();

    const initialAudit: AuditLogEntry[] = [
      {
        id: 'aud_init_01',
        actorId: DEMO_ADMIN_USER.id,
        actorEmail: DEMO_ADMIN_USER.email,
        action: 'system.seed',
        entity: 'database',
        entityId: 'all',
        beforeState: null,
        afterState: { records: 5000, catalogueBooks: 4, customers: 600 },
        ipHash: 'demo_localhost',
        createdAt: '2026-10-27T00:00:00.000Z',
      },
    ];

    const initialSessions: AdminSession[] = [
      {
        token: 'demo_session_token_owner',
        user: DEMO_ADMIN_USER,
        expiresAt: new Date(Date.now() + SESSION_MAX_AGE_MS).toISOString(),
        lastActiveAt: new Date().toISOString(),
      },
    ];

    const initialStore: DemoDataStore = {
      staff: [DEMO_ADMIN_USER],
      sessions: initialSessions,
      auditLogs: initialAudit,
      books: seedBooks,
      orders: seedOrders,
      customers: seedCustomers,
      coupons: seedCoupons,
      reviews: seedReviews,
      subscribers: seedSubscribers,
      journalPosts: createInitialDemoJournalPosts(),
      thoughts: createInitialDemoThoughts(),
      aboutPage: createInitialDemoAboutPage(),
      setupCompleted: false,
      passwords: {},
    };

    return initialStore;
  }

  private addAudit(params: {
    actorEmail: string;
    action: string;
    entity: string;
    entityId?: string;
    before?: Record<string, unknown> | null;
    after?: Record<string, unknown> | null;
    ipHash: string;
  }) {
    const log: AuditLogEntry = {
      id: `aud_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      actorId: DEMO_ADMIN_USER.id,
      actorEmail: params.actorEmail,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId || null,
      beforeState: params.before || null,
      afterState: params.after || null,
      ipHash: params.ipHash,
      createdAt: new Date().toISOString(),
    };
    this.store.auditLogs.unshift(log);
    this.persistStore();
  }

  async login(params: {
    email: string;
    password: string;
    ipHash: string;
    userAgent: string;
  }): Promise<Result<{ requireTotp: boolean; session?: AdminSession; tempToken?: string }>> {
    const lockout = checkLockout(params.email);
    if (lockout.locked) {
      return {
        success: false,
        error: {
          code: 'LOCKED_OUT',
          message: `Account locked after 5 failed attempts. Please retry in ${lockout.remainingMinutes} minutes.`,
        },
      };
    }

    const envDemoEmail = process.env.ADMIN_DEMO_EMAIL?.trim();
    const envDemoPassword = process.env.ADMIN_DEMO_PASSWORD;
    const isEnvDemoOwner = Boolean(
      envDemoEmail &&
      envDemoPassword &&
      params.email.trim().toLowerCase() === envDemoEmail.toLowerCase() &&
      params.password === envDemoPassword
    );

    const user = this.store.staff.find((s) => s.email.toLowerCase() === params.email.trim().toLowerCase());
    const hasPasswordMatch = Boolean(
      user &&
      this.store.passwords &&
      this.store.passwords[params.email.trim().toLowerCase()] &&
      verifyPassword(params.password, this.store.passwords[params.email.trim().toLowerCase()])
    );

    if (!isEnvDemoOwner && !hasPasswordMatch) {
      const lockRes = recordFailedAttempt(params.email);
      if (lockRes.locked) {
        return {
          success: false,
          error: {
            code: 'LOCKED_OUT',
            message: 'Account locked after 5 failed attempts. Please retry in 15 minutes.',
          },
        };
      }
      return {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid email or password.' },
      };
    }

    if (user?.disabled) {
      return {
        success: false,
        error: { code: 'FORBIDDEN', message: 'This staff account has been deactivated.' },
      };
    }

    clearFailedAttempts(params.email);
    let activeUser = user;
    if (!activeUser && isEnvDemoOwner) {
      activeUser = {
        id: 'usr_owner_demo',
        email: envDemoEmail!,
        fullName: 'Ann (Owner Demo)',
        role: 'owner',
        totpEnabled: false,
        disabled: false,
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      this.store.staff.unshift(activeUser);
    }

    const session: AdminSession = {
      token: generateSessionToken(),
      user: activeUser!,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE_MS).toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    this.store.sessions.push(session);
    this.addAudit({
      actorEmail: activeUser!.email,
      action: 'auth.login',
      entity: 'session',
      entityId: session.token.slice(0, 8),
      ipHash: params.ipHash,
    });

    return { success: true, data: { requireTotp: false, session } };
  }

  async verifyTotp(_params: {
    tempToken: string;
    totpCode: string;
    ipHash: string;
    userAgent: string;
  }): Promise<Result<{ session: AdminSession }>> {
    // In demo mode TOTP 123456 or valid TOTP is accepted
    const session: AdminSession = {
      token: generateSessionToken(),
      user: DEMO_ADMIN_USER,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE_MS).toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
    this.store.sessions.push(session);
    return { success: true, data: { session } };
  }

  async verifyRecoveryCode(_params: {
    tempToken: string;
    recoveryCode: string;
    ipHash: string;
    userAgent: string;
  }): Promise<Result<{ session: AdminSession }>> {
    const session: AdminSession = {
      token: generateSessionToken(),
      user: DEMO_ADMIN_USER,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE_MS).toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
    this.store.sessions.push(session);
    return { success: true, data: { session } };
  }

  async setupOwner(params: {
    setupSecret: string;
    email: string;
    fullName: string;
    password: string;
    ipHash: string;
    userAgent: string;
  }): Promise<Result<{ session: AdminSession; recoveryCodes: string[]; totpSecret: string }>> {
    const available = await this.isSetupAvailable();
    if (!available) {
      return {
        success: false,
        error: { code: 'SETUP_DISABLED', message: 'Setup is disabled: an owner account already exists.' },
      };
    }

    const validSecret = process.env.SETUP_SECRET || 'ann-bookstore-setup-2026';
    if (params.setupSecret !== validSecret) {
      return {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Invalid setup secret key.' },
      };
    }

    if (params.password.length < 12) {
      return {
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Password must be at least 12 characters.' },
      };
    }

    const { plainCodes } = generateRecoveryCodes();
    const totpSecret = generateTotpSecret();

    const owner: AdminUser = {
      id: `usr_${Date.now()}`,
      email: params.email,
      fullName: params.fullName,
      role: 'owner',
      totpEnabled: true,
      disabled: false,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    if (!this.store.passwords) {
      this.store.passwords = {};
    }
    this.store.passwords[params.email.toLowerCase()] = hashPassword(params.password);

    this.store.staff.push(owner);
    this.store.setupCompleted = true;
    this.persistStore();

    const session: AdminSession = {
      token: generateSessionToken(),
      user: owner,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE_MS).toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    this.store.sessions.push(session);
    this.addAudit({
      actorEmail: owner.email,
      action: 'setup.create_owner',
      entity: 'staff',
      entityId: owner.id,
      ipHash: params.ipHash,
    });

    return {
      success: true,
      data: { session, recoveryCodes: plainCodes, totpSecret },
    };
  }

  async getSession(token: string): Promise<Result<AdminSession>> {
    // For seamless local dev and tests, accept demo token or any registered token
    let session = this.store.sessions.find((s) => s.token === token);
    if (!session && (token === 'demo_session_token_owner' || token === 'ann_demo_admin')) {
      session = {
        token: 'demo_session_token_owner',
        user: DEMO_ADMIN_USER,
        expiresAt: new Date(Date.now() + SESSION_MAX_AGE_MS).toISOString(),
        lastActiveAt: new Date().toISOString(),
      };
      this.store.sessions.push(session);
    }

    if (!session) {
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid session token' } };
    }

    const now = Date.now();
    const lastActive = new Date(session.lastActiveAt).getTime();
    if (now - lastActive > SESSION_IDLE_TIMEOUT_MS) {
      this.store.sessions = this.store.sessions.filter((s) => s.token !== token);
      this.persistStore();
      return { success: false, error: { code: 'UNAUTHORIZED', message: 'Session expired due to inactivity' } };
    }

    session.lastActiveAt = new Date().toISOString();
    return { success: true, data: session };
  }

  async logout(token: string): Promise<Result<boolean>> {
    this.store.sessions = this.store.sessions.filter((s) => s.token !== token);
    this.persistStore();
    return { success: true, data: true };
  }

  async signOutEverywhere(userId: string): Promise<Result<boolean>> {
    this.store.sessions = this.store.sessions.filter((s) => s.user.id !== userId);
    this.persistStore();
    return { success: true, data: true };
  }

  async isSetupAvailable(): Promise<boolean> {
    return !this.store.setupCompleted && !this.store.staff.some((s) => s.role === 'owner' && s.id !== 'usr_owner_demo');
  }

  // Staff Management
  async listStaff(): Promise<Result<AdminUser[]>> {
    return { success: true, data: this.store.staff };
  }

  async inviteStaff(params: {
    inviterId: string;
    email: string;
    role: 'admin' | 'editor' | 'support';
  }): Promise<Result<{ inviteLink: string; expiresAt: string }>> {
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
    const inviteLink = `/admin/invite?token=${token}&email=${encodeURIComponent(params.email)}&role=${params.role}`;

    this.addAudit({
      actorEmail: DEMO_ADMIN_USER.email,
      action: 'staff.invite',
      entity: 'staff_invite',
      entityId: params.email,
      after: { email: params.email, role: params.role },
      ipHash: 'demo_localhost',
    });

    return { success: true, data: { inviteLink, expiresAt } };
  }

  async acceptInvite(params: {
    token: string;
    fullName: string;
    password: string;
  }): Promise<Result<{ session: AdminSession }>> {
    const newUser: AdminUser = {
      id: `usr_${Date.now()}`,
      email: 'staff@annsbookstore.com',
      fullName: params.fullName,
      role: 'editor',
      totpEnabled: false,
      disabled: false,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.store.staff.push(newUser);

    const session: AdminSession = {
      token: generateSessionToken(),
      user: newUser,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE_MS).toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
    this.store.sessions.push(session);
    this.persistStore();

    return { success: true, data: { session } };
  }

  async updateStaffRole(params: {
    actorId: string;
    targetUserId: string;
    newRole: AdminRole;
  }): Promise<Result<AdminUser>> {
    const target = this.store.staff.find((s) => s.id === params.targetUserId);
    if (!target) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'Staff member not found.' } };
    }

    // Protection rule: The last owner can never be removed or demoted
    if (target.role === 'owner' && params.newRole !== 'owner') {
      const owners = this.store.staff.filter((s) => s.role === 'owner' && !s.disabled);
      if (owners.length <= 1) {
        return {
          success: false,
          error: { code: 'FORBIDDEN', message: 'The last active owner cannot be demoted.' },
        };
      }
    }

    const prevRole = target.role;
    target.role = params.newRole;
    this.persistStore();

    this.addAudit({
      actorEmail: DEMO_ADMIN_USER.email,
      action: 'staff.role_change',
      entity: 'staff',
      entityId: target.id,
      before: { role: prevRole },
      after: { role: params.newRole },
      ipHash: 'demo_localhost',
    });

    return { success: true, data: target };
  }

  async toggleDisableStaff(params: {
    actorId: string;
    targetUserId: string;
    disabled: boolean;
  }): Promise<Result<AdminUser>> {
    const target = this.store.staff.find((s) => s.id === params.targetUserId);
    if (!target) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'Staff member not found.' } };
    }

    if (target.role === 'owner' && params.disabled) {
      const activeOwners = this.store.staff.filter((s) => s.role === 'owner' && !s.disabled);
      if (activeOwners.length <= 1) {
        return {
          success: false,
          error: { code: 'FORBIDDEN', message: 'The last active owner cannot be deactivated.' },
        };
      }
    }

    target.disabled = params.disabled;
    this.persistStore();

    this.addAudit({
      actorEmail: DEMO_ADMIN_USER.email,
      action: params.disabled ? 'staff.deactivate' : 'staff.activate',
      entity: 'staff',
      entityId: target.id,
      ipHash: 'demo_localhost',
    });

    return { success: true, data: target };
  }

  // Audit Log
  async listAuditLogs(filters?: {
    actorEmail?: string;
    entity?: string;
    search?: string;
    limit?: number;
  }): Promise<Result<AuditLogEntry[]>> {
    let logs = [...this.store.auditLogs];
    if (filters?.actorEmail) {
      logs = logs.filter((l) => l.actorEmail.toLowerCase().includes(filters.actorEmail!.toLowerCase()));
    }
    if (filters?.entity) {
      logs = logs.filter((l) => l.entity === filters.entity);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      logs = logs.filter((l) => l.action.toLowerCase().includes(q) || l.actorEmail.toLowerCase().includes(q));
    }
    if (filters?.limit) {
      logs = logs.slice(0, filters.limit);
    }
    return { success: true, data: logs };
  }

  async exportAuditCsv(): Promise<Result<string>> {
    const header = 'ID,Date,Actor,Action,Entity,Entity_ID,IP_Hash\n';
    const rows = this.store.auditLogs
      .map(
        (l) =>
          `"${l.id}","${l.createdAt}","${l.actorEmail}","${l.action}","${l.entity}","${l.entityId || ''}","${l.ipHash}"`
      )
      .join('\n');
    return { success: true, data: header + rows };
  }

  // Dashboard & Analytics KPIs
  async getDashboardKPIs(): Promise<Result<DashboardKPIs>> {
    const nonCancelledOrders = this.store.orders.filter((o) => o.status !== 'Cancelled');
    const grossSalesCents = nonCancelledOrders.reduce((sum, o) => sum + o.total, 0);

    let totalCostCents = 0;
    let unitsSold = 0;
    let hasDemoCostEstimates = false;

    for (const order of nonCancelledOrders) {
      for (const item of order.items) {
        unitsSold += item.quantity;
        totalCostCents += item.cost * item.quantity;
        if (item.isDemoCost) hasDemoCostEstimates = true;
      }
    }

    const grossMarginPercent =
      grossSalesCents > 0 ? Math.round(((grossSalesCents - totalCostCents) / grossSalesCents) * 100) : 0;
    const ordersCount = nonCancelledOrders.length;
    const aovCents = ordersCount > 0 ? Math.round(grossSalesCents / ordersCount) : 0;

    const lowStockVariants: VariantRecord[] = [];
    for (const b of this.store.books) {
      for (const v of b.variants) {
        if (!v.format.toLowerCase().includes('ebook') && v.stock <= v.lowStockThreshold) {
          lowStockVariants.push(v);
        }
      }
    }

    const recentOrders = this.store.orders.slice(-5).reverse();

    return {
      success: true,
      data: {
        customersCount: this.store.customers.length,
        grossSalesCents,
        totalCostCents,
        grossMarginPercent,
        ordersCount,
        aovCents,
        unitsSold,
        hasDemoCostEstimates,
        recentOrders,
        lowStockVariants,
      },
    };
  }

  // Commerce: Orders
  async listOrders(filters?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Result<{ orders: OrderRecord[]; total: number }>> {
    let result = [...this.store.orders];
    if (filters?.status && filters.status !== 'all') {
      result = result.filter((o) => o.status.toLowerCase() === filters.status!.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q)
      );
    }
    const total = result.length;
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 20;
    const paginated = result.slice(offset, offset + limit);

    return { success: true, data: { orders: paginated, total } };
  }

  async getOrder(orderId: string): Promise<Result<OrderRecord>> {
    const order = this.store.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'Order not found.' } };
    }
    return { success: true, data: order };
  }

  async updateOrderStatus(params: {
    orderId: string;
    newStatus: OrderRecord['status'];
    actorEmail: string;
    ipHash: string;
  }): Promise<Result<OrderRecord>> {
    const order = this.store.orders.find((o) => o.id === params.orderId || o.orderNumber === params.orderId);
    if (!order) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'Order not found.' } };
    }

    const prevStatus = order.status;
    order.status = params.newStatus;
    this.persistStore();

    this.addAudit({
      actorEmail: params.actorEmail,
      action: 'orders.status_update',
      entity: 'order',
      entityId: order.orderNumber,
      before: { status: prevStatus },
      after: { status: params.newStatus },
      ipHash: params.ipHash,
    });

    return { success: true, data: order };
  }

  async addOrderNote(params: {
    orderId: string;
    note: string;
    authorName: string;
  }): Promise<Result<OrderRecord>> {
    const order = this.store.orders.find((o) => o.id === params.orderId || o.orderNumber === params.orderId);
    if (!order) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'Order not found.' } };
    }

    order.notes = order.notes || [];
    order.notes.push(`[${new Date().toLocaleDateString()}] ${params.authorName}: ${params.note}`);
    this.persistStore();

    return { success: true, data: order };
  }

  // Commerce: Books & Variant Costs
  private isSupabaseBackend(): boolean {
    if (typeof window !== 'undefined') {
      return (
        (window as unknown as { __DATA_BACKEND?: string }).__DATA_BACKEND === 'supabase' ||
        window.localStorage.getItem('ann_data_backend') === 'supabase'
      );
    }
    return process.env.DATA_BACKEND === 'supabase';
  }

  async listBooks(): Promise<Result<BookRecord[]>> {
    if (this.isSupabaseBackend()) {
      try {
        const res = await fetch('/api/books?all=true');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) return { success: true, data };
        }
      } catch {
        // Fall back to demo store
      }
    }
    return { success: true, data: this.store.books };
  }

  async getBook(idOrSlug: string): Promise<Result<BookRecord>> {
    const book = this.store.books.find((b) => b.id === idOrSlug || b.slug === idOrSlug);
    if (!book) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'Book not found.' } };
    }
    return { success: true, data: book };
  }

  async createBook(params: {
    book: Omit<BookRecord, 'id'>;
    actorEmail: string;
    ipHash: string;
  }): Promise<Result<BookRecord>> {
    if (this.isSupabaseBackend()) {
      try {
        const res = await fetch('/api/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create', book: params.book }),
        });
        const json = await res.json();
        if (json.success) return json;
        return { success: false, error: { code: 'INTERNAL_ERROR', message: json.error || 'Failed to create book' } };
      } catch (err: unknown) {
        return { success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Network error' } };
      }
    }

    const { book, actorEmail, ipHash } = params;

    if (!book.title || !book.title.trim()) {
      return { success: false, error: { code: 'INVALID_INPUT', message: 'Book title is required.' } };
    }

    // Slug generation and uniqueness check
    let slug = (book.slug || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    if (!slug) {
      slug = book.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    if (this.store.books.some((b) => b.slug === slug)) {
      slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    }

    // Cover alt text requirement check
    if (book.cover && !book.coverAlt?.trim()) {
      return {
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Cover upload requires alt text for accessibility.' },
      };
    }

    const newBookId = `book_${Date.now()}`;
    const variants: VariantRecord[] = (book.variants && book.variants.length > 0)
      ? book.variants.map((v, i) => ({
          ...v,
          id: v.id || `var_${newBookId}_${i + 1}`,
          bookId: newBookId,
          sku: v.sku || `ANN-${newBookId.slice(-4).toUpperCase()}-${v.format.toUpperCase().slice(0, 2)}`,
        }))
      : [
          {
            id: `var_${newBookId}_1`,
            bookId: newBookId,
            format: 'Paperback',
            price: 1800,
            compareAtPrice: 2200,
            cost: 540,
            isDemoCost: true,
            sku: `ANN-${newBookId.slice(-4).toUpperCase()}-PB`,
            stock: 50,
            lowStockThreshold: 10,
            weightGrams: 380,
            signedEdition: false,
            personalization: false,
          },
        ];

    const newBook: BookRecord = {
      ...book,
      id: newBookId,
      slug,
      coverAlt: book.coverAlt?.trim() || `Cover of ${book.title}`,
      variants,
      status: book.status || 'published',
      tags: book.tags || ['fiction', 'literary'],
      moods: book.moods || ['reflective'],
    };

    this.store.books.unshift(newBook);
    this.persistStore();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ann_books_updated', { detail: this.store.books }));
    }

    this.addAudit({
      actorEmail,
      action: 'books.create',
      entity: 'book',
      entityId: newBook.slug,
      after: { title: newBook.title, slug: newBook.slug, status: newBook.status },
      ipHash,
    });

    return { success: true, data: newBook };
  }

  async updateBook(params: {
    id: string;
    book: Partial<BookRecord>;
    actorEmail: string;
    ipHash: string;
  }): Promise<Result<BookRecord>> {
    if (this.isSupabaseBackend()) {
      try {
        const res = await fetch('/api/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update', id: params.id, book: params.book }),
        });
        const json = await res.json();
        if (json.success) return json;
        return { success: false, error: { code: 'INTERNAL_ERROR', message: json.error || 'Failed to update book' } };
      } catch (err: unknown) {
        return { success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Network error' } };
      }
    }

    const existing = this.store.books.find((b) => b.id === params.id || b.slug === params.id);
    if (!existing) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'Book not found.' } };
    }

    if (params.book.cover && params.book.cover !== existing.cover && !params.book.coverAlt?.trim()) {
      return {
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Cover upload requires alt text for accessibility.' },
      };
    }

    const beforeState = { ...existing };
    Object.assign(existing, params.book);

    // If slug was updated and empty, regenerate from title
    if (params.book.title && (!existing.slug || existing.slug.trim() === '')) {
      existing.slug = existing.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    this.persistStore();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ann_books_updated', { detail: this.store.books }));
    }

    this.addAudit({
      actorEmail: params.actorEmail,
      action: 'books.update',
      entity: 'book',
      entityId: existing.slug,
      before: { title: beforeState.title, status: beforeState.status },
      after: { title: existing.title, status: existing.status },
      ipHash: params.ipHash,
    });

    return { success: true, data: existing };
  }

  async archiveBook(params: {
    id: string;
    actorEmail: string;
    ipHash: string;
  }): Promise<Result<BookRecord>> {
    if (this.isSupabaseBackend()) {
      try {
        const res = await fetch('/api/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'archive', id: params.id }),
        });
        const json = await res.json();
        if (json.success) return json;
        return { success: false, error: { code: 'INTERNAL_ERROR', message: json.error || 'Failed to archive book' } };
      } catch (err: unknown) {
        return { success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Network error' } };
      }
    }

    const existing = this.store.books.find((b) => b.id === params.id || b.slug === params.id);
    if (!existing) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'Book not found.' } };
    }

    const prevStatus = existing.status;
    existing.status = existing.status === 'archived' ? 'published' : 'archived';
    this.persistStore();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ann_books_updated', { detail: this.store.books }));
    }

    this.addAudit({
      actorEmail: params.actorEmail,
      action: 'books.archive',
      entity: 'book',
      entityId: existing.slug,
      before: { status: prevStatus },
      after: { status: existing.status },
      ipHash: params.ipHash,
    });

    return { success: true, data: existing };
  }

  async deleteBook(params: {
    id: string;
    actorEmail: string;
    ipHash: string;
  }): Promise<Result<BookRecord>> {
    if (this.isSupabaseBackend()) {
      try {
        const res = await fetch('/api/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', id: params.id }),
        });
        const json = await res.json();
        if (json.success) return json;
        return { success: false, error: { code: 'INTERNAL_ERROR', message: json.error || 'Failed to delete book' } };
      } catch (err: unknown) {
        return { success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Network error' } };
      }
    }

    const index = this.store.books.findIndex((b) => b.id === params.id || b.slug === params.id);
    if (index === -1) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'Book not found.' } };
    }

    const removed = this.store.books.splice(index, 1)[0];
    this.persistStore();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ann_books_updated', { detail: this.store.books }));
    }

    this.addAudit({
      actorEmail: params.actorEmail,
      action: 'books.delete',
      entity: 'book',
      entityId: removed.slug,
      before: { title: removed.title, id: removed.id },
      after: null,
      ipHash: params.ipHash,
    });

    return { success: true, data: removed };
  }

  async restoreBook(params: {
    book: BookRecord;
    actorEmail: string;
    ipHash: string;
  }): Promise<Result<BookRecord>> {
    if (this.isSupabaseBackend()) {
      try {
        const res = await fetch('/api/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'restore', book: params.book }),
        });
        const json = await res.json();
        if (json.success) return json;
        return { success: false, error: { code: 'INTERNAL_ERROR', message: json.error || 'Failed to restore book' } };
      } catch (err: unknown) {
        return { success: false, error: { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Network error' } };
      }
    }

    const existingIndex = this.store.books.findIndex((b) => b.id === params.book.id || b.slug === params.book.slug);
    if (existingIndex >= 0) {
      this.store.books[existingIndex] = params.book;
    } else {
      this.store.books.unshift(params.book);
    }

    this.persistStore();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ann_books_updated', { detail: this.store.books }));
    }

    this.addAudit({
      actorEmail: params.actorEmail,
      action: 'books.restore',
      entity: 'book',
      entityId: params.book.slug,
      after: { title: params.book.title, id: params.book.id },
      ipHash: params.ipHash,
    });

    return { success: true, data: params.book };
  }

  async updateVariantCost(params: {
    variantId: string;
    costCents: number;
    actorEmail: string;
    ipHash: string;
  }): Promise<Result<VariantRecord>> {
    for (const book of this.store.books) {
      const v = book.variants.find((item) => item.id === params.variantId);
      if (v) {
        const prevCost = v.cost;
        v.cost = params.costCents;
        v.isDemoCost = false; // Real cost entered, remove demo badge!
        this.persistStore();

        this.addAudit({
          actorEmail: params.actorEmail,
          action: 'variants.update_cost',
          entity: 'variant',
          entityId: v.sku,
          before: { cost: prevCost, isDemoCost: true },
          after: { cost: params.costCents, isDemoCost: false },
          ipHash: params.ipHash,
        });

        return { success: true, data: v };
      }
    }
    return { success: false, error: { code: 'NOT_FOUND', message: 'Variant not found.' } };
  }

  async bulkSetVariantCosts(params: {
    percentageOfPrice: number;
    actorEmail: string;
    ipHash: string;
  }): Promise<Result<{ updatedCount: number }>> {
    let count = 0;
    const ratio = params.percentageOfPrice / 100;

    for (const book of this.store.books) {
      for (const v of book.variants) {
        v.cost = Math.round(v.price * ratio);
        v.isDemoCost = true; // Still a percentage estimate
        count++;
      }
    }

    this.persistStore();
    this.addAudit({
      actorEmail: params.actorEmail,
      action: 'variants.bulk_cost_estimate',
      entity: 'variants',
      after: { percentage: params.percentageOfPrice, updated: count },
      ipHash: params.ipHash,
    });

    return { success: true, data: { updatedCount: count } };
  }

  // Commerce: Coupons
  async listCoupons(): Promise<Result<CouponRecord[]>> {
    return { success: true, data: this.store.coupons };
  }

  async createCoupon(params: {
    code: string;
    type: 'percent' | 'fixed' | 'free_shipping';
    value: number;
    minSpend: number;
    actorEmail: string;
    ipHash: string;
  }): Promise<Result<CouponRecord>> {
    const coupon: CouponRecord = {
      id: `coup_${Date.now()}`,
      code: params.code.trim().toUpperCase(),
      type: params.type,
      value: params.value,
      minSpend: params.minSpend,
      usageCount: 0,
      startsAt: new Date().toISOString(),
      active: true,
    };

    this.store.coupons.push(coupon);
    this.persistStore();

    this.addAudit({
      actorEmail: params.actorEmail,
      action: 'coupons.create',
      entity: 'coupon',
      entityId: coupon.code,
      after: coupon as unknown as Record<string, unknown>,
      ipHash: params.ipHash,
    });

    return { success: true, data: coupon };
  }

  async toggleCoupon(id: string, active: boolean): Promise<Result<CouponRecord>> {
    const coupon = this.store.coupons.find((c) => c.id === id);
    if (!coupon) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'Coupon not found.' } };
    }
    coupon.active = active;
    this.persistStore();
    return { success: true, data: coupon };
  }

  // Customer Hub
  async listCustomers(filters?: { search?: string; limit?: number }): Promise<Result<CustomerRecord[]>> {
    let result = [...this.store.customers];
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
    }
    if (filters?.limit) {
      result = result.slice(0, filters.limit);
    }
    return { success: true, data: result };
  }

  async getCustomer(id: string): Promise<Result<CustomerRecord>> {
    const cust = this.store.customers.find((c) => c.id === id || c.email === id);
    if (!cust) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'Customer not found.' } };
    }
    return { success: true, data: cust };
  }

  // Reviews
  async listReviews(): Promise<Result<ReviewRecord[]>> {
    return { success: true, data: this.store.reviews };
  }

  async moderateReview(params: {
    reviewId: string;
    status: 'approved' | 'rejected';
    reply?: string;
    actorEmail: string;
    ipHash: string;
  }): Promise<Result<ReviewRecord>> {
    const rev = this.store.reviews.find((r) => r.id === params.reviewId);
    if (!rev) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'Review not found.' } };
    }

    const prev = { status: rev.status, reply: rev.reply };
    rev.status = params.status;
    if (params.reply) rev.reply = params.reply;
    this.persistStore();

    this.addAudit({
      actorEmail: params.actorEmail,
      action: 'reviews.moderate',
      entity: 'review',
      entityId: rev.id,
      before: prev,
      after: { status: rev.status, reply: rev.reply },
      ipHash: params.ipHash,
    });

    return { success: true, data: rev };
  }

  // Subscribers
  async listSubscribers(): Promise<Result<SubscriberRecord[]>> {
    const list: SubscriberRecord[] = this.store.subscribers.map((s) => ({
      id: s.id,
      email: s.email,
      source: s.source,
      subscribedAt: (s as SubscriberRecord).subscribedAt || (s as { createdAt?: string }).createdAt || new Date().toISOString(),
      status: s.status === 'confirmed' || s.status === 'active' ? 'active' : 'unsubscribed',
    }));
    return { success: true, data: list };
  }

  async exportSubscribersCsv(actorEmail: string, ipHash: string): Promise<Result<string>> {
    const header = 'ID,Email,Source,Subscribed_At,Status\n';
    const rows = this.store.subscribers
      .map((s) => {
        const subAt = (s as SubscriberRecord).subscribedAt || (s as { createdAt?: string }).createdAt || '';
        return `"${s.id}","${s.email}","${s.source}","${subAt}","${s.status}"`;
      })
      .join('\n');

    this.addAudit({
      actorEmail,
      action: 'subscribers.export_csv',
      entity: 'newsletter',
      after: { count: this.store.subscribers.length },
      ipHash,
    });

    return { success: true, data: header + rows };
  }

  // Content: Journal Posts
  listJournalPostsSync(filters?: { status?: string; search?: string }): JournalPostRecord[] {
    if (!Array.isArray(this.store.journalPosts)) {
      this.store.journalPosts = createInitialDemoJournalPosts();
      this.persistStore();
    }
    let posts = this.store.journalPosts;
    if (filters?.status && filters.status !== 'all') {
      posts = posts.filter((p) => p.status === filters.status);
    }
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.subtitle && p.subtitle.toLowerCase().includes(q))
      );
    }
    return posts;
  }

  async listJournalPosts(filters?: { status?: string; search?: string }): Promise<Result<JournalPostRecord[]>> {
    return { success: true, data: this.listJournalPostsSync(filters) };
  }

  getJournalPostSync(idOrSlug: string): JournalPostRecord | undefined {
    return this.listJournalPostsSync().find((p) => p.id === idOrSlug || p.slug === idOrSlug);
  }

  async getJournalPost(idOrSlug: string): Promise<Result<JournalPostRecord>> {
    const post = this.getJournalPostSync(idOrSlug);
    if (!post) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'Journal post not found.' } };
    }
    return { success: true, data: post };
  }

  saveJournalPostSync(params: {
    post: z.infer<typeof journalPostInputSchema>;
    actorEmail: string;
    ipHash?: string;
  }): { success: true; post: JournalPostRecord } | { success: false; error: string } {
    const { post: input, actorEmail, ipHash = 'demo_localhost' } = params;

    // 1. Zod Validation
    const parsed = journalPostInputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    // 2. Validate image alt tags
    if (!validateImageAltTags(parsed.data.contentHtml)) {
      return {
        success: false,
        error: 'Every embedded image must include descriptive alt text before saving.',
      };
    }

    // 3. Sanitize HTML
    const sanitizedHtml = sanitizeHtmlContent(parsed.data.contentHtml);
    const readTime = calculateReadingTime(sanitizedHtml);
    const nowIso = new Date().toISOString();

    if (!Array.isArray(this.store.journalPosts)) {
      this.store.journalPosts = createInitialDemoJournalPosts();
    }

    const posts = this.store.journalPosts;
    const isNew = !input.id || !posts.some((p) => p.id === input.id);

    const slug = (
      input.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'untitled'
    );

    let targetPost: JournalPostRecord;

    if (isNew) {
      const postId = `post_${Date.now()}`;
      const rev1: JournalRevisionRecord = {
        id: `rev_${postId}_1`,
        postId,
        revisionNumber: 1,
        title: parsed.data.title,
        subtitle: parsed.data.subtitle || '',
        contentHtml: sanitizedHtml,
        coverImage: parsed.data.coverImage,
        coverImageAlt: parsed.data.coverImageAlt,
        category: parsed.data.category,
        createdAt: nowIso,
        createdBy: actorEmail,
      };

      targetPost = {
        id: postId,
        slug,
        title: parsed.data.title,
        subtitle: parsed.data.subtitle || '',
        category: parsed.data.category,
        excerpt: parsed.data.excerpt || '',
        contentHtml: sanitizedHtml,
        coverImage: parsed.data.coverImage,
        coverImageAlt: parsed.data.coverImageAlt,
        relatedBookSlug: parsed.data.relatedBookSlug,
        relatedBookTitle: parsed.data.relatedBookTitle,
        status: parsed.data.status,
        publishDate: parsed.data.publishDate,
        readTime,
        seoTitle: parsed.data.seoTitle,
        seoDescription: parsed.data.seoDescription,
        revisions: [rev1],
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      posts.unshift(targetPost);
    } else {
      const existingIdx = posts.findIndex((p) => p.id === input.id);
      const existing = posts[existingIdx];
      const prevRevs = existing.revisions || [];
      const nextRevNum = (prevRevs[0]?.revisionNumber || prevRevs.length || 0) + 1;

      const newRev: JournalRevisionRecord = {
        id: `rev_${existing.id}_${nextRevNum}`,
        postId: existing.id,
        revisionNumber: nextRevNum,
        title: parsed.data.title,
        subtitle: parsed.data.subtitle || '',
        contentHtml: sanitizedHtml,
        coverImage: parsed.data.coverImage,
        coverImageAlt: parsed.data.coverImageAlt,
        category: parsed.data.category,
        createdAt: nowIso,
        createdBy: actorEmail,
      };

      const updatedRevs = [newRev, ...prevRevs].slice(0, 10);

      targetPost = {
        ...existing,
        slug,
        title: parsed.data.title,
        subtitle: parsed.data.subtitle || '',
        category: parsed.data.category,
        excerpt: parsed.data.excerpt || '',
        contentHtml: sanitizedHtml,
        coverImage: parsed.data.coverImage,
        coverImageAlt: parsed.data.coverImageAlt,
        relatedBookSlug: parsed.data.relatedBookSlug,
        relatedBookTitle: parsed.data.relatedBookTitle,
        status: parsed.data.status,
        publishDate: parsed.data.publishDate,
        readTime,
        seoTitle: parsed.data.seoTitle,
        seoDescription: parsed.data.seoDescription,
        revisions: updatedRevs,
        updatedAt: nowIso,
      };

      posts[existingIdx] = targetPost;
    }

    this.addAudit({
      actorEmail,
      action: isNew ? 'journal.create' : 'journal.update',
      entity: 'journal_post',
      entityId: targetPost.id,
      before: isNew ? null : { title: targetPost.title },
      after: { title: targetPost.title, status: targetPost.status },
      ipHash,
    });

    this.persistStore();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ann_journal_updated'));
    }

    return { success: true, post: targetPost };
  }

  async saveJournalPost(params: {
    post: z.infer<typeof journalPostInputSchema>;
    actorEmail: string;
    ipHash?: string;
  }): Promise<Result<JournalPostRecord>> {
    const res = this.saveJournalPostSync(params);
    if (!res.success) {
      return { success: false, error: { code: 'INVALID_INPUT', message: res.error } };
    }
    return { success: true, data: res.post };
  }

  deleteJournalPostSync(params: {
    id: string;
    titleConfirmation: string;
    actorEmail: string;
    ipHash?: string;
  }): { success: true } | { success: false; error: string } {
    const { id, titleConfirmation, actorEmail, ipHash = 'demo_localhost' } = params;
    if (!Array.isArray(this.store.journalPosts)) {
      this.store.journalPosts = createInitialDemoJournalPosts();
    }
    const idx = this.store.journalPosts.findIndex((p) => p.id === id);
    if (idx === -1) return { success: false, error: 'Post not found' };

    const post = this.store.journalPosts[idx];
    if (titleConfirmation.trim() !== post.title.trim()) {
      return { success: false, error: 'Typed title does not match post title exactly' };
    }

    this.store.journalPosts.splice(idx, 1);
    this.addAudit({
      actorEmail,
      action: 'journal.delete',
      entity: 'journal_post',
      entityId: id,
      before: { title: post.title },
      after: null,
      ipHash,
    });

    this.persistStore();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ann_journal_updated'));
    }

    return { success: true };
  }

  async deleteJournalPost(params: {
    id: string;
    titleConfirmation: string;
    actorEmail: string;
    ipHash?: string;
  }): Promise<Result<boolean>> {
    const res = this.deleteJournalPostSync(params);
    if (!res.success) {
      return { success: false, error: { code: 'INVALID_INPUT', message: res.error } };
    }
    return { success: true, data: true };
  }

  restoreJournalRevisionSync(params: {
    postId: string;
    revisionNumber: number;
    actorEmail: string;
    ipHash?: string;
  }): { success: true; post: JournalPostRecord } | { success: false; error: string } {
    const { postId, revisionNumber, actorEmail, ipHash = 'demo_localhost' } = params;
    if (!Array.isArray(this.store.journalPosts)) {
      this.store.journalPosts = createInitialDemoJournalPosts();
    }
    const idx = this.store.journalPosts.findIndex((p) => p.id === postId);
    if (idx === -1) return { success: false, error: 'Post not found' };

    const post = this.store.journalPosts[idx];
    const targetRev = post.revisions?.find((r) => r.revisionNumber === revisionNumber);
    if (!targetRev) return { success: false, error: 'Revision not found' };

    const nowIso = new Date().toISOString();
    const nextRevNum = (post.revisions?.[0]?.revisionNumber || post.revisions?.length || 0) + 1;
    const restoredRevision: JournalRevisionRecord = {
      id: `rev_${post.id}_${nextRevNum}`,
      postId: post.id,
      revisionNumber: nextRevNum,
      title: targetRev.title,
      subtitle: targetRev.subtitle,
      contentHtml: targetRev.contentHtml,
      coverImage: targetRev.coverImage,
      coverImageAlt: targetRev.coverImageAlt,
      category: targetRev.category,
      createdAt: nowIso,
      createdBy: `${actorEmail} (restored rev ${revisionNumber})`,
    };

    const updatedRevisions = [restoredRevision, ...(post.revisions || [])].slice(0, 10);
    const updatedPost: JournalPostRecord = {
      ...post,
      title: targetRev.title,
      subtitle: targetRev.subtitle,
      contentHtml: targetRev.contentHtml,
      coverImage: targetRev.coverImage,
      coverImageAlt: targetRev.coverImageAlt,
      category: targetRev.category,
      readTime: calculateReadingTime(targetRev.contentHtml),
      revisions: updatedRevisions,
      updatedAt: nowIso,
    };

    this.store.journalPosts[idx] = updatedPost;
    this.addAudit({
      actorEmail,
      action: 'journal.restore_revision',
      entity: 'journal_post',
      entityId: post.id,
      before: { title: post.title },
      after: { title: updatedPost.title, restoredRevision: revisionNumber },
      ipHash,
    });

    this.persistStore();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ann_journal_updated'));
    }

    return { success: true, post: updatedPost };
  }

  async restoreJournalRevision(params: {
    postId: string;
    revisionNumber: number;
    actorEmail: string;
    ipHash?: string;
  }): Promise<Result<JournalPostRecord>> {
    const res = this.restoreJournalRevisionSync(params);
    if (!res.success) {
      return { success: false, error: { code: 'INVALID_INPUT', message: res.error } };
    }
    return { success: true, data: res.post };
  }

  // Thoughts Management
  listThoughtsSync(filter?: { status?: 'all' | 'published' }): ThoughtRecord[] {
    if (!Array.isArray(this.store.thoughts)) {
      this.store.thoughts = createInitialDemoThoughts();
    }
    let list = [...this.store.thoughts];
    if (filter?.status && filter.status !== 'all') {
      list = list.filter((t) => t.status === filter.status);
    }
    return list.sort((a, b) => a.order - b.order);
  }

  async listThoughts(filter?: { status?: 'all' | 'published' }): Promise<Result<ThoughtRecord[]>> {
    return { success: true, data: this.listThoughtsSync(filter) };
  }

  saveThoughtSync(params: {
    thought: {
      id?: string;
      content: string;
      attribution?: string;
      status: 'draft' | 'published';
    };
    actorEmail: string;
    ipHash?: string;
  }): { success: true; thought: ThoughtRecord } | { success: false; error: string } {
    const { thought: input, actorEmail, ipHash = 'demo_localhost' } = params;
    const thoughtSchema = z.object({
      id: z.string().optional(),
      content: z.string().min(1, 'Thought content is required').max(1000, 'Content must be under 1000 characters'),
      attribution: z.string().max(200, 'Attribution must be under 200 characters').optional(),
      status: z.enum(['draft', 'published']),
    });

    const parsed = thoughtSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid thought data' };
    }

    if (!Array.isArray(this.store.thoughts)) {
      this.store.thoughts = createInitialDemoThoughts();
    }

    const sanitizedContent = sanitizeHtmlContent(parsed.data.content).trim();
    if (!sanitizedContent) {
      return { success: false, error: 'Thought content is required' };
    }
    const sanitizedAttribution = parsed.data.attribution ? sanitizeHtmlContent(parsed.data.attribution).trim() : undefined;

    const nowIso = new Date().toISOString();
    const isNew = !parsed.data.id || !this.store.thoughts.some((t) => t.id === parsed.data.id);

    let savedRecord: ThoughtRecord;
    if (isNew) {
      const maxOrder = this.store.thoughts.reduce((max, t) => Math.max(max, t.order), -1);
      savedRecord = {
        id: parsed.data.id || `thought_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        content: sanitizedContent,
        attribution: sanitizedAttribution,
        status: parsed.data.status,
        order: maxOrder + 1,
        createdAt: nowIso,
        updatedAt: nowIso,
      };
      this.store.thoughts.push(savedRecord);
      this.addAudit({
        actorEmail,
        action: 'thoughts.create',
        entity: 'thought',
        entityId: savedRecord.id,
        before: null,
        after: { content: savedRecord.content, status: savedRecord.status, attribution: savedRecord.attribution },
        ipHash,
      });
    } else {
      const idx = this.store.thoughts.findIndex((t) => t.id === parsed.data.id);
      const existing = this.store.thoughts[idx];
      savedRecord = {
        ...existing,
        content: sanitizedContent,
        attribution: sanitizedAttribution,
        status: parsed.data.status,
        updatedAt: nowIso,
      };
      this.store.thoughts[idx] = savedRecord;
      this.addAudit({
        actorEmail,
        action: 'thoughts.update',
        entity: 'thought',
        entityId: savedRecord.id,
        before: { content: existing.content, status: existing.status },
        after: { content: savedRecord.content, status: savedRecord.status },
        ipHash,
      });
    }

    this.persistStore();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ann_thoughts_updated'));
    }
    return { success: true, thought: savedRecord };
  }

  async saveThought(params: {
    thought: {
      id?: string;
      content: string;
      attribution?: string;
      status: 'draft' | 'published';
    };
    actorEmail: string;
    ipHash?: string;
  }): Promise<Result<ThoughtRecord>> {
    const res = this.saveThoughtSync(params);
    if (!res.success) {
      return { success: false, error: { code: 'INVALID_INPUT', message: res.error } };
    }
    return { success: true, data: res.thought };
  }

  reorderThoughtsSync(params: {
    orderedIds: string[];
    actorEmail: string;
    ipHash?: string;
  }): { success: true; thoughts: ThoughtRecord[] } | { success: false; error: string } {
    const { orderedIds, actorEmail, ipHash = 'demo_localhost' } = params;
    if (!Array.isArray(this.store.thoughts)) {
      this.store.thoughts = createInitialDemoThoughts();
    }

    const before = this.store.thoughts.map((t) => ({ id: t.id, order: t.order }));

    // Re-index according to orderedIds
    orderedIds.forEach((id, index) => {
      const item = this.store.thoughts!.find((t) => t.id === id);
      if (item) {
        item.order = index;
        item.updatedAt = new Date().toISOString();
      }
    });

    this.store.thoughts.sort((a, b) => a.order - b.order);

    this.addAudit({
      actorEmail,
      action: 'thoughts.reorder',
      entity: 'thought',
      entityId: 'all',
      before: { order: before },
      after: { order: this.store.thoughts.map((t) => ({ id: t.id, order: t.order })) },
      ipHash,
    });

    this.persistStore();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ann_thoughts_updated'));
    }
    return { success: true, thoughts: [...this.store.thoughts] };
  }

  async reorderThoughts(params: {
    orderedIds: string[];
    actorEmail: string;
    ipHash?: string;
  }): Promise<Result<ThoughtRecord[]>> {
    const res = this.reorderThoughtsSync(params);
    if (!res.success) {
      return { success: false, error: { code: 'INVALID_INPUT', message: res.error } };
    }
    return { success: true, data: res.thoughts };
  }

  deleteThoughtSync(params: {
    id: string;
    confirmation: string;
    actorEmail: string;
    ipHash?: string;
  }): { success: true } | { success: false; error: string } {
    const { id, confirmation, actorEmail, ipHash = 'demo_localhost' } = params;
    if (!Array.isArray(this.store.thoughts)) {
      this.store.thoughts = createInitialDemoThoughts();
    }

    const idx = this.store.thoughts.findIndex((t) => t.id === id);
    if (idx === -1) {
      return { success: false, error: 'Thought not found' };
    }

    const target = this.store.thoughts[idx];
    const normalizedConfirm = confirmation.trim().toLowerCase();
    const matchesSnippet =
      target.content.trim().toLowerCase().startsWith(normalizedConfirm) ||
      target.content.trim().toLowerCase().includes(normalizedConfirm);
    if (normalizedConfirm !== 'delete' && !matchesSnippet) {
      return { success: false, error: 'Confirmation does not match' };
    }

    const beforeState = { id: target.id, content: target.content, status: target.status };
    this.store.thoughts.splice(idx, 1);

    this.addAudit({
      actorEmail,
      action: 'thoughts.delete',
      entity: 'thought',
      entityId: id,
      before: beforeState,
      after: null,
      ipHash,
    });

    this.persistStore();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ann_thoughts_updated'));
    }
    return { success: true };
  }

  async deleteThought(params: {
    id: string;
    confirmation: string;
    actorEmail: string;
    ipHash?: string;
  }): Promise<Result<boolean>> {
    const res = this.deleteThoughtSync(params);
    if (!res.success) {
      return { success: false, error: { code: 'INVALID_INPUT', message: res.error } };
    }
    return { success: true, data: true };
  }

  // About Page CMS
  getAboutPageSync(): AboutPageRecord {
    if (!this.store.aboutPage) {
      this.store.aboutPage = createInitialDemoAboutPage();
    }
    return this.store.aboutPage;
  }

  async getAboutPage(): Promise<Result<AboutPageRecord>> {
    return { success: true, data: this.getAboutPageSync() };
  }

  saveAboutPageSync(params: {
    page: {
      title: string;
      subtitle?: string;
      contentHtml: string;
      status: 'draft' | 'published';
      needsLegalReview: boolean;
    };
    actorEmail: string;
    ipHash?: string;
  }): { success: true; page: AboutPageRecord } | { success: false; error: string } {
    const { page: input, actorEmail, ipHash = 'demo_localhost' } = params;
    const aboutSchema = z.object({
      title: z.string().min(1, 'Title is required').max(200),
      subtitle: z.string().max(300).optional(),
      contentHtml: z.string().min(1, 'Content is required'),
      status: z.enum(['draft', 'published']),
      needsLegalReview: z.boolean(),
    });

    const parsed = aboutSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Invalid about page input' };
    }

    if (!this.store.aboutPage) {
      this.store.aboutPage = createInitialDemoAboutPage();
    }

    const sanitizedHtml = sanitizeHtmlContent(parsed.data.contentHtml);
    const nowIso = new Date().toISOString();
    const prevPage = this.store.aboutPage;
    const nextRevNum = (prevPage.revisions?.[0]?.revisionNumber || prevPage.revisions?.length || 0) + 1;

    const newRevision: AboutRevisionRecord = {
      id: `rev_about_${nextRevNum}`,
      revisionNumber: nextRevNum,
      title: parsed.data.title,
      subtitle: parsed.data.subtitle,
      contentHtml: sanitizedHtml,
      status: parsed.data.status,
      needsLegalReview: parsed.data.needsLegalReview,
      createdAt: nowIso,
      createdBy: actorEmail,
    };

    const updatedRevisions = [newRevision, ...(prevPage.revisions || [])].slice(0, 10);

    const updatedPage: AboutPageRecord = {
      id: 'about',
      title: parsed.data.title,
      subtitle: parsed.data.subtitle,
      contentHtml: sanitizedHtml,
      status: parsed.data.status,
      needsLegalReview: parsed.data.needsLegalReview,
      revisions: updatedRevisions,
      updatedAt: nowIso,
    };

    this.store.aboutPage = updatedPage;

    this.addAudit({
      actorEmail,
      action: 'about.update',
      entity: 'page_about',
      entityId: 'about',
      before: { title: prevPage.title, status: prevPage.status, needsLegalReview: prevPage.needsLegalReview },
      after: { title: updatedPage.title, status: updatedPage.status, needsLegalReview: updatedPage.needsLegalReview },
      ipHash,
    });

    this.persistStore();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ann_about_updated'));
    }
    return { success: true, page: updatedPage };
  }

  async saveAboutPage(params: {
    page: {
      title: string;
      subtitle?: string;
      contentHtml: string;
      status: 'draft' | 'published';
      needsLegalReview: boolean;
    };
    actorEmail: string;
    ipHash?: string;
  }): Promise<Result<AboutPageRecord>> {
    const res = this.saveAboutPageSync(params);
    if (!res.success) {
      return { success: false, error: { code: 'INVALID_INPUT', message: res.error } };
    }
    return { success: true, data: res.page };
  }

  restoreAboutRevisionSync(params: {
    revisionNumber: number;
    actorEmail: string;
    ipHash?: string;
  }): { success: true; page: AboutPageRecord } | { success: false; error: string } {
    const { revisionNumber, actorEmail, ipHash = 'demo_localhost' } = params;
    if (!this.store.aboutPage) {
      this.store.aboutPage = createInitialDemoAboutPage();
    }

    const prevPage = this.store.aboutPage;
    const targetRev = prevPage.revisions?.find((r) => r.revisionNumber === revisionNumber);
    if (!targetRev) {
      return { success: false, error: `Revision #${revisionNumber} not found` };
    }

    const nowIso = new Date().toISOString();
    const nextRevNum = (prevPage.revisions?.[0]?.revisionNumber || prevPage.revisions?.length || 0) + 1;
    const restoredRevision: AboutRevisionRecord = {
      id: `rev_about_${nextRevNum}`,
      revisionNumber: nextRevNum,
      title: targetRev.title,
      subtitle: targetRev.subtitle,
      contentHtml: targetRev.contentHtml,
      status: targetRev.status,
      needsLegalReview: targetRev.needsLegalReview,
      createdAt: nowIso,
      createdBy: `${actorEmail} (restored rev ${revisionNumber})`,
    };

    const updatedRevisions = [restoredRevision, ...(prevPage.revisions || [])].slice(0, 10);
    const updatedPage: AboutPageRecord = {
      id: 'about',
      title: targetRev.title,
      subtitle: targetRev.subtitle,
      contentHtml: targetRev.contentHtml,
      status: targetRev.status,
      needsLegalReview: targetRev.needsLegalReview,
      revisions: updatedRevisions,
      updatedAt: nowIso,
    };

    this.store.aboutPage = updatedPage;

    this.addAudit({
      actorEmail,
      action: 'about.restore_revision',
      entity: 'page_about',
      entityId: 'about',
      before: { title: prevPage.title, restoredRevision: revisionNumber },
      after: { title: updatedPage.title, restoredRevision: revisionNumber },
      ipHash,
    });

    this.persistStore();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ann_about_updated'));
    }
    return { success: true, page: updatedPage };
  }

  async restoreAboutRevision(params: {
    revisionNumber: number;
    actorEmail: string;
    ipHash?: string;
  }): Promise<Result<AboutPageRecord>> {
    const res = this.restoreAboutRevisionSync(params);
    if (!res.success) {
      return { success: false, error: { code: 'INVALID_INPUT', message: res.error } };
    }
    return { success: true, data: res.page };
  }

  // Newsletter Flow
  private checkNewsletterRateLimit(ipHash: string): boolean {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    const maxRequests = 5;
    const record = this.newsletterRateLimits.get(ipHash);
    if (!record || now - record.firstAttemptAt > windowMs) {
      this.newsletterRateLimits.set(ipHash, { count: 1, firstAttemptAt: now });
      return true;
    }
    if (record.count >= maxRequests) {
      return false;
    }
    record.count++;
    return true;
  }

  subscribeNewsletterSync(params: {
    email: string;
    source?: string;
    ipHash: string;
  }): Result<NewsletterResult> {
    const emailSchema = z.string().email('Please enter a valid email address').max(255);
    const parsed = emailSchema.safeParse(params.email?.trim());
    if (!parsed.success) {
      return { success: false, error: { code: 'INVALID_INPUT', message: 'Please enter a valid email address' } };
    }

    if (!this.checkNewsletterRateLimit(params.ipHash)) {
      return {
        success: false,
        error: { code: 'RATE_LIMITED', message: 'Too many requests. Please wait a few minutes before trying again.' },
      };
    }

    const normalizedEmail = parsed.data.toLowerCase();
    const existingIndex = this.store.subscribers.findIndex((s) => s.email.toLowerCase() === normalizedEmail);

    const rawToken = crypto.randomBytes(24).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const verificationExpiresAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
    const nowIso = new Date().toISOString();

    if (existingIndex !== -1) {
      const existing = this.store.subscribers[existingIndex] as NewsletterSubscriberRecord;
      existing.verificationTokenHash = tokenHash;
      existing.verificationExpiresAt = verificationExpiresAt;
      existing.status = 'pending';
      existing.updatedAt = nowIso;

      this.addAudit({
        actorEmail: 'subscriber',
        action: 'newsletter.subscribe',
        entity: 'newsletter',
        entityId: existing.id,
        before: null,
        after: { status: 'pending', duplicate: true },
        ipHash: params.ipHash,
      });

      this.persistStore();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ann_subscribers_updated'));
      }

      return {
        success: true,
        data: {
          status: 'pending',
          message: 'Check your inbox to confirm your subscription (Double Opt-In)',
          confirmUrl: `/newsletter/confirm?token=${rawToken}`,
        },
      };
    }

    const unsubscribeToken = crypto.randomBytes(24).toString('hex');
    const newSubscriber: NewsletterSubscriberRecord = {
      id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      email: normalizedEmail,
      source: params.source || 'home footer',
      status: 'pending',
      verificationTokenHash: tokenHash,
      verificationExpiresAt,
      unsubscribeToken,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    this.store.subscribers.push(newSubscriber);
    this.addAudit({
      actorEmail: 'subscriber',
      action: 'newsletter.subscribe',
      entity: 'newsletter',
      entityId: newSubscriber.id,
      before: null,
      after: { status: 'pending', source: newSubscriber.source },
      ipHash: params.ipHash,
    });

    this.persistStore();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ann_subscribers_updated'));
    }

    return {
      success: true,
      data: {
        status: 'pending',
        message: 'Check your inbox to confirm your subscription (Double Opt-In)',
        confirmUrl: `/newsletter/confirm?token=${rawToken}`,
      },
    };
  }

  async subscribeNewsletter(params: {
    email: string;
    source?: string;
    ipHash: string;
  }): Promise<Result<NewsletterResult>> {
    return this.subscribeNewsletterSync(params);
  }

  confirmNewsletterSync(params: {
    token: string;
    ipHash?: string;
  }): Result<NewsletterResult> {
    const rawToken = params.token?.trim();
    if (!rawToken) {
      return { success: false, error: { code: 'INVALID_INPUT', message: 'Token is required' } };
    }

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const subIndex = this.store.subscribers.findIndex(
      (s) => (s as NewsletterSubscriberRecord).verificationTokenHash === tokenHash
    );

    if (subIndex === -1) {
      return {
        success: false,
        error: { code: 'INVALID_INPUT', message: 'This confirmation link is invalid or has already been used.' },
      };
    }

    const sub = this.store.subscribers[subIndex] as NewsletterSubscriberRecord;
    if (sub.verificationExpiresAt && new Date(sub.verificationExpiresAt).getTime() < Date.now()) {
      return {
        success: false,
        error: { code: 'INVALID_INPUT', message: 'This confirmation link has expired. Please subscribe again.' },
      };
    }

    if (sub.status === 'confirmed') {
      return {
        success: false,
        error: { code: 'INVALID_INPUT', message: 'This confirmation link has already been used.' },
      };
    }

    const nowIso = new Date().toISOString();
    sub.status = 'confirmed';
    sub.confirmedAt = nowIso;
    sub.verificationTokenHash = undefined;
    sub.updatedAt = nowIso;

    this.addAudit({
      actorEmail: 'subscriber',
      action: 'newsletter.confirm',
      entity: 'newsletter',
      entityId: sub.id,
      before: { status: 'pending' },
      after: { status: 'confirmed' },
      ipHash: params.ipHash || 'ip_hash',
    });

    this.persistStore();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ann_subscribers_updated'));
    }

    return {
      success: true,
      data: {
        status: 'confirmed',
        message: 'Your subscription to The Collector\'s Dispatch has been confirmed.',
        unsubscribeUrl: `/newsletter/unsubscribe?token=${sub.unsubscribeToken}`,
      },
    };
  }

  async confirmNewsletter(params: {
    token: string;
    ipHash?: string;
  }): Promise<Result<NewsletterResult>> {
    return this.confirmNewsletterSync(params);
  }

  unsubscribeNewsletterSync(params: {
    token: string;
    ipHash?: string;
  }): Result<NewsletterResult> {
    const rawToken = params.token?.trim();
    if (!rawToken) {
      return { success: false, error: { code: 'INVALID_INPUT', message: 'Token is required' } };
    }

    const subIndex = this.store.subscribers.findIndex(
      (s) => (s as NewsletterSubscriberRecord).unsubscribeToken === rawToken
    );

    if (subIndex === -1) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Invalid or expired unsubscribe link.' },
      };
    }

    const sub = this.store.subscribers[subIndex] as NewsletterSubscriberRecord;
    const nowIso = new Date().toISOString();
    sub.status = 'unsubscribed';
    sub.unsubscribedAt = nowIso;
    sub.updatedAt = nowIso;

    this.addAudit({
      actorEmail: 'subscriber',
      action: 'newsletter.unsubscribe',
      entity: 'newsletter',
      entityId: sub.id,
      before: { status: 'confirmed' },
      after: { status: 'unsubscribed' },
      ipHash: params.ipHash || 'ip_hash',
    });

    this.persistStore();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ann_subscribers_updated'));
    }

    return {
      success: true,
      data: {
        status: 'unsubscribed',
        message: 'You have been successfully unsubscribed from The Collector\'s Dispatch.',
      },
    };
  }

  async unsubscribeNewsletter(params: {
    token: string;
    ipHash?: string;
  }): Promise<Result<NewsletterResult>> {
    return this.unsubscribeNewsletterSync(params);
  }

  resubscribeNewsletterSync(params: {
    token: string;
    ipHash?: string;
  }): Result<NewsletterResult> {
    const rawToken = params.token?.trim();
    if (!rawToken) {
      return { success: false, error: { code: 'INVALID_INPUT', message: 'Token is required' } };
    }

    const subIndex = this.store.subscribers.findIndex(
      (s) => (s as NewsletterSubscriberRecord).unsubscribeToken === rawToken
    );

    if (subIndex === -1) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Invalid unsubscribe token.' },
      };
    }

    const sub = this.store.subscribers[subIndex] as NewsletterSubscriberRecord;
    const newRawToken = crypto.randomBytes(24).toString('hex');
    const newHash = crypto.createHash('sha256').update(newRawToken).digest('hex');
    const nowIso = new Date().toISOString();

    sub.status = 'pending';
    sub.verificationTokenHash = newHash;
    sub.verificationExpiresAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
    sub.updatedAt = nowIso;

    this.addAudit({
      actorEmail: 'subscriber',
      action: 'newsletter.resubscribe',
      entity: 'newsletter',
      entityId: sub.id,
      before: { status: 'unsubscribed' },
      after: { status: 'pending' },
      ipHash: params.ipHash || 'ip_hash',
    });

    this.persistStore();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ann_subscribers_updated'));
    }

    return {
      success: true,
      data: {
        status: 'pending',
        message: 'Check your inbox to confirm your subscription (Double Opt-In)',
        confirmUrl: `/newsletter/confirm?token=${newRawToken}`,
      },
    };
  }

  async resubscribeNewsletter(params: {
    token: string;
    ipHash?: string;
  }): Promise<Result<NewsletterResult>> {
    return this.resubscribeNewsletterSync(params);
  }

  // Reset Demo Data
  async resetDemoData(): Promise<Result<boolean>> {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_PREFIX + 'store');
    }
    this.store = this.createInitialStore();
    this.persistStore();
    return { success: true, data: true };
  }
}

export { getAdminService, resetAdminServiceInstance } from './service-factory';

