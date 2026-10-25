import { z } from 'zod';

export const OrderItemSchema = z.object({
  id: z.string(),
  bookId: z.string(),
  bookSlug: z.string(),
  title: z.string(),
  format: z.string(),
  price: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
  cover: z.string().optional(),
});

export const UserAddressSchema = z.object({
  id: z.string(),
  fullName: z.string().min(1),
  street: z.string().min(1),
  apartment: z.string().optional(),
  city: z.string().min(1),
  state: z.string().length(2),
  postalCode: z.string().regex(/^\d{5}(-\d{4})?$/),
  country: z.string().default('United States'),
  phone: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export const DemoPaymentMethodSchema = z.object({
  id: z.string(),
  brand: z.enum(['Visa', 'Mastercard', 'American Express', 'Discover']),
  last4: z.string().length(4),
  expMonth: z.number().int().min(1).max(12),
  expYear: z.number().int().min(2025).max(2040),
  isDefault: z.boolean().default(false),
  billingAddressId: z.string().optional(),
});

export const OrderStatusSchema = z.enum([
  'Confirmed',
  'Packed',
  'Dispatched',
  'Delivered',
  'Cancelled',
]);

export const OrderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  date: z.string(),
  items: z.array(OrderItemSchema),
  subtotal: z.number().int().nonnegative(),
  shipping: z.number().int().nonnegative(),
  estimatedTax: z.number().int().nonnegative().default(0),
  total: z.number().int().nonnegative(),
  status: OrderStatusSchema,
  shippingAddress: UserAddressSchema,
  billingAddress: UserAddressSchema.optional(),
  paymentMethod: z
    .object({
      brand: z.string(),
      last4: z.string(),
      expMonth: z.number(),
      expYear: z.number(),
    })
    .optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  estimatedDelivery: z.string(),
  isSample: z.boolean().default(false),
  cancelledAt: z.string().optional(),
  cancelReason: z.string().optional(),
});

export const ReadingListItemSchema = z.object({
  id: z.string(),
  bookId: z.string(),
  bookSlug: z.string(),
  title: z.string(),
  category: z.string(),
  price: z.number().int().nonnegative(),
  cover: z.string(),
  addedAt: z.string(),
});

export const ReadingListSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  isDefault: z.boolean().default(false),
  items: z.array(ReadingListItemSchema).default([]),
  updatedAt: z.string(),
});

export const UserReviewSchema = z.object({
  id: z.string(),
  bookId: z.string(),
  bookSlug: z.string(),
  bookTitle: z.string(),
  orderId: z.string(),
  rating: z.number().int().min(1).max(5),
  headline: z.string().min(1),
  body: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  isSample: z.boolean().optional(),
});

export const ReturnReasonSchema = z.enum([
  'Defective / Damaged',
  'Wrong item received',
  'Changed mind',
  'Arrived too late',
]);

export const ReturnStatusSchema = z.enum([
  'Return Requested',
  'In Transit',
  'Refund Processed',
  'Cancelled',
]);

export const ReturnRequestSchema = z.object({
  id: z.string(),
  returnNumber: z.string(),
  orderId: z.string(),
  orderNumber: z.string(),
  itemId: z.string(),
  itemTitle: z.string(),
  itemFormat: z.string(),
  quantity: z.number().int().positive(),
  reason: ReturnReasonSchema,
  comment: z.string().optional(),
  status: ReturnStatusSchema,
  refundAmount: z.number().int().nonnegative(),
  createdAt: z.string(),
  labelUrl: z.string().optional(),
});

export const UserPreferencesSchema = z.object({
  language: z.string().default('en'),
  emailOrderUpdates: z.boolean().default(true),
  emailNewsletter: z.boolean().default(true),
  emailJournal: z.boolean().default(false),
  reduceMotion: z.boolean().optional(),
});

export const UserSessionSchema = z.object({
  id: z.string(),
  device: z.string(),
  browser: z.string(),
  location: z.string(),
  ip: z.string(),
  lastActive: z.string(),
  isCurrent: z.boolean().default(false),
});

export const AccountDataSchema = z.object({
  version: z.number().int().default(1),
  userId: z.string(),
  orders: z.array(OrderSchema).default([]),
  addresses: z.array(UserAddressSchema).default([]),
  paymentMethods: z.array(DemoPaymentMethodSchema).default([]),
  lists: z.array(ReadingListSchema).default([]),
  reviews: z.array(UserReviewSchema).default([]),
  returns: z.array(ReturnRequestSchema).default([]),
  preferences: UserPreferencesSchema.default({
    language: 'en',
    emailOrderUpdates: true,
    emailNewsletter: true,
    emailJournal: false,
  }),
  sessions: z.array(UserSessionSchema).default([]),
});

export type ValidatedAccountData = z.infer<typeof AccountDataSchema>;
