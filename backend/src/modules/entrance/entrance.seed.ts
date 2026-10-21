import { prisma } from '../../shared/database/prisma.service';

export async function seedEntranceExamsCatalog() {
  const examsData = [
    {
      code: 'SAT',
      name: 'SAT (Scholastic Assessment Test)',
      category: 'UNDERGRADUATE',
      description:
        'A standardized digital computer-based test widely used for undergraduate college admissions in the United States, Canada, and global universities.',
      destinations: JSON.stringify([
        'United States',
        'Canada',
        'Singapore',
        'Australia',
        'United Kingdom',
        'Germany',
        'India',
      ]),
      relevantStreams: JSON.stringify([
        'Engineering & Technology',
        'Business & Management',
        'Arts & Humanities',
        'Natural Sciences',
        'All',
      ]),
      format: 'Digital adaptive test via the College Board Bluebook app.',
      sections: JSON.stringify([
        {
          name: 'Reading and Writing',
          questions: 54,
          durationMinutes: 64,
          description: 'Two 32-minute modules evaluating comprehension, rhetoric, vocabulary, and grammar.',
        },
        {
          name: 'Math',
          questions: 44,
          durationMinutes: 70,
          description: 'Two 35-minute modules assessing algebra, advanced math, problem-solving, and geometry with built-in Desmos graphing calculator.',
        },
      ]),
      totalDurationMinutes: 134,
      scoreRange: '400 – 1600',
      scoringDetails:
        'Total score is the sum of two section scores: Reading & Writing (200-800) and Math (200-800). No penalty for guessing.',
      validity: '5 years from test date',
      importantDates: JSON.stringify([
        {
          label: 'Spring Test Window',
          date: 'March 2026 & May 2026',
          deadline: 'Approx. 21 days before test date',
          notes: 'Registration via College Board account.',
        },
        {
          label: 'Summer & Fall Test Windows',
          date: 'June, August & October 2026',
          deadline: 'Approx. 21 days before test date',
          notes: 'International test centers fill quickly.',
        },
      ]),
      officialWebsiteUrl: 'https://satsuite.collegeboard.org/sat',
      prepResources: JSON.stringify([
        {
          title: 'Official Digital SAT Practice on Khan Academy',
          type: 'Practice',
          url: 'https://www.khanacademy.org/sat',
          isFree: true,
        },
        {
          title: 'College Board Bluebook Official Testing App',
          type: 'Official Portal',
          url: 'https://bluebook.collegeboard.org/',
          isFree: true,
        },
      ]),
      recommendedBooks: JSON.stringify([
        'The Official Digital SAT Study Guide by College Board',
        "Barron's Digital SAT Premium Study Guide",
        "The Critical Reader: The Complete Guide to SAT Reading by Erica L. Meltzer",
      ]),
      testDayTips: JSON.stringify([
        'Ensure your laptop/tablet is fully charged and the Bluebook app is downloaded 48 hours prior.',
        'Bring an approved photo ID and your printed or digital exam admission ticket.',
        'Take advantage of the built-in Desmos graphing calculator during the Math section.',
        'Answer every question since there is no negative marking.',
      ]),
      hasMockTest: true,
    },
    {
      code: 'ACT',
      name: 'ACT (American College Testing)',
      category: 'UNDERGRADUATE',
      description:
        'A comprehensive standardized test measuring high school achievement and college readiness for undergraduate admissions in the US and Canada.',
      destinations: JSON.stringify(['United States', 'Canada']),
      relevantStreams: JSON.stringify(['Engineering & Technology', 'Business & Management', 'All']),
      format: 'Computer-based testing for international students; paper/computer in the US.',
      sections: JSON.stringify([
        { name: 'English', questions: 75, durationMinutes: 45, description: 'Usage, mechanics, and rhetorical skills.' },
        { name: 'Mathematics', questions: 60, durationMinutes: 60, description: 'Algebra, geometry, trigonometry.' },
        { name: 'Reading', questions: 40, durationMinutes: 35, description: 'Reading comprehension across multiple genres.' },
        { name: 'Science', questions: 40, durationMinutes: 35, description: 'Data representation, research summaries, conflicting viewpoints.' },
      ]),
      totalDurationMinutes: 175,
      scoreRange: '1 – 36 Composite',
      scoringDetails: 'Composite score is the average of English, Math, Reading, and Science sections. Optional Writing scored 2-12.',
      validity: '5 years from test date',
      importantDates: JSON.stringify([
        { label: 'Upcoming Test Window', date: 'April & June 2026', deadline: 'Approx 4 weeks prior' },
      ]),
      officialWebsiteUrl: 'https://www.act.org',
      prepResources: JSON.stringify([
        { title: 'Official ACT Practice Tests', type: 'Practice', url: 'https://www.act.org/content/act/en/products-and-services/the-act/test-preparation.html', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'The Official ACT Prep Guide by Wiley',
        'Manhattan Prep ACT 5 lb. Book of Practice Problems',
      ]),
      testDayTips: JSON.stringify([
        'Pacing is critical on the ACT; practice answering roughly one question per minute in Math.',
        'Use the Science section charts and trends to locate answers quickly without over-reading text.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'IELTS',
      name: 'IELTS Academic (International English Language Testing System)',
      category: 'LANGUAGE_PROFICIENCY',
      description:
        'The global benchmark English proficiency exam recognized by over 11,000 universities and immigration authorities across the UK, Canada, Australia, US, and Europe.',
      destinations: JSON.stringify([
        'United Kingdom',
        'Canada',
        'Australia',
        'United States',
        'Germany',
        'Ireland',
        'New Zealand',
      ]),
      relevantStreams: JSON.stringify(['All']),
      format: 'Computer-delivered or Paper-based testing with a face-to-face speaking interview.',
      sections: JSON.stringify([
        { name: 'Listening', questions: 40, durationMinutes: 30, description: 'Four recorded monologues and conversations.' },
        { name: 'Reading', questions: 40, durationMinutes: 60, description: 'Three authentic academic texts.' },
        { name: 'Writing', questions: 2, durationMinutes: 60, description: 'Task 1 (graph/chart analysis) and Task 2 (argumentative essay).' },
        { name: 'Speaking', questions: 3, durationMinutes: 14, description: 'One-on-one interview with an accredited examiner.' },
      ]),
      totalDurationMinutes: 164,
      scoreRange: '0 – 9.0 Band Scale',
      scoringDetails: 'Scored in 0.5 band increments. Overall band is the arithmetic average of the four components.',
      validity: '2 years from test date',
      importantDates: JSON.stringify([
        { label: 'Year-Round Test Dates', date: 'Available weekly at British Council & IDP centers', notes: 'Results available in 3-5 days for computer tests.' },
      ]),
      officialWebsiteUrl: 'https://www.ielts.org',
      prepResources: JSON.stringify([
        { title: 'British Council Road to IELTS Free Preparation', type: 'Practice', url: 'https://takeielts.britishcouncil.org/take-ielts/prepare', isFree: true },
        { title: 'IDP IELTS Official Sample Questions', type: 'Guide', url: 'https://ielts.idp.com/prepare/article-free-practice-tests', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'The Official Cambridge Guide to IELTS',
        'Cambridge IELTS Academic Practice Test Series (Books 15–19)',
      ]),
      testDayTips: JSON.stringify([
        'Pay strict attention to word count instructions in Writing (minimum 150 words for Task 1, 250 words for Task 2).',
        'Use the 30-second pauses in Listening to skim ahead and underline keywords.',
      ]),
      hasMockTest: true,
    },
    {
      code: 'TOEFL',
      name: 'TOEFL iBT (Test of English as a Foreign Language)',
      category: 'LANGUAGE_PROFICIENCY',
      description:
        'Standardized English language assessment administered by ETS, widely accepted by universities in the USA, Canada, UK, and worldwide.',
      destinations: JSON.stringify(['United States', 'Canada', 'United Kingdom', 'Germany', 'Australia']),
      relevantStreams: JSON.stringify(['All']),
      format: 'Computer-delivered test at certified test centers or Home Edition.',
      sections: JSON.stringify([
        { name: 'Reading', questions: 20, durationMinutes: 35, description: 'Two academic passages with 10 questions each.' },
        { name: 'Listening', questions: 28, durationMinutes: 36, description: 'Three lectures and two conversations.' },
        { name: 'Speaking', questions: 4, durationMinutes: 16, description: 'One independent and three integrated speaking tasks.' },
        { name: 'Writing', questions: 2, durationMinutes: 29, description: 'Integrated writing task and Academic Discussion task.' },
      ]),
      totalDurationMinutes: 116,
      scoreRange: '0 – 120 Total',
      scoringDetails: 'Four sections scored from 0 to 30 points each. Combined total 0-120.',
      validity: '2 years from test date',
      importantDates: JSON.stringify([
        { label: 'Weekly Testing', date: 'Offered over 60 times a year', notes: 'Instant unofficial Reading and Listening scores upon completion.' },
      ]),
      officialWebsiteUrl: 'https://www.ets.org/toefl',
      prepResources: JSON.stringify([
        { title: 'ETS TOEFL Free Practice Test', type: 'Practice', url: 'https://www.ets.org/toefl/test-takers/ibt/prepare/practice-tests.html', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'The Official Guide to the TOEFL iBT Test by ETS',
        'Barron’s TOEFL iBT with Online Practice',
      ]),
      testDayTips: JSON.stringify([
        'Speak clearly and at a natural pace into the headset microphone during the speaking section.',
        'Familiarize yourself with QWERTY keyboards before test day for the writing section.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'GRE',
      name: 'GRE General Test (Graduate Record Examination)',
      category: 'POSTGRADUATE',
      description:
        'The premier graduate admissions exam for master’s, MBA, and doctoral degree programs globally.',
      destinations: JSON.stringify(['United States', 'Canada', 'United Kingdom', 'Germany', 'Singapore']),
      relevantStreams: JSON.stringify(['Engineering & Technology', 'Natural Sciences', 'Business & Management', 'All']),
      format: 'Computer-based shortened format (under 2 hours).',
      sections: JSON.stringify([
        { name: 'Analytical Writing', questions: 1, durationMinutes: 30, description: 'Analyze an Issue task.' },
        { name: 'Verbal Reasoning', questions: 27, durationMinutes: 41, description: 'Two sections evaluating text completion, sentence equivalence, reading.' },
        { name: 'Quantitative Reasoning', questions: 27, durationMinutes: 47, description: 'Two sections evaluating arithmetic, algebra, geometry, data analysis.' },
      ]),
      totalDurationMinutes: 118,
      scoreRange: '260 – 340 (Verbal/Quant) + 0–6.0 (AWA)',
      scoringDetails: 'Verbal (130-170) and Quant (130-170) in 1-point increments. Analytical Writing scored 0-6 in half-point increments.',
      validity: '5 years from test date',
      importantDates: JSON.stringify([
        { label: 'Continuous Testing', date: 'Available year-round on computer', notes: 'Retake allowed every 21 days up to 5 times in 12 months.' },
      ]),
      officialWebsiteUrl: 'https://www.ets.org/gre',
      prepResources: JSON.stringify([
        { title: 'ETS POWERPREP Online Practice Tests', type: 'Official Portal', url: 'https://www.ets.org/gre/test-takers/general-test/prepare/powerprep.html', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'The Official Guide to the GRE General Test by ETS',
        'Manhattan Prep 5 lb. Book of GRE Practice Problems',
        "GregMat+ Test Prep Resources",
      ]),
      testDayTips: JSON.stringify([
        'Make full use of the section calculator provided on-screen during Quantitative Reasoning.',
        'Review high-frequency vocabulary roots, prefixes, and sentence equivalence contextual clues.',
      ]),
      hasMockTest: true,
    },
    {
      code: 'GMAT',
      name: 'GMAT Focus Edition',
      category: 'POSTGRADUATE',
      description:
        'The tailored, modern assessment designed specifically for business school and executive master admissions worldwide.',
      destinations: JSON.stringify(['United States', 'United Kingdom', 'Canada', 'France', 'Singapore', 'India']),
      relevantStreams: JSON.stringify(['Business & Management', 'Finance', 'Economics']),
      format: 'Computer-adaptive test allowing question review and editing.',
      sections: JSON.stringify([
        { name: 'Quantitative Reasoning', questions: 21, durationMinutes: 45, description: 'Problem solving in arithmetic and algebra.' },
        { name: 'Verbal Reasoning', questions: 23, durationMinutes: 45, description: 'Critical reasoning and reading comprehension.' },
        { name: 'Data Insights', questions: 20, durationMinutes: 45, description: 'Data sufficiency, multi-source reasoning, table analysis, graphics.' },
      ]),
      totalDurationMinutes: 135,
      scoreRange: '205 – 805 Total Scale',
      scoringDetails: 'Scored in 10-point increments ending in 5. Each section scored from 60 to 90.',
      validity: '5 years from test date',
      importantDates: JSON.stringify([
        { label: 'Year-Round Registration', date: 'Available on-demand at test centers or online' },
      ]),
      officialWebsiteUrl: 'https://www.mba.com/exams/gmat-focus-edition',
      prepResources: JSON.stringify([
        { title: 'mba.com Official Starter Kit + Practice Exams 1 & 2', type: 'Official Portal', url: 'https://www.mba.com/exam-prep', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'GMAT Official Guide 2024–2025 Focus Edition',
        'Powerscore GMAT Critical Reasoning Bible',
      ]),
      testDayTips: JSON.stringify([
        'You can select the section order that plays best to your mental stamina.',
        'You may bookmark and edit up to 3 answers per section before finishing.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'JEE_MAIN',
      name: 'JEE Main (Joint Entrance Examination)',
      category: 'UNDERGRADUATE',
      description:
        'National engineering entrance examination for admission into NITs, IIITs, CFTIs, and premier engineering universities in India.',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Engineering & Technology', 'Computer/Software Engineering']),
      format: 'Computer-based Test (CBT) administered by NTA.',
      sections: JSON.stringify([
        { name: 'Physics', questions: 30, durationMinutes: 60, description: '20 Multiple Choice + 10 Numerical questions (attempt 5).' },
        { name: 'Chemistry', questions: 30, durationMinutes: 60, description: '20 Multiple Choice + 10 Numerical questions (attempt 5).' },
        { name: 'Mathematics', questions: 30, durationMinutes: 60, description: '20 Multiple Choice + 10 Numerical questions (attempt 5).' },
      ]),
      totalDurationMinutes: 180,
      scoreRange: '0 – 300 Marks',
      scoringDetails: '+4 for correct answer, -1 for incorrect answer in both MCQs and Numerical value questions.',
      validity: '1 academic year',
      importantDates: JSON.stringify([
        { label: 'Session 1 (January Session)', date: 'January 2026', deadline: 'December prior' },
        { label: 'Session 2 (April Session)', date: 'April 2026', deadline: 'March prior' },
      ]),
      officialWebsiteUrl: 'https://jeemain.nta.nic.in',
      prepResources: JSON.stringify([
        { title: 'National Testing Agency Official Mock Tests', type: 'Practice', url: 'https://nta.ac.in/quiz', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'Concepts of Physics by H.C. Verma',
        'Physical & Inorganic Chemistry by O.P. Tandon / J.D. Lee',
        'Skills in Mathematics Series by Amit M. Agarwal (Arihant)',
      ]),
      testDayTips: JSON.stringify([
        'Negative marking is active on all sections; skip questions where you cannot eliminate options.',
        'Attempt Chemistry first to build momentum and conserve time for Mathematics.',
      ]),
      hasMockTest: true,
    },
    {
      code: 'NEET',
      name: 'NEET UG (National Eligibility cum Entrance Test)',
      category: 'UNDERGRADUATE',
      description:
        'All-India pre-medical entrance examination for admission to MBBS, BDS, and related medical sciences courses in India and recognized overseas medical colleges.',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Medical & Health Sciences', 'Biology']),
      format: 'Pen-and-Paper (OMR Sheet) administered across accredited centers.',
      sections: JSON.stringify([
        { name: 'Physics', questions: 45, durationMinutes: 50, description: 'Section A (35) + Section B (10 out of 15).' },
        { name: 'Chemistry', questions: 45, durationMinutes: 50, description: 'Section A (35) + Section B (10 out of 15).' },
        { name: 'Biology (Botany + Zoology)', questions: 90, durationMinutes: 100, description: 'Section A (70) + Section B (20 out of 30).' },
      ]),
      totalDurationMinutes: 200,
      scoreRange: '0 – 720 Marks',
      scoringDetails: '+4 marks for correct response, -1 mark for incorrect response, 0 for unattempted.',
      validity: '1 year for India admissions; 3 years for foreign medical university eligibility.',
      importantDates: JSON.stringify([
        { label: 'Annual Examination', date: 'May 2026', deadline: 'March prior' },
      ]),
      officialWebsiteUrl: 'https://neet.nta.nic.in',
      prepResources: JSON.stringify([
        { title: 'NTA Official NEET Portal and Information Bulletin', type: 'Official Portal', url: 'https://neet.nta.nic.in', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'NCERT Biology Class 11 & 12 (Core reference)',
        'Objective NCERT at your Fingertips by MTG',
        'Physical Chemistry by N. Awasthi',
      ]),
      testDayTips: JSON.stringify([
        'NCERT textbook lines form the basis of over 85% of Biology questions; read systematically.',
        'Practice bubble-filling on physical OMR sheets to avoid shading errors under pressure.',
      ]),
      hasMockTest: false,
    },
  ];

  // Seed EntranceExam records
  for (const exam of examsData) {
    const existing = await prisma.entranceExam.findUnique({
      where: { code: exam.code },
    });

    let examRecord;
    if (!existing) {
      examRecord = await prisma.entranceExam.create({
        data: exam,
      });
    } else {
      examRecord = await prisma.entranceExam.update({
        where: { code: exam.code },
        data: exam,
      });
    }

    // Seed realistic diagnostic practice mock tests for SAT, IELTS, and GRE
    if (exam.code === 'SAT') {
      await seedSatMockTest(examRecord.id);
    } else if (exam.code === 'IELTS') {
      await seedIeltsMockTest(examRecord.id);
    } else if (exam.code === 'JEE_MAIN') {
      await seedJeeMockTest(examRecord.id);
    }
  }
}

async function seedSatMockTest(examId: string) {
  const existingTest = await prisma.mockTest.findFirst({
    where: { examId, title: 'Digital SAT Diagnostic Practice Test' },
  });

  if (existingTest) return;

  const mockTest = await prisma.mockTest.create({
    data: {
      examId,
      title: 'Digital SAT Diagnostic Practice Test',
      description: 'A 15-minute diagnostic test featuring verified Reading & Writing and Math questions modeled directly on the College Board digital format.',
      durationMinutes: 15,
      totalMarks: 5,
      passingMarks: 3,
    },
  });

  const questions = [
    {
      section: 'Reading & Writing',
      questionText: 'In her groundbreaking 1977 study on marine biodiversity, Dr. Elena Rostova demonstrated that coral reef resilience is ______ by polyculture habitats, refuting the long-held assumption that monoculture coral systems offer superior disease resistance.',
      options: JSON.stringify(['bolstered', 'impeded', 'diminished', 'obscured']),
      correctOptionIndex: 0,
      explanation: '"Bolstered" means supported or strengthened. The text explains that the study refuted the old assumption that monoculture systems offer superior resistance, meaning polycultures actually help or strengthen resilience.',
      marks: 1,
      orderIndex: 1,
    },
    {
      section: 'Reading & Writing',
      questionText: 'Historian Marcus Vance argues that ancient aqueduct networks were not merely utilitarian conduits for water conveyance; ______, they functioned as formidable architectural testaments to imperial engineering prowess.',
      options: JSON.stringify(['conversely', 'rather', 'subsequently', 'nevertheless']),
      correctOptionIndex: 1,
      explanation: '"Rather" is used to state that instead of one thing being true, another thing is the case. The sentence contrasts "not merely utilitarian" with what they truly represented.',
      marks: 1,
      orderIndex: 2,
    },
    {
      section: 'Math',
      questionText: 'If 3x + 7 = 28, what is the value of 6x - 5?',
      options: JSON.stringify(['37', '42', '47', '51']),
      correctOptionIndex: 0,
      explanation: 'From 3x + 7 = 28, we subtract 7: 3x = 21, so x = 7. Then 6x - 5 = 6(7) - 5 = 42 - 5 = 37.',
      marks: 1,
      orderIndex: 3,
    },
    {
      section: 'Math',
      questionText: 'A right circular cylinder has a base radius of 4 units and a height of 9 units. What is the total volume of the cylinder in terms of π?',
      options: JSON.stringify(['36π', '72π', '144π', '288π']),
      correctOptionIndex: 2,
      explanation: 'The volume formula for a cylinder is V = π * r² * h. Substituting r = 4 and h = 9 gives V = π * (16) * 9 = 144π.',
      marks: 1,
      orderIndex: 4,
    },
    {
      section: 'Math',
      questionText: 'A quadratic function is defined as f(x) = (x - 3)(x + 5). What is the minimum value of f(x)?',
      options: JSON.stringify(['-16', '-15', '-4', '1']),
      correctOptionIndex: 0,
      explanation: 'The roots are at x = 3 and x = -5. The vertex x-coordinate is the midpoint: x = (3 + -5)/2 = -1. Evaluating f(-1) = (-1 - 3)(-1 + 5) = (-4)(4) = -16.',
      marks: 1,
      orderIndex: 5,
    },
  ];

  for (const q of questions) {
    await prisma.mockQuestion.create({
      data: {
        mockTestId: mockTest.id,
        ...q,
      },
    });
  }
}

async function seedIeltsMockTest(examId: string) {
  const existingTest = await prisma.mockTest.findFirst({
    where: { examId, title: 'IELTS Academic Reading & Language Diagnostic' },
  });

  if (existingTest) return;

  const mockTest = await prisma.mockTest.create({
    data: {
      examId,
      title: 'IELTS Academic Reading & Language Diagnostic',
      description: 'A 10-minute targeted reading comprehension and academic vocabulary diagnostic with immediate band score evaluation.',
      durationMinutes: 10,
      totalMarks: 4,
      passingMarks: 3,
    },
  });

  const questions = [
    {
      section: 'Academic Reading',
      questionText: 'Passage excerpt: "Glaciologists observing the Antarctic interior noted that sub-glacial lakes drain periodically, a phenomenon that temporarily accelerates ice-stream velocity toward the Ross Sea." According to the passage, what effect does the draining of sub-glacial lakes have on ice-streams?',
      options: JSON.stringify([
        'It permanently stabilizes ice flow.',
        'It causes a transient increase in ice-stream speed.',
        'It halts the movement of ice toward the ocean.',
        'It reduces the overall volume of the Ross Sea.',
      ]),
      correctOptionIndex: 1,
      explanation: '"Temporarily accelerates" is synonymous with "transient increase in speed". Thus option B is the direct and accurate interpretation.',
      marks: 1,
      orderIndex: 1,
    },
    {
      section: 'Academic Vocabulary',
      questionText: 'Choose the word that most accurately replaces the bracketed word: "The university instituted a [comprehensive] review of its postgraduate research grants."',
      options: JSON.stringify(['superficial', 'exhaustive', 'perfunctory', 'sporadic']),
      correctOptionIndex: 1,
      explanation: '"Exhaustive" means thoroughly examining all aspects, which best aligns with "comprehensive" in an academic context.',
      marks: 1,
      orderIndex: 2,
    },
    {
      section: 'Coherence & Cohesion',
      questionText: 'Which linking transition best completes the sentence? "Wind power yields zero greenhouse emissions during operation; ______, the lifecycle carbon footprint of manufacturing turbines must be evaluated."',
      options: JSON.stringify(['furthermore', 'nonetheless', 'consequently', 'likewise']),
      correctOptionIndex: 1,
      explanation: '"Nonetheless" indicates a concession or counter-perspective, contrasting zero emissions in operation with the manufacturing footprint.',
      marks: 1,
      orderIndex: 3,
    },
    {
      section: 'Academic Reading',
      questionText: 'Passage excerpt: "Renewable desalination facilities deployed in arid coastal regions have eliminated dependency on fossil-fuel water distillation." This statement implies that:',
      options: JSON.stringify([
        'Desalination is no longer necessary in arid zones.',
        'Clean energy sources now power water purification in these zones.',
        'Fossil fuels are more effective than renewable desalination.',
        'Coastal populations have decreased due to water costs.',
      ]),
      correctOptionIndex: 1,
      explanation: 'The excerpt states that renewable facilities have eliminated fossil-fuel dependency, showing clean energy powers the process.',
      marks: 1,
      orderIndex: 4,
    },
  ];

  for (const q of questions) {
    await prisma.mockQuestion.create({
      data: {
        mockTestId: mockTest.id,
        ...q,
      },
    });
  }
}

async function seedJeeMockTest(examId: string) {
  const existingTest = await prisma.mockTest.findFirst({
    where: { examId, title: 'JEE Main Foundation Practice Quiz' },
  });

  if (existingTest) return;

  const mockTest = await prisma.mockTest.create({
    data: {
      examId,
      title: 'JEE Main Foundation Practice Quiz',
      description: 'A 10-minute practice quiz covering fundamental physics, chemistry, and mathematics questions matching the NTA testing pattern.',
      durationMinutes: 10,
      totalMarks: 3,
      passingMarks: 2,
    },
  });

  const questions = [
    {
      section: 'Physics',
      questionText: 'A particle moves along a straight line such that its displacement x at time t is given by x = 2t³ - 9t² + 12t + 4. At what time t (in seconds) does the acceleration of the particle become zero?',
      options: JSON.stringify(['1.0 s', '1.5 s', '2.0 s', '3.0 s']),
      correctOptionIndex: 1,
      explanation: 'Velocity v = dx/dt = 6t² - 18t + 12. Acceleration a = dv/dt = 12t - 18. Setting a = 0 gives 12t = 18 => t = 1.5 s.',
      marks: 1,
      orderIndex: 1,
    },
    {
      section: 'Chemistry',
      questionText: 'Which of the following molecules has an sp² hybridized central atom and a bent (V-shaped) molecular geometry?',
      options: JSON.stringify(['CO₂', 'SO₂', 'CH₄', 'BeCl₂']),
      correctOptionIndex: 1,
      explanation: 'In SO₂, sulfur has one lone pair and two bonding domains (steric number = 3), resulting in sp² hybridization and bent geometry. CO₂ and BeCl₂ are linear (sp), while CH₄ is tetrahedral (sp³).',
      marks: 1,
      orderIndex: 2,
    },
    {
      section: 'Mathematics',
      questionText: 'The value of the limit lim(x -> 0) [sin(5x) / (2x)] is equal to:',
      options: JSON.stringify(['0', '1', '2.5', '5']),
      correctOptionIndex: 2,
      explanation: 'lim(x -> 0) [sin(5x) / (2x)] = (5/2) * lim(x -> 0) [sin(5x) / (5x)] = (5/2) * 1 = 2.5.',
      marks: 1,
      orderIndex: 3,
    },
  ];

  for (const q of questions) {
    await prisma.mockQuestion.create({
      data: {
        mockTestId: mockTest.id,
        ...q,
      },
    });
  }
}
