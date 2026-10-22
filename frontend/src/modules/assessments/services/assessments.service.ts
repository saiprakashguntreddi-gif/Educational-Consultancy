import { apiClient, ApiResponse } from '../../../shared/services/api-client';
import { API_ENDPOINTS } from '../../../config/api.config';
import {
  AssessmentPathwayCode,
  PathwayItem,
  PathwayDetailResponse,
  StudentAssessmentAttempt,
  DiagnosticReport,
  AccessCodeRecord,
  CounsellorIntegratedReview,
} from '../assessments.types';

export class AssessmentsService {
  /**
   * 1. List all 8 assessment pathways with authenticated student attempt/completion state
   */
  public static async listPathways(): Promise<
    ApiResponse<{ disclaimer: string; pathways: PathwayItem[] }>
  > {
    return apiClient.get(API_ENDPOINTS.ASSESSMENTS.PATHWAYS);
  }

  /**
   * 2. Get full pathway details, instructions, disclaimers, and interactive questions
   */
  public static async getPathwayDetails(
    pathwayCode: AssessmentPathwayCode
  ): Promise<ApiResponse<PathwayDetailResponse>> {
    return apiClient.get(API_ENDPOINTS.ASSESSMENTS.PATHWAY_BY_CODE(pathwayCode));
  }

  /**
   * 3. Verify a counsellor-assigned access code
   */
  public static async verifyAccessCode(code: string): Promise<
    ApiResponse<{
      valid: boolean;
      code: string;
      pathwayCode: AssessmentPathwayCode;
      expiresAt: string;
      message: string;
    }>
  > {
    return apiClient.post(API_ENDPOINTS.ASSESSMENTS.VERIFY_ACCESS_CODE, { code });
  }

  /**
   * 4. Start a new attempt session or resume an existing in-progress attempt
   */
  public static async startOrResumeAttempt(
    pathwayCode: AssessmentPathwayCode,
    accessCode?: string
  ): Promise<ApiResponse<StudentAssessmentAttempt>> {
    return apiClient.post(API_ENDPOINTS.ASSESSMENTS.START_ATTEMPT(pathwayCode), {
      accessCode: accessCode || undefined,
    });
  }

  /**
   * 5. Auto-save attempt progress, question index, and answers
   */
  public static async saveAttemptProgress(
    attemptId: string,
    payload: {
      currentQuestionIndex: number;
      answers: Record<string, string>;
      timeSpentSeconds: number;
    }
  ): Promise<ApiResponse<StudentAssessmentAttempt>> {
    return apiClient.post(API_ENDPOINTS.ASSESSMENTS.SAVE_PROGRESS(attemptId), payload);
  }

  /**
   * 6. Submit finalized attempt & execute scoring engine
   */
  public static async submitAttempt(
    attemptId: string,
    payload: {
      answers: Record<string, string>;
      timeSpentSeconds: number;
    }
  ): Promise<ApiResponse<DiagnosticReport>> {
    return apiClient.post(API_ENDPOINTS.ASSESSMENTS.SUBMIT_ATTEMPT(attemptId), payload);
  }

  /**
   * 7. Retrieve completed diagnostic report
   */
  public static async getReport(reportId: string): Promise<ApiResponse<DiagnosticReport>> {
    return apiClient.get(API_ENDPOINTS.ASSESSMENTS.REPORT_BY_ID(reportId));
  }

  /**
   * 8. Counsellor: Generate controlled access code
   */
  public static async generateAccessCode(input: {
    pathwayCode: AssessmentPathwayCode | 'ALL_PATHWAYS';
    assignedStudentEmail?: string;
    maxUses?: number;
    validityDays?: number;
    notes?: string;
    customCode?: string;
  }): Promise<ApiResponse<AccessCodeRecord>> {
    return apiClient.post(API_ENDPOINTS.ASSESSMENTS.GENERATE_ACCESS_CODE, input);
  }

  /**
   * 9. Counsellor: List all generated access codes
   */
  public static async listAccessCodes(): Promise<
    ApiResponse<{ accessCodes: AccessCodeRecord[] }>
  > {
    return apiClient.get(API_ENDPOINTS.ASSESSMENTS.LIST_ACCESS_CODES);
  }

  /**
   * 10. Counsellor: Load integrated student review (assessments + academics + preferences)
   */
  public static async getCounsellorReview(
    studentProfileId: string
  ): Promise<ApiResponse<CounsellorIntegratedReview>> {
    return apiClient.get(API_ENDPOINTS.ASSESSMENTS.COUNSELLOR_REVIEW(studentProfileId));
  }

  /**
   * 11. Counsellor: Save discussion points & action plan milestones on a report
   */
  public static async saveActionPlan(
    reportId: string,
    payload: {
      discussionPoints: string[];
      actionMilestones: {
        title: string;
        targetDeadline?: string;
        status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
      }[];
      summaryNotes: string;
    }
  ): Promise<ApiResponse<DiagnosticReport>> {
    return apiClient.post(
      API_ENDPOINTS.ASSESSMENTS.COUNSELLOR_ACTION_PLAN(reportId),
      payload
    );
  }
}
