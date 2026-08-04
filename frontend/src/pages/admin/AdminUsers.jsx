import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { userService } from '../../services/api';
import { toast } from 'react-toastify';
import { FiUsers, FiEdit2, FiTrash2, FiSearch, FiActivity } from 'react-icons/fi';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';

/* Role → label mapping */
const ROLE_LABEL = {
  Victim: 'Victim',
  Volunteer: 'Volunteer',
  NGO: 'NGO',
  'Government Officer': 'Gov. Officer',
  Admin: 'Admin',
};

const ROLE_COLOR = {
  Admin:              { bg: 'rgba(244,63,94,0.1)',   color: '#be123c' },
  NGO:                { bg: 'rgba(139,92,246,0.1)',  color: '#7c3aed' },
  'Government Officer': { bg: 'rgba(59,130,246,0.1)', color: '#1d4ed8' },
  Volunteer:          { bg: 'rgba(16,185,129,0.1)',  color: '#065f46' },
  Victim:             { bg: 'rgba(245,158,11,0.1)',  color: '#92400e' },
};

const RolePill = ({ role }) => {
  const c = ROLE_COLOR[role] || { bg: '#f0f4f8', color: '#4a5568' };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: '0.73rem',
        fontWeight: 700,
        background: c.bg,
        color: c.color,
        letterSpacing: '0.02em',
      }}
    >
      {ROLE_LABEL[role] || role}
    </span>
  );
};

const AdminUsers = () => {
  const [users,           setUsers]           = useState([]);
  const [filtered,        setFiltered]        = useState([]);
  const [search,          setSearch]          = useState('');
  const [loading,         setLoading]         = useState(true);
  const [showModal,       setShowModal]       = useState(false);
  const [selectedUser,    setSelectedUser]    = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete,    setUserToDelete]    = useState(null);
  const [saving,          setSaving]          = useState(false);

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', roleId: '1' });

  /* ── fetch ── */
  const fetchUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
      setFiltered(data);
    } catch {
      toast.error('Unable to fetch user registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  /* ── search filter ── */
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q ? users.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.roleName?.toLowerCase().includes(q)
      ) : users
    );
  }, [search, users]);

  /* ── handlers ── */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email, phone: user.phone, roleId: user.roleId.toString() });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone, roleId } = formData;
    if (!name || !email || !phone || !roleId) { toast.error('Please complete all fields.'); return; }
    setSaving(true);
    try {
      const updated = await userService.update(selectedUser.id, { name, email, phone, roleId: parseInt(roleId) });
      toast.success('User updated successfully.');
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u));
      setShowModal(false);
    } catch {
      toast.error('Failed to update user.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await userService.delete(userToDelete.id);
      toast.success('User account removed.');
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch {
      toast.error('Failed to remove user.');
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(new Date(iso).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
      .toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) return <LoadingSpinner message="Loading user registry…" />;

  return (
    <Container className="py-4 text-start">

      {/* ── Page Header ── */}
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 mb-1">
          <FiActivity size={16} style={{ color: 'var(--accent-amber)' }} />
          <span className="section-label">Administration</span>
        </div>
        <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
          <div>
            <h2 className="mb-1">User Management</h2>
            <p className="mb-0" style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Review, edit, and manage all registered platform users and their roles.
            </p>
          </div>
          <div className="text-end">
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {filtered.length} of {users.length} users
            </span>
          </div>
        </div>
      </div>

      {/* ── Search bar ── */}
      <div className="position-relative mb-4" style={{ maxWidth: 360 }}>
        <FiSearch
          style={{ position: 'absolute', top: '50%', left: 14, transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
          size={16}
        />
        <input
          type="text"
          className="form-glass ps-5"
          placeholder="Search by name, email or role…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', height: 42 }}
          aria-label="Search users"
        />
      </div>

      {/* ── Table ── */}
      {filtered.length === 0 ? (
        <Card className="glass-panel border-0">
          <Card.Body>
            <EmptyState
              icon={<FiUsers size={26} />}
              title={search ? 'No Matching Users' : 'No Users Found'}
              subtitle={search ? `No users match "${search}". Try a different search term.` : 'No registered users in the system yet.'}
            />
          </Card.Body>
        </Card>
      ) : (
        <Card className="glass-panel border-0 p-0 overflow-hidden">
          <div className="table-responsive">
            <Table className="align-middle mb-0" style={{ fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '12px 16px' }}>Name</th>
                  <th style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '12px 16px' }}>Email</th>
                  <th style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '12px 16px' }}>Phone</th>
                  <th style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '12px 16px' }}>Role</th>
                  <th style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '12px 16px' }}>Joined</th>
                  <th style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '12px 16px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr
                    key={u.id}
                    style={{ borderBottom: '1px solid #f0f4f8' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="fw-semibold" style={{ padding: '12px 16px', color: 'var(--accent-blue)' }}>{u.name}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{u.phone || '—'}</td>
                    <td style={{ padding: '12px 16px' }}><RolePill role={u.roleName} /></td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>{formatDate(u.createdAt)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleOpenEdit(u)}
                          className="d-flex align-items-center gap-1"
                          style={{
                            background: 'rgba(44,82,130,0.08)',
                            border: '1px solid rgba(44,82,130,0.2)',
                            color: 'var(--accent-blue)',
                            borderRadius: 7,
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            padding: '4px 10px',
                          }}
                        >
                          <FiEdit2 size={12} /> Edit
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => { setUserToDelete(u); setShowDeleteModal(true); }}
                          disabled={u.roleName === 'Admin' && users.filter(a => a.roleName === 'Admin').length === 1}
                          className="d-flex align-items-center gap-1"
                          style={{
                            background: 'rgba(197,48,48,0.07)',
                            border: '1px solid rgba(197,48,48,0.2)',
                            color: '#c53030',
                            borderRadius: 7,
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            padding: '4px 10px',
                          }}
                        >
                          <FiTrash2 size={12} /> Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>
      )}

      {/* ── Edit User Modal ── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton style={{ borderBottom: '1px solid #f0f4f8' }}>
          <Modal.Title style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
            Edit User
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="editUserName">
              <Form.Label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</Form.Label>
              <Form.Control type="text" name="name" value={formData.name} onChange={handleInputChange} className="form-glass" required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="editUserEmail">
              <Form.Label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</Form.Label>
              <Form.Control type="email" name="email" value={formData.email} onChange={handleInputChange} className="form-glass" required />
            </Form.Group>
            <Row className="mb-4 g-3">
              <Col md={6}>
                <Form.Group controlId="editUserPhone">
                  <Form.Label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Phone Number</Form.Label>
                  <Form.Control type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="form-glass" required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="editUserRole">
                  <Form.Label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Role</Form.Label>
                  <Form.Select name="roleId" value={formData.roleId} onChange={handleInputChange} className="form-glass" required>
                    <option value="1">Victim</option>
                    <option value="2">Volunteer</option>
                    <option value="3">NGO</option>
                    <option value="4">Government Officer</option>
                    <option value="5">Admin</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="light" onClick={() => setShowModal(false)} style={{ borderRadius: 8 }}>Cancel</Button>
              <Button type="submit" className="btn-premium" disabled={saving}>
                {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : 'Save Changes'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* ── Delete Confirmation Modal ── */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Header closeButton style={{ borderBottom: '1px solid #f0f4f8' }}>
          <Modal.Title style={{ fontSize: '1rem', fontWeight: 700, color: '#c53030' }}>Remove User</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Are you sure you want to remove <strong style={{ color: 'var(--accent-blue)' }}>{userToDelete?.name}</strong> ({userToDelete?.email})?
          </p>
          <p className="mb-0" style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            All associated records will be permanently removed. This action cannot be undone.
          </p>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="light" onClick={() => setShowDeleteModal(false)} style={{ borderRadius: 8 }}>Cancel</Button>
            <Button
              onClick={handleDelete}
              style={{ background: '#c53030', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, padding: '8px 18px' }}
            >
              Remove Account
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdminUsers;
