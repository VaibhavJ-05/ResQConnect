import React from 'react';

/**
 * LoadingSpinner — Full-page centered branded spinner.
 *
 * Props:
 *   message {string}  — optional loading message
 *   size    {string}  — 'sm' | 'md' | 'lg'
 *   inline  {boolean} — compact inline variant (no full-height wrapper)
 */
const LoadingSpinner = ({ message = 'Loading…', size = 'md', inline = false }) => {
  const spinnerSize = { sm: 24, md: 36, lg: 52 }[size] || 36;
  const borderWidth = { sm: 2, md: 3, lg: 4 }[size] || 3;

  if (inline) {
    return (
      <div className="d-flex align-items-center gap-2 text-secondary fade-in">
        <div
          className="spinner-border"
          style={{
            width: spinnerSize,
            height: spinnerSize,
            borderWidth,
            color: 'var(--accent-indigo)',
          }}
          role="status"
        >
          <span className="visually-hidden">Loading…</span>
        </div>
        {message && <span style={{ fontSize: '0.87rem' }}>{message}</span>}
      </div>
    );
  }

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center fade-in"
      style={{ minHeight: '60vh', gap: 16 }}
    >
      {/* Outer ring */}
      <div style={{ position: 'relative', width: spinnerSize + 16, height: spinnerSize + 16 }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `${borderWidth}px solid rgba(29,58,87,0.08)`,
          }}
        />
        <div
          className="spinner-border"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            borderWidth,
            color: 'var(--accent-indigo)',
          }}
          role="status"
        >
          <span className="visually-hidden">{message}</span>
        </div>
      </div>

      {message && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 500, margin: 0 }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
