import React, { useState } from 'react';
import { Search, Bell, ExternalLink, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../../../shared/context/AuthContext';

export interface SaaSTopBarProps {
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  onNavigateLanding?: () => void;
}

export const SaaSTopBar: React.FC<SaaSTopBarProps> = ({
  onSearch,
  searchPlaceholder = 'Search students, applications, or anything...',
  onNavigateLanding,
}) => {
  const { user, logout } = useAuth();
  const [searchVal, setSearchVal] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Formatted current date
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchVal);
    }
  };

  const roleTitle = user?.role === 'ADMIN' ? 'Super Admin' : 'Student';

  const userDisplayName = user?.email?.split('@')[0] || 'User';

  return (
    <header className="saas-topbar">
      <form onSubmit={handleSearchSubmit} className="saas-search-container">
        <Search size={16} color="#94A3B8" />
        <input
          type="text"
          className="saas-search-input"
          placeholder={searchPlaceholder}
          value={searchVal}
          onChange={(e) => {
            setSearchVal(e.target.value);
            if (onSearch) onSearch(e.target.value);
          }}
        />
      </form>

      <div className="saas-topbar-actions">
        <div className="saas-date-badge">
          <span>{todayFormatted}</span>
        </div>

        <button
          className="saas-icon-btn"
          title="Notifications"
          onClick={() => alert('No new notifications')}
          type="button"
        >
          <Bell size={18} />
          <span className="saas-badge-dot" />
        </button>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.3rem 0.5rem',
              borderRadius: '8px',
            }}
            type="button"
          >
            <div className="saas-user-avatar">
              {userDisplayName.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}>
                {userDisplayName}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>{roleTitle}</span>
            </div>
            <ChevronDown size={14} color="#64748B" />
          </button>

          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                width: '210px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.1)',
                padding: '0.5rem',
                zIndex: 50,
              }}
            >
              <div
                style={{
                  padding: '0.5rem 0.75rem',
                  borderBottom: '1px solid #F1F5F9',
                  marginBottom: '0.35rem',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Signed in as</div>
                <div
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#0F172A',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user?.email}
                </div>
              </div>

              {onNavigateLanding && (
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onNavigateLanding();
                  }}
                  className="saas-nav-item"
                  style={{ fontSize: '0.82rem', padding: '0.5rem 0.75rem' }}
                  type="button"
                >
                  <ExternalLink size={15} /> View Public Portal
                </button>
              )}

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                  if (onNavigateLanding) {
                    onNavigateLanding();
                  }
                }}
                className="saas-nav-item"
                style={{ fontSize: '0.82rem', padding: '0.5rem 0.75rem', color: '#DC2626' }}
                type="button"
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
