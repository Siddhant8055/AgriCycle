import './EmptyState.css';

/**
 * EmptyState — reusable empty / zero-results illustration with CTA.
 *
 * Usage:
 *   <EmptyState
 *     icon="📋"
 *     title="No listings found"
 *     description="Try adjusting your filters, or add a new listing."
 *     action={<Button>Add Listing</Button>}
 *   />
 */
export function EmptyState({
  icon = '📭',
  title = 'Nothing here yet',
  description,
  action,
  size = 'md',
  className = '',
}) {
  return (
    <div className={`empty-state empty-state-${size} ${className}`}>
      <div className="empty-state-icon" aria-hidden="true">{icon}</div>
      <div className="empty-state-body">
        <h3 className="empty-state-title">{title}</h3>
        {description && <p className="empty-state-desc">{description}</p>}
      </div>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
