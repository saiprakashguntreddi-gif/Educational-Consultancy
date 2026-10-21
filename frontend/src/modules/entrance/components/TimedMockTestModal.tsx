import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Send,
} from 'lucide-react';
import { EntranceService } from '../services/entrance.service';
import { MockTestTakingView, MockTestResultRecord } from '../entrance.types';

interface TimedMockTestModalProps {
  testId: string;
  onClose: () => void;
  onCompleted: (result: MockTestResultRecord) => void;
}

export const TimedMockTestModal: React.FC<TimedMockTestModalProps> = ({
  testId,
  onClose,
  onCompleted,
}) => {
  const [testData, setTestData] = useState<MockTestTakingView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Test Taking State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Results State
  const [result, setResult] = useState<MockTestResultRecord | null>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Timer Ref
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 1. Load Mock Test Data
  useEffect(() => {
    let isMounted = true;
    const fetchTest = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await EntranceService.getMockTestForTaking(testId);
        if (!isMounted) return;
        if (res.success && res.data) {
          setTestData(res.data);
          const initialSeconds = res.data.durationMinutes * 60;
          setSecondsRemaining(initialSeconds);
        } else {
          setLoadError(res.message || 'Failed to load mock test questions.');
        }
      } catch (err: any) {
        if (!isMounted) return;
        setLoadError(err.message || 'Network error while loading mock test.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchTest();
    return () => {
      isMounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testId]);

  // 2. Countdown Timer
  useEffect(() => {
    if (!testData || result || isSubmitting) return;

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });

      setTimeSpentSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testData, result, isSubmitting]);

  // Auto-submit when time expires
  const handleAutoSubmit = () => {
    if (!result && !isSubmitting) {
      handleSubmitAnswers();
    }
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const handleSubmitAnswers = async () => {
    if (!testData || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    setShowConfirmSubmit(false);

    try {
      const res = await EntranceService.submitMockTest(testData.id, {
        timeSpentSeconds,
        answers,
      });

      if (res.success && res.data) {
        setResult(res.data);
        onCompleted(res.data);
      } else {
        setSubmitError(res.message || 'Failed to submit test evaluation.');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Submission error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div
        id="mock-modal-backdrop"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '3rem',
            textAlign: 'center',
            maxWidth: '420px',
            width: '100%',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid #E2E8F0',
              borderTopColor: '#6D28D9',
              borderRadius: '50%',
              margin: '0 auto 1.25rem',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.35rem' }}>
            Preparing Diagnostic Environment
          </h3>
          <p style={{ fontSize: '0.86rem', color: '#64748B', margin: 0 }}>
            Loading verified exam questions, sections, and scoring parameters...
          </p>
        </div>
      </div>
    );
  }

  if (loadError || !testData) {
    return (
      <div
        id="mock-modal-backdrop"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '2.5rem',
            textAlign: 'center',
            maxWidth: '480px',
            width: '100%',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem' }}>
            Diagnostic Test Unavailable
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#64748B', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
            {loadError || 'Diagnostic mock test questions are currently not available for this exam.'}
          </p>
          <button
            id="close-load-error-btn"
            onClick={onClose}
            style={{
              background: '#0F172A',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.6rem 1.4rem',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Return to Exams
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = testData.questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const isTimeCritical = secondsRemaining < 120; // under 2 minutes

  return (
    <div
      id="mock-test-environment-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        overflowY: 'auto',
      }}
    >
      <div
        id="mock-test-modal-card"
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          maxWidth: '920px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
        }}
      >
        {/* ========================================================
            HEADER: Test Title & Live Ticking Countdown Timer
           ======================================================== */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#0F172A',
            color: '#FFFFFF',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(255,255,255,0.15)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                {testData.examName}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                Diagnostic Mock Test
              </span>
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
              {testData.title}
            </h2>
          </div>

          {/* Timer and Close Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {!result && (
              <div
                id="mock-test-countdown-timer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: isTimeCritical ? '#EF4444' : '#1E293B',
                  color: '#FFFFFF',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  fontVariantNumeric: 'tabular-nums',
                  border: isTimeCritical ? '1px solid #F87171' : '1px solid #334155',
                  boxShadow: isTimeCritical ? '0 0 10px rgba(239, 68, 68, 0.5)' : 'none',
                }}
              >
                <Clock size={16} />
                <span>{formatTime(secondsRemaining)}</span>
              </div>
            )}

            <button
              id="exit-mock-test-btn"
              onClick={() => {
                if (!result) {
                  if (window.confirm('Are you sure you want to exit? Your current test progress will be lost.')) {
                    onClose();
                  }
                } else {
                  onClose();
                }
              }}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#CBD5E1',
                padding: '0.45rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ========================================================
            VIEW A: DIAGNOSTIC RESULTS BREAKDOWN (POST-SUBMISSION)
           ======================================================== */}
        {result ? (
          <div
            id="mock-test-results-view"
            style={{
              padding: '1.75rem',
              overflowY: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            {/* Score Summary Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
                color: '#FFFFFF',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#C7D2FE', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Diagnostic Result Completed
                </span>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0.2rem 0 0.35rem' }}>
                  {result.score} / {result.totalMarks} Marks
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#A5B4FC' }}>
                  Accuracy: {result.percentage}% • Time taken: {Math.floor(result.timeSpentSeconds / 60)}m {result.timeSpentSeconds % 60}s
                </span>
              </div>

              <div
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '10px',
                  padding: '0.75rem 1.25rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: result.percentage >= 60 ? '#4ADE80' : '#FBBF24' }}>
                  {result.percentage}%
                </div>
                <div style={{ fontSize: '0.75rem', color: '#E0E7FF' }}>Overall Performance</div>
              </div>
            </div>

            {/* Question Breakdown Heading */}
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.85rem' }}>
                Question-by-Question Analysis & Explanations
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {result.breakdown.map((item, idx) => (
                  <div
                    key={item.questionId}
                    id={`result-question-${idx}`}
                    style={{
                      background: item.isCorrect ? '#F0FDF4' : '#FEF2F2',
                      border: item.isCorrect ? '1px solid #BBF7D0' : '1px solid #FECACA',
                      borderRadius: '10px',
                      padding: '1.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#FFFFFF', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                          Q{idx + 1} • {item.section}
                        </span>
                        {item.isCorrect ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#16A34A', fontSize: '0.8rem', fontWeight: 700 }}>
                            <CheckCircle2 size={16} /> Correct (+{item.marksObtained} mark)
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#DC2626', fontSize: '0.8rem', fontWeight: 700 }}>
                            <XCircle size={16} /> Incorrect ({item.marksObtained} / {item.maxMarks} marks)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Question Text */}
                    <p style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0F172A', margin: '0 0 0.85rem', lineHeight: 1.5 }}>
                      {item.questionText}
                    </p>

                    {/* Options list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '0.85rem' }}>
                      {item.options.map((opt, optIdx) => {
                        const isSelected = item.selectedOptionIndex === optIdx;
                        const isCorrectOption = item.correctOptionIndex === optIdx;

                        let optBg = '#FFFFFF';
                        let optBorder = '#E2E8F0';
                        let optColor = '#334155';

                        if (isCorrectOption) {
                          optBg = '#DCFCE7';
                          optBorder = '#86EFAC';
                          optColor = '#166534';
                        } else if (isSelected && !item.isCorrect) {
                          optBg = '#FEE2E2';
                          optBorder = '#FCA5A5';
                          optColor = '#991B1B';
                        }

                        return (
                          <div
                            key={optIdx}
                            style={{
                              background: optBg,
                              border: `1px solid ${optBorder}`,
                              color: optColor,
                              borderRadius: '6px',
                              padding: '0.55rem 0.85rem',
                              fontSize: '0.86rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span>
                              <strong>{String.fromCharCode(65 + optIdx)}.</strong> {opt}
                            </span>
                            {isCorrectOption && (
                              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#15803D' }}>
                                Correct Answer
                              </span>
                            )}
                            {isSelected && !isCorrectOption && (
                              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#B91C1C' }}>
                                Your Answer
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Verified Explanation */}
                    <div style={{ background: '#FFFFFF', borderRadius: '6px', padding: '0.75rem 0.85rem', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4338CA', marginBottom: '0.2rem' }}>
                        Explanation & Concept:
                      </div>
                      <p style={{ fontSize: '0.84rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                        {item.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
              <button
                id="close-mock-results-btn"
                onClick={onClose}
                style={{
                  background: '#5B4FE9',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.65rem 1.5rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Close & Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================
             VIEW B: ACTIVE TEST TAKING ENVIRONMENT
             ======================================================== */
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            {/* Question Navigation Palette */}
            <div
              style={{
                background: '#F8FAFC',
                borderBottom: '1px solid #E2E8F0',
                padding: '0.75rem 1.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', marginRight: '0.25rem' }}>
                  Questions:
                </span>
                {testData.questions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={q.id}
                      id={`palette-btn-${idx}`}
                      onClick={() => setCurrentIndex(idx)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        border: isCurrent ? '2px solid #5B4FE9' : '1px solid #CBD5E1',
                        background: isCurrent ? '#5B4FE9' : isAnswered ? '#DCFCE7' : '#FFFFFF',
                        color: isCurrent ? '#FFFFFF' : isAnswered ? '#166534' : '#475569',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                Progress: <strong>{answeredCount}</strong> of {testData.questions.length} answered
              </div>
            </div>

            {/* Question Content Area */}
            <div style={{ padding: '1.75rem', flex: 1, overflowY: 'auto' }}>
              {submitError && (
                <div
                  style={{
                    background: '#FEF2F2',
                    border: '1px solid #FCA5A5',
                    color: '#B91C1C',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.85rem',
                    marginBottom: '1rem',
                  }}
                >
                  {submitError}
                </div>
              )}

              {currentQuestion && (
                <div id={`question-card-${currentQuestion.id}`}>
                  {/* Section & Question numbering */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                    <span
                      style={{
                        background: '#EEF2FF',
                        color: '#4338CA',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                      }}
                    >
                      Section: {currentQuestion.section}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                      Question {currentIndex + 1} of {testData.questions.length} ({currentQuestion.marks} mark)
                    </span>
                  </div>

                  {/* Question prompt */}
                  <div
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      color: '#0F172A',
                      lineHeight: 1.6,
                      marginBottom: '1.5rem',
                      padding: '1rem',
                      background: '#F8FAFC',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    {currentQuestion.questionText}
                  </div>

                  {/* Selectable Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {currentQuestion.options.map((opt, optIdx) => {
                      const isSelected = answers[currentQuestion.id] === optIdx;
                      return (
                        <div
                          key={optIdx}
                          id={`option-${currentQuestion.id}-${optIdx}`}
                          onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                          style={{
                            background: isSelected ? '#EEF2FF' : '#FFFFFF',
                            border: isSelected ? '2px solid #5B4FE9' : '1px solid #CBD5E1',
                            borderRadius: '10px',
                            padding: '0.85rem 1.15rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.85rem',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              border: isSelected ? '2px solid #5B4FE9' : '1px solid #94A3B8',
                              background: isSelected ? '#5B4FE9' : '#FFFFFF',
                              color: isSelected ? '#FFFFFF' : '#475569',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </div>
                          <span style={{ fontSize: '0.94rem', color: '#1E293B', lineHeight: 1.4 }}>
                            {opt}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Navigation Toolbar */}
            <div
              style={{
                borderTop: '1px solid #E2E8F0',
                padding: '1rem 1.75rem',
                background: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  id="mock-prev-btn"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: currentIndex === 0 ? '#94A3B8' : '#0F172A',
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>Previous</span>
                </button>

                <button
                  id="mock-next-btn"
                  disabled={currentIndex === testData.questions.length - 1}
                  onClick={() =>
                    setCurrentIndex((prev) => Math.min(testData.questions.length - 1, prev + 1))
                  }
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: currentIndex === testData.questions.length - 1 ? '#94A3B8' : '#0F172A',
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    cursor: currentIndex === testData.questions.length - 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <span>Next</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Submit Test Trigger */}
              <div>
                {!showConfirmSubmit ? (
                  <button
                    id="trigger-submit-mock-btn"
                    onClick={() => setShowConfirmSubmit(true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      background: '#16A34A',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '0.6rem 1.4rem',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Send size={15} />
                    <span>Finish & Submit</span>
                  </button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
                      Submit with {answeredCount}/{testData.questions.length} answered?
                    </span>
                    <button
                      id="cancel-confirm-submit-btn"
                      onClick={() => setShowConfirmSubmit(false)}
                      style={{
                        background: '#F1F5F9',
                        color: '#475569',
                        border: 'none',
                        padding: '0.5rem 0.8rem',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Continue Test
                    </button>
                    <button
                      id="confirm-submit-mock-btn"
                      disabled={isSubmitting}
                      onClick={handleSubmitAnswers}
                      style={{
                        background: '#16A34A',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '0.5rem 1.1rem',
                        borderRadius: '6px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {isSubmitting ? 'Evaluating...' : 'Yes, Submit Now'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
