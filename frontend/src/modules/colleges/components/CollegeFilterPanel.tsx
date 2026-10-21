import React from 'react';
import {
  Globe,
  MapPin,
  BookOpen,
  GraduationCap,
  Award,
  FileText,
  RotateCcw,
  Check,
  X,
} from 'lucide-react';
import { DiscoveryFilterOptions, CollegeSearchParams } from '../colleges.types';

interface CollegeFilterPanelProps {
  filterOptions: DiscoveryFilterOptions;
  currentFilters: CollegeSearchParams;
  onFilterChange: (updated: Partial<CollegeSearchParams>) => void;
  onClearFilters: () => void;
  isMobileDrawerOpen: boolean;
  onCloseMobileDrawer: () => void;
}

export const CollegeFilterPanel: React.FC<CollegeFilterPanelProps> = ({
  filterOptions,
  currentFilters,
  onFilterChange,
  onClearFilters,
  isMobileDrawerOpen,
  onCloseMobileDrawer,
}) => {
  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '0.85rem',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
            Filter Catalogue
          </span>
        </div>
        <button
          onClick={onClearFilters}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            background: 'none',
            border: 'none',
            color: '#64748B',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '0.2rem 0.4rem',
            borderRadius: '6px',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#5B4FE9')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>
      </div>

      {/* 1. LOCATION FILTERS */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            marginBottom: '0.65rem',
          }}
        >
          <Globe size={15} color="#5B4FE9" />
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
            Destination Country
          </span>
        </div>
        <select
          id="filter-country-select"
          value={currentFilters.country || 'ALL'}
          onChange={(e) => onFilterChange({ country: e.target.value, page: 1 })}
          style={{
            width: '100%',
            padding: '0.6rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid #CBD5E1',
            background: '#FFFFFF',
            fontSize: '0.86rem',
            color: '#0F172A',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        >
          <option value="ALL">All Countries</option>
          {filterOptions.countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* City Filter */}
      {filterOptions.cities.length > 0 && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              marginBottom: '0.65rem',
            }}
          >
            <MapPin size={15} color="#5B4FE9" />
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
              Campus City
            </span>
          </div>
          <select
            id="filter-city-select"
            value={currentFilters.city || 'ALL'}
            onChange={(e) => onFilterChange({ city: e.target.value, page: 1 })}
            style={{
              width: '100%',
              padding: '0.6rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              fontSize: '0.86rem',
              color: '#0F172A',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          >
            <option value="ALL">All Cities</option>
            {filterOptions.cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 2. ACADEMIC DISCIPLINE FILTERS */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            marginBottom: '0.65rem',
          }}
        >
          <BookOpen size={15} color="#5B4FE9" />
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
            Academic Department
          </span>
        </div>
        <select
          id="filter-dept-select"
          value={currentFilters.department || 'ALL'}
          onChange={(e) => onFilterChange({ department: e.target.value, page: 1 })}
          style={{
            width: '100%',
            padding: '0.6rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid #CBD5E1',
            background: '#FFFFFF',
            fontSize: '0.86rem',
            color: '#0F172A',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        >
          <option value="ALL">All Departments</option>
          {filterOptions.departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Study Level */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            marginBottom: '0.65rem',
          }}
        >
          <GraduationCap size={15} color="#5B4FE9" />
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
            Study Level
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['ALL', 'Undergraduate', 'Postgraduate'].map((lvl) => {
            const isActive = (currentFilters.level || 'ALL') === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => onFilterChange({ level: lvl, page: 1 })}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isActive ? '1px solid #5B4FE9' : '1px solid #E2E8F0',
                  background: isActive ? '#EEF2FF' : '#FFFFFF',
                  color: isActive ? '#5B4FE9' : '#475569',
                }}
              >
                {lvl === 'ALL' ? 'All' : lvl}
              </button>
            );
          })}
        </div>
      </div>

      {/* Specialization Filter */}
      {filterOptions.specializations.length > 0 && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              marginBottom: '0.65rem',
            }}
          >
            <BookOpen size={15} color="#5B4FE9" />
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
              Specialization
            </span>
          </div>
          <select
            id="filter-spec-select"
            value={currentFilters.specialization || 'ALL'}
            onChange={(e) => onFilterChange({ specialization: e.target.value, page: 1 })}
            style={{
              width: '100%',
              padding: '0.6rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              fontSize: '0.86rem',
              color: '#0F172A',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          >
            <option value="ALL">All Specializations</option>
            {filterOptions.specializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 3. FINANCIAL: SCHOLARSHIP AVAILABILITY */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            marginBottom: '0.65rem',
          }}
        >
          <Award size={15} color="#5B4FE9" />
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
            Financial Support
          </span>
        </div>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.84rem',
            color: '#334155',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <input
            id="filter-scholarship-checkbox"
            type="checkbox"
            checked={Boolean(currentFilters.hasScholarship)}
            onChange={(e) =>
              onFilterChange({
                hasScholarship: e.target.checked ? true : undefined,
                page: 1,
              })
            }
            style={{
              width: '16px',
              height: '16px',
              accentColor: '#5B4FE9',
              cursor: 'pointer',
            }}
          />
          <span>Scholarships Available</span>
        </label>
      </div>

      {/* 4. ENTRANCE EXAM REQUIREMENTS */}
      {filterOptions.entranceExams.length > 0 && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              marginBottom: '0.65rem',
            }}
          >
            <FileText size={15} color="#5B4FE9" />
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
              Entrance Exam Required
            </span>
          </div>
          <select
            id="filter-exam-select"
            value={currentFilters.entranceExam || 'ALL'}
            onChange={(e) => onFilterChange({ entranceExam: e.target.value, page: 1 })}
            style={{
              width: '100%',
              padding: '0.6rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              fontSize: '0.86rem',
              color: '#0F172A',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          >
            <option value="ALL">All Exams</option>
            {filterOptions.entranceExams.map((exam) => (
              <option key={exam} value={exam}>
                {exam}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR PANEL */}
      <aside
        className="cmd-filter-desktop-sidebar"
        style={{
          width: '260px',
          flexShrink: 0,
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '1.25rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          alignSelf: 'flex-start',
        }}
      >
        {content}
      </aside>

      {/* MOBILE DRAWER MODAL */}
      {isMobileDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
          }}
          onClick={onCloseMobileDrawer}
        >
          <div
            style={{
              width: '85%',
              maxWidth: '340px',
              height: '100%',
              background: '#FFFFFF',
              padding: '1.5rem',
              overflowY: 'auto',
              boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                }}
              >
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Filter Institutions
                </h3>
                <button
                  onClick={onCloseMobileDrawer}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748B',
                    cursor: 'pointer',
                    padding: '0.25rem',
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {content}
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  onClearFilters();
                  onCloseMobileDrawer();
                }}
                style={{
                  flex: 1,
                  padding: '0.7rem',
                  borderRadius: '8px',
                  background: '#F1F5F9',
                  border: 'none',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
              <button
                onClick={onCloseMobileDrawer}
                style={{
                  flex: 1,
                  padding: '0.7rem',
                  borderRadius: '8px',
                  background: '#5B4FE9',
                  border: 'none',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                }}
              >
                <Check size={16} />
                <span>Apply</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
