import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, List, Plus, ShoppingBag, Map, FileText,
  Truck, LogOut, Settings, Leaf, ChevronRight, Package,
  BarChart3, Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const FARMER_NAV = [
  { label: 'Dashboard', to: '/farmer/dashboard', icon: LayoutDashboard },
  { label: 'My Listings', to: '/farmer/listings', icon: List },
  { label: 'Add Listing', to: '/farmer/listings/new', icon: Plus, highlight: true },
  { label: 'Buyer Requests', to: '/farmer/requests', icon: FileText },
  { label: 'Pickup Status', to: '/farmer/pickups', icon: Truck },
  { label: 'Analytics', to: '/farmer/analytics', icon: BarChart3 },
];

const BUYER_NAV = [
  { label: 'Marketplace', to: '/buyer/marketplace', icon: ShoppingBag },
  { label: 'Geo Search', to: '/buyer/geo', icon: Map },
  { label: 'My Requests', to: '/buyer/requests', icon: FileText },
  { label: 'Requirements', to: '/buyer/requirements', icon: Package },
  { label: 'Pickup Status', to: '/buyer/pickups', icon: Truck },
  { label: 'Suppliers', to: '/buyer/suppliers', icon: Users },
];

export function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = user?.role === 'farmer' ? FARMER_NAV : BUYER_NAV;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`} aria-label="Main navigation">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Leaf size={22} />
          </div>
          <div>
            <span className="sidebar-logo-text">AgriCycle</span>
            <span className="sidebar-logo-tag">
              {user?.role === 'farmer' ? 'Farmer Portal' : 'Buyer Portal'}
            </span>
          </div>
        </div>

        {/* User Info */}
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user?.name || 'User'}</p>
            <p className="sidebar-user-region">
              <span className="sidebar-user-region-dot" />
              {user?.region || 'Maharashtra'}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav" aria-label="Primary navigation">
          <p className="sidebar-nav-label">Navigation</p>
          <ul className="sidebar-nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to ||
                (item.to !== '/farmer/dashboard' && item.to !== '/buyer/marketplace' &&
                  location.pathname.startsWith(item.to));
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={`sidebar-nav-link ${active ? 'active' : ''} ${item.highlight ? 'highlight' : ''}`}
                    onClick={onClose}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                    {active && <ChevronRight size={14} className="sidebar-nav-chevron" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom */}
        <div className="sidebar-bottom">
          <Link to={`/${user?.role}/settings`} className="sidebar-nav-link" onClick={onClose}>
            <Settings size={18} />
            <span>Settings</span>
          </Link>
          <button className="sidebar-nav-link sidebar-logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
