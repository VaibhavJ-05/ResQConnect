import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiActivity, FiEye, FiEyeOff, FiAlertCircle, FiArrowRight } from 'react-icons/fi';

const Login = () => {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();

  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/';
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) { setError('Please provide both email and password.'); return; }
    if (!emailPattern.test(trimmedEmail)) { setError('Please enter a valid email address.'); return; }

    setLoading(true);
    setError('');

    try {
      const loggedUser = await login({ email: trimmedEmail, password });
      toast.success(`Welcome back, ${loggedUser.name}! 🎉`);

      if (from === '/') {
        const routes = {
          'Victim':             '/victim/dashboard',
          'Volunteer':          '/volunteer/dashboard',
          'NGO':                '/ngo/dashboard',
          'Government Officer': '/gov/dashboard',
          'Admin':              '/admin/dashboard',
        };
        navigate(routes[loggedUser.roleName] || '/');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please verify your credentials.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .login-card-entry {
          animation: scale-in 0.45s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        .login-input-group {
          position: relative;
        }
        .login-input-icon {
          position: absolute;
          top: 50%;
          left: 14px;
          transform: translateY(-50%);
          color: #a0aec0;
          pointer-events: none;
          z-index: 5;
          transition: color 0.2s ease;
        }
        .login-input-group:focus-within .login-input-icon {
          color: #2c5282;
        }
        .login-input {
          padding-left: 42px !important;
        }
        .login-panel-overlay {
          background: linear-gradient(to top, rgba(9,18,33,0.88) 0%, rgba(9,18,33,0.4) 50%, transparent 100%);
        }
        .btn-login-submit {
          background: linear-gradient(135deg, #1d3a57 0%, #2c5282 100%) !important;
          color: #ffffff !important;
          border: none !important;
          font-weight: 700 !important;
          border-radius: 10px !important;
          padding: 12px !important;
          font-size: 0.95rem !important;
          letter-spacing: 0.02em !important;
          transition: all 0.25s ease !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;
        }
        .btn-login-submit:hover:not(:disabled) {
          transform: translateY(-2px) !important;
          box-shadow: 0 10px 28px rgba(29,58,87,0.35) !important;
          filter: brightness(1.08) !important;
        }
        .btn-login-submit:disabled {
          opacity: 0.7 !important;
        }
        .divider-or {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #a0aec0;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin: 4px 0;
        }
        .divider-or::before, .divider-or::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }
        .feature-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 999px;
          color: rgba(255,255,255,0.82);
          font-size: 0.75rem;
          font-weight: 500;
          backdrop-filter: blur(4px);
        }
      `}</style>

      <Container className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '80vh' }}>
        <Card className="glass-panel w-100 border-0 p-0 login-card-entry" style={{ maxWidth: 860, overflow: 'hidden' }}>
          <Row className="g-0">

            {/* ── Left image panel ── */}
            <Col md={5} className="d-none d-md-block position-relative" style={{ minHeight: 520 }}>
              <img
                src="/images/login_sidebar.png"
                alt="Emergency Response"
                className="w-100 h-100"
                style={{ objectFit: 'cover' }}
              />
              <div className="position-absolute top-0 start-0 w-100 h-100 login-panel-overlay" />

              {/* Overlay content */}
              <div className="position-absolute bottom-0 start-0 w-100 p-4">
                <div className="mb-3">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <div style={{ background: 'linear-gradient(135deg, #b7791f, #f59e0b)', borderRadius: 8, padding: '5px 6px', display: 'flex' }}>
                      <FiActivity size={16} color="#fff" />
                    </div>
                    <span style={{ color: '#ffffff', fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: '1.05rem' }}>
                      ResQ<span style={{ color: '#f59e0b' }}>Connect</span>
                    </span>
                  </div>
                  <h5 className="fw-bold mb-1" style={{ color: '#ffffff', lineHeight: 1.25 }}>
                    Relief Coordination Portal
                  </h5>
                  <p className="small mb-3" style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                    Verified platform access for emergency operations and relief management.
                  </p>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {['Role-Based Access', '24/7 Active', 'Enterprise Security'].map(tag => (
                    <span key={tag} className="feature-chip">
                      <FiActivity size={11} />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Col>

            {/* ── Right form panel ── */}
            <Col md={7} className="p-4 p-md-5 d-flex align-items-center">
              <div className="w-100">

                {/* Logo (mobile) */}
                <div className="d-flex d-md-none align-items-center gap-2 mb-4">
                  <div style={{ background: 'linear-gradient(135deg, #b7791f, #f59e0b)', borderRadius: 8, padding: '5px 6px', display: 'flex' }}>
                    <FiActivity size={16} color="#fff" />
                  </div>
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: '1rem', color: 'var(--accent-blue)' }}>
                    ResQ<span style={{ color: '#b7791f' }}>Connect</span>
                  </span>
                </div>

                {/* Heading */}
                <div className="mb-5">
                  <h2 className="fw-bold mb-1" style={{ color: 'var(--accent-blue)', fontSize: '1.7rem', letterSpacing: '-0.03em' }}>
                    Sign In
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                    Access your relief response portal
                  </p>
                </div>

                {/* Error alert */}
                {error && (
                  <Alert variant="danger" className="d-flex align-items-center gap-2 py-2 small mb-4" style={{ borderRadius: 10 }}>
                    <FiAlertCircle size={16} className="flex-shrink-0" />
                    <span>{error}</span>
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>

                  {/* Email */}
                  <Form.Group className="mb-4" controlId="loginEmail">
                    <Form.Label>Email Address</Form.Label>
                    <div className="login-input-group">
                      <FiMail className="login-input-icon" size={16} />
                      <Form.Control
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="form-glass login-input"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </Form.Group>

                  {/* Password */}
                  <Form.Group className="mb-5" controlId="loginPassword">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <Form.Label className="mb-0">Password</Form.Label>
                      <span style={{ fontSize: '0.78rem', color: 'var(--accent-indigo)', cursor: 'pointer', fontWeight: 500 }}>
                        Reset Password
                      </span>
                    </div>
                    <div className="login-input-group">
                      <FiLock className="login-input-icon" size={16} />
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="form-glass login-input"
                        style={{ paddingRight: 44 }}
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(p => !p)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                      </button>
                    </div>
                  </Form.Group>

                  {/* Submit button */}
                  <Button
                    type="submit"
                    className="btn-login-submit w-100 mb-4"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" style={{ width: 16, height: 16, borderWidth: 2 }} />
                        Authenticating…
                      </>
                    ) : (
                      <>Sign In <FiArrowRight size={16} /></>
                    )}
                  </Button>

                  <div className="divider-or">or</div>

                  {/* Register link */}
                  <div className="text-center mt-4" style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: 'var(--accent-indigo)', fontWeight: 600, textDecoration: 'none' }}>
                      Get Started
                    </Link>
                  </div>
                </Form>
              </div>
            </Col>
          </Row>
        </Card>
      </Container>
    </>
  );
};

export default Login;
