import { Request, Response, NextFunction } from 'express';
import { prisma } from '../database/prisma.service';
import { VerificationStatus } from '../../config/constants';
import { Role } from '../../config/roles';
import { ApiResponse } from '../utils/api-response';

/**
 * Verification Access Middleware
 * Strictly enforces that a student profile has achieved VERIFIED status before
 * accessing protected guidance actions and official verified student records.
 *
 * Rules:
 * - Counsellors and Admins bypass student verification checks (never blocked from reviews).
 * - Students without a profile are rejected with 403 (PROFILE_INCOMPLETE).
 * - Students with PENDING or REJECTED status are rejected with 403 (PROFILE_NOT_VERIFIED).
 * - Only VERIFIED students are permitted to proceed.
 */
export const requireVerifiedStudentProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    ApiResponse.error(res, 'Authentication required', 401, 'Unauthorized');
    return;
  }

  // Administrators are never blocked from reviewing profiles
  if (req.user.role === Role.ADMIN) {
    next();
    return;
  }

  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!profile) {
      ApiResponse.error(
        res,
        {
          code: 'PROFILE_INCOMPLETE',
          message: 'Student profile intake has not been submitted yet. Please complete Module 1 Profile Intake.',
        },
        403,
        'Profile Incomplete'
      );
      return;
    }

    if (profile.verificationStatus !== VerificationStatus.VERIFIED) {
      const isPending = profile.verificationStatus === VerificationStatus.PENDING;
      ApiResponse.error(
        res,
        {
          code: 'PROFILE_NOT_VERIFIED',
          verificationStatus: profile.verificationStatus,
          verificationNotes: profile.verificationNotes,
          message: isPending
            ? 'Access restricted: Your student profile is currently pending counsellor verification. A certified counsellor must authenticate your record before verified features unlock.'
            : 'Access restricted: Your student profile verification was rejected. Please review counsellor feedback notes and update your profile intake.',
        },
        403,
        'Verification Required'
      );
      return;
    }

    // Attach verified profile to request for controller consumption
    (req as any).verifiedProfile = profile;
    next();
  } catch (error) {
    next(error);
  }
};
