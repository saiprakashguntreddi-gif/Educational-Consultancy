import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Calendar,
  CheckSquare,
  Search,
  Download,
  UserPlus,
  Eye,
  Clock,
} from 'lucide-react';
import {
  CounsellorClientService,
  CounsellorDashboardData,
  CounsellorStudentSummary,
} from '../services/counsellor.service';
import { Student360Modal } from '../components/Student360Modal';
import { CreateStudentModal } from '../components/CreateStudentModal';

interface CounsellorDashboardPageProps {
  onNavigateView?: (view: string) => void;
}

export const CounsellorDashboardPage: React.FC<CounsellorDashboardPageProps> = () => {
  const [dashboardData, setDashboardData] = useState<CounsellorDashboardData | null>(null);
  const [students, setStudents] = useState<CounsellorStudentSummary[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [boardFilter, setBoardFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStudentsLoading, setIsStudentsLoading] = useState(false);

  // Modals
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await CounsellorClientService.getDashboard();
      if (res.success && res.data) {
        setDashboardData(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load counsellor dashboard');
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
      await CounsellorClientService.downloadExportCsv();
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  if (isLoading && !dashboardData) {
    return (
      <div style={{ maxWidth: '1360px', margin: '4rem auto', textAlign: 'center', color: '#94A3B8' }}>
        <p>Loading counsellor workstation...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1360px', margin: '2rem auto', padding: '0 1.5rem', color: '#F8FAFC' }}>
      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid #EF4444', color: '#FCA5A5', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}
      {/* Header Banner */}
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
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              border: '1px solid rgba(167, 139, 250, 0.35)',
              color: '#C7D2FE',
              fontSize: '0.75rem',
              fontWeight: 700,
              marginBottom: '0.75rem',
            }}
          >
            <ShieldCheck size={14} color="#A78BFA" /> COUNSELLOR & GUIDANCE SUITE (MODULE 13 & 14)
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0 }}>
            Counsellor Workstation
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '0.35rem', margin: '0.35rem 0 0' }}>
            Manage assigned students, monitor profile completion, review recommendations, and coordinate guidance action plans.
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
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
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
            <Download size={16} /> Export Roster
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>Assigned Students</span>
            <Users size={18} color="#A78BFA" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.5rem' }}>
            {dashboardData?.metrics.assignedStudents || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
            Active caseload assigned to you
          </div>
        </div>

        <div
          style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>Pending Verifications</span>
            <ShieldCheck size={18} color="#FBBF24" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FBBF24', marginTop: '0.5rem' }}>
            {dashboardData?.metrics.pendingVerifications || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
            Intakes awaiting review
          </div>
        </div>

        <div
          style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>Upcoming Appointments</span>
            <Calendar size={18} color="#34D399" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#34D399', marginTop: '0.5rem' }}>
            {dashboardData?.metrics.upcomingAppointmentsCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
            Scheduled 1-on-1 sessions
          </div>
        </div>

        <div
          style={{
            background: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>Active Milestones</span>
            <CheckSquare size={18} color="#60A5FA" />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#60A5FA', marginTop: '0.5rem' }}>
            {dashboardData?.metrics.activeActionPlans || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
            Student guidance action items
          </div>
        </div>
      </div>

      {/* Main Student Management Section (Module 14) */}
      <div
        style={{
          background: 'rgba(30, 41, 59, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1.75rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>
              Manage Assigned Students
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: '0.2rem 0 0' }}>
              Showing {students.length} of {totalStudents} assigned students under your guidance roster
            </p>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <form
          onSubmit={handleSearchSubmit}
          style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search
              size={16}
              color="#94A3B8"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search by student name, contact email..."
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
            <option value="ICSE">ICSE / ISC</option>
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
              padding: '0.55rem 1.1rem',
              background: '#3B82F6',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Apply Filters
          </button>
        </form>

        {/* Student Table */}
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.875rem',
              textAlign: 'left',
            }}
          >
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
                <th style={{ padding: '0.75rem 1rem' }}>Academics</th>
                <th style={{ padding: '0.75rem 1rem' }}>Target & Prefs</th>
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
                    <p style={{ marginTop: '0.5rem' }}>Loading students...</p>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94A3B8' }}>
                    <Users size={36} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
                    <p>No students match the current filters.</p>
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr
                    key={s.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{s.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                        {s.grade} • Passing: {s.passingOutYear}
                      </div>
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <div>{s.contactEmail}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{s.phone}</div>
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.15rem 0.5rem',
                          background: 'rgba(255, 255, 255, 0.08)',
                          borderRadius: '4px',
                        }}
                      >
                        {s.board}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
                      {s.preferenceSummary ? (
                        <div>
                          <div style={{ fontWeight: 600 }}>{s.preferenceSummary.primaryCountry || 'Global'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#A78BFA' }}>
                            {s.preferenceSummary.department}
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#64748B', fontSize: '0.75rem' }}>Not configured</span>
                      )}
                    </td>
                    <td style={{ padding: '0.9rem 1rem' }}>
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
                    <td style={{ padding: '0.9rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div
                          style={{
                            flex: 1,
                            maxWidth: 80,
                            height: 6,
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '3px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${s.completionScore}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, #4F46E5, #7C3AED)',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#A78BFA', fontWeight: 700 }}>
                          {s.completionScore}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedProfileId(s.id)}
                        style={{
                          padding: '0.4rem 0.85rem',
                          background: 'rgba(99, 102, 241, 0.2)',
                          border: '1px solid rgba(167, 139, 250, 0.35)',
                          borderRadius: '6px',
                          color: '#C7D2FE',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <Eye size={14} /> 360° View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
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

      {/* Student 360 Modal */}
      {selectedProfileId && (
        <Student360Modal
          profileId={selectedProfileId}
          onClose={() => setSelectedProfileId(null)}
          onRefresh={() => loadStudents(page)}
        />
      )}

      {/* Create Student Account Modal */}
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
