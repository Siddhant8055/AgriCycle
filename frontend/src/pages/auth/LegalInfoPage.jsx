import { Link, useLocation } from 'react-router-dom';
import { Info } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import './Auth.css';

export default function LegalInfoPage() {
  const { pathname } = useLocation();
  const isPrivacyNotice = pathname === '/privacy';

  return (
    <AuthLayout
      title={isPrivacyNotice ? 'Demo Privacy Notice' : 'Demo Terms'}
      subtitle="Important information about this non-production prototype."
    >
      <div className="auth-alert auth-alert-info" role="note">
        <Info size={16} />
        <span>
          This is a student project demo, not a production service or a substitute
          for formal legal terms or a privacy policy.
        </span>
      </div>

      {isPrivacyNotice ? (
        <section>
          <h2>Data in this demo</h2>
          <p>
            Sign-in and registration are simulated. The demo profile is stored in
            this browser; selecting “Remember me” stores it in local storage,
            otherwise it is stored for the current browser session.
          </p>
          <p>
            Listings and marketplace activity are illustrative and are not sent
            to a production service. Do not enter real passwords, financial
            details, or sensitive personal information.
          </p>
          <p>Clear this site’s browser storage to remove the saved demo profile.</p>
        </section>
      ) : (
        <section>
          <h2>Using the prototype</h2>
          <p>
            This frontend is provided for demonstration and evaluation. Login,
            registration, AI suggestions, listings, requests, pickups, and
            analytics are not connected to production services.
          </p>
          <p>
            Prices, quantities, names, and locations may be sample data. They are
            not offers, guarantees of availability, or evidence of real
            transactions.
          </p>
          <p>
            Do not rely on this prototype to arrange purchases, payments,
            transport, or agricultural safety decisions.
          </p>
        </section>
      )}

      <p className="auth-footer">
        <Link to="/register" className="auth-link">Return to registration</Link>
        {' · '}
        <Link to="/login" className="auth-link">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
