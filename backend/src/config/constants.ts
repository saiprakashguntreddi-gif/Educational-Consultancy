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
  'NIOS',
  'Andhra Pradesh (BIEAP / BSEAP)',
  'Arunachal Pradesh State Board',
  'Assam (AHSEC / SEBA)',
  'Bihar (BSEB)',
  'Chhattisgarh (CGBSE)',
  'Goa (GBSHSE)',
  'Gujarat (GSEB / GHSEB)',
  'Haryana (HBSE / BSEH)',
  'Himachal Pradesh (HPBOSE)',
  'Jammu and Kashmir (JKBOSE)',
  'Jharkhand (JAC)',
  'Karnataka (Karnataka PUE / KSEAB)',
  'Kerala (DHSE / KBPE)',
  'Madhya Pradesh (MPBSE)',
  'Maharashtra (MSBSHSE)',
  'Manipur (COHSEM / BSEM)',
  'Meghalaya (MBOSE)',
  'Mizoram (MBSE)',
  'Nagaland (NBSE)',
  'Odisha (CHSE / BSE Odisha)',
  'Punjab (PSEB)',
  'Rajasthan (RBSE / BSER)',
  'Sikkim State Board',
  'Tamil Nadu (TNBSE / DGE Tamil Nadu)',
  'Telangana (TSBIE / BSE Telangana)',
  'Tripura (TBSE)',
  'Uttar Pradesh (UP Board / UPMSP)',
  'Uttarakhand (UBSE)',
  'West Bengal (WBCHSE / WBBSE)',
  'State Board',
  'IB (International Baccalaureate)',
  'Cambridge (CIE)',
  'Cambridge (IGCSE / A-Levels)',
  'Edexcel / Pearson (UK)',
  'American High School Diploma (US AP)',
  'Canadian High School (OSSD / Provincial)',
  'Australian High School (ATAR / VCE / HSC / WACE)',
  'European Baccalaureate (EB)',
  'Other International Curriculum',
  'State Open School (SOS / BBOSE / RSOS)',
  'Polytechnic / Technical Diploma',
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
