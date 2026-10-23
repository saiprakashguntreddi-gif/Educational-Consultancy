import React from 'react';

export interface StatusBadgeProps {
  status: string;
  type?: 'status' | 'tier' | 'priority';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type: _type = 'status', size = 'sm' }) => {
  const norm = (status || '').toUpperCase();

  let badgeClass = 'saas-badge-neutral';
  let label = status;

  if (norm === 'VERIFIED' || norm === 'ACTIVE' || norm === 'APPROVED' || norm === 'COMPLETED' || norm === 'SAFE') {
    badgeClass = 'saas-badge-success';
    label = norm === 'VERIFIED' ? 'Active' : norm === 'SAFE' ? 'Safe Match' : status;
  } else if (norm === 'PENDING' || norm === 'SCHEDULED' || norm === 'REACH' || norm === 'MEDIUM') {
    badgeClass = 'saas-badge-warning';
    label = norm === 'REACH' ? 'Reach Fit' : status;
  } else if (norm === 'REJECTED' || norm === 'CANCELLED' || norm === 'INACTIVE' || norm === 'DREAM') {
    badgeClass = norm === 'DREAM' ? 'saas-badge-info' : 'saas-badge-danger';
    label = norm === 'DREAM' ? 'Dream School' : status;
  } else if (norm === 'IN_PROGRESS' || norm === 'IN_REVIEW' || norm === 'BEST_FIT' || norm === 'ONLINE_COUNSELLING') {
    badgeClass = 'saas-badge-info';
    label = norm === 'IN_PROGRESS' ? 'In Progress' : norm === 'IN_REVIEW' ? 'In Review' : status;
  }

  const paddingStyle = size === 'sm' ? { padding: '0.2rem 0.55rem', fontSize: '0.72rem' } : { padding: '0.3rem 0.75rem', fontSize: '0.8rem' };

  return (
    <span className={`saas-badge ${badgeClass}`} style={paddingStyle}>
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'currentColor',
          display: 'inline-block',
        }}
      />
      {label}
    </span>
  );
};
