import Login from './Login';
import { ROLES } from '../constants/roles';

export default function PharmacistLoginPage() {
  return (
    <Login
      forcedRole={ROLES.PHARMACIST}
      pageTitle="Pharmacist Sign In"
      pageSubtitle="Dispensing, inventory, and medication control access."
      showRolePicker={false}
    />
  );
}
