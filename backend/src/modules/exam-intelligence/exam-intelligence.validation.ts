import { z } from 'zod';

export const saveExamPlanSchema = z.object({
  body: z.object({
    examId: z.string().uuid('Invalid exam ID format'),
    status: z.enum(['PLANNED', 'PREPARING', 'REGISTERED', 'COMPLETED']).default('PLANNED'),
    targetDate: z.string().optional(),
    targetScore: z.string().optional(),
    notes: z.string().max(1000).optional(),
  }),
});

export const updateExamPlanSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid plan ID format'),
  }),
  body: z.object({
    status: z.enum(['PLANNED', 'PREPARING', 'REGISTERED', 'COMPLETED']).optional(),
    targetDate: z.string().optional(),
    targetScore: z.string().optional(),
    currentScore: z.string().optional(),
    notes: z.string().max(1000).optional(),
  }),
});

export const deleteExamPlanSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid plan ID format'),
  }),
});

export const submitMockTestSchema = z.object({
  params: z.object({
    testId: z.string().uuid('Invalid test ID format'),
  }),
  body: z.object({
    answers: z.record(z.string(), z.number().int().min(0).max(10)),
    timeSpentSeconds: z.number().int().min(0).max(86400),
  }),
});

export const getPreparationPlanSchema = z.object({
  params: z.object({
    examId: z.string().uuid('Invalid exam ID format'),
  }),
  query: z.object({
    targetWeeks: z.string().regex(/^\d+$/).transform(Number).optional(),
  }).optional(),
});

export const getStudentIntelligenceSchema = z.object({
  params: z.object({
    studentProfileId: z.string().uuid('Invalid student profile ID format'),
  }),
});
