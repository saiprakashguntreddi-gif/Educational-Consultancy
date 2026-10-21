import fs from 'fs';
import path from 'path';

console.log('================================================================');
console.log(' SUPERCONSCIOUSNESS: STUDENT DASHBOARD REDESIGN VERIFICATION');
console.log('================================================================\n');

const frontendDir = path.resolve(__dirname, '../../../frontend');
const cssPath = path.join(frontendDir, 'src/shared/styles/student-dashboard.css');
const pagePath = path.join(frontendDir, 'src/modules/profile/pages/StudentDashboardPage.tsx');
const appPath = path.join(frontendDir, 'src/App.tsx');
const navbarPath = path.join(frontendDir, 'src/shared/components/Navbar.tsx');

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failed++;
  }
}

// 1. Check student-dashboard.css exists
assert(fs.existsSync(cssPath), 'student-dashboard.css exists');
const css = fs.readFileSync(cssPath, 'utf8');

// 2. Check Color Tokens in CSS
console.log('\n[CHECK 1] Required Color Palette in student-dashboard.css:');
assert(css.includes('#081426'), 'Primary dark navy #081426 present');
assert(css.includes('#111C31'), 'Secondary navy #111C31 present');
assert(css.includes('#F7F8FC'), 'Background #F7F8FC present');
assert(css.includes('#FFFFFF'), 'Card #FFFFFF present');
assert(css.includes('#5B4FE9'), 'Primary accent #5B4FE9 present');
assert(css.includes('#7C6FF2'), 'Secondary accent #7C6FF2 present');
assert(css.includes('#172033'), 'Main text #172033 present');
assert(css.includes('#667085'), 'Muted text #667085 present');
assert(css.includes('#16A34A'), 'Success #16A34A present');

// 3. Check Responsive Layout Rules in CSS
console.log('\n[CHECK 2] Responsive Layout & Viewport Rules:');
assert(css.includes('overflow-x: hidden'), 'No horizontal scrollbar rule (overflow-x: hidden) present');
assert(css.includes('@media screen and (max-width: 1024px)'), 'Tablet breakpoint (1024px) present');
assert(css.includes('@media screen and (max-width: 768px)'), 'Mobile/tablet breakpoint (768px) present');
assert(css.includes('@media screen and (max-width: 480px)'), 'Small mobile breakpoint (480px) present');
assert(css.includes('--cmd-sidebar-width: 260px'), 'Desktop fixed sidebar width (260px) defined');

// 4. Check StudentDashboardPage.tsx Elements
console.log('\n[CHECK 3] Student Command Center Components & Sections:');
assert(fs.existsSync(pagePath), 'StudentDashboardPage.tsx exists');
const page = fs.readFileSync(pagePath, 'utf8');

// Sidebar
assert(page.includes('SUPERCONSCIOUSNESS'), 'Sidebar brand SUPERCONSCIOUSNESS present');
assert(page.includes('EDUCATIONAL CONSULTANCY & GUIDANCE'), 'Sidebar subtitle EDUCATIONAL CONSULTANCY & GUIDANCE present');
assert(page.includes('Dashboard'), 'Sidebar nav item Dashboard present');
assert(page.includes('My Profile'), 'Sidebar nav item My Profile present');
assert(page.includes('Preferences'), 'Sidebar nav item Preferences present');
assert(page.includes('Education'), 'Sidebar nav item Education present');
assert(page.includes('Entrance Exams'), 'Sidebar nav item Entrance Exams present');
assert(page.includes('College Discovery'), 'Sidebar nav item College Discovery present');
assert(page.includes('Appointments'), 'Sidebar nav item Appointments present');
assert(page.includes('Settings'), 'Sidebar bottom Settings present');
assert(page.includes('Logout'), 'Sidebar bottom Logout present');

// Top Header
assert(page.includes('cmd-top-header'), 'Top header container present');
assert(page.includes('cmd-mobile-menu-btn'), 'Mobile hamburger menu toggle button present');
assert(page.includes('cmd-notification-btn'), 'Notification bell button present');
assert(page.includes('cmd-user-avatar'), 'Student avatar circle present');
assert(page.includes('cmd-user-name'), 'Student display name element present');

// Welcome Section
assert(page.includes('cmd-welcome-card'), 'Welcome card section present');
assert(page.includes("Let's continue building your path toward the future."), 'Welcome supporting text present');
assert(page.includes('cmd-status-pill'), 'Dynamic profile status badge present');

// Profile Completion
assert(page.includes('cmd-progress-bar-track'), 'Profile completion progress bar track present');
assert(page.includes('cmd-progress-bar-fill'), 'Profile completion progress bar fill present');
assert(page.includes('Complete your profile to get more personalised guidance.'), 'Profile guidance supporting copy present');

// Student Journey Timeline
assert(page.includes('cmd-journey-timeline'), 'Horizontal journey timeline present');
assert(page.includes('cmd-journey-step'), 'Journey step elements present');

// Next Best Action Card
assert(page.includes('cmd-next-step-card'), 'Next Best Action card container present');
assert(page.includes('Your next step'), 'Next Best Action header present');

// Quick Access
assert(page.includes('cmd-quick-access-grid'), 'Quick Access grid present');
assert(page.includes('Explore your platform'), 'Explore your platform header present');

// Activity & Upcoming Two-Column Area
assert(page.includes('cmd-activity-upcoming-grid'), 'Two-column Activity & Upcoming grid present');
assert(page.includes('Recent activity'), 'Recent activity column header present');
assert(page.includes('Upcoming'), 'Upcoming column header present');
assert(page.includes('No upcoming activities'), 'Upcoming elegant empty state present (no fake data)');

// Guidance Card
assert(page.includes('cmd-guidance-card'), 'Guidance card container present');
assert(page.includes('Need guidance?'), 'Need guidance heading present');
assert(page.includes('Your counsellor can help you turn your information and interests into a practical education plan.'), 'Guidance supporting text present');
assert(page.includes('View Guidance'), 'View Guidance action button present');

// Modules 1, 2, 3 Preservation
console.log('\n[CHECK 4] Functional Preservation of Modules 1, 2 & 3:');
assert(page.includes('BasicInfoEditForm'), 'BasicInfoEditForm preserved for Module 1');
assert(page.includes('PreferencesEditForm'), 'PreferencesEditForm preserved for Module 2');
assert(page.includes('EducationViewCard'), 'EducationViewCard preserved for Module 3');
assert(page.includes('EducationEditForm'), 'EducationEditForm preserved for Module 3');
assert(page.includes('handleBasicInfoSubmit'), 'Basic info submit handler preserved');
assert(page.includes('handlePreferencesSubmit'), 'Preferences submit handler preserved');
assert(page.includes('handleEducationSubmit'), 'Education details submit handler preserved');

// App.tsx and Navbar.tsx
console.log('\n[CHECK 5] Route Integration & Navigation:');
const app = fs.readFileSync(appPath, 'utf8');
assert(app.includes("case 'dashboard':"), 'App.tsx supports case dashboard');
assert(app.includes("case 'student-dashboard':"), 'App.tsx supports case student-dashboard');
assert(app.includes("isStudentDashboard"), 'App.tsx excludes public navbar/footer for student dashboard');

const navbar = fs.readFileSync(navbarPath, 'utf8');
assert(navbar.includes("id=\"nav-dashboard-btn\""), 'Navbar provides direct Dashboard button for students');

console.log('\n================================================================');
console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL STUDENT DASHBOARD SPECIFICATIONS VERIFIED SUCCESSFULLY!');
  process.exit(0);
}
