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
    activeCounsellors?: number;
    pendingVerificationCounsellors?: number;
    upcomingAppointments?: number;
    pendingAppointmentRequests?: number;
    completedSessions?: number;
    sessionsNeedingFollowUp?: number;
  };
  attentionRequired?: {
    unassignedStudents: number;
    unassignedStudentsCount?: number;
    pendingVerifications: number;
    pendingVerificationCount?: number;
    pendingAppointments: number;
    pendingAppointmentRequestsCount?: number;
    followUpsRequired: number;
    followUpNeededCount?: number;
    items?: any[];
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
  fullName?: string;
  phone?: string;
  qualification?: string;
  experienceYears?: number;
  specialization?: string;
  skills?: string[];
  languages?: string[];
  countriesOfExpertise?: string[];
  courseExpertise?: string[];
  bio?: string;
  availability?: string;
  capacity?: number;
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  verifiedAt?: string;
  assignedStudentsCount: number;
  appointmentsCount: number;
  completedSessionsCount?: number;
  counsellorProfile?: any;
  createdAt: string;
}

export interface SessionAuditItem {
  id: string;
  title: string;
  description?: string;
  appointmentType: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  meetingType: string;
  meetingLocation?: string;
  actualStartTime?: string | null;
  actualEndTime?: string | null;
  sessionOutcome?: string | null;
  recommendations?: string | null;
  followUpRequired?: boolean;
  nextAction?: string | null;
  followUpActions?: string | null;
  privateCounsellorNotes?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  student: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    grade?: string;
  };
  counsellor: {
    id: string;
    email: string;
    name: string;
    specialization?: string;
  };
  createdAt: string;
}

export interface AssignmentHistoryItem {
  id: string;
  studentProfileId: string;
  counsellorId: string;
  counsellorEmail: string;
  counsellorName: string;
  specialization: string;
  assignedById?: string;
  assignedByEmail: string;
  assignedAt: string;
  unassignedAt?: string | null;
  status: string;
  reason?: string | null;
}

export class AdminClientService {
  public static async getDashboard(): Promise<ApiResponse<AdminDashboardData & { attentionRequired?: any }>> {
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
  } = {}): Promise<ApiResponse<{ students: (CounsellorStudentSummary & { assignedCounsellor?: { id: string; email: string; counsellorProfile?: any } | null })[]; total: number; page: number; totalPages: number }>> {
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

  public static async assignCounsellor(
    profileId: string,
    counsellorId: string | null,
    reason?: string
  ): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.ADMIN.ASSIGN_COUNSELLOR(profileId), {
      counsellorId,
      reason,
    });
  }

  public static async getAssignmentHistory(
    profileId: string
  ): Promise<ApiResponse<AssignmentHistoryItem[]>> {
    return apiClient.get(API_ENDPOINTS.ADMIN.ASSIGNMENT_HISTORY(profileId));
  }

  public static async listCounsellors(): Promise<ApiResponse<CounsellorWorkloadInfo[]>> {
    return apiClient.get(API_ENDPOINTS.ADMIN.COUNSELLORS);
  }

  public static async createCounsellor(data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    qualification?: string;
    experienceYears?: number;
    specialization?: string;
    skills?: string[];
    languages?: string[];
    countriesOfExpertise?: string[];
    courseExpertise?: string[];
    bio?: string;
    availability?: string;
    capacity?: number;
    verificationStatus?: 'PENDING' | 'VERIFIED' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  }): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.ADMIN.CREATE_COUNSELLOR, data);
  }

  public static async updateCounsellor(
    counsellorId: string,
    data: Partial<CounsellorWorkloadInfo>
  ): Promise<ApiResponse<any>> {
    return apiClient.patch(API_ENDPOINTS.ADMIN.UPDATE_COUNSELLOR(counsellorId), data);
  }

  public static async updateCounsellorStatus(
    counsellorId: string,
    status: 'PENDING' | 'VERIFIED' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
    notes?: string
  ): Promise<ApiResponse<any>> {
    return apiClient.patch(API_ENDPOINTS.ADMIN.UPDATE_COUNSELLOR_STATUS(counsellorId), {
      status,
      notes,
    });
  }

  public static async updateCounsellorSkills(
    counsellorId: string,
    data: {
      skills: string[];
      specialization?: string;
      countriesOfExpertise?: string[];
      courseExpertise?: string[];
    }
  ): Promise<ApiResponse<any>> {
    return apiClient.patch(API_ENDPOINTS.ADMIN.UPDATE_COUNSELLOR_SKILLS(counsellorId), data);
  }

  public static async listSessionAudits(params: {
    counsellorId?: string;
    studentProfileId?: string;
    status?: string;
    followUpRequired?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<{ sessions: SessionAuditItem[]; total: number; page: number; totalPages: number }>> {
    const q = new URLSearchParams();
    if (params.counsellorId) q.append('counsellorId', params.counsellorId);
    if (params.studentProfileId) q.append('studentProfileId', params.studentProfileId);
    if (params.status) q.append('status', params.status);
    if (params.followUpRequired) q.append('followUpRequired', params.followUpRequired);
    if (params.startDate) q.append('startDate', params.startDate);
    if (params.endDate) q.append('endDate', params.endDate);
    if (params.page) q.append('page', String(params.page));
    if (params.limit) q.append('limit', String(params.limit));

    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return apiClient.get(`${API_ENDPOINTS.ADMIN.SESSION_AUDIT}${queryStr}`);
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

  /**
   * PDF Requirement: Counsellor Performance Leaderboard (Descending by Confirmed Enrollments)
   */
  public static async getCounsellorPerformance(): Promise<ApiResponse<{
    counsellors: Array<{
      rank: number;
      counsellorId: string;
      email: string;
      fullName: string;
      specialization: string;
      experienceYears: number;
      verificationStatus: string;
      enrollmentPoints: number;
      confirmedEnrollmentsCount: number;
      completedSessions: number;
      interestedStudentsCount: number;
      totalAssignedStudents: number;
      conversionRate: number;
      performanceTier: string;
      enrollments: Array<{
        id: string;
        studentName: string;
        studentEmail: string;
        studentPhone?: string | null;
        targetCollege?: string | null;
        targetStream?: string | null;
        enrolledAt: string;
        pointsAwarded: number;
      }>;
    }>;
    totalCounsellors: number;
    totalEnrollments: number;
    topPerformer: any;
  }>> {
    return apiClient.get(API_ENDPOINTS.ADMIN.COUNSELLOR_PERFORMANCE);
  }

  /**
   * Admin awards points or promotions to a counsellor
   */
  public static async awardCounsellorPoints(
    counsellorId: string,
    points: number,
    reason: string
  ): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.ADMIN.AWARD_COUNSELLOR_POINTS(counsellorId), { points, reason });
  }
}

