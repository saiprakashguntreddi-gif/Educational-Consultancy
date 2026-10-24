import { Request, Response, NextFunction } from 'express';
import { EntranceService } from './entrance.service';
import { ApiResponse } from '../../shared/utils/api-response';

export class EntranceController {
  /**
   * GET /api/v1/exams
   */
  static async getCatalog(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const filters = {
        destination: req.query.destination as string | undefined,
        category: req.query.category as string | undefined,
        search: req.query.search as string | undefined,
      };

      const catalog = await EntranceService.getExamsCatalog(userId, filters);
      return ApiResponse.success(res, catalog, 'Exams catalog retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/v1/exams/categories
   */
  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const categories = await EntranceService.getCategories(userId);
      return ApiResponse.success(res, categories, 'Main exam categories retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/v1/exams/:id
   */
  static async getExamById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const exam = await EntranceService.getExamById(req.params.id, userId);
      return ApiResponse.success(res, exam, 'Exam details retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PUT /api/v1/exams/:id/categories
   * Admin / Counsellor: Assign exam to multiple categories
   */
  static async updateExamCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUserId = req.user?.id;
      const { categoryIds } = req.body;
      if (!Array.isArray(categoryIds)) {
        return res.status(400).json({
          success: false,
          message: 'categoryIds array must be provided.',
        });
      }
      const exam = await EntranceService.updateExamCategoryAssignments(
        req.params.id,
        categoryIds,
        adminUserId
      );
      return ApiResponse.success(res, exam, 'Exam category assignments updated successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/v1/exams/plan/me
   */
  static async getMyPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const plan = await EntranceService.getStudentExamPlan(userId);
      return ApiResponse.success(res, plan.items, 'Student exam plan retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/v1/exams/plan
   */
  static async savePlanItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const ip = req.ip;
      const item = await EntranceService.saveExamPlanItem(userId, req.body, ip);
      return ApiResponse.success(res, item, 'Exam added to personal plan successfully', 201);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PUT /api/v1/exams/plan/:id
   */
  static async updatePlanItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const ip = req.ip;
      const item = await EntranceService.updateExamPlanItem(userId, req.params.id, req.body, ip);
      return ApiResponse.success(res, item, 'Exam plan item updated successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * DELETE /api/v1/exams/plan/:id
   */
  static async removePlanItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const ip = req.ip;
      await EntranceService.removeExamPlanItem(userId, req.params.id, ip);
      return ApiResponse.success(res, { deleted: true }, 'Exam removed from plan successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/v1/exams/:id/mock-tests
   */
  static async getMockTestsForExam(req: Request, res: Response, next: NextFunction) {
    try {
      const tests = await EntranceService.getMockTestsForExam(req.params.id);
      return ApiResponse.success(res, tests, 'Available mock tests retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/v1/exams/mock-tests/:testId
   */
  static async getMockTest(req: Request, res: Response, next: NextFunction) {
    try {
      const test = await EntranceService.getMockTestForTaking(req.params.testId);
      return ApiResponse.success(res, test, 'Mock test loaded successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/v1/exams/mock-tests/:testId/submit
   */
  static async submitMockTest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const ip = req.ip;
      const result = await EntranceService.submitMockTest(userId, req.params.testId, req.body, ip);
      return ApiResponse.success(res, result, 'Mock test submitted and evaluated successfully', 201);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/v1/exams/mock-attempts/me
   */
  static async getMyMockAttempts(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const attempts = await EntranceService.getStudentMockAttempts(userId);
      return ApiResponse.success(res, attempts, 'Past mock attempts retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/v1/exams/plan/profile/:studentProfileId (Staff Review)
   */
  static async getPlanByProfileId(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await EntranceService.getStudentExamPlanByProfileId(req.params.studentProfileId);
      return ApiResponse.success(res, plan, 'Student exam plan reviewed successfully');
    } catch (err) {
      return next(err);
    }
  }
}
