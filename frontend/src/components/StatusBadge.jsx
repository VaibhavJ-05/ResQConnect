import React from 'react';

/**
 * StatusBadge — Unified status pill component matching the design system.
 *
 * Props:
 *   status  {string}  — e.g. 'Active', 'Resolved', 'Pending', 'Cancelled', etc.
 *   dot     {boolean} — show status dot before text
 *   size    {string}  — 'sm' | 'md'
 */

const STATUS_MAP = {
  // Disaster statuses
  'Active':     { cls: 'badge-status-active',     dot: 'status-dot-red'   },
  'Contained':  { cls: 'badge-status-contained',  dot: 'status-dot-amber' },
  'Closed':     { cls: 'badge-status-closed',      dot: 'status-dot-green' },

  // SOS statuses
  'Pending':    { cls: 'badge-status-pending',    dot: 'status-dot-amber' },
  'Dispatched': { cls: 'badge-status-dispatched', dot: 'status-dot-blue'  },
  'Resolved':   { cls: 'badge-status-resolved',   dot: 'status-dot-green' },
  'Cancelled':  { cls: 'badge-status-cancelled',  dot: 'status-dot-gray'  },

  // Payment statuses
  'SUCCESS':    { cls: 'badge-status-closed',     dot: 'status-dot-green' },
  'PENDING':    { cls: 'badge-status-pending',    dot: 'status-dot-amber' },
  'FAILED':     { cls: 'badge-status-active',     dot: 'status-dot-red'   },

  // Volunteer verification
  'Verified':   { cls: 'badge-status-closed',     dot: 'status-dot-green' },
  'Unverified': { cls: 'badge-status-pending',    dot: 'status-dot-amber' },
  'Rejected':   { cls: 'badge-status-active',     dot: 'status-dot-red'   },
};

const StatusBadge = ({ status, dot = true, size = 'md' }) => {
  const config = STATUS_MAP[status] || { cls: 'badge-status-cancelled', dot: 'status-dot-gray' };
  const fontSize = size === 'sm' ? '0.68rem' : '0.73rem';
  const padding  = size === 'sm' ? '3px 9px'  : '5px 12px';

  return (
    <span
      className={`badge-status ${config.cls}`}
      style={{ fontSize, padding }}
    >
      {dot && (
        <span
          className={`status-dot ${config.dot}`}
          style={{ width: size === 'sm' ? 6 : 7, height: size === 'sm' ? 6 : 7 }}
        />
      )}
      {status}
    </span>
  );
};

export default StatusBadge;
