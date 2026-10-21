import { apiClient, ApiResponse } from '../../../shared/services/api-client';
import { API_ENDPOINTS } from '../../../config/api.config';
import {
  CollegeSearchParams,
  AdminCollegeSearchParams,
  InstitutionListResponse,
  AdminInstitutionListResponse,
  InstitutionDetail,
  CourseSummary,
  SavedInstitutionsAndCoursesResponse,
  ComparisonResponse,
  AdminCreateInstitutionInput,
  AdminUpdateInstitutionInput,
  AdminCreateCourseInput,
  AdminUpdateCourseInput,
} from '../colleges.types';

export class CollegesService {
  /**
   * Search and filter colleges catalog with server-side pagination (Students/Counsellors)
   */
  public static async listColleges(
    params?: CollegeSearchParams
  ): Promise<ApiResponse<InstitutionListResponse>> {
    const searchParams = new URLSearchParams();

    if (params?.search) searchParams.append('search', params.search);
    if (params?.country && params.country !== 'ALL') searchParams.append('country', params.country);
    if (params?.city && params.city !== 'ALL') searchParams.append('city', params.city);
    if (params?.department && params.department !== 'ALL')
      searchParams.append('department', params.department);
    if (params?.course) searchParams.append('course', params.course);
    if (params?.specialization && params.specialization !== 'ALL')
      searchParams.append('specialization', params.specialization);
    if (params?.level && params.level !== 'ALL') searchParams.append('level', params.level);
    if (params?.minFee !== undefined && params.minFee !== '')
      searchParams.append('minFee', String(params.minFee));
    if (params?.maxFee !== undefined && params.maxFee !== '')
      searchParams.append('maxFee', String(params.maxFee));
    if (params?.hasScholarship) searchParams.append('hasScholarship', 'true');
    if (params?.entranceExam && params.entranceExam !== 'ALL')
      searchParams.append('entranceExam', params.entranceExam);
    if (params?.page) searchParams.append('page', String(params.page));
    if (params?.limit) searchParams.append('limit', String(params.limit));
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);

    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiClient.get<InstitutionListResponse>(
      `${API_ENDPOINTS.COLLEGES.DISCOVERY}${queryString}`
    );
  }

  /**
   * Get single institution profile by ID or slug (Published only)
   */
  public static async getCollegeById(
    idOrSlug: string
  ): Promise<ApiResponse<InstitutionDetail>> {
    return apiClient.get<InstitutionDetail>(API_ENDPOINTS.COLLEGES.BY_ID(idOrSlug));
  }

  /**
   * Get single course details by ID
   */
  public static async getCourseById(
    courseId: string
  ): Promise<ApiResponse<CourseSummary>> {
    return apiClient.get<CourseSummary>(API_ENDPOINTS.COLLEGES.COURSE_BY_ID(courseId));
  }

  /**
   * Get student's saved institutions and courses
   */
  public static async getSaved(): Promise<ApiResponse<SavedInstitutionsAndCoursesResponse>> {
    return apiClient.get<SavedInstitutionsAndCoursesResponse>(
      API_ENDPOINTS.COLLEGES.SAVED_ME
    );
  }

  /**
   * Save institution to student shortlist
   */
  public static async saveInstitution(
    id: string,
    notes?: string
  ): Promise<ApiResponse<{ saved: boolean }>> {
    return apiClient.post<{ saved: boolean }>(
      API_ENDPOINTS.COLLEGES.SAVE_INSTITUTION(id),
      { notes }
    );
  }

  /**
   * Remove institution from student shortlist
   */
  public static async unsaveInstitution(
    id: string
  ): Promise<ApiResponse<{ unsaved: boolean }>> {
    return apiClient.delete<{ unsaved: boolean }>(
      API_ENDPOINTS.COLLEGES.SAVE_INSTITUTION(id)
    );
  }

  /**
   * Save course to student shortlist
   */
  public static async saveCourse(
    courseId: string,
    notes?: string
  ): Promise<ApiResponse<{ saved: boolean }>> {
    return apiClient.post<{ saved: boolean }>(
      API_ENDPOINTS.COLLEGES.SAVE_COURSE(courseId),
      { notes }
    );
  }

  /**
   * Remove course from student shortlist
   */
  public static async unsaveCourse(
    courseId: string
  ): Promise<ApiResponse<{ unsaved: boolean }>> {
    return apiClient.delete<{ unsaved: boolean }>(
      API_ENDPOINTS.COLLEGES.SAVE_COURSE(courseId)
    );
  }

  /**
   * Get comparison matrix of selected institutions
   */
  public static async getComparison(): Promise<ApiResponse<ComparisonResponse>> {
    return apiClient.get<ComparisonResponse>(API_ENDPOINTS.COLLEGES.COMPARE_ME);
  }

  /**
   * Add institution to comparison
   */
  public static async addToComparison(
    id: string
  ): Promise<ApiResponse<{ added: boolean; totalCount: number }>> {
    return apiClient.post<{ added: boolean; totalCount: number }>(
      API_ENDPOINTS.COLLEGES.COMPARE_ITEM(id),
      {}
    );
  }

  /**
   * Remove institution from comparison
   */
  public static async removeFromComparison(
    id: string
  ): Promise<ApiResponse<{ removed: boolean }>> {
    return apiClient.delete<{ removed: boolean }>(
      API_ENDPOINTS.COLLEGES.COMPARE_ITEM(id)
    );
  }

  /**
   * Clear all comparison selections
   */
  public static async clearComparison(): Promise<ApiResponse<{ cleared: boolean }>> {
    return apiClient.delete<{ cleared: boolean }>(API_ENDPOINTS.COLLEGES.COMPARE_CLEAR);
  }

  // =========================================================================
  // ADMIN & CONTENT MANAGEMENT METHODS
  // =========================================================================

  /**
   * Admin: List all colleges across all statuses with metrics
   */
  public static async adminListColleges(
    params?: AdminCollegeSearchParams
  ): Promise<ApiResponse<AdminInstitutionListResponse>> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status && params.status !== 'ALL') searchParams.append('status', params.status);
    if (params?.country && params.country !== 'ALL') searchParams.append('country', params.country);
    if (params?.city && params.city !== 'ALL') searchParams.append('city', params.city);
    if (params?.isVerified !== undefined && params.isVerified !== 'ALL')
      searchParams.append('isVerified', params.isVerified);
    if (params?.isPublished !== undefined && params.isPublished !== 'ALL')
      searchParams.append('isPublished', params.isPublished);
    if (params?.page) searchParams.append('page', String(params.page));
    if (params?.limit) searchParams.append('limit', String(params.limit));
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);

    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiClient.get<AdminInstitutionListResponse>(
      `${API_ENDPOINTS.COLLEGES.ADMIN_ALL}${queryString}`
    );
  }

  /**
   * Admin: Get single college details (all courses and statuses)
   */
  public static async adminGetCollegeById(
    id: string
  ): Promise<ApiResponse<InstitutionDetail>> {
    return apiClient.get<InstitutionDetail>(API_ENDPOINTS.COLLEGES.ADMIN_BY_ID(id));
  }

  /**
   * Admin: Create new college
   */
  public static async adminCreateCollege(
    data: AdminCreateInstitutionInput
  ): Promise<ApiResponse<InstitutionDetail>> {
    return apiClient.post<InstitutionDetail>(API_ENDPOINTS.COLLEGES.ADMIN_CREATE, data);
  }

  /**
   * Admin: Update college details
   */
  public static async adminUpdateCollege(
    id: string,
    data: AdminUpdateInstitutionInput
  ): Promise<ApiResponse<InstitutionDetail>> {
    return apiClient.put<InstitutionDetail>(API_ENDPOINTS.COLLEGES.ADMIN_BY_ID(id), data);
  }

  /**
   * Admin: Publish / Unpublish college
   */
  public static async adminSetPublishStatus(
    id: string,
    isPublished: boolean,
    status?: string
  ): Promise<ApiResponse<InstitutionDetail>> {
    return apiClient.patch<InstitutionDetail>(API_ENDPOINTS.COLLEGES.ADMIN_PUBLISH(id), {
      isPublished,
      status,
    });
  }

  /**
   * Admin: Verify / Unverify college
   */
  public static async adminSetVerifyStatus(
    id: string,
    isVerified: boolean
  ): Promise<ApiResponse<InstitutionDetail>> {
    return apiClient.patch<InstitutionDetail>(API_ENDPOINTS.COLLEGES.ADMIN_VERIFY(id), {
      isVerified,
    });
  }

  /**
   * Admin: Archive college
   */
  public static async adminArchiveCollege(
    id: string
  ): Promise<ApiResponse<InstitutionDetail>> {
    return apiClient.patch<InstitutionDetail>(API_ENDPOINTS.COLLEGES.ADMIN_ARCHIVE(id), {});
  }

  /**
   * Admin: Add Course to college
   */
  public static async adminCreateCourse(
    institutionId: string,
    data: AdminCreateCourseInput
  ): Promise<ApiResponse<CourseSummary>> {
    return apiClient.post<CourseSummary>(
      API_ENDPOINTS.COLLEGES.ADMIN_CREATE_COURSE(institutionId),
      data
    );
  }

  /**
   * Admin: Update Course
   */
  public static async adminUpdateCourse(
    courseId: string,
    data: AdminUpdateCourseInput
  ): Promise<ApiResponse<CourseSummary>> {
    return apiClient.put<CourseSummary>(
      API_ENDPOINTS.COLLEGES.ADMIN_UPDATE_COURSE(courseId),
      data
    );
  }

  /**
   * Admin: Publish / Unpublish course
   */
  public static async adminSetCoursePublishStatus(
    courseId: string,
    isPublished: boolean
  ): Promise<ApiResponse<CourseSummary>> {
    return apiClient.patch<CourseSummary>(
      API_ENDPOINTS.COLLEGES.ADMIN_PUBLISH_COURSE(courseId),
      { isPublished }
    );
  }

  /**
   * Admin: Delete course
   */
  public static async adminDeleteCourse(
    courseId: string
  ): Promise<ApiResponse<{ deleted: boolean }>> {
    return apiClient.delete<{ deleted: boolean }>(
      API_ENDPOINTS.COLLEGES.ADMIN_DELETE_COURSE(courseId)
    );
  }
}
