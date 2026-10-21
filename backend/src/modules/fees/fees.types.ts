export type InstitutionTier = 'TOP_RANKED' | 'MID_LEVEL' | 'EMERGING';

export interface TierFeeStats {
  tier: InstitutionTier;
  label: string;
  avgFeesPerYear: number;
  highestFees: number;
  lowestFees: number;
  sampleCollegesCount: number;
}

export interface CountryTierSummary {
  country: string;
  countryCode: string;
  flag: string;
  department: string;
  currency: string;
  tiers: {
    topRanked: TierFeeStats;
    midLevel: TierFeeStats;
    emerging: TierFeeStats;
  };
}

export interface CollegeTierItem {
  id: string;
  name: string;
  country: string;
  city: string;
  tier: InstitutionTier;
  rankingInfo?: string;
  annualTuitionFee: number;
  feeCurrency: string;
  sampleCourses: string[];
  acceptanceRate?: string;
  officialWebsiteUrl?: string;
}

export interface ExpenseBreakdown {
  tuitionFee: number;
  livingExpenses: number; // Housing, food, utilities
  healthInsurance: number; // Mandatory student medical cover
  travelExpenses: number; // Visa, flights, local transit
  personalExpenses: number; // Books, leisure, supplies
  totalEstimatedCost: number;
  monthlyLivingEstimate: number;
  currency: string;
  convertedTotal?: number;
  targetCurrency?: string;
  exchangeRateUsed?: number;
}

export interface CourseFeeCalculationInput {
  country: string;
  department: string;
  course: string;
  tier: InstitutionTier;
  currency?: string;
}

export interface CourseFeeCalculationResult {
  input: CourseFeeCalculationInput;
  breakdown: ExpenseBreakdown;
  alternativeOptions: {
    title: string;
    description: string;
    savingsAmount: number;
    recommendedTier?: InstitutionTier;
    recommendedCountry?: string;
  }[];
  referenceDate: string;
  isDemoData: boolean;
}

export interface CountryComparisonItem {
  country: string;
  countryCode: string;
  flag: string;
  currency: string;
  topRankedAvgTuition: number;
  midLevelAvgTuition: number;
  emergingAvgTuition: number;
  avgLivingExpenses: number;
  avgHealthInsurance: number;
  avgTravelExpenses: number;
  avgPersonalExpenses: number;
  totalEstimatedAnnualCost: number;
  affordabilityRank: number; // 1 = most affordable
  affordabilityTier: 'HIGH_AFFORDABILITY' | 'MODERATE' | 'PREMIUM';
}

export interface MultiCountryComparisonResult {
  department: string;
  tier: InstitutionTier;
  baseCurrency: string;
  targetCurrency: string;
  countries: CountryComparisonItem[];
  referenceDate: string;
  exchangeRates: Record<string, number>;
  isDemoData: boolean;
}

export interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  ratePerUSD: number;
}

export interface BudgetDecisionInput {
  country: string;
  department: string;
  course: string;
  tier: InstitutionTier;
  selectedCurrency: string;
  estimatedTotal: number;
  notes?: string;
}

export interface BudgetDecisionRecord extends BudgetDecisionInput {
  id: string;
  studentProfileId?: string;
  savedAt: string;
}
