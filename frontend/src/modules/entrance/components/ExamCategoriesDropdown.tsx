import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  Plus,
  PlayCircle,
  Clock,
  Search,
  Layers,
  Award,
} from 'lucide-react';
import { EntranceExamRecord, ExamCategoryGroup } from '../entrance.types';

export interface ExamCategoriesDropdownProps {
  categories?: ExamCategoryGroup[];
  allExams: EntranceExamRecord[];
  onSelectExam: (exam: EntranceExamRecord) => void;
  onAddToPlan?: (exam: EntranceExamRecord) => void;
  onTakeMockTest?: (exam: EntranceExamRecord) => void;
  selectedExamId?: string | null;
  activeCategoryFilter?: string | null;
  onCategoryFilterChange?: (categoryId: string) => void;
}

// Fallback hierarchy specification matching the exact 7 main categories
export const DEFAULT_CATEGORY_HIERARCHY = [
  {
    id: 'undergraduate',
    name: 'Undergraduate Entrance Exams',
    description: 'Standardized and curriculum-based admissions exams for undergraduate and bachelor degree programs.',
    examCodes: [
      'SAT',
      'ACT',
      'JEE_MAIN',
      'CUET_UG',
      'GAOKAO',
      'ENEM',
      'BITSAT',
      'VITEEE',
      'COMEDK_UGET',
      'KCET',
      'WBJEE',
      'MHT_CET',
      'IPMAT',
      'NATA',
      'UCEED',
      'NID_DAT',
      'NIFT',
    ],
  },
  {
    id: 'engineering_technology',
    name: 'Engineering & Technology Exams',
    description: 'Competitive entrance assessments for premier engineering, technology, and applied sciences institutes.',
    examCodes: [
      'JEE_MAIN',
      'JEE_ADVANCED',
      'GATE',
      'BITSAT',
      'VITEEE',
      'COMEDK_UGET',
      'KCET',
      'WBJEE',
      'MHT_CET',
    ],
  },
  {
    id: 'postgraduate',
    name: 'Postgraduate Entrance Exams',
    description: 'Graduate level qualification exams for master degrees, research programs, and M.Sc./MCA pathways.',
    examCodes: [
      'GRE',
      'GATE',
      'CUET_PG',
      'IIT_JAM',
      'NIMCET',
      'CEED',
    ],
  },
  {
    id: 'mba_management',
    name: 'MBA & Management Exams',
    description: 'Management aptitude and business school admissions tests for MBA, PGDM, and executive master programs.',
    examCodes: [
      'GMAT',
      'CAT',
      'XAT',
      'MAT',
      'CMAT',
      'NMAT',
      'IPMAT',
      'GRE',
    ],
  },
  {
    id: 'study_abroad',
    name: 'Study Abroad Exams',
    description: 'Globally recognized standardized testing for international university applications and visas.',
    examCodes: [
      'SAT',
      'ACT',
      'GRE',
      'GMAT',
      'IELTS',
      'TOEFL',
      'PTE',
      'DUOLINGO',
    ],
  },
  {
    id: 'language_proficiency',
    name: 'Language Proficiency Exams',
    description: 'International standardized language certification exams for academic, work, and immigration credentials.',
    examCodes: [
      'IELTS',
      'TOEFL',
      'PTE',
      'DUOLINGO',
      'TOEIC',
      'OET',
      'JLPT',
      'TOPIK',
      'DELE',
      'DELF',
      'GOETHE',
      'HSK',
    ],
  },
  {
    id: 'design_architecture',
    name: 'Design & Architecture Exams',
    description: 'Aptitude and creative design entrance tests for premier design, architecture, and fashion technology schools.',
    examCodes: [
      'NID_DAT',
      'UCEED',
      'CEED',
      'NATA',
      'NIFT',
    ],
  },
];

// Display names for exam codes
const EXAM_DISPLAY_NAMES: Record<string, string> = {
  SAT: 'SAT (Scholastic Assessment Test)',
  ACT: 'ACT (American College Testing)',
  JEE_MAIN: 'JEE Main (Joint Entrance Examination)',
  CUET_UG: 'CUET UG (Common University Entrance Test Undergraduate)',
  GAOKAO: 'Gaokao (National College Entrance Examination)',
  ENEM: 'ENEM (Exame Nacional do Ensino Médio)',
  JEE_ADVANCED: 'JEE Advanced',
  GATE: 'GATE (Graduate Aptitude Test in Engineering)',
  BITSAT: 'BITSAT (BITS Admission Test)',
  VITEEE: 'VITEEE (VIT Engineering Entrance Examination)',
  COMEDK_UGET: 'COMEDK UGET (Consortium of Medical, Engineering and Dental Colleges of Karnataka)',
  KCET: 'KCET (Karnataka Common Entrance Test)',
  WBJEE: 'WBJEE (West Bengal Joint Entrance Examination)',
  MHT_CET: 'MHT CET (Maharashtra Common Entrance Test)',
  IPMAT: 'IPMAT (Integrated Programme in Management Aptitude Test)',
  GRE: 'GRE General Test (Graduate Record Examination)',
  CUET_PG: 'CUET PG (Common University Entrance Test Postgraduate)',
  IIT_JAM: 'IIT JAM (Joint Admission test for Masters)',
  NIMCET: 'NIMCET (NIT MCA Common Entrance Test)',
  GMAT: 'GMAT Focus Edition',
  CAT: 'CAT (Common Admission Test)',
  XAT: 'XAT (Xavier Aptitude Test)',
  MAT: 'MAT (Management Aptitude Test)',
  CMAT: 'CMAT (Common Management Admission Test)',
  NMAT: 'NMAT by GMAC',
  IELTS: 'IELTS Academic',
  TOEFL: 'TOEFL iBT',
  PTE: 'PTE Academic',
  DUOLINGO: 'Duolingo English Test (DET)',
  TOEIC: 'TOEIC (Test of English for International Communication)',
  OET: 'OET (Occupational English Test)',
  JLPT: 'JLPT (Japanese-Language Proficiency Test)',
  TOPIK: 'TOPIK (Test of Proficiency in Korean)',
  DELE: 'DELE (Diplomas de Español como Lengua Extranjera)',
  DELF: 'DELF / DALF (Diplôme d\'Études en Langue Française)',
  GOETHE: 'Goethe-Zertifikat (German Language Examination)',
  HSK: 'HSK (Hanyu Shuiping Kaoshi - Chinese Proficiency Test)',
  NID_DAT: 'NID DAT (Design Aptitude Test)',
  UCEED: 'UCEED (Undergraduate Common Entrance Examination for Design)',
  CEED: 'CEED (Common Entrance Examination for Design)',
  NATA: 'NATA (National Aptitude Test in Architecture)',
  NIFT: 'NIFT Entrance Exam',
  NEET: 'NEET UG (National Eligibility cum Entrance Test)',
};

export const ExamCategoriesDropdown: React.FC<ExamCategoriesDropdownProps> = ({
  categories: initialCategories,
  allExams,
  onSelectExam,
  onAddToPlan,
  onTakeMockTest,
  selectedExamId,
  activeCategoryFilter,
  onCategoryFilterChange,
}) => {
  // Set of expanded category IDs - default to expanding the first 2 categories for high discovery
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(['undergraduate', 'engineering_technology'])
  );

  // Search query within the category accordion
  const [filterQuery, setFilterQuery] = useState('');

  // Map unique exams by code for constant-time lookup
  const examByCodeMap = useMemo(() => {
    const map = new Map<string, EntranceExamRecord>();
    (allExams || []).forEach((exam) => {
      if (exam?.code) {
        map.set(exam.code, exam);
        map.set(exam.code.toUpperCase(), exam);
      }
    });
    return map;
  }, [allExams]);

  // Merge provided category data or construct from default hierarchy
  const resolvedCategories = useMemo(() => {
    return DEFAULT_CATEGORY_HIERARCHY.map((def) => {
      const serverCat = initialCategories?.find((c) => c.id === def.id);
      const codes = serverCat?.examCodes || def.examCodes;

      // Resolve each exam code to its unique single record
      const exams: EntranceExamRecord[] = [];
      codes.forEach((code) => {
        const found = examByCodeMap.get(code);
        if (found) {
          exams.push(found);
        } else {
          // Graceful fallback dummy record until exams finish loading
          exams.push({
            id: `temp-${code.toLowerCase()}`,
            code: code,
            name: EXAM_DISPLAY_NAMES[code] || code,
            category: 'UNDERGRADUATE' as any,
            description: 'Comprehensive entrance assessment and standardized college admission exam.',
            destinations: ['Global'],
            relevantStreams: ['All'],
            format: 'Standardized examination',
            sections: [],
            totalDurationMinutes: 120,
            scoreRange: 'Standard scale',
            scoringDetails: 'Official regulatory marking scheme',
            validity: '1 to 5 years',
            importantDates: [],
            officialWebsiteUrl: 'https://superconsciousness.internal',
            prepResources: [],
            recommendedBooks: [],
            testDayTips: [],
            hasMockTest: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      });

      return {
        id: def.id,
        name: def.name,
        description: serverCat?.description || def.description,
        examCodes: codes,
        exams,
      };
    });
  }, [initialCategories, examByCodeMap]);

  // Filter categories and subcategories based on user search query
  const filteredCategoryList = useMemo(() => {
    if (!filterQuery.trim()) {
      return resolvedCategories;
    }
    const q = filterQuery.toLowerCase().trim();

    return resolvedCategories
      .map((cat) => {
        const catMatches = cat.name.toLowerCase().includes(q) || cat.description.toLowerCase().includes(q);
        const matchingExams = cat.exams.filter((exam) => {
          return (
            exam.name.toLowerCase().includes(q) ||
            exam.code.toLowerCase().includes(q) ||
            exam.description.toLowerCase().includes(q) ||
            exam.destinations.some((d) => d.toLowerCase().includes(q))
          );
        });

        if (catMatches || matchingExams.length > 0) {
          return {
            ...cat,
            // If category matches, show all its exams; otherwise show matched exams
            exams: catMatches ? cat.exams : matchingExams,
            hasMatches: true,
          };
        }
        return null;
      })
      .filter(Boolean) as (typeof resolvedCategories[0] & { hasMatches?: boolean })[];
  }, [resolvedCategories, filterQuery]);

  // Auto-expand categories if search query is entered
  useEffect(() => {
    if (filterQuery.trim()) {
      const allMatchingIds = filteredCategoryList.map((c) => c.id);
      setExpandedIds(new Set(allMatchingIds));
    }
  }, [filterQuery, filteredCategoryList]);

  // If activeCategoryFilter changes from parent, ensure that category is expanded
  useEffect(() => {
    if (activeCategoryFilter && activeCategoryFilter !== 'ALL') {
      const match = resolvedCategories.find(
        (c) => c.id.toLowerCase() === activeCategoryFilter.toLowerCase()
      );
      if (match) {
        setExpandedIds((prev) => new Set([...prev, match.id]));
      }
    }
  }, [activeCategoryFilter, resolvedCategories]);

  // Toggle single category
  const toggleCategory = (categoryId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });

    if (onCategoryFilterChange) {
      onCategoryFilterChange(categoryId);
    }
  };

  // Accurate count calculations: distinguish unique canonical exams from category listings
  const { uniqueExamCount, totalListingsCount } = useMemo(() => {
    const uniqueIds = new Set<string>();
    let listings = 0;
    resolvedCategories.forEach((cat) => {
      listings += cat.exams.length;
      cat.exams.forEach((exam) => {
        if (exam?.id) uniqueIds.add(exam.id);
        else if (exam?.code) uniqueIds.add(exam.code);
      });
    });
    return {
      uniqueExamCount: uniqueIds.size,
      totalListingsCount: listings,
    };
  }, [resolvedCategories]);

  // Expand all
  const handleExpandAll = () => {
    setExpandedIds(new Set(resolvedCategories.map((c) => c.id)));
  };

  // Collapse all
  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  return (
    <div
      id="exam-categories-dropdown-section"
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '1.25rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #F1F5F9',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #4338CA 0%, #6366F1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <Layers size={18} />
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#0F172A',
                letterSpacing: '-0.01em',
              }}
            >
              Main Exam Categories & Subcategories
            </h2>
          </div>

          <p
            style={{
              margin: '0 0 0.5rem 0',
              fontSize: '0.88rem',
              color: '#64748B',
              lineHeight: 1.4,
            }}
          >
            Explore all 7 main entrance exam categories with dropdown subcategories. Shared exams reference a single canonical record across applicable categories.
          </p>

          {/* Accurate Counts Display Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span
              id="badge-main-categories-count"
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: '#EEF2FF',
                color: '#4338CA',
                padding: '0.15rem 0.6rem',
                borderRadius: '12px',
                border: '1px solid #C7D2FE',
              }}
            >
              7 Main Categories
            </span>
            <span
              id="badge-unique-exams-count"
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: '#F0FDF4',
                color: '#166534',
                padding: '0.15rem 0.6rem',
                borderRadius: '12px',
                border: '1px solid #BBF7D0',
              }}
            >
              {uniqueExamCount} Unique Exam Records
            </span>
            <span
              id="badge-total-listings-count"
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: '#F8FAFC',
                color: '#475569',
                padding: '0.15rem 0.6rem',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
              }}
            >
              {totalListingsCount} Total Category Listings
            </span>
          </div>
        </div>

        {/* Global Expand / Collapse All Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <button
            type="button"
            id="categories-expand-all-btn"
            onClick={handleExpandAll}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#4338CA',
              backgroundColor: '#EEF2FF',
              border: '1px solid #C7D2FE',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title="Expand all 7 categories"
          >
            <ChevronDown size={14} />
            <span>Expand All</span>
          </button>

          <button
            type="button"
            id="categories-collapse-all-btn"
            onClick={handleCollapseAll}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#64748B',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            title="Collapse all categories"
          >
            <ChevronUp size={14} />
            <span>Collapse All</span>
          </button>
        </div>
      </div>

      {/* Accordion Quick Search / Filter Input */}
      <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            left: '0.85rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94A3B8',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <Search size={16} />
        </div>
        <input
          id="category-search-filter-input"
          type="text"
          placeholder="Filter categories or find an exam (e.g. JEE Main, SAT, GATE, IELTS, GMAT)..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '0.6rem 1rem 0.6rem 2.4rem',
            borderRadius: '10px',
            border: '1px solid #CBD5E1',
            fontSize: '0.88rem',
            color: '#0F172A',
            backgroundColor: '#F8FAFC',
            outline: 'none',
            transition: 'border-color 0.2s, background-color 0.2s',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#4338CA';
            e.currentTarget.style.backgroundColor = '#FFFFFF';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#CBD5E1';
            e.currentTarget.style.backgroundColor = '#F8FAFC';
          }}
        />
        {filterQuery && (
          <button
            type="button"
            onClick={() => setFilterQuery('')}
            style={{
              position: 'absolute',
              right: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Accordion Container for All 10 Categories */}
      <div
        id="exam-categories-accordion"
        role="region"
        aria-label="Exam Categories Accordion"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        {filteredCategoryList.map((category, index) => {
          const isExpanded = expandedIds.has(category.id);
          const examCount = category.exams.length;
          const isCurrentActiveFilter =
            activeCategoryFilter && activeCategoryFilter.toLowerCase() === category.id.toLowerCase();

          return (
            <div
              key={category.id}
              id={`category-wrapper-${category.id}`}
              style={{
                border: isExpanded
                  ? '1px solid #C7D2FE'
                  : isCurrentActiveFilter
                  ? '1px solid #A5B4FC'
                  : '1px solid #E2E8F0',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                boxShadow: isExpanded ? '0 4px 12px -2px rgba(67, 56, 202, 0.08)' : 'none',
                backgroundColor: '#FFFFFF',
              }}
            >
              {/* Category Header Row (Clickable Accordion Trigger) */}
              <button
                type="button"
                id={`category-header-${category.id}`}
                aria-expanded={isExpanded}
                aria-controls={`category-panel-${category.id}`}
                onClick={() => toggleCategory(category.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleCategory(category.id);
                  }
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  background: isExpanded
                    ? 'linear-gradient(90deg, #F5F7FF 0%, #FFFFFF 100%)'
                    : '#FFFFFF',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isExpanded) e.currentTarget.style.backgroundColor = '#F8FAFC';
                }}
                onMouseLeave={(e) => {
                  if (!isExpanded) e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
              >
                {/* Left: Category Index, Icon & Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: '1 1 auto' }}>
                  <span
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: isExpanded ? '#4338CA' : '#F1F5F9',
                      color: isExpanded ? '#FFFFFF' : '#475569',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {index + 1}
                  </span>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: isExpanded ? '#312E81' : '#0F172A',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {category.name}
                      </span>

                      {/* Pill Badge showing total exams count */}
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '0.15rem 0.55rem',
                          borderRadius: '12px',
                          backgroundColor: isExpanded ? '#E0E7FF' : '#F1F5F9',
                          color: isExpanded ? '#3730A3' : '#64748B',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {examCount} {examCount === 1 ? 'Exam' : 'Exams'}
                      </span>
                    </div>

                    <p
                      style={{
                        margin: '0.2rem 0 0 0',
                        fontSize: '0.82rem',
                        color: '#64748B',
                        lineHeight: 1.35,
                      }}
                    >
                      {category.description}
                    </p>
                  </div>
                </div>

                {/* Right: Dropdown Arrow with Smooth Rotation Animation */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: isExpanded ? '#EEF2FF' : '#F8FAFC',
                    color: isExpanded ? '#4338CA' : '#64748B',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s',
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  <ChevronDown size={18} />
                </div>
              </button>

              {/* Collapsible Panel containing the Subcategory Exams */}
              {isExpanded && (
                <div
                  id={`category-panel-${category.id}`}
                  role="region"
                  aria-labelledby={`category-header-${category.id}`}
                  style={{
                    padding: '0.5rem 1.25rem 1.25rem 1.25rem',
                    backgroundColor: '#FAFAFC',
                    borderTop: '1px solid #EEF2F6',
                    animation: 'fadeIn 0.2s ease-out',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                      gap: '0.75rem',
                      marginTop: '0.5rem',
                    }}
                  >
                    {category.exams.map((exam) => {
                      const isSelected = selectedExamId === exam.id || selectedExamId === exam.code;

                      return (
                        <div
                          key={`${category.id}-${exam.code}`}
                          id={`exam-subcategory-item-${exam.code.toLowerCase()}`}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            padding: '0.85rem 1rem',
                            backgroundColor: isSelected ? '#EEF2FF' : '#FFFFFF',
                            border: isSelected ? '1.5px solid #4338CA' : '1px solid #E2E8F0',
                            borderRadius: '10px',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                            cursor: 'pointer',
                          }}
                          onClick={() => onSelectExam(exam)}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = '#C7D2FE';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow =
                                '0 4px 6px -1px rgba(67, 56, 202, 0.08), 0 2px 4px -2px rgba(67, 56, 202, 0.04)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = '#E2E8F0';
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.04)';
                            }
                          }}
                        >
                          <div>
                            {/* Exam Code Badge & Destinations */}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '0.5rem',
                                marginBottom: '0.4rem',
                              }}
                            >
                              <span
                                style={{
                                  display: 'inline-block',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  color: '#4338CA',
                                  backgroundColor: '#EEF2FF',
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '6px',
                                  border: '1px solid #C7D2FE',
                                  letterSpacing: '0.03em',
                                }}
                              >
                                {exam.code}
                              </span>

                              {exam.hasMockTest && (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.2rem',
                                    fontSize: '0.68rem',
                                    fontWeight: 600,
                                    color: '#059669',
                                    backgroundColor: '#ECFDF5',
                                    padding: '0.15rem 0.4rem',
                                    borderRadius: '4px',
                                    border: '1px solid #A7F3D0',
                                  }}
                                  title="Diagnostic practice test available"
                                >
                                  <PlayCircle size={11} />
                                  <span>Mock</span>
                                </span>
                              )}
                            </div>

                            {/* Full Exam Name */}
                            <h4
                              style={{
                                margin: '0 0 0.35rem 0',
                                fontSize: '0.92rem',
                                fontWeight: 700,
                                color: '#0F172A',
                                lineHeight: 1.3,
                              }}
                            >
                              {exam.name}
                            </h4>

                            {/* Score range or duration snippet */}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                fontSize: '0.75rem',
                                color: '#64748B',
                                marginBottom: '0.6rem',
                                flexWrap: 'wrap',
                              }}
                            >
                              {exam.totalDurationMinutes > 0 && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <Clock size={12} />
                                  {exam.totalDurationMinutes} mins
                                </span>
                              )}
                              {exam.scoreRange && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <Award size={12} />
                                  {exam.scoreRange}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Link Footer */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              paddingTop: '0.5rem',
                              borderTop: '1px solid #F1F5F9',
                              marginTop: '0.25rem',
                            }}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectExam(exam);
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                background: 'none',
                                border: 'none',
                                color: '#4338CA',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                padding: 0,
                              }}
                            >
                              <BookOpen size={13} />
                              <span>View Details</span>
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              {exam.officialWebsiteUrl && (
                                <a
                                  href={exam.officialWebsiteUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    padding: '0.2rem 0.4rem',
                                    borderRadius: '4px',
                                    color: '#64748B',
                                    textDecoration: 'none',
                                    fontSize: '0.72rem',
                                  }}
                                  title="Official Website"
                                >
                                  <ExternalLink size={12} />
                                </a>
                              )}

                              {exam.hasMockTest && onTakeMockTest && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onTakeMockTest(exam);
                                  }}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.2rem',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '6px',
                                    backgroundColor: '#F3E8FF',
                                    border: '1px solid #D8B4FE',
                                    color: '#6B21A8',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                  title="Take diagnostic timed practice test"
                                >
                                  <PlayCircle size={11} />
                                  <span>Mock</span>
                                </button>
                              )}

                              {onAddToPlan && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAddToPlan(exam);
                                  }}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.2rem',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '6px',
                                    backgroundColor: '#F1F5F9',
                                    border: '1px solid #E2E8F0',
                                    color: '#334155',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                  }}
                                  title="Add to study plan"
                                >
                                  <Plus size={11} />
                                  <span>Plan</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
