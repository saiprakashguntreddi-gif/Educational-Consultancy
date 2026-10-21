import React, { useState, useEffect } from 'react';
import {
  Phone,
  Mail,
  User,
  Users,
  Edit2,
  Check,
  X,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { GuardianInfo, UpdateContactGuardianInput } from '../personal.types';

interface ContactGuardianSectionProps {
  primaryEmail: string;
  primaryPhone: string;
  alternateEmail: string | null;
  guardian: GuardianInfo;
  onSave: (payload: UpdateContactGuardianInput) => Promise<boolean>;
  isSaving: boolean;
}

export const ContactGuardianSection: React.FC<ContactGuardianSectionProps> = ({
  primaryEmail,
  primaryPhone,
  alternateEmail,
  guardian,
  onSave,
  isSaving,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState<UpdateContactGuardianInput>({
    primaryPhone: primaryPhone || '',
    alternateEmail: alternateEmail || '',
    guardianName: guardian?.name || '',
    guardianRelationship: guardian?.relationship || 'Father',
    guardianPhone: guardian?.phone || '',
    guardianEmail: guardian?.email || '',
  });

  // Validation Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Sync state when props change
  useEffect(() => {
    setFormData({
      primaryPhone: primaryPhone || '',
      alternateEmail: alternateEmail || '',
      guardianName: guardian?.name || '',
      guardianRelationship: guardian?.relationship || 'Father',
      guardianPhone: guardian?.phone || '',
      guardianEmail: guardian?.email || '',
    });
  }, [primaryEmail, primaryPhone, alternateEmail, guardian]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validate Primary Phone
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,20}$/;
    if (!formData.primaryPhone?.trim()) {
      newErrors.primaryPhone = 'Primary phone number is required.';
    } else if (!phoneRegex.test(formData.primaryPhone.trim())) {
      newErrors.primaryPhone = 'Please enter a valid phone number (e.g. +1 555-123-4567).';
    }

    // Validate Alternate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.alternateEmail?.trim() && !emailRegex.test(formData.alternateEmail.trim())) {
      newErrors.alternateEmail = 'Please enter a valid email address.';
    }

    // Validate Guardian Phone (if provided)
    if (formData.guardianPhone?.trim() && !phoneRegex.test(formData.guardianPhone.trim())) {
      newErrors.guardianPhone = 'Please enter a valid guardian contact number.';
    }

    // Validate Guardian Email (if provided)
    if (formData.guardianEmail?.trim() && !emailRegex.test(formData.guardianEmail.trim())) {
      newErrors.guardianEmail = 'Please enter a valid guardian email address.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const success = await onSave(formData);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    // Reset to props
    setFormData({
      primaryPhone: primaryPhone || '',
      alternateEmail: alternateEmail || '',
      guardianName: guardian?.name || '',
      guardianRelationship: guardian?.relationship || 'Father',
      guardianPhone: guardian?.phone || '',
      guardianEmail: guardian?.email || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 1. CONTACT INFORMATION CARD */}
      <section
        id="section-contact-info"
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            background: 'linear-gradient(to right, #FFFFFF, #FAF5FF)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#EEF2FF',
                color: '#4F46E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Phone size={20} />
            </div>
            <div>
              <h2
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: '#0F172A',
                  margin: 0,
                }}
              >
                1. Contact Information
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.15rem 0 0' }}>
                Primary phone and verified email communication channels
              </p>
            </div>
          </div>

          {!isEditing && (
            <button
              id="edit-contact-btn"
              onClick={() => setIsEditing(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                color: '#334155',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#EEF2FF';
                e.currentTarget.style.borderColor = '#C7D2FE';
                e.currentTarget.style.color = '#4338CA';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#F8FAFC';
                e.currentTarget.style.borderColor = '#CBD5E1';
                e.currentTarget.style.color = '#334155';
              }}
            >
              <Edit2 size={15} />
              <span>Edit Details</span>
            </button>
          )}
        </div>

        <div style={{ padding: '1.75rem' }}>
          {!isEditing ? (
            /* VIEW MODE */
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {/* Primary Mobile */}
              <div
                style={{
                  padding: '1.1rem',
                  borderRadius: '12px',
                  background: '#F8FAFC',
                  border: '1px solid #F1F5F9',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <Phone size={15} color="#64748B" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Primary Mobile Number
                  </span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
                  {primaryPhone || 'Not provided'}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#16A34A', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.35rem' }}>
                  <Check size={12} /> Active for SMS notifications
                </span>
              </div>

              {/* Primary Email */}
              <div
                style={{
                  padding: '1.1rem',
                  borderRadius: '12px',
                  background: '#F8FAFC',
                  border: '1px solid #F1F5F9',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={15} color="#64748B" />
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Primary Email Address
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '999px',
                      background: '#E0E7FF',
                      color: '#4338CA',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Lock size={10} /> Verified Login
                  </span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', wordBreak: 'break-all' }}>
                  {primaryEmail}
                </div>
                <p style={{ fontSize: '0.74rem', color: '#64748B', margin: '0.35rem 0 0' }}>
                  Bound to student account security.
                </p>
              </div>

              {/* Alternate Email */}
              <div
                style={{
                  padding: '1.1rem',
                  borderRadius: '12px',
                  background: '#F8FAFC',
                  border: '1px solid #F1F5F9',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <Mail size={15} color="#64748B" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Alternate Email
                  </span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: alternateEmail ? '#0F172A' : '#94A3B8', wordBreak: 'break-all' }}>
                  {alternateEmail || 'None added'}
                </div>
                <p style={{ fontSize: '0.74rem', color: '#64748B', margin: '0.35rem 0 0' }}>
                  Backup channel for admission alerts.
                </p>
              </div>
            </div>
          ) : (
            /* EDIT MODE - FORM FIELDS */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {/* Primary Mobile Input */}
              <div>
                <label
                  htmlFor="input-primary-phone"
                  style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}
                >
                  Primary Mobile Number <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone
                    size={16}
                    color="#94A3B8"
                    style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    id="input-primary-phone"
                    type="tel"
                    value={formData.primaryPhone || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, primaryPhone: e.target.value });
                      if (errors.primaryPhone) setErrors({ ...errors, primaryPhone: '' });
                    }}
                    placeholder="+1 (555) 000-0000"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                      borderRadius: '8px',
                      border: errors.primaryPhone ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                      fontSize: '0.9rem',
                      color: '#0F172A',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                {errors.primaryPhone && (
                  <p style={{ fontSize: '0.75rem', color: '#EF4444', margin: '0.3rem 0 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertCircle size={12} /> {errors.primaryPhone}
                  </p>
                )}
              </div>

              {/* Primary Email - Read Only */}
              <div>
                <label
                  htmlFor="input-primary-email"
                  style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}
                >
                  Primary Login Email <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 400 }}>(Read-only)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    color="#94A3B8"
                    style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    id="input-primary-email"
                    type="email"
                    value={primaryEmail}
                    disabled
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      background: '#F1F5F9',
                      fontSize: '0.9rem',
                      color: '#64748B',
                      cursor: 'not-allowed',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <p style={{ fontSize: '0.72rem', color: '#64748B', margin: '0.3rem 0 0' }}>
                  To protect your account security, your primary login email cannot be changed here.
                </p>
              </div>

              {/* Alternate Email Input */}
              <div>
                <label
                  htmlFor="input-alt-email"
                  style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}
                >
                  Alternate Email Address <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 400 }}>(Optional)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    color="#94A3B8"
                    style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    id="input-alt-email"
                    type="email"
                    value={formData.alternateEmail || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, alternateEmail: e.target.value });
                      if (errors.alternateEmail) setErrors({ ...errors, alternateEmail: '' });
                    }}
                    placeholder="alternate.email@domain.com"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                      borderRadius: '8px',
                      border: errors.alternateEmail ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                      fontSize: '0.9rem',
                      color: '#0F172A',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                {errors.alternateEmail && (
                  <p style={{ fontSize: '0.75rem', color: '#EF4444', margin: '0.3rem 0 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertCircle size={12} /> {errors.alternateEmail}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. PARENT / GUARDIAN DETAILS CARD */}
      <section
        id="section-guardian-details"
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            background: 'linear-gradient(to right, #FFFFFF, #FAF5FF)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#F3E8FF',
                color: '#7C3AED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={20} />
            </div>
            <div>
              <h2
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: '#0F172A',
                  margin: 0,
                }}
              >
                2. Parent / Guardian Details
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.15rem 0 0' }}>
                Emergency family contact for university admissions & counsellor support
              </p>
            </div>
          </div>
        </div>

        <div style={{ padding: '1.75rem' }}>
          {!isEditing ? (
            /* VIEW MODE */
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {/* Guardian Name */}
              <div
                style={{
                  padding: '1.1rem',
                  borderRadius: '12px',
                  background: '#F8FAFC',
                  border: '1px solid #F1F5F9',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <User size={15} color="#64748B" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Parent / Guardian Name
                  </span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: guardian?.name ? '#0F172A' : '#94A3B8' }}>
                  {guardian?.name || 'Not provided'}
                </div>
              </div>

              {/* Relationship */}
              <div
                style={{
                  padding: '1.1rem',
                  borderRadius: '12px',
                  background: '#F8FAFC',
                  border: '1px solid #F1F5F9',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <Users size={15} color="#64748B" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Relationship
                  </span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
                  {guardian?.relationship || 'Not specified'}
                </div>
              </div>

              {/* Guardian Phone */}
              <div
                style={{
                  padding: '1.1rem',
                  borderRadius: '12px',
                  background: '#F8FAFC',
                  border: '1px solid #F1F5F9',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <Phone size={15} color="#64748B" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Contact Number
                  </span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: guardian?.phone ? '#0F172A' : '#94A3B8' }}>
                  {guardian?.phone || 'Not provided'}
                </div>
              </div>

              {/* Guardian Email */}
              <div
                style={{
                  padding: '1.1rem',
                  borderRadius: '12px',
                  background: '#F8FAFC',
                  border: '1px solid #F1F5F9',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <Mail size={15} color="#64748B" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Email Address
                  </span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: guardian?.email ? '#0F172A' : '#94A3B8', wordBreak: 'break-all' }}>
                  {guardian?.email || 'Not provided'}
                </div>
              </div>
            </div>
          ) : (
            /* EDIT MODE */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
              {/* Guardian Name */}
              <div>
                <label
                  htmlFor="input-guardian-name"
                  style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}
                >
                  Parent / Guardian Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={16}
                    color="#94A3B8"
                    style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    id="input-guardian-name"
                    type="text"
                    value={formData.guardianName || ''}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    placeholder="Full name of parent or guardian"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.9rem',
                      color: '#0F172A',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Relationship Dropdown */}
              <div>
                <label
                  htmlFor="select-guardian-rel"
                  style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}
                >
                  Relationship
                </label>
                <select
                  id="select-guardian-rel"
                  value={formData.guardianRelationship || 'Father'}
                  onChange={(e) => setFormData({ ...formData, guardianRelationship: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                    color: '#0F172A',
                    outline: 'none',
                    background: '#FFFFFF',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Legal Guardian</option>
                  <option value="Sibling">Elder Sibling</option>
                  <option value="Other">Other Relative</option>
                </select>
              </div>

              {/* Guardian Phone */}
              <div>
                <label
                  htmlFor="input-guardian-phone"
                  style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}
                >
                  Contact Number
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone
                    size={16}
                    color="#94A3B8"
                    style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    id="input-guardian-phone"
                    type="tel"
                    value={formData.guardianPhone || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, guardianPhone: e.target.value });
                      if (errors.guardianPhone) setErrors({ ...errors, guardianPhone: '' });
                    }}
                    placeholder="+1 (555) 000-0000"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                      borderRadius: '8px',
                      border: errors.guardianPhone ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                      fontSize: '0.9rem',
                      color: '#0F172A',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                {errors.guardianPhone && (
                  <p style={{ fontSize: '0.75rem', color: '#EF4444', margin: '0.3rem 0 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertCircle size={12} /> {errors.guardianPhone}
                  </p>
                )}
              </div>

              {/* Guardian Email */}
              <div>
                <label
                  htmlFor="input-guardian-email"
                  style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}
                >
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    color="#94A3B8"
                    style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    id="input-guardian-email"
                    type="email"
                    value={formData.guardianEmail || ''}
                    onChange={(e) => {
                      setFormData({ ...formData, guardianEmail: e.target.value });
                      if (errors.guardianEmail) setErrors({ ...errors, guardianEmail: '' });
                    }}
                    placeholder="guardian@domain.com"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                      borderRadius: '8px',
                      border: errors.guardianEmail ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                      fontSize: '0.9rem',
                      color: '#0F172A',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                {errors.guardianEmail && (
                  <p style={{ fontSize: '0.75rem', color: '#EF4444', margin: '0.3rem 0 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertCircle size={12} /> {errors.guardianEmail}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* EDIT ACTIONS BAR */}
          {isEditing && (
            <div
              style={{
                marginTop: '1.75rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '0.75rem',
              }}
            >
              <button
                type="button"
                id="cancel-contact-btn"
                onClick={handleCancel}
                disabled={isSaving}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: '#475569',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  opacity: isSaving ? 0.6 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <X size={15} />
                <span>Cancel</span>
              </button>

              <button
                type="button"
                id="save-contact-btn"
                onClick={handleFormSubmit}
                disabled={isSaving}
                style={{
                  padding: '0.65rem 1.5rem',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #4F46E5 0%, #6D28D9 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  opacity: isSaving ? 0.75 : 1,
                  boxShadow: '0 2px 4px rgba(79, 70, 229, 0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
              >
                {isSaving ? (
                  <>
                    <div
                      style={{
                        width: '14px',
                        height: '14px',
                        border: '2px solid rgba(255,255,255,0.4)',
                        borderTopColor: '#FFFFFF',
                        borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite',
                      }}
                    />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
