import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { FiHeart, FiCalendar, FiMessageSquare } from 'react-icons/fi';

const DonationCard = ({ donation }) => {
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A';
    const date = new Date(dateTimeStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Card className="glass-panel border-0 mb-3 shadow-sm" style={{ borderRadius: '12px' }}>
      <Card.Body className="d-flex flex-column gap-2 p-3">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <FiHeart className="text-danger" size={20} />
            <h5 className="mb-0 fw-bold text-primary" style={{ fontFamily: 'var(--font-heading)' }}>{donation.ngoName}</h5>
          </div>
          <span className="fw-bold fs-5 text-dark">₹{donation.amount.toFixed(2)}</span>
        </div>

        <div className="d-flex flex-wrap gap-2 align-items-center text-muted small mt-1">
          <span className="d-flex align-items-center gap-1 text-secondary">
            <FiCalendar size={14} />
            {formatDateTime(donation.createdAt)}
          </span>
          <span>•</span>
          <span>
            {donation.anonymous ? (
              <Badge bg="secondary" className="px-2 py-1">Anonymous</Badge>
            ) : (
              <Badge bg="info" className="px-2 py-1">Public</Badge>
            )}
          </span>
          <span>•</span>
          <span>
            <Badge
              bg={donation.paymentStatus === 'SUCCESS' ? 'success' : 'danger'}
              className="px-2 py-1"
            >
              {donation.paymentStatus}
            </Badge>
          </span>
        </div>

        {donation.message && (
          <div className="mt-2 p-2 bg-light rounded small text-secondary fst-italic">
            <FiMessageSquare className="me-1 text-muted" size={14} />
            "{donation.message}"
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default DonationCard;
