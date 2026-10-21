import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface CollegeSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenMobileFilters: () => void;
  sortBy: string;
  onSortChange: (sort: 'name_asc' | 'name_desc' | 'fee_asc' | 'fee_desc') => void;
  activeFilterCount: number;
  onClearAllFilters: () => void;
}

export const CollegeSearchBar: React.FC<CollegeSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenMobileFilters,
  sortBy,
  onSortChange,
  activeFilterCount,
  onClearAllFilters,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
          width: '100%',
        }}
      >
        {/* Search Input Box */}
        <div
          style={{
            flex: '1 1 320px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Search
            size={18}
            color="#64748B"
            style={{
              position: 'absolute',
              left: '1rem',
              pointerEvents: 'none',
            }}
          />
          <input
            id="college-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search colleges, courses, cities or specializations..."
            style={{
              width: '100%',
              padding: '0.75rem 2.6rem 0.75rem 2.75rem',
              borderRadius: '12px',
              border: '1.5px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#0F172A',
              fontSize: '0.92rem',
              outline: 'none',
              boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#5B4FE9';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(91, 79, 233, 0.12)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#E2E8F0';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(15, 23, 42, 0.04)';
            }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '0.3rem',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: '#FFFFFF',
            borderRadius: '12px',
            border: '1.5px solid #E2E8F0',
            padding: '0.45rem 0.85rem',
            boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)',
          }}
        >
          <ArrowUpDown size={15} color="#64748B" />
          <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Sort:</span>
          <select
            id="college-sort-select"
            value={sortBy}
            onChange={(e) =>
              onSortChange(e.target.value as 'name_asc' | 'name_desc' | 'fee_asc' | 'fee_desc')
            }
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '0.84rem',
              fontWeight: 600,
              color: '#0F172A',
              cursor: 'pointer',
            }}
          >
            <option value="name_asc">Institution Name (A – Z)</option>
            <option value="name_desc">Institution Name (Z – A)</option>
            <option value="fee_asc">Tuition (Lowest First)</option>
            <option value="fee_desc">Tuition (Highest First)</option>
          </select>
        </div>

        {/* Mobile Filter Trigger Button */}
        <button
          onClick={onOpenMobileFilters}
          className="cmd-mobile-filter-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.72rem 1.1rem',
            borderRadius: '12px',
            background: activeFilterCount > 0 ? '#EEF2FF' : '#FFFFFF',
            border: activeFilterCount > 0 ? '1.5px solid #5B4FE9' : '1.5px solid #E2E8F0',
            color: activeFilterCount > 0 ? '#5B4FE9' : '#334155',
            fontSize: '0.86rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)',
          }}
        >
          <SlidersHorizontal size={16} />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#5B4FE9',
                color: '#FFFFFF',
                fontSize: '0.74rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Active Filter Indicators */}
      {activeFilterCount > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            flexWrap: 'wrap',
            fontSize: '0.82rem',
          }}
        >
          <span style={{ color: '#64748B', fontWeight: 600 }}>
            {activeFilterCount} active {activeFilterCount === 1 ? 'filter' : 'filters'} applied
          </span>
          <button
            onClick={onClearAllFilters}
            style={{
              background: 'none',
              border: 'none',
              color: '#5B4FE9',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};
