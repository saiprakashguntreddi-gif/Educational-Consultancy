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
  ClipboardList,
  CheckCircle2,
  Clock,
  Bell,
  MessageSquare,
  Settings,
} from 'lucide-react';
import {
  CounsellorClientService,
  CounsellorDashboardData,
  CounsellorStudentSummary,
} from '../services/counsellor.service';
import { AdminClientService } from '../services/admin.service';
import { AppointmentsService } from '../../appointments/services/appointments.service';
import { Student360Modal } from '../components/Student360Modal';
import { CreateStudentModal } from '../components/CreateStudentModal';
import { InteractiveMeetingModal } from '../components/InteractiveMeetingModal';
import { RecordSessionOutcomeModal } from '../components/RecordSessionOutcomeModal';
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
  const [counsellorAppointments, setCounsellorAppointments] = useState<any[]>([]);
  const [isAppointmentsLoading, setIsAppointmentsLoading] = useState(false);
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

  // Modals & Interactive Meeting States
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [activeMeetingAppointment, setActiveMeetingAppointment] = useState<any | null>(null);
  const [recordOutcomeAppointment, setRecordOutcomeAppointment] = useState<any | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [slotDate, setSlotDate] = useState(new Date().toISOString().split('T')[0]);
  const [customSlots, setCustomSlots] = useState<string[]>([
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
  ]);
  const [savingSlots, setSavingSlots] = useState(false);

  const handleSendReminder = async (appointmentId: string, method: 'WHATSAPP' | 'SMS' = 'WHATSAPP') => {
    setActionLoadingId(appointmentId);
    try {
      const res = await AppointmentsService.sendAppointmentReminder(appointmentId, method);
      if (res.success && res.data) {
        if (res.data.whatsappLink && method === 'WHATSAPP') {
          window.open(res.data.whatsappLink, '_blank');
        }
        alert(`${method} reminder logged and dispatched!`);
        await Promise.all([loadDashboard(), loadCounsellorAppointments()]);
      } else {
        alert(res.message || 'Failed to dispatch reminder');
      }
    } catch (err: any) {
      alert(`Reminder error: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSaveSlots = async () => {
    setSavingSlots(true);
    try {
      const res = await AppointmentsService.setCounsellorSlots(slotDate, customSlots);
      if (res.success) {
        alert(`Successfully updated availability timings for ${slotDate}! Bookings blocked for other hours.`);
        setSlotModalOpen(false);
      } else {
        alert(res.message || 'Failed to update slots');
      }
    } catch (err: any) {
      alert(`Error updating slots: ${err.message}`);
    } finally {
      setSavingSlots(false);
    }
  };

  const handleUpdateAppointmentStatus = async (
    appointmentId: string,
    status: 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED',
    counsellorNotes?: string
  ) => {
    setActionLoadingId(appointmentId);
    try {
      const res = await AppointmentsService.updateCounsellorAppointmentStatus(appointmentId, {
        status,
        reason: counsellorNotes,
      });
      if (res.success) {
        await Promise.all([loadDashboard(), loadCounsellorAppointments()]);
      } else {
        alert(res.message || 'Action failed');
      }
    } catch (err: any) {
      alert(`Error updating appointment: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const loadCounsellorAppointments = async () => {
    setIsAppointmentsLoading(true);
    try {
      const res = await AppointmentsService.getCounsellorSchedule();
      if (res.success && res.data) {
        setCounsellorAppointments(res.data);
      }
    } catch (err) {
      console.error('Failed to load counsellor appointments:', err);
    } finally {
      setIsAppointmentsLoading(false);
    }
  };

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const [dashRes, appsRes, aptsRes] = await Promise.all([
        CounsellorClientService.getDashboard(),
        AdminClientService.listApplications(),
        AppointmentsService.getCounsellorSchedule().catch(() => ({ success: false, data: [] })),
      ]);

      if (dashRes.success && dashRes.data) {
        setDashboardData(dashRes.data);
      }
      if (appsRes.success && appsRes.data) {
        setApplications(appsRes.data);
      }
      if (aptsRes && aptsRes.success && aptsRes.data) {
        setCounsellorAppointments(aptsRes.data);
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
    loadCounsellorAppointments();
  }, []);

  useEffect(() => {
    if (activeTab === 'appointments') {
      loadCounsellorAppointments();
      loadDashboard();
    }
  }, [activeTab]);

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
      role="ADMIN"
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
          <div className="saas-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <SaaSStatCard
              label="My Students"
              value={dashboardData?.metrics.assignedStudents ?? totalStudents}
              subtext="Assigned caseload"
              trend="Active roster"
              icon={<Users size={22} />}
              color="blue"
            />
            <SaaSStatCard
              label="Today's Appointments"
              value={dashboardData?.metrics.todayAppointmentsCount ?? 0}
              subtext="Scheduled for today"
              trend="Today's calendar"
              icon={<Clock size={22} />}
              color="purple"
            />
            <SaaSStatCard
              label="Upcoming Sessions"
              value={dashboardData?.metrics.upcomingAppointmentsCount ?? 0}
              subtext="Next 7 days"
              trend="Consultations"
              icon={<Calendar size={22} />}
              color="blue"
            />
            <SaaSStatCard
              label="Pending Requests"
              value={dashboardData?.metrics.pendingRequestsCount ?? 0}
              subtext="Awaiting your response"
              trend={dashboardData?.metrics.pendingRequestsCount ? 'Action Required' : 'Up to date'}
              icon={<CheckSquare size={22} />}
              color={dashboardData?.metrics.pendingRequestsCount ? 'amber' : 'green'}
            />
            <SaaSStatCard
              label="Pending Follow-ups"
              value={dashboardData?.metrics.pendingFollowUpsCount ?? 0}
              subtext="Milestones due"
              trend="Action tracking"
              icon={<ClipboardList size={22} />}
              color="amber"
            />
          </div>

          {/* 1. TODAY'S SCHEDULE */}
          <div className="saas-card" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="saas-card-header">
              <div>
                <h3 className="saas-card-title">Today's Schedule</h3>
                <span className="saas-card-subtitle">
                  Interactive consultations & meetings scheduled for today
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setSlotModalOpen(true)}
                  className="saas-btn saas-btn-outline-primary saas-btn-sm"
                  type="button"
                >
                  <Settings size={13} /> Manage Availability Timings
                </button>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className="saas-btn saas-btn-secondary saas-btn-sm"
                  type="button"
                >
                  View Full Calendar
                </button>
              </div>
            </div>
            <div className="saas-table-container">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Student</th>
                    <th>Session Type</th>
                    <th>Mode</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(dashboardData?.todaySchedule || []).length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                        <Clock size={28} color="#CBD5E1" style={{ margin: '0 auto 0.5rem' }} />
                        <p style={{ margin: 0, fontWeight: 500 }}>No consultations scheduled for today.</p>
                      </td>
                    </tr>
                  ) : (
                    (dashboardData?.todaySchedule || []).map((app: any) => (
                      <tr key={app.id}>
                        <td>
                          <strong style={{ fontSize: '0.85rem', color: '#2563EB' }}>
                            {new Date(app.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </strong>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#0F172A' }}>
                            {app.studentProfile?.fullName || app.studentName || 'Student'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                            {app.studentProfile?.contactEmail || app.studentEmail}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: '#475569' }}>
                          {app.title || app.appointmentType?.replace('_', ' ')}
                        </td>
                        <td>
                          <span style={{ fontSize: '0.75rem', backgroundColor: '#EFF6FF', color: '#2563EB', padding: '0.15rem 0.5rem', borderRadius: 4 }}>
                            {app.meetingMode || 'Online Video'}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={app.status} />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            {app.status === 'CONFIRMED' && (
                              <>
                                <button
                                  onClick={() => handleSendReminder(app.id, 'WHATSAPP')}
                                  disabled={actionLoadingId === app.id}
                                  className="saas-btn saas-btn-sm"
                                  style={{ backgroundColor: '#25D366', color: '#FFFFFF', border: 'none' }}
                                  type="button"
                                  title="Send WhatsApp Reminder to Student Mobile"
                                >
                                  <MessageSquare size={13} /> WhatsApp
                                </button>
                                <button
                                  onClick={() => handleSendReminder(app.id, 'SMS')}
                                  disabled={actionLoadingId === app.id}
                                  className="saas-btn saas-btn-secondary saas-btn-sm"
                                  type="button"
                                  title="Send SMS Reminder"
                                >
                                  <Bell size={13} /> SMS
                                </button>
                                <button
                                  onClick={() => setActiveMeetingAppointment(app)}
                                  className="saas-btn saas-btn-primary saas-btn-sm"
                                  type="button"
                                  title="Launch Interactive Session"
                                >
                                  <Video size={13} /> Launch Meeting
                                </button>
                                <button
                                  onClick={() => setRecordOutcomeAppointment(app)}
                                  className="saas-btn saas-btn-sm"
                                  style={{ backgroundColor: '#10B981', color: '#FFFFFF', border: 'none' }}
                                  type="button"
                                  title="Record Session Outcome"
                                >
                                  <CheckCircle2 size={13} /> Record Outcome
                                </button>
                              </>
                            )}
                            {app.status === 'SCHEDULED' && (
                              <>
                                <button
                                  onClick={() => handleUpdateAppointmentStatus(app.id, 'CONFIRMED')}
                                  disabled={actionLoadingId === app.id}
                                  className="saas-btn saas-btn-primary saas-btn-sm"
                                  style={{ backgroundColor: '#16A34A', border: 'none' }}
                                  type="button"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleUpdateAppointmentStatus(app.id, 'CANCELLED')}
                                  disabled={actionLoadingId === app.id}
                                  className="saas-btn saas-btn-secondary saas-btn-sm"
                                  style={{ color: '#DC2626' }}
                                  type="button"
                                >
                                  Decline
                                </button>
                              </>
                            )}
                            {app.status === 'COMPLETED' && (
                              <button
                                onClick={() => setRecordOutcomeAppointment(app)}
                                className="saas-btn saas-btn-outline-primary saas-btn-sm"
                                type="button"
                              >
                                Edit Outcome
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2-Column Layout: Students Requiring Attention & Recent Sessions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.2fr', gap: '1.5rem' }}>
            {/* LEFT COLUMN: Students Requiring Attention */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="saas-card" style={{ marginBottom: 0 }}>
                <div className="saas-card-header">
                  <div>
                    <h3 className="saas-card-title">Students Requiring Attention</h3>
                    <span className="saas-card-subtitle">
                      Assigned students with pending follow-ups or action items
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('students')}
                    className="saas-btn saas-btn-secondary saas-btn-sm"
                    type="button"
                  >
                    View All Students <ArrowRight size={14} />
                  </button>
                </div>
                <div className="saas-table-container">
                  <table className="saas-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Target Discipline</th>
                        <th>Country</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Profile</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dashboardData?.studentsRequiringAttention || (students.slice(0, 5) as any[])).length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748B' }}>
                            <CheckCircle2 size={28} color="#10B981" style={{ margin: '0 auto 0.5rem' }} />
                            <p style={{ margin: 0, fontWeight: 500 }}>All assigned students are currently on track!</p>
                          </td>
                        </tr>
                      ) : (
                        (dashboardData?.studentsRequiringAttention || (students.slice(0, 5) as any[])).map((s: any) => (
                          <tr key={s.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <div className="saas-user-avatar" style={{ width: 32, height: 32, fontSize: '0.78rem' }}>
                                  {s.fullName.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 600, color: '#0F172A' }}>{s.fullName}</div>
                                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                                    {s.contactEmail || s.user?.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={{ fontSize: '0.82rem', color: '#475569' }}>
                              {s.department || s.preferenceSummary?.department || 'General'}
                            </td>
                            <td>
                              <span style={{ fontSize: '0.78rem', color: '#1E293B', backgroundColor: '#F1F5F9', padding: '0.15rem 0.5rem', borderRadius: 4 }}>
                                {s.countryPreference || s.preferenceSummary?.primaryCountry || 'Global'}
                              </span>
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
                                <Eye size={13} /> 360°
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pending Appointment Requests Card (if any pending) */}
              {(dashboardData?.upcomingAppointments || []).filter((a) => a.status === 'SCHEDULED').length > 0 && (
                <div className="saas-card" style={{ marginBottom: 0 }}>
                  <div className="saas-card-header">
                    <div>
                      <h3 className="saas-card-title">Pending Appointment Requests</h3>
                      <span className="saas-card-subtitle">
                        Student consultation bookings awaiting your confirmation
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(dashboardData?.upcomingAppointments || [])
                      .filter((a) => a.status === 'SCHEDULED')
                      .map((req) => (
                        <div
                          key={req.id}
                          style={{
                            padding: '0.85rem 1rem',
                            backgroundColor: '#FFFBEB',
                            border: '1px solid #FDE68A',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, color: '#92400E', fontSize: '0.88rem' }}>
                              {req.studentProfile?.fullName || 'Student'} • {req.title || req.appointmentType?.replace('_', ' ')}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#B45309', marginTop: 2 }}>
                              Requested for{' '}
                              {new Date(req.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                              {new Date(req.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              onClick={() => handleUpdateAppointmentStatus(req.id, 'CONFIRMED')}
                              disabled={actionLoadingId === req.id}
                              className="saas-btn saas-btn-sm saas-btn-primary"
                              style={{ backgroundColor: '#16A34A', border: 'none' }}
                              type="button"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleUpdateAppointmentStatus(req.id, 'CANCELLED')}
                              disabled={actionLoadingId === req.id}
                              className="saas-btn saas-btn-sm saas-btn-secondary"
                              style={{ color: '#DC2626' }}
                              type="button"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Recent Completed Sessions & Quick Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Recent Sessions */}
              <div className="saas-card" style={{ marginBottom: 0 }}>
                <div className="saas-card-header">
                  <div>
                    <h3 className="saas-card-title">Recent Sessions</h3>
                    <span className="saas-card-subtitle">Completed consultations & follow-ups</span>
                  </div>
                </div>
                <div className="saas-card-body" style={{ padding: '0.85rem 1rem' }}>
                  {(dashboardData?.recentSessions || []).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748B' }}>
                      <Calendar size={28} color="#CBD5E1" style={{ margin: '0 auto 0.5rem' }} />
                      <p style={{ margin: 0, fontSize: '0.82rem' }}>No completed sessions recorded yet.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {(dashboardData?.recentSessions || []).map((session: any) => (
                        <div
                          key={session.id}
                          style={{
                            padding: '0.75rem 0.9rem',
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: '0.85rem', color: '#0F172A' }}>
                              {session.studentProfile?.fullName || 'Student'}
                            </strong>
                            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                              {new Date(session.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <p style={{ margin: '0.35rem 0', fontSize: '0.78rem', color: '#475569', lineHeight: 1.4 }}>
                            {session.sessionOutcome || 'Session completed.'}
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                            {session.followUpRequired ? (
                              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#D97706', backgroundColor: '#FFFBEB', padding: '0.1rem 0.4rem', borderRadius: 4, border: '1px solid #FDE68A' }}>
                                Follow-up Required
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.7rem', color: '#16A34A' }}>Follow-up complete</span>
                            )}
                            <button
                              onClick={() => setRecordOutcomeAppointment(session)}
                              style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                              type="button"
                            >
                              Edit Notes →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

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
                    onClick={() => setActiveTab('students')}
                    className="saas-quick-action-item"
                    type="button"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <Users size={16} color="#2563EB" />
                      <span>View My Students</span>
                    </div>
                    <ChevronRight size={16} color="#94A3B8" />
                  </button>

                  <button
                    onClick={() => setActiveTab('appointments')}
                    className="saas-quick-action-item"
                    type="button"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <Calendar size={16} color="#2563EB" />
                      <span>Appointments & Schedule</span>
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
                      <span>View Student Applications</span>
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
                      <span>Advisory Notes</span>
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
          <div className="saas-welcome-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 className="saas-welcome-title">Counselling Appointments</h1>
              <p className="saas-welcome-sub">
                Manage upcoming 1-on-1 consultations and past guidance sessions.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => {
                  loadCounsellorAppointments();
                  loadDashboard();
                }}
                disabled={isAppointmentsLoading}
                className="saas-btn saas-btn-secondary saas-btn-sm"
                type="button"
              >
                <RefreshCw size={13} className={isAppointmentsLoading ? 'animate-spin' : ''} /> Refresh
              </button>
              <button
                onClick={() => setSlotModalOpen(true)}
                className="saas-btn saas-btn-outline-primary saas-btn-sm"
                type="button"
              >
                <Settings size={13} /> Manage Slots
              </button>
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
                  {(() => {
                    const allAppointments = [
                      ...(counsellorAppointments || []),
                      ...(dashboardData?.upcomingAppointments || []),
                      ...(dashboardData?.todaySchedule || []),
                    ];
                    const uniqueMap = new Map();
                    for (const app of allAppointments) {
                      if (app && app.id && !uniqueMap.has(app.id)) {
                        uniqueMap.set(app.id, app);
                      }
                    }
                    const appointmentsToDisplay = Array.from(uniqueMap.values()).sort(
                      (a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
                    );

                    if (appointmentsToDisplay.length === 0) {
                      return (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                            <Calendar size={32} color="#CBD5E1" style={{ margin: '0 auto 0.5rem' }} />
                            <p style={{ margin: 0 }}>No counselling appointments scheduled.</p>
                          </td>
                        </tr>
                      );
                    }

                    return appointmentsToDisplay.map((app: any) => (
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
                            {app.studentProfile?.fullName || app.studentName || 'Enrolled Student'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                            {app.studentProfile?.contactEmail || app.studentEmail || '—'}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: '#475569' }}>
                          {app.title || (app.appointmentType ? app.appointmentType.replace(/_/g, ' ') : 'General Consultation')}
                        </td>
                        <td style={{ fontSize: '0.82rem', color: '#64748B' }}>
                          {app.durationMinutes || 45} mins
                        </td>
                        <td>
                          <span style={{ fontSize: '0.78rem', color: '#2563EB', backgroundColor: '#EFF6FF', padding: '0.2rem 0.5rem', borderRadius: 4 }}>
                            {app.meetingMode || (app.meetingType ? app.meetingType.replace(/_/g, ' ') : 'Online Video')}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={app.status || 'SCHEDULED'} />
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            {app.status === 'CONFIRMED' && (
                              <>
                                <button
                                  onClick={() => setActiveMeetingAppointment(app)}
                                  className="saas-btn saas-btn-primary saas-btn-sm"
                                  type="button"
                                >
                                  <Video size={13} /> Launch Meeting
                                </button>
                                <button
                                  onClick={() => setRecordOutcomeAppointment(app)}
                                  className="saas-btn saas-btn-sm"
                                  style={{ backgroundColor: '#10B981', color: '#FFFFFF', border: 'none' }}
                                  type="button"
                                >
                                  <CheckCircle2 size={13} /> Record Outcome
                                </button>
                                <button
                                  onClick={() => handleSendReminder(app.id, 'WHATSAPP')}
                                  disabled={actionLoadingId === app.id}
                                  className="saas-btn saas-btn-secondary saas-btn-sm"
                                  title="Send WhatsApp Reminder"
                                  type="button"
                                >
                                  <Bell size={13} />
                                </button>
                              </>
                            )}
                            {app.status === 'SCHEDULED' && (
                              <>
                                <button
                                  onClick={() => setActiveMeetingAppointment(app)}
                                  className="saas-btn saas-btn-primary saas-btn-sm"
                                  type="button"
                                >
                                  <Video size={13} /> Start Meeting
                                </button>
                                <button
                                  onClick={() => handleUpdateAppointmentStatus(app.id, 'CONFIRMED')}
                                  disabled={actionLoadingId === app.id}
                                  className="saas-btn saas-btn-sm"
                                  style={{ backgroundColor: '#16A34A', color: '#FFFFFF', border: 'none' }}
                                  type="button"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleUpdateAppointmentStatus(app.id, 'CANCELLED')}
                                  disabled={actionLoadingId === app.id}
                                  className="saas-btn saas-btn-secondary saas-btn-sm"
                                  style={{ color: '#DC2626' }}
                                  type="button"
                                >
                                  Decline
                                </button>
                                <button
                                  onClick={() => handleSendReminder(app.id, 'WHATSAPP')}
                                  disabled={actionLoadingId === app.id}
                                  className="saas-btn saas-btn-secondary saas-btn-sm"
                                  title="Send WhatsApp Reminder"
                                  type="button"
                                >
                                  <Bell size={13} />
                                </button>
                              </>
                            )}
                            {app.status === 'COMPLETED' && (
                              <button
                                onClick={() => setRecordOutcomeAppointment(app)}
                                className="saas-btn saas-btn-outline-primary saas-btn-sm"
                                type="button"
                              >
                                Edit Record
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
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

      {activeMeetingAppointment && (
        <InteractiveMeetingModal
          appointment={activeMeetingAppointment}
          userRole="COUNSELLOR"
          onClose={() => setActiveMeetingAppointment(null)}
          onRecordOutcome={(app) => {
            setActiveMeetingAppointment(null);
            setRecordOutcomeAppointment(app);
          }}
        />
      )}

      {recordOutcomeAppointment && (
        <RecordSessionOutcomeModal
          appointment={recordOutcomeAppointment}
          onClose={() => setRecordOutcomeAppointment(null)}
          onSuccess={() => {
            loadDashboard();
          }}
        />
      )}

      {/* Counsellor Slot Availability Management Modal (PDF Requirement) */}
      {slotModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
            padding: '1rem',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#F8FAFC',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '8px',
                    backgroundColor: '#EFF6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563EB',
                  }}
                >
                  <Settings size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                    Manage Availability Timings
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B' }}>
                    Control open slots so students can only book during your free hours
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSlotModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                type="button"
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                  Target Date
                </label>
                <input
                  type="date"
                  className="saas-input"
                  style={{ width: '100%' }}
                  value={slotDate}
                  onChange={(e) => setSlotDate(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                  Open Slots for Student Booking (Unselected will be blocked)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                  {[
                    '09:00 AM',
                    '10:00 AM',
                    '11:00 AM',
                    '12:00 PM',
                    '02:00 PM',
                    '03:00 PM',
                    '04:00 PM',
                    '05:00 PM',
                    '06:00 PM',
                  ].map((slot) => {
                    const isChecked = customSlots.includes(slot);
                    return (
                      <label
                        key={slot}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.55rem 0.75rem',
                          border: isChecked ? '1px solid #2563EB' : '1px solid #CBD5E1',
                          borderRadius: '6px',
                          backgroundColor: isChecked ? '#EFF6FF' : '#FFFFFF',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          color: isChecked ? '#1D4ED8' : '#334155',
                          fontWeight: isChecked ? 600 : 400,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCustomSlots((prev) => [...prev, slot]);
                            } else {
                              setCustomSlots((prev) => prev.filter((s) => s !== slot));
                            }
                          }}
                          style={{ accentColor: '#2563EB' }}
                        />
                        <span>{slot}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
              }}
            >
              <button
                type="button"
                onClick={() => setSlotModalOpen(false)}
                className="saas-btn saas-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSlots}
                disabled={savingSlots || customSlots.length === 0}
                className="saas-btn saas-btn-primary"
              >
                {savingSlots ? 'Saving Timings...' : 'Save & Block Other Hours'}
              </button>
            </div>
          </div>
        </div>
      )}
    </SaaSShell>
  );
};
export default CounsellorDashboardPage;
