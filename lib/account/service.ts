import {
  AccountData,
  AccountService,
  DemoPaymentMethod,
  Order,
  ReadingList,
  ReadingListItem,
  ReturnRequest,
  UserAddress,
  UserPreferences,
  UserReview,
  UserSession,
} from './types';
import { AccountDataSchema } from './schema';

const STORAGE_PREFIX = 'ann_account_v1_';

export function getInitialDemoData(userId: string): AccountData {
  const defaultAddress: UserAddress = {
    id: 'addr_demo_01',
    fullName: 'Eleanor Vance',
    street: '14 Elmwood Terrace',
    apartment: 'Apt 2B',
    city: 'Portland',
    state: 'OR',
    postalCode: '97201',
    country: 'United States',
    phone: '(503) 555-0142',
    isDefault: true,
  };

  const sampleOrders: Order[] = [
    {
      id: 'ord_sample_01',
      orderNumber: 'ANN-2026-00388',
      date: '2026-10-10T14:32:00.000Z',
      items: [
        {
          id: 'item_sample_01',
          bookId: 'quiet-hours',
          bookSlug: 'the-quiet-hours',
          title: 'The Quiet Hours',
          format: 'Hardcover',
          price: 2800,
          quantity: 1,
          cover: 'quiet',
        },
        {
          id: 'item_sample_02',
          bookId: 'room-for-rain',
          bookSlug: 'a-room-for-rain',
          title: 'A Room for Rain',
          format: 'Paperback',
          price: 1900,
          quantity: 1,
          cover: 'rain',
        },
      ],
      subtotal: 4700,
      shipping: 0,
      estimatedTax: 0,
      total: 4700,
      status: 'Delivered',
      shippingAddress: defaultAddress,
      billingAddress: defaultAddress,
      paymentMethod: {
        brand: 'Visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2028,
      },
      trackingNumber: '9400111899562534567812',
      carrier: 'USPS Priority Mail',
      estimatedDelivery: 'Delivered on October 14, 2026',
      isSample: true,
    },
    {
      id: 'ord_sample_02',
      orderNumber: 'ANN-2026-00412',
      date: '2026-10-18T09:15:00.000Z',
      items: [
        {
          id: 'item_sample_03',
          bookId: 'monsoon-letters',
          bookSlug: 'monsoon-letters',
          title: 'Monsoon Letters',
          format: 'Paperback',
          price: 1950,
          quantity: 1,
          cover: 'letters',
        },
      ],
      subtotal: 1950,
      shipping: 400,
      estimatedTax: 0,
      total: 2350,
      status: 'Dispatched',
      shippingAddress: defaultAddress,
      billingAddress: defaultAddress,
      paymentMethod: {
        brand: 'Visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2028,
      },
      trackingNumber: '9400111899562534567813',
      carrier: 'USPS Ground Advantage',
      estimatedDelivery: 'Expected by tomorrow, 6:00 PM',
      isSample: true,
    },
  ];

  const samplePaymentMethods: DemoPaymentMethod[] = [
    {
      id: 'pm_demo_01',
      brand: 'Visa',
      last4: '4242',
      expMonth: 12,
      expYear: 2028,
      isDefault: true,
      billingAddressId: defaultAddress.id,
    },
    {
      id: 'pm_demo_02',
      brand: 'Mastercard',
      last4: '4444',
      expMonth: 8,
      expYear: 2029,
      isDefault: false,
      billingAddressId: defaultAddress.id,
    },
  ];

  const sampleLists: ReadingList[] = [
    {
      id: 'list_wishlist',
      name: 'Wishlist',
      isDefault: true,
      updatedAt: '2026-10-19T10:00:00.000Z',
      items: [
        {
          id: 'li_01',
          bookId: 'small-things',
          bookSlug: 'a-map-of-small-things',
          title: 'A Map of Small Things',
          category: 'Reflective Collection',
          price: 1200,
          cover: 'map',
          addedAt: '2026-10-15T08:00:00.000Z',
        },
      ],
    },
    {
      id: 'list_saved',
      name: 'Saved for Later',
      isDefault: false,
      updatedAt: '2026-10-18T14:00:00.000Z',
      items: [
        {
          id: 'li_02',
          bookId: 'room-for-rain',
          bookSlug: 'a-room-for-rain',
          title: 'A Room for Rain (Hardcover Edition)',
          category: 'Novel',
          price: 2900,
          cover: 'rain',
          addedAt: '2026-10-17T11:20:00.000Z',
        },
      ],
    },
  ];

  const sampleReviews: UserReview[] = [
    {
      id: 'rev_sample_01',
      bookId: 'quiet-hours',
      bookSlug: 'the-quiet-hours',
      bookTitle: 'The Quiet Hours',
      orderId: 'ord_sample_01',
      rating: 5,
      headline: 'A slow, breathtaking read that stays with you',
      body: 'The tactile prose and description of the rain-drenched coastal town resonated with me deeply. Ann writes with such quiet dignity.',
      createdAt: '2026-10-15T16:00:00.000Z',
      updatedAt: '2026-10-15T16:00:00.000Z',
      isSample: true,
    },
  ];

  const sampleSessions: UserSession[] = [
    {
      id: 'sess_curr',
      device: 'MacBook Pro · macOS',
      browser: 'Chrome 130',
      location: 'Portland, OR, United States',
      ip: '192.168.1.8',
      lastActive: 'Active now',
      isCurrent: true,
    },
    {
      id: 'sess_mobile',
      device: 'iPhone 15 Pro · iOS 18',
      browser: 'Mobile Safari',
      location: 'Portland, OR, United States',
      ip: '172.56.21.9',
      lastActive: 'Yesterday at 8:45 PM',
      isCurrent: false,
    },
  ];

  return {
    version: 1,
    userId,
    orders: sampleOrders,
    addresses: [defaultAddress],
    paymentMethods: samplePaymentMethods,
    lists: sampleLists,
    reviews: sampleReviews,
    returns: [],
    preferences: {
      language: 'en',
      emailOrderUpdates: true,
      emailNewsletter: true,
      emailJournal: false,
    },
    sessions: sampleSessions,
  };
}

export class DemoAccountService implements AccountService {
  private getStorageKey(userId: string): string {
    return `${STORAGE_PREFIX}${userId}`;
  }

  async getAccountData(userId: string): Promise<AccountData> {
    if (typeof window === 'undefined') {
      return getInitialDemoData(userId);
    }
    const key = this.getStorageKey(userId);
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        const initial = getInitialDemoData(userId);
        localStorage.setItem(key, JSON.stringify(initial));
        return initial;
      }
      const parsed = JSON.parse(raw);
      const validation = AccountDataSchema.safeParse(parsed);
      if (validation.success) {
        return validation.data as AccountData;
      }
      // If validation fails (corrupt data), reset safely
      console.warn('[AccountService] Corrupted data detected. Safely resetting to initial demo data.');
      const fallback = getInitialDemoData(userId);
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    } catch {
      const fallback = getInitialDemoData(userId);
      try {
        localStorage.setItem(key, JSON.stringify(fallback));
      } catch {}
      return fallback;
    }
  }

  private async saveAccountData(userId: string, data: AccountData): Promise<void> {
    if (typeof window === 'undefined') return;
    const key = this.getStorageKey(userId);
    try {
      localStorage.setItem(key, JSON.stringify(data));
      // Dispatch storage event for cross-tab or same-window reactivity
      window.dispatchEvent(new CustomEvent('ann-account-update', { detail: { userId } }));
    } catch (e) {
      console.error('[AccountService] Failed to persist data', e);
    }
  }

  // Orders
  async getOrders(userId: string): Promise<Order[]> {
    const data = await this.getAccountData(userId);
    return data.orders;
  }

  async getOrderById(userId: string, orderId: string): Promise<Order | null> {
    const data = await this.getAccountData(userId);
    return data.orders.find((o) => o.id === orderId) || null;
  }

  async createOrder(userId: string, orderData: Omit<Order, 'id' | 'isSample'>): Promise<Order> {
    const data = await this.getAccountData(userId);
    const newOrder: Order = {
      ...orderData,
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      isSample: false, // Real order created in checkout
    };
    data.orders = [newOrder, ...data.orders];
    await this.saveAccountData(userId, data);
    return newOrder;
  }

  async cancelOrder(userId: string, orderId: string, reason = 'Customer request'): Promise<Order> {
    const data = await this.getAccountData(userId);
    const idx = data.orders.findIndex((o) => o.id === orderId);
    if (idx === -1) throw new Error('Order not found');

    const order = data.orders[idx];
    if (order.status === 'Dispatched' || order.status === 'Delivered') {
      throw new Error('Orders that have been dispatched or delivered cannot be cancelled.');
    }

    const updated: Order = {
      ...order,
      status: 'Cancelled',
      cancelledAt: new Date().toISOString(),
      cancelReason: reason,
    };
    data.orders[idx] = updated;
    await this.saveAccountData(userId, data);
    return updated;
  }

  // Addresses
  async getAddresses(userId: string): Promise<UserAddress[]> {
    const data = await this.getAccountData(userId);
    return data.addresses;
  }

  async addAddress(userId: string, address: Omit<UserAddress, 'id'>): Promise<UserAddress> {
    const data = await this.getAccountData(userId);
    const newAddress: UserAddress = {
      ...address,
      id: `addr_${Date.now()}`,
    };
    if (newAddress.isDefault || data.addresses.length === 0) {
      data.addresses = data.addresses.map((a) => ({ ...a, isDefault: false }));
      newAddress.isDefault = true;
    }
    data.addresses.push(newAddress);
    await this.saveAccountData(userId, data);
    return newAddress;
  }

  async updateAddress(userId: string, addressId: string, updates: Partial<UserAddress>): Promise<UserAddress> {
    const data = await this.getAccountData(userId);
    const idx = data.addresses.findIndex((a) => a.id === addressId);
    if (idx === -1) throw new Error('Address not found');

    if (updates.isDefault) {
      data.addresses = data.addresses.map((a) => ({ ...a, isDefault: false }));
    }
    data.addresses[idx] = { ...data.addresses[idx], ...updates };
    await this.saveAccountData(userId, data);
    return data.addresses[idx];
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const data = await this.getAccountData(userId);
    const deleted = data.addresses.find((a) => a.id === addressId);
    data.addresses = data.addresses.filter((a) => a.id !== addressId);
    if (deleted?.isDefault && data.addresses.length > 0) {
      data.addresses[0].isDefault = true;
    }
    await this.saveAccountData(userId, data);
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<void> {
    const data = await this.getAccountData(userId);
    data.addresses = data.addresses.map((a) => ({
      ...a,
      isDefault: a.id === addressId,
    }));
    await this.saveAccountData(userId, data);
  }

  // Payment methods
  async getPaymentMethods(userId: string): Promise<DemoPaymentMethod[]> {
    const data = await this.getAccountData(userId);
    return data.paymentMethods;
  }

  async addPaymentMethod(userId: string, method: Omit<DemoPaymentMethod, 'id'>): Promise<DemoPaymentMethod> {
    const data = await this.getAccountData(userId);
    const newMethod: DemoPaymentMethod = {
      ...method,
      id: `pm_${Date.now()}`,
    };
    if (newMethod.isDefault || data.paymentMethods.length === 0) {
      data.paymentMethods = data.paymentMethods.map((m) => ({ ...m, isDefault: false }));
      newMethod.isDefault = true;
    }
    data.paymentMethods.push(newMethod);
    await this.saveAccountData(userId, data);
    return newMethod;
  }

  async removePaymentMethod(userId: string, methodId: string): Promise<void> {
    const data = await this.getAccountData(userId);
    const removed = data.paymentMethods.find((m) => m.id === methodId);
    data.paymentMethods = data.paymentMethods.filter((m) => m.id !== methodId);
    if (removed?.isDefault && data.paymentMethods.length > 0) {
      data.paymentMethods[0].isDefault = true;
    }
    await this.saveAccountData(userId, data);
  }

  async setDefaultPaymentMethod(userId: string, methodId: string): Promise<void> {
    const data = await this.getAccountData(userId);
    data.paymentMethods = data.paymentMethods.map((m) => ({
      ...m,
      isDefault: m.id === methodId,
    }));
    await this.saveAccountData(userId, data);
  }

  // Lists
  async getLists(userId: string): Promise<ReadingList[]> {
    const data = await this.getAccountData(userId);
    return data.lists;
  }

  async createList(userId: string, name: string): Promise<ReadingList> {
    const data = await this.getAccountData(userId);
    const newList: ReadingList = {
      id: `list_${Date.now()}`,
      name: name.trim(),
      isDefault: false,
      items: [],
      updatedAt: new Date().toISOString(),
    };
    data.lists.push(newList);
    await this.saveAccountData(userId, data);
    return newList;
  }

  async renameList(userId: string, listId: string, name: string): Promise<ReadingList> {
    const data = await this.getAccountData(userId);
    const list = data.lists.find((l) => l.id === listId);
    if (!list) throw new Error('List not found');
    list.name = name.trim();
    list.updatedAt = new Date().toISOString();
    await this.saveAccountData(userId, data);
    return list;
  }

  async deleteList(userId: string, listId: string): Promise<void> {
    const data = await this.getAccountData(userId);
    const target = data.lists.find((l) => l.id === listId);
    if (target?.isDefault) {
      throw new Error('Default list cannot be deleted');
    }
    data.lists = data.lists.filter((l) => l.id !== listId);
    await this.saveAccountData(userId, data);
  }

  async addToList(
    userId: string,
    listId: string,
    item: Omit<ReadingListItem, 'id' | 'addedAt'>
  ): Promise<ReadingList> {
    const data = await this.getAccountData(userId);
    const list = data.lists.find((l) => l.id === listId);
    if (!list) throw new Error('List not found');

    const exists = list.items.some((i) => i.bookId === item.bookId);
    if (!exists) {
      list.items.push({
        ...item,
        id: `li_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        addedAt: new Date().toISOString(),
      });
      list.updatedAt = new Date().toISOString();
      await this.saveAccountData(userId, data);
    }
    return list;
  }

  async removeFromList(userId: string, listId: string, itemId: string): Promise<ReadingList> {
    const data = await this.getAccountData(userId);
    const list = data.lists.find((l) => l.id === listId);
    if (!list) throw new Error('List not found');

    list.items = list.items.filter((i) => i.id !== itemId && i.bookId !== itemId);
    list.updatedAt = new Date().toISOString();
    await this.saveAccountData(userId, data);
    return list;
  }

  async moveBetweenLists(
    userId: string,
    fromListId: string,
    toListId: string,
    itemId: string
  ): Promise<void> {
    const data = await this.getAccountData(userId);
    const fromList = data.lists.find((l) => l.id === fromListId);
    const toList = data.lists.find((l) => l.id === toListId);
    if (!fromList || !toList) throw new Error('Lists not found');

    const item = fromList.items.find((i) => i.id === itemId || i.bookId === itemId);
    if (!item) return;

    fromList.items = fromList.items.filter((i) => i.id !== item.id);
    fromList.updatedAt = new Date().toISOString();

    if (!toList.items.some((i) => i.bookId === item.bookId)) {
      toList.items.push({
        ...item,
        id: `li_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        addedAt: new Date().toISOString(),
      });
      toList.updatedAt = new Date().toISOString();
    }
    await this.saveAccountData(userId, data);
  }

  // Reviews
  async getReviews(userId: string): Promise<UserReview[]> {
    const data = await this.getAccountData(userId);
    return data.reviews;
  }

  async createReview(
    userId: string,
    review: Omit<UserReview, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<UserReview> {
    const data = await this.getAccountData(userId);
    const now = new Date().toISOString();
    const newReview: UserReview = {
      ...review,
      id: `rev_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      isSample: false,
    };
    data.reviews = [newReview, ...data.reviews];
    await this.saveAccountData(userId, data);
    return newReview;
  }

  async updateReview(userId: string, reviewId: string, updates: Partial<UserReview>): Promise<UserReview> {
    const data = await this.getAccountData(userId);
    const idx = data.reviews.findIndex((r) => r.id === reviewId);
    if (idx === -1) throw new Error('Review not found');

    data.reviews[idx] = {
      ...data.reviews[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await this.saveAccountData(userId, data);
    return data.reviews[idx];
  }

  async deleteReview(userId: string, reviewId: string): Promise<void> {
    const data = await this.getAccountData(userId);
    data.reviews = data.reviews.filter((r) => r.id !== reviewId);
    await this.saveAccountData(userId, data);
  }

  // Returns
  async getReturns(userId: string): Promise<ReturnRequest[]> {
    const data = await this.getAccountData(userId);
    return data.returns;
  }

  async createReturn(
    userId: string,
    returnData: Omit<ReturnRequest, 'id' | 'returnNumber' | 'createdAt' | 'status'>
  ): Promise<ReturnRequest> {
    const data = await this.getAccountData(userId);
    const rand = Math.floor(10000 + Math.random() * 90000);
    const newReturn: ReturnRequest = {
      ...returnData,
      id: `ret_${Date.now()}`,
      returnNumber: `RET-2026-${rand}`,
      createdAt: new Date().toISOString(),
      status: 'Return Requested',
      labelUrl: `/account/returns/RET-2026-${rand}/label`,
    };
    data.returns = [newReturn, ...data.returns];
    await this.saveAccountData(userId, data);
    return newReturn;
  }

  async cancelReturn(userId: string, returnId: string): Promise<ReturnRequest> {
    const data = await this.getAccountData(userId);
    const idx = data.returns.findIndex((r) => r.id === returnId || r.returnNumber === returnId);
    if (idx === -1) throw new Error('Return request not found');

    data.returns[idx] = {
      ...data.returns[idx],
      status: 'Cancelled',
    };
    await this.saveAccountData(userId, data);
    return data.returns[idx];
  }

  // Preferences
  async getPreferences(userId: string): Promise<UserPreferences> {
    const data = await this.getAccountData(userId);
    return data.preferences;
  }

  async updatePreferences(userId: string, updates: Partial<UserPreferences>): Promise<UserPreferences> {
    const data = await this.getAccountData(userId);
    data.preferences = { ...data.preferences, ...updates };
    await this.saveAccountData(userId, data);
    return data.preferences;
  }

  // Sessions
  async getSessions(userId: string): Promise<UserSession[]> {
    const data = await this.getAccountData(userId);
    return data.sessions;
  }

  async signOutAllOtherSessions(userId: string): Promise<void> {
    const data = await this.getAccountData(userId);
    data.sessions = data.sessions.filter((s) => s.isCurrent);
    await this.saveAccountData(userId, data);
  }

  // Privacy & Data
  async exportUserData(userId: string): Promise<AccountData> {
    return this.getAccountData(userId);
  }

  async deleteUserAccount(userId: string): Promise<void> {
    if (typeof window === 'undefined') return;
    const key = this.getStorageKey(userId);
    try {
      localStorage.removeItem(key);
      localStorage.removeItem('ann-bookstore-user');
      document.cookie = 'ann_session=; path=/; max-age=0; SameSite=Lax';
    } catch {}
  }
}

/**
 * SupabaseAccountService stub with typed signatures for production migration
 */
export class SupabaseAccountService implements AccountService {
  async getAccountData(userId: string): Promise<AccountData> {
    throw new Error(`[SupabaseAccountService] Supabase not configured for user: ${userId}`);
  }
  async getOrders(): Promise<Order[]> { throw new Error('Method not implemented.'); }
  async getOrderById(): Promise<Order | null> { throw new Error('Method not implemented.'); }
  async createOrder(): Promise<Order> { throw new Error('Method not implemented.'); }
  async cancelOrder(): Promise<Order> { throw new Error('Method not implemented.'); }
  async getAddresses(): Promise<UserAddress[]> { throw new Error('Method not implemented.'); }
  async addAddress(): Promise<UserAddress> { throw new Error('Method not implemented.'); }
  async updateAddress(): Promise<UserAddress> { throw new Error('Method not implemented.'); }
  async deleteAddress(): Promise<void> { throw new Error('Method not implemented.'); }
  async setDefaultAddress(): Promise<void> { throw new Error('Method not implemented.'); }
  async getPaymentMethods(): Promise<DemoPaymentMethod[]> { throw new Error('Method not implemented.'); }
  async addPaymentMethod(): Promise<DemoPaymentMethod> { throw new Error('Method not implemented.'); }
  async removePaymentMethod(): Promise<void> { throw new Error('Method not implemented.'); }
  async setDefaultPaymentMethod(): Promise<void> { throw new Error('Method not implemented.'); }
  async getLists(): Promise<ReadingList[]> { throw new Error('Method not implemented.'); }
  async createList(): Promise<ReadingList> { throw new Error('Method not implemented.'); }
  async renameList(): Promise<ReadingList> { throw new Error('Method not implemented.'); }
  async deleteList(): Promise<void> { throw new Error('Method not implemented.'); }
  async addToList(): Promise<ReadingList> { throw new Error('Method not implemented.'); }
  async removeFromList(): Promise<ReadingList> { throw new Error('Method not implemented.'); }
  async moveBetweenLists(): Promise<void> { throw new Error('Method not implemented.'); }
  async getReviews(): Promise<UserReview[]> { throw new Error('Method not implemented.'); }
  async createReview(): Promise<UserReview> { throw new Error('Method not implemented.'); }
  async updateReview(): Promise<UserReview> { throw new Error('Method not implemented.'); }
  async deleteReview(): Promise<void> { throw new Error('Method not implemented.'); }
  async getReturns(): Promise<ReturnRequest[]> { throw new Error('Method not implemented.'); }
  async createReturn(): Promise<ReturnRequest> { throw new Error('Method not implemented.'); }
  async cancelReturn(): Promise<ReturnRequest> { throw new Error('Method not implemented.'); }
  async getPreferences(): Promise<UserPreferences> { throw new Error('Method not implemented.'); }
  async updatePreferences(): Promise<UserPreferences> { throw new Error('Method not implemented.'); }
  async getSessions(): Promise<UserSession[]> { throw new Error('Method not implemented.'); }
  async signOutAllOtherSessions(): Promise<void> { throw new Error('Method not implemented.'); }
  async exportUserData(): Promise<AccountData> { throw new Error('Method not implemented.'); }
  async deleteUserAccount(): Promise<void> { throw new Error('Method not implemented.'); }
}

export const accountService: AccountService = new DemoAccountService();
