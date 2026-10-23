import React, { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
import { ScholarshipsService } from '../services/scholarships.service';
import {
  ScholarshipDto,
  ScholarshipListResponse,
  ScholarshipQueryFilters,
  StudentProfileContext,
} from '../scholarships.types';
import { ScholarshipDetailModal } from './ScholarshipDetailModal';

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
        const errStr = typeof res.error === 'string' ? res.error : 'Failed to load scholarships';
        setError(errStr);
      }
    } catch (err: any) {
      setError(err?.message || 'Error communicating with scholarship service');
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
        // Update local state
        if (data) {
          const updatedList = data.scholarships.map((s) =>
            s.id === scholarshipId ? { ...s, isSaved: res.data?.isSaved ?? !s.isSaved } : s
          );
          setData({
            ...data,
            scholarships: updatedList,
            counts: {
              ...data.counts,
              saved: res.data?.isSaved
                ? data.counts.saved + 1
                : Math.max(0, data.counts.saved - 1),
            },
          });
        }
        if (selectedScholarship && selectedScholarship.id === scholarshipId) {
          setSelectedScholarship({
            ...selectedScholarship,
            isSaved: res.data?.isSaved ?? !selectedScholarship.isSaved,
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

  // Distinct countries & departments from current catalogue for filters
  const uniqueCountries = Array.from(
    new Set(
      (data?.scholarships || [])
        .map((s) => s.destinationCountry || s.country)
        .filter(Boolean) as string[]
    )
  ).sort();

  const uniqueDepartments = Array.from(
    new Set(
      (data?.scholarships || [])
        .map((s) => s.department)
        .filter(Boolean) as string[]
    )
  ).sort();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Award className="text-indigo-600 dark:text-indigo-400" size={28} />
            Scholarship Discovery & Eligibility
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Discover verified scholarships tailored to your academic profile and study goals. Each opportunity is evaluated using verified student credentials.
          </p>
        </div>

        <button
          onClick={() => loadScholarships()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm self-start md:self-auto"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin text-indigo-600' : ''} />
          Refresh
        </button>
      </div>

      {/* Verified Profile Context Banner */}
      {profileContext && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-purple-50/50 to-blue-50/80 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-blue-950/40 border border-indigo-100 dark:border-indigo-900/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm mt-0.5">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  Verified Profile Reference
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${profileContext.isVerified
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                >
                  {profileContext.isVerified ? 'VERIFIED' : 'PENDING VERIFICATION'}
                </span>
              </div>
              <p className="text-xs md:text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                {profileContext.studentName || 'Student'} • Academic Score:{' '}
                <span className="text-indigo-600 dark:text-indigo-400">
                  {profileContext.percentage !== null ? `${profileContext.percentage}%` : 'Not recorded'}
                </span>
                {profileContext.board && ` (${profileContext.board})`} • Target:{' '}
                <span className="text-slate-700 dark:text-slate-300">
                  {profileContext.primaryCountry || 'Global'}
                </span>
                {profileContext.department && ` • ${profileContext.department}`}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Eligibility engine compares your verified academic performance, board, and study preferences against official catalogue benchmarks.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search scholarships by name, provider, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          {/* Country Filter */}
          <div className="w-full md:w-52">
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            >
              <option value="">All Countries</option>
              {uniqueCountries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="w-full md:w-56">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            >
              <option value="">All Departments</option>
              {uniqueDepartments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Eligibility Status Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setEligibilityFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${eligibilityFilter === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
          >
            All Opportunities <span className="opacity-75">({counts.all})</span>
          </button>

          <button
            onClick={() => setEligibilityFilter('ELIGIBLE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${eligibilityFilter === 'ELIGIBLE'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100'
              }`}
          >
            <CheckCircle2 size={13} /> Eligible <span className="opacity-75">({counts.eligible})</span>
          </button>

          <button
            onClick={() => setEligibilityFilter('POTENTIALLY_ELIGIBLE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${eligibilityFilter === 'POTENTIALLY_ELIGIBLE'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100'
              }`}
          >
            <AlertTriangle size={13} /> Needs Review <span className="opacity-75">({counts.potentiallyEligible})</span>
          </button>

          <button
            onClick={() => setEligibilityFilter('NOT_ELIGIBLE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${eligibilityFilter === 'NOT_ELIGIBLE'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100'
              }`}
          >
            <XCircle size={13} /> Not Eligible <span className="opacity-75">({counts.notEligible})</span>
          </button>

          <button
            onClick={() => setEligibilityFilter('SAVED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${eligibilityFilter === 'SAVED'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100'
              }`}
          >
            <Bookmark size={13} /> Saved / Shortlisted <span className="opacity-75">({counts.saved})</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-3">
          <XCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <RefreshCw size={28} className="animate-spin text-indigo-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Evaluating scholarship eligibility against verified student profile...
          </p>
        </div>
      ) : !data || data.scholarships.length === 0 ? (
        /* Empty State */
        <div className="p-10 md:p-14 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
            <Award size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              {counts.all === 0
                ? 'No scholarship records are currently available.'
                : 'No scholarships match your selected filter criteria.'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
              {counts.all === 0
                ? 'The official scholarship catalogue is currently empty. Authorized administrators populate official scholarship opportunities and verified eligibility rules. Check back soon or consult your assigned counsellor.'
                : 'Try clearing the search filters or switching eligibility tabs to view other scholarship opportunities.'}
            </p>
          </div>

          {counts.all > 0 && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCountryFilter('');
                setDepartmentFilter('');
                setEligibilityFilter('ALL');
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        /* Scholarship Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.scholarships.map((scholarship) => {
            const eligibility = scholarship.eligibility;

            return (
              <div
                key={scholarship.id}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
              >
                <div className="space-y-3.5">
                  {/* Top Bar: Badges & Bookmark */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {eligibility && (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${eligibility.status === 'ELIGIBLE'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : eligibility.status === 'POTENTIALLY_ELIGIBLE'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            }`}
                        >
                          {eligibility.status === 'ELIGIBLE' ? (
                            <CheckCircle2 size={13} />
                          ) : eligibility.status === 'POTENTIALLY_ELIGIBLE' ? (
                            <AlertTriangle size={13} />
                          ) : (
                            <XCircle size={13} />
                          )}
                          {eligibility.status === 'ELIGIBLE'
                            ? 'Eligible'
                            : eligibility.status === 'POTENTIALLY_ELIGIBLE'
                              ? 'Needs Review'
                              : 'Not Eligible'}
                        </span>
                      )}

                      {scholarship.destinationCountry && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                          {scholarship.destinationCountry}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleToggleSave(scholarship.id)}
                      disabled={savingId === scholarship.id}
                      className={`p-2 rounded-xl transition ${scholarship.isSaved
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      aria-label="Bookmark scholarship"
                    >
                      <Bookmark
                        size={17}
                        className={scholarship.isSaved ? 'fill-amber-500 text-amber-500' : ''}
                      />
                    </button>
                  </div>

                  {/* Title & Provider */}
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition leading-snug">
                      {scholarship.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mt-1">
                      <span className="inline-flex items-center gap-1 font-medium">
                        <Building size={13} className="text-slate-400" />
                        {scholarship.provider}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={13} className="text-slate-400" />
                        {scholarship.country}
                      </span>
                      {scholarship.department && (
                        <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400">
                          <BookOpen size={13} />
                          {scholarship.department}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Award Value Banner */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Award size={16} className="text-indigo-600 dark:text-indigo-400" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {scholarship.awardAmount
                            ? `${scholarship.awardCurrency || 'USD'} ${scholarship.awardAmount.toLocaleString()}`
                            : scholarship.awardType || 'Award Value'}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {scholarship.awardType || scholarship.awardDetails}
                        </div>
                      </div>
                    </div>

                    {scholarship.applicationDeadline && (
                      <div className="text-right text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Deadline:
                        </span>{' '}
                        {new Date(scholarship.applicationDeadline).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    )}
                  </div>

                  {/* Personalized Explanation Box */}
                  {eligibility && (
                    <div
                      className={`p-3 rounded-xl text-xs border ${eligibility.status === 'ELIGIBLE'
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40'
                          : eligibility.status === 'POTENTIALLY_ELIGIBLE'
                            ? 'bg-amber-50/40 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/40'
                            : 'bg-rose-50/40 dark:bg-rose-950/20 text-rose-900 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/40'
                        }`}
                    >
                      <span className="font-bold">Eligibility Insight:</span>{' '}
                      {eligibility.summary}
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedScholarship(scholarship)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
                  >
                    View Details & Evidence <ChevronRight size={14} />
                  </button>

                  {scholarship.applicationUrl && (
                    <a
                      href={scholarship.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
                    >
                      Portal <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
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
