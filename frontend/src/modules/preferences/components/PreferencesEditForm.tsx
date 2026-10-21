import React, { useState } from 'react';
import { StudentPreferenceRecord, StudentPreferenceInput, DepartmentPreferencePair } from '../preferences.types';
import { COUNTRY_OPTIONS, DEPARTMENT_COURSE_CATALOG } from '../preferences.constants';
import { ProgressRing } from '../../../shared/components/ProgressRing';

interface PreferencesEditFormProps {
  initialData?: StudentPreferenceRecord | null;
  onSuccess: (record: StudentPreferenceRecord) => void;
  onCancel: () => void;
  onSubmit: (data: StudentPreferenceInput) => Promise<any>;
}

export const PreferencesEditForm: React.FC<PreferencesEditFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
  onSubmit,
}) => {
  // Countries state
  const [countriesNotFinalized, setCountriesNotFinalized] = useState(
    Boolean(initialData?.countriesNotFinalized)
  );

  const initialCountries =
    initialData && initialData.countries && initialData.countries.length > 0
      ? initialData.countries
      : ['India', 'United States of America'];

  const [selectedCountries, setSelectedCountries] = useState<string[]>(initialCountries);

  // Departments & Courses state
  const [coursesNotFinalized, setCoursesNotFinalized] = useState(
    Boolean(initialData?.coursesNotFinalized)
  );

  const initialPairs: DepartmentPreferencePair[] =
    initialData && initialData.departmentPreferences && initialData.departmentPreferences.length > 0
      ? initialData.departmentPreferences
      : initialData && initialData.department && initialData.subDepartment && initialData.department !== 'Not finalized'
      ? [{ department: initialData.department, subDepartment: initialData.subDepartment }]
      : [
          {
            department: 'Engineering & Technology',
            subDepartment: 'Computer/Software Engineering',
          },
        ];

  const [departmentPairs, setDepartmentPairs] = useState<DepartmentPreferencePair[]>(initialPairs);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Country actions
  const handleCountryChange = (index: number, value: string) => {
    const updated = [...selectedCountries];
    updated[index] = value;
    setSelectedCountries(updated);
  };

  const handleAddCountry = () => {
    // Find a country not already selected
    const unused = COUNTRY_OPTIONS.find((c) => !selectedCountries.includes(c)) || 'Canada';
    setSelectedCountries([...selectedCountries, unused]);
  };

  const handleRemoveCountry = (index: number) => {
    if (selectedCountries.length <= 1) return;
    const updated = selectedCountries.filter((_, i) => i !== index);
    setSelectedCountries(updated);
  };

  // Department & Course actions
  const handleDepartmentChange = (index: number, dept: string) => {
    const updated = [...departmentPairs];
    const availableCourses = DEPARTMENT_COURSE_CATALOG[dept] || [];
    updated[index] = {
      department: dept,
      subDepartment: availableCourses[0] || 'General Track',
    };
    setDepartmentPairs(updated);
  };

  const handleCourseChange = (index: number, course: string) => {
    const updated = [...departmentPairs];
    updated[index] = {
      ...updated[index],
      subDepartment: course,
    };
    setDepartmentPairs(updated);
  };

  const handleAddDepartmentPair = () => {
    const availableDepts = Object.keys(DEPARTMENT_COURSE_CATALOG);
    const nextDept = availableDepts.find((d) => !departmentPairs.some((p) => p.department === d)) || availableDepts[0];
    const availableCourses = DEPARTMENT_COURSE_CATALOG[nextDept] || [];
    setDepartmentPairs([
      ...departmentPairs,
      { department: nextDept, subDepartment: availableCourses[0] || 'General Track' },
    ]);
  };

  const handleRemoveDepartmentPair = (index: number) => {
    if (departmentPairs.length <= 1) return;
    const updated = departmentPairs.filter((_, i) => i !== index);
    setDepartmentPairs(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!countriesNotFinalized && selectedCountries.length === 0) {
      setErrorMessage('Please select at least one preferred country or check "I haven\'t finalized countries".');
      return;
    }

    if (!coursesNotFinalized && departmentPairs.length === 0) {
      setErrorMessage('Please select at least one department and course or check "I haven\'t finalized which courses".');
      return;
    }

    const payload: StudentPreferenceInput = {
      countriesNotFinalized,
      countries: countriesNotFinalized ? [] : selectedCountries,
      primaryCountry: countriesNotFinalized ? undefined : selectedCountries[0],
      coursesNotFinalized,
      department: coursesNotFinalized
        ? 'Not finalized'
        : departmentPairs[0]?.department || 'General',
      subDepartment: coursesNotFinalized
        ? 'Not finalized'
        : departmentPairs[0]?.subDepartment || 'General Track',
      departmentPreferences: coursesNotFinalized ? [] : departmentPairs,
    };

    setIsSubmitting(true);
    try {
      const response = await onSubmit(payload);
      if (response && response.data) {
        onSuccess(response.data);
      } else {
        setErrorMessage(response?.message || 'Failed to update preferences.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while saving preferences.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const departmentList = Object.keys(DEPARTMENT_COURSE_CATALOG);

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      {/* Title with circular progress ring icon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '2rem' }}>
        <ProgressRing percent={0} size={30} strokeWidth={3} ringColor="#1976d2" trackColor="#264b6e" />
        <h2
          style={{
            fontFamily: "Georgia, 'Playfair Display', serif",
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#222222',
            margin: 0,
          }}
        >
          Preferences
        </h2>
      </div>

      {errorMessage && (
        <div className="dash-alert dash-alert-error" style={{ marginBottom: '1.5rem' }}>
          {errorMessage}
        </div>
      )}

      {/* Section 1: Preferred Countries */}
      <div className="dash-form-row" style={{ alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div className="dash-form-label-col" style={{ paddingTop: '0.35rem' }}>
          Preferred Countries
        </div>

        <div className="dash-form-inputs-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%', gap: '0.75rem' }}>
          <label className="dash-checkbox-row">
            <input
              type="checkbox"
              checked={countriesNotFinalized}
              onChange={(e) => setCountriesNotFinalized(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <span>I haven't finalized countries where I want to study</span>
          </label>

          {!countriesNotFinalized && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {selectedCountries.map((c, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                  <select
                    className="dash-select"
                    value={c}
                    onChange={(e) => handleCountryChange(idx, e.target.value)}
                    style={{ maxWidth: '640px' }}
                  >
                    {COUNTRY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  {selectedCountries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCountry(idx)}
                      className="dash-link-action"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              <div style={{ marginTop: '0.25rem' }}>
                <button
                  type="button"
                  onClick={handleAddCountry}
                  className="dash-link-action"
                  style={{ fontWeight: 600 }}
                >
                  + Add more
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #eeeeee', margin: '2rem 0' }} />

      {/* Section 2: Preferred Departments */}
      <div className="dash-form-row" style={{ alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div className="dash-form-label-col" style={{ paddingTop: '0.35rem' }}>
          Preferred Departments
        </div>

        <div className="dash-form-inputs-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%', gap: '0.75rem' }}>
          <label className="dash-checkbox-row">
            <input
              type="checkbox"
              checked={coursesNotFinalized}
              onChange={(e) => setCoursesNotFinalized(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <span>I haven't finalized which courses I want to study</span>
          </label>

          {!coursesNotFinalized && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {departmentPairs.map((pair, idx) => {
                const availableCourses = DEPARTMENT_COURSE_CATALOG[pair.department] || [];
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr auto',
                      gap: '1rem',
                      alignItems: 'center',
                      maxWidth: '720px',
                      width: '100%',
                    }}
                  >
                    <select
                      className="dash-select"
                      value={pair.department}
                      onChange={(e) => handleDepartmentChange(idx, e.target.value)}
                    >
                      {departmentList.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>

                    <select
                      className="dash-select"
                      value={pair.subDepartment}
                      onChange={(e) => handleCourseChange(idx, e.target.value)}
                    >
                      {availableCourses.map((crs) => (
                        <option key={crs} value={crs}>
                          {crs}
                        </option>
                      ))}
                    </select>

                    {departmentPairs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDepartmentPair(idx)}
                        className="dash-link-action"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );
              })}

              <div style={{ marginTop: '0.25rem' }}>
                <button
                  type="button"
                  onClick={handleAddDepartmentPair}
                  className="dash-link-action"
                  style={{ fontWeight: 600 }}
                >
                  + Add more
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', marginTop: '2rem' }}>
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
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};
