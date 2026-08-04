import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { userService, disasterService, campService, taskService, donationService } from '../../services/api';
import { FiUsers, FiAlertCircle, FiHome, FiGrid, FiDollarSign, FiTrendingUp, FiActivity } from 'react-icons/fi';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import StatCard from '../../components/StatCard';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
  const [users, setUsers]       = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [camps, setCamps]       = useState([]);
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [donationStats, setDonationStats] = useState({
    totalDonations: 0,
    donationsPerNgo: [],
    recentTransactions: [],
    failedPayments: [],
  });

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        const [uList, dList, cList, tList] = await Promise.all([
          userService.getAll(),
          disasterService.getAll(),
          campService.getAll(),
          taskService.getAll(),
        ]);
        setUsers(uList);
        setDisasters(dList);
        setCamps(cList);
        setTasks(tList);

        try {
          const stats = await donationService.getAdminStats();
          setDonationStats(stats);
        } catch (e) {
          // Donation stats optional — silently ignore
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Failed to load Admin dashboard:', error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, []);

  const totalUsers      = users.length;
  const activeDisasters = disasters.filter(d => d.status === 'Active').length;
  const totalCamps      = camps.length;
  const activeTasks     = tasks.filter(t => t.status !== 'Completed' && t.status !== 'Cancelled').length;

  /* ── Charts ── */
  const roleChartData = {
    labels: ['Victim', 'Volunteer', 'NGO', 'Officer', 'Admin'],
    datasets: [{
      data: [
        users.filter(u => u.roleName === 'Victim').length,
        users.filter(u => u.roleName === 'Volunteer').length,
        users.filter(u => u.roleName === 'NGO').length,
        users.filter(u => u.roleName === 'Government Officer').length,
        users.filter(u => u.roleName === 'Admin').length,
      ],
      backgroundColor: [
        'rgba(59, 130, 246, 0.7)',
        'rgba(16, 185, 129, 0.7)',
        'rgba(139, 92, 246, 0.7)',
        'rgba(245, 158, 11, 0.7)',
        'rgba(244, 63, 94, 0.7)',
      ],
      borderColor: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#f43f5e'],
      borderWidth: 2,
    }],
  };

  const severityChartData = {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    datasets: [{
      label: 'Incidents',
      data: [
        disasters.filter(d => d.severity === 'Low').length,
        disasters.filter(d => d.severity === 'Medium').length,
        disasters.filter(d => d.severity === 'High').length,
        disasters.filter(d => d.severity === 'Critical').length,
      ],
      backgroundColor: [
        'rgba(16,185,129,0.65)',
        'rgba(59,130,246,0.65)',
        'rgba(245,158,11,0.65)',
        'rgba(244,63,94,0.65)',
      ],
      borderColor: ['#10b981', '#3b82f6', '#f59e0b', '#f43f5e'],
      borderWidth: 2,
      borderRadius: 6,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#4a5568', font: { family: 'Plus Jakarta Sans', size: 12 }, padding: 16 } },
    },
  };

  const barOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#4a5568', stepSize: 1, font: { family: 'Plus Jakarta Sans' } },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#4a5568', font: { family: 'Plus Jakarta Sans' } },
      },
    },
    plugins: { legend: { display: false } },
  };

  const formatCurrency = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (loading) {
    return <LoadingSpinner message="Loading system dashboard…" />;
  }

  return (
    <Container className="py-4 text-start">

      {/* ── Page Header ── */}
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 mb-1">
          <FiActivity size={20} style={{ color: 'var(--accent-amber)' }} />
          <span className="section-label">System Overview</span>
        </div>
        <h2 className="mb-1" style={{ color: 'var(--accent-blue)' }}>Global Admin Dashboard</h2>
        <p className="mb-0" style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Monitor platform-wide metrics, user distribution, and relief coordination activity.
        </p>
      </div>

      {/* ── Quick Stat Cards ── */}
      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <StatCard
            icon={<FiUsers size={22} />}
            iconColor="#3b82f6"
            iconBg="rgba(59,130,246,0.1)"
            label="Registered Users"
            value={totalUsers}
          />
        </Col>
        <Col md={6} lg={3}>
          <StatCard
            icon={<FiAlertCircle size={22} />}
            iconColor="#ef4444"
            iconBg="rgba(239,68,68,0.1)"
            label="Active Incidents"
            value={activeDisasters}
          />
        </Col>
        <Col md={6} lg={3}>
          <StatCard
            icon={<FiHome size={22} />}
            iconColor="#6366f1"
            iconBg="rgba(99,102,241,0.1)"
            label="Active Shelters"
            value={totalCamps}
          />
        </Col>
        <Col md={6} lg={3}>
          <StatCard
            icon={<FiGrid size={22} />}
            iconColor="#f59e0b"
            iconBg="rgba(245,158,11,0.1)"
            label="Pending Tasks"
            value={activeTasks}
          />
        </Col>
      </Row>

      {/* ── Charts ── */}
      <Row className="g-4 mb-4">
        <Col lg={5}>
          <Card className="glass-panel border-0 h-100">
            <Card.Header className="bg-transparent border-0 pt-3 px-4 pb-0">
              <h6 className="fw-bold mb-0" style={{ color: 'var(--accent-blue)', fontSize: '0.92rem' }}>
                User Role Distribution
              </h6>
            </Card.Header>
            <Card.Body className="d-flex justify-content-center align-items-center">
              <div style={{ width: '80%', maxHeight: 240 }}>
                <Doughnut data={roleChartData} options={doughnutOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={7}>
          <Card className="glass-panel border-0 h-100">
            <Card.Header className="bg-transparent border-0 pt-3 px-4 pb-0">
              <h6 className="fw-bold mb-0" style={{ color: 'var(--accent-blue)', fontSize: '0.92rem' }}>
                Incident Severity Breakdown
              </h6>
            </Card.Header>
            <Card.Body>
              {disasters.length === 0 ? (
                <EmptyState
                  icon={<FiAlertCircle size={24} />}
                  title="No Incidents Logged"
                  subtitle="No disaster incidents have been declared yet."
                  compact
                />
              ) : (
                <Bar data={severityChartData} options={barOptions} height={120} />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ── Donation Section ── */}
      <Card className="glass-panel border-0 p-0">
        <Card.Header className="bg-transparent border-0 px-4 pt-4 pb-0">
          <div className="d-flex align-items-center gap-2 mb-1">
            <FiDollarSign size={16} style={{ color: 'var(--accent-amber)' }} />
            <span className="section-label">Financial Overview</span>
          </div>
          <h5 className="fw-bold mb-0" style={{ color: 'var(--accent-blue)' }}>
            Donation Management &amp; Analytics
          </h5>
        </Card.Header>
        <Card.Body className="p-4">

          {/* Totals row */}
          <Row className="g-3 mb-4">
            <Col xs={12} md={4}>
              <div
                className="p-3 rounded-3"
                style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}
              >
                <div className="d-flex align-items-center gap-2 mb-1">
                  <FiTrendingUp size={14} style={{ color: 'var(--accent-amber)' }} />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Total Platform Donations
                  </span>
                </div>
                <h3 className="fw-bold mb-0" style={{ color: 'var(--accent-amber)', fontSize: '1.6rem' }}>
                  {formatCurrency(donationStats.totalDonations)}
                </h3>
              </div>
            </Col>
            <Col xs={12} md={8}>
              <div
                className="p-3 rounded-3 h-100"
                style={{ background: 'rgba(44,82,130,0.04)', border: '1px solid rgba(44,82,130,0.12)' }}
              >
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 10 }}>
                  NGO Contribution Splits
                </span>
                {(!donationStats.donationsPerNgo || donationStats.donationsPerNgo.length === 0) ? (
                  <span className="small" style={{ color: 'var(--text-muted)' }}>No NGO donation data available.</span>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {donationStats.donationsPerNgo.map(entry => (
                      <span
                        key={entry.ngoId}
                        style={{
                          background: 'rgba(44,82,130,0.08)',
                          border: '1px solid rgba(44,82,130,0.18)',
                          borderRadius: 8,
                          padding: '5px 12px',
                          fontSize: '0.82rem',
                          color: 'var(--accent-blue)',
                          fontWeight: 600,
                        }}
                      >
                        {entry.ngoName}: {formatCurrency(entry.totalAmount)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Col>
          </Row>

          {/* Tables */}
          <Row className="g-4">
            <Col xs={12} lg={6}>
              <h6 className="fw-bold mb-3" style={{ color: 'var(--accent-blue)', fontSize: '0.9rem' }}>
                Recent Transactions
              </h6>
              {(!donationStats.recentTransactions || donationStats.recentTransactions.length === 0) ? (
                <EmptyState
                  icon={<FiDollarSign size={22} />}
                  title="No Transactions"
                  subtitle="No donation transactions have been recorded yet."
                  compact
                />
              ) : (
                <div className="table-responsive">
                  <Table className="align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f0f4f8' }}>
                        <th style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Donor</th>
                        <th style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>NGO</th>
                        <th style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Amount</th>
                        <th style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donationStats.recentTransactions.map(tx => (
                        <tr key={tx.id} style={{ borderBottom: '1px solid #f0f4f8' }}>
                          <td className="fw-semibold" style={{ color: 'var(--text-primary)' }}>{tx.donorName}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{tx.ngoName}</td>
                          <td className="fw-bold text-end" style={{ color: 'var(--accent-blue)' }}>
                            {formatCurrency(tx.amount)}
                          </td>
                          <td><StatusBadge status={tx.paymentStatus} dot size="sm" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Col>

            <Col xs={12} lg={6}>
              <h6 className="fw-bold mb-3" style={{ color: 'var(--accent-blue)', fontSize: '0.9rem' }}>
                Failed Payments
              </h6>
              {(!donationStats.failedPayments || donationStats.failedPayments.length === 0) ? (
                <EmptyState
                  icon={<FiDollarSign size={22} />}
                  title="No Failed Payments"
                  subtitle="All payment transactions are successfully processed."
                  compact
                />
              ) : (
                <div className="table-responsive">
                  <Table className="align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f0f4f8' }}>
                        <th style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Donor</th>
                        <th style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>NGO</th>
                        <th style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Amount</th>
                        <th style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Order ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donationStats.failedPayments.map(tx => (
                        <tr key={tx.id} style={{ borderBottom: '1px solid #f0f4f8' }}>
                          <td className="fw-semibold" style={{ color: 'var(--text-primary)' }}>{tx.donorName}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{tx.ngoName}</td>
                          <td className="fw-bold text-end" style={{ color: '#c53030' }}>
                            {formatCurrency(tx.amount)}
                          </td>
                          <td className="font-monospace" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{tx.orderId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminDashboard;
