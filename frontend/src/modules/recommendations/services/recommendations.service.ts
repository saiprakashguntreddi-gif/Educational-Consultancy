import { apiClient, ApiResponse } from '../../../shared/services/api-client';
import { API_ENDPOINTS } from '../../../config/api.config';
import {
  MyRecommendationsResponse,
  RecommendationBatchDto,
  RecommendationItemDto,
  CohortAnalyticsResponse,
  RecommendationTier,
  RecommendationBatchStatus,
  ManagedCollegeDto,
  ManagedCollegesResponse,
  AssignCollegeTierInput,
  CreateManagedCollegeInput,
  UpdateManagedCollegeInput,
} from '../recommendations.types';

export class RecommendationsService {
  /**
   * Fetch authenticated student's active recommendations batch.
   * Checks student verification status.
   */
  public static async getMyRecommendations(): Promise<ApiResponse<MyRecommendationsResponse>> {
    return apiClient.get<MyRecommendationsResponse>(
      API_ENDPOINTS.RECOMMENDATIONS.MY_RECOMMENDATIONS
    );
  }

  /**
   * Request/generate a new balanced recommendation batch
   */
  public static async generateRecommendations(
    studentProfileId?: string
  ): Promise<ApiResponse<RecommendationBatchDto>> {
    return apiClient.post<RecommendationBatchDto>(
      API_ENDPOINTS.RECOMMENDATIONS.GENERATE,
      { studentProfileId }
    );
  }

  /**
   * Toggle shortlist status of a recommended college
   */
  public static async toggleShortlist(
    itemId: string
  ): Promise<ApiResponse<{ isShortlisted: boolean; message: string }>> {
    return apiClient.post<{ isShortlisted: boolean; message: string }>(
      API_ENDPOINTS.RECOMMENDATIONS.SHORTLIST_ITEM(itemId)
    );
  }

  /**
   * Get cohort scatter-plot analytics and benchmark percentiles
   */
  public static async getCohortAnalytics(
    institutionId: string
  ): Promise<ApiResponse<CohortAnalyticsResponse>> {
    return apiClient.get<CohortAnalyticsResponse>(
      API_ENDPOINTS.RECOMMENDATIONS.COHORT_ANALYTICS(institutionId)
    );
  }

  /**
   * Staff/Counsellor: Fetch recommendations for an assigned student
   */
  public static async getStudentRecommendationsForStaff(
    studentProfileId: string
  ): Promise<ApiResponse<RecommendationBatchDto | null>> {
    return apiClient.get<RecommendationBatchDto | null>(
      API_ENDPOINTS.RECOMMENDATIONS.STUDENT_RECOMMENDATIONS(studentProfileId)
    );
  }

  /**
   * Staff/Counsellor: Update review status and general advisory notes
   */
  public static async reviewBatch(
    batchId: string,
    status: RecommendationBatchStatus,
    counsellorNotes?: string
  ): Promise<ApiResponse<RecommendationBatchDto>> {
    return apiClient.put<RecommendationBatchDto>(
      API_ENDPOINTS.RECOMMENDATIONS.COUNSELLOR_REVIEW(batchId),
      { status, counsellorNotes }
    );
  }

  /**
   * Staff/Counsellor: Override tier category for a recommendation
   */
  public static async overrideItemTier(
    itemId: string,
    tier: RecommendationTier,
    notes?: string
  ): Promise<ApiResponse<RecommendationItemDto>> {
    return apiClient.patch<RecommendationItemDto>(
      API_ENDPOINTS.RECOMMENDATIONS.TIER_OVERRIDE(itemId),
      { tier, notes }
    );
  }

  /**
   * Admin: List managed colleges with search, tier filtering, and pagination
   */
  public static async adminListManagedColleges(params?: {
    search?: string;
    tier?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<ManagedCollegesResponse>> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.tier && params.tier !== 'ALL') query.append('tier', params.tier);
    if (params?.isActive !== undefined) query.append('isActive', String(params.isActive));
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const url = `${API_ENDPOINTS.RECOMMENDATIONS.ADMIN_COLLEGE_TIERS}${query.toString() ? `?${query.toString()}` : ''}`;
    return apiClient.get<ManagedCollegesResponse>(url);
  }

  /**
   * Admin: Add a new college to the catalogue with an initial tier
   */
  public static async adminCreateManagedCollege(
    input: CreateManagedCollegeInput
  ): Promise<ApiResponse<ManagedCollegeDto>> {
    return apiClient.post<ManagedCollegeDto>(
      API_ENDPOINTS.RECOMMENDATIONS.ADMIN_COLLEGE_TIERS,
      input
    );
  }

  /**
   * Admin: Update college details and admission benchmarks
   */
  public static async adminUpdateManagedCollege(
    id: string,
    input: UpdateManagedCollegeInput
  ): Promise<ApiResponse<ManagedCollegeDto>> {
    return apiClient.put<ManagedCollegeDto>(
      API_ENDPOINTS.RECOMMENDATIONS.ADMIN_COLLEGE_TIER_BY_ID(id),
      input
    );
  }

  /**
   * Admin: Assign or change college tier with mandatory reason
   */
  public static async adminAssignCollegeTier(
    id: string,
    input: AssignCollegeTierInput
  ): Promise<ApiResponse<ManagedCollegeDto>> {
    return apiClient.patch<ManagedCollegeDto>(
      API_ENDPOINTS.RECOMMENDATIONS.ADMIN_CHANGE_TIER(id),
      input
    );
  }

  /**
   * Admin: Activate or deactivate a college in the catalogue
   */
  public static async adminToggleCollegeStatus(
    id: string,
    isActive: boolean
  ): Promise<ApiResponse<ManagedCollegeDto>> {
    return apiClient.patch<ManagedCollegeDto>(
      API_ENDPOINTS.RECOMMENDATIONS.ADMIN_TOGGLE_STATUS(id),
      { isActive }
    );
  }
}

