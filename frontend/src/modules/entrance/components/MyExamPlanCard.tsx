import React, { useState } from 'react';
import {
  Calendar,
  Target,
  FileEdit,
  Trash2,
  ExternalLink,
  PlayCircle,
  Plus,
  BookOpen,
  Award,
  AlertCircle,
} from 'lucide-react';
import {
  StudentExamPlanRecord,
  ExamPlanStatus,
  UpdateExamPlanInput,
  EntranceExamRecord,
} from '../entrance.types';

interface MyExamPlanCardProps {
  planItems: StudentExamPlanRecord[];
  allExams: EntranceExamRecord[];
  onUpdatePlanItem: (id: string, data: UpdateExamPlanInput) => Promise<boolean>;
  onRemovePlanItem: (id: string) => Promise<boolean>;
  onTakeMockTest: (exam: EntranceExamRecord) => void;
  onExploreCatalog: () => void;
}

export const MyExamPlanCard: React.FC<MyExamPlanCardProps> = ({
  planItems,
  allExams,
  onUpdatePlanItem,
  onRemovePlanItem,
  onTakeMockTest,
  onExploreCatalog,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UpdateExamPlanInput>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const startEditing = (item: StudentExamPlanRecord) => {
    setEditingId(item.id);
    setEditForm({
      status: item.status,
      targetDate: item.targetDate || '',
      targetScore: item.targetScore || '',
      currentScore: item.currentScore || '',
      notes: item.notes || '',
    });
    setActionError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
    setActionError(null);
  };

  const handleSave = async (id: string) => {
    setIsSubmitting(true);
    setActionError(null);
    try {
      const success = await onUpdatePlanItem(id, editForm);
      if (success) {
        setEditingId(null);
      } else {
        setActionError('Failed to update plan. Please review input fields.');
      }
    } catch {
      setActionError('An error occurred while updating your exam plan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeStyle = (status: ExamPlanStatus) => {
    switch (status) {
      case 'PLANNED':
        return { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' };
      case 'PREPARING':
        return { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' };
      case 'REGISTERED':
        return { bg: '#F0F9FF', color: '#0369A1', border: '#BAE6FD' };
      case 'COMPLETED':
        return { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' };
    }
  };

  const safePlans = Array.isArray(planItems) ? planItems : [];
  const safeAllExams = Array.isArray(allExams) ? allExams : [];

  if (safePlans.length === 0) {
    return (
      <div
        id="empty-exam-plan-state"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '4rem 1.5rem',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(91, 79, 233, 0.1)',
            color: '#5B4FE9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}
        >
          <BookOpen size={26} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.4rem' }}>
          No Entrance Exams in Your Plan Yet
        </h3>
        <p
          style={{
            fontSize: '0.92rem',
            color: '#64748B',
            maxWidth: '520px',
            margin: '0 auto 1.75rem',
            lineHeight: 1.6,
          }}
        >
          Browse our verified standardized test catalogue to discover relevant exams (such as SAT, ACT, IELTS, TOEFL, GRE, JEE) tailored to your destination preferences, and add them to your tracking plan.
        </p>
        <button
          id="empty-plan-explore-btn"
          onClick={onExploreCatalog}
          style={{
            background: '#5B4FE9',
            color: '#FFFFFF',
            border: 'none',
            padding: '0.65rem 1.5rem',
            borderRadius: '8px',
            fontSize: '0.92rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <Plus size={16} />
          <span>Explore Exam Catalogue</span>
        </button>
      </div>
    );
  }

  return (
    <div id="my-exam-plan-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {actionError && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#B91C1C',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={16} />
          <span>{actionError}</span>
        </div>
      )}

      {safePlans.map((item) => {
        const isEditing = editingId === item.id;
        const exam = item.exam || safeAllExams.find((e) => e.id === item.examId);
        const statusStyle = getStatusBadgeStyle(item.status);

        return (
          <div
            key={item.id}
            id={`plan-item-${item.id}`}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '1.4rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            {/* Header row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span
                    style={{
                      background: '#EEF2FF',
                      color: '#4338CA',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '5px',
                    }}
                  >
                    {exam?.code || 'EXAM'}
                  </span>

                  <span
                    style={{
                      background: statusStyle.bg,
                      color: statusStyle.color,
                      border: `1px solid ${statusStyle.border}`,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.55rem',
                      borderRadius: '9999px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {item.status}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {exam?.name || 'Entrance Exam'}
                </h3>
              </div>

              {/* Action Buttons Top Right */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {exam?.officialWebsiteUrl && (
                  <a
                    href={exam.officialWebsiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open official registration site"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      color: '#475569',
                      padding: '0.4rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    <span>Portal</span>
                    <ExternalLink size={13} />
                  </a>
                )}

                {exam?.hasMockTest && (
                  <button
                    id={`plan-take-mock-${exam.code.toLowerCase()}`}
                    onClick={() => onTakeMockTest(exam)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      background: '#6D28D9',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <PlayCircle size={14} />
                    <span>Take Mock</span>
                  </button>
                )}

                {!isEditing && (
                  <button
                    id={`edit-plan-btn-${item.id}`}
                    onClick={() => startEditing(item)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      color: '#0F172A',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <FileEdit size={14} />
                    <span>Edit</span>
                  </button>
                )}

                <button
                  id={`remove-plan-btn-${item.id}`}
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to remove ${exam?.name || 'this exam'} from your plan?`)) {
                      onRemovePlanItem(item.id);
                    }
                  }}
                  title="Remove exam from plan"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #FCA5A5',
                    color: '#DC2626',
                    padding: '0.4rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Editing Form OR View Fields */}
            {isEditing ? (
              <div
                id={`plan-edit-form-${item.id}`}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  marginTop: '0.75rem',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  {/* Status Dropdown */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Exam Journey Status
                    </label>
                    <select
                      id={`edit-status-${item.id}`}
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value as ExamPlanStatus })}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.86rem',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <option value="PLANNED">Planned</option>
                      <option value="PREPARING">Preparing</option>
                      <option value="REGISTERED">Registered</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>

                  {/* Target Date */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Target Exam Date
                    </label>
                    <input
                      id={`edit-target-date-${item.id}`}
                      type="date"
                      value={editForm.targetDate || ''}
                      onChange={(e) => setEditForm({ ...editForm, targetDate: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.86rem',
                        backgroundColor: '#FFFFFF',
                      }}
                    />
                  </div>

                  {/* Target Score */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Target Score (Goal)
                    </label>
                    <input
                      id={`edit-target-score-${item.id}`}
                      type="text"
                      placeholder="e.g. 1500+ or 7.5 Band"
                      value={editForm.targetScore || ''}
                      onChange={(e) => setEditForm({ ...editForm, targetScore: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.86rem',
                        backgroundColor: '#FFFFFF',
                      }}
                    />
                  </div>

                  {/* Current / Achieved Score */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Current / Achieved Score
                    </label>
                    <input
                      id={`edit-current-score-${item.id}`}
                      type="text"
                      placeholder="e.g. 1420 or 7.0 Band"
                      value={editForm.currentScore || ''}
                      onChange={(e) => setEditForm({ ...editForm, currentScore: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.86rem',
                        backgroundColor: '#FFFFFF',
                      }}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Preparation Notes & Study Strategy
                  </label>
                  <textarea
                    id={`edit-notes-${item.id}`}
                    rows={3}
                    placeholder="e.g. Practicing Reading comprehension daily, focusing on advanced Math algebra..."
                    value={editForm.notes || ''}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.86rem',
                      backgroundColor: '#FFFFFF',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Form Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                  <button
                    id={`cancel-edit-${item.id}`}
                    type="button"
                    onClick={cancelEditing}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      color: '#475569',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    id={`save-edit-${item.id}`}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSave(item.id)}
                    style={{
                      background: '#5B4FE9',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '0.5rem 1.25rem',
                      borderRadius: '6px',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting ? 0.7 : 1,
                    }}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Plan Updates'}
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '0.85rem',
                  background: '#F8FAFC',
                  borderRadius: '8px',
                  padding: '1rem',
                  border: '1px solid #F1F5F9',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={13} /> Target Date
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginTop: '0.2rem' }}>
                    {item.targetDate || 'Not scheduled yet'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Target size={13} /> Target Score
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A', marginTop: '0.2rem' }}>
                    {item.targetScore || 'Goal not set'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Award size={13} /> Current / Achieved Score
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: item.currentScore ? '#15803D' : '#64748B', marginTop: '0.2rem' }}>
                    {item.currentScore || '--'}
                  </div>
                </div>

                {item.notes && (
                  <div style={{ gridColumn: '1 / -1', marginTop: '0.25rem', paddingTop: '0.65rem', borderTop: '1px dashed #E2E8F0' }}>
                    <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>
                      Study Notes:
                    </div>
                    <p style={{ fontSize: '0.84rem', color: '#334155', margin: '0.2rem 0 0', lineHeight: 1.5 }}>
                      {item.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
