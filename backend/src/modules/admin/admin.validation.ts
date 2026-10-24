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
    reason: z.string().optional(),
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

export const createCounsellorSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    fullName: z.string().min(2, 'Full name required'),
    phone: z.string().optional(),
    qualification: z.string().optional(),
    experienceYears: z.number().int().min(0).optional().default(0),
    specialization: z.string().optional(),
    skills: z.array(z.string()).optional().default([]),
    languages: z.array(z.string()).optional().default([]),
    countriesOfExpertise: z.array(z.string()).optional().default([]),
    courseExpertise: z.array(z.string()).optional().default([]),
    bio: z.string().optional(),
    availability: z.string().optional().default('Mon-Fri, 9:00 AM - 5:00 PM'),
    capacity: z.number().int().min(1).optional().default(30),
    verificationStatus: z.enum(['PENDING', 'VERIFIED', 'ACTIVE', 'INACTIVE', 'SUSPENDED']).optional().default('ACTIVE'),
  }),
});

export const updateCounsellorSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).optional(),
    phone: z.string().optional(),
    qualification: z.string().optional(),
    experienceYears: z.number().int().min(0).optional(),
    specialization: z.string().optional(),
    skills: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    countriesOfExpertise: z.array(z.string()).optional(),
    courseExpertise: z.array(z.string()).optional(),
    bio: z.string().optional(),
    availability: z.string().optional(),
    capacity: z.number().int().min(1).optional(),
  }),
});

export const updateCounsellorStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'VERIFIED', 'ACTIVE', 'INACTIVE', 'SUSPENDED']),
    notes: z.string().optional(),
  }),
});

export const updateCounsellorSkillsSchema = z.object({
  body: z.object({
    skills: z.array(z.string()),
    specialization: z.string().optional(),
    countriesOfExpertise: z.array(z.string()).optional(),
    courseExpertise: z.array(z.string()).optional(),
  }),
});

export const sessionAuditQuerySchema = z.object({
  query: z.object({
    counsellorId: z.string().uuid().optional(),
    studentProfileId: z.string().uuid().optional(),
    status: z.enum(['ALL', 'COMPLETED', 'CONFIRMED', 'SCHEDULED', 'RESCHEDULED', 'CANCELLED']).optional().default('ALL'),
    followUpRequired: z.enum(['ALL', 'TRUE', 'FALSE']).optional().default('ALL'),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.string().regex(/^\d+$/).optional().default('1'),
    limit: z.string().regex(/^\d+$/).optional().default('20'),
  }),
});

