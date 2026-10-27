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

export interface AdminService {
  // Auth & Session
  login(params: {
    email: string;
    password: string;
    ipHash: string;
    userAgent: string;
  }): Promise<Result<{ requireTotp: boolean; session?: AdminSession; tempToken?: string }>>;

  verifyTotp(params: {
    tempToken: string;
    totpCode: string;
    ipHash: string;
    userAgent: string;
  }): Promise<Result<{ session: AdminSession }>>;

  verifyRecoveryCode(params: {
    tempToken: string;
    recoveryCode: string;
    ipHash: string;
    userAgent: string;
  }): Promise<Result<{ session: AdminSession }>>;

  setupOwner(params: {
    setupSecret: string;
    email: string;
    fullName: string;
    password: string;
    ipHash: string;
    userAgent: string;
  }): Promise<Result<{ session: AdminSession; recoveryCodes: string[]; totpSecret: string }>>;

  getSession(token: string): Promise<Result<AdminSession>>;
  logout(token: string): Promise<Result<boolean>>;
  signOutEverywhere(userId: string): Promise<Result<boolean>>;
  isSetupAvailable(): Promise<boolean>;

  // Staff Management
  listStaff(): Promise<Result<AdminUser[]>>;
  inviteStaff(params: {
    inviterId: string;
    email: string;
    role: 'admin' | 'editor' | 'support';
  }): Promise<Result<{ inviteLink: string; expiresAt: string }>>;
  acceptInvite(params: {
    token: string;
    fullName: string;
    password: string;
  }): Promise<Result<{ session: AdminSession }>>;
  updateStaffRole(params: {
    actorId: string;
    targetUserId: string;
    newRole: AdminRole;
  }): Promise<Result<AdminUser>>;
  toggleDisableStaff(params: {
    actorId: string;
    targetUserId: string;
    disabled: boolean;
  }): Promise<Result<AdminUser>>;

  // Audit Log
  listAuditLogs(filters?: {
    actorEmail?: string;
    entity?: string;
    search?: string;
    limit?: number;
  }): Promise<Result<AuditLogEntry[]>>;
  exportAuditCsv(): Promise<Result<string>>;

  // Dashboard & Analytics
  getDashboardKPIs(): Promise<Result<DashboardKPIs>>;

  // Commerce: Orders
  listOrders(filters?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Result<{ orders: OrderRecord[]; total: number }>>;
  getOrder(orderId: string): Promise<Result<OrderRecord>>;
  updateOrderStatus(params: {
    orderId: string;
    newStatus: OrderRecord['status'];
    actorEmail: string;
    ipHash: string;
  }): Promise<Result<OrderRecord>>;
  addOrderNote(params: {
    orderId: string;
    note: string;
    authorName: string;
  }): Promise<Result<OrderRecord>>;

  // Commerce: Books & Variants
  listBooks(): Promise<Result<BookRecord[]>>;
  getBook(idOrSlug: string): Promise<Result<BookRecord>>;
  updateVariantCost(params: {
    variantId: string;
    costCents: number;
    actorEmail: string;
    ipHash: string;
  }): Promise<Result<VariantRecord>>;
  bulkSetVariantCosts(params: {
    percentageOfPrice: number;
    actorEmail: string;
    ipHash: string;
  }): Promise<Result<{ updatedCount: number }>>;

  // Commerce: Coupons
  listCoupons(): Promise<Result<CouponRecord[]>>;
  createCoupon(params: {
    code: string;
    type: 'percent' | 'fixed' | 'free_shipping';
    value: number;
    minSpend: number;
    actorEmail: string;
    ipHash: string;
  }): Promise<Result<CouponRecord>>;
  toggleCoupon(id: string, active: boolean): Promise<Result<CouponRecord>>;

  // Customer Hub
  listCustomers(filters?: { search?: string; limit?: number }): Promise<Result<CustomerRecord[]>>;
  getCustomer(id: string): Promise<Result<CustomerRecord>>;

  // Community & Reviews
  listReviews(): Promise<Result<ReviewRecord[]>>;
  moderateReview(params: {
    reviewId: string;
    status: 'approved' | 'rejected';
    reply?: string;
    actorEmail: string;
    ipHash: string;
  }): Promise<Result<ReviewRecord>>;

  // Newsletter
  listSubscribers(): Promise<Result<SubscriberRecord[]>>;
  exportSubscribersCsv(actorEmail: string, ipHash: string): Promise<Result<string>>;

  // System & Demo
  resetDemoData(): Promise<Result<boolean>>;
}
