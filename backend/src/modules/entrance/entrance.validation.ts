import { z } from 'zod';

export const saveExamPlanSchema = z.object({
  body: z.object({
    examId: z.string({ required_error: 'Exam ID is required' }).uuid('Invalid Exam ID format'),
    status: z.enum(['PLANNED', 'PREPARING', 'REGISTERED', 'COMPLETED'], {
      required_error: 'Status must be PLANNED, PREPARING, REGISTERED, or COMPLETED',
    }),
    targetDate: z.string().optional(),
    targetScore: z.string().max(40, 'Target score string cannot exceed 40 characters').optional(),
    currentScore: z.string().max(40, 'Current score string cannot exceed 40 characters').optional(),
    notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
  }),
});

export const updateExamPlanSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid plan item ID'),
  }),
  body: z.object({
    status: z.enum(['PLANNED', 'PREPARING', 'REGISTERED', 'COMPLETED']).optional(),
    targetDate: z.string().optional().nullable(),
    targetScore: z.string().max(40).optional().nullable(),
    currentScore: z.string().max(40).optional().nullable(),
    notes: z.string().max(1000).optional().nullable(),
  }),
});

export const deleteExamPlanSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid plan item ID'),
  }),
});

export const submitMockTestSchema = z.object({
  params: z.object({
    testId: z.string().uuid('Invalid test ID'),
  }),
  body: z.object({
    timeSpentSeconds: z.number().int().min(0, 'Time spent must be positive'),
    answers: z.record(z.string(), z.number().int().min(0).max(10)),
  }),
});

export const getExamByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid Exam ID format'),
  }),
});

export const getExamsCatalogSchema = z.object({
  query: z.object({
    destination: z.string().optional(),
    category: z.string().optional(),
    search: z.string().optional(),
  }).optional(),
});

export const getPlanByProfileIdSchema = z.object({
  params: z.object({
    studentProfileId: z.string().uuid('Invalid Student Profile ID format'),
  }),
});
