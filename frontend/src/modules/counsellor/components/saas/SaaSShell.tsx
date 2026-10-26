import React from 'react';
import { SaaSSidebar } from './SaaSSidebar';
import { SaaSTopBar } from './SaaSTopBar';
import '../../styles/saas-dashboard.css';

export interface SaaSShellProps {
  children: React.ReactNode;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  role?: 'ADMIN';
  onGlobalSearch?: (query: string) => void;
  searchPlaceholder?: string;
  onNavigateLanding?: () => void;
}

export const SaaSShell: React.FC<SaaSShellProps> = ({
  children,
  activeTab,
  onSelectTab,
  role = 'ADMIN',
  onGlobalSearch,
  searchPlaceholder,
  onNavigateLanding,
}) => {
  return (
    <div className="saas-container">
      <SaaSSidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        role={role}
        onNavigateLanding={onNavigateLanding}
      />
      <div className="saas-main-wrapper">
        <SaaSTopBar
          onSearch={onGlobalSearch}
          searchPlaceholder={searchPlaceholder}
          onNavigateLanding={onNavigateLanding}
        />
        <main className="saas-content">{children}</main>
      </div>
    </div>
  );
};
