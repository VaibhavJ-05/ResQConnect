import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiActivity, FiPhone, FiMail, FiMapPin, FiHeart } from 'react-icons/fi';

const FooterLink = ({ to, children }) => (
  <li>
    <Link
      to={to}
      className="d-inline-flex align-items-center gap-1 text-decoration-none"
      style={{ color: '#64748b', fontSize: '0.875rem', transition: 'all 0.2s ease' }}
      onMouseEnter={e => { e.currentTarget.style.color = '#b7791f'; e.currentTarget.style.paddingLeft = '4px'; }}
      onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.paddingLeft = '0'; }}
    >
      {children}
    </Link>
  </li>
);

const Footer = () => {
  return (
    <footer className="mt-auto" style={{ borderTop: '1px solid #e2e8f0' }}>

      {/* ── Emergency Hotline Strip ── */}
      <div style={{ background: 'linear-gradient(135deg, #1d3a57 0%, #2c5282 100%)', padding: '12px 0' }}>
        <Container>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <div style={{ background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '6px 10px' }}>
                <FiPhone size={14} color="#fca5a5" />
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.58)', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>National Disaster Helpline</div>
                <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.95rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.02em' }}>1078 &nbsp;·&nbsp; Emergency Dispatch: Active</div>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2" style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 0 3px rgba(74,222,128,0.2)', display: 'inline-block' }} />
              Operational 24/7
            </div>
          </div>
        </Container>
      </div>

      {/* ── Main Footer Body ── */}
      <div style={{ background: '#f8fafc', padding: '48px 0 32px' }}>
        <Container>
          <Row className="gy-4 justify-content-between text-start">

            {/* Brand column */}
            <Col xs={12} lg={5}>
              <div className="d-flex align-items-center mb-3 gap-2">
                <div style={{ background: 'linear-gradient(135deg, #b7791f, #f59e0b)', borderRadius: 9, padding: '7px 8px', display: 'flex' }}>
                  <FiActivity size={18} color="#fff" />
                </div>
                <h5 className="fw-bold mb-0" style={{ fontFamily: 'var(--font-heading)', color: '#1a202c', letterSpacing: '-0.02em' }}>
                  ResQ<span style={{ color: '#b7791f' }}>Connect</span>
                </h5>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.7, maxWidth: 360, marginBottom: 20 }}>
                Connecting communities with emergency responders, NGOs, and relief services during critical situations. Real-time coordination, distress response, and resource logistics platform.
              </p>

              {/* Contact details */}
              <div className="d-flex flex-column gap-2">
                {[
                  { icon: <FiMail size={13}/>,   text: 'resqconnect26@gmail.com' },
                  { icon: <FiMapPin size={13}/>,  text: 'National Disaster Response Hub' },
                ].map((item, i) => (
                  <div key={i} className="d-flex align-items-center gap-2" style={{ color: '#718096', fontSize: '0.82rem' }}>
                    <span style={{ color: '#b7791f' }}>{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>
            </Col>

            {/* Navigation */}
            <Col xs={6} sm={4} lg={2}>
              <h6 style={{ fontFamily: 'var(--font-heading)', color: '#1a202c', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                Navigation
              </h6>
              <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
                <FooterLink to="/">Home</FooterLink>
                <FooterLink to="/about">About Us</FooterLink>
                <FooterLink to="/hazard-map">Hazard Map</FooterLink>
              </ul>
            </Col>

            {/* Portal */}
            <Col xs={6} sm={4} lg={2}>
              <h6 style={{ fontFamily: 'var(--font-heading)', color: '#1a202c', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                Portal
              </h6>
              <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
                <FooterLink to="/login">Sign In</FooterLink>
                <FooterLink to="/register">Get Started</FooterLink>
                <FooterLink to="/donate">Donate</FooterLink>
              </ul>
            </Col>

          </Row>

          {/* ── Divider ── */}
          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #cbd5e0 30%, #cbd5e0 70%, transparent)', margin: '32px 0 20px' }} />

          {/* ── Copyright strip ── */}
          <Row className="align-items-center">
            <Col xs={12} md={7}>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>
                © {new Date().getFullYear()} ResQConnect. All Rights Reserved. Connecting Communities. Saving Lives.
              </p>
            </Col>
            <Col xs={12} md={5} className="text-md-end mt-2 mt-md-0">
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                Emergency Response • Relief Coordination • Community Support
              </span>
            </Col>
          </Row>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
