import React from 'react';
import {
  Scale,
  Trash2,
  ExternalLink,
  MapPin,
  Award,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { InstitutionDetail } from '../colleges.types';

interface CollegeCompareViewProps {
  institutions: InstitutionDetail[];
  isLoading: boolean;
  onRemoveInstitution: (id: string) => void;
  onClearComparison: () => void;
  onSelectInstitution: (institution: InstitutionDetail) => void;
  onBrowseColleges: () => void;
}

export const CollegeCompareView: React.FC<CollegeCompareViewProps> = ({
  institutions,
  isLoading,
  onRemoveInstitution,
  onClearComparison,
  onSelectInstitution,
  onBrowseColleges,
}) => {
  if (isLoading) {
    return (
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '3rem 2rem',
          textAlign: 'center',
          border: '1px solid #EAECF0',
          boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
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
          Loading comparison matrix...
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#667085', margin: 0 }}>
          Aligning institutional parameters side by side
        </p>
      </div>
    );
  }

  if (!institutions || institutions.length === 0) {
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
          <Scale size={32} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#081426', margin: '0 0 0.5rem 0' }}>
          Select institutions to compare them.
        </h3>
        <p style={{ fontSize: '0.9375rem', color: '#667085', maxWidth: '460px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
          You can select up to 4 colleges from the discovery catalogue to evaluate academic offerings, verified rankings, campus facilities, and fees side-by-side.
        </p>
        <button
          onClick={onBrowseColleges}
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
          Explore Catalogue
          <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Compare Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          background: '#FFFFFF',
          padding: '1rem 1.25rem',
          borderRadius: '12px',
          border: '1px solid #EAECF0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '8px',
              background: '#EEF2FF',
              color: '#4338CA',
              fontSize: '0.8125rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Scale size={15} />
            {institutions.length} of 4 Institutions Selected
          </div>
          <span style={{ fontSize: '0.8125rem', color: '#667085' }}>
            Comparison data is retrieved directly from verified catalog records.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={onBrowseColleges}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              background: '#F8FAFC',
              border: '1px solid #D1D5DB',
              color: '#374151',
              cursor: 'pointer',
            }}
          >
            + Add Another Institution
          </button>
          <button
            onClick={onClearComparison}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              background: '#FEF2F2',
              border: '1px solid #FEE2E2',
              color: '#DC2626',
              cursor: 'pointer',
            }}
          >
            <Trash2 size={14} />
            Clear Comparison
          </button>
        </div>
      </div>

      {/* Comparison Matrix Table with Isolated Internal Scroll */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #EAECF0',
          boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
          overflow: 'hidden',
          width: '100%',
        }}
      >
        <div
          style={{
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            width: '100%',
          }}
        >
          <table
            style={{
              width: '100%',
              minWidth: institutions.length <= 2 ? '650px' : '900px',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.875rem',
            }}
          >
            {/* Header: Institution Name & Quick actions */}
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E5E7EB' }}>
                <th
                  style={{
                    padding: '1.25rem 1rem',
                    width: '200px',
                    minWidth: '180px',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#64748B',
                    letterSpacing: '0.05em',
                  }}
                >
                  Dimension
                </th>
                {institutions.map((inst) => (
                  <th
                    key={inst.id}
                    style={{
                      padding: '1.25rem 1rem',
                      width: `${100 / institutions.length}%`,
                      minWidth: '220px',
                      verticalAlign: 'top',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <h4
                          onClick={() => onSelectInstitution(inst)}
                          style={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: '#081426',
                            margin: 0,
                            lineHeight: 1.3,
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            textDecorationColor: 'transparent',
                            transition: 'text-decoration-color 0.2s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.textDecorationColor = '#5B4FE9')}
                          onMouseLeave={(e) => (e.currentTarget.style.textDecorationColor = 'transparent')}
                        >
                          {inst.name}
                        </h4>
                        <button
                          onClick={() => onRemoveInstitution(inst.id)}
                          style={{
                            background: '#F1F5F9',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.3rem',
                            color: '#64748B',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title="Remove from comparison"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748B', fontSize: '0.8125rem' }}>
                        <MapPin size={13} color="#5B4FE9" />
                        <span>{inst.city}, {inst.country}</span>
                      </div>

                      <button
                        onClick={() => onSelectInstitution(inst)}
                        style={{
                          marginTop: '0.25rem',
                          padding: '0.35rem 0.65rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: '#5B4FE9',
                          color: '#FFFFFF',
                          border: 'none',
                          cursor: 'pointer',
                          alignSelf: 'flex-start',
                        }}
                      >
                        View Full Profile
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Row: Location */}
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: '#081426', background: '#FAFAFA' }}>
                  Location
                </td>
                {institutions.map((inst) => (
                  <td key={inst.id} style={{ padding: '1rem', color: '#334155' }}>
                    {inst.city}, {inst.state ? `${inst.state}, ` : ''}{inst.country}
                  </td>
                ))}
              </tr>

              {/* Row: Institution Type & Established */}
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: '#081426', background: '#FAFAFA' }}>
                  Institution Type
                </td>
                {institutions.map((inst) => (
                  <td key={inst.id} style={{ padding: '1rem', color: '#334155' }}>
                    {inst.institutionType ? (
                      <span>{inst.institutionType} {inst.establishedYear ? `(Est. ${inst.establishedYear})` : ''}</span>
                    ) : (
                      <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Information not currently available.</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Row: Rankings */}
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: '#081426', background: '#FAFAFA' }}>
                  Rankings
                </td>
                {institutions.map((inst) => (
                  <td key={inst.id} style={{ padding: '1rem', color: '#334155' }}>
                    {inst.rankingInfo ? (
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.25rem 0.5rem',
                          background: '#FEF3C7',
                          color: '#92400E',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '0.8125rem',
                        }}
                      >
                        <Award size={14} />
                        {inst.rankingInfo}
                      </div>
                    ) : (
                      <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Information not currently available.</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Row: Annual Tuition Fees */}
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: '#081426', background: '#FAFAFA' }}>
                  Annual Fees
                </td>
                {institutions.map((inst) => (
                  <td key={inst.id} style={{ padding: '1rem', color: '#334155' }}>
                    {inst.minAnnualFee ? (
                      <div style={{ fontWeight: 600, color: '#081426' }}>
                        {inst.feeCurrency || '$'}{inst.minAnnualFee.toLocaleString()}
                        {inst.maxAnnualFee && inst.maxAnnualFee !== inst.minAnnualFee
                          ? ` - ${inst.feeCurrency || '$'}${inst.maxAnnualFee.toLocaleString()}`
                          : ''}
                        /year
                      </div>
                    ) : (
                      <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Information not currently available.</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Row: Scholarships */}
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: '#081426', background: '#FAFAFA' }}>
                  Scholarships
                </td>
                {institutions.map((inst) => (
                  <td key={inst.id} style={{ padding: '1rem', color: '#334155' }}>
                    {inst.hasScholarships ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckCircle size={14} /> Available
                        </span>
                        {inst.scholarshipDetails && (
                          <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                            {inst.scholarshipDetails}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Information not currently available.</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Row: Entrance Exams */}
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: '#081426', background: '#FAFAFA' }}>
                  Entrance Exams
                </td>
                {institutions.map((inst) => (
                  <td key={inst.id} style={{ padding: '1rem', color: '#334155' }}>
                    {inst.entranceExams && inst.entranceExams.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {inst.entranceExams.map((exam, i) => (
                          <span
                            key={i}
                            style={{
                              padding: '0.2rem 0.5rem',
                              background: '#F1F5F9',
                              border: '1px solid #CBD5E1',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                          >
                            {exam}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Information not currently available.</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Row: Programs & Offerings */}
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: '#081426', background: '#FAFAFA' }}>
                  Available Programs
                </td>
                {institutions.map((inst) => (
                  <td key={inst.id} style={{ padding: '1rem', color: '#334155' }}>
                    <div style={{ fontWeight: 600, color: '#081426', marginBottom: '0.35rem' }}>
                      {inst.coursesCount} Programs Listed
                    </div>
                    {inst.popularPrograms && inst.popularPrograms.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8125rem', color: '#475569' }}>
                        {inst.popularPrograms.slice(0, 3).map((prog, i) => (
                          <li key={i} style={{ marginBottom: '0.2rem' }}>{prog}</li>
                        ))}
                      </ul>
                    ) : (
                      <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Information not currently available.</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Row: Campus Facilities */}
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: '#081426', background: '#FAFAFA' }}>
                  Campus Facilities
                </td>
                {institutions.map((inst) => (
                  <td key={inst.id} style={{ padding: '1rem', color: '#334155' }}>
                    {inst.campusFacilities && inst.campusFacilities.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {inst.campusFacilities.map((fac, i) => (
                          <span
                            key={i}
                            style={{
                              padding: '0.2rem 0.5rem',
                              background: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              color: '#334155',
                            }}
                          >
                            {fac}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Information not currently available.</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Row: Placements */}
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: '#081426', background: '#FAFAFA' }}>
                  Placement Info
                </td>
                {institutions.map((inst) => (
                  <td key={inst.id} style={{ padding: '1rem', color: '#334155' }}>
                    {inst.placementInfo ? (
                      <span style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>{inst.placementInfo}</span>
                    ) : (
                      <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Information not currently available.</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Row: Admission Deadlines */}
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: '#081426', background: '#FAFAFA' }}>
                  Deadlines
                </td>
                {institutions.map((inst) => (
                  <td key={inst.id} style={{ padding: '1rem', color: '#334155' }}>
                    {inst.admissionDeadlines ? (
                      <span style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>{inst.admissionDeadlines}</span>
                    ) : (
                      <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Information not currently available.</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Row: Official Website */}
              <tr>
                <td style={{ padding: '1rem', fontWeight: 600, color: '#081426', background: '#FAFAFA' }}>
                  Official Website
                </td>
                {institutions.map((inst) => (
                  <td key={inst.id} style={{ padding: '1rem' }}>
                    {inst.officialWebsiteUrl ? (
                      <a
                        href={inst.officialWebsiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          color: '#5B4FE9',
                          textDecoration: 'none',
                          fontWeight: 600,
                          fontSize: '0.8125rem',
                        }}
                      >
                        Visit Website
                        <ExternalLink size={13} />
                      </a>
                    ) : (
                      <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>Information not currently available.</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
