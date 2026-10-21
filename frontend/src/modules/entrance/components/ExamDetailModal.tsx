import React from 'react';
import {
  X,
  ExternalLink,
  Clock,
  Award,
  Calendar,
  BookOpen,
  CheckCircle2,
  FileText,
  Bookmark,
  PlayCircle,
} from 'lucide-react';
import { EntranceExamRecord } from '../entrance.types';

interface ExamDetailModalProps {
  exam: EntranceExamRecord | null;
  onClose: () => void;
  onAddToPlan: (exam: EntranceExamRecord) => void;
  onTakeMockTest?: (exam: EntranceExamRecord) => void;
}

export const ExamDetailModal: React.FC<ExamDetailModalProps> = ({
  exam,
  onClose,
  onAddToPlan,
  onTakeMockTest,
}) => {
  if (!exam) return null;

  return (
    <div
      id="exam-detail-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="exam-detail-modal-card"
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          maxWidth: '840px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'fadeInModal 0.2s ease-out',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.5rem 1.75rem',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  background: '#EEF2FF',
                  color: '#4338CA',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                }}
              >
                {exam.code}
              </span>
              <span
                style={{
                  background: '#F1F5F9',
                  color: '#475569',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                }}
              >
                {exam.category.replace('_', ' ')}
              </span>
              {exam.isRecommendedForStudent && (
                <span
                  style={{
                    background: '#ECFDF5',
                    color: '#059669',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    border: '1px solid #A7F3D0',
                  }}
                >
                  ★ Recommended for your goal
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              {exam.name}
            </h2>
          </div>

          <button
            id="close-exam-modal-btn"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '1.75rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Description */}
          <div>
            <p style={{ fontSize: '0.94rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
              {exam.description}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.85rem',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '1rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={14} /> Total Duration
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginTop: '0.2rem' }}>
                {exam.totalDurationMinutes} minutes ({Math.floor(exam.totalDurationMinutes / 60)}h {exam.totalDurationMinutes % 60}m)
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Award size={14} /> Scoring Range
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginTop: '0.2rem' }}>
                {exam.scoreRange}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={14} /> Score Validity
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginTop: '0.2rem' }}>
                {exam.validity}
              </div>
            </div>
          </div>

          {/* Format & Test Structure */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="#5B4FE9" />
              Test Format & Section Structure
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '0.85rem' }}>
              <strong>Format:</strong> {exam.format}
            </p>

            {exam.sections && exam.sections.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {exam.sections.map((section, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1E293B' }}>
                        {section.name}
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', color: '#64748B' }}>
                        {section.questions && (
                          <span style={{ background: '#F1F5F9', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                            {section.questions} Questions
                          </span>
                        )}
                        {section.durationMinutes && (
                          <span style={{ background: '#F1F5F9', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                            {section.durationMinutes} mins
                          </span>
                        )}
                      </div>
                    </div>
                    <p style={{ fontSize: '0.84rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                      {section.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scoring Methodology */}
          <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '0.9rem 1rem', border: '1px solid #E2E8F0' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.35rem' }}>
              Scoring Methodology
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
              {exam.scoringDetails}
            </p>
          </div>

          {/* Important Verified Dates & Deadlines */}
          {exam.importantDates && exam.importantDates.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} color="#5B4FE9" />
                Verified Test Windows & Deadlines
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
                {exam.importantDates.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '0.85rem 1rem',
                      borderLeft: '4px solid #5B4FE9',
                    }}
                  >
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#334155', marginBottom: '0.2rem' }}>
                      <strong>Test Date:</strong> {item.date}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#DC2626' }}>
                      <strong>Registration Deadline:</strong> {item.deadline}
                    </div>
                    {item.notes && (
                      <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.35rem', fontStyle: 'italic' }}>
                        {item.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preparation Resources & Recommended Books */}
          {(exam.prepResources?.length > 0 || exam.recommendedBooks?.length > 0) && (
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={18} color="#5B4FE9" />
                Recommended Study Resources & Books
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                {exam.prepResources?.map((res, idx) => (
                  <div
                    key={`res-${idx}`}
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '0.85rem',
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#5B4FE9', letterSpacing: '0.04em' }}>
                      {res.type}
                    </span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', marginTop: '0.15rem' }}>
                      {res.title}
                    </div>
                    {res.description && (
                      <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.3rem 0 0', lineHeight: 1.4 }}>
                        {res.description}
                      </p>
                    )}
                  </div>
                ))}

                {exam.recommendedBooks?.map((book, idx) => (
                  <div
                    key={`book-${idx}`}
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '0.85rem',
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#059669', letterSpacing: '0.04em' }}>
                      Book Reference
                    </span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', marginTop: '0.15rem' }}>
                      {book.title}
                    </div>
                    {book.author && (
                      <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.15rem' }}>
                        by {book.author}
                      </div>
                    )}
                    {book.notes && (
                      <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.3rem 0 0', lineHeight: 1.4 }}>
                        {book.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test-Day Tips */}
          {exam.testDayTips && exam.testDayTips.length > 0 && (
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '1rem' }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#166534', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} /> Test-Day Best Practices & Tips
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.84rem', color: '#15803D', lineHeight: 1.6 }}>
                {exam.testDayTips.map((tip, idx) => (
                  <li key={idx} style={{ marginBottom: '0.25rem' }}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Verified Official Registration Website */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#EEF2FF',
              border: '1px solid #C7D2FE',
              borderRadius: '10px',
              padding: '1rem 1.25rem',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#312E81' }}>
                Official Registration Portal
              </div>
              <div style={{ fontSize: '0.8rem', color: '#4338CA', marginTop: '0.15rem' }}>
                Verified provider: {exam.officialWebsiteUrl}
              </div>
            </div>

            <a
              id="official-exam-portal-link"
              href={exam.officialWebsiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#4338CA',
                color: '#FFFFFF',
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                fontSize: '0.86rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <span>Open Official Website</span>
              <ExternalLink size={15} />
            </a>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderTop: '1px solid #E2E8F0',
            background: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
            {exam.studentPlanStatus ? (
              <span style={{ color: '#059669', fontWeight: 600 }}>
                ✓ Currently in your plan as <strong>{exam.studentPlanStatus}</strong>
              </span>
            ) : (
              'Not added to your personal plan yet'
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {exam.hasMockTest && onTakeMockTest && (
              <button
                id="launch-modal-mock-test-btn"
                onClick={() => onTakeMockTest(exam)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: '#6D28D9',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.6rem 1.15rem',
                  borderRadius: '8px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <PlayCircle size={16} />
                <span>Take Mock Test</span>
              </button>
            )}

            <button
              id="add-exam-to-plan-btn"
              onClick={() => onAddToPlan(exam)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: exam.studentPlanStatus ? '#E2E8F0' : '#0F172A',
                color: exam.studentPlanStatus ? '#475569' : '#FFFFFF',
                border: 'none',
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Bookmark size={16} />
              <span>{exam.studentPlanStatus ? 'Update Plan' : 'Save to My Plan'}</span>
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeInModal {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
