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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Toast */}
        {toastMessage && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 animate-bounce ${
              toastMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                : toastMessage.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                : 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider">
              <Award size={16} /> Official Catalogue Administration
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              Scholarship Catalogue Management
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Manage official scholarships, eligibility benchmark criteria, award benefits, and deadlines. Every administrative update is logged in AuditLog.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Back to Home
              </button>
            )}
            <button
              id="admin-add-scholarship-btn"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm"
            >
              <Plus size={16} />
              <span>Add Scholarship</span>
            </button>
          </div>
        </div>

        {/* Filters & Counts Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setStatusFilter('all');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              All Records ({counts.all})
            </button>

            <button
              onClick={() => {
                setStatusFilter('true');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                statusFilter === 'true'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
              }`}
            >
              <CheckCircle2 size={13} /> Active ({counts.active})
            </button>

            <button
              onClick={() => {
                setStatusFilter('false');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                statusFilter === 'false'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              <Power size={13} /> Inactive ({counts.inactive})
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search scholarship or provider..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <button
              onClick={() => fetchScholarships()}
              disabled={isLoading}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Refresh"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin text-indigo-600' : ''} />
            </button>
          </div>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Table Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-sm font-semibold text-slate-500">
              <RefreshCw size={24} className="animate-spin text-indigo-600 mx-auto mb-2" />
              Loading scholarship catalogue...
            </div>
          ) : scholarships.length === 0 ? (
            <div className="p-12 text-center max-w-md mx-auto space-y-3">
              <Award size={36} className="text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                {counts.all === 0
                  ? 'No scholarship records in catalogue.'
                  : 'No scholarships matched your search criteria.'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {counts.all === 0
                  ? 'Click "+ Add Scholarship" above to populate verified scholarship opportunities with accurate criteria.'
                  : 'Try clearing your search query or filter.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Scholarship</th>
                    <th className="py-3.5 px-4">Provider</th>
                    <th className="py-3.5 px-4">Country</th>
                    <th className="py-3.5 px-4">Award Benefit</th>
                    <th className="py-3.5 px-4">Min Academic %</th>
                    <th className="py-3.5 px-4">Deadline</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {scholarships.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white max-w-xs">
                        <div className="line-clamp-1">{s.name}</div>
                        {s.destinationCountry && (
                          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-normal">
                            Target: {s.destinationCountry}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {s.provider}
                      </td>

                      <td className="py-3.5 px-4">{s.country}</td>

                      <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-slate-200">
                        {s.awardAmount
                          ? `${s.awardCurrency || 'USD'} ${s.awardAmount.toLocaleString()}`
                          : s.awardType || 'Waiver'}
                      </td>

                      <td className="py-3.5 px-4">
                        {s.minPercentageRequirement !== null && s.minPercentageRequirement !== undefined
                          ? `${s.minPercentageRequirement}%`
                          : 'Holistic'}
                      </td>

                      <td className="py-3.5 px-4">
                        {s.applicationDeadline
                          ? new Date(s.applicationDeadline).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Rolling'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            s.isActive
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {s.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(s)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition"
                            title="Edit details"
                          >
                            <Edit2 size={15} />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(s)}
                            className={`p-1.5 rounded-lg transition ${
                              s.isActive
                                ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800'
                                : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800'
                            }`}
                            title={s.isActive ? 'Deactivate scholarship' : 'Activate scholarship'}
                          >
                            <Power size={15} />
                          </button>

                          <button
                            onClick={() => handleDeleteScholarship(s)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition"
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
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <div>
                Page {page} of {totalPages} ({totalCount} scholarships)
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
            onClick={() => setIsFormModalOpen(false)}
          >
            <div
              className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 max-h-[92vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-600 text-white">
                    <Award size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {editingScholarship ? 'Edit Scholarship Opportunity' : 'Add Official Scholarship Opportunity'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Changes are validated and recorded with an AuditLog entry.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsFormModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-2">
                    <AlertCircle size={15} />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Section 1: Basic Information */}
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2 text-indigo-600">
                    1. Basic Opportunity Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Scholarship Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. Commonwealth Master's Scholarship"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Provider / Organization *
                      </label>
                      <input
                        type="text"
                        required
                        value={formProvider}
                        onChange={(e) => setFormProvider(e.target.value)}
                        placeholder="e.g. Foreign, Commonwealth & Development Office"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Origin / Host Country *
                      </label>
                      <input
                        type="text"
                        required
                        value={formCountry}
                        onChange={(e) => setFormCountry(e.target.value)}
                        placeholder="e.g. United Kingdom"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Destination Country Applicability
                      </label>
                      <input
                        type="text"
                        value={formDestinationCountry}
                        onChange={(e) => setFormDestinationCountry(e.target.value)}
                        placeholder="e.g. United Kingdom (or leave blank if global)"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Department / Field Applicability
                      </label>
                      <input
                        type="text"
                        value={formDepartment}
                        onChange={(e) => setFormDepartment(e.target.value)}
                        placeholder="e.g. Engineering, Computer Science, Any"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Study Level
                      </label>
                      <input
                        type="text"
                        value={formStudyLevel}
                        onChange={(e) => setFormStudyLevel(e.target.value)}
                        placeholder="e.g. Undergraduate, Master's, Doctoral"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Award & Benefits */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2 text-indigo-600">
                    2. Award Amount & Benefits
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Award Amount (Numerical)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formAwardAmount}
                        onChange={(e) => setFormAwardAmount(e.target.value)}
                        placeholder="e.g. 15000"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Currency
                      </label>
                      <input
                        type="text"
                        value={formAwardCurrency}
                        onChange={(e) => setFormAwardCurrency(e.target.value)}
                        placeholder="USD, GBP, EUR, INR"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Award Type
                      </label>
                      <input
                        type="text"
                        value={formAwardType}
                        onChange={(e) => setFormAwardType(e.target.value)}
                        placeholder="Full Ride, Tuition Waiver, Cash Grant"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Award Details & Coverage *
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={formAwardDetails}
                        onChange={(e) => setFormAwardDetails(e.target.value)}
                        placeholder="Explain coverage: full tuition fees, return airfare, living allowance stipend, thesis grant..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Eligibility Rules */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2 text-indigo-600">
                    3. Eligibility Rules & Benchmarks
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Eligible Boards (Comma-separated)
                      </label>
                      <input
                        type="text"
                        value={formEligibleBoards}
                        onChange={(e) => setFormEligibleBoards(e.target.value)}
                        placeholder="CBSE, ICSE, IB, State Board"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Required Citizenship
                      </label>
                      <input
                        type="text"
                        value={formRequiredCitizenship}
                        onChange={(e) => setFormRequiredCitizenship(e.target.value)}
                        placeholder="e.g. Indian, Commonwealth Citizen"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Gender Requirement
                      </label>
                      <select
                        value={formGenderRequirement}
                        onChange={(e) => setFormGenderRequirement(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="ANY">Any / All Genders</option>
                        <option value="FEMALE">Female Only</option>
                        <option value="MALE">Male Only</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Annual Income Ceiling
                      </label>
                      <input
                        type="number"
                        value={formIncomeCeiling}
                        onChange={(e) => setFormIncomeCeiling(e.target.value)}
                        placeholder="e.g. 800000"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Income Currency
                      </label>
                      <input
                        type="text"
                        value={formIncomeCurrency}
                        onChange={(e) => setFormIncomeCurrency(e.target.value)}
                        placeholder="INR, USD"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Required Entrance Exams (Comma-separated)
                      </label>
                      <input
                        type="text"
                        value={formRequiredExams}
                        onChange={(e) => setFormRequiredExams(e.target.value)}
                        placeholder="e.g. IELTS, TOEFL, GRE, SAT"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Eligibility Guidelines Description *
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={formEligibilityDescription}
                        onChange={(e) => setFormEligibilityDescription(e.target.value)}
                        placeholder="Detailed criteria explanation shown to students and advisors..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Deadlines, Source & Status */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-2 text-indigo-600">
                    4. Application Portal, Deadlines & Verification
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Application Deadline
                      </label>
                      <input
                        type="date"
                        value={formDeadline}
                        onChange={(e) => setFormDeadline(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Official Application URL *
                      </label>
                      <input
                        type="url"
                        required
                        value={formApplicationUrl}
                        onChange={(e) => setFormApplicationUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Source Reference / Verification Notes
                      </label>
                      <input
                        type="text"
                        value={formSourceInfo}
                        onChange={(e) => setFormSourceInfo(e.target.value)}
                        placeholder="e.g. Official Government Gazette / University Financial Aid Catalogue 2026-2027"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                      <label className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formIsActive}
                          onChange={(e) => setFormIsActive(e.target.checked)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Active in Catalogue</span>
                      </label>

                      <label className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formIsPublished}
                          onChange={(e) => setFormIsPublished(e.target.checked)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Published for Students</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2 rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="submit-scholarship-btn"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50"
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
