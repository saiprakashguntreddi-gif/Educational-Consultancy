import React from 'react';
import { StudentEducationRecord } from '../education.types';
import { Pencil, BookOpen } from 'lucide-react';

interface EducationViewCardProps {
  education: StudentEducationRecord | null;
  defaultBoard?: string;
  defaultYear?: number;
  onEdit: () => void;
}

export const EducationViewCard: React.FC<EducationViewCardProps> = ({
  education,
  defaultBoard = 'CBSE',
  defaultYear = 2026,
  onEdit,
}) => {
  return (
    <div>
      <div className="dash-section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <h2 className="dash-section-title">Education Details</h2>
          {education ? (
            <span
              style={{
                fontSize: '0.725rem',
                fontWeight: 700,
                padding: '0.15rem 0.6rem',
                borderRadius: '12px',
                background: '#e8f5e9',
                color: '#2e7d32',
              }}
            >
              RECORDED
            </span>
          ) : (
            <span
              style={{
                fontSize: '0.725rem',
                fontWeight: 700,
                padding: '0.15rem 0.6rem',
                borderRadius: '12px',
                background: '#fff8e1',
                color: '#f57f17',
              }}
            >
              PENDING DETAILS
            </span>
          )}
        </div>

        <button
          className="dash-edit-pencil-btn"
          onClick={onEdit}
          title="Edit Education Details"
        >
          <Pencil size={20} />
        </button>
      </div>

      {/* 12th Details Row */}
      <div className="dash-view-row">
        <div className="dash-view-field">
          <span className="dash-view-label">12th School / Institution</span>
          <span className="dash-view-value" style={{ fontWeight: 600 }}>
            {education?.schoolName || '--'}
          </span>
        </div>

        <div className="dash-view-field">
          <span className="dash-view-label">12th Expected Board</span>
          <span className="dash-view-value">{education?.board || defaultBoard}</span>
        </div>

        <div className="dash-view-field">
          <span className="dash-view-label">Passing-Out Year</span>
          <span className="dash-view-value">
            {education?.completionYear || defaultYear}
          </span>
        </div>

        <div className="dash-view-field">
          <span className="dash-view-label">Aggregate Score</span>
          <span className="dash-view-value" style={{ color: '#1976d2', fontWeight: 700 }}>
            {education?.percentage !== undefined ? `${education.percentage}%` : '--'}
          </span>
        </div>
      </div>

      {/* Subject Marks Section */}
      <div style={{ marginTop: '1.25rem' }}>
        <span
          className="dash-view-label"
          style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}
        >
          Subject Details & Marks
        </span>
        {education?.subjectDetails && education.subjectDetails.length > 0 ? (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.6rem',
              alignItems: 'center',
            }}
          >
            {education.subjectDetails.map((sub, idx) => (
              <div
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '16px',
                  fontSize: '0.825rem',
                  color: '#334155',
                }}
              >
                <BookOpen size={13} color="#64748b" />
                <span style={{ fontWeight: 600 }}>{sub.subject}:</span>
                <span style={{ color: '#0d47a1', fontWeight: 700 }}>{sub.score}%</span>
              </div>
            ))}
          </div>
        ) : (
          <span className="dash-view-value" style={{ fontStyle: 'italic', color: '#94a3b8' }}>
            No individual subject scores recorded yet. Click the pencil icon above to add them.
          </span>
        )}
      </div>

      {/* Optional 10th Summary Row */}
      {education?.tenthSchoolName && (
        <div
          style={{
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px dashed #e2e8f0',
          }}
        >
          <span
            className="dash-view-label"
            style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}
          >
            10th Standard Academic Summary
          </span>
          <div className="dash-view-row">
            <div className="dash-view-field">
              <span className="dash-view-label">10th School</span>
              <span className="dash-view-value">{education.tenthSchoolName}</span>
            </div>
            {education.tenthBoard && (
              <div className="dash-view-field">
                <span className="dash-view-label">10th Board</span>
                <span className="dash-view-value">{education.tenthBoard}</span>
              </div>
            )}
            {education.tenthPassingYear && (
              <div className="dash-view-field">
                <span className="dash-view-label">Passing Year</span>
                <span className="dash-view-value">{education.tenthPassingYear}</span>
              </div>
            )}
            {education.tenthPercentage !== null && education.tenthPercentage !== undefined && (
              <div className="dash-view-field">
                <span className="dash-view-label">10th Aggregate</span>
                <span className="dash-view-value" style={{ fontWeight: 600 }}>
                  {education.tenthPercentage}%
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
