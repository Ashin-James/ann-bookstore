import { AdminRole, AdminResource, AdminAction } from '@/src/config/permissions';

export type { AdminRole, AdminResource, AdminAction };

export type Result<T, E = AdminError> =
  | { success: true; data: T }
  | { success: false; error: E };

export interface AdminError {
  code:
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'INVALID_INPUT'
    | 'RATE_LIMITED'
    | 'LOCKED_OUT'
    | 'SETUP_DISABLED'
    | 'INTERNAL_ERROR';
  message: string;
  field?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
  totpEnabled: boolean;
  disabled: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AdminSession {
  token: string;
  user: AdminUser;
  expiresAt: string;
  lastActiveAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string | null;
  actorEmail: string;
  action: string;
  entity: string;
  entityId: string | null;
  beforeState: Record<string, unknown> | null;
  afterState: Record<string, unknown> | null;
  ipHash: string;
  createdAt: string;
}

export interface CustomerRecord {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  notes: string | null;
  tags: string[];
  totalOrders: number;
  totalSpent: number; // in cents
  createdAt: string;
  isDemo?: boolean;
}

export interface OrderItemRecord {
  id: string;
  bookId: string;
  bookSlug: string;
  title: string;
  format: string;
  price: number; // in cents
  cost: number; // in cents
  isDemoCost: boolean;
  quantity: number;
  cover: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  date: string;
  status: 'Pending' | 'Paid' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Refunded';
  items: OrderItemRecord[];
  subtotal: number; // in cents
  shipping: number; // in cents
  tax: number; // in cents
  discount: number; // in cents
  total: number; // in cents
  shippingAddress: {
    fullName: string;
    street: string;
    apartment?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  trackingNumber?: string;
  carrier?: string;
  notes?: string[];
  isDemo?: boolean;
}

export interface VariantRecord {
  id: string;
  bookId: string;
  format: string;
  price: number; // cents
  compareAtPrice?: number;
  cost: number; // cents
  isDemoCost: boolean;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  weightGrams: number;
  signedEdition: boolean;
  personalization: boolean;
  preorderDate?: string | null;
}

export interface BookRecord {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  author: string;
  category: string;
  description: string;
  shortDescription: string;
  cover: string;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  variants: VariantRecord[];
  featured?: boolean;
  tags: string[];
  moods: string[];
}

export interface CouponRecord {
  id: string;
  code: string;
  type: 'percent' | 'fixed' | 'free_shipping';
  value: number; // percent or cents
  minSpend: number; // cents
  usageLimit?: number;
  usageCount: number;
  startsAt: string;
  endsAt?: string;
  active: boolean;
}

export interface ReviewRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  customerName: string;
  customerEmail: string;
  rating: number; // 1-5
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  reply?: string;
  createdAt: string;
}

export interface SubscriberRecord {
  id: string;
  email: string;
  source: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
}

export interface DashboardKPIs {
  customersCount: number;
  grossSalesCents: number;
  totalCostCents: number;
  grossMarginPercent: number;
  ordersCount: number;
  aovCents: number;
  unitsSold: number;
  hasDemoCostEstimates: boolean;
  recentOrders: OrderRecord[];
  lowStockVariants: VariantRecord[];
}
