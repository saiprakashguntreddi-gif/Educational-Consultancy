import { Request, Response, NextFunction } from 'express';
import { ExamIntelligenceService } from './exam-intelligence.service';
import { ApiResponse } from '../../shared/utils/api-response';

export class ExamIntelligenceController {
  /**
   * GET /api/v1/exam-intelligence/overview
   * Returns comprehensive intelligence, college-to-exam mapping, deadlines, and student plan
   */
  public static async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = await ExamIntelligenceService.getIntelligenceOverview(userId);
      return ApiResponse.success(res, data, 'Exam intelligence overview retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/exam-intelligence/preparation-plan/:examId
   * Returns structured preparation milestones, study guides, books, and test-day tips
   */
  public static async getPreparationPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const { examId } = req.params;
      const userId = req.user?.id;
      const targetWeeks = req.query.targetWeeks ? Number(req.query.targetWeeks) : 8;

      const data = await ExamIntelligenceService.getPreparationPlan(examId, userId, targetWeeks);
      return ApiResponse.success(res, data, 'Preparation plan retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/exam-intelligence/mock-tests/:testId
   * Returns mock test questions for taking (anti-cheat: answers & explanations stripped)
   */
  public static async getMockTest(req: Request, res: Response, next: NextFunction) {
    try {
      const { testId } = req.params;
      const data = await ExamIntelligenceService.getMockTestForTaking(testId);
      return ApiResponse.success(res, data, 'Mock test loaded successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/exam-intelligence/mock-tests/:testId/submit
   * Evaluates submitted mock test answers server-side, records attempt, and returns breakdown
   */
  public static async submitMockTest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { testId } = req.params;
      const { answers, timeSpentSeconds } = req.body;

      const data = await ExamIntelligenceService.evaluateMockTest(
        userId,
        testId,
        answers,
        timeSpentSeconds
      );
      return ApiResponse.success(res, data, 'Mock test evaluated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/exam-intelligence/plan
   * Add or update an exam in personal plan
   */
  public static async savePlan(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = await ExamIntelligenceService.saveExamPlan(userId, req.body);
      return ApiResponse.success(res, data, 'Exam added to personal plan successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/exam-intelligence/plan/:id
   * Update plan status, target date/score, achieved score, notes
   */
  public static async updatePlan(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const data = await ExamIntelligenceService.updateExamPlan(userId, id, req.body);
      return ApiResponse.success(res, data, 'Exam plan updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/exam-intelligence/plan/:id
   * Remove an exam from personal plan
   */
  public static async deletePlan(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const data = await ExamIntelligenceService.deleteExamPlan(userId, id);
      return ApiResponse.success(res, data, 'Exam removed from plan successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/exam-intelligence/counsellor/student/:studentProfileId
   * Staff review of a student's exam intelligence, plans, and mock performance
   */
  public static async getStudentIntelligenceForStaff(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const staffUserId = req.user!.id;
      const { studentProfileId } = req.params;
      const data = await ExamIntelligenceService.getStudentIntelligenceForStaff(
        studentProfileId,
        staffUserId
      );
      return ApiResponse.success(res, data, 'Student exam intelligence retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
