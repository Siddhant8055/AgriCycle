import { Leaf, Sprout, Recycle, TrendingUp } from 'lucide-react';
import './AuthLayout.css';

const FEATURES = [
  { icon: Sprout, text: 'AI-powered crop waste identification' },
  { icon: TrendingUp, text: 'Net value recommendations for residues' },
  { icon: Recycle, text: 'Connect with buyers across Maharashtra' },
];

export function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="auth-layout">
      {/* Brand Panel */}
      <div className="auth-brand" aria-hidden="true">
        <div className="auth-brand-content">
          {/* Logo */}
          <div className="auth-brand-logo">
            <div className="auth-brand-icon">
              <Leaf size={28} />
            </div>
            <div>
              <span className="auth-brand-name">AgriCycle</span>
              <span className="auth-brand-tagline">Crop Waste Marketplace</span>
            </div>
          </div>

          {/* Hero visual */}
          <div className="auth-brand-hero">
            <div className="auth-brand-circle auth-brand-circle-1" />
            <div className="auth-brand-circle auth-brand-circle-2" />
            <div className="auth-brand-circle auth-brand-circle-3" />
            <div className="auth-brand-illustration">
              <div className="auth-field-icon">🌾</div>
              <div className="auth-field-glow" />
            </div>
          </div>

          {/* Value prop */}
          <div className="auth-brand-copy">
            <h2 className="auth-brand-headline">
              Turn Crop Waste into<br />Sustainable Revenue
            </h2>
            <p className="auth-brand-body">
              Join farmers and buyers across Kolhapur &amp; Sangli districts
              leveraging AI to valorize agricultural residues.
            </p>
          </div>

          {/* Feature list */}
          <ul className="auth-brand-features">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="auth-brand-feature">
                <span className="auth-brand-feature-icon">
                  <Icon size={15} />
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>

          {/* Stats bar */}
          <div className="auth-brand-stats" aria-label="Demo status">
            <div className="auth-stat">
              <span className="auth-stat-value">Demo</span>
              <span className="auth-stat-label">Prototype</span>
            </div>
            <div className="auth-stat-divider" />
            <div className="auth-stat">
              <span className="auth-stat-value">Sample</span>
              <span className="auth-stat-label">Listings</span>
            </div>
            <div className="auth-stat-divider" />
            <div className="auth-stat">
              <span className="auth-stat-value">No live</span>
              <span className="auth-stat-label">Transactions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <div className="auth-form-header">
            {title && <h1 className="auth-form-title">{title}</h1>}
            {subtitle && <p className="auth-form-subtitle">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
