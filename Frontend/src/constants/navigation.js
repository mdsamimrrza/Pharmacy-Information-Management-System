import { ROLES } from './roles';

export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard', roles: [ROLES.DOCTOR] },
  { to: '/pharmacist', label: 'Dashboard', icon: 'dashboard', roles: [ROLES.PHARMACIST] },
  { to: '/admin', label: 'Dashboard', icon: 'dashboard', roles: [ROLES.ADMIN] },
  { to: '/atc', label: 'ATC Classification', icon: 'atc', roles: [ROLES.DOCTOR, ROLES.ADMIN] },
  { to: '/prescription/new', label: 'New Prescription', icon: 'plusCircle', roles: [ROLES.DOCTOR] },
  { to: '/prescriptions', label: 'Prescriptions', icon: 'prescription', roles: [ROLES.DOCTOR, ROLES.PHARMACIST] },
  { to: '/inventory', label: 'Inventory', icon: 'inventory', roles: [ROLES.PHARMACIST] },
  { to: '/alerts', label: 'Alerts', icon: 'alert', roles: [ROLES.PHARMACIST] },
  { to: '/reports', label: 'Reports', icon: 'reports', roles: [ROLES.ADMIN] },
  { to: '/inventory/audit', label: 'Inventory Audit', icon: 'inventory', roles: [ROLES.ADMIN] },
  { to: '/admin/users', label: 'User Management', icon: 'users', roles: [ROLES.ADMIN] }
];

export const PAGE_TITLES = {
  '/dashboard': 'Doctor Dashboard',
  '/pharmacist': 'Pharmacist Dashboard',
  '/admin': 'Admin Dashboard',
  '/atc': 'ATC Drug Classification',
  '/prescription/new': 'New Prescription',
  '/prescriptions': 'Prescription Management',
  '/inventory': 'Inventory Management',
  '/alerts': 'System Alerts',
  '/reports': 'Reports & Analytics',
  '/inventory/audit': 'Inventory Audit',
  '/admin/users': 'User Management',
  '/patient': 'Patient Portal',
  '/patient/change-password': 'Change Password',
  '/change-password': 'Change Password'
};

export function getNavigationForRole(role) {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

export function getPageTitle(pathname) {
  const directMatch = PAGE_TITLES[pathname];
  if (directMatch) {
    return directMatch;
  }

  const partialMatch = Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key));
  return partialMatch?.[1] || 'PIMS';
}
