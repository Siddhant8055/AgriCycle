import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './Input.css';

export const Input = forwardRef(function Input(
  {
    label,
    id,
    type = 'text',
    error,
    hint,
    required,
    leftIcon,
    rightElement,
    className = '',
    ...props
  },
  ref
) {
  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="form-required" aria-hidden="true">*</span>}
        </label>
      )}
      <div className={`input-wrapper ${leftIcon ? 'has-left-icon' : ''} ${rightElement ? 'has-right-element' : ''} ${error ? 'has-error' : ''}`}>
        {leftIcon && <span className="input-left-icon" aria-hidden="true">{leftIcon}</span>}
        <input
          ref={ref}
          id={id}
          type={type}
          required={required}
          className="input"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          {...props}
        />
        {rightElement && <span className="input-right-element">{rightElement}</span>}
      </div>
      {hint && !error && <p id={`${id}-hint`} className="form-hint">{hint}</p>}
      {error && <p id={`${id}-error`} className="form-error" role="alert">{error}</p>}
    </div>
  );
});

export const PasswordInput = forwardRef(function PasswordInput(props, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      ref={ref}
      type={visible ? 'text' : 'password'}
      rightElement={
        <button
          type="button"
          className="password-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      }
      {...props}
    />
  );
});

export function Select({ label, id, error, hint, required, options = [], placeholder, className = '', ...props }) {
  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="form-required" aria-hidden="true">*</span>}
        </label>
      )}
      <div className={`input-wrapper select-wrapper ${error ? 'has-error' : ''}`}>
        <select
          id={id}
          className="input select"
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className="select-arrow" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>
      {hint && !error && <p id={`${id}-hint`} className="form-hint">{hint}</p>}
      {error && <p id={`${id}-error`} className="form-error" role="alert">{error}</p>}
    </div>
  );
}

export function Textarea({ label, id, error, hint, required, className = '', ...props }) {
  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="form-required" aria-hidden="true">*</span>}
        </label>
      )}
      <textarea
        id={id}
        required={required}
        className={`input textarea ${error ? 'has-error' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...props}
      />
      {hint && !error && <p id={`${id}-hint`} className="form-hint">{hint}</p>}
      {error && <p id={`${id}-error`} className="form-error" role="alert">{error}</p>}
    </div>
  );
}

export function Checkbox({ label, id, error, className = '', ...props }) {
  return (
    <div className={`checkbox-field ${className}`}>
      <div className="checkbox-wrapper">
        <input
          type="checkbox"
          id={id}
          className="checkbox"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        <label htmlFor={id} className="checkbox-label">{label}</label>
      </div>
      {error && <p id={`${id}-error`} className="form-error" role="alert">{error}</p>}
    </div>
  );
}
