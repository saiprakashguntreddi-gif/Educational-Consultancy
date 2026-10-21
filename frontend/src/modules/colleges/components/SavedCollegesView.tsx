import React, { useState } from 'react';
import {
  Bookmark,
  Building,
  GraduationCap,
  MapPin,
  Trash2,
  ArrowRight,
  Award,
  Clock,
  DollarSign,
} from 'lucide-react';
import { InstitutionSummary, CourseSummary } from '../colleges.types';

interface SavedCollegesViewProps {
  savedInstitutions: InstitutionSummary[];
  savedCourses: CourseSummary[];
  isLoading: boolean;
  onUnsaveInstitution: (id: string) => void;
  onUnsaveCourse: (courseId: string) => void;
  onSelectInstitution: (institution: InstitutionSummary) => void;
  onSelectCourse: (course: CourseSummary) => void;
  onExploreCatalogue: () => void;
}

export const SavedCollegesView: React.FC<SavedCollegesViewProps> = ({
  savedInstitutions,
  savedCourses,
  isLoading,
  onUnsaveInstitution,
  onUnsaveCourse,
  onSelectInstitution,
  onSelectCourse,
  onExploreCatalogue,
}) => {
  const [activeTab, setActiveTab] = useState<'institutions' | 'courses'>('institutions');

  if (isLoading) {
    return (
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '3rem 2rem',
          textAlign: 'center',
          border: '1px solid #EAECF0',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '3px solid #E0E7FF',
            borderTopColor: '#5B4FE9',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: '1rem',
          }}
        />
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#081426', margin: '0 0 0.5rem 0' }}>
          Loading your shortlist...
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#667085', margin: 0 }}>
          Retrieving your saved institutions and courses
        </p>
      </div>
    );
  }

  const totalSaved = savedInstitutions.length + savedCourses.length;

  if (totalSaved === 0) {
    return (
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '4rem 2rem',
          textAlign: 'center',
          border: '1px solid #EAECF0',
          boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: '#EEF2FF',
            color: '#5B4FE9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto',
          }}
        >
          <Bookmark size={32} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#081426', margin: '0 0 0.5rem 0' }}>
          You haven't saved any institutions yet.
        </h3>
        <p style={{ fontSize: '0.9375rem', color: '#667085', maxWidth: '460px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
          As you explore colleges and programs across the catalogue, click "Save" to build your personalized educational shortlist.
        </p>
        <button
          onClick={onExploreCatalogue}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '10px',
            fontSize: '0.9375rem',
            fontWeight: 600,
            background: '#5B4FE9',
            color: '#FFFFFF',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(91, 79, 233, 0.2)',
          }}
        >
          Explore Institutions
          <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Shortlist Switcher Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          background: '#FFFFFF',
          padding: '0.75rem 1.25rem',
          borderRadius: '12px',
          border: '1px solid #EAECF0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('institutions')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              border: activeTab === 'institutions' ? '1px solid #5B4FE9' : '1px solid transparent',
              background: activeTab === 'institutions' ? '#EEF2FF' : 'transparent',
              color: activeTab === 'institutions' ? '#4338CA' : '#64748B',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Building size={16} />
            Saved Institutions ({savedInstitutions.length})
          </button>

          <button
            onClick={() => setActiveTab('courses')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              border: activeTab === 'courses' ? '1px solid #5B4FE9' : '1px solid transparent',
              background: activeTab === 'courses' ? '#EEF2FF' : 'transparent',
              color: activeTab === 'courses' ? '#4338CA' : '#64748B',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <GraduationCap size={16} />
            Saved Programs ({savedCourses.length})
          </button>
        </div>

        <button
          onClick={onExploreCatalogue}
          style={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: '#5B4FE9',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          Explore More Institutions
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Tab: Saved Institutions */}
      {activeTab === 'institutions' && (
        <>
          {savedInstitutions.length === 0 ? (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '3rem 1.5rem',
                textAlign: 'center',
                border: '1px solid #EAECF0',
                color: '#667085',
              }}
            >
              No institutions currently saved. Explore the catalog to shortlist colleges.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {savedInstitutions.map((inst) => (
                <div
                  key={inst.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '14px',
                    border: '1px solid #EAECF0',
                    padding: '1.25rem',
                    boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <h4
                        onClick={() => onSelectInstitution(inst)}
                        style={{
                          fontSize: '1.0625rem',
                          fontWeight: 700,
                          color: '#081426',
                          margin: 0,
                          lineHeight: 1.3,
                          cursor: 'pointer',
                        }}
                      >
                        {inst.name}
                      </h4>
                      <button
                        onClick={() => onUnsaveInstitution(inst.id)}
                        style={{
                          background: '#FEF2F2',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.35rem',
                          color: '#DC2626',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                        title="Remove from shortlist"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748B', fontSize: '0.8125rem', marginBottom: '0.75rem' }}>
                      <MapPin size={13} color="#5B4FE9" />
                      <span>{inst.city}, {inst.country}</span>
                    </div>

                    {inst.rankingInfo && (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.2rem 0.5rem',
                          background: '#FEF3C7',
                          color: '#92400E',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          marginBottom: '0.75rem',
                        }}
                      >
                        <Award size={13} />
                        {inst.rankingInfo}
                      </div>
                    )}

                    <p
                      style={{
                        fontSize: '0.8125rem',
                        color: '#475569',
                        lineHeight: 1.5,
                        margin: '0 0 1rem 0',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {inst.overview}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #F1F5F9',
                      paddingTop: '0.875rem',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                      {inst.coursesCount} Programs Listed
                    </span>
                    <button
                      onClick={() => onSelectInstitution(inst)}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '6px',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        background: '#5B4FE9',
                        color: '#FFFFFF',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab: Saved Courses */}
      {activeTab === 'courses' && (
        <>
          {savedCourses.length === 0 ? (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '3rem 1.5rem',
                textAlign: 'center',
                border: '1px solid #EAECF0',
                color: '#667085',
              }}
            >
              No programs currently saved. Explore institutions to shortlist specific courses.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {savedCourses.map((crs) => (
                <div
                  key={crs.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '14px',
                    border: '1px solid #EAECF0',
                    padding: '1.25rem',
                    boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.35rem' }}>
                      <div>
                        <span
                          style={{
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            background: '#EEF2FF',
                            color: '#4338CA',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            marginRight: '0.4rem',
                          }}
                        >
                          {crs.level}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                          {crs.department}
                        </span>
                      </div>
                      <button
                        onClick={() => onUnsaveCourse(crs.id)}
                        style={{
                          background: '#FEF2F2',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.35rem',
                          color: '#DC2626',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                        title="Remove program from shortlist"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <h4
                      onClick={() => onSelectCourse(crs)}
                      style={{
                        fontSize: '1.0625rem',
                        fontWeight: 700,
                        color: '#081426',
                        margin: '0.25rem 0 0.5rem 0',
                        lineHeight: 1.3,
                        cursor: 'pointer',
                      }}
                    >
                      {crs.name}
                    </h4>

                    {crs.institutionName && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748B', fontSize: '0.8125rem', marginBottom: '0.75rem' }}>
                        <Building size={13} color="#5B4FE9" />
                        <span>{crs.institutionName}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.75rem', color: '#64748B', marginBottom: '1rem' }}>
                      {crs.durationText && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={12} /> {crs.durationText}
                        </span>
                      )}
                      {(crs.feeRange || crs.annualTuitionFee) && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#081426', fontWeight: 600 }}>
                          <DollarSign size={12} color="#059669" />
                          {crs.feeRange || `${crs.feeCurrency || '$'}${crs.annualTuitionFee?.toLocaleString()}/yr`}
                        </span>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #F1F5F9',
                      paddingTop: '0.875rem',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', color: crs.scholarshipAvailable ? '#059669' : '#64748B', fontWeight: 600 }}>
                      {crs.scholarshipAvailable ? '✓ Scholarship Available' : 'Standard Tuition'}
                    </span>
                    <button
                      onClick={() => onSelectCourse(crs)}
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderRadius: '6px',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        background: '#5B4FE9',
                        color: '#FFFFFF',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Program Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
