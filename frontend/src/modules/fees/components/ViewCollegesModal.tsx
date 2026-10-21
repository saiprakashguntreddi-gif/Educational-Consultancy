import React, { useEffect, useState } from 'react';
import { CollegeTierItem, InstitutionTier } from '../fees.types';
import { FeesService } from '../services/fees.service';
import { X, ExternalLink, GraduationCap, Building2, MapPin, Award } from 'lucide-react';

interface ViewCollegesModalProps {
  isOpen: boolean;
  onClose: () => void;
  country: string;
  tier: InstitutionTier;
  department: string;
  currency: string;
  currencySymbol: string;
}

export const ViewCollegesModal: React.FC<ViewCollegesModalProps> = ({
  isOpen,
  onClose,
  country,
  tier,
  department,
  currency,
  currencySymbol,
}) => {
  const [colleges, setColleges] = useState<CollegeTierItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const tierLabel =
    tier === 'TOP_RANKED'
      ? 'Top Ranked Colleges'
      : tier === 'MID_LEVEL'
      ? 'Mid Level Colleges'
      : 'Emerging Institutes';

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    FeesService.getColleges(country, tier, department, currency)
      .then((res) => {
        if (isMounted) {
          if (res.success && res.data) {
            setColleges(res.data);
          } else {
            setError(res.error?.toString() || 'Failed to load colleges');
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Network error');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, country, tier, department, currency]);

  if (!isOpen) return null;

  return (
    <div className="fees-modal-backdrop" onClick={onClose}>
      <div className="fees-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="fees-modal-header">
          <div>
            <h3 className="fees-modal-title">
              {tierLabel} — {country}
            </h3>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Academic Department: <strong>{department || 'All Fields'}</strong> • Indicative Tuition
            </span>
          </div>
          <button className="fees-modal-close" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        <div className="fees-modal-body">
          {loading && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid #e2e8f0',
                  borderTopColor: '#7cb342',
                  borderRadius: '50%',
                  margin: '0 auto 1rem',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Retrieving institutions in {tierLabel}...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {error && !loading && (
            <div style={{ padding: '1.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.88rem' }}>
              {error}
            </div>
          )}

          {!loading && !error && colleges.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
              No institutions found under {tierLabel} for this query.
            </div>
          )}

          {!loading &&
            !error &&
            colleges.map((col) => (
              <div key={col.id} className="college-preview-card">
                <div className="college-card-top">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                      <Building2 size={16} color="#7cb342" />
                      <span className="college-name">{col.name}</span>
                    </div>
                    <div className="college-details-line">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={13} /> {col.city}, {col.country}
                      </span>
                      {col.rankingInfo && (
                        <span style={{ marginLeft: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#4f46e5', fontWeight: 600 }}>
                          <Award size={13} /> {col.rankingInfo}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="college-fee-badge">
                    {currencySymbol}
                    {col.annualTuitionFee.toLocaleString()} / yr
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                    Acceptance Rate: <strong style={{ color: '#0f172a' }}>{col.acceptanceRate || 'Selective'}</strong>
                  </div>

                  {col.officialWebsiteUrl && (
                    <a
                      href={col.officialWebsiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.78rem',
                        color: '#7cb342',
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      <span>Official Website</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                {col.sampleCourses && col.sampleCourses.length > 0 && (
                  <div className="college-courses-taglist">
                    {col.sampleCourses.map((c, i) => (
                      <span key={i} className="college-course-pill">
                        <GraduationCap size={11} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
