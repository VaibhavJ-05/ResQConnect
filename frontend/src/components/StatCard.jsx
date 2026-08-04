import React from 'react';

/**
 * StatCard — Premium statistics card with icon, value, label, and optional trend.
 *
 * Props:
 *   icon      {ReactNode}           — icon element
 *   iconColor {string}              — hex color for icon
 *   iconBg    {string}              — background color for icon box
 *   value     {string|number}       — primary metric value
 *   label     {string}              — metric name
 *   trend     {string}              — optional trend label e.g. "+12% this week"
 *   trendUp   {boolean}             — green if true, red if false
 *   accent    {boolean}             — show top gradient bar
 *   className {string}              — extra class names
 */
const StatCard = ({
  icon,
  iconColor = 'var(--accent-blue)',
  iconBg    = 'rgba(29,58,87,0.08)',
  value,
  label,
  trend,
  trendUp,
  accent = true,
  className = '',
}) => {
  return (
    <div className={`stat-card p-4 ${className}`}>
      <div className="d-flex align-items-start justify-content-between">
        <div className="flex-grow-1">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            {label}
          </div>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: 'var(--accent-blue)',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
            }}
          >
            {value}
          </div>
          {trend && (
            <div
              style={{
                marginTop: 6,
                fontSize: '0.75rem',
                fontWeight: 600,
                color: trendUp ? '#22543d' : '#9b2c2c',
                background: trendUp ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                padding: '2px 8px',
                borderRadius: 999,
              }}
            >
              {trendUp ? '↑' : '↓'} {trend}
            </div>
          )}
        </div>

        {icon && (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: iconBg,
              color: iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
