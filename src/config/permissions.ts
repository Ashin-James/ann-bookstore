/**
 * Role-Based Access Control (RBAC) Permissions Configuration
 *
 * Roles:
 * - owner: Full system privileges, staff management, destructive actions, settings
 * - admin: Full commerce, content, and staff operations (cannot delete/demote last owner)
 * - editor: Content management only (journal, pages, media, translations, companion). Cannot view orders or alter pricing/stock.
 * - support: Customer service operations (orders read/status, returns, messages, customers read-only). Cannot edit prices or export subscribers.
 */

export type AdminRole = 'owner' | 'admin' | 'editor' | 'support';

export type AdminResource =
  | 'dashboard'
  | 'analytics'
  | 'staff'
  | 'audit'
  | 'orders'
  | 'returns'
  | 'books'
  | 'variants'
  | 'inventory'
  | 'coupons'
  | 'customers'
  | 'reviews'
  | 'messages'
  | 'subscribers'
  | 'campaigns'
  | 'events'
  | 'journal'
  | 'pages'
  | 'media'
  | 'collections'
  | 'settings'
  | 'companion'
  | 'translations';

export type AdminAction = 'read' | 'create' | 'update' | 'delete' | 'export';

export const ROLE_PERMISSIONS: Record<AdminRole, Record<AdminResource, AdminAction[]>> = {
  owner: {
    dashboard: ['read', 'export'],
    analytics: ['read', 'export'],
    staff: ['read', 'create', 'update', 'delete', 'export'],
    audit: ['read', 'export'],
    orders: ['read', 'create', 'update', 'delete', 'export'],
    returns: ['read', 'create', 'update', 'delete', 'export'],
    books: ['read', 'create', 'update', 'delete', 'export'],
    variants: ['read', 'create', 'update', 'delete', 'export'],
    inventory: ['read', 'create', 'update', 'delete', 'export'],
    coupons: ['read', 'create', 'update', 'delete', 'export'],
    customers: ['read', 'create', 'update', 'delete', 'export'],
    reviews: ['read', 'create', 'update', 'delete', 'export'],
    messages: ['read', 'create', 'update', 'delete', 'export'],
    subscribers: ['read', 'create', 'update', 'delete', 'export'],
    campaigns: ['read', 'create', 'update', 'delete', 'export'],
    events: ['read', 'create', 'update', 'delete', 'export'],
    journal: ['read', 'create', 'update', 'delete', 'export'],
    pages: ['read', 'create', 'update', 'delete', 'export'],
    media: ['read', 'create', 'update', 'delete', 'export'],
    collections: ['read', 'create', 'update', 'delete', 'export'],
    settings: ['read', 'create', 'update', 'delete', 'export'],
    companion: ['read', 'create', 'update', 'delete', 'export'],
    translations: ['read', 'create', 'update', 'delete', 'export'],
  },
  admin: {
    dashboard: ['read', 'export'],
    analytics: ['read', 'export'],
    staff: ['read', 'create', 'update', 'export'], // Cannot delete owner
    audit: ['read', 'export'],
    orders: ['read', 'create', 'update', 'delete', 'export'],
    returns: ['read', 'create', 'update', 'delete', 'export'],
    books: ['read', 'create', 'update', 'delete', 'export'],
    variants: ['read', 'create', 'update', 'delete', 'export'],
    inventory: ['read', 'create', 'update', 'delete', 'export'],
    coupons: ['read', 'create', 'update', 'delete', 'export'],
    customers: ['read', 'create', 'update', 'delete', 'export'],
    reviews: ['read', 'create', 'update', 'delete', 'export'],
    messages: ['read', 'create', 'update', 'delete', 'export'],
    subscribers: ['read', 'create', 'update', 'delete', 'export'],
    campaigns: ['read', 'create', 'update', 'delete', 'export'],
    events: ['read', 'create', 'update', 'delete', 'export'],
    journal: ['read', 'create', 'update', 'delete', 'export'],
    pages: ['read', 'create', 'update', 'delete', 'export'],
    media: ['read', 'create', 'update', 'delete', 'export'],
    collections: ['read', 'create', 'update', 'delete', 'export'],
    settings: ['read', 'update'],
    companion: ['read', 'create', 'update', 'delete', 'export'],
    translations: ['read', 'create', 'update', 'delete', 'export'],
  },
  editor: {
    dashboard: ['read'],
    analytics: [],
    staff: [],
    audit: [],
    orders: [], // Editor cannot view orders
    returns: [],
    books: ['read'], // Editor can view book catalogue but cannot alter price/stock
    variants: ['read'],
    inventory: [],
    coupons: [],
    customers: [],
    reviews: ['read', 'update'],
    messages: [],
    subscribers: [],
    campaigns: ['read', 'create', 'update'],
    events: ['read', 'create', 'update', 'delete'],
    journal: ['read', 'create', 'update', 'delete'],
    pages: ['read', 'create', 'update'],
    media: ['read', 'create', 'update', 'delete'],
    collections: ['read', 'create', 'update'],
    settings: ['read'],
    companion: ['read', 'update'],
    translations: ['read', 'update', 'export'],
  },
  support: {
    dashboard: ['read'],
    analytics: ['read'], // Read only
    staff: [],
    audit: [],
    orders: ['read', 'update'], // Support can update status/notes/tracking, but cannot delete or change prices
    returns: ['read', 'update'],
    books: ['read'], // Read-only catalogue
    variants: ['read'],
    inventory: ['read'],
    coupons: ['read'],
    customers: ['read'], // Read-only customer records
    reviews: ['read', 'update'],
    messages: ['read', 'create', 'update'],
    subscribers: [], // Support cannot access or export subscriber emails
    campaigns: ['read'],
    events: ['read'],
    journal: ['read'],
    pages: ['read'],
    media: ['read'],
    collections: ['read'],
    settings: ['read'],
    companion: ['read'],
    translations: ['read'],
  },
};

/**
 * Check if a role has permission for a specific resource and action
 */
export function hasPermission(
  role: AdminRole | null | undefined,
  resource: AdminResource,
  action: AdminAction
): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  const actions = permissions[resource];
  return actions ? actions.includes(action) : false;
}

/**
 * Security Guard Helper
 * Returns true if allowed, throws or returns false if unauthorized
 */
export function requireRole(
  userRole: AdminRole | null | undefined,
  resource: AdminResource,
  action: AdminAction
): boolean {
  const allowed = hasPermission(userRole, resource, action);
  if (!allowed) {
    throw new Error(`Unauthorized: Role '${userRole || 'anonymous'}' lacks '${action}' permission on '${resource}'`);
  }
  return true;
}
