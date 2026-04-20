import { Navigate } from 'react-router-dom';
import Login from './Login';
import { ROLES } from '../constants/roles';
import { hasAdminLoginAccess } from '../utils/adminAccess';

export default function AdminLoginPage() {
  if (!hasAdminLoginAccess()) {
    return <Navigate replace to="/admin/access" />;
  }

  return (
    <Login
      forcedRole={ROLES.ADMIN}
      pageTitle="Admin Sign In"
      pageSubtitle="Administrative access for users, settings, and reporting."
      showRolePicker={false}
    />
  );
}
