import React, { useState, useEffect, useRef } from 'react';
import {
  AssessmentPathwayCode,
  PathwayDetailResponse,
  StudentAssessmentAttempt,
  DiagnosticReport,
} from '../assessments.types';
import { AssessmentsService } from '../services/assessments.service';
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Check,
  Loader2,
  X,
  Sparkles,
} from 'lucide-react';

interface AssessmentTakingViewProps {
  pathwayCode: AssessmentPathwayCode;
  initialAccessCode?: string;
  onClose: () => void;
  onCompleted: (report: DiagnosticReport) => void;
}

export const AssessmentTakingView: React.FC<AssessmentTakingViewProps> = ({
  pathwayCode,
  initialAccessCode,
  onClose,
  onCompleted,
}) => {
  // Loading & Step states: 'INSTRUCTIONS' | 'TAKING' | 'SUBMITTING'
  const [stage, setStage] = useState<'LOADING' | 'INSTRUCTIONS' | 'TAKING' | 'SUBMITTING'>('LOADING');
  const [pathwayDetail, setPathwayDetail] = useState<PathwayDetailResponse | null>(null);
  const [attempt, setAttempt] = useState<StudentAssessmentAttempt | null>(null);
  const [accessCodeInput, setAccessCodeInput] = useState<string>(initialAccessCode || '');

  // Taking state
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false);
  const [lastSavedMessage, setLastSavedMessage] = useState<string>('Ready');
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const timerRef = useRef<any>(null);

  // 1. Initial Load: Pathway Definition & Attempt Check
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        setErrorMsg(null);
        // Load pathway details (questions, instructions)
        const defRes = await AssessmentsService.getPathwayDetails(pathwayCode);
        if (!isMounted) return;

        if (defRes.success && defRes.data) {
          setPathwayDetail(defRes.data);

          // Check for existing attempt or start
          const attemptRes = await AssessmentsService.startOrResumeAttempt(
            pathwayCode,
            initialAccessCode
          );

          if (!isMounted) return;

          if (attemptRes.success && attemptRes.data) {
            const att = attemptRes.data;
            setAttempt(att);
            setAnswers(att.answers || {});
            setCurrentIndex(att.currentQuestionIndex || 0);
            setSecondsElapsed(att.timeSpentSeconds || 0);

            // If user already answered some questions, jump straight to taking
            if (Object.keys(att.answers || {}).length > 0) {
              setStage('TAKING');
            } else {
              setStage('INSTRUCTIONS');
            }
          } else {
            setStage('INSTRUCTIONS');
          }
        }
      } catch (err: any) {
        if (!isMounted) return;
        setErrorMsg(err.message || 'Failed to load assessment.');
        setStage('INSTRUCTIONS');
      }
    };

    init();

    return () => {
      isMounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pathwayCode, initialAccessCode]);

  // 2. Timer management when taking
  useEffect(() => {
    if (stage === 'TAKING') {
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  // 3. Auto-Save trigger
  const persistProgress = async (
    newAnswers: Record<string, string>,
    targetIndex: number
  ) => {
    if (!attempt) return;
    setIsAutoSaving(true);
    try {
      await AssessmentsService.saveAttemptProgress(attempt.id, {
        currentQuestionIndex: targetIndex,
        answers: newAnswers,
        timeSpentSeconds: secondsElapsed,
      });
      setLastSavedMessage('Progress saved');
    } catch {
      setLastSavedMessage('Save pending');
    } finally {
      setIsAutoSaving(false);
    }
  };

  // 4. Handle Option Selection
  const handleSelectOption = (questionId: string, optionId: string) => {
    const updated = { ...answers, [questionId]: optionId };
    setAnswers(updated);
    persistProgress(updated, currentIndex);
  };

  // 5. Navigation: Previous Question
  const handlePrev = () => {
    if (currentIndex > 0) {
      const nextIdx = currentIndex - 1;
      setCurrentIndex(nextIdx);
      persistProgress(answers, nextIdx);
    }
  };

  // 6. Navigation: Next Question
  const handleNext = () => {
    if (!pathwayDetail) return;
    const currentQuestion = pathwayDetail.questions[currentIndex];

    // Require selection before next
    if (!answers[currentQuestion.id]) {
      setErrorMsg('Please select an option before advancing.');
      return;
    }

    setErrorMsg(null);

    if (currentIndex < pathwayDetail.questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      persistProgress(answers, nextIdx);
    } else {
      // Last question reached: trigger submit prompt
      setSubmitConfirmOpen(true);
    }
  };

  // 7. Final Submission
  const handleFinalSubmit = async () => {
    if (!attempt || !pathwayDetail) return;
    setSubmitConfirmOpen(false);
    setStage('SUBMITTING');
    setErrorMsg(null);

    try {
      const res = await AssessmentsService.submitAttempt(attempt.id, {
        answers,
        timeSpentSeconds: secondsElapsed,
      });

      if (res.success && res.data) {
        onCompleted(res.data);
      } else {
        throw new Error(res.message || 'Scoring engine error.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed. Please try again.');
      setStage('TAKING');
    }
  };

  // Start attempt from instructions
  const handleStartAttempt = async () => {
    try {
      setErrorMsg(null);
      if (!attempt) {
        const attemptRes = await AssessmentsService.startOrResumeAttempt(
          pathwayCode,
          accessCodeInput || undefined
        );
        if (attemptRes.success && attemptRes.data) {
          setAttempt(attemptRes.data);
          setAnswers(attemptRes.data.answers || {});
          setCurrentIndex(attemptRes.data.currentQuestionIndex || 0);
        }
      }
      setStage('TAKING');
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not start assessment session.');
    }
  };

  if (stage === 'LOADING') {
    return (
      <div className="asmt-taking-overlay">
        <div
          className="asmt-taking-box"
          style={{ padding: '4rem 2rem', textAlign: 'center', alignItems: 'center' }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid #E2E8F0',
              borderTopColor: '#5B4FE9',
              borderRadius: '50%',
              animation: 'asmtSpin 0.8s linear infinite',
              marginBottom: '1rem',
            }}
          />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Initializing Assessment Environment...
          </h3>
          <p style={{ fontSize: '0.86rem', color: '#64748B', marginTop: '0.35rem' }}>
            Preparing questions, psychometric dimensions, and auto-save channels.
          </p>
          <style>{`@keyframes asmtSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // STAGE: INSTRUCTIONS
  if (stage === 'INSTRUCTIONS' && pathwayDetail) {
    return (
      <div className="asmt-taking-overlay">
        <div className="asmt-taking-box" style={{ maxWidth: '720px' }}>
          <div className="asmt-taking-header">
            <div>
              <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#A5B4FC', fontWeight: 700 }}>
                Pre-Assessment Instructions
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.15rem 0 0', color: '#FFFFFF' }}>
                {pathwayDetail.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={20} />
            </button>
          </div>

          <div className="asmt-taking-body">
            {errorMsg && (
              <div
                style={{
                  background: '#FEE2E2',
                  border: '1px solid #FCA5A5',
                  color: '#DC2626',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.84rem',
                  marginBottom: '1.25rem',
                }}
              >
                {errorMsg}
              </div>
            )}

            <p style={{ fontSize: '0.94rem', color: '#475569', lineHeight: 1.55, margin: '0 0 1.25rem' }}>
              {pathwayDetail.tagline}
            </p>

            {/* Quick Metrics */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.85rem', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>Questions</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                  {pathwayDetail.questions.length}
                </div>
              </div>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.85rem', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>Est. Time</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                  ~{pathwayDetail.estimatedMinutes} mins
                </div>
              </div>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.85rem', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>Dimensions</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                  {pathwayDetail.dimensions.length}
                </div>
              </div>
            </div>

            {/* Key Instructions List */}
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.65rem' }}>
              Guidelines for Best Accuracy:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {pathwayDetail.instructions.map((inst, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.84rem', color: '#334155' }}>
                  <CheckCircle2 size={16} color="#5B4FE9" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{inst}</span>
                </div>
              ))}
            </div>

            {/* Optional Access Code field */}
            <div
              style={{
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                padding: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.4rem' }}>
                Counsellor Access Code (Optional if assigned):
              </label>
              <input
                type="text"
                placeholder="e.g. SC-STREAM-2026 or counsellor code"
                value={accessCodeInput}
                onChange={(e) => setAccessCodeInput(e.target.value.toUpperCase())}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #94A3B8',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              />
            </div>

            {/* Disclaimer Alert */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                fontSize: '0.76rem',
                color: '#64748B',
                lineHeight: 1.45,
              }}
            >
              <strong>Notice:</strong> {pathwayDetail.limitationsDisclaimer}
            </div>
          </div>

          <div className="asmt-taking-footer">
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: '1px solid #CBD5E1',
                color: '#475569',
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.86rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleStartAttempt}
              style={{
                background: 'linear-gradient(135deg, #5B4FE9 0%, #4338CA 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.65rem 1.75rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 10px rgba(91, 79, 233, 0.25)',
              }}
              id="btn-begin-assessment"
            >
              <span>Begin Assessment</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STAGE: SUBMITTING
  if (stage === 'SUBMITTING') {
    return (
      <div className="asmt-taking-overlay">
        <div
          className="asmt-taking-box"
          style={{ padding: '4rem 2rem', textAlign: 'center', alignItems: 'center' }}
        >
          <div
            style={{
              width: '45px',
              height: '45px',
              border: '3px solid #E2E8F0',
              borderTopColor: '#10B981',
              borderRadius: '50%',
              animation: 'asmtSpin 0.8s linear infinite',
              marginBottom: '1.25rem',
            }}
          />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Scoring Your Assessment Responses...
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#64748B', marginTop: '0.45rem', maxWidth: '480px' }}>
            Executing multi-dimensional psychometric aggregation, cross-referencing interest clusters, and formulating career guidance insights.
          </p>
          <style>{`@keyframes asmtSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // STAGE: TAKING
  if (!pathwayDetail) return null;

  const totalQ = pathwayDetail.questions.length;
  const currentQ = pathwayDetail.questions[currentIndex];
  const progressPct = Math.round(((currentIndex + 1) / totalQ) * 100);
  const selectedOptionId = currentQ ? answers[currentQ.id] : undefined;
  const isFinalQuestion = currentIndex === totalQ - 1;

  return (
    <div className="asmt-taking-overlay">
      <div className="asmt-taking-box">
        {/* Top Assessment Header */}
        <div className="asmt-taking-header">
          <div>
            <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#A5B4FC', fontWeight: 700 }}>
              {pathwayDetail.title}
            </div>
            <div style={{ fontSize: '0.84rem', color: '#E2E8F0', marginTop: '0.1rem' }}>
              Question <strong>{currentIndex + 1}</strong> of <strong>{totalQ}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* Auto-save status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', color: '#94A3B8' }}>
              {isAutoSaving ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={13} color="#4ADE80" />
                  <span>{lastSavedMessage}</span>
                </>
              )}
            </div>

            {/* Live timer */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#FFFFFF',
              }}
            >
              <Clock size={14} color="#A78BFA" />
              <span>{formatTime(secondsElapsed)}</span>
            </div>

            {/* Exit button */}
            <button
              onClick={onClose}
              title="Save & Exit to Dashboard"
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="asmt-progress-track">
          <div className="asmt-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>

        {/* Interactive Question Body */}
        <div className="asmt-taking-body">
          {errorMsg && (
            <div
              style={{
                background: '#FEE2E2',
                border: '1px solid #FCA5A5',
                color: '#DC2626',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                fontSize: '0.84rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {currentQ.categoryOrSection && (
            <div className="asmt-q-category">
              <Sparkles size={13} />
              <span>{currentQ.categoryOrSection}</span>
            </div>
          )}

          <h3 className="asmt-q-prompt">{currentQ.prompt}</h3>

          {/* Render by Control Type: SINGLE_CHOICE vs LIKERT_5 */}
          {currentQ.controlType === 'LIKERT_5' ? (
            <div>
              <div style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '0.75rem', fontWeight: 600 }}>
                Select rating on 1–5 scale:
              </div>
              <div className="asmt-likert-grid">
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = selectedOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`asmt-likert-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectOption(currentQ.id, opt.id)}
                    >
                      <div className="asmt-likert-num">{oIdx + 1}</div>
                      <div className="asmt-likert-text">{opt.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="asmt-options-list">
              {currentQ.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <div
                    key={opt.id}
                    className={`asmt-opt-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectOption(currentQ.id, opt.id)}
                  >
                    <div className="asmt-opt-radio-circle">
                      {isSelected && <div className="asmt-opt-radio-dot" />}
                    </div>
                    <div className="asmt-opt-label">{opt.label}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="asmt-taking-footer">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            style={{
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: currentIndex === 0 ? '#94A3B8' : '#334155',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.86rem',
              cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <ArrowLeft size={16} />
            <span>Previous</span>
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '0.65rem 0.85rem',
              }}
            >
              Save & Exit
            </button>

            {isFinalQuestion ? (
              <button
                onClick={handleNext}
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.65rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)',
                }}
                id="btn-submit-assessment-step"
              >
                <span>Complete & Submit</span>
                <CheckCircle2 size={16} />
              </button>
            ) : (
              <button
                onClick={handleNext}
                style={{
                  background: 'linear-gradient(135deg, #5B4FE9 0%, #4338CA 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.65rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 10px rgba(91, 79, 233, 0.25)',
                }}
                id="btn-next-question"
              >
                <span>Next Question</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal to Prevent Accidental Submission */}
      {submitConfirmOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: '#DCFCE7',
                color: '#16A34A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <CheckCircle2 size={24} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem' }}>
              Submit Assessment?
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5, margin: '0 0 1.5rem' }}>
              You have answered all <strong>{totalQ}</strong> questions. Once submitted, your diagnostic report will be calculated and saved to your student profile.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setSubmitConfirmOpen(false)}
                style={{
                  flex: 1,
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: '#475569',
                  padding: '0.65rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                }}
              >
                Review Answers
              </button>
              <button
                onClick={handleFinalSubmit}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.65rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                }}
                id="btn-confirm-submit-assessment"
              >
                Confirm & Score
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
