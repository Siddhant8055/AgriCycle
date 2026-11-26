import './Card.css';

export function Card({ children, className = '', padding = 'md', hover = false, onClick }) {
  return (
    <div
      className={`card card-pad-${padding} ${hover ? 'card-hover' : ''} ${onClick ? 'card-clickable' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick(e) : undefined}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`card-header ${className}`}>
      <div>
        {title && <h3 className="card-title">{title}</h3>}
        {subtitle && <p className="card-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="card-header-action">{action}</div>}
    </div>
  );
}

export function StatCard({ label, value, icon, trend, trendLabel, color = 'green', className = '' }) {
  return (
    <Card className={`stat-card stat-card-${color} ${className}`}>
      <div className="stat-card-inner">
        <div className="stat-card-content">
          <p className="stat-label">{label}</p>
          <p className="stat-value">{value}</p>
          {(trend !== undefined || trendLabel) && (
            <p className={`stat-trend ${trend > 0 ? 'trend-up' : trend < 0 ? 'trend-down' : 'trend-neutral'}`}>
              {trend > 0 ? '↑' : trend < 0 ? '↓' : '–'} {trendLabel || `${Math.abs(trend)}%`}
            </p>
          )}
        </div>
        {icon && <div className="stat-icon">{icon}</div>}
      </div>
    </Card>
  );
}
