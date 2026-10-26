import { Request, Response, NextFunction } from 'express';
import { RecommendationsService } from './recommendations.service';
import { ApiResponse } from '../../shared/utils/api-response';
import { Role } from '../../config/roles';

export class RecommendationsController {
  /**
   * GET /api/v1/recommendations/my-recommendations
   * Authenticated student retrieves their active recommendations
   */
  public static async getMyRecommendations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await RecommendationsService.getMyRecommendations(req.user!.id);
      ApiResponse.success(res, result, 'Student recommendations retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/recommendations/generate
   * Generates or regenerates a balanced recommendation batch
   */
  public static async generateRecommendations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const isStaff = req.user!.role === Role.ADMIN;
      const targetStudentProfileId = isStaff ? req.body.studentProfileId : undefined;

      const batch = await RecommendationsService.generateRecommendations(
        req.user!.id,
        targetStudentProfileId,
        isStaff
      );
      ApiResponse.success(res, batch, 'Balanced three-tier recommendations generated successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/recommendations/student/:studentProfileId
   * Counsellor / Admin retrieves recommendations for an assigned student
   */
  public static async getStudentRecommendationsForStaff(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { studentProfileId } = req.params;
      const batch = await RecommendationsService.getStudentRecommendationsForStaff(studentProfileId);
      ApiResponse.success(
        res,
        batch,
        batch ? 'Student recommendations retrieved' : 'No recommendations generated yet for this student'
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/recommendations/batch/:batchId/counsellor-review
   * Counsellor reviews, adds advisory commentary, and updates batch status
   */
  public static async reviewBatchByCounsellor(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { batchId } = req.params;
      const updated = await RecommendationsService.reviewBatchByCounsellor(
        batchId,
        req.user!.id,
        req.body
      );
      ApiResponse.success(res, updated, 'Counsellor review updated successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/recommendations/items/:id/tier-override
   * Counsellor overrides or adjusts the tier category for a recommendation
   */
  public static async overrideItemTier(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const updated = await RecommendationsService.overrideItemTierByCounsellor(
        id,
        req.user!.id,
        req.body
      );
      ApiResponse.success(res, updated, 'Recommendation tier adjusted successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/recommendations/items/:id/shortlist
   * Student shortlists or un-shortlists a recommended college
   */
  public static async toggleShortlist(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const result = await RecommendationsService.toggleShortlist(id, req.user!.id);
      ApiResponse.success(res, result, result.message);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/recommendations/cohort-analytics/:institutionId
   * Retrieves historical cohort comparison and scatter-plot context
   */
  public static async getCohortAnalytics(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { institutionId } = req.params;
      const analytics = await RecommendationsService.getCohortAnalytics(
        institutionId,
        req.user?.id
      );
      ApiResponse.success(res, analytics, 'Cohort analytics retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/recommendations/admin/college-tiers
   * Admin lists all managed colleges with filtering, search, pagination
   */
  public static async adminListManagedColleges(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await RecommendationsService.adminListManagedColleges(req.query as any);
      ApiResponse.success(res, result, 'Managed colleges retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/recommendations/admin/college-tiers
   * Admin creates a new college with initial tier
   */
  public static async adminCreateManagedCollege(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const college = await RecommendationsService.adminCreateManagedCollege(
        req.user!.id,
        req.body
      );
      ApiResponse.success(res, college, 'Managed college created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/recommendations/admin/college-tiers/:id
   * Admin updates college details / benchmarks / tier
   */
  public static async adminUpdateManagedCollege(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const updated = await RecommendationsService.adminUpdateManagedCollege(
        id,
        req.user!.id,
        req.body
      );
      ApiResponse.success(res, updated, 'College details updated successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/recommendations/admin/college-tiers/:id/tier
   * Admin changes college tier with mandatory reason
   */
  public static async adminAssignCollegeTier(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const updated = await RecommendationsService.adminAssignCollegeTier(
        id,
        req.user!.id,
        req.body
      );
      ApiResponse.success(res, updated, 'College tier updated successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/recommendations/admin/college-tiers/:id/status
   * Admin activates or deactivates college
   */
  public static async adminToggleCollegeStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const updated = await RecommendationsService.adminToggleCollegeStatus(
        id,
        req.user!.id,
        isActive
      );
      ApiResponse.success(
        res,
        updated,
        `College successfully ${isActive ? 'activated' : 'deactivated'}`
      );
    } catch (err) {
      next(err);
    }
  }
}
