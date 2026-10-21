import React, { useState, useEffect, useCallback } from 'react';
import {
  Building,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Edit2,
  BookOpen,
  Eye,
  EyeOff,
  Archive,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  X,
  Compass,
} from 'lucide-react';
import {
  InstitutionSummary,
  InstitutionDetail,
  AdminCollegeSearchParams,
  AdminCreateInstitutionInput,
} from '../colleges.types';
import { CollegesService } from '../services/colleges.service';
import { AdminCollegeModal } from '../components/AdminCollegeModal';
import { AdminCoursesDrawer } from '../components/AdminCoursesDrawer';
import { InstitutionDetailModal } from '../components/InstitutionDetailModal';

interface CollegeManagementPageProps {
  onNavigateHome?: () => void;
}

export const CollegeManagementPage: React.FC<CollegeManagementPageProps> = () => {
  // Filters & Query
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [verifiedFilter, setVerifiedFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Data State
  const [colleges, setColleges] = useState<InstitutionSummary[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: pageSize, totalPages: 1 });
  const [statusCounts, setStatusCounts] = useState({
    total: 0,
    draft: 0,
    review: 0,
    published: 0,
    archived: 0,
    verified: 0,
  });

  // UI Flow State
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Modals & Drawers
  const [isCollegeModalOpen, setIsCollegeModalOpen] = useState(false);
  const [collegeToEdit, setCollegeToEdit] = useState<InstitutionDetail | null>(null);
  const [isSavingCollege, setIsSavingCollege] = useState(false);

  const [selectedForCourses, setSelectedForCourses] = useState<InstitutionDetail | null>(null);
  const [isCoursesDrawerOpen, setIsCoursesDrawerOpen] = useState(false);

  const [previewInstitution, setPreviewInstitution] = useState<InstitutionDetail | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const loadColleges = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const queryParams: AdminCollegeSearchParams = {
      search: search.trim() || undefined,
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
      isVerified: verifiedFilter !== 'ALL' ? (verifiedFilter === 'VERIFIED' ? 'true' : 'false') : undefined,
      page,
      limit: pageSize,
    };

    try {
      const res = await CollegesService.adminListColleges(queryParams);
      if (res.success && res.data) {
        setColleges(res.data.data || []);
        setPagination(res.data.pagination || { total: 0, page: 1, limit: pageSize, totalPages: 1 });
        if (res.data.statusCounts) {
          setStatusCounts(res.data.statusCounts);
        }
      } else {
        setErrorMessage(String(res.error || 'Failed to load admin catalogue records'));
      }
    } catch (_err) {
      setErrorMessage('Failed to connect to catalogue service.');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, verifiedFilter, page]);

  useEffect(() => {
    loadColleges();
  }, [loadColleges]);

  const handleOpenAddCollege = () => {
    setCollegeToEdit(null);
    setIsCollegeModalOpen(true);
  };

  const handleOpenEditCollege = async (id: string) => {
    try {
      const res = await CollegesService.adminGetCollegeById(id);
      if (res.success && res.data) {
        setCollegeToEdit(res.data);
        setIsCollegeModalOpen(true);
      } else {
        showToast(String(res.error || 'Failed to fetch college details'), 'error');
      }
    } catch (_err) {
      showToast('Error loading college profile', 'error');
    }
  };

  const handleSaveCollege = async (data: AdminCreateInstitutionInput): Promise<boolean> => {
    setIsSavingCollege(true);
    try {
      if (collegeToEdit) {
        const res = await CollegesService.adminUpdateCollege(collegeToEdit.id, data);
        if (res.success) {
          showToast(`Institution "${data.name}" updated successfully.`, 'success');
          loadColleges();
          return true;
        } else {
          showToast(String(res.error || 'Failed to update institution'), 'error');
          return false;
        }
      } else {
        const res = await CollegesService.adminCreateCollege(data);
        if (res.success) {
          showToast(`Institution "${data.name}" created in catalogue.`, 'success');
          loadColleges();
          return true;
        } else {
          showToast(String(res.error || 'Failed to create institution'), 'error');
          return false;
        }
      }
    } catch (_err) {
      showToast('Error saving institution record', 'error');
      return false;
    } finally {
      setIsSavingCollege(false);
    }
  };

  const handleTogglePublish = async (inst: InstitutionSummary) => {
    const nextPublish = !inst.isPublished;
    try {
      const res = await CollegesService.adminSetPublishStatus(inst.id, nextPublish);
      if (res.success) {
        const actionText = nextPublish ? 'published to students' : 'unpublished (set to draft)';
        showToast(`Institution "${inst.name}" ${actionText}.`, 'info');
        loadColleges();
      } else {
        showToast(String(res.error || 'Failed to update publishing status'), 'error');
      }
    } catch (_err) {
      showToast('Error updating publish status', 'error');
    }
  };

  const handleToggleVerify = async (inst: InstitutionSummary) => {
    const nextVerify = !inst.isVerified;
    try {
      const res = await CollegesService.adminSetVerifyStatus(inst.id, nextVerify);
      if (res.success) {
        const actionText = nextVerify ? 'marked verified' : 'marked unverified';
        showToast(`Institution "${inst.name}" ${actionText}.`, 'info');
        loadColleges();
      } else {
        showToast(String(res.error || 'Failed to update verification status'), 'error');
      }
    } catch (_err) {
      showToast('Error updating verification status', 'error');
    }
  };

  const handleArchive = async (inst: InstitutionSummary) => {
    if (!window.confirm(`Are you sure you want to archive "${inst.name}"? It will be immediately hidden from students.`)) {
      return;
    }

    try {
      const res = await CollegesService.adminArchiveCollege(inst.id);
      if (res.success) {
        showToast(`Institution "${inst.name}" archived.`, 'info');
        loadColleges();
      } else {
        showToast(String(res.error || 'Failed to archive institution'), 'error');
      }
    } catch (_err) {
      showToast('Error archiving institution', 'error');
    }
  };

  const handleOpenCoursesDrawer = async (id: string) => {
    try {
      const res = await CollegesService.adminGetCollegeById(id);
      if (res.success && res.data) {
        setSelectedForCourses(res.data);
        setIsCoursesDrawerOpen(true);
      } else {
        showToast(String(res.error || 'Failed to load courses'), 'error');
      }
    } catch (_err) {
      showToast('Error loading courses', 'error');
    }
  };

  const handlePreview = async (id: string) => {
    try {
      const res = await CollegesService.adminGetCollegeById(id);
      if (res.success && res.data) {
        setPreviewInstitution(res.data);
      }
    } catch (_err) {
      showToast('Error loading preview', 'error');
    }
  };

  return (
    <div style={{ background: '#F7F8FC', minHeight: '100vh', padding: '2rem 1.5rem', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 11000,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.875rem 1.25rem',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(8, 20, 38, 0.2)',
            fontSize: '0.875rem',
            fontWeight: 600,
            background:
              toastMessage.type === 'success' ? '#ECFDF5' : toastMessage.type === 'error' ? '#FEF2F2' : '#EEF2FF',
            color:
              toastMessage.type === 'success' ? '#065F46' : toastMessage.type === 'error' ? '#991B1B' : '#3730A3',
            border: `1px solid ${
              toastMessage.type === 'success' ? '#A7F3D0' : toastMessage.type === 'error' ? '#FECACA' : '#C7D2FE'
            }`,
          }}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle size={18} color="#059669" />
          ) : toastMessage.type === 'error' ? (
            <AlertCircle size={18} color="#DC2626" />
          ) : (
            <Compass size={18} color="#5B4FE9" />
          )}
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem', color: 'inherit', marginLeft: '0.5rem' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Top Header Card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '1.75rem 2rem',
            border: '1px solid #EAECF0',
            boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem',
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#5B4FE9', marginBottom: '0.25rem' }}>
              <ShieldCheck size={14} /> Admin / Content Management Suite
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#081426', margin: '0 0 0.35rem 0' }}>
              College & Course Management
            </h1>
            <p style={{ fontSize: '0.9375rem', color: '#667085', margin: 0 }}>
              Create, review, publish, and verify authoritative education-content catalogue records for students and counsellors.
            </p>
          </div>

          <button
            onClick={handleOpenAddCollege}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              borderRadius: '10px',
              fontSize: '0.9375rem',
              fontWeight: 600,
              background: '#5B4FE9',
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(91, 79, 233, 0.25)',
            }}
          >
            <Plus size={18} />
            + Add College
          </button>
        </div>

        {/* Metrics Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
          }}
        >
          <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #EAECF0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Total in Catalogue
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#081426', marginTop: '0.25rem' }}>
              {statusCounts.total}
            </div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #DCFCE7' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
              Published (Active for Students)
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#15803D', marginTop: '0.25rem' }}>
              {statusCounts.published}
            </div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #FEF3C7' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400E', textTransform: 'uppercase' }}>
              Draft & In Review
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#D97706', marginTop: '0.25rem' }}>
              {statusCounts.draft + statusCounts.review}
            </div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E0F2FE' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369A1', textTransform: 'uppercase' }}>
              Verified Credentials
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0284C7', marginTop: '0.25rem' }}>
              {statusCounts.verified}
            </div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Archived
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#475569', marginTop: '0.25rem' }}>
              {statusCounts.archived}
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '14px',
            padding: '1.25rem',
            border: '1px solid #EAECF0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search
              size={17}
              color="#94A3B8"
              style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search colleges by name, city, country..."
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem 0.6rem 2.4rem',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: '#64748B' }}>
              <Filter size={14} /> Status:
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '0.5rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                background: '#FFFFFF',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#374151',
                outline: 'none',
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published Only</option>
              <option value="DRAFT">Draft</option>
              <option value="REVIEW">In Review</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            <select
              value={verifiedFilter}
              onChange={(e) => {
                setVerifiedFilter(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '0.5rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                background: '#FFFFFF',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#374151',
                outline: 'none',
              }}
            >
              <option value="ALL">All Verification</option>
              <option value="VERIFIED">Verified Only</option>
              <option value="UNVERIFIED">Unverified Only</option>
            </select>

            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setVerifiedFilter('ALL');
                setPage(1);
              }}
              style={{
                padding: '0.5rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                background: '#F8FAFC',
                fontSize: '0.8125rem',
                color: '#64748B',
                cursor: 'pointer',
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #EAECF0',
            boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
            overflow: 'hidden',
          }}
        >
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <div
                style={{
                  display: 'inline-block',
                  width: '36px',
                  height: '36px',
                  border: '3px solid #E0E7FF',
                  borderTopColor: '#5B4FE9',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  marginBottom: '1rem',
                }}
              />
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#081426' }}>
                Loading catalogue records...
              </div>
            </div>
          ) : errorMessage ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#DC2626' }}>
              <AlertCircle size={32} style={{ margin: '0 auto 0.75rem auto' }} />
              <div style={{ fontSize: '1rem', fontWeight: 700 }}>{errorMessage}</div>
              <button
                onClick={loadColleges}
                style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#5B4FE9', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                Retry
              </button>
            </div>
          ) : colleges.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748B' }}>
              <Building size={36} color="#94A3B8" style={{ margin: '0 auto 0.75rem auto' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#081426', margin: '0 0 0.5rem 0' }}>
                No colleges match your current filters.
              </h3>
              <p style={{ fontSize: '0.875rem', margin: '0 0 1.25rem 0' }}>
                Add a new college or clear your status and search filters.
              </p>
              <button
                onClick={handleOpenAddCollege}
                style={{ padding: '0.55rem 1.25rem', background: '#5B4FE9', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                + Add College
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
              <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #EAECF0', color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '1rem 1.25rem' }}>College / Institution</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Location</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Programs</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Status</th>
                    <th style={{ padding: '1rem 1.25rem' }}>Verification</th>
                    <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {colleges.map((inst) => {
                    const statusColor =
                      inst.status === 'PUBLISHED'
                        ? { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' }
                        : inst.status === 'DRAFT'
                        ? { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' }
                        : inst.status === 'REVIEW'
                        ? { bg: '#EEF2FF', text: '#4338CA', border: '#C7D2FE' }
                        : { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' };

                    return (
                      <tr key={inst.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s' }}>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ fontWeight: 700, color: '#081426', fontSize: '0.9375rem', marginBottom: '0.15rem' }}>
                            {inst.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span>Slug: {inst.slug}</span>
                            {inst.officialWebsiteUrl && (
                              <a
                                href={inst.officialWebsiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: '#5B4FE9', textDecoration: 'none' }}
                              >
                                Website <ExternalLink size={11} />
                              </a>
                            )}
                          </div>
                        </td>

                        <td style={{ padding: '1rem 1.25rem', color: '#334155' }}>
                          <div>{inst.city}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{inst.country}</div>
                        </td>

                        <td style={{ padding: '1rem 1.25rem' }}>
                          <button
                            onClick={() => handleOpenCoursesDrawer(inst.id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.25rem 0.6rem',
                              borderRadius: '6px',
                              background: '#EEF2FF',
                              color: '#4338CA',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              border: '1px solid #C7D2FE',
                              cursor: 'pointer',
                            }}
                          >
                            <BookOpen size={12} />
                            {inst.coursesCount} Courses
                          </button>
                        </td>

                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.25rem 0.65rem',
                              borderRadius: '12px',
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              background: statusColor.bg,
                              color: statusColor.text,
                              border: `1px solid ${statusColor.border}`,
                            }}
                          >
                            {inst.status || 'PUBLISHED'}
                          </span>
                        </td>

                        <td style={{ padding: '1rem 1.25rem' }}>
                          {inst.isVerified ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                padding: '0.25rem 0.65rem',
                                borderRadius: '12px',
                                fontSize: '0.6875rem',
                                fontWeight: 700,
                                background: '#E0F2FE',
                                color: '#0369A1',
                                border: '1px solid #BAE6FD',
                              }}
                            >
                              <CheckCircle size={12} /> Verified
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Unverified</span>
                          )}
                        </td>

                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                            <button
                              onClick={() => handlePreview(inst.id)}
                              style={{
                                padding: '0.4rem',
                                borderRadius: '6px',
                                border: '1px solid #E2E8F0',
                                background: '#FFFFFF',
                                color: '#475569',
                                cursor: 'pointer',
                              }}
                              title="Preview as Student"
                            >
                              <Eye size={14} />
                            </button>

                            <button
                              onClick={() => handleOpenEditCollege(inst.id)}
                              style={{
                                padding: '0.4rem',
                                borderRadius: '6px',
                                border: '1px solid #E2E8F0',
                                background: '#EEF2FF',
                                color: '#4338CA',
                                cursor: 'pointer',
                              }}
                              title="Edit College"
                            >
                              <Edit2 size={14} />
                            </button>

                            <button
                              onClick={() => handleTogglePublish(inst)}
                              style={{
                                padding: '0.4rem',
                                borderRadius: '6px',
                                border: '1px solid #E2E8F0',
                                background: inst.isPublished ? '#FEF2F2' : '#DCFCE7',
                                color: inst.isPublished ? '#DC2626' : '#166534',
                                cursor: 'pointer',
                              }}
                              title={inst.isPublished ? 'Unpublish from Students' : 'Publish to Students'}
                            >
                              {inst.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>

                            <button
                              onClick={() => handleToggleVerify(inst)}
                              style={{
                                padding: '0.4rem',
                                borderRadius: '6px',
                                border: '1px solid #E2E8F0',
                                background: '#F0F9FF',
                                color: '#0284C7',
                                cursor: 'pointer',
                              }}
                              title={inst.isVerified ? 'Remove Verification' : 'Verify Institution'}
                            >
                              <ShieldCheck size={14} />
                            </button>

                            <button
                              onClick={() => handleArchive(inst)}
                              style={{
                                padding: '0.4rem',
                                borderRadius: '6px',
                                border: '1px solid #FEE2E2',
                                background: '#FEF2F2',
                                color: '#DC2626',
                                cursor: 'pointer',
                              }}
                              title="Archive College"
                            >
                              <Archive size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && pagination.totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderTop: '1px solid #EAECF0' }}>
              <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} institutions)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    background: '#FFFFFF',
                    fontSize: '0.8125rem',
                    cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer',
                    color: pagination.page <= 1 ? '#9CA3AF' : '#374151',
                  }}
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={pagination.page >= pagination.totalPages}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    background: '#FFFFFF',
                    fontSize: '0.8125rem',
                    cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer',
                    color: pagination.page >= pagination.totalPages ? '#9CA3AF' : '#374151',
                  }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: CREATE / EDIT COLLEGE */}
      <AdminCollegeModal
        isOpen={isCollegeModalOpen}
        onClose={() => setIsCollegeModalOpen(false)}
        collegeToEdit={collegeToEdit}
        onSave={handleSaveCollege}
        isSaving={isSavingCollege}
      />

      {/* DRAWER: MANAGE COURSES */}
      <AdminCoursesDrawer
        isOpen={isCoursesDrawerOpen}
        onClose={() => setIsCoursesDrawerOpen(false)}
        institution={selectedForCourses}
        onRefreshInstitution={async (id) => {
          const res = await CollegesService.adminGetCollegeById(id);
          if (res.success && res.data) {
            setSelectedForCourses(res.data);
          }
          loadColleges();
        }}
        showToast={showToast}
      />

      {/* PREVIEW MODAL */}
      {previewInstitution && (
        <InstitutionDetailModal
          institution={previewInstitution}
          onClose={() => setPreviewInstitution(null)}
          onSelectCourse={() => {}}
          onToggleSave={() => {}}
          onToggleCompare={() => {}}
          isSaved={false}
          isCompared={false}
        />
      )}
    </div>
  );
};
