const BASE_URL = 'http://localhost:5000/api/v1';

async function request(url: string, options: any = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const body = options.body ? JSON.stringify(options.body) : undefined;
  const res = await fetch(`${BASE_URL}${url}`, {
    method: options.method || 'GET',
    headers,
    body,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function run() {
  console.log('========================================================');
  console.log('🧪 TESTING 3-MEMBER WORKFLOW: STUDENT -> COUNSELLOR -> ADMIN');
  console.log('========================================================');

  const timestamp = Date.now();
  const adminEmail = 'admin@superconsciousness.internal';
  const adminPassword = 'StaffPassword123!';
  const defaultPassword = 'SecurePassword123!';
  const testStudentEmail = `student_${timestamp}@testdomain.com`;
  const testCounsellorEmail = `counsellor_${timestamp}@testdomain.com`;

  // 1. Admin Login
  console.log('\n[1/7] Admin logging in...');
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: adminEmail, password: adminPassword },
  });
  if (!adminLogin.data.success) {
    throw new Error(`Admin login failed: ${JSON.stringify(adminLogin.data)}`);
  }
  const adminToken = adminLogin.data.data.tokens?.accessToken || adminLogin.data.data.token;
  console.log('  ✅ Admin logged in successfully.');

  // 2. Admin creates Active Counsellor
  console.log('\n[2/7] Admin creating and activating Counsellor...');
  const counsellorCreate = await request('/admin/counsellors', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      email: testCounsellorEmail,
      password: defaultPassword,
      fullName: `Counsellor Test ${timestamp.toString().slice(-4)}`,
      phone: '+1 555 401 2299',
      qualification: 'M.Ed. International Career Advisory',
      experienceYears: 6,
      specialization: 'STEM Admissions & Scholarships',
      skills: ['University Selection', 'Career Guidance', 'SOP Review'],
      countriesOfExpertise: ['Germany', 'United States', 'United Kingdom'],
      courseExpertise: ['Computer Science', 'Mechanical Engineering'],
      bio: 'Verified compliance counsellor.',
      capacity: 20,
      verificationStatus: 'ACTIVE',
    },
  });
  if (!counsellorCreate.data.success) {
    throw new Error(`Counsellor creation failed: ${JSON.stringify(counsellorCreate.data)}`);
  }
  const createdCounsellor = counsellorCreate.data.data;
  console.log(`  ✅ Counsellor created: ${createdCounsellor.fullName} (ID: ${createdCounsellor.id})`);

  // Activate Counsellor
  await request(`/admin/counsellors/${createdCounsellor.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { status: 'ACTIVE' },
  });

  // Counsellor Login
  const counsellorLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: testCounsellorEmail, password: defaultPassword },
  });
  const counsellorToken = counsellorLogin.data.data.tokens?.accessToken || counsellorLogin.data.data.token;
  console.log('  ✅ Counsellor logged in successfully.');

  // 3. Student Registration & Profile Intake
  console.log('\n[3/7] Student registering & completing profile intake...');
  const studentReg = await request('/auth/register', {
    method: 'POST',
    body: { email: testStudentEmail, password: defaultPassword },
  });
  const studentToken = studentReg.data.data.tokens?.accessToken || studentReg.data.data.token;

  const intakeRes = await request('/profile/intake', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: {
      fullName: `Student Candidate ${timestamp.toString().slice(-4)}`,
      gender: 'MALE',
      grade: '12th Grade',
      contactEmail: testStudentEmail,
      phone: '+1 555 982 3344',
      board: 'CBSE',
      citizenship: 'Indian',
      passingOutYear: 2026,
      address: {
        street: '100 University Ave',
        city: 'Boston',
        state: 'MA',
        postalCode: '02115',
        country: 'United States',
      },
    },
  });
  const studentProfile = intakeRes.data.data?.profile || intakeRes.data.data;
  console.log(`  ✅ Student registered & profile created (ID: ${studentProfile?.id})`);

  // 4. Student Books Appointment with the Counsellor
  console.log('\n[4/7] Student booking 1-on-1 Appointment with Counsellor...');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const scheduledDate = tomorrow.toISOString().split('T')[0];

  const bookRes = await request('/appointments/book', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: {
      counsellorId: createdCounsellor.id,
      appointmentType: 'CAREER_COUNSELLING',
      scheduledDate,
      timeSlot: '02:00 PM',
      meetingType: 'ONLINE_COUNSELLING',
      studentNotes: 'I want to evaluate German engineering universities and merit scholarship deadlines.',
    },
  });

  if (!bookRes.data.success) {
    throw new Error(`Appointment booking failed: ${JSON.stringify(bookRes.data)}`);
  }
  const bookedAppointment = bookRes.data.data;
  console.log(`  ✅ Appointment Booked! ID: ${bookedAppointment.id}, Status: ${bookedAppointment.status}`);

  // 5. Counsellor receives appointment in schedule
  console.log('\n[5/7] Counsellor checking schedule & launching meeting...');
  const scheduleRes = await request('/appointments/counsellor/schedule', {
    method: 'GET',
    headers: { Authorization: `Bearer ${counsellorToken}` },
  });

  const matchingApt = (scheduleRes.data.data || []).find((a: any) => a.id === bookedAppointment.id);
  if (!matchingApt) {
    throw new Error('Appointment not found in Counsellor schedule!');
  }
  console.log(`  ✅ Counsellor received appointment in schedule: ${matchingApt.title}`);

  // 6. Counsellor starts meeting & records session outcome
  console.log('\n[6/7] Counsellor completes consultation and records outcome with video/audio recording...');
  const outcomeRes = await request(`/appointments/${bookedAppointment.id}/session-outcome`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${counsellorToken}` },
    body: {
      actualStartTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      actualEndTime: new Date().toISOString(),
      durationMinutes: 45,
      sessionOutcome: 'Student academic profile thoroughly evaluated. Shortlisted TU Munich and RWTH Aachen. IELTS mock strategy outlined.',
      recommendations: '1. Prepare mock test\n2. Gather high school transcripts\n3. Review German A1 language requirements',
      followUpRequired: true,
      nextAction: 'Review SOP draft with Counsellor next Tuesday',
      studentInterest: 'INTERESTED',
      targetStream: 'Computer Science & Automation',
      targetDepartments: 'Information Technology',
      targetColleges: 'TU Munich, RWTH Aachen',
      targetCity: 'Munich / Berlin',
      studyScope: 'INTERNATIONAL',
      detailedInterestReport: 'High academic readiness, confirmed interest in European engineering pathways.',
      sendPolicyViaWhatsApp: true,
    },
  });

  if (!outcomeRes.data.success) {
    throw new Error(`Outcome recording failed: ${JSON.stringify(outcomeRes.data)}`);
  }
  const completedAppointment = outcomeRes.data.data;
  console.log(`  ✅ Outcome Recorded! Status: ${completedAppointment.status}, isRecorded: ${completedAppointment.isRecorded}, recordingUrl: ${completedAppointment.recordingUrl}`);

  // 7. Admin views Session Audits
  console.log('\n[7/7] Admin inspecting Session Audit Log & Recording Streams...');
  const adminAuditRes = await request('/admin/session-audits', {
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  if (!adminAuditRes.data.success) {
    throw new Error(`Admin audit fetch failed: ${JSON.stringify(adminAuditRes.data)}`);
  }

  const audits = adminAuditRes.data.data.sessions || [];
  const foundAudit = audits.find((s: any) => s.id === bookedAppointment.id);

  if (!foundAudit) {
    throw new Error(`Newly completed session ${bookedAppointment.id} not found in Admin Session Audits!`);
  }

  console.log('\n========================================================');
  console.log('🎉 3-MEMBER WORKFLOW TEST PASSED WITH 100% SUCCESS!');
  console.log('========================================================');
  console.log('Admin Audit Record Details:');
  console.log('  • Session ID:        ', foundAudit.id);
  console.log('  • Student Candidate: ', foundAudit.student?.name, `(${foundAudit.student?.email})`);
  console.log('  • Conducting Advisor:', foundAudit.counsellor?.name, `(${foundAudit.counsellor?.email})`);
  console.log('  • Status:            ', foundAudit.status);
  console.log('  • Recorded:          ', foundAudit.isRecorded);
  console.log('  • Video Stream URL:  ', foundAudit.recordingUrl);
  console.log('  • Audio Audit URL:   ', foundAudit.audioUrl);
  console.log('  • Outcome Summary:   ', foundAudit.sessionOutcome);
}

run().catch((err) => {
  console.error('\n❌ Test Error:', err);
  process.exit(1);
});
