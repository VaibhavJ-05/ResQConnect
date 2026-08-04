import React, { useState, useEffect } from 'react';
import { Container, Card, Button, ListGroup, Badge } from 'react-bootstrap';
import { notificationService } from '../services/api';
import { toast } from 'react-toastify';
import { FiBell, FiCheckSquare, FiClock, FiAlertCircle, FiCheck } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);

  /* ── data fetching ── */
  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('Unable to fetch notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  /* ── handlers ── */
  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      toast.success('Notification marked as read.');
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read.');
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch {
      toast.error('Failed to update notifications.');
    }
  };

  /* ── helpers ── */
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date    = new Date(dateString);
    const istDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const now     = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const diffMs  = now - istDate;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr  = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr  / 24);

    if (diffMin < 1)  return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr  < 24) return `${diffHr}h ago`;
    if (diffDay < 7)  return `${diffDay}d ago`;
    return istDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Container className="py-5 text-start">

      {/* ── Page Header ── */}
      <div
        className="page-header-banner mb-4 shadow-sm fade-in-down"
        style={{ minHeight: 160 }}
      >
        <img src="/images/flood_3.jpeg" alt="alerts background" />
        <div className="content w-100 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <span className="section-label d-block mb-2">Alerts Center</span>
            <div className="d-flex align-items-center gap-3 mb-1">
              <h2 className="mb-0" style={{ color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                Notifications
              </h2>
              {unreadCount > 0 && (
                <Badge
                  pill
                  style={{ background: '#ef4444', fontSize: '0.75rem', padding: '4px 10px', fontWeight: 700 }}
                >
                  {unreadCount} New
                </Badge>
              )}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.72)', marginBottom: 0, fontSize: '0.88rem' }}>
              Stay updated on relief operations and emergency broadcast declarations.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              className="btn-premium d-flex align-items-center gap-2 flex-shrink-0"
            >
              <FiCheckSquare size={15} /> Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <LoadingSpinner message="Loading your notifications…" />
      ) : notifications.length === 0 ? (
        <Card className="glass-panel border-0">
          <Card.Body>
            <EmptyState
              icon={<FiBell size={28} />}
              title="All Clear!"
              subtitle="You have no notification logs. You'll see emergency alerts and relief updates here when they arrive."
            />
          </Card.Body>
        </Card>
      ) : (
        <Card className="glass-panel border-0 overflow-hidden fade-in-up">
          {/* Summary strip */}
          <div
            className="px-4 py-3 d-flex align-items-center justify-content-between"
            style={{ borderBottom: '1px solid #f0f4f8', background: '#fafbfd' }}
          >
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {notifications.length} total &nbsp;·&nbsp;
              <span style={{ color: 'var(--accent-indigo)' }}>{unreadCount} unread</span>
            </span>
            {unreadCount === 0 && (
              <span className="d-flex align-items-center gap-1" style={{ fontSize: '0.8rem', color: '#22543d', fontWeight: 600 }}>
                <FiCheck size={14} /> All caught up
              </span>
            )}
          </div>

          <ListGroup variant="flush" className="bg-transparent">
            {notifications.map((n, idx) => (
              <ListGroup.Item
                key={n.id}
                className="py-3 px-4 d-flex align-items-start gap-3"
                style={{
                  backgroundColor: !n.isRead ? 'rgba(44,82,130,0.03)' : '#ffffff',
                  borderBottom: '1px solid #f0f4f8',
                  borderLeft: !n.isRead ? '3px solid var(--accent-indigo)' : '3px solid transparent',
                  transition: 'all 0.2s ease',
                  cursor: 'default',
                  animation: `fade-in-up 0.4s ${idx * 0.04}s both`,
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = !n.isRead ? 'rgba(44,82,130,0.06)' : '#f7fafc'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = !n.isRead ? 'rgba(44,82,130,0.03)' : '#ffffff'; }}
              >
                {/* Icon */}
                <div
                  className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0 mt-1"
                  style={{
                    width: 38,
                    height: 38,
                    background: !n.isRead ? 'rgba(44,82,130,0.1)' : '#f0f4f8',
                    color: !n.isRead ? 'var(--accent-indigo)' : 'var(--text-muted)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <FiAlertCircle size={17} />
                </div>

                {/* Body */}
                <div className="flex-grow-1 min-w-0">
                  <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                    <h6
                      className="mb-0 fw-bold"
                      style={{ color: !n.isRead ? 'var(--accent-blue)' : 'var(--text-secondary)', fontSize: '0.9rem' }}
                    >
                      {n.title}
                    </h6>
                    {!n.isRead && (
                      <span style={{
                        background: 'rgba(44,82,130,0.1)',
                        color: 'var(--accent-indigo)',
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 999,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}>
                        New
                      </span>
                    )}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.855rem', marginBottom: 6, lineHeight: 1.55 }}>
                    {n.message}
                  </p>
                  <div className="d-flex align-items-center gap-1" style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>
                    <FiClock size={11} />
                    <span>{formatTime(n.createdAt)}</span>
                  </div>
                </div>

                {/* Mark-read button */}
                {!n.isRead && (
                  <Button
                    size="sm"
                    variant="link"
                    onClick={() => handleMarkAsRead(n.id)}
                    className="text-decoration-none p-0 align-self-center flex-shrink-0"
                    style={{ color: 'var(--accent-indigo)', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}
                  >
                    Mark read
                  </Button>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card>
      )}
    </Container>
  );
};

export default Notifications;
