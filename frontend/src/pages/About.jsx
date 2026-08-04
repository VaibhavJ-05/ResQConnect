import React, { useEffect, useRef } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FiBell, FiCheckCircle, FiHeart, FiHome, FiMapPin, FiShield, FiTruck, FiUsers } from 'react-icons/fi';

/* ── reveal hook ── */
const useReveal = () => {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } }),
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );
    ref.current.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return ref;
};

const About = () => {
  const pageRef = useReveal();

  const cards = [
    { icon: <FiBell size={22}/>,   color:'#3b82f6', bg:'rgba(59,130,246,0.1)',  title:'Fast SOS Support',            body:'Victims can raise an SOS with their location and emergency details, helping response teams understand where help is needed and how urgent the situation is.' },
    { icon: <FiUsers size={22}/>,  color:'#6366f1', bg:'rgba(99,102,241,0.1)',  title:'One Shared Response Network', body:'The platform connects citizens, volunteers, NGOs, and government officers so rescue work, relief efforts, and field updates stay aligned in real time.' },
    { icon: <FiShield size={22}/>, color:'#10b981', bg:'rgba(16,185,129,0.1)', title:'Trusted Access',               body:'Each person sees the tools meant for their role — from victims tracking requests to NGOs managing relief operations and admins overseeing platform activity.' },
    { icon: <FiTruck size={22}/>,  color:'#ef4444', bg:'rgba(239,68,68,0.1)',  title:'Relief Made Visible',          body:'Relief camps, resources, missing person reports, volunteer tasks, and disaster updates managed in one place — reducing confusion during critical hours.' },
  ];

  const whoItHelps = [
    'Victims can raise SOS requests, find camps, and report missing persons.',
    'Volunteers can receive tasks and share completion updates.',
    'NGOs can manage camps, resources, volunteers, and assigned SOS cases.',
    'Government officers can monitor disasters, issue updates, and coordinate response.',
  ];

  const capabilities = [
    { icon: <FiBell size={18}/>,   color:'#3b82f6', label:'Emergency Alerts',      value:'SOS requests with priority, location, and status tracking.' },
    { icon: <FiHome size={18}/>,   color:'#6366f1', label:'Relief Camps',          value:'Camp details, capacity, resources, and contact information.' },
    { icon: <FiUsers size={18}/>,  color:'#10b981', label:'Volunteer Work',         value:'Task assignment, progress updates, verification, and proof upload.' },
    { icon: <FiShield size={18}/>, color:'#ef4444', label:'Coordinated Oversight',  value:'Role-based dashboards for NGOs, officers, admins, and citizens.' },
  ];

  return (
    <div ref={pageRef}>
      <Container className="py-5 text-start">

        {/* ── Page Header ── */}
        <div className="page-header-banner mb-5 shadow-sm reveal" style={{ minHeight: 200 }}>
          <img src="/images/rescue_workers_banner.png" alt="About background" />
          <div className="content">
            <span className="section-label mb-2 d-block">About ResQConnect</span>
            <h1 className="display-6 fw-bold mt-1 mb-2 text-light-blue" style={{ fontFamily: 'var(--font-heading)' }}>
              Connecting Help When Every Minute Matters
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.78)', maxWidth: 580, marginBottom: 0, lineHeight: 1.65 }}>
              ResQConnect brings victims, volunteers, NGOs, and government teams onto one coordinated platform during floods, fires, earthquakes, landslides, and other emergencies.
            </p>
          </div>
        </div>

        {/* ── Platform Promise Cards ── */}
        <div className="mb-2 reveal">
          <span className="section-label">What We Deliver</span>
          <h2 className="fw-bold mt-1 mb-4" style={{ color: 'var(--accent-blue)' }}>Our Platform Promise</h2>
        </div>
        <Row className="g-4 mb-5 stagger-children">
          {cards.map((card, i) => (
            <Col md={6} key={i}>
              <Card className="glass-panel glass-panel-hover h-100 border-0 p-3 reveal card-hover-lift">
                <Card.Body>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="icon-box icon-box-md rounded-3 flex-shrink-0" style={{ background: card.bg, color: card.color }}>
                      {card.icon}
                    </div>
                    <h4 className="mb-0" style={{ color: 'var(--accent-blue)', fontSize: '1.05rem' }}>{card.title}</h4>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 0 }}>{card.body}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* ── Mission Section ── */}
        <Row className="align-items-stretch g-4 mb-5">
          <Col lg={6}>
            <div className="glass-panel p-4 p-md-5 h-100 reveal-left">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="icon-box icon-box-sm rounded-2" style={{ background: 'rgba(197,48,48,0.1)', color: 'var(--accent-rose)' }}>
                  <FiHeart size={16} />
                </div>
                <h4 className="mb-0" style={{ color: 'var(--accent-blue)' }}>Our Purpose</h4>
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                ResQConnect is built to make disaster response more organized, transparent, and reachable. In an emergency, people should not have to search through scattered contacts, repeated phone calls, or uncertain updates.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 0 }}>
                From the first SOS alert to relief camp support and volunteer task completion, ResQConnect keeps the focus on practical response: who needs help, who can respond, what resources are available, and what action has already been taken.
              </p>
            </div>
          </Col>

          <Col lg={6}>
            <div className="glass-panel p-4 p-md-5 h-100 reveal-right">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="icon-box icon-box-sm rounded-2" style={{ background: 'rgba(44,82,130,0.1)', color: 'var(--accent-indigo)' }}>
                  <FiMapPin size={16} />
                </div>
                <h4 className="mb-0" style={{ color: 'var(--accent-blue)' }}>Who It Helps</h4>
              </div>
              <div className="d-flex flex-column gap-3">
                {whoItHelps.map((item, i) => (
                  <div key={i} className="d-flex gap-3 align-items-start p-3 rounded-3" style={{ background: '#f7fafc', border: '1px solid #edf2f7' }}>
                    <div style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <span style={{ color: '#16a34a', fontWeight: 800, fontSize: '0.75rem' }}>{i + 1}</span>
                    </div>
                    <span style={{ color: 'var(--text-secondary)', lineHeight: 1.55, fontSize: '0.9rem' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </Col>
        </Row>

        {/* ── Disaster Images Row ── */}
        <Row className="g-3 mb-5 stagger-children">
          {[
            { img: '/images/flood_4.jpeg',      label: 'Flood Response' },
            { img: '/images/earthquake_3.jpeg', label: 'Earthquake Relief' },
            { img: '/images/fire_2.jpeg',       label: 'Fire Emergency' },
            { img: '/images/landslide_3.jpeg',  label: 'Landslide Aid' },
          ].map((item, i) => (
            <Col xs={6} md={3} key={i}>
              <div className="disaster-img-card reveal">
                <img src={item.img} alt={item.label} />
                <div className="overlay"><span>{item.label}</span></div>
              </div>
            </Col>
          ))}
        </Row>

        {/* ── Platform Capabilities ── */}
        <div className="glass-panel p-4 p-md-5 reveal">
          <div className="d-flex align-items-center gap-2 mb-5">
            <div className="icon-box icon-box-sm rounded-2" style={{ background: 'rgba(44,82,130,0.1)', color: 'var(--accent-indigo)' }}>
              <FiHome size={16} />
            </div>
            <div>
              <span className="section-label d-block">Capabilities</span>
              <h4 className="mb-0 mt-1" style={{ color: 'var(--accent-blue)' }}>What ResQConnect Brings Together</h4>
            </div>
          </div>
          <Row className="gy-4">
            {capabilities.map((spec, i) => (
              <Col sm={6} md={3} key={i}>
                <div className="d-flex align-items-start gap-3 p-3 rounded-3" style={{ background: '#f7fafc', border: '1px solid #edf2f7', height: '100%', transition: 'var(--transition-smooth)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f0f7ff'; e.currentTarget.style.borderColor = 'rgba(44,82,130,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f7fafc'; e.currentTarget.style.borderColor = '#edf2f7'; }}
                >
                  <div className="icon-box icon-box-sm rounded-2 flex-shrink-0 mt-1" style={{ background: `${spec.color}18`, color: spec.color }}>
                    {spec.icon}
                  </div>
                  <div>
                    <span className="fw-bold d-block mb-1" style={{ color: 'var(--accent-blue)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{spec.label}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>{spec.value}</span>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default About;
