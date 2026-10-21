import { Request, Response, NextFunction } from 'express';
import { EducationService } from './education.service';
import { ApiResponse } from '../../shared/utils/api-response';

export class EducationController {
  /**
   * POST/PUT /api/v1/education/me
   * Authenticated student saves or updates their education details.
   */
  static async saveMyEducation(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const ipAddress = req.ip || req.socket.remoteAddress;

      const result = await EducationService.saveOrUpdateEducation(
        userId,
        req.body,
        ipAddress
      );

      ApiResponse.success(
        res,
        result,
        'Education details saved successfully',
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/education/me
   * Authenticated student retrieves their education details.
   */
  static async getMyEducation(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      const result = await EducationService.getEducationByUserId(userId);

      ApiResponse.success(
        res,
        result,
        result
          ? 'Education details retrieved successfully'
          : 'No education details recorded yet'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/education/profile/:studentProfileId
   * Counsellors and Admins inspect education details of a student.
   */
  static async getEducationByProfileId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { studentProfileId } = req.params;
      const result = await EducationService.getEducationByProfileId(
        studentProfileId
      );

      ApiResponse.success(
        res,
        result,
        result
          ? 'Student education details retrieved successfully'
          : 'No education details recorded for this student profile'
      );
    } catch (error) {
      next(error);
    }
  }
}
