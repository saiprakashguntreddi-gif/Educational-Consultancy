import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  COMPREHENSIVE_BOARD_GROUPS,
  BoardOptionItem,
  BoardCategoryGroup,
} from '../constants/boards.constants';

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
  placeholder = 'Select board / curriculum...',
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
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Hidden input for HTML form validation if required */}
      <input
        type="text"
        id={id}
        name={id}
        value={value}
        required={required}
        readOnly
        className="sr-only"
        tabIndex={-1}
      />

      {/* Main trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between text-left px-3.5 py-2.5 bg-white border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
          disabled
            ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
            : isOpen
            ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
            : 'border-slate-300 hover:border-slate-400 text-slate-900'
        }`}
      >
        <span className={`block truncate ${!value ? 'text-slate-400' : 'text-slate-800 font-medium'}`}>
          {selectedLabel || placeholder}
        </span>
        <div className="flex items-center space-x-1.5 ml-2 shrink-0">
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
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
          )}
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown popup */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col max-h-[380px]">
          {/* Search Box Header */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/80 sticky top-0 z-10">
            <div className="relative flex items-center">
              <svg
                className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search state board, CBSE, ICSE, IB, etc..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 px-1">
              <span>{totalResultsCount} boards available</span>
              <button
                type="button"
                onClick={() => {
                  setCustomInputMode(!customInputMode);
                  setCustomValue(searchQuery || '');
                }}
                className="text-indigo-600 font-semibold hover:underline"
              >
                {customInputMode ? 'Hide custom' : '+ Enter custom board'}
              </button>
            </div>
          </div>

          {/* Custom board entry option */}
          {customInputMode && (
            <div className="p-3 bg-indigo-50/70 border-b border-indigo-100 flex flex-col gap-2">
              <span className="text-xs font-semibold text-indigo-900">Enter custom board / council name:</span>
              <form onSubmit={handleApplyCustom} className="flex gap-2">
                <input
                  type="text"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  placeholder="e.g., Mauritius Examinations Syndicate"
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!customValue.trim()}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  Apply
                </button>
              </form>
            </div>
          )}

          {/* List of Board Groups */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
            {filteredGroups.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                <p className="font-medium text-slate-700 mb-1">No board found matching "{searchQuery}"</p>
                <p className="text-slate-400 mb-3">You can use your search query as a custom board name</p>
                <button
                  type="button"
                  onClick={() => {
                    onChange(searchQuery.trim());
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 font-medium rounded-lg text-xs hover:bg-indigo-100"
                >
                  Use "{searchQuery}" as Board
                </button>
              </div>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.category} className="py-1">
                  <div className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/60 sticky top-0">
                    {group.category}
                  </div>
                  <div className="py-0.5">
                    {group.options.map((option) => {
                      const isSelected = value === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleSelectOption(option)}
                          className={`w-full flex items-center justify-between text-left px-3.5 py-2 text-xs transition-colors ${
                            isSelected
                              ? 'bg-indigo-50 text-indigo-900 font-semibold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="truncate pr-2">{option.label}</span>
                          {isSelected && (
                            <svg className="w-4 h-4 text-indigo-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
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
