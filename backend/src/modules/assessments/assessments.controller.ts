import { Request, Response, NextFunction } from 'express';
import { AssessmentsService } from './assessments.service';
import { ApiResponse } from '../../shared/utils/api-response';
import { AssessmentPathwayCode } from './assessments.types';

const getUserId = (req: Request): string => {
  return (req as any).user?.id || (req as any).user?.userId || '';
};

export class AssessmentsController {
  /**
   * GET /api/v1/assessments/pathways
   * List all 8 pathways along with student attempt status & resume point
   */
  public static async listPathways(req: Request, res: Response, next: NextFunction) {
    try {
      const studentUserId = getUserId(req);
      const data = await AssessmentsService.listPathways(studentUserId);
      return ApiResponse.success(res, data, 'Assessment pathways retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/v1/assessments/pathways/:pathwayCode
   * Get specific pathway definition (questions, instructions, limitations)
   */
  public static async getPathwayDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { pathwayCode } = req.params;
      const data = AssessmentsService.getPathwayDefinition(pathwayCode as AssessmentPathwayCode);
      return ApiResponse.success(res, data, 'Pathway definition retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/v1/assessments/access-codes/verify
   * Verify and unlock an access code
   */
  public static async verifyAccessCode(req: Request, res: Response, next: NextFunction) {
    try {
      const studentUserId = getUserId(req);
      const { code } = req.body;
      const data = await AssessmentsService.verifyAndUnlockCode(code, studentUserId);
      return ApiResponse.success(res, data, 'Access code verified successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/v1/assessments/access-codes/generate
   * Counsellor generates an access code
   */
  public static async generateAccessCode(req: Request, res: Response, next: NextFunction) {
    try {
      const counsellorUserId = getUserId(req);
      const data = await AssessmentsService.generateAccessCode({
        ...req.body,
        counsellorUserId,
      });
      return ApiResponse.created(res, data, 'Assessment access code generated successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/v1/assessments/access-codes
   * Counsellor lists all generated access codes
   */
  public static async listAccessCodes(req: Request, res: Response, next: NextFunction) {
    try {
      const counsellorUserId = getUserId(req);
      const data = AssessmentsService.listAccessCodes(counsellorUserId);
      return ApiResponse.success(res, data, 'Access codes retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/v1/assessments/attempts/:pathwayCode/start
   * Start a new attempt or resume incomplete attempt
   */
  public static async startAttempt(req: Request, res: Response, next: NextFunction) {
    try {
      const studentUserId = getUserId(req);
      const { pathwayCode } = req.params;
      const { accessCode } = req.body;
      const data = await AssessmentsService.startOrResumeAttempt(
        pathwayCode as AssessmentPathwayCode,
        studentUserId,
        accessCode
      );
      return ApiResponse.success(res, data, 'Assessment attempt initialized successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/v1/assessments/attempts/:attemptId/save-progress
   * Auto-save incomplete attempt progress
   */
  public static async saveProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const studentUserId = getUserId(req);
      const { attemptId } = req.params;
      const data = await AssessmentsService.saveAttemptProgress(attemptId, studentUserId, req.body);
      return ApiResponse.success(res, data, 'Assessment progress auto-saved successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/v1/assessments/attempts/:attemptId/submit
   * Submit attempt and compute diagnostic report
   */
  public static async submitAttempt(req: Request, res: Response, next: NextFunction) {
    try {
      const studentUserId = getUserId(req);
      const { attemptId } = req.params;
      const data = await AssessmentsService.submitAttempt(attemptId, studentUserId, req.body);
      return ApiResponse.success(res, data, 'Assessment completed and diagnostic report generated');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/v1/assessments/reports/:reportId
   * Fetch diagnostic report (student/counsellor authorized)
   */
  public static async getReport(req: Request, res: Response, next: NextFunction) {
    try {
      const requestingUserId = getUserId(req);
      const requestingUserRole = (req as any).user?.role;
      const { reportId } = req.params;
      const data = await AssessmentsService.getReport(reportId, requestingUserId, requestingUserRole);
      return ApiResponse.success(res, data, 'Diagnostic report retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/v1/assessments/counsellor/review/:studentProfileId
   * Counsellor review: Report with academic details, preferences, and shortlists
   */
  public static async getCounsellorReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { studentProfileId } = req.params;
      const data = await AssessmentsService.getCounsellorIntegratedReview(studentProfileId);
      return ApiResponse.success(res, data, 'Integrated counsellor assessment review retrieved');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/v1/assessments/counsellor/reports/:reportId/action-plan
   * Counsellor attaches discussion points and action plan
   */
  public static async saveActionPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const counsellorUserId = getUserId(req);
      const { reportId } = req.params;
      const data = await AssessmentsService.saveCounsellorActionPlan(
        reportId,
        counsellorUserId,
        req.body
      );
      return ApiResponse.success(res, data, 'Counsellor action plan recorded successfully');
    } catch (err) {
      return next(err);
    }
  }
}
