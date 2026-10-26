import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth, User } from './shared/context/AuthContext';
import { Navbar } from './shared/components/Navbar';
import { Footer } from './shared/components/Footer';
import { HomePage } from './modules/home/HomePage';
import { LoginPage } from './modules/auth/pages/LoginPage';
import { RegisterPage } from './modules/auth/pages/RegisterPage';
import { ForgotPasswordPage } from './modules/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from './modules/auth/pages/ResetPasswordPage';
import { StudentDashboardPage } from './modules/profile/pages/StudentDashboardPage';
import { CounsellorDashboardPage } from './modules/counsellor/pages/CounsellorDashboardPage';
import { AdminDashboardPage } from './modules/counsellor/pages/AdminDashboardPage';

import { CollegeManagementPage } from './modules/colleges/pages/CollegeManagementPage';
import { CollegeDiscoveryView } from './modules/colleges/components/CollegeDiscoveryView';
import { CollegeTierManagementPage } from './modules/recommendations/pages/CollegeTierManagementPage';
import { ScholarshipManagementPage } from './modules/scholarships/pages/ScholarshipManagementPage';
import { FeeCalculatorPage } from './modules/fees/pages/FeeCalculatorPage';
import { ExamIntelligencePage } from './modules/exam-intelligence/pages/ExamIntelligencePage';
import { EightPathwayAssessmentSuite } from './modules/assessments/components/EightPathwayAssessmentSuite';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('home');
  const [resetToken, setResetToken] = useState<string>('');
  const { user } = useAuth();

  // Listen for query params e.g. ?view=reset-password&token=xyz or ?view=forgot-password
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const tokenParam = params.get('token');
    if (viewParam === 'reset-password' || tokenParam) {
      if (tokenParam) setResetToken(tokenParam);
      setCurrentView('reset-password');
    } else if (viewParam === 'forgot-password') {
      setCurrentView('forgot-password');
    }
  }, []);

  // If user is logged in as staff and currently on home, direct to their dedicated dashboard
  useEffect(() => {
    if (user?.role === 'ADMIN' && currentView === 'home') {
      setCurrentView('admin-dashboard');
    } else if (user?.role === 'COUNSELLOR' && currentView === 'home') {
      setCurrentView('counsellor-dashboard');
    }
  }, [user]);

  // When user logs out (user becomes null), automatically route directly to home (main page)
  useEffect(() => {
    const publicAuthViews = ['login', 'register', 'forgot-password', 'reset-password'];
    if (!user && !publicAuthViews.includes(currentView)) {
      setCurrentView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [user]);

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (loggedInUser?: User) => {
    const role = loggedInUser?.role || user?.role;
    if (role === 'ADMIN') {
      handleNavigate('admin-dashboard');
    } else if (role === 'COUNSELLOR') {
      handleNavigate('counsellor-dashboard');
    } else {
      handleNavigate('dashboard');
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'login':
        return (
          <LoginPage
            onSuccess={handleLoginSuccess}
            onNavigateToRegister={() => handleNavigate('register')}
            onNavigateToForgotPassword={() => handleNavigate('forgot-password')}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordPage
            onNavigateToLogin={() => handleNavigate('login')}
            onNavigateToReset={(token) => {
              setResetToken(token);
              handleNavigate('reset-password');
            }}
          />
        );
      case 'reset-password':
        return (
          <ResetPasswordPage
            token={resetToken}
            onNavigateToLogin={() => handleNavigate('login')}
          />
        );
      case 'register':
        return (
          <RegisterPage
            onSuccess={() => handleNavigate('profile-intake')}
            onNavigateToLogin={() => handleNavigate('login')}
          />
        );
      case 'dashboard':
      case 'student-dashboard':
        return (
          <StudentDashboardPage
            initialSection="dashboard"
            onNavigateHome={() => handleNavigate('home')}
          />
        );
      case 'profile-intake':
        return (
          <StudentDashboardPage
            initialSection="basic"
            onNavigateHome={() => handleNavigate('home')}
          />
        );
      case 'preferences':
        return (
          <StudentDashboardPage
            initialSection="preferences"
            onNavigateHome={() => handleNavigate('home')}
          />
        );
      case 'education':
        return (
          <StudentDashboardPage
            initialSection="education"
            onNavigateHome={() => handleNavigate('home')}
          />
        );
      case 'entrance':
        return (
          <StudentDashboardPage
            initialSection="entrance"
            onNavigateHome={() => handleNavigate('home')}
          />
        );
      case 'personal':
        return (
          <StudentDashboardPage
            initialSection="personal"
            onNavigateHome={() => handleNavigate('home')}
          />
        );
      case 'colleges':
        if (user?.role === 'STUDENT') {
          return (
            <StudentDashboardPage
              initialSection="colleges"
              onNavigateHome={() => handleNavigate('home')}
            />
          );
        }
        return (
          <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem', minHeight: '80vh' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                College & Course Discovery Catalogue
              </h1>
              <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Official institution catalogue for student guidance and advisory.
              </p>
            </div>
            <CollegeDiscoveryView onBackToDashboard={() => handleNavigate('home')} />
          </div>
        );
      case 'recommendations':
        return (
          <StudentDashboardPage
            initialSection="recommendations"
            onNavigateHome={() => handleNavigate('home')}
          />
        );
      case 'college-management':
        if (user?.role === 'ADMIN') {
          return <AdminDashboardPage initialTab="colleges" onNavigateView={handleNavigate} />;
        }
        return <CollegeManagementPage onNavigateHome={() => handleNavigate('home')} />;
      case 'college-tier-management':
        if (user?.role === 'ADMIN') {
          return <AdminDashboardPage initialTab="college-tiers" onNavigateView={handleNavigate} />;
        }
        return <CollegeTierManagementPage onNavigateHome={() => handleNavigate('home')} />;
      case 'scholarship-management':
        if (user?.role === 'ADMIN') {
          return <AdminDashboardPage initialTab="scholarships" onNavigateView={handleNavigate} />;
        }
        return <ScholarshipManagementPage onNavigateHome={() => handleNavigate('home')} />;
      case 'exam-intelligence':
        return (
          <ExamIntelligencePage
            onNavigateHome={() => handleNavigate('home')}
            onNavigateDashboard={() => handleNavigate('dashboard')}
          />
        );
      case 'scholarships':
        if (user?.role === 'ADMIN') {
          return <AdminDashboardPage initialTab="scholarships" onNavigateView={handleNavigate} />;
        }
        return (
          <StudentDashboardPage
            initialSection="scholarships"
            onNavigateHome={() => handleNavigate('home')}
          />
        );
      case 'fees':
      case 'fee-calculator':
        if (user?.role === 'STUDENT') {
          return (
            <StudentDashboardPage
              initialSection="fees"
              onNavigateHome={() => handleNavigate('home')}
            />
          );
        }
        return <FeeCalculatorPage onNavigateHome={() => handleNavigate('home')} />;
      case 'assessments':
        if (user?.role === 'STUDENT') {
          return (
            <StudentDashboardPage
              initialSection="assessments"
              onNavigateHome={() => handleNavigate('home')}
            />
          );
        }
        return (
          <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem', minHeight: '80vh' }}>
            <EightPathwayAssessmentSuite onBackToDashboard={() => handleNavigate('home')} />
          </div>
        );
      case 'appointments':
        return (
          <StudentDashboardPage
            initialSection="appointments"
            onNavigateHome={() => handleNavigate('home')}
          />
        );
      case 'shortlist':
        return (
          <StudentDashboardPage
            initialSection="shortlist"
            onNavigateHome={() => handleNavigate('home')}
          />
        );
      case 'counsellor-queue':
        if (user?.role === 'ADMIN') {
          return <AdminDashboardPage initialTab="verification" onNavigateView={handleNavigate} />;
        }
        return <CounsellorDashboardPage onNavigateView={handleNavigate} />;
      case 'counsellor-dashboard':
        return <CounsellorDashboardPage onNavigateView={handleNavigate} />;
      case 'admin-dashboard':
        return <AdminDashboardPage initialTab="dashboard" onNavigateView={handleNavigate} />;
      case 'manage-students':
        if (user?.role === 'ADMIN') {
          return <AdminDashboardPage initialTab="students" onNavigateView={handleNavigate} />;
        }
        return <CounsellorDashboardPage onNavigateView={handleNavigate} />;
      case 'home':
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  const isDedicatedAppLayout =
    (user?.role === 'STUDENT' &&
      (currentView === 'profile-intake' ||
        currentView === 'preferences' ||
        currentView === 'education' ||
        currentView === 'entrance' ||
        currentView === 'personal' ||
        currentView === 'colleges' ||
        currentView === 'recommendations' ||
        currentView === 'scholarships' ||
        currentView === 'fees' ||
        currentView === 'fee-calculator' ||
        currentView === 'assessments' ||
        currentView === 'appointments' ||
        currentView === 'shortlist' ||
        currentView === 'dashboard' ||
        currentView === 'student-dashboard')) ||
    currentView === 'admin-dashboard' ||
    currentView === 'counsellor-dashboard' ||
    currentView === 'manage-students' ||
    currentView === 'counsellor-queue';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      {!isDedicatedAppLayout && <Navbar currentView={currentView} onNavigate={handleNavigate} />}
      <main style={{ flex: 1, width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>{renderView()}</main>
      {!isDedicatedAppLayout && <Footer onNavigate={handleNavigate} />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
