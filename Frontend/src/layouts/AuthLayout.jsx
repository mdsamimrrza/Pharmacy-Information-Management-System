import { Link } from 'react-router-dom';
import AppIcon from '../components/AppIcon';

export default function AuthLayout({ children }) {
  return (
    <div className="auth-shell">
      <div className="auth-topbar">
        <span className="helper-text">PIMS secure access</span>
        <Link className="button-ghost" to="/forgot-password">
          <AppIcon name="info" size={16} />
          Password Help
        </Link>
      </div>
      <main className="login-page">{children}</main>
      <footer className="auth-footer">
        <span>(c) 2026 PIMS Medical Informatics Inc. | System status: Operational</span>
        <div className="auth-footer-links">
          <span>Privacy Policy</span>
          <span>Security Audit</span>
          <span>Language: EN (US)</span>
        </div>
      </footer>
    </div>
  );
}
