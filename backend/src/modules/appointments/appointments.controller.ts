import { Request, Response, NextFunction } from 'express';
import { AppointmentsService } from './appointments.service';
import { ApiResponse } from '../../shared/utils/api-response';

const getUserId = (req: Request): string => {
  return (req as any).user?.id || (req as any).user?.userId || '';
};

export class AppointmentsController {
  /**
   * GET /api/v1/appointments/meta
   * Returns metadata: counsellors, appointment types, available slots, shortlisted college contexts
   */
  public static async getMeta(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req);
      const data = await AppointmentsService.getMeta(userId);
      return ApiResponse.success(res, data, 'Appointment metadata retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/v1/appointments/my-appointments
   * List all appointments for the authenticated student
   */
  public static async getMyAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req);
      const data = await AppointmentsService.getMyAppointments(userId);
      return ApiResponse.success(res, data, 'Student appointments retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/v1/appointments/book
   * Book a new 1-on-1 counselling session
   */
  public static async bookAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req);
      const data = await AppointmentsService.bookAppointment(userId, req.body);
      return ApiResponse.created(res, data, 'Appointment booked successfully. Confirmation details saved.');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PATCH /api/v1/appointments/:id/cancel
   * Cancel an upcoming appointment
   */
  public static async cancelAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const { reason } = req.body;
      const data = await AppointmentsService.cancelAppointment(userId, id, reason);
      return ApiResponse.success(res, data, 'Appointment cancelled successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/v1/appointments/webinars
   * List all published webinars with student registration status
   */
  public static async listWebinars(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req);
      const data = await AppointmentsService.listWebinars(userId);
      return ApiResponse.success(res, data, 'Webinars retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/v1/appointments/webinars/:id/register
   * Register authenticated student for a webinar
   */
  public static async registerWebinar(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const data = await AppointmentsService.registerWebinar(userId, id);
      return ApiResponse.success(res, data, data.message);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/v1/appointments/webinars/:id/cancel-registration
   * Cancel student's webinar registration
   */
  public static async cancelWebinarRegistration(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const data = await AppointmentsService.cancelWebinarRegistration(userId, id);
      return ApiResponse.success(res, data, data.message);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/v1/appointments/shortlists
   * List student's shortlisted colleges with Tier/Fit details
   */
  public static async listShortlists(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req);
      const data = await AppointmentsService.listShortlistedColleges(userId);
      return ApiResponse.success(res, data, 'Shortlisted colleges retrieved successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/v1/appointments/shortlists/toggle
   * Save / unsave college in student shortlist
   */
  public static async toggleShortlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req);
      const data = await AppointmentsService.toggleCollegeShortlist(userId, req.body);
      return ApiResponse.success(res, data, data.message);
    } catch (err) {
      return next(err);
    }
  }
}
