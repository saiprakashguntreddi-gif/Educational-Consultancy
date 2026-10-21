import React, { useEffect, useState } from 'react';
import {
  X,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Compass,
  FileText,
} from 'lucide-react';
import {
  RecommendedExamItem,
  PreparationPlanResponse,
} from '../exam-intelligence.types';
import { ExamIntelligenceService } from '../services/exam-intelligence.service';

interface PreparationPathModalProps {
  examItem: RecommendedExamItem;
  onClose: () => void;
  onLaunchMockTest: (exam: RecommendedExamItem) => void;
}

export const PreparationPathModal: React.FC<PreparationPathModalProps> = ({
  examItem,
  onClose,
  onLaunchMockTest,
}) => {
  const [prepPlan, setPrepPlan] = useState<PreparationPlanResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrepPlan = async () => {
      try {
        setLoading(true);
        const res = await ExamIntelligenceService.getPreparationPlan(examItem.examId);
        if (res.success && res.data) {
          setPrepPlan(res.data);
        }
      } catch (err) {
        console.error('Failed to load preparation path:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrepPlan();
  }, [examItem.examId]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: '840px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid #E2E8F0',
            background: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Compass size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Structured Preparation Path
                </h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', background: '#EEF2FF', color: '#4F46E5' }}>
                  {examItem.code}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0 0' }}>
                Curriculum milestones, recommended books, study guidance, and test-day readiness
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '0.4rem',
              display: 'flex',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {loading ? (
            <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748B', fontSize: '0.9rem' }}>
              Building custom preparation roadmap...
            </div>
          ) : (
            <>
              {/* Target Banner */}
              <div
                style={{
                  background: '#EEF2FF',
                  border: '1px solid #C7D2FE',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Standardized Pathway Target
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E1B4B', marginTop: '2px' }}>
                    {prepPlan?.examName}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#6366F1', fontWeight: 600 }}>Target Score</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E1B4B' }}>
                      {prepPlan?.targetScore || 'Set in Plan'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#6366F1', fontWeight: 600 }}>Target Date</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E1B4B' }}>
                      {prepPlan?.targetDate || 'Flexible Schedule'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended Books & Official Guides */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.65rem' }}>
                  Recommended Books & Study Resources
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                  {prepPlan?.recommendedBooks.map((book, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '10px',
                        padding: '0.85rem 1rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.65rem',
                      }}
                    >
                      <BookOpen size={18} color="#4F46E5" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1E293B' }}>
                        {book}
                      </div>
                    </div>
                  ))}
                  {prepPlan?.prepResources.map((res, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '10px',
                        padding: '0.85rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#1E293B' }}>
                        <FileText size={16} color="#4F46E5" />
                        <span>{res.title}</span>
                      </div>
                      {res.url && (
                        <a href={res.url} target="_blank" rel="noopener noreferrer" style={{ color: '#4F46E5', display: 'flex' }}>
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 8-Week Roadmap Milestones */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                  8-Week Structured Study Roadmap
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {prepPlan?.timeline.map((item) => (
                    <div
                      key={item.week}
                      style={{
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        padding: '1rem 1.25rem',
                        background: '#FFFFFF',
                        display: 'flex',
                        gap: '1rem',
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: '8px',
                          background: '#F1F5F9',
                          color: '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          flexShrink: 0,
                        }}
                      >
                        W{item.week}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                            {item.phase}
                          </h5>
                        </div>
                        <p style={{ fontSize: '0.825rem', color: '#64748B', margin: '0.2rem 0 0.5rem 0' }}>
                          {item.objective}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {item.tasks.map((task, tidx) => (
                            <div key={tidx} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: '#334155' }}>
                              <CheckCircle2 size={13} color="#10B981" />
                              <span>{task}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '1rem 1.75rem',
            borderTop: '1px solid #E2E8F0',
            background: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '0.55rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            Close
          </button>

          {examItem.hasMockTest && (
            <button
              onClick={() => {
                onClose();
                onLaunchMockTest(examItem);
              }}
              style={{
                padding: '0.55rem 1.25rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
              }}
            >
              Take Diagnostic Mock Test
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
