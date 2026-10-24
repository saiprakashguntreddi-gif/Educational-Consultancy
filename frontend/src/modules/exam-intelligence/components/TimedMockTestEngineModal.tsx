import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Flag,
  Award,
  Send,
} from 'lucide-react';
import {
  MockTestTakingPayload,
  MockTestEvaluationResult,
} from '../exam-intelligence.types';
import { ExamIntelligenceService } from '../services/exam-intelligence.service';

interface TimedMockTestEngineModalProps {
  testId: string;
  onClose: () => void;
  onTestEvaluated: (result: MockTestEvaluationResult) => void;
}

export const TimedMockTestEngineModal: React.FC<TimedMockTestEngineModalProps> = ({
  testId,
  onClose,
  onTestEvaluated,
}) => {
  const [testPayload, setTestPayload] = useState<MockTestTakingPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Testing State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitPromptOpen, setSubmitPromptOpen] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);

  // 1. Load Safe Mock Test Payload
  useEffect(() => {
    const loadTest = async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const res = await ExamIntelligenceService.getMockTestForTaking(testId);
        if (res.success && res.data) {
          setTestPayload(res.data);
          const totalSecs = res.data.durationMinutes * 60;
          setSecondsRemaining(totalSecs);
          startTimeRef.current = Date.now();
        } else {
          setLoadError(res.message || 'Failed to load mock test questions.');
        }
      } catch (err: any) {
        setLoadError(err.message || 'Failed to initialize testing environment.');
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [testId]);

  // 2. Countdown Timer
  useEffect(() => {
    if (loading || loadError || !testPayload || secondsRemaining <= 0) return;

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, loadError, testPayload]);

  // Handle option select
  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  // Toggle flag for review
  const toggleFlag = (questionId: string) => {
    setFlagged((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  // Submit test
  const executeSubmission = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      if (timerRef.current) clearInterval(timerRef.current);

      const timeSpentSeconds = Math.max(
        1,
        Math.round((Date.now() - startTimeRef.current) / 1000)
      );

      const res = await ExamIntelligenceService.submitMockTest(testId, {
        answers,
        timeSpentSeconds,
      });

      if (res.success && res.data) {
        onTestEvaluated(res.data);
      } else {
        alert(res.message || 'Failed to score mock test.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      alert(err.message || 'Network error while submitting test.');
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    executeSubmission();
  };

  // Format MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(5px)',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Clock size={36} className="animate-spin" style={{ margin: '0 auto 0.75rem auto', color: '#6366F1' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Initializing Secure Testing Engine...</h3>
          <p style={{ fontSize: '0.85rem', color: '#CBD5E1', marginTop: '0.25rem' }}>
            Preparing questions, timer, and anti-cheat sandbox.
          </p>
        </div>
      </div>
    );
  }

  if (loadError || !testPayload) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(5px)',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.25rem',
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
          }}
        >
          <AlertCircle size={40} color="#DC2626" style={{ margin: '0 auto 0.75rem auto' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.5rem 0' }}>
            Unable to Launch Mock Test
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 1.5rem 0' }}>
            {loadError || 'Diagnostic mock test questions are not yet configured for this exam.'}
          </p>
          <button
            onClick={onClose}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              background: '#0F172A',
              color: '#FFFFFF',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close Environment
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = testPayload.questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const isTimeCritical = secondsRemaining < 180; // under 3 minutes

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0B1535',
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 1. TOP TESTING BAR */}
      <div
        style={{
          background: '#121F47',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '0.85rem 1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#FFFFFF',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Award size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#FFFFFF' }}>
              {testPayload.title}
            </h3>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              Exam: {testPayload.examCode} • {testPayload.questions.length} Questions • {testPayload.totalMarks} Marks
            </div>
          </div>
        </div>

        {/* Timer & Submit Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.45rem 0.95rem',
              borderRadius: '8px',
              background: isTimeCritical ? 'rgba(220, 38, 38, 0.2)' : 'rgba(99, 102, 241, 0.2)',
              border: isTimeCritical ? '1px solid #DC2626' : '1px solid rgba(99, 102, 241, 0.4)',
              color: isTimeCritical ? '#FCA5A5' : '#C7D2FE',
              fontSize: '1rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
            }}
          >
            <Clock size={16} />
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          <button
            onClick={() => setSubmitPromptOpen(true)}
            style={{
              padding: '0.5rem 1.15rem',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
            }}
          >
            <Send size={15} />
            <span>Finish & Submit</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN TESTING BODY (2 COLUMNS: QUESTION + PALETTE) */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: Active Question Canvas */}
        <div
          style={{
            flex: 1,
            background: '#F8FAFC',
            padding: '2rem clamp(1.5rem, 3vw, 3rem)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            {/* Section & Status Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '1rem',
                borderBottom: '1px solid #E2E8F0',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '5px',
                    background: '#EEF2FF',
                    color: '#4F46E5',
                  }}
                >
                  Section: {currentQuestion.section}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B' }}>
                  Question {currentIndex + 1} of {testPayload.questions.length}
                </span>
              </div>

              <button
                onClick={() => toggleFlag(currentQuestion.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: flagged[currentQuestion.id] ? '1px solid #F59E0B' : '1px solid #CBD5E1',
                  background: flagged[currentQuestion.id] ? '#FEF3C7' : '#FFFFFF',
                  color: flagged[currentQuestion.id] ? '#B45309' : '#64748B',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Flag size={14} />
                <span>{flagged[currentQuestion.id] ? 'Flagged for Review' : 'Flag Question'}</span>
              </button>
            </div>

            {/* Question Text */}
            <div
              style={{
                fontSize: '1.15rem',
                fontWeight: 600,
                color: '#0F172A',
                lineHeight: 1.6,
                marginBottom: '1.75rem',
              }}
            >
              {currentQuestion.questionText}
            </div>

            {/* Options List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {currentQuestion.options.map((option, optIdx) => {
                const isSelected = answers[currentQuestion.id] === optIdx;
                const letter = String.fromCharCode(65 + optIdx);

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.95rem 1.25rem',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #6366F1' : '1px solid #CBD5E1',
                      background: isSelected ? '#EEF2FF' : '#FFFFFF',
                      color: isSelected ? '#1E1B4B' : '#334155',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.95rem',
                      fontWeight: isSelected ? 600 : 500,
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 2px 8px rgba(99, 102, 241, 0.15)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        border: isSelected ? '2px solid #6366F1' : '1px solid #CBD5E1',
                        background: isSelected ? '#6366F1' : '#F8FAFC',
                        color: isSelected ? '#FFFFFF' : '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.825rem',
                        flexShrink: 0,
                      }}
                    >
                      {letter}
                    </div>
                    <div style={{ flex: 1 }}>{option}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div
            style={{
              paddingTop: '1.5rem',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '2rem',
            }}
          >
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1.15rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: currentIndex === 0 ? '#94A3B8' : '#334155',
                cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              <ChevronLeft size={16} />
              <span>Previous Question</span>
            </button>

            <button
              onClick={() => {
                if (currentIndex < testPayload.questions.length - 1) {
                  setCurrentIndex((i) => i + 1);
                } else {
                  setSubmitPromptOpen(true);
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1.35rem',
                borderRadius: '8px',
                border: 'none',
                background: '#0F172A',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <span>{currentIndex === testPayload.questions.length - 1 ? 'Review & Submit' : 'Next Question'}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Right: Question Palette & Status Summary */}
        <div
          style={{
            width: '320px',
            background: '#FFFFFF',
            borderLeft: '1px solid #E2E8F0',
            padding: '1.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem 0' }}>
              Question Palette
            </h4>
            <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span>Answered: <strong style={{ color: '#059669' }}>{answeredCount}</strong></span>
              <span>Remaining: <strong style={{ color: '#DC2626' }}>{testPayload.questions.length - answeredCount}</strong></span>
            </div>
          </div>

          {/* Palette Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
            {testPayload.questions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const isAnswered = answers[q.id] !== undefined;
              const isFlagged = !!flagged[q.id];

              let bg = '#F1F5F9';
              let text = '#475569';
              let border = '1px solid #CBD5E1';

              if (isCurrent) {
                border = '2px solid #4F46E5';
              }
              if (isAnswered) {
                bg = '#ECFDF5';
                text = '#065F46';
                border = isCurrent ? '2px solid #059669' : '1px solid #A7F3D0';
              }
              if (isFlagged) {
                bg = '#FEF3C7';
                text = '#B45309';
                border = isCurrent ? '2px solid #D97706' : '1px solid #FDE68A';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    height: 38,
                    borderRadius: '8px',
                    border,
                    background: bg,
                    color: text,
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  {idx + 1}
                  {isFlagged && (
                    <span
                      style={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#D97706',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1rem', fontSize: '0.75rem', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: '#ECFDF5', border: '1px solid #A7F3D0' }} />
              <span>Answered ({answeredCount})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: '#FEF3C7', border: '1px solid #FDE68A' }} />
              <span>Flagged for Review</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: '#F1F5F9', border: '1px solid #CBD5E1' }} />
              <span>Unvisited</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CONFIRMATION SUBMISSION MODAL */}
      {submitPromptOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 1300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '1.75rem',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem 0' }}>
              Submit Mock Test for Scoring?
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
              You have answered <strong>{answeredCount}</strong> out of{' '}
              <strong>{testPayload.questions.length}</strong> questions. Once submitted, your answers will be evaluated server-side and recorded in your diagnostic performance history.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setSubmitPromptOpen(false)}
                disabled={isSubmitting}
                style={{
                  padding: '0.55rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Return to Test
              </button>
              <button
                onClick={() => {
                  setSubmitPromptOpen(false);
                  executeSubmission();
                }}
                disabled={isSubmitting}
                style={{
                  padding: '0.55rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                {isSubmitting ? 'Evaluating...' : 'Yes, Submit Answers'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
