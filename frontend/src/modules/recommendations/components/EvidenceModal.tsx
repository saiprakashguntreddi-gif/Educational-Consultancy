import React from 'react';
import {
  X,
  Award,
  CheckCircle,
  AlertCircle,
  MapPin,
  Compass,
  DollarSign,
  FileText,
  Bookmark,
  ExternalLink,
  Info,
} from 'lucide-react';
import { RecommendationItemDto } from '../recommendations.types';

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: RecommendationItemDto | null;
  onToggleShortlist: (itemId: string) => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  isOpen,
  onClose,
  item,
  onToggleShortlist,
}) => {
  if (!isOpen || !item) return null;

  const { academicComparison, preferenceMatch, entranceExamMatch, financialMatch } = item.evidence;

  const tierColors = {
    SAFE: { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ADE80', border: 'rgba(34, 197, 94, 0.3)' },
    BEST_FIT: { bg: 'rgba(99, 102, 241, 0.15)', text: '#A5B4FC', border: 'rgba(99, 102, 241, 0.3)' },
    ASPIRATIONAL: { bg: 'rgba(245, 158, 11, 0.15)', text: '#FCD34D', border: 'rgba(245, 158, 11, 0.3)' },
  }[item.effectiveTier];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 10, 25, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(145deg, #0F172A 0%, #1E1B4B 100%)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '20px',
          maxWidth: '750px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          color: '#F8FAFC',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span
                style={{
                  background: tierColors.bg,
                  color: tierColors.text,
                  border: `1px solid ${tierColors.border}`,
                  padding: '0.2rem 0.65rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                {item.effectiveTier === 'SAFE' && 'Safe Option (>95%)'}
                {item.effectiveTier === 'BEST_FIT' && 'Best-Fit Match (50% – 95%)'}
                {item.effectiveTier === 'ASPIRATIONAL' && 'Aspirational Reach (<50%)'}
              </span>
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#CBD5E1',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {item.fitScore}% Fit Index
              </span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
              {item.institutionName}
            </h2>
            <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '0.2rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <MapPin size={14} color="#A78BFA" />
              <span>{item.institutionCity}, {item.institutionCountry}</span>
              {item.rankingInfo && <span>• {item.rankingInfo}</span>}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              color: '#94A3B8',
              borderRadius: '8px',
              width: 34,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Rationale Banner */}
          <div
            style={{
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: '12px',
              padding: '1rem',
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#A5B4FC', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Categorization Rationale & Evidence
            </div>
            <p style={{ margin: 0, fontSize: '0.92rem', color: '#E2E8F0', lineHeight: 1.5 }}>
              {item.reasonSummary}
            </p>
          </div>

          {/* Counsellor Notes Banner (If present) */}
          {item.counsellorNotes && (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '12px',
                padding: '1rem',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6EE7B7', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                Counsellor Advisory Note
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#D1FAE5' }}>
                {item.counsellorNotes}
              </p>
            </div>
          )}

          {/* 1. Academic Credentials Comparison */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '14px', padding: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <Award size={18} color="#818CF8" />
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Academic Benchmark Alignment</h4>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Your Aggregate Score</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38BDF8', marginTop: '0.2rem' }}>
                  {academicComparison.studentPercentage}%
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.1rem' }}>
                  Board: {academicComparison.studentBoard || 'Senior Secondary'}
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem 1rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Institution Target Benchmark</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F1F5F9', marginTop: '0.2rem' }}>
                  {academicComparison.institutionBenchmarkMin || 75}%
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '0.1rem' }}>
                  Admit Rate: {Math.round((academicComparison.acceptanceRate || 0.45) * 100)}%
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {academicComparison.percentageMargin >= 0 ? (
                <CheckCircle size={16} color="#34D399" />
              ) : (
                <AlertCircle size={16} color="#FBBF24" />
              )}
              <span>
                {academicComparison.percentageMargin >= 0
                  ? `Your score exceeds the minimum benchmark cutoff by +${academicComparison.percentageMargin}%.`
                  : `Your score is ${Math.abs(academicComparison.percentageMargin)}% below the median admit cutoff (Reach Target).`}
              </span>
            </div>
          </div>

          {/* 2. Destination & Program Fit */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '14px', padding: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <Compass size={18} color="#818CF8" />
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Study Destination & Course Match</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <span style={{ color: '#94A3B8' }}>Country Alignment:</span>
                <span style={{ fontWeight: 600, color: preferenceMatch.isPrimaryDestinationMatch ? '#4ADE80' : '#E2E8F0' }}>
                  {preferenceMatch.destinationCountry} {preferenceMatch.isPrimaryDestinationMatch && '(Priority #1 Destination)'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                <span style={{ color: '#94A3B8' }}>Department Offering:</span>
                <span style={{ fontWeight: 600, color: '#E2E8F0' }}>{preferenceMatch.matchedDepartment}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0' }}>
                <span style={{ color: '#94A3B8' }}>Matching Programs:</span>
                <span style={{ fontWeight: 600, color: '#A5B4FC' }}>
                  {preferenceMatch.programsOfferedCount} programs in your stream
                </span>
              </div>

              {preferenceMatch.countryPreferenceNote && (
                <div style={{ marginTop: '0.5rem', padding: '0.4rem 0.6rem', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '6px', fontSize: '0.78rem', color: '#FDE68A' }}>
                  {preferenceMatch.countryPreferenceNote}
                </div>
              )}
            </div>
          </div>

          {/* 3. Entrance Exam & Financial Match */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '14px', padding: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <FileText size={17} color="#818CF8" />
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Entrance Exams</h4>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: 1.4 }}>
                {entranceExamMatch.requiredExams.length > 0 ? (
                  <>
                    <div>Required: <strong>{entranceExamMatch.requiredExams.join(', ')}</strong></div>
                    <div style={{ marginTop: '0.25rem', color: entranceExamMatch.isExamRequirementFulfilled ? '#4ADE80' : '#FBBF24' }}>
                      {entranceExamMatch.isExamRequirementFulfilled
                        ? 'Exam requirement covered in your plan.'
                        : 'Review exam preparation plan for admission.'}
                    </div>
                  </>
                ) : (
                  <div>Standard academic admission (No mandatory entrance test specified).</div>
                )}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '14px', padding: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <DollarSign size={17} color="#818CF8" />
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Financial Alignment</h4>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: 1.4 }}>
                {financialMatch.annualTuitionFeeMin ? (
                  <div>Tuition: ~{financialMatch.feeCurrency} {financialMatch.annualTuitionFeeMin.toLocaleString()}/yr</div>
                ) : (
                  <div>Standard tuition tier</div>
                )}
                <div style={{ marginTop: '0.25rem', color: financialMatch.hasScholarshipsAvailable ? '#4ADE80' : '#94A3B8' }}>
                  {financialMatch.hasScholarshipsAvailable ? 'Scholarships available.' : 'Standard fee structure.'}
                </div>
              </div>
            </div>
          </div>

          {/* Indicative Data Quality Notice */}
          {item.isDataIndicative && (
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
                fontSize: '0.8rem',
                color: '#FDE68A',
              }}
            >
              <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Data Quality Notice: </strong>
                {item.dataLimitationNote ||
                  'Benchmark probabilities are indicative estimates based on published academic eligibility and selectivity.'}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {item.officialWebsiteUrl ? (
            <a
              href={item.officialWebsiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#A5B4FC',
                fontSize: '0.85rem',
                textDecoration: 'none',
              }}
            >
              <span>Visit Official Website</span>
              <ExternalLink size={14} />
            </a>
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => onToggleShortlist(item.id)}
              className={item.isShortlisted ? 'btn-primary-indigo' : 'btn-secondary-outline'}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              <Bookmark size={15} />
              <span>{item.isShortlisted ? 'In Shortlist' : 'Add to Shortlist'}</span>
            </button>

            <button
              onClick={onClose}
              className="btn-secondary-outline"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
