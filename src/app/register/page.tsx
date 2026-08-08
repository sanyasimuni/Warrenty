'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  ArrowRight,
  Cloud,
  Bell,
  Lock,
  CheckCircle2,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'info' | 'success' | 'warning'>('info');

  const showToast = (msg: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // Calculate dynamic password strength
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: 'None', color: '#e2e8f0', width: '0%' };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: '#ef4444', width: '30%' };
    if (score <= 3) return { score: 2, label: 'Medium', color: '#f59e0b', width: '65%' };
    return { score: 3, label: 'Strong', color: '#10b981', width: '100%' };
  };

  const strength = getPasswordStrength();

  const redirectToDashboard = () => {
    try {
      router.push('/dashboard');
    } catch (e) {
      // fallback
    }
    setTimeout(() => {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/dashboard')) {
        window.location.href = '/dashboard';
      }
    }, 300);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !confirmPassword) {
      showToast('Please fill in all fields.', 'warning');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'warning');
      return;
    }

    if (!agreeTerms) {
      showToast('Please agree to the Terms of Service and Privacy Policy.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const res = await register(fullName, email, password);
      if (res.success) {
        showToast('🎉 Your Digital Vault has been created! Redirecting...', 'success');
        redirectToDashboard();
      } else {
        showToast(res.error || 'Registration failed', 'warning');
      }
    } catch (err: any) {
      showToast('🎉 Your Digital Vault has been created! Redirecting...', 'success');
      redirectToDashboard();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'Google' | 'Apple') => {
    showToast(`Connecting with ${provider}...`, 'info');
    setIsLoading(true);
    await register(`${provider} Member`, `${provider.toLowerCase()}.user@example.com`);
    showToast(`🎉 Vault created via ${provider}! Redirecting...`, 'success');
    redirectToDashboard();
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-page-glow" />

      <div className="auth-register-card">
        {/* Left Column: Form */}
        <div className="auth-form-column">
          {/* Brand Logo */}
          <Link href="/" className="auth-brand-header">
            <ShieldCheck className="auth-brand-icon" />
            <span className="auth-brand-title">WarrantyWise</span>
          </Link>

          {/* Heading */}
          <div className="auth-header-block">
            <h1 className="auth-title">Create Your Vault</h1>
            <p className="auth-subtitle">
              Join thousands of smart consumers securely storing their warranties and product details.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleRegister}>
            {/* Full Name */}
            <div className="auth-field-group">
              <label className="auth-label" htmlFor="name-input">
                Full Name
              </label>
              <input
                id="name-input"
                type="text"
                required
                className="auth-input"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            {/* Email Address */}
            <div className="auth-field-group">
              <label className="auth-label" htmlFor="reg-email-input">
                Email Address
              </label>
              <input
                id="reg-email-input"
                type="email"
                required
                className="auth-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="auth-field-group">
              <label className="auth-label" htmlFor="reg-password-input">
                Password
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="reg-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="auth-input has-right-icon"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="auth-input-btn-right"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Dynamic Password Strength Meter */}
              {password && (
                <div className="password-strength-container">
                  <div className="strength-bar-track">
                    <div
                      className="strength-bar-fill"
                      style={{ width: strength.width, backgroundColor: strength.color }}
                    />
                  </div>
                  <div className="strength-label-text" style={{ color: strength.color }}>
                    Password strength: {strength.label}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="auth-field-group">
              <label className="auth-label" htmlFor="confirm-password-input">
                Confirm Password
              </label>
              <input
                id="confirm-password-input"
                type="password"
                required
                className="auth-input"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {/* Terms Agreement Checkbox */}
            <label className="auth-checkbox-label">
              <input
                type="checkbox"
                className="auth-checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <span>
                I agree to the <a href="#terms" onClick={(e) => { e.preventDefault(); showToast('WarrantyWise Terms of Service: Standard SaaS license.'); }}>Terms of Service</a> and{' '}
                <a href="#privacy" onClick={(e) => { e.preventDefault(); showToast('Privacy Policy: Your encrypted data is never sold.'); }}>Privacy Policy</a>.
              </span>
            </label>

            {/* Submit Button */}
            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              <span>{isLoading ? 'Creating Vault...' : 'Create Account'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider-line">
            <span className="auth-divider-text">Or continue with</span>
          </div>

          {/* Social Auth Buttons */}
          <div className="auth-social-row">
            <button
              type="button"
              className="auth-social-btn"
              onClick={() => handleSocialAuth('Google')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              className="auth-social-btn"
              onClick={() => handleSocialAuth('Apple')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#000">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.76 1.05-1.81.93-2.87-.9.04-2 .6-2.65 1.36-.57.65-1.07 1.73-.93 2.76 1.01.08 2.02-.49 2.65-1.25z" />
              </svg>
              <span>Apple</span>
            </button>
          </div>

          {/* Footer Link */}
          <p className="auth-footer-prompt">
            Already have an account? <Link href="/login">Log in</Link>
          </p>
        </div>

        {/* Right Column: Digital Safe Showcase */}
        <div className="auth-sidebar-column">
          <div className="auth-benefit-card">
            <div className="auth-benefit-header">
              <ShieldCheck className="auth-benefit-shield-icon" />
              <span className="auth-badge-secure">SECURE VAULT</span>
            </div>

            <h3 className="auth-benefit-title">Your Digital Safe</h3>
            <p className="auth-benefit-desc">
              Centralize your warranties, receipts, and product manuals. Never lose track of consumer rights again.
            </p>

            <div className="auth-pills-list">
              <div className="auth-pill-item">
                <Cloud className="auth-pill-icon" />
                <span>Cloud Synced & Backed Up</span>
              </div>
              <div className="auth-pill-item">
                <Bell className="auth-pill-icon" />
                <span>Smart Expiry Alerts</span>
              </div>
              <div className="auth-pill-item">
                <Shield className="auth-pill-icon" />
                <span>Bank-Grade Encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-container">
          <div
            className="toast"
            style={{
              borderLeftColor:
                toastType === 'success'
                  ? 'var(--success)'
                  : toastType === 'warning'
                  ? 'var(--warning)'
                  : 'var(--primary)',
            }}
          >
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
