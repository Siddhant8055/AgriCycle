import { Menu, Search, MapPin, Bell } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Topbar.css';

export function Topbar({ onMenuToggle, pageTitle }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (value) next.set('search', value);
      else next.delete('search');
      return next;
    }, { replace: true });
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const path = user?.role === 'farmer' ? '/farmer/listings' : '/buyer/marketplace';
    const query = search.trim();
    navigate({ pathname: path, search: query ? `?search=${encodeURIComponent(query)}` : '' });
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <header className="topbar" role="banner">
      {/* Left — hamburger + page title */}
      <div className="topbar-left">
        <button
          className="topbar-menu-btn"
          onClick={onMenuToggle}
          aria-label="Toggle navigation"
        >
          <Menu size={18} />
        </button>
        {pageTitle && <h1 className="topbar-title">{pageTitle}</h1>}
      </div>

      {/* Center — search */}
      <div className="topbar-center">
        <form className="topbar-search" role="search" onSubmit={handleSearchSubmit}>
          <Search size={15} className="topbar-search-icon" aria-hidden />
          <input
            type="search"
            placeholder="Search crop listings…"
            className="topbar-search-input"
            aria-label="Search crop listings"
            value={search}
            onChange={handleSearchChange}
          />
        </form>
      </div>

      {/* Right — region + bell + user */}
      <div className="topbar-right">
        <div className="topbar-region" title={`Region: ${user?.region || 'Kolhapur, Maharashtra'}`}>
          <MapPin size={13} aria-hidden />
          <span>{user?.region || 'Kolhapur, MH'}</span>
        </div>

        {/* Notification bell (placeholder) */}
        <button className="topbar-action-btn" aria-label="Notifications" title="Notifications">
          <Bell size={16} />
        </button>

        {/* User pill */}
        <div className="topbar-user" role="button" tabIndex={0} aria-label="User profile">
          <div className="topbar-avatar" aria-hidden>{initials}</div>
          <div className="topbar-user-info">
            <span className="topbar-user-name">{user?.name?.split(' ')[0] || 'User'}</span>
            <span className="topbar-user-role">
              {user?.role === 'farmer' ? '🌾 Farmer' : '🏭 Buyer'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
