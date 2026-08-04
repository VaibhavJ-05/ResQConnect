import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Badge, Dropdown, NavDropdown, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { notificationService, sosService, disasterService } from '../services/api';
import { toast } from 'react-toastify';
import {
  FiBell, FiUser, FiLogOut, FiActivity, FiMapPin, FiCheckSquare,
  FiArchive, FiShield, FiMail, FiMenu, FiX, FiEdit3, FiChevronDown
} from 'react-icons/fi';

/* ── helpers ── */
const getInitials = (name = '') => {
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : (parts[0]?.[0] || 'U').toUpperCase();
};

const getRoleColor = (role) => {
  const map = {
    'Admin':              '#7c3aed',
    'Government Officer': '#0369a1',
    'NGO':                '#065f46',
    'Volunteer':          '#92400e',
    'Victim':             '#9f1239',
  };
  return map[role] || '#4a5568';
};

/* ═══════════════════════════════════════════════ */
const NavigationBar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [scrolled,          setScrolled]          = useState(false);
  const [unreadCount,       setUnreadCount]        = useState(0);
  const [hasActiveSos,      setHasActiveSos]       = useState(false);
  const [showContactModal,  setShowContactModal]   = useState(false);
  const [contactData,       setContactData]        = useState({ name: '', email: '', subject: '', message: '' });
  const [contactError,      setContactError]       = useState('');
  const [contactLoading,    setContactLoading]     = useState(false);

  /* ── scroll listener ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── active path helper ── */
  const isActive = (path) => location.pathname === path;

  /* ── unread notifications ── */
  const fetchUnreadCount = async () => {
    if (isAuthenticated && user) {
      try {
        const list = await notificationService.getAll();
        setUnreadCount(list.filter((n) => !n.isRead).length);
      } catch {}
    }
  };

  /* ── NGO camp access check ── */
  const checkNgoCampAccess = async () => {
    if (isAuthenticated && user?.roleName === 'NGO') {
      try {
        const sosList = await sosService.getNgoSos();
        const active  = sosList.filter(s =>
          ['Assigned to NGO','Volunteer Assigned','Accepted','On The Way','Reached','Rescue In Progress']
            .includes(s.currentStatus || s.status)
        );
        let hasDisaster = false;
        try {
          const disasters = await disasterService.getAll({ activeOnly: true });
          const list = Array.isArray(disasters) ? disasters : (disasters?.items || []);
          hasDisaster = list.length > 0;
        } catch {}
        setHasActiveSos(active.length > 0 || hasDisaster);
      } catch {}
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    checkNgoCampAccess();
    window.addEventListener('notificationsUpdated', fetchUnreadCount);
    const iv = setInterval(() => { fetchUnreadCount(); checkNgoCampAccess(); }, 30000);
    return () => {
      window.removeEventListener('notificationsUpdated', fetchUnreadCount);
      clearInterval(iv);
    };
  }, [isAuthenticated, user]);

  const handleLogout = () => { logout(); navigate('/login'); };

  /* ── contact form ── */
  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactData(p => ({ ...p, [name]: value }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const { name, email, subject, message } = contactData;
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setContactError('Please complete all fields.');
      return;
    }
    setContactLoading(true);
    try {
      toast.info('Sending your message…');
      const res = await fetch('https://formsubmit.co/ajax/resqconnect26@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email, _subject: subject, message }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Thank you, ${name}! Message sent.`);
      setShowContactModal(false);
      setContactData({ name: '', email: '', subject: '', message: '' });
      setContactError('');
    } catch {
      toast.error('Failed to send message. Try again.');
    } finally {
      setContactLoading(false);
    }
  };

  /* ── role-specific nav links ── */
  const renderRoleLinks = () => {
    if (!user) return null;

    const navLinkCls = (path) =>
      `nav-custom-link ${isActive(path) ? 'nav-custom-link--active' : ''}`;

    switch (user.roleName) {
      case 'Victim':
        return (
          <>
            <Nav.Link as={Link} to="/victim/dashboard" className={navLinkCls('/victim/dashboard')}>Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/victim/sos" className="nav-custom-link nav-sos-link">🆘 SOS Help</Nav.Link>
            <NavDropdown title="Relief Services" id="victim-relief-dd" className="nav-custom-dropdown">
              <NavDropdown.Item as={Link} to="/victim/camps">Relief Camps</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/victim/missing-persons">Missing Persons</NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="Donations" id="victim-donations-dd" className="nav-custom-dropdown">
              <NavDropdown.Item as={Link} to="/donate">Donate</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/donations/history">My Donations</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link as={Link} to="/hazard-map" className="nav-custom-link nav-map-link">🗺 Hazard Map</Nav.Link>
          </>
        );
      case 'Volunteer':
        return (
          <>
            <Nav.Link as={Link} to="/volunteer/dashboard" className={navLinkCls('/volunteer/dashboard')}>Dashboard</Nav.Link>
            <NavDropdown title="My Work" id="volunteer-work-dd" className="nav-custom-dropdown">
              <NavDropdown.Item as={Link} to="/volunteer/tasks">Tasks Board</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/volunteer/profile">Skills Profile</NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="Donations" id="volunteer-donations-dd" className="nav-custom-dropdown">
              <NavDropdown.Item as={Link} to="/donate">Donate</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/donations/history">My Donations</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link as={Link} to="/hazard-map" className="nav-custom-link nav-map-link">🗺 Hazard Map</Nav.Link>
          </>
        );
      case 'NGO':
        return (
          <>
            <Nav.Link as={Link} to="/ngo/dashboard" className={navLinkCls('/ngo/dashboard')}>Dashboard</Nav.Link>
            <NavDropdown title="Operations" id="ngo-ops-dd" className="nav-custom-dropdown">
              <NavDropdown.Item
                as={Link}
                to={hasActiveSos ? '/ngo/camps' : '#'}
                onClick={(e) => {
                  if (!hasActiveSos) {
                    e.preventDefault();
                    toast.warning('Manage Camps is disabled until a Government Officer creates an active Disaster Alert or an SOS is assigned to your NGO.');
                  }
                }}
                style={{ opacity: hasActiveSos ? 1 : 0.5, cursor: hasActiveSos ? 'pointer' : 'not-allowed' }}
              >
                Manage Camps
                {!hasActiveSos && <span className="ms-2 badge-lock">🔒</span>}
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/ngo/resources">Resource Inventory</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/ngo/volunteers">Verify Volunteers</NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="Donations" id="ngo-donations-dd" className="nav-custom-dropdown">
              <NavDropdown.Item as={Link} to="/donate">Donate</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/donations/history">My Donations</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link as={Link} to="/hazard-map" className="nav-custom-link nav-map-link">🗺 Hazard Map</Nav.Link>
          </>
        );
      case 'Government Officer':
        return (
          <>
            <Nav.Link as={Link} to="/gov/dashboard" className={navLinkCls('/gov/dashboard')}>Dashboard</Nav.Link>
            <NavDropdown title="Operations" id="gov-ops-dd" className="nav-custom-dropdown">
              <NavDropdown.Item as={Link} to="/gov/disasters">Manage Disasters</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/gov/announcements">Advisories</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/gov/forecast">Early Warning</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/gov/reports">System Reports</NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="Donations" id="gov-donations-dd" className="nav-custom-dropdown">
              <NavDropdown.Item as={Link} to="/donate">Donate</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/donations/history">My Donations</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link as={Link} to="/hazard-map" className="nav-custom-link nav-map-link">🗺 Hazard Map</Nav.Link>
          </>
        );
      case 'Admin':
        return (
          <>
            <Nav.Link as={Link} to="/admin/dashboard" className={navLinkCls('/admin/dashboard')}>Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/admin/users" className={navLinkCls('/admin/users')}>User Operations</Nav.Link>
            <Nav.Link as={Link} to="/admin/audit-logs" className={navLinkCls('/admin/audit-logs')}>Audit Logs</Nav.Link>
            <Nav.Link as={Link} to="/hazard-map" className="nav-custom-link nav-map-link">🗺 Hazard Map</Nav.Link>
          </>
        );
      default:
        return null;
    }
  };

  const navBg = scrolled
    ? 'rgba(9,18,33,0.95)'
    : '#0b192c';

  return (
    <>
      {/* ── Styles ── */}
      <style>{`
        .navbar-resq {
          transition: background 0.3s ease, box-shadow 0.3s ease, padding 0.3s ease;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .navbar-resq.scrolled {
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: 0 4px 24px rgba(0,0,0,0.35) !important;
        }

        .nav-custom-link {
          font-size: 0.875rem !important;
          font-weight: 500 !important;
          color: rgba(255,255,255,0.78) !important;
          padding: 6px 10px !important;
          border-radius: 6px !important;
          transition: all 0.18s ease !important;
          white-space: nowrap;
          position: relative;
        }
        .nav-custom-link:hover {
          color: #ffffff !important;
          background: rgba(255,255,255,0.08) !important;
        }
        .nav-custom-link--active {
          color: #ffffff !important;
          background: rgba(255,255,255,0.1) !important;
        }
        .nav-custom-link--active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 10px;
          right: 10px;
          height: 2px;
          background: #f59e0b;
          border-radius: 2px;
        }
        .nav-sos-link {
          color: #fca5a5 !important;
          font-weight: 700 !important;
        }
        .nav-sos-link:hover {
          color: #ffffff !important;
          background: rgba(239,68,68,0.15) !important;
        }
        .nav-map-link {
          color: #fcd34d !important;
        }
        .nav-map-link:hover {
          color: #ffffff !important;
          background: rgba(245,158,11,0.15) !important;
        }

        .nav-custom-dropdown .dropdown-toggle {
          font-size: 0.875rem !important;
          font-weight: 500 !important;
          color: rgba(255,255,255,0.78) !important;
          padding: 6px 10px !important;
          border-radius: 6px !important;
          transition: all 0.18s ease !important;
          white-space: nowrap;
          background: transparent !important;
          border: none !important;
        }
        .nav-custom-dropdown .dropdown-toggle:hover,
        .nav-custom-dropdown.show .dropdown-toggle {
          color: #ffffff !important;
          background: rgba(255,255,255,0.08) !important;
        }
        .nav-custom-dropdown .dropdown-toggle::after {
          opacity: 0.6;
          vertical-align: 0.18em;
        }
        .nav-custom-dropdown .dropdown-menu {
          background: #ffffff !important;
          border: 1px solid rgba(0,0,0,0.08) !important;
          box-shadow: 0 16px 48px rgba(0,0,0,0.18) !important;
          border-radius: 10px !important;
          padding: 6px !important;
          margin-top: 8px !important;
          animation: slide-down 0.18s ease both;
          min-width: 190px;
        }
        .nav-custom-dropdown .dropdown-item {
          font-size: 0.86rem !important;
          font-weight: 500 !important;
          color: #1a202c !important;
          padding: 9px 14px !important;
          border-radius: 7px !important;
          transition: all 0.15s ease !important;
        }
        .nav-custom-dropdown .dropdown-item:hover {
          background: #f0f7ff !important;
          color: #1d3a57 !important;
        }

        .nav-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 9px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.82);
          cursor: pointer;
          transition: all 0.18s ease;
          text-decoration: none;
          position: relative;
          flex-shrink: 0;
        }
        .nav-action-btn:hover {
          background: rgba(255,255,255,0.14);
          border-color: rgba(255,255,255,0.22);
          color: #ffffff;
          transform: translateY(-1px);
        }
        .nav-action-btn .bell-pulse {
          animation: bell-ring 2s ease-in-out infinite;
        }
        @keyframes bell-ring {
          0%, 85%, 100% { transform: rotate(0deg); }
          90%  { transform: rotate(12deg); }
          95%  { transform: rotate(-10deg); }
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-heading);
          font-size: 0.78rem;
          font-weight: 800;
          color: #fff;
          flex-shrink: 0;
          letter-spacing: 0.04em;
        }

        .profile-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 10px 5px 5px !important;
          border-radius: 10px !important;
          background: rgba(255,255,255,0.08) !important;
          border: 1px solid rgba(255,255,255,0.12) !important;
          color: #ffffff !important;
          transition: all 0.18s ease !important;
          cursor: pointer;
          text-decoration: none !important;
        }
        .profile-toggle:hover {
          background: rgba(255,255,255,0.14) !important;
          border-color: rgba(255,255,255,0.22) !important;
        }
        .profile-toggle .chevron {
          opacity: 0.55;
          transition: transform 0.2s ease;
        }
        .profile-dropdown.show .profile-toggle .chevron {
          transform: rotate(180deg);
        }

        .profile-menu {
          min-width: 240px !important;
          border-radius: 12px !important;
          border: 1px solid rgba(0,0,0,0.08) !important;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2) !important;
          padding: 8px !important;
          overflow: hidden;
          animation: slide-down 0.18s ease both;
        }
        .profile-menu-header {
          padding: 10px 12px 12px;
          border-bottom: 1px solid #f0f4f8;
          margin-bottom: 6px;
        }
        .profile-menu-item {
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
          padding: 9px 12px !important;
          border-radius: 8px !important;
          font-size: 0.87rem !important;
          font-weight: 500 !important;
          color: #1a202c !important;
          transition: all 0.15s ease !important;
          cursor: pointer;
        }
        .profile-menu-item:hover { background: #f0f7ff !important; color: #1d3a57 !important; }
        .profile-menu-item.danger { color: #c53030 !important; }
        .profile-menu-item.danger:hover { background: #fff5f5 !important; color: #9b2c2c !important; }

        .nav-contact-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 8px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.82);
          font-size: 0.845rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.18s ease;
          white-space: nowrap;
        }
        .nav-contact-btn:hover {
          background: rgba(255,255,255,0.14);
          border-color: rgba(255,255,255,0.22);
          color: #ffffff;
        }

        .nav-login-btn {
          padding: 6px 16px;
          border-radius: 8px;
          border: 1.5px solid rgba(255,255,255,0.45);
          background: transparent;
          color: #ffffff;
          font-size: 0.875rem;
          font-weight: 600;
          transition: all 0.18s ease;
          cursor: pointer;
        }
        .nav-login-btn:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.7);
        }
        .nav-register-btn {
          padding: 6px 16px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, #f59e0b 0%, #b7791f 100%);
          color: #ffffff;
          font-size: 0.875rem;
          font-weight: 600;
          transition: all 0.18s ease;
          cursor: pointer;
        }
        .nav-register-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(183,121,31,0.4);
          filter: brightness(1.06);
        }

        .navbar-toggler {
          border: 1px solid rgba(255,255,255,0.2) !important;
          border-radius: 8px !important;
          padding: 6px 10px !important;
        }
        .navbar-toggler-icon { filter: brightness(2); }

        .contact-modal-form .form-label {
          font-size: 0.83rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        @media (max-width: 991px) {
          .nav-custom-dropdown .dropdown-menu {
            border: none !important;
            box-shadow: none !important;
            background: rgba(255,255,255,0.06) !important;
            border-radius: 8px !important;
          }
          .nav-custom-dropdown .dropdown-item {
            color: rgba(255,255,255,0.78) !important;
          }
          .nav-custom-dropdown .dropdown-item:hover {
            background: rgba(255,255,255,0.1) !important;
            color: #ffffff !important;
          }
        }

        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <Navbar
        collapseOnSelect
        expand="lg"
        variant="dark"
        className={`py-2 navbar-resq${scrolled ? ' scrolled' : ''}`}
        style={{ background: navBg, position: 'sticky', top: 0, zIndex: 1000 }}
      >
        <Container fluid className="px-3 px-lg-4">

          {/* ── Brand ── */}
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2 fw-bold me-3">
            <div style={{ background: 'linear-gradient(135deg, #b7791f, #f59e0b)', borderRadius: '8px', padding: '5px', display: 'flex' }}>
              <FiActivity size={18} color="#fff" />
            </div>
            <span style={{ fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
              ResQ<span style={{ color: '#f59e0b' }}>Connect</span>
            </span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="main-nav" />

          <Navbar.Collapse id="main-nav" className="justify-content-between align-items-center">

            {/* ── Left nav links ── */}
            <Nav className="me-auto d-flex align-items-center flex-wrap gap-1 py-2 py-lg-0">
              <Nav.Link as={Link} to="/" className={`nav-custom-link ${isActive('/') ? 'nav-custom-link--active' : ''}`}>Home</Nav.Link>
              <Nav.Link as={Link} to="/about" className={`nav-custom-link ${isActive('/about') ? 'nav-custom-link--active' : ''}`}>About</Nav.Link>
              {isAuthenticated ? renderRoleLinks() : (
                <Nav.Link as={Link} to="/donate" className={`nav-custom-link ${isActive('/donate') ? 'nav-custom-link--active' : ''}`}>Donate</Nav.Link>
              )}
            </Nav>

            {/* ── Right section ── */}
            <Nav className="d-flex align-items-center gap-2 flex-wrap py-2 py-lg-0">

              {/* Contact Support */}
              <button className="nav-contact-btn" onClick={() => setShowContactModal(true)}>
                <FiMail size={15} />
                Contact Support
              </button>

              {isAuthenticated ? (
                <>
                  {/* Notifications bell */}
                  <Link to="/notifications" className="nav-action-btn" aria-label="Notifications">
                    <FiBell size={17} className={unreadCount > 0 ? 'bell-pulse' : ''} />
                    {unreadCount > 0 && (
                      <Badge
                        pill bg="danger"
                        className="position-absolute"
                        style={{ fontSize: '0.6rem', top: '-4px', right: '-5px', minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Link>

                  {/* Profile dropdown */}
                  <Dropdown align="end" className="profile-dropdown">
                    <Dropdown.Toggle as="div" className="profile-toggle" id="profile-dd-toggle">
                      <div
                        className="user-avatar"
                        style={{ background: getRoleColor(user?.roleName) }}
                      >
                        {getInitials(user?.name)}
                      </div>
                      <span style={{ fontSize: '0.87rem', fontWeight: 600, maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user?.name?.split(' ')[0]}
                      </span>
                      <FiChevronDown size={14} className="chevron" />
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="profile-menu">
                      {/* Header */}
                      <div className="profile-menu-header">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <div className="user-avatar" style={{ background: getRoleColor(user?.roleName), width: 36, height: 36, fontSize: '0.82rem' }}>
                            {getInitials(user?.name)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1a202c', lineHeight: 1.2 }}>{user?.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#718096' }}>{user?.email}</div>
                          </div>
                        </div>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 10px',
                            borderRadius: '999px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            background: `${getRoleColor(user?.roleName)}18`,
                            color: getRoleColor(user?.roleName),
                            marginTop: 4
                          }}
                        >
                          {user?.roleName}
                        </span>
                      </div>

                      <Dropdown.Item as={Link} to="/profile" className="profile-menu-item">
                        <FiEdit3 size={15} />
                        Edit Profile
                      </Dropdown.Item>
                      <Dropdown.Divider style={{ margin: '4px 0', borderColor: '#f0f4f8' }} />
                      <div className="profile-menu-item danger" onClick={handleLogout}>
                        <FiLogOut size={15} />
                        Sign Out
                      </div>
                    </Dropdown.Menu>
                  </Dropdown>
                </>
              ) : (
                <div className="d-flex gap-2">
                  <Link to="/login"    className="nav-login-btn" style={{ textDecoration: 'none' }}>Sign In</Link>
                  <Link to="/register" className="nav-register-btn" style={{ textDecoration: 'none' }}>Get Started</Link>
                </div>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* ── Contact Support Modal ── */}
      <Modal show={showContactModal} onHide={() => { setShowContactModal(false); setContactError(''); }} centered>
        <Modal.Header closeButton>
          <div className="d-flex align-items-center gap-2">
            <div style={{ background: 'linear-gradient(135deg, #1d3a57, #2c5282)', borderRadius: 8, padding: 8, display: 'flex' }}>
              <FiMail size={16} color="#fff" />
            </div>
            <div>
              <Modal.Title style={{ fontSize: '1rem', fontWeight: 700 }}>Contact Support</Modal.Title>
              <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: 1 }}>Direct emergency support team inquiry</div>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className="contact-modal-form p-4">
          <Form onSubmit={handleContactSubmit}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group controlId="contactName">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control type="text" name="name" value={contactData.name} onChange={handleContactChange} placeholder="Your name" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="contactEmail">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control type="email" name="email" value={contactData.email} onChange={handleContactChange} placeholder="you@example.com" />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group controlId="contactSubject">
                  <Form.Label>Subject</Form.Label>
                  <Form.Control type="text" name="subject" value={contactData.subject} onChange={handleContactChange} placeholder="How can our support team assist?" />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group controlId="contactMessage">
                  <Form.Label>Message</Form.Label>
                  <Form.Control
                    as="textarea" rows={4} name="message"
                    value={contactData.message} onChange={handleContactChange}
                    placeholder="Describe your query or emergency assistance request…"
                    style={{ resize: 'none' }}
                  />
                  <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#a0aec0', marginTop: 4 }}>{contactData.message.length}/1000</div>
                </Form.Group>
              </Col>
            </Row>

            {contactError && (
              <div className="alert alert-danger py-2 small mt-3 mb-0">{contactError}</div>
            )}

            <div className="d-flex gap-2 justify-content-end mt-4">
              <Button variant="light" onClick={() => { setShowContactModal(false); setContactError(''); }} style={{ borderRadius: 8 }}>
                Cancel
              </Button>
              <Button type="submit" className="btn-premium" disabled={contactLoading}>
                {contactLoading ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Sending…</>
                ) : (
                  <><FiMail size={14} className="me-2" />Submit Request</>
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default NavigationBar;
