import React, { useState } from 'react';
import {
  Award,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Building2,
  ExternalLink,
  Check,
  X,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import {
  StudentAchievementRecord,
  CreateAchievementInput,
  UpdateAchievementInput,
} from '../personal.types';

interface AchievementsSectionProps {
  achievements: StudentAchievementRecord[];
  onAddAchievement: (payload: CreateAchievementInput) => Promise<boolean>;
  onUpdateAchievement: (id: string, payload: UpdateAchievementInput) => Promise<boolean>;
  onDeleteAchievement: (id: string) => Promise<boolean>;
  isSaving: boolean;
}

const ACHIEVEMENT_CATEGORIES = [
  'Academic Excellence & Honors',
  'Olympiads & STEM Competitions',
  'Sports & Athletics Distinction',
  'Arts, Music & Cultural Awards',
  'Leadership & Civic Recognition',
  'Hackathons & Innovation Challenges',
  'Other Honor',
];

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  achievements,
  onAddAchievement,
  onUpdateAchievement,
  onDeleteAchievement,
  isSaving,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAchievementId, setEditingAchievementId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    category: string;
    issuer: string;
    dateYear: string;
    description: string;
    certificateUrl: string;
  }>({
    title: '',
    category: 'Academic Excellence & Honors',
    issuer: '',
    dateYear: '',
    description: '',
    certificateUrl: '',
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const openAddForm = () => {
    setEditingAchievementId(null);
    setFormData({
      title: '',
      category: 'Academic Excellence & Honors',
      issuer: '',
      dateYear: '',
      description: '',
      certificateUrl: '',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEditForm = (item: StudentAchievementRecord) => {
    setEditingAchievementId(item.id);
    setFormData({
      title: item.title,
      category: item.category,
      issuer: item.issuer || '',
      dateYear: item.dateYear || '',
      description: item.description || '',
      certificateUrl: item.certificateUrl || '',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingAchievementId(null);
    setFormErrors({});
  };

  const validate = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!formData.title.trim()) {
      errors.title = 'Achievement title is required.';
    } else if (formData.title.trim().length < 2) {
      errors.title = 'Title must be at least 2 characters.';
    }

    if (!formData.category.trim()) {
      errors.category = 'Category is required.';
    }

    // Optional certificate URL validation
    if (formData.certificateUrl.trim()) {
      try {
        new URL(formData.certificateUrl.trim());
      } catch {
        errors.certificateUrl = 'Please enter a valid URL (e.g. https://example.com/certificate.pdf).';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingAchievementId) {
      const success = await onUpdateAchievement(editingAchievementId, {
        title: formData.title.trim(),
        category: formData.category.trim(),
        issuer: formData.issuer.trim() || null,
        dateYear: formData.dateYear.trim() || null,
        description: formData.description.trim() || null,
        certificateUrl: formData.certificateUrl.trim() || null,
      });
      if (success) closeForm();
    } else {
      const success = await onAddAchievement({
        title: formData.title.trim(),
        category: formData.category.trim(),
        issuer: formData.issuer.trim() || null,
        dateYear: formData.dateYear.trim() || null,
        description: formData.description.trim() || null,
        certificateUrl: formData.certificateUrl.trim() || null,
      });
      if (success) closeForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this achievement record?')) {
      setDeletingId(id);
      await onDeleteAchievement(id);
      setDeletingId(null);
    }
  };

  const safeAchievements = Array.isArray(achievements) ? achievements : [];

  return (
    <section
      id="section-achievements"
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}
    >
      {/* SECTION HEADER */}
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
              background: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Award size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h2
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: '#0F172A',
                  margin: 0,
                }}
              >
                4. Achievements & Recognitions
              </h2>
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.55rem',
                  borderRadius: '999px',
                  background: safeAchievements.length > 0 ? '#FEF3C7' : '#F1F5F9',
                  color: safeAchievements.length > 0 ? '#B45309' : '#64748B',
                }}
              >
                {safeAchievements.length} {safeAchievements.length === 1 ? 'Award' : 'Awards'}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.15rem 0 0' }}>
              Olympiads, academic awards, athletic medals, certificates, and published work
            </p>
          </div>
        </div>

        {!isFormOpen && (
          <button
            id="add-achievement-btn"
            onClick={openAddForm}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #4F46E5 0%, #6D28D9 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(79, 70, 229, 0.3)',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <Plus size={16} />
            <span>Add Achievement</span>
          </button>
        )}
      </div>

      <div style={{ padding: '1.75rem' }}>
        {/* ADD / EDIT FORM */}
        {isFormOpen && (
          <form
            onSubmit={handleSubmit}
            id="achievement-form"
            style={{
              background: '#F8FAFC',
              borderRadius: '12px',
              border: '1.5px solid #CBD5E1',
              padding: '1.5rem',
              marginBottom: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={18} color="#D97706" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  {editingAchievementId ? 'Edit Achievement Record' : 'Record New Achievement'}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeForm}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: '0.2rem' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {/* Title */}
              <div>
                <label
                  htmlFor="ach-title-input"
                  style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}
                >
                  Achievement Title <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  id="ach-title-input"
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (formErrors.title) setFormErrors({ ...formErrors, title: '' });
                  }}
                  placeholder="e.g. State Science Olympiad Gold Medal, High Honor Roll"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: formErrors.title ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                  }}
                />
                {formErrors.title && (
                  <p style={{ fontSize: '0.75rem', color: '#EF4444', margin: '0.3rem 0 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertCircle size={12} /> {formErrors.title}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="ach-category-select"
                  style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}
                >
                  Category <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  id="ach-category-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                    color: '#0F172A',
                    background: '#FFFFFF',
                    boxSizing: 'border-box',
                  }}
                >
                  {ACHIEVEMENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Issuing Organization */}
              <div>
                <label
                  htmlFor="ach-issuer-input"
                  style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}
                >
                  Issuing Organization <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 400 }}>(Optional)</span>
                </label>
                <input
                  id="ach-issuer-input"
                  type="text"
                  value={formData.issuer}
                  onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                  placeholder="e.g. State Department of Education, IEEE, Duke of Edinburgh"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Date or Year */}
              <div>
                <label
                  htmlFor="ach-date-input"
                  style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}
                >
                  Date / Year <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 400 }}>(Optional)</span>
                </label>
                <input
                  id="ach-date-input"
                  type="text"
                  value={formData.dateYear}
                  onChange={(e) => setFormData({ ...formData, dateYear: e.target.value })}
                  placeholder="e.g. May 2025, 2024, Grade 11"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Description */}
            <div style={{ marginTop: '1.25rem' }}>
              <label
                htmlFor="ach-desc-input"
                style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}
              >
                Short Description <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 400 }}>(Optional)</span>
              </label>
              <textarea
                id="ach-desc-input"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Briefly describe the criteria, rank, or scope of this achievement..."
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.9rem',
                  color: '#0F172A',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Supporting Document / Certificate URL */}
            <div style={{ marginTop: '1.25rem' }}>
              <label
                htmlFor="ach-url-input"
                style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}
              >
                Supporting Document / Certificate URL <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 400 }}>(Optional)</span>
              </label>
              <input
                id="ach-url-input"
                type="url"
                value={formData.certificateUrl}
                onChange={(e) => {
                  setFormData({ ...formData, certificateUrl: e.target.value });
                  if (formErrors.certificateUrl) setFormErrors({ ...formErrors, certificateUrl: '' });
                }}
                placeholder="https://credentials.example.com/certificate.pdf"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: formErrors.certificateUrl ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                  fontSize: '0.9rem',
                  color: '#0F172A',
                  boxSizing: 'border-box',
                }}
              />
              {formErrors.certificateUrl && (
                <p style={{ fontSize: '0.75rem', color: '#EF4444', margin: '0.3rem 0 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <AlertCircle size={12} /> {formErrors.certificateUrl}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div
              style={{
                marginTop: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '0.75rem',
              }}
            >
              <button
                type="button"
                onClick={closeForm}
                disabled={isSaving}
                style={{
                  padding: '0.6rem 1.15rem',
                  borderRadius: '8px',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: '#475569',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <X size={15} />
                <span>Cancel</span>
              </button>

              <button
                type="submit"
                id="save-achievement-btn"
                disabled={isSaving}
                style={{
                  padding: '0.6rem 1.4rem',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #4F46E5 0%, #6D28D9 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  opacity: isSaving ? 0.75 : 1,
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
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>{editingAchievementId ? 'Update Achievement' : 'Save Achievement'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ACHIEVEMENTS LIST OR EMPTY STATE */}
        {safeAchievements.length === 0 && !isFormOpen ? (
          <div
            id="empty-achievements-state"
            style={{
              padding: '3rem 1.5rem',
              textAlign: 'center',
              background: '#F8FAFC',
              borderRadius: '12px',
              border: '1px dashed #CBD5E1',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <Award size={28} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.35rem' }}>
              No achievements recorded yet
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#64748B', maxWidth: '440px', margin: '0 auto 1.25rem', lineHeight: 1.5 }}>
              Add academic honors, Olympiad ranks, sports awards, competition prizes, and recognized distinctions that elevate your college applications.
            </p>
            <button
              onClick={openAddForm}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                background: '#4F46E5',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Plus size={16} />
              <span>Record First Achievement</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {safeAchievements.map((ach) => (
              <div
                key={ach.id}
                id={`achievement-card-${ach.id}`}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '1.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#FDE68A';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(217, 119, 6, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                        {ach.title}
                      </h4>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.6rem',
                          borderRadius: '999px',
                          background: '#FEF3C7',
                          color: '#B45309',
                          border: '1px solid #FDE68A',
                        }}
                      >
                        {ach.category}
                      </span>
                    </div>

                    {/* Metadata tags */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.82rem', color: '#64748B' }}>
                      {ach.issuer && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Building2 size={14} color="#94A3B8" /> {ach.issuer}
                        </span>
                      )}
                      {ach.dateYear && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Calendar size={14} color="#94A3B8" /> {ach.dateYear}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      id={`edit-ach-${ach.id}`}
                      onClick={() => openEditForm(ach)}
                      title="Edit Achievement"
                      style={{
                        padding: '0.45rem',
                        borderRadius: '6px',
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        color: '#475569',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#FEF3C7')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      id={`delete-ach-${ach.id}`}
                      onClick={() => handleDelete(ach.id)}
                      disabled={deletingId === ach.id}
                      title="Delete Achievement"
                      style={{
                        padding: '0.45rem',
                        borderRadius: '6px',
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        color: '#DC2626',
                        cursor: deletingId === ach.id ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#FEE2E2')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {ach.description && (
                  <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5, margin: 0 }}>
                    {ach.description}
                  </p>
                )}

                {/* Supporting Document / Certificate Link */}
                {ach.certificateUrl && (
                  <div style={{ marginTop: '0.25rem' }}>
                    <a
                      href={ach.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: '#4F46E5',
                        textDecoration: 'none',
                        background: '#EEF2FF',
                        padding: '0.3rem 0.65rem',
                        borderRadius: '6px',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                    >
                      <FileCheck size={14} />
                      <span>View Credential / Certificate</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
