import React, { useState } from 'react';
import {
  Calendar,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { ExamDeadlineItem } from '../exam-intelligence.types';

interface DeadlineChecklistViewProps {
  deadlines: ExamDeadlineItem[];
}

export const DeadlineChecklistView: React.FC<DeadlineChecklistViewProps> = ({
  deadlines,
}) => {
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [filterExam, setFilterExam] = useState<string>('ALL');

  const toggleComplete = (key: string) => {
    setCompletedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const uniqueExams = Array.from(new Set(deadlines.map((d) => d.examCode)));

  const filteredDeadlines = deadlines.filter((d) => {
    return filterExam === 'ALL' || d.examCode === filterExam;
  });

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        padding: '1.75rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#4F46E5',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              background: 'rgba(79, 70, 229, 0.08)',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              marginBottom: '0.35rem',
            }}
          >
            <Calendar size={13} /> Step 4: Official Registration Route & Milestones
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Standardized Entrance Exam Deadline Checklist
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
            Track testing windows, regular registration cutoffs, late fee periods, and verified official registration links.
          </p>
        </div>

        {/* Filter by Exam */}
        {uniqueExams.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Filter:</span>
            <select
              value={filterExam}
              onChange={(e) => setFilterExam(e.target.value)}
              style={{
                padding: '0.45rem 0.8rem',
                fontSize: '0.8rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#F8FAFC',
                color: '#1E293B',
                fontWeight: 600,
              }}
            >
              <option value="ALL">All Tracked Exams</option>
              {uniqueExams.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {filteredDeadlines.length === 0 ? (
        <div
          style={{
            padding: '3rem 1.5rem',
            textAlign: 'center',
            background: '#F8FAFC',
            borderRadius: '12px',
            border: '1px dashed #CBD5E1',
          }}
        >
          <Calendar size={36} color="#94A3B8" style={{ margin: '0 auto 0.75rem auto' }} />
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', margin: '0 0 0.25rem 0' }}>
            No Upcoming Deadlines
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
            Check back soon for updated testing windows.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredDeadlines.map((item, idx) => {
            const key = `${item.examCode}-${idx}`;
            const isDone = !!completedItems[key];

            return (
              <div
                key={key}
                style={{
                  background: isDone ? '#F8FAFC' : '#FFFFFF',
                  border: isDone ? '1px solid #E2E8F0' : '1px solid #CBD5E1',
                  borderRadius: '12px',
                  padding: '1.15rem 1.35rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  opacity: isDone ? 0.75 : 1,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button
                    onClick={() => toggleComplete(key)}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '6px',
                      border: isDone ? '1px solid #059669' : '1px solid #CBD5E1',
                      background: isDone ? '#ECFDF5' : '#FFFFFF',
                      color: isDone ? '#059669' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircle2 size={16} />
                  </button>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          background: '#EEF2FF',
                          color: '#4F46E5',
                        }}
                      >
                        {item.examCode}
                      </span>
                      <h4
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          color: isDone ? '#64748B' : '#0F172A',
                          margin: 0,
                          textDecoration: isDone ? 'line-through' : 'none',
                        }}
                      >
                        {item.label}
                      </h4>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span>Window: <strong style={{ color: '#1E293B' }}>{item.date}</strong></span>
                      {item.deadline && (
                        <span>Deadline: <strong style={{ color: '#DC2626' }}>{item.deadline}</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                <a
                  href={item.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.95rem',
                    borderRadius: '8px',
                    border: '1px solid #C7D2FE',
                    background: '#EEF2FF',
                    color: '#4338CA',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>Official Portal</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
