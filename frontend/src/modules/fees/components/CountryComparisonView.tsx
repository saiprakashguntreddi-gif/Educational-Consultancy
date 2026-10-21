import React, { useEffect, useState } from 'react';
import { FeesService } from '../services/fees.service';
import {
  MultiCountryComparisonResult,
  InstitutionTier,
  CountryMetaItem,
} from '../fees.types';
import {
  Scale,
  Sparkles,
  Check,
} from 'lucide-react';

interface CountryComparisonViewProps {
  selectedCountries: string[];
  allCountries: CountryMetaItem[];
  department: string;
  tier: InstitutionTier;
  currency: string;
  currencySymbol: string;
  onSelectCountry: (countryName: string) => void;
}

export const CountryComparisonView: React.FC<CountryComparisonViewProps> = ({
  selectedCountries,
  allCountries,
  department,
  tier,
  currency,
  currencySymbol,
  onSelectCountry,
}) => {
  const [countriesToCompare, setCountriesToCompare] = useState<string[]>(
    selectedCountries.length >= 2
      ? selectedCountries
      : ['United States', 'United Kingdom', 'Canada', 'Germany']
  );
  const [comparison, setComparison] = useState<MultiCountryComparisonResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const tierLabel =
    tier === 'TOP_RANKED'
      ? 'Top Ranked'
      : tier === 'MID_LEVEL'
      ? 'Mid Level'
      : 'Emerging';

  const loadComparison = (targetCountries: string[]) => {
    setLoading(true);
    setError(null);
    FeesService.compare(targetCountries, department, tier, currency)
      .then((res) => {
        if (res.success && res.data) {
          setComparison(res.data);
        } else {
          setError(res.error?.toString() || 'Failed to compare countries');
        }
      })
      .catch((err) => {
        setError(err.message || 'Network error');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadComparison(countriesToCompare);
  }, [department, tier, currency]);

  const toggleCountry = (countryName: string) => {
    let updated: string[];
    if (countriesToCompare.includes(countryName)) {
      if (countriesToCompare.length <= 2) {
        // Prevent having fewer than 2 countries
        return;
      }
      updated = countriesToCompare.filter((c) => c !== countryName);
    } else {
      updated = [...countriesToCompare, countryName];
    }
    setCountriesToCompare(updated);
    loadComparison(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Controller Bar */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Scale size={20} color="#7cb342" />
              Side-by-Side Country Comparison
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
              Comparing {countriesToCompare.length} destination countries for <strong>{department}</strong> ({tierLabel} institutions).
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#475569' }}>
            <span style={{ fontWeight: 600 }}>Active Tier:</span>
            <span style={{ background: '#f1f5f9', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: 700, color: '#1e293b' }}>
              {tierLabel}
            </span>
          </div>
        </div>

        {/* Quick Country Selection Pills */}
        <div>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.5rem' }}>
            Toggle Countries to Compare (Min 2):
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {allCountries.map((c) => {
              const isSelected = countriesToCompare.includes(c.name);
              return (
                <button
                  key={c.code}
                  onClick={() => toggleCountry(c.name)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: isSelected ? '1px solid #7cb342' : '1px solid #cbd5e1',
                    background: isSelected ? '#edf7e4' : '#ffffff',
                    color: isSelected ? '#2e5a10' : '#475569',
                    transition: 'all 0.15s',
                  }}
                >
                  <span>{c.flag}</span>
                  <span>{c.name}</span>
                  {isSelected && <Check size={13} color="#2e5a10" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              border: '3px solid #e2e8f0',
              borderTopColor: '#7cb342',
              borderRadius: '50%',
              margin: '0 auto 1rem',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <p style={{ margin: 0, fontSize: '0.92rem' }}>Normalizing currencies and calculating comparison matrix...</p>
        </div>
      )}

      {error && !loading && (
        <div style={{ padding: '1.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#b91c1c' }}>
          {error}
        </div>
      )}

      {/* Side-by-Side Comparison Cards */}
      {!loading && comparison && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(comparison.countries.length, 4)}, 1fr)`,
              gap: '1.25rem',
            }}
            className="comparison-cards-grid"
          >
            {comparison.countries.map((c) => {
              const isMostAffordable = c.affordabilityRank === 1;
              return (
                <div
                  key={c.countryCode}
                  style={{
                    background: '#ffffff',
                    border: isMostAffordable ? '2px solid #7cb342' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    boxShadow: isMostAffordable
                      ? '0 6px 16px rgba(124, 179, 66, 0.18)'
                      : '0 1px 3px rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                  }}
                >
                  {isMostAffordable && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#7cb342',
                        color: '#ffffff',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.65rem',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Sparkles size={11} /> MOST AFFORDABLE
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{c.flag}</span>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{c.country}</span>
                    </div>

                    <span
                      className={`rank-badge ${
                        c.affordabilityRank === 1
                          ? 'rank-1'
                          : c.affordabilityRank === 2
                          ? 'rank-2'
                          : 'rank-3'
                      }`}
                      title={`Affordability Rank #${c.affordabilityRank}`}
                    >
                      #{c.affordabilityRank}
                    </span>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                      Total Estimated Annual Cost
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>
                      {currencySymbol}
                      {c.totalEstimatedAnnualCost.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                      ~{currencySymbol}{Math.round(c.totalEstimatedAnnualCost / 12).toLocaleString()} / month
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Tuition ({tierLabel}):</span>
                      <strong style={{ color: '#0f172a' }}>
                        {currencySymbol}
                        {(tier === 'TOP_RANKED'
                          ? c.topRankedAvgTuition
                          : tier === 'MID_LEVEL'
                          ? c.midLevelAvgTuition
                          : c.emergingAvgTuition
                        ).toLocaleString()}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Living Expenses:</span>
                      <strong style={{ color: '#0f172a' }}>
                        {currencySymbol}
                        {c.avgLivingExpenses.toLocaleString()}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Health Insurance:</span>
                      <strong style={{ color: '#0f172a' }}>
                        {currencySymbol}
                        {c.avgHealthInsurance.toLocaleString()}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Travel & Visa:</span>
                      <strong style={{ color: '#0f172a' }}>
                        {currencySymbol}
                        {c.avgTravelExpenses.toLocaleString()}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Personal & Misc:</span>
                      <strong style={{ color: '#0f172a' }}>
                        {currencySymbol}
                        {c.avgPersonalExpenses.toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  <button
                    className="btn-green-action"
                    onClick={() => onSelectCountry(c.country)}
                    style={{ marginTop: 'auto' }}
                  >
                    Explore {c.country} Details &rarr;
                  </button>
                </div>
              );
            })}
          </div>

          {/* Matrix Comparison Table */}
          <div className="comparison-table-wrap">
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#fafbfc' }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                Full Side-by-Side Affordability Matrix ({currency})
              </h4>
            </div>

            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Expense Category</th>
                  {comparison.countries.map((c) => (
                    <th key={c.countryCode}>
                      {c.flag} {c.country}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Top Ranked Colleges (Avg Tuition)</strong>
                  </td>
                  {comparison.countries.map((c) => (
                    <td key={c.countryCode}>
                      {currencySymbol}
                      {c.topRankedAvgTuition.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>
                    <strong>Mid Level Colleges (Avg Tuition)</strong>
                  </td>
                  {comparison.countries.map((c) => (
                    <td key={c.countryCode}>
                      {currencySymbol}
                      {c.midLevelAvgTuition.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>
                    <strong>Emerging Institutes (Avg Tuition)</strong>
                  </td>
                  {comparison.countries.map((c) => (
                    <td key={c.countryCode}>
                      {currencySymbol}
                      {c.emergingAvgTuition.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Annual Living Expenses (Room & Board)</td>
                  {comparison.countries.map((c) => (
                    <td key={c.countryCode}>
                      {currencySymbol}
                      {c.avgLivingExpenses.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Mandatory Health Insurance</td>
                  {comparison.countries.map((c) => (
                    <td key={c.countryCode}>
                      {currencySymbol}
                      {c.avgHealthInsurance.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Travel & Visa Baseline</td>
                  {comparison.countries.map((c) => (
                    <td key={c.countryCode}>
                      {currencySymbol}
                      {c.avgTravelExpenses.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Personal & Study Materials</td>
                  {comparison.countries.map((c) => (
                    <td key={c.countryCode}>
                      {currencySymbol}
                      {c.avgPersonalExpenses.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr style={{ background: '#f8fafc', fontWeight: 800 }}>
                  <td style={{ color: '#0f172a' }}>
                    GRAND TOTAL ESTIMATED ANNUAL COST ({tierLabel})
                  </td>
                  {comparison.countries.map((c) => (
                    <td
                      key={c.countryCode}
                      style={{
                        color: c.affordabilityRank === 1 ? '#15803d' : '#0f172a',
                        fontSize: '0.95rem',
                      }}
                    >
                      {currencySymbol}
                      {c.totalEstimatedAnnualCost.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td>Affordability Index</td>
                  {comparison.countries.map((c) => (
                    <td key={c.countryCode}>
                      <span
                        style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background:
                            c.affordabilityTier === 'HIGH_AFFORDABILITY'
                              ? '#dcfce7'
                              : c.affordabilityTier === 'MODERATE'
                              ? '#e0f2fe'
                              : '#f3e8ff',
                          color:
                            c.affordabilityTier === 'HIGH_AFFORDABILITY'
                              ? '#15803d'
                              : c.affordabilityTier === 'MODERATE'
                              ? '#0369a1'
                              : '#6b21a8',
                        }}
                      >
                        {c.affordabilityTier.replace('_', ' ')}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
