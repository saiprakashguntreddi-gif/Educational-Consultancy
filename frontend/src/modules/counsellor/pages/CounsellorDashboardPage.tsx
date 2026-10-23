import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckSquare,
  Calendar,
  FileText,
  Search,
  Download,
  UserPlus,
  Eye,
  RefreshCw,
  Video,
  ChevronRight,
  ArrowRight,
  Award,
  ClipboardList,
} from 'lucide-react';
import {
  CounsellorClientService,
  CounsellorDashboardData,
  CounsellorStudentSummary,
} from '../services/counsellor.service';
import { AdminClientService } from '../services/admin.service';
import { Student360Modal } from '../components/Student360Modal';
import { CreateStudentModal } from '../components/CreateStudentModal';
import { SaaSShell } from '../components/saas/SaaSShell';
import { SaaSStatCard } from '../components/saas/SaaSStatCard';
import { StatusBadge } from '../components/saas/StatusBadge';
import { CollegeDiscoveryView } from '../../colleges/components/CollegeDiscoveryView';

interface CounsellorDashboardPageProps {
  onNavigateView?: (view: string) => void;
}

export const CounsellorDashboardPage: React.FC<CounsellorDashboardPageProps> = ({
  onNavigateView,
}) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [dashboardData, setDashboardData] = useState<CounsellorDashboardData | null>(null);
  const [students, setStudents] = useState<CounsellorStudentSummary[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [boardFilter, setBoardFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [yearFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isStudentsLoading, setIsStudentsLoading] = useState(false);

  // Modals
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const [dashRes, appsRes] = await Promise.all([
        CounsellorClientService.getDashboard(),
        AdminClientService.listApplications(),
      ]);

      if (dashRes.success && dashRes.data) {
        setDashboardData(dashRes.data);
      }
      if (appsRes.success && appsRes.data) {
        setApplications(appsRes.data);
      }
    } catch (err: any) {
      console.error('Failed to load counsellor dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudents = async (p = 1) => {
    setIsStudentsLoading(true);
    try {
      const res = await CounsellorClientService.listAssignedStudents({
        search: search.trim() || undefined,
        board: boardFilter || undefined,
        passingOutYear: yearFilter || undefined,
        verificationStatus: statusFilter || undefined,
        page: p,
        limit: 15,
      });

      if (res.success && res.data) {
        setStudents(res.data.students);
        setTotalStudents(res.data.total);
        setPage(res.data.page);
        setTotalPages(res.data.totalPages);
      }
    } catch (err: any) {
      console.error('Failed to load assigned students:', err);
    } finally {
      setIsStudentsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    loadStudents(1);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadStudents(1);
  };

  const handleExportCsv = async () => {
    try {
      await CounsellorClientService.downloadExportCsv();
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  const counsellorDisplayName = dashboardData?.counsellor?.email?.split('@')[0] || 'Counsellor';

  return (
    <SaaSShell
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      role="COUNSELLOR"
      onGlobalSearch={(q) => {
        setSearch(q);
        if (activeTab !== 'students' && q.trim()) {
          setActiveTab('students');
        }
      }}
      searchPlaceholder="Search assigned students, applications, notes..."
      onNavigateLanding={() => onNavigateView?.('home')}
    >
      {isLoading && (
        <div style={{ height: 3, backgroundColor: '#BFDBFE', width: '100%', marginBottom: '1rem', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '45%', backgroundColor: '#2563EB', borderRadius: 2 }} />
        </div>
      )}

      {/* =========================================================================
          TAB 1: COUNSELLOR DASHBOARD (STUDENT-CENTRIC)
          ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Welcome Greeting */}
          <div className="saas-welcome-banner">
            <div>
              <h1 className="saas-welcome-title">
                Good Morning, {counsellorDisplayName}! 👋
              </h1>
              <p className="saas-welcome-sub">
                Here's a quick overview of your assigned students, tasks, and today's guidance schedule.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="saas-btn saas-btn-primary"
                type="button"
              >
                <UserPlus size={16} /> Onboard Student
              </button>
              <button
                onClick={handleExportCsv}
                className="saas-btn saas-btn-secondary"
                type="button"
              >
                <Download size={16} /> Export Caseload
              </button>
            </div>
          </div>

          {/* Counsellor KPI Cards */}
          <div className="saas-kpi-grid">
            <SaaSStatCard
              label="My Students"
              value={dashboardData?.metrics.assignedStudents ?? totalStudents}
              subtext="Assigned caseload"
              trend="Active advising"
              icon={<Users size={22} />}
              color="blue"
            />
            <SaaSStatCard
              label="Active Applications"
              value={dashboardData?.metrics.activeApplications ?? applications.length}
              subtext="College submissions"
              trend="Admissions progress"
              icon={<FileText size={22} />}
              color="green"
            />
            <SaaSStatCard
              label="Pending Tasks"
              value={dashboardData?.metrics.activeActionPlans ?? 0}
              subtext="Action plan milestones"
              trend="Milestones in progress"
              icon={<CheckSquare size={22} />}
              color="amber"
            />
            <SaaSStatCard
              label="Upcoming Appointments"
              value={dashboardData?.metrics.upcomingAppointmentsCount ?? 0}
              subtext="Scheduled sessions"
              trend="Calendar bookings"
              icon={<Calendar size={22} />}
              color="purple"
            />
          </div>

          {/* 2-Column Student-Centric Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.75fr 1.15fr', gap: '1.5rem' }}>
            {/* LEFT COLUMN: My Students & Recent Submissions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* My Students Requiring Attention */}
              <div className="saas-card" style={{ marginBottom: 0 }}>
                <div className="saas-card-header">
                  <div>
                    <h3 className="saas-card-title">My Students</h3>
                    <span className="saas-card-subtitle">
                      Priority attention and active caseload
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('students')}
                    className="saas-btn saas-btn-secondary saas-btn-sm"
                    type="button"
                  >
                    View All <ArrowRight size={14} />
                  </button>
                </div>
                <div className="saas-table-container">
                  <table className="saas-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Course Interest</th>
                        <th>Country Preference</th>
                        <th>Attention</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dashboardData?.recentStudents || (students.slice(0, 6) as any[])).length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                            <Users size={28} color="#CBD5E1" style={{ margin: '0 auto 0.5rem' }} />
                            <p style={{ margin: 0 }}>No students currently assigned to your caseload.</p>
                          </td>
                        </tr>
                      ) : (
                        (dashboardData?.recentStudents || (students.slice(0, 6) as any[])).map((s: any) => {
                          const needsAttention =
                            s.verificationStatus === 'PENDING' ||
                            (s.pendingActions && s.pendingActions > 0) ||
                            (s.pendingActionsCount && s.pendingActionsCount > 0);
                          return (
                            <tr key={s.id}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                  <div className="saas-user-avatar" style={{ width: 32, height: 32, fontSize: '0.78rem' }}>
                                    {s.fullName.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 600, color: '#0F172A' }}>{s.fullName}</div>
                                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                                      {s.email || s.contactEmail || s.user?.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ fontSize: '0.82rem', color: '#475569' }}>
                                {s.department || s.preferenceSummary?.department || 'Undergraduate'}
                              </td>
                              <td>
                                <span style={{ fontSize: '0.78rem', color: '#1E293B', backgroundColor: '#F1F5F9', padding: '0.15rem 0.5rem', borderRadius: 4 }}>
                                  {s.countryPreference || s.preferenceSummary?.primaryCountry || 'Global'}
                                </span>
                              </td>
                              <td>
                                {needsAttention ? (
                                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#D97706', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', padding: '0.15rem 0.45rem', borderRadius: 9999 }}>
                                    ● Attention Needed
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#16A34A', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', padding: '0.15rem 0.45rem', borderRadius: 9999 }}>
                                    ● On Track
                                  </span>
                                )}
                              </td>
                              <td>
                                <StatusBadge status={s.verificationStatus} />
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <button
                                  onClick={() => setSelectedProfileId(s.id)}
                                  className="saas-btn saas-btn-outline-primary saas-btn-sm"
                                  type="button"
                                >
                                  <Eye size={13} /> View
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Applications Table */}
              <div className="saas-card" style={{ marginBottom: 0 }}>
                <div className="saas-card-header">
                  <div>
                    <h3 className="saas-card-title">Recent Applications</h3>
                    <span className="saas-card-subtitle">
                      University applications submitted across your roster
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('applications')}
                    className="saas-btn saas-btn-secondary saas-btn-sm"
                    type="button"
                  >
                    View All <ArrowRight size={14} />
                  </button>
                </div>
                <div className="saas-table-container">
                  <table className="saas-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Program & Institution</th>
                        <th>Country</th>
                        <th>Status</th>
                        <th>Applied On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.slice(0, 5).length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>
                            <FileText size={28} color="#CBD5E1" style={{ margin: '0 auto 0.5rem' }} />
                            <p style={{ margin: 0 }}>No applications logged yet.</p>
                          </td>
                        </tr>
                      ) : (
                        applications.slice(0, 5).map((app) => (
                          <tr key={app.id}>
                            <td>
                              <span style={{ fontWeight: 600, color: '#0F172A' }}>{app.studentName}</span>
                            </td>
                            <td>
                              <div style={{ fontSize: '0.82rem', color: '#0F172A', fontWeight: 500 }}>{app.institutionName}</div>
                              <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{app.program}</div>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.78rem', color: '#475569', backgroundColor: '#F1F5F9', padding: '0.15rem 0.45rem', borderRadius: 4 }}>
                                {app.country}
                              </span>
                            </td>
                            <td>
                              <StatusBadge status={app.status} />
                            </td>
                            <td style={{ fontSize: '0.8rem', color: '#64748B' }}>{app.appliedOn}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Upcoming Appointments, Pool & Quick Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Upcoming Appointments Card */}
              <div className="saas-card" style={{ marginBottom: 0 }}>
                <div className="saas-card-header">
                  <div>
                    <h3 className="saas-card-title">Upcoming Appointments</h3>
                    <span className="saas-card-subtitle">Scheduled consultations</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('appointments')}
                    className="saas-btn saas-btn-secondary saas-btn-sm"
                    type="button"
                  >
                    View All
                  </button>
                </div>
                <div className="saas-card-body" style={{ padding: '1rem 1.25rem' }}>
                  {dashboardData?.upcomingAppointments && dashboardData.upcomingAppointments.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      {dashboardData.upcomingAppointments.map((app) => (
                        <div
                          key={app.id}
                          style={{
                            padding: '0.85rem 1rem',
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div className="saas-user-avatar" style={{ width: 36, height: 36 }}>
                              {(app.studentProfile?.fullName || 'ST').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>
                                {app.studentProfile?.fullName || 'Enrolled Student'}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                                {app.title || app.appointmentType?.replace('_', ' ')}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: 600, marginTop: 2 }}>
                                {new Date(app.scheduledAt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} at{' '}
                                {new Date(app.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => alert(`Connecting to consultation session with ${app.studentProfile?.fullName}...`)}
                            className="saas-btn saas-btn-primary saas-btn-sm"
                            type="button"
                          >
                            <Video size={13} /> Join
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748B' }}>
                      <Calendar size={32} color="#CBD5E1" style={{ margin: '0 auto 0.5rem' }} />
                      <p style={{ margin: 0, fontSize: '0.85rem' }}>No sessions scheduled for today.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Unassigned Pool Card */}
              {(dashboardData?.metrics.unassignedPoolCount ?? 0) > 0 && (
                <div
                  style={{
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '12px',
                    padding: '1.25rem 1.35rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E3A8A' }}>
                      Unassigned Students Pool
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#2563EB', marginTop: 2 }}>
                      {dashboardData?.metrics.unassignedPoolCount} student(s) waiting for counselling allocation.
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateView?.('counsellor-queue')}
                    className="saas-btn saas-btn-primary saas-btn-sm"
                    type="button"
                  >
                    Claim Student
                  </button>
                </div>
              )}

              {/* Quick Actions Card */}
              <div className="saas-card" style={{ marginBottom: 0 }}>
                <div className="saas-card-header">
                  <div>
                    <h3 className="saas-card-title">Quick Actions</h3>
                    <span className="saas-card-subtitle">Common counsellor tasks</span>
                  </div>
                </div>
                <div className="saas-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <button
                    onClick={() => setCreateModalOpen(true)}
                    className="saas-quick-action-item"
                    type="button"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <UserPlus size={16} color="#2563EB" />
                      <span>Onboard New Student</span>
                    </div>
                    <ChevronRight size={16} color="#94A3B8" />
                  </button>

                  <button
                    onClick={() => setActiveTab('applications')}
                    className="saas-quick-action-item"
                    type="button"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <FileText size={16} color="#2563EB" />
                      <span>View Applications</span>
                    </div>
                    <ChevronRight size={16} color="#94A3B8" />
                  </button>

                  <button
                    onClick={() => onNavigateView?.('scholarship-management')}
                    className="saas-quick-action-item"
                    type="button"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <Award size={16} color="#2563EB" />
                      <span>Scholarship Discovery</span>
                    </div>
                    <ChevronRight size={16} color="#94A3B8" />
                  </button>

                  <button
                    onClick={() => setActiveTab('notes')}
                    className="saas-quick-action-item"
                    type="button"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <ClipboardList size={16} color="#2563EB" />
                      <span>Session Advisory Notes</span>
                    </div>
                    <ChevronRight size={16} color="#94A3B8" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: MY STUDENTS FULL ROSTER
          ========================================================================= */}
      {activeTab === 'students' && (
        <div>
          <div className="saas-welcome-banner">
            <div>
              <h1 className="saas-welcome-title">My Students Roster</h1>
              <p className="saas-welcome-sub">
                Complete portfolio of students under your educational guidance.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="saas-btn saas-btn-primary"
                type="button"
              >
                <UserPlus size={16} /> Onboard Student
              </button>
              <button
                onClick={handleExportCsv}
                className="saas-btn saas-btn-secondary"
                type="button"
              >
                <Download size={16} /> Export Caseload
              </button>
            </div>
          </div>

          <div className="saas-card">
            {/* Filter Bar */}
            <form onSubmit={handleSearchSubmit} className="saas-filter-bar">
              <div className="saas-search-container" style={{ width: 280 }}>
                <Search size={15} color="#94A3B8" />
                <input
                  type="text"
                  className="saas-search-input"
                  placeholder="Search student name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="saas-filter-group">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="saas-select"
                >
                  <option value="">All Verification Statuses</option>
                  <option value="VERIFIED">Verified / Approved</option>
                  <option value="PENDING">Pending Verification</option>
                  <option value="REJECTED">Rejected</option>
                </select>

                <select
                  value={boardFilter}
                  onChange={(e) => setBoardFilter(e.target.value)}
                  className="saas-select"
                >
                  <option value="">All Boards</option>
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="IB">IB</option>
                  <option value="Cambridge">Cambridge</option>
                </select>

                <button type="submit" className="saas-btn saas-btn-primary saas-btn-sm">
                  Apply
                </button>
              </div>
            </form>

            {/* Students Table */}
            <div className="saas-table-container">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Country Preference</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Profile Score</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isStudentsLoading ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                        <RefreshCw size={24} style={{ animation: 'spin 1.5s linear infinite', margin: '0 auto 0.5rem' }} />
                        <p style={{ margin: 0 }}>Loading student roster...</p>
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                        <Users size={32} color="#CBD5E1" style={{ margin: '0 auto 0.5rem' }} />
                        <p style={{ margin: 0, fontWeight: 600 }}>No students found in your roster.</p>
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div className="saas-user-avatar" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                              {student.fullName.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#0F172A' }}>{student.fullName}</div>
                              <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                                {student.grade} • {student.board}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: '#475569', fontSize: '0.82rem' }}>{student.contactEmail || student.user.email}</td>
                        <td style={{ color: '#64748B', fontSize: '0.82rem' }}>{student.phone}</td>
                        <td>
                          <span style={{ fontSize: '0.8rem', color: '#1E293B', backgroundColor: '#F1F5F9', padding: '0.2rem 0.5rem', borderRadius: 4 }}>
                            {student.preferenceSummary?.primaryCountry || 'Global'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#475569' }}>
                          {student.preferenceSummary?.department || 'General'}
                        </td>
                        <td>
                          <StatusBadge status={student.verificationStatus} />
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <div style={{ width: 45, height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${student.completionScore}%`,
                                  height: '100%',
                                  backgroundColor: student.completionScore > 75 ? '#16A34A' : '#2563EB',
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                              {student.completionScore}%
                            </span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => setSelectedProfileId(student.id)}
                            className="saas-btn saas-btn-outline-primary saas-btn-sm"
                            type="button"
                          >
                            <Eye size={13} /> View 360°
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="saas-pagination">
              <span>
                Showing {students.length > 0 ? (page - 1) * 15 + 1 : 0} to{' '}
                {Math.min(page * 15, totalStudents)} of {totalStudents} assigned students
              </span>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  onClick={() => loadStudents(page - 1)}
                  disabled={page <= 1}
                  className="saas-page-btn"
                  type="button"
                >
                  ‹
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pNum = i + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => loadStudents(pNum)}
                      className={`saas-page-btn ${page === pNum ? 'active' : ''}`}
                      type="button"
                    >
                      {pNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => loadStudents(page + 1)}
                  disabled={page >= totalPages}
                  className="saas-page-btn"
                  type="button"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: APPLICATIONS MANAGEMENT
          ========================================================================= */}
      {activeTab === 'applications' && (
        <div>
          <div className="saas-welcome-banner">
            <div>
              <h1 className="saas-welcome-title">Student Applications</h1>
              <p className="saas-welcome-sub">
                Target college admissions milestones and shortlist submissions.
              </p>
            </div>
          </div>

          <div className="saas-card">
            <div className="saas-table-container">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Program</th>
                    <th>Target University</th>
                    <th>Country</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                        <FileText size={32} color="#CBD5E1" style={{ margin: '0 auto 0.5rem' }} />
                        <p style={{ margin: 0 }}>No student applications found.</p>
                      </td>
                    </tr>
                  ) : (
                    applications.map((app) => (
                      <tr key={app.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#0F172A' }}>{app.studentName}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{app.studentEmail}</div>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: '#475569' }}>{app.program}</td>
                        <td style={{ fontWeight: 500, color: '#0F172A' }}>{app.institutionName}</td>
                        <td>
                          <span style={{ fontSize: '0.78rem', color: '#1E293B', backgroundColor: '#F1F5F9', padding: '0.15rem 0.5rem', borderRadius: 4 }}>
                            {app.country}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={app.status} />
                        </td>
                        <td style={{ fontSize: '0.82rem', color: '#64748B' }}>{app.appliedOn}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => setSelectedProfileId(app.studentId)}
                            className="saas-btn saas-btn-outline-primary saas-btn-sm"
                            type="button"
                          >
                            <Eye size={13} /> View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: APPOINTMENTS SCHEDULE
          ========================================================================= */}
      {activeTab === 'appointments' && (
        <div>
          <div className="saas-welcome-banner">
            <div>
              <h1 className="saas-welcome-title">Counselling Appointments</h1>
              <p className="saas-welcome-sub">
                Manage upcoming 1-on-1 consultations and past guidance sessions.
              </p>
            </div>
          </div>

          <div className="saas-card">
            <div className="saas-table-container">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Student</th>
                    <th>Appointment Type</th>
                    <th>Duration</th>
                    <th>Meeting Mode</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData?.upcomingAppointments && dashboardData.upcomingAppointments.length > 0 ? (
                    dashboardData.upcomingAppointments.map((app) => (
                      <tr key={app.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.85rem' }}>
                            {new Date(app.scheduledAt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 500 }}>
                            {new Date(app.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#0F172A' }}>
                            {app.studentProfile?.fullName || 'Enrolled Student'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                            {app.studentProfile?.contactEmail}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: '#475569' }}>
                          {app.title || app.appointmentType?.replace('_', ' ')}
                        </td>
                        <td style={{ fontSize: '0.82rem', color: '#64748B' }}>
                          {app.durationMinutes || 45} mins
                        </td>
                        <td>
                          <span style={{ fontSize: '0.78rem', color: '#2563EB', backgroundColor: '#EFF6FF', padding: '0.2rem 0.5rem', borderRadius: 4 }}>
                            {app.meetingType || 'Online Video'}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={app.status || 'SCHEDULED'} />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => alert(`Starting session with ${app.studentProfile?.fullName || 'student'}...`)}
                            className="saas-btn saas-btn-primary saas-btn-sm"
                            type="button"
                          >
                            <Video size={13} /> Join
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                        <Calendar size={32} color="#CBD5E1" style={{ margin: '0 auto 0.5rem' }} />
                        <p style={{ margin: 0 }}>No counselling appointments scheduled.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: ADVISORY NOTES
          ========================================================================= */}
      {activeTab === 'notes' && (
        <div>
          <div className="saas-welcome-banner">
            <div>
              <h1 className="saas-welcome-title">Advisory Notes & Observations</h1>
              <p className="saas-welcome-sub">
                Confidential session insights and student guidance notes.
              </p>
            </div>
          </div>

          <div className="saas-card">
            <div className="saas-table-container">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Student</th>
                    <th>Title</th>
                    <th>Note Content</th>
                    <th>Privacy</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData?.recentNotes && dashboardData.recentNotes.length > 0 ? (
                    dashboardData.recentNotes.map((note) => (
                      <tr key={note.id}>
                        <td style={{ fontSize: '0.8rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                          {new Date(note.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ fontWeight: 600, color: '#0F172A' }}>
                          {note.studentProfile?.fullName || 'Student'}
                        </td>
                        <td style={{ fontWeight: 500, color: '#0F172A', fontSize: '0.85rem' }}>
                          {note.title || 'Guidance Session'}
                        </td>
                        <td style={{ fontSize: '0.82rem', color: '#475569', maxWidth: 350, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {note.content}
                        </td>
                        <td>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', backgroundColor: '#F1F5F9', padding: '0.15rem 0.5rem', borderRadius: 4 }}>
                            Confidential
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                        <ClipboardList size={32} color="#CBD5E1" style={{ margin: '0 auto 0.5rem' }} />
                        <p style={{ margin: 0 }}>No session notes recorded yet.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: INSTITUTION CATALOGUE
          ========================================================================= */}
      {activeTab === 'colleges' && (
        <div>
          <div className="saas-welcome-banner">
            <div>
              <h1 className="saas-welcome-title">Institution Catalogue</h1>
              <p className="saas-welcome-sub">
                Explore universities and programs to guide student shortlists.
              </p>
            </div>
          </div>
          <div className="saas-card" style={{ padding: '1.5rem' }}>
            <CollegeDiscoveryView onBackToDashboard={() => setActiveTab('dashboard')} />
          </div>
        </div>
      )}

      {/* MODALS */}
      {selectedProfileId && (
        <Student360Modal
          profileId={selectedProfileId}
          onClose={() => setSelectedProfileId(null)}
          onRefresh={() => {
            loadDashboard();
            loadStudents(page);
          }}
        />
      )}

      {createModalOpen && (
        <CreateStudentModal
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => {
            loadDashboard();
            loadStudents(1);
          }}
        />
      )}
    </SaaSShell>
  );
};
export default CounsellorDashboardPage;
