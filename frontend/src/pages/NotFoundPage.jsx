import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './NotFoundPage.css';

export default function NotFoundPage() {
  const { user } = useAuth();
  const homeLink = !user ? '/login' : user.role === 'farmer' ? '/farmer/dashboard' : '/buyer/marketplace';

  return (
    <div className="nf-page">
      <div className="nf-bg-circles">
        <div className="nf-circle nf-circle-1" />
        <div className="nf-circle nf-circle-2" />
        <div className="nf-circle nf-circle-3" />
      </div>

      <div className="nf-content animate-fadeIn">
        {/* Logo */}
        <div className="nf-logo">
          <Leaf size={28} />
          <span>AgriCycle</span>
        </div>

        {/* 404 */}
        <div className="nf-code">404</div>
        <div className="nf-emoji">🌾</div>
        <h1 className="nf-title">Page Not Found</h1>
        <p className="nf-desc">
          Looks like this field is empty. The page you're looking for doesn't exist
          or may have been moved.
        </p>

        <div className="nf-actions">
          <Link to={homeLink} className="nf-btn-primary">
            <Home size={16} />
            Go Home
          </Link>
          <button onClick={() => window.history.back()} className="nf-btn-secondary">
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>

        <p className="nf-hint">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  );
}
