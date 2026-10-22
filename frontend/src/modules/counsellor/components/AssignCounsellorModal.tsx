import React, { useState, useEffect } from 'react';
import { X, UserCheck, AlertCircle } from 'lucide-react';
import { AdminClientService, CounsellorWorkloadInfo } from '../services/admin.service';

interface AssignCounsellorModalProps {
  profileId: string;
  studentName: string;
  currentCounsellorId?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const AssignCounsellorModal: React.FC<AssignCounsellorModalProps> = ({
  profileId,
  studentName,
  currentCounsellorId,
  onClose,
  onSuccess,
}) => {
  const [counsellors, setCounsellors] = useState<CounsellorWorkloadInfo[]>([]);
  const [selectedCounsellorId, setSelectedCounsellorId] = useState<string>(currentCounsellorId || '');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCounsellors = async () => {
      setIsLoading(true);
      try {
        const res = await AdminClientService.listCounsellors();
        if (res.success && res.data) {
          setCounsellors(res.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load counsellor directory');
      } finally {
        setIsLoading(false);
      }
    };
    loadCounsellors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const counsellorId = selectedCounsellorId ? selectedCounsellorId : null;
      const res = await AdminClientService.assignCounsellor(profileId, counsellorId);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || 'Assignment failed');
      }
    } catch (err: any) {
      setError(err.message || 'Server error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 10, 25, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#0F172A',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '520px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          color: '#F8FAFC',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.7) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <UserCheck size={20} color="#A78BFA" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
              Assign Counsellor
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {error && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                color: '#FCA5A5',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <p style={{ fontSize: '0.9rem', color: '#CBD5E1', marginBottom: '1.25rem' }}>
            Select the designated educational counsellor to guide <strong>{studentName}</strong>.
          </p>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.5rem' }}>
              Designated Counsellor
            </label>
            {isLoading ? (
              <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Loading counsellor directory...</p>
            ) : (
              <select
                value={selectedCounsellorId}
                onChange={(e) => setSelectedCounsellorId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  background: '#0B1535',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '0.9rem',
                }}
              >
                <option value="">-- Unassigned (Available in Pool) --</option>
                {counsellors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.email} (Caseload: {c.assignedStudentsCount} students)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div
            style={{
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.55rem 1.1rem',
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                borderRadius: '8px',
                color: '#CBD5E1',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              style={{
                padding: '0.55rem 1.4rem',
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {isSubmitting ? 'Updating...' : 'Save Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
