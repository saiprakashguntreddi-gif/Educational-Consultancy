import { Request, Response, NextFunction } from 'express';
import { PersonalService } from './personal.service';
import { ApiResponse } from '../../shared/utils/api-response';

export class PersonalController {
  /**
   * GET /api/v1/personal/me
   */
  static async getMyPersonal(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = await PersonalService.getPersonalData(userId);
      return ApiResponse.success(res, data, 'Personal information retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PUT /api/v1/personal/me/contact-guardian
   */
  static async updateContactGuardian(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const ip = req.ip;
      const updated = await PersonalService.updateContactAndGuardian(userId, req.body, ip);
      return ApiResponse.success(res, updated, 'Contact and guardian information updated successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/v1/personal/me/activities
   */
  static async addActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const ip = req.ip;
      const activity = await PersonalService.addActivity(userId, req.body, ip);
      return ApiResponse.success(res, activity, 'Extracurricular activity added successfully', 201);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PUT /api/v1/personal/me/activities/:id
   */
  static async updateActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const ip = req.ip;
      const updated = await PersonalService.updateActivity(userId, req.params.id, req.body, ip);
      return ApiResponse.success(res, updated, 'Extracurricular activity updated successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * DELETE /api/v1/personal/me/activities/:id
   */
  static async deleteActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const ip = req.ip;
      await PersonalService.deleteActivity(userId, req.params.id, ip);
      return ApiResponse.success(res, { deleted: true }, 'Extracurricular activity deleted successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/v1/personal/me/achievements
   */
  static async addAchievement(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const ip = req.ip;
      const achievement = await PersonalService.addAchievement(userId, req.body, ip);
      return ApiResponse.success(res, achievement, 'Achievement recorded successfully', 201);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PUT /api/v1/personal/me/achievements/:id
   */
  static async updateAchievement(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const ip = req.ip;
      const updated = await PersonalService.updateAchievement(userId, req.params.id, req.body, ip);
      return ApiResponse.success(res, updated, 'Achievement record updated successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * DELETE /api/v1/personal/me/achievements/:id
   */
  static async deleteAchievement(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const ip = req.ip;
      await PersonalService.deleteAchievement(userId, req.params.id, ip);
      return ApiResponse.success(res, { deleted: true }, 'Achievement deleted successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/v1/personal/profile/:studentProfileId (Staff Review)
   */
  static async getPersonalByProfileId(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await PersonalService.getPersonalDataByProfileId(req.params.studentProfileId);
      return ApiResponse.success(res, data, 'Student personal information reviewed successfully');
    } catch (err) {
      return next(err);
    }
  }
}
