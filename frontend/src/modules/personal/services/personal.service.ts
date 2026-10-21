import { apiClient, ApiResponse } from '../../../shared/services/api-client';
import { API_ENDPOINTS } from '../../../config/api.config';
import {
  PersonalModuleData,
  UpdateContactGuardianInput,
  StudentActivityRecord,
  CreateActivityInput,
  UpdateActivityInput,
  StudentAchievementRecord,
  CreateAchievementInput,
  UpdateAchievementInput,
} from '../personal.types';

export class PersonalService {
  /**
   * Fetch authenticated student's personal information, guardian, activities, and achievements
   */
  public static async getMyPersonal(): Promise<ApiResponse<PersonalModuleData>> {
    return apiClient.get<PersonalModuleData>(API_ENDPOINTS.PERSONAL.ME);
  }

  /**
   * Update contact details and parent / guardian information
   */
  public static async updateContactGuardian(
    payload: UpdateContactGuardianInput
  ): Promise<ApiResponse<PersonalModuleData>> {
    return apiClient.put<PersonalModuleData>(
      API_ENDPOINTS.PERSONAL.UPDATE_CONTACT_GUARDIAN,
      payload
    );
  }

  /**
   * Add a new extracurricular activity
   */
  public static async addActivity(
    payload: CreateActivityInput
  ): Promise<ApiResponse<StudentActivityRecord>> {
    return apiClient.post<StudentActivityRecord>(API_ENDPOINTS.PERSONAL.ACTIVITIES, payload);
  }

  /**
   * Update an existing activity
   */
  public static async updateActivity(
    id: string,
    payload: UpdateActivityInput
  ): Promise<ApiResponse<StudentActivityRecord>> {
    return apiClient.put<StudentActivityRecord>(
      API_ENDPOINTS.PERSONAL.ACTIVITY_ITEM(id),
      payload
    );
  }

  /**
   * Delete an extracurricular activity
   */
  public static async deleteActivity(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return apiClient.delete<{ deleted: boolean }>(API_ENDPOINTS.PERSONAL.ACTIVITY_ITEM(id));
  }

  /**
   * Add an achievement record
   */
  public static async addAchievement(
    payload: CreateAchievementInput
  ): Promise<ApiResponse<StudentAchievementRecord>> {
    return apiClient.post<StudentAchievementRecord>(
      API_ENDPOINTS.PERSONAL.ACHIEVEMENTS,
      payload
    );
  }

  /**
   * Update an existing achievement
   */
  public static async updateAchievement(
    id: string,
    payload: UpdateAchievementInput
  ): Promise<ApiResponse<StudentAchievementRecord>> {
    return apiClient.put<StudentAchievementRecord>(
      API_ENDPOINTS.PERSONAL.ACHIEVEMENT_ITEM(id),
      payload
    );
  }

  /**
   * Delete an achievement record
   */
  public static async deleteAchievement(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return apiClient.delete<{ deleted: boolean }>(
      API_ENDPOINTS.PERSONAL.ACHIEVEMENT_ITEM(id)
    );
  }

  /**
   * Staff review of a student's personal information (counsellors / admins)
   */
  public static async getByProfileId(
    studentProfileId: string
  ): Promise<ApiResponse<PersonalModuleData>> {
    return apiClient.get<PersonalModuleData>(
      API_ENDPOINTS.PERSONAL.BY_PROFILE_ID(studentProfileId)
    );
  }
}
