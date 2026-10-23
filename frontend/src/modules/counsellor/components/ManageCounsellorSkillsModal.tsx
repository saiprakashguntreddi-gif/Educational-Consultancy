import React, { useState } from 'react';
import { X, Award, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { AdminClientService, CounsellorWorkloadInfo } from '../services/admin.service';

interface ManageCounsellorSkillsModalProps {
  counsellor: CounsellorWorkloadInfo;
  onClose: () => void;
  onSuccess: () => void;
}

export const ManageCounsellorSkillsModal: React.FC<ManageCounsellorSkillsModalProps> = ({
  counsellor,
  onClose,
  onSuccess,
}) => {
  const profile = counsellor.counsellorProfile;

  const [skills, setSkills] = useState<string[]>(profile?.skills || ['Career Guidance', 'University Selection']);
  const [countries, setCountries] = useState<string[]>(profile?.countriesOfExpertise || ['USA', 'UK', 'Canada']);
  const [courses, setCourses] = useState<string[]>(profile?.courseExpertise || ['Computer Science', 'Business Administration']);
  const [specialization, setSpecialization] = useState<string>(profile?.specialization || 'Study Abroad');

  const [newSkill, setNewSkill] = useState('');
  const [newCountry, setNewCountry] = useState('');
  const [newCourse, setNewCourse] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddCountry = () => {
    const trimmed = newCountry.trim();
    if (trimmed && !countries.includes(trimmed)) {
      setCountries([...countries, trimmed]);
      setNewCountry('');
    }
  };

  const handleRemoveCountry = (cToRemove: string) => {
    setCountries(countries.filter((c) => c !== cToRemove));
  };

  const handleAddCourse = () => {
    const trimmed = newCourse.trim();
    if (trimmed && !courses.includes(trimmed)) {
      setCourses([...courses, trimmed]);
      setNewCourse('');
    }
  };

  const handleRemoveCourse = (cToRemove: string) => {
    setCourses(courses.filter((c) => c !== cToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await AdminClientService.updateCounsellorSkills(counsellor.id, {
        skills,
        countriesOfExpertise: countries,
        courseExpertise: courses,
        specialization,
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || 'Failed to update skills');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while saving skills');
    } finally {
      setIsSubmitting(false);
    }
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
          maxWidth: '620px',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
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
                width: 36,
                height: 36,
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
              }}
            >
              <Award size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>
                Manage Counsellor Skills & Expertise
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>
                {profile?.fullName || counsellor.email.split('@')[0]} ({counsellor.email})
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
            }}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
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
                  padding: '0.75rem 1rem',
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

            {/* Specialization */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                Primary Specialization
              </label>
              <input
                type="text"
                style={{
                  width: '100%',
                  padding: '0.55rem 0.8rem',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  color: '#0F172A',
                }}
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. STEM Study Abroad, Medical Programs"
              />
            </div>

            {/* Advisory Skills */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                Advisory Skills ({skills.length})
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <input
                  type="text"
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                  }}
                  placeholder="e.g. Scholarship Guidance"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  style={{
                    padding: '0.5rem 0.9rem',
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '6px',
                    color: '#2563EB',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Plus size={15} /> Add
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backgroundColor: '#F1F5F9',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      padding: '0.25rem 0.6rem',
                      fontSize: '0.8rem',
                      color: '#0F172A',
                      fontWeight: 500,
                    }}
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Countries of Expertise */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                Countries of Expertise ({countries.length})
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <input
                  type="text"
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                  }}
                  placeholder="e.g. Germany, Singapore"
                  value={newCountry}
                  onChange={(e) => setNewCountry(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCountry();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCountry}
                  style={{
                    padding: '0.5rem 0.9rem',
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '6px',
                    color: '#2563EB',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Plus size={15} /> Add
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {countries.map((country, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backgroundColor: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      borderRadius: '6px',
                      padding: '0.25rem 0.6rem',
                      fontSize: '0.8rem',
                      color: '#065F46',
                      fontWeight: 500,
                    }}
                  >
                    <span>{country}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCountry(country)}
                      style={{ background: 'none', border: 'none', color: '#059669', cursor: 'pointer', padding: 0 }}
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Courses of Expertise */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                Course / Discipline Expertise ({courses.length})
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <input
                  type="text"
                  style={{
                    flex: 1,
                    padding: '0.5rem 0.75rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                  }}
                  placeholder="e.g. Data Science, Biotechnology"
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCourse();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCourse}
                  style={{
                    padding: '0.5rem 0.9rem',
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '6px',
                    color: '#2563EB',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Plus size={15} /> Add
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {courses.map((course, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backgroundColor: '#F5F3FF',
                      border: '1px solid #DDD6FE',
                      borderRadius: '6px',
                      padding: '0.25rem 0.6rem',
                      fontSize: '0.8rem',
                      color: '#5B21B6',
                      fontWeight: 500,
                    }}
                  >
                    <span>{course}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCourse(course)}
                      style={{ background: 'none', border: 'none', color: '#8B5CF6', cursor: 'pointer', padding: 0 }}
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
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
              }}
            >
              <CheckCircle2 size={16} />
              <span>{isSubmitting ? 'Saving...' : 'Save Skills & Domains'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
