import http from 'http';

const API_BASE = 'http://localhost:5000/api/v1/fees';

function makeRequest(
  url: string,
  method: string,
  body?: any
): Promise<{ statusCode: number; data: any }> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const req = http.request(
      {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            const data = JSON.parse(raw);
            resolve({ statusCode: res.statusCode || 200, data });
          } catch (e) {
            resolve({ statusCode: res.statusCode || 200, data: raw });
          }
        });
      }
    );

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runModule9Verification() {
  console.log('\n===============================================================');
  console.log(' SUPERCONSCIOUSNESS: MODULE 9 FEE CALCULATOR & COUNTRY COMPARISON');
  console.log(' End-to-End Test Suite');
  console.log('===============================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  // Test 1: GET /api/v1/fees/meta
  totalTests++;
  console.log(`[TEST 1] Testing Metadata endpoint: GET ${API_BASE}/meta`);
  try {
    const res = await makeRequest(`${API_BASE}/meta`, 'GET');
    if (
      res.statusCode === 200 &&
      res.data.success &&
      res.data.data.countries.length >= 8 &&
      res.data.data.currencies.length >= 5
    ) {
      console.log('  ✔ SUCCESS: Metadata returned supported countries, currencies, and reference benchmark date.');
      console.log(`    - Countries count: ${res.data.data.countries.length}`);
      console.log(`    - Reference Date: ${res.data.data.referenceDate}`);
      passedTests++;
    } else {
      console.error('  ✘ FAILED: Metadata response did not match expected structure', res);
    }
  } catch (err: any) {
    console.error('  ✘ FAILED: Request error', err.message);
  }

  // Test 2: GET /api/v1/fees/tier-summary (Check alignment with PDF Screenshot)
  totalTests++;
  console.log(`\n[TEST 2] Testing 3-Tier Fee Summary: GET ${API_BASE}/tier-summary?country=United%20States`);
  try {
    const res = await makeRequest(`${API_BASE}/tier-summary?country=United%20States`, 'GET');
    const tiers = res.data?.data?.tiers;
    if (
      res.statusCode === 200 &&
      tiers &&
      tiers.topRanked.avgFeesPerYear === 39537.92 &&
      tiers.midLevel.avgFeesPerYear === 40718.33 &&
      tiers.emerging.avgFeesPerYear === 28107.63
    ) {
      console.log('  ✔ SUCCESS: Tier fee averages match PDF reference figures exactly:');
      console.log(`    - Top Ranked Avg: $${tiers.topRanked.avgFeesPerYear} (High: $${tiers.topRanked.highestFees}, Low: $${tiers.topRanked.lowestFees})`);
      console.log(`    - Mid Level Avg: $${tiers.midLevel.avgFeesPerYear} (High: $${tiers.midLevel.highestFees}, Low: $${tiers.midLevel.lowestFees})`);
      console.log(`    - Emerging Avg: $${tiers.emerging.avgFeesPerYear} (High: $${tiers.emerging.highestFees}, Low: $${tiers.emerging.lowestFees})`);
      passedTests++;
    } else {
      console.error('  ✘ FAILED: Tier stats did not match expected values', tiers);
    }
  } catch (err: any) {
    console.error('  ✘ FAILED: Request error', err.message);
  }

  // Test 3: GET /api/v1/fees/colleges (View Colleges Modal)
  totalTests++;
  console.log(`\n[TEST 3] Testing View Colleges List: GET ${API_BASE}/colleges?country=United%20States&tier=TOP_RANKED`);
  try {
    const res = await makeRequest(`${API_BASE}/colleges?country=United%20States&tier=TOP_RANKED`, 'GET');
    if (res.statusCode === 200 && res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
      console.log(`  ✔ SUCCESS: Retrieved ${res.data.data.length} colleges for Top Ranked tier.`);
      console.log(`    - Example institution: ${res.data.data[0].name} (${res.data.data[0].annualTuitionFee} ${res.data.data[0].feeCurrency})`);
      passedTests++;
    } else {
      console.error('  ✘ FAILED: Failed to retrieve colleges', res);
    }
  } catch (err: any) {
    console.error('  ✘ FAILED: Request error', err.message);
  }

  // Test 4: POST /api/v1/fees/calculate (Course Fee Calculator)
  totalTests++;
  console.log(`\n[TEST 4] Testing Course Fee Calculation: POST ${API_BASE}/calculate`);
  try {
    const payload = {
      country: 'United States',
      department: 'Computer Science & IT',
      course: 'B.S. in Computer Science & Engineering',
      tier: 'TOP_RANKED',
      currency: 'USD',
    };
    const res = await makeRequest(`${API_BASE}/calculate`, 'POST', payload);
    const bk = res.data?.data?.breakdown;
    if (res.statusCode === 200 && res.data.success && bk && bk.totalEstimatedCost > 0) {
      console.log('  ✔ SUCCESS: Cost breakdown generated with all 5 mandatory cost categories:');
      console.log(`    - Tuition: $${bk.tuitionFee}`);
      console.log(`    - Living Expenses: $${bk.livingExpenses} (~$${bk.monthlyLivingEstimate}/mo)`);
      console.log(`    - Health Insurance: $${bk.healthInsurance}`);
      console.log(`    - Travel & Visa: $${bk.travelExpenses}`);
      console.log(`    - Personal Expenses: $${bk.personalExpenses}`);
      console.log(`    - TOTAL Annual Estimated Cost: $${bk.totalEstimatedCost}`);
      console.log(`    - Alternative Options Count: ${res.data.data.alternativeOptions.length}`);
      passedTests++;
    } else {
      console.error('  ✘ FAILED: Cost breakdown incomplete or failed', res);
    }
  } catch (err: any) {
    console.error('  ✘ FAILED: Request error', err.message);
  }

  // Test 5: POST /api/v1/fees/compare (Multi-Country Side-by-Side Comparison)
  totalTests++;
  console.log(`\n[TEST 5] Testing Multi-Country Comparison: POST ${API_BASE}/compare`);
  try {
    const payload = {
      countries: ['United States', 'United Kingdom', 'Canada', 'Germany'],
      department: 'Engineering & Technology',
      tier: 'TOP_RANKED',
      currency: 'USD',
    };
    const res = await makeRequest(`${API_BASE}/compare`, 'POST', payload);
    const countries = res.data?.data?.countries;
    if (
      res.statusCode === 200 &&
      res.data.success &&
      Array.isArray(countries) &&
      countries.length === 4
    ) {
      console.log('  ✔ SUCCESS: Successfully compared 4 destination countries side-by-side:');
      countries.forEach((c: any) => {
        console.log(`    - #${c.affordabilityRank} ${c.country} (${c.flag}): Total $${c.totalEstimatedAnnualCost} (${c.affordabilityTier})`);
      });
      passedTests++;
    } else {
      console.error('  ✘ FAILED: Comparison failed', res);
    }
  } catch (err: any) {
    console.error('  ✘ FAILED: Request error', err.message);
  }

  // Test 6: POST /api/v1/fees/budget-decision
  totalTests++;
  console.log(`\n[TEST 6] Testing Save Budget Decision: POST ${API_BASE}/budget-decision`);
  try {
    const payload = {
      country: 'Canada',
      department: 'Business & Management',
      course: 'Bachelor of Business Administration',
      tier: 'MID_LEVEL',
      selectedCurrency: 'CAD',
      estimatedTotal: 48500,
      notes: 'Planning for Fall 2026 intake',
    };
    const res = await makeRequest(`${API_BASE}/budget-decision`, 'POST', payload);
    if (res.statusCode === 201 && res.data.success && res.data.data.id) {
      console.log(`  ✔ SUCCESS: Budget decision record created with ID: ${res.data.data.id}`);
      passedTests++;
    } else {
      console.error('  ✘ FAILED: Budget decision could not be saved', res);
    }
  } catch (err: any) {
    console.error('  ✘ FAILED: Request error', err.message);
  }

  // Summary
  console.log('\n===============================================================');
  console.log(` MODULE 9 VERIFICATION RESULT: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('===============================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runModule9Verification().catch((e) => {
  console.error(e);
  process.exit(1);
});
