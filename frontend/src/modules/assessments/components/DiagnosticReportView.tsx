import React from 'react';
import { DiagnosticReport } from '../assessments.types';
import {
  Award,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Compass,
  Briefcase,
  Target,
  FileText,
  Calendar,
  ShieldCheck,
  Printer,
  RotateCcw,
} from 'lucide-react';

interface DiagnosticReportViewProps {
  report: DiagnosticReport;
  onBack: () => void;
  onRetake?: () => void;
}

export const DiagnosticReportView: React.FC<DiagnosticReportViewProps> = ({
  report,
  onBack,
  onRetake,
}) => {
  // Format completion date
  const completedDateStr = report.completedAt
    ? new Date(report.completedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recently';

  // Compute average percentage across dimensions
  const totalAvg = Math.round(
    report.dimensions.reduce((acc, d) => acc + d.percentage, 0) /
      Math.max(1, report.dimensions.length)
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="asmt-report-card">
      {/* Top Navigation Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: 'none',
            border: 'none',
            color: '#5B4FE9',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            padding: 0,
          }}
          id="btn-report-back-to-suite"
        >
          <ArrowLeft size={16} />
          <span>Back to All Assessments</span>
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {onRetake && (
            <button
              onClick={onRetake}
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.82rem',
                padding: '0.45rem 0.85rem',
                background: '#FFFFFF',
                color: '#475569',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={14} />
              <span>Retake</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="btn btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.82rem',
              padding: '0.45rem 0.85rem',
              background: '#FFFFFF',
              color: '#475569',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            <Printer size={14} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Header */}
      <div className="asmt-report-header">
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(91, 79, 233, 0.08)',
              color: '#5B4FE9',
              fontSize: '0.74rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              padding: '0.25rem 0.65rem',
              borderRadius: '6px',
              marginBottom: '0.65rem',
            }}
          >
            <Award size={14} />
            <span>Official Diagnostic Assessment Report</span>
          </div>

          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#0F172A',
              margin: '0 0 0.4rem',
            }}
          >
            {report.pathwayTitle}
          </h1>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              fontSize: '0.84rem',
              color: '#64748B',
              flexWrap: 'wrap',
            }}
          >
            <span>Version {report.version}</span>
            <span>•</span>
            <span>Completed on {completedDateStr}</span>
            <span>•</span>
            <span>Attempt ID: {report.attemptId.slice(0, 18)}...</span>
          </div>
        </div>

        {/* Aggregate Score Highlight Badge */}
        <div className="asmt-score-highlight-badge">
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.9, fontWeight: 700 }}>
            Overall Alignment
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.1 }}>
            {totalAvg}%
          </div>
          <div style={{ fontSize: '0.74rem', opacity: 0.9, marginTop: '0.2rem' }}>
            Multi-Dimensional Index
          </div>
        </div>
      </div>

      {/* Dominant Clusters / Key Attributes */}
      {report.dominantClusters && report.dominantClusters.length > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(91, 79, 233, 0.04) 0%, rgba(139, 92, 246, 0.06) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.75rem',
          }}
        >
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#5B4FE9',
              letterSpacing: '0.04em',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Sparkles size={15} />
            <span>Dominant Interest & Cognitive Clusters</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {report.dominantClusters.map((cluster, i) => (
              <span
                key={i}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #DDD6FE',
                  color: '#4C1D95',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  padding: '0.35rem 0.85rem',
                  borderRadius: '9999px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}
              >
                #{i + 1} {cluster}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 1. Multi-Dimensional Score Breakdown */}
      <section style={{ marginBottom: '2.25rem' }}>
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#0F172A',
            marginBottom: '0.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <TrendingUp size={20} color="#5B4FE9" />
          <span>Dimension Breakdown & Aptitude Profiles</span>
        </h2>
        <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '0 0 1.25rem' }}>
          Transparent score calculations across every active psychometric dimension measured during this assessment.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          {report.dimensions.map((dim) => {
            const isHigh = dim.band === 'HIGH';
            const isModerate = dim.band === 'MODERATE';
            const bandColor = isHigh ? '#16A34A' : isModerate ? '#D97706' : '#64748B';
            const bandBg = isHigh ? '#DCFCE7' : isModerate ? '#FEF3C7' : '#F1F5F9';

            return (
              <div key={dim.dimensionCode} className="asmt-dim-progress-card">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    marginBottom: '0.65rem',
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: '0.96rem',
                        fontWeight: 700,
                        color: '#0F172A',
                        margin: 0,
                      }}
                    >
                      {dim.label}
                    </h3>
                    <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '0.15rem' }}>
                      Raw Score: {dim.rawScore} / {dim.maxScore} pts
                    </div>
                  </div>

                  <span
                    style={{
                      background: bandBg,
                      color: bandColor,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '9999px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {dim.band} ({dim.percentage}%)
                  </span>
                </div>

                <div
                  style={{
                    width: '100%',
                    height: '7px',
                    background: '#E2E8F0',
                    borderRadius: '9999px',
                    overflow: 'hidden',
                    marginBottom: '0.65rem',
                  }}
                >
                  <div
                    style={{
                      width: `${dim.percentage}%`,
                      height: '100%',
                      background: isHigh
                        ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)'
                        : isModerate
                        ? 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)'
                        : 'linear-gradient(90deg, #94A3B8 0%, #64748B 100%)',
                      borderRadius: '9999px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>

                <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.45, margin: 0 }}>
                  {dim.summary}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Recommended Academic Streams & Courses */}
      <section style={{ marginBottom: '2.25rem' }}>
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#0F172A',
            marginBottom: '0.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Compass size={20} color="#5B4FE9" />
          <span>Recommended Streams & Department Directions</span>
        </h2>
        <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '0 0 1rem' }}>
          Empirically matched based on your dominant response weights.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
          {report.matchingStreams.map((stream, idx) => (
            <div
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#F8FAFC',
                border: '1.5px solid #CBD5E1',
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                fontSize: '0.88rem',
                fontWeight: 700,
                color: '#1E293B',
              }}
            >
              <CheckCircle2 size={16} color="#16A34A" />
              <span>{stream}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Recommended Career Pathways */}
      <section style={{ marginBottom: '2.25rem' }}>
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#0F172A',
            marginBottom: '0.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Briefcase size={20} color="#5B4FE9" />
          <span>Relevant Career Horizons & Degree Pathways</span>
        </h2>
        <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '0 0 1.25rem' }}>
          Explore aligned industries, typical degree requirements, and role descriptions derived from your score evidence.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
          {report.careerSuggestions.map((career, i) => (
            <div key={i} className="asmt-career-item">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  marginBottom: '0.45rem',
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      margin: 0,
                    }}
                  >
                    {career.title}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.1rem' }}>
                    Industry: {career.industry}
                  </div>
                </div>

                <span
                  className={`asmt-fit-pill ${
                    career.fitLevel === 'EXCELLENT'
                      ? 'asmt-fit-excellent'
                      : career.fitLevel === 'STRONG'
                      ? 'asmt-fit-strong'
                      : 'asmt-fit-exploratory'
                  }`}
                >
                  {career.fitLevel} FIT
                </span>
              </div>

              <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.45, margin: '0 0 0.85rem' }}>
                {career.description}
              </p>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.65rem' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                  Recommended Degrees:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                  {career.typicalDegrees.map((deg, dIdx) => (
                    <span
                      key={dIdx}
                      style={{
                        background: '#EEF2FF',
                        color: '#4338CA',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                      }}
                    >
                      {deg}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Strengths & Development Areas Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.25rem',
        }}
      >
        {/* Strengths */}
        <div
          style={{
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#15803D',
              fontWeight: 800,
              fontSize: '0.95rem',
              marginBottom: '0.75rem',
            }}
          >
            <CheckCircle2 size={18} />
            <span>Key Demonstrated Strengths</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#166534', fontSize: '0.85rem', lineHeight: 1.6 }}>
            {report.keyStrengths.map((str, idx) => (
              <li key={idx} style={{ marginBottom: '0.35rem' }}>
                {str}
              </li>
            ))}
          </ul>
        </div>

        {/* Development Areas */}
        <div
          style={{
            background: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#B45309',
              fontWeight: 800,
              fontSize: '0.95rem',
              marginBottom: '0.75rem',
            }}
          >
            <Target size={18} />
            <span>Growth & Development Areas</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#92400E', fontSize: '0.85rem', lineHeight: 1.6 }}>
            {report.developmentAreas.map((dev, idx) => (
              <li key={idx} style={{ marginBottom: '0.35rem' }}>
                {dev}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 5. Counsellor Discussion Prompts */}
      {report.counsellorDiscussionPrompts && report.counsellorDiscussionPrompts.length > 0 && (
        <section
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#1E293B',
              fontWeight: 800,
              fontSize: '1rem',
              marginBottom: '0.5rem',
            }}
          >
            <FileText size={18} color="#5B4FE9" />
            <span>Suggested Counsellor Discussion Points</span>
          </div>
          <p style={{ color: '#64748B', fontSize: '0.84rem', margin: '0 0 0.85rem' }}>
            Bring these focused questions to your next 1-on-1 advisory session with your certified counsellor.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {report.counsellorDiscussionPrompts.map((prompt, pIdx) => (
              <div
                key={pIdx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  fontSize: '0.86rem',
                  color: '#334155',
                  lineHeight: 1.45,
                }}
              >
                <span
                  style={{
                    background: '#E2E8F0',
                    color: '#475569',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  {pIdx + 1}
                </span>
                <span>{prompt}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Counsellor Action Plan (if attached) */}
      {report.counsellorActionPlan && (
        <section
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.08) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#065F46',
                fontWeight: 800,
                fontSize: '1.05rem',
              }}
            >
              <ShieldCheck size={20} color="#10B981" />
              <span>Counsellor Action Plan & Agreed Milestones</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#047857' }}>
              Reviewed by: <strong>{report.counsellorActionPlan.counsellorName}</strong>
            </span>
          </div>

          {report.counsellorActionPlan.summaryNotes && (
            <p
              style={{
                background: '#FFFFFF',
                border: '1px solid #A7F3D0',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                fontSize: '0.86rem',
                color: '#064E3B',
                lineHeight: 1.5,
                margin: '0 0 1rem',
              }}
            >
              <strong>Counsellor Guidance Note:</strong> {report.counsellorActionPlan.summaryNotes}
            </p>
          )}

          {report.counsellorActionPlan.actionMilestones && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {report.counsellorActionPlan.actionMilestones.map((m) => (
                <div
                  key={m.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #D1FAE5',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2
                      size={16}
                      color={m.status === 'COMPLETED' ? '#10B981' : '#94A3B8'}
                    />
                    <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#0F172A' }}>
                      {m.title}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {m.targetDeadline && (
                      <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={13} />
                        Due {m.targetDeadline}
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        background:
                          m.status === 'COMPLETED'
                            ? '#DCFCE7'
                            : m.status === 'IN_PROGRESS'
                            ? '#FEF3C7'
                            : '#F1F5F9',
                        color:
                          m.status === 'COMPLETED'
                            ? '#15803D'
                            : m.status === 'IN_PROGRESS'
                            ? '#B45309'
                            : '#475569',
                      }}
                    >
                      {m.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 7. Notice & Ethical Limitations Disclaimer Banner */}
      <div
        style={{
          background: '#F8FAFC',
          border: '1px solid #EAECF0',
          borderRadius: '10px',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
        }}
      >
        <AlertCircle size={18} color="#64748B" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.55 }}>
          <strong>Advisory Notice & Guidance Limitation:</strong> {report.ethicsDisclaimer}
        </div>
      </div>
    </div>
  );
};
