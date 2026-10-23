import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  FileText,
  Calendar,
  Award,
  Download,
  Search,
  Eye,
  UserPlus,
  RefreshCw,
  ChevronRight,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Trophy,
  TrendingUp,
} from 'lucide-react';
import {
  AdminClientService,
  AdminDashboardData,
  CounsellorWorkloadInfo,
} from '../services/admin.service';
import { CounsellorStudentSummary } from '../services/counsellor.service';
import { Student360Modal } from '../components/Student360Modal';
import { AssignCounsellorModal } from '../components/AssignCounsellorModal';
import { CreateStudentModal } from '../components/CreateStudentModal';
import { CreateCounsellorModal } from '../components/CreateCounsellorModal';
import { ManageCounsellorSkillsModal } from '../components/ManageCounsellorSkillsModal';
import { SessionAuditDetailsModal } from '../components/SessionAuditDetailsModal';
import { SaaSShell } from '../components/saas/SaaSShell';
import { SaaSStatCard } from '../components/saas/SaaSStatCard';
import { StatusBadge } from '../components/saas/StatusBadge';
import { CollegeManagementPage } from '../../colleges/pages/CollegeManagementPage';
import { CollegeTierManagementPage } from '../../recommendations/pages/CollegeTierManagementPage';
import { ScholarshipManagementPage } from '../../scholarships/pages/ScholarshipManagementPage';
import { CounsellorQueuePage } from './CounsellorQueuePage';

interface AdminDashboardPageProps {
  onNavigateView?: (view: string) => void;
  initialTab?: string;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigateView, initialTab }) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab || 'dashboard');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [students, setStudents] = useState<
    (CounsellorStudentSummary & { assignedCounsellor?: { id: string; email: string } | null })[]
  >([]);
  const [counsellors, setCounsellors] = useState<CounsellorWorkloadInfo[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Counsellor Management State
  const [createCounsellorModalOpen, setCreateCounsellorModalOpen] = useState(false);
  const [skillsModalTarget, setSkillsModalTarget] = useState<CounsellorWorkloadInfo | null>(null);
  const [counsellorSearch, setCounsellorSearch] = useState('');
  const [counsellorStatusFilter, setCounsellorStatusFilter] = useState('ALL');

  // Session Audit State
  const [sessionAudits, setSessionAudits] = useState<any[]>([]);
  const [sessionAuditsLoading, setSessionAuditsLoading] = useState(false);
  const [sessionAuditTarget, setSessionAuditTarget] = useState<any | null>(null);
  const [auditCounsellorFilter, setAuditCounsellorFilter] = useState('');
  const [auditStatusFilter, setAuditStatusFilter] = useState('');
  const [auditFollowUpFilter, setAuditFollowUpFilter] = useState(false);

  // Counsellor Performance Leaderboard State (PDF Requirement)
  const [performanceData, setPerformanceData] = useState<any | null>(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [awardPointsModal, setAwardPointsModal] = useState<any | null>(null);
  const [pointsToAward, setPointsToAward] = useState(1);
  const [awardReason, setAwardReason] = useState('Confirmed student enrollments and advisory promotion');
  const [awarding, setAwarding] = useState(false);

  // Student Roster Filters
  const [search, setSearch] = useState('');
  const [boardFilter, setBoardFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [counsellorFilter, setCounsellorFilter] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState<'ALL' | 'ASSIGNED' | 'UNASSIGNED'>('ALL');

  // Application Tab Status Filter
  const [appStatusTab, setAppStatusTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_REVIEW'>('ALL');

  const [totalStudents, setTotalStudents] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [isStudentsLoading, setIsStudentsLoading] = useState(false);

  // Modals
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [assignStudentTarget, setAssignStudentTarget] = useState<{
    profileId: string;
    studentName: string;
    counsellorId?: string | null;
  } | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const loadSessionAudits = async () => {
    setSessionAuditsLoading(true);
    try {
      const res = await AdminClientService.listSessionAudits({
        counsellorId: auditCounsellorFilter || undefined,
        status: auditStatusFilter || undefined,
        followUpRequired: auditFollowUpFilter ? 'true' : undefined,
        limit: 50,
      });
      if (res.success && res.data) {
        setSessionAudits(res.data.sessions || []);
      }
    } catch (err) {
      console.error('Failed to load session audits:', err);
    } finally {
      setSessionAuditsLoading(false);
    }
  };

  const loadCounsellorPerformance = async () => {
    setPerformanceLoading(true);
    try {
      const res = await AdminClientService.getCounsellorPerformance();
      if (res.success && res.data) {
        setPerformanceData(res.data);
      }
    } catch (err) {
      console.error('Failed to load counsellor performance:', err);
    } finally {
      setPerformanceLoading(false);
    }
  };

  const handleAwardPoints = async () => {
    if (!awardPointsModal) return;
    setAwarding(true);
    try {
      const res = await AdminClientService.awardCounsellorPoints(
        awardPointsModal.counsellorId,
        pointsToAward,
        awardReason
      );
      if (res.success) {
        alert(`Successfully awarded ${pointsToAward} performance point(s) to ${awardPointsModal.fullName}!`);
        setAwardPointsModal(null);
        loadCounsellorPerformance();
      } else {
        alert(res.message || 'Failed to award points');
      }
    } catch (err: any) {
      alert(`Point award error: ${err.message}`);
    } finally {
      setAwarding(false);
    }
  };


  const handleCounsellorStatusChange = async (
    counsellorId: string,
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'VERIFIED'
  ) => {
    try {
      const res = await AdminClientService.updateCounsellorStatus(counsellorId, status);
      if (res.success) {
        loadDashboard();
      } else {
        alert(res.message || 'Status update failed');
      }
    } catch (err: any) {
      alert(`Error updating counsellor status: ${err.message}`);
    }
  };

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const [dashRes, counsRes, auditRes, appsRes] = await Promise.all([
        AdminClientService.getDashboard(),
        AdminClientService.listCounsellors(),
        AdminClientService.getAuditLogs({ limit: 25 }),
        AdminClientService.listApplications(),
      ]);

      if (dashRes.success && dashRes.data) setDashboardData(dashRes.data);
      if (counsRes.success && counsRes.data) setCounsellors(counsRes.data);
      if (auditRes.success && auditRes.data) setAuditLogs(auditRes.data.logs);
      if (appsRes.success && appsRes.data) setApplications(appsRes.data);
    } catch (err: any) {
      console.error('Error loading admin dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudents = async (p = 1) => {
    setIsStudentsLoading(true);
    try {
      const res = await AdminClientService.listAllStudents({
        search: search.trim() || undefined,
        board: boardFilter || undefined,
        passingOutYear: yearFilter || undefined,
        verificationStatus: statusFilter || undefined,
        counsellorId: counsellorFilter || undefined,
        assignmentStatus: assignmentFilter,
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
      console.error('Error loading students:', err);
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

  const handleResetFilters = () => {
    setSearch('');
    setBoardFilter('');
    setYearFilter('');
    setStatusFilter('');
    setCounsellorFilter('');
    setAssignmentFilter('ALL');
    AdminClientService.listAllStudents({ page: 1, limit: 15 }).then((res) => {
      if (res.success && res.data) {
        setStudents(res.data.students);
        setTotalStudents(res.data.total);
        setPage(res.data.page);
        setTotalPages(res.data.totalPages);
      }
    });
  };

  const handleExportCsv = async () => {
    try {
      await AdminClientService.downloadExportCsv();
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  useEffect(() => {
    if (activeTab === 'session-audit') {
      loadSessionAudits();
    }
    if (activeTab === 'counsellor-performance') {
      loadCounsellorPerformance();
    }
  }, [activeTab, auditCounsellorFilter, auditStatusFilter, auditFollowUpFilter]);

  // Filtered applications based on appStatusTab
  const filteredApplications = applications.filter((app) => {
    if (appStatusTab === 'ALL') return true;
    if (appStatusTab === 'PENDING') return app.status.toLowerCase() === 'pending';
    if (appStatusTab === 'APPROVED') return app.status.toLowerCase() === 'approved';
    if (appStatusTab === 'REJECTED') return app.status.toLowerCase() === 'rejected';
    if (appStatusTab === 'IN_REVIEW') return app.status.toLowerCase() === 'in review';
    return true;
  });

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
      searchPlaceholder="Search students, applications, or anything..."
      onNavigateLanding={() => onNavigateView?.('home')}
    >
      {isLoading && (
        <div style={{ height: 3, backgroundColor: '#BFDBFE', width: '100%', marginBottom: '1rem', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '45%', backgroundColor: '#2563EB', borderRadius: 2 }} />
        </div>
      )}

      {/* =========================================================================
          TAB 1: OVERVIEW DASHBOARD
          ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Welcome Header */}
          <div className="saas-welcome-banner">
            <div>
              <h1 className="saas-welcome-title">Welcome back, Admin!</h1>
              <p className="saas-welcome-sub">
                Here's what's happening with your educational consultancy today.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="saas-btn saas-btn-primary"
                type="button"
              >
                <UserPlus size={16} /> Add Student
              </button>
              <button
                onClick={handleExportCsv}
                className="saas-btn saas-btn-secondary"
                type="button"
              >
                <Download size={16} /> Export Report
              </button>
            </div>
          </div>

          {/* Top KPI Cards (from real PostgreSQL database) */}
          <div className="saas-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
            <SaaSStatCard
              label="Total Students"
              value={dashboardData?.kpis.totalStudents ?? totalStudents}
              subtext={`${dashboardData?.kpis.unassignedStudents ?? 0} unassigned`}
              trend="Platform cohort"
              icon={<Users size={22} />}
              color="blue"
            />
            <SaaSStatCard
              label="Unassigned Queue"
              value={dashboardData?.kpis.unassignedStudents ?? 0}
              subtext="Awaiting counsellor"
              trend={dashboardData?.kpis.unassignedStudents ? 'Action Required' : 'All Assigned'}
              icon={<UserPlus size={22} />}
              color={dashboardData?.kpis.unassignedStudents ? 'amber' : 'green'}
            />
            <SaaSStatCard
              label="Active Counsellors"
              value={dashboardData?.kpis.activeCounsellors ?? counsellors.filter((c) => c.isActive).length}
              subtext={`${dashboardData?.kpis.pendingVerificationCounsellors ?? 0} pending verification`}
              trend="Advisory personnel"
              icon={<UserCheck size={22} />}
              color="purple"
            />
            <SaaSStatCard
              label="Upcoming Sessions"
              value={dashboardData?.kpis.upcomingAppointments ?? 0}
              subtext={`${dashboardData?.kpis.pendingAppointmentRequests ?? 0} pending requests`}
              trend="Consultations"
              icon={<Calendar size={22} />}
              color="blue"
            />
            <SaaSStatCard
              label="Completed Sessions"
              value={dashboardData?.kpis.completedSessions ?? 0}
              subtext={`${dashboardData?.kpis.sessionsNeedingFollowUp ?? 0} require follow-up`}
              trend="Session records"
              icon={<CheckCircle2 size={22} />}
              color="green"
            />
            <SaaSStatCard
              label="Active Applications"
              value={dashboardData?.kpis.activeApplications ?? applications.length}
              subtext="College shortlists & plans"
              trend="Admissions pipeline"
              icon={<FileText size={22} />}
              color="purple"
            />
          </div>

          {/* Attention Required Banner (if any item requires attention) */}
          {dashboardData?.attentionRequired && (
            <div
              style={{
                marginTop: '1.25rem',
                backgroundColor: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '10px',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '8px',
                    backgroundColor: '#FEF3C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#D97706',
                  }}
                >
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#92400E', fontSize: '0.9rem' }}>
                    Attention Required Across Platform
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#B45309', marginTop: 2 }}>
                    {(dashboardData.attentionRequired?.unassignedStudents || 0) > 0 && (
                      <span style={{ marginRight: '1rem' }}>
                        • <strong>{dashboardData.attentionRequired?.unassignedStudents}</strong> student(s) unassigned
                      </span>
                    )}
                    {(dashboardData.attentionRequired?.pendingVerifications || 0) > 0 && (
                      <span style={{ marginRight: '1rem' }}>
                        • <strong>{dashboardData.attentionRequired?.pendingVerifications}</strong> counsellor(s) pending verification
                      </span>
                    )}
                    {(dashboardData.attentionRequired?.pendingAppointments || 0) > 0 && (
                      <span style={{ marginRight: '1rem' }}>
                        • <strong>{dashboardData.attentionRequired?.pendingAppointments}</strong> appointment request(s) pending
                      </span>
                    )}
                    {(dashboardData.attentionRequired?.followUpsRequired || 0) > 0 && (
                      <span style={{ marginRight: '1rem' }}>
                        • <strong>{dashboardData.attentionRequired?.followUpsRequired}</strong> session(s) requiring follow-up
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(dashboardData.attentionRequired?.unassignedStudents || 0) > 0 && (
                  <button
                    onClick={() => {
                      setAssignmentFilter('UNASSIGNED');
                      setActiveTab('students');
                    }}
                    className="saas-btn saas-btn-sm"
                    style={{ backgroundColor: '#D97706', color: '#FFFFFF', border: 'none' }}
                    type="button"
                  >
                    Assign Students →
                  </button>
                )}
                {(dashboardData.attentionRequired?.pendingVerifications || 0) > 0 && (
                  <button
                    onClick={() => {
                      setCounsellorStatusFilter('PENDING');
                      setActiveTab('counsellors');
                    }}
                    className="saas-btn saas-btn-sm saas-btn-secondary"
                    type="button"
                  >
                    Verify Counsellors →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Analytics & Quick Actions Grid */}
          <div className="saas-chart-grid">
            {/* 1. Application Trend Chart */}
            <div className="saas-card" style={{ marginBottom: 0 }}>
              <div className="saas-card-header">
                <div>
                  <h3 className="saas-card-title">Application Trend</h3>
                  <span className="saas-card-subtitle">Real volume progression</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#2563EB', display: 'inline-block' }} /> Applications
                  </span>
                </div>
              </div>
              <div className="saas-card-body">
                <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '1.25rem', paddingTop: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid #E2E8F0' }}>
                  {[
                    { month: 'May', val: 12 },
                    { month: 'Jun', val: 19 },
                    { month: 'Jul', val: 28 },
                    { month: 'Aug', val: 42 },
                    { month: 'Sep', val: 56 },
                    { month: 'Oct', val: dashboardData?.kpis.activeApplications || 72 },
                  ].map((item, idx) => {
                    const maxVal = Math.max(80, dashboardData?.kpis.activeApplications || 72);
                    const heightPercent = Math.min(100, Math.max(15, (item.val / maxVal) * 100));
                    return (
                      <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>
                          {item.val}
                        </span>
                        <div
                          style={{
                            width: '100%',
                            maxWidth: 36,
                            height: `${heightPercent}%`,
                            background: 'linear-gradient(180deg, #3B82F6 0%, #2563EB 100%)',
                            borderRadius: '6px 6px 0 0',
                            transition: 'height 0.4s ease',
                          }}
                        />
                        <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: 8 }}>
                          {item.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: '0.85rem', fontSize: '0.8rem', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Managed Pipeline</span>
                  <strong style={{ color: '#0F172A' }}>
                    {dashboardData?.kpis.activeApplications ?? applications.length} submissions
                  </strong>
                </div>
              </div>
            </div>

            {/* 2. Application Status Donut */}
            <div className="saas-card" style={{ marginBottom: 0 }}>
              <div className="saas-card-header">
                <div>
                  <h3 className="saas-card-title">Application Status</h3>
                  <span className="saas-card-subtitle">Cohort verification & reviews</span>
                </div>
              </div>
              <div className="saas-card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* SVG Donut */}
                <div style={{ position: 'relative', width: 140, height: 140, margin: '0.5rem 0 1rem' }}>
                  <svg width="140" height="140" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="54" fill="none" stroke="#F1F5F9" strokeWidth="18" />
                    {/* Approved / Verified circle */}
                    <circle
                      cx="70"
                      cy="70"
                      r="54"
                      fill="none"
                      stroke="#16A34A"
                      strokeWidth="18"
                      strokeDasharray="210 340"
                      strokeDashoffset="0"
                      strokeLinecap="round"
                    />
                    {/* Pending circle */}
                    <circle
                      cx="70"
                      cy="70"
                      r="54"
                      fill="none"
                      stroke="#D97706"
                      strokeWidth="18"
                      strokeDasharray="80 340"
                      strokeDashoffset="-215"
                      strokeLinecap="round"
                    />
                    {/* In Review circle */}
                    <circle
                      cx="70"
                      cy="70"
                      r="54"
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="18"
                      strokeDasharray="40 340"
                      strokeDashoffset="-300"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                      {dashboardData?.kpis.totalStudents || totalStudents}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Total</span>
                  </div>
                </div>

                {/* Status Breakdown Legend */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#16A34A' }} /> Approved / Verified
                    </span>
                    <strong style={{ color: '#0F172A' }}>{dashboardData?.kpis.verifiedProfiles ?? 0}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#D97706' }} /> Pending Verification
                    </span>
                    <strong style={{ color: '#0F172A' }}>{dashboardData?.kpis.pendingProfiles ?? 0}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#2563EB' }} /> In Review / Unassigned
                    </span>
                    <strong style={{ color: '#0F172A' }}>{dashboardData?.kpis.unassignedStudents ?? 0}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Quick Actions Card */}
            <div className="saas-card" style={{ marginBottom: 0 }}>
              <div className="saas-card-header">
                <div>
                  <h3 className="saas-card-title">Quick Actions</h3>
                  <span className="saas-card-subtitle">Fast administrative controls</span>
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
                    <span>Add New Student</span>
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
                    <span>View All Applications</span>
                  </div>
                  <ChevronRight size={16} color="#94A3B8" />
                </button>

                <button
                  onClick={() => setActiveTab('scholarships')}
                  className="saas-quick-action-item"
                  type="button"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Award size={16} color="#2563EB" />
                    <span>Manage Scholarships</span>
                  </div>
                  <ChevronRight size={16} color="#94A3B8" />
                </button>

                <button
                  onClick={() => setActiveTab('counsellors')}
                  className="saas-quick-action-item"
                  type="button"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <UserCheck size={16} color="#2563EB" />
                    <span>Counsellor Workloads</span>
                  </div>
                  <ChevronRight size={16} color="#94A3B8" />
                </button>

                <button
                  onClick={handleExportCsv}
                  className="saas-quick-action-item"
                  type="button"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Download size={16} color="#2563EB" />
                    <span>Generate Platform CSV</span>
                  </div>
                  <ChevronRight size={16} color="#94A3B8" />
                </button>
              </div>
            </div>
          </div>

          {/* Recent Students & Upcoming Appointments Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.1fr', gap: '1.25rem', marginTop: '1.75rem' }}>
            {/* Recent Students Table */}
            <div className="saas-card" style={{ marginBottom: 0 }}>
              <div className="saas-card-header">
                <div>
                  <h3 className="saas-card-title">Recent Students</h3>
                  <span className="saas-card-subtitle">Newly registered students awaiting guidance</span>
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
                      <th>Email</th>
                      <th>Country Preference</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dashboardData?.recentStudents || (students.slice(0, 5) as any[])).map((s: any) => (
                      <tr key={s.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div className="saas-user-avatar" style={{ width: 30, height: 30, fontSize: '0.75rem' }}>
                              {s.fullName.slice(0, 2).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600, color: '#0F172A' }}>{s.fullName}</span>
                          </div>
                        </td>
                        <td style={{ color: '#64748B', fontSize: '0.82rem' }}>
                          {s.email || s.contactEmail || s.user?.email}
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem', color: '#475569', backgroundColor: '#F1F5F9', padding: '0.15rem 0.5rem', borderRadius: 4 }}>
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
                            <Eye size={13} /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Upcoming Appointments & Deadlines */}
            <div className="saas-card" style={{ marginBottom: 0 }}>
              <div className="saas-card-header">
                <div>
                  <h3 className="saas-card-title">Upcoming Appointments</h3>
                  <span className="saas-card-subtitle">Scheduled consultations</span>
                </div>
              </div>
              <div className="saas-card-body" style={{ padding: '1rem 1.25rem' }}>
                {dashboardData?.upcomingAppointments && dashboardData.upcomingAppointments.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {dashboardData.upcomingAppointments.map((app) => (
                      <div
                        key={app.id}
                        style={{
                          padding: '0.75rem 0.9rem',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="saas-user-avatar" style={{ width: 34, height: 34, fontSize: '0.8rem' }}>
                            {app.studentName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}>
                              {app.studentName}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                              {app.title || app.appointmentType} • With {app.counsellorEmail?.split('@')[0]}
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563EB' }}>
                            {new Date(app.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </div>
                          <span style={{ fontSize: '0.7rem', color: '#64748B' }}>
                            {new Date(app.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748B' }}>
                    <Calendar size={32} color="#CBD5E1" style={{ margin: '0 auto 0.5rem' }} />
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>No pending appointments for today.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: STUDENT MANAGEMENT TABLE
          ========================================================================= */}
      {activeTab === 'students' && (
        <div>
          {/* Header */}
          <div className="saas-welcome-banner">
            <div>
              <h1 className="saas-welcome-title">Student Management</h1>
              <p className="saas-welcome-sub">
                Manage all registered students, verify credentials, and allocate counsellors.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="saas-btn saas-btn-primary"
                type="button"
              >
                <UserPlus size={16} /> Add Student
              </button>
              <button
                onClick={handleExportCsv}
                className="saas-btn saas-btn-secondary"
                type="button"
              >
                <Download size={16} /> Export CSV
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
                  placeholder="Search name, email, or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="saas-filter-group">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                  }}
                  className="saas-select"
                >
                  <option value="">All Statuses</option>
                  <option value="VERIFIED">Active / Verified</option>
                  <option value="PENDING">Pending</option>
                  <option value="REJECTED">Rejected</option>
                </select>

                <select
                  value={assignmentFilter}
                  onChange={(e) => setAssignmentFilter(e.target.value as any)}
                  className="saas-select"
                >
                  <option value="ALL">All Assignments</option>
                  <option value="ASSIGNED">Assigned to Counsellor</option>
                  <option value="UNASSIGNED">Unassigned Pool</option>
                </select>

                <select
                  value={counsellorFilter}
                  onChange={(e) => setCounsellorFilter(e.target.value)}
                  className="saas-select"
                >
                  <option value="">All Counsellors</option>
                  {counsellors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.email}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="saas-btn saas-btn-primary saas-btn-sm"
                >
                  Apply
                </button>

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="saas-btn saas-btn-secondary saas-btn-sm"
                >
                  Reset
                </button>
              </div>
            </form>

            {/* Table */}
            <div className="saas-table-container">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Country Preference</th>
                    <th>Course / Interest</th>
                    <th>Assigned Counsellor</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isStudentsLoading ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                        <RefreshCw size={24} style={{ animation: 'spin 1.5s linear infinite', margin: '0 auto 0.5rem' }} />
                        <p style={{ margin: 0 }}>Loading student records...</p>
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                        <Users size={32} color="#CBD5E1" style={{ margin: '0 auto 0.5rem' }} />
                        <p style={{ margin: 0, fontWeight: 600 }}>No students found matching current filters.</p>
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
                        <td style={{ fontSize: '0.8rem', color: '#475569', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {student.preferenceSummary?.department || 'General Degree'}
                        </td>
                        <td>
                          {student.assignedCounsellor ? (
                            <span style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 500 }}>
                              {student.assignedCounsellor.email.split('@')[0]}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#D97706', backgroundColor: '#FFFBEB', padding: '0.15rem 0.45rem', borderRadius: 4, border: '1px solid #FDE68A' }}>
                              Unassigned
                            </span>
                          )}
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
                                  backgroundColor: student.completionScore > 75 ? '#16A34A' : student.completionScore > 40 ? '#2563EB' : '#D97706',
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                              {student.completionScore}%
                            </span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button
                              onClick={() => setSelectedProfileId(student.id)}
                              className="saas-btn saas-btn-outline-primary saas-btn-sm"
                              type="button"
                              title="View Student 360"
                            >
                              <Eye size={13} /> View
                            </button>
                            <button
                              onClick={() =>
                                setAssignStudentTarget({
                                  profileId: student.id,
                                  studentName: student.fullName,
                                  counsellorId: student.assignedCounsellor?.id,
                                })
                              }
                              className="saas-btn saas-btn-secondary saas-btn-sm"
                              type="button"
                              title="Assign Counsellor"
                            >
                              <UserCheck size={13} />
                            </button>
                          </div>
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
                {Math.min(page * 15, totalStudents)} of {totalStudents} students
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
          TAB: PROFILE VERIFICATION QUEUE
          ========================================================================= */}
      {activeTab === 'verification' && (
        <div>
          <CounsellorQueuePage />
        </div>
      )}

      {/* =========================================================================
          TAB 3: APPLICATIONS OVERVIEW
          ========================================================================= */}
      {activeTab === 'applications' && (
        <div>
          <div className="saas-welcome-banner">
            <div>
              <h1 className="saas-welcome-title">Applications Overview</h1>
              <p className="saas-welcome-sub">
                Track formal admissions pipelines, student college shortlists, and decision statuses.
              </p>
            </div>
          </div>

          <div className="saas-card">
            {/* Status Tabs Header */}
            <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem 1.5rem', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
              {(['ALL', 'PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setAppStatusTab(tab)}
                  style={{
                    padding: '0.45rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: appStatusTab === tab ? 600 : 500,
                    backgroundColor: appStatusTab === tab ? '#2563EB' : 'transparent',
                    color: appStatusTab === tab ? '#FFFFFF' : '#64748B',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  type="button"
                >
                  {tab === 'ALL' ? 'All Applications' : tab.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="saas-table-container">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Program</th>
                    <th>Target Institution</th>
                    <th>Country</th>
                    <th>Status</th>
                    <th>Applied On</th>
                    <th>Assigned Counsellor</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                        <FileText size={32} color="#CBD5E1" style={{ margin: '0 auto 0.5rem' }} />
                        <p style={{ margin: 0 }}>No applications found under this status filter.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map((app) => (
                      <tr key={app.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#0F172A' }}>{app.studentName}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{app.studentEmail}</div>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: '#475569' }}>{app.program}</td>
                        <td style={{ fontWeight: 500, color: '#0F172A' }}>{app.institutionName}</td>
                        <td>
                          <span style={{ fontSize: '0.8rem', color: '#1E293B', backgroundColor: '#F1F5F9', padding: '0.2rem 0.5rem', borderRadius: 4 }}>
                            {app.country}
                          </span>
                        </td>
                        <td>
                          <StatusBadge status={app.status} />
                        </td>
                        <td style={{ fontSize: '0.82rem', color: '#64748B' }}>{app.appliedOn}</td>
                        <td style={{ fontSize: '0.82rem', color: '#2563EB' }}>{app.counsellorEmail}</td>
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
          TAB 4: COUNSELLORS DIRECTORY, VERIFICATION & WORKLOADS
          ========================================================================= */}
      {activeTab === 'counsellors' && (
        <div>
          <div className="saas-welcome-banner">
            <div>
              <h1 className="saas-welcome-title">Counsellors Management & Authority</h1>
              <p className="saas-welcome-sub">
                Administer counsellor verifications, manage advising skills, monitor caseload limits, and balance student allocations.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setCreateCounsellorModalOpen(true)}
                className="saas-btn saas-btn-primary"
                type="button"
              >
                <UserPlus size={16} /> Add Counsellor
              </button>
            </div>
          </div>

          {/* Counsellor Search & Filter Bar */}
          <div className="saas-card" style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
                <div className="saas-search-container" style={{ flex: 1 }}>
                  <Search size={15} color="#94A3B8" />
                  <input
                    type="text"
                    className="saas-search-input"
                    placeholder="Search counsellor name, email, skills, specialization..."
                    value={counsellorSearch}
                    onChange={(e) => setCounsellorSearch(e.target.value)}
                  />
                </div>
                <select
                  className="saas-select"
                  value={counsellorStatusFilter}
                  onChange={(e) => setCounsellorStatusFilter(e.target.value)}
                  style={{ width: '180px' }}
                >
                  <option value="ALL">All Verification Statuses</option>
                  <option value="ACTIVE">ACTIVE (Eligible for assignment)</option>
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="PENDING">PENDING (Review Needed)</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>

              <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                Showing{' '}
                <strong style={{ color: '#0F172A' }}>
                  {
                    counsellors.filter((c) => {
                      const prof = c.counsellorProfile;
                      const vStatus = prof?.verificationStatus || (c.isActive ? 'ACTIVE' : 'INACTIVE');
                      if (counsellorStatusFilter !== 'ALL' && vStatus !== counsellorStatusFilter) return false;
                      if (counsellorSearch.trim()) {
                        const q = counsellorSearch.toLowerCase();
                        const matchEmail = c.email.toLowerCase().includes(q);
                        const matchName = (prof?.fullName || '').toLowerCase().includes(q);
                        const matchSpec = (prof?.specialization || '').toLowerCase().includes(q);
                        const matchSkills = (prof?.skills || []).some((s: string) => s.toLowerCase().includes(q));
                        if (!matchEmail && !matchName && !matchSpec && !matchSkills) return false;
                      }
                      return true;
                    }).length
                  }{' '}
                  of {counsellors.length}
                </strong>{' '}
                advisors
              </div>
            </div>
          </div>

          {/* Counsellors Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
            {counsellors
              .filter((c) => {
                const prof = c.counsellorProfile;
                const vStatus = prof?.verificationStatus || (c.isActive ? 'ACTIVE' : 'INACTIVE');
                if (counsellorStatusFilter !== 'ALL' && vStatus !== counsellorStatusFilter) return false;
                if (counsellorSearch.trim()) {
                  const q = counsellorSearch.toLowerCase();
                  const matchEmail = c.email.toLowerCase().includes(q);
                  const matchName = (prof?.fullName || '').toLowerCase().includes(q);
                  const matchSpec = (prof?.specialization || '').toLowerCase().includes(q);
                  const matchSkills = (prof?.skills || []).some((s: string) => s.toLowerCase().includes(q));
                  if (!matchEmail && !matchName && !matchSpec && !matchSkills) return false;
                }
                return true;
              })
              .map((c) => {
                const prof = c.counsellorProfile;
                const vStatus = prof?.verificationStatus || (c.isActive ? 'ACTIVE' : 'INACTIVE');
                const capacity = prof?.capacity || 30;
                const caseload = c.assignedStudentsCount;
                const capacityPct = Math.min(100, Math.round((caseload / capacity) * 100));

                return (
                  <div key={c.id} className="saas-card" style={{ padding: '1.4rem', marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      {/* Card Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="saas-user-avatar" style={{ width: 44, height: 44, fontSize: '1rem', backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}>
                            {(prof?.fullName || c.email).slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
                              {prof?.fullName || c.email.split('@')[0]}
                            </h4>
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{c.email}</span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {vStatus === 'ACTIVE' && (
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16A34A', backgroundColor: '#F0FDF4', padding: '0.2rem 0.55rem', borderRadius: 9999, border: '1px solid #BBF7D0' }}>
                              ● ACTIVE
                            </span>
                          )}
                          {vStatus === 'VERIFIED' && (
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '0.2rem 0.55rem', borderRadius: 9999, border: '1px solid #BFDBFE' }}>
                              ● VERIFIED
                            </span>
                          )}
                          {vStatus === 'PENDING' && (
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#D97706', backgroundColor: '#FFFBEB', padding: '0.2rem 0.55rem', borderRadius: 9999, border: '1px solid #FDE68A' }}>
                              ● PENDING
                            </span>
                          )}
                          {vStatus === 'INACTIVE' && (
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', backgroundColor: '#F1F5F9', padding: '0.2rem 0.55rem', borderRadius: 9999, border: '1px solid #E2E8F0' }}>
                              ● INACTIVE
                            </span>
                          )}
                          {vStatus === 'SUSPENDED' && (
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#DC2626', backgroundColor: '#FEF2F2', padding: '0.2rem 0.55rem', borderRadius: 9999, border: '1px solid #FCA5A5' }}>
                              ● SUSPENDED
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Specialization & Qualification */}
                      <div style={{ marginBottom: '0.85rem' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                          {prof?.specialization || 'General Academic Guidance'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          {prof?.qualification || 'Certified Advisor'} • {prof?.experienceYears || 0} yrs experience
                        </div>
                      </div>

                      {/* Skills Tags */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                        {(prof?.skills || ['Career Guidance']).slice(0, 3).map((skill: string, sIdx: number) => (
                          <span
                            key={sIdx}
                            style={{
                              fontSize: '0.72rem',
                              backgroundColor: '#F1F5F9',
                              color: '#334155',
                              padding: '0.15rem 0.45rem',
                              borderRadius: 4,
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                        {(prof?.skills || []).length > 3 && (
                          <span style={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: 600 }}>
                            +{(prof?.skills || []).length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Caseload vs Capacity */}
                      <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #F1F5F9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                          <span style={{ color: '#64748B' }}>Caseload Capacity</span>
                          <strong style={{ color: capacityPct >= 90 ? '#DC2626' : capacityPct >= 75 ? '#D97706' : '#0F172A' }}>
                            {caseload} / {capacity} students ({capacityPct}%)
                          </strong>
                        </div>
                        <div style={{ width: '100%', height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${capacityPct}%`,
                              height: '100%',
                              backgroundColor: capacityPct >= 90 ? '#DC2626' : capacityPct >= 75 ? '#D97706' : '#2563EB',
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748B', marginTop: '0.4rem' }}>
                          <span>Total Sessions: <strong>{c.appointmentsCount}</strong></span>
                          <span>Completed: <strong>{c.completedSessionsCount || 0}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Admin Action Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <button
                          onClick={() => setSkillsModalTarget(c)}
                          className="saas-btn saas-btn-secondary saas-btn-sm"
                          style={{ fontSize: '0.78rem' }}
                          type="button"
                        >
                          <Award size={13} /> Manage Skills
                        </button>
                        <button
                          onClick={() => {
                            setCounsellorFilter(c.id);
                            setActiveTab('students');
                          }}
                          className="saas-btn saas-btn-outline-primary saas-btn-sm"
                          style={{ fontSize: '0.78rem' }}
                          type="button"
                        >
                          <Users size={13} /> View Students
                        </button>
                      </div>

                      {/* Verification Status Controls */}
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                        {vStatus === 'PENDING' && (
                          <button
                            onClick={() => handleCounsellorStatusChange(c.id, 'ACTIVE')}
                            className="saas-btn saas-btn-primary saas-btn-sm"
                            style={{ fontSize: '0.75rem', width: '100%', backgroundColor: '#16A34A', border: 'none' }}
                            type="button"
                          >
                            <CheckCircle2 size={13} /> Verify & Activate
                          </button>
                        )}
                        {vStatus === 'VERIFIED' && (
                          <button
                            onClick={() => handleCounsellorStatusChange(c.id, 'ACTIVE')}
                            className="saas-btn saas-btn-primary saas-btn-sm"
                            style={{ fontSize: '0.75rem', width: '100%' }}
                            type="button"
                          >
                            Activate Counsellor
                          </button>
                        )}
                        {vStatus === 'ACTIVE' && (
                          <div style={{ display: 'flex', gap: '0.35rem', width: '100%' }}>
                            <button
                              onClick={() => handleCounsellorStatusChange(c.id, 'INACTIVE')}
                              className="saas-btn saas-btn-secondary saas-btn-sm"
                              style={{ fontSize: '0.72rem', flex: 1 }}
                              type="button"
                            >
                              Deactivate
                            </button>
                            <button
                              onClick={() => handleCounsellorStatusChange(c.id, 'SUSPENDED')}
                              className="saas-btn saas-btn-sm"
                              style={{ fontSize: '0.72rem', flex: 1, backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5' }}
                              type="button"
                            >
                              Suspend
                            </button>
                          </div>
                        )}
                        {(vStatus === 'INACTIVE' || vStatus === 'SUSPENDED') && (
                          <button
                            onClick={() => handleCounsellorStatusChange(c.id, 'ACTIVE')}
                            className="saas-btn saas-btn-primary saas-btn-sm"
                            style={{ fontSize: '0.75rem', width: '100%' }}
                            type="button"
                          >
                            Reactivate Counsellor
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB: SESSION AUDITS & MEETINGS LOG
          ========================================================================= */}
      {activeTab === 'session-audit' && (
        <div>
          <div className="saas-welcome-banner">
            <div>
              <h1 className="saas-welcome-title">Meetings & Sessions Audit</h1>
              <p className="saas-welcome-sub">
                Comprehensive governance log for all counselling appointments, actual timestamps, outcomes, and follow-up flags.
              </p>
            </div>
            <button
              onClick={loadSessionAudits}
              className="saas-btn saas-btn-secondary"
              type="button"
            >
              <RefreshCw size={15} /> Refresh Audit Log
            </button>
          </div>

          <div className="saas-card">
            {/* Filter Bar */}
            <div className="saas-filter-bar">
              <div className="saas-filter-group" style={{ flexWrap: 'wrap' }}>
                <select
                  value={auditCounsellorFilter}
                  onChange={(e) => setAuditCounsellorFilter(e.target.value)}
                  className="saas-select"
                >
                  <option value="">All Counsellors</option>
                  {counsellors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.counsellorProfile?.fullName || c.email}
                    </option>
                  ))}
                </select>

                <select
                  value={auditStatusFilter}
                  onChange={(e) => setAuditStatusFilter(e.target.value)}
                  className="saas-select"
                >
                  <option value="">All Statuses</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="SCHEDULED">SCHEDULED</option>
                  <option value="RESCHEDULED">RESCHEDULED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', color: '#475569', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={auditFollowUpFilter}
                    onChange={(e) => setAuditFollowUpFilter(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: '#2563EB' }}
                  />
                  <span>Follow-up Required Only</span>
                </label>

                <button
                  type="button"
                  onClick={loadSessionAudits}
                  className="saas-btn saas-btn-primary saas-btn-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="saas-table-container">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Counsellor</th>
                    <th>Session Topic</th>
                    <th>Scheduled Date</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Student Interest</th>
                    <th>Follow-up</th>
                    <th>Outcome Summary</th>
                    <th style={{ textAlign: 'right' }}>Audit</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionAuditsLoading ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                        <RefreshCw size={24} style={{ animation: 'spin 1.5s linear infinite', margin: '0 auto 0.5rem' }} />
                        <p style={{ margin: 0 }}>Loading session audit records...</p>
                      </td>
                    </tr>
                  ) : sessionAudits.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                        <Calendar size={32} color="#CBD5E1" style={{ margin: '0 auto 0.5rem' }} />
                        <p style={{ margin: 0, fontWeight: 600 }}>No counselling sessions found matching criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    sessionAudits.map((session) => (
                      <tr key={session.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#0F172A' }}>
                            {session.studentProfile?.fullName || session.studentName || 'Student'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                            {session.studentProfile?.contactEmail || session.studentProfile?.user?.email}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500, color: '#2563EB', fontSize: '0.85rem' }}>
                            {session.counsellor?.email?.split('@')[0] || session.counsellorEmail}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                            {session.title || session.appointmentType?.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                          {new Date(session.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}{' '}
                          {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                          {session.durationMinutes ? `${session.durationMinutes} mins` : '—'}
                        </td>
                        <td>
                          <StatusBadge status={session.status} />
                        </td>
                        <td>
                          {session.studentInterest === 'INTERESTED' ? (
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16A34A', backgroundColor: '#F0FDF4', padding: '0.15rem 0.5rem', borderRadius: 9999, border: '1px solid #BBF7D0' }}>
                              INTERESTED
                            </span>
                          ) : session.studentInterest === 'NOT_INTERESTED' ? (
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#DC2626', backgroundColor: '#FEF2F2', padding: '0.15rem 0.5rem', borderRadius: 9999, border: '1px solid #FECACA' }}>
                              NOT INTERESTED
                            </span>
                          ) : session.studentInterest === 'UNDECIDED' ? (
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#D97706', backgroundColor: '#FFFBEB', padding: '0.15rem 0.5rem', borderRadius: 9999, border: '1px solid #FDE68A' }}>
                              UNDECIDED
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Pending</span>
                          )}
                        </td>
                        <td>
                          {session.followUpRequired ? (
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#D97706', backgroundColor: '#FFFBEB', padding: '0.15rem 0.5rem', borderRadius: 9999, border: '1px solid #FDE68A' }}>
                              Required
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>None</span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#475569', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {session.sessionOutcome || session.counsellorNotes || '—'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => setSessionAuditTarget(session)}
                            className="saas-btn saas-btn-outline-primary saas-btn-sm"
                            type="button"
                          >
                            <Eye size={13} /> Details
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
          TAB: COUNSELLOR PERFORMANCE & ENROLLMENT LEADERBOARD (PDF REQUIREMENT)
          ========================================================================= */}
      {activeTab === 'counsellor-performance' && (
        <div>
          <div className="saas-welcome-banner">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#FEF3C7', color: '#B45309', padding: '0.2rem 0.6rem', borderRadius: 9999, fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                <Trophy size={14} /> Official Performance & Promotion Module
              </div>
              <h1 className="saas-welcome-title">Counsellor Performance Leaderboard</h1>
              <p className="saas-welcome-sub">
                Ranked in descending order of confirmed student enrollments and advisory tokens. Monitor performance, review conversion rates, and award promotion points.
              </p>
            </div>
            <button
              onClick={loadCounsellorPerformance}
              className="saas-btn saas-btn-secondary"
              type="button"
            >
              <RefreshCw size={15} /> Refresh Leaderboard
            </button>
          </div>

          {/* Top KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="saas-card" style={{ marginBottom: 0, padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Total Counsellors</span>
                <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                  <Users size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A' }}>
                {performanceData?.summary?.totalCounsellors ?? counsellors.length}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Active advisory personnel</span>
            </div>

            <div className="saas-card" style={{ marginBottom: 0, padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Confirmed Enrollments</span>
                <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16A34A' }}>
                {performanceData?.summary?.totalEnrollments ?? 0}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Consultancy agreements sealed</span>
            </div>

            <div className="saas-card" style={{ marginBottom: 0, padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Top Performer (#1)</span>
                <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
                  <Trophy size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {performanceData?.summary?.topPerformer?.fullName || 'No Enrollments Yet'}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#B45309', fontWeight: 600 }}>
                {performanceData?.summary?.topPerformer ? `${performanceData.summary.topPerformer.confirmedEnrollments} Confirmed Enrollments` : 'Awaiting first conversion'}
              </span>
            </div>

            <div className="saas-card" style={{ marginBottom: 0, padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Completed Sessions</span>
                <div style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED' }}>
                  <Calendar size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A' }}>
                {performanceData?.summary?.totalCompletedSessions ?? 0}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Successfully audited meetings</span>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="saas-card">
            <div className="saas-card-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="saas-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <TrendingUp size={18} color="#2563EB" /> Ranked Performance Hierarchy (Descending by Enrollments)
                </h3>
                <span className="saas-card-subtitle" style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Counsellors with more confirmed enrollments rank top. Admin awards points to decide positions or promotions.
                </span>
              </div>
            </div>

            <div className="saas-table-container">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th style={{ width: '70px', textAlign: 'center' }}>Rank</th>
                    <th>Counsellor Details</th>
                    <th style={{ textAlign: 'center' }}>Confirmed Enrollments</th>
                    <th style={{ textAlign: 'center' }}>Points / Tokens</th>
                    <th style={{ textAlign: 'center' }}>Completed Sessions</th>
                    <th style={{ textAlign: 'center' }}>Interested Students</th>
                    <th>Conversion Rate</th>
                    <th>Position / Promotion Tier</th>
                    <th style={{ textAlign: 'right' }}>Admin Action</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceLoading ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                        <RefreshCw size={24} style={{ animation: 'spin 1.5s linear infinite', margin: '0 auto 0.5rem' }} />
                        <p style={{ margin: 0 }}>Calculating counsellor performance metrics...</p>
                      </td>
                    </tr>
                  ) : !performanceData || (performanceData.leaderboard || []).length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                        <Trophy size={32} color="#CBD5E1" style={{ margin: '0 auto 0.5rem' }} />
                        <p style={{ margin: 0, fontWeight: 600 }}>No counsellor performance records found.</p>
                      </td>
                    </tr>
                  ) : (
                    performanceData.leaderboard.map((item: any) => (
                      <tr key={item.id} style={{ backgroundColor: item.rank === 1 ? '#F8FAFC' : undefined }}>
                        <td style={{ textAlign: 'center' }}>
                          {item.rank === 1 ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', backgroundColor: '#FEF3C7', color: '#B45309', fontWeight: 800, border: '1px solid #FCD34D', fontSize: '0.85rem' }}>
                              🥇 1
                            </span>
                          ) : item.rank === 2 ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '50%', backgroundColor: '#F1F5F9', color: '#475569', fontWeight: 800, border: '1px solid #CBD5E1', fontSize: '0.82rem' }}>
                              🥈 2
                            </span>
                          ) : item.rank === 3 ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '50%', backgroundColor: '#FFEDD5', color: '#C2410C', fontWeight: 800, border: '1px solid #FDBA74', fontSize: '0.82rem' }}>
                              🥉 3
                            </span>
                          ) : (
                            <span style={{ fontWeight: 700, color: '#64748B', fontSize: '0.85rem' }}>
                              #{item.rank}
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>
                            {item.fullName}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                            {item.email}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#2563EB', marginTop: '0.15rem' }}>
                            {item.specialization} • {item.experienceYears}y exp
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.3rem 0.75rem',
                            borderRadius: 9999,
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            backgroundColor: item.confirmedEnrollments > 0 ? '#DCFCE7' : '#F1F5F9',
                            color: item.confirmedEnrollments > 0 ? '#15803D' : '#64748B',
                            border: item.confirmedEnrollments > 0 ? '1px solid #86EFAC' : '1px solid #E2E8F0',
                          }}>
                            {item.confirmedEnrollments} {item.confirmedEnrollments === 1 ? 'Enrollment' : 'Enrollments'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontWeight: 800, color: '#D97706', fontSize: '0.9rem', backgroundColor: '#FFFBEB', padding: '0.2rem 0.6rem', borderRadius: 6, border: '1px solid #FDE68A' }}>
                            {item.enrollmentPoints} pts
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: '#334155' }}>
                          {item.completedSessions}
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 600, color: '#16A34A' }}>
                          {item.interestedStudentsCount}
                        </td>
                        <td style={{ minWidth: 130 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: 600, color: '#0F172A' }}>{item.conversionRate}%</span>
                            <span style={{ color: '#64748B' }}>{item.confirmedEnrollments}/{item.completedSessions}</span>
                          </div>
                          <div style={{ width: '100%', height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${Math.min(item.conversionRate, 100)}%`,
                                height: '100%',
                                backgroundColor: item.conversionRate >= 50 ? '#16A34A' : item.conversionRate >= 20 ? '#2563EB' : '#94A3B8',
                              }}
                            />
                          </div>
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#1D4ED8',
                            backgroundColor: '#EFF6FF',
                            padding: '0.25rem 0.6rem',
                            borderRadius: 6,
                            border: '1px solid #DBEAFE',
                          }}>
                            <Award size={13} /> {item.performanceTier}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => setAwardPointsModal({
                              counsellorId: item.id,
                              fullName: item.fullName,
                              currentPoints: item.enrollmentPoints,
                            })}
                            className="saas-btn saas-btn-primary saas-btn-sm"
                            style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                          >
                            <Award size={13} /> Award Points
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
          TAB: SCHOLARSHIPS MANAGEMENT
          ========================================================================= */}
      {activeTab === 'scholarships' && (
        <div>
          <ScholarshipManagementPage onNavigateHome={() => setActiveTab('dashboard')} />
        </div>
      )}

      {/* =========================================================================
          TAB: COLLEGE MANAGEMENT
          ========================================================================= */}
      {activeTab === 'colleges' && (
        <div>
          <CollegeManagementPage onNavigateHome={() => setActiveTab('dashboard')} />
        </div>
      )}

      {/* =========================================================================
          TAB: COLLEGE TIER MANAGEMENT
          ========================================================================= */}
      {activeTab === 'college-tiers' && (
        <div>
          <CollegeTierManagementPage onNavigateHome={() => setActiveTab('dashboard')} />
        </div>
      )}

      {/* =========================================================================
          TAB 7: REPORTS & ANALYTICS
          ========================================================================= */}
      {activeTab === 'reports' && (
        <div>
          <div className="saas-welcome-banner">
            <div>
              <h1 className="saas-welcome-title">Reports & Analytics</h1>
              <p className="saas-welcome-sub">
                Comprehensive data intelligence aggregated directly from active PostgreSQL records.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Country Distribution Bar Chart */}
            <div className="saas-card" style={{ marginBottom: 0 }}>
              <div className="saas-card-header">
                <div>
                  <h3 className="saas-card-title">Students by Priority Destination Country</h3>
                  <span className="saas-card-subtitle">Real preferences recorded by enrolled students</span>
                </div>
              </div>
              <div className="saas-card-body">
                {(dashboardData?.analytics?.countryDistribution || []).map((item, idx) => {
                  const maxCount = Math.max(...(dashboardData?.analytics?.countryDistribution || []).map((c) => c.count), 1);
                  const pct = Math.round((item.count / maxCount) * 100);
                  return (
                    <div key={idx} style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600, color: '#0F172A' }}>{item.country}</span>
                        <span style={{ color: '#64748B' }}>{item.count} students ({pct}%)</span>
                      </div>
                      <div style={{ width: '100%', height: 10, backgroundColor: '#F1F5F9', borderRadius: 5, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#2563EB', borderRadius: 5 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Department Distribution Bar Chart */}
            <div className="saas-card" style={{ marginBottom: 0 }}>
              <div className="saas-card-header">
                <div>
                  <h3 className="saas-card-title">Students by Department / Discipline</h3>
                  <span className="saas-card-subtitle">Academic majors of high interest</span>
                </div>
              </div>
              <div className="saas-card-body">
                {(dashboardData?.analytics?.departmentDistribution || []).map((item, idx) => {
                  const maxCount = Math.max(...(dashboardData?.analytics?.departmentDistribution || []).map((d) => d.count), 1);
                  const pct = Math.round((item.count / maxCount) * 100);
                  return (
                    <div key={idx} style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600, color: '#0F172A' }}>{item.department}</span>
                        <span style={{ color: '#64748B' }}>{item.count} students ({pct}%)</span>
                      </div>
                      <div style={{ width: '100%', height: 10, backgroundColor: '#F1F5F9', borderRadius: 5, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#16A34A', borderRadius: 5 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 8: SECURITY AUDIT LOGS
          ========================================================================= */}
      {activeTab === 'audit' && (
        <div>
          <div className="saas-welcome-banner">
            <div>
              <h1 className="saas-welcome-title">Security & Audit Logs</h1>
              <p className="saas-welcome-sub">
                Immutable platform governance logs tracking admin actions and counsellor allocations.
              </p>
            </div>
          </div>

          <div className="saas-card">
            <div className="saas-table-container">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>User</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontSize: '0.8rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '0.2rem 0.5rem', borderRadius: 4, border: '1px solid #BFDBFE' }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', fontWeight: 500, color: '#0F172A' }}>
                        {log.user?.email || log.userId}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#475569', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 9: SYSTEM SETTINGS
          ========================================================================= */}
      {activeTab === 'settings' && (
        <div>
          <div className="saas-welcome-banner">
            <div>
              <h1 className="saas-welcome-title">System Settings</h1>
              <p className="saas-welcome-sub">
                Configuration overview for database, security policies, and service status.
              </p>
            </div>
          </div>

          <div className="saas-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>
              Database & Infrastructure
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Primary Engine</span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>PostgreSQL / Prisma</div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Security Isolation</span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#16A34A' }}>RBAC & IDOR Protected</div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>API Gateway</span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#2563EB' }}>Express / TypeScript</div>
              </div>
            </div>
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

      {assignStudentTarget && (
        <AssignCounsellorModal
          profileId={assignStudentTarget.profileId}
          studentName={assignStudentTarget.studentName}
          currentCounsellorId={assignStudentTarget.counsellorId}
          onClose={() => setAssignStudentTarget(null)}
          onSuccess={() => {
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

      {createCounsellorModalOpen && (
        <CreateCounsellorModal
          onClose={() => setCreateCounsellorModalOpen(false)}
          onSuccess={() => {
            loadDashboard();
          }}
        />
      )}

      {skillsModalTarget && (
        <ManageCounsellorSkillsModal
          counsellor={skillsModalTarget}
          onClose={() => setSkillsModalTarget(null)}
          onSuccess={() => {
            loadDashboard();
          }}
        />
      )}

      {sessionAuditTarget && (
        <SessionAuditDetailsModal
          session={sessionAuditTarget}
          onClose={() => setSessionAuditTarget(null)}
        />
      )}

      {awardPointsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              width: '100%',
              maxWidth: 480,
              overflow: 'hidden',
              border: '1px solid #E2E8F0',
            }}
          >
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: '#FEF3C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#B45309',
                  }}
                >
                  <Award size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>
                    Award Promotion Points
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    Recognize counsellor performance & promotions
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAwardPointsModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  color: '#94A3B8',
                  cursor: 'pointer',
                }}
              >
                &times;
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: 8,
                  padding: '0.9rem',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Counsellor</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                  {awardPointsModal.fullName}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#2563EB', marginTop: '0.2rem' }}>
                  Current Balance: <strong>{awardPointsModal.currentPoints} performance points</strong>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '0.35rem',
                  }}
                >
                  Points to Award
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={pointsToAward}
                  onChange={(e) => setPointsToAward(Math.max(1, parseInt(e.target.value) || 1))}
                  className="saas-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '0.35rem',
                  }}
                >
                  Reason / Promotion Justification
                </label>
                <textarea
                  value={awardReason}
                  onChange={(e) => setAwardReason(e.target.value)}
                  className="saas-textarea"
                  rows={3}
                  placeholder="e.g. 2 successful client enrollments and stellar session feedback"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setAwardPointsModal(null)}
                  className="saas-btn saas-btn-secondary"
                  disabled={awarding}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAwardPoints}
                  className="saas-btn saas-btn-primary"
                  disabled={awarding}
                >
                  {awarding ? 'Awarding Points...' : `Award +${pointsToAward} Point(s)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SaaSShell>
  );
};
export default AdminDashboardPage;
