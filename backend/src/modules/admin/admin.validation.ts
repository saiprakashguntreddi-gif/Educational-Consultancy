import { z } from 'zod';
import { VerificationStatus } from '../../config/constants';

export const listAdminStudentsQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    verificationStatus: z.nativeEnum(VerificationStatus).optional(),
    board: z.string().optional(),
    passingOutYear: z.string().regex(/^\d{4}$/, 'Year must be 4 digits').optional(),
    grade: z.string().optional(),
    counsellorId: z.string().uuid().optional(),
    assignmentStatus: z.enum(['ALL', 'ASSIGNED', 'UNASSIGNED']).optional().default('ALL'),
    page: z.string().regex(/^\d+$/).optional().default('1'),
    limit: z.string().regex(/^\d+$/).optional().default('20'),
  }),
});

export const assignCounsellorSchema = z.object({
  body: z.object({
    counsellorId: z.string().uuid('Valid counsellor ID required').nullable(),
  }),
});

export const adminAuditLogsQuerySchema = z.object({
  query: z.object({
    action: z.string().optional(),
    userId: z.string().uuid().optional(),
    page: z.string().regex(/^\d+$/).optional().default('1'),
    limit: z.string().regex(/^\d+$/).optional().default('30'),
  }),
});
