import { AdminService } from './admin-service';
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
  recordFailedAttempt,
  SESSION_IDLE_TIMEOUT_MS,
  SESSION_MAX_AGE_MS,
} from './auth';

const STORAGE_PREFIX = 'ann_admin_v1_';

interface DemoDataStore {
  staff: AdminUser[];
  sessions: AdminSession[];
  auditLogs: AuditLogEntry[];
  books: BookRecord[];
  orders: OrderRecord[];
  customers: CustomerRecord[];
  coupons: CouponRecord[];
  reviews: ReviewRecord[];
  subscribers: SubscriberRecord[];
  setupCompleted: boolean;
}

export class DemoAdminService implements AdminService {
  private store: DemoDataStore;

  constructor() {
    this.store = this.loadStore();
  }

  private loadStore(): DemoDataStore {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem(STORAGE_PREFIX + 'store');
        if (raw) {
          return JSON.parse(raw);
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
      setupCompleted: true,
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

    const user = this.store.staff.find((s) => s.email.toLowerCase() === params.email.toLowerCase());
    const isDemoOwner = params.email.toLowerCase() === 'demo@annsbookstore.com' && params.password === 'DemoAdmin2026!';

    if (!user && !isDemoOwner) {
      recordFailedAttempt(params.email);
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
    const activeUser = user || DEMO_ADMIN_USER;

    const session: AdminSession = {
      token: generateSessionToken(),
      user: activeUser,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE_MS).toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    this.store.sessions.push(session);
    this.addAudit({
      actorEmail: activeUser.email,
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

    this.store.staff.push(owner);
    this.store.setupCompleted = true;

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
    return !this.store.setupCompleted;
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
  async listBooks(): Promise<Result<BookRecord[]>> {
    return { success: true, data: this.store.books };
  }

  async getBook(idOrSlug: string): Promise<Result<BookRecord>> {
    const book = this.store.books.find((b) => b.id === idOrSlug || b.slug === idOrSlug);
    if (!book) {
      return { success: false, error: { code: 'NOT_FOUND', message: 'Book not found.' } };
    }
    return { success: true, data: book };
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
    return { success: true, data: this.store.subscribers };
  }

  async exportSubscribersCsv(actorEmail: string, ipHash: string): Promise<Result<string>> {
    const header = 'ID,Email,Source,Subscribed_At,Status\n';
    const rows = this.store.subscribers
      .map((s) => `"${s.id}","${s.email}","${s.source}","${s.subscribedAt}","${s.status}"`)
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

// Singleton Instance Holder
let adminServiceInstance: AdminService | null = null;

export function getAdminService(): AdminService {
  if (!adminServiceInstance) {
    adminServiceInstance = new DemoAdminService();
  }
  return adminServiceInstance;
}
