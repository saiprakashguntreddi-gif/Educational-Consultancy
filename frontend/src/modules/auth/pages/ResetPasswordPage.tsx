import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Check } from 'lucide-react';
import { apiClient } from '../../../shared/services/api-client';
import { API_ENDPOINTS } from '../../../config/api.config';

interface ResetPasswordPageProps {
  token?: string;
  onNavigateToLogin: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({
  token: initialToken,
  onNavigateToLogin,
}) => {
  // If token was passed via URL query params (?token=xyz) or props
  const [token, setToken] = useState(() => {
    if (initialToken) return initialToken;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token') || '';
  });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validation rules
  const hasLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const isFormValid = hasLength && hasUpper && hasLower && hasNumber && passwordsMatch && !!token;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Password reset token is missing. Please click the link in your email.');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match. Please re-check.');
      return;
    }

    if (!hasLength || !hasUpper || !hasLower || !hasNumber) {
      setError('Password does not meet all security requirements.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.post<{ message: string }>(
        API_ENDPOINTS.AUTH.RESET_PASSWORD,
        {
          token,
          newPassword,
        }
      );

      if (response.success) {
        setIsSuccess(true);
      } else {
        setError(typeof response.error === 'string' ? response.error : 'Failed to reset password. The link may have expired.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The link may have expired or is invalid.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '460px', margin: '4rem auto', padding: '0 1rem' }}>
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'var(--primary-light)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              marginBottom: '1rem',
            }}
          >
            <Lock size={24} />
          </div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>Set New Password</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Choose a strong, secure password for your account.
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'var(--status-rejected-bg)',
              border: '1px solid var(--status-rejected-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.8rem 1rem',
              color: 'var(--status-rejected-text)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {isSuccess ? (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                color: '#10b981',
                marginBottom: '1.75rem',
              }}
            >
              <CheckCircle size={44} style={{ margin: '0 auto 0.75rem', display: 'block', color: '#10b981' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#059669', marginBottom: '0.5rem' }}>
                Password Reset Complete!
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                Your password has been successfully updated. You can now sign in with your new credentials.
              </p>
            </div>

            <button
              type="button"
              onClick={onNavigateToLogin}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem' }}
            >
              Sign In to Your Account
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {!token && (
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Reset Token <span className="required">*</span></label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Paste token from reset email"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                New Password <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Confirm New Password <span className="required">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {/* Password security requirement indicators */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                fontSize: '0.8rem',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                Password Requirements:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
                <span style={{ color: hasLength ? '#10b981' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Check size={14} style={{ opacity: hasLength ? 1 : 0.4 }} /> At least 8 characters
                </span>
                <span style={{ color: hasUpper ? '#10b981' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Check size={14} style={{ opacity: hasUpper ? 1 : 0.4 }} /> One uppercase letter
                </span>
                <span style={{ color: hasLower ? '#10b981' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Check size={14} style={{ opacity: hasLower ? 1 : 0.4 }} /> One lowercase letter
                </span>
                <span style={{ color: hasNumber ? '#10b981' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Check size={14} style={{ opacity: hasNumber ? 1 : 0.4 }} /> One number (0-9)
                </span>
              </div>
              {confirmPassword.length > 0 && (
                <div style={{ marginTop: '0.4rem', color: passwordsMatch ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Check size={14} /> {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem' }}
              disabled={isSubmitting || !isFormValid}
            >
              {isSubmitting ? 'Updating Password...' : 'Reset Password'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
              <button
                type="button"
                onClick={onNavigateToLogin}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
              >
                Cancel and return to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
