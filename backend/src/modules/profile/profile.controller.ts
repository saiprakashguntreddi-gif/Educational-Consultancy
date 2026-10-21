import { Request, Response, NextFunction } from 'express';
import { ProfileService } from './profile.service';
import { ApiResponse } from '../../shared/utils/api-response';
import { VerificationStatus } from '../../config/constants';

export class ProfileController {
  /**
   * Submit or update student profile intake (Module 1)
   */
  public static async submitIntake(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ApiResponse.error(res, 'Authentication required', 401, 'Unauthorized');
        return;
      }

      const profile = await ProfileService.saveIntake(req.user.id, req.body);
      ApiResponse.success(res, profile, 'Profile intake submitted successfully. Verification pending.');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current authenticated student's profile
   */
  public static async getMyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ApiResponse.error(res, 'Authentication required', 401, 'Unauthorized');
        return;
      }

      const profile = await ProfileService.getProfileByUserId(req.user.id);
      if (!profile) {
        ApiResponse.error(res, 'Profile has not been created yet', 404, 'Profile Not Found');
        return;
      }

      ApiResponse.success(res, profile, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get authenticated student's locked verified record & guidance clearance
   * Protected by requireVerifiedStudentProfile (Gated to VERIFIED students only)
   */
  public static async getVerifiedRecord(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ApiResponse.error(res, 'Authentication required', 401, 'Unauthorized');
        return;
      }

      const verifiedProfile = (req as any).verifiedProfile;
      if (verifiedProfile) {
        ApiResponse.success(
          res,
          {
            record: verifiedProfile,
            clearance: {
              isVerified: true,
              verifiedAt: verifiedProfile.verifiedAt,
              verifiedBy: verifiedProfile.verifiedBy,
              verificationNotes: verifiedProfile.verificationNotes,
              guidanceEligible: true,
            },
          },
          'Verified student record and guidance clearance retrieved successfully'
        );
        return;
      }

      const profile = await ProfileService.getProfileByUserId(req.user.id);
      ApiResponse.success(res, profile, 'Profile record retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get profile by ID (Counsellor / Admin)
   */
  public static async getProfileById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const profile = await ProfileService.getProfileById(id);

      if (!profile) {
        ApiResponse.error(res, 'Student profile not found', 404, 'Not Found');
        return;
      }

      ApiResponse.success(res, profile, 'Student profile retrieved');
    } catch (error) {
      next(error);
    }
  }

  /**
   * List profiles for review (Counsellor / Admin)
   */
  public static async listProfiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const status = req.query.status as VerificationStatus | undefined;

      const result = await ProfileService.listProfiles({ page, limit, status });
      ApiResponse.success(res, result, 'Profiles retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update student verification status (Counsellor / Admin)
   */
  public static async verifyProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ApiResponse.error(res, 'Authentication required', 401, 'Unauthorized');
        return;
      }

      const { id } = req.params;
      const updated = await ProfileService.updateVerification(id, req.body, req.user.id);
      ApiResponse.success(res, updated, `Profile status updated to ${req.body.status}`);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        ApiResponse.error(res, error.message, 404, 'Not Found');
        return;
      }
      next(error);
    }
  }
}
