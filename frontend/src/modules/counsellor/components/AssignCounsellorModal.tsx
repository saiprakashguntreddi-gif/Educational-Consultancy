import React, { useState, useEffect } from 'react';
import { X, UserCheck, AlertCircle, ShieldCheck, History } from 'lucide-react';
import { AdminClientService, CounsellorWorkloadInfo, AssignmentHistoryItem } from '../services/admin.service';

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
  const [activeTab, setActiveTab] = useState<'assign' | 'history'>('assign');
  const [counsellors, setCounsellors] = useState<CounsellorWorkloadInfo[]>([]);
  const [selectedCounsellorId, setSelectedCounsellorId] = useState<string>(currentCounsellorId || '');
  const [reason, setReason] = useState<string>('');
  const [history, setHistory] = useState<AssignmentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
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

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await AdminClientService.getAssignmentHistory(profileId);
      if (res.success && res.data) {
        setHistory(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load assignment history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleTabChange = (tab: 'assign' | 'history') => {
    setActiveTab(tab);
    if (tab === 'history' && history.length === 0) {
      loadHistory();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const counsellorId = selectedCounsellorId ? selectedCounsellorId : null;
      const res = await AdminClientService.assignCounsellor(profileId, counsellorId, reason);
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

  // Filter eligible counsellors (VERIFIED or ACTIVE only)
  const eligibleCounsellors = counsellors.filter(
    (c) => c.verificationStatus === 'ACTIVE' || c.verificationStatus === 'VERIFIED' || c.isActive
  );

  const selectedCounsellor = counsellors.find((c) => c.id === selectedCounsellorId);

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
          borderRadius: '16px',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 35px -5px rgba(15, 23, 42, 0.12), 0 10px 15px -6px rgba(15, 23, 42, 0.05)',
          overflow: 'hidden',
          color: '#0F172A',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
                width: '36px',
                height: '36px',
                borderRadius: '9px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserCheck size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                Allocate Educational Counsellor
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                Student: <strong style={{ color: '#0F172A' }}>{studentName}</strong>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1.5rem 0', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
          <button
            type="button"
            onClick={() => handleTabChange('assign')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px 6px 0 0',
              border: 'none',
              borderBottom: activeTab === 'assign' ? '2px solid #2563EB' : '2px solid transparent',
              background: 'transparent',
              fontWeight: activeTab === 'assign' ? 600 : 500,
              color: activeTab === 'assign' ? '#2563EB' : '#64748B',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <UserCheck size={15} /> Select Counsellor
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('history')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px 6px 0 0',
              border: 'none',
              borderBottom: activeTab === 'history' ? '2px solid #2563EB' : '2px solid transparent',
              background: 'transparent',
              fontWeight: activeTab === 'history' ? 600 : 500,
              color: activeTab === 'history' ? '#2563EB' : '#64748B',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <History size={15} /> Assignment History
          </button>
        </div>

        {/* Tab 1: Assign */}
        {activeTab === 'assign' && (
          <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto' }}>
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

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Eligible Counsellor (Verified & Active)
              </label>
              {isLoading ? (
                <p style={{ color: '#64748B', fontSize: '0.85rem' }}>Loading verified counsellors...</p>
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
                  <option value="">-- Unassigned (Return to unassigned pool) --</option>
                  {eligibleCounsellors.map((c) => {
                    const cap = c.capacity || 30;
                    const loadPct = Math.round((c.assignedStudentsCount / cap) * 100);
                    return (
                      <option key={c.id} value={c.id}>
                        {c.fullName || c.email.split('@')[0]} ({c.specialization || 'Advising'}) — Caseload: {c.assignedStudentsCount}/{cap} ({loadPct}%)
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {/* Counsellor Card Preview */}
            {selectedCounsellor && (
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>
                      {selectedCounsellor.fullName || selectedCounsellor.email.split('@')[0]}
                    </strong>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>{selectedCounsellor.email}</div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: '#16A34A',
                      backgroundColor: '#DCFCE7',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 9999,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <ShieldCheck size={12} /> {selectedCounsellor.verificationStatus || 'ACTIVE'}
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.6rem' }}>
                  <strong>Specialization:</strong> {selectedCounsellor.specialization || 'University Admissions'} • {selectedCounsellor.experienceYears || 3} Years Experience
                </div>

                {selectedCounsellor.skills && selectedCounsellor.skills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.6rem' }}>
                    {selectedCounsellor.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        style={{
                          fontSize: '0.72rem',
                          backgroundColor: '#EFF6FF',
                          color: '#1D4ED8',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748B', borderTop: '1px solid #E2E8F0', paddingTop: '0.5rem' }}>
                  <span>Availability: {selectedCounsellor.availability || 'Mon-Fri, 9:00 AM - 5:00 PM'}</span>
                  <span>Active Load: <strong>{selectedCounsellor.assignedStudentsCount}</strong> / {selectedCounsellor.capacity || 30} students</span>
                </div>
              </div>
            )}

            {/* Optional Reason */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                Assignment Note / Reason (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Assigned based on STEM admissions background"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  color: '#0F172A',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
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
                className="saas-btn saas-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="saas-btn saas-btn-primary"
              >
                {isSubmitting ? 'Allocating...' : 'Confirm Counsellor Allocation'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Assignment History */}
        {activeTab === 'history' && (
          <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
            {isLoadingHistory ? (
              <p style={{ textAlign: 'center', color: '#64748B', padding: '2rem' }}>Loading assignment audit trail...</p>
            ) : history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748B' }}>
                <History size={32} color="#CBD5E1" style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ margin: 0, fontWeight: 600 }}>No prior assignment history recorded for this student.</p>
                <span style={{ fontSize: '0.78rem' }}>When counsellors are assigned or reassigned, complete logs appear here.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {history.map((h) => (
                  <div
                    key={h.id}
                    style={{
                      padding: '0.85rem 1rem',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>
                        {h.counsellorName} ({h.counsellorEmail})
                      </strong>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: h.status === 'ACTIVE' ? '#DCFCE7' : '#F1F5F9',
                          color: h.status === 'ACTIVE' ? '#166534' : '#64748B',
                        }}
                      >
                        {h.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '0.35rem' }}>
                      Assigned by: <strong>{h.assignedByEmail}</strong> on {new Date(h.assignedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      {h.unassignedAt && (
                        <span> • Concluded: {new Date(h.unassignedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      )}
                    </div>
                    {h.reason && (
                      <div style={{ fontSize: '0.78rem', color: '#334155', fontStyle: 'italic' }}>
                        "{h.reason}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
              <button type="button" onClick={onClose} className="saas-btn saas-btn-secondary">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
