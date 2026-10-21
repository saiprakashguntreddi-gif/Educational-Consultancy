import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Compass,
  Building,
  Bookmark,
  Scale,
  Search,
  ArrowUpDown,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  InstitutionSummary,
  InstitutionDetail,
  CourseSummary,
  DiscoveryFilterOptions,
  DiscoveryPagination,
  CollegeSearchParams,
} from '../colleges.types';
import { CollegesService } from '../services/colleges.service';
import { CollegeSearchBar } from './CollegeSearchBar';
import { CollegeFilterPanel } from './CollegeFilterPanel';
import { InstitutionCard } from './InstitutionCard';
import { InstitutionDetailModal } from './InstitutionDetailModal';
import { CourseDetailModal } from './CourseDetailModal';
import { CollegeCompareView } from './CollegeCompareView';
import { SavedCollegesView } from './SavedCollegesView';

interface CollegeDiscoveryViewProps {
  onBackToDashboard?: () => void;
}

export const CollegeDiscoveryView: React.FC<CollegeDiscoveryViewProps> = ({
  onBackToDashboard: _onBackToDashboard,
}) => {
  // Navigation Tabs: catalog, saved, compare
  const [activeTab, setActiveTab] = useState<'catalog' | 'saved' | 'compare'>('catalog');

  // Search & Filters State
  const [currentFilters, setCurrentFilters] = useState<CollegeSearchParams>({
    search: '',
    country: 'ALL',
    city: 'ALL',
    department: 'ALL',
    specialization: 'ALL',
    level: 'ALL',
    minFee: undefined,
    maxFee: undefined,
    hasScholarship: undefined,
    entranceExam: 'ALL',
    sortBy: 'name_asc',
    page: 1,
    limit: 6,
  });

  // Catalog Data
  const [institutions, setInstitutions] = useState<InstitutionSummary[]>([]);
  const [pagination, setPagination] = useState<DiscoveryPagination>({
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 1,
  });
  const [filterOptions, setFilterOptions] = useState<DiscoveryFilterOptions>({
    countries: [],
    cities: [],
    departments: [],
    specializations: [],
    levels: [],
    entranceExams: [],
    feeRange: { min: 0, max: 100000, currency: 'USD' },
  });

  // Shortlist & Comparison State
  const [savedInstitutions, setSavedInstitutions] = useState<InstitutionSummary[]>([]);
  const [savedCourses, setSavedCourses] = useState<CourseSummary[]>([]);
  const [comparedInstitutions, setComparedInstitutions] = useState<InstitutionDetail[]>([]);

  // Modals & Details State
  const [selectedInstitution, setSelectedInstitution] = useState<InstitutionDetail | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<CourseSummary | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState<boolean>(false);

  // UI Flow State
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSavedLoading, setIsSavedLoading] = useState<boolean>(false);
  const [isCompareLoading, setIsCompareLoading] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
  };

  const getErrorString = (err: unknown): string => {
    if (typeof err === 'string') return err;
    if (err && typeof err === 'object') return JSON.stringify(err);
    return 'An unexpected error occurred.';
  };

  /**
   * Fetch catalogue institutions with current filters and pagination
   */
  const fetchInstitutions = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await CollegesService.listColleges(currentFilters);
      if (response.success && response.data) {
        setInstitutions(response.data.data || []);
        setPagination(
          response.data.pagination || {
            total: 0,
            page: 1,
            limit: 6,
            totalPages: 1,
          }
        );
        if (response.data.filters) {
          setFilterOptions(response.data.filters);
        }
      } else {
        setErrorMessage(
          response.error
            ? getErrorString(response.error)
            : "We couldn't load the college catalogue. Please try again."
        );
      }
    } catch (_err) {
      setErrorMessage("We couldn't load the college catalogue. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [currentFilters]);

  /**
   * Fetch saved shortlist items for authenticated student
   */
  const fetchSavedItems = useCallback(async () => {
    setIsSavedLoading(true);
    try {
      const response = await CollegesService.getSaved();
      if (response.success && response.data) {
        setSavedInstitutions(response.data.savedInstitutions || []);
        setSavedCourses(response.data.savedCourses || []);
      }
    } catch (_err) {
      // Non-blocking
    } finally {
      setIsSavedLoading(false);
    }
  }, []);

  /**
   * Fetch compared institutions for authenticated student
   */
  const fetchComparisonItems = useCallback(async () => {
    setIsCompareLoading(true);
    try {
      const response = await CollegesService.getComparison();
      if (response.success && response.data) {
        setComparedInstitutions(response.data.institutions || []);
      }
    } catch (_err) {
      // Non-blocking
    } finally {
      setIsCompareLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchInstitutions();
    fetchSavedItems();
    fetchComparisonItems();
  }, [fetchInstitutions, fetchSavedItems, fetchComparisonItems]);

  /**
   * Open institution detail modal (fetches full profile)
   */
  const handleOpenInstitutionDetail = async (inst: InstitutionSummary) => {
    try {
      const res = await CollegesService.getCollegeById(inst.id);
      if (res.success && res.data) {
        setSelectedInstitution(res.data);
        setIsDetailModalOpen(true);
      } else {
        showToast(
          res.error ? getErrorString(res.error) : 'Failed to load institution profile.',
          'error'
        );
      }
    } catch (_err) {
      showToast('Failed to load institution profile.', 'error');
    }
  };

  /**
   * Open single course detail modal
   */
  const handleOpenCourseDetail = (course: CourseSummary) => {
    setSelectedCourse(course);
    setIsCourseModalOpen(true);
  };

  /**
   * Toggle Save / Unsave Institution
   */
  const handleToggleSaveInstitution = async (inst: InstitutionSummary | InstitutionDetail) => {
    const isCurrentlySaved =
      inst.isSaved || savedInstitutions.some((saved) => saved.id === inst.id);

    try {
      if (isCurrentlySaved) {
        const res = await CollegesService.unsaveInstitution(inst.id);
        if (res.success) {
          showToast(`Removed ${inst.name} from your shortlist.`, 'info');
          setSavedInstitutions((prev) => prev.filter((item) => item.id !== inst.id));
          setInstitutions((prev) =>
            prev.map((item) => (item.id === inst.id ? { ...item, isSaved: false } : item))
          );
          if (selectedInstitution && selectedInstitution.id === inst.id) {
            setSelectedInstitution({ ...selectedInstitution, isSaved: false });
          }
        } else {
          showToast(res.error ? getErrorString(res.error) : 'Could not update shortlist.', 'error');
        }
      } else {
        const res = await CollegesService.saveInstitution(inst.id);
        if (res.success) {
          showToast(`Saved ${inst.name} to your shortlist.`, 'success');
          setInstitutions((prev) =>
            prev.map((item) => (item.id === inst.id ? { ...item, isSaved: true } : item))
          );
          if (selectedInstitution && selectedInstitution.id === inst.id) {
            setSelectedInstitution({ ...selectedInstitution, isSaved: true });
          }
          fetchSavedItems();
        } else {
          showToast(res.error ? getErrorString(res.error) : 'Could not save to shortlist.', 'error');
        }
      }
    } catch (_err) {
      showToast('Error updating institution shortlist.', 'error');
    }
  };

  /**
   * Toggle Save / Unsave Course
   */
  const handleToggleSaveCourse = async (course: CourseSummary) => {
    const isCurrentlySaved =
      course.isSaved || savedCourses.some((c) => c.id === course.id);

    try {
      if (isCurrentlySaved) {
        const res = await CollegesService.unsaveCourse(course.id);
        if (res.success) {
          showToast(`Removed program ${course.name} from shortlist.`, 'info');
          setSavedCourses((prev) => prev.filter((c) => c.id !== course.id));
          if (selectedCourse && selectedCourse.id === course.id) {
            setSelectedCourse({ ...selectedCourse, isSaved: false });
          }
        } else {
          showToast(res.error ? getErrorString(res.error) : 'Could not update saved programs.', 'error');
        }
      } else {
        const res = await CollegesService.saveCourse(course.id);
        if (res.success) {
          showToast(`Saved program ${course.name} to shortlist.`, 'success');
          if (selectedCourse && selectedCourse.id === course.id) {
            setSelectedCourse({ ...selectedCourse, isSaved: true });
          }
          fetchSavedItems();
        } else {
          showToast(res.error ? getErrorString(res.error) : 'Could not save program.', 'error');
        }
      }
    } catch (_err) {
      showToast('Error saving course.', 'error');
    }
  };

  /**
   * Toggle Compare Institution
   */
  const handleToggleCompareInstitution = async (inst: InstitutionSummary | InstitutionDetail) => {
    const isCurrentlyCompared =
      inst.isCompared || comparedInstitutions.some((comp) => comp.id === inst.id);

    try {
      if (isCurrentlyCompared) {
        const res = await CollegesService.removeFromComparison(inst.id);
        if (res.success) {
          showToast(`Removed ${inst.name} from comparison.`, 'info');
          setComparedInstitutions((prev) => prev.filter((c) => c.id !== inst.id));
          setInstitutions((prev) =>
            prev.map((item) => (item.id === inst.id ? { ...item, isCompared: false } : item))
          );
          if (selectedInstitution && selectedInstitution.id === inst.id) {
            setSelectedInstitution({ ...selectedInstitution, isCompared: false });
          }
        } else {
          showToast(res.error ? getErrorString(res.error) : 'Could not remove from comparison.', 'error');
        }
      } else {
        if (comparedInstitutions.length >= 4) {
          showToast('You can compare a maximum of 4 institutions simultaneously.', 'error');
          return;
        }
        const res = await CollegesService.addToComparison(inst.id);
        if (res.success) {
          showToast(`Added ${inst.name} to comparison matrix.`, 'success');
          setInstitutions((prev) =>
            prev.map((item) => (item.id === inst.id ? { ...item, isCompared: true } : item))
          );
          if (selectedInstitution && selectedInstitution.id === inst.id) {
            setSelectedInstitution({ ...selectedInstitution, isCompared: true });
          }
          fetchComparisonItems();
        } else {
          showToast(res.error ? getErrorString(res.error) : 'Could not add to comparison.', 'error');
        }
      }
    } catch (_err) {
      showToast('Error modifying comparison selection.', 'error');
    }
  };

  /**
   * Clear all institutions from comparison
   */
  const handleClearComparison = async () => {
    try {
      const res = await CollegesService.clearComparison();
      if (res.success) {
        showToast('Cleared all comparison selections.', 'info');
        setComparedInstitutions([]);
        setInstitutions((prev) => prev.map((item) => ({ ...item, isCompared: false })));
      } else {
        showToast(res.error ? getErrorString(res.error) : 'Could not clear comparison.', 'error');
      }
    } catch (_err) {
      showToast('Error clearing comparison items.', 'error');
    }
  };

  /**
   * Update search / filter partial
   */
  const handleFilterChange = (updated: Partial<CollegeSearchParams>) => {
    setCurrentFilters((prev) => ({
      ...prev,
      ...updated,
      page: 1,
    }));
  };

  /**
   * Clear all active filters
   */
  const handleClearAllFilters = () => {
    setCurrentFilters({
      search: '',
      country: 'ALL',
      city: 'ALL',
      department: 'ALL',
      specialization: 'ALL',
      level: 'ALL',
      minFee: undefined,
      maxFee: undefined,
      hasScholarship: undefined,
      entranceExam: 'ALL',
      sortBy: 'name_asc',
      page: 1,
      limit: 6,
    });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (currentFilters.country && currentFilters.country !== 'ALL') count++;
    if (currentFilters.city && currentFilters.city !== 'ALL') count++;
    if (currentFilters.department && currentFilters.department !== 'ALL') count++;
    if (currentFilters.specialization && currentFilters.specialization !== 'ALL') count++;
    if (currentFilters.level && currentFilters.level !== 'ALL') count++;
    if (currentFilters.minFee !== undefined || currentFilters.maxFee !== undefined) count++;
    if (currentFilters.hasScholarship) count++;
    if (currentFilters.entranceExam && currentFilters.entranceExam !== 'ALL') count++;
    return count;
  }, [currentFilters]);

  const hasActiveFilters =
    (currentFilters.search && currentFilters.search.trim() !== '') || activeFilterCount > 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
        maxWidth: '100%',
        width: '100%',
      }}
    >
      {/* Toast Notification Banner */}
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
              toastMessage.type === 'success'
                ? '#ECFDF5'
                : toastMessage.type === 'error'
                ? '#FEF2F2'
                : '#EEF2FF',
            color:
              toastMessage.type === 'success'
                ? '#065F46'
                : toastMessage.type === 'error'
                ? '#991B1B'
                : '#3730A3',
            border: `1px solid ${
              toastMessage.type === 'success'
                ? '#A7F3D0'
                : toastMessage.type === 'error'
                ? '#FECACA'
                : '#C7D2FE'
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
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.2rem',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
              marginLeft: '0.5rem',
            }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Hero Header Section */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          border: '1px solid #EAECF0',
          boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#5B4FE9',
                marginBottom: '0.35rem',
              }}
            >
              <Compass size={14} />
              Educational Catalogue & Program Guidance
            </div>
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#081426',
                margin: '0 0 0.35rem 0',
                letterSpacing: '-0.02em',
              }}
            >
              College & Course Discovery
            </h1>
            <p
              style={{
                fontSize: '0.9375rem',
                color: '#667085',
                margin: 0,
                maxWidth: '680px',
                lineHeight: 1.5,
              }}
            >
              Explore institutions and programs that align with your goals.
            </p>
          </div>

          {/* Primary View Switcher Navigation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#F8FAFC',
              padding: '0.35rem',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
            }}
          >
            <button
              onClick={() => setActiveTab('catalog')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: 'none',
                background: activeTab === 'catalog' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'catalog' ? '#081426' : '#64748B',
                boxShadow: activeTab === 'catalog' ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Building size={15} color={activeTab === 'catalog' ? '#5B4FE9' : '#64748B'} />
              <span>Institutions</span>
              <span
                style={{
                  padding: '0.1rem 0.45rem',
                  borderRadius: '10px',
                  background: activeTab === 'catalog' ? '#EEF2FF' : '#E2E8F0',
                  color: activeTab === 'catalog' ? '#4338CA' : '#64748B',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                }}
              >
                {pagination.total}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('saved');
                fetchSavedItems();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: 'none',
                background: activeTab === 'saved' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'saved' ? '#081426' : '#64748B',
                boxShadow: activeTab === 'saved' ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Bookmark size={15} color={activeTab === 'saved' ? '#5B4FE9' : '#64748B'} />
              <span>Shortlist</span>
              <span
                style={{
                  padding: '0.1rem 0.45rem',
                  borderRadius: '10px',
                  background: activeTab === 'saved' ? '#EEF2FF' : '#E2E8F0',
                  color: activeTab === 'saved' ? '#4338CA' : '#64748B',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                }}
              >
                {savedInstitutions.length + savedCourses.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('compare');
                fetchComparisonItems();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: 'none',
                background: activeTab === 'compare' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'compare' ? '#081426' : '#64748B',
                boxShadow: activeTab === 'compare' ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Scale size={15} color={activeTab === 'compare' ? '#5B4FE9' : '#64748B'} />
              <span>Compare</span>
              <span
                style={{
                  padding: '0.1rem 0.45rem',
                  borderRadius: '10px',
                  background: activeTab === 'compare' ? '#EEF2FF' : '#E2E8F0',
                  color: activeTab === 'compare' ? '#4338CA' : '#64748B',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                }}
              >
                {comparedInstitutions.length}/4
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW TAB 1: CATALOGUE EXPLORER */}
      {activeTab === 'catalog' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Prominent Search Bar */}
          <CollegeSearchBar
            searchQuery={currentFilters.search || ''}
            onSearchChange={(search) => handleFilterChange({ search })}
            onOpenMobileFilters={() => setIsMobileDrawerOpen(true)}
            sortBy={currentFilters.sortBy || 'name_asc'}
            onSortChange={(sortBy) => handleFilterChange({ sortBy })}
            activeFilterCount={activeFilterCount}
            onClearAllFilters={handleClearAllFilters}
          />

          {/* Main Layout: Filters Sidebar + Results Grid */}
          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              alignItems: 'flex-start',
              position: 'relative',
            }}
          >
            {/* Desktop Filters Sidebar (280px) & Mobile Drawer */}
            <CollegeFilterPanel
              filterOptions={filterOptions}
              currentFilters={currentFilters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearAllFilters}
              isMobileDrawerOpen={isMobileDrawerOpen}
              onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
            />

            {/* Results Area */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              {/* Results Control Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.875rem',
                  background: '#FFFFFF',
                  padding: '0.875rem 1.25rem',
                  borderRadius: '12px',
                  border: '1px solid #EAECF0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#081426' }}>
                    {pagination.total} Institutions Available
                  </span>
                  {hasActiveFilters && (
                    <span
                      style={{
                        fontSize: '0.8125rem',
                        color: '#5B4FE9',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginLeft: '0.5rem',
                      }}
                      onClick={handleClearAllFilters}
                    >
                      Clear All Filters
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#667085', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <ArrowUpDown size={14} /> Sort By:
                  </span>
                  <select
                    value={currentFilters.sortBy || 'name_asc'}
                    onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
                    style={{
                      padding: '0.4rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      background: '#FFFFFF',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: '#374151',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <option value="name_asc">Name (A — Z)</option>
                    <option value="name_desc">Name (Z — A)</option>
                    <option value="fee_asc">Tuition: Low to High</option>
                    <option value="fee_desc">Tuition: High to Low</option>
                  </select>
                </div>
              </div>

              {/* State 1: Loading State */}
              {isLoading && (
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '4rem 2rem',
                    textAlign: 'center',
                    border: '1px solid #EAECF0',
                    boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
                  }}
                >
                  <div
                    style={{
                      display: 'inline-block',
                      width: '42px',
                      height: '42px',
                      border: '3px solid #E0E7FF',
                      borderTopColor: '#5B4FE9',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                      marginBottom: '1.25rem',
                    }}
                  />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#081426', margin: '0 0 0.4rem 0' }}>
                    Finding institutions and programs...
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#667085', margin: 0 }}>
                    Searching the verified educational catalogue for institutions matching your parameters.
                  </p>
                </div>
              )}

              {/* State 2: Error State */}
              {!isLoading && errorMessage && (
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '3rem 2rem',
                    textAlign: 'center',
                    border: '1px solid #FEE2E2',
                    boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: '#FEF2F2',
                      color: '#DC2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.25rem auto',
                    }}
                  >
                    <AlertCircle size={28} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#991B1B', margin: '0 0 0.5rem 0' }}>
                    We couldn't load the college catalogue. Please try again.
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#667085', margin: '0 0 1.25rem 0', maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto' }}>
                    {errorMessage}
                  </p>
                  <button
                    onClick={fetchInstitutions}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.6rem 1.25rem',
                      borderRadius: '8px',
                      background: '#5B4FE9',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <RefreshCw size={15} />
                    Retry Search
                  </button>
                </div>
              )}

              {/* State 3: Empty Results (Filters Active) */}
              {!isLoading && !errorMessage && institutions.length === 0 && hasActiveFilters && (
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '3.5rem 2rem',
                    textAlign: 'center',
                    border: '1px solid #EAECF0',
                    boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '16px',
                      background: '#F1F5F9',
                      color: '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.25rem auto',
                    }}
                  >
                    <Search size={28} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#081426', margin: '0 0 0.5rem 0' }}>
                    No institutions match your current filters.
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#667085', margin: '0 0 1.5rem 0', maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
                    Try expanding your search query, adjusting your fee criteria, or clearing specific country and department filters.
                  </p>
                  <button
                    onClick={handleClearAllFilters}
                    style={{
                      padding: '0.65rem 1.25rem',
                      borderRadius: '8px',
                      background: '#5B4FE9',
                      color: '#FFFFFF',
                      border: 'none',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Clear All Filters
                  </button>
                </div>
              )}

              {/* State 4: Entire Catalogue Empty */}
              {!isLoading && !errorMessage && institutions.length === 0 && !hasActiveFilters && (
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '3.5rem 2rem',
                    textAlign: 'center',
                    border: '1px solid #EAECF0',
                    boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '16px',
                      background: '#EEF2FF',
                      color: '#5B4FE9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.25rem auto',
                    }}
                  >
                    <Building size={28} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#081426', margin: '0 0 0.5rem 0' }}>
                    College and course information is currently being prepared.
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#667085', margin: 0, maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
                    Our education content team is populating verified university and degree records. Please check back shortly.
                  </p>
                </div>
              )}

              {/* State 5: Institutions Grid */}
              {!isLoading && !errorMessage && institutions.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  {institutions.map((inst) => {
                    const isSaved =
                      inst.isSaved || savedInstitutions.some((saved) => saved.id === inst.id);
                    const isCompared =
                      inst.isCompared || comparedInstitutions.some((comp) => comp.id === inst.id);

                    return (
                      <InstitutionCard
                        key={inst.id}
                        institution={inst}
                        onViewDetails={handleOpenInstitutionDetail}
                        onToggleSave={handleToggleSaveInstitution}
                        onToggleCompare={handleToggleCompareInstitution}
                        isSaved={isSaved}
                        isCompared={isCompared}
                      />
                    );
                  })}
                </div>
              )}

              {/* Pagination Controls */}
              {!isLoading && !errorMessage && pagination.totalPages > 1 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginTop: '1.5rem',
                    padding: '1rem',
                  }}
                >
                  <button
                    onClick={() => handleFilterChange({ page: Math.max(1, (currentFilters.page || 1) - 1) })}
                    disabled={(currentFilters.page || 1) <= 1}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.5rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      background: '#FFFFFF',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: (currentFilters.page || 1) <= 1 ? '#9CA3AF' : '#374151',
                      cursor: (currentFilters.page || 1) <= 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => handleFilterChange({ page: p })}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        border: p === pagination.page ? '1px solid #5B4FE9' : '1px solid #D1D5DB',
                        background: p === pagination.page ? '#5B4FE9' : '#FFFFFF',
                        color: p === pagination.page ? '#FFFFFF' : '#374151',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      handleFilterChange({
                        page: Math.min(pagination.totalPages, (currentFilters.page || 1) + 1),
                      })
                    }
                    disabled={(currentFilters.page || 1) >= pagination.totalPages}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.5rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      background: '#FFFFFF',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color:
                        (currentFilters.page || 1) >= pagination.totalPages
                          ? '#9CA3AF'
                          : '#374151',
                      cursor:
                        (currentFilters.page || 1) >= pagination.totalPages
                          ? 'not-allowed'
                          : 'pointer',
                    }}
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW TAB 2: SAVED COLLEGES & COURSES */}
      {activeTab === 'saved' && (
        <SavedCollegesView
          savedInstitutions={savedInstitutions}
          savedCourses={savedCourses}
          isLoading={isSavedLoading}
          onUnsaveInstitution={(id) => {
            const inst = savedInstitutions.find((i) => i.id === id);
            if (inst) handleToggleSaveInstitution(inst);
          }}
          onUnsaveCourse={(id) => {
            const crs = savedCourses.find((c) => c.id === id);
            if (crs) handleToggleSaveCourse(crs);
          }}
          onSelectInstitution={handleOpenInstitutionDetail}
          onSelectCourse={handleOpenCourseDetail}
          onExploreCatalogue={() => setActiveTab('catalog')}
        />
      )}

      {/* VIEW TAB 3: COMPARE SELECTION */}
      {activeTab === 'compare' && (
        <CollegeCompareView
          institutions={comparedInstitutions}
          isLoading={isCompareLoading}
          onRemoveInstitution={(id) => {
            const inst = comparedInstitutions.find((i) => i.id === id);
            if (inst) handleToggleCompareInstitution(inst);
          }}
          onClearComparison={handleClearComparison}
          onSelectInstitution={handleOpenInstitutionDetail}
          onBrowseColleges={() => setActiveTab('catalog')}
        />
      )}

      {/* MODAL 1: INSTITUTION PROFILE MODAL */}
      {isDetailModalOpen && selectedInstitution && (
        <InstitutionDetailModal
          institution={selectedInstitution}
          onClose={() => setIsDetailModalOpen(false)}
          onSelectCourse={(course) => {
            handleOpenCourseDetail({
              ...course,
              institutionName: selectedInstitution.name,
              institutionCountry: selectedInstitution.country,
              institutionCity: selectedInstitution.city,
            });
          }}
          onToggleSave={handleToggleSaveInstitution}
          onToggleCompare={handleToggleCompareInstitution}
          isSaved={
            selectedInstitution.isSaved ||
            savedInstitutions.some((saved) => saved.id === selectedInstitution.id)
          }
          isCompared={
            selectedInstitution.isCompared ||
            comparedInstitutions.some((comp) => comp.id === selectedInstitution.id)
          }
        />
      )}

      {/* MODAL 2: COURSE DETAILS MODAL */}
      {isCourseModalOpen && selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          institutionName={selectedCourse.institutionName || selectedInstitution?.name}
          institutionWebsite={selectedInstitution?.officialWebsiteUrl}
          onClose={() => setIsCourseModalOpen(false)}
          onToggleSaveCourse={handleToggleSaveCourse}
          isCourseSaved={
            selectedCourse.isSaved ||
            savedCourses.some((c) => c.id === selectedCourse.id)
          }
          onCompareInstitution={
            selectedInstitution
              ? () => handleToggleCompareInstitution(selectedInstitution)
              : undefined
          }
          isInstitutionCompared={
            selectedInstitution
              ? selectedInstitution.isCompared ||
                comparedInstitutions.some((c) => c.id === selectedInstitution.id)
              : false
          }
        />
      )}
    </div>
  );
};
