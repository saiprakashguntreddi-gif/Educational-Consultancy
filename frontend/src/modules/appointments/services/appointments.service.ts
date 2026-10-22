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
}
