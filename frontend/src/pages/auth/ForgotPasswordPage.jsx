import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, Info } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import './Auth.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email address'); return; }
    setError('');
    setSubmitted(true);
  };

  return (
    <AuthLayout
      title="Recover your account"
      subtitle="Enter your registered email address and we'll help you get back in."
    >
      {!submitted ? (
        <>
          <div className="auth-alert auth-alert-info" style={{ marginBottom: 20 }}>
            <Info size={16} />
            <span>
              <strong>Note:</strong> Password recovery via email is not configured in this demo environment.
              This screen shows the UI flow only.
            </span>
          </div>

          {error && (
            <div className="auth-alert auth-alert-error" role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="auth-form">
            <Input
              id="recovery-email"
              label="Registered Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              error={error}
              required
              leftIcon={<Mail size={16} />}
              autoComplete="email"
              hint="Enter the email linked to your AgriCycle account"
            />

            <Button type="submit" variant="primary" size="lg" fullWidth>
              Send Recovery Instructions
            </Button>
          </form>

          <p className="auth-footer">
            <Link to="/login" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ArrowLeft size={14} /> Back to sign in
            </Link>
          </p>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📧</div>
          <h3 style={{ color: 'var(--agri-text)', marginBottom: 10, letterSpacing: '-0.02em' }}>
            Check your email
          </h3>
          <p style={{ color: 'var(--agri-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.6, marginBottom: 24 }}>
            If an account exists for <strong>{email}</strong>, you will receive
            recovery instructions shortly.
          </p>
          <div className="auth-alert auth-alert-info">
            <Info size={16} />
            <span>Password recovery is not operational in demo mode. No email was sent.</span>
          </div>
          <div style={{ marginTop: 24 }}>
            <Link to="/login">
              <Button variant="outline" leftIcon={<ArrowLeft size={16} />}>
                Return to Sign In
              </Button>
            </Link>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
