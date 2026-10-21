import React from 'react';
import {
  X,
  BookOpen,
  Building,
  GraduationCap,
  Clock,
  DollarSign,
  Award,
  Calendar,
  Bookmark,
  Scale,
  ExternalLink,
  CheckCircle,
  FileText,
  Sparkles,
} from 'lucide-react';
import { CourseSummary } from '../colleges.types';

interface CourseDetailModalProps {
  course: CourseSummary | null;
  institutionName?: string;
  institutionWebsite?: string;
  onClose: () => void;
  onToggleSaveCourse: (course: CourseSummary) => void;
  isCourseSaved: boolean;
  onCompareInstitution?: () => void;
  isInstitutionCompared?: boolean;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  institutionName,
  institutionWebsite,
  onClose,
  onToggleSaveCourse,
  isCourseSaved,
  onCompareInstitution,
  isInstitutionCompared,
}) => {
  if (!course) return null;

  const displayInstitution = course.institutionName || institutionName || 'Institution';
  const displayLocation =
    course.institutionCity && course.institutionCountry
      ? `${course.institutionCity}, ${course.institutionCountry}`
      : null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10001,
        background: 'rgba(8, 20, 38, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(8, 20, 38, 0.25)',
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.5rem 1.75rem',
            borderBottom: '1px solid #EAECF0',
            background: 'linear-gradient(135deg, #081426 0%, #172033 100%)',
            color: '#FFFFFF',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                <span
                  style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    background: 'rgba(91, 79, 233, 0.35)',
                    color: '#C7D2FE',
                    border: '1px solid rgba(91, 79, 233, 0.4)',
                  }}
                >
                  {course.level}
                </span>
                <span
                  style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: 'rgba(255, 255, 255, 0.12)',
                    color: '#E0E7FF',
                  }}
                >
                  {course.department}
                </span>
                {course.isPopular && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: 'rgba(245, 158, 11, 0.2)',
                      color: '#FDE68A',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                    }}
                  >
                    <Sparkles size={12} /> Popular
                  </span>
                )}
              </div>

              <h2
                style={{
                  fontSize: '1.375rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  margin: '0 0 0.5rem 0',
                  lineHeight: 1.3,
                }}
              >
                {course.name}
              </h2>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  fontSize: '0.875rem',
                  color: '#94A3B8',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#E2E8F0' }}>
                  <Building size={14} color="#A5B4FC" />
                  <strong>{displayInstitution}</strong>
                </span>
                {displayLocation && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    • {displayLocation}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '8px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'background 0.2s ease',
              }}
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              marginTop: '1.25rem',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => onToggleSaveCourse(course)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: isCourseSaved ? '1px solid #5B4FE9' : '1px solid rgba(255, 255, 255, 0.25)',
                background: isCourseSaved ? '#5B4FE9' : 'rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Bookmark size={14} fill={isCourseSaved ? '#FFFFFF' : 'none'} />
              {isCourseSaved ? 'Saved to Shortlist' : 'Save Program'}
            </button>

            {onCompareInstitution && (
              <button
                onClick={onCompareInstitution}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  border: isInstitutionCompared ? '1px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.25)',
                  background: isInstitutionCompared ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  color: isInstitutionCompared ? '#38BDF8' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Scale size={14} />
                {isInstitutionCompared ? 'In Comparison' : 'Compare Institution'}
              </button>
            )}

            {institutionWebsite && (
              <a
                href={institutionWebsite}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  marginLeft: 'auto',
                }}
              >
                Official Website
                <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div
          style={{
            padding: '1.5rem 1.75rem',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* Key Facts Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.875rem',
              background: '#F8FAFC',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid #EAECF0',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                <Clock size={14} color="#5B4FE9" /> DURATION
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#081426', marginTop: '0.25rem' }}>
                {course.durationText || (course.durationYears ? `${course.durationYears} Years` : 'Information not currently available.')}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                <DollarSign size={14} color="#059669" /> ANNUAL TUITION FEE
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#081426', marginTop: '0.25rem' }}>
                {course.feeRange ? (
                  course.feeRange
                ) : course.annualTuitionFee ? (
                  `${course.feeCurrency || '$'}${course.annualTuitionFee.toLocaleString()}/year`
                ) : (
                  <span style={{ color: '#94A3B8', fontWeight: 500 }}>Information not currently available.</span>
                )}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                <Award size={14} color="#D97706" /> SCHOLARSHIP
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#081426', marginTop: '0.25rem' }}>
                {course.scholarshipAvailable ? (
                  <span style={{ color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle size={14} /> Available
                  </span>
                ) : (
                  <span style={{ color: '#64748B', fontWeight: 500 }}>Not explicitly offered</span>
                )}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                <Calendar size={14} color="#4F46E5" /> APPLICATION DEADLINE
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#081426', marginTop: '0.25rem' }}>
                {course.applicationDeadline || (
                  <span style={{ color: '#94A3B8', fontWeight: 500 }}>Information not currently available.</span>
                )}
              </div>
            </div>
          </div>

          {/* Specialization */}
          {course.specialization && (
            <div style={{ padding: '0.875rem 1rem', background: '#EEF2FF', borderRadius: '10px', border: '1px solid #E0E7FF' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4338CA', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Specialization / Track
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1E1B4B', marginTop: '0.25rem' }}>
                {course.specialization}
              </div>
            </div>
          )}

          {/* Description */}
          <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem' }}>
            <h3
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#081426',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <BookOpen size={16} color="#5B4FE9" />
              Program Overview
            </h3>
            {course.description ? (
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: '#334155', margin: 0 }}>
                {course.description}
              </p>
            ) : (
              <p style={{ fontSize: '0.875rem', color: '#94A3B8', fontStyle: 'italic', margin: 0 }}>
                Information not currently available.
              </p>
            )}
          </div>

          {/* Eligibility Criteria */}
          <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem' }}>
            <h3
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#081426',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <GraduationCap size={16} color="#5B4FE9" />
              Eligibility & Academic Requirements
            </h3>
            {course.eligibilityCriteria ? (
              <div
                style={{
                  fontSize: '0.9375rem',
                  lineHeight: 1.6,
                  color: '#334155',
                  background: '#F8FAFC',
                  padding: '0.875rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #EAECF0',
                }}
              >
                {course.eligibilityCriteria}
              </div>
            ) : (
              <p style={{ fontSize: '0.875rem', color: '#94A3B8', fontStyle: 'italic', margin: 0 }}>
                Information not currently available.
              </p>
            )}
          </div>

          {/* Entrance Exams Required */}
          <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem' }}>
            <h3
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#081426',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <FileText size={16} color="#5B4FE9" />
              Entrance Exam Requirements
            </h3>
            {course.entranceExamsRequired && course.entranceExamsRequired.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {course.entranceExamsRequired.map((exam, i) => (
                  <span
                    key={i}
                    style={{
                      padding: '0.35rem 0.75rem',
                      background: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: '#1E293B',
                    }}
                  >
                    {exam}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.875rem', color: '#94A3B8', fontStyle: 'italic', margin: 0 }}>
                Information not currently available.
              </p>
            )}
          </div>

          {/* Scholarship Details */}
          <div>
            <h3
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#081426',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Award size={16} color="#5B4FE9" />
              Scholarship & Financial Aid Details
            </h3>
            {course.scholarshipDetails ? (
              <p style={{ fontSize: '0.9375rem', lineHeight: 1.6, color: '#334155', margin: 0 }}>
                {course.scholarshipDetails}
              </p>
            ) : (
              <p style={{ fontSize: '0.875rem', color: '#94A3B8', fontStyle: 'italic', margin: 0 }}>
                Information not currently available.
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 1.75rem',
            borderTop: '1px solid #EAECF0',
            background: '#F8FAFC',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              background: '#FFFFFF',
              border: '1px solid #D1D5DB',
              color: '#374151',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
          <button
            onClick={() => onToggleSaveCourse(course)}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              background: isCourseSaved ? '#059669' : '#5B4FE9',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Bookmark size={15} fill={isCourseSaved ? '#FFFFFF' : 'none'} />
            {isCourseSaved ? 'Saved in Shortlist' : 'Save to Shortlist'}
          </button>
        </div>
      </div>
    </div>
  );
};
