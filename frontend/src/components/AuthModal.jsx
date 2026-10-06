import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/audio';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  if (!isOpen) return null;

  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fillQuickDemo = (demoRole) => {
    setError('');
    setMode('login');
    if (demoRole === 'CITIZEN') {
      setEmail('citizen@civicvoice.org');
      setPassword('Citizen@123');
    } else if (demoRole === 'MUNICIPAL') {
      setEmail('municipal@civicvoice.org');
      setPassword('Municipal@123');
    } else if (demoRole === 'ADMIN') {
      setEmail('admin@civicvoice.org');
      setPassword('Admin@123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password) {
          throw new Error('Please enter both email and password.');
        }
        await login(email.trim(), password);
      } else {
        if (!name.trim()) {
          throw new Error('Please enter your full name.');
        }
        if (!email.trim() || !password) {
          throw new Error('Please enter your email and password.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        await register(name.trim(), email.trim(), password);
      }

      sound.playTimpaniBoom();
      if (onAuthSuccess) onAuthSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-md rounded-3xl bg-stone-950 border border-stone-800 shadow-2xl z-10 flex flex-col overflow-hidden text-stone-100">
        
        {/* Top Header Bar */}
        <div className="px-6 py-5 bg-gradient-to-r from-stone-900 to-black border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-400 p-1 flex items-center justify-center font-black text-black font-monumental text-xl shadow-md">
              CV
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest uppercase text-yellow-400 font-bold">
                POSTAL MUNICIPAL GATEWAY
              </div>
              <div className="font-bold text-sm tracking-wide text-white">
                {mode === 'login' ? 'Authentication Console' : 'Register Citizen Dispatcher'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 mx-6 mt-5 rounded-xl bg-stone-900 border border-stone-800 text-xs font-mono font-bold uppercase">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-yellow-400 text-black shadow-md'
                : 'text-stone-400 hover:text-stone-200'
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
                ? 'bg-yellow-400 text-black shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Citizen Sign Up
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-stone-400 uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
                <User className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-stone-400 uppercase tracking-wider block">
              Official Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@civicvoice.org"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
              <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-stone-400 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
              <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
            </div>
          </div>

          {mode === 'register' && (
            <p className="text-[11px] font-mono text-stone-500 leading-normal">
              * Note: Public registration creates a verified <strong>CITIZEN</strong> account. Municipal and Admin accounts are provisioned via administrative dispatch.
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <span>Verifying Credentials...</span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Authenticate Session' : 'Create Citizen Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>

        {/* Quick Testing Credentials Drawer */}
        <div className="p-4 bg-stone-900/60 border-t border-stone-800/80">
          <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-2 text-center">
            Development Quick-Fill Credentials
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillQuickDemo('CITIZEN')}
              className="px-2 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] font-mono font-bold uppercase transition-colors"
            >
              Citizen
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo('MUNICIPAL')}
              className="px-2 py-1.5 rounded-lg bg-purple-900/40 hover:bg-purple-900/70 border border-purple-700/50 text-purple-200 text-[10px] font-mono font-bold uppercase transition-colors"
            >
              Municipal
            </button>
            <button
              type="button"
              onClick={() => fillQuickDemo('ADMIN')}
              className="px-2 py-1.5 rounded-lg bg-amber-900/40 hover:bg-amber-900/70 border border-amber-700/50 text-amber-200 text-[10px] font-mono font-bold uppercase transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
