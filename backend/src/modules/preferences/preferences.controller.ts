import { Request, Response, NextFunction } from 'express';
import { PreferencesService } from './preferences.service';
import { ApiResponse } from '../../shared/utils/api-response';

export class PreferencesController {
  /**
   * Save or update preferences for the authenticated student (Module 2)
   */
  public static async saveMyPreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ApiResponse.error(res, 'Authentication required', 401, 'Unauthorized');
        return;
      }

      const preference = await PreferencesService.savePreferences(req.user.id, req.body);
      ApiResponse.success(res, preference, 'Student preferences saved successfully');
    } catch (error: any) {
      if (error.message && error.message.includes('Module 1')) {
        ApiResponse.error(res, error.message, 400, 'Profile Required');
        return;
      }
      next(error);
    }
  }

  /**
   * Get current authenticated student's preferences
   */
  public static async getMyPreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ApiResponse.error(res, 'Authentication required', 401, 'Unauthorized');
        return;
      }

      const preference = await PreferencesService.getPreferencesByUserId(req.user.id);
      ApiResponse.success(
        res,
        preference,
        preference ? 'Student preferences retrieved successfully' : 'No preferences saved yet'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get student preferences by Student Profile ID (for Counsellor / Admin inspection)
   */
  public static async getPreferencesByProfileId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentProfileId } = req.params;
      const preference = await PreferencesService.getPreferencesByProfileId(studentProfileId);
      ApiResponse.success(
        res,
        preference,
        preference ? 'Student preferences retrieved' : 'No preferences saved for this student profile yet'
      );
    } catch (error) {
      next(error);
    }
  }
}
