import React from 'react';
import { Mail, PlusCircle, ShieldCheck, UserCheck, Shield, LogOut, LogIn, MapPin, BarChart3, Newspaper, Sparkles, User } from 'lucide-react';
import ThemeSelector from './ThemeSelector';
import { useAuth } from '../context/AuthContext';
import { sound } from '../utils/audio';

export default function Navbar({
  currentTheme,
  onSelectTheme,
  activeTab,
  setActiveTab,
  onOpenReportModal,
  onOpenAuthModal,
  issuesCount,
}) {
  const { user, role, isAuthenticated, logout } = useAuth();

  const handleLogoutClick = () => {
    sound.playTick();
    logout();
  };

  const getRoleBadge = () => {
    if (!isAuthenticated) return null;

    if (role === 'ADMIN') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
          <Shield className="w-3 h-3 text-amber-400" />
          <span>Admin</span>
        </span>
      );
    }
    if (role === 'MUNICIPAL') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600/30 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3 h-3 text-purple-300" />
          <span>Officer</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 text-[10px] font-mono font-bold uppercase tracking-wider">
        <UserCheck className="w-3 h-3 text-yellow-300" />
        <span>Citizen</span>
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-black/85 border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity in NY Phil JKR Style */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-yellow-400 p-1 flex items-center justify-center font-black text-black font-monumental text-2xl tracking-tighter shadow-lg">
            CV
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-monumental text-2xl tracking-tight text-white uppercase">
                CIVIC<span className="text-yellow-400">VOICE</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-black tracking-widest uppercase bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
                GUSTAVO ERA
              </span>
            </div>
            <p className="text-[10px] font-mono text-stone-400 tracking-widest uppercase">
              New York Civic Dispatch & Resolution
            </p>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <nav className="hidden md:flex items-center p-1 rounded-xl bg-white/5 border border-white/10 font-mono text-xs">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all ${
              activeTab === 'feed'
                ? 'bg-yellow-400 text-black shadow-md'
                : 'text-stone-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Dispatches</span>
            <span className="px-1.5 py-0.2 rounded bg-black/30 text-[10px]">
              {issuesCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all ${
              activeTab === 'map'
                ? 'bg-yellow-400 text-black shadow-md'
                : 'text-stone-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Ward Radar</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all ${
              activeTab === 'analytics'
                ? 'bg-yellow-400 text-black shadow-md'
                : 'text-stone-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Transparency Score</span>
          </button>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          
          {/* Real Authentication Controls */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/15">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                alt={user?.name}
                className="w-7 h-7 rounded-xl object-cover border border-yellow-400/40"
              />
              <div className="hidden lg:flex flex-col text-left pr-1">
                <span className="text-[11px] font-bold text-white leading-tight truncate max-w-[100px]">
                  {user?.name}
                </span>
                <span className="text-[9px] font-mono text-stone-400 truncate">
                  {user?.role}
                </span>
              </div>
              {getRoleBadge()}
              <button
                onClick={handleLogoutClick}
                className="p-1.5 rounded-xl hover:bg-white/10 text-stone-300 hover:text-rose-300 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all shadow-sm"
              title="Sign in or register"
            >
              <LogIn className="w-3.5 h-3.5 text-yellow-400" />
              <span>Sign In</span>
            </button>
          )}

          {/* Theme Switcher */}
          <ThemeSelector
            currentTheme={currentTheme}
            onSelectTheme={onSelectTheme}
          />

          {/* Primary Action Button */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-mono font-black tracking-wider uppercase shadow-lg shadow-yellow-400/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden sm:inline">Dispatch Voice</span>
            <span className="sm:hidden">Report</span>
          </button>
        </div>

      </div>
    </header>
  );
}
