import { z } from 'zod';
import { Gender, VerificationStatus } from '../../config/constants';

export const addressSchema = z.object({
  street: z.string().min(2, 'Street address is required').max(200),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State / Province is required').max(100),
  postalCode: z.string().min(2, 'Postal code / PIN is required').max(20),
  country: z.string().min(2, 'Country is required').max(100),
});

export const profileIntakeSchema = z.object({
  body: z.object({
    fullName: z
      .string()
      .min(2, 'Name must be at least 2 characters long')
      .max(100, 'Name cannot exceed 100 characters')
      .trim(),
    gender: z.nativeEnum(Gender, {
      errorMap: () => ({ message: 'Please select a valid gender option' }),
    }),
    grade: z
      .string()
      .min(1, 'Class / Grade is required')
      .max(50, 'Class / Grade cannot exceed 50 characters')
      .trim(),
    contactEmail: z
      .string()
      .email('Please provide a valid contact email')
      .toLowerCase()
      .trim(),
    phone: z
      .string()
      .min(5, 'Phone number must be at least 5 digits')
      .max(20, 'Phone number cannot exceed 20 digits')
      .regex(/^[+0-9\s\-()]+$/, 'Phone number contains invalid characters')
      .trim(),
    address: addressSchema,
    board: z
      .string()
      .min(2, 'Board / Curriculum is required')
      .max(100, 'Board name cannot exceed 100 characters')
      .trim(),
    citizenship: z
      .string()
      .min(2, 'Citizenship is required')
      .max(100, 'Citizenship cannot exceed 100 characters')
      .trim(),
    passingOutYear: z
      .number({ invalid_type_error: 'Passing-out year must be a valid number' })
      .int('Passing-out year must be an integer')
      .min(1990, 'Passing-out year cannot be earlier than 1990')
      .max(2040, 'Passing-out year cannot be later than 2040'),
  }),
});

export const verifyProfileSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid profile ID'),
  }),
  body: z.object({
    status: z.nativeEnum(VerificationStatus, {
      errorMap: () => ({ message: 'Status must be PENDING, VERIFIED, or REJECTED' }),
    }),
    notes: z.string().max(500, 'Verification notes cannot exceed 500 characters').optional(),
  }),
});

export type ProfileIntakeDto = z.infer<typeof profileIntakeSchema>['body'];
export type VerifyProfileDto = z.infer<typeof verifyProfileSchema>['body'];
