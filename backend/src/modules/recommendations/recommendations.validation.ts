import { z } from 'zod';

export const counsellorReviewSchema = z.object({
  body: z.object({
    status: z.enum(['GENERATED', 'UNDER_REVIEW', 'COUNSELLOR_APPROVED', 'FINALIZED']),
    counsellorNotes: z.string().max(2000).optional(),
  }),
});

export const tierOverrideSchema = z.object({
  body: z.object({
    tier: z.enum(['SAFE', 'BEST_FIT', 'ASPIRATIONAL']),
    notes: z.string().max(1000).optional(),
  }),
});

export const generateRecommendationsSchema = z.object({
  body: z
    .object({
      studentProfileId: z.string().uuid().optional(),
    })
    .optional(),
});

export const adminAssignTierSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    tier: z.enum(['SAFE', 'BEST_FIT', 'ASPIRATIONAL']),
    reason: z.string().trim().min(1, 'Reason is required when changing or assigning a tier').max(1000),
  }),
});

export const adminToggleCollegeStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    isActive: z.boolean(),
  }),
});

export const adminCreateManagedCollegeSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(255),
    country: z.string().min(2).max(100),
    city: z.string().min(2).max(100),
    state: z.string().max(100).optional(),
    institutionType: z.string().max(100).optional(),
    overview: z.string().min(10).max(5000),
    officialWebsiteUrl: z.string().url().max(500),
    initialTier: z.enum(['SAFE', 'BEST_FIT', 'ASPIRATIONAL']),
    reason: z.string().max(1000).optional(),
    minPercentageRequirement: z.number().min(0).max(100).optional(),
    acceptanceRate: z.number().min(0).max(1).optional(),
    avgSatRequirement: z.number().int().min(400).max(1600).optional(),
    rankingInfo: z.string().max(255).optional(),
  }),
});

export const adminUpdateManagedCollegeSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().min(2).max(255).optional(),
    country: z.string().min(2).max(100).optional(),
    city: z.string().min(2).max(100).optional(),
    state: z.string().max(100).optional(),
    institutionType: z.string().max(100).optional(),
    overview: z.string().min(10).max(5000).optional(),
    officialWebsiteUrl: z.string().url().max(500).optional(),
    managedTier: z.enum(['SAFE', 'BEST_FIT', 'ASPIRATIONAL']).optional(),
    tierReason: z.string().max(1000).optional(),
    minPercentageRequirement: z.number().min(0).max(100).optional().nullable(),
    acceptanceRate: z.number().min(0).max(1).optional().nullable(),
    avgSatRequirement: z.number().int().min(400).max(1600).optional().nullable(),
    rankingInfo: z.string().max(255).optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const adminListManagedCollegesQuerySchema = z.object({
  query: z
    .object({
      search: z.string().optional(),
      tier: z.enum(['ALL', 'SAFE', 'BEST_FIT', 'ASPIRATIONAL', 'UNASSIGNED']).optional(),
      isActive: z.string().optional(),
      page: z.string().regex(/^\d+$/).optional(),
      limit: z.string().regex(/^\d+$/).optional(),
    })
    .optional(),
});
