import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  Award,
  Building,
  MapPin,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
  BookOpen,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { ScholarshipsService } from '../services/scholarships.service';
import {
  ScholarshipDto,
  ScholarshipListResponse,
  ScholarshipQueryFilters,
  StudentProfileContext,
} from '../scholarships.types';
import { ScholarshipDetailModal } from './ScholarshipDetailModal';
import '../scholarships.css';

export const ScholarshipDiscoveryView: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ScholarshipListResponse | null>(null);
  const [selectedScholarship, setSelectedScholarship] = useState<ScholarshipDto | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [countryFilter, setCountryFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [studyLevelFilter, setStudyLevelFilter] = useState<string>('');
  const [eligibilityFilter, setEligibilityFilter] = useState<
    'ALL' | 'ELIGIBLE' | 'POTENTIALLY_ELIGIBLE' | 'NOT_ELIGIBLE' | 'SAVED'
  >('ALL');

  // Load scholarships with filters
  const loadScholarships = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: ScholarshipQueryFilters = {
        search: searchTerm.trim() || undefined,
        country: countryFilter || undefined,
        department: departmentFilter || undefined,
        eligibilityStatus: eligibilityFilter,
        page: 1,
        limit: 50,
      };

      const res = await ScholarshipsService.listScholarships(filters);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        const errStr = typeof res.error === 'string' ? res.error : 'Failed to load scholarship records.';
        setError(errStr);
      }
    } catch (err: any) {
      setError(err?.message || 'Error communicating with scholarship service.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, countryFilter, departmentFilter, eligibilityFilter]);

  useEffect(() => {
    loadScholarships();
  }, [loadScholarships]);

  // Toggle save/shortlist
  const handleToggleSave = async (scholarshipId: string) => {
    try {
      setSavingId(scholarshipId);
      const res = await ScholarshipsService.toggleSaveScholarship(scholarshipId);
      if (res.success) {
        const isNowSaved = res.data?.isSaved;
        if (data) {
          const updatedList = data.scholarships.map((s) =>
            s.id === scholarshipId ? { ...s, isSaved: isNowSaved } : s
          );
          setData({
            ...data,
            scholarships: updatedList,
            counts: {
              ...data.counts,
              saved: isNowSaved
                ? data.counts.saved + 1
                : Math.max(0, data.counts.saved - 1),
            },
          });
        }
        if (selectedScholarship && selectedScholarship.id === scholarshipId) {
          setSelectedScholarship({
            ...selectedScholarship,
            isSaved: isNowSaved,
          });
        }
      }
    } catch (err: any) {
      console.error('Failed to toggle save scholarship:', err);
    } finally {
      setSavingId(null);
    }
  };

  const profileContext: StudentProfileContext | undefined = data?.studentProfileContext;
  const counts = data?.counts || {
    all: 0,
    eligible: 0,
    potentiallyEligible: 0,
    notEligible: 0,
    saved: 0,
  };

  // Filter scholarships by study level in frontend if specified
  const filteredScholarships = useMemo(() => {
    if (!data?.scholarships) return [];
    if (!studyLevelFilter) return data.scholarships;
    return data.scholarships.filter((s) => {
      if (!s.studyLevel) return true;
      if (s.studyLevel.toUpperCase() === 'ALL') return true;
      return s.studyLevel.toUpperCase() === studyLevelFilter.toUpperCase();
    });
  }, [data?.scholarships, studyLevelFilter]);

  // Distinct countries & departments from current catalogue for filters
  const uniqueCountries = useMemo(() => {
    const set = new Set<string>();
    (data?.scholarships || []).forEach((s) => {
      if (s.destinationCountry) set.add(s.destinationCountry);
      if (s.country) set.add(s.country);
    });
    return Array.from(set).sort();
  }, [data?.scholarships]);

  const uniqueDepartments = useMemo(() => {
    const set = new Set<string>();
    (data?.scholarships || []).forEach((s) => {
      if (s.department) set.add(s.department);
    });
    return Array.from(set).sort();
  }, [data?.scholarships]);

  // Helper: Format days remaining or deadline text
  const getDeadlineInfo = (deadlineStr?: string | null) => {
    if (!deadlineStr) return null;
    const deadlineDate = new Date(deadlineStr);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const formattedDate = deadlineDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return {
      formattedDate,
      diffDays,
      isUpcoming: diffDays > 0,
      isExpired: diffDays < 0,
      isUrgent: diffDays > 0 && diffDays <= 30,
    };
  };

  // Helper: Format currency and amount
  const formatAward = (amount?: number | null, currency?: string | null, type?: string | null) => {
    if (amount !== null && amount !== undefined) {
      const curr = currency || 'USD';
      if (curr === 'INR') {
        return `₹${amount.toLocaleString('en-IN')}`;
      } else if (curr === 'USD') {
        return `$${amount.toLocaleString('en-US')} USD`;
      } else if (curr === 'GBP') {
        return `£${amount.toLocaleString('en-GB')}`;
      } else if (curr === 'EUR') {
        return `€${amount.toLocaleString('en-EU')}`;
      }
      return `${curr} ${amount.toLocaleString()}`;
    }
    return type || 'Full / Partial Coverage';
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    Boolean(countryFilter) ||
    Boolean(departmentFilter) ||
    Boolean(studyLevelFilter) ||
    eligibilityFilter !== 'ALL';

  const handleResetFilters = () => {
    setSearchTerm('');
    setCountryFilter('');
    setDepartmentFilter('');
    setStudyLevelFilter('');
    setEligibilityFilter('ALL');
  };

  return (
    <div className="sch-container" id="module8-scholarship-discovery">
      {/* 1. HERO HEADER CARD */}
      <div className="sch-hero-card">
        <div className="sch-hero-top">
          <div className="sch-hero-text">
            <div className="sch-hero-badge">
              <Sparkles size={13} />
              <span>Official Global Catalogue</span>
            </div>
            <h1 className="sch-hero-title">
              <Award size={28} />
              Scholarship Discovery & Eligibility
            </h1>
            <p className="sch-hero-subtitle">
              Find verified funding opportunities that match your academic background, destination country, department, and demographic preferences. Every opportunity includes automated eligibility assessment against official provider benchmarks.
            </p>
          </div>

          <div className="sch-hero-actions">
            <button
              onClick={() => loadScholarships()}
              disabled={loading}
              className="sch-btn-refresh"
              title="Refresh catalogue & recalculate eligibility"
              id="scholarships-refresh-btn"
            >
              <RefreshCw size={15} className={loading ? 'sch-spinner' : ''} />
              <span>{loading ? 'Evaluating...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. VERIFIED PROFILE STRIP */}
      {profileContext && (
        <div className="sch-profile-strip" id="sch-profile-context-strip">
          <div className="sch-profile-left">
            <div className="sch-profile-icon">
              <ShieldCheck size={22} />
            </div>
            <div className="sch-profile-content">
              <div className="sch-profile-header-line">
                <span className="sch-profile-tag">Verified Profile Benchmark Reference</span>
                <span
                  className={`sch-profile-verified-badge ${
                    profileContext.isVerified ? 'verified' : 'pending'
                  }`}
                >
                  {profileContext.isVerified ? 'VERIFIED PROFILE' : 'PENDING VERIFICATION'}
                </span>
              </div>
              <p className="sch-profile-params">
                {profileContext.studentName || 'Student'} • Academic Score:{' '}
                <span className="highlight">
                  {profileContext.percentage !== null ? `${profileContext.percentage}%` : 'Not recorded'}
                </span>
                {profileContext.board && ` (${profileContext.board})`} • Target Destination:{' '}
                <span className="highlight">
                  {profileContext.primaryCountry || 'Global / United States'}
                </span>
                {profileContext.department && ` • ${profileContext.department}`}
              </p>
              <p className="sch-profile-note">
                Eligibility engine compares your verified high school marks, board, study destination, department, and demographic criteria against published provider cutoffs.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. SEARCH & CONTROLS CARD */}
      <div className="sch-controls-card">
        <div className="sch-filters-row">
          {/* Search Input */}
          <div className="sch-search-box">
            <Search size={16} className="sch-search-icon" />
            <input
              type="text"
              id="sch-search-input"
              placeholder="Search scholarships by name, official provider, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sch-search-input"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="sch-filter-select-group">
            {/* Country Filter */}
            <select
              id="sch-filter-country"
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="sch-filter-select"
            >
              <option value="">All Destinations</option>
              {uniqueCountries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Department Filter */}
            <select
              id="sch-filter-department"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="sch-filter-select"
            >
              <option value="">All Disciplines</option>
              {uniqueDepartments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Study Level Filter */}
            <select
              id="sch-filter-studylevel"
              value={studyLevelFilter}
              onChange={(e) => setStudyLevelFilter(e.target.value)}
              className="sch-filter-select"
            >
              <option value="">All Study Levels</option>
              <option value="UNDERGRADUATE">Undergraduate</option>
              <option value="POSTGRADUATE">Postgraduate</option>
            </select>
          </div>
        </div>

        {/* FUNCTIONAL ELIGIBILITY TABS */}
        <div className="sch-tabs-nav" id="sch-eligibility-tabs">
          <button
            onClick={() => setEligibilityFilter('ALL')}
            className={`sch-tab-pill ${
              eligibilityFilter === 'ALL' ? 'active-all' : ''
            }`}
            id="tab-sch-all"
          >
            <span>All Opportunities</span>
            <span className="sch-tab-count">{counts.all}</span>
          </button>

          <button
            onClick={() => setEligibilityFilter('ELIGIBLE')}
            className={`sch-tab-pill ${
              eligibilityFilter === 'ELIGIBLE' ? 'active-eligible' : ''
            }`}
            id="tab-sch-eligible"
          >
            <CheckCircle2 size={13} />
            <span>Eligible</span>
            <span className="sch-tab-count">{counts.eligible}</span>
          </button>

          <button
            onClick={() => setEligibilityFilter('POTENTIALLY_ELIGIBLE')}
            className={`sch-tab-pill ${
              eligibilityFilter === 'POTENTIALLY_ELIGIBLE' ? 'active-review' : ''
            }`}
            id="tab-sch-review"
          >
            <AlertTriangle size={13} />
            <span>Needs Review</span>
            <span className="sch-tab-count">{counts.potentiallyEligible}</span>
          </button>

          <button
            onClick={() => setEligibilityFilter('NOT_ELIGIBLE')}
            className={`sch-tab-pill ${
              eligibilityFilter === 'NOT_ELIGIBLE' ? 'active-not-eligible' : ''
            }`}
            id="tab-sch-not-eligible"
          >
            <XCircle size={13} />
            <span>Not Eligible</span>
            <span className="sch-tab-count">{counts.notEligible}</span>
          </button>

          <button
            onClick={() => setEligibilityFilter('SAVED')}
            className={`sch-tab-pill ${
              eligibilityFilter === 'SAVED' ? 'active-saved' : ''
            }`}
            id="tab-sch-saved"
          >
            <Bookmark size={13} />
            <span>Saved / Shortlisted</span>
            <span className="sch-tab-count">{counts.saved}</span>
          </button>
        </div>
      </div>

      {/* 4. RESULTS COUNT & ACTIVE FILTER BAR */}
      <div className="sch-results-bar">
        <span className="sch-results-count">
          Showing <b>{filteredScholarships.length}</b> verified funding{' '}
          {filteredScholarships.length === 1 ? 'opportunity' : 'opportunities'}
        </span>

        {hasActiveFilters && (
          <div className="sch-active-filters-chips">
            <button
              onClick={handleResetFilters}
              className="sch-chip-clear"
              id="sch-clear-filters-btn"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* 5. ERROR STATE */}
      {error && (
        <div className="sch-insight-box not-eligible" style={{ padding: '1rem 1.25rem' }}>
          <XCircle size={18} className="sch-insight-icon" />
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 700 }}>Service Error: </span>
            {error}
          </div>
          <button
            onClick={() => loadScholarships()}
            className="sch-btn-refresh"
            style={{ color: '#B91C1C', borderColor: '#FECACA', background: '#FFFFFF', padding: '0.35rem 0.85rem' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* 6. LOADING STATE */}
      {loading ? (
        <div className="sch-loading-card">
          <RefreshCw size={36} className="sch-spinner" />
          <h3 className="sch-loading-title">
            Evaluating scholarship eligibility against verified student profile...
          </h3>
          <p className="sch-empty-text">
            Comparing academic cutoffs, study destinations, eligible departments, and demographic criteria.
          </p>
        </div>
      ) : filteredScholarships.length === 0 ? (
        /* 7. HONEST EMPTY STATE */
        <div className="sch-empty-card" id="sch-empty-state">
          <div className="sch-empty-icon-wrap">
            <Award size={32} />
          </div>
          <h3 className="sch-empty-title">
            {counts.all === 0
              ? 'No scholarship records are currently available.'
              : 'No scholarships match your selected filter criteria.'}
          </h3>
          <p className="sch-empty-text">
            {counts.all === 0
              ? 'The official scholarship catalogue is currently empty. Authorized administrators populate official scholarship opportunities and verified eligibility rules. Check back soon or consult your assigned counsellor.'
              : 'Try selecting a different eligibility tab, clearing keyword searches, or adjusting country and department filters.'}
          </p>
          {hasActiveFilters && (
            <button onClick={handleResetFilters} className="sch-btn-reset">
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        /* 8. SCHOLARSHIP CARDS GRID */
        <div className="sch-grid" id="sch-cards-grid">
          {filteredScholarships.map((scholarship) => {
            const eligibility = scholarship.eligibility;
            const deadlineInfo = getDeadlineInfo(scholarship.applicationDeadline);

            return (
              <div
                key={scholarship.id}
                className="sch-card"
                id={`sch-card-${scholarship.id}`}
              >
                <div>
                  {/* Top Badges & Bookmark */}
                  <div className="sch-card-top">
                    <div className="sch-badges-cluster">
                      {eligibility && (
                        <span
                          className={`sch-status-badge ${
                            eligibility.status === 'ELIGIBLE'
                              ? 'eligible'
                              : eligibility.status === 'POTENTIALLY_ELIGIBLE'
                              ? 'review'
                              : 'not-eligible'
                          }`}
                        >
                          {eligibility.status === 'ELIGIBLE' ? (
                            <CheckCircle2 size={13} />
                          ) : eligibility.status === 'POTENTIALLY_ELIGIBLE' ? (
                            <AlertTriangle size={13} />
                          ) : (
                            <XCircle size={13} />
                          )}
                          <span>
                            {eligibility.status === 'ELIGIBLE'
                              ? 'Eligible'
                              : eligibility.status === 'POTENTIALLY_ELIGIBLE'
                              ? 'Needs Review'
                              : 'Not Eligible'}
                          </span>
                        </span>
                      )}

                      {scholarship.destinationCountry && (
                        <span className="sch-tag destination">
                          <MapPin size={11} />
                          <span>{scholarship.destinationCountry}</span>
                        </span>
                      )}

                      {scholarship.studyLevel && (
                        <span className="sch-tag">
                          <span>{scholarship.studyLevel}</span>
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleToggleSave(scholarship.id)}
                      disabled={savingId === scholarship.id}
                      className={`sch-btn-save ${scholarship.isSaved ? 'saved' : ''}`}
                      title={scholarship.isSaved ? 'Remove from Saved' : 'Save / Shortlist Scholarship'}
                      aria-label="Save scholarship"
                      id={`sch-save-btn-${scholarship.id}`}
                    >
                      <Bookmark
                        size={17}
                        className={scholarship.isSaved ? 'fill-amber-500' : ''}
                      />
                    </button>
                  </div>

                  {/* Title & Metadata */}
                  <div className="sch-card-body">
                    <h3
                      className="sch-card-title"
                      onClick={() => setSelectedScholarship(scholarship)}
                    >
                      {scholarship.name}
                    </h3>

                    <div className="sch-card-meta">
                      <span className="sch-card-meta-item" title="Official Provider">
                        <Building size={13} />
                        <b>{scholarship.provider}</b>
                      </span>

                      <span className="sch-card-meta-item">
                        <MapPin size={13} />
                        <span>{scholarship.country}</span>
                      </span>

                      {scholarship.department && (
                        <span className="sch-card-meta-item" style={{ color: '#5B4FE9' }}>
                          <BookOpen size={13} />
                          <span>{scholarship.department}</span>
                        </span>
                      )}
                    </div>

                    {/* Award Highlight Box */}
                    <div className="sch-award-box">
                      <div className="sch-award-left">
                        <div className="sch-award-icon">
                          <Award size={18} />
                        </div>
                        <div>
                          <div className="sch-award-amount">
                            {formatAward(
                              scholarship.awardAmount,
                              scholarship.awardCurrency,
                              scholarship.awardType
                            )}
                          </div>
                          <div className="sch-award-type">
                            {scholarship.awardType || scholarship.awardDetails}
                          </div>
                        </div>
                      </div>

                      {deadlineInfo && (
                        <div className="sch-award-deadline">
                          <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                            <Calendar size={11} style={{ display: 'inline', marginRight: 3 }} />
                            Deadline:
                          </span>
                          <span className="sch-award-deadline-date">
                            {deadlineInfo.formattedDate}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Eligibility Insight Explanation Callout */}
                    {eligibility && (
                      <div
                        className={`sch-insight-box ${
                          eligibility.status === 'ELIGIBLE'
                            ? 'eligible'
                            : eligibility.status === 'POTENTIALLY_ELIGIBLE'
                            ? 'review'
                            : 'not-eligible'
                        }`}
                      >
                        {eligibility.status === 'ELIGIBLE' ? (
                          <CheckCircle2 size={15} className="sch-insight-icon" />
                        ) : eligibility.status === 'POTENTIALLY_ELIGIBLE' ? (
                          <AlertTriangle size={15} className="sch-insight-icon" />
                        ) : (
                          <XCircle size={15} className="sch-insight-icon" />
                        )}
                        <div>
                          <b>Eligibility Insight: </b>
                          <span>{eligibility.summary}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="sch-card-footer">
                  <button
                    onClick={() => setSelectedScholarship(scholarship)}
                    className="sch-btn-details"
                    id={`sch-view-details-btn-${scholarship.id}`}
                  >
                    <span>View Details & Evidence</span>
                    <ChevronRight size={14} />
                  </button>

                  {scholarship.applicationUrl && (
                    <a
                      href={scholarship.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sch-btn-portal"
                      id={`sch-portal-link-${scholarship.id}`}
                    >
                      <span>Official Portal</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 9. SCHOLARSHIP DETAIL MODAL */}
      {selectedScholarship && (
        <ScholarshipDetailModal
          scholarship={selectedScholarship}
          onClose={() => setSelectedScholarship(null)}
          onToggleSave={handleToggleSave}
          isSaving={savingId === selectedScholarship.id}
        />
      )}
    </div>
  );
};
