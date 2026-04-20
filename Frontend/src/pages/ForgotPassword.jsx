import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import AppIcon from '../components/AppIcon';
import { forgotPassword, getApiMessage } from '../api/pimsApi';
import useToast from '../hooks/useToast';

export default function ForgotPassword() {
  const { notifyError, notifySuccess } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      await forgotPassword({ email });
      const successMessage = 'If the account exists, a reset email has been sent. Check your inbox or file outbox.';
      setMessage(successMessage);
      notifySuccess('Reset requested', successMessage);
    } catch (error) {
      const errorMessage = getApiMessage(error, 'Failed to request password reset');
      notifyError('Reset request failed', errorMessage);
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
            <h1>Forgot Password</h1>
            <p className="helper-text">
              Enter your account email to receive a reset token.
            </p>
          </div>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field-label">
            <span>Account Email</span>
            <div className="search-field">
              <AppIcon name="users" size={18} />
              <input
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </div>
          </label>

          {message ? (
            <div className="notice-banner">
              <div>
                <strong>Request submitted</strong>
                <div className="helper-text">{message}</div>
              </div>
            </div>
          ) : null}

          <button className="button-primary login-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Requesting...' : 'Send Reset Token'}
          </button>

          <div className="helper-text" style={{ textAlign: 'center' }}>
            <Link className="button-ghost" to="/login">Back to login</Link>
          </div>
        </form>
      </section>
    </AuthLayout>
  );
}