import { apiClient, ApiResponse } from '../../../shared/services/api-client';
import { API_ENDPOINTS } from '../../../config/api.config';
import { StudentEducationInput, StudentEducationRecord } from '../education.types';

export class EducationService {
  /**
   * Save or create education details for authenticated student (Module 3)
   */
  public static async saveEducation(
    data: StudentEducationInput
  ): Promise<ApiResponse<StudentEducationRecord>> {
    return apiClient.post<StudentEducationRecord>(API_ENDPOINTS.EDUCATION.ME, data);
  }

  /**
   * Update education details for authenticated student (Module 3)
   */
  public static async updateEducation(
    data: StudentEducationInput
  ): Promise<ApiResponse<StudentEducationRecord>> {
    return apiClient.put<StudentEducationRecord>(API_ENDPOINTS.EDUCATION.ME, data);
  }

  /**
   * Get current authenticated student's saved education details
   */
  public static async getMyEducation(): Promise<ApiResponse<StudentEducationRecord | null>> {
    return apiClient.get<StudentEducationRecord | null>(API_ENDPOINTS.EDUCATION.ME);
  }

  /**
   * Get student education details by Profile ID (for Counsellor / Admin review)
   */
  public static async getEducationByProfileId(
    profileId: string
  ): Promise<ApiResponse<StudentEducationRecord | null>> {
    return apiClient.get<StudentEducationRecord | null>(
      API_ENDPOINTS.EDUCATION.BY_PROFILE_ID(profileId)
    );
  }
}
