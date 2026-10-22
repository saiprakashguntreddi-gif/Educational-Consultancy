import React, { useState, useEffect } from 'react';
import {
  AssessmentPathwayCode,
  PathwayItem,
  DiagnosticReport,
} from '../assessments.types';
import { AssessmentsService } from '../services/assessments.service';
import { AssessmentTakingView } from './AssessmentTakingView';
import { DiagnosticReportView } from './DiagnosticReportView';
import '../assessments.css';
import {
  Award,
  BookOpen,
  GraduationCap,
  Users,
  Sparkles,
  Layers,
  Briefcase,
  ShieldCheck,
  Target,
  Clock,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  Key,
  RotateCcw,
  ArrowLeft,
  Search,
} from 'lucide-react';

interface EightPathwayAssessmentSuiteProps {
  onBackToDashboard?: () => void;
  initialSelectedPathway?: AssessmentPathwayCode;
}

export const EightPathwayAssessmentSuite: React.FC<EightPathwayAssessmentSuiteProps> = ({
  onBackToDashboard,
  initialSelectedPathway,
}) => {
  const [pathways, setPathways] = useState<PathwayItem[]>([]);
  const [disclaimer, setDisclaimer] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'STREAMS' | 'PERSONALITY' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Access Code state
  const [accessCodeInput, setAccessCodeInput] = useState<string>('');
  const [accessCodeFeedback, setAccessCodeFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isVerifyingCode, setIsVerifyingCode] = useState<boolean>(false);

  // Active Session / View States
  const [takingPathway, setTakingPathway] = useState<AssessmentPathwayCode | null>(
    initialSelectedPathway || null
  );
  const [activeAccessCode, setActiveAccessCode] = useState<string | undefined>(undefined);
  const [activeReport, setActiveReport] = useState<DiagnosticReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false);

  // Load Catalog from Backend
  const loadCatalog = async () => {
    setIsLoading(true);
    try {
      const res = await AssessmentsService.listPathways();
      if (res.success && res.data) {
        setPathways(res.data.pathways);
        setDisclaimer(res.data.disclaimer);
      }
    } catch (err: any) {
      console.error('Failed to load assessment pathways:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  // Handle Verify Access Code
  const handleVerifyAccessCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!accessCodeInput.trim()) return;

    setIsVerifyingCode(true);
    setAccessCodeFeedback(null);

    try {
      const res = await AssessmentsService.verifyAccessCode(accessCodeInput.trim());
      if (res.success && res.data && res.data.valid) {
        const verifiedData = res.data;
        setAccessCodeFeedback({
          type: 'success',
          message: `Access Code Verified! Unlocked for ${verifiedData.pathwayCode}. Starting test...`,
        });
        setActiveAccessCode(verifiedData.code);

        // If specific pathway, open it
        if (verifiedData.pathwayCode && (verifiedData.pathwayCode as string) !== 'ALL_PATHWAYS') {
          setTimeout(() => {
            setTakingPathway(verifiedData.pathwayCode as AssessmentPathwayCode);
            setAccessCodeFeedback(null);
          }, 600);
        }
      } else {
        setAccessCodeFeedback({
          type: 'error',
          message: res.message || 'Invalid or expired access code.',
        });
      }
    } catch (err: any) {
      setAccessCodeFeedback({
        type: 'error',
        message: err.message || 'Verification failed. Please check your code.',
      });
    } finally {
      setIsVerifyingCode(false);
    }
  };

  // Open Diagnostic Report
  const handleOpenReport = async (reportId: string) => {
    setIsLoadingReport(true);
    try {
      const res = await AssessmentsService.getReport(reportId);
      if (res.success && res.data) {
        setActiveReport(res.data);
      }
    } catch (err: any) {
      alert(`Could not load report: ${err.message}`);
    } finally {
      setIsLoadingReport(false);
    }
  };

  // Return specific icon & accent gradient for each pathway
  const getPathwayVisuals = (code: AssessmentPathwayCode) => {
    switch (code) {
      case 'LEARNING_STYLE':
        return {
          icon: <BookOpen size={24} />,
          gradient: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
          category: 'PERSONALITY',
        };
      case 'POST_10TH_STREAM':
        return {
          icon: <GraduationCap size={24} />,
          gradient: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
          category: 'STREAMS',
        };
      case 'CAREER_PERSONALITY':
        return {
          icon: <Users size={24} />,
          gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
          category: 'PERSONALITY',
        };
      case 'MULTIPLE_INTELLIGENCES':
        return {
          icon: <Sparkles size={24} />,
          gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
          category: 'PERSONALITY',
        };
      case 'ENGINEERING_BRANCH':
        return {
          icon: <Layers size={24} />,
          gradient: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
          category: 'STREAMS',
        };
      case 'MANAGEMENT_COMMERCE':
        return {
          icon: <Briefcase size={24} />,
          gradient: 'linear-gradient(135deg, #06B6D4 0%, #0E7490 100%)',
          category: 'STREAMS',
        };
      case 'HUMANITIES_LAW_POLICY':
        return {
          icon: <ShieldCheck size={24} />,
          gradient: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
          category: 'STREAMS',
        };
      case 'COGNITIVE_PROBLEM_SOLVING':
        return {
          icon: <Target size={24} />,
          gradient: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
          category: 'PERSONALITY',
        };
      default:
        return {
          icon: <Award size={24} />,
          gradient: 'linear-gradient(135deg, #5B4FE9 0%, #4338CA 100%)',
          category: 'ALL',
        };
    }
  };

  // Filter pathways based on tabs & search
  const filteredPathways = pathways.filter((p) => {
    const visuals = getPathwayVisuals(p.code);
    if (activeTab === 'STREAMS' && visuals.category !== 'STREAMS') return false;
    if (activeTab === 'PERSONALITY' && visuals.category !== 'PERSONALITY') return false;
    if (activeTab === 'COMPLETED' && p.status !== 'COMPLETED') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchTag = p.tagline.toLowerCase().includes(q);
      const matchDim = p.dimensions.some((d) => d.label.toLowerCase().includes(q));
      if (!matchTitle && !matchTag && !matchDim) return false;
    }

    return true;
  });

  // Render taking session
  if (takingPathway) {
    return (
      <AssessmentTakingView
        pathwayCode={takingPathway}
        initialAccessCode={activeAccessCode}
        onClose={() => {
          setTakingPathway(null);
          loadCatalog();
        }}
        onCompleted={(report) => {
          setTakingPathway(null);
          setActiveReport(report);
          loadCatalog();
        }}
      />
    );
  }

  // Render single report view
  if (activeReport) {
    return (
      <DiagnosticReportView
        report={activeReport}
        onBack={() => {
          setActiveReport(null);
          loadCatalog();
        }}
        onRetake={() => {
          const code = activeReport.pathwayCode;
          setActiveReport(null);
          setTakingPathway(code);
        }}
      />
    );
  }

  return (
    <div className="asmt-suite-container">
      {/* Back to Dashboard Link (if inside Student Command Center) */}
      {onBackToDashboard && (
        <div>
          <button
            onClick={onBackToDashboard}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'none',
              border: 'none',
              color: '#5B4FE9',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0,
            }}
            id="asmt-back-to-dashboard-btn"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
        </div>
      )}

      {/* 1. HERO BANNER */}
      <div className="asmt-hero-card">
        <h1 className="asmt-hero-title">
          Eight-Pathway Psychometric & Aptitude Diagnostic Suite
        </h1>
        <p className="asmt-hero-subtitle">
          Reduce career ambiguity by combining interests, learning preferences, aptitude, and problem-solving evidence into verified diagnostic roadmaps with counsellor oversight.
        </p>
      </div>

      {/* 2. CONTROLLED ACCESS CODE UNLOCK BAR */}
      <div className="asmt-access-code-bar">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.94rem', fontWeight: 700, color: '#0F172A' }}>
            <Key size={17} color="#5B4FE9" />
            <span>Counsellor Access Code Verification</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.15rem' }}>
            Have a controlled access token from your educational advisor? Unlock assigned diagnostic pathways.
          </div>
        </div>

        <form onSubmit={handleVerifyAccessCode} className="asmt-code-input-group">
          <input
            type="text"
            className="asmt-code-input"
            placeholder="e.g. SC-STREAM-2026"
            value={accessCodeInput}
            onChange={(e) => setAccessCodeInput(e.target.value.toUpperCase())}
            id="input-counsellor-access-code"
          />
          <button
            type="submit"
            disabled={isVerifyingCode || !accessCodeInput.trim()}
            style={{
              background: 'linear-gradient(135deg, #5B4FE9 0%, #4338CA 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.86rem',
              fontWeight: 700,
              cursor: isVerifyingCode || !accessCodeInput.trim() ? 'not-allowed' : 'pointer',
              opacity: isVerifyingCode || !accessCodeInput.trim() ? 0.7 : 1,
            }}
            id="btn-verify-access-code"
          >
            {isVerifyingCode ? 'Verifying...' : 'Unlock & Start'}
          </button>
        </form>

        {accessCodeFeedback && (
          <div
            style={{
              width: '100%',
              padding: '0.6rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.82rem',
              background: accessCodeFeedback.type === 'success' ? '#DCFCE7' : '#FEE2E2',
              color: accessCodeFeedback.type === 'success' ? '#15803D' : '#DC2626',
              border: `1px solid ${accessCodeFeedback.type === 'success' ? '#86EFAC' : '#FCA5A5'}`,
            }}
          >
            {accessCodeFeedback.message}
          </div>
        )}
      </div>

      {/* 3. TABS & SEARCH BAR */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div className="asmt-tabs-row">
          <button
            className={`asmt-tab-btn ${activeTab === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveTab('ALL')}
            id="tab-all-pathways"
          >
            <span>All Pathways</span>
            <span style={{ fontSize: '0.74rem', background: 'rgba(0,0,0,0.06)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
              {pathways.length}
            </span>
          </button>

          <button
            className={`asmt-tab-btn ${activeTab === 'STREAMS' ? 'active' : ''}`}
            onClick={() => setActiveTab('STREAMS')}
            id="tab-streams-pathways"
          >
            <span>Aptitude & Streams</span>
          </button>

          <button
            className={`asmt-tab-btn ${activeTab === 'PERSONALITY' ? 'active' : ''}`}
            onClick={() => setActiveTab('PERSONALITY')}
            id="tab-personality-pathways"
          >
            <span>Personality & Learning</span>
          </button>

          <button
            className={`asmt-tab-btn ${activeTab === 'COMPLETED' ? 'active' : ''}`}
            onClick={() => setActiveTab('COMPLETED')}
            id="tab-completed-reports"
          >
            <span>Completed Reports</span>
            <span style={{ fontSize: '0.74rem', background: '#DCFCE7', color: '#166534', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
              {pathways.filter((p) => p.status === 'COMPLETED').length}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div
          style={{
            position: 'relative',
            minWidth: '240px',
          }}
        >
          <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
          <input
            type="text"
            placeholder="Search pathways or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem 0.5rem 2rem',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              fontSize: '0.84rem',
              outline: 'none',
              width: '100%',
            }}
          />
        </div>
      </div>

      {/* 4. CARDS GRID */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748B' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              border: '3px solid #E2E8F0',
              borderTopColor: '#5B4FE9',
              borderRadius: '50%',
              margin: '0 auto 1rem',
              animation: 'asmtSpin 0.8s linear infinite',
            }}
          />
          <div>Loading Eight-Pathway Assessment Suite...</div>
        </div>
      ) : filteredPathways.length === 0 ? (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #EAECF0',
            borderRadius: '16px',
            padding: '3rem 2rem',
            textAlign: 'center',
            color: '#64748B',
          }}
        >
          <HelpCircle size={36} color="#94A3B8" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.35rem' }}>
            No assessments match your filter.
          </h3>
          <p style={{ fontSize: '0.86rem', margin: 0 }}>
            Try resetting the filter tabs or clearing your search query.
          </p>
        </div>
      ) : (
        <div className="asmt-cards-grid">
          {filteredPathways.map((item) => {
            const visuals = getPathwayVisuals(item.code);
            const isCompleted = item.status === 'COMPLETED';
            const isInProgress = item.status === 'IN_PROGRESS';

            return (
              <div key={item.code} className="asmt-card">
                <div>
                  <div className="asmt-card-top">
                    <div
                      className="asmt-card-icon-box"
                      style={{ background: visuals.gradient }}
                    >
                      {visuals.icon}
                    </div>

                    <span
                      className={`asmt-card-status-pill ${
                        isCompleted
                          ? 'asmt-status-completed'
                          : isInProgress
                          ? 'asmt-status-in-progress'
                          : 'asmt-status-available'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 size={12} />
                          <span>Completed</span>
                        </>
                      ) : isInProgress ? (
                        <>
                          <Clock size={12} />
                          <span>In Progress (Q{item.currentQuestionIndex + 1})</span>
                        </>
                      ) : (
                        <span>Available</span>
                      )}
                    </span>
                  </div>

                  <h3 className="asmt-card-title">{item.title}</h3>
                  <p className="asmt-card-tagline">{item.tagline}</p>

                  <div className="asmt-card-meta-row">
                    <div className="asmt-card-meta-item">
                      <Clock size={14} color="#64748B" />
                      <span>~{item.estimatedMinutes} mins</span>
                    </div>
                    <div className="asmt-card-meta-item">
                      <HelpCircle size={14} color="#64748B" />
                      <span>{item.totalQuestions} questions</span>
                    </div>
                    <div className="asmt-card-meta-item">
                      <ShieldCheck size={14} color="#64748B" />
                      <span>v{item.version}</span>
                    </div>
                  </div>

                  {/* Dimensions chips */}
                  <div className="asmt-card-dims-wrap">
                    {item.dimensions.slice(0, 4).map((d) => (
                      <span key={d.code} className="asmt-dim-chip">
                        {d.label}
                      </span>
                    ))}
                    {item.dimensions.length > 4 && (
                      <span className="asmt-dim-chip">
                        +{item.dimensions.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="asmt-card-actions">
                  {isCompleted && item.latestReportId ? (
                    <>
                      <button
                        onClick={() => handleOpenReport(item.latestReportId!)}
                        disabled={isLoadingReport}
                        style={{
                          flex: 1,
                          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '0.65rem 1rem',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.86rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.45rem',
                          boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
                        }}
                        id={`btn-view-report-${item.code.toLowerCase()}`}
                      >
                        <Award size={15} />
                        <span>View Diagnostic Report</span>
                      </button>

                      <button
                        onClick={() => setTakingPathway(item.code)}
                        title="Retake Assessment"
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          color: '#475569',
                          padding: '0.65rem 0.75rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                        }}
                        id={`btn-retake-${item.code.toLowerCase()}`}
                      >
                        <RotateCcw size={15} />
                      </button>
                    </>
                  ) : isInProgress ? (
                    <button
                      onClick={() => setTakingPathway(item.code)}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '0.65rem 1rem',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.86rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.45rem',
                        boxShadow: '0 2px 6px rgba(245, 158, 11, 0.25)',
                      }}
                      id={`btn-resume-${item.code.toLowerCase()}`}
                    >
                      <span>Resume Assessment (Q{item.currentQuestionIndex + 1})</span>
                      <ArrowRight size={15} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setTakingPathway(item.code)}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #5B4FE9 0%, #4338CA 100%)',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '0.65rem 1rem',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.86rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.45rem',
                        boxShadow: '0 2px 6px rgba(91, 79, 233, 0.25)',
                      }}
                      id={`btn-start-${item.code.toLowerCase()}`}
                    >
                      <span>Start Assessment</span>
                      <ArrowRight size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. ETHICS & GUIDANCE DISCLAIMER */}
      {disclaimer && (
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #EAECF0',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            marginTop: '1rem',
          }}
        >
          <ShieldCheck size={20} color="#5B4FE9" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.55 }}>
            <strong>Psychometric Ethics & Advisory Limitation:</strong> {disclaimer}
          </div>
        </div>
      )}
    </div>
  );
};
