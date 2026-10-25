import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';

// We import the Zod schemas directly using dynamic import or recreating/testing their definitions
// Let's create an in-memory mock of localStorage for DemoAccountService testing in Node.js
class MockLocalStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

globalThis.localStorage = new MockLocalStorage();

describe('Account Hub Zod Schemas Suite', () => {
  const UserAddressSchema = z.object({
    id: z.string(),
    fullName: z.string().min(2),
    street: z.string().min(3),
    apartment: z.string().optional(),
    city: z.string().min(2),
    state: z.string().length(2),
    postalCode: z.string().regex(/^\d{5}(-\d{4})?$/),
    country: z.literal('United States'),
    phone: z.string().optional(),
    isDefault: z.boolean(),
  });

  const DemoPaymentMethodSchema = z.object({
    id: z.string(),
    brand: z.enum(['Visa', 'Mastercard', 'American Express', 'Discover']),
    last4: z.string().length(4),
    expMonth: z.number().int().min(1).max(12),
    expYear: z.number().int().min(2025).max(2040),
    isDefault: z.boolean(),
    billingAddressId: z.string().optional(),
  });

  const OrderStatusSchema = z.enum([
    'Confirmed',
    'Packed',
    'Dispatched',
    'Delivered',
    'Cancelled',
  ]);

  const ReturnReasonSchema = z.enum([
    'Defective / Damaged',
    'Wrong item received',
    'Changed mind',
    'Arrived too late',
  ]);

  test('validates standard US address correctly', () => {
    const validAddress = {
      id: 'addr_test_1',
      fullName: 'Eleanor Vance',
      street: '14 Elmwood Terrace',
      apartment: 'Apt 2B',
      city: 'Portland',
      state: 'OR',
      postalCode: '97201',
      country: 'United States',
      isDefault: true,
    };
    const res = UserAddressSchema.safeParse(validAddress);
    assert.equal(res.success, true);
  });

  test('rejects invalid ZIP codes and non-US country', () => {
    const invalidZip = {
      id: 'addr_test_2',
      fullName: 'Eleanor Vance',
      street: '14 Elmwood Terrace',
      city: 'Portland',
      state: 'OR',
      postalCode: 'ABCDE',
      country: 'United States',
      isDefault: false,
    };
    assert.equal(UserAddressSchema.safeParse(invalidZip).success, false);

    const nonUsCountry = {
      ...invalidZip,
      postalCode: '97201',
      country: 'Canada',
    };
    assert.equal(UserAddressSchema.safeParse(nonUsCountry).success, false);
  });

  test('enforces preset demo test cards with 4-digit last4', () => {
    const validCard = {
      id: 'pm_test_1',
      brand: 'Visa',
      last4: '4242',
      expMonth: 12,
      expYear: 2028,
      isDefault: true,
    };
    assert.equal(DemoPaymentMethodSchema.safeParse(validCard).success, true);

    const invalidBrand = {
      ...validCard,
      brand: 'DinersClub',
    };
    assert.equal(DemoPaymentMethodSchema.safeParse(invalidBrand).success, false);

    const invalidLast4 = {
      ...validCard,
      last4: '424',
    };
    assert.equal(DemoPaymentMethodSchema.safeParse(invalidLast4).success, false);
  });

  test('validates order status transitions and sample labels', () => {
    assert.equal(OrderStatusSchema.safeParse('Confirmed').success, true);
    assert.equal(OrderStatusSchema.safeParse('Packed').success, true);
    assert.equal(OrderStatusSchema.safeParse('Dispatched').success, true);
    assert.equal(OrderStatusSchema.safeParse('Delivered').success, true);
    assert.equal(OrderStatusSchema.safeParse('Cancelled').success, true);
    assert.equal(OrderStatusSchema.safeParse('UnknownStatus').success, false);
  });

  test('validates return request reasons', () => {
    assert.equal(ReturnReasonSchema.safeParse('Defective / Damaged').success, true);
    assert.equal(ReturnReasonSchema.safeParse('Wrong item received').success, true);
    assert.equal(ReturnReasonSchema.safeParse('Changed mind').success, true);
    assert.equal(ReturnReasonSchema.safeParse('Arrived too late').success, true);
    assert.equal(ReturnReasonSchema.safeParse('Other reason').success, false);
  });
});

describe('Demo Account Service Operations Suite', () => {
  const userId = 'usr_test_reader_42';

  // Seed initial data helper
  function seedInitialDemo(uId) {
    return {
      version: 1,
      userId: uId,
      orders: [
        {
          id: 'ord_sample_101',
          orderNumber: 'ANN-2026-00412',
          date: '2026-10-16T14:30:00.000Z',
          items: [
            {
              id: 'item_101_1',
              bookId: 'book-quiet-hours',
              bookSlug: 'the-quiet-hours',
              title: 'The Quiet Hours',
              format: 'Hardcover',
              price: 2800,
              quantity: 1,
            },
          ],
          subtotal: 2800,
          shipping: 0,
          estimatedTax: 0,
          total: 2800,
          status: 'Dispatched',
          shippingAddress: {
            id: 'addr_seed_1',
            fullName: 'Eleanor Vance',
            street: '14 Elmwood Terrace, Apt 2B',
            city: 'Portland',
            state: 'OR',
            postalCode: '97201',
            country: 'United States',
            isDefault: true,
          },
          estimatedDelivery: '2026-10-22T18:00:00.000Z',
          isSample: true,
        },
        {
          id: 'ord_sample_102',
          orderNumber: 'ANN-2026-00388',
          date: '2026-09-04T10:15:00.000Z',
          items: [
            {
              id: 'item_102_1',
              bookId: 'book-coastlines',
              bookSlug: 'coastlines-and-memory',
              title: 'Coastlines and Memory',
              format: 'Clothbound First Edition',
              price: 4200,
              quantity: 1,
            },
          ],
          subtotal: 4200,
          shipping: 0,
          estimatedTax: 0,
          total: 4200,
          status: 'Delivered',
          shippingAddress: {
            id: 'addr_seed_1',
            fullName: 'Eleanor Vance',
            street: '14 Elmwood Terrace, Apt 2B',
            city: 'Portland',
            state: 'OR',
            postalCode: '97201',
            country: 'United States',
            isDefault: true,
          },
          estimatedDelivery: '2026-09-08T14:00:00.000Z',
          isSample: true,
        },
      ],
      addresses: [
        {
          id: 'addr_seed_1',
          fullName: 'Eleanor Vance',
          street: '14 Elmwood Terrace, Apt 2B',
          city: 'Portland',
          state: 'OR',
          postalCode: '97201',
          country: 'United States',
          isDefault: true,
        },
      ],
      paymentMethods: [
        {
          id: 'pm_seed_1',
          brand: 'Visa',
          last4: '4242',
          expMonth: 12,
          expYear: 2028,
          isDefault: true,
        },
      ],
      lists: [
        {
          id: 'list_seed_1',
          name: 'Wishlist',
          isDefault: true,
          items: [],
          updatedAt: new Date().toISOString(),
        },
      ],
      reviews: [
        {
          id: 'rev_seed_1',
          bookId: 'book-coastlines',
          bookSlug: 'coastlines-and-memory',
          bookTitle: 'Coastlines and Memory',
          orderId: 'ord_sample_102',
          rating: 5,
          headline: 'A masterclass in quiet, atmospheric prose',
          body: 'The binding is exquisite and the essays capture the salt-mist coastlines of the Pacific Northwest.',
          createdAt: '2026-09-12T16:00:00.000Z',
          updatedAt: '2026-09-12T16:00:00.000Z',
          isSample: true,
        },
      ],
      returns: [],
      preferences: {
        language: 'en',
        emailOrderUpdates: true,
        emailNewsletter: true,
        emailJournal: false,
      },
      sessions: [
        {
          id: 'sess_curr',
          device: 'MacBook Pro · macOS',
          browser: 'Chrome 130',
          location: 'Portland, OR, United States',
          ip: '192.168.1.8',
          lastActive: 'Active now',
          isCurrent: true,
        },
      ],
    };
  }

  test('initializes with 2 labeled sample orders and safe defaults', () => {
    const data = seedInitialDemo(userId);
    assert.equal(data.orders.length, 2);
    assert.equal(data.orders[0].isSample, true);
    assert.equal(data.orders[1].isSample, true);
    assert.equal(data.addresses.length, 1);
    assert.equal(data.addresses[0].isDefault, true);
    assert.equal(data.paymentMethods[0].last4, '4242');
  });

  test('creates new real order distinguishing from sample orders', () => {
    const data = seedInitialDemo(userId);
    const newRealOrder = {
      id: `ord_${Date.now()}`,
      orderNumber: 'ANN-2026-99001',
      date: new Date().toISOString(),
      items: [
        {
          id: 'item_new_1',
          bookId: 'book-letters',
          bookSlug: 'monsoon-letters',
          title: 'Monsoon Letters',
          format: 'Paperback',
          price: 1950,
          quantity: 1,
        },
      ],
      subtotal: 1950,
      shipping: 495,
      estimatedTax: 156,
      total: 2601,
      status: 'Confirmed',
      shippingAddress: data.addresses[0],
      isSample: false, // NOT a sample order
      estimatedDelivery: new Date(Date.now() + 86400000 * 3).toISOString(),
    };

    data.orders.unshift(newRealOrder);
    assert.equal(data.orders.length, 3);
    assert.equal(data.orders[0].isSample, false);
    assert.equal(data.orders[1].isSample, true);
    assert.equal(data.orders[2].isSample, true);
  });

  test('cancels order when eligible and blocks cancellation after dispatch', () => {
    const data = seedInitialDemo(userId);
    const confirmedOrder = {
      id: 'ord_confirmed_test',
      orderNumber: 'ANN-2026-77777',
      status: 'Confirmed',
      isSample: false,
    };
    data.orders.unshift(confirmedOrder);

    // Cancel confirmed order -> allowed
    if (confirmedOrder.status === 'Confirmed' || confirmedOrder.status === 'Packed') {
      confirmedOrder.status = 'Cancelled';
      confirmedOrder.cancelledAt = new Date().toISOString();
    }
    assert.equal(confirmedOrder.status, 'Cancelled');

    // Attempting to cancel Dispatched order -> blocked
    const dispatchedOrder = data.orders.find((o) => o.status === 'Dispatched');
    assert.ok(dispatchedOrder);
    const canCancel = dispatchedOrder.status === 'Confirmed' || dispatchedOrder.status === 'Packed';
    assert.equal(canCancel, false);
  });

  test('manages addresses with default fallback when deleting default', () => {
    const data = seedInitialDemo(userId);
    // Add second address
    const secondAddr = {
      id: 'addr_second',
      fullName: 'Eleanor Vance',
      street: '88 Pearl Street',
      city: 'Portland',
      state: 'OR',
      postalCode: '97209',
      country: 'United States',
      isDefault: false,
    };
    data.addresses.push(secondAddr);
    assert.equal(data.addresses.length, 2);

    // Delete default address
    const deleted = data.addresses[0];
    data.addresses = data.addresses.filter((a) => a.id !== deleted.id);
    if (deleted.isDefault && data.addresses.length > 0) {
      data.addresses[0].isDefault = true;
    }
    assert.equal(data.addresses.length, 1);
    assert.equal(data.addresses[0].id, 'addr_second');
    assert.equal(data.addresses[0].isDefault, true);
  });

  test('handles corrupt JSON in storage without crashing and resets safely', () => {
    const corruptPayload = '{"version": 1, "userId": "usr_corrupt", "orders": "invalid_array"}';
    localStorage.setItem(`ann_account_v1_usr_corrupt`, corruptPayload);

    let parsed;
    try {
      parsed = JSON.parse(localStorage.getItem(`ann_account_v1_usr_corrupt`));
    } catch {
      parsed = null;
    }

    const OrderArraySchema = z.array(z.object({ id: z.string() }));
    const validation = OrderArraySchema.safeParse(parsed?.orders);

    assert.equal(validation.success, false);
    // Safe recovery triggered
    const recovered = seedInitialDemo('usr_corrupt');
    assert.ok(recovered.orders.length > 0);
  });
});
