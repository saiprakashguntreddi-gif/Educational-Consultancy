import { apiClient, ApiResponse } from '../../../shared/services/api-client';
import { API_ENDPOINTS } from '../../../config/api.config';
import {
  FeesMetadata,
  CountryTierSummary,
  CollegeTierItem,
  InstitutionTier,
  CourseFeeCalculationInput,
  CourseFeeCalculationResult,
  MultiCountryComparisonResult,
  BudgetDecisionInput,
} from '../fees.types';

export class FeesService {
  public static async getMetadata(): Promise<ApiResponse<FeesMetadata>> {
    return apiClient.get<FeesMetadata>(API_ENDPOINTS.FEES.META);
  }

  public static async getTierSummary(
    country: string,
    department?: string,
    currency = 'USD'
  ): Promise<ApiResponse<CountryTierSummary>> {
    const params = new URLSearchParams();
    params.append('country', country);
    if (department && department !== 'All Departments') {
      params.append('department', department);
    }
    params.append('currency', currency);

    return apiClient.get<CountryTierSummary>(
      `${API_ENDPOINTS.FEES.TIER_SUMMARY}?${params.toString()}`
    );
  }

  public static async getColleges(
    country: string,
    tier: InstitutionTier,
    department?: string,
    currency = 'USD'
  ): Promise<ApiResponse<CollegeTierItem[]>> {
    const params = new URLSearchParams();
    params.append('country', country);
    params.append('tier', tier);
    if (department && department !== 'All Departments') {
      params.append('department', department);
    }
    params.append('currency', currency);

    return apiClient.get<CollegeTierItem[]>(
      `${API_ENDPOINTS.FEES.COLLEGES}?${params.toString()}`
    );
  }

  public static async calculate(
    input: CourseFeeCalculationInput
  ): Promise<ApiResponse<CourseFeeCalculationResult>> {
    return apiClient.post<CourseFeeCalculationResult>(
      API_ENDPOINTS.FEES.CALCULATE,
      input
    );
  }

  public static async compare(
    countries: string[],
    department = 'Engineering & Technology',
    tier: InstitutionTier = 'TOP_RANKED',
    currency = 'USD'
  ): Promise<ApiResponse<MultiCountryComparisonResult>> {
    return apiClient.post<MultiCountryComparisonResult>(
      API_ENDPOINTS.FEES.COMPARE,
      {
        countries,
        department,
        tier,
        currency,
      }
    );
  }

  public static async saveBudgetDecision(
    input: BudgetDecisionInput
  ): Promise<ApiResponse<any>> {
    return apiClient.post<any>(API_ENDPOINTS.FEES.BUDGET_DECISION, input);
  }
}
