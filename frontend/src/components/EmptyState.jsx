import React from 'react';

/**
 * EmptyState — Illustrated empty state with icon, title, subtitle, optional CTA.
 *
 * Props:
 *   icon     {ReactNode} — icon element
 *   title    {string}    — heading text
 *   subtitle {string}    — supporting description
 *   action   {ReactNode} — optional CTA button/link
 *   compact  {boolean}   — smaller padding variant
 */
const EmptyState = ({ icon, title, subtitle, action, compact = false }) => {
  return (
    <div
      className={`text-center d-flex flex-column align-items-center justify-content-center fade-in ${compact ? 'py-4' : 'py-5'}`}
      style={{ minHeight: compact ? 160 : 260 }}
    >
      {icon && (
        <div
          style={{
            width: compact ? 56 : 72,
            height: compact ? 56 : 72,
            borderRadius: '50%',
            background: 'rgba(29,58,87,0.06)',
            border: '1.5px dashed rgba(29,58,87,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            color: 'var(--text-muted)',
          }}
        >
          {icon}
        </div>
      )}

      {title && (
        <h5
          style={{
            color: 'var(--accent-blue)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            marginBottom: 6,
            fontSize: compact ? '1rem' : '1.15rem',
          }}
        >
          {title}
        </h5>
      )}

      {subtitle && (
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.87rem',
            maxWidth: 320,
            lineHeight: 1.6,
            marginBottom: action ? 20 : 0,
          }}
        >
          {subtitle}
        </p>
      )}

      {action}
    </div>
  );
};

export default EmptyState;
