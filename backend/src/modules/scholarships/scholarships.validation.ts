import { z } from 'zod';

export const scholarshipIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid scholarship identifier format'),
  }),
});

export const studentListScholarshipsQuerySchema = z.object({
  query: z
    .object({
      search: z.string().optional(),
      country: z.string().optional(),
      eligibility: z
        .enum(['ALL', 'ELIGIBLE', 'POTENTIALLY_ELIGIBLE', 'NOT_ELIGIBLE', 'SAVED'])
        .optional(),
      department: z.string().optional(),
      page: z.string().regex(/^\d+$/).optional(),
      limit: z.string().regex(/^\d+$/).optional(),
    })
    .optional(),
});

export const adminListScholarshipsQuerySchema = z.object({
  query: z
    .object({
      search: z.string().optional(),
      country: z.string().optional(),
      isActive: z.enum(['true', 'false', 'ALL']).optional(),
      page: z.string().regex(/^\d+$/).optional(),
      limit: z.string().regex(/^\d+$/).optional(),
    })
    .optional(),
});

export const adminCreateScholarshipSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Scholarship name must be at least 2 characters').max(255),
    provider: z.string().min(2, 'Provider organization must be at least 2 characters').max(255),
    country: z.string().min(2, 'Provider / host country is required').max(100),
    destinationCountry: z.string().max(100).optional().nullable(),
    institutionId: z.string().uuid().optional().nullable(),
    department: z.string().max(100).optional().nullable(),
    specialization: z.string().max(100).optional().nullable(),
    studyLevel: z.string().max(50).optional().nullable(),
    awardAmount: z.number().min(0).optional().nullable(),
    awardCurrency: z.string().max(10).optional().nullable(),
    awardType: z.string().max(50).optional().nullable(),
    awardDetails: z.string().min(5, 'Award and benefit details must be provided').max(5000),
    eligibilityDescription: z.string().min(5, 'Eligibility criteria summary must be provided').max(5000),
    minPercentageRequirement: z.number().min(0).max(100).optional().nullable(),
    eligibleBoards: z.array(z.string()).optional().nullable(),
    requiredCitizenship: z.string().max(100).optional().nullable(),
    genderRequirement: z.enum(['ALL', 'ANY', 'FEMALE', 'MALE', 'OTHER']).optional().nullable(),
    incomeCeiling: z.number().min(0).optional().nullable(),
    incomeCurrency: z.string().max(10).optional().nullable(),
    requiredExams: z.array(z.string()).optional().nullable(),
    applicationDeadline: z.string().max(100).optional().nullable(),
    applicationUrl: z.string().url('Must be a valid official website URL').max(500),
    sourceInfo: z.string().max(255).optional().nullable(),
    isActive: z.boolean().optional(),
    isPublished: z.boolean().optional(),
  }),
});

export const adminUpdateScholarshipSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid scholarship identifier format'),
  }),
  body: z.object({
    name: z.string().min(2).max(255).optional(),
    provider: z.string().min(2).max(255).optional(),
    country: z.string().min(2).max(100).optional(),
    destinationCountry: z.string().max(100).optional().nullable(),
    institutionId: z.string().uuid().optional().nullable(),
    department: z.string().max(100).optional().nullable(),
    specialization: z.string().max(100).optional().nullable(),
    studyLevel: z.string().max(50).optional().nullable(),
    awardAmount: z.number().min(0).optional().nullable(),
    awardCurrency: z.string().max(10).optional().nullable(),
    awardType: z.string().max(50).optional().nullable(),
    awardDetails: z.string().min(5).max(5000).optional(),
    eligibilityDescription: z.string().min(5).max(5000).optional(),
    minPercentageRequirement: z.number().min(0).max(100).optional().nullable(),
    eligibleBoards: z.array(z.string()).optional().nullable(),
    requiredCitizenship: z.string().max(100).optional().nullable(),
    genderRequirement: z.enum(['ALL', 'ANY', 'FEMALE', 'MALE', 'OTHER']).optional().nullable(),
    incomeCeiling: z.number().min(0).optional().nullable(),
    incomeCurrency: z.string().max(10).optional().nullable(),
    requiredExams: z.array(z.string()).optional().nullable(),
    applicationDeadline: z.string().max(100).optional().nullable(),
    applicationUrl: z.string().url().max(500).optional(),
    sourceInfo: z.string().max(255).optional().nullable(),
    isActive: z.boolean().optional(),
    isPublished: z.boolean().optional(),
  }),
});

export const adminToggleScholarshipStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid scholarship identifier format'),
  }),
  body: z.object({
    isActive: z.boolean(),
  }),
});
