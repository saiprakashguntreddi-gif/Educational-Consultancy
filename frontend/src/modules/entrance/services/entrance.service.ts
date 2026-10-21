import { apiClient, ApiResponse } from '../../../shared/services/api-client';
import { API_ENDPOINTS } from '../../../config/api.config';
import {
  EntranceExamRecord,
  StudentExamPlanRecord,
  StudentExamPlanInput,
  UpdateExamPlanInput,
  MockTestSummary,
  MockTestTakingView,
  MockTestSubmissionInput,
  MockTestResultRecord,
  StudentMockAttemptRecord,
} from '../entrance.types';

export class EntranceService {
  /**
   * Fetch entrance exams catalog with optional filtering
   */
  public static async getCatalog(filters?: {
    destination?: string;
    category?: string;
    search?: string;
  }): Promise<ApiResponse<EntranceExamRecord[]>> {
    const params = new URLSearchParams();
    if (filters?.destination) params.append('destination', filters.destination);
    if (filters?.category && filters.category !== 'ALL') params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<EntranceExamRecord[]>(`${API_ENDPOINTS.ENTRANCE.CATALOG}${queryString}`);
  }

  /**
   * Fetch single exam details by ID
   */
  public static async getExamById(id: string): Promise<ApiResponse<EntranceExamRecord>> {
    return apiClient.get<EntranceExamRecord>(API_ENDPOINTS.ENTRANCE.EXAM_BY_ID(id));
  }

  /**
   * Get authenticated student's saved exam plan
   */
  public static async getMyPlan(): Promise<ApiResponse<StudentExamPlanRecord[]>> {
    return apiClient.get<StudentExamPlanRecord[]>(API_ENDPOINTS.ENTRANCE.PLAN_ME);
  }

  /**
   * Add an exam to personal plan
   */
  public static async savePlanItem(
    data: StudentExamPlanInput
  ): Promise<ApiResponse<StudentExamPlanRecord>> {
    return apiClient.post<StudentExamPlanRecord>(API_ENDPOINTS.ENTRANCE.PLAN_SAVE, data);
  }

  /**
   * Update plan status, target score, or dates
   */
  public static async updatePlanItem(
    id: string,
    data: UpdateExamPlanInput
  ): Promise<ApiResponse<StudentExamPlanRecord>> {
    return apiClient.put<StudentExamPlanRecord>(API_ENDPOINTS.ENTRANCE.PLAN_ITEM(id), data);
  }

  /**
   * Remove exam from personal plan
   */
  public static async removePlanItem(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return apiClient.delete<{ deleted: boolean }>(API_ENDPOINTS.ENTRANCE.PLAN_ITEM(id));
  }

  /**
   * List available mock tests for an exam
   */
  public static async getMockTestsForExam(
    examId: string
  ): Promise<ApiResponse<MockTestSummary[]>> {
    return apiClient.get<MockTestSummary[]>(API_ENDPOINTS.ENTRANCE.MOCK_TESTS_BY_EXAM(examId));
  }

  /**
   * Load mock test for taking (diagnostic environment)
   */
  public static async getMockTestForTaking(
    testId: string
  ): Promise<ApiResponse<MockTestTakingView>> {
    return apiClient.get<MockTestTakingView>(API_ENDPOINTS.ENTRANCE.MOCK_TEST_BY_ID(testId));
  }

  /**
   * Submit timed mock test for server-side evaluation
   */
  public static async submitMockTest(
    testId: string,
    data: MockTestSubmissionInput
  ): Promise<ApiResponse<MockTestResultRecord>> {
    return apiClient.post<MockTestResultRecord>(
      API_ENDPOINTS.ENTRANCE.MOCK_TEST_SUBMIT(testId),
      data
    );
  }

  /**
   * Get student's past mock test attempts and performance records
   */
  public static async getMyMockAttempts(): Promise<ApiResponse<StudentMockAttemptRecord[]>> {
    return apiClient.get<StudentMockAttemptRecord[]>(API_ENDPOINTS.ENTRANCE.MOCK_ATTEMPTS_ME);
  }

  /**
   * Staff review endpoint for student exam plans
   */
  public static async getPlanByProfileId(
    profileId: string
  ): Promise<ApiResponse<{ plans: any[]; mockAttempts: any[] }>> {
    return apiClient.get<{ plans: any[]; mockAttempts: any[] }>(
      API_ENDPOINTS.ENTRANCE.PLAN_BY_PROFILE_ID(profileId)
    );
  }
}
