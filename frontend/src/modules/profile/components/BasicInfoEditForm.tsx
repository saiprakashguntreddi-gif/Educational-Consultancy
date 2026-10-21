import React, { useState } from 'react';
import { StudentProfileRecord, StudentProfileIntakeInput, Gender } from '../profile.types';
import { COUNTRY_OPTIONS } from '../../preferences/preferences.constants';

interface BasicInfoEditFormProps {
  initialData?: StudentProfileRecord | null;
  onSuccess: (record: StudentProfileRecord) => void;
  onCancel: () => void;
  onSubmit: (data: StudentProfileIntakeInput) => Promise<any>;
}

export const BasicInfoEditForm: React.FC<BasicInfoEditFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
  onSubmit,
}) => {
  // Parse full name into first and last name
  const nameParts = (initialData?.fullName || '').split(' ');
  const initialFirstName = nameParts[0] || '';
  const initialLastName = nameParts.slice(1).join(' ') || '';

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [gender, setGender] = useState<Gender>(initialData?.gender || 'MALE');
  const [grade, setGrade] = useState(initialData?.grade || '11th');
  const [board, setBoard] = useState(initialData?.board || 'CBSE');
  const [completionYear, setCompletionYear] = useState<number | string>(
    initialData?.passingOutYear || 2026
  );

  // Address
  const [addressLine1, setAddressLine1] = useState(initialData?.address.street || '');
  const [addressLine2, setAddressLine2] = useState('');
  const [country, setCountry] = useState(initialData?.address.country || 'India');
  const [stateCity, setStateCity] = useState(
    initialData ? `${initialData.address.city}${initialData.address.state ? ', ' + initialData.address.state : ''}` : 'New Delhi'
  );
  const [postalCode, setPostalCode] = useState(initialData?.address.postalCode || '110007');

  // Citizenship
  const [citizenship, setCitizenship] = useState(initialData?.citizenship || 'India');
  const [secondCitizenship, setSecondCitizenship] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const fullStudentName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!fullStudentName) {
      setErrorMessage('Please provide both First Name and Last Name.');
      return;
    }

    const yearNum = parseInt(String(completionYear), 10);
    if (isNaN(yearNum) || yearNum < 1990 || yearNum > 2040) {
      setErrorMessage('Please provide a valid 12th completion year between 1990 and 2040.');
      return;
    }

    // Split state and city
    const stateParts = stateCity.split(',').map((s) => s.trim());
    const city = stateParts[0] || 'New Delhi';
    const state = stateParts[1] || stateParts[0] || 'Delhi';
    const street = [addressLine1.trim(), addressLine2.trim()].filter(Boolean).join(', ') || 'Address Line';

    const fullCitizenship = secondCitizenship
      ? `${citizenship} / ${secondCitizenship}`
      : citizenship;

    const payload: StudentProfileIntakeInput = {
      fullName: fullStudentName,
      gender,
      grade,
      contactEmail: initialData?.contactEmail || 'student@superconsciousness.internal',
      phone: initialData?.phone || '+91 9876543210',
      board,
      citizenship: fullCitizenship,
      passingOutYear: yearNum,
      address: {
        street,
        city,
        state,
        postalCode: postalCode.trim() || '110001',
        country,
      },
    };

    setIsSubmitting(true);
    try {
      const response = await onSubmit(payload);
      if (response && response.data) {
        onSuccess(response.data);
      } else {
        setErrorMessage(response?.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      {errorMessage && (
        <div className="dash-alert dash-alert-error" style={{ marginBottom: '1.5rem' }}>
          {errorMessage}
        </div>
      )}

      {/* Name: First Name & Last Name */}
      <div className="dash-form-row">
        <div className="dash-form-label-col">Name</div>
        <div className="dash-form-inputs-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%' }}>
          <input
            type="text"
            className="dash-input"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="text"
            className="dash-input"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Gender */}
      <div className="dash-form-row">
        <div className="dash-form-label-col">Gender</div>
        <div className="dash-form-inputs-col">
          <select
            className="dash-select"
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="NON_BINARY">Non-Binary</option>
            <option value="OTHER">Other</option>
            <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
          </select>
        </div>
      </div>

      {/* Current Class */}
      <div className="dash-form-row">
        <div className="dash-form-label-col">Current Class</div>
        <div className="dash-form-inputs-col">
          <select
            className="dash-select"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
          >
            <option value="9th">9th</option>
            <option value="10th">10th</option>
            <option value="11th">11th</option>
            <option value="12th">12th</option>
            <option value="Undergraduate Year 1">Undergraduate Year 1</option>
            <option value="Undergraduate Year 2">Undergraduate Year 2</option>
            <option value="Graduate / Alumnus">Graduate / Alumnus</option>
          </select>
        </div>
      </div>

      {/* 12th Board */}
      <div className="dash-form-row">
        <div className="dash-form-label-col">12th Board</div>
        <div className="dash-form-inputs-col">
          <select
            className="dash-select"
            value={board}
            onChange={(e) => setBoard(e.target.value)}
          >
            <option value="CBSE">CBSE</option>
            <option value="ICSE / ISC">ICSE / ISC</option>
            <option value="State Board">State Board</option>
            <option value="IB (International Baccalaureate)">IB (International Baccalaureate)</option>
            <option value="Cambridge (CIE)">Cambridge (CIE)</option>
            <option value="Other / Equivalent">Other / Equivalent</option>
          </select>
        </div>
      </div>

      {/* 12th Completion Year */}
      <div className="dash-form-row">
        <div className="dash-form-label-col">12th Completion Year</div>
        <div className="dash-form-inputs-col">
          <input
            type="number"
            className="dash-input"
            placeholder="e.g. 2026"
            value={completionYear}
            onChange={(e) => setCompletionYear(e.target.value)}
            min={1990}
            max={2040}
            required
          />
        </div>
      </div>

      {/* Current Location */}
      <div className="dash-form-row" style={{ alignItems: 'flex-start' }}>
        <div className="dash-form-label-col" style={{ paddingTop: '0.6rem' }}>Current Location</div>
        <div className="dash-form-inputs-col" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%' }}>
            <input
              type="text"
              className="dash-input"
              placeholder="Street / Address Line 1"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              required
            />
            <input
              type="text"
              className="dash-input"
              placeholder="Locality / Address Line 2 (Optional)"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: '1rem', width: '100%' }}>
            <select
              className="dash-select"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <input
              type="text"
              className="dash-input"
              placeholder="State / City (e.g. New Delhi)"
              value={stateCity}
              onChange={(e) => setStateCity(e.target.value)}
              required
            />

            <input
              type="text"
              className="dash-input"
              placeholder="Postal Code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Citizenship */}
      <div className="dash-form-row">
        <div className="dash-form-label-col">Citizenship</div>
        <div className="dash-form-inputs-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%' }}>
          <select
            className="dash-select"
            value={citizenship}
            onChange={(e) => setCitizenship(e.target.value)}
          >
            {COUNTRY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            className="dash-select"
            value={secondCitizenship}
            onChange={(e) => setSecondCitizenship(e.target.value)}
          >
            <option value="">Second Citizenship (optional)</option>
            {COUNTRY_OPTIONS.filter((c) => c !== citizenship).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', marginTop: '2.5rem' }}>
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
