import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  Award,
  BookOpen,
  BarChart3,
  ShieldCheck,
  Calendar,
  ClipboardList,
  LogOut,
  Sparkles,
  Settings,
  Bookmark,
  Building2,
  Layers,
  CheckSquare,
} from 'lucide-react';
import { useAuth } from '../../../../shared/context/AuthContext';

export interface SaaSSidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  role: 'ADMIN' | 'COUNSELLOR';
  unreadCount?: number;
  onNavigateLanding?: () => void;
}

export const SaaSSidebar: React.FC<SaaSSidebarProps> = ({
  activeTab,
  onSelectTab,
  role,
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
        { id: 'counsellors', label: 'Counsellors', icon: <UserCheck size={18} /> },
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

  const counsellorNavSections = [
    {
      title: 'My Workspace',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'students', label: 'My Students', icon: <Users size={18} /> },
        { id: 'applications', label: 'Applications', icon: <FileText size={18} /> },
        { id: 'appointments', label: 'Appointments', icon: <Calendar size={18} /> },
        { id: 'scholarships', label: 'Scholarships', icon: <Award size={18} /> },
        { id: 'shortlists', label: 'Shortlists', icon: <Bookmark size={18} /> },
        { id: 'notes', label: 'Advisory Notes', icon: <ClipboardList size={18} /> },
      ],
    },
    {
      title: 'Resources',
      items: [
        { id: 'colleges', label: 'Institution Catalog', icon: <BookOpen size={18} /> },
        { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
      ],
    },
  ];

  const sections = role === 'ADMIN' ? adminNavSections : counsellorNavSections;
  const userDisplayName = user?.email?.split('@')[0] || (role === 'ADMIN' ? 'Admin' : 'Counsellor');

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
            {role === 'ADMIN' ? 'Management Console' : 'Counsellor Workspace'}
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
              {role === 'ADMIN' ? 'Super Admin' : 'Counsellor'}
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
