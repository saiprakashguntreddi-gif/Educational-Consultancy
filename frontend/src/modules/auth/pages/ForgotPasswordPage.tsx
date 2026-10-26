import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, KeyRound, ExternalLink } from 'lucide-react';
import { apiClient } from '../../../shared/services/api-client';
import { API_ENDPOINTS } from '../../../config/api.config';

interface ForgotPasswordPageProps {
  onNavigateToLogin: () => void;
  onNavigateToReset?: (token: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onNavigateToLogin,
  onNavigateToReset,
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewLink, setPreviewLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setPreviewLink(null);
    setIsSubmitting(true);

    try {
      const response = await apiClient.post<{ message: string; previewLink?: string }>(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        { email }
      );

      if (response.success) {
        setSuccessMessage(
          response.data?.message ||
            'A password reset link has been dispatched to your email address.'
        );
        if (response.data?.previewLink) {
          setPreviewLink(response.data.previewLink);
        }
      } else {
        setError(typeof response.error === 'string' ? response.error : 'Failed to dispatch password reset link.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while requesting password reset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const extractTokenFromLink = (link: string): string | null => {
    try {
      const url = new URL(link);
      return url.searchParams.get('token');
    } catch {
      return null;
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '4rem auto', padding: '0 1rem' }}>
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
            <KeyRound size={24} />
          </div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>Forgot Password</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Enter your registered email address and we will send you a link to reset your password.
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

        {successMessage ? (
          <div>
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                color: '#10b981',
                fontSize: '0.9rem',
                marginBottom: '1.5rem',
                textAlign: 'center',
              }}
            >
              <CheckCircle size={36} style={{ margin: '0 auto 0.75rem', display: 'block' }} />
              <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.4rem', color: '#059669' }}>
                Reset Link Sent!
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                {successMessage}
              </div>
            </div>

            {previewLink && (
              <div
                style={{
                  background: 'var(--surface-subtle, rgba(99, 102, 241, 0.05))',
                  border: '1px dashed #6366f1',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 600, marginBottom: '0.5rem' }}>
                  DEVELOPMENT RESET SHORTCUT
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Click below to open the password reset page directly:
                </p>
                {onNavigateToReset && extractTokenFromLink(previewLink) ? (
                  <button
                    onClick={() => onNavigateToReset(extractTokenFromLink(previewLink)!)}
                    className="btn btn-primary"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <span>Proceed to Reset Password</span>
                    <ExternalLink size={16} />
                  </button>
                ) : (
                  <a
                    href={previewLink}
                    className="btn btn-primary"
                    style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none' }}
                  >
                    <span>Open Reset Link</span>
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={onNavigateToLogin}
              className="btn btn-outline"
              style={{ width: '100%', padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <ArrowLeft size={18} />
              <span>Back to Sign In</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Email Address <span className="required">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Mail
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1.5rem', padding: '0.8rem' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending Reset Link...' : 'Send Reset Link'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={onNavigateToLogin}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <ArrowLeft size={16} />
                <span>Back to Sign In</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
