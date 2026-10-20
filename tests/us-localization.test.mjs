import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Helper functions reimplemented or directly imported for standalone execution
function money(cents) {
  if (isNaN(cents)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function validateUSZip(zip) {
  if (!zip) return false;
  const cleaned = zip.trim();
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(cleaned);
}

const US_STATE_CODES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC', 'PR', 'VI', 'GU'
]);

function validateUSState(stateCode) {
  if (!stateCode) return false;
  return US_STATE_CODES.has(stateCode.trim().toUpperCase());
}

function validateUSAddress(input) {
  const errors = {};
  if (!input.fullName || input.fullName.trim().length < 2) errors.fullName = 'Required';
  if (!input.addressLine1 || input.addressLine1.trim().length < 3) errors.addressLine1 = 'Required';
  if (!input.city || input.city.trim().length < 2) errors.city = 'Required';
  if (!input.state || !validateUSState(input.state)) errors.state = 'Invalid state';
  if (!input.zip || !validateUSZip(input.zip)) errors.zip = 'Invalid zip';
  return { isValid: Object.keys(errors).length === 0, errors };
}

describe('Job 0: US Localization Tests', () => {
  describe('money() helper', () => {
    test('formats integer cents into US currency format', () => {
      assert.equal(money(1800), '$18.00');
      assert.equal(money(2800), '$28.00');
      assert.equal(money(999), '$9.99');
      assert.equal(money(0), '$0.00');
      assert.equal(money(400), '$4.00');
      assert.equal(money(3500), '$35.00');
    });

    test('handles edge cases and NaN gracefully', () => {
      assert.equal(money(NaN), '$0.00');
    });
  });

  describe('US ZIP Code Validation', () => {
    test('accepts valid 5-digit ZIP codes', () => {
      assert.equal(validateUSZip('97201'), true);
      assert.equal(validateUSZip('10001'), true);
      assert.equal(validateUSZip('90210'), true);
      assert.equal(validateUSZip(' 97201 '), true);
    });

    test('accepts valid ZIP+4 formats', () => {
      assert.equal(validateUSZip('97201-1234'), true);
      assert.equal(validateUSZip('10001-0001'), true);
    });

    test('rejects invalid ZIP codes', () => {
      assert.equal(validateUSZip('9720'), false); // Too short
      assert.equal(validateUSZip('972011'), false); // Too long
      assert.equal(validateUSZip('ABCDE'), false); // Non-numeric
      assert.equal(validateUSZip('97201-12'), false); // Incomplete +4
      assert.equal(validateUSZip(''), false);
      assert.equal(validateUSZip(null), false);
    });
  });

  describe('US State Validation', () => {
    test('accepts valid 50 state codes, DC, and territories', () => {
      assert.equal(validateUSState('OR'), true);
      assert.equal(validateUSState('CA'), true);
      assert.equal(validateUSState('NY'), true);
      assert.equal(validateUSState('TX'), true);
      assert.equal(validateUSState('DC'), true);
      assert.equal(validateUSState('PR'), true);
      assert.equal(validateUSState('or'), true); // Case-insensitive
    });

    test('rejects invalid state codes', () => {
      assert.equal(validateUSState('XX'), false);
      assert.equal(validateUSState('ZZ'), false);
      assert.equal(validateUSState(''), false);
      assert.equal(validateUSState(null), false);
    });
  });

  describe('US Address Validation', () => {
    test('accepts complete, valid US address', () => {
      const result = validateUSAddress({
        fullName: 'Eleanor Vance',
        addressLine1: '14 Elmwood Terrace, Apt 2B',
        city: 'Portland',
        state: 'OR',
        zip: '97201',
      });
      assert.equal(result.isValid, true);
      assert.equal(Object.keys(result.errors).length, 0);
    });

    test('rejects incomplete address with specific field errors', () => {
      const result = validateUSAddress({
        fullName: 'E',
        addressLine1: '',
        city: '',
        state: 'ZZ',
        zip: '123',
      });
      assert.equal(result.isValid, false);
      assert.ok(result.errors.fullName);
      assert.ok(result.errors.addressLine1);
      assert.ok(result.errors.city);
      assert.ok(result.errors.state);
      assert.ok(result.errors.zip);
    });
  });
});
