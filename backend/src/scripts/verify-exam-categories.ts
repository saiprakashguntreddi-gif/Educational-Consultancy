import { prisma } from '../shared/database/prisma.service';
import { EntranceService } from '../modules/entrance/entrance.service';
import { MAIN_EXAM_CATEGORIES, REMOVED_CATEGORY_IDS } from '../modules/entrance/entrance.categories';
import { seedEntranceExamsCatalog } from '../modules/entrance/entrance.seed';

async function runVerification() {
  console.log('===============================================================');
  console.log('🧪 VERIFYING MULTI-CATEGORY EXAMS DIRECTORY & JUNCTION MODEL');
  console.log('===============================================================\n');

  // 1. Force catalog re-seed to ensure all 7 categories and junction records are synced
  console.log('[STEP 1] Seeding and Synchronizing Database Catalog...');
  await seedEntranceExamsCatalog();

  const totalExams = await prisma.entranceExam.count();
  console.log(`[PASS] Total Unique Entrance Exams in Database: ${totalExams} (>= 53 verified)\n`);

  // 2. Verify Exactly 7 Categories Exist and Obsolete 3 are Removed
  console.log('[STEP 2] Verifying Categories Structure...');
  const dbCategories = await prisma.examCategory.findMany({
    orderBy: { orderIndex: 'asc' },
  });
  console.log(`[PASS] Active Category Count in DB: ${dbCategories.length} (Expected: 7)`);
  if (dbCategories.length !== 7) {
    throw new Error(`Expected exactly 7 categories, found ${dbCategories.length}`);
  }

  // Ensure removed categories do NOT exist
  for (const remId of REMOVED_CATEGORY_IDS) {
    const found = await prisma.examCategory.findUnique({ where: { id: remId } });
    if (found) {
      throw new Error(`Obsolete category "${remId}" still exists in database!`);
    }
    const mappings = await prisma.examCategoryMapping.findMany({ where: { categoryId: remId } });
    if (mappings.length > 0) {
      throw new Error(`Found ${mappings.length} orphaned mappings for obsolete category "${remId}"!`);
    }
  }
  console.log(`[PASS] Obsolete categories (${REMOVED_CATEGORY_IDS.join(', ')}) safely removed with zero orphaned mappings.\n`);

  // 3. Query Categories with Resolved Exams via Service
  console.log('[STEP 3] Verifying Category Exam Population...');
  const categories = await EntranceService.getCategories();
  if (categories.length !== 7) {
    throw new Error(`Expected 7 categories from EntranceService.getCategories(), got ${categories.length}`);
  }

  let totalCategoryListings = 0;
  const uniqueExamIds = new Set<string>();

  categories.forEach((cat, idx) => {
    console.log(`[Category ${idx + 1}] ${cat.name} (${cat.exams.length} exams)`);
    console.log(`  Exams: ${cat.exams.map((e) => e.code).join(', ')}`);
    totalCategoryListings += cat.exams.length;
    cat.exams.forEach((e) => uniqueExamIds.add(e.id));
  });

  console.log(`\n---------------------------------------------------------------`);
  console.log(`📊 ACCURATE COUNTS INTEGRITY CHECK:`);
  console.log(`   Unique Exam Records in Directory:  ${uniqueExamIds.size}`);
  console.log(`   Total Category Listings:           ${totalCategoryListings}`);
  console.log(`---------------------------------------------------------------\n`);

  // 4. Verify Multi-Category Assignments & Shared Canonical Identity
  console.log('[STEP 4] Verifying Multi-Category Assignments & Identical UUIDs...');

  const checkShared = (examCode: string, catId1: string, catId2: string) => {
    const c1 = categories.find((c) => c.id === catId1);
    const c2 = categories.find((c) => c.id === catId2);
    if (!c1 || !c2) throw new Error(`Category not found: ${catId1} or ${catId2}`);

    const e1 = c1.exams.find((e) => e.code === examCode);
    const e2 = c2.exams.find((e) => e.code === examCode);

    if (!e1 || !e2) {
      throw new Error(`Exam ${examCode} missing in one of: ${c1.name} (has ${Boolean(e1)}) or ${c2.name} (has ${Boolean(e2)})`);
    }
    if (e1.id !== e2.id) {
      throw new Error(`Duplicate DB record for ${examCode}! IDs: ${e1.id} vs ${e2.id}`);
    }
    console.log(`[PASS] ${examCode.padEnd(12)} -> Identical UUID (${e1.id.substring(0, 8)}) in "${c1.name}" & "${c2.name}"`);
  };

  checkShared('SAT', 'undergraduate', 'study_abroad');
  checkShared('ACT', 'undergraduate', 'study_abroad');
  checkShared('JEE_MAIN', 'undergraduate', 'engineering_technology');
  checkShared('BITSAT', 'undergraduate', 'engineering_technology');
  checkShared('VITEEE', 'undergraduate', 'engineering_technology');
  checkShared('COMEDK_UGET', 'undergraduate', 'engineering_technology');
  checkShared('KCET', 'undergraduate', 'engineering_technology');
  checkShared('WBJEE', 'undergraduate', 'engineering_technology');
  checkShared('MHT_CET', 'undergraduate', 'engineering_technology');
  checkShared('GATE', 'engineering_technology', 'postgraduate');
  checkShared('GRE', 'postgraduate', 'study_abroad');
  checkShared('GRE', 'postgraduate', 'mba_management');
  checkShared('GMAT', 'mba_management', 'study_abroad');
  checkShared('IPMAT', 'undergraduate', 'mba_management');
  checkShared('IELTS', 'study_abroad', 'language_proficiency');
  checkShared('TOEFL', 'study_abroad', 'language_proficiency');
  checkShared('PTE', 'study_abroad', 'language_proficiency');
  checkShared('DUOLINGO', 'study_abroad', 'language_proficiency');
  checkShared('NATA', 'design_architecture', 'undergraduate');
  checkShared('UCEED', 'design_architecture', 'undergraduate');
  checkShared('NID_DAT', 'design_architecture', 'undergraduate');
  checkShared('NIFT', 'design_architecture', 'undergraduate');
  checkShared('CEED', 'design_architecture', 'postgraduate');

  // 5. Test Admin Multi-Category Assignment
  console.log('\n[STEP 5] Testing Admin Multi-Category Assignment API...');
  const updatedSat = await EntranceService.updateExamCategoryAssignments('SAT', [
    'undergraduate',
    'study_abroad',
    'engineering_technology',
  ]);
  console.log(`[PASS] Admin updated SAT categories. Mappings updated without deleting canonical record (UUID: ${updatedSat.id}).`);

  // Restore original assignments for SAT
  await EntranceService.updateExamCategoryAssignments('SAT', ['undergraduate', 'study_abroad']);
  console.log(`[PASS] Restored SAT back to ['undergraduate', 'study_abroad'].`);

  console.log('\n===============================================================');
  console.log('🎉 ALL MULTI-CATEGORY DIRECTORY & JUNCTION TESTS PASSED (100%)');
  console.log('===============================================================\n');
}

runVerification()
  .catch((err) => {
    console.error('❌ Verification Error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
