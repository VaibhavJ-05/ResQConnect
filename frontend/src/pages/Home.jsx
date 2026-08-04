import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { disasterService, campService, sosService } from '../services/api';
import {
  FiAlertTriangle, FiHome, FiHelpCircle, FiArrowRight,
  FiUserCheck, FiUsers, FiTarget, FiEye, FiAward,
  FiShield, FiCheck, FiBriefcase, FiHeart, FiActivity,
  FiMapPin, FiZap, FiChevronDown
} from 'react-icons/fi';

/* ── Scroll reveal hook ── */
const useReveal = () => {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    const els = ref.current.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return ref;
};

/* ── Counter animation hook ── */
const useCounter = (target, duration = 1400) => {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(ease * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);

  return [count, ref];
};

/* ── Single animated stat ── */
const AnimatedStat = ({ icon, color, value, label, isString }) => {
  const [count, ref] = useCounter(isString ? 0 : (parseInt(value) || 0));
  return (
    <div ref={ref} className="d-flex align-items-center gap-3 my-2 px-3">
      <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width: 46, height: 46, background: `${color}22`, color }}>
        {icon}
      </div>
      <div>
        <h4 className="fw-bold mb-0" style={{ fontFamily: 'var(--font-heading)', color: '#fff', fontSize: '1.4rem' }}>
          {isString ? value : count}
        </h4>
        <span style={{ color: 'rgba(255,255,255,0.58)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════ */
const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const pageRef = useReveal();

  const [stats, setStats] = useState({
    activeDisasters: 0,
    reliefCamps:     0,
    sosRequests:     4,
    volunteers:      124,
  });

  useEffect(() => {
    const fetchPublicStats = async () => {
      try {
        const [disastersList, campsList] = await Promise.all([
          disasterService.getAll(true),
          campService.getAll(),
        ]);
        let sosCount = 4;
        if (isAuthenticated && user && user.roleName !== 'Victim') {
          const sosList = await sosService.getAll();
          sosCount = sosList.filter(s => s.status === 'Pending').length;
        }
        setStats({
          activeDisasters: disastersList.length,
          reliefCamps:     campsList.length,
          sosRequests:     sosCount || 4,
          volunteers:      124,
        });
      } catch {}
    };
    fetchPublicStats();
  }, [isAuthenticated, user]);

  const getDashboardLink = () => {
    if (!user) return '/login';
    const map = {
      'Victim':             '/victim/dashboard',
      'Volunteer':          '/volunteer/dashboard',
      'NGO':                '/ngo/dashboard',
      'Government Officer': '/gov/dashboard',
      'Admin':              '/admin/dashboard',
    };
    return map[user.roleName] || '/';
  };

  const disasterCategories = [
    { label: 'Flood',     img: '/images/flood.jpeg' },
    { label: 'Earthquake',img: '/images/earthquake.jpeg' },
    { label: 'Fire',      img: '/images/fire.jpeg' },
    { label: 'Landslide', img: '/images/landslide.jpeg' },
  ];

  const objectives = [
    { icon: <FiTarget size={22}/>,  color:'#f59e0b', bg:'rgba(245,158,11,0.12)',  title:'Our Mission',    text:'Reduce response time, improve coordination, and save lives with a reliable platform for disaster management.' },
    { icon: <FiEye size={22}/>,     color:'#10b981', bg:'rgba(16,185,129,0.12)',  title:'Our Vision',     text:'Build a disaster-resilient society where technology empowers communities for a safer tomorrow.' },
    { icon: <FiAward size={22}/>,   color:'#8b5cf6', bg:'rgba(139,92,246,0.12)', title:'Our Values',     text:'Compassion, Collaboration, Integrity, and Innovation drive our emergency response mission.' },
    { icon: <FiShield size={22}/>,  color:'#3b82f6', bg:'rgba(59,130,246,0.12)', title:'Our Commitment', text:'We serve communities 24/7 with accurate information and timely relief support for all.' },
  ];

  const whyUs = [
    'Real-time information and emergency alerts',
    'Secure and reliable government-grade platform',
    'Verified relief resources and shelter directories',
    'Built for communities — victims, NGOs, volunteers',
    'Easy to use across all devices',
    'Always operational when you need us most',
    'Coordinated response with government agencies',
    'Live tracking & SOS emergency dispatch',
  ];

  const teamHighlights = [
    { icon: <FiBriefcase size={20}/>, color:'#3b82f6', bg:'rgba(59,130,246,0.1)',  title:'Professionals',  sub:'Experienced Team' },
    { icon: <FiHeart size={20}/>,     color:'#10b981', bg:'rgba(16,185,129,0.1)', title:'Social Impact',   sub:'Community-Driven' },
    { icon: <FiZap size={20}/>,       color:'#8b5cf6', bg:'rgba(139,92,246,0.1)', title:'Innovation',      sub:'Technology-First' },
  ];

  return (
    <div ref={pageRef} className="py-4 px-3 px-md-4 text-start">

      {/* ══ HERO BANNER ══════════════════════════════════════════ */}
      <div
        className="fade-in-up mb-4 shadow-lg hero-banner"
        style={{
          minHeight: 520,
          background: "linear-gradient(90deg, rgba(9,18,33,0.97) 0%, rgba(11,25,44,0.92) 38%, rgba(11,25,44,0.65) 60%, rgba(11,25,44,0) 80%), url('/images/rescue_workers_banner.png') right center / cover no-repeat",
          border: '1px solid #1e3a5f'
        }}
      >
        <Row className="align-items-center g-0" style={{ minHeight: 520 }}>
          <Col lg={6} xl={5} className="p-5 d-flex flex-column justify-content-center text-start">

            {/* Eyebrow label */}
            <div className="d-flex align-items-center gap-2 mb-3">
              <span style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 999, padding: '3px 12px', color: '#f59e0b', fontWeight: 700, fontSize: '0.73rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                🛡️ India's Disaster Response Platform
              </span>
            </div>

            {/* Headline */}
            <h1 className="display-4 fw-bold mb-3" style={{ fontFamily: 'var(--font-heading)', color: '#ffffff', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
              <span className="text-light-blue">We Are Here,</span><br />
              <span style={{ color: '#f59e0b' }}>To Help You</span>
            </h1>

            <p className="mb-4 fs-6" style={{ lineHeight: 1.75, maxWidth: 460, color: 'rgba(255,255,255,0.8)' }}>
              ResQConnect is a centralized disaster management system bridging the gap between people in need and available resources during emergencies.
            </p>

            {/* CTA buttons */}
            <div className="d-flex gap-3 flex-wrap mb-4">
              {isAuthenticated ? (
                <Link
                  to={getDashboardLink()}
                  className="btn-amber d-inline-flex align-items-center gap-2 px-4 py-2 fw-bold text-decoration-none"
                  style={{ borderRadius: 9 }}
                >
                  Go to Dashboard <FiArrowRight size={16} />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-amber d-inline-flex align-items-center gap-2 px-4 py-2 fw-bold text-decoration-none"
                    style={{ borderRadius: 9 }}
                  >
                    Get Started <FiArrowRight size={16} />
                  </Link>
                  <Link
                    to="/login"
                    className="d-inline-flex align-items-center px-4 py-2 fw-semibold text-decoration-none"
                    style={{ border: '1.5px solid rgba(255,255,255,0.45)', color: '#fff', borderRadius: 9, background: 'rgba(255,255,255,0.06)', transition: 'all 0.2s ease', backdropFilter: 'blur(4px)' }}
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            {/* Hero quick stats */}
            <div className="d-flex gap-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
              {[
                { val: stats.activeDisasters, label: 'Active Events' },
                { val: stats.reliefCamps,     label: 'Relief Camps' },
                { val: '24/7',                label: 'Support Active' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="fw-bold" style={{ color: '#fff', fontSize: '1.35rem', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{s.val}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem', fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </Col>
        </Row>

        {/* Scroll chevron */}
        <div className="d-none d-lg-flex" style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)' }}>
          <div className="bounce-y" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <FiChevronDown size={22} />
          </div>
        </div>
      </div>

      {/* ══ DISASTER CATEGORY GALLERY ════════════════════════════ */}
      <Row className="g-3 mb-5 stagger-children">
        {disasterCategories.map((cat, i) => (
          <Col xs={6} md={3} key={i}>
            <div className="disaster-img-card reveal" style={{ animationDelay: `${i * 0.07}s` }}>
              <img src={cat.img} alt={cat.label} />
              <div className="overlay">
                <span><FiAlertTriangle size={13} className="me-1" />{cat.label}</span>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* ══ CORE OBJECTIVES ══════════════════════════════════════ */}
      <div className="mb-2">
        <div className="reveal text-center mb-4">
          <span className="section-label">Our Principles</span>
          <h2 className="fw-bold mt-1" style={{ color: 'var(--accent-blue)' }}>Built on Purpose</h2>
        </div>
      </div>
      <Row className="g-3 mb-5 stagger-children">
        {objectives.map((obj, i) => (
          <Col md={6} lg={3} key={i}>
            <Card className="glass-panel glass-panel-hover border-0 h-100 p-3 reveal">
              <Card.Body className="p-2">
                <div
                  className="icon-box icon-box-md mb-3 rounded-3"
                  style={{ background: obj.bg, color: obj.color }}
                >
                  {obj.icon}
                </div>
                <h5 className="fw-bold mb-2" style={{ color: 'var(--accent-blue)', fontSize: '0.97rem' }}>{obj.title}</h5>
                <p className="small mb-0" style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}>{obj.text}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ══ STATISTICS BAR ═══════════════════════════════════════ */}
      <div
        className="rounded-4 mb-5 reveal"
        style={{
          background: 'linear-gradient(135deg, #0b192c 0%, #1d3a57 60%, #2c5282 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(245,158,11,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(44,82,130,0.15)', pointerEvents: 'none' }} />

        <div className="d-flex flex-wrap justify-content-around align-items-center py-5 px-3">
          <AnimatedStat icon={<FiAlertTriangle size={20}/>} color="#f59e0b" value={stats.activeDisasters}     label="Active Disasters" />
          <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.1)', display: 'none' }} className="d-none d-lg-block" />
          <AnimatedStat icon={<FiUsers size={20}/>}         color="#3b82f6" value={stats.volunteers}          label="Volunteers"       />
          <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.1)' }} className="d-none d-lg-block" />
          <AnimatedStat icon={<FiHome size={20}/>}          color="#10b981" value={stats.reliefCamps}         label="Relief Camps"     />
          <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.1)' }} className="d-none d-lg-block" />
          <AnimatedStat icon={<FiHelpCircle size={20}/>}    color="#8b5cf6" value={stats.sosRequests}         label="Pending SOS"      />
          <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.1)' }} className="d-none d-lg-block" />
          <AnimatedStat icon={<FiUserCheck size={20}/>}     color="#ef4444" value="24/7"                      label="Active Support"   isString />
        </div>
      </div>

      {/* ══ TEAM & WHY CHOOSE US ═════════════════════════════════ */}
      <Row className="g-5 mb-5 align-items-stretch">
        <Col lg={6}>
          {/* Team image banner */}
          <div
            className="rounded-4 overflow-hidden mb-4 reveal-left"
            style={{ height: 220, background: "linear-gradient(90deg, rgba(9,18,33,0.9) 40%, rgba(9,18,33,0.5) 80%), url('/images/flood_5.jpeg') center / cover no-repeat", position: 'relative' }}
          >
            <div className="p-4 d-flex flex-column justify-content-end h-100">
              <div className="mb-1" style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Our Team</div>
              <h3 className="fw-bold mb-1 text-light-blue" style={{ fontFamily: 'var(--font-heading)' }}>Passionate Builders</h3>
              <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.87rem', marginBottom: 0, maxWidth: 400 }}>
                Developers and disaster management experts creating real impact through technology.
              </p>
            </div>
          </div>

          <Row className="g-3 stagger-children">
            {teamHighlights.map((item, i) => (
              <Col xs={4} key={i}>
                <Card className="glass-panel border-0 text-center p-3 reveal card-hover-lift">
                  <div className="icon-box icon-box-md mb-2 rounded-3 mx-auto" style={{ background: item.bg, color: item.color }}>
                    {item.icon}
                  </div>
                  <h6 className="fw-bold mb-1 small" style={{ color: 'var(--accent-blue)', fontSize: '0.8rem' }}>{item.title}</h6>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{item.sub}</span>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>

        <Col lg={6}>
          <div className="glass-panel p-4 h-100 reveal-right">
            <div className="d-flex align-items-center gap-2 mb-4">
              <div className="icon-box icon-box-sm rounded-2" style={{ background: 'rgba(29,58,87,0.1)', color: 'var(--accent-blue)' }}>
                <FiShield size={16} />
              </div>
              <h3 className="fw-bold mb-0" style={{ color: 'var(--accent-blue)' }}>Why Choose ResQConnect?</h3>
            </div>
            <Row className="gy-3">
              {whyUs.map((item, i) => (
                <Col md={6} key={i} className="d-flex align-items-start gap-2">
                  <div className="mt-1 flex-shrink-0" style={{ width: 18, height: 18, background: 'rgba(16,185,129,0.12)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiCheck style={{ color: '#10b981' }} size={12} />
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.87rem', fontWeight: 500, lineHeight: 1.5 }}>{item}</span>
                </Col>
              ))}
            </Row>

            {/* Preview images */}
            <Row className="g-2 mt-4">
              {['/images/earthquake_2.jpeg', '/images/flood_2.jpeg', '/images/fire_2.jpeg'].map((img, i) => (
                <Col xs={4} key={i}>
                  <div style={{ height: 80, borderRadius: 'var(--radius-md)', overflow: 'hidden', transition: 'var(--transition-medium)' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <img src={img} alt="disaster" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </Col>
      </Row>

      {/* ══ CALL TO ACTION BANNER ════════════════════════════════ */}
      <div
        className="rounded-4 overflow-hidden mb-4 reveal"
        style={{
          background: "linear-gradient(90deg, rgba(9,18,33,0.96) 0%, rgba(44,82,130,0.9) 55%, rgba(44,82,130,0.72) 75%), url('/images/landslide_2.jpeg') right center / cover no-repeat",
          border: '1px solid rgba(255,255,255,0.08)',
          position: 'relative'
        }}
      >
        {/* Left accent bar */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(180deg, #f59e0b, #b7791f)' }} />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center p-4 p-md-5 ps-md-5">
          <div className="d-flex align-items-center gap-4 text-start mb-4 mb-md-0">
            <div
              className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
              style={{ width: 54, height: 54, background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }}
            >
              <FiActivity size={26} />
            </div>
            <div>
              <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>Join the mission</div>
              <h4 className="fw-bold mb-1" style={{ color: '#ffffff', fontFamily: 'var(--font-heading)', lineHeight: 1.2 }}>
                Together, we build a safer tomorrow.
              </h4>
              <p style={{ color: 'rgba(255,255,255,0.68)', marginBottom: 0, fontSize: '0.9rem' }}>
                Join ResQConnect as a volunteer and be part of the change you want to see.
              </p>
            </div>
          </div>

          <div className="d-flex gap-3 flex-shrink-0">
            <Link
              to="/register"
              className="btn-amber d-inline-flex align-items-center gap-2 text-decoration-none px-4 py-2"
              style={{ borderRadius: 9, fontWeight: 700, fontSize: '0.9rem' }}
            >
              Join as Volunteer
            </Link>
            <Link
              to="/about"
              className="d-inline-flex align-items-center px-4 py-2 fw-semibold text-decoration-none"
              style={{ border: '1.5px solid rgba(255,255,255,0.4)', color: '#fff', borderRadius: 9, background: 'rgba(255,255,255,0.05)', fontSize: '0.9rem' }}
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;
