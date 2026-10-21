import { apiClient, ApiResponse } from '../../../shared/services/api-client';
import { API_ENDPOINTS } from '../../../config/api.config';
import { StudentPreferenceInput, StudentPreferenceRecord } from '../preferences.types';

export class PreferencesService {
  /**
   * Save or update preferences for authenticated student (Module 2)
   */
  public static async savePreferences(
    data: StudentPreferenceInput
  ): Promise<ApiResponse<StudentPreferenceRecord>> {
    return apiClient.post<StudentPreferenceRecord>(API_ENDPOINTS.PREFERENCES.ME, data);
  }

  /**
   * Get current authenticated student's saved preferences
   */
  public static async getMyPreferences(): Promise<ApiResponse<StudentPreferenceRecord | null>> {
    return apiClient.get<StudentPreferenceRecord | null>(API_ENDPOINTS.PREFERENCES.ME);
  }

  /**
   * Get student preferences by Profile ID (for Counsellor / Admin review)
   */
  public static async getPreferencesByProfileId(
    profileId: string
  ): Promise<ApiResponse<StudentPreferenceRecord | null>> {
    return apiClient.get<StudentPreferenceRecord | null>(
      API_ENDPOINTS.PREFERENCES.BY_PROFILE_ID(profileId)
    );
  }
}
