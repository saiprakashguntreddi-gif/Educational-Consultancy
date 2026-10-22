import { Request, Response, NextFunction } from 'express';
import { CounsellorService } from './counsellor.service';
import { ApiResponse } from '../../shared/utils/api-response';

export class CounsellorController {
  public static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const counsellorId = req.user!.id;
      const data = await CounsellorService.getCounsellorDashboard(counsellorId);
      return ApiResponse.success(res, data, 'Counsellor dashboard metrics loaded');
    } catch (err) {
      return next(err);
    }
  }

  public static async listStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const counsellorId = req.user!.id;
      const query = req.query as any;
      const data = await CounsellorService.listAssignedStudents(counsellorId, query);
      return ApiResponse.success(res, data, 'Assigned students retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }

  public static async getStudent360(req: Request, res: Response, next: NextFunction) {
    try {
      const profileId = req.params.profileId;
      const requestingUser = { userId: req.user!.id, role: req.user!.role };
      const data = await CounsellorService.getStudent360(profileId, requestingUser);
      return ApiResponse.success(res, data, 'Student 360-degree overview retrieved');
    } catch (err: any) {
      if (err.message === 'FORBIDDEN_IDOR') {
        return ApiResponse.error(
          res,
          'Access forbidden. You are not authorized to view this student.',
          403,
          'Forbidden'
        );
      }
      if (err.message === 'Student profile not found') {
        return ApiResponse.error(res, 'Student profile not found', 404, 'Not Found');
      }
      return next(err);
    }
  }

  public static async createStudentAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const staffUserId = req.user!.id;
      const staffRole = req.user!.role;
      const data = await CounsellorService.createStudentAccount(staffUserId, staffRole, req.body);
      return ApiResponse.created(res, data, 'Student account created and authenticated successfully');
    } catch (err: any) {
      if (err.message?.includes('already exists')) {
        return ApiResponse.error(res, err.message, 400);
      }
      return next(err);
    }
  }

  public static async claimStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const profileId = req.params.profileId;
      const counsellorId = req.user!.id;
      const data = await CounsellorService.claimStudent(profileId, counsellorId);
      return ApiResponse.success(res, data, 'Student successfully claimed to your guidance roster');
    } catch (err: any) {
      if (err.message?.includes('already assigned')) {
        return ApiResponse.error(res, err.message, 400);
      }
      return next(err);
    }
  }

  public static async getActionPlans(req: Request, res: Response, next: NextFunction) {
    try {
      const profileId = req.params.profileId;
      const requestingUser = { userId: req.user!.id, role: req.user!.role };
      const data = await CounsellorService.getActionPlans(profileId, requestingUser);
      return ApiResponse.success(res, data, 'Action plan items retrieved');
    } catch (err: any) {
      if (err.message === 'FORBIDDEN_IDOR') {
        return ApiResponse.error(res, 'Access denied to this student action plan', 403, 'Forbidden');
      }
      return next(err);
    }
  }

  public static async createActionPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const profileId = req.params.profileId;
      const counsellorId = req.user!.id;
      const data = await CounsellorService.createActionPlan(profileId, counsellorId, req.body);
      return ApiResponse.created(res, data, 'Action plan milestone created');
    } catch (err) {
      return next(err);
    }
  }

  public static async updateActionPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const itemId = req.params.itemId;
      const counsellorId = req.user!.id;
      const role = req.user!.role;
      const data = await CounsellorService.updateActionPlan(itemId, counsellorId, role, req.body);
      return ApiResponse.success(res, data, 'Action plan milestone updated');
    } catch (err: any) {
      if (err.message === 'FORBIDDEN_IDOR') {
        return ApiResponse.error(res, 'Access denied to modify this action plan item', 403, 'Forbidden');
      }
      return next(err);
    }
  }

  public static async deleteActionPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const itemId = req.params.itemId;
      const counsellorId = req.user!.id;
      const role = req.user!.role;
      const data = await CounsellorService.deleteActionPlan(itemId, counsellorId, role);
      return ApiResponse.success(res, data, 'Action plan milestone removed');
    } catch (err: any) {
      if (err.message === 'FORBIDDEN_IDOR') {
        return ApiResponse.error(res, 'Access denied to delete this action plan item', 403, 'Forbidden');
      }
      return next(err);
    }
  }

  public static async getNotes(req: Request, res: Response, next: NextFunction) {
    try {
      const profileId = req.params.profileId;
      const requestingUser = { userId: req.user!.id, role: req.user!.role };
      const data = await CounsellorService.getNotes(profileId, requestingUser);
      return ApiResponse.success(res, data, 'Counsellor notes retrieved');
    } catch (err: any) {
      if (err.message === 'FORBIDDEN_IDOR') {
        return ApiResponse.error(res, 'Access denied to this student notes', 403, 'Forbidden');
      }
      return next(err);
    }
  }

  public static async createNote(req: Request, res: Response, next: NextFunction) {
    try {
      const profileId = req.params.profileId;
      const counsellorId = req.user!.id;
      const data = await CounsellorService.createNote(profileId, counsellorId, req.body);
      return ApiResponse.created(res, data, 'Counsellor note recorded');
    } catch (err) {
      return next(err);
    }
  }

  public static async exportStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const counsellorId = req.user!.id;
      const csv = await CounsellorService.exportAssignedStudentsCsv(counsellorId);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="assigned-students.csv"');
      return res.status(200).send(csv);
    } catch (err) {
      return next(err);
    }
  }
}
