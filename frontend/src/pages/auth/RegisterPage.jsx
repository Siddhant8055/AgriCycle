import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Tractor, ShoppingBag, AlertCircle } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input, PasswordInput, Select, Checkbox } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const REGIONS = [
  { value: 'Kolhapur, Maharashtra', label: 'Kolhapur, Maharashtra' },
  { value: 'Sangli, Maharashtra', label: 'Sangli, Maharashtra' },
  { value: 'Satara, Maharashtra', label: 'Satara, Maharashtra' },
  { value: 'Pune, Maharashtra', label: 'Pune, Maharashtra' },
  { value: 'Solapur, Maharashtra', label: 'Solapur, Maharashtra' },
];

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('farmer');
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', region: 'Kolhapur, Maharashtra',
    password: '', confirmPassword: '', terms: false,
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) errs.phone = 'Enter a valid 10-digit phone';
    if (!form.region) errs.region = 'Region is required';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!form.terms) errs.terms = 'You must accept the terms to continue';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    const result = await register({ ...form, role });
    if (result.success) {
      navigate(role === 'farmer' ? '/farmer/dashboard' : '/buyer/marketplace');
    } else {
      setServerError(result.error || 'Registration failed. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Join AgriCycle to start valorizing crop waste or discover residue supplies."
    >
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
          id="fullName" name="fullName" label="Full Name" type="text"
          placeholder="Rajesh Patil"
          value={form.fullName} onChange={handleChange}
          error={errors.fullName} required
          leftIcon={<User size={16} />}
          autoComplete="name"
        />

        <div className="form-row">
          <Input
            id="email" name="email" label="Email" type="email"
            placeholder="you@example.com"
            value={form.email} onChange={handleChange}
            error={errors.email} required
            leftIcon={<Mail size={16} />}
            autoComplete="email"
          />
          <Input
            id="phone" name="phone" label="Phone" type="tel"
            placeholder="9876543210"
            value={form.phone} onChange={handleChange}
            error={errors.phone} required
            leftIcon={<Phone size={16} />}
            autoComplete="tel"
          />
        </div>

        <Select
          id="region" name="region" label="Region" required
          options={REGIONS} value={form.region} onChange={handleChange}
          error={errors.region}
        />

        <PasswordInput
          id="password" name="password" label="Password"
          placeholder="Create a strong password (min. 8 chars)"
          value={form.password} onChange={handleChange}
          error={errors.password} required
          autoComplete="new-password"
          hint="At least 8 characters"
        />

        <PasswordInput
          id="confirmPassword" name="confirmPassword" label="Confirm Password"
          placeholder="Re-enter your password"
          value={form.confirmPassword} onChange={handleChange}
          error={errors.confirmPassword} required
          autoComplete="new-password"
        />

        <Checkbox
          id="terms" name="terms"
          checked={form.terms} onChange={handleChange}
          error={errors.terms}
          label={
            <span>
              I have read the{' '}
              <Link to="/terms" className="auth-link">Demo Terms</Link>
              {' '}and{' '}
              <Link to="/privacy" className="auth-link">Demo Privacy Notice</Link>
            </span>
          }
        />

        <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
          Create {role === 'farmer' ? 'Farmer' : 'Buyer'} Account
        </Button>
      </form>

      <p className="auth-footer">
        Already have an account?{' '}
        <Link to="/login" className="auth-link auth-link-strong">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
