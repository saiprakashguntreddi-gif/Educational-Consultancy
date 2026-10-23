import React, { useState } from 'react';
import {
  X,
  Building,
  MapPin,
  Award,
  ExternalLink,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Bookmark,
  ShieldCheck,
  AlertTriangle,
  Info,
  BookOpen,
  FileText,
} from 'lucide-react';
import { ScholarshipDto, EligibilityCriterionCheck } from '../scholarships.types';
import '../scholarships.css';

interface ScholarshipDetailModalProps {
  scholarship: ScholarshipDto | null;
  onClose: () => void;
  onToggleSave?: (scholarshipId: string) => void;
  isSaving?: boolean;
}

export const ScholarshipDetailModal: React.FC<ScholarshipDetailModalProps> = ({
  scholarship,
  onClose,
  onToggleSave,
  isSaving,
}) => {
  if (!scholarship) return null;

  const eligibility = scholarship.eligibility;

  // Document checklist state (interactive for student readiness)
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  const defaultDocuments = [
    { id: 'transcripts', label: 'Official Academic Transcripts & Marksheets' },
    { id: 'sop', label: 'Statement of Purpose / Academic Motivation Essay' },
    { id: 'tests', label: 'Standardized Test Score Reports (IELTS / TOEFL / GRE / SAT)' },
    { id: 'lor', label: 'Letters of Recommendation (Academic / Faculty / Employer)' },
    { id: 'citizenship', label: 'Valid Passport & Citizenship Identification' },
    { id: 'financial', label: 'Family Income Certificate / Financial Solvency Proof' },
  ];

  const toggleDoc = (id: string) => {
    setCheckedDocs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const checkedCount = Object.values(checkedDocs).filter(Boolean).length;

  // Format deadline date & days remaining
  const getDeadlineText = (deadlineStr?: string | null) => {
    if (!deadlineStr) return 'Rolling / Verified Provider Intake';
    const deadlineDate = new Date(deadlineStr);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const dateFormatted = deadlineDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    if (diffDays > 0) {
      return `${dateFormatted} (${diffDays} days remaining)`;
    } else if (diffDays === 0) {
      return `${dateFormatted} (Closes Today)`;
    } else {
      return `${dateFormatted} (Cycle Expired)`;
    }
  };

  const formatAwardValue = (amount?: number | null, currency?: string | null, type?: string | null) => {
    if (amount !== null && amount !== undefined) {
      const curr = currency || 'USD';
      if (curr === 'INR') {
        return `₹${amount.toLocaleString('en-IN')}`;
      } else if (curr === 'USD') {
        return `$${amount.toLocaleString('en-US')} USD`;
      } else if (curr === 'GBP') {
        return `£${amount.toLocaleString('en-GB')}`;
      } else if (curr === 'EUR') {
        return `€${amount.toLocaleString('en-EU')}`;
      }
      return `${curr} ${amount.toLocaleString()}`;
    }
    return type || 'Full / Partial Coverage';
  };

  return (
    <div
      className="sch-modal-overlay"
      id="scholarship-detail-modal-overlay"
      onClick={onClose}
    >
      <div
        className="sch-modal-container"
        id="scholarship-detail-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="sch-modal-header">
          <div className="sch-modal-header-left">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {eligibility && (
                <span
                  className={`sch-status-badge ${
                    eligibility.status === 'ELIGIBLE'
                      ? 'eligible'
                      : eligibility.status === 'POTENTIALLY_ELIGIBLE'
                      ? 'review'
                      : 'not-eligible'
                  }`}
                >
                  {eligibility.status === 'ELIGIBLE' ? (
                    <CheckCircle2 size={13} />
                  ) : eligibility.status === 'POTENTIALLY_ELIGIBLE' ? (
                    <AlertTriangle size={13} />
                  ) : (
                    <XCircle size={13} />
                  )}
                  <span>
                    {eligibility.status === 'ELIGIBLE'
                      ? 'Verified Eligible'
                      : eligibility.status === 'POTENTIALLY_ELIGIBLE'
                      ? 'Needs Profile Review'
                      : 'Not Eligible'}
                  </span>
                </span>
              )}

              {scholarship.destinationCountry && (
                <span className="sch-tag destination">
                  <MapPin size={11} />
                  <span>Destination: {scholarship.destinationCountry}</span>
                </span>
              )}

              {scholarship.studyLevel && (
                <span className="sch-tag">
                  <span>Level: {scholarship.studyLevel}</span>
                </span>
              )}
            </div>

            <h2 className="sch-modal-title">{scholarship.name}</h2>

            <div className="sch-modal-provider-line">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                <Building size={13} />
                {scholarship.provider}
              </span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={13} />
                Host: {scholarship.country}
              </span>
              {scholarship.department && (
                <>
                  <span>•</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#5B4FE9', fontWeight: 600 }}>
                    <BookOpen size={13} />
                    {scholarship.department}
                  </span>
                </>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="sch-btn-close-modal"
            title="Close dialog"
            id="sch-modal-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="sch-modal-body">
          {/* Key Stats Grid */}
          <div className="sch-modal-stats-grid">
            <div className="sch-stat-box">
              <span className="sch-stat-label">Award Value</span>
              <span className="sch-stat-value" style={{ color: '#059669' }}>
                {formatAwardValue(scholarship.awardAmount, scholarship.awardCurrency, scholarship.awardType)}
              </span>
            </div>

            <div className="sch-stat-box">
              <span className="sch-stat-label">Academic Cutoff</span>
              <span className="sch-stat-value">
                {scholarship.minPercentageRequirement !== null && scholarship.minPercentageRequirement !== undefined
                  ? `${scholarship.minPercentageRequirement}% Aggregate`
                  : 'Open Benchmark'}
              </span>
            </div>

            <div className="sch-stat-box">
              <span className="sch-stat-label">Citizenship</span>
              <span className="sch-stat-value">
                {scholarship.requiredCitizenship || 'All Nationalities'}
              </span>
            </div>

            <div className="sch-stat-box">
              <span className="sch-stat-label">Deadline</span>
              <span className="sch-stat-value" style={{ fontSize: '0.82rem' }}>
                {getDeadlineText(scholarship.applicationDeadline)}
              </span>
            </div>
          </div>

          {/* Section 1: Detailed Benefits Description */}
          <div className="sch-modal-section">
            <h3 className="sch-modal-section-title">
              <Award size={16} color="#5B4FE9" />
              Award Coverage & Financial Benefits
            </h3>
            <div className="sch-modal-section-content">
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: '#0F172A' }}>
                {scholarship.awardType || 'Comprehensive Educational Support'}
              </p>
              <p style={{ margin: 0 }}>{scholarship.awardDetails}</p>
            </div>
          </div>

          {/* Section 2: Eligibility Criteria Engine Breakdown */}
          <div className="sch-modal-section">
            <h3 className="sch-modal-section-title">
              <ShieldCheck size={16} color="#059669" />
              Automated Profile Eligibility Assessment
            </h3>

            {eligibility && (
              <div
                className={`sch-insight-box ${
                  eligibility.status === 'ELIGIBLE'
                    ? 'eligible'
                    : eligibility.status === 'POTENTIALLY_ELIGIBLE'
                    ? 'review'
                    : 'not-eligible'
                }`}
              >
                {eligibility.status === 'ELIGIBLE' ? (
                  <CheckCircle2 size={16} className="sch-insight-icon" />
                ) : eligibility.status === 'POTENTIALLY_ELIGIBLE' ? (
                  <AlertTriangle size={16} className="sch-insight-icon" />
                ) : (
                  <XCircle size={16} className="sch-insight-icon" />
                )}
                <div>
                  <span style={{ fontWeight: 700 }}>Summary Decision: </span>
                  {eligibility.summary}
                </div>
              </div>
            )}

            <div className="sch-criteria-list" style={{ marginTop: '0.5rem' }}>
              {eligibility?.checks && eligibility.checks.length > 0 ? (
                eligibility.checks.map((check: EligibilityCriterionCheck, index: number) => {
                  const isMet = check.status === 'MET';
                  const isReview = check.status === 'NEEDS_REVIEW';

                  return (
                    <div
                      key={index}
                      className={`sch-criterion-item ${
                        isMet ? 'met' : isReview ? 'needs-review' : 'not-met'
                      }`}
                    >
                      <div className="sch-criterion-icon">
                        {isMet ? (
                          <CheckCircle2 size={18} color="#15803D" />
                        ) : isReview ? (
                          <HelpCircle size={18} color="#B45309" />
                        ) : (
                          <XCircle size={18} color="#B91C1C" />
                        )}
                      </div>

                      <div className="sch-criterion-details">
                        <div className="sch-criterion-header">
                          <span className="sch-criterion-label">{check.label}</span>
                          <span
                            className={`sch-criterion-status-tag ${
                              isMet ? 'met' : isReview ? 'needs-review' : 'not-met'
                            }`}
                          >
                            {isMet ? 'Criteria Satisfied' : isReview ? 'Review Needed' : 'Requirement Not Met'}
                          </span>
                        </div>
                        <p className="sch-criterion-explanation">{check.detail}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="sch-modal-section-content">
                  <p style={{ margin: 0 }}>{scholarship.eligibilityDescription}</p>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Interactive Document Checklist */}
          <div className="sch-modal-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 className="sch-modal-section-title">
                <FileText size={16} color="#5B4FE9" />
                Required Application Documents Checklist
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                {checkedCount} of {defaultDocuments.length} Prepared
              </span>
            </div>

            <div className="sch-checklist">
              {defaultDocuments.map((doc) => {
                const isChecked = !!checkedDocs[doc.id];
                return (
                  <div
                    key={doc.id}
                    onClick={() => toggleDoc(doc.id)}
                    className={`sch-check-item ${isChecked ? 'checked' : ''}`}
                  >
                    <div className="sch-checkbox-box">
                      {isChecked ? <CheckCircle2 size={14} color="#FFFFFF" /> : null}
                    </div>
                    <span>{doc.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Official Provider Verification Notice */}
          <div className="sch-verification-box">
            <Info size={18} color="#1E40AF" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p>
                <b>Official Verification Source: </b>
                {scholarship.sourceInfo || 'Verified Official Educational Authority / Provider Registry'}.
              </p>
              <p style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: '#3B82F6' }}>
                <b>Notice: </b>
                Application deadlines and award criteria reflect official published cycles. Final scholarship grant, interview shortlisting, and disbursement are governed exclusively by the scholarship provider.
              </p>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="sch-modal-footer">
          <div className="sch-modal-footer-left">
            {onToggleSave && (
              <button
                onClick={() => onToggleSave(scholarship.id)}
                disabled={isSaving}
                className={`sch-btn-modal-save ${scholarship.isSaved ? 'saved' : ''}`}
                id="sch-modal-toggle-save-btn"
              >
                <Bookmark
                  size={15}
                  className={scholarship.isSaved ? 'fill-amber-500 text-amber-500' : ''}
                />
                <span>
                  {scholarship.isSaved ? 'Shortlisted' : 'Save to Shortlist'}
                </span>
              </button>
            )}
          </div>

          <div className="sch-modal-footer-right">
            <button
              onClick={onClose}
              className="sch-btn-modal-close"
              id="sch-modal-footer-close-btn"
            >
              Close
            </button>

            {scholarship.applicationUrl && (
              <a
                href={scholarship.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="sch-btn-modal-apply"
                id="sch-modal-apply-now-btn"
              >
                <span>Apply on Official Portal</span>
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
