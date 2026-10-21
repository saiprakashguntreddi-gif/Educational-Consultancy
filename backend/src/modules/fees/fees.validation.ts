import { z } from 'zod';

export const TierSummaryQuerySchema = z.object({
  country: z.string().optional().default('United States'),
  department: z.string().optional(),
  currency: z.string().optional().default('USD'),
});

export const CollegesQuerySchema = z.object({
  country: z.string().min(1, 'Country is required'),
  tier: z.enum(['TOP_RANKED', 'MID_LEVEL', 'EMERGING'], {
    errorMap: () => ({ message: 'Tier must be TOP_RANKED, MID_LEVEL, or EMERGING' }),
  }),
  department: z.string().optional(),
  currency: z.string().optional().default('USD'),
});

export const CalculateCourseFeeSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  department: z.string().min(1, 'Department is required'),
  course: z.string().min(1, 'Course is required'),
  tier: z.enum(['TOP_RANKED', 'MID_LEVEL', 'EMERGING'], {
    errorMap: () => ({ message: 'Tier must be TOP_RANKED, MID_LEVEL, or EMERGING' }),
  }),
  currency: z.string().optional().default('USD'),
});

export const CompareCountriesSchema = z.object({
  countries: z
    .array(z.string().min(1))
    .min(2, 'Please select at least 2 countries to compare')
    .max(10, 'Maximum 10 countries allowed'),
  department: z.string().optional().default('Engineering & Technology'),
  tier: z.enum(['TOP_RANKED', 'MID_LEVEL', 'EMERGING']).optional().default('TOP_RANKED'),
  currency: z.string().optional().default('USD'),
});

export const BudgetDecisionSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  department: z.string().min(1, 'Department is required'),
  course: z.string().min(1, 'Course is required'),
  tier: z.enum(['TOP_RANKED', 'MID_LEVEL', 'EMERGING']),
  selectedCurrency: z.string().min(1, 'Currency is required'),
  estimatedTotal: z.number().positive('Estimated total must be positive'),
  notes: z.string().max(500).optional(),
});
