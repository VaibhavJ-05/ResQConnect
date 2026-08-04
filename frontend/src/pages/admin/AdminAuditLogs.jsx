import React, { useState } from 'react';
import { Container, Card, Table, Form } from 'react-bootstrap';
import { FiSearch, FiActivity, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import EmptyState from '../../components/EmptyState';

/* Audit log seed data */
const AUDIT_LOGS = [
  { id: 1, timestamp: '2026-06-28 14:10:15', user: 'admin@resqconnect.com',   action: 'SYSTEM_INIT',        description: 'Platform roles and access levels initialized.', status: 'SUCCESS' },
  { id: 2, timestamp: '2026-06-28 14:15:30', user: 'admin@resqconnect.com',   action: 'USER_LOGIN',          description: 'Admin user authenticated from authorized IP.', status: 'SUCCESS' },
  { id: 3, timestamp: '2026-06-28 14:22:12', user: 'officer@gov.org',          action: 'DISASTER_CREATE',     description: 'Declared active incident: Flood Advisory Sector 4.', status: 'SUCCESS' },
  { id: 4, timestamp: '2026-06-28 14:25:40', user: 'ngo@redcross.org',         action: 'CAMP_CREATE',         description: 'Created Relief Camp Alpha with capacity 500.', status: 'SUCCESS' },
  { id: 5, timestamp: '2026-06-28 14:28:10', user: 'volunteer1@mail.com',      action: 'VOLUNTEER_REGISTER',  description: 'Volunteer profile registered: General Assistance.', status: 'SUCCESS' },
  { id: 6, timestamp: '2026-06-28 14:31:05', user: 'victim@resilience.net',    action: 'SOS_RAISE',           description: 'Distress call raised from Sector 4 coordinates.', status: 'SUCCESS' },
  { id: 7, timestamp: '2026-06-28 14:35:50', user: 'ngo@redcross.org',         action: 'RESOURCE_ADD',        description: 'Added 500 Liters of Bottled Water to Camp Alpha.', status: 'SUCCESS' },
  { id: 8, timestamp: '2026-06-28 14:39:15', user: 'admin@resqconnect.com',    action: 'USER_UPDATE',         description: 'Volunteer account verification status updated to Verified.', status: 'SUCCESS' },
  { id: 9, timestamp: '2026-06-28 14:45:20', user: 'officer@gov.org',          action: 'ANNOUNCEMENT_SEND',   description: 'Emergency advisory broadcast to Sector 4 residents.', status: 'SUCCESS' },
  { id: 10, timestamp: '2026-06-28 15:00:00', user: 'ngo@redcross.org',        action: 'SOS_ASSIGN',          description: 'SOS request #6 assigned to volunteer team.', status: 'SUCCESS' },
];

const ACTION_COLOR = {
  SUCCESS: { bg: 'rgba(16,185,129,0.09)', color: '#065f46', icon: <FiCheckCircle size={12} /> },
  FAILED:  { bg: 'rgba(197,48,48,0.09)',  color: '#9b2c2c', icon: <FiXCircle size={12} /> },
};

const AdminAuditLogs = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = [...AUDIT_LOGS]
    .reverse()
    .filter(l =>
      l.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <Container className="py-4 text-start">

      {/* ── Page Header ── */}
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 mb-1">
          <FiActivity size={16} style={{ color: 'var(--accent-amber)' }} />
          <span className="section-label">Security &amp; Compliance</span>
        </div>
        <h2 className="mb-1">Audit Log Center</h2>
        <p className="mb-0" style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Review platform activity, access events, and system operations history.
        </p>
      </div>

      {/* ── Search ── */}
      <div className="position-relative mb-4" style={{ maxWidth: 400 }}>
        <FiSearch
          style={{ position: 'absolute', top: '50%', left: 14, transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
          size={16}
        />
        <Form.Control
          type="text"
          placeholder="Filter by user, action or description…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="form-glass ps-5"
          aria-label="Search audit logs"
          style={{ height: 42 }}
        />
      </div>

      {/* ── Table ── */}
      {filteredLogs.length === 0 ? (
        <Card className="glass-panel border-0">
          <Card.Body>
            <EmptyState
              icon={<FiSearch size={24} />}
              title="No Matching Logs"
              subtitle={`No audit entries match "${searchQuery}". Try a different keyword.`}
              compact
            />
          </Card.Body>
        </Card>
      ) : (
        <Card className="glass-panel border-0 p-0 overflow-hidden">
          <div className="table-responsive">
            <Table className="align-middle mb-0" style={{ fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  {['Timestamp', 'Operator', 'Action', 'Description', 'Status'].map(h => (
                    <th
                      key={h}
                      style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '12px 16px' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(l => {
                  const sc = ACTION_COLOR[l.status] || ACTION_COLOR.SUCCESS;
                  return (
                    <tr
                      key={l.id}
                      style={{ borderBottom: '1px solid #f0f4f8', transition: 'background 0.15s ease' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '11px 16px', color: 'var(--text-muted)', fontSize: '0.75rem', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                        {l.timestamp}
                      </td>
                      <td style={{ padding: '11px 16px', color: 'var(--accent-blue)', fontWeight: 600, fontSize: '0.82rem' }}>
                        {l.user}
                      </td>
                      <td style={{ padding: '11px 16px' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: 'rgba(44,82,130,0.07)',
                            color: 'var(--accent-indigo)',
                            padding: '3px 8px',
                            borderRadius: 5,
                            letterSpacing: '0.04em',
                          }}
                        >
                          {l.action}
                        </span>
                      </td>
                      <td style={{ padding: '11px 16px', color: 'var(--text-secondary)', maxWidth: 340 }}>{l.description}</td>
                      <td style={{ padding: '11px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            background: sc.bg,
                            color: sc.color,
                            padding: '3px 10px',
                            borderRadius: 999,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {sc.icon}
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
          <div
            style={{
              padding: '10px 16px',
              borderTop: '1px solid #f0f4f8',
              background: '#fafbfd',
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
            }}
          >
            Showing {filteredLogs.length} of {AUDIT_LOGS.length} log entries
          </div>
        </Card>
      )}
    </Container>
  );
};

export default AdminAuditLogs;
