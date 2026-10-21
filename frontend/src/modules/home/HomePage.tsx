import React from 'react';
import { useAuth } from '../../shared/context/AuthContext';
import {
  Compass,
  GraduationCap,
  Users,
  TrendingUp,
  Check,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Target,
  FileCheck2,
  PhoneCall,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (view: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      if (user.role === 'STUDENT') {
        onNavigate('profile-intake');
      } else {
        onNavigate('counsellor-queue');
      }
    } else {
      onNavigate('register');
    }
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-root" id="home">
      {/* =====================================================================
          2. HERO SECTION
          ===================================================================== */}
      <section className="hero-section">
        <div className="landing-container">
          <div className="hero-grid">
            {/* Left Content */}
            <div className="hero-content">
              <div className="hero-badge">
                <span className="hero-badge-dot" />
                <span>PERSONALISED EDUCATION • GUIDANCE • FUTURE</span>
              </div>

              <h1 className="hero-title">
                <span>Your Future.</span>
                <span>Your Potential.</span>
                <span className="hero-title-guidance">Our Guidance.</span>
              </h1>

              <p className="hero-subtitle">
                Superconsciousness helps students understand their strengths, explore
                educational opportunities, and make confident decisions about their
                future.
              </p>

              <div className="hero-actions">
                <button
                  onClick={handleGetStarted}
                  className="btn-primary-indigo"
                  id="hero-get-started-btn"
                >
                  <span>Get Started</span>
                  <ArrowRight size={18} />
                </button>

                <button
                  onClick={() => scrollTo('how-it-works')}
                  className="btn-secondary-outline"
                  id="hero-explore-btn"
                >
                  <span>Explore How It Works</span>
                </button>
              </div>

              <div className="hero-trust-line">
                <ShieldCheck size={18} />
                <span>Built around personalised student guidance</span>
              </div>
            </div>

            {/* Right Visual Composition */}
            <div className="hero-visual">
              <div className="hero-image-wrapper">
                <img
                  src="/assets/hero-student.jpg"
                  alt="Confident university student in academic library"
                  className="hero-image"
                />

                {/* Floating Card 1: Student Profile / Verified */}
                <div className="hero-floating-card floating-card-top-left">
                  <div className="card-icon-bubble verified">
                    <CheckCircle2 size={18} />
                  </div>
                  <div className="card-label-col">
                    <span className="card-label-title">Student Profile</span>
                    <span className="card-label-sub" style={{ color: '#059669', fontWeight: 600 }}>
                      Verified ✓
                    </span>
                  </div>
                </div>

                {/* Floating Card 2: Personalised Guidance / ✓ */}
                <div className="hero-floating-card floating-card-mid-right">
                  <div className="card-icon-bubble">
                    <Sparkles size={18} />
                  </div>
                  <div className="card-label-col">
                    <span className="card-label-title">Personalised Guidance</span>
                    <span className="card-label-sub" style={{ color: '#6D28D9', fontWeight: 600 }}>
                      Active Pathway ✓
                    </span>
                  </div>
                </div>

                {/* Floating Card 3: Future Planning / Explore → */}
                <div
                  className="hero-floating-card floating-card-bottom-left"
                  onClick={() => scrollTo('student-guidance')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-icon-bubble future">
                    <TrendingUp size={18} />
                  </div>
                  <div className="card-label-col">
                    <span className="card-label-title">Future Planning</span>
                    <span className="card-label-sub" style={{ color: '#4338CA', fontWeight: 600 }}>
                      Explore →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. TRUST / VALUE STRIP
          ===================================================================== */}
      <section className="trust-strip">
        <div className="landing-container">
          <div className="trust-grid">
            <div className="trust-item">
              <div className="trust-icon-box">
                <Compass size={22} />
              </div>
              <div className="trust-text">
                <span className="trust-title">Personalised Guidance</span>
                <span className="trust-desc">Customized to student capability</span>
              </div>
            </div>

            <div className="trust-item">
              <div className="trust-icon-box">
                <GraduationCap size={22} />
              </div>
              <div className="trust-text">
                <span className="trust-title">Student Profiles</span>
                <span className="trust-desc">Structured academic intake</span>
              </div>
            </div>

            <div className="trust-item">
              <div className="trust-icon-box">
                <Users size={22} />
              </div>
              <div className="trust-text">
                <span className="trust-title">Expert Counselling</span>
                <span className="trust-desc">Qualified advisory support</span>
              </div>
            </div>

            <div className="trust-item">
              <div className="trust-icon-box">
                <TrendingUp size={22} />
              </div>
              <div className="trust-text">
                <span className="trust-title">Future Planning</span>
                <span className="trust-desc">Actionable educational roadmap</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. ABOUT / INTRODUCTION SECTION
          ===================================================================== */}
      <section className="about-section" id="about">
        <div className="landing-container">
          <div className="about-grid">
            {/* Left: Mentor / Student Consultation Image */}
            <div className="about-image-card">
              <img
                src="/assets/mentor-guidance.jpg"
                alt="Educational consultant mentoring student on university pathways"
                className="about-image"
              />
            </div>

            {/* Right: Content & Value Proposition */}
            <div className="about-content">
              <span className="section-badge">About Superconsciousness</span>
              <h2 className="about-heading">
                Education decisions should be informed, not overwhelming.
              </h2>
              <p className="about-paragraph">
                Every student has different strengths, interests and aspirations.
                Superconsciousness brings these factors together to create a structured
                student guidance experience.
              </p>

              <div className="about-features-list">
                <div className="about-feature-item">
                  <div className="feature-check-icon">
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <div className="feature-text-block">
                    <span className="feature-text-title">Understand your strengths</span>
                    <span className="feature-text-desc">
                      Gain clarity on individual competencies, academic records, and career inclinations.
                    </span>
                  </div>
                </div>

                <div className="about-feature-item">
                  <div className="feature-check-icon">
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <div className="feature-text-block">
                    <span className="feature-text-title">Explore suitable pathways</span>
                    <span className="feature-text-desc">
                      Discover institutions, curriculum boards, and degree tracks calibrated to your profile.
                    </span>
                  </div>
                </div>

                <div className="about-feature-item">
                  <div className="feature-check-icon">
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <div className="feature-text-block">
                    <span className="feature-text-title">Make informed decisions</span>
                    <span className="feature-text-desc">
                      Confidently plan your next milestone backed by verifiable guidance data.
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => scrollTo('how-it-works')}
                className="btn-secondary-outline"
                id="about-discover-btn"
              >
                <span>Discover Superconsciousness</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. HOW IT WORKS SECTION
          ===================================================================== */}
      <section className="how-it-works-section" id="how-it-works">
        <div className="landing-container">
          <div className="section-header-center">
            <span className="section-badge">Structured 4-Step Process</span>
            <h2 className="section-heading-lg">Your journey starts here</h2>
            <p className="section-subtext">
              We guide students step-by-step from initial intake to personalized future
              planning with transparent, verified milestones.
            </p>
          </div>

          <div className="steps-grid">
            {/* Step 01 */}
            <div className="step-card">
              <div className="step-number-badge">01</div>
              <h3 className="step-title">Create Your Profile</h3>
              <p className="step-desc">
                Build your personalised student profile with comprehensive academic, board, and location intake.
              </p>
            </div>

            {/* Step 02 */}
            <div className="step-card">
              <div className="step-number-badge">02</div>
              <h3 className="step-title">Understand Yourself</h3>
              <p className="step-desc">
                Explore your strengths, interests and academic direction through structured preference frameworks.
              </p>
            </div>

            {/* Step 03 */}
            <div className="step-card">
              <div className="step-number-badge">03</div>
              <h3 className="step-title">Get Guidance</h3>
              <p className="step-desc">
                Receive structured guidance based on your profile from qualified educational counsellors.
              </p>
            </div>

            {/* Step 04 */}
            <div className="step-card">
              <div className="step-number-badge">04</div>
              <h3 className="step-title">Plan Your Future</h3>
              <p className="step-desc">
                Make confident decisions about your next step with clear timelines, requirements, and milestones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          6. STUDENT GUIDANCE SECTION
          ===================================================================== */}
      <section className="guidance-section" id="student-guidance">
        <div className="landing-container">
          <div className="section-header-center">
            <span className="section-badge">Advisory Framework</span>
            <h2 className="section-heading-lg">Guidance built around you.</h2>
            <p className="section-subtext">
              Comprehensive guidance pillars addressing every critical dimension of your
              educational path and career growth.
            </p>
          </div>

          <div className="guidance-grid">
            {/* Card 1: Academic Guidance */}
            <div
              className="guidance-card"
              onClick={handleGetStarted}
              title="Explore Academic Guidance"
            >
              <div className="guidance-card-top">
                <div className="guidance-icon-circle">
                  <BookOpen size={24} />
                </div>
                <h3 className="guidance-card-title">Academic Guidance</h3>
                <p className="guidance-card-desc">
                  Understand your academic direction and opportunities across leading
                  curriculums, subject specializations, and degree programs.
                </p>
              </div>
              <div className="guidance-card-action">
                <span>Explore Academic Paths</span>
                <ArrowRight size={16} />
              </div>
            </div>

            {/* Card 2: Career Exploration */}
            <div
              className="guidance-card"
              onClick={handleGetStarted}
              title="Explore Career Exploration"
            >
              <div className="guidance-card-top">
                <div className="guidance-icon-circle">
                  <Compass size={24} />
                </div>
                <h3 className="guidance-card-title">Career Exploration</h3>
                <p className="guidance-card-desc">
                  Explore pathways aligned with your interests and strengths, analyzing
                  industry developments and emerging professional sectors.
                </p>
              </div>
              <div className="guidance-card-action">
                <span>Discover Career Tracks</span>
                <ArrowRight size={16} />
              </div>
            </div>

            {/* Card 3: Personalised Planning */}
            <div
              className="guidance-card"
              onClick={handleGetStarted}
              title="Explore Personalised Planning"
            >
              <div className="guidance-card-top">
                <div className="guidance-icon-circle">
                  <Target size={24} />
                </div>
                <h3 className="guidance-card-title">Personalised Planning</h3>
                <p className="guidance-card-desc">
                  Build a clearer plan for your educational future with sequenced milestones,
                  prerequisites, and verified counsellor recommendations.
                </p>
              </div>
              <div className="guidance-card-action">
                <span>Start Your Plan</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          7. WHY SUPERCONSCIOUSNESS SECTION (Dark Navy)
          ===================================================================== */}
      <section className="why-section" id="why-us">
        <div className="landing-container">
          <div className="why-header">
            <span className="why-badge">The Superconsciousness Difference</span>
            <h2 className="why-heading">
              <span>More than information.</span>
              <span>A structured approach to your future.</span>
            </h2>
            <p className="why-subtext">
              We replace fragmented advice and guesswork with a rigorous, transparent student guidance framework.
            </p>
          </div>

          <div className="why-grid">
            <div className="why-card">
              <div className="why-num">01</div>
              <h3 className="why-card-title">Personalised</h3>
              <p className="why-card-desc">
                Recommendations tailored to individual academic history, strengths, and geographical priorities.
              </p>
            </div>

            <div className="why-card">
              <div className="why-num">02</div>
              <h3 className="why-card-title">Student-Centred</h3>
              <p className="why-card-desc">
                Every advisory session places student goals, learning style, and genuine ambitions first.
              </p>
            </div>

            <div className="why-card">
              <div className="why-num">03</div>
              <h3 className="why-card-title">Structured</h3>
              <p className="why-card-desc">
                Clear progress milestones and audited workflows eliminate ambiguity across every stage.
              </p>
            </div>

            <div className="why-card">
              <div className="why-num">04</div>
              <h3 className="why-card-title">Guidance-Focused</h3>
              <p className="why-card-desc">
                Direct engagement with qualified counsellors dedicated to meaningful academic mentorship.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          RESOURCES ANCHOR SECTION
          ===================================================================== */}
      <section id="resources" className="resources-section">
        <div className="landing-container">
          <div className="resources-card">
            <div className="resources-content-wrap">
              <div className="resources-icon-box">
                <FileCheck2 size={24} />
              </div>
              <div className="resources-text-block">
                <h3 className="resources-heading">
                  Student Guidance Resources & Toolkits
                </h3>
                <p className="resources-subtext">
                  Access curated guidance frameworks, curriculum comparative guides, and university planning checklists.
                </p>
              </div>
            </div>

            <button
              onClick={handleGetStarted}
              className="btn-primary-indigo resources-action-btn"
            >
              <span>Explore Resources</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================================
          8. CALL TO ACTION SECTION
          ===================================================================== */}
      <section className="cta-section" id="get-started">
        <div className="landing-container">
          <div className="cta-box">
            <h2 className="cta-title">Ready to understand your next step?</h2>
            <p className="cta-text">
              Start your student journey with Superconsciousness. Complete your initial
              profile intake and receive structured guidance.
            </p>

            <div className="cta-actions">
              <button
                onClick={handleGetStarted}
                className="btn-cta-primary"
                id="cta-get-started-btn"
              >
                <span>Get Started</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => scrollTo('contact')}
                className="btn-cta-secondary"
                id="cta-talk-to-us-btn"
              >
                <PhoneCall size={16} />
                <span>Talk to Us</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
