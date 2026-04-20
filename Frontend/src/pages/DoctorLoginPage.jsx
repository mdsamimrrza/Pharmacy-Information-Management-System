import Login from './Login';
import { ROLES } from '../constants/roles';

export default function DoctorLoginPage() {
  return (
    <Login
      forcedRole={ROLES.DOCTOR}
      pageTitle="Doctor Sign In"
      pageSubtitle="Clinical access for prescriptions and review workflows."
      showRolePicker={false}
    />
  );
}
