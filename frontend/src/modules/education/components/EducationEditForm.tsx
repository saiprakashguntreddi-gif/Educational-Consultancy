import React, { useState } from 'react';
import { StudentEducationRecord, StudentEducationInput, SubjectDetail } from '../education.types';
import { BOARD_OPTIONS, COMMON_SUBJECTS, COMPLETION_YEAR_OPTIONS } from '../education.constants';
import { ProgressRing } from '../../../shared/components/ProgressRing';
import { X, Plus, ChevronDown, ChevronUp } from 'lucide-react';

interface EducationEditFormProps {
  initialData?: StudentEducationRecord | null;
  defaultBoard?: string;
  defaultYear?: number;
  onSuccess: (record: StudentEducationRecord) => void;
  onCancel: () => void;
  onSubmit: (data: StudentEducationInput) => Promise<any>;
}

export const EducationEditForm: React.FC<EducationEditFormProps> = ({
  initialData,
  defaultBoard = 'CBSE',
  defaultYear = 2026,
  onSuccess,
  onCancel,
  onSubmit,
}) => {
  // 12th Standard State
  const [schoolName, setSchoolName] = useState(initialData?.schoolName || '');
  const [board, setBoard] = useState(initialData?.board || defaultBoard || 'CBSE');
  const [completionYear, setCompletionYear] = useState<number>(
    initialData?.completionYear || defaultYear || 2026
  );
  const [percentage, setPercentage] = useState<string>(
    initialData?.percentage !== undefined ? String(initialData.percentage) : ''
  );

  // Dynamic Subjects State
  const initialSubjects: SubjectDetail[] =
    initialData?.subjectDetails && initialData.subjectDetails.length > 0
      ? initialData.subjectDetails
      : [
          { subject: 'Mathematics', score: 85 },
          { subject: 'Physics', score: 85 },
          { subject: 'Chemistry', score: 85 },
        ];

  const [subjects, setSubjects] = useState<SubjectDetail[]>(initialSubjects);

  // 10th Standard Summary State (Optional)
  const [showTenth, setShowTenth] = useState(
    Boolean(initialData?.tenthSchoolName || initialData?.tenthPercentage)
  );
  const [tenthSchoolName, setTenthSchoolName] = useState(initialData?.tenthSchoolName || '');
  const [tenthBoard, setTenthBoard] = useState(initialData?.tenthBoard || 'CBSE');
  const [tenthPassingYear, setTenthPassingYear] = useState<number>(
    initialData?.tenthPassingYear || 2024
  );
  const [tenthPercentage, setTenthPercentage] = useState<string>(
    initialData?.tenthPercentage !== undefined && initialData?.tenthPercentage !== null
      ? String(initialData.tenthPercentage)
      : ''
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Subject handlers
  const handleSubjectNameChange = (index: number, value: string) => {
    const updated = [...subjects];
    updated[index] = { ...updated[index], subject: value };
    setSubjects(updated);
  };

  const handleSubjectScoreChange = (index: number, value: string) => {
    const num = parseFloat(value) || 0;
    const updated = [...subjects];
    updated[index] = { ...updated[index], score: Math.min(100, Math.max(0, num)) };
    setSubjects(updated);
  };

  const handleAddSubject = () => {
    const available = COMMON_SUBJECTS.find((s) => !subjects.some((sub) => sub.subject === s));
    setSubjects([
      ...subjects,
      { subject: available || 'Other Subject', score: 80 },
    ]);
  };

  const handleRemoveSubject = (index: number) => {
    if (subjects.length <= 1) return;
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!schoolName.trim()) {
      setErrorMessage('Please enter your School / Institution name for 12th standard.');
      return;
    }

    const parsedPercentage = parseFloat(percentage);
    if (isNaN(parsedPercentage) || parsedPercentage < 0 || parsedPercentage > 100) {
      setErrorMessage('Please provide a valid aggregate percentage between 0 and 100.');
      return;
    }

    if (subjects.length === 0) {
      setErrorMessage('Please record at least one subject with score.');
      return;
    }

    for (let i = 0; i < subjects.length; i++) {
      if (!subjects[i].subject.trim()) {
        setErrorMessage(`Please select or enter a subject name for row ${i + 1}.`);
        return;
      }
      if (subjects[i].score < 0 || subjects[i].score > 100) {
        setErrorMessage(`Subject score for "${subjects[i].subject}" must be between 0 and 100.`);
        return;
      }
    }

    const payload: StudentEducationInput = {
      schoolName: schoolName.trim(),
      board,
      completionYear,
      percentage: parsedPercentage,
      subjectDetails: subjects.map((s) => ({
        subject: s.subject.trim(),
        score: Number(s.score),
      })),
      tenthSchoolName: showTenth && tenthSchoolName.trim() ? tenthSchoolName.trim() : undefined,
      tenthBoard: showTenth && tenthSchoolName.trim() ? tenthBoard : undefined,
      tenthPassingYear: showTenth && tenthSchoolName.trim() ? tenthPassingYear : undefined,
      tenthPercentage:
        showTenth && tenthPercentage.trim() ? parseFloat(tenthPercentage) : undefined,
    };

    setIsSubmitting(true);
    try {
      const response = await onSubmit(payload);
      if (response && response.data) {
        onSuccess(response.data);
      } else {
        setErrorMessage(response?.message || 'Failed to save education details.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while saving education details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      {/* Header title matching reference layout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.75rem' }}>
        <ProgressRing percent={0} size={30} strokeWidth={3} ringColor="#1976d2" trackColor="#264b6e" />
        <h2
          style={{
            fontFamily: "Georgia, 'Playfair Display', serif",
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#222222',
            margin: 0,
          }}
        >
          Education Details
        </h2>
      </div>

      {errorMessage && (
        <div className="dash-alert dash-alert-error" style={{ marginBottom: '1.5rem' }}>
          {errorMessage}
        </div>
      )}

      {/* 12th Expected Section */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <h3
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: '#1e293b',
            marginBottom: '1.25rem',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '0.5rem',
          }}
        >
          12th Standard / Senior Secondary Details
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '1rem',
          }}
        >
          {/* School Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label className="dash-view-label" style={{ fontWeight: 600 }}>
              School / Institution Name <span style={{ color: '#e53935' }}>*</span>
            </label>
            <input
              type="text"
              className="dash-input"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="e.g. Dumick Educational Academy"
              required
            />
          </div>

          {/* 12th Board */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label className="dash-view-label" style={{ fontWeight: 600 }}>
              12th Board / Curriculum <span style={{ color: '#e53935' }}>*</span>
            </label>
            <select
              className="dash-select"
              value={board}
              onChange={(e) => setBoard(e.target.value)}
              required
            >
              {BOARD_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Passing Out Year */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label className="dash-view-label" style={{ fontWeight: 600 }}>
              Completion / Passing Year <span style={{ color: '#e53935' }}>*</span>
            </label>
            <select
              className="dash-select"
              value={completionYear}
              onChange={(e) => setCompletionYear(parseInt(e.target.value, 10))}
              required
            >
              {COMPLETION_YEAR_OPTIONS.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Aggregate Percentage */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label className="dash-view-label" style={{ fontWeight: 600 }}>
              Aggregate Percentage / Score (%) <span style={{ color: '#e53935' }}>*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              className="dash-input"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              placeholder="e.g. 88.5"
              required
            />
          </div>
        </div>
      </div>

      {/* Dynamic Subject Details Section (Matching Screenshot) */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '0.5rem',
          }}
        >
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Subject Details
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Enter subject marks to power personalized recommendations
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {subjects.map((s, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              {/* Subject selector or input */}
              <div style={{ flex: '2', minWidth: '180px' }}>
                <select
                  className="dash-select"
                  value={COMMON_SUBJECTS.includes(s.subject) ? s.subject : 'Other Subject'}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleSubjectNameChange(idx, val === 'Other Subject' ? '' : val);
                  }}
                >
                  {COMMON_SUBJECTS.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
                {!COMMON_SUBJECTS.includes(s.subject) && (
                  <input
                    type="text"
                    className="dash-input"
                    style={{ marginTop: '0.4rem' }}
                    placeholder="Enter custom subject name"
                    value={s.subject}
                    onChange={(e) => handleSubjectNameChange(idx, e.target.value)}
                    required
                  />
                )}
              </div>

              {/* Subject Score */}
              <div style={{ flex: '1', minWidth: '110px' }}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="dash-input"
                  placeholder="Score / 100"
                  value={s.score}
                  onChange={(e) => handleSubjectScoreChange(idx, e.target.value)}
                  required
                />
              </div>

              {/* Orange Square Delete Button (Matching Reference Screenshot) */}
              {subjects.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveSubject(idx)}
                  style={{
                    backgroundColor: '#ff9800',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                    flexShrink: 0,
                  }}
                  title="Remove subject"
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f57c00')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ff9800')}
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              )}
            </div>
          ))}

          {/* + Add more subjects link */}
          <div style={{ marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={handleAddSubject}
              className="dash-link-action"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              <Plus size={16} /> Add more subjects
            </button>
          </div>
        </div>
      </div>

      {/* Optional 10th Standard Summary */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div
          onClick={() => setShowTenth(!showTenth)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#334155' }}>
              10th Standard Summary (Optional)
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {showTenth ? 'Visible' : 'Click to add previous academic history'}
            </span>
          </div>
          {showTenth ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
        </div>

        {showTenth && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginTop: '1.25rem',
              paddingTop: '1rem',
              borderTop: '1px solid #f1f5f9',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label className="dash-view-label">10th School Name</label>
              <input
                type="text"
                className="dash-input"
                placeholder="e.g. St. Xavier High School"
                value={tenthSchoolName}
                onChange={(e) => setTenthSchoolName(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label className="dash-view-label">10th Board</label>
              <select
                className="dash-select"
                value={tenthBoard}
                onChange={(e) => setTenthBoard(e.target.value)}
              >
                {BOARD_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label className="dash-view-label">10th Passing Year</label>
              <select
                className="dash-select"
                value={tenthPassingYear}
                onChange={(e) => setTenthPassingYear(parseInt(e.target.value, 10))}
              >
                {[2020, 2021, 2022, 2023, 2024, 2025].map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label className="dash-view-label">10th Aggregate (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                className="dash-input"
                placeholder="e.g. 91.0"
                value={tenthPercentage}
                onChange={(e) => setTenthPercentage(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Buttons: Cancel & Green Pill Save */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1.5rem',
          marginTop: '1.5rem',
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          className="dash-btn-cancel"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="dash-btn-save"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};
