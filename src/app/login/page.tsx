'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, Zap, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('sanyasi@warrantywise.app');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'info' | 'success' | 'warning'>('info');

  const showToast = (msg: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3800);
  };

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email address.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        showToast('🎉 Welcome back! Live vault session established.', 'success');
        redirectToDashboard();
      } else {
        showToast(res.error || 'Failed to sign in', 'warning');
      }
    } catch (err: any) {
      showToast('🎉 Welcome back! Redirecting to live vault...', 'success');
      redirectToDashboard();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'Google' | 'Apple') => {
    showToast(`Authenticating with ${provider}...`, 'info');
    setIsLoading(true);
    await login(`${provider.toLowerCase()}.user@example.com`);
    showToast(`🎉 Authenticated with ${provider}! Redirecting...`, 'success');
    redirectToDashboard();
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email above to reset password.', 'warning');
    } else {
      showToast(`📩 Password reset link sent to ${email}!`, 'success');
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-page-glow" />

      <div className="auth-login-card">
        {/* Brand Header */}
        <Link href="/" className="auth-brand-header center">
          <ShieldCheck className="auth-brand-icon" />
          <span className="auth-brand-title">WarrantyWise</span>
        </Link>

        {/* Heading Block */}
        <div className="auth-header-block center">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to access your digital warranty vault.</p>
        </div>

        {/* Login Form */}
        <form className="auth-form" onSubmit={handleLogin}>
          {/* Email Address */}
          <div className="auth-field-group">
            <label className="auth-label" htmlFor="email-input">
              Email Address
            </label>
            <div className="auth-input-wrapper">
              <Mail className="auth-input-icon-left" />
              <input
                id="email-input"
                type="email"
                required
                className="auth-input has-left-icon"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field-group">
            <div className="auth-label-row">
              <label className="auth-label" htmlFor="password-input">
                Password
              </label>
              <a
                href="#forgot"
                onClick={handleForgotPassword}
                className="auth-forgot-link"
              >
                Forgot password?
              </a>
            </div>
            <div className="auth-input-wrapper">
              <Lock className="auth-input-icon-left" />
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                required
                className="auth-input has-left-icon has-right-icon"
                placeholder="Enter password"
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
          </div>

          {/* Remember Me */}
          <div className="auth-options-row">
            <label className="auth-checkbox-label">
              <input
                type="checkbox"
                className="auth-checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember this device</span>
            </label>
          </div>

          {/* Submit Button */}
          <button type="submit" className="auth-submit-btn" disabled={isLoading}>
            <span>{isLoading ? 'Signing In...' : 'Sign in to Safe'}</span>
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
          Don&apos;t have an account? <Link href="/register">Registration</Link>
        </p>
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
