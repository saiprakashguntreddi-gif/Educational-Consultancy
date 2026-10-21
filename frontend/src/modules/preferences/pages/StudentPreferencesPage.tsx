import React, { useState, useEffect } from 'react';
import { PreferencesService } from '../services/preferences.service';
import { ProfileService } from '../../profile/services/profile.service';
import { StudentPreferenceRecord } from '../preferences.types';
import { StudentProfileRecord } from '../../profile/profile.types';
import { POPULAR_STUDY_DESTINATIONS, ACADEMIC_DISCIPLINES } from '../preferences.constants';
import {
  Compass,
  Globe2,
  BookOpen,
  CheckCircle2,
  Star,
  Plus,
  Trash2,
  AlertCircle,
  GraduationCap,
  Save,
} from 'lucide-react';

interface StudentPreferencesPageProps {
  onNavigateToProfile?: () => void;
}

export const StudentPreferencesPage: React.FC<StudentPreferencesPageProps> = ({
  onNavigateToProfile,
}) => {
  // Profile check state (Module 1 prerequisite)
  const [profile, setProfile] = useState<StudentProfileRecord | null>(null);
  const [isCheckingProfile, setIsCheckingProfile] = useState<boolean>(true);

  // Preferences form state
  const [savedPreferences, setSavedPreferences] = useState<StudentPreferenceRecord | null>(null);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState<boolean>(true);

  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [primaryCountry, setPrimaryCountry] = useState<string>('');
  const [customCountryInput, setCustomCountryInput] = useState<string>('');

  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedSubDepartment, setSelectedSubDepartment] = useState<string>('');
  const [customSpecializationInput, setCustomSpecializationInput] = useState<string>('');

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setIsCheckingProfile(true);
      try {
        const profileRes = await ProfileService.getMyProfile();
        if (profileRes.success && profileRes.data) {
          setProfile(profileRes.data);
          // If profile exists, load preferences
          loadPreferences();
        } else {
          setProfile(null);
          setIsLoadingPreferences(false);
        }
      } catch {
        setProfile(null);
        setIsLoadingPreferences(false);
      } finally {
        setIsCheckingProfile(false);
      }
    };

    initializeData();
  }, []);

  const loadPreferences = async () => {
    setIsLoadingPreferences(true);
    try {
      const res = await PreferencesService.getMyPreferences();
      if (res.success && res.data) {
        setSavedPreferences(res.data);
        populateForm(res.data);
      } else {
        // Defaults if no prior preferences
        setSelectedCountries(['United States', 'United Kingdom']);
        setPrimaryCountry('United States');
        setSelectedDepartment('Engineering & Technology');
        setSelectedSubDepartment('Computer Science & Engineering');
      }
    } catch {
      // Defaults on error/missing
      setSelectedCountries(['United States']);
      setPrimaryCountry('United States');
    } finally {
      setIsLoadingPreferences(false);
    }
  };

  const populateForm = (record: StudentPreferenceRecord) => {
    setSelectedCountries(record.countries || []);
    setPrimaryCountry(record.primaryCountry || (record.countries && record.countries[0]) || '');

    // Check if department is in catalog
    if (ACADEMIC_DISCIPLINES[record.department]) {
      setSelectedDepartment(record.department);
      const subList = ACADEMIC_DISCIPLINES[record.department];
      if (subList.includes(record.subDepartment)) {
        setSelectedSubDepartment(record.subDepartment);
      } else {
        setSelectedSubDepartment('Custom Specialization');
        setCustomSpecializationInput(record.subDepartment);
      }
    } else {
      setSelectedDepartment('Other / Interdisciplinary');
      setSelectedSubDepartment('Custom Specialization');
      setCustomSpecializationInput(record.subDepartment);
    }
  };

  // Country toggling & management
  const toggleCountry = (country: string) => {
    if (selectedCountries.includes(country)) {
      const updated = selectedCountries.filter((c) => c !== country);
      setSelectedCountries(updated);
      if (primaryCountry === country) {
        setPrimaryCountry(updated.length > 0 ? updated[0] : '');
      }
    } else {
      const updated = [...selectedCountries, country];
      setSelectedCountries(updated);
      if (!primaryCountry) {
        setPrimaryCountry(country);
      }
    }
  };

  const handleAddCustomCountry = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customCountryInput.trim();
    if (!trimmed) return;

    if (!selectedCountries.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...selectedCountries, trimmed];
      setSelectedCountries(updated);
      if (!primaryCountry) {
        setPrimaryCountry(trimmed);
      }
    }
    setCustomCountryInput('');
  };

  const removeCountry = (country: string) => {
    const updated = selectedCountries.filter((c) => c !== country);
    setSelectedCountries(updated);
    if (primaryCountry === country) {
      setPrimaryCountry(updated.length > 0 ? updated[0] : '');
    }
  };

  const setAsPrimary = (country: string) => {
    setPrimaryCountry(country);
  };

  // Department handling
  const handleDepartmentChange = (dept: string) => {
    setSelectedDepartment(dept);
    const subOptions = ACADEMIC_DISCIPLINES[dept] || [];
    if (subOptions.length > 0) {
      setSelectedSubDepartment(subOptions[0]);
    } else {
      setSelectedSubDepartment('');
    }
    setCustomSpecializationInput('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (selectedCountries.length === 0) {
      setFeedback({
        type: 'error',
        message: 'Please select at least one priority country or study destination.',
      });
      return;
    }

    if (!selectedDepartment) {
      setFeedback({
        type: 'error',
        message: 'Please select an academic department.',
      });
      return;
    }

    const finalSubDept =
      selectedSubDepartment === 'Custom Specialization' ||
      selectedSubDepartment.startsWith('Other')
        ? customSpecializationInput.trim()
        : selectedSubDepartment;

    if (!finalSubDept) {
      setFeedback({
        type: 'error',
        message: 'Please specify your sub-department or specialization.',
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        countries: selectedCountries,
        primaryCountry: primaryCountry || selectedCountries[0],
        department: selectedDepartment,
        subDepartment: finalSubDept,
      };

      const res = await PreferencesService.savePreferences(payload);
      if (res.success && res.data) {
        setSavedPreferences(res.data);
        setFeedback({
          type: 'success',
          message: 'Module 2 Preferences successfully saved and recorded in your student profile!',
        });
      } else {
        setFeedback({
          type: 'error',
          message: res.message || 'Failed to save preferences.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'An unexpected error occurred while saving preferences.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isCheckingProfile || isLoadingPreferences) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Loading Student Preferences...</div>
        <p style={{ fontSize: '0.875rem' }}>Synchronizing Module 2 educational preferences repository...</p>
      </div>
    );
  }

  // Prerequisite check: Profile intake (Module 1) must be submitted
  if (!profile) {
    return (
      <div style={{ maxWidth: '800px', margin: '3.5rem auto', padding: '0 1.5rem' }}>
        <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              color: '#f87171',
            }}
          >
            <AlertCircle size={32} />
          </div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.75rem' }}>
            Module 1 Profile Intake Required
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '540px', margin: '0 auto 2rem auto', lineHeight: '1.6' }}>
            According to the Superconsciousness guidance framework, your personal and academic record intake (Module 1) must be submitted before setting destination and specialization preferences.
          </p>
          {onNavigateToProfile && (
            <button
              onClick={onNavigateToProfile}
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}
            >
              <GraduationCap size={18} />
              Complete Profile Intake (Module 1)
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '960px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
      {/* Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(6, 182, 212, 0.2))',
              color: '#a5b4fc',
              padding: '0.35rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}
          >
            <Compass size={16} /> Module 2: Preferences
          </div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>
            Study Destinations & Specializations
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
            Capture your academic direction and country destinations to enable accurate institutional matching.
          </p>
        </div>

        {savedPreferences && (
          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-verified" style={{ marginBottom: '0.5rem' }}>
              <CheckCircle2 size={14} /> Preferences Saved
            </span>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
              Primary: <strong style={{ color: '#e2e8f0' }}>{savedPreferences.primaryCountry || 'None'}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            background:
              feedback.type === 'success'
                ? 'var(--status-verified-bg)'
                : 'var(--status-rejected-bg)',
            border: `1px solid ${
              feedback.type === 'success'
                ? 'var(--status-verified-border)'
                : 'var(--status-rejected-border)'
            }`,
            color:
              feedback.type === 'success'
                ? 'var(--status-verified-text)'
                : 'var(--status-rejected-text)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{feedback.message}</span>
        </div>
      )}

      {/* Saved Summary Card */}
      {savedPreferences && (
        <div
          className="glass-panel"
          style={{
            padding: '1.5rem',
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.5) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#818cf8', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
            <Compass size={16} /> Current Active Preferences Summary
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', fontSize: '0.875rem' }}>
            <div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>Primary Destination</div>
              <div style={{ fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Star size={14} color="#f59e0b" fill="#f59e0b" />
                {savedPreferences.primaryCountry || 'Not designated'}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>Selected Destinations ({savedPreferences.countries.length})</div>
              <div style={{ color: '#e2e8f0', fontWeight: 500 }}>
                {savedPreferences.countries.join(', ')}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>Department</div>
              <div style={{ fontWeight: 600, color: '#f8fafc' }}>{savedPreferences.department}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>Sub-Department / Specialization</div>
              <div style={{ fontWeight: 600, color: '#a5b4fc' }}>{savedPreferences.subDepartment}</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Preferences Form */}
      <form onSubmit={handleSave}>
        {/* Step 1: Priority Countries & Study Destinations */}
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818cf8',
              }}
            >
              <Globe2 size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
                1. Priority Countries and Study Destinations
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                Select target countries for higher education. Mark your #1 primary choice using the star.
              </p>
            </div>
          </div>

          {/* Quick Select Popular Destinations */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
              Suggested Top Global Destinations (Click to add/remove)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {POPULAR_STUDY_DESTINATIONS.map((c: string) => {
                const isSelected = selectedCountries.includes(c);
                const isPrimary = primaryCountry === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCountry(c)}
                    style={{
                      padding: '0.45rem 0.9rem',
                      borderRadius: '8px',
                      fontSize: '0.825rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      transition: 'all 0.15s ease',
                      border: isSelected
                        ? '1px solid #6366f1'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      background: isSelected
                        ? 'rgba(99, 102, 241, 0.25)'
                        : 'rgba(255, 255, 255, 0.04)',
                      color: isSelected ? '#f8fafc' : 'var(--text-muted)',
                    }}
                  >
                    {isPrimary && <Star size={13} color="#f59e0b" fill="#f59e0b" />}
                    {c}
                    {isSelected && <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>×</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add Custom Destination */}
          <div style={{ marginBottom: '1.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Or add another country (e.g. Norway, Finland, Malaysia)..."
              value={customCountryInput}
              onChange={(e) => setCustomCountryInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomCountry();
                }
              }}
              style={{ maxWidth: '420px' }}
            />
            <button
              type="button"
              onClick={() => handleAddCustomCountry()}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              <Plus size={16} /> Add Destination
            </button>
          </div>

          {/* Selected Countries Priority List */}
          <div>
            <label className="form-label" style={{ marginBottom: '0.6rem', display: 'block' }}>
              Your Selected Priority Destinations ({selectedCountries.length})
            </label>
            {selectedCountries.length === 0 ? (
              <div
                style={{
                  padding: '1.25rem',
                  border: '1px dashed rgba(255, 255, 255, 0.15)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  color: 'var(--text-dim)',
                  fontSize: '0.875rem',
                }}
              >
                No countries selected yet. Click any destination above to select.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedCountries.map((c, idx) => {
                  const isPrimary = primaryCountry === c;
                  return (
                    <div
                      key={c}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        background: isPrimary
                          ? 'rgba(99, 102, 241, 0.15)'
                          : 'rgba(255, 255, 255, 0.03)',
                        border: isPrimary
                          ? '1px solid rgba(99, 102, 241, 0.4)'
                          : '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            background: isPrimary ? '#6366f1' : 'rgba(255, 255, 255, 0.1)',
                            color: '#ffffff',
                          }}
                        >
                          #{idx + 1}
                        </span>
                        <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.925rem' }}>
                          {c}
                        </span>
                        {isPrimary && (
                          <span
                            style={{
                              fontSize: '0.725rem',
                              color: '#fbbf24',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontWeight: 600,
                            }}
                          >
                            <Star size={13} fill="#fbbf24" /> Primary Target
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {!isPrimary && (
                          <button
                            type="button"
                            onClick={() => setAsPrimary(c)}
                            className="btn btn-secondary"
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                            title="Set as Primary Destination"
                          >
                            <Star size={13} /> Set as Primary
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeCountry(c)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '0.35rem',
                            borderRadius: '4px',
                          }}
                          title="Remove country"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Department and Sub-Department / Specialization */}
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(6, 182, 212, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#06b6d4',
              }}
            >
              <BookOpen size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
                2. Department and Sub-Department / Specialization
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                Specify the exact academic faculty, department, and intended program specialization.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Department Select */}
            <div className="form-group">
              <label className="form-label" htmlFor="departmentSelect">
                Department / Academic Cluster <span style={{ color: '#f87171' }}>*</span>
              </label>
              <select
                id="departmentSelect"
                className="form-select"
                value={selectedDepartment}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                required
              >
                <option value="">-- Select Department --</option>
                {Object.keys(ACADEMIC_DISCIPLINES).map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub-Department Select */}
            <div className="form-group">
              <label className="form-label" htmlFor="subDepartmentSelect">
                Sub-Department / Specialization <span style={{ color: '#f87171' }}>*</span>
              </label>
              <select
                id="subDepartmentSelect"
                className="form-select"
                value={selectedSubDepartment}
                onChange={(e) => setSelectedSubDepartment(e.target.value)}
                disabled={!selectedDepartment}
                required
              >
                <option value="">-- Select Sub-Department / Track --</option>
                {selectedDepartment &&
                  (ACADEMIC_DISCIPLINES[selectedDepartment] || []).map((sub: string) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Custom Specialization Input (if selected or other) */}
          {(selectedSubDepartment === 'Custom Specialization' ||
            selectedSubDepartment.startsWith('Other')) && (
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" htmlFor="customSpecialization">
                Describe Your Specific Sub-Department or Specialization <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                id="customSpecialization"
                type="text"
                className="form-input"
                placeholder="e.g. Quantum Computing, Regenerative Agriculture, Luxury Fashion Brand Management..."
                value={customSpecializationInput}
                onChange={(e) => setCustomSpecializationInput(e.target.value)}
                required
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {onNavigateToProfile && (
            <button
              type="button"
              onClick={onNavigateToProfile}
              className="btn btn-secondary"
            >
              <GraduationCap size={16} /> Back to Profile Intake (Module 1)
            </button>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSaving}
            style={{ padding: '0.75rem 2rem', fontSize: '0.95rem', marginLeft: 'auto' }}
          >
            <Save size={18} />
            {isSaving ? 'Saving Preferences...' : 'Save & Update Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
};
