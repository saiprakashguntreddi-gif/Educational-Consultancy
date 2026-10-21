import React, { useState } from 'react';
import {
  Compass,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Building2,
  Award,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import {
  StudentActivityRecord,
  CreateActivityInput,
  UpdateActivityInput,
} from '../personal.types';

interface ActivitiesSectionProps {
  activities: StudentActivityRecord[];
  onAddActivity: (payload: CreateActivityInput) => Promise<boolean>;
  onUpdateActivity: (id: string, payload: UpdateActivityInput) => Promise<boolean>;
  onDeleteActivity: (id: string) => Promise<boolean>;
  isSaving: boolean;
}

const CATEGORY_OPTIONS = [
  'Leadership & Student Government',
  'Community Service & Volunteering',
  'Sports & Athletics',
  'Clubs & Societies',
  'Performing & Creative Arts',
  'Academic & STEM Competitions',
  'Internships & Work Experience',
  'Other',
];

export const ActivitiesSection: React.FC<ActivitiesSectionProps> = ({
  activities,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
  isSaving,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    activityName: string;
    category: string;
    organization: string;
    period: string;
    description: string;
    recognition: string;
  }>({
    activityName: '',
    category: 'Leadership & Student Government',
    organization: '',
    period: '',
    description: '',
    recognition: '',
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const openAddForm = () => {
    setEditingActivityId(null);
    setFormData({
      activityName: '',
      category: 'Leadership & Student Government',
      organization: '',
      period: '',
      description: '',
      recognition: '',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEditForm = (item: StudentActivityRecord) => {
    setEditingActivityId(item.id);
    setFormData({
      activityName: item.activityName,
      category: item.category,
      organization: item.organization || '',
      period: item.period || '',
      description: item.description,
      recognition: item.recognition || '',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingActivityId(null);
    setFormErrors({});
  };

  const validate = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!formData.activityName.trim()) {
      errors.activityName = 'Activity name is required.';
    } else if (formData.activityName.trim().length < 2) {
      errors.activityName = 'Activity name must be at least 2 characters.';
    }

    if (!formData.category.trim()) {
      errors.category = 'Category is required.';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description of involvement is required.';
    } else if (formData.description.trim().length < 3) {
      errors.description = 'Description must be at least 3 characters.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingActivityId) {
      const success = await onUpdateActivity(editingActivityId, {
        activityName: formData.activityName.trim(),
        category: formData.category.trim(),
        organization: formData.organization.trim() || null,
        period: formData.period.trim() || null,
        description: formData.description.trim(),
        recognition: formData.recognition.trim() || null,
      });
      if (success) closeForm();
    } else {
      const success = await onAddActivity({
        activityName: formData.activityName.trim(),
        category: formData.category.trim(),
        organization: formData.organization.trim() || null,
        period: formData.period.trim() || null,
        description: formData.description.trim(),
        recognition: formData.recognition.trim() || null,
      });
      if (success) closeForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this activity entry?')) {
      setDeletingId(id);
      await onDeleteActivity(id);
      setDeletingId(null);
    }
  };

  const safeActivities = Array.isArray(activities) ? activities : [];

  return (
    <section
      id="section-activities"
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
              background: '#EEF2FF',
              color: '#4F46E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Compass size={20} />
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
                3. Extracurricular Activities
              </h2>
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.55rem',
                  borderRadius: '999px',
                  background: safeActivities.length > 0 ? '#E0E7FF' : '#F1F5F9',
                  color: safeActivities.length > 0 ? '#4338CA' : '#64748B',
                }}
              >
                {safeActivities.length} {safeActivities.length === 1 ? 'Entry' : 'Entries'}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0.15rem 0 0' }}>
              Clubs, sports, volunteering, arts, and leadership initiatives
            </p>
          </div>
        </div>

        {!isFormOpen && (
          <button
            id="add-activity-btn"
            onClick={openAddForm}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              background: '#4F46E5',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(79, 70, 229, 0.3)',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#4338CA')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#4F46E5')}
          >
            <Plus size={16} />
            <span>Add Activity</span>
          </button>
        )}
      </div>

      <div style={{ padding: '1.75rem' }}>
        {/* ADD / EDIT ACTIVITY MODAL / FORM CARD */}
        {isFormOpen && (
          <form
            onSubmit={handleSubmit}
            id="activity-form"
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
                <Compass size={18} color="#4F46E5" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  {editingActivityId ? 'Edit Extracurricular Activity' : 'Add New Extracurricular Activity'}
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
              {/* Activity Name */}
              <div>
                <label
                  htmlFor="act-name-input"
                  style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}
                >
                  Activity Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  id="act-name-input"
                  type="text"
                  value={formData.activityName}
                  onChange={(e) => {
                    setFormData({ ...formData, activityName: e.target.value });
                    if (formErrors.activityName) setFormErrors({ ...formErrors, activityName: '' });
                  }}
                  placeholder="e.g. Robotics Club, Debate Society, Varsity Track"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: formErrors.activityName ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                    fontSize: '0.9rem',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                  }}
                />
                {formErrors.activityName && (
                  <p style={{ fontSize: '0.75rem', color: '#EF4444', margin: '0.3rem 0 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertCircle size={12} /> {formErrors.activityName}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="act-category-select"
                  style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}
                >
                  Category <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <select
                  id="act-category-select"
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
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Organization / Institution */}
              <div>
                <label
                  htmlFor="act-org-input"
                  style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}
                >
                  Organization / Institution <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 400 }}>(Optional)</span>
                </label>
                <input
                  id="act-org-input"
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="e.g. Lincoln High School, Red Cross, Rotary Youth"
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

              {/* Participation Period */}
              <div>
                <label
                  htmlFor="act-period-input"
                  style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}
                >
                  Participation Period <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 400 }}>(Optional)</span>
                </label>
                <input
                  id="act-period-input"
                  type="text"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  placeholder="e.g. 2024 – Present, Summer 2024, 2 years"
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
                htmlFor="act-desc-input"
                style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}
              >
                Description of Involvement <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <textarea
                id="act-desc-input"
                rows={3}
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (formErrors.description) setFormErrors({ ...formErrors, description: '' });
                }}
                placeholder="Highlight your responsibilities, leadership role, projects completed, or key contributions..."
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  border: formErrors.description ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                  fontSize: '0.9rem',
                  color: '#0F172A',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
              {formErrors.description && (
                <p style={{ fontSize: '0.75rem', color: '#EF4444', margin: '0.3rem 0 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <AlertCircle size={12} /> {formErrors.description}
                </p>
              )}
            </div>

            {/* Recognition / Awards */}
            <div style={{ marginTop: '1.25rem' }}>
              <label
                htmlFor="act-recog-input"
                style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}
              >
                Achievements / Recognition <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 400 }}>(Optional)</span>
              </label>
              <input
                id="act-recog-input"
                type="text"
                value={formData.recognition}
                onChange={(e) => setFormData({ ...formData, recognition: e.target.value })}
                placeholder="e.g. Team Captain, Regional 1st Place, Outstanding Volunteer Award"
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
                id="save-activity-btn"
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
                    <span>{editingActivityId ? 'Update Activity' : 'Save Activity'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ACTIVITIES LIST OR EMPTY STATE */}
        {safeActivities.length === 0 && !isFormOpen ? (
          <div
            id="empty-activities-state"
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
                background: '#EEF2FF',
                color: '#4F46E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <Compass size={28} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: '0 0 0.35rem' }}>
              No extracurricular activities recorded yet
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#64748B', maxWidth: '440px', margin: '0 auto 1.25rem', lineHeight: 1.5 }}>
              Highlighting your leadership, volunteering, clubs, and athletic experiences provides university admissions committees with a holistic view of your profile.
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
              <span>Record First Activity</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {safeActivities.map((act) => (
              <div
                key={act.id}
                id={`activity-card-${act.id}`}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '1.35rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#C7D2FE';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.06)';
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
                        {act.activityName}
                      </h4>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.6rem',
                          borderRadius: '999px',
                          background: '#EEF2FF',
                          color: '#4338CA',
                          border: '1px solid #E0E7FF',
                        }}
                      >
                        {act.category}
                      </span>
                    </div>

                    {/* Metadata tags */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.82rem', color: '#64748B' }}>
                      {act.organization && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Building2 size={14} color="#94A3B8" /> {act.organization}
                        </span>
                      )}
                      {act.period && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Calendar size={14} color="#94A3B8" /> {act.period}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      id={`edit-act-${act.id}`}
                      onClick={() => openEditForm(act)}
                      title="Edit Activity"
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
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#EEF2FF')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      id={`delete-act-${act.id}`}
                      onClick={() => handleDelete(act.id)}
                      disabled={deletingId === act.id}
                      title="Delete Activity"
                      style={{
                        padding: '0.45rem',
                        borderRadius: '6px',
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        color: '#DC2626',
                        cursor: deletingId === act.id ? 'not-allowed' : 'pointer',
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
                <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-line' }}>
                  {act.description}
                </p>

                {/* Recognition Badge if provided */}
                {act.recognition && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '8px',
                      background: '#FFFBEB',
                      border: '1px solid #FDE68A',
                      color: '#B45309',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      alignSelf: 'flex-start',
                    }}
                  >
                    <Award size={14} color="#D97706" />
                    <span>Recognition: {act.recognition}</span>
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
