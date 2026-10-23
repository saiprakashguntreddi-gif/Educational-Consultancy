import { apiClient, ApiResponse } from '../../../shared/services/api-client';
import { API_ENDPOINTS } from '../../../config/api.config';
import { CounsellorStudentSummary } from './counsellor.service';

export interface AdminDashboardData {
  kpis: {
    totalStudents: number;
    activeStudents?: number;
    totalCounsellors: number;
    verifiedProfiles: number;
    pendingProfiles: number;
    rejectedProfiles: number;
    unassignedStudents: number;
    totalAppointments: number;
    totalWebinars: number;
    activeApplications?: number;
    pendingRequests?: number;
    upcomingDeadlines?: number;
    totalScholarships?: number;
  };
  analytics?: {
    countryDistribution: { country: string; count: number }[];
    departmentDistribution: { department: string; count: number }[];
    applicationStatus: {
      pending: number;
      approved: number;
      rejected: number;
      inReview: number;
      total: number;
    };
  };
  recentStudents?: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    grade: string;
    verificationStatus: string;
    assignedCounsellor?: { id: string; email: string } | null;
    countryPreference: string;
    department: string;
    createdAt: string;
  }[];
  upcomingAppointments?: {
    id: string;
    title: string;
    scheduledAt: string;
    status: string;
    appointmentType: string;
    studentName: string;
    studentEmail: string;
    counsellorEmail: string;
  }[];
  recentScholarships?: {
    id: string;
    name: string;
    provider: string;
    country: string;
    awardType?: string | null;
    applicationDeadline?: string | null;
    isActive: boolean;
  }[];
  counsellorWorkloads?: {
    id: string;
    email: string;
    isActive: boolean;
    studentCount: number;
    appointmentsCount: number;
  }[];
  recentAuditLogs: any[];
}

export interface CounsellorWorkloadInfo {
  id: string;
  email: string;
  isActive: boolean;
  assignedStudentsCount: number;
  appointmentsCount: number;
  createdAt: string;
}

export class AdminClientService {
  public static async getDashboard(): Promise<ApiResponse<AdminDashboardData>> {
    return apiClient.get(API_ENDPOINTS.ADMIN.DASHBOARD);
  }

  public static async listAllStudents(params: {
    search?: string;
    verificationStatus?: string;
    board?: string;
    passingOutYear?: string;
    grade?: string;
    counsellorId?: string;
    assignmentStatus?: 'ALL' | 'ASSIGNED' | 'UNASSIGNED';
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<{ students: (CounsellorStudentSummary & { assignedCounsellor?: { id: string; email: string } | null })[]; total: number; page: number; totalPages: number }>> {
    const q = new URLSearchParams();
    if (params.search) q.append('search', params.search);
    if (params.verificationStatus) q.append('verificationStatus', params.verificationStatus);
    if (params.board) q.append('board', params.board);
    if (params.passingOutYear) q.append('passingOutYear', params.passingOutYear);
    if (params.grade) q.append('grade', params.grade);
    if (params.counsellorId) q.append('counsellorId', params.counsellorId);
    if (params.assignmentStatus) q.append('assignmentStatus', params.assignmentStatus);
    if (params.page) q.append('page', String(params.page));
    if (params.limit) q.append('limit', String(params.limit));

    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return apiClient.get(`${API_ENDPOINTS.ADMIN.STUDENTS}${queryStr}`);
  }

  public static async assignCounsellor(profileId: string, counsellorId: string | null): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.ADMIN.ASSIGN_COUNSELLOR(profileId), { counsellorId });
  }

  public static async listCounsellors(): Promise<ApiResponse<CounsellorWorkloadInfo[]>> {
    return apiClient.get(API_ENDPOINTS.ADMIN.COUNSELLORS);
  }

  public static async getAuditLogs(params: {
    action?: string;
    userId?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<{ logs: any[]; total: number; page: number; totalPages: number }>> {
    const q = new URLSearchParams();
    if (params.action) q.append('action', params.action);
    if (params.userId) q.append('userId', params.userId);
    if (params.page) q.append('page', String(params.page));
    if (params.limit) q.append('limit', String(params.limit));

    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return apiClient.get(`${API_ENDPOINTS.ADMIN.AUDIT_LOGS}${queryStr}`);
  }

  public static async listApplications(params: { status?: string; search?: string } = {}): Promise<ApiResponse<any[]>> {
    const q = new URLSearchParams();
    if (params.status) q.append('status', params.status);
    if (params.search) q.append('search', params.search);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return apiClient.get(`${API_ENDPOINTS.ADMIN.APPLICATIONS}${qs}`);
  }

  public static async downloadExportCsv(): Promise<void> {
    const token = localStorage.getItem('superc_token');
    const response = await fetch(API_ENDPOINTS.ADMIN.EXPORT, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Export failed with status ${response.status}`);
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all-students-platform-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}
