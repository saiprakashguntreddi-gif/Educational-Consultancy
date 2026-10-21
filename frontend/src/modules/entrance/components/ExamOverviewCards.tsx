import React from 'react';
import { Bookmark, Clock, CheckCircle2, Award, CalendarCheck } from 'lucide-react';
import { StudentExamPlanRecord, StudentMockAttemptRecord } from '../entrance.types';

interface ExamOverviewCardsProps {
  planItems: StudentExamPlanRecord[];
  mockAttempts: StudentMockAttemptRecord[];
  catalogCount: number;
}

export const ExamOverviewCards: React.FC<ExamOverviewCardsProps> = ({
  planItems,
  mockAttempts,
  catalogCount,
}) => {
  const safePlans = Array.isArray(planItems) ? planItems : [];
  const safeAttempts = Array.isArray(mockAttempts) ? mockAttempts : [];

  const plannedCount = safePlans.filter((p) => p?.status === 'PLANNED').length;
  const preparingCount = safePlans.filter((p) => p?.status === 'PREPARING').length;
  const registeredCount = safePlans.filter((p) => p?.status === 'REGISTERED').length;
  const completedCount = safePlans.filter((p) => p?.status === 'COMPLETED').length;

  const avgScore =
    safeAttempts.length > 0
      ? Math.round(
          safeAttempts.reduce((acc, curr) => acc + (curr?.percentage || 0), 0) / safeAttempts.length
        )
      : null;

  return (
    <div
      id="entrance-overview-cards"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1rem',
        marginBottom: '1.75rem',
      }}
    >
      {/* 1. Saved in Plan */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '1.15rem 1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            My Exam Plan
          </span>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(91, 79, 233, 0.1)', color: '#5B4FE9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bookmark size={17} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
            {planItems.length}
          </span>
          <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
            of {catalogCount} verified exams
          </span>
        </div>
      </div>

      {/* 2. Preparing */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '1.15rem 1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Active Prep
          </span>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(234, 88, 12, 0.1)', color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={17} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#EA580C', lineHeight: 1 }}>
            {preparingCount}
          </span>
          <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
            in preparation ({plannedCount} planned)
          </span>
        </div>
      </div>

      {/* 3. Registered */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '1.15rem 1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Registered
          </span>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(14, 165, 233, 0.1)', color: '#0EA5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CalendarCheck size={17} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0284C7', lineHeight: 1 }}>
            {registeredCount}
          </span>
          <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
            official test date booked
          </span>
        </div>
      </div>

      {/* 4. Completed */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '1.15rem 1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Completed
          </span>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(22, 163, 74, 0.1)', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={17} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16A34A', lineHeight: 1 }}>
            {completedCount}
          </span>
          <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
            achieved exam scores
          </span>
        </div>
      </div>

      {/* 5. Diagnostic Mocks Taken */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '1.15rem 1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Diagnostic Mocks
          </span>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(109, 40, 217, 0.1)', color: '#6D28D9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={17} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#6D28D9', lineHeight: 1 }}>
            {mockAttempts.length}
          </span>
          <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
            {avgScore !== null ? `Avg. ${avgScore}% accuracy` : 'No mock tests taken yet'}
          </span>
        </div>
      </div>
    </div>
  );
};
