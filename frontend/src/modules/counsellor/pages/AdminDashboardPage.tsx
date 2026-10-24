import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  UserCheck,
  Download,
  Search,
  Eye,
  Clock,
  Activity,
  UserPlus,
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

interface AdminDashboardPageProps {
  onNavigateView?: (view: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = () => {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [students, setStudents] = useState<
    (CounsellorStudentSummary & { assignedCounsellor?: { id: string; email: string } | null })[]
  >([]);
  const [counsellors, setCounsellors] = useState<CounsellorWorkloadInfo[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<'students' | 'counsellors' | 'audit'>('students');

  // Student Roster Filters
  const [search, setSearch] = useState('');
  const [boardFilter, setBoardFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [counsellorFilter, setCounsellorFilter] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState<'ALL' | 'ASSIGNED' | 'UNASSIGNED'>('ALL');

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

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const [dashRes, counsRes, auditRes] = await Promise.all([
        AdminClientService.getDashboard(),
        AdminClientService.listCounsellors(),
        AdminClientService.getAuditLogs({ limit: 20 }),
      ]);

      if (dashRes.success && dashRes.data) setDashboardData(dashRes.data);
      if (counsRes.success && counsRes.data) setCounsellors(counsRes.data);
      if (auditRes.success && auditRes.data) setAuditLogs(auditRes.data.logs);
    } catch (err: any) {
      console.error(err);
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
      console.error(err);
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
      await AdminClientService.downloadExportCsv();
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  if (isLoading && !dashboardData) {
    return (
      <div style={{ maxWidth: '1360px', margin: '4rem auto', textAlign: 'center', color: '#94A3B8' }}>
        <p>Loading administration console...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1360px', margin: '2rem auto', padding: '0 1.5rem', color: '#F8FAFC' }}>
      {/* Admin Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.3rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#F87171',
              fontSize: '0.75rem',
              fontWeight: 700,
              marginBottom: '0.75rem',
            }}
          >
            <ShieldAlert size={14} /> PLATFORM ADMINISTRATION SUITE (MODULE 13 & 14)
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0 }}>
            Platform Administration Console
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '0.35rem', margin: '0.35rem 0 0' }}>
            System-wide student management, counsellor allocation directory, verification governance, and security audit logs.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setCreateModalOpen(true)}
            style={{
              padding: '0.65rem 1.25rem',
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <UserPlus size={16} /> Onboard Student
          </button>
          <button
            onClick={handleExportCsv}
            style={{
              padding: '0.65rem 1.1rem',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              color: '#E2E8F0',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Download size={16} /> Export All (CSV)
          </button>
        </div>
      </div>

      {/* Admin KPI Matrix */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>Total Students</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.35rem' }}>
            {dashboardData?.kpis.totalStudents || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Registered student accounts</div>
        </div>

        <div
          style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>Counsellors</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#A78BFA', marginTop: '0.35rem' }}>
            {dashboardData?.kpis.totalCounsellors || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Active advisory staff</div>
        </div>

        <div
          style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>Verified Profiles</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34D399', marginTop: '0.35rem' }}>
            {dashboardData?.kpis.verifiedProfiles || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Authenticated records</div>
        </div>

        <div
          style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>Unassigned Pool</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FBBF24', marginTop: '0.35rem' }}>
            {dashboardData?.kpis.unassignedStudents || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Awaiting counsellor assignment</div>
        </div>

        <div
          style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>Guidance Sessions</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#60A5FA', marginTop: '0.35rem' }}>
            {dashboardData?.kpis.totalAppointments || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Appointments scheduled</div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '1.5rem',
        }}
      >
        <button
          onClick={() => setActiveTab('students')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'students' ? '2px solid #818CF8' : '2px solid transparent',
            color: activeTab === 'students' ? '#FFFFFF' : '#94A3B8',
            fontWeight: activeTab === 'students' ? 700 : 500,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <Users size={16} /> Global Student Management
        </button>

        <button
          onClick={() => setActiveTab('counsellors')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'counsellors' ? '2px solid #818CF8' : '2px solid transparent',
            color: activeTab === 'counsellors' ? '#FFFFFF' : '#94A3B8',
            fontWeight: activeTab === 'counsellors' ? 700 : 500,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <UserCheck size={16} /> Counsellor Caseloads & Directory
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'audit' ? '2px solid #818CF8' : '2px solid transparent',
            color: activeTab === 'audit' ? '#FFFFFF' : '#94A3B8',
            fontWeight: activeTab === 'audit' ? 700 : 500,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <Activity size={16} /> Platform Audit Trail
        </button>
      </div>

      {/* TAB 1: Global Student Management (Module 14) */}
      {activeTab === 'students' && (
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '1.75rem',
          }}
        >
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              Platform Student Directory
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: '0.2rem 0 0' }}>
              Showing {students.length} of {totalStudents} registered students. Filter by counsellor assignment, curriculum, year, and verification clearance.
            </p>
          </div>

          {/* Filters Bar */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: 'flex',
              gap: '0.65rem',
              marginBottom: '1.25rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: '1 1 220px', position: 'relative' }}>
              <Search
                size={16}
                color="#94A3B8"
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem 0.55rem 2.3rem',
                  background: '#0B1535',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <select
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value as any)}
              style={{
                padding: '0.55rem 0.85rem',
                background: '#0B1535',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '0.85rem',
              }}
            >
              <option value="ALL">All Allocations</option>
              <option value="ASSIGNED">Assigned Only</option>
              <option value="UNASSIGNED">Unassigned Pool</option>
            </select>

            <select
              value={counsellorFilter}
              onChange={(e) => setCounsellorFilter(e.target.value)}
              style={{
                padding: '0.55rem 0.85rem',
                background: '#0B1535',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '0.85rem',
              }}
            >
              <option value="">Filter by Counsellor</option>
              {counsellors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.email}
                </option>
              ))}
            </select>

            <select
              value={boardFilter}
              onChange={(e) => setBoardFilter(e.target.value)}
              style={{
                padding: '0.55rem 0.85rem',
                background: '#0B1535',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '0.85rem',
              }}
            >
              <option value="">All Boards</option>
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="IB">IB</option>
              <option value="Cambridge">Cambridge</option>
              <option value="State Board">State Board</option>
            </select>

            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              style={{
                padding: '0.55rem 0.85rem',
                background: '#0B1535',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '0.85rem',
              }}
            >
              <option value="">All Years</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.55rem 0.85rem',
                background: '#0B1535',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '0.85rem',
              }}
            >
              <option value="">All Statuses</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <button
              type="submit"
              style={{
                padding: '0.55rem 1rem',
                background: '#4F46E5',
                border: 'none',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Filter
            </button>
          </form>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#94A3B8',
                    fontSize: '0.775rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  <th style={{ padding: '0.75rem 1rem' }}>Student</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Contact</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Board & Year</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Assigned Counsellor</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Completion</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isStudentsLoading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94A3B8' }}>
                      <Clock size={24} style={{ animation: 'spin 1.5s linear infinite' }} />
                      <p style={{ marginTop: '0.5rem' }}>Loading platform students...</p>
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94A3B8' }}>
                      <Users size={36} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
                      <p>No students match the criteria.</p>
                    </td>
                  </tr>
                ) : (
                  students.map((s) => (
                    <tr
                      key={s.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{s.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{s.grade}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div>{s.contactEmail}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{s.phone}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div>{s.board}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Passing: {s.passingOutYear}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {s.assignedCounsellor ? (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.2rem 0.55rem',
                              background: 'rgba(99, 102, 241, 0.15)',
                              border: '1px solid rgba(99, 102, 241, 0.3)',
                              borderRadius: '6px',
                              color: '#C7D2FE',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            <UserCheck size={12} color="#A78BFA" />
                            {s.assignedCounsellor.email}
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.2rem 0.55rem',
                              background: 'rgba(245, 158, 11, 0.15)',
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                              borderRadius: '6px',
                              color: '#FBBF24',
                            }}
                          >
                            Unassigned Pool
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.55rem',
                            borderRadius: '9999px',
                            backgroundColor:
                              s.verificationStatus === 'VERIFIED'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : s.verificationStatus === 'REJECTED'
                                ? 'rgba(239, 68, 68, 0.15)'
                                : 'rgba(245, 158, 11, 0.15)',
                            color:
                              s.verificationStatus === 'VERIFIED'
                                ? '#34D399'
                                : s.verificationStatus === 'REJECTED'
                                ? '#F87171'
                                : '#FBBF24',
                          }}
                        >
                          ● {s.verificationStatus}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#A78BFA' }}>
                          {s.completionScore}%
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            onClick={() =>
                              setAssignStudentTarget({
                                profileId: s.id,
                                studentName: s.fullName,
                                counsellorId: s.assignedCounsellor?.id,
                              })
                            }
                            style={{
                              padding: '0.35rem 0.65rem',
                              background: 'rgba(255, 255, 255, 0.06)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              borderRadius: '6px',
                              color: '#CBD5E1',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Assign
                          </button>
                          <button
                            onClick={() => setSelectedProfileId(s.id)}
                            style={{
                              padding: '0.35rem 0.65rem',
                              background: 'rgba(99, 102, 241, 0.2)',
                              border: '1px solid rgba(167, 139, 250, 0.35)',
                              borderRadius: '6px',
                              color: '#C7D2FE',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            <Eye size={13} /> 360°
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: '0.85rem',
                color: '#94A3B8',
              }}
            >
              <span>
                Page {page} of {totalPages}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  disabled={page <= 1}
                  onClick={() => loadStudents(page - 1)}
                  style={{
                    padding: '0.35rem 0.8rem',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: page <= 1 ? '#475569' : '#FFFFFF',
                    cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => loadStudents(page + 1)}
                  style={{
                    padding: '0.35rem 0.8rem',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: page >= totalPages ? '#475569' : '#FFFFFF',
                    cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Counsellor Caseloads & Directory */}
      {activeTab === 'counsellors' && (
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '1.75rem',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1rem' }}>
            Active Educational Counsellor Directory
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {counsellors.map((c) => (
              <div
                key={c.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                    }}
                  >
                    {c.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c.email}</div>
                    <div style={{ fontSize: '0.75rem', color: '#34D399' }}>● Active Advisor</div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    background: 'rgba(0,0,0,0.2)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                  }}
                >
                  <div>
                    <div style={{ color: '#94A3B8' }}>Caseload</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#A78BFA' }}>
                      {c.assignedStudentsCount}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#94A3B8' }}>Sessions</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#60A5FA' }}>
                      {c.appointmentsCount}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Audit Trail */}
      {activeTab === 'audit' && (
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '1.75rem',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1rem' }}>
            System Audit Log Timeline
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {auditLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        background: 'rgba(99, 102, 241, 0.2)',
                        border: '1px solid rgba(167, 139, 250, 0.3)',
                        borderRadius: '4px',
                        color: '#C7D2FE',
                      }}
                    >
                      {log.action}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                      by {log.user?.email || 'System'}
                    </span>
                  </div>
                  {log.details && (
                    <div style={{ fontSize: '0.775rem', color: '#CBD5E1', marginTop: '0.35rem' }}>
                      {log.details}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 360 Student Modal */}
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

      {/* Assign Counsellor Modal */}
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

      {/* Onboard Student Modal */}
      {createModalOpen && (
        <CreateStudentModal
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => {
            loadDashboard();
            loadStudents(1);
          }}
        />
      )}
    </div>
  );
};
