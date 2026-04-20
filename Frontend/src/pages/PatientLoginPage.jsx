import Login from './Login';
import { ROLES } from '../constants/roles';

export default function PatientLoginPage() {
  return (
    <Login
      forcedRole={ROLES.PATIENT}
      pageTitle="Patient Sign In"
      pageSubtitle="Read-only access to your own prescriptions and summary information."
      showRolePicker={false}
    />
  );
}
