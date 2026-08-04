import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Container, Card, Button } from 'react-bootstrap';
import { FiXCircle, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';

const DonationFailed = () => {
  const location = useLocation();
  const errorMessage = location.state?.message || 'The transaction was cancelled or rejected by the payment gateway.';

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-center">
        <Card className="glass-panel border-0 text-center p-4 shadow-lg fade-in-up" style={{ borderRadius: '15px', maxWidth: '500px', width: '100%' }}>
          <Card.Body>
            <FiXCircle className="text-danger mb-3" size={70} />
            <h2 className="fw-bold text-danger mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Payment Failed</h2>
            <p className="text-muted mb-4">We were unable to process your donation transaction at this time.</p>

            <div className="border border-danger border-opacity-10 rounded p-3 mb-4 bg-light text-start">
              <h6 className="fw-bold text-danger border-bottom border-light pb-2 mb-2">Error Details</h6>
              <p className="text-muted small mb-0 font-monospace">{errorMessage}</p>
            </div>

            <p className="text-muted small mb-4">No money has been debited. If amount was debited, it will be automatically refunded by Razorpay within 3-5 business days.</p>

            <div className="d-flex gap-3 justify-content-center">
              <Button as={Link} to="/" className="btn-premium-outline w-50 py-2 d-flex align-items-center justify-content-center">
                <FiArrowLeft className="me-1" /> Home
              </Button>
              <Button as={Link} to="/donate" className="btn-premium w-50 py-2 d-flex align-items-center justify-content-center">
                <FiRefreshCw className="me-1" /> Retry Payment
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default DonationFailed;
