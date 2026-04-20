import { useState } from 'react';
import AppIcon from '../components/AppIcon';
import { changePassword, getApiMessage } from '../api/pimsApi';
import useToast from '../hooks/useToast';

export default function ChangePassword() {
  const { notifyError, notifySuccess } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
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
      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      notifySuccess('Password changed', 'Your account password was updated successfully.');
    } catch (error) {
      notifyError('Change failed', getApiMessage(error, 'Failed to change password'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page">
      <section className="panel" style={{ maxWidth: '640px' }}>
        <div className="section-title">
          <AppIcon name="shield" size={20} />
          <h3>Change Password</h3>
        </div>
        <p className="helper-text">Use a strong password and never share it with others.</p>

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field-label">
            <span>Current Password</span>
            <input
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
              type="password"
              value={currentPassword}
            />
          </label>

          <label className="field-label">
            <span>New Password</span>
            <input
              onChange={(event) => setNewPassword(event.target.value)}
              required
              type="password"
              value={newPassword}
            />
          </label>

          <label className="field-label">
            <span>Confirm New Password</span>
            <input
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              type="password"
              value={confirmPassword}
            />
          </label>

          <div className="toolbar">
            <span className="helper-text">Minimum policy is validated by backend rules.</span>
            <button className="button-primary" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </section>
    </section>
  );
}