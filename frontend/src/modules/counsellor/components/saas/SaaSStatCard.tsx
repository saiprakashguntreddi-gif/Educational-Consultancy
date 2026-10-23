import React from 'react';

export interface SaaSStatCardProps {
  label: string;
  value: number | string;
  subtext?: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'amber';
}

export const SaaSStatCard: React.FC<SaaSStatCardProps> = ({
  label,
  value,
  subtext,
  trend,
  trendType = 'positive',
  icon,
  color = 'blue',
}) => {
  return (
    <div className="saas-kpi-card">
      <div>
        <div className="saas-kpi-label">{label}</div>
        <div className="saas-kpi-value">{value}</div>
        {(subtext || trend) && (
          <div
            className="saas-kpi-trend"
            style={{
              color:
                trendType === 'positive'
                  ? '#16A34A'
                  : trendType === 'negative'
                  ? '#DC2626'
                  : '#64748B',
            }}
          >
            {trend && <span>{trend}</span>}
            {subtext && <span style={{ color: '#64748B' }}>{subtext}</span>}
          </div>
        )}
      </div>
      <div className={`saas-kpi-icon-pill ${color}`}>{icon}</div>
    </div>
  );
};
