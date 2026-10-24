import React, { useState } from 'react';
import { StudentProfileIntakeInput, StudentProfileRecord } from '../profile.types';
import { Save, AlertCircle, CheckCircle2, User, BookOpen, MapPin } from 'lucide-react';
import { SearchableBoardSelect } from '../../../shared/components/SearchableBoardSelect';

interface ProfileIntakeFormProps {
  initialData?: StudentProfileRecord | null;
  onSubmitSuccess: (record: StudentProfileRecord) => void;
  onSubmit: (data: StudentProfileIntakeInput) => Promise<any>;
}

export const ProfileIntakeForm: React.FC<ProfileIntakeFormProps> = ({
  initialData,
  onSubmitSuccess,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<StudentProfileIntakeInput>({
    fullName: initialData?.fullName || '',
    gender: initialData?.gender || 'PREFER_NOT_TO_SAY',
    grade: initialData?.grade || 'Grade 12',
    contactEmail: initialData?.contactEmail || '',
    phone: initialData?.phone || '',
    address: {
      street: initialData?.address.street || '',
      city: initialData?.address.city || '',
      state: initialData?.address.state || '',
      postalCode: initialData?.address.postalCode || '',
      country: initialData?.address.country || '',
    },
    board: initialData?.board || 'CBSE',
    citizenship: initialData?.citizenship || '',
    passingOutYear: initialData?.passingOutYear || new Date().getFullYear(),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (field: keyof StudentProfileIntakeInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: keyof StudentProfileIntakeInput['address'], value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await onSubmit(formData);
      if (response && response.data) {
        setSuccessMessage('Student record saved. Profile submitted for verification.');
        onSubmitSuccess(response.data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit profile intake');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in">
      {errorMessage && (
        <div style={{
          background: 'var(--status-rejected-bg)',
          border: '1px solid var(--status-rejected-border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.25rem',
          color: 'var(--status-rejected-text)',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          marginBottom: '1.5rem',
        }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div style={{
          background: 'var(--status-verified-bg)',
          border: '1px solid var(--status-verified-border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.25rem',
          color: 'var(--status-verified-text)',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          marginBottom: '1.5rem',
        }}>
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* SECTION 1: Personal & Identity Details */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <User size={18} color="var(--primary)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>1. Personal & Identity Intake</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Full Name <span className="required">*</span></label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Maya Sharma"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Gender <span className="required">*</span></label>
            <select
              required
              className="form-select"
              value={formData.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
            >
              <option value="FEMALE">Female</option>
              <option value="MALE">Male</option>
              <option value="NON_BINARY">Non-Binary</option>
              <option value="OTHER">Other</option>
              <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Citizenship <span className="required">*</span></label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Indian, Canadian, etc."
              value={formData.citizenship}
              onChange={(e) => handleChange('citizenship', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Academic Profile Details */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <BookOpen size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>2. Academic Curriculum Intake</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Class / Grade <span className="required">*</span></label>
            <select
              required
              className="form-select"
              value={formData.grade}
              onChange={(e) => handleChange('grade', e.target.value)}
            >
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
              <option value="Undergraduate Year 1">Undergraduate Year 1</option>
              <option value="Undergraduate Year 2">Undergraduate Year 2</option>
              <option value="Undergraduate Year 3">Undergraduate Year 3</option>
              <option value="Undergraduate Year 4">Undergraduate Year 4</option>
              <option value="Postgraduate">Postgraduate</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Board / Curriculum <span className="required">*</span></label>
            <SearchableBoardSelect
              value={formData.board}
              onChange={(val) => handleChange('board', val)}
              placeholder="Select or search board / curriculum..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Passing-Out Year <span className="required">*</span></label>
            <input
              type="number"
              required
              min={1995}
              max={2035}
              className="form-input"
              value={formData.passingOutYear}
              onChange={(e) => handleChange('passingOutYear', parseInt(e.target.value, 10))}
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: Contact & Address Details */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <MapPin size={18} color="var(--accent-violet)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>3. Contact & Verified Address Intake</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">Contact Email <span className="required">*</span></label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="student.contact@example.com"
              value={formData.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number <span className="required">*</span></label>
            <input
              type="tel"
              required
              className="form-input"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Street Address <span className="required">*</span></label>
          <input
            type="text"
            required
            className="form-input"
            placeholder="House/Apartment #, Street, Area"
            value={formData.address.street}
            onChange={(e) => handleAddressChange('street', e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">City <span className="required">*</span></label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Bangalore"
              value={formData.address.city}
              onChange={(e) => handleAddressChange('city', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">State / Province <span className="required">*</span></label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Karnataka"
              value={formData.address.state}
              onChange={(e) => handleAddressChange('state', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Postal Code / PIN <span className="required">*</span></label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. 560001"
              value={formData.address.postalCode}
              onChange={(e) => handleAddressChange('postalCode', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Country <span className="required">*</span></label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. India"
              value={formData.address.country}
              onChange={(e) => handleAddressChange('country', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}
          disabled={isSubmitting}
        >
          <Save size={18} />
          {isSubmitting ? 'Saving Record...' : initialData ? 'Update Profile Record' : 'Save & Submit Profile Intake'}
        </button>
      </div>
    </form>
  );
};
