import {
  AdminUser,
  BookRecord,
  CouponRecord,
  CustomerRecord,
  OrderRecord,
  ReviewRecord,
  SubscriberRecord,
  VariantRecord,
} from './types';
import { books } from '@/data/books';

export const DEMO_ADMIN_USER: AdminUser = {
  id: 'usr_owner_demo',
  email: 'demo@annsbookstore.com',
  fullName: 'Ann (Owner Demo)',
  role: 'owner',
  totpEnabled: false, // Optional in demo mode
  disabled: false,
  lastLoginAt: '2026-10-27T10:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
};

// Seed Book Records with Calculated Variant Costs
export function getSeedBooks(): BookRecord[] {
  return books.map((b) => {
    const variants: VariantRecord[] = b.formats.map((f) => {
      let costRatio = 0.3; // 30% for paperback
      const formatLower = f.name.toLowerCase();
      if (formatLower.includes('hardcover')) costRatio = 0.4; // 40% for hardcover
      if (formatLower.includes('ebook') || formatLower.includes('e-book')) costRatio = 0.05; // 5% for e-book

      const cost = Math.round(f.price * costRatio);
      return {
        id: `var_${b.id}_${f.id}`,
        bookId: b.id,
        format: f.name,
        price: f.price,
        compareAtPrice: Math.round(f.price * 1.15),
        cost,
        isDemoCost: true, // "Demo estimate: replace with real costs"
        sku: `ANN-${b.id.toUpperCase().slice(0, 4)}-${f.name.toUpperCase().slice(0, 2)}`,
        stock: formatLower.includes('ebook') ? 9999 : 45,
        lowStockThreshold: 10,
        weightGrams: formatLower.includes('hardcover') ? 680 : 380,
        signedEdition: false,
        personalization: false,
      };
    });

    return {
      id: b.id,
      slug: b.slug,
      title: b.title,
      author: 'Ann',
      category: b.category,
      description: b.description,
      shortDescription: b.shortDescription,
      cover: b.cover,
      status: 'published',
      variants,
      featured: b.featured ?? false,
      tags: ['fiction', 'literary', 'rain', 'memory'],
      moods: ['reflective', 'peaceful', 'rainy'],
    };
  });
}

// 600 Fake Customers Generator
const FIRST_NAMES = [
  'Eleanor', 'Marcus', 'Sophia', 'Julian', 'Claire', 'David', 'Audrey', 'Simon',
  'Elena', 'Lucas', 'Nora', 'Gabriel', 'Hannah', 'Oliver', 'Maya', 'Caleb',
  'Leah', 'Arthur', 'Chloe', 'Nathan', 'Grace', 'Daniel', 'Emma', 'Liam',
  'Isabella', 'Noah', 'Mia', 'James', 'Harper', 'Benjamin', 'Evelyn', 'Elijah'
];

const LAST_NAMES = [
  'Vance', 'Thorne', 'Holloway', 'Sinclair', 'Fairfax', 'Mercer', 'Wren', 'Sterling',
  'Ashford', 'Carrington', 'Blackwood', 'Montague', 'Ellsworth', 'Pemberton', 'Aldridge', 'Kingsley',
  'Hensley', 'Whitmore', 'Caldwell', 'Langston', 'Prescott', 'Bradford', 'Winslow', 'Somerset'
];

const US_CITIES: { city: string; state: string; zip: string }[] = [
  { city: 'Portland', state: 'OR', zip: '97201' },
  { city: 'Seattle', state: 'WA', zip: '98101' },
  { city: 'San Francisco', state: 'CA', zip: '94102' },
  { city: 'Boston', state: 'MA', zip: '02108' },
  { city: 'Denver', state: 'CO', zip: '80202' },
  { city: 'Austin', state: 'TX', zip: '78701' },
  { city: 'Chicago', state: 'IL', zip: '60601' },
  { city: 'New York', state: 'NY', zip: '10001' },
  { city: 'Minneapolis', state: 'MN', zip: '55401' },
  { city: 'Burlington', state: 'VT', zip: '05401' },
  { city: 'Asheville', state: 'NC', zip: '28801' },
  { city: 'Santa Fe', state: 'NM', zip: '87501' },
];

export function getSeedCustomers(): CustomerRecord[] {
  const customers: CustomerRecord[] = [];
  for (let i = 0; i < 600; i++) {
    const fn = FIRST_NAMES[i % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 7 + Math.floor(i / 13)) % LAST_NAMES.length];
    const id = `cust_demo_${String(i + 1).padStart(4, '0')}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${i > 0 ? (i % 20 === 0 ? i : '') : ''}@example.com`;

    customers.push({
      id,
      email,
      name: `${fn} ${ln}`,
      phone: `(555) ${String(100 + (i % 900)).padStart(3, '0')}-${String(1000 + (i % 9000)).padStart(4, '0')}`,
      notes: i % 15 === 0 ? 'Collector of signed editions. Prefers archival dust jackets.' : null,
      tags: i % 5 === 0 ? ['VIP', 'Reader Club'] : ['Storefront Customer'],
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date(Date.now() - (600 - i) * 24 * 3600 * 1000 * 1.2).toISOString(),
      isDemo: true,
    });
  }
  return customers;
}

// 5,000 Fake Orders across 24 Months
export function getSeedOrders(customers: CustomerRecord[], seedBooks: BookRecord[]): OrderRecord[] {
  const orders: OrderRecord[] = [];
  const now = new Date('2026-10-27T10:00:00.000Z').getTime();
  const twoYearsMs = 730 * 24 * 3600 * 1000;

  const STATUS_POOL: OrderRecord['status'][] = [
    'Delivered', 'Delivered', 'Delivered', 'Delivered', 'Delivered', 'Delivered', 'Delivered', // 70%
    'Shipped', 'Shipped', // 12%
    'Paid', // 8%
    'Pending', // 4%
    'Cancelled', // 3%
    'Refunded', // 3%
  ];

  // All flat variants list for easy selection
  const allVariants = seedBooks.flatMap((b) =>
    b.variants.map((v) => ({ ...v, bookSlug: b.slug, bookTitle: b.title, bookCover: b.cover }))
  );

  for (let i = 1; i <= 5000; i++) {
    const custIndex = (i * 17) % customers.length;
    const cust = customers[custIndex];
    const location = US_CITIES[i % US_CITIES.length];

    // Distribute timestamps across 24 months (older to newer)
    const orderTimeMs = now - twoYearsMs + Math.floor((i / 5000) * twoYearsMs) + ((i % 100) * 360000);
    const dateStr = new Date(Math.min(now - 1000, orderTimeMs)).toISOString();

    const status = STATUS_POOL[i % STATUS_POOL.length];

    // Pick 1-3 items
    const itemCount = (i % 7 === 0) ? 3 : (i % 3 === 0) ? 2 : 1;
    const items = [];
    let subtotal = 0;

    for (let k = 0; k < itemCount; k++) {
      const v = allVariants[(i + k * 3) % allVariants.length];
      const qty = (k === 0 && i % 11 === 0) ? 2 : 1;
      const price = v.price;
      const cost = v.cost;
      subtotal += price * qty;

      items.push({
        id: `ord_item_${i}_${k}`,
        bookId: v.bookId,
        bookSlug: v.bookSlug,
        title: v.bookTitle,
        format: v.format,
        price,
        cost,
        isDemoCost: true,
        quantity: qty,
        cover: v.bookCover,
      });
    }

    const shipping = subtotal >= 4000 ? 0 : 450;
    const tax = Math.round(subtotal * 0.05); // ~5% estimated US state tax
    const discount = (i % 9 === 0) ? Math.round(subtotal * 0.1) : 0;
    const total = subtotal + shipping + tax - discount;

    // Update customer stats
    if (status !== 'Cancelled') {
      cust.totalOrders += 1;
      cust.totalSpent += total;
    }

    orders.push({
      id: `ord_demo_${String(i).padStart(5, '0')}`,
      orderNumber: `ANN-202${(i < 2500 ? '5' : '6')}-${String(i).padStart(5, '0')}`,
      customerId: cust.id,
      customerName: cust.name,
      customerEmail: cust.email,
      date: dateStr,
      status,
      items,
      subtotal,
      shipping,
      tax,
      discount,
      total,
      shippingAddress: {
        fullName: cust.name,
        street: `${100 + (i % 800)} Elmwood St`,
        city: location.city,
        state: location.state,
        postalCode: location.zip,
        country: 'United States',
        phone: cust.phone || '(503) 555-0199',
      },
      trackingNumber: status === 'Delivered' || status === 'Shipped' ? `9400111899562${String(i).padStart(9, '0')}` : undefined,
      carrier: status === 'Delivered' || status === 'Shipped' ? 'USPS Priority Mail' : undefined,
      notes: i % 25 === 0 ? ['Customer requested handwritten inscription: "For quiet evenings by the rain."'] : [],
      isDemo: true,
    });
  }

  return orders;
}

export function getSeedCoupons(): CouponRecord[] {
  return [
    {
      id: 'coup_01',
      code: 'RAINYREADS10',
      type: 'percent',
      value: 10,
      minSpend: 2500,
      usageCount: 142,
      startsAt: '2026-01-01T00:00:00.000Z',
      active: true,
    },
    {
      id: 'coup_02',
      code: 'FREESHIP50',
      type: 'free_shipping',
      value: 0,
      minSpend: 5000,
      usageCount: 88,
      startsAt: '2026-01-01T00:00:00.000Z',
      active: true,
    },
    {
      id: 'coup_03',
      code: 'WELCOME5',
      type: 'fixed',
      value: 500, // $5.00 off
      minSpend: 2000,
      usageCount: 310,
      startsAt: '2026-01-01T00:00:00.000Z',
      active: true,
    },
  ];
}

export function getSeedReviews(): ReviewRecord[] {
  return [
    {
      id: 'rev_01',
      bookId: 'quiet-hours',
      bookTitle: 'The Quiet Hours',
      customerName: 'Eleanor Vance',
      customerEmail: 'eleanor.vance@example.com',
      rating: 5,
      comment: 'An exquisite novel. The depiction of monsoon rain and quiet longing stayed with me for weeks.',
      status: 'approved',
      reply: 'Thank you Eleanor, writing those chapters during the Portland rains meant the world to me. — Ann',
      createdAt: '2026-10-12T14:00:00.000Z',
    },
    {
      id: 'rev_02',
      bookId: 'monsoon-letters',
      bookTitle: 'Monsoon Letters',
      customerName: 'Marcus Thorne',
      customerEmail: 'marcus.thorne@example.com',
      rating: 5,
      comment: 'The epistolary form feels so intimate. The packaging was beautiful and arrived in perfect condition.',
      status: 'approved',
      createdAt: '2026-10-19T09:30:00.000Z',
    },
    {
      id: 'rev_03',
      bookId: 'room-for-rain',
      bookTitle: 'A Room for Rain',
      customerName: 'Julian Sinclair',
      customerEmail: 'julian.sinclair@example.com',
      rating: 4,
      comment: 'Wonderful atmosphere and character depth. Highly recommended.',
      status: 'pending',
      createdAt: '2026-10-25T16:15:00.000Z',
    },
  ];
}

export function getSeedSubscribers(): SubscriberRecord[] {
  return [
    { id: 'sub_01', email: 'eleanor.vance@example.com', source: 'storefront_footer', subscribedAt: '2026-02-14T11:00:00.000Z', status: 'active' },
    { id: 'sub_02', email: 'marcus.thorne@example.com', source: 'checkout_optin', subscribedAt: '2026-03-20T15:22:00.000Z', status: 'active' },
    { id: 'sub_03', email: 'audrey.wren@example.com', source: 'storefront_modal', subscribedAt: '2026-05-01T08:45:00.000Z', status: 'active' },
    { id: 'sub_04', email: 'julian.sinclair@example.com', source: 'journal_cta', subscribedAt: '2026-06-18T19:10:00.000Z', status: 'active' },
    { id: 'sub_05', email: 'claire.fairfax@example.com', source: 'storefront_footer', subscribedAt: '2026-07-22T13:05:00.000Z', status: 'active' },
  ];
}
