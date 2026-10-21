import React from 'react';
import {
  MapPin,
  Bookmark,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { RecommendationItemDto } from '../recommendations.types';

interface RecommendationCardProps {
  item: RecommendationItemDto;
  onOpenEvidence: (item: RecommendationItemDto) => void;
  onOpenScatterPlot: (item: RecommendationItemDto) => void;
  onToggleShortlist: (itemId: string) => void;
  isShortlistLoading?: boolean;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  item,
  onOpenEvidence,
  onOpenScatterPlot,
  onToggleShortlist,
  isShortlistLoading,
}) => {
  const tierConfig = {
    SAFE: {
      label: 'Safe Option',
      rangeText: '>95% Chance',
      badgeBg: 'rgba(34, 197, 94, 0.15)',
      badgeBorder: 'rgba(34, 197, 94, 0.35)',
      badgeColor: '#4ADE80',
      barColor: '#22C55E',
    },
    BEST_FIT: {
      label: 'Best-Fit Match',
      rangeText: '50% – 95% Chance',
      badgeBg: 'rgba(99, 102, 241, 0.15)',
      badgeBorder: 'rgba(99, 102, 241, 0.35)',
      badgeColor: '#A5B4FC',
      barColor: '#6366F1',
    },
    ASPIRATIONAL: {
      label: 'Aspirational Reach',
      rangeText: '<50% Chance',
      badgeBg: 'rgba(245, 158, 11, 0.15)',
      badgeBorder: 'rgba(245, 158, 11, 0.35)',
      badgeColor: '#FCD34D',
      barColor: '#F59E0B',
    },
  }[item.effectiveTier];

  return (
    <div
      style={{
        background: 'rgba(18, 31, 71, 0.65)',
        border: '1px solid rgba(221, 214, 254, 0.12)',
        borderRadius: '16px',
        padding: '1.4rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.25s ease',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="recommendation-card"
    >
      {/* Top Row: Tier Pill & Fit Score */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                background: tierConfig.badgeBg,
                border: `1px solid ${tierConfig.badgeBorder}`,
                color: tierConfig.badgeColor,
                padding: '0.22rem 0.65rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {tierConfig.label}
            </span>

            {item.counsellorTierOverride && (
              <span
                style={{
                  background: 'rgba(139, 92, 246, 0.18)',
                  color: '#C4B5FD',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '10px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                }}
                title="Counsellor adjusted tier"
              >
                Counsellor Adjusted
              </span>
            )}
          </div>

          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 800,
                color: '#FFFFFF',
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '0.2rem 0.55rem',
                borderRadius: '8px',
              }}
            >
              {item.fitScore}% Fit
            </span>
          </div>
        </div>

        {/* College Name & Location */}
        <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '0.85rem' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#C7D2FE',
              fontWeight: 800,
              fontSize: '1rem',
              flexShrink: 0,
            }}
          >
            {item.institutionName.charAt(0)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#FFFFFF',
                margin: 0,
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={item.institutionName}
            >
              {item.institutionName}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94A3B8', fontSize: '0.82rem', marginTop: '0.2rem' }}>
              <MapPin size={13} color="#A78BFA" />
              <span>{item.institutionCity}, {item.institutionCountry}</span>
              {item.rankingInfo && (
                <span style={{ color: '#CBD5E1', fontSize: '0.78rem' }}>• {item.rankingInfo}</span>
              )}
            </div>
          </div>
        </div>

        {/* Admission Probability Bar */}
        <div style={{ marginBottom: '1rem', background: 'rgba(0, 0, 0, 0.2)', padding: '0.65rem 0.75rem', borderRadius: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
            <span style={{ color: '#94A3B8' }}>Admission Likelihood:</span>
            <span style={{ color: tierConfig.badgeColor, fontWeight: 700 }}>
              {item.admissionProbabilityMin}% – {item.admissionProbabilityMax}%
            </span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min(100, item.admissionProbabilityMax)}%`,
                height: '100%',
                background: tierConfig.barColor,
                borderRadius: '3px',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* Target Course / Department Match */}
        <div style={{ fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '0.75rem' }}>
          <span style={{ color: '#94A3B8' }}>Program Match: </span>
          <strong>{item.courseName || item.courseDepartment || 'Department Program'}</strong>
        </div>

        {/* Rationale Snippet */}
        <p
          style={{
            fontSize: '0.85rem',
            color: '#94A3B8',
            lineHeight: 1.45,
            margin: '0 0 1rem 0',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
          title={item.reasonSummary}
        >
          {item.reasonSummary}
        </p>
      </div>

      {/* Card Actions */}
      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            onClick={() => onOpenEvidence(item)}
            className="btn-secondary-outline"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
            title="View evidence breakdown"
          >
            <FileText size={14} />
            <span>Evidence</span>
          </button>

          <button
            onClick={() => onOpenScatterPlot(item)}
            className="btn-secondary-outline"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
            title="View cohort scatter plot"
          >
            <TrendingUp size={14} />
            <span>Scatter Plot</span>
          </button>
        </div>

        <button
          onClick={() => onToggleShortlist(item.id)}
          disabled={isShortlistLoading}
          style={{
            background: item.isShortlisted ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${item.isShortlisted ? '#6366F1' : 'rgba(255, 255, 255, 0.1)'}`,
            color: item.isShortlisted ? '#C7D2FE' : '#94A3B8',
            borderRadius: '8px',
            padding: '0.4rem 0.75rem',
            fontSize: '0.78rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          title={item.isShortlisted ? 'In application shortlist' : 'Add to shortlist'}
        >
          <Bookmark size={14} fill={item.isShortlisted ? '#6366F1' : 'none'} />
          <span>{item.isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
        </button>
      </div>
    </div>
  );
};
