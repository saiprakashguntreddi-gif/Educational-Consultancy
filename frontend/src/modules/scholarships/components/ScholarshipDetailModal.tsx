import React from 'react';
import {
  X,
  Building,
  MapPin,
  Calendar,
  Award,
  ExternalLink,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Bookmark,
  ShieldCheck,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { ScholarshipDto, EligibilityCriterionCheck } from '../scholarships.types';

interface ScholarshipDetailModalProps {
  scholarship: ScholarshipDto | null;
  onClose: () => void;
  onToggleSave?: (scholarshipId: string) => void;
  isSaving?: boolean;
}

export const ScholarshipDetailModal: React.FC<ScholarshipDetailModalProps> = ({
  scholarship,
  onClose,
  onToggleSave,
  isSaving,
}) => {
  if (!scholarship) return null;

  const eligibility = scholarship.eligibility;

  const renderStatusBadge = () => {
    if (!eligibility) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <Info size={14} /> Catalog Record
        </span>
      );
    }

    switch (eligibility.status) {
      case 'ELIGIBLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 size={15} /> Eligible
          </span>
        );
      case 'POTENTIALLY_ELIGIBLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertTriangle size={15} /> Potentially Eligible / Needs Review
          </span>
        );
      case 'NOT_ELIGIBLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <XCircle size={15} /> Not Eligible
          </span>
        );
    }
  };

  const renderCriterionIcon = (check: EligibilityCriterionCheck) => {
    switch (check.status) {
      case 'MET':
        return <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case 'NOT_MET':
        return <XCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0" />;
      case 'NEEDS_REVIEW':
        return <HelpCircle size={16} className="text-amber-500 dark:text-amber-400 shrink-0" />;
      default:
        return <Info size={16} className="text-slate-400 dark:text-slate-500 shrink-0" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              {renderStatusBadge()}
              {scholarship.destinationCountry && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Destination: {scholarship.destinationCountry}
                </span>
              )}
              {scholarship.department && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {scholarship.department}
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              {scholarship.name}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-slate-600 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Building size={15} className="text-indigo-500" />
                {scholarship.provider}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={15} className="text-slate-400" />
                {scholarship.country}
              </span>
              {scholarship.institution && (
                <span className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium">
                  {scholarship.institution.name}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Facts Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 dark:text-indigo-400 mb-1">
                <Award size={15} /> Award / Benefit
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">
                {scholarship.awardAmount
                  ? `${scholarship.awardCurrency || 'USD'} ${scholarship.awardAmount.toLocaleString()}`
                  : scholarship.awardType || 'Award Value'}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-1">
                {scholarship.awardType || 'Verified Financial Aid'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <Calendar size={15} /> Application Deadline
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {scholarship.applicationDeadline
                  ? new Date(scholarship.applicationDeadline).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Rolling / Not Fixed'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {scholarship.applicationDeadline ? 'Official closing date' : 'Check provider portal'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <ShieldCheck size={15} /> Academic Benchmark
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {scholarship.minPercentageRequirement !== null && scholarship.minPercentageRequirement !== undefined
                  ? `Min. ${scholarship.minPercentageRequirement}%`
                  : 'Holistic Review'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {scholarship.eligibleBoards && scholarship.eligibleBoards.length > 0
                  ? `Boards: ${scholarship.eligibleBoards.join(', ')}`
                  : 'All recognized boards'}
              </div>
            </div>
          </div>

          {/* Eligibility Explanation Card */}
          {eligibility && (
            <div
              className={`p-5 rounded-2xl border ${
                eligibility.status === 'ELIGIBLE'
                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                  : eligibility.status === 'POTENTIALLY_ELIGIBLE'
                  ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'
                  : 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {eligibility.status === 'ELIGIBLE' ? (
                    <CheckCircle2 size={22} className="text-emerald-600 dark:text-emerald-400" />
                  ) : eligibility.status === 'POTENTIALLY_ELIGIBLE' ? (
                    <AlertTriangle size={22} className="text-amber-600 dark:text-amber-400" />
                  ) : (
                    <XCircle size={22} className="text-rose-600 dark:text-rose-400" />
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Eligibility Analysis
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {eligibility.summary}
                  </p>
                </div>
              </div>

              {/* Criterion Breakdown Checklist */}
              {eligibility.checks && eligibility.checks.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800 space-y-2.5">
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Criteria Checklist & Stored Evidence
                  </h4>
                  <div className="space-y-2">
                    {eligibility.checks.map((check, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2.5 text-xs p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800"
                      >
                        {renderCriterionIcon(check)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {check.label}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                check.status === 'MET'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : check.status === 'NOT_MET'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : check.status === 'NEEDS_REVIEW'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              {check.status === 'NEEDS_REVIEW' ? 'Needs Review' : check.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                            {check.detail}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Description & Award Details */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Award Overview & Coverage
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                {scholarship.awardDetails}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Eligibility Guidelines
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                {scholarship.eligibilityDescription}
              </p>
            </div>

            {/* Source Reference & Verification Note */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
              <ShieldCheck size={16} className="text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Data Source & Integrity:
                </span>{' '}
                {scholarship.sourceInfo ||
                  'Verified official scholarship catalogue record maintained by platform administrators.'}{' '}
                Eligibility assessments are calculated using verified student profile intake records and do not guarantee final award by provider.
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onToggleSave && (
              <button
                onClick={() => onToggleSave(scholarship.id)}
                disabled={isSaving}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition border ${
                  scholarship.isSaved
                    ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800 hover:bg-amber-100'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <Bookmark
                  size={15}
                  className={scholarship.isSaved ? 'fill-amber-500 text-amber-500' : ''}
                />
                {scholarship.isSaved ? 'Saved to Shortlist' : 'Save Scholarship'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Close
            </button>

            {scholarship.applicationUrl && (
              <a
                href={scholarship.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm"
              >
                Apply on Official Portal <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
