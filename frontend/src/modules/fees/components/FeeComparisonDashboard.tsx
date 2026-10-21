import React, { useState, useEffect } from 'react';
import { FeesService } from '../services/fees.service';
import {
  CountryTierSummary,
  InstitutionTier,
  FeesMetadata,
  CourseFeeCalculationResult,
} from '../fees.types';
import { ViewCollegesModal } from './ViewCollegesModal';
import { CountryComparisonView } from './CountryComparisonView';
import '../fees.css';
import {
  Search,
  Scale,
  GraduationCap,
  Home,
  ShieldAlert,
  Plane,
  BookOpen,
  DollarSign,
  Sparkles,
  BookmarkCheck,
  Check,
  AlertCircle,
  Info,
  RefreshCw,
} from 'lucide-react';

interface FeeComparisonDashboardProps {
  onBackToDashboard?: () => void;
  initialCountry?: string;
  initialDepartment?: string;
}

export const FeeComparisonDashboard: React.FC<FeeComparisonDashboardProps> = ({
  initialCountry = 'United States',
  initialDepartment = 'Engineering & Technology',
}) => {
  // Metadata state
  const [metadata, setMetadata] = useState<FeesMetadata | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');

  // Search filter states
  const [countrySearch, setCountrySearch] = useState<string>('');
  const [departmentSearch, setDepartmentSearch] = useState<string>('');

  // Selected filters
  const [selectedCountry, setSelectedCountry] = useState<string>(initialCountry);
  const [selectedDepartment, setSelectedDepartment] = useState<string>(initialDepartment);

  // View mode: 'EXPLORE_CALCULATOR' | 'COMPARE_COUNTRIES'
  const [viewMode, setViewMode] = useState<'EXPLORE_CALCULATOR' | 'COMPARE_COUNTRIES'>('EXPLORE_CALCULATOR');

  // Tier Summary state (the 3 cards)
  const [tierSummary, setTierSummary] = useState<CountryTierSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(true);

  // View Colleges Modal state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTier, setModalTier] = useState<InstitutionTier>('TOP_RANKED');

  // Course Fee Calculator Form states
  const [calcCountry, setCalcCountry] = useState<string>(initialCountry);
  const [calcDepartment, setCalcDepartment] = useState<string>(initialDepartment);
  const [calcCourse, setCalcCourse] = useState<string>('B.S. in Mechanical Engineering');
  const [calcTier, setCalcTier] = useState<InstitutionTier>('TOP_RANKED');
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [calcResult, setCalcResult] = useState<CourseFeeCalculationResult | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);

  // Budget Decision save status
  const [budgetSaveStatus, setBudgetSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Load Metadata
  useEffect(() => {
    FeesService.getMetadata()
      .then((res) => {
        if (res.success && res.data) {
          setMetadata(res.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load fees metadata', err);
      });
  }, []);

  // Sync calcCourse whenever calcDepartment changes
  useEffect(() => {
    if (metadata) {
      const dept = metadata.departments.find((d) => d.name === calcDepartment);
      if (dept && dept.sampleCourses.length > 0) {
        setCalcCourse(dept.sampleCourses[0]);
      }
    }
  }, [calcDepartment, metadata]);

  // Load Tier Summary whenever selectedCountry, selectedDepartment, or selectedCurrency changes
  useEffect(() => {
    let isMounted = true;
    setLoadingSummary(true);

    FeesService.getTierSummary(selectedCountry, selectedDepartment, selectedCurrency)
      .then((res) => {
        if (isMounted && res.success && res.data) {
          setTierSummary(res.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load tier summary', err);
      })
      .finally(() => {
        if (isMounted) setLoadingSummary(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCountry, selectedDepartment, selectedCurrency]);

  // Keep calculator inputs synchronized when user picks a country/department from left sidebar
  const handleSelectCountry = (countryName: string) => {
    setSelectedCountry(countryName);
    setCalcCountry(countryName);
  };

  const handleSelectDepartment = (deptName: string) => {
    setSelectedDepartment(deptName);
    setCalcDepartment(deptName);
  };

  // Get active currency symbol
  const activeCurrencyRate = metadata?.currencies.find((c) => c.code === selectedCurrency);
  const currencySymbol = activeCurrencyRate?.symbol || '$';

  // Open "View Colleges" Modal
  const handleOpenCollegesModal = (tier: InstitutionTier) => {
    setModalTier(tier);
    setModalOpen(true);
  };

  // Handle Form Submit
  const handleCalculateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    setCalcError(null);
    setBudgetSaveStatus('idle');

    try {
      const res = await FeesService.calculate({
        country: calcCountry,
        department: calcDepartment,
        course: calcCourse,
        tier: calcTier,
        currency: selectedCurrency,
      });

      if (res.success && res.data) {
        setCalcResult(res.data);
        // Smooth scroll down to results
        setTimeout(() => {
          const el = document.getElementById('calc-results-anchor');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        setCalcError(res.error?.toString() || 'Calculation could not be performed');
      }
    } catch (err: any) {
      setCalcError(err.message || 'Network error occurred while calculating');
    } finally {
      setIsCalculating(false);
    }
  };

  // Handle Save Budget Decision
  const handleSaveBudget = async () => {
    if (!calcResult) return;
    setBudgetSaveStatus('saving');
    try {
      await FeesService.saveBudgetDecision({
        country: calcResult.input.country,
        department: calcResult.input.department,
        course: calcResult.input.course,
        tier: calcResult.input.tier,
        selectedCurrency: calcResult.breakdown.currency,
        estimatedTotal: calcResult.breakdown.totalEstimatedCost,
        notes: `Estimated ${calcResult.input.course} at ${calcResult.input.tier} in ${calcResult.input.country}`,
      });
      setBudgetSaveStatus('saved');
    } catch {
      setBudgetSaveStatus('idle');
    }
  };

  // Filter countries and departments by search terms
  const filteredCountries = (metadata?.countries || []).filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filteredDepartments = (metadata?.departments || []).filter((d) =>
    d.name.toLowerCase().includes(departmentSearch.toLowerCase())
  );

  return (
    <div className="fees-module-root" id="fees-module-top">
      {/* 1. Header Bar with Currency Selector */}
      <div className="fees-header-bar">
        <div className="fees-title-group">
          <h1>Fee Calculator & Country Comparison</h1>
          <p>
            Compare university tuition and comprehensive living expenses across countries, course tracks, and institution tiers.
          </p>
        </div>

        <div className="fees-header-actions">
          {/* Currency Switcher */}
          <div className="currency-select-wrap">
            <span>Currency:</span>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="currency-select"
              id="fees-currency-selector"
              aria-label="Select display currency"
            >
              {metadata?.currencies.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.code} ({curr.symbol}) — {curr.name}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle between Single Explorer and Comparison Table */}
          <button
            onClick={() =>
              setViewMode(
                viewMode === 'EXPLORE_CALCULATOR'
                  ? 'COMPARE_COUNTRIES'
                  : 'EXPLORE_CALCULATOR'
              )
            }
            className={`mode-toggle-btn ${viewMode === 'COMPARE_COUNTRIES' ? 'active' : ''}`}
            id="fees-toggle-compare-mode"
            style={{ width: 'auto', padding: '0.45rem 0.9rem' }}
          >
            <Scale size={16} />
            <span>
              {viewMode === 'EXPLORE_CALCULATOR'
                ? 'Compare Countries Side-by-Side'
                : 'Return to Single Country Calculator'}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Reference Benchmark & Disclaimer Banner */}
      <div className="fees-benchmark-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Info size={16} color="#7cb342" />
          <span>
            <strong>Reference Exchange Benchmark:</strong> {metadata?.referenceDate || 'October 2026 Reference Benchmark'} • Base conversion rate: 1 USD = {activeCurrencyRate?.ratePerUSD} {selectedCurrency}
          </span>
        </div>
        <div className="fees-demo-tag">
          <Sparkles size={11} /> Planning Model • Indicative Estimates
        </div>
      </div>

      {/* 3. Main Two-Column Layout */}
      <div className="fees-main-grid">
        {/* LEFT COLUMN: Filters (Country & Department) */}
        <aside className="fees-sidebar-card">
          {/* Country Filter */}
          <div className="filter-section">
            <div className="filter-header-title">
              <span>Country</span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>
                {filteredCountries.length} available
              </span>
            </div>

            <div className="filter-search-box">
              <input
                type="text"
                placeholder="Search country..."
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                className="filter-search-input"
                id="fees-country-search-input"
              />
              <Search size={14} className="filter-search-icon" />
            </div>

            <div className="filter-scroll-list" id="fees-country-list">
              {filteredCountries.map((c) => {
                const isSelected = selectedCountry.toLowerCase() === c.name.toLowerCase();
                return (
                  <div
                    key={c.code}
                    className={`filter-list-item ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectCountry(c.name)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectCountry(c.name)}
                      className="filter-checkbox"
                      id={`chk-country-${c.code}`}
                    />
                    <span style={{ fontSize: '1rem', lineHeight: 1 }}>{c.flag}</span>
                    <span>{c.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Department Filter */}
          <div className="filter-section">
            <div className="filter-header-title">
              <span>Department</span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>
                {filteredDepartments.length} available
              </span>
            </div>

            <div className="filter-search-box">
              <input
                type="text"
                placeholder="Search department..."
                value={departmentSearch}
                onChange={(e) => setDepartmentSearch(e.target.value)}
                className="filter-search-input"
                id="fees-dept-search-input"
              />
              <Search size={14} className="filter-search-icon" />
            </div>

            <div className="filter-scroll-list" id="fees-department-list">
              {filteredDepartments.map((d) => {
                const isSelected = selectedDepartment.toLowerCase() === d.name.toLowerCase();
                return (
                  <div
                    key={d.name}
                    className={`filter-list-item ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectDepartment(d.name)}
                  >
                    <input
                      type="radio"
                      name="dept-filter-radio"
                      checked={isSelected}
                      onChange={() => handleSelectDepartment(d.name)}
                      className="filter-radio"
                      id={`rad-dept-${d.name.replace(/\s+/g, '-').toLowerCase()}`}
                    />
                    <span>{d.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* View Mode Sidebar Toggle */}
          <div className="mode-toggle-wrap">
            <button
              onClick={() =>
                setViewMode(
                  viewMode === 'EXPLORE_CALCULATOR'
                    ? 'COMPARE_COUNTRIES'
                    : 'EXPLORE_CALCULATOR'
                )
              }
              className={`mode-toggle-btn ${viewMode === 'COMPARE_COUNTRIES' ? 'active' : ''}`}
            >
              <Scale size={16} />
              <span>
                {viewMode === 'EXPLORE_CALCULATOR'
                  ? 'Switch to Multi-Country Compare'
                  : 'Back to Calculator'}
              </span>
            </button>
          </div>
        </aside>

        {/* RIGHT COLUMN: Cards, Calculator or Multi-Country Comparison */}
        <main className="fees-content-area">
          {viewMode === 'COMPARE_COUNTRIES' ? (
            <CountryComparisonView
              selectedCountries={[selectedCountry, 'United Kingdom', 'Canada', 'Germany']}
              allCountries={metadata?.countries || []}
              department={selectedDepartment}
              tier={calcTier}
              currency={selectedCurrency}
              currencySymbol={currencySymbol}
              onSelectCountry={(countryName) => {
                setSelectedCountry(countryName);
                setCalcCountry(countryName);
                setViewMode('EXPLORE_CALCULATOR');
              }}
            />
          ) : (
            <>
              {/* Selected Country Flag & Heading */}
              <div className="fees-country-heading">
                <span className="country-flag-icon">{tierSummary?.flag || '🇺🇸'}</span>
                <span>{tierSummary?.country || selectedCountry}</span>
                {selectedDepartment && selectedDepartment !== 'All Departments' && (
                  <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500, marginLeft: '0.25rem' }}>
                    • {selectedDepartment}
                  </span>
                )}
              </div>

              {/* THREE CARDS ROW: Matching PDF Screenshot */}
              {loadingSummary ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      border: '3px solid #e2e8f0',
                      borderTopColor: '#7cb342',
                      borderRadius: '50%',
                      margin: '0 auto 0.75rem',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  <span>Updating fee estimates for {selectedCountry}...</span>
                </div>
              ) : (
                <div className="tier-cards-row">
                  {/* Card 1: Top Ranked Colleges */}
                  <div className="tier-card" id="card-top-ranked-colleges">
                    <div className="tier-card-header">
                      <h3 className="tier-card-title">Top Ranked Colleges</h3>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Tier 1</span>
                    </div>

                    <div className="tier-stat-block">
                      <div className="tier-stat-label">Avg Fees/Year</div>
                      <div className="tier-stat-value avg">
                        {currencySymbol} {tierSummary?.tiers.topRanked.avgFeesPerYear.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="tier-stat-block">
                      <div className="tier-stat-label">Highest Fees</div>
                      <div className="tier-stat-value high">
                        {currencySymbol} {tierSummary?.tiers.topRanked.highestFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="tier-stat-block">
                      <div className="tier-stat-label">Lowest Fees</div>
                      <div className="tier-stat-value low">
                        {currencySymbol} {tierSummary?.tiers.topRanked.lowestFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    <button
                      className="btn-green-action"
                      id="btn-view-colleges-top-ranked"
                      onClick={() => handleOpenCollegesModal('TOP_RANKED')}
                    >
                      View Colleges
                    </button>
                  </div>

                  {/* Card 2: Mid Level Colleges */}
                  <div className="tier-card" id="card-mid-level-colleges">
                    <div className="tier-card-header">
                      <h3 className="tier-card-title">Mid Level Colleges</h3>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Tier 2</span>
                    </div>

                    <div className="tier-stat-block">
                      <div className="tier-stat-label">Avg Fees/Year</div>
                      <div className="tier-stat-value avg">
                        {currencySymbol} {tierSummary?.tiers.midLevel.avgFeesPerYear.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="tier-stat-block">
                      <div className="tier-stat-label">Highest Fees</div>
                      <div className="tier-stat-value high">
                        {currencySymbol} {tierSummary?.tiers.midLevel.highestFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="tier-stat-block">
                      <div className="tier-stat-label">Lowest Fees</div>
                      <div className="tier-stat-value low">
                        {currencySymbol} {tierSummary?.tiers.midLevel.lowestFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    <button
                      className="btn-green-action"
                      id="btn-view-colleges-mid-level"
                      onClick={() => handleOpenCollegesModal('MID_LEVEL')}
                    >
                      View Colleges
                    </button>
                  </div>

                  {/* Card 3: Emerging Institutes */}
                  <div className="tier-card" id="card-emerging-institutes">
                    <div className="tier-card-header">
                      <h3 className="tier-card-title">Emerging Institutes</h3>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Tier 3</span>
                    </div>

                    <div className="tier-stat-block">
                      <div className="tier-stat-label">Avg Fees/Year</div>
                      <div className="tier-stat-value avg">
                        {currencySymbol} {tierSummary?.tiers.emerging.avgFeesPerYear.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="tier-stat-block">
                      <div className="tier-stat-label">Highest Fees</div>
                      <div className="tier-stat-value high">
                        {currencySymbol} {tierSummary?.tiers.emerging.highestFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    <div className="tier-stat-block">
                      <div className="tier-stat-label">Lowest Fees</div>
                      <div className="tier-stat-value low">
                        {currencySymbol} {tierSummary?.tiers.emerging.lowestFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    <button
                      className="btn-green-action"
                      id="btn-view-colleges-emerging"
                      onClick={() => handleOpenCollegesModal('EMERGING')}
                    >
                      View Colleges
                    </button>
                  </div>
                </div>
              )}

              {/* COURSE FEE CALCULATOR FORM: Matching Screenshot */}
              <div className="calculator-section-wrap" id="course-fee-calculator-section">
                <h2 className="calculator-heading-serif">Course Fee Calculator</h2>

                <form onSubmit={handleCalculateSubmit} className="calculator-form">
                  {/* Row 1: Country */}
                  <div className="calc-form-row">
                    <label className="calc-label" htmlFor="calc-input-country">
                      Country
                    </label>
                    <select
                      id="calc-input-country"
                      value={calcCountry}
                      onChange={(e) => setCalcCountry(e.target.value)}
                      className="calc-select"
                    >
                      {metadata?.countries.map((c) => (
                        <option key={c.code} value={c.name}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Row 2: Department */}
                  <div className="calc-form-row">
                    <label className="calc-label" htmlFor="calc-input-department">
                      Department
                    </label>
                    <select
                      id="calc-input-department"
                      value={calcDepartment}
                      onChange={(e) => setCalcDepartment(e.target.value)}
                      className="calc-select"
                    >
                      {metadata?.departments.map((d) => (
                        <option key={d.name} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Row 3: Course */}
                  <div className="calc-form-row">
                    <label className="calc-label" htmlFor="calc-input-course">
                      Course / Track
                    </label>
                    <select
                      id="calc-input-course"
                      value={calcCourse}
                      onChange={(e) => setCalcCourse(e.target.value)}
                      className="calc-select"
                    >
                      {(
                        metadata?.departments.find((d) => d.name === calcDepartment)
                          ?.sampleCourses || [
                          'B.S. in Computer Science',
                          'Master of Business Administration',
                          'B.S. in Mechanical Engineering',
                        ]
                      ).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Row 4: Institution Tier */}
                  <div className="calc-form-row">
                    <label className="calc-label" htmlFor="calc-input-tier">
                      Institution Tier
                    </label>
                    <select
                      id="calc-input-tier"
                      value={calcTier}
                      onChange={(e) => setCalcTier(e.target.value as InstitutionTier)}
                      className="calc-select"
                    >
                      <option value="TOP_RANKED">Top Ranked Colleges</option>
                      <option value="MID_LEVEL">Mid Level Colleges</option>
                      <option value="EMERGING">Emerging Institutes</option>
                    </select>
                  </div>

                  {/* Submit Button */}
                  <div className="calc-submit-row">
                    <button
                      type="submit"
                      disabled={isCalculating}
                      className="btn-calc-submit"
                      id="btn-calc-submit"
                    >
                      {isCalculating ? (
                        <>
                          <RefreshCw size={16} className="spin" />
                          <span>Computing Cost Breakdown...</span>
                        </>
                      ) : (
                        <span>Submit</span>
                      )}
                    </button>
                  </div>
                </form>

                {/* Error Banner */}
                {calcError && (
                  <div
                    style={{
                      marginTop: '1.25rem',
                      padding: '0.85rem 1rem',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      color: '#b91c1c',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <AlertCircle size={16} />
                    <span>{calcError}</span>
                  </div>
                )}

                {/* CALCULATION RESULTS: Full Itemized Expenses & Total Cost */}
                {calcResult && (
                  <div className="calc-results-wrap" id="calc-results-anchor">
                    <div className="results-header">
                      <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '0.2rem 0.6rem', borderRadius: '12px', marginBottom: '0.4rem' }}>
                          <Check size={12} strokeWidth={3} /> ESTIMATE READY
                        </div>
                        <h3 className="results-title">
                          Cost of Education Breakdown — {calcResult.input.course}
                        </h3>
                        <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
                          Target Destination: <strong>{calcResult.input.country}</strong> ({calcResult.input.tier.replace('_', ' ')}) • Values in <strong>{calcResult.breakdown.currency}</strong>
                        </p>
                      </div>

                      <button
                        onClick={handleSaveBudget}
                        disabled={budgetSaveStatus === 'saved'}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          background: budgetSaveStatus === 'saved' ? '#dcfce7' : '#ffffff',
                          color: budgetSaveStatus === 'saved' ? '#15803d' : '#334155',
                          border: budgetSaveStatus === 'saved' ? '1px solid #86efac' : '1px solid #cbd5e1',
                          borderRadius: '8px',
                          padding: '0.5rem 0.85rem',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: budgetSaveStatus === 'saved' ? 'default' : 'pointer',
                        }}
                      >
                        <BookmarkCheck size={16} />
                        <span>
                          {budgetSaveStatus === 'saved'
                            ? 'Affordability Plan Saved!'
                            : budgetSaveStatus === 'saving'
                            ? 'Saving...'
                            : 'Save Budget Decision'}
                        </span>
                      </button>
                    </div>

                    {/* Breakdown Grid */}
                    <div className="breakdown-grid">
                      {/* 1. Tuition Fee */}
                      <div className="expense-item-card">
                        <div className="expense-icon-wrap">
                          <GraduationCap size={18} />
                        </div>
                        <div className="expense-meta">
                          <h4>Tuition Fee</h4>
                          <div className="expense-amount">
                            {currencySymbol} {calcResult.breakdown.tuitionFee.toLocaleString()}
                          </div>
                          <div className="expense-sub">Annual instructional tuition</div>
                        </div>
                      </div>

                      {/* 2. Living Expenses */}
                      <div className="expense-item-card">
                        <div className="expense-icon-wrap">
                          <Home size={18} />
                        </div>
                        <div className="expense-meta">
                          <h4>Living Expenses</h4>
                          <div className="expense-amount">
                            {currencySymbol} {calcResult.breakdown.livingExpenses.toLocaleString()}
                          </div>
                          <div className="expense-sub">
                            ~{currencySymbol} {calcResult.breakdown.monthlyLivingEstimate.toLocaleString()} / month (housing & food)
                          </div>
                        </div>
                      </div>

                      {/* 3. Health Coverage */}
                      <div className="expense-item-card">
                        <div className="expense-icon-wrap">
                          <ShieldAlert size={18} />
                        </div>
                        <div className="expense-meta">
                          <h4>Health Coverage</h4>
                          <div className="expense-amount">
                            {currencySymbol} {calcResult.breakdown.healthInsurance.toLocaleString()}
                          </div>
                          <div className="expense-sub">Mandatory student health plan</div>
                        </div>
                      </div>

                      {/* 4. Travel & Visa */}
                      <div className="expense-item-card">
                        <div className="expense-icon-wrap">
                          <Plane size={18} />
                        </div>
                        <div className="expense-meta">
                          <h4>Travel & Visa</h4>
                          <div className="expense-amount">
                            {currencySymbol} {calcResult.breakdown.travelExpenses.toLocaleString()}
                          </div>
                          <div className="expense-sub">Flights, student visa, local transit</div>
                        </div>
                      </div>

                      {/* 5. Personal Expenses */}
                      <div className="expense-item-card">
                        <div className="expense-icon-wrap">
                          <BookOpen size={18} />
                        </div>
                        <div className="expense-meta">
                          <h4>Personal Expenses</h4>
                          <div className="expense-amount">
                            {currencySymbol} {calcResult.breakdown.personalExpenses.toLocaleString()}
                          </div>
                          <div className="expense-sub">Books, study supplies, leisure</div>
                        </div>
                      </div>

                      {/* 6. Degree Term Estimate (4 Years) */}
                      <div className="expense-item-card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                        <div className="expense-icon-wrap" style={{ background: '#dcfce7', color: '#16a34a' }}>
                          <DollarSign size={18} />
                        </div>
                        <div className="expense-meta">
                          <h4 style={{ color: '#166534' }}>Full Degree (4 Yrs)</h4>
                          <div className="expense-amount" style={{ color: '#15803d' }}>
                            {currencySymbol} {(calcResult.breakdown.totalEstimatedCost * 4).toLocaleString()}
                          </div>
                          <div className="expense-sub">Total 4-year cumulative investment</div>
                        </div>
                      </div>
                    </div>

                    {/* Total Estimated Cost Card */}
                    <div className="total-cost-card">
                      <div>
                        <div className="total-meta-title">Grand Total Estimated Annual Cost</div>
                        <div className="total-cost-amount">
                          {currencySymbol} {calcResult.breakdown.totalEstimatedCost.toLocaleString()}
                        </div>
                        <div className="total-cost-details">
                          Includes full tuition + all living and auxiliary student costs for 1 academic year.
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Monthly Baseline:</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff' }}>
                          ~{currencySymbol} {Math.round(calcResult.breakdown.totalEstimatedCost / 12).toLocaleString()} / mo
                        </div>
                      </div>
                    </div>

                    {/* Lower-Cost Alternatives Box */}
                    {calcResult.alternativeOptions && calcResult.alternativeOptions.length > 0 && (
                      <div className="savings-recommendation-box">
                        <div className="savings-box-header">
                          <Sparkles size={18} />
                          <span>Identified Lower-Cost Alternatives & Budget Options</span>
                        </div>

                        {calcResult.alternativeOptions.map((opt, idx) => (
                          <div key={idx} className="alternative-item">
                            <div className="alternative-item-info">
                              <h5>{opt.title}</h5>
                              <p>{opt.description}</p>
                            </div>
                            <div className="savings-tag">
                              Save ~{currencySymbol} {opt.savingsAmount.toLocaleString()} / yr
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* VIEW COLLEGES MODAL */}
      <ViewCollegesModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        country={selectedCountry}
        tier={modalTier}
        department={selectedDepartment}
        currency={selectedCurrency}
        currencySymbol={currencySymbol}
      />
    </div>
  );
};
