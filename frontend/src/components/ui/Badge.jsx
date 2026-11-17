import './Badge.css';

const VARIANT_MAP = {
  active: 'badge-success',
  available: 'badge-success',
  pending: 'badge-warning',
  processing: 'badge-info',
  completed: 'badge-muted',
  cancelled: 'badge-danger',
  rejected: 'badge-danger',
  inactive: 'badge-muted',
  draft: 'badge-muted',
  published: 'badge-success',
  sold: 'badge-info',
  expired: 'badge-danger',
};

export function Badge({ children, variant, status, size = 'sm', dot = false, className = '' }) {
  const resolvedVariant = status ? VARIANT_MAP[status.toLowerCase()] || 'badge-muted' : `badge-${variant || 'muted'}`;
  return (
    <span className={`badge ${resolvedVariant} badge-${size} ${className}`}>
      {dot && <span className="badge-dot" aria-hidden="true" />}
      {children || status}
    </span>
  );
}

export function StatusBadge({ status }) {
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : '—';
  return <Badge status={status} dot>{label}</Badge>;
}
