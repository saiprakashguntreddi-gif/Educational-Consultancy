import React, { useState } from 'react';
import { X, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { CounsellorClientService } from '../services/counsellor.service';

interface CreateStudentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateStudentModal: React.FC<CreateStudentModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    gender: 'MALE',
    grade: 'Grade 12',
    contactEmail: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    },
    board: 'CBSE',
    citizenship: 'Indian',
    passingOutYear: 2026,
    assignToSelf: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await CounsellorClientService.createStudent({
        ...formData,
        contactEmail: formData.contactEmail || formData.email,
        passingOutYear: Number(formData.passingOutYear),
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || 'Creation failed');
      }
    } catch (err: any) {
      setError(err.message || 'Server error occurred');
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
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
          overflow: 'hidden',
          color: '#0F172A',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <UserPlus size={18} />
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>
              Create Student Account (Staff Onboarding)
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto' }}>
          {error && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                color: '#B91C1C',
                marginBottom: '1.25rem',
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Account Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@example.com"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Initial Password * (min 8 chars)</label>
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••••••"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Full Legal Name *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Maya Sharma"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Phone Number *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Grade / Class *</label>
              <input
                type="text"
                required
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                placeholder="e.g. Grade 12"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                style={inputStyle}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="NON_BINARY">Non-Binary</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Board / Curriculum *</label>
              <select
                value={formData.board}
                onChange={(e) => setFormData({ ...formData, board: e.target.value })}
                style={inputStyle}
              >
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="IB">IB</option>
                <option value="Cambridge">Cambridge</option>
                <option value="State Board">State Board</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Citizenship *</label>
              <input
                type="text"
                required
                value={formData.citizenship}
                onChange={(e) => setFormData({ ...formData, citizenship: e.target.value })}
                placeholder="e.g. Indian"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Passing Out Year *</label>
              <input
                type="number"
                required
                min={2020}
                max={2035}
                value={formData.passingOutYear}
                onChange={(e) => setFormData({ ...formData, passingOutYear: Number(e.target.value) })}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Street Address *</label>
            <input
              type="text"
              required
              value={formData.address.street}
              onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
              placeholder="e.g. 104 Silicon Valley Heights"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={labelStyle}>City *</label>
              <input
                type="text"
                required
                value={formData.address.city}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                placeholder="City"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>State *</label>
              <input
                type="text"
                required
                value={formData.address.state}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                placeholder="State"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Postal Code *</label>
              <input
                type="text"
                required
                value={formData.address.postalCode}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, postalCode: e.target.value } })}
                placeholder="PIN / Zip"
                style={inputStyle}
              />
            </div>
          </div>

          <div
            style={{
              paddingTop: '1rem',
              borderTop: '1px solid #F1F5F9',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.6rem 1.25rem',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
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
                padding: '0.6rem 1.5rem',
                backgroundColor: '#2563EB',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <CheckCircle2 size={16} />
              {isSubmitting ? 'Creating...' : 'Create & Verify Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
