import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Tractor, ShoppingBag, AlertCircle } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input, PasswordInput, Checkbox } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('farmer');
  const [form, setForm] = useState({ identifier: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.identifier.trim()) errs.identifier = 'Email or phone is required';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    const result = await login({ ...form, role });
    if (result.success) {
      navigate(role === 'farmer' ? '/farmer/dashboard' : '/buyer/marketplace');
    } else {
      setServerError(result.error || 'Invalid credentials. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your AgriCycle account to continue.">
      {/* Role Selector */}
      <div className="role-selector">
        <button
          type="button"
          className={`role-btn ${role === 'farmer' ? 'active' : ''}`}
          onClick={() => setRole('farmer')}
          aria-pressed={role === 'farmer'}
        >
          <Tractor size={18} />
          <span>Farmer</span>
        </button>
        <button
          type="button"
          className={`role-btn ${role === 'buyer' ? 'active' : ''}`}
          onClick={() => setRole('buyer')}
          aria-pressed={role === 'buyer'}
        >
          <ShoppingBag size={18} />
          <span>Buyer / Processor</span>
        </button>
      </div>

      {serverError && (
        <div className="auth-alert auth-alert-error" role="alert">
          <AlertCircle size={16} />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="auth-form">
        <Input
          id="identifier"
          name="identifier"
          label="Email or Phone"
          type="text"
          placeholder={role === 'farmer' ? 'rajesh@example.com' : 'buyer@example.com'}
          value={form.identifier}
          onChange={handleChange}
          error={errors.identifier}
          required
          leftIcon={<Mail size={16} />}
          autoComplete="username"
        />

        <PasswordInput
          id="password"
          name="password"
          label="Password"
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          required
          autoComplete="current-password"
        />

        <div className="auth-row">
          <Checkbox
            id="remember"
            name="remember"
            label="Remember me"
            checked={form.remember}
            onChange={handleChange}
          />
          <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
        </div>

        <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
          Sign In as {role === 'farmer' ? 'Farmer' : 'Buyer'}
        </Button>
      </form>

      <p className="auth-footer">
        Don't have an account?{' '}
        <Link to="/register" className="auth-link auth-link-strong">Create account</Link>
      </p>

      <div className="demo-note">
        <p><strong>Demo mode:</strong> Use any email/phone + any 6+ char password to sign in.</p>
      </div>
    </AuthLayout>
  );
}
