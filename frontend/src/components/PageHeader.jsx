import React from 'react';

/**
 * PageHeader — Banner with gradient overlay, eyebrow label, title, subtitle, optional image.
 *
 * Props:
 *   label    {string}    — small uppercase eyebrow text (amber)
 *   title    {string}    — main heading
 *   subtitle {string}    — supporting description text
 *   image    {string}    — background image URL (optional)
 *   children {ReactNode} — extra content rendered below subtitle
 */
const PageHeader = ({ label, title, subtitle, image, children }) => {
  return (
    <div
      className="page-header-banner mb-4 fade-in-down"
      style={{ minHeight: 180, position: 'relative' }}
    >
      {image && <img src={image} alt={title} />}
      <div className="content">
        {label && <span className="section-label d-block mb-2">{label}</span>}
        {title && (
          <h1
            className="display-6 fw-bold mb-2 text-light-blue"
            style={{ fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}
          >
            {title}
          </h1>
        )}
        {subtitle && (
          <p style={{ color: 'rgba(255,255,255,0.78)', maxWidth: 580, marginBottom: children ? '1rem' : 0, lineHeight: 1.65 }}>
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  );
};

export default PageHeader;
