import React from 'react';
import {
  X,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { MockTestEvaluationResult } from '../exam-intelligence.types';

interface MockTestResultModalProps {
  result: MockTestEvaluationResult;
  onClose: () => void;
}

export const MockTestResultModal: React.FC<MockTestResultModalProps> = ({
  result,
  onClose,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}m ${remainder}s`;
  };

  const isExcellent = result.performanceVerdict === 'EXCELLENT';
  const isGood = result.performanceVerdict === 'GOOD';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(5px)',
        zIndex: 1300,
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
          maxWidth: '820px',
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
                width: 38,
                height: 38,
                borderRadius: '10px',
                background: isExcellent
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Award size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Diagnostic Mock Test Results
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0 0' }}>
                {result.mockTestTitle} • Evaluated and saved to your diagnostic record
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

        {/* Content */}
        <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top Score Banner */}
          <div
            style={{
              background: isExcellent ? '#ECFDF5' : isGood ? '#EEF2FF' : '#FEF2F2',
              border: isExcellent ? '1px solid #A7F3D0' : isGood ? '1px solid #C7D2FE' : '1px solid #FECACA',
              borderRadius: '14px',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '20px',
                  background: isExcellent ? '#059669' : isGood ? '#4F46E5' : '#DC2626',
                  color: '#FFFFFF',
                  marginBottom: '0.45rem',
                }}
              >
                {result.performanceVerdict} PERFORMANCE
              </span>
              <div style={{ fontSize: '2.25rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
                {result.score} / {result.totalMarks}
                <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#64748B', marginLeft: '0.5rem' }}>
                  ({result.percentage}%)
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Time Spent</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '2px' }}>
                  <Clock size={16} color="#6366F1" />
                  <span>{formatTime(result.timeSpentSeconds)}</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Questions</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', marginTop: '2px' }}>
                  {result.questionReview.filter((q) => q.isCorrect).length} / {result.questionReview.length} Correct
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.15rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem 0' }}>
                Key Diagnostic Insights & Next Actions
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {result.recommendations.map((rec, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#334155' }}>
                    <TrendingUp size={14} color="#4F46E5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section Accuracy Breakdown */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.75rem 0' }}>
              Section Accuracy Breakdown
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {result.sectionBreakdown.map((sec, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '0.85rem 1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1E293B' }}>
                      {sec.section}
                    </span>
                    <span style={{ fontSize: '0.825rem', fontWeight: 700, color: sec.accuracyPercentage >= 70 ? '#059669' : '#D97706' }}>
                      {sec.marksObtained}/{sec.totalMarks} ({sec.accuracyPercentage}%)
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ width: '100%', height: 6, background: '#F1F5F9', borderRadius: 3, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, Math.max(0, sec.accuracyPercentage))}%`,
                        height: '100%',
                        background: sec.accuracyPercentage >= 70 ? '#10B981' : '#F59E0B',
                        borderRadius: 3,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Question-by-Question Review with Explanations */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.75rem 0' }}>
              Question Review & Step-by-Step Rationales
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {result.questionReview.map((q, idx) => {
                const selectedLetter =
                  q.selectedOptionIndex !== null ? String.fromCharCode(65 + q.selectedOptionIndex) : 'None';
                const correctLetter = String.fromCharCode(65 + q.correctOptionIndex);

                return (
                  <div
                    key={q.questionId}
                    style={{
                      border: q.isCorrect ? '1px solid #A7F3D0' : '1px solid #FECACA',
                      background: q.isCorrect ? '#F0FDF4' : '#FEF2F2',
                      borderRadius: '12px',
                      padding: '1.15rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
                        Question {idx + 1} • {q.section}
                      </span>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: q.isCorrect ? '#065F46' : '#991B1B',
                        }}
                      >
                        {q.isCorrect ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        {q.isCorrect ? `+${q.marksAwarded} Marks` : '0 Marks'}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0F172A', margin: '0 0 0.75rem 0', lineHeight: 1.5 }}>
                      {q.questionText}
                    </p>

                    <div style={{ fontSize: '0.825rem', color: '#475569', marginBottom: '0.65rem' }}>
                      <span>Your Answer: <strong style={{ color: q.isCorrect ? '#059669' : '#DC2626' }}>Option {selectedLetter}</strong></span>
                      {!q.isCorrect && (
                        <span style={{ marginLeft: '1rem' }}>Correct Answer: <strong style={{ color: '#059669' }}>Option {correctLetter}</strong></span>
                      )}
                    </div>

                    {q.explanation && (
                      <div
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          padding: '0.75rem 0.95rem',
                          fontSize: '0.825rem',
                          color: '#334155',
                          lineHeight: 1.5,
                        }}
                      >
                        <span style={{ fontWeight: 700, color: '#4F46E5' }}>Explanation: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.75rem',
            borderTop: '1px solid #E2E8F0',
            background: '#F8FAFC',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '0.55rem 1.35rem',
              borderRadius: '8px',
              border: 'none',
              background: '#0F172A',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Done & Return to Intelligence Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
