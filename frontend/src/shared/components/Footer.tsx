import React from 'react';
import { Compass, Mail, Clock, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onNavigate?: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAccountClick = (view: string) => {
    if (onNavigate) {
      onNavigate(view);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="premium-footer" id="site-footer">
      <div className="landing-container">
        <div className="footer-inner-grid">
          {/* Brand Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 12px rgba(109, 40, 217, 0.35)',
                }}
              >
                <Compass size={22} />
              </div>
              <div>
                <span
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    letterSpacing: '-0.02em',
                  }}
                >
                  SUPER<span style={{ color: '#C7D2FE' }}>CONSCIOUSNESS</span>
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.925rem', color: '#CBD5E1', lineHeight: 1.65, maxWidth: '380px' }}>
              Integrated Educational Consultancy and Student Guidance Platform.
            </p>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                background: 'rgba(109, 40, 217, 0.15)',
                border: '1px solid rgba(199, 210, 254, 0.25)',
                color: '#C7D2FE',
                fontSize: '0.775rem',
                fontWeight: 600,
                width: 'fit-content',
              }}
            >
              <ShieldCheck size={14} color="#A78BFA" /> Verified Student Guidance System
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="footer-col-header">Platform</h4>
            <ul className="footer-links-vertical">
              <li>
                <span className="footer-link-action" onClick={() => scrollTo('about')}>
                  About
                </span>
              </li>
              <li>
                <span className="footer-link-action" onClick={() => scrollTo('how-it-works')}>
                  How It Works
                </span>
              </li>
              <li>
                <span className="footer-link-action" onClick={() => scrollTo('student-guidance')}>
                  Student Guidance
                </span>
              </li>
              <li>
                <span className="footer-link-action" onClick={() => scrollTo('resources')}>
                  Resources
                </span>
              </li>
              <li>
                <span className="footer-link-action" onClick={() => scrollTo('contact')}>
                  Contact
                </span>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h4 className="footer-col-header">Account</h4>
            <ul className="footer-links-vertical">
              <li>
                <span
                  className="footer-link-action"
                  onClick={() => handleAccountClick('login')}
                  id="footer-login-link"
                >
                  Login
                </span>
              </li>
              <li>
                <span
                  className="footer-link-action"
                  onClick={() => handleAccountClick('register')}
                  id="footer-register-link"
                >
                  Register
                </span>
              </li>
            </ul>
          </div>

          {/* Advisory & Contact */}
          <div id="contact">
            <h4 className="footer-col-header">Contact & Advisory</h4>
            <ul className="footer-links-vertical" style={{ gap: '0.95rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.875rem', color: '#CBD5E1' }}>
                <Mail size={16} color="#A78BFA" />
                <a href="mailto:guidance@superconsciousness.edu" style={{ color: 'inherit', textDecoration: 'none' }}>
                  guidance@superconsciousness.edu
                </a>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.85rem', color: '#94A3B8' }}>
                <Clock size={16} color="#818CF8" />
                <span>Advisory Hours: Mon – Fri, 9:00 AM – 6:00 PM</span>
              </li>
              <li style={{ fontSize: '0.825rem', color: '#94A3B8', lineHeight: 1.5 }}>
                Structured student intakes and profiles are reviewed directly through the verified counsellor advisory portal.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-legal-bar">
          <div>
            © 2026 Superconsciousness. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', color: '#94A3B8', fontSize: '0.85rem' }}>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Student Data Protection</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
