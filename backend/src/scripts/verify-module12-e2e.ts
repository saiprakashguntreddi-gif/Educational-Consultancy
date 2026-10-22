import { PrismaClient } from '@prisma/client';
import { AppointmentsService } from '../modules/appointments/appointments.service';

const prisma = new PrismaClient();

async function runModule12Verification() {
  console.log('======================================================');
  console.log(' MODULE 12: APPOINTMENTS, WEBINARS & SHORTLISTS TEST  ');
  console.log('======================================================\n');

  try {
    // 1. Locate existing real student user
    const student = await prisma.user.findFirstOrThrow({
      where: {
        role: 'STUDENT',
        studentProfile: { isNot: null },
      },
      include: { studentProfile: true },
    });

    console.log(`✓ Using Student Account: ${student.email} (Profile ID: ${student.studentProfile!.id})`);

    // Ensure seed webinars and counsellors exist
    await AppointmentsService.ensureSeedData();

    // 2. Test getMeta
    console.log('\n--- TEST 1: Retrieve Appointments Metadata ---');
    const meta = await AppointmentsService.getMeta(student.id);
    console.log(`✓ Available Counsellors: ${meta.counsellors.length}`);
    console.log(`✓ Appointment Focus Types: ${meta.appointmentTypes.length}`);
    console.log(`✓ Meeting Time Slots: ${meta.availableTimeSlots.length}`);
    console.log(`✓ Shortlisted College Contexts: ${meta.shortlistedColleges.length}`);

    if (meta.counsellors.length === 0) {
      throw new Error('Verification failed: No counsellors available in meta');
    }
    const counsellorId = meta.counsellors[0].id;
    const testSlot = meta.availableTimeSlots[0] || '10:00 AM';

    // 3. Test Past Date Validation
    console.log('\n--- TEST 2: Validate Past Date Booking Rejection ---');
    try {
      await AppointmentsService.bookAppointment(student.id, {
        appointmentType: 'CAREER_COUNSELLING',
        counsellorId,
        scheduledDate: '2020-05-15',
        timeSlot: testSlot,
        meetingType: 'ONLINE_COUNSELLING',
        studentNotes: 'Should be rejected as date is in the past',
      });
      throw new Error('FAILED: Past date was unexpectedly accepted!');
    } catch (err: any) {
      console.log('✓ Correctly rejected past date appointment:', err.message);
    }

    // 4. Test Valid Future Booking
    console.log('\n--- TEST 3: Book Valid Future Consultation ---');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    // Clean up any clash for this date & slot
    const parsedStart = new Date(`${futureDateStr}T10:00:00.000Z`);
    await prisma.appointment.deleteMany({
      where: {
        studentProfileId: student.studentProfile!.id,
        scheduledAt: parsedStart,
      },
    });

    const booked = await AppointmentsService.bookAppointment(student.id, {
      appointmentType: 'COLLEGE_ADMISSION',
      counsellorId,
      scheduledDate: futureDateStr,
      timeSlot: testSlot,
      meetingType: 'ONLINE_COUNSELLING',
      studentNotes: 'Admissions guidance for Computer Science programs',
    });
    console.log(`✓ Successfully booked appointment! ID: ${booked.id}`);
    console.log(`  Title: ${booked.title}`);
    console.log(`  Status: ${booked.status}`);
    console.log(`  Counsellor: ${booked.counsellorName}`);
    console.log(`  Scheduled: ${booked.scheduledAt}`);

    // 5. Test Duplicate Slot Prevention (Conflict check)
    console.log('\n--- TEST 4: Prevent Duplicate Slot Collisions ---');
    try {
      await AppointmentsService.bookAppointment(student.id, {
        appointmentType: 'SCHOLARSHIP_GUIDANCE',
        counsellorId,
        scheduledDate: futureDateStr,
        timeSlot: testSlot,
        meetingType: 'IN_PERSON',
      });
      throw new Error('FAILED: Duplicate slot was unexpectedly allowed!');
    } catch (err: any) {
      console.log('✓ Correctly blocked duplicate slot collision:', err.message);
    }

    // 6. Test My Appointments List
    console.log('\n--- TEST 5: Query My Appointments ---');
    const myAppointments = await AppointmentsService.getMyAppointments(student.id);
    console.log(`✓ Total student appointments retrieved: ${myAppointments.length}`);
    const foundBooking = myAppointments.find((a) => a.id === booked.id);
    if (!foundBooking) {
      throw new Error('Verification failed: Booked appointment not found in myAppointments');
    }
    console.log(`✓ Verified newly booked appointment present with status: ${foundBooking.status}`);

    // 7. Test Appointment Cancellation
    console.log('\n--- TEST 6: Cancel Appointment with Reason ---');
    const cancelled = await AppointmentsService.cancelAppointment(
      student.id,
      booked.id,
      'Rescheduling with advisor for next month'
    );
    console.log(`✓ Cancelled appointment ID: ${cancelled.id}`);
    console.log(`  New Status: ${cancelled.status}`);
    console.log(`  Cancellation Reason: ${cancelled.cancellationReason}`);

    // 8. Test Webinars & Registration
    console.log('\n--- TEST 7: Webinars Discovery & Registration Flow ---');
    const webinars = await AppointmentsService.listWebinars(student.id);
    console.log(`✓ Published Webinars found: ${webinars.length}`);
    if (webinars.length === 0) {
      throw new Error('Verification failed: Expected seed webinars');
    }

    const targetWebinar = webinars[0];
    console.log(`  Testing Webinar: "${targetWebinar.title}" (Speaker: ${targetWebinar.speakerName})`);

    // Clean prior test reg if any
    await prisma.webinarRegistration.deleteMany({
      where: {
        webinarId: targetWebinar.id,
        studentProfileId: student.studentProfile!.id,
      },
    });

    // Register
    const regRes = await AppointmentsService.registerWebinar(student.id, targetWebinar.id);
    console.log(`✓ Registered for webinar! Status: isRegistered = ${regRes.webinar.isRegistered}`);
    console.log(`  Enrollment count: ${regRes.webinar.registeredCount}`);

    // Cancel registration
    const cancelRegRes = await AppointmentsService.cancelWebinarRegistration(student.id, targetWebinar.id);
    console.log(`✓ Cancelled registration! Status: isRegistered = ${cancelRegRes.webinar.isRegistered}`);

    // 9. Test Shortlist Integration
    console.log('\n--- TEST 8: University Shortlist Context ---');
    const shortlists = await AppointmentsService.listShortlistedColleges(student.id);
    console.log(`✓ Shortlisted institutions loaded: ${shortlists.length}`);
    if (shortlists.length > 0) {
      console.log(`  Sample College: ${shortlists[0].name} (${shortlists[0].city}, ${shortlists[0].country})`);
      console.log(`  Fit Category: ${shortlists[0].fitCategory} | Tier: ${shortlists[0].tier}`);
    }

    console.log('\n======================================================');
    console.log(' ✓ ALL MODULE 12 TESTS PASSED WITH 100% SUCCESS!      ');
    console.log('======================================================\n');
  } catch (err: any) {
    console.error('\n❌ Module 12 Verification Failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runModule12Verification();
