import React, { useState } from 'react';
import { AuthProvider, useAuth } from './shared/context/AuthContext';
import { Navbar } from './shared/components/Navbar';
import { Footer } from './shared/components/Footer';
import { HomePage } from './modules/home/HomePage';
import { LoginPage } from './modules/auth/pages/LoginPage';
import { RegisterPage } from './modules/auth/pages/RegisterPage';
import { StudentDashboardPage } from './modules/profile/pages/StudentDashboardPage';
import { CounsellorQueuePage } from './modules/counsellor/pages/CounsellorQueuePage';

import { CollegeManagementPage } from './modules/colleges/pages/CollegeManagementPage';
import { CollegeDiscoveryView } from './modules/colleges/components/CollegeDiscoveryView';
import { CollegeTierManagementPage } from './modules/recommendations/pages/CollegeTierManagementPage';
import { ScholarshipManagementPage } from './modules/scholarships/pages/ScholarshipManagementPage';
import { ExamIntelligencePage } from './modules/exam-intelligence/pages/ExamIntelligencePage';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('home');
  const { user } = useAuth();

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderView = () => {
    switch (currentView) {
      case 'login':
        return (
          <LoginPage
            onSuccess={() => handleNavigate(user?.role === 'STUDENT' ? 'dashboard' : 'home')}
            onNavigateToRegister={() => handleNavigate('register')}
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
        return <CollegeManagementPage onNavigateHome={() => handleNavigate('home')} />;
      case 'college-tier-management':
        return <CollegeTierManagementPage onNavigateHome={() => handleNavigate('home')} />;
      case 'scholarship-management':
        return <ScholarshipManagementPage onNavigateHome={() => handleNavigate('home')} />;
      case 'exam-intelligence':
        return (
          <ExamIntelligencePage
            onNavigateHome={() => handleNavigate('home')}
            onNavigateDashboard={() => handleNavigate('dashboard')}
          />
        );
      case 'scholarships':
        return (
          <StudentDashboardPage
            initialSection="scholarships"
            onNavigateHome={() => handleNavigate('home')}
          />
        );
      case 'counsellor-queue':
        return <CounsellorQueuePage />;
      case 'home':
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  const isStudentDashboard =
    user?.role === 'STUDENT' &&
    (currentView === 'profile-intake' ||
      currentView === 'preferences' ||
      currentView === 'education' ||
      currentView === 'entrance' ||
      currentView === 'personal' ||
      currentView === 'colleges' ||
      currentView === 'recommendations' ||
      currentView === 'scholarships' ||
      currentView === 'dashboard' ||
      currentView === 'student-dashboard');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      {!isStudentDashboard && <Navbar currentView={currentView} onNavigate={handleNavigate} />}
      <main style={{ flex: 1, width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>{renderView()}</main>
      {!isStudentDashboard && <Footer onNavigate={handleNavigate} />}
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
