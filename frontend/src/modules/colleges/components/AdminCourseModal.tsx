import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { CourseSummary, AdminCreateCourseInput, CatalogueStatus } from '../colleges.types';

interface AdminCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutionName: string;
  courseToEdit?: CourseSummary | null;
  onSave: (data: AdminCreateCourseInput) => Promise<boolean>;
  isSaving: boolean;
}

export const AdminCourseModal: React.FC<AdminCourseModalProps> = ({
  isOpen,
  onClose,
  institutionName,
  courseToEdit,
  onSave,
  isSaving,
}) => {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Engineering & Technology');
  const [specialization, setSpecialization] = useState('');
  const [level, setLevel] = useState('Undergraduate');
  const [durationYears, setDurationYears] = useState<number | ''>(4);
  const [durationText, setDurationText] = useState('4 Years Full-Time');
  const [description, setDescription] = useState('');
  const [eligibilityCriteria, setEligibilityCriteria] = useState('');
  const [annualTuitionFee, setAnnualTuitionFee] = useState<number | ''>('');
  const [feeCurrency, setFeeCurrency] = useState('USD');
  const [feeRange, setFeeRange] = useState('');
  const [entranceExamsText, setEntranceExamsText] = useState('SAT, TOEFL');
  const [scholarshipAvailable, setScholarshipAvailable] = useState(false);
  const [scholarshipDetails, setScholarshipDetails] = useState('');
  const [applicationDeadline, setApplicationDeadline] = useState('January 15');
  const [isPopular, setIsPopular] = useState(false);
  const [status, setStatus] = useState<CatalogueStatus>('PUBLISHED');
  const [isPublished, setIsPublished] = useState(true);

  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (courseToEdit) {
      setName(courseToEdit.name || '');
      setDepartment(courseToEdit.department || 'Engineering & Technology');
      setSpecialization(courseToEdit.specialization || '');
      setLevel(courseToEdit.level || 'Undergraduate');
      setDurationYears(courseToEdit.durationYears !== null && courseToEdit.durationYears !== undefined ? courseToEdit.durationYears : '');
      setDurationText(courseToEdit.durationText || '');
      setDescription(courseToEdit.description || '');
      setEligibilityCriteria(courseToEdit.eligibilityCriteria || '');
      setAnnualTuitionFee(courseToEdit.annualTuitionFee !== null && courseToEdit.annualTuitionFee !== undefined ? courseToEdit.annualTuitionFee : '');
      setFeeCurrency(courseToEdit.feeCurrency || 'USD');
      setFeeRange(courseToEdit.feeRange || '');
      setEntranceExamsText(courseToEdit.entranceExamsRequired ? courseToEdit.entranceExamsRequired.join(', ') : '');
      setScholarshipAvailable(Boolean(courseToEdit.scholarshipAvailable));
      setScholarshipDetails(courseToEdit.scholarshipDetails || '');
      setApplicationDeadline(courseToEdit.applicationDeadline || '');
      setIsPopular(Boolean(courseToEdit.isPopular));
      setStatus(courseToEdit.status || 'PUBLISHED');
      setIsPublished(Boolean(courseToEdit.isPublished));
    } else {
      setName('');
      setDepartment('Engineering & Technology');
      setSpecialization('');
      setLevel('Undergraduate');
      setDurationYears(4);
      setDurationText('4 Years Full-Time');
      setDescription('');
      setEligibilityCriteria('');
      setAnnualTuitionFee('');
      setFeeCurrency('USD');
      setFeeRange('');
      setEntranceExamsText('SAT, TOEFL');
      setScholarshipAvailable(false);
      setScholarshipDetails('');
      setApplicationDeadline('January 15');
      setIsPopular(false);
      setStatus('PUBLISHED');
      setIsPublished(true);
    }
    setValidationError(null);
  }, [courseToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim()) {
      setValidationError('Program / Course name is required.');
      return;
    }
    if (!department.trim()) {
      setValidationError('Academic department is required.');
      return;
    }

    const exams = entranceExamsText
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    const payload: AdminCreateCourseInput = {
      name: name.trim(),
      department: department.trim(),
      specialization: specialization.trim() || null,
      level,
      durationYears: durationYears !== '' ? Number(durationYears) : null,
      durationText: durationText.trim() || null,
      description: description.trim() || null,
      eligibilityCriteria: eligibilityCriteria.trim() || null,
      annualTuitionFee: annualTuitionFee !== '' ? Number(annualTuitionFee) : null,
      feeCurrency: feeCurrency.trim() || 'USD',
      feeRange: feeRange.trim() || null,
      entranceExamsRequired: exams,
      scholarshipAvailable,
      scholarshipDetails: scholarshipDetails.trim() || null,
      applicationDeadline: applicationDeadline.trim() || null,
      isPopular,
      status,
      isPublished,
    };

    const success = await onSave(payload);
    if (success) {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10002,
        background: 'rgba(8, 20, 38, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(8, 20, 38, 0.3)',
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(135deg, #081426 0%, #172033 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #EAECF0',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: '#FFFFFF' }}>
              {courseToEdit ? `Edit Course: ${courseToEdit.name}` : 'Add Program / Course'}
            </h3>
            <span style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>
              Institution: {institutionName}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            {validationError && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#991B1B',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                }}
              >
                ⚠️ {validationError}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                Course / Program Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bachelor of Science in Computer Science and Engineering"
                required
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                  Academic Department *
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '0.875rem',
                    outline: 'none',
                    background: '#FFFFFF',
                  }}
                >
                  <option value="Engineering & Technology">Engineering & Technology</option>
                  <option value="Computer Science & AI">Computer Science & AI</option>
                  <option value="Business & Management">Business & Management</option>
                  <option value="Natural Sciences & Mathematics">Natural Sciences & Mathematics</option>
                  <option value="Medical & Health Sciences">Medical & Health Sciences</option>
                  <option value="Humanities & Social Sciences">Humanities & Social Sciences</option>
                  <option value="Architecture & Planning">Architecture & Planning</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                  Degree Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '0.875rem',
                    outline: 'none',
                    background: '#FFFFFF',
                  }}
                >
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Postgraduate">Postgraduate</option>
                  <option value="Doctorate">Doctorate</option>
                  <option value="Diploma">Diploma / Certificate</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                  Specialization / Track
                </label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. Artificial Intelligence, Robotics"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                  Duration Text
                </label>
                <input
                  type="text"
                  value={durationText}
                  onChange={(e) => setDurationText(e.target.value)}
                  placeholder="e.g. 4 Years Full-Time"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                Program Curriculum & Overview
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Curriculum summary, laboratory components, core subjects..."
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  fontSize: '0.875rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                Eligibility Requirements
              </label>
              <textarea
                rows={2}
                value={eligibilityCriteria}
                onChange={(e) => setEligibilityCriteria(e.target.value)}
                placeholder="e.g. 12th Senior Secondary with Physics, Chemistry, Mathematics with 85% aggregate."
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  fontSize: '0.875rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                  Annual Tuition Fee
                </label>
                <input
                  type="number"
                  value={annualTuitionFee}
                  onChange={(e) => setAnnualTuitionFee(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="60000"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                  Currency
                </label>
                <select
                  value={feeCurrency}
                  onChange={(e) => setFeeCurrency(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '0.875rem',
                    outline: 'none',
                    background: '#FFFFFF',
                  }}
                >
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="SGD">SGD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="CHF">CHF (CHF)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                  Fee Display Range
                </label>
                <input
                  type="text"
                  value={feeRange}
                  onChange={(e) => setFeeRange(e.target.value)}
                  placeholder="$60,156 / year"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                  Entrance Exams (Comma separated)
                </label>
                <input
                  type="text"
                  value={entranceExamsText}
                  onChange={(e) => setEntranceExamsText(e.target.value)}
                  placeholder="SAT, IELTS, TOEFL"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                  Application Deadline
                </label>
                <input
                  type="text"
                  value={applicationDeadline}
                  onChange={(e) => setApplicationDeadline(e.target.value)}
                  placeholder="January 15"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', padding: '0.75rem', background: '#F8FAFC', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <input
                  type="checkbox"
                  id="crsScholarship"
                  checked={scholarshipAvailable}
                  onChange={(e) => setScholarshipAvailable(e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                <label htmlFor="crsScholarship" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1E293B' }}>
                  Scholarship Available
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <input
                  type="checkbox"
                  id="crsPopular"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                <label htmlFor="crsPopular" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1E293B' }}>
                  Mark as Popular Program
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <input
                  type="checkbox"
                  id="crsPublished"
                  checked={isPublished}
                  onChange={(e) => {
                    setIsPublished(e.target.checked);
                    setStatus(e.target.checked ? 'PUBLISHED' : 'DRAFT');
                  }}
                  style={{ width: '16px', height: '16px' }}
                />
                <label htmlFor="crsPublished" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#15803D' }}>
                  Publish Course to Students
                </label>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid #EAECF0',
              background: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                background: '#FFFFFF',
                border: '1px solid #D1D5DB',
                color: '#374151',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                background: '#5B4FE9',
                color: '#FFFFFF',
                border: 'none',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.7 : 1,
              }}
            >
              <Save size={15} />
              {isSaving ? 'Saving...' : courseToEdit ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
