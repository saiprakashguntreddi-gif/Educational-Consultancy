import { Request, Response } from 'express';
import { FeesService } from './fees.service';
import { ApiResponse } from '../../shared/utils/api-response';
import {
  TierSummaryQuerySchema,
  CollegesQuerySchema,
  CalculateCourseFeeSchema,
  CompareCountriesSchema,
  BudgetDecisionSchema,
} from './fees.validation';

export class FeesController {
  /**
   * GET /api/v1/fees/meta
   * Returns supported countries, departments, benchmark currencies, reference date, and disclaimer
   */
  public static async getMeta(_req: Request, res: Response): Promise<Response> {
    try {
      const meta = FeesService.getMetadata();
      return ApiResponse.success(res, meta, 'Fees metadata retrieved successfully');
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to fetch fees metadata', 500);
    }
  }

  /**
   * GET /api/v1/fees/tier-summary
   * Returns 3-tier fee statistics (Avg, Highest, Lowest) for Top Ranked, Mid Level, and Emerging
   */
  public static async getTierSummary(req: Request, res: Response): Promise<Response> {
    try {
      const parsed = TierSummaryQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return ApiResponse.error(res, parsed.error.format(), 400, 'Invalid query parameters');
      }

      const { country, department, currency } = parsed.data;
      const summary = FeesService.getCountryTierSummary(country, department, currency);
      return ApiResponse.success(res, summary, `Tier fee summary for ${country} retrieved`);
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to fetch tier summary', 500);
    }
  }

  /**
   * GET /api/v1/fees/colleges
   * Returns sample or database colleges in the specified tier for "View Colleges" modal
   */
  public static async getColleges(req: Request, res: Response): Promise<Response> {
    try {
      const parsed = CollegesQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return ApiResponse.error(res, parsed.error.format(), 400, 'Invalid query parameters');
      }

      const { country, tier, department, currency } = parsed.data;
      const colleges = await FeesService.getCollegesByTier(country, tier, department, currency);
      return ApiResponse.success(res, colleges, `Colleges for ${tier} tier in ${country} retrieved`);
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to fetch colleges for tier', 500);
    }
  }

  /**
   * POST /api/v1/fees/calculate
   * Calculates comprehensive course fees, living, insurance, travel, personal expenses, and total
   */
  public static async calculate(req: Request, res: Response): Promise<Response> {
    try {
      const parsed = CalculateCourseFeeSchema.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponse.error(res, parsed.error.format(), 400, 'Invalid calculation input');
      }

      const result = FeesService.calculateCourseFee(parsed.data);
      return ApiResponse.success(res, result, 'Course fee calculation computed successfully');
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to calculate course fees', 500);
    }
  }

  /**
   * POST /api/v1/fees/compare
   * Side-by-side country comparison across 2 or more countries
   */
  public static async compare(req: Request, res: Response): Promise<Response> {
    try {
      const parsed = CompareCountriesSchema.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponse.error(res, parsed.error.format(), 400, 'Invalid country comparison input');
      }

      const { countries, department, tier, currency } = parsed.data;
      const comparison = FeesService.compareCountries(countries, department, tier, currency);
      return ApiResponse.success(res, comparison, 'Country comparison generated successfully');
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to generate country comparison', 500);
    }
  }

  /**
   * POST /api/v1/fees/budget-decision
   * Save an affordability plan or budget decision
   */
  public static async saveBudgetDecision(req: Request, res: Response): Promise<Response> {
    try {
      const parsed = BudgetDecisionSchema.safeParse(req.body);
      if (!parsed.success) {
        return ApiResponse.error(res, parsed.error.format(), 400, 'Invalid budget decision input');
      }

      // Check if user is authenticated and has a student profile ID
      const user = (req as any).user;
      let studentProfileId: string | undefined;
      if (user?.id) {
        studentProfileId = user.id;
      }

      const record = await FeesService.saveBudgetDecision(parsed.data, studentProfileId);
      return ApiResponse.created(res, record, 'Budget decision saved successfully');
    } catch (err: any) {
      return ApiResponse.error(res, err.message || 'Failed to save budget decision', 500);
    }
  }
}
