import React from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Award,
  BarChart3,
  ShieldCheck,
  Calendar,
  ClipboardList,
  LogOut,
  Sparkles,
  Settings,
  Building2,
  Layers,
  CheckSquare,
} from 'lucide-react';
import { useAuth } from '../../../../shared/context/AuthContext';

export interface SaaSSidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  role?: 'ADMIN';
  unreadCount?: number;
  onNavigateLanding?: () => void;
}

export const SaaSSidebar: React.FC<SaaSSidebarProps> = ({
  activeTab,
  onSelectTab,
  onNavigateLanding,
}) => {
  const { user, logout } = useAuth();

  const adminNavSections = [
    {
      title: 'Platform Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'students', label: 'Students Roster', icon: <Users size={18} /> },
        { id: 'verification', label: 'Verification Queue', icon: <CheckSquare size={18} /> },
        { id: 'applications', label: 'Applications', icon: <FileText size={18} /> },
      ],
    },
    {
      title: 'Counselling Operations',
      items: [
        { id: 'appointments', label: 'Appointments & Sessions', icon: <Calendar size={18} /> },
        { id: 'session-audit', label: 'Session Audits', icon: <ClipboardList size={18} /> },
      ],
    },
    {
      title: 'Institutional Catalog',
      items: [
        { id: 'colleges', label: 'College Management', icon: <Building2 size={18} /> },
        { id: 'college-tiers', label: 'College Tiers', icon: <Layers size={18} /> },
        { id: 'scholarships', label: 'Scholarships Suite', icon: <Award size={18} /> },
      ],
    },
    {
      title: 'Intelligence & Security',
      items: [
        { id: 'reports', label: 'Reports & Analytics', icon: <BarChart3 size={18} /> },
        { id: 'audit', label: 'Security Audit Logs', icon: <ShieldCheck size={18} /> },
        { id: 'settings', label: 'System Settings', icon: <Settings size={18} /> },
      ],
    },
  ];

  const sections = adminNavSections;
  const userDisplayName = user?.email?.split('@')[0] || 'Admin';

  return (
    <aside className="saas-sidebar">
      {/* Brand Header */}
      <div className="saas-sidebar-brand">
        <div className="saas-brand-logo">
          <Sparkles size={18} />
        </div>
        <div className="saas-brand-text">
          <div className="saas-brand-title">Superconsciousness</div>
          <div className="saas-brand-subtitle">
            Management Console
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="saas-sidebar-nav">
        {sections.map((section, sIdx) => (
          <div key={sIdx}>
            <div className="saas-nav-section-title">{section.title}</div>
            {section.items.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`saas-nav-item ${isActive ? 'active' : ''}`}
                  type="button"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Profile */}
      <div className="saas-sidebar-footer">
        <div className="saas-user-info">
          <div className="saas-user-avatar">
            {userDisplayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="saas-user-details">
            <span className="saas-user-name">{userDisplayName}</span>
            <span className="saas-user-role">
              Super Admin
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            if (onNavigateLanding) {
              onNavigateLanding();
            }
          }}
          title="Sign Out"
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: '#64748B',
            padding: '4px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          type="button"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};
