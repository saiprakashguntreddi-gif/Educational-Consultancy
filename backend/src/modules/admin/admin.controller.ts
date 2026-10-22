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
      const { counsellorId } = req.body;
      const adminUserId = req.user!.id;
      const data = await AdminService.assignCounsellor(profileId, counsellorId, adminUserId);
      return ApiResponse.success(
        res,
        data,
        counsellorId ? 'Counsellor assigned to student successfully' : 'Student unassigned successfully'
      );
    } catch (err: any) {
      if (err.message?.includes('not found') || err.message?.includes('not a valid')) {
        return ApiResponse.error(res, err.message, 400);
      }
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
}
