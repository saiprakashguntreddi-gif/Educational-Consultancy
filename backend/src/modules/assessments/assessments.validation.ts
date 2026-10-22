import { z } from 'zod';

export const generateAccessCodeSchema = z.object({
  body: z.object({
    pathwayCode: z.enum([
      'LEARNING_STYLE',
      'POST_10TH_STREAM',
      'CAREER_PERSONALITY',
      'MULTIPLE_INTELLIGENCES',
      'ENGINEERING_BRANCH',
      'MANAGEMENT_COMMERCE',
      'HUMANITIES_LAW_POLICY',
      'COGNITIVE_PROBLEM_SOLVING',
      'ALL_PATHWAYS',
    ]),
    assignedStudentEmail: z.string().email().optional().or(z.literal('')),
    maxUses: z.number().int().min(1).max(500).default(1),
    validityDays: z.number().int().min(1).max(365).default(30),
    notes: z.string().max(500).optional(),
    customCode: z.string().min(4).max(30).optional(),
  }),
});

export const verifyAccessCodeSchema = z.object({
  body: z.object({
    code: z.string().min(3).max(30),
  }),
});

export const startAttemptSchema = z.object({
  params: z.object({
    pathwayCode: z.enum([
      'LEARNING_STYLE',
      'POST_10TH_STREAM',
      'CAREER_PERSONALITY',
      'MULTIPLE_INTELLIGENCES',
      'ENGINEERING_BRANCH',
      'MANAGEMENT_COMMERCE',
      'HUMANITIES_LAW_POLICY',
      'COGNITIVE_PROBLEM_SOLVING',
    ]),
  }),
  body: z.object({
    accessCode: z.string().optional(),
  }),
});

export const saveProgressSchema = z.object({
  params: z.object({
    attemptId: z.string().min(1),
  }),
  body: z.object({
    currentQuestionIndex: z.number().int().min(0),
    answers: z.record(z.string()),
    timeSpentSeconds: z.number().int().min(0),
  }),
});

export const submitAttemptSchema = z.object({
  params: z.object({
    attemptId: z.string().min(1),
  }),
  body: z.object({
    answers: z.record(z.string()),
    timeSpentSeconds: z.number().int().min(0),
  }),
});

export const saveActionPlanSchema = z.object({
  params: z.object({
    reportId: z.string().min(1),
  }),
  body: z.object({
    discussionPoints: z.array(z.string()),
    actionMilestones: z.array(
      z.object({
        title: z.string().min(1),
        targetDeadline: z.string().optional(),
        status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
      })
    ),
    summaryNotes: z.string().min(1),
  }),
});
