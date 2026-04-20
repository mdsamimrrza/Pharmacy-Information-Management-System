import AppIcon from './AppIcon';
import { ROLE_LABELS, ROLES } from '../constants/roles';

const roleMeta = {
  [ROLES.DOCTOR]: {
    subtitle: 'Prescribe & View',
    icon: 'doctor'
  },
  [ROLES.PHARMACIST]: {
    subtitle: 'Inventory & Dispense',
    icon: 'pharmacist'
  },
  [ROLES.ADMIN]: {
    subtitle: 'Users & Settings',
    icon: 'admin'
  },
  [ROLES.PATIENT]: {
    subtitle: 'My Prescriptions',
    icon: 'users'
  }
};

const roleOrder = [ROLES.DOCTOR, ROLES.PHARMACIST, ROLES.ADMIN, ROLES.PATIENT];

export default function RolePicker({ value, onChange }) {
  return (
    <div className="role-picker">
      {roleOrder.map((role) => (
        <button
          key={role}
          className={`role-option ${value === role ? 'active' : ''}`.trim()}
          onClick={() => onChange(role)}
          type="button"
        >
          <span style={{ justifySelf: 'center', color: 'var(--accent-strong)' }}>
            <AppIcon name={roleMeta[role].icon} size={24} />
          </span>
          <strong>{ROLE_LABELS[role]}</strong>
          <span className="helper-text" style={{ fontSize: '0.82rem' }}>
            {roleMeta[role].subtitle}
          </span>
        </button>
      ))}
    </div>
  );
}
