import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { ProfileService } from '../services/profile.service';
import { PreferencesService } from '../../preferences/services/preferences.service';
import { StudentProfileRecord, StudentProfileIntakeInput } from '../profile.types';
import { StudentPreferenceRecord, StudentPreferenceInput } from '../../preferences/preferences.types';
import { BasicInfoEditForm } from '../components/BasicInfoEditForm';
import { PreferencesEditForm } from '../../preferences/components/PreferencesEditForm';
import { EducationService } from '../../education/services/education.service';
import { StudentEducationRecord, StudentEducationInput } from '../../education/education.types';
import { EducationEditForm } from '../../education/components/EducationEditForm';
import { EducationViewCard } from '../../education/components/EducationViewCard';
import { EntranceExamsView } from '../../entrance/components/EntranceExamsView';
import { PersonalInformationView } from '../../personal/components/PersonalInformationView';
import { CollegeDiscoveryView } from '../../colleges/components/CollegeDiscoveryView';
import { ThreeTierFitView } from '../../recommendations/components/ThreeTierFitView';
import { ScholarshipDiscoveryView } from '../../scholarships/components/ScholarshipDiscoveryView';
import { FeeComparisonDashboard } from '../../fees/components/FeeComparisonDashboard';
import { EightPathwayAssessmentSuite } from '../../assessments/components/EightPathwayAssessmentSuite';
import { AppointmentsDashboard } from '../../appointments/components/AppointmentsDashboard';
import { AppointmentsService } from '../../appointments/services/appointments.service';
import { CounsellorSummary } from '../../appointments/appointments.types';
import '../../../shared/styles/student-dashboard.css';
import {
  LayoutDashboard,
  User,
  Sliders,
  GraduationCap,
  FileText,
  IdCard,
  Compass,
  Award,
  Bookmark,
  Coins,
  Calculator,
  Calendar,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Pencil,
  ArrowLeft,
  Check,
  ExternalLink,
  UserCheck,
  CalendarCheck,
} from 'lucide-react';

interface StudentDashboardPageProps {
  initialSection?: 'dashboard' | 'basic' | 'preferences' | 'education' | 'entrance' | 'personal' | 'colleges' | 'recommendations' | 'scholarships' | 'fees' | 'assessments' | 'appointments' | 'shortlist';
  onNavigateHome?: () => void;
}

export const StudentDashboardPage: React.FC<StudentDashboardPageProps> = ({
  initialSection = 'dashboard',
  onNavigateHome,
}) => {
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState<StudentProfileRecord | null>(null);
  const [preferences, setPreferences] = useState<StudentPreferenceRecord | null>(null);
  const [education, setEducation] = useState<StudentEducationRecord | null>(null);
  const [assignedCounsellor, setAssignedCounsellor] = useState<CounsellorSummary | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditingBasic, setIsEditingBasic] = useState<boolean>(false);
  const [isEditingPreferences, setIsEditingPreferences] = useState<boolean>(
    initialSection === 'preferences'
  );
  const [isEditingEducation, setIsEditingEducation] = useState<boolean>(
    initialSection === 'education'
  );

  const [activeMenu, setActiveMenu] = useState<string>(
    initialSection === 'preferences'
      ? 'preferences'
      : initialSection === 'education'
      ? 'education'
      : initialSection === 'basic'
      ? 'basic'
      : initialSection === 'entrance'
      ? 'entrance'
      : initialSection === 'personal'
      ? 'personal'
      : initialSection === 'colleges'
      ? 'colleges'
      : initialSection === 'recommendations'
      ? 'recommendations'
      : initialSection === 'scholarships'
      ? 'scholarships'
      : initialSection === 'fees'
      ? 'fees'
      : initialSection === 'assessments'
      ? 'assessments'
      : initialSection === 'appointments'
      ? 'appointments'
      : initialSection === 'shortlist'
      ? 'shortlist'
      : 'dashboard'
  );

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      // 1. Fetch Profile
      const profRes = await ProfileService.getMyProfile();
      if (profRes.success && profRes.data) {
        setProfile(profRes.data);
      } else {
        setProfile(null);
      }

      // 2. Fetch Preferences
      const prefRes = await PreferencesService.getMyPreferences();
      if (prefRes.success && prefRes.data) {
        setPreferences(prefRes.data);
      } else {
        setPreferences(null);
      }

      // 3. Fetch Education Details
      const eduRes = await EducationService.getMyEducation();
      if (eduRes.success && eduRes.data) {
        setEducation(eduRes.data);
      } else {
        setEducation(null);
      }

      // 4. Fetch Assigned Counsellor from Appointments metadata
      try {
        const metaRes = await AppointmentsService.getMeta();
        if (metaRes.success && metaRes.data) {
          const assigned = metaRes.data.studentInfo?.assignedCounsellor || 
                           metaRes.data.counsellors?.find((c: any) => c.isAssigned) || 
                           null;
          setAssignedCounsellor(assigned);
        }
      } catch {
        // Appointments/counsellor metadata not loaded yet
      }
    } catch {
      // Student record not initialized yet
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (initialSection === 'preferences') {
      setActiveMenu('preferences');
    } else if (initialSection === 'education') {
      setActiveMenu('education');
    } else if (initialSection === 'basic') {
      setActiveMenu('basic');
    } else if (initialSection === 'entrance') {
      setActiveMenu('entrance');
    } else if (initialSection === 'colleges') {
      setActiveMenu('colleges');
    } else if (initialSection === 'recommendations') {
      setActiveMenu('recommendations');
    } else if (initialSection === 'scholarships') {
      setActiveMenu('scholarships');
    } else if (initialSection === 'fees') {
      setActiveMenu('fees');
    } else if (initialSection === 'assessments') {
      setActiveMenu('assessments');
    } else if (initialSection === 'appointments') {
      setActiveMenu('appointments');
    } else if (initialSection === 'shortlist') {
      setActiveMenu('shortlist');
    } else if (initialSection === 'dashboard') {
      setActiveMenu('dashboard');
    }
  }, [initialSection]);

  // Handle Basic Info Submission
  const handleBasicInfoSubmit = async (data: StudentProfileIntakeInput) => {
    return await ProfileService.submitIntake(data);
  };

  const handleBasicInfoSuccess = (record: StudentProfileRecord) => {
    setProfile(record);
    setIsEditingBasic(false);
    setFeedback({
      type: 'success',
      message: 'Basic Information successfully updated and submitted for review.',
    });
  };

  // Handle Preferences Submission
  const handlePreferencesSubmit = async (data: StudentPreferenceInput) => {
    return await PreferencesService.savePreferences(data);
  };

  const handlePreferencesSuccess = (record: StudentPreferenceRecord) => {
    setPreferences(record);
    setIsEditingPreferences(false);
    setFeedback({
      type: 'success',
      message: 'Academic & study destination preferences successfully updated.',
    });
  };

  // Handle Education Details Submission
  const handleEducationSubmit = async (data: StudentEducationInput) => {
    return await EducationService.saveEducation(data);
  };

  const handleEducationSuccess = (record: StudentEducationRecord) => {
    setEducation(record);
    setIsEditingEducation(false);
    setFeedback({
      type: 'success',
      message: 'Education details successfully saved for recommendation matching.',
    });
  };

  // Completion calculations based strictly on real application data
  const basicInfoPercent = profile ? 100 : 0;
  const preferencesPercent = preferences
    ? preferences.countriesNotFinalized && preferences.coursesNotFinalized
      ? 100
      : preferences.countries.length > 0 || (preferences.departmentPreferences && preferences.departmentPreferences.length > 0)
      ? 100
      : 50
    : 0;
  const educationPercent = education ? 100 : 0;
  const overallPercent = Math.round(
    basicInfoPercent * 0.35 + preferencesPercent * 0.35 + educationPercent * 0.30
  );

  // Dynamic greeting based on current local time
  const currentHour = new Date().getHours();
  const timeGreeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  const studentDisplayName = profile?.fullName || user?.email?.split('@')[0] || 'Student';
  const verificationStatus = profile?.verificationStatus || 'PENDING';

  // Sidebar navigation handler
  const handleNavSelection = (section: string) => {
    setActiveMenu(section);
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Next Best Action config based on real progress
  const getNextAction = () => {
    if (!profile) {
      return {
        title: 'Complete your student profile',
        description: 'Add your basic personal and academic details to begin your personalized guidance journey.',
        buttonText: 'Complete Profile →',
        action: () => {
          setActiveMenu('basic');
          setIsEditingBasic(true);
        },
      };
    }
    if (!preferences) {
      return {
        title: 'Specify study preferences',
        description: 'Select your preferred countries and academic disciplines to help counsellors tailor your options.',
        buttonText: 'Add Preferences →',
        action: () => {
          setActiveMenu('preferences');
          setIsEditingPreferences(true);
        },
      };
    }
    if (!education) {
      return {
        title: 'Add education details',
        description: 'Record your high school grades and subject scores so counsellors can match university eligibility.',
        buttonText: 'Add Education Details →',
        action: () => {
          setActiveMenu('education');
          setIsEditingEducation(true);
        },
      };
    }
    return {
      title: 'Consult with education advisor',
      description: 'Your academic profile and preferences are up to date. Review guidance recommendations with our counsellors.',
      buttonText: 'Explore Guidance →',
      action: () => setActiveModal('guidance'),
    };
  };

  const nextAction = getNextAction();

  // Active page title calculation
  const getActiveTitle = () => {
    switch (activeMenu) {
      case 'basic':
        return 'My Profile';
      case 'preferences':
        return 'Study Preferences';
      case 'education':
        return 'Education Details';
      case 'entrance':
        return 'Entrance Exams';
      case 'personal':
        return 'Personal Information';
      case 'colleges':
        return 'College Discovery';
      case 'recommendations':
        return 'Three-Tier Fit';
      case 'scholarships':
        return 'Scholarship Discovery';
      case 'fees':
        return 'Fee Calculator & Country Comparison';
      case 'assessments':
        return 'Assessments';
      case 'shortlist':
        return 'University Shortlist';
      case 'appointments':
        return 'Appointments';
      case 'dashboard':
      default:
        return 'Dashboard';
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '8rem 1rem', background: '#F7F8FC', minHeight: '100vh', color: '#667085' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTopColor: '#5B4FE9', borderRadius: '50%', margin: '0 auto 1.25rem', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#172033', marginBottom: '0.4rem' }}>
          Loading Student Command Center...
        </div>
        <p style={{ fontSize: '0.86rem', color: '#667085' }}>Synchronizing authenticated student records and progress...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="cmd-dashboard-root">
      {/* Mobile Sidebar Backdrop */}
      <div
        className={`cmd-sidebar-backdrop ${mobileSidebarOpen ? 'open' : ''}`}
        onClick={() => setMobileSidebarOpen(false)}
      />

      {/* LEFT: FIXED SOPHISTICATED DARK NAVY SIDEBAR (#081426) */}
      <aside className={`cmd-sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
        {/* Sidebar Brand Wordmark */}
        <div
          className="cmd-sidebar-brand"
          onClick={() => handleNavSelection('dashboard')}
          title="Student Command Center"
        >
          <div className="cmd-brand-title">
            <div className="cmd-brand-icon-box">
              <Compass size={16} />
            </div>
            <span>SUPERCONSCIOUSNESS</span>
          </div>
          <span className="cmd-brand-subtitle">
            EDUCATIONAL CONSULTANCY & GUIDANCE
          </span>
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="cmd-sidebar-nav">
          <div className="cmd-nav-category-label">Command Center</div>

          <button
            className={`cmd-nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavSelection('dashboard')}
          >
            <span className="cmd-nav-item-icon">
              <LayoutDashboard size={17} />
            </span>
            <span>Dashboard</span>
          </button>

          <button
            className={`cmd-nav-item ${activeMenu === 'basic' ? 'active' : ''}`}
            onClick={() => handleNavSelection('basic')}
          >
            <span className="cmd-nav-item-icon">
              <User size={17} />
            </span>
            <span>My Profile</span>
            {basicInfoPercent === 100 && (
              <span className="cmd-nav-item-badge" style={{ background: 'rgba(22, 163, 74, 0.2)', color: '#4ADE80' }}>
                Done
              </span>
            )}
          </button>

          <button
            className={`cmd-nav-item ${activeMenu === 'preferences' ? 'active' : ''}`}
            onClick={() => handleNavSelection('preferences')}
          >
            <span className="cmd-nav-item-icon">
              <Sliders size={17} />
            </span>
            <span>Preferences</span>
            {preferencesPercent === 100 && (
              <span className="cmd-nav-item-badge" style={{ background: 'rgba(22, 163, 74, 0.2)', color: '#4ADE80' }}>
                Done
              </span>
            )}
          </button>

          <button
            className={`cmd-nav-item ${activeMenu === 'education' ? 'active' : ''}`}
            onClick={() => handleNavSelection('education')}
          >
            <span className="cmd-nav-item-icon">
              <GraduationCap size={17} />
            </span>
            <span>Education</span>
            {educationPercent === 100 && (
              <span className="cmd-nav-item-badge" style={{ background: 'rgba(22, 163, 74, 0.2)', color: '#4ADE80' }}>
                Done
              </span>
            )}
          </button>

          <div className="cmd-nav-category-label" style={{ marginTop: '0.8rem' }}>Discovery & Planning</div>

          <button
            className={`cmd-nav-item ${activeMenu === 'entrance' ? 'active' : ''}`}
            onClick={() => handleNavSelection('entrance')}
          >
            <span className="cmd-nav-item-icon">
              <FileText size={17} />
            </span>
            <span>Entrance Exams</span>
          </button>

          <button
            className={`cmd-nav-item ${activeMenu === 'personal' ? 'active' : ''}`}
            onClick={() => handleNavSelection('personal')}
          >
            <span className="cmd-nav-item-icon">
              <IdCard size={17} />
            </span>
            <span>Personal Information</span>
          </button>

          <button
            className={`cmd-nav-item ${activeMenu === 'colleges' ? 'active' : ''}`}
            onClick={() => handleNavSelection('colleges')}
          >
            <span className="cmd-nav-item-icon">
              <Compass size={17} />
            </span>
            <span>College Discovery</span>
          </button>

          <button
            className={`cmd-nav-item ${activeMenu === 'recommendations' ? 'active' : ''}`}
            onClick={() => handleNavSelection('recommendations')}
            id="dash-nav-recommendations-btn"
          >
            <span className="cmd-nav-item-icon">
              <Sparkles size={17} />
            </span>
            <span>Three-Tier Fit</span>
          </button>

          <button
            className={`cmd-nav-item ${activeMenu === 'assessments' ? 'active' : ''}`}
            onClick={() => handleNavSelection('assessments')}
          >
            <span className="cmd-nav-item-icon">
              <Award size={17} />
            </span>
            <span>Assessments</span>
          </button>

          <button
            className={`cmd-nav-item ${activeMenu === 'shortlist' ? 'active' : ''}`}
            onClick={() => handleNavSelection('shortlist')}
          >
            <span className="cmd-nav-item-icon">
              <Bookmark size={17} />
            </span>
            <span>Shortlist</span>
          </button>

          <button
            className={`cmd-nav-item ${activeMenu === 'scholarships' ? 'active' : ''}`}
            onClick={() => handleNavSelection('scholarships')}
          >
            <span className="cmd-nav-item-icon">
              <Coins size={17} />
            </span>
            <span>Scholarships</span>
          </button>

          <button
            className={`cmd-nav-item ${activeMenu === 'fees' ? 'active' : ''}`}
            onClick={() => handleNavSelection('fees')}
            id="dash-nav-fees-btn"
          >
            <span className="cmd-nav-item-icon">
              <Calculator size={17} />
            </span>
            <span>Fee Calculator</span>
          </button>

          <button
            className={`cmd-nav-item ${activeMenu === 'appointments' ? 'active' : ''}`}
            onClick={() => handleNavSelection('appointments')}
          >
            <span className="cmd-nav-item-icon">
              <Calendar size={17} />
            </span>
            <span>Appointments</span>
          </button>
        </nav>

        {/* Sidebar Bottom Items: Settings & Logout */}
        <div className="cmd-sidebar-footer">
          <button
            className="cmd-footer-item"
            onClick={() => setActiveModal('settings')}
            title="System Preferences"
          >
            <Settings size={17} />
            <span>Settings</span>
          </button>

          <button
            className="cmd-footer-item logout"
            onClick={logout}
            title="Sign out of student portal"
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* RIGHT: MAIN CONTENT WRAPPER */}
      <div className="cmd-main-wrapper">
        {/* TOP HEADER */}
        <header className="cmd-top-header">
          <div className="cmd-header-left">
            {/* Hamburger Toggle (Visible on Mobile/Tablet) */}
            <button
              className="cmd-mobile-menu-btn"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              aria-label="Toggle navigation drawer"
            >
              {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="cmd-page-title-box">
              <h1 className="cmd-page-title">{getActiveTitle()}</h1>
              <span className="cmd-breadcrumb">Student Command Center &bull; Consultancy Portal</span>
            </div>
          </div>

          <div className="cmd-header-right">
            {/* Direct Link to Homepage if requested */}
            {onNavigateHome && (
              <button
                className="cmd-header-website-btn"
                onClick={onNavigateHome}
                title="View consultancy public portal"
              >
                <span>Website</span>
                <ExternalLink size={13} />
              </button>
            )}

            {/* Notification Bell Icon */}
            <button
              className="cmd-notification-btn"
              onClick={() => setActiveModal('notifications')}
              title="Notifications"
            >
              <Bell size={17} />
              <span className="cmd-notification-badge" />
            </button>

            {/* Student Profile / Avatar & Name */}
            <div
              className="cmd-user-dropdown-btn"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              title={`Signed in as ${user?.email}`}
            >
              <div className="cmd-user-avatar">
                {studentDisplayName.charAt(0).toUpperCase()}
              </div>
              <div className="cmd-user-info-text">
                <span className="cmd-user-name">{studentDisplayName}</span>
                <span className="cmd-user-role-badge">STUDENT</span>
              </div>
              <ChevronDown size={14} color="#667085" />
            </div>
          </div>
        </header>

        {/* User Profile Quick Menu Dropdown */}
        {userDropdownOpen && (
          <div
            style={{
              position: 'absolute',
              top: '68px',
              right: '2rem',
              background: '#FFFFFF',
              border: '1px solid #EAECF0',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(16, 24, 40, 0.12)',
              width: '240px',
              zIndex: 120,
              padding: '0.75rem',
            }}
          >
            <div style={{ padding: '0.5rem 0.65rem 0.75rem', borderBottom: '1px solid #F1F3F7' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#172033' }}>
                {studentDisplayName}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#667085', marginTop: '0.15rem' }}>
                {user?.email}
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', fontSize: '0.72rem', fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '0.15rem 0.5rem', borderRadius: '10px' }}>
                Status: {verificationStatus}
              </div>
            </div>

            <div style={{ padding: '0.5rem 0' }}>
              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  handleNavSelection('basic');
                }}
                style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0.65rem', background: 'none', border: 'none', fontSize: '0.84rem', color: '#172033', cursor: 'pointer', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <User size={15} color="#5B4FE9" /> My Profile
              </button>
              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  handleNavSelection('preferences');
                }}
                style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0.65rem', background: 'none', border: 'none', fontSize: '0.84rem', color: '#172033', cursor: 'pointer', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Sliders size={15} color="#5B4FE9" /> Preferences
              </button>
              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  handleNavSelection('education');
                }}
                style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0.65rem', background: 'none', border: 'none', fontSize: '0.84rem', color: '#172033', cursor: 'pointer', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <GraduationCap size={15} color="#5B4FE9" /> Education Details
              </button>
            </div>

            <div style={{ borderTop: '1px solid #F1F3F7', paddingTop: '0.5rem' }}>
              <button
                onClick={logout}
                style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0.65rem', background: 'none', border: 'none', fontSize: '0.84rem', color: '#DC2626', cursor: 'pointer', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          </div>
        )}

        {/* MAIN BODY AREA */}
        <main className="cmd-content-container">
          {/* Feedback banner if updated */}
          {feedback && (
            <div
              className={`dash-alert ${
                feedback.type === 'success' ? 'dash-alert-success' : 'dash-alert-error'
              }`}
            >
              {feedback.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* ==========================================================
              VIEW 1: DASHBOARD COMMAND CENTER OVERVIEW
             ========================================================== */}
          {activeMenu === 'dashboard' && (
            <div>
              {/* 1. WELCOME SECTION */}
              <div className="cmd-welcome-card">
                <div className="cmd-welcome-text-group">
                  <h2 className="cmd-welcome-greeting">
                    {timeGreeting}, {studentDisplayName}.
                  </h2>
                  <p className="cmd-welcome-subtitle">
                    Let's continue building your path toward the future.
                  </p>
                </div>

                <div className="cmd-welcome-status-box">
                  <span className="cmd-status-label">Profile Status</span>
                  <div
                    className={`cmd-status-pill ${
                      verificationStatus === 'VERIFIED'
                        ? 'verified'
                        : verificationStatus === 'REJECTED'
                        ? 'rejected'
                        : 'pending'
                    }`}
                  >
                    <span className="cmd-status-dot" />
                    <span>{verificationStatus}</span>
                  </div>
                </div>
              </div>

              {/* 2. PROFILE COMPLETION & NEXT BEST ACTION GRID */}
              <div className="cmd-progress-action-grid">
                {/* Profile Completion Card */}
                <div className="cmd-card-standard">
                  <div>
                    <div className="cmd-card-header">
                      <h3 className="cmd-card-title">Your profile</h3>
                      <span className="cmd-completion-pct">{overallPercent}%</span>
                    </div>

                    <div className="cmd-progress-bar-track">
                      <div
                        className="cmd-progress-bar-fill"
                        style={{ width: `${Math.max(6, overallPercent)}%` }}
                      />
                    </div>

                    <p className="cmd-card-description">
                      Complete your profile to get more personalised guidance.
                    </p>
                  </div>

                  <button
                    className="cmd-btn-primary"
                    onClick={() => {
                      if (!profile) {
                        setActiveMenu('basic');
                        setIsEditingBasic(true);
                      } else if (!preferences) {
                        setActiveMenu('preferences');
                        setIsEditingPreferences(true);
                      } else if (!education) {
                        setActiveMenu('education');
                        setIsEditingEducation(true);
                      } else {
                        setActiveMenu('basic');
                      }
                    }}
                  >
                    <span>Continue Profile</span>
                    <ArrowRight size={15} />
                  </button>
                </div>

                {/* Next Best Action Card */}
                <div className="cmd-next-step-card">
                  <div>
                    <div className="cmd-badge-next-step">
                      <Sparkles size={12} />
                      <span>Your next step</span>
                    </div>
                    <h3 className="cmd-next-step-title">{nextAction.title}</h3>
                    <p className="cmd-card-description">{nextAction.description}</p>
                  </div>

                  <button className="cmd-btn-primary" onClick={nextAction.action}>
                    <span>{nextAction.buttonText}</span>
                  </button>
                </div>
              </div>

              {/* DEDICATED ASSIGNED COUNSELLOR SECTION */}
              <div style={{ marginBottom: '1.75rem' }}>
                {assignedCounsellor ? (
                  <div
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.25rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid #F1F5F9',
                        paddingBottom: '0.875rem',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: '#EFF6FF',
                            color: '#2563EB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <UserCheck size={18} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                            My Assigned Counsellor
                          </h3>
                          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            Your designated academic advisor assigned by administration
                          </span>
                        </div>
                      </div>

                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: '#DCFCE7',
                          color: '#15803D',
                        }}
                      >
                        <ShieldCheck size={14} />
                        <span>Verified & Active</span>
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '1.25rem',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div
                          style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.35rem',
                            fontWeight: 800,
                            flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                          }}
                        >
                          {assignedCounsellor.fullName?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                            {assignedCounsellor.fullName}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#2563EB', fontWeight: 600, marginTop: '2px' }}>
                            {assignedCounsellor.specialization || 'Academic & Admissions Guidance'}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '3px' }}>
                            {assignedCounsellor.experienceYears ? `${assignedCounsellor.experienceYears} Years Experience` : 'Senior Advisory Staff'} &bull; {assignedCounsellor.email}
                          </div>
                        </div>
                      </div>

                      <div>
                        {assignedCounsellor.bio && (
                          <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0 0 0.5rem', lineHeight: 1.45 }}>
                            {assignedCounsellor.bio}
                          </p>
                        )}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                          {(Array.isArray(assignedCounsellor.skills) ? assignedCounsellor.skills : ['Admissions', 'Career Counselling']).slice(0, 4).map((sk: string, idx: number) => (
                            <span
                              key={idx}
                              style={{
                                padding: '0.2rem 0.5rem',
                                background: '#F1F5F9',
                                color: '#334155',
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                              }}
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          className="cmd-btn-primary"
                          onClick={() => handleNavSelection('appointments')}
                          style={{
                            padding: '0.75rem 1.25rem',
                            borderRadius: '10px',
                            background: '#2563EB',
                            color: '#FFFFFF',
                            border: 'none',
                            fontWeight: 700,
                            fontSize: '0.86rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                          }}
                        >
                          <CalendarCheck size={16} />
                          <span>Book Appointment</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      background: '#F8FAFC',
                      border: '1px dashed #CBD5E1',
                      borderRadius: '14px',
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: '#E2E8F0',
                          color: '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Clock size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1E293B' }}>
                          Counsellor Assignment in Progress
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                          The administration will assign a dedicated counsellor to guide your study applications.
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleNavSelection('appointments')}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        color: '#334155',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      View Appointments Desk
                    </button>
                  </div>
                )}
              </div>

              {/* 3. STUDENT JOURNEY HORIZONTAL PROGRESS TIMELINE */}
              <div className="cmd-journey-section">
                <div className="cmd-section-title-wrap">
                  <div>
                    <h3 className="cmd-section-heading">Your journey</h3>
                    <p className="cmd-section-subheading">
                      Track your progressive milestone achievements from initial intake to verified advisory.
                    </p>
                  </div>
                </div>

                <div className="cmd-journey-timeline">
                  {/* Step 1: Profile */}
                  <div
                    className={`cmd-journey-step ${
                      basicInfoPercent === 100 ? 'completed' : 'in-progress'
                    }`}
                    onClick={() => handleNavSelection('basic')}
                  >
                    <div className="cmd-step-node">
                      {basicInfoPercent === 100 ? <Check size={18} strokeWidth={2.5} /> : '01'}
                    </div>
                    <span className="cmd-step-number">Step 01</span>
                    <span className="cmd-step-title">Profile</span>
                    <span className="cmd-step-status-tag">
                      {basicInfoPercent === 100 ? 'Completed' : 'In Progress'}
                    </span>
                  </div>

                  {/* Step 2: Preferences */}
                  <div
                    className={`cmd-journey-step ${
                      preferencesPercent === 100
                        ? 'completed'
                        : basicInfoPercent === 100
                        ? 'in-progress'
                        : 'upcoming'
                    }`}
                    onClick={() => handleNavSelection('preferences')}
                  >
                    <div className="cmd-step-node">
                      {preferencesPercent === 100 ? <Check size={18} strokeWidth={2.5} /> : '02'}
                    </div>
                    <span className="cmd-step-number">Step 02</span>
                    <span className="cmd-step-title">Preferences</span>
                    <span className="cmd-step-status-tag">
                      {preferencesPercent === 100
                        ? 'Completed'
                        : basicInfoPercent === 100
                        ? 'In Progress'
                        : 'Upcoming'}
                    </span>
                  </div>

                  {/* Step 3: Education */}
                  <div
                    className={`cmd-journey-step ${
                      educationPercent === 100
                        ? 'completed'
                        : preferencesPercent === 100
                        ? 'in-progress'
                        : 'upcoming'
                    }`}
                    onClick={() => handleNavSelection('education')}
                  >
                    <div className="cmd-step-node">
                      {educationPercent === 100 ? <Check size={18} strokeWidth={2.5} /> : '03'}
                    </div>
                    <span className="cmd-step-number">Step 03</span>
                    <span className="cmd-step-title">Education</span>
                    <span className="cmd-step-status-tag">
                      {educationPercent === 100
                        ? 'Completed'
                        : preferencesPercent === 100
                        ? 'In Progress'
                        : 'Upcoming'}
                    </span>
                  </div>

                  {/* Step 4: Guidance */}
                  <div
                    className={`cmd-journey-step ${
                      educationPercent === 100 ? 'in-progress' : 'upcoming'
                    }`}
                    onClick={() => setActiveModal('guidance')}
                  >
                    <div className="cmd-step-node">
                      <Compass size={18} />
                    </div>
                    <span className="cmd-step-number">Step 04</span>
                    <span className="cmd-step-title">Guidance</span>
                    <span className="cmd-step-status-tag">
                      {educationPercent === 100 ? 'In Progress' : 'Upcoming'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4. QUICK ACCESS ("EXPLORE YOUR PLATFORM") */}
              <div className="cmd-quick-access-section">
                <div className="cmd-section-title-wrap">
                  <div>
                    <h3 className="cmd-section-heading">Explore your platform</h3>
                    <p className="cmd-section-subheading">
                      Access all consultancy modules and planning workspaces.
                    </p>
                  </div>
                </div>

                <div className="cmd-quick-access-grid">
                  <div
                    className="cmd-quick-card"
                    onClick={() => handleNavSelection('basic')}
                  >
                    <div className="cmd-quick-card-left">
                      <div className="cmd-quick-icon-box">
                        <User size={20} />
                      </div>
                      <div className="cmd-quick-text">
                        <span className="cmd-quick-title">My Profile</span>
                        <span className="cmd-quick-desc">Manage personal and address records</span>
                      </div>
                    </div>
                    <div className="cmd-quick-arrow">
                      <ArrowRight size={16} />
                    </div>
                  </div>

                  <div
                    className="cmd-quick-card"
                    onClick={() => handleNavSelection('preferences')}
                  >
                    <div className="cmd-quick-card-left">
                      <div className="cmd-quick-icon-box">
                        <Sliders size={20} />
                      </div>
                      <div className="cmd-quick-text">
                        <span className="cmd-quick-title">Preferences</span>
                        <span className="cmd-quick-desc">Target countries and study courses</span>
                      </div>
                    </div>
                    <div className="cmd-quick-arrow">
                      <ArrowRight size={16} />
                    </div>
                  </div>

                  <div
                    className="cmd-quick-card"
                    onClick={() => handleNavSelection('education')}
                  >
                    <div className="cmd-quick-card-left">
                      <div className="cmd-quick-icon-box">
                        <GraduationCap size={20} />
                      </div>
                      <div className="cmd-quick-text">
                        <span className="cmd-quick-title">Education</span>
                        <span className="cmd-quick-desc">High school grades and subject scores</span>
                      </div>
                    </div>
                    <div className="cmd-quick-arrow">
                      <ArrowRight size={16} />
                    </div>
                  </div>

                  <div
                    className="cmd-quick-card"
                    onClick={() => handleNavSelection('entrance')}
                  >
                    <div className="cmd-quick-card-left">
                      <div className="cmd-quick-icon-box">
                        <FileText size={20} />
                      </div>
                      <div className="cmd-quick-text">
                        <span className="cmd-quick-title">Entrance Exams</span>
                        <span className="cmd-quick-desc">Standardized tests & cutoff planning</span>
                      </div>
                    </div>
                    <div className="cmd-quick-arrow">
                      <ArrowRight size={16} />
                    </div>
                  </div>

                  <div
                    className="cmd-quick-card"
                    id="quick-card-personal"
                    onClick={() => handleNavSelection('personal')}
                  >
                    <div className="cmd-quick-card-left">
                      <div className="cmd-quick-icon-box" style={{ background: '#F5F3FF', color: '#7C3AED' }}>
                        <IdCard size={20} />
                      </div>
                      <div className="cmd-quick-text">
                        <span className="cmd-quick-title">Personal Info</span>
                        <span className="cmd-quick-desc">Family, activities & honors</span>
                      </div>
                    </div>
                    <div className="cmd-quick-arrow">
                      <ArrowRight size={16} />
                    </div>
                  </div>

                  <div
                    className="cmd-quick-card"
                    onClick={() => handleNavSelection('colleges')}
                  >
                    <div className="cmd-quick-card-left">
                      <div className="cmd-quick-icon-box">
                        <Compass size={20} />
                      </div>
                      <div className="cmd-quick-text">
                        <span className="cmd-quick-title">College Discovery</span>
                        <span className="cmd-quick-desc">Explore universities matching your profile</span>
                      </div>
                    </div>
                    <div className="cmd-quick-arrow">
                      <ArrowRight size={16} />
                    </div>
                  </div>

                  <div
                    className="cmd-quick-card"
                    onClick={() => handleNavSelection('scholarships')}
                    id="dash-quick-scholarships-card"
                  >
                    <div className="cmd-quick-card-left">
                      <div className="cmd-quick-icon-box">
                        <Award size={20} />
                      </div>
                      <div className="cmd-quick-text">
                        <span className="cmd-quick-title">Scholarship Discovery</span>
                        <span className="cmd-quick-desc">Explore scholarships & verified eligibility</span>
                      </div>
                    </div>
                    <div className="cmd-quick-arrow">
                      <ArrowRight size={16} />
                    </div>
                  </div>

                  <div
                    className="cmd-quick-card"
                    onClick={() => handleNavSelection('appointments')}
                  >
                    <div className="cmd-quick-card-left">
                      <div className="cmd-quick-icon-box">
                        <Calendar size={20} />
                      </div>
                      <div className="cmd-quick-text">
                        <span className="cmd-quick-title">Appointments</span>
                        <span className="cmd-quick-desc">Schedule 1-on-1 advisor consultations</span>
                      </div>
                    </div>
                    <div className="cmd-quick-arrow">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. TWO-COLUMN: RECENT ACTIVITY & UPCOMING */}
              <div className="cmd-activity-upcoming-grid">
                {/* Left: Recent Activity */}
                <div className="cmd-card-standard">
                  <div className="cmd-card-header">
                    <h3 className="cmd-card-title">Recent activity</h3>
                  </div>

                  <div className="cmd-activity-list">
                    {education && (
                      <div className="cmd-activity-item">
                        <div className="cmd-activity-icon-bubble">
                          <GraduationCap size={14} />
                        </div>
                        <div className="cmd-activity-details">
                          <span className="cmd-activity-title">
                            Education details updated ({education.schoolName || 'High School'})
                          </span>
                          <span className="cmd-activity-time">
                            Board: {education.board} &bull; Score: {education.percentage}%
                          </span>
                        </div>
                      </div>
                    )}

                    {preferences && (
                      <div className="cmd-activity-item">
                        <div className="cmd-activity-icon-bubble">
                          <Sliders size={14} />
                        </div>
                        <div className="cmd-activity-details">
                          <span className="cmd-activity-title">
                            Academic & study preferences saved
                          </span>
                          <span className="cmd-activity-time">
                            {preferences.countriesNotFinalized
                              ? 'Countries not finalized'
                              : preferences.countries?.join(', ') || 'Global'}
                          </span>
                        </div>
                      </div>
                    )}

                    {profile && (
                      <div className="cmd-activity-item">
                        <div className="cmd-activity-icon-bubble">
                          <User size={14} />
                        </div>
                        <div className="cmd-activity-details">
                          <span className="cmd-activity-title">
                            Basic profile submitted for verification
                          </span>
                          <span className="cmd-activity-time">
                            Verification: {profile.verificationStatus}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="cmd-activity-item">
                      <div className="cmd-activity-icon-bubble">
                        <ShieldCheck size={14} />
                      </div>
                      <div className="cmd-activity-details">
                        <span className="cmd-activity-title">
                          Student account authenticated
                        </span>
                        <span className="cmd-activity-time">{user?.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Upcoming (Elegant empty state strictly without fake data) */}
                <div className="cmd-card-standard">
                  <div className="cmd-card-header">
                    <h3 className="cmd-card-title">Upcoming</h3>
                  </div>

                  <div className="cmd-empty-state-box">
                    <div className="cmd-empty-icon-box">
                      <Clock size={24} />
                    </div>
                    <div className="cmd-empty-title">No upcoming activities</div>
                    <p className="cmd-empty-subtitle">
                      Your scheduled counselling appointments, test dates, and deadline reminders will appear here.
                    </p>
                  </div>
                </div>
              </div>

              {/* 6. GUIDANCE CARD */}
              <div className="cmd-guidance-card">
                <div className="cmd-guidance-content">
                  <h3 className="cmd-guidance-title">Need guidance?</h3>
                  <p className="cmd-guidance-text">
                    Your counsellor can help you turn your information and interests into a practical education plan.
                  </p>
                </div>
                <button
                  className="cmd-btn-guidance"
                  onClick={() => setActiveModal('guidance')}
                >
                  <span>View Guidance</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ==========================================================
              VIEW 2: MODULE 1 — BASIC INFORMATION
             ========================================================== */}
          {activeMenu === 'basic' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <button
                  onClick={() => setActiveMenu('dashboard')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'none',
                    border: 'none',
                    color: '#5B4FE9',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Dashboard</span>
                </button>
              </div>

              <section id="sec-basic-info" className="dash-section-card">
                {!isEditingBasic ? (
                  <div>
                    <div className="dash-section-header">
                      <h2 className="dash-section-title">
                        <span>Basic Information</span>
                        {profile && (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.65rem',
                              borderRadius: '12px',
                              background:
                                profile.verificationStatus === 'VERIFIED'
                                  ? '#DCFCE7'
                                  : profile.verificationStatus === 'REJECTED'
                                  ? '#FEE2E2'
                                  : '#FEF3C7',
                              color:
                                profile.verificationStatus === 'VERIFIED'
                                  ? '#15803D'
                                  : profile.verificationStatus === 'REJECTED'
                                  ? '#DC2626'
                                  : '#B45309',
                            }}
                          >
                            {profile.verificationStatus}
                          </span>
                        )}
                      </h2>
                      <button
                        className="dash-edit-pencil-btn"
                        onClick={() => setIsEditingBasic(true)}
                        title="Edit Basic Information"
                      >
                        <Pencil size={18} />
                      </button>
                    </div>

                    <div className="dash-view-row">
                      <div className="dash-view-field">
                        <span className="dash-view-label">Full Name</span>
                        <span className="dash-view-value">{profile?.fullName || '--'}</span>
                      </div>

                      <div className="dash-view-field">
                        <span className="dash-view-label">Gender</span>
                        <span className="dash-view-value">
                          {profile?.gender
                            ? profile.gender.charAt(0) + profile.gender.slice(1).toLowerCase()
                            : '--'}
                        </span>
                      </div>

                      <div className="dash-view-field">
                        <span className="dash-view-label">Current Class / Grade</span>
                        <span className="dash-view-value">{profile?.grade || '--'}</span>
                      </div>

                      <div className="dash-view-field">
                        <span className="dash-view-label">High School Board</span>
                        <span className="dash-view-value">{profile?.board || 'CBSE'}</span>
                      </div>

                      <div className="dash-view-field">
                        <span className="dash-view-label">12th Passing Year</span>
                        <span className="dash-view-value">
                          {profile?.passingOutYear ? `${profile.passingOutYear}` : '--'}
                        </span>
                      </div>
                    </div>

                    <div className="dash-view-row">
                      <div className="dash-view-field dash-view-field-wide">
                        <span className="dash-view-label">Address</span>
                        <span className="dash-view-value">
                          {profile?.address
                            ? `${profile.address.street}, ${profile.address.city}, ${profile.address.state} - ${profile.address.postalCode}, ${profile.address.country}`
                            : '--'}
                        </span>
                      </div>
                    </div>

                    <div className="dash-view-row">
                      <div className="dash-view-field">
                        <span className="dash-view-label">Citizenship</span>
                        <span className="dash-view-value">{profile?.citizenship || '--'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="dash-section-header">
                      <h2 className="dash-section-title">Edit Basic Information</h2>
                    </div>
                    <BasicInfoEditForm
                      initialData={profile}
                      onSuccess={handleBasicInfoSuccess}
                      onCancel={() => setIsEditingBasic(false)}
                      onSubmit={handleBasicInfoSubmit}
                    />
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ==========================================================
              VIEW 3: MODULE 2 — PREFERENCES
             ========================================================== */}
          {activeMenu === 'preferences' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <button
                  onClick={() => setActiveMenu('dashboard')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'none',
                    border: 'none',
                    color: '#5B4FE9',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Dashboard</span>
                </button>
              </div>

              <section id="sec-preferences" className="dash-section-card">
                {!isEditingPreferences ? (
                  <div>
                    <div className="dash-section-header">
                      <h2 className="dash-section-title">Study Preferences</h2>
                      <button
                        className="dash-edit-pencil-btn"
                        onClick={() => setIsEditingPreferences(true)}
                        title="Edit Preferences"
                      >
                        <Pencil size={18} />
                      </button>
                    </div>

                    <div className="dash-view-row" style={{ flexDirection: 'column', gap: '1.5rem' }}>
                      <div className="dash-view-field">
                        <span className="dash-view-label">Preferred Countries</span>
                        <span className="dash-view-value">
                          {preferences?.countriesNotFinalized
                            ? "I haven't finalized countries where I want to study"
                            : preferences?.countries && preferences.countries.length > 0
                            ? preferences.countries.join(' | ')
                            : 'India | United States of America'}
                        </span>
                      </div>

                      <div className="dash-view-field">
                        <span className="dash-view-label">Preferred Departments & Courses</span>
                        <span className="dash-view-value">
                          {preferences?.coursesNotFinalized
                            ? "I haven't finalized which courses I want to study"
                            : preferences?.subDepartment && preferences.subDepartment !== 'Not finalized'
                            ? preferences.subDepartment
                            : preferences?.departmentPreferences && preferences.departmentPreferences.length > 0
                            ? preferences.departmentPreferences
                                .map((p) => `${p.department} (${p.subDepartment})`)
                                .join(' | ')
                            : 'Engineering & Technology (Computer/Software Engineering)'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="dash-section-header">
                      <h2 className="dash-section-title">Edit Study Preferences</h2>
                    </div>
                    <PreferencesEditForm
                      initialData={preferences}
                      onSuccess={handlePreferencesSuccess}
                      onCancel={() => setIsEditingPreferences(false)}
                      onSubmit={handlePreferencesSubmit}
                    />
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ==========================================================
              VIEW 4: MODULE 3 — EDUCATION DETAILS
             ========================================================== */}
          {activeMenu === 'education' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <button
                  onClick={() => setActiveMenu('dashboard')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'none',
                    border: 'none',
                    color: '#5B4FE9',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Dashboard</span>
                </button>
              </div>

              <section id="sec-education" className="dash-section-card">
                {!isEditingEducation ? (
                  <EducationViewCard
                    education={education}
                    defaultBoard={profile?.board || 'CBSE'}
                    defaultYear={profile?.passingOutYear || 2026}
                    onEdit={() => setIsEditingEducation(true)}
                  />
                ) : (
                  <div>
                    <div className="dash-section-header">
                      <h2 className="dash-section-title">Edit Education Details</h2>
                    </div>
                    <EducationEditForm
                      initialData={education}
                      defaultBoard={profile?.board || 'CBSE'}
                      defaultYear={profile?.passingOutYear || 2026}
                      onSuccess={handleEducationSuccess}
                      onCancel={() => setIsEditingEducation(false)}
                      onSubmit={handleEducationSubmit}
                    />
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ==========================================================
              VIEW 5: MODULE 4 — ENTRANCE EXAMS
             ========================================================== */}
          {activeMenu === 'entrance' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <button
                  id="entrance-back-to-dash-btn"
                  onClick={() => setActiveMenu('dashboard')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'none',
                    border: 'none',
                    color: '#5B4FE9',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Dashboard</span>
                </button>
              </div>

              <EntranceExamsView onBackToDashboard={() => setActiveMenu('dashboard')} />
            </div>
          )}

          {/* ==========================================================
              VIEW 6: MODULE 5 — PERSONAL INFORMATION
             ========================================================== */}
          {activeMenu === 'personal' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <button
                  id="personal-back-to-dash-btn"
                  onClick={() => setActiveMenu('dashboard')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'none',
                    border: 'none',
                    color: '#5B4FE9',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Dashboard</span>
                </button>
              </div>

              <PersonalInformationView onBackToDashboard={() => setActiveMenu('dashboard')} />
            </div>
          )}

          {/* ==========================================================
              VIEW 7: MODULE 6 — COLLEGE AND COURSE DISCOVERY
             ========================================================== */}
          {activeMenu === 'colleges' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <button
                  id="colleges-back-to-dash-btn"
                  onClick={() => setActiveMenu('dashboard')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'none',
                    border: 'none',
                    color: '#5B4FE9',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Dashboard</span>
                </button>
              </div>

              <CollegeDiscoveryView onBackToDashboard={() => setActiveMenu('dashboard')} />
            </div>
          )}

          {/* ==========================================================
              VIEW 8: MODULE 7 — THREE-TIER FIT & RECOMMENDATION ENGINE
             ========================================================== */}
          {activeMenu === 'recommendations' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <button
                  id="recommendations-back-to-dash-btn"
                  onClick={() => setActiveMenu('dashboard')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'none',
                    border: 'none',
                    color: '#5B4FE9',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Dashboard</span>
                </button>
              </div>

              <ThreeTierFitView onNavigateSection={(sec) => handleNavSelection(sec)} />
            </div>
          )}

          {/* ==========================================================
              VIEW 9: MODULE 8 — SCHOLARSHIP DISCOVERY & ELIGIBILITY
             ========================================================== */}
          {activeMenu === 'scholarships' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <button
                  id="scholarships-back-to-dash-btn"
                  onClick={() => setActiveMenu('dashboard')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'none',
                    border: 'none',
                    color: '#5B4FE9',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Dashboard</span>
                </button>
              </div>

              <ScholarshipDiscoveryView />
            </div>
          )}

          {/* ==========================================================
              VIEW 10: MODULE 9 — FEE CALCULATOR & COUNTRY COMPARISON
             ========================================================== */}
          {activeMenu === 'fees' && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <button
                  id="fees-back-to-dash-btn"
                  onClick={() => setActiveMenu('dashboard')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'none',
                    border: 'none',
                    color: '#5B4FE9',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>Back to Dashboard</span>
                </button>
              </div>

              <FeeComparisonDashboard onBackToDashboard={() => setActiveMenu('dashboard')} />
            </div>
          )}

          {/* ==========================================================
              VIEW 11: MODULE 11 — EIGHT-PATHWAY ASSESSMENT SUITE
             ========================================================== */}
          {activeMenu === 'assessments' && (
            <EightPathwayAssessmentSuite onBackToDashboard={() => setActiveMenu('dashboard')} />
          )}

          {/* ==========================================================
              VIEW 12: MODULE 12 — SHORTLISTS, WEBINARS & APPOINTMENTS
             ========================================================== */}
          {activeMenu === 'appointments' && (
            <AppointmentsDashboard
              initialTab="book"
              onNavigateTab={(tab) => setActiveMenu(tab)}
            />
          )}

          {activeMenu === 'shortlist' && (
            <AppointmentsDashboard
              initialTab="shortlist"
              isShortlistOnly={true}
              onNavigateTab={(tab) => setActiveMenu(tab)}
            />
          )}
        </main>
      </div>

      {/* ==========================================================
          MODALS (GUIDANCE / SETTINGS / NOTIFICATIONS)
         ========================================================== */}
      {activeModal === 'guidance' && (
        <div className="cmd-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="cmd-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="cmd-modal-close-btn" onClick={() => setActiveModal(null)}>
              <X size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(91, 79, 233, 0.1)', color: '#5B4FE9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Compass size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#172033', margin: 0 }}>
                Consultant Guidance
              </h3>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#667085', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Your dedicated education consultant will analyze your completed profile, destination preferences, and academic marks to formulate an actionable university application roadmap.
            </p>
            <div style={{ background: '#F8FAFC', border: '1px solid #EAECF0', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: '#172033' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Next Step in Your Guidance:</div>
              <div>Ensure your 12th standard subject breakdown is saved in Education Details so program cutoffs can be verified.</div>
            </div>
            <button
              className="cmd-btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setActiveModal(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {activeModal === 'settings' && (
        <div className="cmd-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="cmd-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="cmd-modal-close-btn" onClick={() => setActiveModal(null)}>
              <X size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(91, 79, 233, 0.1)', color: '#5B4FE9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Settings size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#172033', margin: 0 }}>
                Portal Settings
              </h3>
            </div>
            <div style={{ fontSize: '0.88rem', color: '#667085', marginBottom: '1.25rem' }}>
              <div>Authenticated Email: <strong style={{ color: '#172033' }}>{user?.email}</strong></div>
              <div style={{ marginTop: '0.35rem' }}>Role: <strong style={{ color: '#5B4FE9' }}>{user?.role}</strong></div>
            </div>
            <button
              className="cmd-btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setActiveModal(null)}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {activeModal === 'notifications' && (
        <div className="cmd-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="cmd-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="cmd-modal-close-btn" onClick={() => setActiveModal(null)}>
              <X size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(91, 79, 233, 0.1)', color: '#5B4FE9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#172033', margin: 0 }}>
                Notifications
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.75rem', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #EAECF0' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#172033' }}>Welcome to Superconsciousness</div>
                <div style={{ fontSize: '0.78rem', color: '#667085', marginTop: '0.15rem' }}>Your student command center is active. Complete your profile to unlock university recommendations.</div>
              </div>
            </div>
            <button
              className="cmd-btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setActiveModal(null)}
            >
              Mark all as read
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboardPage;
