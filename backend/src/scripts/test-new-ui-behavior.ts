import { prisma } from '../shared/database/prisma.service';

const BASE_URL = 'http://localhost:5000';

async function testNewUiBehavior() {
  console.log('--- TESTING NEW UI FORM BEHAVIOR & UNFINALIZED CHECKBOXES ---');

  // 1. Register student
  const email = `test.student.ui.${Date.now()}@example.com`;
  const regRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'Password123!',
      confirmPassword: 'Password123!',
    }),
  });
  const regData = (await regRes.json()) as any;
  const token = regData.data.tokens.accessToken;
  console.log('✓ Student registered:', email);

  // 2. Submit Basic Information
  const intakeRes = await fetch(`${BASE_URL}/api/v1/profile/intake`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      fullName: 'Aria Sharma',
      gender: 'FEMALE',
      grade: '11th',
      contactEmail: email,
      phone: '+91 9876543210',
      board: 'CBSE',
      citizenship: 'India',
      passingOutYear: 2026,
      address: {
        street: '742 Evergreen Terrace',
        city: 'New Delhi',
        state: 'Delhi',
        postalCode: '110007',
        country: 'India',
      },
    }),
  });
  const intakeData = (await intakeRes.json()) as any;
  console.log('✓ Basic Information created (ID:', intakeData.data.id, ')');

  // 3. Test Preferences with Unfinalized Checkboxes
  console.log('\n[Case A] Saving with "I haven\'t finalized countries" & "I haven\'t finalized courses"');
  const prefUnfinalized = {
    countriesNotFinalized: true,
    countries: [],
    coursesNotFinalized: true,
    departmentPreferences: [],
  };
  const saveUnfinalizedRes = await fetch(`${BASE_URL}/api/v1/preferences/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(prefUnfinalized),
  });
  const saveUnfinalizedData = (await saveUnfinalizedRes.json()) as any;
  if (!saveUnfinalizedRes.ok || !saveUnfinalizedData.data.countriesNotFinalized) {
    throw new Error(`Unfinalized preferences save failed: ${JSON.stringify(saveUnfinalizedData)}`);
  }
  console.log('✓ Successfully saved unfinalized checkboxes:', {
    countriesNotFinalized: saveUnfinalizedData.data.countriesNotFinalized,
    coursesNotFinalized: saveUnfinalizedData.data.coursesNotFinalized,
  });

  // 4. Test Preferences with Multiple Paired Departments & Multiple Countries (Matching Screenshot 1 & 3)
  console.log('\n[Case B] Saving paired department/courses & multiple countries matching Screenshot 1 & 3');
  const prefMulti = {
    countriesNotFinalized: false,
    countries: ['India', 'United States of America'],
    primaryCountry: 'India',
    coursesNotFinalized: false,
    departmentPreferences: [
      {
        department: 'Engineering & Technology',
        subDepartment: 'Computer/Software Engineering',
      },
      {
        department: 'Business & Management',
        subDepartment: 'Finance & Accounting',
      },
    ],
  };
  const saveMultiRes = await fetch(`${BASE_URL}/api/v1/preferences/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(prefMulti),
  });
  const saveMultiData = (await saveMultiRes.json()) as any;
  if (!saveMultiRes.ok || saveMultiData.data.countries.length !== 2) {
    throw new Error(`Multiple preferences save failed: ${JSON.stringify(saveMultiData)}`);
  }
  console.log('✓ Successfully saved paired preferences:');
  console.log('  Countries:', saveMultiData.data.countries);
  console.log('  Department pairs:', saveMultiData.data.departmentPreferences);
  console.log('  Formatted subDepartment view:', saveMultiData.data.subDepartment);

  // 5. Verify Persistence via GET /me
  console.log('\n[Case C] Verifying persistence across reloads via GET /me');
  const getMeRes = await fetch(`${BASE_URL}/api/v1/preferences/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const getMeData = (await getMeRes.json()) as any;
  if (
    !getMeRes.ok ||
    getMeData.data.countries[0] !== 'India' ||
    getMeData.data.departmentPreferences.length !== 2
  ) {
    throw new Error(`Persistence verification failed: ${JSON.stringify(getMeData)}`);
  }
  console.log('✓ Verified: GET /me returns full paired preferences and country selections accurately.');

  console.log('\n--- ALL NEW UI FORM BEHAVIOR CHECKS PASSED (5/5) ---');
}

testNewUiBehavior()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
