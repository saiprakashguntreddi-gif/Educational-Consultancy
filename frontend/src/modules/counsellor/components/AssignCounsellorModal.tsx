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
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
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
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '520px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
          overflow: 'hidden',
          color: '#0F172A',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserCheck size={18} />
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>
              Assign Counsellor
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {error && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                color: '#B91C1C',
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

          <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            Select the designated educational counsellor to guide <strong>{studentName}</strong>.
          </p>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
              Designated Counsellor
            </label>
            {isLoading ? (
              <p style={{ color: '#64748B', fontSize: '0.85rem' }}>Loading counsellor directory...</p>
            ) : (
              <select
                value={selectedCounsellorId}
                onChange={(e) => setSelectedCounsellorId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  color: '#0F172A',
                  fontSize: '0.9rem',
                  outline: 'none',
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
              borderTop: '1px solid #F1F5F9',
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
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                color: '#475569',
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
                backgroundColor: '#2563EB',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                fontWeight: 600,
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
