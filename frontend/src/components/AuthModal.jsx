import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, ShieldCheck, ArrowRight, AlertCircle, Info, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const { login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleConfigMissing, setGoogleConfigMissing] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Initialize Google Identity Services if client ID is configured
  useEffect(() => {
    if (!isOpen) return;

    if (!googleClientId) {
      setGoogleConfigMissing(true);
      return;
    }

    setGoogleConfigMissing(false);

    const initGsi = () => {
      try {
        if (!window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (!response.credential) return;
            setIsSubmitting(true);
            setError('');
            try {
              await loginWithGoogle(response.credential);
              if (onAuthSuccess) onAuthSuccess();
              onClose();
            } catch (err) {
              setError(err.message || 'Google authentication failed.');
            } finally {
              setIsSubmitting(false);
            }
          },
        });

        const btnContainer = document.getElementById('google-signin-container');
        if (btnContainer) {
          btnContainer.innerHTML = '';
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            width: 320,
            text: 'continue_with',
            shape: 'rectangular',
          });
        }
      } catch (err) {
        console.warn('[GOOGLE SIGN-IN] Initialization error:', err.message);
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(timer);
          initGsi();
        }
      }, 300);
      return () => clearInterval(timer);
    }
  }, [isOpen, googleClientId, mode]);

  if (!isOpen) return null;

  const fillQuickDemo = async (demoRole, autoSubmit = false) => {
    setError('');
    setMode('login');
    let demoEmail = '';
    let demoPassword = '';
    if (demoRole === 'CITIZEN') {
      demoEmail = 'citizen@civicvoice.org';
      demoPassword = 'Citizen@123';
    } else if (demoRole === 'MUNICIPAL' || demoRole === 'MUNICIPAL_VMC') {
      demoEmail = 'municipal@civicvoice.org';
      demoPassword = 'Municipal@123';
    } else if (demoRole === 'MUNICIPAL_AMC') {
      demoEmail = 'municipal.amc@civicvoice.org';
      demoPassword = 'Municipal@123';
    } else if (demoRole === 'ADMIN') {
      demoEmail = 'admin@civicvoice.org';
      demoPassword = 'Admin@123';
    }

    setEmail(demoEmail);
    setPassword(demoPassword);

    if (autoSubmit) {
      setIsSubmitting(true);
      try {
        await login(demoEmail, demoPassword);
        if (onAuthSuccess) onAuthSuccess();
        onClose();
      } catch (err) {
        setError(err.message || 'Authentication failed. Please check credentials.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleManualGoogleClick = () => {
    if (!googleClientId) {
      setError(
        'Google Sign-In is optional and requires VITE_GOOGLE_CLIENT_ID in frontend .env and GOOGLE_CLIENT_ID in backend .env. Email & password authentication above is fully functional!'
      );
      return;
    }
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setError('Google Identity Services library is initializing. Please try again in a moment.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      if (!email.trim() || !password) {
        setError('Please enter both email address and password.');
        return;
      }
    } else {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!email.trim() || !password) {
        setError('Please enter both email address and password.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password);
      }

      if (onAuthSuccess) onAuthSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-md rounded-2xl bg-[var(--theme-card-bg,#FFFDF5)] border border-[var(--theme-card-border,#E7DDC5)] shadow-2xl z-10 flex flex-col overflow-hidden text-[var(--theme-text-primary,#29261F)]">
        
        {/* Top Header Bar */}
        <div className="px-6 py-5 bg-[#8A6418] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white p-1 flex items-center justify-center font-bold text-[#8A6418] text-lg shadow-xs">
              CV
            </div>
            <div>
              <div className="text-[11px] font-semibold tracking-wider uppercase text-amber-100">
                Civic Issue Redressal Portal
              </div>
              <div className="font-bold text-base tracking-tight text-white">
                {mode === 'login' ? 'Citizen & Official Portal' : 'Citizen Registration'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/20 text-amber-100 hover:text-white transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 mx-6 mt-5 rounded-xl bg-[var(--theme-pill-bg,#FDF1CE)] border border-[var(--theme-card-border,#E7DDC5)] text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-[#8A6418] text-white shadow-xs font-bold'
                : 'text-[var(--theme-text-primary,#29261F)] hover:text-[#8A6418]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-[#8A6418] text-white shadow-xs font-bold'
                : 'text-[var(--theme-text-primary,#29261F)] hover:text-[#8A6418]'
            }`}
          >
            Citizen Sign Up
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-[#FDF2F2] border border-[#FECACA] text-[#7F1D1D] text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#7F1D1D] flex-shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="px-6 pt-4 pb-2 space-y-3.5">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--theme-text-primary,#29261F)] block">
                Full Name <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[var(--theme-card-border,#E7DDC5)] text-[var(--theme-text-primary,#29261F)] text-xs focus:outline-none focus:ring-2 focus:ring-[#8A6418]"
                />
                <User className="w-4 h-4 text-[var(--theme-text-secondary,#625D52)] absolute left-2.5 top-2.5" />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--theme-text-primary,#29261F)] block">
              Email Address <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@civicvoice.org"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[var(--theme-card-border,#E7DDC5)] text-[var(--theme-text-primary,#29261F)] text-xs focus:outline-none focus:ring-2 focus:ring-[#8A6418]"
              />
              <Mail className="w-4 h-4 text-[var(--theme-text-secondary,#625D52)] absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--theme-text-primary,#29261F)] block">
              Password <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2 rounded-xl bg-white border border-[var(--theme-card-border,#E7DDC5)] text-[var(--theme-text-primary,#29261F)] text-xs focus:outline-none focus:ring-2 focus:ring-[#8A6418]"
              />
              <Lock className="w-4 h-4 text-[var(--theme-text-secondary,#625D52)] absolute left-2.5 top-2.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-[var(--theme-text-secondary,#625D52)] hover:text-[var(--theme-text-primary,#29261F)] focus:outline-none"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <p className="text-[11px] text-[var(--theme-text-secondary,#625D52)] leading-normal">
              Public self-registration strictly provisions a CITIZEN account. Official Municipal Officer and Admin accounts are assigned and authorized securely by municipal dispatch.
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-[#8A6418] hover:bg-[#735212] disabled:opacity-50 text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99]"
          >
            {isSubmitting ? (
              <span>Verifying Credentials...</span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to CivicVoice' : 'Register Citizen Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Separator */}
        <div className="px-6 my-2">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--theme-card-border,#E7DDC5)]" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
              <span className="bg-[var(--theme-card-bg,#FFFDF5)] px-2 text-[var(--theme-text-secondary,#625D52)] font-medium">
                or
              </span>
            </div>
          </div>
        </div>

        {/* Google Sign-In Action */}
        <div className="px-6 pb-4">
          <div id="google-signin-container" className="min-h-[40px] flex items-center justify-center">
            <button
              type="button"
              onClick={handleManualGoogleClick}
              className="w-full py-2.5 px-4 rounded-xl border border-[var(--theme-card-border,#E7DDC5)] bg-white hover:bg-[#FDF7E7] text-[var(--theme-text-primary,#29261F)] text-xs font-semibold flex items-center justify-center gap-2.5 shadow-xs transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        </div>

        {/* Quick Testing Credentials Drawer */}
        <div className="p-3.5 bg-[var(--theme-surface-secondary,#FDF7E7)] border-t border-[var(--theme-card-border,#E7DDC5)] space-y-2">
          <div className="text-[10px] font-semibold text-[var(--theme-text-secondary,#625D52)] uppercase tracking-wider text-center">
            Role Demo Accounts (Quick-Fill or 1-Click Login)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => fillQuickDemo('CITIZEN', true)}
                className="w-full py-1.5 px-2 rounded-lg bg-white hover:bg-[#FFFDF5] border border-[var(--theme-card-border,#E7DDC5)] text-[var(--theme-text-primary,#29261F)] text-[11px] font-bold transition-all shadow-xs active:scale-95 text-center"
              >
                Citizen
              </button>
              <span className="text-[9px] font-mono text-stone-500 text-center truncate" title="citizen@civicvoice.org">
                citizen@civicvoice.org
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => fillQuickDemo('MUNICIPAL_VMC', true)}
                className="w-full py-1.5 px-2 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-900 text-[11px] font-bold transition-all shadow-xs active:scale-95 text-center"
              >
                VMC Officer
              </button>
              <span className="text-[9px] font-mono text-stone-500 text-center truncate" title="municipal@civicvoice.org">
                municipal@civicvoice.org
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => fillQuickDemo('MUNICIPAL_AMC', true)}
                className="w-full py-1.5 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-900 text-[11px] font-bold transition-all shadow-xs active:scale-95 text-center"
              >
                AMC Officer
              </button>
              <span className="text-[9px] font-mono text-stone-500 text-center truncate" title="municipal.amc@civicvoice.org">
                municipal.amc@civicvoice.org
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => fillQuickDemo('ADMIN', true)}
                className="w-full py-1.5 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-400 text-amber-900 text-[11px] font-bold transition-all shadow-xs active:scale-95 text-center"
              >
                Admin
              </button>
              <span className="text-[9px] font-mono text-stone-500 text-center truncate" title="admin@civicvoice.org">
                admin@civicvoice.org
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
