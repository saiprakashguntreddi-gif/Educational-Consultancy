import {
  CountryTierSummary,
  InstitutionTier,
  TierFeeStats,
  CollegeTierItem,
  CourseFeeCalculationInput,
  CourseFeeCalculationResult,
  MultiCountryComparisonResult,
  CountryComparisonItem,
  BudgetDecisionInput,
  BudgetDecisionRecord,
} from './fees.types';
import {
  SUPPORTED_COUNTRIES,
  SUPPORTED_DEPARTMENTS,
  BENCHMARK_CURRENCIES,
  COUNTRY_TIER_BASELINES,
  SAMPLE_COLLEGES_CATALOG,
  REFERENCE_DATE,
  DEMO_DATA_DISCLAIMER,
  CountryMeta,
} from './fees.data';
import { prisma } from '../../shared/database/prisma.service';

export class FeesService {
  // In-memory persistent cache for student budget decisions
  private static savedBudgetDecisions: Map<string, BudgetDecisionRecord> = new Map();

  /**
   * Return metadata: countries, departments, currencies, reference date
   */
  public static getMetadata() {
    return {
      countries: SUPPORTED_COUNTRIES.map((c) => ({
        code: c.code,
        name: c.name,
        flag: c.flag,
        currencyCode: c.currencyCode,
        currencySymbol: c.currencySymbol,
      })),
      departments: SUPPORTED_DEPARTMENTS.map((d) => ({
        name: d.name,
        sampleCourses: d.sampleCourses,
      })),
      currencies: BENCHMARK_CURRENCIES,
      referenceDate: REFERENCE_DATE,
      disclaimer: DEMO_DATA_DISCLAIMER,
    };
  }

  /**
   * Get currency rate relative to USD
   */
  public static getRate(currencyCode = 'USD'): { rate: number; symbol: string } {
    const found = BENCHMARK_CURRENCIES.find(
      (c) => c.code.toUpperCase() === currencyCode.toUpperCase()
    );
    if (!found) {
      return { rate: 1.0, symbol: '$' };
    }
    return { rate: found.ratePerUSD, symbol: found.symbol };
  }

  /**
   * Helper to find country by name or code
   */
  private static findCountry(countryQuery: string): CountryMeta {
    const q = countryQuery.trim().toLowerCase();
    const found = SUPPORTED_COUNTRIES.find(
      (c) => c.name.toLowerCase() === q || c.code.toLowerCase() === q
    );
    return found || SUPPORTED_COUNTRIES[0]; // Fallback to US
  }

  /**
   * Compute tier fee stats (Avg, Highest, Lowest) for Top Ranked, Mid Level, and Emerging
   */
  public static getCountryTierSummary(
    countryName: string,
    departmentName?: string,
    targetCurrency = 'USD'
  ): CountryTierSummary {
    const country = this.findCountry(countryName);
    const { rate: targetRate, symbol: targetSymbol } = this.getRate(targetCurrency);

    // Base multiplier from department
    let deptMultiplier = 1.0;
    if (departmentName && departmentName.trim()) {
      const dept = SUPPORTED_DEPARTMENTS.find(
        (d) => d.name.toLowerCase() === departmentName.trim().toLowerCase()
      );
      if (dept) {
        deptMultiplier = dept.multiplier;
      }
    }

    const baseline = COUNTRY_TIER_BASELINES[country.name] || COUNTRY_TIER_BASELINES['United States'];

    const formatTier = (
      tier: InstitutionTier,
      label: string,
      base: { avg: number; highest: number; lowest: number }
    ): TierFeeStats => {
      // Adjust with department multiplier and currency conversion
      const rawAvg = Math.round(base.avg * deptMultiplier * targetRate * 100) / 100;
      const rawHigh = Math.round(base.highest * deptMultiplier * targetRate * 100) / 100;
      const rawLow = Math.round(base.lowest * deptMultiplier * targetRate * 100) / 100;

      const sampleCount = SAMPLE_COLLEGES_CATALOG.filter(
        (c) => c.country.toLowerCase() === country.name.toLowerCase() && c.tier === tier
      ).length || 3;

      return {
        tier,
        label,
        avgFeesPerYear: rawAvg,
        highestFees: rawHigh,
        lowestFees: rawLow,
        sampleCollegesCount: sampleCount,
      };
    };

    return {
      country: country.name,
      countryCode: country.code,
      flag: country.flag,
      department: departmentName || 'All Departments',
      currency: targetCurrency,
      tiers: {
        topRanked: formatTier('TOP_RANKED', 'Top Ranked Colleges', baseline.topRanked),
        midLevel: formatTier('MID_LEVEL', 'Mid Level Colleges', baseline.midLevel),
        emerging: formatTier('EMERGING', 'Emerging Institutes', baseline.emerging),
      },
    };
  }

  /**
   * Get list of colleges under a specific tier for View Colleges Modal
   */
  public static async getCollegesByTier(
    countryName: string,
    tier: InstitutionTier,
    departmentName?: string,
    targetCurrency = 'USD'
  ): Promise<CollegeTierItem[]> {
    const country = this.findCountry(countryName);
    const { rate: targetRate } = this.getRate(targetCurrency);

    // 1. First, search if database has matching institutions from Module 6
    try {
      const dbColleges = await prisma.institution.findMany({
        where: {
          country: { contains: country.name },
          isActive: true,
        },
        include: {
          courses: true,
        },
        take: 10,
      });

      if (dbColleges.length > 0) {
        // Map database institutions to CollegeTierItem
        const mapped = dbColleges.map((inst, index) => {
          const avgFeeUSD = inst.minAnnualFee || 35000;
          return {
            id: inst.id,
            name: inst.name,
            country: inst.country,
            city: inst.city || country.name,
            tier: (inst.managedTier as InstitutionTier) || (index % 3 === 0 ? 'TOP_RANKED' : index % 3 === 1 ? 'MID_LEVEL' : 'EMERGING'),
            rankingInfo: inst.rankingInfo || `National Rank #${index + 1}`,
            annualTuitionFee: Math.round(avgFeeUSD * targetRate),
            feeCurrency: targetCurrency,
            sampleCourses: inst.courses.map((c) => c.name).slice(0, 3),
            acceptanceRate: inst.acceptanceRate ? `${Math.round(inst.acceptanceRate * 100)}%` : 'Competitive',
            officialWebsiteUrl: inst.officialWebsiteUrl,
          };
        }).filter((item) => item.tier === tier);

        if (mapped.length > 0) {
          return mapped;
        }
      }
    } catch {
      // In case DB query fails, seamlessly use curated catalog
    }

    // 2. Fall back to curated sample catalog
    const filtered = SAMPLE_COLLEGES_CATALOG.filter(
      (c) => c.country.toLowerCase() === country.name.toLowerCase() && c.tier === tier
    );

    if (filtered.length > 0) {
      return filtered.map((c) => ({
        ...c,
        annualTuitionFee: Math.round(c.annualTuitionFee * targetRate),
        feeCurrency: targetCurrency,
      }));
    }

    // Default dynamic sample generation if specific country has limited seeded cards
    const baseline = COUNTRY_TIER_BASELINES[country.name] || COUNTRY_TIER_BASELINES['United States'];
    const tierBase = tier === 'TOP_RANKED' ? baseline.topRanked : tier === 'MID_LEVEL' ? baseline.midLevel : baseline.emerging;
    const tierName = tier === 'TOP_RANKED' ? 'Top National' : tier === 'MID_LEVEL' ? 'Regional State' : 'Polytechnic & Applied';

    return [
      {
        id: `${country.code.toLowerCase()}-${tier.toLowerCase()}-1`,
        name: `${country.name} ${tierName} University`,
        country: country.name,
        city: `${country.name} Metropolitan City`,
        tier,
        rankingInfo: tier === 'TOP_RANKED' ? 'Global Top 100' : tier === 'MID_LEVEL' ? 'Top 300' : 'Accredited Regional',
        annualTuitionFee: Math.round(tierBase.avg * targetRate),
        feeCurrency: targetCurrency,
        sampleCourses: [
          departmentName ? `${departmentName} Core Track` : 'B.S. in Computer Science',
          'Bachelor of Business Administration',
          'M.S. in Applied Data Intelligence',
        ],
        acceptanceRate: tier === 'TOP_RANKED' ? '8% - 15%' : tier === 'MID_LEVEL' ? '35% - 55%' : '65% - 85%',
        officialWebsiteUrl: 'https://www.study-advisory.org',
      },
      {
        id: `${country.code.toLowerCase()}-${tier.toLowerCase()}-2`,
        name: `Institute of Higher Technology & Sciences (${country.name})`,
        country: country.name,
        city: `${country.name} Tech Campus`,
        tier,
        rankingInfo: tier === 'TOP_RANKED' ? 'Top Research Institute' : 'High Employment Rating',
        annualTuitionFee: Math.round(tierBase.lowest * targetRate),
        feeCurrency: targetCurrency,
        sampleCourses: ['B.S. in Mechanical Engineering', 'B.S. in Biomedical Technology'],
        acceptanceRate: tier === 'TOP_RANKED' ? '12%' : '48%',
        officialWebsiteUrl: 'https://www.study-advisory.org',
      },
    ];
  }

  /**
   * Calculate comprehensive course fee and auxiliary living expenses
   */
  public static calculateCourseFee(input: CourseFeeCalculationInput): CourseFeeCalculationResult {
    const country = this.findCountry(input.country);
    const targetCurrency = input.currency || 'USD';
    const { rate: targetRate, symbol: targetSymbol } = this.getRate(targetCurrency);

    // Department multiplier
    let deptMultiplier = 1.0;
    const dept = SUPPORTED_DEPARTMENTS.find(
      (d) => d.name.toLowerCase() === input.department.trim().toLowerCase()
    );
    if (dept) {
      deptMultiplier = dept.multiplier;
    }

    // Baseline tuition in USD
    const baseline = COUNTRY_TIER_BASELINES[country.name] || COUNTRY_TIER_BASELINES['United States'];
    const tierStat =
      input.tier === 'TOP_RANKED'
        ? baseline.topRanked
        : input.tier === 'MID_LEVEL'
        ? baseline.midLevel
        : baseline.emerging;

    const baseTuitionUSD = tierStat.avg * deptMultiplier;
    const tuitionFee = Math.round(baseTuitionUSD * targetRate * 100) / 100;
    const livingExpenses = Math.round(country.baseLivingCostUSD * targetRate * 100) / 100;
    const healthInsurance = Math.round(country.baseHealthInsuranceUSD * targetRate * 100) / 100;
    const travelExpenses = Math.round(country.baseTravelCostUSD * targetRate * 100) / 100;
    const personalExpenses = Math.round(country.basePersonalCostUSD * targetRate * 100) / 100;

    const totalEstimatedCost = Math.round(
      (tuitionFee + livingExpenses + healthInsurance + travelExpenses + personalExpenses) * 100
    ) / 100;

    const monthlyLivingEstimate = Math.round((livingExpenses / 12) * 100) / 100;

    // Generate lower-cost alternatives
    const alternativeOptions = [];

    if (input.tier === 'TOP_RANKED') {
      const midLevelTuition = Math.round(baseline.midLevel.avg * deptMultiplier * targetRate);
      const savings = Math.max(0, tuitionFee - midLevelTuition);
      if (savings > 0) {
        alternativeOptions.push({
          title: `Consider Mid Level Colleges in ${country.name}`,
          description: `Switching from Top-Ranked to a reputable Mid-Level accredited institution can save approximately ${targetSymbol}${savings.toLocaleString()} annually in tuition while preserving strong curriculum quality.`,
          savingsAmount: savings,
          recommendedTier: 'MID_LEVEL' as InstitutionTier,
          recommendedCountry: country.name,
        });
      }
    }

    if (country.name === 'United States' || country.name === 'United Kingdom' || country.name === 'Australia') {
      const deLiving = Math.round(COUNTRY_TIER_BASELINES['Germany'].midLevel.avg * targetRate);
      const crossBorderSavings = Math.max(0, Math.round(tuitionFee - deLiving));
      alternativeOptions.push({
        title: `Explore Public Universities in Germany`,
        description: `Most German public institutions charge zero to nominal tuition fees for international students, reducing annual educational expense by up to ${targetSymbol}${crossBorderSavings.toLocaleString()}.`,
        savingsAmount: crossBorderSavings,
        recommendedTier: 'MID_LEVEL' as InstitutionTier,
        recommendedCountry: 'Germany',
      });
    }

    if (country.name === 'United States') {
      const caTuition = Math.round(COUNTRY_TIER_BASELINES['Canada'].midLevel.avg * targetRate);
      const caSavings = Math.max(0, Math.round(tuitionFee - caTuition));
      if (caSavings > 0) {
        alternativeOptions.push({
          title: `Consider Canadian Institutions`,
          description: `Canadian universities offer globally recognized degrees with lower overall tuition and post-graduation work opportunities, saving ~${targetSymbol}${caSavings.toLocaleString()} per year.`,
          savingsAmount: caSavings,
          recommendedTier: 'MID_LEVEL' as InstitutionTier,
          recommendedCountry: 'Canada',
        });
      }
    }

    return {
      input,
      breakdown: {
        tuitionFee,
        livingExpenses,
        healthInsurance,
        travelExpenses,
        personalExpenses,
        totalEstimatedCost,
        monthlyLivingEstimate,
        currency: targetCurrency,
        convertedTotal: totalEstimatedCost,
        targetCurrency,
        exchangeRateUsed: targetRate,
      },
      alternativeOptions,
      referenceDate: REFERENCE_DATE,
      isDemoData: true,
    };
  }

  /**
   * Multi-country side-by-side comparison
   */
  public static compareCountries(
    countryNames: string[],
    department = 'Engineering & Technology',
    tier: InstitutionTier = 'TOP_RANKED',
    targetCurrency = 'USD'
  ): MultiCountryComparisonResult {
    const { rate: targetRate } = this.getRate(targetCurrency);
    const validCountries = (countryNames.length ? countryNames : ['United States', 'United Kingdom', 'Canada', 'Germany'])
      .map((name) => this.findCountry(name));

    // Remove duplicates
    const uniqueCountries = Array.from(new Set(validCountries.map((c) => c.name)))
      .map((name) => validCountries.find((c) => c.name === name)!);

    let deptMultiplier = 1.0;
    const dept = SUPPORTED_DEPARTMENTS.find(
      (d) => d.name.toLowerCase() === department.trim().toLowerCase()
    );
    if (dept) {
      deptMultiplier = dept.multiplier;
    }

    const items: CountryComparisonItem[] = uniqueCountries.map((country) => {
      const baseline = COUNTRY_TIER_BASELINES[country.name] || COUNTRY_TIER_BASELINES['United States'];

      const topRankedAvg = Math.round(baseline.topRanked.avg * deptMultiplier * targetRate);
      const midLevelAvg = Math.round(baseline.midLevel.avg * deptMultiplier * targetRate);
      const emergingAvg = Math.round(baseline.emerging.avg * deptMultiplier * targetRate);

      const living = Math.round(country.baseLivingCostUSD * targetRate);
      const health = Math.round(country.baseHealthInsuranceUSD * targetRate);
      const travel = Math.round(country.baseTravelCostUSD * targetRate);
      const personal = Math.round(country.basePersonalCostUSD * targetRate);

      // Selected tier tuition
      const selectedTuition = tier === 'TOP_RANKED' ? topRankedAvg : tier === 'MID_LEVEL' ? midLevelAvg : emergingAvg;
      const totalEstimated = selectedTuition + living + health + travel + personal;

      return {
        country: country.name,
        countryCode: country.code,
        flag: country.flag,
        currency: targetCurrency,
        topRankedAvgTuition: topRankedAvg,
        midLevelAvgTuition: midLevelAvg,
        emergingAvgTuition: emergingAvg,
        avgLivingExpenses: living,
        avgHealthInsurance: health,
        avgTravelExpenses: travel,
        avgPersonalExpenses: personal,
        totalEstimatedAnnualCost: totalEstimated,
        affordabilityRank: 0, // Computed below
        affordabilityTier: totalEstimated < 25000 ? 'HIGH_AFFORDABILITY' : totalEstimated < 55000 ? 'MODERATE' : 'PREMIUM',
      };
    });

    // Sort ascending by total cost to assign rank
    items.sort((a, b) => a.totalEstimatedAnnualCost - b.totalEstimatedAnnualCost);
    items.forEach((item, idx) => {
      item.affordabilityRank = idx + 1;
    });

    const exchangeRatesMap: Record<string, number> = {};
    BENCHMARK_CURRENCIES.forEach((c) => {
      exchangeRatesMap[c.code] = c.ratePerUSD;
    });

    return {
      department,
      tier,
      baseCurrency: 'USD',
      targetCurrency,
      countries: items,
      referenceDate: REFERENCE_DATE,
      exchangeRates: exchangeRatesMap,
      isDemoData: true,
    };
  }

  /**
   * Save a student budget decision or affordability plan
   */
  public static async saveBudgetDecision(
    input: BudgetDecisionInput,
    studentProfileId?: string
  ): Promise<BudgetDecisionRecord> {
    const record: BudgetDecisionRecord = {
      ...input,
      id: `decision-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      studentProfileId,
      savedAt: new Date().toISOString(),
    };

    this.savedBudgetDecisions.set(record.id, record);
    return record;
  }
}
