/**
 * Comprehensive Education Boards & Curriculums
 * Covers National Indian Boards, All State Secondary/Higher Secondary Education Boards,
 * International Curriculums, and Open/Technical Boards.
 */

export interface BoardOptionItem {
  value: string;
  label: string;
}

export interface BoardCategoryGroup {
  category: string;
  options: BoardOptionItem[];
}

export const COMPREHENSIVE_BOARD_GROUPS: BoardCategoryGroup[] = [
  {
    category: 'National Boards (India)',
    options: [
      { value: 'CBSE', label: 'CBSE (Central Board of Secondary Education)' },
      { value: 'ICSE / ISC', label: 'CISCE - ICSE / ISC (Council for the Indian School Certificate)' },
      { value: 'NIOS', label: 'NIOS (National Institute of Open Schooling)' },
    ],
  },
  {
    category: 'State Secondary & Intermediate Education Boards (India)',
    options: [
      { value: 'Andhra Pradesh (BIEAP / BSEAP)', label: 'Andhra Pradesh (BIEAP / BSEAP)' },
      { value: 'Arunachal Pradesh State Board', label: 'Arunachal Pradesh State Board' },
      { value: 'Assam (AHSEC / SEBA)', label: 'Assam (AHSEC / SEBA)' },
      { value: 'Bihar (BSEB)', label: 'Bihar (BSEB - Bihar School Examination Board)' },
      { value: 'Chhattisgarh (CGBSE)', label: 'Chhattisgarh (CGBSE)' },
      { value: 'Goa (GBSHSE)', label: 'Goa (GBSHSE)' },
      { value: 'Gujarat (GSEB / GHSEB)', label: 'Gujarat (GSEB / GHSEB)' },
      { value: 'Haryana (HBSE / BSEH)', label: 'Haryana (HBSE / BSEH)' },
      { value: 'Himachal Pradesh (HPBOSE)', label: 'Himachal Pradesh (HPBOSE)' },
      { value: 'Jammu and Kashmir (JKBOSE)', label: 'Jammu and Kashmir (JKBOSE)' },
      { value: 'Jharkhand (JAC)', label: 'Jharkhand (JAC - Jharkhand Academic Council)' },
      { value: 'Karnataka (Karnataka PUE / KSEAB)', label: 'Karnataka (Karnataka PUE / KSEAB)' },
      { value: 'Kerala (DHSE / KBPE)', label: 'Kerala (DHSE / KBPE)' },
      { value: 'Madhya Pradesh (MPBSE)', label: 'Madhya Pradesh (MPBSE)' },
      { value: 'Maharashtra (MSBSHSE)', label: 'Maharashtra (MSBSHSE - HSC / SSC)' },
      { value: 'Manipur (COHSEM / BSEM)', label: 'Manipur (COHSEM / BSEM)' },
      { value: 'Meghalaya (MBOSE)', label: 'Meghalaya (MBOSE)' },
      { value: 'Mizoram (MBSE)', label: 'Mizoram (MBSE)' },
      { value: 'Nagaland (NBSE)', label: 'Nagaland (NBSE)' },
      { value: 'Odisha (CHSE / BSE Odisha)', label: 'Odisha (CHSE / BSE Odisha)' },
      { value: 'Punjab (PSEB)', label: 'Punjab (PSEB)' },
      { value: 'Rajasthan (RBSE / BSER)', label: 'Rajasthan (RBSE / BSER)' },
      { value: 'Sikkim State Board', label: 'Sikkim State Board' },
      { value: 'Tamil Nadu (TNBSE / DGE Tamil Nadu)', label: 'Tamil Nadu (TNBSE / DGE Tamil Nadu)' },
      { value: 'Telangana (TSBIE / BSE Telangana)', label: 'Telangana (TSBIE / BSE Telangana)' },
      { value: 'Tripura (TBSE)', label: 'Tripura (TBSE)' },
      { value: 'Uttar Pradesh (UP Board / UPMSP)', label: 'Uttar Pradesh (UP Board / UPMSP)' },
      { value: 'Uttarakhand (UBSE)', label: 'Uttarakhand (UBSE)' },
      { value: 'West Bengal (WBCHSE / WBBSE)', label: 'West Bengal (WBCHSE / WBBSE)' },
      { value: 'State Board', label: 'State Board (Generic / Other State)' },
    ],
  },
  {
    category: 'International Curriculums',
    options: [
      { value: 'IB (International Baccalaureate)', label: 'IB (International Baccalaureate - IBDP / MYP)' },
      { value: 'Cambridge (CIE)', label: 'Cambridge (CIE - IGCSE / AS & A-Levels)' },
      { value: 'Edexcel / Pearson (UK)', label: 'Edexcel / Pearson International Curriculum (UK)' },
      { value: 'American High School Diploma (US AP)', label: 'American High School Diploma / AP (United States)' },
      { value: 'Canadian High School (OSSD / Provincial)', label: 'Canadian High School Diploma (OSSD / Provincial)' },
      { value: 'Australian High School (ATAR / VCE / HSC / WACE)', label: 'Australian High School Senior Certificate (ATAR)' },
      { value: 'European Baccalaureate (EB)', label: 'European Baccalaureate (EB / French Bac / German Abitur)' },
      { value: 'Other International Curriculum', label: 'Other International High School Board' },
    ],
  },
  {
    category: 'Open Schooling, Vocational & Equivalent',
    options: [
      { value: 'State Open School (SOS / BBOSE / RSOS)', label: 'State Open Schooling (BBOSE / RSOS / TOSS / APSOS)' },
      { value: 'Polytechnic / Technical Diploma', label: 'Polytechnic Diploma / State Technical Board (10+3 Equivalent)' },
      { value: 'Other / Equivalent', label: 'Other / Equivalent Recognized Secondary Board' },
    ],
  },
];

export const ALL_BOARD_VALUES: string[] = COMPREHENSIVE_BOARD_GROUPS.flatMap((g) =>
  g.options.map((opt) => opt.value)
);
