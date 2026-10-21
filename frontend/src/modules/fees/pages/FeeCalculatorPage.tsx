import React from 'react';
import { FeeComparisonDashboard } from '../components/FeeComparisonDashboard';
import { ArrowLeft } from 'lucide-react';

interface FeeCalculatorPageProps {
  onNavigateHome?: () => void;
}

export const FeeCalculatorPage: React.FC<FeeCalculatorPageProps> = ({ onNavigateHome }) => {
  return (
    <div style={{ minHeight: '85vh', background: '#f8fafc', padding: '1.5rem 0' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1rem 1rem' }}>
        {onNavigateHome && (
          <button
            onClick={onNavigateHome}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'none',
              border: 'none',
              color: '#5b4fe9',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '0.5rem 0',
              marginBottom: '0.5rem',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>
        )}
      </div>

      <FeeComparisonDashboard onBackToDashboard={onNavigateHome} />
    </div>
  );
};
