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

  /**
   * GET /api/v1/appointments/counsellor/schedule
   * Get all appointments for the logged in counsellor
   */
  public static async getCounsellorSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const counsellorId = getUserId(req);
      const data = await AppointmentsService.getCounsellorSchedule(counsellorId);
      return ApiResponse.success(res, data, 'Counsellor appointment schedule retrieved');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * PATCH /api/v1/appointments/:id/counsellor-status
   * Counsellor: Accept, Reschedule, or Cancel an appointment
   */
  public static async updateAppointmentStatusByCounsellor(req: Request, res: Response, next: NextFunction) {
    try {
      const counsellorId = getUserId(req);
      const appointmentId = req.params.id;
      const userRole = (req as any).user?.role;
      const data = await AppointmentsService.updateAppointmentStatusByCounsellor(
        counsellorId,
        appointmentId,
        req.body,
        userRole
      );
      return ApiResponse.success(res, data, `Appointment status updated to ${data.status}`);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/v1/appointments/:id/session-outcome
   * Counsellor: Complete meeting, record session outcome, notes, recommendations, and follow-up
   */
  public static async recordSessionOutcome(req: Request, res: Response, next: NextFunction) {
    try {
      const counsellorId = getUserId(req);
      const appointmentId = req.params.id;
      const userRole = (req as any).user?.role;
      const data = await AppointmentsService.recordSessionOutcome(
        counsellorId,
        appointmentId,
        req.body,
        userRole
      );
      return ApiResponse.success(res, data, 'Counselling session completed and outcome recorded successfully');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/v1/appointments/counsellor/:counsellorId/available-slots
   * Retrieve dynamic unbooked slots for a counsellor on a specific date
   */
  public static async getCounsellorAvailableSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const { counsellorId } = req.params;
      const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
      const data = await AppointmentsService.getCounsellorAvailableSlots(counsellorId, date);
      return ApiResponse.success(res, data, 'Available counsellor slots retrieved');
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/v1/appointments/counsellor/slots
   * Counsellor: Update or override available slots for a date
   */
  public static async setCounsellorAvailabilitySlots(req: Request, res: Response, next: NextFunction) {
    try {
      const counsellorId = getUserId(req);
      const { date, timeSlots } = req.body;
      const data = await AppointmentsService.setCounsellorAvailabilitySlots(counsellorId, date, timeSlots);
      return ApiResponse.success(res, data, data.message);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/v1/appointments/:id/send-reminder
   * Counsellor: Send WhatsApp or SMS reminder before starting meeting
   */
  public static async sendAppointmentReminder(req: Request, res: Response, next: NextFunction) {
    try {
      const counsellorId = getUserId(req);
      const appointmentId = req.params.id;
      const { method } = req.body;
      const userRole = (req as any).user?.role;
      const data = await AppointmentsService.sendAppointmentReminder(
        counsellorId,
        appointmentId,
        method || 'WHATSAPP',
        userRole
      );
      return ApiResponse.success(res, data, data.message);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/v1/appointments/enroll
   * Enroll student with consultancy and award 1 point to assigned counsellor
   */
  public static async enrollStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req);
      const userRole = (req as any).user?.role;
      const data = await AppointmentsService.enrollStudent(userId, req.body, userRole);
      return ApiResponse.success(res, data, data.message);
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/v1/appointments/enrollment-status
   * Get student's enrollment and policy agreement status
   */
  public static async getEnrollmentStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req);
      const data = await AppointmentsService.getEnrollmentStatus(userId);
      return ApiResponse.success(res, data, 'Enrollment status retrieved');
    } catch (err) {
      return next(err);
    }
  }
}

