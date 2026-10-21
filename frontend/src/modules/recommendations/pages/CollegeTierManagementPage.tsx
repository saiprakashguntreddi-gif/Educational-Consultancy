import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  Search,
  Plus,
  Edit2,
  Power,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Building2,
  Globe2,
  BookOpen,
  Info,
} from 'lucide-react';
import {
  ManagedCollegeDto,
  RecommendationTier,
  CreateManagedCollegeInput,
  UpdateManagedCollegeInput,
} from '../recommendations.types';
import { RecommendationsService } from '../services/recommendations.service';

interface CollegeTierManagementPageProps {
  onNavigateHome?: () => void;
}

export const CollegeTierManagementPage: React.FC<CollegeTierManagementPageProps> = ({
  onNavigateHome,
}) => {
  // Query state
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'SAFE' | 'BEST_FIT' | 'ASPIRATIONAL'>('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Data state
  const [colleges, setColleges] = useState<ManagedCollegeDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [tierCounts, setTierCounts] = useState({
    all: 0,
    safe: 0,
    bestFit: 0,
    aspirational: 0,
    unassigned: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Modals
  const [isChangeTierOpen, setIsChangeTierOpen] = useState(false);
  const [selectedCollegeForTier, setSelectedCollegeForTier] = useState<ManagedCollegeDto | null>(null);
  const [newSelectedTier, setNewSelectedTier] = useState<RecommendationTier>('BEST_FIT');
  const [tierReason, setTierReason] = useState('');
  const [tierChangeError, setTierChangeError] = useState<string | null>(null);
  const [isSubmittingTier, setIsSubmittingTier] = useState(false);

  // Add / Edit College Modal
  const [isCollegeModalOpen, setIsCollegeModalOpen] = useState(false);
  const [collegeToEdit, setCollegeToEdit] = useState<ManagedCollegeDto | null>(null);
  const [collegeFormData, setCollegeFormData] = useState<{
    name: string;
    country: string;
    city: string;
    state: string;
    institutionType: string;
    overview: string;
    officialWebsiteUrl: string;
    rankingInfo: string;
    initialTier: RecommendationTier;
    reason: string;
    acceptanceRate: string;
    minPercentageRequirement: string;
    avgSatRequirement: string;
  }>({
    name: '',
    country: 'United States',
    city: '',
    state: '',
    institutionType: 'University',
    overview: '',
    officialWebsiteUrl: '',
    rankingInfo: '',
    initialTier: 'BEST_FIT',
    reason: '',
    acceptanceRate: '',
    minPercentageRequirement: '',
    avgSatRequirement: '',
  });
  const [isSubmittingCollege, setIsSubmittingCollege] = useState(false);
  const [collegeFormError, setCollegeFormError] = useState<string | null>(null);

  // View Courses Modal
  const [viewCoursesCollege, setViewCoursesCollege] = useState<ManagedCollegeDto | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
  };

  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  const loadManagedColleges = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await RecommendationsService.adminListManagedColleges({
        search: search.trim() || undefined,
        tier: tierFilter,
        page,
        limit: pageSize,
      });

      if (res.success && res.data) {
        setColleges(res.data.colleges || []);
        setTotalCount(res.data.total || 0);
        if (res.data.tierCounts) {
          setTierCounts(res.data.tierCounts);
        }
      } else {
        setErrorMessage(typeof res.error === 'string' ? res.error : JSON.stringify(res.error) || 'Failed to load college tier catalogue.');
      }
    } catch (_err) {
      setErrorMessage('Could not connect to recommendation tier services.');
    } finally {
      setIsLoading(false);
    }
  }, [search, tierFilter, page]);

  useEffect(() => {
    loadManagedColleges();
  }, [loadManagedColleges]);

  // Open Change Tier Dialog
  const handleOpenChangeTier = (college: ManagedCollegeDto) => {
    setSelectedCollegeForTier(college);
    setNewSelectedTier(college.managedTier || 'BEST_FIT');
    setTierReason('');
    setTierChangeError(null);
    setIsChangeTierOpen(true);
  };

  // Submit Change Tier
  const handleSaveTier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollegeForTier) return;
    if (!tierReason.trim()) {
      setTierChangeError('A reason is strictly required when assigning or modifying a college tier.');
      return;
    }

    setIsSubmittingTier(true);
    setTierChangeError(null);

    try {
      const res = await RecommendationsService.adminAssignCollegeTier(selectedCollegeForTier.id, {
        tier: newSelectedTier,
        reason: tierReason.trim(),
      });

      if (res.success && res.data) {
        showToast(
          `Successfully updated tier for ${selectedCollegeForTier.name} to ${formatTierLabel(newSelectedTier)}.`,
          'success'
        );
        setIsChangeTierOpen(false);
        setSelectedCollegeForTier(null);
        loadManagedColleges();
      } else {
        setTierChangeError(typeof res.error === 'string' ? res.error : JSON.stringify(res.error) || 'Failed to update college tier.');
      }
    } catch (err: any) {
      setTierChangeError(err.message || 'An unexpected error occurred while updating college tier.');
    } finally {
      setIsSubmittingTier(false);
    }
  };

  // Toggle College Status (Active/Inactive)
  const handleToggleStatus = async (college: ManagedCollegeDto) => {
    const nextStatus = !college.isActive;
    const confirmText = nextStatus
      ? `Activate "${college.name}" for the recommendation system?`
      : `Deactivate "${college.name}"? It will not be recommended to students while inactive.`;

    if (!window.confirm(confirmText)) return;

    try {
      const res = await RecommendationsService.adminToggleCollegeStatus(college.id, nextStatus);
      if (res.success) {
        showToast(
          `College "${college.name}" is now ${nextStatus ? 'active' : 'inactive'}.`,
          'info'
        );
        loadManagedColleges();
      } else {
        showToast(typeof res.error === 'string' ? res.error : JSON.stringify(res.error) || 'Failed to update college status.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error toggling college status.', 'error');
    }
  };

  // Open Add College Modal
  const handleOpenAddCollege = () => {
    setCollegeToEdit(null);
    setCollegeFormData({
      name: '',
      country: 'United States',
      city: '',
      state: '',
      institutionType: 'University',
      overview: '',
      officialWebsiteUrl: '',
      rankingInfo: '',
      initialTier: 'BEST_FIT',
      reason: 'Initial college tier assignment by Administrator.',
      acceptanceRate: '',
      minPercentageRequirement: '',
      avgSatRequirement: '',
    });
    setCollegeFormError(null);
    setIsCollegeModalOpen(true);
  };

  // Open Edit College Modal
  const handleOpenEditCollege = (college: ManagedCollegeDto) => {
    setCollegeToEdit(college);
    setCollegeFormData({
      name: college.name,
      country: college.country,
      city: college.city,
      state: college.state || '',
      institutionType: college.institutionType || 'University',
      overview: college.overview,
      officialWebsiteUrl: college.officialWebsiteUrl,
      rankingInfo: college.rankingInfo || '',
      initialTier: college.managedTier || 'BEST_FIT',
      reason: college.tierReason || '',
      acceptanceRate: college.acceptanceRate !== null && college.acceptanceRate !== undefined
        ? String(Math.round(college.acceptanceRate * 100))
        : '',
      minPercentageRequirement: college.minPercentageRequirement !== null && college.minPercentageRequirement !== undefined
        ? String(college.minPercentageRequirement)
        : '',
      avgSatRequirement: college.avgSatRequirement !== null && college.avgSatRequirement !== undefined
        ? String(college.avgSatRequirement)
        : '',
    });
    setCollegeFormError(null);
    setIsCollegeModalOpen(true);
  };

  // Save College (Add or Edit)
  const handleSaveCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collegeFormData.name.trim()) {
      setCollegeFormError('College name is required.');
      return;
    }
    if (!collegeFormData.country.trim()) {
      setCollegeFormError('Country is required.');
      return;
    }
    if (!collegeFormData.city.trim()) {
      setCollegeFormError('City is required.');
      return;
    }
    if (!collegeFormData.overview.trim()) {
      setCollegeFormError('Overview description is required.');
      return;
    }
    if (!collegeFormData.officialWebsiteUrl.trim()) {
      setCollegeFormError('Official website URL is required.');
      return;
    }

    setIsSubmittingCollege(true);
    setCollegeFormError(null);

    try {
      const parsedAcceptanceRate = collegeFormData.acceptanceRate
        ? parseFloat(collegeFormData.acceptanceRate) / 100
        : undefined;
      const parsedMinPercentage = collegeFormData.minPercentageRequirement
        ? parseFloat(collegeFormData.minPercentageRequirement)
        : undefined;
      const parsedSat = collegeFormData.avgSatRequirement
        ? parseInt(collegeFormData.avgSatRequirement, 10)
        : undefined;

      if (collegeToEdit) {
        // Edit
        const updateInput: UpdateManagedCollegeInput = {
          name: collegeFormData.name.trim(),
          country: collegeFormData.country.trim(),
          city: collegeFormData.city.trim(),
          state: collegeFormData.state.trim() || undefined,
          institutionType: collegeFormData.institutionType.trim() || undefined,
          overview: collegeFormData.overview.trim(),
          officialWebsiteUrl: collegeFormData.officialWebsiteUrl.trim(),
          rankingInfo: collegeFormData.rankingInfo.trim() || undefined,
          managedTier: collegeFormData.initialTier,
          tierReason: collegeFormData.reason.trim() || undefined,
          acceptanceRate: parsedAcceptanceRate,
          minPercentageRequirement: parsedMinPercentage,
          avgSatRequirement: parsedSat,
        };
        const res = await RecommendationsService.adminUpdateManagedCollege(collegeToEdit.id, updateInput);
        if (res.success) {
          showToast(`College "${collegeFormData.name}" updated successfully.`, 'success');
          setIsCollegeModalOpen(false);
          loadManagedColleges();
        } else {
          setCollegeFormError(typeof res.error === 'string' ? res.error : JSON.stringify(res.error) || 'Failed to update college.');
        }
      } else {
        // Create
        const createInput: CreateManagedCollegeInput = {
          name: collegeFormData.name.trim(),
          country: collegeFormData.country.trim(),
          city: collegeFormData.city.trim(),
          state: collegeFormData.state.trim() || undefined,
          institutionType: collegeFormData.institutionType.trim() || undefined,
          overview: collegeFormData.overview.trim(),
          officialWebsiteUrl: collegeFormData.officialWebsiteUrl.trim(),
          rankingInfo: collegeFormData.rankingInfo.trim() || undefined,
          initialTier: collegeFormData.initialTier,
          reason: collegeFormData.reason.trim() || 'Initial college tier assignment by Administrator.',
          acceptanceRate: parsedAcceptanceRate,
          minPercentageRequirement: parsedMinPercentage,
          avgSatRequirement: parsedSat,
        };
        const res = await RecommendationsService.adminCreateManagedCollege(createInput);
        if (res.success) {
          showToast(`College "${collegeFormData.name}" added to managed catalogue.`, 'success');
          setIsCollegeModalOpen(false);
          loadManagedColleges();
        } else {
          setCollegeFormError(typeof res.error === 'string' ? res.error : JSON.stringify(res.error) || 'Failed to create college.');
        }
      }
    } catch (err: any) {
      setCollegeFormError(err.message || 'Error saving college details.');
    } finally {
      setIsSubmittingCollege(false);
    }
  };

  const formatTierLabel = (tier: RecommendationTier | null) => {
    switch (tier) {
      case 'SAFE':
        return 'Safe';
      case 'BEST_FIT':
        return 'Best-Fit';
      case 'ASPIRATIONAL':
        return 'Aspirational';
      default:
        return 'Unassigned';
    }
  };

  const getTierBadgeStyle = (tier: RecommendationTier | null) => {
    switch (tier) {
      case 'SAFE':
        return {
          bg: '#ECFDF5',
          text: '#065F46',
          border: '#A7F3D0',
          dot: '#10B981',
          label: 'Safe',
          sub: '>95% Chance',
        };
      case 'BEST_FIT':
        return {
          bg: '#EEF2FF',
          text: '#3730A3',
          border: '#C7D2FE',
          dot: '#6366F1',
          label: 'Best-Fit',
          sub: '50%–94% Chance',
        };
      case 'ASPIRATIONAL':
        return {
          bg: '#FAF5FF',
          text: '#6B21A8',
          border: '#E9D5FF',
          dot: '#A855F7',
          label: 'Aspirational',
          sub: '<50% Reach',
        };
      default:
        return {
          bg: '#F1F5F9',
          text: '#475569',
          border: '#CBD5E1',
          dot: '#94A3B8',
          label: 'Unassigned',
          sub: 'Default benchmark',
        };
    }
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem', minHeight: '85vh' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: 80,
            right: 24,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.9rem 1.4rem',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
            background:
              toastMessage.type === 'success'
                ? '#064E3B'
                : toastMessage.type === 'error'
                ? '#7F1D1D'
                : '#1E293B',
            color: '#FFFFFF',
            fontSize: '0.9rem',
            fontWeight: 500,
            animation: 'fadeIn 0.2s ease-in-out',
          }}
        >
          {toastMessage.type === 'success' && <CheckCircle2 size={18} color="#34D399" />}
          {toastMessage.type === 'error' && <AlertCircle size={18} color="#F87171" />}
          {toastMessage.type === 'info' && <Info size={18} color="#60A5FA" />}
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              marginLeft: '0.5rem',
              display: 'flex',
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Hero Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 10px rgba(79, 70, 229, 0.25)',
              }}
            >
              <Layers size={20} />
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              College Tier Management
            </h1>
          </div>
          <p style={{ color: '#64748B', fontSize: '0.95rem', margin: 0, maxWidth: 800 }}>
            Govern college classification for the Three-Tier Recommendation system. Assign institutional initial tiers
            (<strong>Safe</strong>, <strong>Best-Fit</strong>, <strong>Aspirational</strong>) and manage catalogue admission benchmarks.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: '#475569',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Back to Home
            </button>
          )}

          <button
            onClick={loadManagedColleges}
            title="Refresh catalogue"
            style={{
              padding: '0.65rem',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#64748B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <RefreshCw size={17} className={isLoading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={handleOpenAddCollege}
            id="admin-add-college-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
              color: '#FFFFFF',
              fontSize: '0.9rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
            }}
          >
            <Plus size={18} />
            <span>+ Add College</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: 420 }}>
          <Search
            size={18}
            color="#94A3B8"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            id="admin-search-colleges-input"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search colleges by name or location..."
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.4rem',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '0.9rem',
              color: '#0F172A',
              outline: 'none',
              background: '#F8FAFC',
              transition: 'border-color 0.15s ease',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Tier Filter Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B', marginRight: '0.25rem' }}>
            Filter:
          </span>

          <button
            onClick={() => {
              setTierFilter('ALL');
              setPage(1);
            }}
            id="filter-all-btn"
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '6px',
              border: tierFilter === 'ALL' ? '1px solid #4F46E5' : '1px solid #E2E8F0',
              background: tierFilter === 'ALL' ? '#EEF2FF' : '#FFFFFF',
              color: tierFilter === 'ALL' ? '#4F46E5' : '#475569',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span>All</span>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.1rem 0.4rem',
                borderRadius: '10px',
                background: tierFilter === 'ALL' ? '#4F46E5' : '#F1F5F9',
                color: tierFilter === 'ALL' ? '#FFFFFF' : '#64748B',
              }}
            >
              {tierCounts.all}
            </span>
          </button>

          <button
            onClick={() => {
              setTierFilter('SAFE');
              setPage(1);
            }}
            id="filter-safe-btn"
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '6px',
              border: tierFilter === 'SAFE' ? '1px solid #10B981' : '1px solid #E2E8F0',
              background: tierFilter === 'SAFE' ? '#ECFDF5' : '#FFFFFF',
              color: tierFilter === 'SAFE' ? '#065F46' : '#475569',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span>Safe</span>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.1rem 0.4rem',
                borderRadius: '10px',
                background: tierFilter === 'SAFE' ? '#10B981' : '#F1F5F9',
                color: tierFilter === 'SAFE' ? '#FFFFFF' : '#64748B',
              }}
            >
              {tierCounts.safe}
            </span>
          </button>

          <button
            onClick={() => {
              setTierFilter('BEST_FIT');
              setPage(1);
            }}
            id="filter-bestfit-btn"
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '6px',
              border: tierFilter === 'BEST_FIT' ? '1px solid #6366F1' : '1px solid #E2E8F0',
              background: tierFilter === 'BEST_FIT' ? '#EEF2FF' : '#FFFFFF',
              color: tierFilter === 'BEST_FIT' ? '#3730A3' : '#475569',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span>Best-Fit</span>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.1rem 0.4rem',
                borderRadius: '10px',
                background: tierFilter === 'BEST_FIT' ? '#6366F1' : '#F1F5F9',
                color: tierFilter === 'BEST_FIT' ? '#FFFFFF' : '#64748B',
              }}
            >
              {tierCounts.bestFit}
            </span>
          </button>

          <button
            onClick={() => {
              setTierFilter('ASPIRATIONAL');
              setPage(1);
            }}
            id="filter-aspirational-btn"
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: '6px',
              border: tierFilter === 'ASPIRATIONAL' ? '1px solid #A855F7' : '1px solid #E2E8F0',
              background: tierFilter === 'ASPIRATIONAL' ? '#FAF5FF' : '#FFFFFF',
              color: tierFilter === 'ASPIRATIONAL' ? '#6B21A8' : '#475569',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span>Aspirational</span>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.1rem 0.4rem',
                borderRadius: '10px',
                background: tierFilter === 'ASPIRATIONAL' ? '#A855F7' : '#F1F5F9',
                color: tierFilter === 'ASPIRATIONAL' ? '#FFFFFF' : '#64748B',
              }}
            >
              {tierCounts.aspirational}
            </span>
          </button>
        </div>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '8px',
            background: '#FEF2F2',
            border: '1px solid #F87171',
            color: '#991B1B',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <AlertCircle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Table Card */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.9rem',
            }}
          >
            <thead>
              <tr
                style={{
                  background: '#F8FAFC',
                  borderBottom: '1px solid #E2E8F0',
                  color: '#475569',
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 700,
                }}
              >
                <th style={{ padding: '0.9rem 1.25rem' }}>College</th>
                <th style={{ padding: '0.9rem 1rem' }}>Country</th>
                <th style={{ padding: '0.9rem 1rem' }}>Tier</th>
                <th style={{ padding: '0.9rem 1rem' }}>Status</th>
                <th style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '3.5rem', textAlign: 'center', color: '#64748B' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <RefreshCw size={26} className="animate-spin" color="#4F46E5" />
                      <span>Loading managed college catalogue...</span>
                    </div>
                  </td>
                </tr>
              ) : colleges.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '3.5rem', textAlign: 'center', color: '#64748B' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <Building2 size={36} color="#CBD5E1" />
                      <p style={{ margin: 0, fontWeight: 600, color: '#334155' }}>
                        No colleges found matching the criteria.
                      </p>
                      <p style={{ margin: 0, fontSize: '0.85rem' }}>
                        Try clearing your search query or selecting a different tier filter.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                colleges.map((college) => {
                  const badge = getTierBadgeStyle(college.managedTier);
                  return (
                    <tr
                      key={college.id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        transition: 'background 0.1s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                    >
                      {/* College Name & Details */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: '8px',
                              background: '#F1F5F9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#475569',
                              flexShrink: 0,
                              fontWeight: 700,
                              fontSize: '1rem',
                            }}
                          >
                            {college.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>
                                {college.name}
                              </span>
                              {college.rankingInfo && (
                                <span
                                  style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    padding: '0.1rem 0.4rem',
                                    borderRadius: '4px',
                                    background: '#F1F5F9',
                                    color: '#475569',
                                  }}
                                >
                                  {college.rankingInfo}
                                </span>
                              )}
                            </div>

                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                marginTop: '0.25rem',
                                fontSize: '0.8rem',
                                color: '#64748B',
                                flexWrap: 'wrap',
                              }}
                            >
                              <span>
                                {college.city}
                                {college.state ? `, ${college.state}` : ''}
                              </span>
                              <span>•</span>
                              <span>{college.institutionType || 'University'}</span>

                              {/* Benchmark indicators */}
                              {college.acceptanceRate !== null && college.acceptanceRate !== undefined && (
                                <>
                                  <span>•</span>
                                  <span>Acceptance: {Math.round(college.acceptanceRate * 100)}%</span>
                                </>
                              )}
                              {college.minPercentageRequirement !== null &&
                                college.minPercentageRequirement !== undefined && (
                                  <>
                                    <span>•</span>
                                    <span>Min Req: {college.minPercentageRequirement}%</span>
                                  </>
                                )}

                              {/* Programs button */}
                              {college.coursesCount > 0 && (
                                <>
                                  <span>•</span>
                                  <button
                                    onClick={() => setViewCoursesCollege(college)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      padding: 0,
                                      color: '#4F46E5',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.2rem',
                                      fontWeight: 600,
                                      fontSize: '0.8rem',
                                      textDecoration: 'underline',
                                    }}
                                  >
                                    <BookOpen size={12} />
                                    <span>{college.coursesCount} program(s)</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Country */}
                      <td style={{ padding: '1rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#334155' }}>
                          <Globe2 size={15} color="#64748B" />
                          <span style={{ fontWeight: 500 }}>{college.country}</span>
                        </div>
                      </td>

                      {/* Tier Badge */}
                      <td style={{ padding: '1rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            flexDirection: 'column',
                            gap: '0.15rem',
                          }}
                        >
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              padding: '0.3rem 0.75rem',
                              borderRadius: '9999px',
                              background: badge.bg,
                              color: badge.text,
                              border: `1px solid ${badge.border}`,
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              letterSpacing: '0.02em',
                            }}
                          >
                            <span
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                background: badge.dot,
                              }}
                            />
                            {badge.label}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#64748B', paddingLeft: '0.4rem' }}>
                            {badge.sub}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '1rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '6px',
                            background: college.isActive ? '#ECFDF5' : '#F1F5F9',
                            color: college.isActive ? '#065F46' : '#64748B',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: college.isActive ? '#10B981' : '#94A3B8',
                            }}
                          />
                          {college.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle', textAlign: 'right' }}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            justifyContent: 'flex-end',
                          }}
                        >
                          <button
                            onClick={() => handleOpenChangeTier(college)}
                            className="btn-change-tier"
                            title="Change recommendation tier"
                            style={{
                              padding: '0.4rem 0.75rem',
                              borderRadius: '6px',
                              border: '1px solid #C7D2FE',
                              background: '#EEF2FF',
                              color: '#4338CA',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                            }}
                          >
                            <Layers size={13} />
                            <span>Change Tier</span>
                          </button>

                          <button
                            onClick={() => handleOpenEditCollege(college)}
                            title="Edit college details"
                            style={{
                              padding: '0.4rem 0.65rem',
                              borderRadius: '6px',
                              border: '1px solid #E2E8F0',
                              background: '#FFFFFF',
                              color: '#334155',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            <Edit2 size={13} />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleToggleStatus(college)}
                            title={college.isActive ? 'Deactivate college' : 'Activate college'}
                            style={{
                              padding: '0.4rem 0.65rem',
                              borderRadius: '6px',
                              border: college.isActive ? '1px solid #FECACA' : '1px solid #A7F3D0',
                              background: college.isActive ? '#FEF2F2' : '#ECFDF5',
                              color: college.isActive ? '#B91C1C' : '#047857',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            <Power size={13} />
                            <span>{college.isActive ? 'Deactivate' : 'Activate'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.9rem 1.25rem',
            borderTop: '1px solid #E2E8F0',
            background: '#F8FAFC',
            fontSize: '0.85rem',
            color: '#64748B',
          }}
        >
          <div>
            Showing <strong>{colleges.length}</strong> of <strong>{totalCount}</strong> managed colleges
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: page <= 1 ? '#94A3B8' : '#334155',
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
              }}
            >
              Previous
            </button>
            <span style={{ padding: '0.35rem 0.75rem', fontWeight: 600, color: '#0F172A' }}>
              Page {page} of {Math.max(1, Math.ceil(totalCount / pageSize))}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(totalCount / pageSize)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                color: page >= Math.ceil(totalCount / pageSize) ? '#94A3B8' : '#334155',
                cursor: page >= Math.ceil(totalCount / pageSize) ? 'not-allowed' : 'pointer',
                fontWeight: 600,
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRMATION DIALOG: CHANGE TIER (Strictly requires Reason) */}
      {isChangeTierOpen && selectedCollegeForTier && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: 520,
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
              animation: 'scaleIn 0.15s ease-out',
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
                background: '#F8FAFC',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    background: '#EEF2FF',
                    color: '#4F46E5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Layers size={18} />
                </div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0F172A' }}>
                  Change Recommendation Tier
                </h3>
              </div>
              <button
                onClick={() => setIsChangeTierOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  display: 'flex',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveTier} style={{ padding: '1.5rem' }}>
              {/* College Information */}
              <div
                style={{
                  padding: '0.85rem 1rem',
                  background: '#F8FAFC',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                  Target Institution
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginTop: '0.2rem' }}>
                  College: {selectedCollegeForTier.name}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.25rem' }}>
                  Current Tier:{' '}
                  <strong style={{ color: '#4F46E5' }}>
                    {formatTierLabel(selectedCollegeForTier.managedTier)}
                  </strong>
                </div>
              </div>

              {/* New Tier Selector */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '0.5rem',
                  }}
                >
                  New Tier:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {(['SAFE', 'BEST_FIT', 'ASPIRATIONAL'] as RecommendationTier[]).map((tierKey) => {
                    const isSelected = newSelectedTier === tierKey;
                    const label = formatTierLabel(tierKey);
                    return (
                      <button
                        type="button"
                        key={tierKey}
                        onClick={() => setNewSelectedTier(tierKey)}
                        id={`modal-tier-${tierKey.toLowerCase()}-btn`}
                        style={{
                          padding: '0.75rem 0.5rem',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid #4F46E5' : '1px solid #CBD5E1',
                          background: isSelected ? '#EEF2FF' : '#FFFFFF',
                          color: isSelected ? '#4338CA' : '#475569',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.25rem',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span>{label}</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 500, color: isSelected ? '#6366F1' : '#94A3B8' }}>
                          {tierKey === 'SAFE' ? '>95%' : tierKey === 'BEST_FIT' ? '50%–94%' : '<50%'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mandatory Reason Field */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  htmlFor="tier-reason-input"
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '0.4rem',
                  }}
                >
                  Reason: <span style={{ color: '#EF4444' }}>* (Strictly required)</span>
                </label>
                <textarea
                  id="tier-reason-input"
                  rows={3}
                  value={tierReason}
                  onChange={(e) => {
                    setTierReason(e.target.value);
                    if (tierChangeError) setTierChangeError(null);
                  }}
                  placeholder="e.g., Reclassified based on updated 2026 admissions selectivity criteria and average student intake profile."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    border: tierChangeError ? '1px solid #EF4444' : '1px solid #CBD5E1',
                    fontSize: '0.875rem',
                    color: '#0F172A',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {tierChangeError && (
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: '6px',
                    background: '#FEF2F2',
                    border: '1px solid #F87171',
                    color: '#991B1B',
                    fontSize: '0.85rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{tierChangeError}</span>
                </div>
              )}

              {/* Actions: [Cancel] [Save] */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsChangeTierOpen(false)}
                  disabled={isSubmittingTier}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#475569',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="modal-save-tier-btn"
                  disabled={isSubmittingTier}
                  style={{
                    padding: '0.65rem 1.4rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
                    color: '#FFFFFF',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: isSubmittingTier ? 'wait' : 'pointer',
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  {isSubmittingTier && <RefreshCw size={15} className="animate-spin" />}
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT COLLEGE MODAL */}
      {isCollegeModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: 680,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#F8FAFC',
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Building2 size={20} color="#4F46E5" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                  {collegeToEdit ? `Edit College: ${collegeToEdit.name}` : '+ Add College to Catalogue'}
                </h3>
              </div>
              <button
                onClick={() => setIsCollegeModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  display: 'flex',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveCollege} style={{ padding: '1.5rem' }}>
              {collegeFormError && (
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: '6px',
                    background: '#FEF2F2',
                    border: '1px solid #F87171',
                    color: '#991B1B',
                    fontSize: '0.85rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  {collegeFormError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    College Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={collegeFormData.name}
                    onChange={(e) => setCollegeFormData({ ...collegeFormData, name: e.target.value })}
                    placeholder="e.g. Stanford University"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={collegeFormData.country}
                    onChange={(e) => setCollegeFormData({ ...collegeFormData, country: e.target.value })}
                    placeholder="e.g. United States, United Kingdom"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={collegeFormData.city}
                    onChange={(e) => setCollegeFormData({ ...collegeFormData, city: e.target.value })}
                    placeholder="e.g. Stanford"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    State / Province
                  </label>
                  <input
                    type="text"
                    value={collegeFormData.state}
                    onChange={(e) => setCollegeFormData({ ...collegeFormData, state: e.target.value })}
                    placeholder="e.g. California"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Ranking Info
                  </label>
                  <input
                    type="text"
                    value={collegeFormData.rankingInfo}
                    onChange={(e) => setCollegeFormData({ ...collegeFormData, rankingInfo: e.target.value })}
                    placeholder="e.g. Global Rank #3"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Official Website URL *
                </label>
                <input
                  type="url"
                  required
                  value={collegeFormData.officialWebsiteUrl}
                  onChange={(e) => setCollegeFormData({ ...collegeFormData, officialWebsiteUrl: e.target.value })}
                  placeholder="https://www.stanford.edu"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Overview & Admission Profile *
                </label>
                <textarea
                  rows={3}
                  required
                  value={collegeFormData.overview}
                  onChange={(e) => setCollegeFormData({ ...collegeFormData, overview: e.target.value })}
                  placeholder="Comprehensive institution profile, campus environment, and academic legacy..."
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.875rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Admission Benchmarks */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.75rem' }}>
                  Admission Benchmarks
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748B', marginBottom: '0.25rem' }}>
                      Acceptance Rate (%)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max="100"
                      value={collegeFormData.acceptanceRate}
                      onChange={(e) => setCollegeFormData({ ...collegeFormData, acceptanceRate: e.target.value })}
                      placeholder="e.g. 5"
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748B', marginBottom: '0.25rem' }}>
                      Min Req Academic (%)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="40"
                      max="100"
                      value={collegeFormData.minPercentageRequirement}
                      onChange={(e) => setCollegeFormData({ ...collegeFormData, minPercentageRequirement: e.target.value })}
                      placeholder="e.g. 92"
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748B', marginBottom: '0.25rem' }}>
                      Avg SAT Requirement
                    </label>
                    <input
                      type="number"
                      step="10"
                      min="600"
                      max="1600"
                      value={collegeFormData.avgSatRequirement}
                      onChange={(e) => setCollegeFormData({ ...collegeFormData, avgSatRequirement: e.target.value })}
                      placeholder="e.g. 1520"
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Initial Tier Assignment */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                  Assign Recommendation Tier *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {(['SAFE', 'BEST_FIT', 'ASPIRATIONAL'] as RecommendationTier[]).map((tierKey) => {
                    const isSelected = collegeFormData.initialTier === tierKey;
                    const label = formatTierLabel(tierKey);
                    return (
                      <button
                        type="button"
                        key={tierKey}
                        onClick={() => setCollegeFormData({ ...collegeFormData, initialTier: tierKey })}
                        style={{
                          padding: '0.65rem 0.5rem',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid #4F46E5' : '1px solid #CBD5E1',
                          background: isSelected ? '#EEF2FF' : '#FFFFFF',
                          color: isSelected ? '#4338CA' : '#475569',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.2rem',
                        }}
                      >
                        <span>{label}</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 500, color: isSelected ? '#6366F1' : '#94A3B8' }}>
                          {tierKey === 'SAFE' ? '>95%' : tierKey === 'BEST_FIT' ? '50%–94%' : '<50%'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Classification Note / Rationale
                </label>
                <input
                  type="text"
                  value={collegeFormData.reason}
                  onChange={(e) => setCollegeFormData({ ...collegeFormData, reason: e.target.value })}
                  placeholder="Reason for assigning this tier"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsCollegeModalOpen(false)}
                  disabled={isSubmittingCollege}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#475569',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCollege}
                  style={{
                    padding: '0.65rem 1.4rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
                    color: '#FFFFFF',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: isSubmittingCollege ? 'wait' : 'pointer',
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                  }}
                >
                  {isSubmittingCollege ? 'Saving...' : collegeToEdit ? 'Save Changes' : 'Create & Assign Tier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PROGRAMS / COURSES DRAWER */}
      {viewCoursesCollege && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: 600,
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                  Available Programs & Courses
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
                  {viewCoursesCollege.name} ({viewCoursesCollege.country})
                </p>
              </div>
              <button
                onClick={() => setViewCoursesCollege(null)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {viewCoursesCollege.courses.length === 0 ? (
              <p style={{ color: '#64748B', fontSize: '0.9rem' }}>No programs currently listed for this institution.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {viewCoursesCollege.courses.map((course) => (
                  <div
                    key={course.id}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.92rem' }}>
                      {course.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.2rem' }}>
                      Department: {course.department} • Level: {course.level}
                      {course.annualTuitionFee && (
                        <span>
                          {' '}
                          • Tuition: {course.annualTuitionFee.toLocaleString()} {course.feeCurrency}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
              <button
                onClick={() => setViewCoursesCollege(null)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
