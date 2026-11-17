import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import './PageHeader.css';

/**
 * PageHeader — consistent page-level header with optional breadcrumb + actions.
 *
 * Usage:
 *   <PageHeader
 *     title="My Listings"
 *     subtitle="Manage and track all your crop residue listings"
 *     breadcrumbs={[{ label: 'Dashboard', to: '/farmer/dashboard' }, { label: 'Listings' }]}
 *     actions={<Button>…</Button>}
 *   />
 */
export function PageHeader({ title, subtitle, breadcrumbs, actions, className = '' }) {
  return (
    <div className={`page-header ${className}`}>
      {/* Breadcrumb */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="page-breadcrumb" aria-label="Breadcrumb">
          <ol className="page-breadcrumb-list">
            {breadcrumbs.map((crumb, i) => {
              const isLast = i === breadcrumbs.length - 1;
              return (
                <li key={i} className="page-breadcrumb-item">
                  {!isLast && crumb.to ? (
                    <Link to={crumb.to} className="page-breadcrumb-link">{crumb.label}</Link>
                  ) : (
                    <span className={`page-breadcrumb-current ${isLast ? 'active' : ''}`} aria-current={isLast ? 'page' : undefined}>
                      {crumb.label}
                    </span>
                  )}
                  {!isLast && <ChevronRight size={12} className="page-breadcrumb-sep" aria-hidden />}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {/* Title row */}
      <div className="page-header-row">
        <div className="page-header-text">
          <h1 className="page-header-title">{title}</h1>
          {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="page-header-actions">{actions}</div>}
      </div>
    </div>
  );
}
