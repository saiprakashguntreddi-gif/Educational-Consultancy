import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, X, Search, Check } from 'lucide-react';
import {
  COMPREHENSIVE_BOARD_GROUPS,
  BoardOptionItem,
  BoardCategoryGroup,
} from '../constants/boards.constants';
import './SearchableBoardSelect.css';

interface SearchableBoardSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  className?: string;
}

export const SearchableBoardSelect: React.FC<SearchableBoardSelectProps> = ({
  value,
  onChange,
  placeholder = 'Search or select board / curriculum...',
  disabled = false,
  required = false,
  id,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customInputMode, setCustomInputMode] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        setCustomInputMode(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Filter groups based on search query
  const filteredGroups: BoardCategoryGroup[] = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return COMPREHENSIVE_BOARD_GROUPS;

    return COMPREHENSIVE_BOARD_GROUPS.map((group) => {
      const matchedOptions = group.options.filter(
        (opt) =>
          opt.value.toLowerCase().includes(q) ||
          opt.label.toLowerCase().includes(q)
      );
      return {
        category: group.category,
        options: matchedOptions,
      };
    }).filter((group) => group.options.length > 0);
  }, [searchQuery]);

  const totalResultsCount = useMemo(() => {
    return filteredGroups.reduce((acc, g) => acc + g.options.length, 0);
  }, [filteredGroups]);

  // Check if current value exists in predefined list
  const selectedLabel = useMemo(() => {
    if (!value) return '';
    for (const group of COMPREHENSIVE_BOARD_GROUPS) {
      const found = group.options.find((opt) => opt.value === value);
      if (found) return found.label;
    }
    return value; // Custom or previously saved value
  }, [value]);

  const handleSelectOption = (option: BoardOptionItem) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchQuery('');
    setCustomInputMode(false);
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customValue.trim()) {
      onChange(customValue.trim());
      setIsOpen(false);
      setCustomInputMode(false);
      setSearchQuery('');
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} className={`sbs-container ${className}`}>
      {/* Hidden input for HTML form validation if required */}
      <input
        type="text"
        id={id}
        name={id}
        value={value}
        required={required}
        readOnly
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
        tabIndex={-1}
      />

      {/* Main trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`sbs-trigger-btn ${isOpen ? 'sbs-open' : ''}`}
        aria-expanded={isOpen}
      >
        <span className={value ? 'sbs-selected-text' : 'sbs-placeholder-text'}>
          {selectedLabel || placeholder}
        </span>

        <div className="sbs-actions-group">
          {value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onChange('');
                }
              }}
              title="Clear selection"
              className="sbs-icon-btn"
            >
              <X size={14} style={{ width: 14, height: 14, minWidth: 14, minHeight: 14 }} />
            </span>
          )}
          <span className={`sbs-chevron-icon ${isOpen ? 'sbs-rotated' : ''}`}>
            <ChevronDown size={16} style={{ width: 16, height: 16, minWidth: 16, minHeight: 16 }} />
          </span>
        </div>
      </button>

      {/* Dropdown popup */}
      {isOpen && (
        <div className="sbs-dropdown-menu">
          {/* Search Box Header */}
          <div className="sbs-search-header">
            <div className="sbs-search-wrapper">
              <span className="sbs-search-input-icon">
                <Search size={14} style={{ width: 14, height: 14, minWidth: 14, minHeight: 14 }} />
              </span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search state board, CBSE, ICSE, IB, etc..."
                className="sbs-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="sbs-search-clear-btn"
                  title="Clear search"
                >
                  <X size={13} style={{ width: 13, height: 13, minWidth: 13, minHeight: 13 }} />
                </button>
              )}
            </div>
            <div className="sbs-search-meta">
              <span>{totalResultsCount} boards available</span>
              <button
                type="button"
                onClick={() => {
                  setCustomInputMode(!customInputMode);
                  setCustomValue(searchQuery || '');
                }}
                className="sbs-custom-btn"
              >
                {customInputMode ? 'Hide custom' : '+ Enter custom board'}
              </button>
            </div>
          </div>

          {/* Custom board entry option */}
          {customInputMode && (
            <div className="sbs-custom-drawer">
              <span className="sbs-custom-drawer-label">Enter custom board / council name:</span>
              <form onSubmit={handleApplyCustom} className="sbs-custom-form">
                <input
                  type="text"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  placeholder="e.g., Mauritius Examinations Syndicate"
                  className="sbs-custom-input"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!customValue.trim()}
                  className="sbs-custom-apply-btn"
                >
                  Apply
                </button>
              </form>
            </div>
          )}

          {/* List of Board Groups */}
          <div className="sbs-list-container">
            {filteredGroups.length === 0 ? (
              <div className="sbs-empty-state">
                <p><strong>No board found matching "{searchQuery}"</strong></p>
                <p>You can use your search query as a custom board name</p>
                <button
                  type="button"
                  onClick={() => {
                    onChange(searchQuery.trim());
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className="sbs-empty-action-btn"
                >
                  Use "{searchQuery}" as Board
                </button>
              </div>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.category}>
                  <div className="sbs-category-header">
                    {group.category}
                  </div>
                  <div>
                    {group.options.map((option) => {
                      const isSelected = value === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleSelectOption(option)}
                          className={`sbs-option-item ${isSelected ? 'sbs-selected' : ''}`}
                        >
                          <span className="sbs-option-label">{option.label}</span>
                          {isSelected && (
                            <span className="sbs-check-icon">
                              <Check size={14} style={{ width: 14, height: 14, minWidth: 14, minHeight: 14 }} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
