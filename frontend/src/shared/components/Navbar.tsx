import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Building2,
  Layers,
  Award,
  Target,
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
  };

  return (
    <header className={`premium-navbar ${isScrolled ? 'is-scrolled' : ''} ${isAdmin ? 'navbar-has-admin' : ''}`}>
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
            onClick={() => handleNavClick('#student-guidance')}
            className="nav-link-btn"
          >
            Student Guidance
          </button>
          <button
            onClick={() => handleNavClick('#resources')}
            className="nav-link-btn"
          >
            Resources
          </button>
          <button
            onClick={() => handleNavClick('fees')}
            className="nav-link-btn"
            style={{
              color: currentView === 'fees' ? '#FFFFFF' : '#E2E8F0',
              fontWeight: currentView === 'fees' ? 700 : 500,
            }}
            id="nav-fees-btn"
          >
            Fee Calculator
          </button>
          <button
            onClick={() => handleNavClick('#contact')}
            className="nav-link-btn"
          >
            Contact
          </button>
        </nav>

        {/* Right Actions (Desktop) */}
        <div className="nav-auth-actions">
          {user ? (
            <>
              {/* Student Quick Navigation Buttons */}
              {user.role === 'STUDENT' && (
                <>
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="btn-nav-module"
                    title="Student Dashboard"
                    id="nav-dashboard-btn"
                  >
                    <LayoutDashboard size={15} color="#A78BFA" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={() => onNavigate('profile-intake')}
                    className="btn-nav-module"
                    title="Student Profile"
                    id="nav-my-profile-btn"
                  >
                    <GraduationCap size={15} color="#A78BFA" />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => onNavigate('exam-intelligence')}
                    className="btn-nav-module"
                    title="Entrance Exam Intelligence & Mock Tests"
                    id="nav-exam-intelligence-btn"
                  >
                    <Target size={15} color="#A78BFA" />
                    <span>Exam Intelligence</span>
                  </button>
                  <button
                    onClick={() => onNavigate('assessments')}
                    className="btn-nav-module"
                    title="Module 11: Eight-Pathway Assessment Suite"
                    id="nav-assessments-btn"
                  >
                    <Award size={15} color="#A78BFA" />
                    <span>Assessments</span>
                  </button>
                </>
              )}

              {/* Staff Quick Action Button */}
              {(user.role === 'COUNSELLOR' || user.role === 'ADMIN') && (
                <button
                  onClick={() => onNavigate('counsellor-queue')}
                  className="btn-nav-module"
                  id="nav-counsellor-queue-btn"
                >
                  <ShieldCheck size={15} color="#A78BFA" />
                  <span>Verification Queue</span>
                </button>
              )}

              {/* Admin College Management Buttons */}
              {user.role === 'ADMIN' && (
                <>
                  <button
                    onClick={() => onNavigate('college-tier-management')}
                    className="btn-nav-module"
                    id="nav-college-tiers-btn"
                    title="College Tier Management (Safe / Best-Fit / Aspirational)"
                  >
                    <Layers size={15} color="#A78BFA" />
                    <span>College Tiers</span>
                  </button>
                  <button
                    onClick={() => onNavigate('college-management')}
                    className="btn-nav-module"
                    id="nav-college-mgmt-btn"
                    title="College & Course Management"
                  >
                    <Building2 size={15} color="#A78BFA" />
                    <span>College Management</span>
                  </button>
                  <button
                    onClick={() => onNavigate('scholarship-management')}
                    className="btn-nav-module"
                    id="nav-scholarships-mgmt-btn"
                    title="Scholarship Catalogue Management"
                  >
                    <Award size={15} color="#A78BFA" />
                    <span>Scholarships</span>
                  </button>
                </>
              )}

              {/* Counsellor College Catalogue Button */}
              {user.role === 'COUNSELLOR' && (
                <button
                  onClick={() => onNavigate('colleges')}
                  className="btn-nav-module"
                  id="nav-counsellor-colleges-btn"
                  title="College & Course Catalogue"
                >
                  <Building2 size={15} color="#A78BFA" />
                  <span>Colleges</span>
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
            onClick={() => handleNavClick('#student-guidance')}
            className="nav-mobile-link"
            id="mobile-nav-guidance-btn"
          >
            Student Guidance
          </button>
          <button
            onClick={() => handleNavClick('#resources')}
            className="nav-mobile-link"
            id="mobile-nav-resources-btn"
          >
            Resources
          </button>
          <button
            onClick={() => handleNavClick('fees')}
            className="nav-mobile-link"
            id="mobile-nav-fees-btn"
          >
            Fee Calculator
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
                <>
                  <button
                    onClick={() => handleNavClick('dashboard')}
                    className="btn-primary-indigo"
                    style={{ width: '100%', justifyContent: 'center' }}
                    id="mobile-nav-dashboard-btn"
                  >
                    <LayoutDashboard size={16} /> Student Dashboard
                  </button>
                  <button
                    onClick={() => handleNavClick('profile-intake')}
                    className="btn-secondary-outline"
                    style={{ width: '100%', justifyContent: 'center' }}
                    id="mobile-nav-profile-btn"
                  >
                    <GraduationCap size={16} /> My Student Profile
                  </button>
                  <button
                    onClick={() => handleNavClick('preferences')}
                    className="btn-secondary-outline"
                    style={{ width: '100%', justifyContent: 'center' }}
                    id="mobile-nav-preferences-btn"
                  >
                    <Compass size={16} /> Course Preferences
                  </button>
                  <button
                    onClick={() => handleNavClick('education')}
                    className="btn-secondary-outline"
                    style={{ width: '100%', justifyContent: 'center' }}
                    id="mobile-nav-education-btn"
                  >
                    <BookOpen size={16} /> Education Details
                  </button>
                  <button
                    onClick={() => handleNavClick('exam-intelligence')}
                    className="btn-secondary-outline"
                    style={{ width: '100%', justifyContent: 'center' }}
                    id="mobile-nav-exam-intelligence-btn"
                  >
                    <Target size={16} /> Exam Intelligence & Mock Tests
                  </button>
                  <button
                    onClick={() => handleNavClick('assessments')}
                    className="btn-secondary-outline"
                    style={{ width: '100%', justifyContent: 'center' }}
                    id="mobile-nav-assessments-btn"
                  >
                    <Award size={16} /> Module 11: Assessment Suite
                  </button>
                </>
              )}

              {(user.role === 'COUNSELLOR' || user.role === 'ADMIN') && (
                <button
                  onClick={() => handleNavClick('counsellor-queue')}
                  className="btn-primary-indigo"
                  style={{ width: '100%', justifyContent: 'center' }}
                  id="mobile-nav-counsellor-queue-btn"
                >
                  <ShieldCheck size={16} /> Verification Queue
                </button>
              )}

              {user.role === 'ADMIN' && (
                <>
                  <button
                    onClick={() => handleNavClick('college-tier-management')}
                    className="btn-secondary-outline"
                    style={{ width: '100%', justifyContent: 'center' }}
                    id="mobile-nav-college-tiers-btn"
                  >
                    <Layers size={16} /> College Tiers
                  </button>
                  <button
                    onClick={() => handleNavClick('college-management')}
                    className="btn-secondary-outline"
                    style={{ width: '100%', justifyContent: 'center' }}
                    id="mobile-nav-college-mgmt-btn"
                  >
                    <Building2 size={16} /> College Management
                  </button>
                  <button
                    onClick={() => handleNavClick('scholarship-management')}
                    className="btn-secondary-outline"
                    style={{ width: '100%', justifyContent: 'center' }}
                    id="mobile-nav-scholarships-mgmt-btn"
                  >
                    <Award size={16} /> Scholarships
                  </button>
                </>
              )}

              {user.role === 'COUNSELLOR' && (
                <button
                  onClick={() => handleNavClick('colleges')}
                  className="btn-secondary-outline"
                  style={{ width: '100%', justifyContent: 'center' }}
                  id="mobile-nav-colleges-btn"
                >
                  <Building2 size={16} /> College Catalogue
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
