export type OrderStatus = 'Confirmed' | 'Packed' | 'Dispatched' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  id: string;
  bookId: string;
  bookSlug: string;
  title: string;
  format: string;
  price: number; // in integer cents
  quantity: number;
  cover?: string;
}

export interface UserAddress {
  id: string;
  fullName: string;
  street: string;
  apartment?: string;
  city: string;
  state: string; // 2-letter US state code
  postalCode: string; // 5-digit or ZIP+4
  country: string; // "United States"
  phone?: string;
  isDefault: boolean;
}

export interface DemoPaymentMethod {
  id: string;
  brand: 'Visa' | 'Mastercard' | 'American Express' | 'Discover';
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  billingAddressId?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string; // ISO string
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  estimatedTax: number;
  total: number;
  status: OrderStatus;
  shippingAddress: UserAddress;
  billingAddress?: UserAddress;
  paymentMethod?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery: string;
  isSample: boolean; // true for initial sample orders, false for real checkout orders
  cancelledAt?: string;
  cancelReason?: string;
}

export interface ReadingListItem {
  id: string;
  bookId: string;
  bookSlug: string;
  title: string;
  category: string;
  price: number;
  cover: string;
  addedAt: string;
}

export interface ReadingList {
  id: string;
  name: string;
  isDefault: boolean;
  items: ReadingListItem[];
  updatedAt: string;
}

export interface UserReview {
  id: string;
  bookId: string;
  bookSlug: string;
  bookTitle: string;
  orderId: string;
  rating: number; // 1 to 5
  headline: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  isSample?: boolean;
}

export type ReturnReason =
  | 'Defective / Damaged'
  | 'Wrong item received'
  | 'Changed mind'
  | 'Arrived too late';

export type ReturnStatus =
  | 'Return Requested'
  | 'In Transit'
  | 'Refund Processed'
  | 'Cancelled';

export interface ReturnRequest {
  id: string;
  returnNumber: string; // e.g. RET-2026-00124
  orderId: string;
  orderNumber: string;
  itemId: string;
  itemTitle: string;
  itemFormat: string;
  quantity: number;
  reason: ReturnReason;
  comment?: string;
  status: ReturnStatus;
  refundAmount: number; // in integer cents
  createdAt: string;
  labelUrl?: string;
}

export interface UserPreferences {
  language: string;
  emailOrderUpdates: boolean;
  emailNewsletter: boolean;
  emailJournal: boolean;
  reduceMotion?: boolean;
}

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface AccountData {
  version: number;
  userId: string;
  orders: Order[];
  addresses: UserAddress[];
  paymentMethods: DemoPaymentMethod[];
  lists: ReadingList[];
  reviews: UserReview[];
  returns: ReturnRequest[];
  preferences: UserPreferences;
  sessions: UserSession[];
}

export interface AccountService {
  getAccountData(userId: string): Promise<AccountData>;
  // Orders
  getOrders(userId: string): Promise<Order[]>;
  getOrderById(userId: string, orderId: string): Promise<Order | null>;
  createOrder(userId: string, orderData: Omit<Order, 'id' | 'isSample'>): Promise<Order>;
  cancelOrder(userId: string, orderId: string, reason?: string): Promise<Order>;
  // Addresses
  getAddresses(userId: string): Promise<UserAddress[]>;
  addAddress(userId: string, address: Omit<UserAddress, 'id'>): Promise<UserAddress>;
  updateAddress(userId: string, addressId: string, updates: Partial<UserAddress>): Promise<UserAddress>;
  deleteAddress(userId: string, addressId: string): Promise<void>;
  setDefaultAddress(userId: string, addressId: string): Promise<void>;
  // Payment methods (Demo only)
  getPaymentMethods(userId: string): Promise<DemoPaymentMethod[]>;
  addPaymentMethod(userId: string, method: Omit<DemoPaymentMethod, 'id'>): Promise<DemoPaymentMethod>;
  removePaymentMethod(userId: string, methodId: string): Promise<void>;
  setDefaultPaymentMethod(userId: string, methodId: string): Promise<void>;
  // Lists
  getLists(userId: string): Promise<ReadingList[]>;
  createList(userId: string, name: string): Promise<ReadingList>;
  renameList(userId: string, listId: string, name: string): Promise<ReadingList>;
  deleteList(userId: string, listId: string): Promise<void>;
  addToList(userId: string, listId: string, item: Omit<ReadingListItem, 'id' | 'addedAt'>): Promise<ReadingList>;
  removeFromList(userId: string, listId: string, itemId: string): Promise<ReadingList>;
  moveBetweenLists(userId: string, fromListId: string, toListId: string, itemId: string): Promise<void>;
  // Reviews
  getReviews(userId: string): Promise<UserReview[]>;
  createReview(userId: string, review: Omit<UserReview, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserReview>;
  updateReview(userId: string, reviewId: string, updates: Partial<UserReview>): Promise<UserReview>;
  deleteReview(userId: string, reviewId: string): Promise<void>;
  // Returns
  getReturns(userId: string): Promise<ReturnRequest[]>;
  createReturn(userId: string, returnData: Omit<ReturnRequest, 'id' | 'returnNumber' | 'createdAt' | 'status'>): Promise<ReturnRequest>;
  cancelReturn(userId: string, returnId: string): Promise<ReturnRequest>;
  // Preferences
  getPreferences(userId: string): Promise<UserPreferences>;
  updatePreferences(userId: string, updates: Partial<UserPreferences>): Promise<UserPreferences>;
  // Sessions & Security
  getSessions(userId: string): Promise<UserSession[]>;
  signOutAllOtherSessions(userId: string): Promise<void>;
  // Privacy & Data
  exportUserData(userId: string): Promise<AccountData>;
  deleteUserAccount(userId: string): Promise<void>;
}
