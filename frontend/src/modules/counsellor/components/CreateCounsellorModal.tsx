import React, { useState } from 'react';
import { X, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AdminClientService } from '../services/admin.service';

interface CreateCounsellorModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateCounsellorModal: React.FC<CreateCounsellorModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    qualification: 'M.Ed / Certified Career Counselor',
    experienceYears: 5,
    specialization: 'Study Abroad & University Admissions',
    skills: 'Career Guidance, University Selection, Application Guidance, Visa Advisory',
    languages: 'English, Hindi',
    countriesOfExpertise: 'USA, UK, Canada, Australia',
    courseExpertise: 'Computer Science, Business Administration, Engineering',
    bio: 'Dedicated senior academic advisor guiding students toward premier international institutions.',
    capacity: 35,
    verificationStatus: 'ACTIVE' as 'PENDING' | 'VERIFIED' | 'ACTIVE',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const languagesArray = formData.languages
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const countriesArray = formData.countriesOfExpertise
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const coursesArray = formData.courseExpertise
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await AdminClientService.createCounsellor({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        qualification: formData.qualification,
        experienceYears: Number(formData.experienceYears) || 0,
        specialization: formData.specialization,
        skills: skillsArray,
        languages: languagesArray,
        countriesOfExpertise: countriesArray,
        courseExpertise: coursesArray,
        bio: formData.bio,
        capacity: Number(formData.capacity) || 30,
        verificationStatus: formData.verificationStatus,
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || 'Failed to create counsellor');
      }
    } catch (err: any) {
      setError(err.message || 'Server error occurred while creating counsellor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.55rem 0.8rem',
    backgroundColor: '#FFFFFF',
    border: '1px solid #CBD5E1',
    borderRadius: '6px',
    color: '#0F172A',
    fontSize: '0.85rem',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#475569',
    marginBottom: '0.35rem',
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '92vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F8FAFC',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
              }}
            >
              <UserCheck size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0F172A' }}>
                Create New Counsellor
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>
                Add verified guidance personnel with assigned skills, countries & caseload capacity.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
          <div
            style={{
              padding: '1.5rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              flex: 1,
            }}
          >
            {error && (
              <div
                style={{
                  padding: '0.8rem 1rem',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  borderRadius: '6px',
                  color: '#B91C1C',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Login Credentials */}
            <div>
              <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                1. System Credentials
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Counsellor Email *</label>
                  <input
                    type="email"
                    required
                    style={inputStyle}
                    placeholder="counsellor@superconsciousness.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Initial Password *</label>
                  <input
                    type="password"
                    required
                    style={inputStyle}
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Personal & Professional Profile */}
            <div>
              <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                2. Professional Information
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input
                    type="text"
                    required
                    style={inputStyle}
                    placeholder="e.g. Dr. Jennifer Adams"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Contact Phone</label>
                  <input
                    type="text"
                    style={inputStyle}
                    placeholder="+1 (555) 234-5678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Experience (Years)</label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    style={inputStyle}
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={labelStyle}>Qualification</label>
                  <input
                    type="text"
                    style={inputStyle}
                    placeholder="e.g. M.Ed in Counselling Psychology"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Primary Specialization</label>
                  <input
                    type="text"
                    style={inputStyle}
                    placeholder="e.g. Ivy League & STEM Guidance"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={labelStyle}>Initial Verification Status</label>
                  <select
                    style={inputStyle}
                    value={formData.verificationStatus}
                    onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value as any })}
                  >
                    <option value="ACTIVE">ACTIVE (Ready for Student Assignment)</option>
                    <option value="VERIFIED">VERIFIED (Requires Activation)</option>
                    <option value="PENDING">PENDING (Review Queue)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Student Caseload Capacity</label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    style={inputStyle}
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Professional Bio</label>
                <textarea
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  placeholder="Summary of experience and guidance philosophy..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>
            </div>

            {/* Skills & Country Expertise */}
            <div>
              <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                3. Skills & Advisory Domain (Comma Separated)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={labelStyle}>Skills & Guidance Capabilities</label>
                  <input
                    type="text"
                    style={inputStyle}
                    placeholder="Career Guidance, University Selection, Visa Advisory"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Languages Spoken</label>
                  <input
                    type="text"
                    style={inputStyle}
                    placeholder="English, Hindi, Spanish"
                    value={formData.languages}
                    onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Countries of Expertise</label>
                  <input
                    type="text"
                    style={inputStyle}
                    placeholder="USA, UK, Canada, Australia"
                    value={formData.countriesOfExpertise}
                    onChange={(e) => setFormData({ ...formData, countriesOfExpertise: e.target.value })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Course / Discipline Expertise</label>
                  <input
                    type="text"
                    style={inputStyle}
                    placeholder="Computer Science, Business Administration, Engineering"
                    value={formData.courseExpertise}
                    onChange={(e) => setFormData({ ...formData, courseExpertise: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div
            style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '0.55rem 1.15rem',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                color: '#475569',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '0.55rem 1.35rem',
                backgroundColor: '#2563EB',
                border: 'none',
                borderRadius: '6px',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              <CheckCircle2 size={16} />
              <span>{isSubmitting ? 'Creating Counsellor...' : 'Create Counsellor'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
