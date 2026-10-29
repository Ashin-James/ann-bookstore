import test from 'node:test';
import assert from 'node:assert/strict';
import { hasPermission, requireRole } from '../src/config/permissions.ts';
import { recordFailedAttempt, checkLockout } from '../lib/admin/auth.ts';

test.describe('Admin Security & RBAC Suite', () => {
  test('editor cannot alter book pricing, variants, or inventory stock', () => {
    // Editor has read access to books for content editing
    assert.equal(hasPermission('editor', 'books', 'read'), true);

    // Editor is strictly forbidden from mutating variants (pricing) and inventory (stock)
    assert.equal(hasPermission('editor', 'variants', 'update'), false);
    assert.equal(hasPermission('editor', 'variants', 'create'), false);
    assert.equal(hasPermission('editor', 'variants', 'delete'), false);
    assert.equal(hasPermission('editor', 'inventory', 'update'), false);
    assert.equal(hasPermission('editor', 'inventory', 'create'), false);

    // requireRole throws an explicit Unauthorized error for editor on price/stock updates
    assert.throws(
      () => requireRole('editor', 'variants', 'update'),
      /Unauthorized: Role 'editor' lacks 'update' permission on 'variants'/
    );
    assert.throws(
      () => requireRole('editor', 'inventory', 'update'),
      /Unauthorized: Role 'editor' lacks 'update' permission on 'inventory'/
    );
  });

  test('owner and admin have full privileges to alter pricing and inventory', () => {
    assert.equal(hasPermission('owner', 'variants', 'update'), true);
    assert.equal(hasPermission('owner', 'inventory', 'update'), true);
    assert.equal(hasPermission('admin', 'variants', 'update'), true);
    assert.equal(hasPermission('admin', 'inventory', 'update'), true);
  });

  test('support role cannot edit prices, delete orders, or export subscribers', () => {
    assert.equal(hasPermission('support', 'variants', 'update'), false);
    assert.equal(hasPermission('support', 'variants', 'create'), false);
    assert.equal(hasPermission('support', 'variants', 'delete'), false);
    assert.equal(hasPermission('support', 'subscribers', 'read'), false);
    assert.equal(hasPermission('support', 'subscribers', 'export'), false);

    assert.throws(
      () => requireRole('support', 'variants', 'update'),
      /Unauthorized: Role 'support' lacks 'update' permission on 'variants'/
    );
  });

  test('customer and anonymous users have zero admin permissions', () => {
    assert.equal(hasPermission(null, 'books', 'read'), false);
    assert.equal(hasPermission(undefined, 'orders', 'read'), false);
    assert.throws(
      () => requireRole(null, 'books', 'read'),
      /Unauthorized: Role 'anonymous' lacks 'read' permission on 'books'/
    );
  });

  test('admin account locks out after 5 consecutive failed login attempts', () => {
    const testIdentifier = `lockout_test_${Date.now()}@example.com`;

    // Initially not locked
    assert.equal(checkLockout(testIdentifier).locked, false);

    // 4 failed attempts should not trigger lockout
    for (let i = 1; i <= 4; i++) {
      const result = recordFailedAttempt(testIdentifier);
      assert.equal(result.locked, false);
      assert.equal(result.attemptsLeft, 5 - i);
    }

    // 5th failed attempt triggers lockout
    const finalResult = recordFailedAttempt(testIdentifier);
    assert.equal(finalResult.locked, true);
    assert.equal(finalResult.attemptsLeft, 0);

    // checkLockout reports locked with remaining duration
    const status = checkLockout(testIdentifier);
    assert.equal(status.locked, true);
    assert.ok(status.remainingMinutes !== undefined && status.remainingMinutes > 0);
  });
});
