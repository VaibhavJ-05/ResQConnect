import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Container, Card, Button, Table } from 'react-bootstrap';
import { FiCheckCircle, FiArrowLeft, FiList } from 'react-icons/fi';

const DonationSuccess = () => {
  const location = useLocation();
  const donation = location.state?.donation;

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A';
    const date = new Date(dateTimeStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-center">
        <Card className="glass-panel border-0 text-center p-4 shadow-lg fade-in-up" style={{ borderRadius: '15px', maxWidth: '500px', width: '100%' }}>
          <Card.Body>
            <FiCheckCircle className="text-success mb-3" size={70} />
            <h2 className="fw-bold text-success mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Thank You!</h2>
            <h4 className="fw-semibold text-secondary mb-4">Donation Successful</h4>
            <p className="text-muted mb-4">Your support helps NGOs deliver emergency aid directly to the disaster relief fields.</p>

            {donation ? (
              <div className="border border-secondary border-opacity-10 rounded p-3 mb-4 bg-light text-start">
                <h6 className="fw-bold text-primary border-bottom border-light pb-2 mb-3">Transaction Receipt</h6>
                <Table borderless size="sm" className="mb-0 text-secondary align-middle">
                  <tbody>
                    <tr>
                      <td className="text-muted ps-0">Recipient NGO:</td>
                      <td className="fw-semibold text-dark text-end">{donation.ngoName}</td>
                    </tr>
                    <tr>
                      <td className="text-muted ps-0">Donor Name:</td>
                      <td className="fw-semibold text-dark text-end">{donation.donorName}</td>
                    </tr>
                    <tr>
                      <td className="text-muted ps-0">Amount Paid:</td>
                      <td className="fw-bold text-success text-end">₹{donation.amount.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="text-muted ps-0">Payment ID:</td>
                      <td className="text-muted text-end small font-monospace">{donation.paymentId}</td>
                    </tr>
                    <tr>
                      <td className="text-muted ps-0">Order ID:</td>
                      <td className="text-muted text-end small font-monospace">{donation.orderId}</td>
                    </tr>
                    <tr>
                      <td className="text-muted ps-0">Date:</td>
                      <td className="text-muted text-end small">{formatDateTime(donation.createdAt)}</td>
                    </tr>
                    {donation.message && (
                      <tr>
                        <td className="text-muted ps-0" colSpan={2}>
                          <div className="mt-2 text-muted small fst-italic border-top border-light pt-2">
                            "{donation.message}"
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            ) : (
              <p className="text-muted small">No receipt details found.</p>
            )}

            <div className="d-flex gap-3 justify-content-center">
              <Button as={Link} to="/donate" className="btn-premium-outline w-50 py-2 d-flex align-items-center justify-content-center">
                <FiArrowLeft className="me-1" /> Donate More
              </Button>
              <Button as={Link} to="/donations/history" className="btn-premium w-50 py-2 d-flex align-items-center justify-content-center">
                <FiList className="me-1" /> View History
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default DonationSuccess;
