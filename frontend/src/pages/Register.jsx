import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiLock, FiSettings, FiActivity, FiEye, FiEyeOff, FiCheck, FiX, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import { authService } from '../services/api';
import { REGEX, normalizePhone, normalizeName, evaluatePasswordStrength } from '../utils/validation';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    roleId: 1,
    assignedNgoId: '',
  });

  const [ngos,                setNgos]                = useState([]);
  const [error,               setError]               = useState('');
  const [fieldErrors,         setFieldErrors]         = useState({});
  const [loading,             setLoading]             = useState(false);
  const [showPassword,        setShowPassword]        = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Field refs for auto-focus
  const fieldRefs = {
    name:            useRef(null),
    email:           useRef(null),
    phone:           useRef(null),
    password:        useRef(null),
    confirmPassword: useRef(null),
  };

  useEffect(() => {
    const loadNgos = async () => {
      try {
        const data = await authService.getNGOsPublic();
        setNgos(data);
      } catch (err) {
        console.error('Failed to load NGOs:', err);
      }
    };
    loadNgos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'phone') {
      finalValue = normalizePhone(value);
    } else if (name === 'name') {
      finalValue = value; // Keep typed value, validate on submit/blur
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'roleId' || name === 'assignedNgoId'
        ? (value === '' ? '' : parseInt(value))
        : finalValue,
    }));

    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const trimmedName  = formData.name.trim();
    const trimmedEmail = formData.email.trim();
    const cleanPhone   = formData.phone.trim();

    if (!trimmedName) {
      errors.name = 'Name is required.';
    } else if (trimmedName.length < 2 || trimmedName.length > 50) {
      errors.name = 'Name must be between 2 and 50 characters.';
    } else if (!REGEX.NAME.test(trimmedName)) {
      errors.name = 'Name can only contain alphabets and single spaces.';
    }

    if (!trimmedEmail) {
      errors.email = 'Please enter a valid email address.';
    } else if (!REGEX.EMAIL.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address (e.g. name@domain.com).';
    }

    if (!cleanPhone) {
      errors.phone = 'Enter a valid Indian mobile number.';
    } else if (!REGEX.INDIAN_PHONE.test(cleanPhone)) {
      errors.phone = 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.';
    }

    const pwdStrength = evaluatePasswordStrength(formData.password);
    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (!REGEX.PASSWORD.test(formData.password)) {
      errors.password = 'Password must meet all 5 security requirements below.';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Number(formData.roleId) === 2 && !formData.assignedNgoId) {
      errors.assignedNgoId = 'Please select an NGO to work under.';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstErrorField = Object.keys(errors)[0];
      if (fieldRefs[firstErrorField]?.current) {
        fieldRefs[firstErrorField].current.focus();
      }
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        roleId: formData.roleId,
        assignedNGOId: formData.assignedNgoId || null,
      };

      await register(payload);
      toast.success('Account created successfully! Welcome to ResQConnect 🎉');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your details.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const pwdAnalysis = evaluatePasswordStrength(formData.password);

  return (
    <>
      <style>{`
        .register-card-entry {
          animation: scale-in 0.45s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        .form-glass-input {
          padding-left: 42px !important;
        }
        .form-input-group {
          position: relative;
        }
        .form-input-icon {
          position: absolute;
          top: 50%;
          left: 14px;
          transform: translateY(-50%);
          color: #a0aec0;
          pointer-events: none;
          z-index: 5;
          transition: color 0.2s ease;
        }
        .form-input-group:focus-within .form-input-icon {
          color: #2c5282;
        }
        .is-invalid-input {
          border-color: #ef4444 !important;
          box-shadow: 0 0 0 3px rgba(239,68,68,0.15) !important;
        }
        .strength-bar-bg {
          height: 6px;
          border-radius: 999px;
          background: #e2e8f0;
          overflow: hidden;
        }
        .strength-bar-fill {
          height: 100%;
          transition: width 0.3s ease, background-color 0.3s ease;
        }
        .req-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          padding: 2px 7px;
          border-radius: 999px;
          font-weight: 600;
        }
      `}</style>

      <Container className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '90vh' }}>
        <Card className="glass-panel w-100 border-0 p-0 register-card-entry" style={{ maxWidth: 860, overflow: 'hidden' }}>
          <Row className="g-0">

            {/* ── Left Sidebar ── */}
            <Col md={5} className="d-none d-md-block position-relative" style={{ minHeight: 640 }}>
              <img
                src="/images/home_page_hint.jpeg"
                alt="Relief Network"
                className="w-100 h-100"
                style={{ objectFit: 'cover' }}
              />
              <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(to top, rgba(9,18,33,0.9) 0%, rgba(9,18,33,0.45) 100%)' }} />

              <div className="position-absolute bottom-0 start-0 w-100 p-4 text-start">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div style={{ background: 'linear-gradient(135deg, #b7791f, #f59e0b)', borderRadius: 8, padding: '5px 6px', display: 'flex' }}>
                    <FiActivity size={16} color="#fff" />
                  </div>
                  <span style={{ color: '#ffffff', fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: '1.05rem' }}>
                    ResQ<span style={{ color: '#f59e0b' }}>Connect</span>
                  </span>
                </div>
                <h5 className="fw-bold mb-1" style={{ color: '#ffffff', lineHeight: 1.25 }}>
                  Join the Relief Response Network
                </h5>
                <p className="small mb-3" style={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.6 }}>
                  Verified access for Victims, Volunteers, NGOs, and Government Officers.
                </p>

                <div className="d-flex flex-wrap gap-2">
                  {['Role-Based Access', 'Encrypted Profiles', '24/7 Response'].map(tag => (
                    <span key={tag} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 999, color: '#fff', fontSize: '0.73rem' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Col>

            {/* ── Form Panel ── */}
            <Col md={7} className="p-4 p-md-5 d-flex align-items-center text-start">
              <div className="w-100">

                <div className="mb-4">
                  <span className="section-label d-block mb-1">Account Creation</span>
                  <h2 className="fw-bold mb-1" style={{ color: 'var(--accent-blue)', fontSize: '1.6rem', letterSpacing: '-0.03em' }}>
                    Get Started
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                    Create your account to join the disaster relief network
                  </p>
                </div>

                {error && (
                  <Alert variant="danger" className="d-flex align-items-center gap-2 py-2 small mb-4" style={{ borderRadius: 10 }}>
                    <FiAlertCircle size={16} className="flex-shrink-0" />
                    <span>{error}</span>
                  </Alert>
                )}

                <Form onSubmit={handleSubmit} noValidate>

                  {/* Full Name */}
                  <Form.Group className="mb-3" controlId="regName">
                    <Form.Label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</Form.Label>
                    <div className="form-input-group">
                      <FiUser className="form-input-icon" size={16} />
                      <Form.Control
                        ref={fieldRefs.name}
                        type="text"
                        name="name"
                        placeholder="Aarav Sharma"
                        value={formData.name}
                        onChange={handleChange}
                        className={`form-glass form-glass-input ${fieldErrors.name ? 'is-invalid-input' : ''}`}
                        autoComplete="name"
                        required
                      />
                    </div>
                    {fieldErrors.name && (
                      <div className="text-danger small mt-1" style={{ fontSize: '0.75rem' }}>{fieldErrors.name}</div>
                    )}
                  </Form.Group>

                  {/* Email */}
                  <Form.Group className="mb-3" controlId="regEmail">
                    <Form.Label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</Form.Label>
                    <div className="form-input-group">
                      <FiMail className="form-input-icon" size={16} />
                      <Form.Control
                        ref={fieldRefs.email}
                        type="email"
                        name="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={`form-glass form-glass-input ${fieldErrors.email ? 'is-invalid-input' : ''}`}
                        autoComplete="email"
                        required
                      />
                    </div>
                    {fieldErrors.email && (
                      <div className="text-danger small mt-1" style={{ fontSize: '0.75rem' }}>{fieldErrors.email}</div>
                    )}
                  </Form.Group>

                  {/* Phone & Role */}
                  <Row className="g-3 mb-3">
                    <Col md={6}>
                      <Form.Group controlId="regPhone">
                        <Form.Label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Phone Number</Form.Label>
                        <div className="form-input-group">
                          <FiPhone className="form-input-icon" size={16} />
                          <Form.Control
                            ref={fieldRefs.phone}
                            type="tel"
                            name="phone"
                            placeholder="9876543210"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`form-glass form-glass-input ${fieldErrors.phone ? 'is-invalid-input' : ''}`}
                            maxLength={10}
                            required
                          />
                        </div>
                        {fieldErrors.phone ? (
                          <div className="text-danger small mt-1" style={{ fontSize: '0.75rem' }}>{fieldErrors.phone}</div>
                        ) : (
                          <div className="text-muted small mt-1" style={{ fontSize: '0.72rem' }}>Auto-normalizes to 10 digits</div>
                        )}
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="regRole">
                        <Form.Label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Account Role</Form.Label>
                        <div className="form-input-group">
                          <FiSettings className="form-input-icon" size={16} />
                          <Form.Select
                            name="roleId"
                            value={formData.roleId}
                            onChange={handleChange}
                            className="form-glass form-glass-input"
                            required
                          >
                            <option value={1}>Victim / Resident</option>
                            <option value={2}>Volunteer Responder</option>
                            <option value={3}>NGO Officer</option>
                            <option value={4}>Government Officer</option>
                          </Form.Select>
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Volunteer NGO Dropdown */}
                  {Number(formData.roleId) === 2 && (
                    <Form.Group className="mb-3" controlId="regNgo">
                      <Form.Label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Assign NGO Partner</Form.Label>
                      <Form.Select
                        name="assignedNgoId"
                        value={formData.assignedNgoId}
                        onChange={handleChange}
                        className={`form-glass ${fieldErrors.assignedNgoId ? 'is-invalid-input' : ''}`}
                        required
                      >
                        <option value="">Select NGO Partner…</option>
                        {ngos.map((ngo) => (
                          <option key={ngo.id} value={ngo.id}>{ngo.name}</option>
                        ))}
                      </Form.Select>
                      {fieldErrors.assignedNgoId && (
                        <div className="text-danger small mt-1" style={{ fontSize: '0.75rem' }}>{fieldErrors.assignedNgoId}</div>
                      )}
                    </Form.Group>
                  )}

                  {/* Password & Confirm Password */}
                  <Row className="g-3 mb-3">
                    <Col md={6}>
                      <Form.Group controlId="regPassword">
                        <Form.Label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Password</Form.Label>
                        <div className="form-input-group">
                          <FiLock className="form-input-icon" size={16} />
                          <Form.Control
                            ref={fieldRefs.password}
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`form-glass form-glass-input ${fieldErrors.password ? 'is-invalid-input' : ''}`}
                            style={{ paddingRight: 40 }}
                            autoComplete="new-password"
                            required
                          />
                          <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(p => !p)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                          </button>
                        </div>
                        {fieldErrors.password && (
                          <div className="text-danger small mt-1" style={{ fontSize: '0.75rem' }}>{fieldErrors.password}</div>
                        )}
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="regConfirmPassword">
                        <Form.Label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Confirm Password</Form.Label>
                        <div className="form-input-group">
                          <FiLock className="form-input-icon" size={16} />
                          <Form.Control
                            ref={fieldRefs.confirmPassword}
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            placeholder="Confirm"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`form-glass form-glass-input ${fieldErrors.confirmPassword ? 'is-invalid-input' : ''}`}
                            style={{ paddingRight: 40 }}
                            autoComplete="new-password"
                            required
                          />
                          <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowConfirmPassword(p => !p)}
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          >
                            {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                          </button>
                        </div>
                        {fieldErrors.confirmPassword && (
                          <div className="text-danger small mt-1" style={{ fontSize: '0.75rem' }}>{fieldErrors.confirmPassword}</div>
                        )}
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Password Strength Meter */}
                  {formData.password.length > 0 && (
                    <div className="p-3 mb-4 rounded-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '0.78rem' }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Password Strength</span>
                        <span style={{ color: pwdAnalysis.color, fontWeight: 700 }}>{pwdAnalysis.label}</span>
                      </div>
                      <div className="strength-bar-bg mb-2">
                        <div className="strength-bar-fill" style={{ width: `${pwdAnalysis.percentage}%`, backgroundColor: pwdAnalysis.color }} />
                      </div>

                      <div className="d-flex flex-wrap gap-1 mt-2">
                        {[
                          { key: 'length', text: '8-32 Chars' },
                          { key: 'hasUpper', text: '1 Uppercase (A-Z)' },
                          { key: 'hasLower', text: '1 Lowercase (a-z)' },
                          { key: 'hasDigit', text: '1 Digit (0-9)' },
                          { key: 'hasSpecial', text: '1 Special Char (@$!%*)' },
                        ].map((req) => {
                          const met = pwdAnalysis.checks[req.key];
                          return (
                            <span
                              key={req.key}
                              className="req-chip"
                              style={{
                                background: met ? 'rgba(16,185,129,0.1)' : '#f1f5f9',
                                color: met ? '#065f46' : '#94a3b8',
                                border: `1px solid ${met ? 'rgba(16,185,129,0.2)' : '#cbd5e0'}`,
                              }}
                            >
                              {met ? <FiCheck size={11} /> : <FiX size={11} />}
                              {req.text}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Submit button */}
                  <Button type="submit" className="btn-premium w-100 py-2.5 fw-bold mb-3 d-flex align-items-center justify-content-center gap-2" disabled={loading}>
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm" /> Creating Account…</>
                    ) : (
                      <>Get Started <FiArrowRight size={16} /></>
                    )}
                  </Button>
                </Form>

                <div className="text-center mt-3" style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  Already have an account?{' '}
                  <Link to="/login" style={{ color: 'var(--accent-indigo)', fontWeight: 600, textDecoration: 'none' }}>
                    Sign In
                  </Link>
                </div>

              </div>
            </Col>
          </Row>
        </Card>
      </Container>
    </>
  );
};

export default Register;
