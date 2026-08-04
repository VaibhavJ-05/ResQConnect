import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Card, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { donationService } from '../services/api';
import { toast } from 'react-toastify';
import { FiClock, FiHeart, FiUser, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';

const DonationHistory = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const data = await donationService.getMyDonations();
      setDonations(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch donation history:', err);
      toast.error('Failed to load donation history.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <Container className="py-5 text-center min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading history...</span>
        </div>
      </Container>
    );
  }

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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold d-flex align-items-center" style={{ color: 'var(--accent-blue)', fontFamily: 'var(--font-heading)' }}>
          <FiClock className="me-2 text-primary" />
          My Donation History
        </h2>
        <Button as={Link} to="/donate" className="btn-premium-outline d-flex align-items-center py-2">
          <FiHeart className="me-1" /> Donate Again
        </Button>
      </div>

      {donations.length === 0 ? (
        <Alert variant="info" className="border-info">
          <FiAlertTriangle className="me-2" size={20} />
          You haven't made any donations yet. Support emergency relief by making your first donation!
          <div className="mt-3">
            <Button as={Link} to="/donate" className="btn-premium py-2">
              Make a Donation
            </Button>
          </div>
        </Alert>
      ) : (
        <Card className="glass-panel border-0 shadow-lg fade-in-up" style={{ borderRadius: '15px' }}>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0 align-middle">
                <thead className="bg-light text-secondary uppercase small">
                  <tr>
                    <th className="py-3 ps-4 border-0">Transaction Date</th>
                    <th className="py-3 border-0">NGO Recipient</th>
                    <th className="py-3 text-end border-0">Amount</th>
                    <th className="py-3 border-0">Razorpay Payment ID</th>
                    <th className="py-3 border-0">Anonymity</th>
                    <th className="py-3 border-0">Status</th>
                    <th className="py-3 pe-4 border-0">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((donation) => (
                    <tr key={donation.id} className="border-top border-light">
                      <td className="py-3 ps-4 text-muted small">{formatDateTime(donation.createdAt)}</td>
                      <td className="py-3 fw-semibold text-primary">{donation.ngoName}</td>
                      <td className="py-3 text-end fw-bold text-dark">₹{donation.amount.toFixed(2)}</td>
                      <td className="py-3 text-muted small font-monospace">{donation.paymentId || 'N/A'}</td>
                      <td className="py-3">
                        {donation.anonymous ? (
                          <Badge bg="secondary">Anonymous</Badge>
                        ) : (
                          <Badge bg="info">Public</Badge>
                        )}
                      </td>
                      <td className="py-3">
                        <Badge
                          bg={
                            donation.paymentStatus === 'SUCCESS'
                              ? 'success'
                              : donation.paymentStatus === 'PENDING'
                              ? 'warning'
                              : 'danger'
                          }
                          text={donation.paymentStatus === 'PENDING' ? 'dark' : 'white'}
                          className="px-2 py-1.5"
                        >
                          {donation.paymentStatus}
                        </Badge>
                      </td>
                      <td className="py-3 pe-4 text-muted small text-truncate" style={{ maxWidth: '150px' }} title={donation.message}>
                        {donation.message || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default DonationHistory;
