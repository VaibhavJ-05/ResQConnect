import React from 'react';

/**
 * SectionTitle — Consistent section heading with eyebrow label, title, divider, and subtitle.
 *
 * Props:
 *   label    {string}  — small uppercase amber eyebrow text
 *   title    {string}  — main heading
 *   subtitle {string}  — optional supporting text below title
 *   align    {string}  — 'left' | 'center' (default: 'left')
 *   divider  {boolean} — show the gradient divider (default: true)
 *   className{string}  — extra classes on wrapper
 */
const SectionTitle = ({
  label,
  title,
  subtitle,
  align = 'left',
  divider = true,
  className = '',
}) => {
  const textAlign = align === 'center' ? 'text-center' : 'text-start';

  return (
    <div className={`mb-4 ${textAlign} ${className}`}>
      {label && (
        <span className="section-label d-block mb-1">{label}</span>
      )}
      {title && (
        <h2
          className="fw-bold mb-2"
          style={{
            color: 'var(--accent-blue)',
            fontFamily: 'var(--font-heading)',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
          }}
        >
          {title}
        </h2>
      )}
      {divider && (
        <div
          className="section-divider"
          style={{
            width: align === 'center' ? 64 : 48,
            margin: align === 'center' ? '12px auto 0' : '10px 0 0',
            height: 3,
          }}
        />
      )}
      {subtitle && (
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            lineHeight: 1.65,
            maxWidth: align === 'center' ? 520 : '100%',
            margin: align === 'center' ? '10px auto 0' : '10px 0 0',
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionTitle;
