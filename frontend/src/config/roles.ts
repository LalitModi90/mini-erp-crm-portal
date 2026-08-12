export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';

export const ROLES: Role[] = ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'];

// Route-level access control. Matches the backend RBAC matrix.
export const ROUTE_ACCESS: Record<string, Role[]> = {
  '/dashboard': ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
  '/customers': ['ADMIN', 'SALES', 'ACCOUNTS'],
  '/customers/add': ['ADMIN', 'SALES'],
  '/products': ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
  '/inventory': ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
  '/challans': ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
  '/challans/create': ['ADMIN', 'SALES'],
  '/reports': ['ADMIN', 'SALES', 'ACCOUNTS'],
  '/users': ['ADMIN'],
  '/settings': ['ADMIN'],
};

// Sidebar menu visibility per role.
export const MENU_ACCESS: Record<string, Role[]> = {
  '/dashboard': ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
  '/customers': ['ADMIN', 'SALES', 'ACCOUNTS'],
  '/products': ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
  '/inventory': ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
  '/challans': ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'],
  '/reports': ['ADMIN', 'SALES', 'ACCOUNTS'],
  '/users': ['ADMIN'],
  '/settings': ['ADMIN'],
};

// Action-level permissions per module.
export const ACTION_ACCESS: Record<string, Record<string, Role[]>> = {
  customer: {
    create: ['ADMIN', 'SALES'],
    edit: ['ADMIN', 'SALES'],
    delete: ['ADMIN'],
  },
  product: {
    create: ['ADMIN'],
    edit: ['ADMIN'],
    delete: ['ADMIN'],
  },
  inventory: {
    adjust: ['ADMIN', 'WAREHOUSE'],
  },
  challan: {
    create: ['ADMIN', 'SALES'],
    confirm: ['ADMIN', 'SALES'],
    cancel: ['ADMIN', 'SALES'],
  },
  user: {
    create: ['ADMIN'],
    edit: ['ADMIN'],
    delete: ['ADMIN'],
  },
};

export const hasRole = (role: string | undefined, allowed: string[]): boolean =>
  Boolean(role && allowed.includes(role));

export const canAccessRoute = (path: string, role: string | undefined): boolean => {
  const allowed = ROUTE_ACCESS[path];
  if (!allowed) return true;
  return hasRole(role, allowed);
};

export const can = (module: string, action: string, role: string | undefined): boolean => {
  const allowed = ACTION_ACCESS[module]?.[action];
  if (!allowed) return true;
  return hasRole(role, allowed);
};
