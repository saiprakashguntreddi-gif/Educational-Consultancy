import React, { useState, useEffect, useCallback } from 'react';
import {
  Award,
  Search,
  Plus,
  Edit2,
  Power,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  ScholarshipDto,
  CreateScholarshipInput,
  UpdateScholarshipInput,
} from '../scholarships.types';
import { ScholarshipsService } from '../services/scholarships.service';

interface ScholarshipManagementPageProps {
  onNavigateHome?: () => void;
}

export const ScholarshipManagementPage: React.FC<ScholarshipManagementPageProps> = ({
  onNavigateHome,
}) => {
  // Query state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'true' | 'false'>('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Data state
  const [scholarships, setScholarships] = useState<ScholarshipDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [counts, setCounts] = useState({ all: 0, active: 0, inactive: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState<ScholarshipDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields State
  const [formName, setFormName] = useState('');
  const [formProvider, setFormProvider] = useState('');
  const [formCountry, setFormCountry] = useState('');
  const [formDestinationCountry, setFormDestinationCountry] = useState('');
  const [formDepartment, setFormDepartment] = useState('');
  const [formSpecialization, setFormSpecialization] = useState('');
  const [formStudyLevel, setFormStudyLevel] = useState('');
  const [formAwardAmount, setFormAwardAmount] = useState<string>('');
  const [formAwardCurrency, setFormAwardCurrency] = useState('USD');
  const [formAwardType, setFormAwardType] = useState('Tuition Waiver');
  const [formAwardDetails, setFormAwardDetails] = useState('');
  const [formEligibilityDescription, setFormEligibilityDescription] = useState('');
  const [formMinPercentage, setFormMinPercentage] = useState<string>('');
  const [formEligibleBoards, setFormEligibleBoards] = useState('');
  const [formRequiredCitizenship, setFormRequiredCitizenship] = useState('');
  const [formGenderRequirement, setFormGenderRequirement] = useState('ANY');
  const [formIncomeCeiling, setFormIncomeCeiling] = useState<string>('');
  const [formIncomeCurrency, setFormIncomeCurrency] = useState('USD');
  const [formRequiredExams, setFormRequiredExams] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formApplicationUrl, setFormApplicationUrl] = useState('');
  const [formSourceInfo, setFormSourceInfo] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formIsPublished, setFormIsPublished] = useState(true);

  // Fetch Scholarships
  const fetchScholarships = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const res = await ScholarshipsService.adminListScholarships({
        search: search.trim() || undefined,
        isActive: statusFilter,
        page,
        limit: pageSize,
      });

      if (res.success && res.data) {
        setScholarships(res.data.scholarships);
        setTotalCount(res.data.total);
        setTotalPages(res.data.totalPages);
        setCounts(res.data.counts);
      } else {
        const errStr = typeof res.error === 'string' ? res.error : 'Failed to load scholarship records.';
        setErrorMessage(errStr);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with scholarship server.');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    fetchScholarships();
  }, [fetchScholarships]);

  // Toast Helper
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingScholarship(null);
    setFormName('');
    setFormProvider('');
    setFormCountry('');
    setFormDestinationCountry('');
    setFormDepartment('');
    setFormSpecialization('');
    setFormStudyLevel('');
    setFormAwardAmount('');
    setFormAwardCurrency('USD');
    setFormAwardType('Tuition Waiver');
    setFormAwardDetails('');
    setFormEligibilityDescription('');
    setFormMinPercentage('');
    setFormEligibleBoards('');
    setFormRequiredCitizenship('');
    setFormGenderRequirement('ANY');
    setFormIncomeCeiling('');
    setFormIncomeCurrency('USD');
    setFormRequiredExams('');
    setFormDeadline('');
    setFormApplicationUrl('');
    setFormSourceInfo('');
    setFormIsActive(true);
    setFormIsPublished(true);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: ScholarshipDto) => {
    setEditingScholarship(item);
    setFormName(item.name);
    setFormProvider(item.provider);
    setFormCountry(item.country);
    setFormDestinationCountry(item.destinationCountry || '');
    setFormDepartment(item.department || '');
    setFormSpecialization(item.specialization || '');
    setFormStudyLevel(item.studyLevel || '');
    setFormAwardAmount(item.awardAmount !== null && item.awardAmount !== undefined ? item.awardAmount.toString() : '');
    setFormAwardCurrency(item.awardCurrency || 'USD');
    setFormAwardType(item.awardType || 'Tuition Waiver');
    setFormAwardDetails(item.awardDetails || '');
    setFormEligibilityDescription(item.eligibilityDescription || '');
    setFormMinPercentage(item.minPercentageRequirement !== null && item.minPercentageRequirement !== undefined ? item.minPercentageRequirement.toString() : '');
    setFormEligibleBoards(item.eligibleBoards ? item.eligibleBoards.join(', ') : '');
    setFormRequiredCitizenship(item.requiredCitizenship || '');
    setFormGenderRequirement(item.genderRequirement || 'ANY');
    setFormIncomeCeiling(item.incomeCeiling !== null && item.incomeCeiling !== undefined ? item.incomeCeiling.toString() : '');
    setFormIncomeCurrency(item.incomeCurrency || 'USD');
    setFormRequiredExams(item.requiredExams ? item.requiredExams.join(', ') : '');
    setFormDeadline(item.applicationDeadline ? item.applicationDeadline.split('T')[0] : '');
    setFormApplicationUrl(item.applicationUrl || '');
    setFormSourceInfo(item.sourceInfo || '');
    setFormIsActive(item.isActive);
    setFormIsPublished(item.isPublished);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Handle Submit Form (Add or Edit)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formProvider.trim() || !formCountry.trim() || !formAwardDetails.trim() || !formEligibilityDescription.trim() || !formApplicationUrl.trim()) {
      setFormError('Please fill in all required fields (Name, Provider, Country, Award Details, Eligibility Description, Application URL).');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);

      const parsedBoards = formEligibleBoards
        .split(',')
        .map((b) => b.trim())
        .filter(Boolean);

      const parsedExams = formRequiredExams
        .split(',')
        .map((ex) => ex.trim())
        .filter(Boolean);

      const payload: CreateScholarshipInput = {
        name: formName.trim(),
        provider: formProvider.trim(),
        country: formCountry.trim(),
        destinationCountry: formDestinationCountry.trim() || undefined,
        department: formDepartment.trim() || undefined,
        specialization: formSpecialization.trim() || undefined,
        studyLevel: formStudyLevel.trim() || undefined,
        awardAmount: formAwardAmount ? parseFloat(formAwardAmount) : undefined,
        awardCurrency: formAwardCurrency.trim() || undefined,
        awardType: formAwardType.trim() || undefined,
        awardDetails: formAwardDetails.trim(),
        eligibilityDescription: formEligibilityDescription.trim(),
        minPercentageRequirement: formMinPercentage ? parseFloat(formMinPercentage) : undefined,
        eligibleBoards: parsedBoards.length > 0 ? parsedBoards : undefined,
        requiredCitizenship: formRequiredCitizenship.trim() || undefined,
        genderRequirement: formGenderRequirement,
        incomeCeiling: formIncomeCeiling ? parseFloat(formIncomeCeiling) : undefined,
        incomeCurrency: formIncomeCurrency.trim() || undefined,
        requiredExams: parsedExams.length > 0 ? parsedExams : undefined,
        applicationDeadline: formDeadline.trim() || undefined,
        applicationUrl: formApplicationUrl.trim(),
        sourceInfo: formSourceInfo.trim() || undefined,
        isActive: formIsActive,
        isPublished: formIsPublished,
      };

      if (editingScholarship) {
        const res = await ScholarshipsService.adminUpdateScholarship(editingScholarship.id, payload as UpdateScholarshipInput);
        if (res.success) {
          showToast(`Scholarship "${res.data?.name}" updated successfully.`);
          setIsFormModalOpen(false);
          fetchScholarships();
        } else {
          const errStr = typeof res.error === 'string' ? res.error : 'Failed to update scholarship.';
          setFormError(errStr);
        }
      } else {
        const res = await ScholarshipsService.adminCreateScholarship(payload);
        if (res.success) {
          showToast(`Scholarship "${res.data?.name}" created successfully.`);
          setIsFormModalOpen(false);
          fetchScholarships();
        } else {
          const errStr = typeof res.error === 'string' ? res.error : 'Failed to create scholarship.';
          setFormError(errStr);
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'An error occurred while saving the scholarship.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Status
  const handleToggleStatus = async (item: ScholarshipDto) => {
    try {
      const newStatus = !item.isActive;
      const res = await ScholarshipsService.adminToggleStatus(item.id, newStatus);
      if (res.success) {
        showToast(
          `Scholarship "${item.name}" ${newStatus ? 'activated' : 'deactivated'} successfully.`
        );
        fetchScholarships();
      } else {
        const errStr = typeof res.error === 'string' ? res.error : 'Failed to change scholarship status.';
        showToast(errStr, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle status.', 'error');
    }
  };

  // Delete
  const handleDeleteScholarship = async (item: ScholarshipDto) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete the scholarship "${item.name}"? This will record an audit log entry.`
      )
    ) {
      return;
    }

    try {
      const res = await ScholarshipsService.adminDeleteScholarship(item.id);
      if (res.success) {
        showToast(`Scholarship "${item.name}" deleted.`, 'info');
        fetchScholarships();
      } else {
        const errStr = typeof res.error === 'string' ? res.error : 'Failed to delete scholarship.';
        showToast(errStr, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete scholarship.', 'error');
    }
  };

  return (
    <div className="scholarship-mgmt-page">
      <div className="scholarship-mgmt-container">
        {/* Toast */}
        {toastMessage && (
          <div
            className="scholarship-toast"
            style={{
              background:
                toastMessage.type === 'success'
                  ? '#064E3B'
                  : toastMessage.type === 'error'
                  ? '#7F1D1D'
                  : '#1E293B',
              color: '#FFFFFF',
              border:
                toastMessage.type === 'success'
                  ? '1px solid #059669'
                  : toastMessage.type === 'error'
                  ? '1px solid #DC2626'
                  : '1px solid #334155',
            }}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 size={18} color="#34D399" />
            ) : (
              <AlertCircle size={18} color="#F87171" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Top Header Card */}
        <div className="scholarship-mgmt-header">
          <div className="scholarship-mgmt-header-text">
            <div className="scholarship-mgmt-badge">
              <Award size={14} /> Official Catalogue Administration
            </div>
            <h1 className="scholarship-mgmt-title">
              Scholarship Catalogue Management
            </h1>
            <p className="scholarship-mgmt-subtitle">
              Manage official scholarships, eligibility benchmark criteria, award benefits, and deadlines. Every administrative update is logged in AuditLog.
            </p>
          </div>

          <div className="scholarship-mgmt-header-actions">
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="btn-scholarship-back"
                id="admin-scholarships-back-btn"
              >
                Back to Home
              </button>
            )}
            <button
              id="admin-add-scholarship-btn"
              onClick={handleOpenAddModal}
              className="btn-scholarship-add"
            >
              <Plus size={16} />
              <span>+ Add Scholarship</span>
            </button>
          </div>
        </div>

        {/* Filters & Search Controls Bar */}
        <div className="scholarship-mgmt-controls">
          <div className="scholarship-filter-tabs">
            <button
              onClick={() => {
                setStatusFilter('all');
                setPage(1);
              }}
              className={`scholarship-filter-tab ${
                statusFilter === 'all'
                  ? 'is-active-all'
                  : 'is-inactive-all'
              }`}
              id="filter-all-scholarships-btn"
            >
              All Records ({counts.all})
            </button>

            <button
              onClick={() => {
                setStatusFilter('true');
                setPage(1);
              }}
              className={`scholarship-filter-tab ${
                statusFilter === 'true'
                  ? 'is-active-active'
                  : 'is-inactive-active'
              }`}
              id="filter-active-scholarships-btn"
            >
              <CheckCircle2 size={13} /> Active ({counts.active})
            </button>

            <button
              onClick={() => {
                setStatusFilter('false');
                setPage(1);
              }}
              className={`scholarship-filter-tab ${
                statusFilter === 'false'
                  ? 'is-active-inactive'
                  : 'is-inactive-inactive'
              }`}
              id="filter-inactive-scholarships-btn"
            >
              <Power size={13} /> Inactive ({counts.inactive})
            </button>
          </div>

          <div className="scholarship-search-container">
            <div className="scholarship-search-input-wrap">
              <Search
                size={16}
                className="scholarship-search-icon"
              />
              <input
                type="text"
                placeholder="Search scholarship or provider..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="scholarship-search-field"
                id="scholarship-search-input"
              />
            </div>

            <button
              onClick={() => fetchScholarships()}
              disabled={isLoading}
              className="scholarship-btn-refresh"
              title="Refresh catalogue"
              id="scholarship-refresh-btn"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#991B1B',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Content / Table Card */}
        <div className="scholarship-mgmt-content-card">
          {isLoading ? (
            <div style={{ padding: '4.5rem 2rem', textAlign: 'center', color: '#64748B', fontWeight: 600, fontSize: '0.9rem' }}>
              <RefreshCw size={28} className="animate-spin" style={{ color: '#6366F1', margin: '0 auto 0.75rem auto' }} />
              <div>Loading scholarship catalogue...</div>
            </div>
          ) : scholarships.length === 0 ? (
            <div className="scholarship-empty-state">
              <div className="scholarship-empty-icon-circle">
                <Award size={38} />
              </div>
              <h3 className="scholarship-empty-title">
                {counts.all === 0
                  ? 'No scholarship records in catalogue.'
                  : 'No scholarships matched your search criteria.'}
              </h3>
              <p className="scholarship-empty-desc">
                {counts.all === 0
                  ? 'Click "+ Add Scholarship" above to populate verified scholarship opportunities with accurate criteria.'
                  : 'Try clearing your search query or status filter to see all opportunities.'}
              </p>
              {counts.all === 0 && (
                <button
                  onClick={handleOpenAddModal}
                  className="btn-scholarship-add"
                  id="empty-state-add-scholarship-btn"
                >
                  <Plus size={16} />
                  <span>+ Add Scholarship</span>
                </button>
              )}
            </div>
          ) : (
            <div className="scholarship-table-wrap">
              <table className="scholarship-table">
                <thead>
                  <tr>
                    <th>Scholarship</th>
                    <th>Provider</th>
                    <th>Country</th>
                    <th>Award Benefit</th>
                    <th>Min Academic %</th>
                    <th>Deadline</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {scholarships.map((s) => (
                    <tr key={s.id}>
                      <td style={{ maxWidth: '280px' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {s.name}
                        </div>
                        {s.destinationCountry && (
                          <div style={{ fontSize: '0.72rem', color: '#4F46E5', fontWeight: 500, marginTop: '2px' }}>
                            Target: {s.destinationCountry}
                          </div>
                        )}
                      </td>

                      <td style={{ fontWeight: 500, color: '#334155' }}>
                        {s.provider}
                      </td>

                      <td>{s.country}</td>

                      <td style={{ fontWeight: 600, color: '#0F172A' }}>
                        {s.awardAmount
                          ? `${s.awardCurrency || 'USD'} ${s.awardAmount.toLocaleString()}`
                          : s.awardType || 'Waiver'}
                      </td>

                      <td>
                        {s.minPercentageRequirement !== null && s.minPercentageRequirement !== undefined
                          ? `${s.minPercentageRequirement}%`
                          : 'Holistic'}
                      </td>

                      <td>
                        {s.applicationDeadline
                          ? new Date(s.applicationDeadline).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Rolling'}
                      </td>

                      <td>
                        <span className={s.isActive ? 'scholarship-badge-active' : 'scholarship-badge-inactive'}>
                          {s.isActive ? (
                            <>
                              <CheckCircle2 size={12} /> Active
                            </>
                          ) : (
                            <>
                              <Power size={12} /> Inactive
                            </>
                          )}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div className="scholarship-row-actions">
                          <button
                            onClick={() => handleOpenEditModal(s)}
                            className="scholarship-action-btn btn-edit"
                            title="Edit details"
                          >
                            <Edit2 size={15} />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(s)}
                            className={`scholarship-action-btn ${s.isActive ? 'btn-power-active' : 'btn-power-inactive'}`}
                            title={s.isActive ? 'Deactivate scholarship' : 'Activate scholarship'}
                          >
                            <Power size={15} />
                          </button>

                          <button
                            onClick={() => handleDeleteScholarship(s)}
                            className="scholarship-action-btn btn-delete"
                            title="Delete scholarship"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="scholarship-pagination-bar">
              <div>
                Page {page} of {totalPages} ({totalCount} scholarships)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: '7px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    cursor: page <= 1 ? 'not-allowed' : 'pointer',
                    opacity: page <= 1 ? 0.4 : 1,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: '7px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                    opacity: page >= totalPages ? 0.4 : 1,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add / Edit Scholarship Modal */}
        {isFormModalOpen && (
          <div
            className="scholarship-modal-overlay"
            onClick={() => setIsFormModalOpen(false)}
          >
            <div
              className="scholarship-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="scholarship-modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                    }}
                  >
                    <Award size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                      {editingScholarship ? 'Edit Scholarship Opportunity' : 'Add Official Scholarship Opportunity'}
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '2px 0 0 0' }}>
                      Changes are validated and recorded with an AuditLog entry.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsFormModalOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: '0.4rem',
                    display: 'flex',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmitForm} className="scholarship-modal-body">
                {formError && (
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      color: '#991B1B',
                      fontSize: '0.825rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <AlertCircle size={15} />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Section 1: Basic Information */}
                <div>
                  <h4
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: '#4F46E5',
                      margin: '0 0 0.75rem 0',
                    }}
                  >
                    1. Basic Opportunity Details
                  </h4>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '0.85rem',
                    }}
                  >
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                        Scholarship Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. Commonwealth Master's Scholarship"
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.8rem',
                          fontSize: '0.85rem',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          background: '#F8FAFC',
                          color: '#0F172A',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                        Provider / Organization *
                      </label>
                      <input
                        type="text"
                        required
                        value={formProvider}
                        onChange={(e) => setFormProvider(e.target.value)}
                        placeholder="e.g. Foreign, Commonwealth & Development Office"
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.8rem',
                          fontSize: '0.85rem',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          background: '#F8FAFC',
                          color: '#0F172A',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                        Origin / Host Country *
                      </label>
                      <input
                        type="text"
                        required
                        value={formCountry}
                        onChange={(e) => setFormCountry(e.target.value)}
                        placeholder="e.g. United Kingdom"
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.8rem',
                          fontSize: '0.85rem',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          background: '#F8FAFC',
                          color: '#0F172A',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                        Destination Country Applicability
                      </label>
                      <input
                        type="text"
                        value={formDestinationCountry}
                        onChange={(e) => setFormDestinationCountry(e.target.value)}
                        placeholder="e.g. United Kingdom (or leave blank if global)"
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.8rem',
                          fontSize: '0.85rem',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          background: '#F8FAFC',
                          color: '#0F172A',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                        Department / Field Applicability
                      </label>
                      <input
                        type="text"
                        value={formDepartment}
                        onChange={(e) => setFormDepartment(e.target.value)}
                        placeholder="e.g. Engineering, Computer Science, Any"
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.8rem',
                          fontSize: '0.85rem',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          background: '#F8FAFC',
                          color: '#0F172A',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                        Study Level
                      </label>
                      <input
                        type="text"
                        value={formStudyLevel}
                        onChange={(e) => setFormStudyLevel(e.target.value)}
                        placeholder="e.g. Undergraduate, Master's, Doctoral"
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.8rem',
                          fontSize: '0.85rem',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          background: '#F8FAFC',
                          color: '#0F172A',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Award & Benefits */}
                <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
                  <h4
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: '#4F46E5',
                      margin: '0 0 0.75rem 0',
                    }}
                  >
                    2. Award Amount & Benefits
                  </h4>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '0.85rem',
                    }}
                  >
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                        Award Amount (Numerical)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formAwardAmount}
                        onChange={(e) => setFormAwardAmount(e.target.value)}
                        placeholder="e.g. 15000"
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.8rem',
                          fontSize: '0.85rem',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          background: '#F8FAFC',
                          color: '#0F172A',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                        Currency
                      </label>
                      <input
                        type="text"
                        value={formAwardCurrency}
                        onChange={(e) => setFormAwardCurrency(e.target.value)}
                        placeholder="USD, GBP, EUR, INR"
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.8rem',
                          fontSize: '0.85rem',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          background: '#F8FAFC',
                          color: '#0F172A',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                        Award Type
                      </label>
                      <input
                        type="text"
                        value={formAwardType}
                        onChange={(e) => setFormAwardType(e.target.value)}
                        placeholder="Full Ride, Tuition Waiver, Cash Grant"
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.8rem',
                          fontSize: '0.85rem',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          background: '#F8FAFC',
                          color: '#0F172A',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                        Award Details & Coverage *
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={formAwardDetails}
                        onChange={(e) => setFormAwardDetails(e.target.value)}
                        placeholder="Explain coverage: full tuition fees, return airfare, living allowance stipend, thesis grant..."
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.8rem',
                          fontSize: '0.85rem',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          background: '#F8FAFC',
                          color: '#0F172A',
                          boxSizing: 'border-box',
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Eligibility Rules */}
                <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
                  <h4
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: '#4F46E5',
                      margin: '0 0 0.75rem 0',
                    }}
                  >
                    3. Eligibility Rules & Benchmarks
                  </h4>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '0.85rem',
                    }}
                  >
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                        Min. Academic % Requirement
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formMinPercentage}
                        onChange={(e) => setFormMinPercentage(e.target.value)}
                        placeholder="e.g. 75.0"
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.8rem',
                          fontSize: '0.85rem',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          background: '#F8FAFC',
                          color: '#0F172A',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                        Eligible Boards (Comma-separated)
                      </label>
                      <input
                        type="text"
                        value={formEligibleBoards}
                        onChange={(e) => setFormEligibleBoards(e.target.value)}
                        placeholder="CBSE, ICSE, IB, State Board"
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.8rem',
                          fontSize: '0.85rem',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          background: '#F8FAFC',
                          color: '#0F172A',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                        Required Citizenship
                      </label>
                      <input
                        type="text"
                        value={formRequiredCitizenship}
                        onChange={(e) => setFormRequiredCitizenship(e.target.value)}
                        placeholder="e.g. Indian, Commonwealth Citizen"
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.8rem',
                          fontSize: '0.85rem',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          background: '#F8FAFC',
                          color: '#0F172A',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                        Gender Requirement
                      </label>
                      <select
                        value={formGenderRequirement}
                        onChange={(e) => setFormGenderRequirement(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.8rem',
                          fontSize: '0.85rem',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          background: '#F8FAFC',
                          color: '#0F172A',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="ANY">Any / All Genders</option>
                        <option value="FEMALE">Female Only</option>
                        <option value="MALE">Male Only</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                        Annual Income Ceiling
                      </label>
                      <input
                        type="number"
                        value={formIncomeCeiling}
                        onChange={(e) => setFormIncomeCeiling(e.target.value)}
                        placeholder="e.g. 800000"
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.8rem',
                          fontSize: '0.85rem',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          background: '#F8FAFC',
                          color: '#0F172A',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                        Income Currency
                      </label>
                      <input
                        type="text"
                        value={formIncomeCurrency}
                        onChange={(e) => setFormIncomeCurrency(e.target.value)}
                        placeholder="INR, USD"
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.8rem',
                          fontSize: '0.85rem',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          background: '#F8FAFC',
                          color: '#0F172A',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                        Required Entrance Exams (Comma-separated)
                      </label>
                      <input
                        type="text"
                        value={formRequiredExams}
                        onChange={(e) => setFormRequiredExams(e.target.value)}
                        placeholder="e.g. IELTS, TOEFL, GRE, SAT"
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.8rem',
                          fontSize: '0.85rem',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          background: '#F8FAFC',
                          color: '#0F172A',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                        Eligibility Guidelines Description *
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={formEligibilityDescription}
                        onChange={(e) => setFormEligibilityDescription(e.target.value)}
                        placeholder="Detailed criteria explanation shown to students and advisors..."
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.8rem',
                          fontSize: '0.85rem',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          background: '#F8FAFC',
                          color: '#0F172A',
                          boxSizing: 'border-box',
                          fontFamily: 'inherit',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Deadlines, Source & Status */}
                <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #F1F5F9' }}>
                  <h4
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: '#4F46E5',
                      margin: '0 0 0.75rem 0',
                    }}
                  >
                    4. Application Portal, Deadlines & Verification
                  </h4>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '0.85rem',
                    }}
                  >
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                        Application Deadline
                      </label>
                      <input
                        type="date"
                        value={formDeadline}
                        onChange={(e) => setFormDeadline(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.8rem',
                          fontSize: '0.85rem',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          background: '#F8FAFC',
                          color: '#0F172A',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                        Official Application URL *
                      </label>
                      <input
                        type="url"
                        required
                        value={formApplicationUrl}
                        onChange={(e) => setFormApplicationUrl(e.target.value)}
                        placeholder="https://..."
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.8rem',
                          fontSize: '0.85rem',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          background: '#F8FAFC',
                          color: '#0F172A',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '0.3rem' }}>
                        Source Reference / Verification Notes
                      </label>
                      <input
                        type="text"
                        value={formSourceInfo}
                        onChange={(e) => setFormSourceInfo(e.target.value)}
                        placeholder="e.g. Official Government Gazette / University Financial Aid Catalogue 2026-2027"
                        style={{
                          width: '100%',
                          padding: '0.55rem 0.8rem',
                          fontSize: '0.85rem',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          background: '#F8FAFC',
                          color: '#0F172A',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingTop: '0.5rem', gridColumn: '1 / -1' }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formIsActive}
                          onChange={(e) => setFormIsActive(e.target.checked)}
                          style={{ width: 16, height: 16, accentColor: '#4F46E5', cursor: 'pointer' }}
                        />
                        <span>Active in Catalogue</span>
                      </label>

                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formIsPublished}
                          onChange={(e) => setFormIsPublished(e.target.checked)}
                          style={{ width: 16, height: 16, accentColor: '#4F46E5', cursor: 'pointer' }}
                        />
                        <span>Published for Students</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="scholarship-modal-footer">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="btn-scholarship-back"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="submit-scholarship-btn"
                    disabled={isSubmitting}
                    className="btn-scholarship-add"
                    style={{ opacity: isSubmitting ? 0.7 : 1 }}
                  >
                    {isSubmitting
                      ? 'Saving...'
                      : editingScholarship
                      ? 'Update Scholarship'
                      : 'Create Scholarship'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
