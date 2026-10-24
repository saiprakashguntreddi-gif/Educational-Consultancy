import React, { useState } from 'react';
import { StudentEducationRecord, StudentEducationInput, SubjectDetail } from '../education.types';
import { BOARD_OPTIONS, COMMON_SUBJECTS, COMPLETION_YEAR_OPTIONS } from '../education.constants';
import { ProgressRing } from '../../../shared/components/ProgressRing';
import {
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Award,
  UploadCloud,
  CheckCircle,
  AlertCircle,
  FileText,
  ShieldCheck,
} from 'lucide-react';

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
  // 1. Study Category (First Decision: What they want to study!)
  const [studyCategory, setStudyCategory] = useState<'UNDERGRADUATE' | 'POSTGRADUATE'>(
    initialData?.studyCategory === 'POSTGRADUATE' ? 'POSTGRADUATE' : 'UNDERGRADUATE'
  );

  // Target Stream (e.g. Engineering, Computer Science, Business, etc.)
  const [targetStream, setTargetStream] = useState<string>(
    initialData?.targetStream || 'Engineering & Technology'
  );

  // 2. Postgraduate - Undergrad Degree Details State
  const [undergradDegree, setUndergradDegree] = useState(initialData?.undergradDegree || '');
  const [undergradCollege, setUndergradCollege] = useState(initialData?.undergradCollege || '');
  const [undergradPassingYear, setUndergradPassingYear] = useState<number>(
    initialData?.undergradPassingYear || 2025
  );
  const [undergradPercentage, setUndergradPercentage] = useState<string>(
    initialData?.undergradPercentage !== undefined && initialData?.undergradPercentage !== null
      ? String(initialData.undergradPercentage)
      : ''
  );
  const [undergradDocumentUrl, setUndergradDocumentUrl] = useState<string>(
    initialData?.undergradDocumentUrl || ''
  );
  const [undergradFileName, setUndergradFileName] = useState<string>(
    initialData?.undergradDocumentUrl ? 'Graduation_Degree_Certificate.pdf' : ''
  );

  // 3. 12th Standard State
  const [schoolName, setSchoolName] = useState(initialData?.schoolName || '');
  const [board, setBoard] = useState(initialData?.board || defaultBoard || 'CBSE');
  const [completionYear, setCompletionYear] = useState<number>(
    initialData?.completionYear || defaultYear || 2026
  );
  const [percentage, setPercentage] = useState<string>(
    initialData?.percentage !== undefined ? String(initialData.percentage) : ''
  );
  const [twelfthDocumentUrl, setTwelfthDocumentUrl] = useState<string>(
    initialData?.twelfthDocumentUrl || ''
  );
  const [twelfthFileName, setTwelfthFileName] = useState<string>(
    initialData?.twelfthDocumentUrl ? '12th_Marksheet_Certificate.pdf' : ''
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

  // 4. 10th Standard State
  const [showTenth, setShowTenth] = useState<boolean>(true);
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
  const [tenthDocumentUrl, setTenthDocumentUrl] = useState<string>(
    initialData?.tenthDocumentUrl || ''
  );
  const [tenthFileName, setTenthFileName] = useState<string>(
    initialData?.tenthDocumentUrl ? '10th_Marksheet_Certificate.pdf' : ''
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helper to handle local file upload as Data URL
  const handleFileUpload = (
    file: File,
    setUrl: (url: string) => void,
    setFileName: (name: string) => void
  ) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

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
    setSubjects([...subjects, { subject: available || 'Other Subject', score: 80 }]);
  };

  const handleRemoveSubject = (index: number) => {
    if (subjects.length <= 1) return;
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation for 12th details
    if (!schoolName.trim()) {
      setErrorMessage('Please enter your School / Institution name for 12th standard.');
      return;
    }

    const parsedPercentage = parseFloat(percentage);
    if (isNaN(parsedPercentage) || parsedPercentage < 0 || parsedPercentage > 100) {
      setErrorMessage('Please provide a valid aggregate percentage between 0 and 100 for 12th standard.');
      return;
    }

    if (subjects.length === 0) {
      setErrorMessage('Please record at least one 12th subject with score.');
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

    // Document & Eligibility validation based on Category
    if (studyCategory === 'UNDERGRADUATE') {
      if (!twelfthDocumentUrl.trim()) {
        setErrorMessage(
          'Verification Requirement: Please upload or attach your 12th Class Marksheet / Passing Certificate.'
        );
        return;
      }
      if (!tenthDocumentUrl.trim()) {
        setErrorMessage(
          'Verification Requirement: For Undergraduate admission verification, you must submit both 12th and 10th Class documents.'
        );
        return;
      }
    } else {
      // POSTGRADUATE
      if (!undergradDegree.trim()) {
        setErrorMessage('Please enter your Bachelor’s Degree title (e.g. B.Tech Computer Science, B.Sc).');
        return;
      }
      if (!undergradCollege.trim()) {
        setErrorMessage('Please enter your Undergraduate College / University name.');
        return;
      }
      if (!undergradDocumentUrl.trim()) {
        setErrorMessage(
          'Verification Requirement: Please submit your Graduation / Bachelor’s Degree Certificate.'
        );
        return;
      }
      if (!twelfthDocumentUrl.trim()) {
        setErrorMessage(
          'Verification Requirement: Postgraduate verification requires your 12th Class Certificate.'
        );
        return;
      }
      if (!tenthDocumentUrl.trim()) {
        setErrorMessage(
          'Verification Requirement: Postgraduate verification requires all 3 documents: 10th, 12th, and Graduation Degree Certificate.'
        );
        return;
      }
    }

    const payload: StudentEducationInput = {
      studyCategory,
      targetStream: targetStream.trim(),
      schoolName: schoolName.trim(),
      board,
      completionYear,
      percentage: parsedPercentage,
      subjectDetails: subjects.map((s) => ({
        subject: s.subject.trim(),
        score: Number(s.score),
      })),
      tenthSchoolName: tenthSchoolName.trim() || undefined,
      tenthBoard: tenthSchoolName.trim() ? tenthBoard : undefined,
      tenthPassingYear: tenthSchoolName.trim() ? tenthPassingYear : undefined,
      tenthPercentage: tenthPercentage.trim() ? parseFloat(tenthPercentage) : undefined,
      twelfthDocumentUrl: twelfthDocumentUrl.trim() || undefined,
      tenthDocumentUrl: tenthDocumentUrl.trim() || undefined,
      undergradDegree: studyCategory === 'POSTGRADUATE' ? undergradDegree.trim() : undefined,
      undergradCollege: studyCategory === 'POSTGRADUATE' ? undergradCollege.trim() : undefined,
      undergradPassingYear: studyCategory === 'POSTGRADUATE' ? undergradPassingYear : undefined,
      undergradPercentage:
        studyCategory === 'POSTGRADUATE' && undergradPercentage.trim()
          ? parseFloat(undergradPercentage)
          : undefined,
      undergradDocumentUrl:
        studyCategory === 'POSTGRADUATE' ? undergradDocumentUrl.trim() || undefined : undefined,
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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem' }}>
        <ProgressRing percent={0} size={30} strokeWidth={3} ringColor="#1976d2" trackColor="#264b6e" />
        <div>
          <h2
            style={{
              fontFamily: "Georgia, 'Playfair Display', serif",
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#222222',
              margin: 0,
            }}
          >
            Education Details & Verification Documents
          </h2>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
            Submit your verified academic records to unlock counselor appointment booking
          </p>
        </div>
      </div>

      {errorMessage && (
        <div
          className="dash-alert dash-alert-error"
          style={{
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.85rem 1rem',
            borderRadius: '8px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '0.88rem',
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: CATEGORY SELECTION (FIRST THING SHOWN) */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1.5px solid #e2e8f0',
          padding: '1.75rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div style={{ marginBottom: '1.25rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#2563eb',
              backgroundColor: '#eff6ff',
              padding: '0.25rem 0.65rem',
              borderRadius: '6px',
            }}
          >
            Step 1: What Are You Looking To Study?
          </span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: '0.5rem 0 0.25rem' }}>
            Select Your Target Academic Degree Category
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            Your required verification certificates are determined by your target study level.
          </p>
        </div>

        {/* Category Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          {/* Undergraduate Card */}
          <div
            onClick={() => setStudyCategory('UNDERGRADUATE')}
            style={{
              border: studyCategory === 'UNDERGRADUATE' ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
              backgroundColor: studyCategory === 'UNDERGRADUATE' ? '#f0f7ff' : '#ffffff',
              borderRadius: '10px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  backgroundColor: studyCategory === 'UNDERGRADUATE' ? '#2563eb' : '#f1f5f9',
                  color: studyCategory === 'UNDERGRADUATE' ? '#ffffff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem',
                }}
              >
                <GraduationCap size={22} />
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.55rem',
                  borderRadius: '20px',
                  backgroundColor: studyCategory === 'UNDERGRADUATE' ? '#dbeafe' : '#f1f5f9',
                  color: studyCategory === 'UNDERGRADUATE' ? '#1d4ed8' : '#64748b',
                }}
              >
                {studyCategory === 'UNDERGRADUATE' ? '✓ SELECTED' : 'SELECT'}
              </span>
            </div>

            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.35rem', color: '#0f172a' }}>
              Undergraduate Degree (Bachelor's)
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 0.85rem', lineHeight: 1.4 }}>
              Completed 12th standard & seeking admission into B.Tech, B.E., B.Sc, B.A., BBA, or Bachelor's streams.
            </p>

            <div
              style={{
                fontSize: '0.75rem',
                backgroundColor: studyCategory === 'UNDERGRADUATE' ? '#ffffff' : '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                color: '#334155',
              }}
            >
              <strong style={{ color: '#0f172a' }}>Required Documents:</strong>
              <div style={{ marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span>• 12th Class Marksheet / Passing Certificate</span>
                <span>• 10th Class Marksheet / Certificate</span>
              </div>
            </div>
          </div>

          {/* Postgraduate Card */}
          <div
            onClick={() => setStudyCategory('POSTGRADUATE')}
            style={{
              border: studyCategory === 'POSTGRADUATE' ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
              backgroundColor: studyCategory === 'POSTGRADUATE' ? '#f0f7ff' : '#ffffff',
              borderRadius: '10px',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  backgroundColor: studyCategory === 'POSTGRADUATE' ? '#2563eb' : '#f1f5f9',
                  color: studyCategory === 'POSTGRADUATE' ? '#ffffff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem',
                }}
              >
                <Award size={22} />
              </div>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.55rem',
                  borderRadius: '20px',
                  backgroundColor: studyCategory === 'POSTGRADUATE' ? '#dbeafe' : '#f1f5f9',
                  color: studyCategory === 'POSTGRADUATE' ? '#1d4ed8' : '#64748b',
                }}
              >
                {studyCategory === 'POSTGRADUATE' ? '✓ SELECTED' : 'SELECT'}
              </span>
            </div>

            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.35rem', color: '#0f172a' }}>
              Postgraduate Degree (Master's)
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 0.85rem', lineHeight: 1.4 }}>
              Completed / graduating Bachelor's degree & seeking admission into MS, M.Tech, MBA, or Master's programs.
            </p>

            <div
              style={{
                fontSize: '0.75rem',
                backgroundColor: studyCategory === 'POSTGRADUATE' ? '#ffffff' : '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                color: '#334155',
              }}
            >
              <strong style={{ color: '#0f172a' }}>Required Documents (All 3 Required):</strong>
              <div style={{ marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span>• 10th Class Certificate</span>
                <span>• 12th Class Certificate</span>
                <span>• Graduation / Bachelor's Degree Certificate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Target Stream Selector */}
        <div>
          <label className="dash-view-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
            What Stream / Discipline Are You Seeking To Study? <span style={{ color: '#e53935' }}>*</span>
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.65rem' }}>
            {[
              'Engineering & Technology',
              'Computer Science & AI',
              'Business & Management (MBA/BBA)',
              'Data Science & Analytics',
              'Sciences & Biotechnology',
              'Finance & Accounting',
              'Medicine & Health Sciences',
            ].map((stream) => (
              <button
                key={stream}
                type="button"
                onClick={() => setTargetStream(stream)}
                style={{
                  fontSize: '0.78rem',
                  fontWeight: targetStream === stream ? 700 : 500,
                  padding: '0.35rem 0.75rem',
                  borderRadius: '20px',
                  border: targetStream === stream ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                  backgroundColor: targetStream === stream ? '#eff6ff' : '#ffffff',
                  color: targetStream === stream ? '#1d4ed8' : '#475569',
                  cursor: 'pointer',
                }}
              >
                {stream}
              </button>
            ))}
          </div>
          <input
            type="text"
            className="dash-input"
            value={targetStream}
            onChange={(e) => setTargetStream(e.target.value)}
            placeholder="e.g. Engineering stream, Computer Science, Finance, etc."
            required
          />
        </div>
      </div>

      {/* POSTGRADUATE SPECIFIC SECTION: UNDERGRADUATE / DEGREE DETAILS */}
      {studyCategory === 'POSTGRADUATE' && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '10px',
            border: '1.5px solid #bfdbfe',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Award size={20} color="#2563eb" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e3a8a', margin: 0 }}>
              Undergraduate Degree Details (Required for PG)
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label className="dash-view-label" style={{ fontWeight: 600 }}>
                Bachelor's Degree Title <span style={{ color: '#e53935' }}>*</span>
              </label>
              <input
                type="text"
                className="dash-input"
                value={undergradDegree}
                onChange={(e) => setUndergradDegree(e.target.value)}
                placeholder="e.g. B.Tech Computer Science / B.Sc Physics"
                required={studyCategory === 'POSTGRADUATE'}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label className="dash-view-label" style={{ fontWeight: 600 }}>
                College / University Name <span style={{ color: '#e53935' }}>*</span>
              </label>
              <input
                type="text"
                className="dash-input"
                value={undergradCollege}
                onChange={(e) => setUndergradCollege(e.target.value)}
                placeholder="e.g. Delhi University / IIT Madras"
                required={studyCategory === 'POSTGRADUATE'}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label className="dash-view-label" style={{ fontWeight: 600 }}>
                Graduation Passing Year <span style={{ color: '#e53935' }}>*</span>
              </label>
              <select
                className="dash-select"
                value={undergradPassingYear}
                onChange={(e) => setUndergradPassingYear(parseInt(e.target.value, 10))}
                required={studyCategory === 'POSTGRADUATE'}
              >
                {[2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026].map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label className="dash-view-label" style={{ fontWeight: 600 }}>
                Cumulative CGPA / Score (%) <span style={{ color: '#e53935' }}>*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                className="dash-input"
                value={undergradPercentage}
                onChange={(e) => setUndergradPercentage(e.target.value)}
                placeholder="e.g. 8.4 CGPA or 84.5%"
                required={studyCategory === 'POSTGRADUATE'}
              />
            </div>
          </div>
        </div>
      )}

      {/* 12th STANDARD SECTION */}
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
              12th School / College Name <span style={{ color: '#e53935' }}>*</span>
            </label>
            <input
              type="text"
              className="dash-input"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="e.g. Delhi Public School"
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
              Completion Year <span style={{ color: '#e53935' }}>*</span>
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
              12th Aggregate Score (%) <span style={{ color: '#e53935' }}>*</span>
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

        {/* Dynamic Subjects List */}
        <div style={{ marginTop: '1.25rem' }}>
          <span className="dash-view-label" style={{ display: 'block', marginBottom: '0.65rem', fontWeight: 600 }}>
            12th Subject Marks Breakdown <span style={{ color: '#e53935' }}>*</span>
          </span>

          {subjects.map((s, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center',
                marginBottom: '0.6rem',
              }}
            >
              <div style={{ flex: '2', minWidth: '150px' }}>
                <input
                  type="text"
                  className="dash-input"
                  placeholder="Subject name"
                  value={s.subject}
                  onChange={(e) => handleSubjectNameChange(idx, e.target.value)}
                  required
                />
              </div>

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
                    flexShrink: 0,
                  }}
                  title="Remove subject"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              )}
            </div>
          ))}

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

      {/* 10th STANDARD SECTION */}
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
              10th Standard Academic Summary
            </span>
            <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>
              (Required for Verification)
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
                {[2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025].map((yr) => (
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

      {/* STEP 4: MANDATORY CERTIFICATE DOCUMENT SUBMISSION */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1.5px solid #0284c7',
          padding: '1.75rem',
          marginBottom: '2rem',
          backgroundColor: '#f8fafc',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <ShieldCheck size={22} color="#0284c7" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Mandatory Verification Documents Submission
          </h3>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 1.25rem', lineHeight: 1.5 }}>
          {studyCategory === 'UNDERGRADUATE'
            ? 'For Undergraduate admissions, you must submit both your 12th Class and 10th Class marksheets. Once submitted, your profile will be sent to the Admissions Admin for authentication.'
            : 'For Postgraduate admissions, you must submit all 3 certificates: 10th Class, 12th Class, and your Graduation / Bachelor’s Degree Certificate.'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Document 1: 10th Class Certificate (Required for both UG and PG) */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: tenthDocumentUrl ? '1.5px solid #16a34a' : '1.5px solid #cbd5e1',
              borderRadius: '8px',
              padding: '1rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} color="#2563eb" />
                <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>
                  1. 10th Class Marksheet / Passing Certificate <span style={{ color: '#e53935' }}>*</span>
                </span>
              </div>
              {tenthDocumentUrl ? (
                <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CheckCircle size={14} /> Ready for verification
                </span>
              ) : (
                <span style={{ fontSize: '0.72rem', color: '#e11d48', fontWeight: 600 }}>Required</span>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  padding: '0.45rem 0.9rem',
                  borderRadius: '6px',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  color: '#334155',
                }}
              >
                <UploadCloud size={16} /> Choose File (PDF/Image)
                <input
                  type="file"
                  accept=".pdf,image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f, setTenthDocumentUrl, setTenthFileName);
                  }}
                />
              </label>

              <div style={{ flex: 1, minWidth: '220px' }}>
                <input
                  type="text"
                  className="dash-input"
                  placeholder="Or paste document URL (e.g. DigiLocker / Drive URL)"
                  value={tenthDocumentUrl.startsWith('data:') ? `[Local File: ${tenthFileName || '10th_Certificate.pdf'}]` : tenthDocumentUrl}
                  onChange={(e) => {
                    setTenthDocumentUrl(e.target.value);
                    setTenthFileName('');
                  }}
                />
              </div>

              {tenthDocumentUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setTenthDocumentUrl('');
                    setTenthFileName('');
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Document 2: 12th Class Certificate (Required for both UG and PG) */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: twelfthDocumentUrl ? '1.5px solid #16a34a' : '1.5px solid #cbd5e1',
              borderRadius: '8px',
              padding: '1rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} color="#2563eb" />
                <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>
                  2. 12th Class Marksheet / Senior Secondary Certificate <span style={{ color: '#e53935' }}>*</span>
                </span>
              </div>
              {twelfthDocumentUrl ? (
                <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CheckCircle size={14} /> Ready for verification
                </span>
              ) : (
                <span style={{ fontSize: '0.72rem', color: '#e11d48', fontWeight: 600 }}>Required</span>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  padding: '0.45rem 0.9rem',
                  borderRadius: '6px',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  color: '#334155',
                }}
              >
                <UploadCloud size={16} /> Choose File (PDF/Image)
                <input
                  type="file"
                  accept=".pdf,image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f, setTwelfthDocumentUrl, setTwelfthFileName);
                  }}
                />
              </label>

              <div style={{ flex: 1, minWidth: '220px' }}>
                <input
                  type="text"
                  className="dash-input"
                  placeholder="Or paste document URL (e.g. DigiLocker / Drive URL)"
                  value={twelfthDocumentUrl.startsWith('data:') ? `[Local File: ${twelfthFileName || '12th_Certificate.pdf'}]` : twelfthDocumentUrl}
                  onChange={(e) => {
                    setTwelfthDocumentUrl(e.target.value);
                    setTwelfthFileName('');
                  }}
                />
              </div>

              {twelfthDocumentUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setTwelfthDocumentUrl('');
                    setTwelfthFileName('');
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Document 3: Graduation Certificate (Required ONLY if PG) */}
          {studyCategory === 'POSTGRADUATE' && (
            <div
              style={{
                backgroundColor: '#ffffff',
                border: undergradDocumentUrl ? '1.5px solid #16a34a' : '1.5px solid #cbd5e1',
                borderRadius: '8px',
                padding: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={18} color="#2563eb" />
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>
                    3. Graduation / Bachelor's Degree Certificate <span style={{ color: '#e53935' }}>*</span>
                  </span>
                </div>
                {undergradDocumentUrl ? (
                  <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle size={14} /> Ready for verification
                  </span>
                ) : (
                  <span style={{ fontSize: '0.72rem', color: '#e11d48', fontWeight: 600 }}>Required for PG</span>
                )}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    padding: '0.45rem 0.9rem',
                    borderRadius: '6px',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer',
                    color: '#334155',
                  }}
                >
                  <UploadCloud size={16} /> Choose File (PDF/Image)
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileUpload(f, setUndergradDocumentUrl, setUndergradFileName);
                    }}
                  />
                </label>

                <div style={{ flex: 1, minWidth: '220px' }}>
                  <input
                    type="text"
                    className="dash-input"
                    placeholder="Or paste degree certificate URL"
                    value={undergradDocumentUrl.startsWith('data:') ? `[Local File: ${undergradFileName || 'Degree_Certificate.pdf'}]` : undergradDocumentUrl}
                    onChange={(e) => {
                      setUndergradDocumentUrl(e.target.value);
                      setUndergradFileName('');
                    }}
                  />
                </div>

                {undergradDocumentUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setUndergradDocumentUrl('');
                      setUndergradFileName('');
                    }}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Buttons: Cancel & Save */}
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
          style={{ minWidth: '180px' }}
        >
          {isSubmitting ? 'Saving & Submitting...' : 'Save & Submit Details'}
        </button>
      </div>
    </form>
  );
};
