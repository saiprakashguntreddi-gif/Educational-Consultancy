import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service';
import { ApiResponse } from '../../shared/utils/api-response';

export class AdminController {
  public static async getDashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getAdminDashboard();
      return ApiResponse.success(res, data, 'Platform admin dashboard metrics loaded');
    } catch (err) {
      return next(err);
    }
  }

  public static async listAllStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as any;
      const data = await AdminService.listAllStudents(query);
      return ApiResponse.success(res, data, 'Platform students retrieved');
    } catch (err) {
      return next(err);
    }
  }

  public static async assignCounsellor(req: Request, res: Response, next: NextFunction) {
    try {
      const profileId = req.params.profileId;
      const { counsellorId, reason } = req.body;
      const adminUserId = req.user!.id;
      const data = await AdminService.assignCounsellor(profileId, counsellorId, adminUserId, reason);
      return ApiResponse.success(
        res,
        data,
        counsellorId ? 'Counsellor assigned to student successfully' : 'Student unassigned successfully'
      );
    } catch (err: any) {
      if (
        err.message?.includes('not found') ||
        err.message?.includes('not a valid') ||
        err.message?.includes('Cannot assign')
      ) {
        return ApiResponse.error(res, err.message, 400);
      }
      return next(err);
    }
  }

  public static async getStudentAssignmentHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const profileId = req.params.profileId;
      const data = await AdminService.getStudentAssignmentHistory(profileId);
      return ApiResponse.success(res, data, 'Student assignment history retrieved');
    } catch (err) {
      return next(err);
    }
  }

  public static async createCounsellor(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUserId = req.user!.id;
      const data = await AdminService.createCounsellor(req.body, adminUserId);
      return ApiResponse.success(res, data, 'Counsellor account created and configured successfully', 201);
    } catch (err: any) {
      if (err.statusCode === 409) {
        return ApiResponse.error(res, err.message, 409);
      }
      return next(err);
    }
  }

  public static async updateCounsellor(req: Request, res: Response, next: NextFunction) {
    try {
      const counsellorId = req.params.counsellorId;
      const adminUserId = req.user!.id;
      const data = await AdminService.updateCounsellor(counsellorId, req.body, adminUserId);
      return ApiResponse.success(res, data, 'Counsellor professional details updated');
    } catch (err: any) {
      if (err.message?.includes('not found')) {
        return ApiResponse.error(res, err.message, 404);
      }
      return next(err);
    }
  }

  public static async updateCounsellorStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const counsellorId = req.params.counsellorId;
      const { status, notes } = req.body;
      const adminUserId = req.user!.id;
      const data = await AdminService.updateCounsellorStatus(counsellorId, status, adminUserId, notes);
      return ApiResponse.success(res, data, `Counsellor status updated to ${status}`);
    } catch (err: any) {
      if (err.message?.includes('not found')) {
        return ApiResponse.error(res, err.message, 404);
      }
      return next(err);
    }
  }

  public static async updateCounsellorSkills(req: Request, res: Response, next: NextFunction) {
    try {
      const counsellorId = req.params.counsellorId;
      const adminUserId = req.user!.id;
      const data = await AdminService.updateCounsellorSkills(counsellorId, req.body, adminUserId);
      return ApiResponse.success(res, data, 'Counsellor competencies and skills updated');
    } catch (err: any) {
      if (err.message?.includes('not found')) {
        return ApiResponse.error(res, err.message, 404);
      }
      return next(err);
    }
  }

  public static async listSessionAudits(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as any;
      const data = await AdminService.listSessionAudits(query);
      return ApiResponse.success(res, data, 'Counselling session audit records retrieved');
    } catch (err) {
      return next(err);
    }
  }

  public static async getCounsellorPerformance(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getCounsellorPerformance();
      return ApiResponse.success(res, data, 'Counsellor performance leaderboard retrieved');
    } catch (err) {
      return next(err);
    }
  }

  public static async awardCounsellorPoints(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { points, reason } = req.body;
      const adminUserId = (req as any).user?.id || 'system-admin';
      const data = await AdminService.awardCounsellorPoints(id, Number(points) || 1, reason || 'Performance promotion', adminUserId);
      return ApiResponse.success(res, data, data.message);
    } catch (err) {
      return next(err);
    }
  }

  public static async listCounsellors(_req: Request, res: Response, next: NextFunction) {

    try {
      const data = await AdminService.listCounsellors();
      return ApiResponse.success(res, data, 'Counsellor directory retrieved');
    } catch (err) {
      return next(err);
    }
  }

  public static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as any;
      const data = await AdminService.getAuditLogs(query);
      return ApiResponse.success(res, data, 'Audit logs retrieved');
    } catch (err) {
      return next(err);
    }
  }

  public static async exportStudents(_req: Request, res: Response, next: NextFunction) {
    try {
      const csv = await AdminService.exportAllStudentsCsv();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="all-students-platform.csv"');
      return res.status(200).send(csv);
    } catch (err) {
      return next(err);
    }
  }

  public static async listApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as any;
      const data = await AdminService.listAllApplications(query);
      return ApiResponse.success(res, data, 'Platform applications retrieved');
    } catch (err) {
      return next(err);
    }
  }
}

