import { apiClient, ApiResponse } from '../../../shared/services/api-client';
import { API_ENDPOINTS } from '../../../config/api.config';
import {
  ScholarshipDto,
  ScholarshipListResponse,
  ScholarshipQueryFilters,
  CreateScholarshipInput,
  UpdateScholarshipInput,
} from '../scholarships.types';

export class ScholarshipsService {
  /**
   * Student: List scholarships with personalized eligibility evaluations
   */
  public static async listScholarships(
    filters?: ScholarshipQueryFilters
  ): Promise<ApiResponse<ScholarshipListResponse>> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.country) params.append('country', filters.country);
    if (filters?.department) params.append('department', filters.department);
    if (filters?.studyLevel && filters.studyLevel !== 'ALL') {
      params.append('studyLevel', filters.studyLevel);
    }
    if (filters?.awardType && filters.awardType !== 'ALL') {
      params.append('awardType', filters.awardType);
    }
    if (filters?.deadlineStatus && filters.deadlineStatus !== 'ALL') {
      params.append('deadlineStatus', filters.deadlineStatus);
    }
    if (filters?.eligibilityStatus && filters.eligibilityStatus !== 'ALL') {
      params.append('eligibility', filters.eligibilityStatus);
      params.append('eligibilityStatus', filters.eligibilityStatus);
    }
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<ScholarshipListResponse>(
      `${API_ENDPOINTS.SCHOLARSHIPS.DISCOVERY}${qs}`
    );
  }

  /**
   * Student & Staff: Get scholarship details with eligibility checklist
   */
  public static async getScholarshipDetail(
    id: string
  ): Promise<ApiResponse<ScholarshipDto>> {
    return apiClient.get<ScholarshipDto>(API_ENDPOINTS.SCHOLARSHIPS.BY_ID(id));
  }

  /**
   * Student: Toggle bookmark/save scholarship
   */
  public static async toggleSaveScholarship(
    id: string
  ): Promise<ApiResponse<{ isSaved: boolean; message: string }>> {
    return apiClient.post<{ isSaved: boolean; message: string }>(
      API_ENDPOINTS.SCHOLARSHIPS.SAVE(id)
    );
  }

  /**
   * Student: Get saved/bookmarked scholarships
   */
  public static async getSavedScholarships(): Promise<ApiResponse<ScholarshipDto[]>> {
    return apiClient.get<ScholarshipDto[]>(API_ENDPOINTS.SCHOLARSHIPS.SAVED_ME);
  }

  /**
   * Admin: List all scholarships (including inactive & draft records)
   */
  public static async adminListScholarships(params?: {
    search?: string;
    country?: string;
    isActive?: string;
    page?: number;
    limit?: number;
  }): Promise<
    ApiResponse<{
      scholarships: ScholarshipDto[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      counts: {
        all: number;
        active: number;
        inactive: number;
      };
    }>
  > {
    const qp = new URLSearchParams();
    if (params?.search) qp.append('search', params.search);
    if (params?.country) qp.append('country', params.country);
    if (params?.isActive !== undefined && params.isActive !== 'all') {
      qp.append('isActive', params.isActive);
    }
    if (params?.page) qp.append('page', params.page.toString());
    if (params?.limit) qp.append('limit', params.limit.toString());

    const qs = qp.toString() ? `?${qp.toString()}` : '';
    return apiClient.get<{
      scholarships: ScholarshipDto[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      counts: {
        all: number;
        active: number;
        inactive: number;
      };
    }>(`${API_ENDPOINTS.SCHOLARSHIPS.ADMIN_ALL}${qs}`);
  }

  /**
   * Admin: Create a new verified scholarship entry
   */
  public static async adminCreateScholarship(
    input: CreateScholarshipInput
  ): Promise<ApiResponse<ScholarshipDto>> {
    return apiClient.post<ScholarshipDto>(
      API_ENDPOINTS.SCHOLARSHIPS.ADMIN_CREATE,
      input
    );
  }

  /**
   * Admin: Update scholarship details and eligibility rules
   */
  public static async adminUpdateScholarship(
    id: string,
    input: UpdateScholarshipInput
  ): Promise<ApiResponse<ScholarshipDto>> {
    return apiClient.put<ScholarshipDto>(
      API_ENDPOINTS.SCHOLARSHIPS.ADMIN_BY_ID(id),
      input
    );
  }

  /**
   * Admin: Toggle scholarship active/inactive status
   */
  public static async adminToggleStatus(
    id: string,
    isActive: boolean
  ): Promise<ApiResponse<ScholarshipDto>> {
    return apiClient.patch<ScholarshipDto>(
      API_ENDPOINTS.SCHOLARSHIPS.ADMIN_STATUS(id),
      { isActive }
    );
  }

  /**
   * Admin: Delete scholarship record
   */
  public static async adminDeleteScholarship(
    id: string
  ): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete<{ message: string }>(
      API_ENDPOINTS.SCHOLARSHIPS.ADMIN_BY_ID(id)
    );
  }
}
