import React, { useState } from 'react';
import {
  X,
  MapPin,
  Building,
  Award,
  Globe,
  Bookmark,
  Scale,
  Mail,
  Phone,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { InstitutionDetail, CourseSummary } from '../colleges.types';

interface InstitutionDetailModalProps {
  institution: InstitutionDetail | null;
  onClose: () => void;
  onSelectCourse: (course: CourseSummary) => void;
  onToggleSave: (institution: InstitutionDetail) => void;
  onToggleCompare: (institution: InstitutionDetail) => void;
  isSaved: boolean;
  isCompared: boolean;
}

export const InstitutionDetailModal: React.FC<InstitutionDetailModalProps> = ({
  institution,
  onClose,
  onSelectCourse,
  onToggleSave,
  onToggleCompare,
  isSaved,
  isCompared,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'admissions'>('overview');

  if (!institution) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
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
        id="institution-detail-modal"
        style={{
          width: '100%',
          maxWidth: '900px',
          maxHeight: '90vh',
          background: '#FFFFFF',
          borderRadius: '20px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(8, 20, 38, 0.35)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER WITH DARK NAVY BANNER */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0B1535 0%, #1E1B4B 100%)',
            padding: '1.75rem 2rem',
            color: '#FFFFFF',
            position: 'relative',
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'rgba(255, 255, 255, 0.12)',
              border: 'none',
              color: '#FFFFFF',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>

          {/* Ranking Badge */}
          {institution.rankingInfo && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.76rem',
                fontWeight: 700,
                color: '#C7D2FE',
                background: 'rgba(91, 79, 233, 0.3)',
                padding: '0.2rem 0.75rem',
                borderRadius: '999px',
                border: '1px solid rgba(199, 210, 254, 0.25)',
                marginBottom: '0.65rem',
              }}
            >
              <Award size={13} />
              <span>{institution.rankingInfo}</span>
            </div>
          )}

          {/* Name & Location */}
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              margin: '0 0 0.35rem',
              color: '#FFFFFF',
            }}
          >
            {institution.name}
          </h2>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              fontSize: '0.86rem',
              color: '#CBD5E1',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={14} color="#94A3B8" />
              <span>
                {institution.city}, {institution.country}
              </span>
            </span>

            {institution.institutionType && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Building size={14} color="#94A3B8" />
                <span>{institution.institutionType}</span>
              </span>
            )}

            {institution.establishedYear && (
              <span>Est. {institution.establishedYear}</span>
            )}
          </div>

          {/* Header Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginTop: '1.25rem',
              flexWrap: 'wrap',
            }}
          >
            {/* Official Website Button */}
            <a
              href={institution.officialWebsiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="modal-official-site-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                background: '#5B4FE9',
                color: '#FFFFFF',
                fontSize: '0.84rem',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 2px 6px rgba(91, 79, 233, 0.4)',
              }}
            >
              <Globe size={15} />
              <span>Visit Official Website</span>
              <ExternalLink size={13} />
            </a>

            {/* Save Button */}
            <button
              onClick={() => onToggleSave(institution)}
              id="modal-save-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                background: isSaved ? '#FEF3C7' : 'rgba(255, 255, 255, 0.12)',
                border: isSaved ? '1px solid #FDE68A' : '1px solid rgba(255, 255, 255, 0.2)',
                color: isSaved ? '#D97706' : '#FFFFFF',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Bookmark size={15} fill={isSaved ? '#D97706' : 'none'} />
              <span>{isSaved ? 'Saved in Shortlist' : 'Save Institution'}</span>
            </button>

            {/* Compare Button */}
            <button
              onClick={() => onToggleCompare(institution)}
              id="modal-compare-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                background: isCompared ? '#EEF2FF' : 'rgba(255, 255, 255, 0.12)',
                border: isCompared ? '1px solid #C7D2FE' : '1px solid rgba(255, 255, 255, 0.2)',
                color: isCompared ? '#4338CA' : '#FFFFFF',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Scale size={15} />
              <span>{isCompared ? 'In Comparison' : 'Compare'}</span>
            </button>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #E2E8F0',
            background: '#F8FAFC',
            padding: '0 1.5rem',
          }}
        >
          {[
            { key: 'overview', label: 'Overview & Campus' },
            { key: 'courses', label: `Available Programs (${institution.courses?.length || 0})` },
            { key: 'admissions', label: 'Admissions & Contact' },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  padding: '0.9rem 1.25rem',
                  border: 'none',
                  background: 'none',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#5B4FE9' : '#64748B',
                  borderBottom: isActive ? '2px solid #5B4FE9' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* MODAL BODY CONTENT SCROLLABLE */}
        <div
          style={{
            padding: '1.75rem 2rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.75rem',
          }}
        >
          {activeTab === 'overview' && (
            <>
              {/* SECTION: ABOUT */}
              <div>
                <h4
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#64748B',
                    margin: '0 0 0.5rem',
                  }}
                >
                  About the Institution
                </h4>
                <p style={{ fontSize: '0.92rem', color: '#1E293B', lineHeight: 1.6, margin: 0 }}>
                  {institution.overview || 'Information not currently available.'}
                </p>
              </div>

              {/* SECTION: POPULAR PROGRAMS */}
              <div>
                <h4
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#64748B',
                    margin: '0 0 0.65rem',
                  }}
                >
                  Popular Programs
                </h4>
                {institution.popularPrograms && institution.popularPrograms.length > 0 ? (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {institution.popularPrograms.map((p) => (
                      <span
                        key={p}
                        style={{
                          fontSize: '0.84rem',
                          fontWeight: 600,
                          padding: '0.35rem 0.85rem',
                          borderRadius: '8px',
                          background: '#EEF2FF',
                          color: '#4338CA',
                          border: '1px solid #E0E7FF',
                        }}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0 }}>
                    Information not currently available.
                  </p>
                )}
              </div>

              {/* SECTION: CAMPUS FACILITIES */}
              <div>
                <h4
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#64748B',
                    margin: '0 0 0.65rem',
                  }}
                >
                  Campus Facilities
                </h4>
                {institution.campusFacilities && institution.campusFacilities.length > 0 ? (
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: '1.25rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '0.5rem',
                      fontSize: '0.88rem',
                      color: '#334155',
                    }}
                  >
                    {institution.campusFacilities.map((facility, idx) => (
                      <li key={idx} style={{ lineHeight: 1.5 }}>
                        {facility}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0 }}>
                    Information not currently available.
                  </p>
                )}
              </div>

              {/* SECTION: PLACEMENTS */}
              <div>
                <h4
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#64748B',
                    margin: '0 0 0.5rem',
                  }}
                >
                  Placements & Career Outcomes
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.55, margin: 0 }}>
                  {institution.placementInfo || 'Information not currently available.'}
                </p>
              </div>

              {/* SECTION: SCHOLARSHIPS & FINANCIAL AID */}
              <div>
                <h4
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#64748B',
                    margin: '0 0 0.5rem',
                  }}
                >
                  Scholarships & Financial Aid
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.55, margin: 0 }}>
                  {institution.scholarshipDetails ||
                    (institution.hasScholarships
                      ? 'Institutional scholarships and need-based tuition grants are available for eligible applicants.'
                      : 'Information not currently available.')}
                </p>
              </div>
            </>
          )}

          {activeTab === 'courses' && (
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.25rem' }}>
                  Available Academic Programs
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>
                  Select a degree program to inspect entry requirements, tuition details, and deadlines.
                </p>
              </div>

              {institution.courses && institution.courses.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {institution.courses.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => onSelectCourse(course)}
                      style={{
                        padding: '1.1rem 1.25rem',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        background: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#5B4FE9';
                        e.currentTarget.style.background = '#F8FAFC';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#E2E8F0';
                        e.currentTarget.style.background = '#FFFFFF';
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <h5 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                            {course.name}
                          </h5>
                          {course.isPopular && (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '0.1rem 0.45rem',
                                borderRadius: '4px',
                                background: '#FEF3C7',
                                color: '#B45309',
                              }}
                            >
                              Popular
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.85rem',
                            flexWrap: 'wrap',
                            fontSize: '0.8rem',
                            color: '#64748B',
                          }}
                        >
                          <span>{course.department}</span>
                          <span>•</span>
                          <span>{course.level}</span>
                          <span>•</span>
                          <span>{course.durationText || `${course.durationYears} Years`}</span>
                          {course.feeRange && (
                            <>
                              <span>•</span>
                              <span style={{ color: '#0F172A', fontWeight: 600 }}>{course.feeRange}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#5B4FE9', fontWeight: 600, fontSize: '0.84rem' }}>
                        <span>Details</span>
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.88rem', color: '#64748B' }}>
                  Information not currently available.
                </p>
              )}
            </div>
          )}

          {activeTab === 'admissions' && (
            <>
              {/* SECTION: ADMISSION / DEADLINES */}
              <div>
                <h4
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#64748B',
                    margin: '0 0 0.5rem',
                  }}
                >
                  Admission Cycles & Deadlines
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.55, margin: 0 }}>
                  {institution.admissionDeadlines || 'Information not currently available.'}
                </p>
              </div>

              {/* SECTION: CONTACT */}
              <div>
                <h4
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#64748B',
                    margin: '0 0 0.65rem',
                  }}
                >
                  Official Contact Details
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  {institution.contactEmail && (
                    <div style={{ padding: '0.85rem', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontSize: '0.78rem', marginBottom: '0.2rem' }}>
                        <Mail size={13} />
                        <span>Admissions Email</span>
                      </div>
                      <a href={`mailto:${institution.contactEmail}`} style={{ color: '#5B4FE9', fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none' }}>
                        {institution.contactEmail}
                      </a>
                    </div>
                  )}

                  {institution.contactPhone && (
                    <div style={{ padding: '0.85rem', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontSize: '0.78rem', marginBottom: '0.2rem' }}>
                        <Phone size={13} />
                        <span>Admissions Phone</span>
                      </div>
                      <span style={{ color: '#0F172A', fontWeight: 600, fontSize: '0.88rem' }}>
                        {institution.contactPhone}
                      </span>
                    </div>
                  )}

                  {institution.address && (
                    <div style={{ padding: '0.85rem', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', gridColumn: '1 / -1' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontSize: '0.78rem', marginBottom: '0.2rem' }}>
                        <MapPin size={13} />
                        <span>Campus Address</span>
                      </div>
                      <span style={{ color: '#0F172A', fontSize: '0.86rem' }}>
                        {institution.address}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION: OFFICIAL WEBSITE */}
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: '12px',
                  background: '#EEF2FF',
                  border: '1px solid #C7D2FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <h5 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#312E81', margin: '0 0 0.2rem' }}>
                    Direct Institution Application & Prospectus
                  </h5>
                  <p style={{ fontSize: '0.82rem', color: '#4338CA', margin: 0 }}>
                    Official verified address: {institution.officialWebsiteUrl}
                  </p>
                </div>
                <a
                  href={institution.officialWebsiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    background: '#5B4FE9',
                    color: '#FFFFFF',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  <span>Open Official Website</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
