import { apiClient, ApiResponse } from '../../../shared/services/api-client';
import { API_ENDPOINTS } from '../../../config/api.config';
import {
  AppointmentsMetaResponse,
  AppointmentDto,
  BookAppointmentInput,
  WebinarDto,
  ShortlistedCollegeDto,
} from '../appointments.types';

export class AppointmentsService {
  /**
   * 1. Get metadata (counsellor directory, available types, modes, time slots, shortlist context)
   */
  public static async getMeta(): Promise<ApiResponse<AppointmentsMetaResponse>> {
    return apiClient.get<AppointmentsMetaResponse>(API_ENDPOINTS.APPOINTMENTS.META);
  }

  /**
   * 2. Get student's appointments
   */
  public static async getMyAppointments(): Promise<ApiResponse<AppointmentDto[]>> {
    return apiClient.get<AppointmentDto[]>(API_ENDPOINTS.APPOINTMENTS.MY_APPOINTMENTS);
  }

  /**
   * 3. Book a new appointment
   */
  public static async bookAppointment(
    input: BookAppointmentInput
  ): Promise<ApiResponse<AppointmentDto>> {
    return apiClient.post<AppointmentDto>(API_ENDPOINTS.APPOINTMENTS.BOOK, input);
  }

  /**
   * 4. Cancel an appointment
   */
  public static async cancelAppointment(
    id: string,
    cancellationReason?: string
  ): Promise<ApiResponse<AppointmentDto>> {
    return apiClient.patch<AppointmentDto>(API_ENDPOINTS.APPOINTMENTS.CANCEL(id), {
      cancellationReason,
    });
  }

  /**
   * 5. List webinars
   */
  public static async listWebinars(): Promise<ApiResponse<WebinarDto[]>> {
    return apiClient.get<WebinarDto[]>(API_ENDPOINTS.APPOINTMENTS.WEBINARS);
  }

  /**
   * 6. Register for a webinar
   */
  public static async registerWebinar(
    webinarId: string
  ): Promise<ApiResponse<{ registered: boolean; webinar: WebinarDto }>> {
    return apiClient.post<{ registered: boolean; webinar: WebinarDto }>(
      API_ENDPOINTS.APPOINTMENTS.REGISTER_WEBINAR(webinarId)
    );
  }

  /**
   * 7. Cancel webinar registration
   */
  public static async cancelWebinarRegistration(
    webinarId: string
  ): Promise<ApiResponse<{ cancelled: boolean; webinar: WebinarDto }>> {
    return apiClient.post<{ cancelled: boolean; webinar: WebinarDto }>(
      API_ENDPOINTS.APPOINTMENTS.CANCEL_WEBINAR_REGISTRATION(webinarId)
    );
  }

  /**
   * 8. List student's shortlisted colleges
   */
  public static async listShortlistedColleges(): Promise<ApiResponse<ShortlistedCollegeDto[]>> {
    return apiClient.get<ShortlistedCollegeDto[]>(API_ENDPOINTS.APPOINTMENTS.SHORTLISTS);
  }

  /**
   * 9. Toggle shortlist status for an institution
   */
  public static async toggleShortlist(payload: {
    institutionId: string;
    action?: 'ADD' | 'REMOVE';
    notes?: string;
    priority?: 'HIGH' | 'MEDIUM' | 'LOW';
    fitCategory?: 'DREAM' | 'REACH' | 'SAFE' | 'TARGET';
  }): Promise<ApiResponse<{ action: string; shortlists: ShortlistedCollegeDto[] }>> {
    return apiClient.post<{ action: string; shortlists: ShortlistedCollegeDto[] }>(
      API_ENDPOINTS.APPOINTMENTS.TOGGLE_SHORTLIST,
      payload
    );
  }

  /**
   * 10. Get schedule for logged in counsellor
   */
  public static async getCounsellorSchedule(): Promise<ApiResponse<any[]>> {
    return apiClient.get(API_ENDPOINTS.APPOINTMENTS.COUNSELLOR_SCHEDULE);
  }

  /**
   * 11. Counsellor accepts, reschedules or rejects appointment
   */
  public static async updateCounsellorAppointmentStatus(
    id: string,
    payload: {
      status: 'CONFIRMED' | 'RESCHEDULED' | 'CANCELLED';
      reason?: string;
      scheduledDate?: string;
      timeSlot?: string;
      meetingLocation?: string;
    }
  ): Promise<ApiResponse<any>> {
    return apiClient.patch(API_ENDPOINTS.APPOINTMENTS.UPDATE_COUNSELLOR_STATUS(id), payload);
  }

  /**
   * 12. Complete session and record outcome, recommendations, student interest report, and send policy link
   */
  public static async recordSessionOutcome(
    id: string,
    payload: {
      actualStartTime?: string;
      actualEndTime?: string;
      durationMinutes?: number;
      sessionOutcome: string;
      recommendations?: string;
      followUpRequired?: boolean;
      nextAction?: string;
      followUpActions?: string;
      privateCounsellorNotes?: string;
      studentInterest?: 'INTERESTED' | 'NOT_INTERESTED' | 'UNDECIDED';
      targetStream?: string;
      targetDepartments?: string;
      targetColleges?: string;
      targetCity?: string;
      studyScope?: 'DOMESTIC' | 'INTERNATIONAL' | 'BOTH';
      detailedInterestReport?: string;
      sendPolicyViaWhatsApp?: boolean;
    }
  ): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.APPOINTMENTS.RECORD_SESSION_OUTCOME(id), payload);
  }

  /**
   * 13. Dynamic unbooked slots for assigned counsellor on a date
   */
  public static async getCounsellorAvailableSlots(
    counsellorId: string,
    date: string
  ): Promise<ApiResponse<{ date: string; slots: { timeSlot: string; isAvailable: boolean; isBooked: boolean }[] }>> {
    return apiClient.get(API_ENDPOINTS.APPOINTMENTS.AVAILABLE_SLOTS(counsellorId, date));
  }

  /**
   * 14. Counsellor: Update or override free availability slots for a date
   */
  public static async setCounsellorSlots(
    date: string,
    timeSlots: string[]
  ): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.APPOINTMENTS.SET_COUNSELLOR_SLOTS, { date, timeSlots });
  }

  /**
   * 15. Counsellor: Send appointment reminder via WhatsApp or SMS before meeting
   */
  public static async sendAppointmentReminder(
    appointmentId: string,
    method: 'WHATSAPP' | 'SMS' = 'WHATSAPP'
  ): Promise<ApiResponse<{
    success: boolean;
    message: string;
    reminderSentAt: string;
    reminderSentVia: string;
    phone: string;
    whatsappLink: string;
    smsText: string;
  }>> {
    return apiClient.post(API_ENDPOINTS.APPOINTMENTS.SEND_REMINDER(appointmentId), { method });
  }

  /**
   * 16. Student or Staff: Confirm consultancy enrollment & policy agreement
   */
  public static async enrollStudent(payload?: {
    studentProfileId?: string;
    counsellorId?: string;
    targetCollege?: string;
    targetStream?: string;
    agreementSigned?: boolean;
  }): Promise<ApiResponse<any>> {
    return apiClient.post(API_ENDPOINTS.APPOINTMENTS.ENROLL_STUDENT, payload || { agreementSigned: true });
  }

  /**
   * 17. Student: Get current enrollment and policy status
   */
  public static async getEnrollmentStatus(): Promise<ApiResponse<{
    isEnrolled: boolean;
    enrolledAt: string | null;
    policyAgreed: boolean;
    policyAgreedAt: string | null;
    assignedCounsellor: any;
    enrollment: any;
  }>> {
    return apiClient.get(API_ENDPOINTS.APPOINTMENTS.ENROLLMENT_STATUS);
  }
}


