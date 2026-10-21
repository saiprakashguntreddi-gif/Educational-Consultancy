import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkles,
  Edit2,
  Save,
  RefreshCw,
} from 'lucide-react';
import {
  RecommendationBatchDto,
  RecommendationTier,
  RecommendationBatchStatus,
} from '../recommendations.types';
import { RecommendationsService } from '../services/recommendations.service';

interface CounsellorRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentProfileId: string;
  studentName: string;
  onUpdated?: () => void;
}

export const CounsellorRecommendationModal: React.FC<CounsellorRecommendationModalProps> = ({
  isOpen,
  onClose,
  studentProfileId,
  studentName,
  onUpdated,
}) => {
  const [batch, setBatch] = useState<RecommendationBatchDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<RecommendationBatchStatus>('COUNSELLOR_APPROVED');
  const [counsellorNotes, setCounsellorNotes] = useState('');
  const [overrideItem, setOverrideItem] = useState<{ id: string; tier: RecommendationTier; notes: string } | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadBatch = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const res = await RecommendationsService.getStudentRecommendationsForStaff(studentProfileId);
      if (res.success && res.data) {
        setBatch(res.data);
        setStatus(res.data.status);
        setCounsellorNotes(res.data.counsellorNotes || '');
      } else {
        setBatch(null);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load recommendations' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && studentProfileId) {
      loadBatch();
    }
  }, [isOpen, studentProfileId]);

  const handleGenerateFresh = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await RecommendationsService.generateRecommendations(studentProfileId);
      if (res.success && res.data) {
        setBatch(res.data);
        setStatus(res.data.status);
        setCounsellorNotes(res.data.counsellorNotes || '');
        setFeedback({ type: 'success', message: 'Generated fresh three-tier recommendation batch.' });
        onUpdated?.();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to generate recommendations' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveReview = async () => {
    if (!batch) return;
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await RecommendationsService.reviewBatch(batch.id, status, counsellorNotes);
      if (res.success && res.data) {
        setBatch(res.data);
        setFeedback({ type: 'success', message: 'Review and advisory notes successfully saved.' });
        onUpdated?.();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save review' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTierOverride = async () => {
    if (!overrideItem) return;
    setIsSaving(true);
    try {
      const res = await RecommendationsService.overrideItemTier(
        overrideItem.id,
        overrideItem.tier,
        overrideItem.notes
      );
      if (res.success) {
        setFeedback({ type: 'success', message: 'Tier adjusted successfully.' });
        setOverrideItem(null);
        await loadBatch();
        onUpdated?.();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to adjust tier' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 10, 25, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(145deg, #0F172A 0%, #1E1B4B 100%)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '20px',
          maxWidth: '850px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          color: '#F8FAFC',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#A5B4FC',
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                Counsellor Review: Three-Tier Strategy
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#94A3B8', margin: '0.15rem 0 0 0' }}>
                Student: <strong>{studentName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              color: '#94A3B8',
              borderRadius: '8px',
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {feedback && (
            <div
              style={{
                background: feedback.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${feedback.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                color: feedback.type === 'success' ? '#4ADE80' : '#FCA5A5',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                fontSize: '0.875rem',
              }}
            >
              {feedback.message}
            </div>
          )}

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>
              Loading student recommendations...
            </div>
          ) : !batch ? (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
                padding: '3rem 2rem',
                borderRadius: '16px',
                textAlign: 'center',
              }}
            >
              <Clock size={36} color="#818CF8" style={{ marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>No Recommendations Generated Yet</h4>
              <p style={{ color: '#94A3B8', fontSize: '0.875rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
                This verified student does not have an active recommendation portfolio. Click below to run the Three-Tier Fit Engine.
              </p>
              <button
                onClick={handleGenerateFresh}
                disabled={isSaving}
                className="btn-primary-indigo"
                style={{ padding: '0.65rem 1.5rem' }}
              >
                <Sparkles size={16} />
                <span>Generate Recommendations Now</span>
              </button>
            </div>
          ) : (
            <>
              {/* Batch Summary */}
              <div
                style={{
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: '14px',
                  padding: '1.2rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#A5B4FC', textTransform: 'uppercase' }}>
                    Active Portfolio Strategy
                  </span>
                  <span
                    style={{
                      background: 'rgba(34, 197, 94, 0.15)',
                      color: '#4ADE80',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    Status: {batch.status}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.92rem', color: '#E2E8F0', lineHeight: 1.5 }}>
                  {batch.strategySummary}
                </p>
              </div>

              {/* Items List for Review */}
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.75rem 0', color: '#E2E8F0' }}>
                  Recommended Colleges ({batch.items.length})
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {batch.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '12px',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.95rem' }}>
                            {item.institutionName}
                          </span>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '0.15rem 0.5rem',
                              borderRadius: '8px',
                              background:
                                item.effectiveTier === 'SAFE'
                                  ? 'rgba(34, 197, 94, 0.15)'
                                  : item.effectiveTier === 'BEST_FIT'
                                  ? 'rgba(99, 102, 241, 0.15)'
                                  : 'rgba(245, 158, 11, 0.15)',
                              color:
                                item.effectiveTier === 'SAFE'
                                  ? '#4ADE80'
                                  : item.effectiveTier === 'BEST_FIT'
                                  ? '#A5B4FC'
                                  : '#FCD34D',
                            }}
                          >
                            {item.effectiveTier} ({item.admissionProbabilityMin}% - {item.admissionProbabilityMax}%)
                          </span>
                          {item.counsellorTierOverride && (
                            <span style={{ fontSize: '0.7rem', color: '#C084FC' }}>(Override)</span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                          {item.institutionCity}, {item.institutionCountry} • Program: {item.courseName || 'General Program'}
                        </div>
                        {item.counsellorNotes && (
                          <div style={{ fontSize: '0.78rem', color: '#6EE7B7', marginTop: '0.25rem' }}>
                            Note: {item.counsellorNotes}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() =>
                          setOverrideItem({
                            id: item.id,
                            tier: item.effectiveTier,
                            notes: item.counsellorNotes || '',
                          })
                        }
                        className="btn-secondary-outline"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        <Edit2 size={13} />
                        <span>Adjust Tier</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tier Override Mini Form */}
              {overrideItem && (
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid rgba(139, 92, 246, 0.4)',
                    padding: '1.25rem',
                    borderRadius: '14px',
                  }}
                >
                  <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.92rem', color: '#C7D2FE' }}>
                    Adjust Tier Classification
                  </h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '0.25rem' }}>
                        Target Tier
                      </label>
                      <select
                        value={overrideItem.tier}
                        onChange={(e) =>
                          setOverrideItem({ ...overrideItem, tier: e.target.value as RecommendationTier })
                        }
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#FFFFFF',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                        }}
                      >
                        <option value="SAFE" style={{ background: '#0F172A' }}>SAFE (&gt;95%)</option>
                        <option value="BEST_FIT" style={{ background: '#0F172A' }}>BEST-FIT (50% - 95%)</option>
                        <option value="ASPIRATIONAL" style={{ background: '#0F172A' }}>ASPIRATIONAL (&lt;50%)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '0.25rem' }}>
                        Advisory Rationale for Override
                      </label>
                      <input
                        type="text"
                        value={overrideItem.notes}
                        onChange={(e) => setOverrideItem({ ...overrideItem, notes: e.target.value })}
                        placeholder="e.g. Strong extra-curriculars justify Safe classification..."
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#FFFFFF',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button
                      onClick={() => setOverrideItem(null)}
                      className="btn-secondary-outline"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveTierOverride}
                      disabled={isSaving}
                      className="btn-primary-indigo"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                    >
                      <Save size={13} />
                      <span>Save Override</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Overall Counsellor Advisory Note */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '14px', padding: '1.2rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                  Counsellor Advisory Review & Approval
                </h4>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.35rem' }}>
                    Portfolio Review Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as RecommendationBatchStatus)}
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                    }}
                  >
                    <option value="UNDER_REVIEW" style={{ background: '#0F172A' }}>UNDER REVIEW (Advisory In Progress)</option>
                    <option value="COUNSELLOR_APPROVED" style={{ background: '#0F172A' }}>COUNSELLOR APPROVED (Official Recommended Strategy)</option>
                    <option value="FINALIZED" style={{ background: '#0F172A' }}>FINALIZED (Ready For Application Submissions)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94A3B8', marginBottom: '0.35rem' }}>
                    Advisory Feedback & Strategy Guidance
                  </label>
                  <textarea
                    rows={3}
                    value={counsellorNotes}
                    onChange={(e) => setCounsellorNotes(e.target.value)}
                    placeholder="Provide actionable guidance on application timing, scholarship requirements, and backup alternatives..."
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      resize: 'vertical',
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {batch && (
            <button
              onClick={handleGenerateFresh}
              disabled={isSaving}
              className="btn-secondary-outline"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              <RefreshCw size={14} />
              <span>Regenerate Portfolio</span>
            </button>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginLeft: 'auto' }}>
            <button
              onClick={onClose}
              className="btn-secondary-outline"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              Cancel
            </button>

            {batch && (
              <button
                onClick={handleSaveReview}
                disabled={isSaving}
                className="btn-primary-indigo"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
              >
                <CheckCircle size={15} />
                <span>Save Review & Notes</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
