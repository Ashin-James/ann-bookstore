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
import type { JournalPostRecord } from '@/data/journal';

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
  createBook(params: {
    book: Omit<BookRecord, 'id'>;
    actorEmail: string;
    ipHash: string;
  }): Promise<Result<BookRecord>>;
  updateBook(params: {
    id: string;
    book: Partial<BookRecord>;
    actorEmail: string;
    ipHash: string;
  }): Promise<Result<BookRecord>>;
  archiveBook(params: {
    id: string;
    actorEmail: string;
    ipHash: string;
  }): Promise<Result<BookRecord>>;
  deleteBook(params: {
    id: string;
    actorEmail: string;
    ipHash: string;
  }): Promise<Result<BookRecord>>;
  restoreBook(params: {
    book: BookRecord;
    actorEmail: string;
    ipHash: string;
  }): Promise<Result<BookRecord>>;
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

  // Content: Journal Posts
  listJournalPosts(filters?: {
    status?: string;
    search?: string;
  }): Promise<Result<JournalPostRecord[]>>;
  getJournalPost(idOrSlug: string): Promise<Result<JournalPostRecord>>;
  saveJournalPost(params: {
    post: {
      id?: string;
      title: string;
      subtitle?: string;
      category: string;
      excerpt?: string;
      contentHtml: string;
      coverImage?: string;
      coverImageAlt?: string;
      relatedBookSlug?: string;
      relatedBookTitle?: string;
      status: 'draft' | 'scheduled' | 'published';
      publishDate?: string;
      seoTitle?: string;
      seoDescription?: string;
    };
    actorEmail: string;
    ipHash?: string;
  }): Promise<Result<JournalPostRecord>>;
  deleteJournalPost(params: {
    id: string;
    titleConfirmation: string;
    actorEmail: string;
    ipHash?: string;
  }): Promise<Result<boolean>>;
  restoreJournalRevision(params: {
    postId: string;
    revisionNumber: number;
    actorEmail: string;
    ipHash?: string;
  }): Promise<Result<JournalPostRecord>>;

  // Thoughts Management
  listThoughts?(filter?: { status?: 'all' | 'published' }): Promise<Result<ThoughtRecord[]>>;
  saveThought?(params: {
    thought: {
      id?: string;
      content: string;
      attribution?: string;
      status: 'draft' | 'published';
    };
    actorEmail: string;
    ipHash?: string;
  }): Promise<Result<ThoughtRecord>>;
  reorderThoughts?(params: {
    orderedIds: string[];
    actorEmail: string;
    ipHash?: string;
  }): Promise<Result<ThoughtRecord[]>>;
  deleteThought?(params: {
    id: string;
    confirmation: string;
    actorEmail: string;
    ipHash?: string;
  }): Promise<Result<boolean>>;

  // About Page CMS
  getAboutPage?(): Promise<Result<AboutPageRecord>>;
  saveAboutPage?(params: {
    page: {
      title: string;
      subtitle?: string;
      contentHtml: string;
      status: 'draft' | 'published';
      needsLegalReview: boolean;
    };
    actorEmail: string;
    ipHash?: string;
  }): Promise<Result<AboutPageRecord>>;
  restoreAboutRevision?(params: {
    revisionNumber: number;
    actorEmail: string;
    ipHash?: string;
  }): Promise<Result<AboutPageRecord>>;

  // Newsletter Subscription Flow
  subscribeNewsletter?(params: {
    email: string;
    source?: string;
    ipHash: string;
  }): Promise<Result<NewsletterResult>>;

  confirmNewsletter?(params: {
    token: string;
    ipHash?: string;
  }): Promise<Result<NewsletterResult>>;

  unsubscribeNewsletter?(params: {
    token: string;
    ipHash?: string;
  }): Promise<Result<NewsletterResult>>;

  resubscribeNewsletter?(params: {
    token: string;
    ipHash?: string;
  }): Promise<Result<NewsletterResult>>;

  // System & Demo
  resetDemoData(): Promise<Result<boolean>>;
}

export interface NewsletterSubscriberRecord {
  id: string;
  email: string;
  source: string;
  status: 'pending' | 'confirmed' | 'unsubscribed';
  verificationTokenHash?: string;
  verificationExpiresAt?: string;
  unsubscribeToken: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  unsubscribedAt?: string;
}

export interface NewsletterResult {
  status: 'pending' | 'confirmed' | 'unsubscribed';
  message: string;
  confirmUrl?: string;
  unsubscribeUrl?: string;
}

export interface ThoughtRecord {
  id: string;
  content: string;
  attribution?: string;
  status: 'draft' | 'published';
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AboutRevisionRecord {
  id: string;
  revisionNumber: number;
  title: string;
  subtitle?: string;
  contentHtml: string;
  status: 'draft' | 'published';
  needsLegalReview: boolean;
  createdAt: string;
  createdBy: string;
}

export interface AboutPageRecord {
  id: 'about';
  title: string;
  subtitle?: string;
  contentHtml: string;
  status: 'draft' | 'published';
  needsLegalReview: boolean;
  revisions: AboutRevisionRecord[];
  updatedAt: string;
}
