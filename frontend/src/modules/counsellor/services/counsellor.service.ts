import { apiClient, ApiResponse } from '../../../shared/services/api-client';
import { API_ENDPOINTS } from '../../../config/api.config';

export interface CounsellorStudentSummary {
  id: string;
  userId: string;
  fullName: string;
  gender: string;
  grade: string;
  contactEmail: string;
  phone: string;
  board: string;
  citizenship: string;
  passingOutYear: number;
  verificationStatus: string;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  verificationNotes?: string | null;
  completionScore: number;
  pendingActionsCount: number;
  lastAppointment?: any | null;
  preferenceSummary?: {
    primaryCountry?: string | null;
    department?: string;
    subDepartment?: string;
  } | null;
  user: {
    id: string;
    email: string;
    isActive: boolean;
    isEmailVerified: boolean;
  };
  createdAt: string;
}

export interface CounsellorDashboardData {
  counsellor: {
    id: string;
    email: string;
    role: string;
  };
  metrics: {
    assignedStudents: number;
    pendingVerifications: number;
    upcomingAppointmentsCount: number;
    activeActionPlans: number;
    unassignedPoolCount: number;
    activeApplications?: number;
  };
  recentStudents?: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    grade: string;
    verificationStatus: string;
    countryPreference: string;
    department: string;
    pendingActions: number;
  }[];
  upcomingAppointments: any[];
  recentNotes: any[];
}

export interface ActionPlanItem {
  id: string;
  studentProfileId: string;
  counsellorId: string;
  title: string;
  description?: string | null;
  category: string;
  targetDate?: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  counsellor?: { id: string; email: string };
}

export interface StudentCounsellorNote {
  id: string;
  studentProfileId: string;
  counsellorId: string;
  title?: string | null;
  content: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  counsellor?: { id: string; email: string };
}

export class CounsellorClientService {
  public static async getDashboard(): Promise<ApiResponse<CounsellorDashboardData>> {
    return apiClient.get(API_ENDPOINTS.COUNSELLOR.DASHBOARD);
  }

  public static async listAssignedStudents(params: {
    search?: string;
    verificationStatus?: string;
    board?: string;
    passingOutYear?: string;
    grade?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<ApiResponse<{ students: CounsellorStudentSummary[]; total: number; page: number; totalPages: number }>> {
    const q = new URLSearchParams();
    if (params.search) q.append('search', params.search);
    if (params.verificationStatus) q.append('verificationStatus', params.verificationStatus);
    if (params.board) q.append('board', params.board);
    if (params.passingOutYear) q.append('passingOutYear', params.passingOutYear);
    if (params.grade) q.append('grade', params.grade);
    if (params.page) q.append('page', String(params.page));
    if (params.limit) q.append('limit', String(params.limit));

    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return apiClient.get(`${API_ENDPOINTS.COUNSELLOR.STUDENTS}${queryStr}`);
  }

  public static async getStudent360(profileId: string): Promise<ApiResponse<any>> {
    return apiClient.get(API_ENDPOINTS.COUNSELLOR.STUDENT_360(profileId));
  }

  public static async createStudent(data: any): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.COUNSELLOR.CREATE_STUDENT, data);
  }

  public static async claimStudent(profileId: string): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.COUNSELLOR.CLAIM_STUDENT(profileId));
  }

  public static async getActionPlans(profileId: string): Promise<ApiResponse<ActionPlanItem[]>> {
    return apiClient.get(API_ENDPOINTS.COUNSELLOR.ACTION_PLANS(profileId));
  }

  public static async createActionPlan(profileId: string, data: {
    title: string;
    description?: string;
    category?: string;
    targetDate?: string;
    priority?: string;
  }): Promise<ApiResponse<ActionPlanItem>> {
    return apiClient.post(API_ENDPOINTS.COUNSELLOR.ACTION_PLANS(profileId), data);
  }

  public static async updateActionPlan(itemId: string, data: Partial<ActionPlanItem>): Promise<ApiResponse<ActionPlanItem>> {
    return apiClient.patch(API_ENDPOINTS.COUNSELLOR.ACTION_PLAN_ITEM(itemId), data);
  }

  public static async deleteActionPlan(itemId: string): Promise<ApiResponse<{ id: string; deleted: boolean }>> {
    return apiClient.delete(API_ENDPOINTS.COUNSELLOR.ACTION_PLAN_ITEM(itemId));
  }

  public static async getNotes(profileId: string): Promise<ApiResponse<StudentCounsellorNote[]>> {
    return apiClient.get(API_ENDPOINTS.COUNSELLOR.NOTES(profileId));
  }

  public static async createNote(profileId: string, data: {
    title?: string;
    content: string;
    isPrivate?: boolean;
  }): Promise<ApiResponse<StudentCounsellorNote>> {
    return apiClient.post(API_ENDPOINTS.COUNSELLOR.NOTES(profileId), data);
  }

  public static async downloadExportCsv(): Promise<void> {
    const token = localStorage.getItem('superc_token');
    const response = await fetch(API_ENDPOINTS.COUNSELLOR.EXPORT, {
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
    a.download = `assigned-students-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}
