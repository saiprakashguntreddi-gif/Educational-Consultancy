import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isStaff = user?.role === 'COUNSELLOR' || user?.role === 'ADMIN';

  // Listen to scroll to apply subtle shadow/border
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile menu automatically on resize to desktop widths
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1340) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavClick = (viewOrSection: string) => {
    setMobileMenuOpen(false);
    if (viewOrSection.startsWith('#')) {
      const sectionId = viewOrSection.replace('#', '');
      if (currentView !== 'home') {
        onNavigate('home');
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      } else {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      onNavigate(viewOrSection);
    }
  };

  const handleSignOut = () => {
    setMobileMenuOpen(false);
    logout();
    onNavigate('home');
  };

  return (
    <header className={`premium-navbar ${isScrolled ? 'is-scrolled' : ''} ${isStaff ? 'navbar-has-staff' : ''} ${isAdmin ? 'navbar-has-admin' : ''}`}>
      <div className="navbar-inner">
        {/* Brand Logo / Wordmark */}
        <div
          onClick={() => handleNavClick('home')}
          className="nav-brand"
          id="nav-brand-logo"
        >
          <div className="nav-brand-logo-icon">
            <Compass size={22} />
          </div>
          <div className="nav-brand-text">
            <span className="nav-brand-title">
              SUPER<span>CONSCIOUSNESS</span>
            </span>
            <span className="nav-brand-sub">
              Educational Consultancy & Guidance
            </span>
          </div>
        </div>

        {/* Center Navigation Links (Desktop) */}
        {!user ? (
          <nav className="nav-menu-links">
            <button
              onClick={() => handleNavClick('home')}
              className="nav-link-btn"
              style={{
                color: currentView === 'home' ? '#FFFFFF' : '#E2E8F0',
                fontWeight: currentView === 'home' ? 700 : 500,
              }}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('#about')}
              className="nav-link-btn"
            >
              About
            </button>
            <button
              onClick={() => handleNavClick('#how-it-works')}
              className="nav-link-btn"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavClick('#resources')}
              className="nav-link-btn"
            >
              Resources
            </button>
            <button
              onClick={() => handleNavClick('#contact')}
              className="nav-link-btn"
            >
              Contact
            </button>
          </nav>
        ) : (
          <nav className="nav-menu-links nav-menu-links-authenticated">
            <button
              onClick={() => handleNavClick('home')}
              className="nav-link-btn"
              style={{
                color: currentView === 'home' ? '#FFFFFF' : '#E2E8F0',
                fontWeight: currentView === 'home' ? 700 : 500,
              }}
            >
              Home
            </button>
          </nav>
        )}

        {/* Right Actions (Desktop) */}
        <div className="nav-auth-actions">
          {user ? (
            <>
              {/* Student Navigation - all student features reside strictly inside Student Dashboard */}
              {user.role === 'STUDENT' && (
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="btn-nav-module"
                  title="Student Dashboard"
                  id="nav-dashboard-btn"
                >
                  <LayoutDashboard size={15} color="#A78BFA" />
                  <span>Student Dashboard</span>
                </button>
              )}

              {/* Staff Direct Dashboard Navigation Button */}
              {(user.role === 'COUNSELLOR' || user.role === 'ADMIN') && (
                <button
                  onClick={() => onNavigate(user.role === 'ADMIN' ? 'admin-dashboard' : 'counsellor-dashboard')}
                  className="btn-nav-module"
                  id="nav-suite-btn"
                  title={user.role === 'ADMIN' ? 'Platform Administration Console' : 'Counsellor Workstation'}
                >
                  <ShieldCheck size={15} color="#A78BFA" />
                  <span>{user.role === 'ADMIN' ? 'Admin Dashboard' : 'Counsellor Workspace'}</span>
                </button>
              )}

              {/* Direct Visible Logout / Action Button on the right */}
              <button
                onClick={handleSignOut}
                className="btn-nav-logout"
                id="nav-logout-btn"
                title={`Signed in as ${user.email} (${user.role}) — Click to Logout`}
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('login')}
                className="btn-nav-login"
                id="nav-login-btn"
              >
                Login
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="btn-nav-signup"
                id="nav-get-started-btn"
              >
                Get Started
              </button>
            </>
          )}

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="nav-mobile-toggle"
            aria-label="Toggle navigation menu"
            id="nav-mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="nav-mobile-drawer">
          <button
            onClick={() => handleNavClick('home')}
            className={`nav-mobile-link ${currentView === 'home' ? 'is-active' : ''}`}
            id="mobile-nav-home-btn"
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('#about')}
            className="nav-mobile-link"
            id="mobile-nav-about-btn"
          >
            About
          </button>
          <button
            onClick={() => handleNavClick('#how-it-works')}
            className="nav-mobile-link"
            id="mobile-nav-how-it-works-btn"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNavClick('#resources')}
            className="nav-mobile-link"
            id="mobile-nav-resources-btn"
          >
            Resources
          </button>
          <button
            onClick={() => handleNavClick('#contact')}
            className="nav-mobile-link"
            id="mobile-nav-contact-btn"
          >
            Contact
          </button>

          <div className="nav-mobile-divider" />

          {user ? (
            <div className="nav-mobile-actions">
              <div className="nav-mobile-section-heading">
                {user.role} • {user.email}
              </div>

              {user.role === 'STUDENT' && (
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className="btn-primary-indigo"
                  style={{ width: '100%', justifyContent: 'center' }}
                  id="mobile-nav-dashboard-btn"
                >
                  <LayoutDashboard size={16} /> Student Dashboard
                </button>
              )}

              {(user.role === 'COUNSELLOR' || user.role === 'ADMIN') && (
                <button
                  onClick={() => handleNavClick(user.role === 'ADMIN' ? 'admin-dashboard' : 'counsellor-dashboard')}
                  className="btn-primary-indigo"
                  style={{ width: '100%', justifyContent: 'center' }}
                  id="mobile-nav-suite-btn"
                >
                  <ShieldCheck size={16} /> {user.role === 'ADMIN' ? 'Admin Dashboard' : 'Counsellor Workspace'}
                </button>
              )}

              <button
                onClick={handleSignOut}
                className="nav-account-signout-btn"
                id="mobile-nav-logout-btn"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
              <button
                onClick={() => handleNavClick('login')}
                className="btn-nav-login"
                style={{ flex: 1, textAlign: 'center', padding: '0.65rem' }}
                id="mobile-nav-login-btn"
              >
                Login
              </button>
              <button
                onClick={() => handleNavClick('register')}
                className="btn-nav-signup"
                style={{ flex: 1, textAlign: 'center', padding: '0.65rem' }}
                id="mobile-nav-register-btn"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
