import { apiClient, ApiResponse } from '../../../shared/services/api-client';
import { API_ENDPOINTS } from '../../../config/api.config';
import {
  ExamIntelligenceOverview,
  PreparationPlanResponse,
  MockTestTakingPayload,
  MockTestEvaluationResult,
  StudentExamPlanRecord,
  SaveExamPlanInput,
  UpdateExamPlanInput,
  StudentMockAttemptRecord,
} from '../exam-intelligence.types';

export class ExamIntelligenceService {
  /**
   * Fetch comprehensive intelligence overview: college requirements, recommended exams, deadlines, and plan summary
   */
  public static async getOverview(): Promise<ApiResponse<ExamIntelligenceOverview>> {
    return apiClient.get<ExamIntelligenceOverview>(API_ENDPOINTS.EXAM_INTELLIGENCE.OVERVIEW);
  }

  /**
   * Fetch structured preparation plan, 8-week milestones, recommended books, study guidance, and test-day tips
   */
  public static async getPreparationPlan(
    examId: string,
    targetWeeks = 8
  ): Promise<ApiResponse<PreparationPlanResponse>> {
    return apiClient.get<PreparationPlanResponse>(
      `${API_ENDPOINTS.EXAM_INTELLIGENCE.PREPARATION_PLAN(examId)}?targetWeeks=${targetWeeks}`
    );
  }

  /**
   * Load mock test for taking in diagnostic environment (anti-cheat: answers & explanations omitted)
   */
  public static async getMockTestForTaking(
    testId: string
  ): Promise<ApiResponse<MockTestTakingPayload>> {
    return apiClient.get<MockTestTakingPayload>(
      API_ENDPOINTS.EXAM_INTELLIGENCE.MOCK_TEST_BY_ID(testId)
    );
  }

  /**
   * Submit timed mock test for server-side evaluation & diagnostic report
   */
  public static async submitMockTest(
    testId: string,
    data: { answers: Record<string, number>; timeSpentSeconds: number }
  ): Promise<ApiResponse<MockTestEvaluationResult>> {
    return apiClient.post<MockTestEvaluationResult>(
      API_ENDPOINTS.EXAM_INTELLIGENCE.MOCK_TEST_SUBMIT(testId),
      data
    );
  }

  /**
   * Add or update an exam in personal plan
   */
  public static async savePlanItem(
    data: SaveExamPlanInput
  ): Promise<ApiResponse<StudentExamPlanRecord>> {
    return apiClient.post<StudentExamPlanRecord>(API_ENDPOINTS.EXAM_INTELLIGENCE.PLAN_SAVE, data);
  }

  /**
   * Update status, target date/score, current score, or notes in personal plan
   */
  public static async updatePlanItem(
    id: string,
    data: UpdateExamPlanInput
  ): Promise<ApiResponse<StudentExamPlanRecord>> {
    return apiClient.put<StudentExamPlanRecord>(API_ENDPOINTS.EXAM_INTELLIGENCE.PLAN_ITEM(id), data);
  }

  /**
   * Remove exam from personal plan
   */
  public static async removePlanItem(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return apiClient.delete<{ deleted: boolean }>(API_ENDPOINTS.EXAM_INTELLIGENCE.PLAN_ITEM(id));
  }

  /**
   * Get authenticated student's saved exam plans
   */
  public static async getMyPlan(): Promise<ApiResponse<StudentExamPlanRecord[]>> {
    return apiClient.get<StudentExamPlanRecord[]>(API_ENDPOINTS.ENTRANCE.PLAN_ME);
  }

  /**
   * Get student's past mock test attempts and performance records
   */
  public static async getMyMockAttempts(): Promise<ApiResponse<StudentMockAttemptRecord[]>> {
    return apiClient.get<StudentMockAttemptRecord[]>(API_ENDPOINTS.ENTRANCE.MOCK_ATTEMPTS_ME);
  }

  /**
   * Get mock tests available for a specific exam
   */
  public static async getMockTestsForExam(examId: string): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(API_ENDPOINTS.ENTRANCE.MOCK_TESTS_BY_EXAM(examId));
  }
}
