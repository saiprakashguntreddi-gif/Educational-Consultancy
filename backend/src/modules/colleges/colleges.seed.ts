import { prisma } from '../../shared/database/prisma.service';

export interface SeedInstitutionData {
  slug: string;
  name: string;
  country: string;
  city: string;
  state?: string;
  institutionType: string;
  establishedYear: number;
  overview: string;
  rankingInfo: string;
  campusFacilities: string[];
  placementInfo?: string;
  admissionDeadlines?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  officialWebsiteUrl: string;
  hasScholarships: boolean;
  scholarshipDetails?: string;
  minAnnualFee: number;
  maxAnnualFee: number;
  feeCurrency: string;
  bannerImageUrl?: string;
  logoUrl?: string;
  courses: {
    name: string;
    department: string;
    specialization?: string;
    level: string;
    durationYears: number;
    durationText: string;
    description: string;
    eligibilityCriteria: string;
    annualTuitionFee: number;
    feeCurrency: string;
    feeRange: string;
    entranceExamsRequired: string[];
    scholarshipAvailable: boolean;
    scholarshipDetails?: string;
    applicationDeadline: string;
    isPopular: boolean;
  }[];
}

export const VERIFIED_INSTITUTIONS_CATALOG: SeedInstitutionData[] = [
  {
    slug: 'mit',
    name: 'Massachusetts Institute of Technology',
    country: 'United States',
    city: 'Cambridge',
    state: 'Massachusetts',
    institutionType: 'Private Research University',
    establishedYear: 1861,
    overview:
      'The Massachusetts Institute of Technology is a world-renowned private research university founded in 1861. MIT is dedicated to advancing knowledge and educating students in science, technology, and other areas of scholarship that will best serve the nation and the world in the 21st century.',
    rankingInfo: 'QS World University Rankings: #1 Globally (2024 / 2025)',
    campusFacilities: [
      'Ray and Maria Stata Center for Computer Science and AI',
      'Barker Engineering Library and Hayden Science Library',
      'MIT.nano Advanced Nanotechnology Facility',
      'Zesiger Sports and Fitness Center',
      'On-Campus Undergraduate & Graduate Residential Halls',
    ],
    placementInfo:
      'MIT Career Advising & Professional Development reports top employers including Google, Microsoft, Apple, McKinsey, NASA, and leading deep-tech research institutes globally.',
    admissionDeadlines: 'Early Action: November 1 | Regular Action: January 5 (Fall Admission)',
    contactEmail: 'admissions@mit.edu',
    contactPhone: '+1 (617) 253-3400',
    address: '77 Massachusetts Avenue, Cambridge, MA 02139, United States',
    officialWebsiteUrl: 'https://www.mit.edu',
    hasScholarships: true,
    scholarshipDetails:
      'Need-blind admissions policy for all undergraduate applicants. MIT meets 100% of demonstrated financial need with scholarships and grants that do not require repayment.',
    minAnnualFee: 60156,
    maxAnnualFee: 60156,
    feeCurrency: 'USD',
    courses: [
      {
        name: 'Bachelor of Science in Computer Science and Engineering (Course 6-3)',
        department: 'Engineering & Technology',
        specialization: 'Computer Science',
        level: 'Undergraduate',
        durationYears: 4,
        durationText: '4 Years Full-Time',
        description:
          'A rigorous foundational and applied computing curriculum centered on algorithmic theory, software architecture, machine intelligence, and computer systems.',
        eligibilityCriteria:
          'Secondary school diploma with high proficiency in calculus, physics, and chemistry. Competitive high school academic record.',
        annualTuitionFee: 60156,
        feeCurrency: 'USD',
        feeRange: '$60,156 / year (Tuition)',
        entranceExamsRequired: ['SAT', 'TOEFL'],
        scholarshipAvailable: true,
        scholarshipDetails: 'Eligible for MIT Need-Based Institutional Grant.',
        applicationDeadline: 'January 5 (Fall Regular Decision)',
        isPopular: true,
      },
      {
        name: 'Master of Science in Mechanical Engineering',
        department: 'Engineering & Technology',
        specialization: 'Robotics & Autonomous Systems',
        level: 'Postgraduate',
        durationYears: 2,
        durationText: '2 Years Full-Time',
        description:
          'Advanced graduate training integrating fluid mechanics, thermodynamics, control systems, robotics, and advanced materials engineering.',
        eligibilityCriteria:
          'Undergraduate degree in mechanical engineering, physics, or related engineering discipline with strong mathematics foundation.',
        annualTuitionFee: 60156,
        feeCurrency: 'USD',
        feeRange: '$60,156 / year',
        entranceExamsRequired: ['GRE', 'TOEFL', 'IELTS'],
        scholarshipAvailable: true,
        scholarshipDetails: 'Graduate research assistantships (GRA) and teaching fellowships available.',
        applicationDeadline: 'December 15',
        isPopular: true,
      },
      {
        name: 'Bachelor of Science in Finance',
        department: 'Business & Management',
        specialization: 'Quantitative Finance',
        level: 'Undergraduate',
        durationYears: 4,
        durationText: '4 Years Full-Time',
        description:
          'Offered through the MIT Sloan School of Management, combining financial theory with data science, econometrics, and computational methods.',
        eligibilityCriteria:
          'Competitive high school mathematics, statistics, and analytical problem-solving foundation.',
        annualTuitionFee: 60156,
        feeCurrency: 'USD',
        feeRange: '$60,156 / year',
        entranceExamsRequired: ['SAT', 'TOEFL'],
        scholarshipAvailable: true,
        scholarshipDetails: 'Full demonstrated need met via MIT scholarships.',
        applicationDeadline: 'January 5',
        isPopular: false,
      },
    ],
  },
  {
    slug: 'oxford',
    name: 'University of Oxford',
    country: 'United Kingdom',
    city: 'Oxford',
    state: 'Oxfordshire',
    institutionType: 'Public Collegiate Research University',
    establishedYear: 1096,
    overview:
      'The University of Oxford is the oldest university in the English-speaking world and a world-leading centre of learning, teaching and research. Oxford offers a distinctive collegiate model comprising 39 constituent colleges and five permanent private halls.',
    rankingInfo: 'Times Higher Education (THE) World University Rankings: #1 Globally (2024)',
    campusFacilities: [
      'Bodleian Libraries (Over 13 million printed items)',
      'Oxford University Museum of Natural History & Ashmolean Museum',
      'Iffley Road Sports Complex & Oxford University Boathouse',
      'Collegiate Dining Halls, Chapels, and Tutorial Libraries across 39 Colleges',
    ],
    placementInfo:
      'Oxford Careers Service provides lifetime guidance; graduates pursue leadership roles across academia, civil service, international diplomacy, technology, and global consulting.',
    admissionDeadlines: 'UCAS Application Deadline: October 15 (Strict annual deadline for Autumn entry)',
    contactEmail: 'undergraduate.admissions@admin.ox.ac.uk',
    contactPhone: '+44 1865 270000',
    address: 'University Offices, Wellington Square, Oxford OX1 2JD, United Kingdom',
    officialWebsiteUrl: 'https://www.ox.ac.uk',
    hasScholarships: true,
    scholarshipDetails:
      'Prestigious funding including the Rhodes Scholarship, Clarendon Fund, Simon and June Li Scholarships, and Oxford Crankstart Scholarships.',
    minAnnualFee: 32000,
    maxAnnualFee: 44000,
    feeCurrency: 'GBP',
    courses: [
      {
        name: 'BA (Hons) in Philosophy, Politics and Economics (PPE)',
        department: 'Humanities & Social Sciences',
        specialization: 'Political Economy & Ethics',
        level: 'Undergraduate',
        durationYears: 3,
        durationText: '3 Years Full-Time',
        description:
          'Oxford flagship multi-disciplinary degree preparing students for prominent careers in international politics, public policy, economics, journalism, and diplomacy.',
        eligibilityCriteria:
          'A*AA at A-level (or equivalent international secondary qualification, e.g. 39 IB points with 766 at HL). Strong analytical writing capability.',
        annualTuitionFee: 38550,
        feeCurrency: 'GBP',
        feeRange: '£38,550 / year (Overseas)',
        entranceExamsRequired: ['TSA', 'IELTS'],
        scholarshipAvailable: true,
        scholarshipDetails: 'Clarendon and College-specific undergraduate bursaries.',
        applicationDeadline: 'October 15 (UCAS)',
        isPopular: true,
      },
      {
        name: 'MSc in Advanced Computer Science',
        department: 'Engineering & Technology',
        specialization: 'Artificial Intelligence & Verification',
        level: 'Postgraduate',
        durationYears: 1,
        durationText: '1 Year Full-Time',
        description:
          'Intensive graduate study covering formal methods, quantum computing, automated reasoning, machine learning, and computational biology.',
        eligibilityCriteria:
          'First-class undergraduate degree in computer science or mathematics. Substantial programming and formal logic background.',
        annualTuitionFee: 36000,
        feeCurrency: 'GBP',
        feeRange: '£36,000 / year',
        entranceExamsRequired: ['IELTS'],
        scholarshipAvailable: true,
        scholarshipDetails: 'Eligible for Clarendon Fund scholarships (covers full tuition and living stipend).',
        applicationDeadline: 'January 10',
        isPopular: true,
      },
      {
        name: 'Bachelor of Medicine and Bachelor of Surgery (BM BCh)',
        department: 'Medicine & Healthcare',
        specialization: 'Clinical Medicine',
        level: 'Undergraduate',
        durationYears: 6,
        durationText: '6 Years Full-Time',
        description:
          'Comprehensive pre-clinical and clinical medical education integrating laboratory pathology, pharmacology, and patient care rotations at the John Radcliffe Hospital.',
        eligibilityCriteria:
          'A*AA at A-levels including Chemistry and at least one from Biology, Physics, or Mathematics. BMAT / UCAT test requirements.',
        annualTuitionFee: 44000,
        feeCurrency: 'GBP',
        feeRange: '£44,000 / year',
        entranceExamsRequired: ['IELTS', 'NEET'],
        scholarshipAvailable: false,
        scholarshipDetails: 'Limited international medical scholarships available.',
        applicationDeadline: 'October 15',
        isPopular: true,
      },
    ],
  },
  {
    slug: 'iit-bombay',
    name: 'Indian Institute of Technology Bombay',
    country: 'India',
    city: 'Mumbai',
    state: 'Maharashtra',
    institutionType: 'Public Technical Institute of National Importance',
    establishedYear: 1958,
    overview:
      'Established in 1958 with foreign assistance from UNESCO, IIT Bombay is widely recognized as one of India premier centers of technical education and cutting-edge industrial research.',
    rankingInfo: 'NIRF National Institutional Ranking Framework: #1 Technical University in Maharashtra, #3 Nationally (2024)',
    campusFacilities: [
      'Central Library (Extensive digital engineering resources)',
      'Centre for Aerospace Systems Design and Engineering (CASDE)',
      'IITB Gymkhana & Swimming Pool Complex',
      'On-Campus Hostels 1 through 18',
      'Tinkerers’ Innovation and Prototyping Laboratory',
    ],
    placementInfo:
      'IIT Bombay Placement Cell coordinates direct recruitment with over 400 national and international technology, trading, and engineering organizations.',
    admissionDeadlines: 'Joint Entrance Examination (JEE Advanced) Counseling: June – July annually',
    contactEmail: 'jeeadv@iitb.ac.in',
    contactPhone: '+91 22 2576 7060',
    address: 'Main Gate Road, Powai, Mumbai, Maharashtra 400076, India',
    officialWebsiteUrl: 'https://www.iitb.ac.in',
    hasScholarships: true,
    scholarshipDetails:
      'Institute Merit-cum-Means (MCM) Scholarship, Free Messing facility, and 100% Tuition Fee Remission for qualified income brackets.',
    minAnnualFee: 75000,
    maxAnnualFee: 220000,
    feeCurrency: 'INR',
    courses: [
      {
        name: 'Bachelor of Technology (B.Tech) in Computer Science and Engineering',
        department: 'Engineering & Technology',
        specialization: 'Computer Science',
        level: 'Undergraduate',
        durationYears: 4,
        durationText: '4 Years Full-Time',
        description:
          'The premier engineering undergraduate program in India, covering computer architecture, artificial intelligence, algorithms, distributed computing, and cybersecurity.',
        eligibilityCriteria:
          '10+2 passing grade with Physics, Chemistry, and Mathematics. High national rank in JEE Main followed by JEE Advanced.',
        annualTuitionFee: 220000,
        feeCurrency: 'INR',
        feeRange: '₹2,20,000 / year (Standard general category)',
        entranceExamsRequired: ['JEE_MAIN'],
        scholarshipAvailable: true,
        scholarshipDetails: 'Full fee waivers for SC/ST and economically weaker section (EWS) candidates.',
        applicationDeadline: 'JoSAA Counseling (June)',
        isPopular: true,
      },
      {
        name: 'Master of Technology (M.Tech) in Electrical Engineering',
        department: 'Engineering & Technology',
        specialization: 'Microelectronics & VLSI',
        level: 'Postgraduate',
        durationYears: 2,
        durationText: '2 Years Full-Time',
        description:
          'Advanced postgraduate degree covering semiconductor physics, VLSI design, communication systems, power electronics, and signal processing.',
        eligibilityCriteria:
          'Bachelor degree in Engineering / Technology with valid Graduate Aptitude Test in Engineering (GATE) score.',
        annualTuitionFee: 75000,
        feeCurrency: 'INR',
        feeRange: '₹75,000 / year',
        entranceExamsRequired: ['GATE'],
        scholarshipAvailable: true,
        scholarshipDetails: 'MoE Post Graduate Teaching Assistantship (TA) fellowship monthly stipend.',
        applicationDeadline: 'April 15',
        isPopular: false,
      },
    ],
  },
  {
    slug: 'uoft',
    name: 'University of Toronto',
    country: 'Canada',
    city: 'Toronto',
    state: 'Ontario',
    institutionType: 'Public Research University',
    establishedYear: 1827,
    overview:
      'The University of Toronto is Canada leading research university and an international leader in research and teaching. U of T fosters an open and supportive community of scholars in a vibrant city of global commerce and cultural diversity.',
    rankingInfo: 'QS World University Rankings: #21 Globally, #1 in Canada (2024)',
    campusFacilities: [
      'Robarts Research Library (One of North America premier humanities libraries)',
      'Varsity Centre Multi-Sport Arena and Stadium',
      'MaRS Innovation and Biomedical District Collaboration Hub',
      'Hart House Cultural, Artistic, and Debating Center',
    ],
    placementInfo:
      'Ranked top 10 globally for graduate employability by Times Higher Education. Extensive PEY Co-op (Professional Experience Year) connections.',
    admissionDeadlines: 'Ontario Universities Application Centre (OUAC) deadline: January 15 for Fall entry',
    contactEmail: 'admissions@utoronto.ca',
    contactPhone: '+1 (416) 978-2190',
    address: '27 King’s College Circle, Toronto, Ontario M5S 1A1, Canada',
    officialWebsiteUrl: 'https://www.utoronto.ca',
    hasScholarships: true,
    scholarshipDetails:
      'Lester B. Pearson International Scholarship (covers tuition, books, incidental fees, and full residence support for four years), President’s Scholars of Excellence.',
    minAnnualFee: 52000,
    maxAnnualFee: 65410,
    feeCurrency: 'CAD',
    courses: [
      {
        name: 'Bachelor of Applied Science (BASc) in Computer Engineering',
        department: 'Engineering & Technology',
        specialization: 'Computer Systems & Embedded Hardware',
        level: 'Undergraduate',
        durationYears: 4,
        durationText: '4 Years Full-Time (with optional 12-16 month Co-op)',
        description:
          'Integrates electrical engineering and computer science, training students to create and optimize hardware, operating systems, networking devices, and smart electronics.',
        eligibilityCriteria:
          'Senior secondary graduation with Grade 12 English, Advanced Functions, Calculus & Vectors, Chemistry, and Physics.',
        annualTuitionFee: 65410,
        feeCurrency: 'CAD',
        feeRange: '$65,410 CAD / year (International)',
        entranceExamsRequired: ['IELTS', 'TOEFL'],
        scholarshipAvailable: true,
        scholarshipDetails: 'Faculty of Applied Science & Engineering International Scholar Award.',
        applicationDeadline: 'January 15',
        isPopular: true,
      },
      {
        name: 'Master of Science in Financial Risk Management (MFRM)',
        department: 'Business & Management',
        specialization: 'Financial Risk Management',
        level: 'Postgraduate',
        durationYears: 1,
        durationText: '10 Months Accelerated Full-Time',
        description:
          'Offered through the Rotman School of Management, developing deep quantitative fluency, regulatory capital understanding, and algorithmic risk measurement.',
        eligibilityCriteria:
          'Undergraduate degree with substantial coursework in calculus, linear algebra, statistics, and financial modeling.',
        annualTuitionFee: 52000,
        feeCurrency: 'CAD',
        feeRange: '$52,000 CAD',
        entranceExamsRequired: ['GMAT', 'GRE', 'IELTS'],
        scholarshipAvailable: true,
        scholarshipDetails: 'Rotman Entrance Awards up to $10,000 CAD awarded based on merit.',
        applicationDeadline: 'February 1',
        isPopular: false,
      },
    ],
  },
  {
    slug: 'nus',
    name: 'National University of Singapore',
    country: 'Singapore',
    city: 'Singapore',
    institutionType: 'Autonomous Public Research University',
    establishedYear: 1905,
    overview:
      'A leading global university centered in Asia, the National University of Singapore is Singapore flagship higher education institution, offering a global approach to education and research with a focus on Asian perspectives and expertise.',
    rankingInfo: 'QS World University Rankings: #8 Globally, #1 in Asia (2024)',
    campusFacilities: [
      'University Town (UTown) Residential and Interactive Learning Campus',
      'NUS Central Library and Medical Library',
      'Sports & Recreation Centre (Indoor climbing walls, Olympic pools, tennis courts)',
      'Yong Siew Toh Conservatory of Music Concert Hall',
    ],
    placementInfo:
      'Graduate Employment Survey indicates over 93% full-time employment within 6 months across international technology, banking, and pharmaceutical sectors.',
    admissionDeadlines: 'International Qualifications Application Window: Mid-October to late February',
    contactEmail: 'admissions@nus.edu.sg',
    contactPhone: '+65 6516 1010',
    address: '21 Lower Kent Ridge Road, Singapore 119077',
    officialWebsiteUrl: 'https://www.nus.edu.sg',
    hasScholarships: true,
    scholarshipDetails:
      'NUS Global Merit Scholarship, ASEAN Undergraduate Scholarship, and Singapore Ministry of Education (MOE) Tuition Grant Scheme.',
    minAnnualFee: 39500,
    maxAnnualFee: 54500,
    feeCurrency: 'SGD',
    courses: [
      {
        name: 'Bachelor of Computing in Computer Science (Honours)',
        department: 'Engineering & Technology',
        specialization: 'Artificial Intelligence & Software Engineering',
        level: 'Undergraduate',
        durationYears: 4,
        durationText: '4 Years Full-Time',
        description:
          'World-class computer science curriculum from the NUS School of Computing covering software engineering, algorithms, security, databases, and AI systems.',
        eligibilityCriteria:
          'Outstanding high school qualifications with strong performance in Mathematics and Physics/Chemistry.',
        annualTuitionFee: 39500,
        feeCurrency: 'SGD',
        feeRange: '$39,500 SGD / year (Non-Subsidized)',
        entranceExamsRequired: ['SAT', 'IELTS', 'TOEFL'],
        scholarshipAvailable: true,
        scholarshipDetails: 'Full tuition fee coverage and living allowance through NUS Global Merit Scholarship.',
        applicationDeadline: 'February 28',
        isPopular: true,
      },
      {
        name: 'Master of Science in Business Analytics (MSBA)',
        department: 'Business & Management',
        specialization: 'Big Data & Business Intelligence',
        level: 'Postgraduate',
        durationYears: 1,
        durationText: '1 Year Full-Time',
        description:
          'Jointly offered by NUS Business School and NUS School of Computing, bridging business acumen with advanced statistical learning and data science.',
        eligibilityCriteria:
          'Bachelor degree with strong quantitative background (engineering, mathematics, finance, or computer science).',
        annualTuitionFee: 54500,
        feeCurrency: 'SGD',
        feeRange: '$54,500 SGD',
        entranceExamsRequired: ['GMAT', 'GRE', 'TOEFL', 'IELTS'],
        scholarshipAvailable: true,
        scholarshipDetails: 'Merit-based departmental awards available.',
        applicationDeadline: 'January 31',
        isPopular: true,
      },
    ],
  },
  {
    slug: 'stanford',
    name: 'Stanford University',
    country: 'United States',
    city: 'Stanford',
    state: 'California',
    institutionType: 'Private Research University',
    establishedYear: 1885,
    overview:
      'Located between San Francisco and San Jose in the heart of Silicon Valley, Stanford University is renowned for its academic strength, wealth, proximity to Silicon Valley, and ranking as one of the world top universities.',
    rankingInfo: 'QS World University Rankings: #5 Globally (2024)',
    campusFacilities: [
      'Green Library & 14 Branch Subject Libraries',
      'Stanford Nanofabrication Facility',
      'Arrillaga Center for Sports and Recreation',
      'Bing Concert Hall & Cantor Arts Center',
    ],
    placementInfo:
      'Renowned entrepreneurial ecosystem; Stanford graduates frequently found global venture-backed startups or join world-leading technology corporations.',
    admissionDeadlines: 'Restrictive Early Action: November 1 | Regular Decision: January 5',
    contactEmail: 'admission@stanford.edu',
    contactPhone: '+1 (650) 723-2091',
    address: '450 Serra Mall, Stanford, CA 94305, United States',
    officialWebsiteUrl: 'https://www.stanford.edu',
    hasScholarships: true,
    scholarshipDetails:
      'Need-blind admission for US citizens and permanent residents; comprehensive need-based financial aid for admitted international undergraduates.',
    minAnnualFee: 62484,
    maxAnnualFee: 62484,
    feeCurrency: 'USD',
    courses: [
      {
        name: 'Bachelor of Science in Symbolic Systems',
        department: 'Interdisciplinary Sciences',
        specialization: 'Cognitive Science & Artificial Intelligence',
        level: 'Undergraduate',
        durationYears: 4,
        durationText: '4 Years Full-Time',
        description:
          'An interdisciplinary major unique to Stanford that explores the relations between computers and human minds, drawing on computer science, philosophy, linguistics, and psychology.',
        eligibilityCriteria:
          'Competitive secondary school curriculum with exceptional mathematics and analytical reasoning.',
        annualTuitionFee: 62484,
        feeCurrency: 'USD',
        feeRange: '$62,484 / year',
        entranceExamsRequired: ['SAT', 'ACT', 'TOEFL'],
        scholarshipAvailable: true,
        scholarshipDetails: 'Covered under Stanford need-based undergraduate financial aid.',
        applicationDeadline: 'January 5',
        isPopular: true,
      },
    ],
  },
];

/**
 * Seed institutions catalog idempotently into database
 */
export async function seedCollegesCatalog(): Promise<number> {
  let createdCount = 0;

  for (const item of VERIFIED_INSTITUTIONS_CATALOG) {
    const existing = await prisma.institution.findUnique({
      where: { slug: item.slug },
    });

    if (!existing) {
      const institution = await prisma.institution.create({
        data: {
          slug: item.slug,
          name: item.name,
          country: item.country,
          city: item.city,
          state: item.state || null,
          institutionType: item.institutionType,
          establishedYear: item.establishedYear,
          overview: item.overview,
          rankingInfo: item.rankingInfo,
          campusFacilities: JSON.stringify(item.campusFacilities),
          placementInfo: item.placementInfo || null,
          admissionDeadlines: item.admissionDeadlines || null,
          contactEmail: item.contactEmail,
          contactPhone: item.contactPhone,
          address: item.address,
          officialWebsiteUrl: item.officialWebsiteUrl,
          hasScholarships: item.hasScholarships,
          scholarshipDetails: item.scholarshipDetails || null,
          minAnnualFee: item.minAnnualFee,
          maxAnnualFee: item.maxAnnualFee,
          feeCurrency: item.feeCurrency,
          isVerified: true,
          courses: {
            create: item.courses.map((c) => ({
              name: c.name,
              department: c.department,
              specialization: c.specialization || null,
              level: c.level,
              durationYears: c.durationYears,
              durationText: c.durationText,
              description: c.description,
              eligibilityCriteria: c.eligibilityCriteria,
              annualTuitionFee: c.annualTuitionFee,
              feeCurrency: c.feeCurrency,
              feeRange: c.feeRange,
              entranceExamsRequired: JSON.stringify(c.entranceExamsRequired),
              scholarshipAvailable: c.scholarshipAvailable,
              scholarshipDetails: c.scholarshipDetails || null,
              applicationDeadline: c.applicationDeadline,
              isPopular: c.isPopular,
            })),
          },
        },
      });
      createdCount++;
    }
  }

  return createdCount;
}
