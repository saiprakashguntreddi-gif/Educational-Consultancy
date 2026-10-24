import React from 'react';
import { StudentEducationRecord } from '../education.types';
import {
  Pencil,
  BookOpen,
  GraduationCap,
  Award,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  FileText,
} from 'lucide-react';

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
  const isPG = education?.studyCategory === 'POSTGRADUATE';
  const hasDocuments = Boolean(
    education?.tenthDocumentUrl || education?.twelfthDocumentUrl || education?.undergradDocumentUrl
  );

  return (
    <div>
      <div className="dash-section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <h2 className="dash-section-title">Education & Verification Details</h2>
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

          {education?.studyCategory && (
            <span
              style={{
                fontSize: '0.725rem',
                fontWeight: 700,
                padding: '0.15rem 0.6rem',
                borderRadius: '12px',
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
              }}
            >
              {isPG ? 'POSTGRADUATE STREAM' : 'UNDERGRADUATE STREAM'}
            </span>
          )}
        </div>

        <button
          className="dash-edit-pencil-btn"
          onClick={onEdit}
          title="Edit Education Details & Upload Documents"
        >
          <Pencil size={20} />
        </button>
      </div>

      {/* Target Level & Stream Summary Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '0.85rem 1.25rem',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {isPG ? <Award size={20} color="#2563eb" /> : <GraduationCap size={20} color="#2563eb" />}
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              What You Want To Study
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
              {isPG ? "Postgraduate Degree (Master's)" : "Undergraduate Degree (Bachelor's)"} &bull;{' '}
              <span style={{ color: '#2563eb' }}>{education?.targetStream || 'General Stream'}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onEdit}
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#2563eb',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '0.35rem 0.75rem',
            cursor: 'pointer',
          }}
        >
          Change Category / Edit
        </button>
      </div>

      {/* Postgraduate Undergrad Details Row if PG */}
      {isPG && education?.undergradDegree && (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #dbeafe',
            borderRadius: '8px',
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem',
          }}
        >
          <span
            className="dash-view-label"
            style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#1e40af' }}
          >
            Undergraduate / Bachelor's Degree
          </span>
          <div className="dash-view-row">
            <div className="dash-view-field">
              <span className="dash-view-label">Degree Title</span>
              <span className="dash-view-value" style={{ fontWeight: 600 }}>
                {education.undergradDegree}
              </span>
            </div>
            <div className="dash-view-field">
              <span className="dash-view-label">College / University</span>
              <span className="dash-view-value">{education.undergradCollege || '--'}</span>
            </div>
            <div className="dash-view-field">
              <span className="dash-view-label">Graduation Year</span>
              <span className="dash-view-value">{education.undergradPassingYear || '--'}</span>
            </div>
            <div className="dash-view-field">
              <span className="dash-view-label">CGPA / Score</span>
              <span className="dash-view-value" style={{ color: '#1d4ed8', fontWeight: 700 }}>
                {education.undergradPercentage !== undefined && education.undergradPercentage !== null
                  ? `${education.undergradPercentage}%`
                  : '--'}
              </span>
            </div>
          </div>
        </div>
      )}

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
          <span className="dash-view-value">{education?.completionYear || defaultYear}</span>
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
          12th Subject Details & Marks
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

      {/* 10th Summary Row */}
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

      {/* SUBMITTED VERIFICATION DOCUMENTS SECTION */}
      <div
        style={{
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1.5px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} color="#0284c7" />
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
              Submitted Verification Certificates
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Required for Admin Verification & Appointment Unlock
          </span>
        </div>

        {hasDocuments ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '0.85rem',
            }}
          >
            {/* 10th Certificate Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                backgroundColor: education?.tenthDocumentUrl ? '#f0fdf4' : '#fff1f2',
                border: education?.tenthDocumentUrl ? '1px solid #bbf7d0' : '1px solid #fecdd3',
                borderRadius: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={16} color={education?.tenthDocumentUrl ? '#16a34a' : '#e11d48'} />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>10th Marksheet</div>
                  <div style={{ fontSize: '0.72rem', color: education?.tenthDocumentUrl ? '#16a34a' : '#e11d48' }}>
                    {education?.tenthDocumentUrl ? 'Submitted' : 'Pending upload'}
                  </div>
                </div>
              </div>
              {education?.tenthDocumentUrl && (
                <a
                  href={education.tenthDocumentUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#2563eb',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                  }}
                >
                  View <ExternalLink size={12} />
                </a>
              )}
            </div>

            {/* 12th Certificate Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                backgroundColor: education?.twelfthDocumentUrl ? '#f0fdf4' : '#fff1f2',
                border: education?.twelfthDocumentUrl ? '1px solid #bbf7d0' : '1px solid #fecdd3',
                borderRadius: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={16} color={education?.twelfthDocumentUrl ? '#16a34a' : '#e11d48'} />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>12th Marksheet</div>
                  <div style={{ fontSize: '0.72rem', color: education?.twelfthDocumentUrl ? '#16a34a' : '#e11d48' }}>
                    {education?.twelfthDocumentUrl ? 'Submitted' : 'Pending upload'}
                  </div>
                </div>
              </div>
              {education?.twelfthDocumentUrl && (
                <a
                  href={education.twelfthDocumentUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#2563eb',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                  }}
                >
                  View <ExternalLink size={12} />
                </a>
              )}
            </div>

            {/* Graduation Degree Certificate Badge (if PG) */}
            {isPG && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: education?.undergradDocumentUrl ? '#f0fdf4' : '#fff1f2',
                  border: education?.undergradDocumentUrl ? '1px solid #bbf7d0' : '1px solid #fecdd3',
                  borderRadius: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={16} color={education?.undergradDocumentUrl ? '#16a34a' : '#e11d48'} />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>Degree Certificate</div>
                    <div style={{ fontSize: '0.72rem', color: education?.undergradDocumentUrl ? '#16a34a' : '#e11d48' }}>
                      {education?.undergradDocumentUrl ? 'Submitted' : 'Pending upload'}
                    </div>
                  </div>
                </div>
                {education?.undergradDocumentUrl && (
                  <a
                    href={education.undergradDocumentUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#2563eb',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                    }}
                  >
                    View <ExternalLink size={12} />
                  </a>
                )}
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              color: '#92400e',
              fontSize: '0.85rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>
              Certificates not yet submitted. Click <strong>Edit</strong> above to upload your required documents and submit for Admin Verification.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
