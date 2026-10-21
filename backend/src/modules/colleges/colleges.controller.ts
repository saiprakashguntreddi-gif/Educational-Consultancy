import { Request, Response, NextFunction } from 'express';
import { CollegesService } from './colleges.service';
import { ApiResponse } from '../../shared/utils/api-response';

export class CollegesController {
  // =========================================================================
  // PUBLIC / STUDENT / COUNSELLOR DISCOVERY APIS
  // =========================================================================

  /**
   * GET /api/v1/colleges (Discover & Filter Published Institutions)
   */
  static async listColleges(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const result = await CollegesService.listColleges(req.query, userId);
      return ApiResponse.success(res, result, 'Institutions retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/v1/colleges/:id (Institution Details - Published Only)
   */
  static async getCollegeById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const data = await CollegesService.getCollegeById(req.params.id, userId);
      return ApiResponse.success(res, data, 'Institution profile retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/v1/colleges/courses/:courseId (Course Details - Published Only)
   */
  static async getCourseById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const data = await CollegesService.getCourseById(req.params.courseId, userId);
      return ApiResponse.success(res, data, 'Course details retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/v1/colleges/saved/me (Student's Saved Colleges & Courses)
   */
  static async getSaved(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = await CollegesService.getSavedCollegesAndCourses(userId);
      return ApiResponse.success(res, data, 'Saved items retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/v1/colleges/saved/institutions/:id (Save College)
   */
  static async saveInstitution(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await CollegesService.saveInstitution(
        userId,
        req.params.id,
        req.body?.notes,
        req.ip
      );
      return ApiResponse.success(res, result, 'Institution saved to your shortlist');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * DELETE /api/v1/colleges/saved/institutions/:id (Unsave College)
   */
  static async unsaveInstitution(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await CollegesService.unsaveInstitution(userId, req.params.id, req.ip);
      return ApiResponse.success(res, result, 'Institution removed from saved list');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/v1/colleges/saved/courses/:courseId (Save Course)
   */
  static async saveCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await CollegesService.saveCourse(
        userId,
        req.params.courseId,
        req.body?.notes,
        req.ip
      );
      return ApiResponse.success(res, result, 'Course saved to your shortlist');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * DELETE /api/v1/colleges/saved/courses/:courseId (Unsave Course)
   */
  static async unsaveCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await CollegesService.unsaveCourse(userId, req.params.courseId, req.ip);
      return ApiResponse.success(res, result, 'Course removed from saved list');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/v1/colleges/compare/me (Student Comparison Matrix)
   */
  static async getComparison(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = await CollegesService.getComparisonMatrix(userId);
      return ApiResponse.success(res, data, 'Comparison set retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/v1/colleges/compare/:id (Add College to Comparison)
   */
  static async addToComparison(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await CollegesService.addToComparison(userId, req.params.id, req.ip);
      return ApiResponse.success(res, result, 'Institution added to comparison');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * DELETE /api/v1/colleges/compare/:id (Remove College from Comparison)
   */
  static async removeFromComparison(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await CollegesService.removeFromComparison(userId, req.params.id, req.ip);
      return ApiResponse.success(res, result, 'Institution removed from comparison');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * DELETE /api/v1/colleges/compare (Clear Comparison)
   */
  static async clearComparison(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await CollegesService.clearComparison(userId, req.ip);
      return ApiResponse.success(res, result, 'Comparison cleared successfully');
    } catch (err) {
      return next(err);
    }
  }

  // =========================================================================
  // ADMIN & CONTENT MANAGEMENT CONTROLLERS
  // =========================================================================

  /**
   * GET /api/v1/colleges/admin/all (Admin Catalogue List with Metrics)
   */
  static async adminListColleges(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CollegesService.adminListColleges(req.query);
      return ApiResponse.success(res, result, 'Admin catalogue list retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/v1/colleges/admin/:id (Admin Single College Profile)
   */
  static async adminGetCollegeById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await CollegesService.adminGetCollegeById(req.params.id);
      return ApiResponse.success(res, data, 'Admin institution details retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/v1/colleges/admin (Admin Add College)
   */
  static async adminCreateCollege(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const created = await CollegesService.adminCreateCollege(userId, req.body, req.ip);
      return ApiResponse.created(res, created, 'Institution created successfully in catalogue');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PUT /api/v1/colleges/admin/:id (Admin Update College)
   */
  static async adminUpdateCollege(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const updated = await CollegesService.adminUpdateCollege(userId, req.params.id, req.body, req.ip);
      return ApiResponse.success(res, updated, 'Institution updated successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PATCH /api/v1/colleges/admin/:id/publish (Admin Publish / Unpublish College)
   */
  static async adminSetPublishStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { isPublished, status } = req.body;
      const result = await CollegesService.adminSetPublishStatus(userId, req.params.id, isPublished, status, req.ip);
      const actionText = isPublished ? 'published' : 'unpublished';
      return ApiResponse.success(res, result, `Institution successfully ${actionText}`);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PATCH /api/v1/colleges/admin/:id/verify (Admin Verify College)
   */
  static async adminSetVerifyStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { isVerified } = req.body;
      const result = await CollegesService.adminSetVerifyStatus(userId, req.params.id, isVerified, req.ip);
      const actionText = isVerified ? 'verified' : 'marked unverified';
      return ApiResponse.success(res, result, `Institution ${actionText}`);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PATCH /api/v1/colleges/admin/:id/archive (Admin Archive College)
   */
  static async adminArchiveCollege(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await CollegesService.adminArchiveCollege(userId, req.params.id, req.ip);
      return ApiResponse.success(res, result, 'Institution successfully archived');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/v1/colleges/admin/:id/courses (Admin Add Course)
   */
  static async adminCreateCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const created = await CollegesService.adminCreateCourse(userId, req.params.id, req.body, req.ip);
      return ApiResponse.created(res, created, 'Course program created successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PUT /api/v1/colleges/admin/courses/:courseId (Admin Update Course)
   */
  static async adminUpdateCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const updated = await CollegesService.adminUpdateCourse(userId, req.params.courseId, req.body, req.ip);
      return ApiResponse.success(res, updated, 'Course program updated successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PATCH /api/v1/colleges/admin/courses/:courseId/publish (Admin Publish / Unpublish Course)
   */
  static async adminSetCoursePublishStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { isPublished } = req.body;
      const result = await CollegesService.adminSetCoursePublishStatus(userId, req.params.courseId, isPublished, req.ip);
      const actionText = isPublished ? 'published' : 'unpublished';
      return ApiResponse.success(res, result, `Course program ${actionText}`);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * DELETE /api/v1/colleges/admin/courses/:courseId (Admin Delete Course)
   */
  static async adminDeleteCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await CollegesService.adminDeleteCourse(userId, req.params.courseId, req.ip);
      return ApiResponse.success(res, result, 'Course program removed from catalogue');
    } catch (err) {
      return next(err);
    }
  }
}
