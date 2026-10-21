import React from 'react';
import {
  Target,
  Edit2,
  Trash2,
  Plus,
  UserCheck,
} from 'lucide-react';
import {
  StudentExamPlanRecord,
  ExamPlanStatus,
  RecommendedExamItem,
} from '../exam-intelligence.types';

interface StudentExamPlanTrackerProps {
  plans: StudentExamPlanRecord[];
  allExams?: RecommendedExamItem[];
  onAddPlanItem: () => void;
  onEditPlanItem: (plan: StudentExamPlanRecord) => void;
  onDeletePlanItem: (planId: string) => void;
}

export const StudentExamPlanTracker: React.FC<StudentExamPlanTrackerProps> = ({
  plans,
  allExams: _allExams,
  onAddPlanItem,
  onEditPlanItem,
  onDeletePlanItem,
}) => {
  const getStatusBadge = (status: ExamPlanStatus) => {
    switch (status) {
      case 'COMPLETED':
        return {
          bg: '#F5F3FF',
          border: '#DDD6FE',
          text: '#6D28D9',
          label: 'Completed',
        };
      case 'REGISTERED':
        return {
          bg: '#ECFDF5',
          border: '#A7F3D0',
          text: '#059669',
          label: 'Registered & Scheduled',
        };
      case 'PREPARING':
        return {
          bg: '#EEF2FF',
          border: '#C7D2FE',
          text: '#4338CA',
          label: 'In Preparation',
        };
      case 'PLANNED':
      default:
        return {
          bg: '#F1F5F9',
          border: '#CBD5E1',
          text: '#475569',
          label: 'Planned',
        };
    }
  };

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        padding: '1.75rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#4F46E5',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              background: 'rgba(79, 70, 229, 0.08)',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              marginBottom: '0.35rem',
            }}
          >
            <UserCheck size={13} /> Step 6: Counsellor Follow-up Strategy
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Personal Entrance Exam Action Plan
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
            Record planned test dates, target benchmarks, and actual scores. Every milestone update is automatically synced for counsellor review.
          </p>
        </div>

        <button
          onClick={onAddPlanItem}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.6rem 1.15rem',
            borderRadius: '9px',
            border: 'none',
            background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
          }}
        >
          <Plus size={16} />
          <span>Add Exam to Plan</span>
        </button>
      </div>

      {plans.length === 0 ? (
        <div
          style={{
            padding: '3.5rem 1.5rem',
            textAlign: 'center',
            background: '#F8FAFC',
            borderRadius: '12px',
            border: '1px dashed #CBD5E1',
          }}
        >
          <Target size={40} color="#94A3B8" style={{ margin: '0 auto 0.75rem auto' }} />
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1E293B', margin: '0 0 0.35rem 0' }}>
            No Exams in Your Personal Plan Yet
          </h4>
          <p style={{ fontSize: '0.875rem', color: '#64748B', maxWidth: '480px', margin: '0 auto 1.25rem auto' }}>
            Select an exam from the Admissions Intelligence catalogue or click "Add Exam to Plan" above to schedule target dates and benchmark scores.
          </p>
          <button
            onClick={onAddPlanItem}
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#0F172A',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            + Add First Exam Plan
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {plans.map((item) => {
            const badge = getStatusBadge(item.status);

            return (
              <div
                key={item.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '1.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '20px',
                        background: badge.bg,
                        border: `1px solid ${badge.border}`,
                        color: badge.text,
                      }}
                    >
                      {badge.label}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <button
                        onClick={() => onEditPlanItem(item)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#4F46E5',
                          cursor: 'pointer',
                          padding: '0.35rem',
                          display: 'flex',
                        }}
                        title="Edit Plan"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => onDeletePlanItem(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#DC2626',
                          cursor: 'pointer',
                          padding: '0.35rem',
                          display: 'flex',
                        }}
                        title="Remove from Plan"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.65rem 0' }}>
                    {item.exam.name}
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.85rem' }}>
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.65rem 0.85rem' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Target Date</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginTop: '2px' }}>
                        {item.targetDate || 'Not specified'}
                      </div>
                    </div>

                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.65rem 0.85rem' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Target Score</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginTop: '2px' }}>
                        {item.targetScore || 'Not specified'}
                      </div>
                    </div>
                  </div>

                  {item.currentScore && (
                    <div style={{ background: '#F0FDF4', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '0.65rem 0.85rem', marginBottom: '0.85rem' }}>
                      <div style={{ fontSize: '0.7rem', color: '#065F46', fontWeight: 700, textTransform: 'uppercase' }}>Achieved Score</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#065F46', marginTop: '2px' }}>
                        {item.currentScore}
                      </div>
                    </div>
                  )}

                  {item.notes && (
                    <div style={{ fontSize: '0.8rem', color: '#475569', fontStyle: 'italic', background: '#F8FAFC', padding: '0.55rem 0.75rem', borderRadius: '6px' }}>
                      "{item.notes}"
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem', marginTop: '0.85rem', fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <UserCheck size={14} color="#059669" />
                  <span>Visible to your assigned counsellor</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
