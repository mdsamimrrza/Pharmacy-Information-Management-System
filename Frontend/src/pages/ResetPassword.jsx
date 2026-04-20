import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import AppIcon from '../components/AppIcon';
import { getApiMessage, resetPassword } from '../api/pimsApi';
import useToast from '../hooks/useToast';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { notifyError, notifySuccess } = useToast();
  const initialEmail = useMemo(() => searchParams.get('email') || '', [searchParams]);
  const initialToken = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      notifyError('Validation error', 'Confirm password must match new password.');
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword({
        email,
        token,
        newPassword,
        confirmPassword
      });

      notifySuccess('Password reset', 'Your password has been reset. You can log in now.');
      navigate('/login');
    } catch (error) {
      notifyError('Reset failed', getApiMessage(error, 'Failed to reset password'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <section className="login-card">
        <div className="login-brand">
          <span className="brand-mark">
            <AppIcon name="shield" size={24} />
          </span>
          <div>
            <h1>Reset Password</h1>
            <p className="helper-text">
              Paste the reset token and set a new password.
            </p>
          </div>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field-label">
            <span>Email</span>
            <input onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
          </label>

          <label className="field-label">
            <span>Reset Token</span>
            <input onChange={(event) => setToken(event.target.value)} required value={token} />
          </label>

          <label className="field-label">
            <span>New Password</span>
            <input onChange={(event) => setNewPassword(event.target.value)} required type="password" value={newPassword} />
          </label>

          <label className="field-label">
            <span>Confirm Password</span>
            <input
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              type="password"
              value={confirmPassword}
            />
          </label>

          <button className="button-primary login-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>

          <div className="helper-text" style={{ textAlign: 'center' }}>
            <Link className="button-ghost" to="/login">Back to login</Link>
          </div>
        </form>
      </section>
    </AuthLayout>
  );
}