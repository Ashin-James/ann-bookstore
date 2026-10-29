import { AdminService } from './admin-service';
import { DemoAdminService } from './demo-admin-service';
import {
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
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  checkLockout,
  clearFailedAttempts,
  generateRecoveryCodes,
  generateSessionToken,
  generateTotpSecret,
  recordFailedAttempt,
  SESSION_MAX_AGE_MS,
} from './auth';

export class SupabaseAdminService implements AdminService {
  private client: SupabaseClient | null = null;
  private fallback: DemoAdminService;

  constructor() {
    this.fallback = new DemoAdminService();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (url && key && !url.includes('placeholder')) {
      try {
        this.client = createClient(url, key);
      } catch {
        this.client = null;
      }
    }
  }

  async login(params: Parameters<AdminService['login']>[0]): Promise<Result<{ requireTotp: boolean; session?: AdminSession; tempToken?: string }>> {
    if (!this.client) return this.fallback.login(params);

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

    try {
      const { data: authData, error: authError } = await this.client.auth.signInWithPassword({
        email: params.email,
        password: params.password,
      });

      if (authError || !authData.user) {
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

      const { data: profile, error: profileErr } = await this.client
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileErr || !profile) {
        return {
          success: false,
          error: { code: 'FORBIDDEN', message: 'No staff profile associated with this account.' },
        };
      }

      if (profile.disabled) {
        return {
          success: false,
          error: { code: 'FORBIDDEN', message: 'This staff account has been deactivated.' },
        };
      }

      clearFailedAttempts(params.email);

      const user: AdminUser = {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        role: profile.role,
        totpEnabled: Boolean(profile.totp_enabled),
        disabled: Boolean(profile.disabled),
        lastLoginAt: new Date().toISOString(),
        createdAt: profile.created_at,
      };

      const session: AdminSession = {
        token: generateSessionToken(),
        user,
        expiresAt: new Date(Date.now() + SESSION_MAX_AGE_MS).toISOString(),
        lastActiveAt: new Date().toISOString(),
      };

      return { success: true, data: { requireTotp: false, session } };
    } catch {
      return this.fallback.login(params);
    }
  }

  async verifyTotp(params: Parameters<AdminService['verifyTotp']>[0]): Promise<Result<{ session: AdminSession }>> {
    if (!this.client) return this.fallback.verifyTotp(params);
    return this.fallback.verifyTotp(params);
  }

  async verifyRecoveryCode(params: Parameters<AdminService['verifyRecoveryCode']>[0]): Promise<Result<{ session: AdminSession }>> {
    if (!this.client) return this.fallback.verifyRecoveryCode(params);
    return this.fallback.verifyRecoveryCode(params);
  }

  async setupOwner(params: Parameters<AdminService['setupOwner']>[0]): Promise<Result<{ session: AdminSession; recoveryCodes: string[]; totpSecret: string }>> {
    if (!this.client) return this.fallback.setupOwner(params);

    const available = await this.isSetupAvailable();
    if (!available) {
      return {
        success: false,
        error: { code: 'SETUP_DISABLED', message: 'Setup is disabled: an owner account already exists.' },
      };
    }

    const validSecret = process.env.SETUP_SECRET;
    if (!validSecret || params.setupSecret !== validSecret) {
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

    try {
      const { plainCodes, hashedCodes } = generateRecoveryCodes();
      const totpSecret = generateTotpSecret();

      let userId: string;
      const { data: authData, error: authError } = await this.client.auth.admin.createUser({
        email: params.email,
        password: params.password,
        email_confirm: true,
        user_metadata: { full_name: params.fullName, role: 'owner' },
      });

      if (authError || !authData.user) {
        const { data: signUpData, error: signUpError } = await this.client.auth.signUp({
          email: params.email,
          password: params.password,
          options: { data: { full_name: params.fullName, role: 'owner' } },
        });
        if (signUpError || !signUpData.user) {
          return {
            success: false,
            error: { code: 'INTERNAL_ERROR', message: authError?.message || signUpError?.message || 'Failed to create user' },
          };
        }
        userId = signUpData.user.id;
      } else {
        userId = authData.user.id;
      }

      const { error: profileError } = await this.client.from('profiles').insert({
        id: userId,
        email: params.email,
        full_name: params.fullName,
        role: 'owner',
        totp_secret: totpSecret,
        totp_enabled: true,
        disabled: false,
        last_login_at: new Date().toISOString(),
      });

      if (profileError) {
        return {
          success: false,
          error: { code: 'INTERNAL_ERROR', message: `Profile creation failed: ${profileError.message}` },
        };
      }

      for (const codeHash of hashedCodes) {
        await this.client.from('recovery_codes').insert({
          profile_id: userId,
          code_hash: codeHash,
          used: false,
        });
      }

      await this.client.from('audit_log').insert({
        actor_id: userId,
        actor_email: params.email,
        action: 'setup.create_owner',
        entity: 'staff',
        entity_id: userId,
        ip_hash: params.ipHash,
      });

      const session: AdminSession = {
        token: generateSessionToken(),
        user: {
          id: userId,
          email: params.email,
          fullName: params.fullName,
          role: 'owner',
          totpEnabled: true,
          disabled: false,
          lastLoginAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        expiresAt: new Date(Date.now() + SESSION_MAX_AGE_MS).toISOString(),
        lastActiveAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: { session, recoveryCodes: plainCodes, totpSecret },
      };
    } catch {
      return this.fallback.setupOwner(params);
    }
  }

  async getSession(token: string): Promise<Result<AdminSession>> {
    if (!this.client) return this.fallback.getSession(token);
    return this.fallback.getSession(token);
  }

  async logout(token: string): Promise<Result<boolean>> {
    if (!this.client) return this.fallback.logout(token);
    return this.fallback.logout(token);
  }

  async signOutEverywhere(userId: string): Promise<Result<boolean>> {
    if (!this.client) return this.fallback.signOutEverywhere(userId);
    return this.fallback.signOutEverywhere(userId);
  }

  async isSetupAvailable(): Promise<boolean> {
    if (!this.client) return this.fallback.isSetupAvailable();
    try {
      const { count, error } = await this.client
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'owner');
      if (error) return this.fallback.isSetupAvailable();
      return (count ?? 0) === 0;
    } catch {
      return this.fallback.isSetupAvailable();
    }
  }

  async listStaff(): Promise<Result<AdminUser[]>> {
    if (!this.client) return this.fallback.listStaff();
    return this.fallback.listStaff();
  }

  async inviteStaff(params: Parameters<AdminService['inviteStaff']>[0]): Promise<Result<{ inviteLink: string; expiresAt: string }>> {
    if (!this.client) return this.fallback.inviteStaff(params);
    return this.fallback.inviteStaff(params);
  }

  async acceptInvite(params: Parameters<AdminService['acceptInvite']>[0]): Promise<Result<{ session: AdminSession }>> {
    if (!this.client) return this.fallback.acceptInvite(params);
    return this.fallback.acceptInvite(params);
  }

  async updateStaffRole(params: Parameters<AdminService['updateStaffRole']>[0]): Promise<Result<AdminUser>> {
    if (!this.client) return this.fallback.updateStaffRole(params);
    return this.fallback.updateStaffRole(params);
  }

  async toggleDisableStaff(params: Parameters<AdminService['toggleDisableStaff']>[0]): Promise<Result<AdminUser>> {
    if (!this.client) return this.fallback.toggleDisableStaff(params);
    return this.fallback.toggleDisableStaff(params);
  }

  async listAuditLogs(filters?: Parameters<AdminService['listAuditLogs']>[0]): Promise<Result<AuditLogEntry[]>> {
    if (!this.client) return this.fallback.listAuditLogs(filters);
    return this.fallback.listAuditLogs(filters);
  }

  async exportAuditCsv(): Promise<Result<string>> {
    if (!this.client) return this.fallback.exportAuditCsv();
    return this.fallback.exportAuditCsv();
  }

  async getDashboardKPIs(): Promise<Result<DashboardKPIs>> {
    if (!this.client) return this.fallback.getDashboardKPIs();
    return this.fallback.getDashboardKPIs();
  }

  async listOrders(filters?: Parameters<AdminService['listOrders']>[0]): Promise<Result<{ orders: OrderRecord[]; total: number }>> {
    if (!this.client) return this.fallback.listOrders(filters);
    return this.fallback.listOrders(filters);
  }

  async getOrder(orderId: string): Promise<Result<OrderRecord>> {
    if (!this.client) return this.fallback.getOrder(orderId);
    return this.fallback.getOrder(orderId);
  }

  async updateOrderStatus(params: Parameters<AdminService['updateOrderStatus']>[0]): Promise<Result<OrderRecord>> {
    if (!this.client) return this.fallback.updateOrderStatus(params);
    return this.fallback.updateOrderStatus(params);
  }

  async addOrderNote(params: Parameters<AdminService['addOrderNote']>[0]): Promise<Result<OrderRecord>> {
    if (!this.client) return this.fallback.addOrderNote(params);
    return this.fallback.addOrderNote(params);
  }

  async listBooks(): Promise<Result<BookRecord[]>> {
    if (!this.client) return this.fallback.listBooks();
    try {
      const { data: booksData, error } = await this.client
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !booksData) return this.fallback.listBooks();

      const { data: variantsData } = await this.client.from('variants').select('*');
      const allVariants = (variantsData || []) as Array<{
        id: string;
        book_id: string;
        format: string;
        price: number;
        compare_at_price?: number;
        cost: number;
        is_demo_cost?: boolean;
        sku: string;
        stock: number;
        low_stock_threshold?: number;
        weight_grams?: number;
        signed_edition?: boolean;
        personalization?: boolean;
        preorder_date?: string | null;
      }>;

      const records: BookRecord[] = booksData.map((b) => ({
        id: b.id,
        slug: b.slug,
        title: b.title,
        subtitle: b.subtitle || '',
        author: b.author || 'Ann',
        category: b.category || 'Novel',
        status: b.status || 'published',
        shortDescription: b.short_description || '',
        description: b.description || '',
        cover: b.cover || 'quiet',
        coverAlt: b.cover_alt || '',
        tags: b.tags || ['Fiction'],
        moods: b.moods || ['Atmospheric'],
        variants: allVariants
          .filter((v) => v.book_id === b.id)
          .map((v) => ({
            id: v.id,
            bookId: b.id,
            format: v.format,
            price: v.price,
            compareAtPrice: v.compare_at_price,
            cost: v.cost,
            isDemoCost: v.is_demo_cost ?? false,
            sku: v.sku,
            stock: v.stock,
            lowStockThreshold: v.low_stock_threshold ?? 5,
            weightGrams: v.weight_grams ?? 450,
            signedEdition: v.signed_edition ?? false,
            personalization: v.personalization ?? false,
            preorderDate: v.preorder_date,
          })),
      }));

      return { success: true, data: records };
    } catch {
      return this.fallback.listBooks();
    }
  }

  async getBook(idOrSlug: string): Promise<Result<BookRecord>> {
    if (!this.client) return this.fallback.getBook(idOrSlug);
    try {
      const { data: b, error } = await this.client
        .from('books')
        .select('*')
        .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
        .single();

      if (error || !b) return this.fallback.getBook(idOrSlug);

      const { data: variantsData } = await this.client
        .from('variants')
        .select('*')
        .eq('book_id', b.id);

      const rawVariants = (variantsData || []) as Array<{
        id: string;
        book_id: string;
        format: string;
        price: number;
        compare_at_price?: number;
        cost: number;
        is_demo_cost?: boolean;
        sku: string;
        stock: number;
        low_stock_threshold?: number;
        weight_grams?: number;
        signed_edition?: boolean;
        personalization?: boolean;
        preorder_date?: string | null;
      }>;

      const record: BookRecord = {
        id: b.id,
        slug: b.slug,
        title: b.title,
        subtitle: b.subtitle || '',
        author: b.author || 'Ann',
        category: b.category || 'Novel',
        status: b.status || 'published',
        shortDescription: b.short_description || '',
        description: b.description || '',
        cover: b.cover || 'quiet',
        coverAlt: b.cover_alt || '',
        tags: b.tags || ['Fiction'],
        moods: b.moods || ['Atmospheric'],
        variants: rawVariants.map((v) => ({
          id: v.id,
          bookId: b.id,
          format: v.format,
          price: v.price,
          compareAtPrice: v.compare_at_price,
          cost: v.cost,
          isDemoCost: v.is_demo_cost ?? false,
          sku: v.sku,
          stock: v.stock,
          lowStockThreshold: v.low_stock_threshold ?? 5,
          weightGrams: v.weight_grams ?? 450,
          signedEdition: v.signed_edition ?? false,
          personalization: v.personalization ?? false,
          preorderDate: v.preorder_date,
        })),
      };

      return { success: true, data: record };
    } catch {
      return this.fallback.getBook(idOrSlug);
    }
  }

  async createBook(params: Parameters<AdminService['createBook']>[0]): Promise<Result<BookRecord>> {
    if (!this.client) return this.fallback.createBook(params);
    try {
      const id = `book_${Date.now()}`;
      const newBook: BookRecord = {
        ...params.book,
        id,
        variants: params.book.variants.map((v) => ({
          ...v,
          id: v.id || `var_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          bookId: id,
        })),
      };

      const { error: insertBookErr } = await this.client.from('books').insert({
        id: newBook.id,
        slug: newBook.slug,
        title: newBook.title,
        subtitle: newBook.subtitle,
        author: newBook.author,
        category: newBook.category,
        status: newBook.status,
        short_description: newBook.shortDescription,
        description: newBook.description,
        cover: newBook.cover,
        cover_alt: newBook.coverAlt,
        tags: newBook.tags,
        moods: newBook.moods,
      });

      if (insertBookErr) return this.fallback.createBook(params);

      for (const v of newBook.variants) {
        await this.client.from('variants').insert({
          id: v.id,
          book_id: id,
          format: v.format,
          price: v.price,
          cost: v.cost,
          is_demo_cost: v.isDemoCost ?? false,
          sku: v.sku,
          stock: v.stock,
          low_stock_threshold: v.lowStockThreshold,
          weight_grams: v.weightGrams,
          signed_edition: v.signedEdition,
          personalization: v.personalization,
          preorder_date: v.preorderDate,
        });
      }

      return { success: true, data: newBook };
    } catch {
      return this.fallback.createBook(params);
    }
  }

  async updateBook(params: Parameters<AdminService['updateBook']>[0]): Promise<Result<BookRecord>> {
    if (!this.client) return this.fallback.updateBook(params);
    try {
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (params.book.title !== undefined) updates.title = params.book.title;
      if (params.book.subtitle !== undefined) updates.subtitle = params.book.subtitle;
      if (params.book.slug !== undefined) updates.slug = params.book.slug;
      if (params.book.status !== undefined) updates.status = params.book.status;
      if (params.book.shortDescription !== undefined) updates.short_description = params.book.shortDescription;
      if (params.book.description !== undefined) updates.description = params.book.description;
      if (params.book.cover !== undefined) updates.cover = params.book.cover;
      if (params.book.coverAlt !== undefined) updates.cover_alt = params.book.coverAlt;

      await this.client.from('books').update(updates).eq('id', params.id);
      return this.getBook(params.id);
    } catch {
      return this.fallback.updateBook(params);
    }
  }

  async archiveBook(params: Parameters<AdminService['archiveBook']>[0]): Promise<Result<BookRecord>> {
    return this.updateBook({
      id: params.id,
      book: { status: 'archived' },
      actorEmail: params.actorEmail,
      ipHash: params.ipHash,
    });
  }

  async deleteBook(params: Parameters<AdminService['deleteBook']>[0]): Promise<Result<BookRecord>> {
    if (!this.client) return this.fallback.deleteBook(params);
    try {
      const existing = await this.getBook(params.id);
      if (!existing.success) return this.fallback.deleteBook(params);
      await this.client.from('variants').delete().eq('book_id', params.id);
      await this.client.from('books').delete().eq('id', params.id);
      return existing;
    } catch {
      return this.fallback.deleteBook(params);
    }
  }

  async restoreBook(params: Parameters<AdminService['restoreBook']>[0]): Promise<Result<BookRecord>> {
    if (!this.client) return this.fallback.restoreBook(params);
    return this.createBook({
      book: params.book,
      actorEmail: params.actorEmail,
      ipHash: params.ipHash,
    });
  }

  async updateVariantCost(params: Parameters<AdminService['updateVariantCost']>[0]): Promise<Result<VariantRecord>> {
    if (!this.client) return this.fallback.updateVariantCost(params);
    return this.fallback.updateVariantCost(params);
  }

  async bulkSetVariantCosts(params: Parameters<AdminService['bulkSetVariantCosts']>[0]): Promise<Result<{ updatedCount: number }>> {
    if (!this.client) return this.fallback.bulkSetVariantCosts(params);
    return this.fallback.bulkSetVariantCosts(params);
  }

  async listCoupons(): Promise<Result<CouponRecord[]>> {
    if (!this.client) return this.fallback.listCoupons();
    return this.fallback.listCoupons();
  }

  async createCoupon(params: Parameters<AdminService['createCoupon']>[0]): Promise<Result<CouponRecord>> {
    if (!this.client) return this.fallback.createCoupon(params);
    return this.fallback.createCoupon(params);
  }

  async toggleCoupon(id: string, active: boolean): Promise<Result<CouponRecord>> {
    if (!this.client) return this.fallback.toggleCoupon(id, active);
    return this.fallback.toggleCoupon(id, active);
  }

  async listCustomers(filters?: Parameters<AdminService['listCustomers']>[0]): Promise<Result<CustomerRecord[]>> {
    if (!this.client) return this.fallback.listCustomers(filters);
    return this.fallback.listCustomers(filters);
  }

  async getCustomer(id: string): Promise<Result<CustomerRecord>> {
    if (!this.client) return this.fallback.getCustomer(id);
    return this.fallback.getCustomer(id);
  }

  async listReviews(): Promise<Result<ReviewRecord[]>> {
    if (!this.client) return this.fallback.listReviews();
    return this.fallback.listReviews();
  }

  async moderateReview(params: Parameters<AdminService['moderateReview']>[0]): Promise<Result<ReviewRecord>> {
    if (!this.client) return this.fallback.moderateReview(params);
    return this.fallback.moderateReview(params);
  }

  async listSubscribers(): Promise<Result<SubscriberRecord[]>> {
    if (!this.client) return this.fallback.listSubscribers();
    return this.fallback.listSubscribers();
  }

  async exportSubscribersCsv(actorEmail: string, ipHash: string): Promise<Result<string>> {
    if (!this.client) return this.fallback.exportSubscribersCsv(actorEmail, ipHash);
    return this.fallback.exportSubscribersCsv(actorEmail, ipHash);
  }

  async resetDemoData(): Promise<Result<boolean>> {
    return this.fallback.resetDemoData();
  }
}
