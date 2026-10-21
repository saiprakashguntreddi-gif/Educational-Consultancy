import React from 'react';

interface ProgressRingProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  ringColor?: string;
  trackColor?: string;
  textColor?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percent,
  size = 32,
  strokeWidth = 3,
  ringColor = '#4caf50',
  trackColor = 'rgba(255, 255, 255, 0.15)',
  textColor = '#ffffff',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercent = Math.min(100, Math.max(0, percent));
  const strokeDashoffset = circumference - (clampedPercent / 100) * circumference;

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        backgroundColor: '#1b324b',
      }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          stroke={trackColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke={ringColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.35s ease' }}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span
        style={{
          position: 'absolute',
          fontSize: size * 0.32,
          fontWeight: 700,
          color: textColor,
          lineHeight: 1,
        }}
      >
        {clampedPercent}%
      </span>
    </div>
  );
};
