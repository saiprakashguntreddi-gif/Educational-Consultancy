import { apiClient, ApiResponse } from '../../../shared/services/api-client';
import { API_ENDPOINTS } from '../../../config/api.config';
import { StudentProfileIntakeInput, StudentProfileRecord, VerificationStatus } from '../profile.types';

export class ProfileService {
  /**
   * Submit or update student profile intake (Module 1)
   */
  public static async submitIntake(
    data: StudentProfileIntakeInput
  ): Promise<ApiResponse<StudentProfileRecord>> {
    return apiClient.post<StudentProfileRecord>(API_ENDPOINTS.PROFILE.INTAKE, data);
  }

  /**
   * Fetch current authenticated student's profile
   */
  public static async getMyProfile(): Promise<ApiResponse<StudentProfileRecord>> {
    return apiClient.get<StudentProfileRecord>(API_ENDPOINTS.PROFILE.ME);
  }

  /**
   * Fetch authenticated student's verified record & guidance clearance
   * Server-side gated: Requires VERIFIED status (returns 403 if PENDING or REJECTED)
   */
  public static async getVerifiedRecord(): Promise<ApiResponse<{ record: StudentProfileRecord; clearance: any }>> {
    return apiClient.get(API_ENDPOINTS.PROFILE.VERIFIED_RECORD);
  }

  /**
   * Fetch student profiles for review (Counsellor / Admin)
   */
  public static async listProfiles(params?: {
    page?: number;
    limit?: number;
    status?: VerificationStatus;
  }): Promise<ApiResponse<{ profiles: StudentProfileRecord[]; total: number; page: number; totalPages: number }>> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.status) query.set('status', params.status);

    const url = `${API_ENDPOINTS.PROFILE.REVIEW}?${query.toString()}`;
    return apiClient.get(url);
  }

  /**
   * Update student verification status (Counsellor / Admin)
   */
  public static async verifyProfile(
    profileId: string,
    status: VerificationStatus,
    notes?: string
  ): Promise<ApiResponse<StudentProfileRecord>> {
    return apiClient.patch<StudentProfileRecord>(API_ENDPOINTS.PROFILE.VERIFY(profileId), {
      status,
      notes,
    });
  }
}
