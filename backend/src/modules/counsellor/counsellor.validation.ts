import { z } from 'zod';
import { VerificationStatus } from '../../config/constants';

export const listCounsellorStudentsQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    verificationStatus: z.nativeEnum(VerificationStatus).optional(),
    board: z.string().optional(),
    passingOutYear: z.string().regex(/^\d{4}$/, 'Year must be 4 digits').optional(),
    grade: z.string().optional(),
    page: z.string().regex(/^\d+$/).optional().default('1'),
    limit: z.string().regex(/^\d+$/).optional().default('20'),
  }),
});

export const createStudentByStaffSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email address required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    gender: z.enum(['MALE', 'FEMALE', 'NON_BINARY', 'OTHER', 'PREFER_NOT_TO_SAY']),
    grade: z.string().min(1, 'Class or Grade required'),
    contactEmail: z.string().email('Contact email required'),
    phone: z.string().min(5, 'Valid phone required'),
    address: z.object({
      street: z.string().min(1, 'Street required'),
      city: z.string().min(1, 'City required'),
      state: z.string().min(1, 'State required'),
      postalCode: z.string().min(1, 'Postal code required'),
      country: z.string().min(1, 'Country required'),
    }),
    board: z.string().min(1, 'Board required'),
    citizenship: z.string().min(1, 'Citizenship required'),
    passingOutYear: z.number().int().min(2020).max(2035),
    assignToSelf: z.boolean().optional().default(true),
    counsellorId: z.string().uuid().optional(),
  }),
});

export const createActionPlanSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Milestone title is required'),
    description: z.string().optional(),
    category: z.enum(['PROFILE', 'ACADEMIC', 'ENTRANCE_EXAM', 'APPLICATION', 'SCHOLARSHIP', 'GENERAL']).default('GENERAL'),
    targetDate: z.string().optional(),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  }),
});

export const updateActionPlanSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    category: z.enum(['PROFILE', 'ACADEMIC', 'ENTRANCE_EXAM', 'APPLICATION', 'SCHOLARSHIP', 'GENERAL']).optional(),
    targetDate: z.string().optional().nullable(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  }),
});

export const createStudentNoteSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    content: z.string().min(1, 'Note content cannot be empty'),
    isPrivate: z.boolean().optional().default(true),
  }),
});

export type CreateStudentByStaffDto = z.infer<typeof createStudentByStaffSchema>['body'];
export type CreateActionPlanDto = z.infer<typeof createActionPlanSchema>['body'];
export type UpdateActionPlanDto = z.infer<typeof updateActionPlanSchema>['body'];
export type CreateStudentNoteDto = z.infer<typeof createStudentNoteSchema>['body'];
