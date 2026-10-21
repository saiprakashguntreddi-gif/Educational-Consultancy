/**
 * Platform Global Constants
 */

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  NON_BINARY = 'NON_BINARY',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export const COMMON_BOARDS = [
  'CBSE',
  'ICSE / ISC',
  'State Board',
  'IB (International Baccalaureate)',
  'Cambridge (IGCSE / A-Levels)',
  'Other / Equivalent',
] as const;

export const COMMON_GRADES = [
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
  'Undergraduate Year 1',
  'Undergraduate Year 2',
  'Undergraduate Year 3',
  'Undergraduate Year 4',
  'Postgraduate',
] as const;
