import React from 'react';
import { X, Info, TrendingUp } from 'lucide-react';
import { RecommendationItemDto } from '../recommendations.types';

interface CohortScatterPlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: RecommendationItemDto | null;
}

export const CohortScatterPlotModal: React.FC<CohortScatterPlotModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  if (!isOpen || !item) return null;

  const cohort = item.evidence.cohortContext;
  const p25 = cohort.percentile25thGpa || 70;
  const p50 = cohort.percentile50thGpa || 78;
  const p75 = cohort.percentile75thGpa || 86;
  const studentVal = cohort.studentPlotPoint.gpaOrPercentage || 75;
  const studentSat = cohort.studentPlotPoint.standardizedScore || 1350;

  // Normalization for SVG canvas (Width: 500, Height: 300)
  // X: SAT Score (1000 to 1600) -> 50 to 450
  // Y: Percentage (60 to 100) -> 260 to 40 (inverted)
  const mapX = (sat: number) => 50 + ((Math.min(1600, Math.max(1000, sat)) - 1000) / 600) * 400;
  const mapY = (pct: number) => 260 - ((Math.min(100, Math.max(60, pct)) - 60) / 40) * 220;

  const x25 = mapX(cohort.percentile25thSat || 1200);
  const x75 = mapX(cohort.percentile75thSat || 1500);
  const y25 = mapY(p25);
  const y75 = mapY(p75);
  const studentX = mapX(studentSat);
  const studentY = mapY(studentVal);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 10, 25, 0.82)',
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
          maxWidth: '680px',
          width: '100%',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          color: '#F8FAFC',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#A5B4FC',
              }}
            >
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                Academic Scatter-Plot Context
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0.15rem 0 0 0' }}>
                {item.institutionName} • Cohort Positioning
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              color: '#94A3B8',
              borderRadius: '8px',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {/* Scatter Plot Visual SVG */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '14px',
              padding: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <svg viewBox="0 0 500 300" style={{ width: '100%', height: 'auto', display: 'block' }}>
              {/* Grid Lines */}
              <line x1="50" y1="40" x2="450" y2="40" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
              <line x1="50" y1="95" x2="450" y2="95" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
              <line x1="50" y1="150" x2="450" y2="150" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
              <line x1="50" y1="205" x2="450" y2="205" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
              <line x1="50" y1="260" x2="450" y2="260" stroke="rgba(255,255,255,0.2)" />
              <line x1="50" y1="40" x2="50" y2="260" stroke="rgba(255,255,255,0.2)" />

              {/* Y-Axis Labels */}
              <text x="42" y="44" fill="#64748B" fontSize="10" textAnchor="end">100%</text>
              <text x="42" y="154" fill="#64748B" fontSize="10" textAnchor="end">80%</text>
              <text x="42" y="264" fill="#64748B" fontSize="10" textAnchor="end">60%</text>

              {/* X-Axis Labels */}
              <text x="50" y="278" fill="#64748B" fontSize="10" textAnchor="middle">1000 SAT</text>
              <text x="250" y="278" fill="#64748B" fontSize="10" textAnchor="middle">1300 SAT</text>
              <text x="450" y="278" fill="#64748B" fontSize="10" textAnchor="middle">1600 SAT</text>

              {/* 25th - 75th Percentile Admitted Cohort Box */}
              <rect
                x={x25}
                y={y75}
                width={Math.max(40, x75 - x25)}
                height={Math.max(30, y25 - y75)}
                fill="rgba(99, 102, 241, 0.18)"
                stroke="#6366F1"
                strokeWidth="1.5"
                strokeDasharray="4,4"
                rx="6"
              />
              <text
                x={(x25 + x75) / 2}
                y={y75 - 8}
                fill="#818CF8"
                fontSize="10"
                fontWeight="600"
                textAnchor="middle"
              >
                Admitted Mid-50% Band ({p25}% – {p75}%)
              </text>

              {/* Median 50th line */}
              <line
                x1={x25}
                y1={mapY(p50)}
                x2={x75}
                y2={mapY(p50)}
                stroke="#A5B4FC"
                strokeWidth="1.5"
              />

              {/* Student Plotted Point with Pulse */}
              <circle cx={studentX} cy={studentY} r="12" fill="rgba(236, 72, 153, 0.25)" />
              <circle cx={studentX} cy={studentY} r="6" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="2" />
              <text
                x={studentX}
                y={studentY - 14}
                fill="#FDA4AF"
                fontSize="11"
                fontWeight="700"
                textAnchor="middle"
              >
                Your Position ({studentVal}%)
              </text>
            </svg>
          </div>

          {/* Key Metrics Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                padding: '0.75rem',
                borderRadius: '10px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>25th Percentile</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#E2E8F0', marginTop: '0.2rem' }}>
                {p25}%
              </div>
            </div>

            <div
              style={{
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                padding: '0.75rem',
                borderRadius: '10px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#A5B4FC' }}>Median Admitted (50th)</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#C7D2FE', marginTop: '0.2rem' }}>
                {p50}%
              </div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                padding: '0.75rem',
                borderRadius: '10px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>75th Percentile</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#E2E8F0', marginTop: '0.2rem' }}>
                {p75}%
              </div>
            </div>
          </div>

          {/* Data Limitation Notice (Rule 7) */}
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
                <strong>Indicative Data Limitation: </strong>
                {item.dataLimitationNote ||
                  'Historical admission statistics are indicative estimates based on published academic eligibility and institutional selectivity.'}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            className="btn-primary-indigo"
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
          >
            Close Plot
          </button>
        </div>
      </div>
    </div>
  );
};
