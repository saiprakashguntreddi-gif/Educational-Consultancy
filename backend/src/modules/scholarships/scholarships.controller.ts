import { Request, Response, NextFunction } from 'express';
import { ScholarshipsService } from './scholarships.service';
import { ApiResponse } from '../../shared/utils/api-response';

export class ScholarshipsController {
  /**
   * GET /api/v1/scholarships
   * Student: List scholarships with personalized eligibility evaluations
   */
  public static async listScholarshipsForStudent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await ScholarshipsService.listScholarshipsForStudent(
        req.user!.id,
        req.query as any
      );
      ApiResponse.success(res, result, 'Scholarships retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/scholarships/:id
   * Student & Staff: Get scholarship details with eligibility checklist
   */
  public static async getScholarshipDetail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const detail = await ScholarshipsService.getScholarshipDetail(id, req.user?.id);
      ApiResponse.success(res, detail, 'Scholarship details retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/scholarships/:id/save
   * Student: Toggle save/shortlist scholarship
   */
  public static async toggleSaveScholarship(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const result = await ScholarshipsService.toggleSaveScholarship(id, req.user!.id);
      ApiResponse.success(res, result, result.message);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/scholarships/saved/me
   * Student: List saved/shortlisted scholarships
   */
  public static async getSavedScholarships(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const saved = await ScholarshipsService.getSavedScholarships(req.user!.id);
      ApiResponse.success(res, saved, 'Saved scholarships retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/scholarships/admin/all
   * Admin: List all catalogue scholarships with management controls
   */
  public static async adminListScholarships(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await ScholarshipsService.adminListScholarships(req.query as any);
      ApiResponse.success(res, result, 'Admin scholarship catalogue retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/scholarships/admin
   * Admin: Add new scholarship to catalogue
   */
  public static async adminCreateScholarship(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const created = await ScholarshipsService.adminCreateScholarship(req.user!.id, req.body);
      ApiResponse.success(res, created, 'Scholarship added to catalogue successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/scholarships/admin/:id
   * Admin: Update scholarship details
   */
  public static async adminUpdateScholarship(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const updated = await ScholarshipsService.adminUpdateScholarship(
        req.user!.id,
        id,
        req.body
      );
      ApiResponse.success(res, updated, 'Scholarship updated successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/scholarships/admin/:id/status
   * Admin: Activate or deactivate scholarship
   */
  public static async adminToggleScholarshipStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const updated = await ScholarshipsService.adminToggleScholarshipStatus(
        req.user!.id,
        id,
        isActive
      );
      ApiResponse.success(
        res,
        updated,
        `Scholarship successfully ${isActive ? 'activated' : 'deactivated'}`
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/v1/scholarships/admin/:id
   * Admin: Delete scholarship
   */
  public static async adminDeleteScholarship(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const result = await ScholarshipsService.adminDeleteScholarship(req.user!.id, id);
      ApiResponse.success(res, result, result.message);
    } catch (err) {
      next(err);
    }
  }
}
