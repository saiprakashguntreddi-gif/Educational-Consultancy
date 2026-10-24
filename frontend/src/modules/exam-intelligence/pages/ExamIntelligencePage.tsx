import React, { useState, useEffect } from 'react';
import {
  Award,
  Calendar,
  Clock,
  PlayCircle,
  Building2,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  ArrowLeft,
  X,
  Target,
} from 'lucide-react';
import {
  ExamIntelligenceOverview,
  RecommendedExamItem,
  StudentExamPlanRecord,
  StudentMockAttemptRecord,
  MockTestEvaluationResult,
  ExamPlanStatus,
} from '../exam-intelligence.types';
import { ExamIntelligenceService } from '../services/exam-intelligence.service';
import { CollegeExamMatcher } from '../components/CollegeExamMatcher';
import { ExamDetailsModal } from '../components/ExamDetailsModal';
import { PreparationPathModal } from '../components/PreparationPathModal';
import { DeadlineChecklistView } from '../components/DeadlineChecklistView';
import { TimedMockTestEngineModal } from '../components/TimedMockTestEngineModal';
import { MockTestResultModal } from '../components/MockTestResultModal';
import { StudentExamPlanTracker } from '../components/StudentExamPlanTracker';

interface ExamIntelligencePageProps {
  onNavigateHome?: () => void;
  onNavigateDashboard?: () => void;
}

export const ExamIntelligencePage: React.FC<ExamIntelligencePageProps> = ({
  onNavigateHome,
  onNavigateDashboard,
}) => {
  // Navigation tabs: 'intelligence' | 'plan' | 'mocks' | 'deadlines'
  const [activeTab, setActiveTab] = useState<'intelligence' | 'plan' | 'mocks' | 'deadlines'>(
    'intelligence'
  );

  // Data state
  const [overview, setOverview] = useState<ExamIntelligenceOverview | null>(null);
  const [plans, setPlans] = useState<StudentExamPlanRecord[]>([]);
  const [mockAttempts, setMockAttempts] = useState<StudentMockAttemptRecord[]>([]);
  const [availableMocks, setAvailableMocks] = useState<{ examName: string; examCode: string; mock: any }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Active Modals
  const [selectedExamForDetail, setSelectedExamForDetail] = useState<RecommendedExamItem | null>(null);
  const [selectedExamForPrep, setSelectedExamForPrep] = useState<RecommendedExamItem | null>(null);
  const [activeMockTestId, setActiveMockTestId] = useState<string | null>(null);
  const [evalResult, setEvalResult] = useState<MockTestEvaluationResult | null>(null);

  // Add / Edit Plan Modal
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlanItem, setEditingPlanItem] = useState<StudentExamPlanRecord | null>(null);
  const [selectedExamForPlan, setSelectedExamForPlan] = useState<string>('');
  const [planStatus, setPlanStatus] = useState<ExamPlanStatus>('PLANNED');
  const [planTargetDate, setPlanTargetDate] = useState<string>('');
  const [planTargetScore, setPlanTargetScore] = useState<string>('');
  const [planCurrentScore, setPlanCurrentScore] = useState<string>('');
  const [planNotes, setPlanNotes] = useState<string>('');
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  // Load all data
  const loadAllData = async () => {
    setIsLoading(true);
    setFeedback(null);

    try {
      // 1. Fetch Overview (College Requirements, Recommended Exams, Deadlines)
      const overviewRes = await ExamIntelligenceService.getOverview();
      if (overviewRes.success && overviewRes.data) {
        setOverview(overviewRes.data);

        // Fetch mock tests for exams with mock tests in parallel
        const mockExams = overviewRes.data.recommendedExams.filter((e) => e.hasMockTest);
        const mockPromises = mockExams.map(async (exam) => {
          try {
            const res = await ExamIntelligenceService.getMockTestsForExam(exam.examId);
            if (res.success && Array.isArray(res.data)) {
              return res.data.map((m) => ({
                examName: exam.name,
                examCode: exam.code,
                mock: m,
              }));
            }
          } catch {
            // Soft fail
          }
          return [];
        });
        const mockResults = await Promise.all(mockPromises);
        setAvailableMocks(mockResults.flat());
      }

      // 2. Fetch Personal Plan
      const planRes = await ExamIntelligenceService.getMyPlan();
      if (planRes.success && planRes.data) {
        const raw = planRes.data;
        const items: StudentExamPlanRecord[] = Array.isArray(raw)
          ? raw
          : Array.isArray((raw as any).items)
          ? (raw as any).items
          : [];
        setPlans(items);
      }

      // 3. Fetch Mock Attempts History
      const attemptsRes = await ExamIntelligenceService.getMyMockAttempts();
      if (attemptsRes.success && Array.isArray(attemptsRes.data)) {
        setMockAttempts(attemptsRes.data);
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to load exam intelligence data.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Modal Open Handlers
  const handleOpenAddPlan = (exam?: RecommendedExamItem) => {
    setEditingPlanItem(null);
    setSelectedExamForPlan(exam ? exam.examId : overview?.recommendedExams[0]?.examId || '');
    setPlanStatus('PLANNED');
    setPlanTargetDate('');
    setPlanTargetScore('');
    setPlanCurrentScore('');
    setPlanNotes('');
    setIsPlanModalOpen(true);
  };

  const handleOpenEditPlan = (plan: StudentExamPlanRecord) => {
    setEditingPlanItem(plan);
    setSelectedExamForPlan(plan.examId);
    setPlanStatus(plan.status);
    setPlanTargetDate(plan.targetDate || '');
    setPlanTargetScore(plan.targetScore || '');
    setPlanCurrentScore(plan.currentScore || '');
    setPlanNotes(plan.notes || '');
    setIsPlanModalOpen(true);
  };

  const handleDeletePlan = async (planId: string) => {
    if (!window.confirm('Are you sure you want to remove this exam from your personal plan?')) {
      return;
    }
    try {
      const res = await ExamIntelligenceService.removePlanItem(planId);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Exam plan removed.' });
        loadAllData();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete plan item.' });
    }
  };

  const handleSavePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamForPlan) return;

    try {
      setIsSavingPlan(true);
      if (editingPlanItem) {
        // Update
        const res = await ExamIntelligenceService.updatePlanItem(editingPlanItem.id, {
          status: planStatus,
          targetDate: planTargetDate || undefined,
          targetScore: planTargetScore || undefined,
          currentScore: planCurrentScore || undefined,
          notes: planNotes || undefined,
        });
        if (res.success) {
          setFeedback({ type: 'success', message: 'Exam plan updated successfully.' });
          setIsPlanModalOpen(false);
          loadAllData();
        } else {
          alert(res.message || 'Failed to update plan.');
        }
      } else {
        // Save new
        const res = await ExamIntelligenceService.savePlanItem({
          examId: selectedExamForPlan,
          status: planStatus,
          targetDate: planTargetDate || undefined,
          targetScore: planTargetScore || undefined,
          notes: planNotes || undefined,
        });
        if (res.success) {
          setFeedback({ type: 'success', message: 'Exam added to personal plan.' });
          setIsPlanModalOpen(false);
          loadAllData();
        } else {
          alert(res.message || 'Failed to save plan.');
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save plan.');
    } finally {
      setIsSavingPlan(false);
    }
  };

  // Launch mock test
  const handleLaunchMock = (exam: RecommendedExamItem) => {
    // Find mock test ID for this exam
    const found = availableMocks.find((m) => m.examCode === exam.code);
    if (found && found.mock?.id) {
      setActiveMockTestId(found.mock.id);
    } else {
      setFeedback({
        type: 'error',
        message: `Diagnostic mock test questions are currently not configured for ${exam.name}.`,
      });
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 120px)',
        width: '100%',
        backgroundColor: '#F8FAFC',
        padding: '2rem clamp(1rem, 2.5vw, 2.25rem) 4rem clamp(1rem, 2.5vw, 2.25rem)',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: '1360px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
        {/* Feedback Alert */}
        {feedback && (
          <div
            style={{
              padding: '0.85rem 1.25rem',
              borderRadius: '10px',
              background: feedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
              border: feedback.type === 'success' ? '1px solid #A7F3D0' : '1px solid #FECACA',
              color: feedback.type === 'success' ? '#065F46' : '#991B1B',
              fontSize: '0.875rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Header Card */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '1.75rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div style={{ maxWidth: '840px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.725rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#4F46E5',
                background: 'rgba(79, 70, 229, 0.08)',
                border: '1px solid rgba(79, 70, 229, 0.2)',
                padding: '0.25rem 0.65rem',
                borderRadius: '6px',
                marginBottom: '0.5rem',
              }}
            >
              <Award size={14} /> MODULE 10 • ENTRANCE EXAM INTELLIGENCE & MOCK TESTS
            </div>
            <h1
              style={{
                fontSize: 'clamp(1.4rem, 1.8vw, 1.85rem)',
                fontWeight: 800,
                color: '#0F172A',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Standardized Entrance Exam Intelligence & Mock Tests
            </h1>
            <p style={{ fontSize: '0.92rem', color: '#64748B', margin: '0.35rem 0 0 0', lineHeight: 1.55 }}>
              Give students one place to understand required tests and plan preparation. Connect shortlisted college requirements, review format and study guidance, follow verified registration routes, and test readiness with timed diagnostic mock exams.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.15rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#475569',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={16} />
                <span>Back to Home</span>
              </button>
            )}

            {onNavigateDashboard && (
              <button
                onClick={onNavigateDashboard}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.15rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#475569',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={16} />
                <span>Student Dashboard</span>
              </button>
            )}

            <button
              onClick={() => handleOpenAddPlan()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.35rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#FFFFFF',
                background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
              }}
            >
              <Plus size={16} />
              <span>+ Add Exam to Plan</span>
            </button>
          </div>
        </div>

        {/* Overview Stats Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Shortlisted Colleges</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
              {overview?.shortlistedCollegesCount ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#4F46E5', fontWeight: 600, marginTop: '2px' }}>
              Admission criteria analyzed
            </div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Required Tests</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#4F46E5', marginTop: '4px' }}>
              {overview?.totalRequiredExamsCount ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
              Matched across programs
            </div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Active Plans</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
              {plans.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
              {overview?.studentPlanSummary.totalPreparing ?? 0} In Preparation
            </div>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Diagnostic Mocks Taken</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
              {mockAttempts.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
              Saved performance records
            </div>
          </div>
        </div>

        {/* Tab Controls Bar */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '0.75rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('intelligence')}
              style={{
                padding: '0.55rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: '8px',
                border: '1px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: activeTab === 'intelligence' ? '#0F172A' : '#F1F5F9',
                color: activeTab === 'intelligence' ? '#FFFFFF' : '#475569',
              }}
            >
              <Building2 size={15} /> Admissions Intelligence ({overview?.recommendedExams.length ?? 0})
            </button>

            <button
              onClick={() => setActiveTab('plan')}
              style={{
                padding: '0.55rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: '8px',
                border: '1px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: activeTab === 'plan' ? '#0F172A' : '#F1F5F9',
                color: activeTab === 'plan' ? '#FFFFFF' : '#475569',
              }}
            >
              <Target size={15} /> My Exam Plan ({plans.length})
            </button>

            <button
              onClick={() => setActiveTab('mocks')}
              style={{
                padding: '0.55rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: '8px',
                border: '1px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: activeTab === 'mocks' ? '#0F172A' : '#F1F5F9',
                color: activeTab === 'mocks' ? '#FFFFFF' : '#475569',
              }}
            >
              <PlayCircle size={15} /> Mock Tests & Diagnostics ({availableMocks.length})
            </button>

            <button
              onClick={() => setActiveTab('deadlines')}
              style={{
                padding: '0.55rem 1rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: '8px',
                border: '1px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: activeTab === 'deadlines' ? '#0F172A' : '#F1F5F9',
                color: activeTab === 'deadlines' ? '#FFFFFF' : '#475569',
              }}
            >
              <Calendar size={15} /> Deadline Checklist ({overview?.upcomingDeadlines.length ?? 0})
            </button>
          </div>

          <button
            onClick={() => loadAllData()}
            disabled={isLoading}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#475569',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748B' }}>
            <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 0.75rem auto', color: '#6366F1' }} />
            <div style={{ fontWeight: 600 }}>Loading standardized examination intelligence...</div>
          </div>
        )}

        {/* Tab 1: Intelligence & College Requirements */}
        {!isLoading && activeTab === 'intelligence' && overview && (
          <CollegeExamMatcher
            collegeRequirements={overview.collegeRequirements}
            recommendedExams={overview.recommendedExams}
            onOpenExamDetail={(exam) => setSelectedExamForDetail(exam)}
            onOpenPrepPlan={(exam) => setSelectedExamForPrep(exam)}
            onLaunchMockTest={(exam) => handleLaunchMock(exam)}
            onAddToPlan={(exam) => handleOpenAddPlan(exam)}
          />
        )}

        {/* Tab 2: Personal Plan & Follow-up */}
        {!isLoading && activeTab === 'plan' && overview && (
          <StudentExamPlanTracker
            plans={plans}
            allExams={overview.recommendedExams}
            onAddPlanItem={() => handleOpenAddPlan()}
            onEditPlanItem={(plan) => handleOpenEditPlan(plan)}
            onDeletePlanItem={(id) => handleDeletePlan(id)}
          />
        )}

        {/* Tab 3: Mock Tests & Diagnostics */}
        {!isLoading && activeTab === 'mocks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Available Mocks Card */}
            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(79, 70, 229, 0.08)', padding: '0.2rem 0.6rem', borderRadius: '6px', marginBottom: '0.35rem' }}>
                  <PlayCircle size={13} /> Step 5: Diagnostic Mock Tests
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Timed Diagnostic Mock Test Catalog
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
                  Complete standardized timed mock examinations under test-day conditions. Questions and scoring algorithms follow official testing standards.
                </p>
              </div>

              {availableMocks.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1' }}>
                  <PlayCircle size={36} color="#94A3B8" style={{ margin: '0 auto 0.75rem auto' }} />
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', margin: '0 0 0.25rem 0' }}>
                    No Mock Tests Available
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
                    Official diagnostic mock tests are being configured. Check back soon.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                  {availableMocks.map(({ examName: _examName, examCode, mock }) => (
                    <div
                      key={mock.id}
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
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', background: '#EEF2FF', color: '#4F46E5' }}>
                            {examCode}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={13} /> {mock.durationMinutes} min
                          </span>
                        </div>

                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.35rem 0' }}>
                          {mock.title}
                        </h4>
                        <p style={{ fontSize: '0.825rem', color: '#64748B', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
                          {mock.description}
                        </p>
                      </div>

                      <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#1E293B' }}>
                          {mock.totalMarks} Marks
                        </span>

                        <button
                          onClick={() => setActiveMockTestId(mock.id)}
                          style={{
                            padding: '0.5rem 1.15rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            fontSize: '0.825rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
                          }}
                        >
                          <PlayCircle size={15} /> Launch Mock Test
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Attempts History */}
            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.25rem 0' }}>
                Your Diagnostic Performance History
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 1.25rem 0' }}>
                Review past mock scores, pacing times, and diagnostic benchmarks over time.
              </p>

              {mockAttempts.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', background: '#F8FAFC', borderRadius: '12px', border: '1px dashed #CBD5E1', color: '#64748B', fontSize: '0.875rem' }}>
                  No mock test attempts recorded yet. Launch any of the diagnostic tests above to receive your baseline score.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase' }}>Mock Test</th>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase' }}>Exam</th>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase' }}>Score</th>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase' }}>Accuracy %</th>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase' }}>Time Taken</th>
                        <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockAttempts.map((attempt) => (
                        <tr key={attempt.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '0.95rem 1rem', fontWeight: 600, color: '#0F172A' }}>
                            {attempt.mockTest.title}
                          </td>
                          <td style={{ padding: '0.95rem 1rem' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', background: '#EEF2FF', color: '#4F46E5' }}>
                              {attempt.mockTest.exam.code}
                            </span>
                          </td>
                          <td style={{ padding: '0.95rem 1rem', fontWeight: 700, color: '#1E293B' }}>
                            {attempt.score} / {attempt.totalMarks}
                          </td>
                          <td style={{ padding: '0.95rem 1rem' }}>
                            <span style={{ fontWeight: 700, color: attempt.percentage >= 70 ? '#059669' : '#D97706' }}>
                              {attempt.percentage}%
                            </span>
                          </td>
                          <td style={{ padding: '0.95rem 1rem', color: '#64748B' }}>
                            {Math.floor(attempt.timeSpentSeconds / 60)}m {attempt.timeSpentSeconds % 60}s
                          </td>
                          <td style={{ padding: '0.95rem 1rem', color: '#64748B' }}>
                            {new Date(attempt.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Deadline Checklist */}
        {!isLoading && activeTab === 'deadlines' && overview && (
          <DeadlineChecklistView deadlines={overview.upcomingDeadlines} />
        )}
      </div>

      {/* MODAL 1: EXAM DETAILS */}
      {selectedExamForDetail && (
        <ExamDetailsModal
          examItem={selectedExamForDetail}
          onClose={() => setSelectedExamForDetail(null)}
          onOpenPrepPlan={(exam) => setSelectedExamForPrep(exam)}
          onLaunchMockTest={(exam) => handleLaunchMock(exam)}
        />
      )}

      {/* MODAL 2: PREPARATION PATH */}
      {selectedExamForPrep && (
        <PreparationPathModal
          examItem={selectedExamForPrep}
          onClose={() => setSelectedExamForPrep(null)}
          onLaunchMockTest={(exam) => handleLaunchMock(exam)}
        />
      )}

      {/* MODAL 3: TIMED MOCK TEST ENGINE */}
      {activeMockTestId && (
        <TimedMockTestEngineModal
          testId={activeMockTestId}
          onClose={() => setActiveMockTestId(null)}
          onTestEvaluated={(result) => {
            setActiveMockTestId(null);
            setEvalResult(result);
            loadAllData();
          }}
        />
      )}

      {/* MODAL 4: MOCK TEST EVALUATION RESULT */}
      {evalResult && (
        <MockTestResultModal
          result={evalResult}
          onClose={() => setEvalResult(null)}
        />
      )}

      {/* MODAL 5: ADD / EDIT EXAM PLAN */}
      {isPlanModalOpen && (
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
          onClick={() => setIsPlanModalOpen(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              width: '100%',
              maxWidth: '560px',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Target size={18} color="#4F46E5" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {editingPlanItem ? 'Edit Personal Exam Plan' : 'Add Entrance Exam to Plan'}
                </h3>
              </div>
              <button onClick={() => setIsPlanModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0.4rem', display: 'flex' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePlanSubmit} style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Select Entrance Exam *
                </label>
                <select
                  disabled={!!editingPlanItem}
                  value={selectedExamForPlan}
                  onChange={(e) => setSelectedExamForPlan(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.8rem',
                    fontSize: '0.85rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    background: editingPlanItem ? '#F1F5F9' : '#F8FAFC',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                  }}
                >
                  {overview?.recommendedExams.map((e) => (
                    <option key={e.examId} value={e.examId}>
                      {e.name} ({e.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Preparation Status *
                </label>
                <select
                  value={planStatus}
                  onChange={(e) => setPlanStatus(e.target.value as ExamPlanStatus)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.8rem',
                    fontSize: '0.85rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    background: '#F8FAFC',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="PLANNED">Planned (Evaluating test date)</option>
                  <option value="PREPARING">In Preparation (Actively studying)</option>
                  <option value="REGISTERED">Registered & Scheduled (Slot booked)</option>
                  <option value="COMPLETED">Completed (Score received)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Target Test Date
                  </label>
                  <input
                    type="date"
                    value={planTargetDate}
                    onChange={(e) => setPlanTargetDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.8rem',
                      fontSize: '0.85rem',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      background: '#F8FAFC',
                      color: '#0F172A',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Target Score
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1500, 8.0, 325"
                    value={planTargetScore}
                    onChange={(e) => setPlanTargetScore(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.8rem',
                      fontSize: '0.85rem',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      background: '#F8FAFC',
                      color: '#0F172A',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {planStatus === 'COMPLETED' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#065F46', marginBottom: '0.35rem' }}>
                    Achieved Official Score
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1480"
                    value={planCurrentScore}
                    onChange={(e) => setPlanCurrentScore(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.8rem',
                      fontSize: '0.85rem',
                      border: '1px solid #A7F3D0',
                      borderRadius: '8px',
                      background: '#ECFDF5',
                      color: '#065F46',
                      fontWeight: 700,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                  Personal Study Notes / Counsellor Goals
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Taking diagnostic mock next week; focus on reading pacing and vocabulary..."
                  value={planNotes}
                  onChange={(e) => setPlanNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.8rem',
                    fontSize: '0.85rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    background: '#F8FAFC',
                    color: '#0F172A',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
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
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPlan}
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  {isSavingPlan ? 'Saving...' : editingPlanItem ? 'Update Plan' : 'Save to Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
