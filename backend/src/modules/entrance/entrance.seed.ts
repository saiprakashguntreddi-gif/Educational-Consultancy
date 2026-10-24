import { prisma } from '../../shared/database/prisma.service';
import { MAIN_EXAM_CATEGORIES, REMOVED_CATEGORY_IDS } from './entrance.categories';

export async function seedEntranceExamsCatalog() {
  const examsData = [
    // -------------------------------------------------------------
    // CATEGORY 1: Undergraduate Entrance Exams
    // -------------------------------------------------------------
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
        'The Critical Reader: The Complete Guide to SAT Reading by Erica L. Meltzer',
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
      code: 'JEE_MAIN',
      name: 'JEE Main (Joint Entrance Examination)',
      category: 'ENGINEERING_TECHNOLOGY',
      description:
        'National engineering entrance examination for admission into NITs, IIITs, CFTIs, and premier engineering universities in India, serving as the qualifier for JEE Advanced.',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Engineering & Technology', 'Computer/Software Engineering']),
      format: 'Computer-based Test (CBT) administered by NTA.',
      sections: JSON.stringify([
        { name: 'Physics', questions: 30, durationMinutes: 60, description: '20 MCQs + 10 Numerical questions (attempt 5).' },
        { name: 'Chemistry', questions: 30, durationMinutes: 60, description: '20 MCQs + 10 Numerical questions (attempt 5).' },
        { name: 'Mathematics', questions: 30, durationMinutes: 60, description: '20 MCQs + 10 Numerical questions (attempt 5).' },
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
      code: 'CUET_UG',
      name: 'CUET UG (Common University Entrance Test Undergraduate)',
      category: 'UNDERGRADUATE',
      description:
        'Single-window national admission exam for central, state, deemed, and private universities across India, providing equal opportunity for undergraduate admissions.',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Arts & Humanities', 'Commerce', 'Science', 'All']),
      format: 'Computer-based Test (CBT) with domain subject choices.',
      sections: JSON.stringify([
        { name: 'Section IA & IB (Languages)', questions: 50, durationMinutes: 45, description: 'Reading comprehension and language proficiency (attempt 40 of 50).' },
        { name: 'Section II (Domain Subjects)', questions: 50, durationMinutes: 45, description: 'Domain-specific subjects based on Class 12 syllabus (attempt 40 of 50).' },
        { name: 'Section III (General Test)', questions: 60, durationMinutes: 60, description: 'General knowledge, current affairs, numerical ability, reasoning (attempt 50 of 60).' },
      ]),
      totalDurationMinutes: 150,
      scoreRange: 'Normalized NTA Percentile Score',
      scoringDetails: '+5 for correct answer, -1 for incorrect response.',
      validity: '1 academic year',
      importantDates: JSON.stringify([
        { label: 'Application Window', date: 'February – March 2026', deadline: 'March end' },
        { label: 'Exam Window', date: 'May – June 2026', deadline: 'Multiple shifts' },
      ]),
      officialWebsiteUrl: 'https://cuetug.ntaonline.in',
      prepResources: JSON.stringify([
        { title: 'NTA CUET UG Official Portal', type: 'Official Portal', url: 'https://cuetug.ntaonline.in', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'NCERT Textbooks for Class 12 Domain Subjects',
        'Arihant CUET UG General Test Prep Guide',
      ]),
      testDayTips: JSON.stringify([
        'Rely primarily on NCERT Class 12 syllabus as questions closely adhere to textbook definitions.',
        'Review the General Test section thoroughly for static GK and quick mental arithmetic.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'GAOKAO',
      name: 'Gaokao (National College Entrance Examination)',
      category: 'UNDERGRADUATE',
      description:
        'The high-stakes academic standardized examination held annually in mainland China for undergraduate admissions to Chinese universities, recognized increasingly by global universities.',
      destinations: JSON.stringify(['China', 'Hong Kong', 'Australia', 'United Kingdom', 'Canada']),
      relevantStreams: JSON.stringify(['Science', 'Liberal Arts', 'All']),
      format: 'Rigorous 2-3 day standardized written examination.',
      sections: JSON.stringify([
        { name: 'Chinese Literature & Language', questions: 40, durationMinutes: 150, description: 'Classical and modern Chinese text analysis and essay writing.' },
        { name: 'Mathematics', questions: 22, durationMinutes: 120, description: 'Pure mathematics, calculus, probability, and geometry.' },
        { name: 'Foreign Language (English/Other)', questions: 80, durationMinutes: 120, description: 'Listening comprehension, reading, and written expression.' },
        { name: 'Comprehensive (Sciences/Humanities)', questions: 35, durationMinutes: 150, description: 'Integrated Physics, Chemistry, Biology OR History, Geography, Politics.' },
      ]),
      totalDurationMinutes: 540,
      scoreRange: '0 – 750 Total Score',
      scoringDetails: 'Chinese (150), Math (150), Foreign Language (150), Comprehensive (300). Provincial Tier cutoffs determine tier 1, 2, 3 admissions.',
      validity: '1 academic year',
      importantDates: JSON.stringify([
        { label: 'National Exam Dates', date: 'June 7 – 8 (annually)', deadline: 'Strict national schedule' },
      ]),
      officialWebsiteUrl: 'https://www.neea.edu.cn',
      prepResources: JSON.stringify([
        { title: 'National Education Examinations Authority (NEEA)', type: 'Official Portal', url: 'https://www.neea.edu.cn', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'Official Past Gaokao Exam Collections (Provincial Volumes)',
        'Huanggang Huangchao Series for Math & Physics',
      ]),
      testDayTips: JSON.stringify([
        'High precision and speed are required; practice writing essays within time boundaries.',
        'Verify identity credentials and station rules ahead of national testing dates.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'ENEM',
      name: 'ENEM (Exame Nacional do Ensino Médio)',
      category: 'UNDERGRADUATE',
      description:
        'Non-mandatory standardized exam in Brazil evaluated by INEP, used for entrance to federal higher education institutions (SiSU) and several Portuguese universities.',
      destinations: JSON.stringify(['Brazil', 'Portugal']),
      relevantStreams: JSON.stringify(['Humanities', 'Natural Sciences', 'All']),
      format: 'Two-Sunday paper-based examination featuring 180 multiple-choice questions plus an argumentative essay.',
      sections: JSON.stringify([
        { name: 'Human Sciences & Languages', questions: 90, durationMinutes: 330, description: 'History, geography, philosophy, sociology, Portuguese/English/Spanish, and Essay.' },
        { name: 'Natural Sciences & Mathematics', questions: 90, durationMinutes: 300, description: 'Physics, chemistry, biology, and comprehensive mathematics.' },
      ]),
      totalDurationMinutes: 630,
      scoreRange: '0 – 1000 Item Response Theory (TRI)',
      scoringDetails: 'Scored using Item Response Theory (TRI) plus 0-1000 points on the written dissertation essay.',
      validity: 'Multi-year (usable across consecutive SiSU/ProUni admissions cycles)',
      importantDates: JSON.stringify([
        { label: 'Exam Sundays', date: 'November annually', deadline: 'Registration opens May/June' },
      ]),
      officialWebsiteUrl: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem',
      prepResources: JSON.stringify([
        { title: 'INEP ENEM Portal Oficial', type: 'Official Portal', url: 'https://enem.inep.gov.br', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'Redação Nota 1000 Guides for ENEM Essay Writing',
        'Apostila Descomplica & ProEnem Comprehensive Review',
      ]),
      testDayTips: JSON.stringify([
        'The essay ("Redação") carries immense weight in SiSU selection; adhere strictly to the 5 competency criteria.',
        'Because TRI penalizes inconsistent guessing, secure easy and medium questions first.',
      ]),
      hasMockTest: false,
    },

    // -------------------------------------------------------------
    // CATEGORY 2: Engineering & Technology Exams
    // -------------------------------------------------------------
    {
      code: 'JEE_ADVANCED',
      name: 'JEE Advanced',
      category: 'ENGINEERING_TECHNOLOGY',
      description:
        'The premier engineering entrance exam in India conducted by IITs for admissions into B.Tech, Dual Degree, and integrated programs across all Indian Institutes of Technology.',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Computer Science', 'Electrical', 'Mechanical', 'Aerospace', 'Engineering']),
      format: 'Computer-based Test consisting of two mandatory 3-hour papers on the same day.',
      sections: JSON.stringify([
        { name: 'Paper 1 (Physics, Chem, Math)', questions: 51, durationMinutes: 180, description: 'MCQs with single/multiple correct options, numerical values, and matching lists.' },
        { name: 'Paper 2 (Physics, Chem, Math)', questions: 51, durationMinutes: 180, description: 'Advanced comprehension, multi-correct, and non-negative integer questions.' },
      ]),
      totalDurationMinutes: 360,
      scoreRange: '0 – 360 Marks (varies by year)',
      scoringDetails: 'Subject-wise minimum cutoff marks and aggregate cutoff marks required for ranking; partial and negative marking applies.',
      validity: '1 academic year',
      importantDates: JSON.stringify([
        { label: 'Exam Date', date: 'Late May 2026', deadline: 'Registration after JEE Main results' },
      ]),
      officialWebsiteUrl: 'https://jeeadv.ac.in',
      prepResources: JSON.stringify([
        { title: 'Official JEE Advanced Past Question Papers', type: 'Practice', url: 'https://jeeadv.ac.in/archive.html', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'Problems in General Physics by I.E. Irodov',
        'Advanced Problems in Mathematics by Vikas Gupta & Pankaj Joshi',
        'Concise Inorganic Chemistry by J.D. Lee',
      ]),
      testDayTips: JSON.stringify([
        'Both papers are compulsory; maintain hydration and mental stamina during the break.',
        'Carefully verify marking scheme details (full marks, partial marks, negative marks) on every question type.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'GATE',
      name: 'GATE (Graduate Aptitude Test in Engineering)',
      category: 'ENGINEERING_TECHNOLOGY',
      description:
        'National examination testing comprehensive understanding of undergraduate engineering and sciences subjects, used for M.Tech admissions (IITs/IISc), PSU recruitment, and international universities.',
      destinations: JSON.stringify(['India', 'Singapore', 'Germany']),
      relevantStreams: JSON.stringify(['Computer Science', 'Mechanical', 'Electrical', 'Civil', 'Chemical', 'Data Science']),
      format: 'Computer-based Test with 65 questions across General Aptitude and Subject Discipline.',
      sections: JSON.stringify([
        { name: 'General Aptitude (GA)', questions: 10, durationMinutes: 30, description: 'Verbal ability, quantitative aptitude, analytical reasoning (15 marks).' },
        { name: 'Subject Discipline Engineering', questions: 55, durationMinutes: 150, description: 'Core engineering mathematics and paper-specific technical subjects (85 marks).' },
      ]),
      totalDurationMinutes: 180,
      scoreRange: '0 – 1000 GATE Score (100 Marks scale)',
      scoringDetails: 'MCQs carry negative marking (-1/3 or -2/3). Multiple Select Questions (MSQ) and Numerical Answer Type (NAT) have no negative marking.',
      validity: '3 years from announcement of results',
      importantDates: JSON.stringify([
        { label: 'Annual Exam Weekend', date: 'First two weekends of February 2026', deadline: 'Registration closing September prior' },
      ]),
      officialWebsiteUrl: 'https://gate2026.iitr.ac.in',
      prepResources: JSON.stringify([
        { title: 'Official GATE Online Mock Papers', type: 'Practice', url: 'https://gate2026.iitr.ac.in', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'Made Easy / ACE Academy GATE Guide Series',
        'Standard Engineering Textbooks according to syllabus',
      ]),
      testDayTips: JSON.stringify([
        'Familiarize yourself with the on-screen virtual scientific calculator before the exam.',
        'MSQ questions require selecting all correct answers to earn marks; no partial credit.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'BITSAT',
      name: 'BITSAT (BITS Admission Test)',
      category: 'ENGINEERING_TECHNOLOGY',
      description:
        'Computer-based entrance exam for integrated first-degree programs (B.E., M.Sc.) at BITS Pilani campuses in Pilani, Goa, and Hyderabad.',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Engineering & Technology', 'Computer Science', 'Information Systems']),
      format: 'Computer-based test of 130 questions with 12 optional bonus questions.',
      sections: JSON.stringify([
        { name: 'Part I: Physics', questions: 30, durationMinutes: 45, description: 'Physics concepts from Class 11 & 12.' },
        { name: 'Part II: Chemistry', questions: 30, durationMinutes: 45, description: 'Physical, organic, and inorganic chemistry.' },
        { name: 'Part III: English & Logical Reasoning', questions: 20, durationMinutes: 25, description: 'English proficiency (10) and logical reasoning (10).' },
        { name: 'Part IV: Mathematics / Biology', questions: 40, durationMinutes: 65, description: 'Higher secondary mathematics or biology for pharmacy.' },
      ]),
      totalDurationMinutes: 180,
      scoreRange: '0 – 390 Marks',
      scoringDetails: '+3 marks for correct answer, -1 mark for wrong answer. Answering all 130 questions unlocks 12 bonus questions.',
      validity: '1 academic year',
      importantDates: JSON.stringify([
        { label: 'Session 1 & 2', date: 'May & June 2026', deadline: 'April prior' },
      ]),
      officialWebsiteUrl: 'https://www.bitsadmission.com',
      prepResources: JSON.stringify([
        { title: 'BITS Official Practice Tests', type: 'Practice', url: 'https://www.bitsadmission.com', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'Comprehensive Guide to BITSAT by Disha Publications',
        'Arihant BITSAT Prep Master with Mock Tests',
      ]),
      testDayTips: JSON.stringify([
        'Speed and accuracy are essential; do not spend over 2 minutes on any single problem.',
        'Unlocking the 12 bonus questions offers a high-scoring boost for well-prepared students.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'VITEEE',
      name: 'VITEEE (VIT Engineering Entrance Examination)',
      category: 'ENGINEERING_TECHNOLOGY',
      description:
        'National common entrance exam for admission into undergraduate engineering programs at Vellore Institute of Technology campuses (Vellore, Chennai, Bhopal, AP).',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Engineering & Technology', 'Software Engineering']),
      format: 'Computer-based test of 125 questions with no negative marking.',
      sections: JSON.stringify([
        { name: 'Mathematics / Biology', questions: 40, durationMinutes: 50, description: 'Calculus, vectors, probability, algebra.' },
        { name: 'Physics', questions: 35, durationMinutes: 45, description: 'Mechanics, electrodynamics, optics, modern physics.' },
        { name: 'Chemistry', questions: 35, durationMinutes: 45, description: 'Atomic structure, organic reactions, thermodynamics.' },
        { name: 'Aptitude & English', questions: 15, durationMinutes: 10, description: 'Aptitude (10) and English comprehension (5).' },
      ]),
      totalDurationMinutes: 150,
      scoreRange: '0 – 125 Marks',
      scoringDetails: '+1 mark for correct response, no negative marking for incorrect attempts.',
      validity: '1 academic year',
      importantDates: JSON.stringify([
        { label: 'Exam Dates', date: 'Mid-April 2026', deadline: 'Late March prior' },
      ]),
      officialWebsiteUrl: 'https://viteee.vit.ac.in',
      prepResources: JSON.stringify([
        { title: 'VIT Official Mock Test Simulator', type: 'Practice', url: 'https://viteee.vit.ac.in', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'Target VITEEE with Previous Solved Papers by Disha',
        'NCERT Exemplar Problems for Physics & Chemistry',
      ]),
      testDayTips: JSON.stringify([
        'Because there is zero negative marking, attempt every single question before submission.',
        'Allocate at least 15 minutes to review flagged questions.',
      ]),
      hasMockTest: false,
    },

    // -------------------------------------------------------------
    // CATEGORY 3: Postgraduate Entrance Exams
    // -------------------------------------------------------------
    {
      code: 'GRE',
      name: 'GRE General Test (Graduate Record Examination)',
      category: 'POSTGRADUATE',
      description:
        'The premier graduate admissions exam for master’s, specialized master’s, and doctoral degree programs globally.',
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
        'GregMat+ Test Prep Resources',
      ]),
      testDayTips: JSON.stringify([
        'Make full use of the section calculator provided on-screen during Quantitative Reasoning.',
        'Review high-frequency vocabulary roots, prefixes, and sentence equivalence contextual clues.',
      ]),
      hasMockTest: true,
    },
    {
      code: 'CUET_PG',
      name: 'CUET PG (Common University Entrance Test Postgraduate)',
      category: 'POSTGRADUATE',
      description:
        'National single-window computer test conducted by NTA for admissions into master and postgraduate degree courses across Indian Central, State, and participating universities.',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Sciences', 'Humanities', 'Commerce', 'Engineering & Technology', 'Law']),
      format: 'Computer-based Test consisting of 75 discipline-specific multiple choice questions.',
      sections: JSON.stringify([
        { name: 'Domain Knowledge Questions', questions: 75, durationMinutes: 105, description: 'Subject-specific concepts from undergraduate level syllabi.' },
      ]),
      totalDurationMinutes: 105,
      scoreRange: '0 – 300 Marks',
      scoringDetails: '+4 marks for correct answer, -1 mark for incorrect attempt.',
      validity: '1 academic year',
      importantDates: JSON.stringify([
        { label: 'Annual Examination', date: 'March 2026', deadline: 'Registration in January/February' },
      ]),
      officialWebsiteUrl: 'https://pgcuet.samarth.ac.in',
      prepResources: JSON.stringify([
        { title: 'NTA CUET PG Official Information Bulletin', type: 'Official Portal', url: 'https://pgcuet.samarth.ac.in', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'Arihant CUET PG Subject Wise Preparation Series',
        'Undergraduate standard reference textbooks',
      ]),
      testDayTips: JSON.stringify([
        'Review undergraduate core concepts thoroughly; questions test fundamental definitions and applied logic.',
        'Negative marking applies, so avoid blind guesses on complex technical questions.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'IIT_JAM',
      name: 'IIT JAM (Joint Admission test for Masters)',
      category: 'POSTGRADUATE',
      description:
        'National entrance exam organized by IITs for admission into M.Sc., Joint M.Sc.-Ph.D., and other post-bachelor programs in science and mathematics.',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Physics', 'Chemistry', 'Mathematics', 'Biotechnology', 'Economics', 'Geology', 'Mathematical Statistics']),
      format: 'Computer-based Test with 60 questions in three sections: MCQs, MSQs, and NATs.',
      sections: JSON.stringify([
        { name: 'Section A (MCQ)', questions: 30, durationMinutes: 60, description: '10 one-mark and 20 two-mark multiple choice questions.' },
        { name: 'Section B (MSQ)', questions: 10, durationMinutes: 40, description: '10 two-mark multiple select questions with no negative marks.' },
        { name: 'Section C (NAT)', questions: 20, durationMinutes: 80, description: 'Numerical answer type questions with real numerical inputs.' },
      ]),
      totalDurationMinutes: 180,
      scoreRange: '0 – 100 Marks',
      scoringDetails: 'Section A has negative marking (-1/3 or -2/3). Section B and Section C have no negative marking.',
      validity: '1 academic year',
      importantDates: JSON.stringify([
        { label: 'Exam Date', date: 'Second Sunday of February 2026', deadline: 'Application deadline mid-October' },
      ]),
      officialWebsiteUrl: 'https://jam.iitd.ac.in',
      prepResources: JSON.stringify([
        { title: 'Official JAM Mock Tests & Past Papers', type: 'Official Portal', url: 'https://jam.iitd.ac.in', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'Mathematical Physics by H.K. Dass',
        'Organic Chemistry by Clayden, Greeves & Warren',
        'Higher Engineering Mathematics by B.S. Grewal',
      ]),
      testDayTips: JSON.stringify([
        'MSQs require identifying every correct choice; double-check all possibilities.',
        'Numerical Answer Type questions need accurate calculation up to specified decimal places.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'NIMCET',
      name: 'NIMCET (NIT MCA Common Entrance Test)',
      category: 'POSTGRADUATE',
      description:
        'National entrance examination for admission into Master of Computer Applications (MCA) programs across National Institutes of Technology (NITs).',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Computer Science', 'Information Technology', 'MCA']),
      format: 'Computer-based Test with 120 multiple choice questions.',
      sections: JSON.stringify([
        { name: 'Mathematics', questions: 50, durationMinutes: 50, description: 'Algebra, coordinate geometry, calculus, probability, vectors (600 marks weighted).' },
        { name: 'Analytical Ability & Logical Reasoning', questions: 40, durationMinutes: 40, description: 'Logical deduction, puzzle solving, data interpretation (240 marks weighted).' },
        { name: 'Computer Awareness', questions: 20, durationMinutes: 20, description: 'Data representation, binary arithmetic, computer architecture (160 marks weighted).' },
        { name: 'General English', questions: 10, durationMinutes: 10, description: 'Comprehension, vocabulary, syntax (40 marks weighted).' },
      ]),
      totalDurationMinutes: 120,
      scoreRange: '0 – 1000 Weighted Score',
      scoringDetails: 'Mathematics carries maximum weightage (12 marks per correct, -3 per wrong). Other sections 6 or 8 marks per question.',
      validity: '1 academic year',
      importantDates: JSON.stringify([
        { label: 'Annual Examination', date: 'June 2026', deadline: 'April prior' },
      ]),
      officialWebsiteUrl: 'https://nimcet.admissions.nic.in',
      prepResources: JSON.stringify([
        { title: 'NIMCET Official Portal', type: 'Official Portal', url: 'https://nimcet.admissions.nic.in', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'IIT-JEE Mathematics by R.D. Sharma (Objective)',
        'A Modern Approach to Verbal & Non-Verbal Reasoning by R.S. Aggarwal',
      ]),
      testDayTips: JSON.stringify([
        'Mathematics carries 60% of total score weight; focus preparation heavily on calculus, probability, and algebra.',
        'Time management is intense with 120 questions in 120 minutes.',
      ]),
      hasMockTest: false,
    },

    // -------------------------------------------------------------
    // CATEGORY 4: MBA & Management Exams
    // -------------------------------------------------------------
    {
      code: 'GMAT',
      name: 'GMAT Focus Edition',
      category: 'MBA_MANAGEMENT',
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
      code: 'CAT',
      name: 'CAT (Common Admission Test)',
      category: 'MBA_MANAGEMENT',
      description:
        'The premier national computer-based management entrance test in India conducted by IIMs for admission to graduate management programs.',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Business & Management', 'Finance', 'Marketing', 'Consulting']),
      format: 'Computer-based test of 66 questions with strict 40-minute sectional timers.',
      sections: JSON.stringify([
        { name: 'VARC (Verbal Ability & Reading Comprehension)', questions: 24, durationMinutes: 40, description: '16 RC questions + 8 verbal ability questions.' },
        { name: 'DILR (Data Interpretation & Logical Reasoning)', questions: 20, durationMinutes: 40, description: '4 puzzle sets consisting of 5 questions each.' },
        { name: 'QA (Quantitative Aptitude)', questions: 22, durationMinutes: 40, description: 'Arithmetic, algebra, geometry, number systems, modern math.' },
      ]),
      totalDurationMinutes: 120,
      scoreRange: '0 – 198 Marks (Percentile Scale)',
      scoringDetails: '+3 marks for correct answer, -1 mark for incorrect MCQ. Non-MCQ (TITA) questions carry no negative marking.',
      validity: '1 academic year',
      importantDates: JSON.stringify([
        { label: 'Exam Day', date: 'Last Sunday of November annually', deadline: 'Registration closes mid-September' },
      ]),
      officialWebsiteUrl: 'https://iimcat.ac.in',
      prepResources: JSON.stringify([
        { title: 'IIM CAT Official Mock Test', type: 'Official Portal', url: 'https://iimcat.ac.in', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'How to Prepare for Quantitative Aptitude for the CAT by Arun Sharma',
        'Word Power Made Easy by Norman Lewis',
        'Logical Reasoning and Data Interpretation by Nishit K. Sinha',
      ]),
      testDayTips: JSON.stringify([
        'Set selection in DILR determines success; spend the first 5 minutes skimming all sets.',
        'Section jumping is disabled; manage all 40 minutes strictly within each section.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'XAT',
      name: 'XAT (Xavier Aptitude Test)',
      category: 'MBA_MANAGEMENT',
      description:
        'National level management entrance exam conducted by XLRI Jamshedpur for admission to XLRI and over 160 leading business schools in India.',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Human Resources', 'Business Management', 'General Management']),
      format: 'Computer-based test with unique Decision Making section and General Knowledge.',
      sections: JSON.stringify([
        { name: 'Part 1: Verbal & Logical Ability', questions: 26, durationMinutes: 60, description: 'Critical reasoning, RC, paragraph completion.' },
        { name: 'Part 1: Decision Making (DM)', questions: 22, durationMinutes: 50, description: 'Managerial, ethical, and situational business dilemmas.' },
        { name: 'Part 1: Quantitative Ability & DI', questions: 28, durationMinutes: 65, description: 'Higher-level math and intricate data tables.' },
        { name: 'Part 2: Mock Key/GK & Essay', questions: 25, durationMinutes: 35, description: 'Static/current GK questions and an analytical essay.' },
      ]),
      totalDurationMinutes: 210,
      scoreRange: '0 – 76 Marks (Part 1 Percentile)',
      scoringDetails: '+1 for correct answer, -0.25 for incorrect MCQ. Penalty of -0.10 for consecutive unattempted questions after 8 skips.',
      validity: '1 academic year',
      importantDates: JSON.stringify([
        { label: 'Exam Day', date: 'First Sunday of January 2026', deadline: 'Registration closes late November' },
      ]),
      officialWebsiteUrl: 'https://xatonline.in',
      prepResources: JSON.stringify([
        { title: 'Official XAT Past Papers & Answers', type: 'Official Portal', url: 'https://xatonline.in', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'Target XAT by Disha Experts',
        'Analytical and Decision Making for XAT by Arihant',
      ]),
      testDayTips: JSON.stringify([
        'Decision Making requires objective, ethical, and win-win managerial perspectives.',
        'Be mindful of the unattempted question penalty when deciding whether to skip.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'MAT',
      name: 'MAT (Management Aptitude Test)',
      category: 'MBA_MANAGEMENT',
      description:
        'Standard national level entrance test administered by All India Management Association (AIMA) in PBT, CBT, and IBT modes for admission to over 600 B-schools.',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Business & Management']),
      format: 'Computer-based (CBT), Paper-based (PBT), or Remote Proctored Internet-based (IBT).',
      sections: JSON.stringify([
        { name: 'Language Comprehension', questions: 30, durationMinutes: 25, description: 'Grammar, vocabulary, reading passages.' },
        { name: 'Mathematical Skills', questions: 30, durationMinutes: 30, description: 'Arithmetic, percentage, ratios, interest, geometry.' },
        { name: 'Data Analysis & Sufficiency', questions: 30, durationMinutes: 30, description: 'Charts, graphs, data comparison.' },
        { name: 'Intelligence & Critical Reasoning', questions: 30, durationMinutes: 25, description: 'Analogies, sequences, blood relations.' },
        { name: 'Economic & Business Environment', questions: 30, durationMinutes: 10, description: 'General business awareness.' },
      ]),
      totalDurationMinutes: 120,
      scoreRange: '200 – 800 Scaled Composite Score',
      scoringDetails: '+1 mark for correct, -0.25 for incorrect. Economic Environment score is reported separately.',
      validity: '1 academic year',
      importantDates: JSON.stringify([
        { label: 'Four Annual Cycles', date: 'February, May, September, December 2026', deadline: 'Multiple registration windows' },
      ]),
      officialWebsiteUrl: 'https://mat.aima.in',
      prepResources: JSON.stringify([
        { title: 'AIMA Official MAT Mock Tests', type: 'Official Portal', url: 'https://mat.aima.in', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'Mission MBA MAT Guide by BS Sijwalii',
        'MAT 20 Years Topic-wise Solved Papers by Disha',
      ]),
      testDayTips: JSON.stringify([
        'Because MAT is conducted 4 times a year, students can take multiple attempts to maximize scores.',
        'High accuracy in Mathematical Skills provides an easy composite score boost.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'CMAT',
      name: 'CMAT (Common Management Admission Test)',
      category: 'MBA_MANAGEMENT',
      description:
        'National level entrance examination conducted by NTA for admission into AICTE-approved management institutions and university departments in India.',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Business & Management', 'Innovation & Entrepreneurship']),
      format: 'Computer-based Test with 100 questions across 5 sections.',
      sections: JSON.stringify([
        { name: 'Quantitative Techniques & Data Interpretation', questions: 20, durationMinutes: 36, description: 'Arithmetic, data analysis, probability.' },
        { name: 'Logical Reasoning', questions: 20, durationMinutes: 36, description: 'Linear arrangements, syllogisms, series.' },
        { name: 'Language Comprehension', questions: 20, durationMinutes: 36, description: 'Vocabulary, idiom usage, reading passages.' },
        { name: 'General Awareness', questions: 20, durationMinutes: 36, description: 'Current national/international events and static GK.' },
        { name: 'Innovation & Entrepreneurship', questions: 20, durationMinutes: 36, description: 'Startup concepts, venture capital, business terms.' },
      ]),
      totalDurationMinutes: 180,
      scoreRange: '0 – 400 Marks',
      scoringDetails: '+4 marks for correct answer, -1 mark for wrong answer.',
      validity: '1 academic year',
      importantDates: JSON.stringify([
        { label: 'Annual Examination', date: 'May 2026', deadline: 'Registration closing in April' },
      ]),
      officialWebsiteUrl: 'https://cmat.nta.nic.in',
      prepResources: JSON.stringify([
        { title: 'NTA Official CMAT Portal', type: 'Official Portal', url: 'https://cmat.nta.nic.in', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'The Complete Reference Manual for CMAT by SK Sinha',
        'Innovation and Entrepreneurship Guide by Disha Experts',
      ]),
      testDayTips: JSON.stringify([
        'Generous time allotment of 180 minutes for 100 questions allows careful calculation.',
        'Review recent Indian startup unicorns and policy incentives for the Innovation section.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'NMAT',
      name: 'NMAT by GMAC',
      category: 'MBA_MANAGEMENT',
      description:
        'Computer-adaptive entrance examination owned by GMAC, accepted by leading business schools in India, South Africa, and the Philippines, including NMIMS School of Business Management.',
      destinations: JSON.stringify(['India', 'South Africa', 'Philippines']),
      relevantStreams: JSON.stringify(['Business & Management']),
      format: 'Computer-adaptive test of 108 questions with no negative marking and candidate-chosen section order.',
      sections: JSON.stringify([
        { name: 'Language Skills', questions: 36, durationMinutes: 28, description: 'Reading comprehension, vocabulary, grammar.' },
        { name: 'Quantitative Skills', questions: 36, durationMinutes: 52, description: 'Arithmetic, algebra, data sufficiency.' },
        { name: 'Logical Reasoning', questions: 36, durationMinutes: 40, description: 'Critical reasoning, deductions, puzzle solving.' },
      ]),
      totalDurationMinutes: 120,
      scoreRange: '36 – 360 Scaled Score',
      scoringDetails: 'Zero negative marking. Candidates can take the exam up to 3 times in a testing window.',
      validity: '1 academic year',
      importantDates: JSON.stringify([
        { label: 'Testing Window', date: 'October – December 2026', deadline: 'Retake registration available' },
      ]),
      officialWebsiteUrl: 'https://www.mba.com/exams/nmat',
      prepResources: JSON.stringify([
        { title: 'Official NMAT Prep Guide & Free Exam by GMAC', type: 'Official Portal', url: 'https://www.mba.com/exams/nmat', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'Official Guide for NMAT by GMAC Review',
        'NMAT by GMAC Prep Book by Pearson',
      ]),
      testDayTips: JSON.stringify([
        'With no negative marking, never leave a question unanswered before the sectional timer ends.',
        'Choose your strongest section first to gain early confidence.',
      ]),
      hasMockTest: false,
    },

    // -------------------------------------------------------------
    // CATEGORY 5 & 6: Study Abroad & Language Proficiency Exams
    // -------------------------------------------------------------
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
      code: 'PTE',
      name: 'PTE Academic (Pearson Test of English)',
      category: 'LANGUAGE_PROFICIENCY',
      description:
        'Fast, 2-hour AI-scored English language exam accepted by 3,000+ institutions globally and approved for Australian, UK, and New Zealand visa applications.',
      destinations: JSON.stringify(['Australia', 'United Kingdom', 'Canada', 'New Zealand', 'United States']),
      relevantStreams: JSON.stringify(['All']),
      format: '100% computer-based test in a secure test center with automated algorithmic scoring.',
      sections: JSON.stringify([
        { name: 'Speaking & Writing', questions: 28, durationMinutes: 54, description: 'Read aloud, repeat sentence, describe image, re-tell lecture, summarize written text, essay.' },
        { name: 'Reading', questions: 15, durationMinutes: 30, description: 'Fill in the blanks, multiple choice, re-order paragraphs.' },
        { name: 'Listening', questions: 20, durationMinutes: 30, description: 'Summarize spoken text, write from dictation, highlight incorrect words.' },
      ]),
      totalDurationMinutes: 120,
      scoreRange: '10 – 90 Global Scale of English',
      scoringDetails: 'Overall score and communicative skill sub-scores reported on the 10-90 scale based on automated scoring.',
      validity: '2 years from test date',
      importantDates: JSON.stringify([
        { label: '365 Days Availability', date: 'Offered up to 3 times daily at certified Pearson centers', notes: 'Results typically delivered within 48 hours.' },
      ]),
      officialWebsiteUrl: 'https://www.pearsonpte.com',
      prepResources: JSON.stringify([
        { title: 'Official PTE Practice App & Scored Mock Tests', type: 'Practice', url: 'https://www.pearsonpte.com/preparation', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'The Official Guide to PTE Academic by Pearson',
        'PTE Academic Practice Tests Plus with Key',
      ]),
      testDayTips: JSON.stringify([
        'Position the microphone slightly below your lower lip to avoid heavy breathing pickup.',
        'Maintain a steady, continuous rhythm; pauses longer than 3 seconds will automatically stop audio recording.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'DUOLINGO',
      name: 'Duolingo English Test (DET)',
      category: 'LANGUAGE_PROFICIENCY',
      description:
        'A convenient, fast, and affordable computer-adaptive online English test taken from home and accepted by 5,000+ university programs worldwide.',
      destinations: JSON.stringify(['United States', 'Canada', 'United Kingdom', 'Germany', 'Ireland']),
      relevantStreams: JSON.stringify(['All']),
      format: 'Online computer-adaptive test taken from home with human and AI proctoring.',
      sections: JSON.stringify([
        { name: 'Adaptive Test', questions: 45, durationMinutes: 45, description: 'Reading, writing, listening, speaking, fill in the blanks, interactive reading.' },
        { name: 'Writing & Speaking Sample', questions: 2, durationMinutes: 10, description: 'Ungraded video and writing sample shared directly with university admissions.' },
      ]),
      totalDurationMinutes: 60,
      scoreRange: '10 – 160 Points',
      scoringDetails: 'Overall holistic score plus four subscores: Literacy, Comprehension, Conversation, and Production.',
      validity: '2 years from test date',
      importantDates: JSON.stringify([
        { label: 'On-Demand 24/7', date: 'Take anytime online with a computer and camera', notes: 'Certified results certified in 48 hours.' },
      ]),
      officialWebsiteUrl: 'https://englishtest.duolingo.com',
      prepResources: JSON.stringify([
        { title: 'Duolingo Official Free 45-Minute Practice Test', type: 'Practice', url: 'https://englishtest.duolingo.com/readiness', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'Duolingo English Test Official Test Taker Guide',
        'DET Vocabulary and Production Builder by Teacher Luke',
      ]),
      testDayTips: JSON.stringify([
        'Test in a quiet, well-lit room completely alone; do not look away from the computer screen.',
        'Ensure ears and face are unobstructed so the proctoring algorithm validates the session.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'JLPT',
      name: 'JLPT (Japanese-Language Proficiency Test)',
      category: 'LANGUAGE_PROFICIENCY',
      description:
        'The official standardized test to evaluate and certify Japanese language proficiency of non-native speakers, organized by the Japan Foundation and JEES.',
      destinations: JSON.stringify(['Japan', 'Global']),
      relevantStreams: JSON.stringify(['East Asian Studies', 'Engineering & Technology', 'Employment']),
      format: 'Paper-based multiple-choice test across 5 difficulty levels (N5 beginner to N1 advanced).',
      sections: JSON.stringify([
        { name: 'Language Knowledge (Vocabulary & Grammar)', questions: 50, durationMinutes: 60, description: 'Kanji readings, vocabulary meaning, syntax.' },
        { name: 'Reading Comprehension', questions: 25, durationMinutes: 50, description: 'Short, medium, and long passage comprehension, information retrieval.' },
        { name: 'Listening Comprehension', questions: 30, durationMinutes: 55, description: 'Task-based, key-point, and quick-response audio dialogues.' },
      ]),
      totalDurationMinutes: 165,
      scoreRange: '0 – 180 Points (N1 to N5 Levels)',
      scoringDetails: 'Must pass both overall total score cutoff (approx. 100/180 for N1) and minimum sectional thresholds (19/60 in each component).',
      validity: 'No expiration date (permanent certificate)',
      importantDates: JSON.stringify([
        { label: 'July & December Administrations', date: 'First Sunday of July & First Sunday of December', deadline: 'Registration months in advance' },
      ]),
      officialWebsiteUrl: 'https://www.jlpt.jp/e',
      prepResources: JSON.stringify([
        { title: 'Official JLPT Sample Questions Online', type: 'Practice', url: 'https://www.jlpt.jp/e/samples/sampleindex.html', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'Shin Nihongo 500 Mon Series',
        'Nihongo Sou Matome N2/N1 Series',
        'Kanzen Master Grammar & Reading Series',
      ]),
      testDayTips: JSON.stringify([
        'Sectional pass thresholds are mandatory; an unbalanced high score will still fail if one section misses the minimum 19 points.',
        'Listening is played only once with zero replay; note-taking skills are essential.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'TOPIK',
      name: 'TOPIK (Test of Proficiency in Korean)',
      category: 'LANGUAGE_PROFICIENCY',
      description:
        'The official written Korean language examination directed by the National Institute for International Education (NIIED) for university study and employment in South Korea.',
      destinations: JSON.stringify(['South Korea', 'Global']),
      relevantStreams: JSON.stringify(['Korean Studies', 'Global Studies', 'All']),
      format: 'PBT and IBT administered tests across TOPIK I (Levels 1-2) and TOPIK II (Levels 3-6).',
      sections: JSON.stringify([
        { name: 'Listening (TOPIK II)', questions: 50, durationMinutes: 60, description: 'Audio dialogues, broadcast excerpts, lectures.' },
        { name: 'Writing (TOPIK II)', questions: 4, durationMinutes: 50, description: 'Two sentence completions, one 200-300 word paragraph, one 600-700 word argumentative essay.' },
        { name: 'Reading (TOPIK II)', questions: 50, durationMinutes: 70, description: 'Expository articles, news clippings, literary excerpts.' },
      ]),
      totalDurationMinutes: 180,
      scoreRange: '0 – 300 Points (TOPIK II)',
      scoringDetails: 'Level 3 (120+), Level 4 (150+), Level 5 (190+), Level 6 (230+). TOPIK I scored out of 200.',
      validity: '2 years from test date',
      importantDates: JSON.stringify([
        { label: 'Annual Sessions', date: '6 times annually (Jan, Apr, May, Jul, Oct, Nov)', deadline: 'Registration opens 2 months prior' },
      ]),
      officialWebsiteUrl: 'https://www.topik.go.kr',
      prepResources: JSON.stringify([
        { title: 'National Institute for International Education (NIIED) Official TOPIK Portal', type: 'Official Portal', url: 'https://www.topik.go.kr', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'Hot TOPIK II Reading & Writing Series',
        'Mastering TOPIK II: 100 Essential Grammar Points',
      ]),
      testDayTips: JSON.stringify([
        'Writing Section Question 54 (long essay) carries 50 points; structure with an introduction, opposing viewpoints, and conclusion.',
        'Pacing in the Reading section requires quickly scanning informational posters and headlines.',
      ]),
      hasMockTest: false,
    },

    // -------------------------------------------------------------
    // CATEGORY 7: Design & Architecture Exams
    // -------------------------------------------------------------
    {
      code: 'NID_DAT',
      name: 'NID DAT (Design Aptitude Test)',
      category: 'DESIGN_ARCHITECTURE',
      description:
        'National design admissions test conducted by the National Institute of Design for undergraduate (B.Des) and postgraduate (M.Des) programs.',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Industrial Design', 'Communication Design', 'Textile & Apparel Design', 'Animation']),
      format: 'DAT Prelims (Pen-and-paper objective and subjective drawing test) followed by DAT Mains (Studio test & personal interview).',
      sections: JSON.stringify([
        { name: 'Visual & Design Sensitivity (Objective)', questions: 40, durationMinutes: 60, description: 'Observation, general awareness, spatial perception, visualization.' },
        { name: 'Creative Drawing & Problem Solving (Subjective)', questions: 5, durationMinutes: 90, description: 'Perspective sketching, 2D/3D composition, narrative storyboards.' },
      ]),
      totalDurationMinutes: 150,
      scoreRange: '0 – 100 Marks (DAT Prelims)',
      scoringDetails: 'Prelims weightage 30-40% and Mains studio test weightage 60-70% towards final merit rank.',
      validity: '1 academic year',
      importantDates: JSON.stringify([
        { label: 'DAT Prelims', date: 'Late December 2025 / Early January 2026', deadline: 'Application deadline November' },
        { label: 'DAT Mains', date: 'April – May 2026', deadline: 'Shortlisted candidates only' },
      ]),
      officialWebsiteUrl: 'https://admissions.nid.edu',
      prepResources: JSON.stringify([
        { title: 'NID Admissions Official Past Year Papers', type: 'Official Portal', url: 'https://admissions.nid.edu', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'Design Drawing by Francis D.K. Ching',
        'NID B.Des / M.Des Entrance Exam Guide by R.S. Aggarwal / Arihant',
      ]),
      testDayTips: JSON.stringify([
        'Carry high-quality pencils (2B, 4B), dry color pastels, and markers for the subjective sketches.',
        'Focus on originality, storytelling, and ergonomic empathy in your design solutions.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'UCEED',
      name: 'UCEED (Undergraduate Common Entrance Examination for Design)',
      category: 'DESIGN_ARCHITECTURE',
      description:
        'National undergraduate entrance examination conducted by IIT Bombay for admissions to Bachelor of Design (B.Des) programs at IIT Bombay, IIT Delhi, IIT Guwahati, IIT Hyderabad, and IIITDM Jabalpur.',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Design', 'Product Design', 'Interaction Design']),
      format: 'Part A (Computer-based CBT, 2 hours) and Part B (Paper-based drawing and design aptitude, 1 hour).',
      sections: JSON.stringify([
        { name: 'Part A: NAT, MSQ, MCQ', questions: 57, durationMinutes: 120, description: 'Visualization, spatial ability, observation, environmental and social awareness.' },
        { name: 'Part B: Drawing & Design Aptitude', questions: 2, durationMinutes: 60, description: 'Realistic perspective sketching, proportions, shading, and design solution synthesis.' },
      ]),
      totalDurationMinutes: 180,
      scoreRange: '0 – 300 Marks (Part A: 200, Part B: 100)',
      scoringDetails: 'Part B is evaluated only if the candidate meets the minimum category-wise qualifying mark in Part A.',
      validity: '1 academic year',
      importantDates: JSON.stringify([
        { label: 'Exam Day', date: 'Third Sunday of January 2026', deadline: 'Registration closes mid-November prior' },
      ]),
      officialWebsiteUrl: 'https://uceed.iitb.ac.in',
      prepResources: JSON.stringify([
        { title: 'IIT Bombay UCEED Official Sample Papers', type: 'Official Portal', url: 'https://uceed.iitb.ac.in', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'UCEED Design Environment & Aptitude Guide by Ashok Goel',
        'Drawing for Product Designers by Kevin Henry',
      ]),
      testDayTips: JSON.stringify([
        'Part A has negative marking in MCQs and MSQs; answer thoughtfully.',
        'Part B requires drawing within the allocated box; adhere to lighting, scale, and human ergonomics.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'CEED',
      name: 'CEED (Common Entrance Examination for Design)',
      category: 'DESIGN_ARCHITECTURE',
      description:
        'Joint entrance examination conducted by IIT Bombay for admission to Master of Design (M.Des) and Ph.D. programs at IISc Bangalore and IITs.',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Master of Design', 'Visual Communication', 'Transportation Design', 'Interaction Design']),
      format: 'Part A (Computer-based screening) and Part B (Subjective creative test evaluated for Part A qualifiers).',
      sections: JSON.stringify([
        { name: 'Part A: Objective Evaluation', questions: 41, durationMinutes: 60, description: 'Visual perception, spatial reasoning, creative thinking, design aesthetics (100 marks).' },
        { name: 'Part B: Creative Design Skills', questions: 5, durationMinutes: 120, description: 'Form drawing, creative problem solving, communication design, product critique (100 marks).' },
      ]),
      totalDurationMinutes: 180,
      scoreRange: '0 – 100 CEED Score Scale',
      scoringDetails: 'Part A is qualifying. Final CEED score is calculated with 25% Part A + 75% Part B weightage.',
      validity: '1 year from date of result announcement',
      importantDates: JSON.stringify([
        { label: 'Annual Examination', date: 'Third Sunday of January 2026', deadline: 'November registration closing' },
      ]),
      officialWebsiteUrl: 'https://ceed.iitb.ac.in',
      prepResources: JSON.stringify([
        { title: 'Official CEED Question Paper Archive', type: 'Official Portal', url: 'https://ceed.iitb.ac.in', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'Design Methods by Christopher Jones',
        'CEED Comprehensive Guide with Solved Examples by Arihant',
      ]),
      testDayTips: JSON.stringify([
        'In Part B, communicate ideas clearly with neat callouts, exploded sketches, and user interaction flow.',
        'Do not spend excessive time rendering textures at the expense of a functional concept.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'NATA',
      name: 'NATA (National Aptitude Test in Architecture)',
      category: 'DESIGN_ARCHITECTURE',
      description:
        'National aptitude test conducted by the Council of Architecture (CoA) for admission to the 5-year B.Arch degree program at recognized institutions across India.',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Architecture', 'Urban Planning', 'Building Technology']),
      format: 'Hybrid examination containing both computer-based aptitude MCQs and physical drawing composition on drawing sheets.',
      sections: JSON.stringify([
        { name: 'Part A: Drawing & Composition', questions: 3, durationMinutes: 90, description: '2D & 3D compositions, color harmony, memory drawing, perspective rendering (80 marks).' },
        { name: 'Part B: Architecture & Aesthetic Aptitude', questions: 45, durationMinutes: 90, description: 'Architectural awareness, mathematics, reasoning, visual perception (120 marks).' },
      ]),
      totalDurationMinutes: 180,
      scoreRange: '0 – 200 Marks',
      scoringDetails: 'Qualifying score is minimum 70/200 with sectional pass criteria in both drawing and aptitude parts.',
      validity: '2 academic years',
      importantDates: JSON.stringify([
        { label: 'Multiple Phase Windows', date: 'April through July 2026', deadline: 'Flexible slot booking' },
      ]),
      officialWebsiteUrl: 'https://www.nata.in',
      prepResources: JSON.stringify([
        { title: 'Council of Architecture NATA Portal', type: 'Official Portal', url: 'https://www.nata.in', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'A Complete Self Study Guide for B.Arch by P.K. Mishra',
        'Architecture Entrance Book by Ar. Shadan Usmani',
      ]),
      testDayTips: JSON.stringify([
        'Master one-point and two-point perspective sketches with proportional human figures.',
        'Familiarize yourself with famous architectural landmarks, Pritzker laureates, and sustainable materials.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'NIFT',
      name: 'NIFT Entrance Exam',
      category: 'DESIGN_ARCHITECTURE',
      description:
        'National entrance exam organized by the National Institute of Fashion Technology for admissions into B.Des, B.F.Tech, M.Des, M.F.M, and M.F.Tech across 18 campuses.',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Fashion Design', 'Textile Design', 'Accessory Design', 'Fashion Communication', 'Fashion Technology']),
      format: 'Creative Ability Test (CAT) + General Ability Test (GAT) followed by a Situation Test / GD & PI.',
      sections: JSON.stringify([
        { name: 'GAT (General Ability Test)', questions: 100, durationMinutes: 120, description: 'Quantitative ability, communication, English comprehension, analytical reasoning, GK.' },
        { name: 'CAT (Creative Ability Test)', questions: 3, durationMinutes: 180, description: 'Intuition, design illustration, color rendering, product concept styling.' },
      ]),
      totalDurationMinutes: 300,
      scoreRange: '0 – 100 Scaled Weighted Score',
      scoringDetails: 'B.Des weightage: CAT 50%, GAT 30%, Situation Test 20%. B.F.Tech evaluated on GAT 100%.',
      validity: '1 academic year',
      importantDates: JSON.stringify([
        { label: 'Stage 1 Written Exams', date: 'First week of February 2026', deadline: 'Registration closes December' },
        { label: 'Situation Test', date: 'April 2026', deadline: 'Invited qualifiers' },
      ]),
      officialWebsiteUrl: 'https://nift.ac.in/admissions',
      prepResources: JSON.stringify([
        { title: 'National Testing Agency NIFT Portal', type: 'Official Portal', url: 'https://nift.ntaonline.in', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'NIFT/NID/IIFT Entrance Examination by Dharmendra Mittal',
        'Fashion Illustration by Bina Abling',
      ]),
      testDayTips: JSON.stringify([
        'Use colors purposefully to highlight texture, emotion, and fabric drape in your illustrations.',
        'In the Situation Test, practice working with cardboard, clay, wire, and paper without using prohibited adhesives.',
      ]),
      hasMockTest: false,
    },

    // -------------------------------------------------------------
    // CATEGORY 8: Defence & Military Exams
    // -------------------------------------------------------------
    {
      code: 'NDA',
      name: 'NDA Exam (National Defence Academy Examination)',
      category: 'DEFENCE_MILITARY',
      description:
        'Prestigious all-India competitive examination conducted biannually by UPSC for admission to the Army, Navy, and Air Force wings of the National Defence Academy and Indian Naval Academy.',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Defence & Military', 'Armed Forces Officer Cadre']),
      format: 'Pen-and-paper written examination across Mathematics and General Ability Test (GAT) followed by the 5-day SSB Interview.',
      sections: JSON.stringify([
        { name: 'Paper I: Mathematics', questions: 120, durationMinutes: 150, description: 'Class 11 & 12 higher mathematics: algebra, matrices, trigonometry, calculus, vectors, statistics (300 marks).' },
        { name: 'Paper II: General Ability Test (GAT)', questions: 150, durationMinutes: 150, description: 'Part A English (200 marks) + Part B General Knowledge, Physics, Chemistry, History, Geography (400 marks).' },
      ]),
      totalDurationMinutes: 300,
      scoreRange: '0 – 900 Marks Written (+ 900 SSB Interview)',
      scoringDetails: 'Mathematics (+2.5, -0.83). GAT (+4.0, -1.33). Sectional qualifying cutoff of 25-30% in each paper mandatory.',
      validity: 'Course-specific commissioning batch',
      importantDates: JSON.stringify([
        { label: 'NDA I', date: 'April 2026', deadline: 'January prior' },
        { label: 'NDA II', date: 'September 2026', deadline: 'June prior' },
      ]),
      officialWebsiteUrl: 'https://upsc.gov.in',
      prepResources: JSON.stringify([
        { title: 'UPSC Official NDA Examination Portal', type: 'Official Portal', url: 'https://upsc.gov.in', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'Pathfinder for NDA and NA Entrance Examination by Arihant',
        'Mathematics for NDA and NA by R.S. Aggarwal',
      ]),
      testDayTips: JSON.stringify([
        'Ensure you meet the minimum 25% sectional cutoff in Mathematics before focusing entirely on GAT.',
        'Maintain physical fitness and leadership mindset early for the rigorous 5-day Services Selection Board (SSB).',
      ]),
      hasMockTest: false,
    },
    {
      code: 'CDS',
      name: 'CDS Exam (Combined Defence Services Examination)',
      category: 'DEFENCE_MILITARY',
      description:
        'Biannual national competitive examination conducted by UPSC for university graduates seeking commissioning into the Indian Military Academy (IMA), Naval Academy (INA), Air Force Academy (AFA), and Officers Training Academy (OTA).',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Defence Services', 'Officer Cadre', 'Leadership']),
      format: 'Offline objective test across English, General Knowledge, and Elementary Mathematics (Math omitted for OTA candidates).',
      sections: JSON.stringify([
        { name: 'English', questions: 120, durationMinutes: 120, description: 'Grammar, vocabulary, sentence correction, comprehension (100 marks).' },
        { name: 'General Knowledge', questions: 120, durationMinutes: 120, description: 'Defence affairs, current events, Indian polity, history, geography, science (100 marks).' },
        { name: 'Elementary Mathematics (IMA/INA/AFA)', questions: 100, durationMinutes: 120, description: 'Arithmetic, number theory, algebra, geometry, mensuration (100 marks).' },
      ]),
      totalDurationMinutes: 360,
      scoreRange: '0 – 300 Marks (300 for IMA/INA/AFA, 200 for OTA)',
      scoringDetails: '+0.83 marks for correct answer in English/GK, -0.27 negative marks. Elementary Math (+1.0, -0.33).',
      validity: 'Applicable commissioning course batch',
      importantDates: JSON.stringify([
        { label: 'CDS I', date: 'April 2026', deadline: 'January prior' },
        { label: 'CDS II', date: 'September 2026', deadline: 'June prior' },
      ]),
      officialWebsiteUrl: 'https://upsc.gov.in',
      prepResources: JSON.stringify([
        { title: 'UPSC CDS Previous Year Papers Archive', type: 'Official Portal', url: 'https://upsc.gov.in', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'Pathfinder for CDS Examination by Arihant',
        'Quantitative Aptitude for Competitive Examinations by R.S. Aggarwal',
      ]),
      testDayTips: JSON.stringify([
        'General Knowledge paper is known for demanding in-depth science and polity knowledge; do not guess blindly.',
        'Prepare thoroughly for the psychological and group obstacle tasks (GTO) at the SSB.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'AFCAT',
      name: 'AFCAT (Air Force Common Admission Test)',
      category: 'DEFENCE_MILITARY',
      description:
        'National examination conducted by the Indian Air Force for recruitment of commissioned officers in Flying, Ground Duty (Technical), and Ground Duty (Non-Technical) branches.',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Aviation', 'Aeronautical Engineering', 'Defence Logistics & Accounts']),
      format: 'Computer-based test of 100 objective questions followed by AFSB interview and computerized pilot selection system (CPSS).',
      sections: JSON.stringify([
        { name: 'General Awareness', questions: 25, durationMinutes: 30, description: 'History, sports, geography, environment, defence, art and culture.' },
        { name: 'Verbal Ability in English', questions: 30, durationMinutes: 35, description: 'Comprehension, error detection, sentence completion, synonyms/antonyms.' },
        { name: 'Numerical Ability', questions: 20, durationMinutes: 25, description: 'Decimals, fraction, time and work, profit & loss, percentage, ratio.' },
        { name: 'Reasoning and Military Aptitude', questions: 25, durationMinutes: 30, description: 'Verbal skills and spatial ability, figure analogies, pattern completion.' },
      ]),
      totalDurationMinutes: 120,
      scoreRange: '0 – 300 Marks',
      scoringDetails: '+3 marks for correct response, -1 mark for each incorrect response.',
      validity: 'Course-specific commissioning batch',
      importantDates: JSON.stringify([
        { label: 'AFCAT 1 Cycle', date: 'February 2026', deadline: 'December prior' },
        { label: 'AFCAT 2 Cycle', date: 'August 2026', deadline: 'June prior' },
      ]),
      officialWebsiteUrl: 'https://afcat.cdac.in',
      prepResources: JSON.stringify([
        { title: 'IAF Official AFCAT Candidate Login & Practice Portal', type: 'Official Portal', url: 'https://afcat.cdac.in', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'AFCAT (Flying, Technical & Ground Duty) by Arihant',
        'SSB Interview: The Complete Guide by Dr. N.K. Natarajan',
      ]),
      testDayTips: JSON.stringify([
        'Military Aptitude tests spatial visualization; practice identifying rotated 3D blocks and hidden figures.',
        'Candidates applying for Flying branch must qualify the CPSS pilot assessment, which is allowed once in a lifetime.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'CAPF',
      name: 'CAPF AC (Central Armed Police Forces Assistant Commandants)',
      category: 'DEFENCE_MILITARY',
      description:
        'National competitive exam conducted by UPSC for appointment of Assistant Commandants (Group A Gazetted Officers) in BSF, CRPF, CISF, ITBP, and SSB.',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Paramilitary', 'Internal Security', 'Law Enforcement']),
      format: 'Paper I (General Ability and Intelligence, objective) and Paper II (General Studies, Essay and Comprehension, descriptive).',
      sections: JSON.stringify([
        { name: 'Paper I: General Ability & Intelligence', questions: 125, durationMinutes: 120, description: 'General mental ability, general science, national & international current events, Indian polity, history (250 marks).' },
        { name: 'Paper II: General Studies, Essay & Comprehension', questions: 6, durationMinutes: 180, description: 'Essay in English or Hindi (80 marks) + Precis writing, comprehension, arguments, counter-arguments, report writing (120 marks).' },
      ]),
      totalDurationMinutes: 300,
      scoreRange: '0 – 450 Marks (+ 150 Marks Interview)',
      scoringDetails: 'Paper I has negative marking (-1/3). Paper II is evaluated only for candidates scoring above the Paper I cutoff.',
      validity: 'Batch-specific recruitment',
      importantDates: JSON.stringify([
        { label: 'Annual Examination', date: 'First Sunday of August 2026', deadline: 'Application deadline May' },
      ]),
      officialWebsiteUrl: 'https://upsc.gov.in',
      prepResources: JSON.stringify([
        { title: 'UPSC CAPF (AC) Official Information and Archives', type: 'Official Portal', url: 'https://upsc.gov.in', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'CAPF Assistant Commandants Examination by Arihant',
        'Indian Polity by M. Laxmikanth',
      ]),
      testDayTips: JSON.stringify([
        'Paper II requires strong argumentative writing skills; practice writing balanced pros-and-cons for security and social issues.',
        'Maintain strict physical endurance for the Physical Efficiency Test (100m, 800m, Long Jump, Shot Put).',
      ]),
      hasMockTest: false,
    },

    // -------------------------------------------------------------
    // CATEGORY 9: Government & Public Service Exams
    // -------------------------------------------------------------
    {
      code: 'UPSC_CSE',
      name: 'UPSC Civil Services Examination (IAS / IPS / IFS)',
      category: 'GOVERNMENT_PUBLIC_SERVICE',
      description:
        'India’s premier administrative recruitment examination conducted by the Union Public Service Commission for prestigious careers in the IAS, IPS, IFS, IRS, and central Group A services.',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Public Administration', 'Civil Services', 'Policy', 'All']),
      format: 'Three-stage selection: Preliminary (Objective), Mains (9 Descriptive Papers), and Personality Test (Interview).',
      sections: JSON.stringify([
        { name: 'Prelims GS Paper I', questions: 100, durationMinutes: 120, description: 'History, geography, polity, economy, environment, general science, current affairs (200 marks).' },
        { name: 'Prelims CSAT Paper II', questions: 80, durationMinutes: 120, description: 'Comprehension, interpersonal skills, logical reasoning, decision making, basic numeracy (200 marks, qualifying 33%).' },
        { name: 'Mains Written Examination', questions: 9, durationMinutes: 1620, description: 'Essay (250), GS I–IV (1000), Optional Subject Paper I & II (500), Qualifying Indian Language & English (600).' },
      ]),
      totalDurationMinutes: 2040,
      scoreRange: '0 – 2025 Marks (Mains 1750 + Interview 275)',
      scoringDetails: 'Prelims Paper I determines Mains eligibility (Paper II qualifying at 33%). Final ranking based on Mains (1750) + Interview (275).',
      validity: 'Annual civil services batch recruitment',
      importantDates: JSON.stringify([
        { label: 'Civil Services Prelims', date: 'Late May 2026', deadline: 'February registration closing' },
        { label: 'Civil Services Mains', date: 'September 2026', deadline: 'Prelims qualifiers' },
      ]),
      officialWebsiteUrl: 'https://upsc.gov.in',
      prepResources: JSON.stringify([
        { title: 'UPSC Official Portal & Previous Years Papers', type: 'Official Portal', url: 'https://upsc.gov.in', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'Indian Polity by M. Laxmikanth',
        'India’s Struggle for Independence by Bipan Chandra',
        'Certificate Physical and Human Geography by G.C. Leong',
        'Indian Economy by Ramesh Singh',
      ]),
      testDayTips: JSON.stringify([
        'Daily newspaper reading (The Hindu / Indian Express) is fundamental for contextual dynamic questions.',
        'In Prelims CSAT, do not take the 33% qualifying threshold lightly; practice reading comprehension thoroughly.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'SSC_CGL',
      name: 'SSC CGL (Combined Graduate Level Examination)',
      category: 'GOVERNMENT_PUBLIC_SERVICE',
      description:
        'National level recruitment examination conducted by the Staff Selection Commission for Group B and Group C officer posts in ministries, central departments, and subordinate offices.',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Public Administration', 'Auditing', 'Taxation', 'Statistics']),
      format: 'Tier I (Computer-based screening) followed by Tier II (Computer-based objective test with descriptive typing module).',
      sections: JSON.stringify([
        { name: 'Tier I: General Intelligence & Reasoning', questions: 25, durationMinutes: 15, description: 'Analogies, spatial visualization, coding-decoding (50 marks).' },
        { name: 'Tier I: General Awareness', questions: 25, durationMinutes: 15, description: 'Science, history, economics, current affairs (50 marks).' },
        { name: 'Tier I: Quantitative Aptitude', questions: 25, durationMinutes: 15, description: 'Arithmetic, algebra, geometry, trigonometry (50 marks).' },
        { name: 'Tier I: English Comprehension', questions: 25, durationMinutes: 15, description: 'Grammar, vocabulary, passage comprehension (50 marks).' },
      ]),
      totalDurationMinutes: 60,
      scoreRange: '0 – 200 Marks (Tier I) & 0 – 390 Marks (Tier II)',
      scoringDetails: 'Tier I is qualifying. Final merit is based strictly on performance in Tier II Section I and Section II.',
      validity: 'Annual recruitment cycle',
      importantDates: JSON.stringify([
        { label: 'Tier I Examination', date: 'September – October 2026', deadline: 'Application deadline July' },
      ]),
      officialWebsiteUrl: 'https://ssc.gov.in',
      prepResources: JSON.stringify([
        { title: 'Staff Selection Commission Official Examination Portal', type: 'Official Portal', url: 'https://ssc.gov.in', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'Play with Advanced Maths by Rakesh Yadav',
        'Lucent’s General Knowledge',
        'Plinth to Paramount English by Neetu Singh',
      ]),
      testDayTips: JSON.stringify([
        'With 100 questions in 60 minutes, attempt General Awareness and English first in under 20 minutes.',
        'Typing test speed (minimum 27 WPM / 2000 key depressions) is compulsory for all qualifying posts.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'IBPS_PO',
      name: 'IBPS PO (Probationary Officer Examination)',
      category: 'GOVERNMENT_PUBLIC_SERVICE',
      description:
        'Common recruitment process conducted by the Institute of Banking Personnel Selection for recruitment of Probationary Officers / Management Trainees across participating public sector banks.',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Banking & Finance', 'Public Sector Management', 'Economics']),
      format: 'Preliminary Exam (Online objective, 1 hour), Mains Exam (Online objective + descriptive essay/letter, 3.5 hours), and Interview.',
      sections: JSON.stringify([
        { name: 'Prelims: English Language', questions: 30, durationMinutes: 20, description: 'Reading comprehension, cloze test, spotting errors (30 marks).' },
        { name: 'Prelims: Quantitative Aptitude', questions: 35, durationMinutes: 20, description: 'Data interpretation, number series, quadratic equations, arithmetic (35 marks).' },
        { name: 'Prelims: Reasoning Ability', questions: 35, durationMinutes: 20, description: 'Puzzles, seating arrangements, syllogisms, inequalities (35 marks).' },
      ]),
      totalDurationMinutes: 60,
      scoreRange: '0 – 100 Marks (Prelims) & 0 – 225 Marks (Mains)',
      scoringDetails: '+1 mark for correct, -0.25 mark for wrong answer. Both sectional and overall cutoffs must be cleared.',
      validity: '1 financial year recruitment cycle',
      importantDates: JSON.stringify([
        { label: 'Prelims Examination', date: 'October 2026', deadline: 'Registration opens August' },
        { label: 'Mains Examination', date: 'November 2026', deadline: 'Prelims qualifiers' },
      ]),
      officialWebsiteUrl: 'https://www.ibps.in',
      prepResources: JSON.stringify([
        { title: 'IBPS Official Online Practice Test Simulator', type: 'Official Portal', url: 'https://www.ibps.in', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'Fast Track Objective Arithmetic by Rajesh Verma',
        'Magical Book on Quicker Maths by M. Tyra',
        'Banking Awareness by Arihant Experts',
      ]),
      testDayTips: JSON.stringify([
        'Strict 20-minute timer applies per section in Prelims; maintain high speed without losing accuracy.',
        'Daily practice of complex floor, circular, and variable puzzles is essential for the Reasoning section.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'SBI_PO',
      name: 'SBI PO (State Bank of India Probationary Officer)',
      category: 'GOVERNMENT_PUBLIC_SERVICE',
      description:
        'Premier banking recruitment examination conducted by India’s largest public commercial bank (State Bank of India) for high-potential Probationary Officer appointments.',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Banking & Finance', 'Commercial Banking', 'Management']),
      format: 'Three-phase selection: Phase-I Preliminary (CBT, 1 hour), Phase-II Main (Objective + Descriptive, 3.5 hours), and Phase-III Psychometric test, Group Exercise & Interview.',
      sections: JSON.stringify([
        { name: 'Phase I: English Language', questions: 30, durationMinutes: 20, description: 'Reading comprehension, cloze test, vocabulary, sentence completion.' },
        { name: 'Phase I: Quantitative Aptitude', questions: 35, durationMinutes: 20, description: 'Data interpretation, arithmetic, number series, data sufficiency.' },
        { name: 'Phase I: Reasoning Ability', questions: 35, durationMinutes: 20, description: 'High-level logic puzzles, input-output, critical deductions.' },
      ]),
      totalDurationMinutes: 60,
      scoreRange: '0 – 100 Marks (Phase I) & 0 – 250 Marks (Phase II)',
      scoringDetails: 'Zero sectional cutoff in SBI PO Prelims (only overall merit cutoff applies). Final merit normalized on a 75:25 ratio of Mains to Interview.',
      validity: 'Annual recruitment batch',
      importantDates: JSON.stringify([
        { label: 'Preliminary Exam', date: 'November 2026', deadline: 'September registration closing' },
        { label: 'Main Exam', date: 'January 2027', deadline: 'Shortlisted qualifiers' },
      ]),
      officialWebsiteUrl: 'https://sbi.co.in/careers',
      prepResources: JSON.stringify([
        { title: 'State Bank of India Careers Recruitment Gateway', type: 'Official Portal', url: 'https://sbi.co.in/web/careers', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'Quantitative Aptitude for Banking by R.S. Aggarwal',
        'A Complete Book on Puzzles & Seating Arrangement by Adda247',
      ]),
      testDayTips: JSON.stringify([
        'Since there is no sectional cutoff in Phase-I, maximize attempts in your strongest section to surpass the overall threshold.',
        'Mains level Data Analysis & Interpretation requires deep competence in pie charts, radar graphs, and caselets.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'RRB_NTPC',
      name: 'RRB NTPC (Railway Non-Technical Popular Categories)',
      category: 'GOVERNMENT_PUBLIC_SERVICE',
      description:
        'National recruitment examination conducted by Railway Recruitment Boards across 21 regional boards for Station Masters, Goods Guards, Commercial Apprentices, and Senior Clerks.',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Railway Operations', 'Public Administration', 'Transport Logistics']),
      format: 'CBT Stage 1 (Screening test) followed by CBT Stage 2, Typing Skill Test / Computer Based Aptitude Test (CBAT), and Document Verification.',
      sections: JSON.stringify([
        { name: 'General Awareness', questions: 40, durationMinutes: 35, description: 'Current affairs, Indian history, national movements, geography, Indian railways, science.' },
        { name: 'Mathematics', questions: 30, durationMinutes: 30, description: 'Number system, BODMAS, decimals, fractions, LCM/HCF, ratio, percentage, mensuration.' },
        { name: 'General Intelligence & Reasoning', questions: 30, durationMinutes: 25, description: 'Analogies, completion of number and alphabetical series, coding, mathematical operations.' },
      ]),
      totalDurationMinutes: 90,
      scoreRange: '0 – 100 Marks (Stage 1) & 0 – 120 Marks (Stage 2)',
      scoringDetails: '+1 mark for correct answer, -1/3 negative mark for each wrong attempt. Normalized scores used across shifts.',
      validity: 'Cadre appointment batch',
      importantDates: JSON.stringify([
        { label: 'CBT Stage 1 Examination', date: 'Periodic nationwide windows', notes: 'Conducted across designated regional RRB centers.' },
      ]),
      officialWebsiteUrl: 'https://www.rrbcdg.gov.in',
      prepResources: JSON.stringify([
        { title: 'Railway Recruitment Control Board Official Portal', type: 'Official Portal', url: 'https://www.rrbcdg.gov.in', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'RRB NTPC Guide by Arihant Experts',
        'Speedy Railway Samanya Gyan & Samanya Vigyan',
      ]),
      testDayTips: JSON.stringify([
        'General Awareness represents 40% of CBT Stage 1 questions; study Indian Railways facts and modern Indian history.',
        '90 minutes for 100 questions allows a comfortable pace; verify all mathematical calculations.',
      ]),
      hasMockTest: false,
    },

    // -------------------------------------------------------------
    // CATEGORY 10: Hospitality & Professional Entrance Exams
    // -------------------------------------------------------------
    {
      code: 'NCHM_JEE',
      name: 'NCHM JEE (National Council for Hotel Management Joint Entrance Exam)',
      category: 'HOSPITALITY_PROFESSIONAL',
      description:
        'National level entrance examination conducted by NTA for admission into the B.Sc. Hospitality & Hotel Administration program offered jointly by NCHMCT and IGNOU across Central and State Institutes of Hotel Management.',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Hospitality & Hotel Management', 'Culinary Arts', 'Tourism & Travel']),
      format: 'Computer-based Test with 200 multiple choice questions.',
      sections: JSON.stringify([
        { name: 'Numerical Ability and Analytical Aptitude', questions: 30, durationMinutes: 25, description: 'Arithmetic, proportions, percentages, graphs.' },
        { name: 'Reasoning and Logical Deduction', questions: 30, durationMinutes: 25, description: 'Series completion, analytical reasoning, coding.' },
        { name: 'General Knowledge & Current Affairs', questions: 30, durationMinutes: 25, description: 'National culture, hospitality industry brands, international current events.' },
        { name: 'English Language', questions: 60, durationMinutes: 55, description: 'Grammar, vocabulary, antonyms/synonyms, reading passages.' },
        { name: 'Aptitude for Service Sector', questions: 50, durationMinutes: 50, description: 'Service ethics, interpersonal relations, hospitality scenarios.' },
      ]),
      totalDurationMinutes: 180,
      scoreRange: '0 – 800 Marks',
      scoringDetails: '+4 marks for correct answer, -1 mark for wrong answer. Aptitude for Service Sector evaluated with graded positive marks (1 to 4).',
      validity: '1 academic year',
      importantDates: JSON.stringify([
        { label: 'Annual Examination', date: 'May 2026', deadline: 'Registration closes April' },
      ]),
      officialWebsiteUrl: 'https://nchmjee.nta.nic.in',
      prepResources: JSON.stringify([
        { title: 'NTA Official NCHM JEE Information Bulletin', type: 'Official Portal', url: 'https://nchmjee.nta.nic.in', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'NCHMCT JEE Entrance Exam Guide by R. Gupta',
        'Hotel Management Entrance Exam Guide by Arihant',
      ]),
      testDayTips: JSON.stringify([
        'In "Aptitude for Service Sector", always choose customer-centric, patient, and polite professional responses.',
        'English Language carries 60 questions (30% weight); practice speed-reading hospitality articles.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'PROFESSIONAL_ADMISSIONS',
      name: 'Other Course-Specific Professional Admission Exams',
      category: 'HOSPITALITY_PROFESSIONAL',
      description:
        'Specialized entrance evaluations for professional career streams including aviation pilot licenses (DGCA), actuarial sciences (ACET), chartered accounting foundation (CA Foundation), and maritime academy qualifications (IMU CET).',
      destinations: JSON.stringify(['India', 'Global']),
      relevantStreams: JSON.stringify(['Aviation', 'Actuarial Sciences', 'Finance & Accounting', 'Maritime Studies', 'Professional Licensure']),
      format: 'Computer-based and proctored statutory assessments administered by regulatory professional bodies.',
      sections: JSON.stringify([
        { name: 'Domain Aptitude & Applied Mathematics', questions: 40, durationMinutes: 60, description: 'Calculus, statistics, applied physics, navigation or commercial mathematics.' },
        { name: 'Professional Logic & Regulatory Frameworks', questions: 40, durationMinutes: 60, description: 'Statutory compliance, ethical reasoning, commercial business comprehension.' },
      ]),
      totalDurationMinutes: 120,
      scoreRange: '0 – 100 Percentage / Pass Certificate',
      scoringDetails: 'Statutory passing criteria (typically 50% aggregate and minimum 40% per subject).',
      validity: '3 to 5 years based on licensing council guidelines',
      importantDates: JSON.stringify([
        { label: 'Rolling Quarterly Sessions', date: 'March, June, September, December 2026', deadline: 'Continuous enrolment' },
      ]),
      officialWebsiteUrl: 'https://superconsciousness.internal/professional-exams',
      prepResources: JSON.stringify([
        { title: 'Superconsciousness Professional Pathways Portal', type: 'Guide', url: 'https://superconsciousness.internal', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'Principles of Aviation Navigation & Air Regulations',
        'ACET Actuarial Common Entrance Test Prep Manual',
      ]),
      testDayTips: JSON.stringify([
        'Review specific council guidelines (DGCA / IAI / ICAI / IMU) at least two weeks before the test.',
        'Focus on regulatory terminology and accuracy over rushed guessing.',
      ]),
      hasMockTest: false,
    },

    // -------------------------------------------------------------
    // Preserve existing database entry: NEET
    // -------------------------------------------------------------
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
    {
      code: 'COMEDK_UGET',
      name: 'COMEDK UGET (Consortium of Medical, Engineering and Dental Colleges of Karnataka)',
      category: 'ENGINEERING_TECHNOLOGY',
      description:
        'State-level online entrance examination conducted by COMEDK for admissions to undergraduate engineering courses (B.E./B.Tech) across over 190 private engineering colleges in Karnataka.',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Engineering & Technology', 'Computer Science', 'Electronics', 'Mechanical']),
      format: 'Computer-based Test (CBT) with 180 multiple-choice questions.',
      sections: JSON.stringify([
        { name: 'Physics', questions: 60, durationMinutes: 60, description: 'Class 11 & 12 syllabus physics questions.' },
        { name: 'Chemistry', questions: 60, durationMinutes: 60, description: 'Physical, organic, and inorganic chemistry.' },
        { name: 'Mathematics', questions: 60, durationMinutes: 60, description: 'Calculus, algebra, vectors, and coordinate geometry.' },
      ]),
      totalDurationMinutes: 180,
      scoreRange: '0 – 180 Marks',
      scoringDetails: '+1 mark for each correct answer; NO negative marking for incorrect answers.',
      validity: '1 academic year',
      importantDates: JSON.stringify([
        { label: 'Annual Examination', date: 'May 2026', deadline: 'April prior' },
      ]),
      officialWebsiteUrl: 'https://www.comedk.org',
      prepResources: JSON.stringify([
        { title: 'COMEDK Official Examination Portal', type: 'Official Portal', url: 'https://www.comedk.org', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'COMEDK Chapterwise Solutions by MTG',
        'Concepts of Physics by H.C. Verma',
      ]),
      testDayTips: JSON.stringify([
        'With no negative marking, ensure all 180 questions are attempted. Manage a steady 1 minute per question pace.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'KCET',
      name: 'KCET (Karnataka Common Entrance Test)',
      category: 'ENGINEERING_TECHNOLOGY',
      description:
        'State-level entrance test conducted by the Karnataka Examinations Authority (KEA) for admission to undergraduate engineering, technology, pharmacy, and farm science programs in Karnataka.',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Engineering & Technology', 'Information Science', 'Electrical']),
      format: 'Offline Pen-and-Paper (OMR Sheet) across sessions over two consecutive days.',
      sections: JSON.stringify([
        { name: 'Mathematics', questions: 60, durationMinutes: 80, description: 'State PUC syllabus Mathematics.' },
        { name: 'Physics', questions: 60, durationMinutes: 80, description: 'State PUC syllabus Physics.' },
        { name: 'Chemistry', questions: 60, durationMinutes: 80, description: 'State PUC syllabus Chemistry.' },
      ]),
      totalDurationMinutes: 240,
      scoreRange: '0 – 180 Marks (60 marks per subject)',
      scoringDetails: '+1 mark per correct answer; no negative marking.',
      validity: '1 academic year',
      importantDates: JSON.stringify([
        { label: 'Annual Examination', date: 'April / May 2026', deadline: 'March prior' },
      ]),
      officialWebsiteUrl: 'https://cetonline.karnataka.gov.in/kea',
      prepResources: JSON.stringify([
        { title: 'KEA Official Karnataka CET Portal', type: 'Official Portal', url: 'https://cetonline.karnataka.gov.in/kea', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'Karnataka CET Explorer by MTG',
        'Pre-University Course (PUC) Textbooks',
      ]),
      testDayTips: JSON.stringify([
        'Thorough mastery of 1st and 2nd PUC state syllabus is paramount as direct conceptual questions feature heavily.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'WBJEE',
      name: 'WBJEE (West Bengal Joint Entrance Examination)',
      category: 'ENGINEERING_TECHNOLOGY',
      description:
        'State-level common entrance examination conducted by the West Bengal Joint Entrance Examinations Board for admission into undergraduate engineering and pharmacy courses in West Bengal, including Jadavpur University.',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Engineering & Technology', 'Computer Science', 'Applied Physics']),
      format: 'Offline OMR-based test comprising two papers: Paper 1 (Mathematics) and Paper 2 (Physics & Chemistry).',
      sections: JSON.stringify([
        { name: 'Paper 1: Mathematics', questions: 75, durationMinutes: 120, description: 'Category 1 (50x1), Category 2 (15x2), Category 3 (10x2).' },
        { name: 'Paper 2: Physics & Chemistry', questions: 80, durationMinutes: 120, description: 'Physics 40 questions + Chemistry 40 questions.' },
      ]),
      totalDurationMinutes: 240,
      scoreRange: '0 – 200 Marks (Maths: 100, Physics: 50, Chemistry: 50)',
      scoringDetails: 'Three categories of questions with +1, +2 marks and negative marking (-0.25, -0.5) in Category 1 & 2. No negative in Category 3.',
      validity: '1 academic year',
      importantDates: JSON.stringify([
        { label: 'Annual Examination', date: 'April 2026', deadline: 'February prior' },
      ]),
      officialWebsiteUrl: 'https://wbjeeb.nic.in',
      prepResources: JSON.stringify([
        { title: 'WBJEEB Official Portal', type: 'Official Portal', url: 'https://wbjeeb.nic.in', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'WBJEE Engineering Entrance Exam by Arihant',
        'Problems in General Physics by I.E. Irodov',
      ]),
      testDayTips: JSON.stringify([
        'Mathematics accounts for 50% of the aggregate score. Practice category 3 multiple-correct questions without negative marking.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'MHT_CET',
      name: 'MHT CET (Maharashtra Common Entrance Test)',
      category: 'ENGINEERING_TECHNOLOGY',
      description:
        'State-level computer-based entrance examination administered by the State Common Entrance Test Cell, Maharashtra, for undergraduate engineering and technology (B.E./B.Tech) and pharmacy programs.',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Engineering & Technology', 'Computer Engineering', 'Mechanical', 'Civil']),
      format: 'Online Computer-Based Test (CBT) featuring PCM and PCB groups.',
      sections: JSON.stringify([
        { name: 'Mathematics', questions: 50, durationMinutes: 90, description: '50 questions at 2 marks each.' },
        { name: 'Physics & Chemistry', questions: 100, durationMinutes: 90, description: '50 Physics + 50 Chemistry at 1 mark each.' },
      ]),
      totalDurationMinutes: 180,
      scoreRange: '0 – 200 Marks (Percentile Normalized Score)',
      scoringDetails: '+2 marks per question in Mathematics, +1 mark in Physics/Chemistry; No negative marking.',
      validity: '1 academic year',
      importantDates: JSON.stringify([
        { label: 'Annual Examination Window', date: 'April / May 2026', deadline: 'March prior' },
      ]),
      officialWebsiteUrl: 'https://cetcell.mahacet.org',
      prepResources: JSON.stringify([
        { title: 'Maharashtra State CET Cell Portal', type: 'Official Portal', url: 'https://cetcell.mahacet.org', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'Marvel MHT-CET Engineering',
        'Target Publications MHT-CET Triumph Series',
      ]),
      testDayTips: JSON.stringify([
        'Mathematics has a 2-mark question weight; focus on high-yield calculus and coordinate geometry.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'IPMAT',
      name: 'IPMAT (Integrated Programme in Management Aptitude Test)',
      category: 'MBA_MANAGEMENT',
      description:
        'Premier national aptitude test conducted by IIM Indore and IIM Rohtak for admission to the prestigious 5-year Dual-Degree Integrated Programme in Management (BBA + MBA) immediately following Class 12.',
      destinations: JSON.stringify(['India']),
      relevantStreams: JSON.stringify(['Business & Management', 'Finance', 'Economics', 'Undergraduate Management']),
      format: 'Computer-based Test (CBT) comprising quantitative ability and verbal ability.',
      sections: JSON.stringify([
        { name: 'Quantitative Ability (Short Answer)', questions: 15, durationMinutes: 40, description: 'Numerical answer type questions without options.' },
        { name: 'Quantitative Ability (MCQ)', questions: 30, durationMinutes: 40, description: 'Multiple choice quantitative problem solving.' },
        { name: 'Verbal Ability (MCQ)', questions: 45, durationMinutes: 40, description: 'Reading comprehension, grammar, and vocabulary.' },
      ]),
      totalDurationMinutes: 120,
      scoreRange: '0 – 360 Marks',
      scoringDetails: '+4 marks for correct response; -1 mark for wrong answer in MCQs. No negative marking for Short Answer questions.',
      validity: '1 academic year',
      importantDates: JSON.stringify([
        { label: 'Annual Examination', date: 'May 2026', deadline: 'April prior' },
      ]),
      officialWebsiteUrl: 'https://www.iimidr.ac.in',
      prepResources: JSON.stringify([
        { title: 'IIM Indore IPM Information Bulletin', type: 'Official Portal', url: 'https://www.iimidr.ac.in', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'Crack the IIM with IPMAT by Pearson',
        'Word Power Made Easy by Norman Lewis',
      ]),
      testDayTips: JSON.stringify([
        'Sectional time limits are strictly enforced (40 minutes each). Maximize short-answer attempts as they carry no negative penalties.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'TOEIC',
      name: 'TOEIC (Test of English for International Communication)',
      category: 'LANGUAGE_PROFICIENCY',
      description:
        'Standardized international assessment developed by ETS measuring everyday English language skills of people working in an international business or corporate environment.',
      destinations: JSON.stringify(['Global', 'Japan', 'South Korea', 'United States', 'Europe']),
      relevantStreams: JSON.stringify(['Corporate Business', 'International Trade', 'Aviation', 'Global Careers']),
      format: 'Paper-delivered and computer-based Listening & Reading assessment.',
      sections: JSON.stringify([
        { name: 'Listening Comprehension', questions: 100, durationMinutes: 45, description: 'Photographs, question-response, conversations, short talks.' },
        { name: 'Reading Comprehension', questions: 100, durationMinutes: 75, description: 'Incomplete sentences, text completion, reading passages.' },
      ]),
      totalDurationMinutes: 120,
      scoreRange: '10 – 990 Scaled Score (5 to 495 per section)',
      scoringDetails: 'Scores determined by number of correct answers converted to a scaled score. No points subtracted for wrong answers.',
      validity: '2 years from test date',
      importantDates: JSON.stringify([
        { label: 'Monthly Continuous Testing', date: 'Throughout 2026', deadline: '2 weeks before test date' },
      ]),
      officialWebsiteUrl: 'https://www.ets.org/toeic',
      prepResources: JSON.stringify([
        { title: 'ETS TOEIC Official Portal', type: 'Official Portal', url: 'https://www.ets.org/toeic', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'Official TOEIC Assessment Guide by ETS',
        'Barron\'s TOEIC Practice Exams',
      ]),
      testDayTips: JSON.stringify([
        'Time management in the 75-minute Reading section is critical; allocate under 45 seconds per text completion item.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'OET',
      name: 'OET (Occupational English Test)',
      category: 'LANGUAGE_PROFICIENCY',
      description:
        'International English language test specifically tailored for healthcare professionals seeking to register and practice in English-speaking medical environments globally.',
      destinations: JSON.stringify(['United Kingdom', 'Australia', 'New Zealand', 'United States', 'Canada', 'Ireland']),
      relevantStreams: JSON.stringify(['Medicine', 'Nursing', 'Pharmacy', 'Dentistry', 'Healthcare Sciences']),
      format: 'Paper-based or Computer-delivered (OET on Computer / OET at Home).',
      sections: JSON.stringify([
        { name: 'Listening', questions: 42, durationMinutes: 45, description: 'Consultations, workplace briefings, professional healthcare presentations.' },
        { name: 'Reading', questions: 42, durationMinutes: 60, description: 'Expeditious reading task and healthcare workplace texts.' },
        { name: 'Writing (Referral Letter)', questions: 1, durationMinutes: 45, description: 'Profession-specific medical referral or discharge letter.' },
        { name: 'Speaking (Role-Play)', questions: 2, durationMinutes: 20, description: 'Healthcare professional-patient interactive consultations.' },
      ]),
      totalDurationMinutes: 170,
      scoreRange: '0 – 500 (Grades A, B, C+, C, D, E); Grade B (350+) typically required',
      scoringDetails: 'Each sub-test is scored on a scale from 0 to 500 in 10-point increments.',
      validity: '2 years for healthcare regulatory boards',
      importantDates: JSON.stringify([
        { label: 'Twice Monthly Test Dates', date: 'Year-round 2026', deadline: '3 weeks before test' },
      ]),
      officialWebsiteUrl: 'https://www.occupationalenglishtest.org',
      prepResources: JSON.stringify([
        { title: 'OET Official Website', type: 'Official Portal', url: 'https://www.occupationalenglishtest.org', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'OET Official Practice Books by Cambridge Boxhill',
        'Kaplan OET Prep Plus',
      ]),
      testDayTips: JSON.stringify([
        'In Writing, strictly structure the medical discharge/referral letter according to the stimulus case notes.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'DELE',
      name: 'DELE (Diplomas de Español como Lengua Extranjera)',
      category: 'LANGUAGE_PROFICIENCY',
      description:
        'Official qualifications certifying the degree of competence and mastery of the Spanish language, granted by Spain\'s Instituto Cervantes on behalf of the Ministry of Education and Vocational Training.',
      destinations: JSON.stringify(['Spain', 'Latin America', 'European Union', 'Global']),
      relevantStreams: JSON.stringify(['Arts & Humanities', 'Diplomacy', 'International Relations', 'Spanish Language Studies']),
      format: 'Paper-delivered examination structured according to CEFR levels (A1 to C2).',
      sections: JSON.stringify([
        { name: 'Reading Comprehension', questions: 36, durationMinutes: 70, description: 'Multiple text types evaluating global and specific comprehension.' },
        { name: 'Listening Comprehension', questions: 30, durationMinutes: 40, description: 'Audio dialogues, news bulletins, and interviews.' },
        { name: 'Written Expression and Interaction', questions: 2, durationMinutes: 80, description: 'Formal letter / essay synthesis task.' },
        { name: 'Oral Expression and Interaction', questions: 3, durationMinutes: 20, description: 'Monologue and conversation with examiner.' },
      ]),
      totalDurationMinutes: 210,
      scoreRange: '0 – 100 Marks (Minimum 60/100 required for APTO passing qualification)',
      scoringDetails: 'Group 1 (Reading + Writing) requires min 30/50; Group 2 (Listening + Speaking) requires min 30/50.',
      validity: 'Lifetime validity (diplomas do not expire)',
      importantDates: JSON.stringify([
        { label: 'Global Exam Calls', date: 'April, May, July, October, November 2026', deadline: '6 weeks prior' },
      ]),
      officialWebsiteUrl: 'https://examenes.cervantes.es/es/dele/que-es',
      prepResources: JSON.stringify([
        { title: 'Instituto Cervantes DELE Portal', type: 'Official Portal', url: 'https://examenes.cervantes.es/es/dele/que-es', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'Preparación al Diploma de Español DELE B2 by Edelsa',
        'Cronómetro DELE',
      ]),
      testDayTips: JSON.stringify([
        'Mastering formal written structures for letters and essays is vital. Spoken interview requires fluent conversation with native examiners.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'DELF',
      name: 'DELF / DALF (Diplôme d\'Études en Langue Française)',
      category: 'LANGUAGE_PROFICIENCY',
      description:
        'Official certification of French language abilities for non-native speakers, administered by France Éducation International on behalf of the French Ministry of National Education.',
      destinations: JSON.stringify(['France', 'Canada', 'Switzerland', 'Belgium', 'Global']),
      relevantStreams: JSON.stringify(['French Language Studies', 'Culinary Arts', 'European Law', 'International Relations']),
      format: 'Paper-based four-skill assessment corresponding to CEFR levels (A1 through B2 for DELF; C1-C2 for DALF).',
      sections: JSON.stringify([
        { name: 'Compréhension de l\'oral (Listening)', questions: 30, durationMinutes: 30, description: 'Audio recordings from daily life and radio.' },
        { name: 'Compréhension des écrits (Reading)', questions: 30, durationMinutes: 60, description: 'Articles, essays, and informational texts.' },
        { name: 'Production écrite (Writing)', questions: 1, durationMinutes: 60, description: 'Formal argumentation or letter of complaint.' },
        { name: 'Production orale (Speaking)', questions: 3, durationMinutes: 20, description: 'Guided interview, interactive exercise, presentation.' },
      ]),
      totalDurationMinutes: 170,
      scoreRange: '0 – 100 Points (25 points per skill; Minimum 50/100 required with no skill under 5/25)',
      scoringDetails: 'Passing grade (Admis) requires 50/100 total points and at least 5/25 on each module.',
      validity: 'Lifetime validity (valid for life)',
      importantDates: JSON.stringify([
        { label: 'Spring & Autumn Sessions', date: 'March, June, November 2026', deadline: '1 month prior' },
      ]),
      officialWebsiteUrl: 'https://www.france-education-international.fr',
      prepResources: JSON.stringify([
        { title: 'France Éducation International DELF Portal', type: 'Official Portal', url: 'https://www.france-education-international.fr', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'Le DELF 100% Réussite B2 by Didier',
        'Réussir le DELF by Hachette',
      ]),
      testDayTips: JSON.stringify([
        'In production écrite, follow strict French essay formatting (introduction, thèse, antithèse, synthèse, conclusion).',
      ]),
      hasMockTest: false,
    },
    {
      code: 'GOETHE',
      name: 'Goethe-Zertifikat (German Language Examination)',
      category: 'LANGUAGE_PROFICIENCY',
      description:
        'Internationally recognized German language examinations developed by the Goethe-Institut, accepted globally by universities (B2/C1 for Studienkolleg / Degree admission) and visa authorities.',
      destinations: JSON.stringify(['Germany', 'Austria', 'Switzerland', 'European Union']),
      relevantStreams: JSON.stringify(['Engineering & Technology', 'German Studies', 'Automotive', 'Medical Residency in Germany']),
      format: 'Modular paper or digital exam assessing Reading, Listening, Writing, and Speaking.',
      sections: JSON.stringify([
        { name: 'Lesen (Reading)', questions: 30, durationMinutes: 65, description: 'Articles, reviews, instructions, opinion pieces.' },
        { name: 'Hören (Listening)', questions: 30, durationMinutes: 40, description: 'Conversations, phone messages, radio broadcasts.' },
        { name: 'Schreiben (Writing)', questions: 2, durationMinutes: 75, description: 'Formal essay and email response.' },
        { name: 'Sprechen (Speaking)', questions: 2, durationMinutes: 15, description: 'Presentation and discussion in pairs.' },
      ]),
      totalDurationMinutes: 195,
      scoreRange: '0 – 100 Points per module (60% passing threshold per module)',
      scoringDetails: 'Modules can be taken and passed individually or collectively.',
      validity: 'Lifetime validity',
      importantDates: JSON.stringify([
        { label: 'Monthly Sessions', date: 'Monthly throughout 2026', deadline: '3 weeks prior' },
      ]),
      officialWebsiteUrl: 'https://www.goethe.de',
      prepResources: JSON.stringify([
        { title: 'Goethe-Institut Examination Portal', type: 'Official Portal', url: 'https://www.goethe.de', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'Mit Erfolg zum Goethe-Zertifikat B2 by Klett',
        'Fit fürs Goethe-Zertifikat',
      ]),
      testDayTips: JSON.stringify([
        'In the speaking section, pair work with another candidate is required; practice expressing opinions, agreeing, and politely disagreeing in German.',
      ]),
      hasMockTest: false,
    },
    {
      code: 'HSK',
      name: 'HSK (Hanyu Shuiping Kaoshi - Chinese Proficiency Test)',
      category: 'LANGUAGE_PROFICIENCY',
      description:
        'Standardized national test of Chinese language proficiency for non-native speakers, administered by the Center for Language Education and Cooperation (CLEC) under the Ministry of Education of China.',
      destinations: JSON.stringify(['China', 'Taiwan', 'Singapore', 'Global']),
      relevantStreams: JSON.stringify(['Sinology', 'East Asian Trade', 'International Business', 'Chinese Language']),
      format: 'Computer-based or paper-based test across 6 levels (HSK 1 to 6; HSK 3.0 system).',
      sections: JSON.stringify([
        { name: 'Listening (Tingli)', questions: 45, durationMinutes: 30, description: 'Spoken Chinese comprehension in dialogues and paragraphs.' },
        { name: 'Reading (Yuedu)', questions: 45, durationMinutes: 40, description: 'Sentence completion, passage comprehension, speed reading.' },
        { name: 'Writing (Shuxie)', questions: 10, durationMinutes: 25, description: 'Sentence construction and short essay composition.' },
      ]),
      totalDurationMinutes: 105,
      scoreRange: '0 – 300 Points (100 points per section; 180 passing mark)',
      scoringDetails: 'Total score of 180 out of 300 required to pass HSK 4/5/6 for Chinese university scholarship eligibility.',
      validity: '2 years for university admissions in China',
      importantDates: JSON.stringify([
        { label: 'Monthly Global Dates', date: 'Monthly across 2026', deadline: '3 weeks prior' },
      ]),
      officialWebsiteUrl: 'https://www.chinesetest.cn',
      prepResources: JSON.stringify([
        { title: 'Official Chinese Testing Service Portal', type: 'Official Portal', url: 'https://www.chinesetest.cn', isFree: true },
      ]),
      recommendedBooks: JSON.stringify([
        'HSK Standard Course 4/5 by Beijing Language and Culture University Press',
      ]),
      testDayTips: JSON.stringify([
        'Character stroke order and pinyin typing speed are essential for the computer-based writing section.',
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

    // Seed realistic diagnostic practice mock tests for SAT, IELTS, and JEE Main
    if (exam.code === 'SAT') {
      await seedSatMockTest(examRecord.id);
    } else if (exam.code === 'IELTS') {
      await seedIeltsMockTest(examRecord.id);
    } else if (exam.code === 'JEE_MAIN') {
      await seedJeeMockTest(examRecord.id);
    }
  }

  // -------------------------------------------------------------
  // Seed the 7 Main Exam Categories into SQLite
  // -------------------------------------------------------------
  for (const cat of MAIN_EXAM_CATEGORIES) {
    await prisma.examCategory.upsert({
      where: { id: cat.id },
      create: {
        id: cat.id,
        code: cat.code,
        name: cat.name,
        description: cat.description,
        orderIndex: cat.orderIndex,
      },
      update: {
        code: cat.code,
        name: cat.name,
        description: cat.description,
        orderIndex: cat.orderIndex,
      },
    });
  }

  // -------------------------------------------------------------
  // Remove Obsolete Categories and Junction Mappings Safely
  // -------------------------------------------------------------
  for (const remId of REMOVED_CATEGORY_IDS) {
    await prisma.examCategoryMapping.deleteMany({
      where: { categoryId: remId },
    });
    await prisma.examCategory.deleteMany({
      where: { id: remId },
    });
  }

  // -------------------------------------------------------------
  // Seed Many-to-Many ExamCategoryMapping Junction Table
  // Prevents duplicate exam records and ensures shared canonical identity
  // -------------------------------------------------------------
  for (const cat of MAIN_EXAM_CATEGORIES) {
    let order = 1;
    for (const examCode of cat.examCodes) {
      const examRecord = await prisma.entranceExam.findUnique({
        where: { code: examCode },
      });
      if (examRecord) {
        await prisma.examCategoryMapping.upsert({
          where: {
            categoryId_examId: {
              categoryId: cat.id,
              examId: examRecord.id,
            },
          },
          create: {
            categoryId: cat.id,
            examId: examRecord.id,
            orderIndex: order++,
          },
          update: {
            orderIndex: order++,
          },
        });
      }
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
      questionText: 'Although the author’s primary claim was initially met with skepticism, recent archaeological findings in Mesopotamia have provided _____ evidence supporting her hypothesis.',
      options: JSON.stringify(['substantiating', 'contradictory', 'equivocal', 'superfluous']),
      correctOptionIndex: 0,
      explanation: '"Substantiating" means providing evidence to support or prove the truth of something, which logically completes the shift introduced by "Although... initially met with skepticism".',
      marks: 1,
      orderIndex: 1,
    },
    {
      section: 'Reading & Writing',
      questionText: 'Which choice completes the text with the most logical transition? "The laboratory team successfully developed an organic solar cell capable of 18% energy conversion efficiency. _____, commercial production remains limited due to the current cost of rare earth solvents."',
      options: JSON.stringify(['Consequently', 'However', 'Furthermore', 'Similarly']),
      correctOptionIndex: 1,
      explanation: '"However" properly establishes the contrasting limitation following the successful efficiency breakthrough.',
      marks: 1,
      orderIndex: 2,
    },
    {
      section: 'Mathematics',
      questionText: 'If 3x + 7 = 22, what is the value of 6x - 5?',
      options: JSON.stringify(['25', '30', '35', '40']),
      correctOptionIndex: 0,
      explanation: '3x = 22 - 7 = 15, so x = 5. Therefore, 6(5) - 5 = 30 - 5 = 25.',
      marks: 1,
      orderIndex: 3,
    },
    {
      section: 'Mathematics',
      questionText: 'A right circular cylinder has a base radius of 4 units and a height of 9 units. What is the total volume of the cylinder in terms of pi?',
      options: JSON.stringify(['36 pi', '72 pi', '144 pi', '288 pi']),
      correctOptionIndex: 2,
      explanation: 'Volume = pi * r^2 * h = pi * (4)^2 * 9 = pi * 16 * 9 = 144 pi.',
      marks: 1,
      orderIndex: 4,
    },
    {
      section: 'Mathematics',
      questionText: 'For the quadratic function f(x) = (x - 3)(x + 7), for what value of x does f(x) reach its minimum value?',
      options: JSON.stringify(['-2', '2', '-5', '0']),
      correctOptionIndex: 0,
      explanation: 'The vertex x-coordinate of a parabola lies midway between its roots: (3 + (-7)) / 2 = -4 / 2 = -2.',
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
    where: { examId, title: 'IELTS Academic Reading & Listening Diagnostic' },
  });

  if (existingTest) return;

  const mockTest = await prisma.mockTest.create({
    data: {
      examId,
      title: 'IELTS Academic Reading & Listening Diagnostic',
      description: 'A focused 12-minute diagnostic module assessing paragraph matching, vocabulary in context, and academic listening inferences.',
      durationMinutes: 12,
      totalMarks: 4,
      passingMarks: 3,
    },
  });

  const questions = [
    {
      section: 'Reading',
      questionText: 'Read the sentence: "The unprecedented migration of urban populations into regional hubs was precipitated largely by telecommuting flexibility." What is the closest synonym for "precipitated"?',
      options: JSON.stringify(['delayed', 'triggered', 'discouraged', 'anticipated']),
      correctOptionIndex: 1,
      explanation: '"Precipitated" in this academic context means caused or triggered an event to happen prematurely or suddenly.',
      marks: 1,
      orderIndex: 1,
    },
    {
      section: 'Reading',
      questionText: 'In IELTS Academic Writing Task 1, which of the following is considered an essential requirement for achieving Band 7 or higher?',
      options: JSON.stringify([
        'Expressing your personal opinion about the historical causes of the data trends',
        'Presenting a clear overview summarizing the main trends, differences, or stages',
        'Listing every single numerical data point without comparison',
        'Writing at least 400 words regardless of the time limit'
      ]),
      correctOptionIndex: 1,
      explanation: 'Band 7 descriptors explicitly require presenting a clear overview of main trends, differences, or stages without expressing personal speculation.',
      marks: 1,
      orderIndex: 2,
    },
    {
      section: 'Listening',
      questionText: 'A speaker states: "Although reservations were nominally open until 6:00 PM, the ticket office ceased processing walk-in visitors half an hour prior." At what time did walk-in processing stop?',
      options: JSON.stringify(['5:30 PM', '6:00 PM', '6:30 PM', '5:00 PM']),
      correctOptionIndex: 0,
      explanation: 'Half an hour (30 minutes) prior to 6:00 PM is 5:30 PM.',
      marks: 1,
      orderIndex: 3,
    },
    {
      section: 'Listening',
      questionText: 'Which connector is most appropriate to present an opposing viewpoint in IELTS Academic Writing Task 2?',
      options: JSON.stringify(['On the other hand', 'For instance', 'As a consequence', 'In addition']),
      correctOptionIndex: 0,
      explanation: '"On the other hand" is standard formal discourse to introduce a contrasting or counter-argumentative paragraph.',
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
    where: { examId, title: 'JEE Main Diagnostic Quick Quiz' },
  });

  if (existingTest) return;

  const mockTest = await prisma.mockTest.create({
    data: {
      examId,
      title: 'JEE Main Diagnostic Quick Quiz',
      description: 'A 15-minute diagnostic test spanning fundamental physics, chemistry stoichiometry, and coordinate geometry.',
      durationMinutes: 15,
      totalMarks: 4,
      passingMarks: 2,
    },
  });

  const questions = [
    {
      section: 'Physics',
      questionText: 'A particle moves in a circular path of radius R with constant speed v. What is the magnitude of the average acceleration over a quarter revolution?',
      options: JSON.stringify(['2 v^2 / (pi R)', '2 * sqrt(2) * v^2 / (pi R)', 'v^2 / R', 'sqrt(2) * v^2 / (pi R)']),
      correctOptionIndex: 1,
      explanation: 'The change in velocity vector is sqrt(2)*v. Time for quarter circle is (pi*R/2) / v. Average acceleration = delta_v / delta_t = (sqrt(2)*v) / (pi*R/(2v)) = 2*sqrt(2)*v^2 / (pi*R).',
      marks: 1,
      orderIndex: 1,
    },
    {
      section: 'Chemistry',
      questionText: 'Which of the following compounds exhibits the highest boiling point due to extensive intermolecular hydrogen bonding?',
      options: JSON.stringify(['Ethanol (C2H5OH)', 'Dimethyl ether (CH3-O-CH3)', 'Ethane (C2H6)', 'Water (H2O)']),
      correctOptionIndex: 3,
      explanation: 'Water molecules form an average of four hydrogen bonds per molecule in a tetrahedral structure, resulting in a significantly higher boiling point (100°C) than ethanol (78°C).',
      marks: 1,
      orderIndex: 2,
    },
    {
      section: 'Mathematics',
      questionText: 'What is the sum of the roots of the quadratic equation 2x^2 - 12x + 11 = 0?',
      options: JSON.stringify(['6', '-6', '11/2', '3']),
      correctOptionIndex: 0,
      explanation: 'By Vieta\'s formulas, sum of roots = -b / a = -(-12) / 2 = 6.',
      marks: 1,
      orderIndex: 3,
    },
    {
      section: 'Mathematics',
      questionText: 'What is the value of limit as x approaches 0 of (sin(3x)) / x?',
      options: JSON.stringify(['0', '1', '3', 'Does not exist']),
      correctOptionIndex: 2,
      explanation: 'lim_{x->0} sin(3x)/x = 3 * lim_{x->0} sin(3x)/(3x) = 3 * 1 = 3.',
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
