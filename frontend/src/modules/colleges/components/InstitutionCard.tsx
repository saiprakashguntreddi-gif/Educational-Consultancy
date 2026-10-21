import React from 'react';
import {
  MapPin,
  Building,
  Award,
  BookOpen,
  Bookmark,
  Scale,
  ArrowRight,
  Check,
} from 'lucide-react';
import { InstitutionSummary } from '../colleges.types';

interface InstitutionCardProps {
  institution: InstitutionSummary;
  onViewDetails: (institution: InstitutionSummary) => void;
  onToggleSave: (institution: InstitutionSummary) => void;
  onToggleCompare: (institution: InstitutionSummary) => void;
  isSaved: boolean;
  isCompared: boolean;
}

export const InstitutionCard: React.FC<InstitutionCardProps> = ({
  institution,
  onViewDetails,
  onToggleSave,
  onToggleCompare,
  isSaved,
  isCompared,
}) => {
  return (
    <div
      id={`college-card-${institution.slug}`}
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '1.25rem',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = '#C7D2FE';
        e.currentTarget.style.boxShadow = '0 10px 24px -4px rgba(91, 79, 233, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = '#E2E8F0';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(15, 23, 42, 0.04)';
      }}
    >
      <div>
        {/* Top Header Row: Ranking Pill + Quick Action Icons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            marginBottom: '0.75rem',
          }}
        >
          {institution.rankingInfo ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#4338CA',
                background: '#EEF2FF',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                border: '1px solid #E0E7FF',
              }}
            >
              <Award size={12} />
              <span>{institution.rankingInfo}</span>
            </span>
          ) : (
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 600,
                color: '#64748B',
                background: '#F1F5F9',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
              }}
            >
              Verified Institution
            </span>
          )}

          {/* Save Bookmark Button */}
          <button
            onClick={() => onToggleSave(institution)}
            style={{
              background: isSaved ? '#FEF3C7' : '#F8FAFC',
              border: isSaved ? '1px solid #FDE68A' : '1px solid #E2E8F0',
              color: isSaved ? '#D97706' : '#64748B',
              borderRadius: '8px',
              padding: '0.4rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            title={isSaved ? 'Remove from Saved' : 'Save Institution'}
          >
            <Bookmark size={16} fill={isSaved ? '#D97706' : 'none'} />
          </button>
        </div>

        {/* Institution Name */}
        <h3
          onClick={() => onViewDetails(institution)}
          style={{
            fontSize: '1.2rem',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.02em',
            margin: '0 0 0.35rem',
            lineHeight: 1.35,
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#5B4FE9')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#0F172A')}
        >
          {institution.name}
        </h3>

        {/* Location & Type */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            flexWrap: 'wrap',
            fontSize: '0.82rem',
            color: '#64748B',
            marginBottom: '0.85rem',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            <MapPin size={13} color="#94A3B8" />
            <span>
              {institution.city}, {institution.country}
            </span>
          </span>

          {institution.institutionType && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <Building size={13} color="#94A3B8" />
              <span>{institution.institutionType}</span>
            </span>
          )}
        </div>

        {/* Short Description */}
        <p
          style={{
            fontSize: '0.86rem',
            color: '#475569',
            lineHeight: 1.5,
            margin: '0 0 1rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {institution.overview}
        </p>

        {/* Highlights Bar: Programs Preview + Scholarships */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid #F1F5F9',
            fontSize: '0.8rem',
          }}
        >
          {/* Programs count & preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#334155' }}>
            <BookOpen size={14} color="#5B4FE9" />
            <span style={{ fontWeight: 700 }}>{institution.coursesCount} Programs</span>
            {institution.popularPrograms.length > 0 && (
              <span style={{ color: '#64748B', fontSize: '0.78rem' }}>
                • {institution.popularPrograms[0]}
              </span>
            )}
          </div>

          {/* Scholarship Badge */}
          {institution.hasScholarships && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#16A34A', fontSize: '0.78rem', fontWeight: 600 }}>
              <Check size={13} />
              <span>Scholarships & Financial Aid Available</span>
            </div>
          )}

          {/* Entrance Exams Required */}
          {institution.entranceExams.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
              <span style={{ color: '#64748B', fontSize: '0.74rem', fontWeight: 600 }}>Exams:</span>
              {institution.entranceExams.slice(0, 3).map((exam) => (
                <span
                  key={exam}
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.45rem',
                    borderRadius: '4px',
                    background: '#F1F5F9',
                    color: '#475569',
                  }}
                >
                  {exam}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.65rem',
          paddingTop: '1rem',
          borderTop: '1px solid #F1F5F9',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => onViewDetails(institution)}
          id={`view-details-${institution.slug}`}
          style={{
            flex: 1,
            minWidth: '110px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            padding: '0.55rem 0.85rem',
            borderRadius: '8px',
            background: '#5B4FE9',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#4338CA')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#5B4FE9')}
        >
          <span>View Details</span>
          <ArrowRight size={14} />
        </button>

        <button
          onClick={() => onToggleCompare(institution)}
          id={`compare-btn-${institution.slug}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.55rem 0.85rem',
            borderRadius: '8px',
            background: isCompared ? '#EEF2FF' : '#F8FAFC',
            border: isCompared ? '1px solid #5B4FE9' : '1px solid #CBD5E1',
            color: isCompared ? '#5B4FE9' : '#475569',
            fontSize: '0.84rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title={isCompared ? 'Remove from Comparison' : 'Add to Comparison'}
        >
          <Scale size={14} />
          <span>{isCompared ? 'Comparing' : 'Compare'}</span>
        </button>
      </div>
    </div>
  );
};
