import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Row, Col, Container, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { authService, donationService } from '../services/api';
import { toast } from 'react-toastify';
import { FiDollarSign, FiHeart, FiMessageSquare, FiUserCheck, FiShield, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import { normalizeAmount, sanitizeText, REGEX } from '../utils/validation';

const DonationPage = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [ngos,          setNgos]          = useState([]);
  const [selectedNgoId, setSelectedNgoId] = useState('');
  const [amount,        setAmount]        = useState('');
  const [message,       setMessage]       = useState('');
  const [anonymous,     setAnonymous]     = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [pageLoading,   setPageLoading]   = useState(true);
  const [fieldErrors,   setFieldErrors]   = useState({});

  const amountRef = useRef(null);
  const ngoRef    = useRef(null);

  useEffect(() => {
    const fetchNGOs = async () => {
      try {
        const ngoList = await authService.getNGOsPublic();
        const availableNgos = ngoList.filter(ngo => ngo.id !== user?.id);
        setNgos(availableNgos);
        setPageLoading(false);
      } catch (err) {
        console.error('Failed to load NGOs:', err);
        toast.error('Could not load NGOs list. Please reload.');
        setPageLoading(false);
      }
    };
    fetchNGOs();
  }, [user]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleAmountChange = (e) => {
    const val = normalizeAmount(e.target.value);
    setAmount(val);
    if (fieldErrors.amount) setFieldErrors(p => ({ ...p, amount: '' }));
  };

  const handleNgoChange = (e) => {
    setSelectedNgoId(e.target.value);
    if (fieldErrors.selectedNgoId) setFieldErrors(p => ({ ...p, selectedNgoId: '' }));
  };

  const validateForm = () => {
    const errors = {};
    const numAmount = parseFloat(amount);

    if (!selectedNgoId) {
      errors.selectedNgoId = 'Please select an NGO partner to support.';
    }

    if (!amount || isNaN(numAmount)) {
      errors.amount = 'Please enter a valid donation amount.';
    } else if (numAmount < 1.0) {
      errors.amount = 'Minimum donation amount is ₹1.00.';
    } else if (numAmount > 1000000.0) {
      errors.amount = 'Maximum donation limit per transaction is ₹10,00,000.00.';
    } else if (!REGEX.AMOUNT.test(amount)) {
      errors.amount = 'Donation amount cannot have more than 2 decimal places.';
    }

    if (message && !REGEX.NO_HTML.test(message)) {
      errors.message = 'Message cannot contain HTML tags or scripts.';
    }

    return errors;
  };

  const handleDonateSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      if (errors.selectedNgoId && ngoRef.current) ngoRef.current.focus();
      else if (errors.amount && amountRef.current) amountRef.current.focus();
      return;
    }

    setLoading(true);

    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      toast.error('Razorpay Payment Gateway failed to load. Check your connection.');
      setLoading(false);
      return;
    }

    try {
      const cleanMessage = sanitizeText(message);
      const orderResponse = await donationService.createOrder({
        amount: parseFloat(amount),
        ngoId: parseInt(selectedNgoId),
        message: cleanMessage,
        anonymous,
      });

      const options = {
        key: orderResponse.key,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: 'ResQConnect Relief Fund',
        description: `Relief Donation to ${ngos.find(n => n.id === parseInt(selectedNgoId))?.name || 'NGO'}`,
        order_id: orderResponse.orderId,
        handler: async (response) => {
          setLoading(true);
          try {
            const result = await donationService.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success('Donation processed and verified successfully!');
            navigate('/donations/success', { state: { donation: result } });
          } catch (err) {
            console.error('Signature verification failed:', err);
            toast.error(err.response?.data?.message || 'Payment verification failed.');
            navigate('/donations/failed', { state: { message: 'Cryptographic verification failed on server. Please contact support.' } });
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: anonymous ? 'Anonymous Donor' : (user?.name || ''),
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: { color: '#1d3a57' },
        modal: {
          ondismiss: () => {
            toast.info('Donation process cancelled.');
            setLoading(false);
          },
        },
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.open();

    } catch (err) {
      console.error('Order creation failed:', err);
      toast.error(err.response?.data?.message || 'Failed to initiate order. Try again.');
      setLoading(false);
    }
  };

  if (pageLoading) return <LoadingSpinner message="Loading donation portal…" />;

  return (
    <Container className="py-5 text-start">

      {/* ── Banner ── */}
      <div className="page-header-banner mb-4 shadow-sm" style={{ minHeight: 160 }}>
        <img src="/images/flood_5.jpeg" alt="Relief Fund" />
        <div className="content w-100 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <span className="section-label d-block mb-1">Emergency Relief Fund</span>
            <h2 className="mb-1" style={{ color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
              Make a Direct Relief Contribution
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 0, fontSize: '0.88rem' }}>
              Your financial support powers emergency food distribution, medical supplies, and shelter operations.
            </p>
          </div>
        </div>
      </div>

      <Row className="g-4 justify-content-center">
        <Col md={8} lg={7}>
          <Card className="glass-panel border-0 p-4">
            <Card.Body>

              <Form onSubmit={handleDonateSubmit} noValidate>

                {/* Select NGO */}
                <Form.Group className="mb-4" controlId="donationNgo">
                  <Form.Label style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Select NGO Partner <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    ref={ngoRef}
                    value={selectedNgoId}
                    onChange={handleNgoChange}
                    className={`form-glass ${fieldErrors.selectedNgoId ? 'is-invalid' : ''}`}
                    required
                  >
                    <option value="">Choose an NGO partner to support…</option>
                    {ngos.map(ngo => (
                      <option key={ngo.id} value={ngo.id}>{ngo.name}</option>
                    ))}
                  </Form.Select>
                  {fieldErrors.selectedNgoId && (
                    <div className="text-danger small mt-1" style={{ fontSize: '0.75rem' }}>{fieldErrors.selectedNgoId}</div>
                  )}
                </Form.Group>

                {/* Amount */}
                <Form.Group className="mb-4" controlId="donationAmount">
                  <Form.Label style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Donation Amount (INR ₹) <span className="text-danger">*</span>
                  </Form.Label>
                  <div className="position-relative">
                    <span
                      style={{
                        position: 'absolute', top: '50%', left: 14, transform: 'translateY(-50%)',
                        color: 'var(--accent-indigo)', fontWeight: 700, pointerEvents: 'none', zIndex: 5
                      }}
                    >
                      ₹
                    </span>
                    <Form.Control
                      ref={amountRef}
                      type="text"
                      inputMode="decimal"
                      placeholder="500.00"
                      value={amount}
                      onChange={handleAmountChange}
                      className={`form-glass ps-4 ${fieldErrors.amount ? 'is-invalid' : ''}`}
                      required
                    />
                  </div>
                  {fieldErrors.amount ? (
                    <div className="text-danger small mt-1" style={{ fontSize: '0.75rem' }}>{fieldErrors.amount}</div>
                  ) : (
                    <div className="text-muted small mt-1" style={{ fontSize: '0.72rem' }}>Min ₹1.00 · Max ₹10,00,000.00 · Up to 2 decimal places</div>
                  )}

                  {/* Preset Quick Amount Chips */}
                  <div className="d-flex gap-2 mt-2 flex-wrap">
                    {['500', '1000', '2500', '5000', '10000'].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => { setAmount(preset); setFieldErrors(p => ({ ...p, amount: '' })); }}
                        style={{
                          background: amount === preset ? 'rgba(44,82,130,0.12)' : '#f8fafc',
                          border: `1px solid ${amount === preset ? 'var(--accent-indigo)' : '#cbd5e0'}`,
                          color: amount === preset ? 'var(--accent-indigo)' : 'var(--text-secondary)',
                          borderRadius: 8,
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          padding: '4px 12px',
                          cursor: 'pointer',
                          transition: 'all 0.18s ease',
                        }}
                      >
                        +₹{Number(preset).toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                </Form.Group>

                {/* Message (Optional) */}
                <Form.Group className="mb-4" controlId="donationMessage">
                  <Form.Label style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Message to Response Team (Optional)
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Words of encouragement or allocation preference…"
                    value={message}
                    onChange={e => { setMessage(e.target.value); if (fieldErrors.message) setFieldErrors(p => ({ ...p, message: '' })); }}
                    className={`form-glass ${fieldErrors.message ? 'is-invalid' : ''}`}
                    maxLength={500}
                    style={{ resize: 'none' }}
                  />
                  {fieldErrors.message ? (
                    <div className="text-danger small mt-1" style={{ fontSize: '0.75rem' }}>{fieldErrors.message}</div>
                  ) : (
                    <div className="text-end text-muted small mt-1" style={{ fontSize: '0.72rem' }}>{message.length}/500</div>
                  )}
                </Form.Group>

                {/* Anonymous Checkbox */}
                <Form.Group className="mb-4" controlId="donationAnonymous">
                  <Form.Check
                    type="checkbox"
                    label={
                      <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                        Make this donation anonymous (hide name on public receipts)
                      </span>
                    }
                    checked={anonymous}
                    onChange={e => setAnonymous(e.target.checked)}
                  />
                </Form.Group>

                {/* Submit button */}
                <Button
                  type="submit"
                  className="btn-premium w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm" /> Initializing Payment Gateway…</>
                  ) : (
                    <><FiShield size={16} /> Proceed to Secure Payment <FiArrowRight size={16} /></>
                  )}
                </Button>

                <div className="text-center mt-3 text-muted" style={{ fontSize: '0.78rem' }}>
                  <FiShield size={13} className="me-1" color="#10b981" />
                  Protected by 256-bit SSL Cryptographic Verification &amp; Razorpay Gateway
                </div>

              </Form>

            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DonationPage;
