import React, { useState, useEffect } from 'react';
import { X, Building, Save } from 'lucide-react';
import { InstitutionDetail, AdminCreateInstitutionInput, CatalogueStatus } from '../colleges.types';

interface AdminCollegeModalProps {
  isOpen: boolean;
  onClose: () => void;
  collegeToEdit?: InstitutionDetail | null;
  onSave: (data: AdminCreateInstitutionInput) => Promise<boolean>;
  isSaving: boolean;
}

export const AdminCollegeModal: React.FC<AdminCollegeModalProps> = ({
  isOpen,
  onClose,
  collegeToEdit,
  onSave,
  isSaving,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'location' | 'contact' | 'academic' | 'admissions' | 'financial' | 'campus' | 'publishing'>('basic');

  // Form State
  const [name, setName] = useState('');
  const [institutionType, setInstitutionType] = useState('Public Research University');
  const [overview, setOverview] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [address, setAddress] = useState('');
  const [officialWebsiteUrl, setOfficialWebsiteUrl] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [establishedYear, setEstablishedYear] = useState<number | ''>('');
  const [rankingInfo, setRankingInfo] = useState('');
  const [admissionDeadlines, setAdmissionDeadlines] = useState('');
  const [minAnnualFee, setMinAnnualFee] = useState<number | ''>('');
  const [maxAnnualFee, setMaxAnnualFee] = useState<number | ''>('');
  const [feeCurrency, setFeeCurrency] = useState('USD');
  const [hasScholarships, setHasScholarships] = useState(false);
  const [scholarshipDetails, setScholarshipDetails] = useState('');
  const [facilitiesText, setFacilitiesText] = useState('');
  const [placementInfo, setPlacementInfo] = useState('');
  const [status, setStatus] = useState<CatalogueStatus>('DRAFT');
  const [isPublished, setIsPublished] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (collegeToEdit) {
      setName(collegeToEdit.name || '');
      setInstitutionType(collegeToEdit.institutionType || 'Public Research University');
      setOverview(collegeToEdit.overview || '');
      setCountry(collegeToEdit.country || '');
      setCity(collegeToEdit.city || '');
      setState(collegeToEdit.state || '');
      setAddress(collegeToEdit.address || '');
      setOfficialWebsiteUrl(collegeToEdit.officialWebsiteUrl || '');
      setContactEmail(collegeToEdit.contactEmail || '');
      setContactPhone(collegeToEdit.contactPhone || '');
      setEstablishedYear(collegeToEdit.establishedYear || '');
      setRankingInfo(collegeToEdit.rankingInfo || '');
      setAdmissionDeadlines(collegeToEdit.admissionDeadlines || '');
      setMinAnnualFee(collegeToEdit.minAnnualFee !== null && collegeToEdit.minAnnualFee !== undefined ? collegeToEdit.minAnnualFee : '');
      setMaxAnnualFee(collegeToEdit.maxAnnualFee !== null && collegeToEdit.maxAnnualFee !== undefined ? collegeToEdit.maxAnnualFee : '');
      setFeeCurrency(collegeToEdit.feeCurrency || 'USD');
      setHasScholarships(Boolean(collegeToEdit.hasScholarships));
      setScholarshipDetails(collegeToEdit.scholarshipDetails || '');
      setFacilitiesText(collegeToEdit.campusFacilities ? collegeToEdit.campusFacilities.join('\n') : '');
      setPlacementInfo(collegeToEdit.placementInfo || '');
      setStatus(collegeToEdit.status || 'PUBLISHED');
      setIsPublished(Boolean(collegeToEdit.isPublished));
      setIsVerified(Boolean(collegeToEdit.isVerified));
    } else {
      // Defaults for Create Mode
      setName('');
      setInstitutionType('Public Research University');
      setOverview('');
      setCountry('');
      setCity('');
      setState('');
      setAddress('');
      setOfficialWebsiteUrl('');
      setContactEmail('');
      setContactPhone('');
      setEstablishedYear('');
      setRankingInfo('');
      setAdmissionDeadlines('');
      setMinAnnualFee('');
      setMaxAnnualFee('');
      setFeeCurrency('USD');
      setHasScholarships(false);
      setScholarshipDetails('');
      setFacilitiesText('');
      setPlacementInfo('');
      setStatus('DRAFT');
      setIsPublished(false);
      setIsVerified(false);
    }
    setValidationError(null);
    setActiveTab('basic');
  }, [collegeToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    if (!name.trim()) {
      setValidationError('College name is required.');
      setActiveTab('basic');
      return;
    }
    if (!overview.trim() || overview.trim().length < 10) {
      setValidationError('Overview must be at least 10 characters.');
      setActiveTab('basic');
      return;
    }
    if (!country.trim()) {
      setValidationError('Country is required.');
      setActiveTab('location');
      return;
    }
    if (!city.trim()) {
      setValidationError('City is required.');
      setActiveTab('location');
      return;
    }
    if (!officialWebsiteUrl.trim()) {
      setValidationError('Official website URL is required.');
      setActiveTab('contact');
      return;
    }

    const facilities = facilitiesText
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const payload: AdminCreateInstitutionInput = {
      name: name.trim(),
      institutionType: institutionType.trim() || null,
      overview: overview.trim(),
      country: country.trim(),
      city: city.trim(),
      state: state.trim() || null,
      address: address.trim() || null,
      officialWebsiteUrl: officialWebsiteUrl.trim(),
      contactEmail: contactEmail.trim() || null,
      contactPhone: contactPhone.trim() || null,
      establishedYear: establishedYear ? Number(establishedYear) : null,
      rankingInfo: rankingInfo.trim() || null,
      admissionDeadlines: admissionDeadlines.trim() || null,
      minAnnualFee: minAnnualFee !== '' ? Number(minAnnualFee) : null,
      maxAnnualFee: maxAnnualFee !== '' ? Number(maxAnnualFee) : null,
      feeCurrency: feeCurrency.trim() || 'USD',
      hasScholarships,
      scholarshipDetails: scholarshipDetails.trim() || null,
      campusFacilities: facilities,
      placementInfo: placementInfo.trim() || null,
      status,
      isPublished,
      isVerified,
    };

    const success = await onSave(payload);
    if (success) {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(8, 20, 38, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '850px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(8, 20, 38, 0.3)',
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            background: 'linear-gradient(135deg, #081426 0%, #172033 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #EAECF0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(91, 79, 233, 0.25)',
                color: '#A5B4FC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#FFFFFF' }}>
                {collegeToEdit ? `Edit College: ${collegeToEdit.name}` : 'Add New College to Catalogue'}
              </h2>
              <span style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>
                {collegeToEdit ? 'Modify verified educational catalog parameters' : 'Create an authoritative institution record with publishing controls'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '8px',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Section Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            overflowX: 'auto',
            background: '#F8FAFC',
            borderBottom: '1px solid #EAECF0',
            padding: '0.5rem 1rem 0 1rem',
            gap: '0.35rem',
          }}
        >
          {[
            { key: 'basic', label: '1. Basic Info' },
            { key: 'location', label: '2. Location' },
            { key: 'contact', label: '3. Contact' },
            { key: 'academic', label: '4. Academic' },
            { key: 'admissions', label: '5. Admissions' },
            { key: 'financial', label: '6. Financial' },
            { key: 'campus', label: '7. Campus' },
            { key: 'publishing', label: '8. Publishing' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: '0.55rem 0.85rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: 'none',
                background: 'none',
                color: activeTab === tab.key ? '#5B4FE9' : '#64748B',
                borderBottom: activeTab === tab.key ? '2px solid #5B4FE9' : '2px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto', flex: 1 }}>
            {validationError && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#991B1B',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  marginBottom: '1.25rem',
                }}
              >
                ⚠️ {validationError}
              </div>
            )}

            {/* TAB 1: BASIC INFORMATION */}
            {activeTab === 'basic' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                    College / Institution Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Massachusetts Institute of Technology"
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '0.9375rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                    Institution Type
                  </label>
                  <select
                    value={institutionType}
                    onChange={(e) => setInstitutionType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '0.9375rem',
                      outline: 'none',
                      background: '#FFFFFF',
                    }}
                  >
                    <option value="Public Research University">Public Research University</option>
                    <option value="Private Research University">Private Research University</option>
                    <option value="Collegiate Research University">Collegiate Research University</option>
                    <option value="Institute of National Importance">Institute of National Importance</option>
                    <option value="Liberal Arts College">Liberal Arts College</option>
                    <option value="Polytechnic Institute">Polytechnic Institute</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                    Comprehensive Overview / About *
                  </label>
                  <textarea
                    rows={4}
                    value={overview}
                    onChange={(e) => setOverview(e.target.value)}
                    placeholder="Provide a factual summary of the institution, academic stature, and campus profile..."
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '0.9375rem',
                      outline: 'none',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Do not invent fictional descriptions. Must reflect genuine information.</span>
                </div>
              </div>
            )}

            {/* TAB 2: LOCATION */}
            {activeTab === 'location' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                      Country *
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g. United States, United Kingdom, Singapore"
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #D1D5DB',
                        fontSize: '0.9375rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                      City *
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Cambridge, Oxford, Toronto"
                      required
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #D1D5DB',
                        fontSize: '0.9375rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                      State / Province / Region
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Massachusetts, Ontario, Maharashtra"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #D1D5DB',
                        fontSize: '0.9375rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                      Physical Campus Address
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 77 Massachusetts Ave, Cambridge, MA 02139"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #D1D5DB',
                        fontSize: '0.9375rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CONTACT */}
            {activeTab === 'contact' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                    Official Website URL *
                  </label>
                  <input
                    type="url"
                    value={officialWebsiteUrl}
                    onChange={(e) => setOfficialWebsiteUrl(e.target.value)}
                    placeholder="https://www.mit.edu"
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '0.9375rem',
                      outline: 'none',
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Must be the verified authentic institution domain.</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                      Contact Email
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="admissions@institution.edu"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #D1D5DB',
                        fontSize: '0.9375rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+1 (617) 253-1000"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #D1D5DB',
                        fontSize: '0.9375rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ACADEMIC */}
            {activeTab === 'academic' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                      Established Year
                    </label>
                    <input
                      type="number"
                      value={establishedYear}
                      onChange={(e) => setEstablishedYear(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 1861"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #D1D5DB',
                        fontSize: '0.9375rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                      Global Ranking Info
                    </label>
                    <input
                      type="text"
                      value={rankingInfo}
                      onChange={(e) => setRankingInfo(e.target.value)}
                      placeholder="e.g. QS World University Rankings: #1 Globally"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #D1D5DB',
                        fontSize: '0.9375rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: ADMISSIONS */}
            {activeTab === 'admissions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                    Admission Deadlines Information
                  </label>
                  <textarea
                    rows={3}
                    value={admissionDeadlines}
                    onChange={(e) => setAdmissionDeadlines(e.target.value)}
                    placeholder="e.g. Early Action: November 1; Regular Action: January 1; Fall Semester Starts: September"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '0.9375rem',
                      outline: 'none',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                </div>
              </div>
            )}

            {/* TAB 6: FINANCIAL */}
            {activeTab === 'financial' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                      Min Annual Fee
                    </label>
                    <input
                      type="number"
                      value={minAnnualFee}
                      onChange={(e) => setMinAnnualFee(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 55000"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #D1D5DB',
                        fontSize: '0.9375rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                      Max Annual Fee
                    </label>
                    <input
                      type="number"
                      value={maxAnnualFee}
                      onChange={(e) => setMaxAnnualFee(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 62000"
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #D1D5DB',
                        fontSize: '0.9375rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                      Currency
                    </label>
                    <select
                      value={feeCurrency}
                      onChange={(e) => setFeeCurrency(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #D1D5DB',
                        fontSize: '0.9375rem',
                        outline: 'none',
                        background: '#FFFFFF',
                      }}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="CAD">CAD ($)</option>
                      <option value="SGD">SGD ($)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="CHF">CHF (CHF)</option>
                      <option value="AUD">AUD ($)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="hasScholarshipsCheck"
                    checked={hasScholarships}
                    onChange={(e) => setHasScholarships(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="hasScholarshipsCheck" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B', cursor: 'pointer' }}>
                    Institutional Scholarships / Financial Aid Available
                  </label>
                </div>

                {hasScholarships && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                      Scholarship Policy & Financial Aid Details
                    </label>
                    <textarea
                      rows={3}
                      value={scholarshipDetails}
                      onChange={(e) => setScholarshipDetails(e.target.value)}
                      placeholder="e.g. Meets 100% of demonstrated financial need for all admitted undergraduates..."
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #D1D5DB',
                        fontSize: '0.9375rem',
                        outline: 'none',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* TAB 7: CAMPUS */}
            {activeTab === 'campus' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                    Campus Facilities (One per line)
                  </label>
                  <textarea
                    rows={4}
                    value={facilitiesText}
                    onChange={(e) => setFacilitiesText(e.target.value)}
                    placeholder="Hayden Memorial Library&#10;Stata Center for Computer Science&#10;MIT Nuclear Reactor Laboratory&#10;Zesiger Sports and Fitness Center"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '0.9375rem',
                      outline: 'none',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                    Placement Information & Career Support
                  </label>
                  <textarea
                    rows={3}
                    value={placementInfo}
                    onChange={(e) => setPlacementInfo(e.target.value)}
                    placeholder="e.g. 94% graduation placement rate within 6 months. Average starting salary $115,000 across engineering."
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '0.9375rem',
                      outline: 'none',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                </div>
              </div>
            )}

            {/* TAB 8: PUBLISHING & VERIFICATION */}
            {activeTab === 'publishing' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '12px', border: '1px solid #EAECF0' }}>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#081426', margin: '0 0 0.5rem 0' }}>
                    Catalogue Lifecycle Status
                  </h4>
                  <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '0 0 1rem 0' }}>
                    Students can ONLY see institutions marked as <strong>PUBLISHED</strong>. Draft and Review records remain visible only to authorized admin/content managers.
                  </p>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED'] as CatalogueStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          setStatus(st);
                          if (st === 'PUBLISHED') setIsPublished(true);
                          if (st === 'ARCHIVED' || st === 'DRAFT') setIsPublished(false);
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          border: status === st ? '2px solid #5B4FE9' : '1px solid #D1D5DB',
                          background: status === st ? '#EEF2FF' : '#FFFFFF',
                          color: status === st ? '#4338CA' : '#4B5563',
                          cursor: 'pointer',
                        }}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: '#F0FDF4', borderRadius: '10px', border: '1px solid #DCFCE7' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <input
                        type="checkbox"
                        id="publishedToggle"
                        checked={isPublished}
                        onChange={(e) => {
                          setIsPublished(e.target.checked);
                          if (e.target.checked) setStatus('PUBLISHED');
                        }}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <label htmlFor="publishedToggle" style={{ fontSize: '0.875rem', fontWeight: 700, color: '#166534', cursor: 'pointer' }}>
                        Is Published to Students
                      </label>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#15803D' }}>
                      When checked, this college immediately becomes discoverable in the Student Discovery module.
                    </span>
                  </div>

                  <div style={{ padding: '1rem', background: '#F0F9FF', borderRadius: '10px', border: '1px solid #E0F2FE' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <input
                        type="checkbox"
                        id="verifiedToggle"
                        checked={isVerified}
                        onChange={(e) => setIsVerified(e.target.checked)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <label htmlFor="verifiedToggle" style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0369A1', cursor: 'pointer' }}>
                        Verified by Education Advisor
                      </label>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#0284C7' }}>
                      Displays a verified credibility badge on student comparison cards.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div
            style={{
              padding: '1rem 1.75rem',
              borderTop: '1px solid #EAECF0',
              background: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.55rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                background: '#FFFFFF',
                border: '1px solid #D1D5DB',
                color: '#374151',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1.5rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                background: '#5B4FE9',
                color: '#FFFFFF',
                border: 'none',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.7 : 1,
              }}
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : collegeToEdit ? 'Save Changes' : 'Create Institution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
