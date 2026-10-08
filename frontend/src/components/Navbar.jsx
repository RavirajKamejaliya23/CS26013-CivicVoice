import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck, UserCheck, Shield, LogOut, LogIn,
  MapPin, BarChart3, Newspaper, Building2, Settings, Menu, X, Users,
  ListTodo, Layers, Eye, ChevronDown, PlusCircle
} from 'lucide-react';
import ThemeSelector from './ThemeSelector';
import { useAuth } from '../context/AuthContext';
import { safePlaySound } from '../utils/audio';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreDropdownRef = useRef(null);

  // Close more dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    safePlaySound('playTick');
    logout();
    setIsMobileMenuOpen(false);
  };

  const getRoleBadge = () => {
    if (!isAuthenticated) return null;
    if (role === 'ADMIN') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
          <Shield className="w-3 h-3 text-amber-400" />
          <span>Admin</span>
        </span>
      );
    }
    if (role === 'MUNICIPAL') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-600/30 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3 h-3 text-purple-300" />
          <span>Municipal Officer</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 text-[10px] font-mono font-bold uppercase tracking-wider">
        <UserCheck className="w-3 h-3 text-yellow-300" />
        <span>Citizen</span>
      </span>
    );
  };

  // Role-specific primary and secondary navigation (Section 5 specification)
  const getNavConfiguration = () => {
    if (role === 'ADMIN') {
      return {
        roleLabel: 'Civic Administration Console',
        primary: [
          { id: 'admin', label: 'Overview', icon: Settings },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'feed', label: 'Complaints', icon: Newspaper, badge: issuesCount },
        ],
        secondary: [
          { id: 'duplicates', label: 'Duplicates', icon: Eye },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        ],
      };
    }

    if (role === 'MUNICIPAL') {
      return {
        roleLabel: 'Municipal Officer Portal',
        primary: [
          { id: 'municipal', label: 'Overview', icon: Building2 },
          { id: 'feed', label: 'Complaints', icon: Newspaper, badge: issuesCount },
          { id: 'map', label: 'Map', icon: MapPin },
        ],
        secondary: [
          { id: 'departments', label: 'Departments', icon: Layers },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        ],
      };
    }

    // Citizen or Unauthenticated Public
    return {
      roleLabel: 'Citizen Civic Portal',
      primary: [
        { id: 'citizen', label: 'Home', icon: UserCheck },
        { id: 'feed', label: 'Complaints', icon: Newspaper, badge: issuesCount },
        { id: 'map', label: 'Map', icon: MapPin },
      ],
      secondary: [
        { id: 'activity', label: 'My Activity', icon: ListTodo },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      ],
    };
  };

  const navConfig = getNavConfiguration();
  const allTabs = [...navConfig.primary, ...navConfig.secondary];

  const handleTabClick = (tabId) => {
    safePlaySound('playTick');
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
    setIsMoreOpen(false);
  };

  // Find active label for breadcrumb
  const currentTabObj = allTabs.find((t) => t.id === activeTab) || navConfig.primary[0];
  const isSecondaryActive = navConfig.secondary.some((t) => t.id === activeTab);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-stone-950/90 border-b border-white/10 transition-colors">
      {/* ── Main Top Navigation Bar ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3">
        {/* LEFT: Brand / Logo with Indian Municipal Context */}
        <div
          className="flex items-center gap-3 flex-shrink-0 cursor-pointer"
          onClick={() =>
            handleTabClick(
              role === 'MUNICIPAL' ? 'municipal' : role === 'ADMIN' ? 'admin' : 'citizen'
            )
          }
        >
          <div className="w-10 h-10 rounded-xl bg-yellow-400 p-1 flex items-center justify-center font-black text-black font-monumental text-2xl tracking-tighter shadow-md">
            CV
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="font-monumental text-xl tracking-tight text-white uppercase">
                CIVIC<span className="text-yellow-400">VOICE</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-black tracking-widest uppercase bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
                {role || 'CITIZEN'}
              </span>
            </div>
            <p className="text-[10px] font-mono text-stone-400 tracking-wider">
              Vadodara Municipal Corporation
            </p>
          </div>
        </div>

        {/* CENTER/LEFT: Responsive Role-specific Navigation */}
        <nav className="hidden lg:flex items-center p-1 rounded-2xl bg-white/5 border border-white/10 font-mono text-xs flex-shrink-0">
          {/* Primary items */}
          {navConfig.primary.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-yellow-400 text-stone-950 shadow-md font-black'
                    : 'text-stone-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                      isActive ? 'bg-black/20 text-black' : 'bg-white/10 text-stone-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Secondary "More ▾" auto-collapse dropdown */}
          {navConfig.secondary.length > 0 && (
            <div className="relative" ref={moreDropdownRef}>
              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap ${
                  isSecondaryActive
                    ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 font-black'
                    : 'text-stone-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{isSecondaryActive ? currentTabObj.label : 'More'}</span>
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </button>

              {isMoreOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl bg-stone-900 border border-stone-700 shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  {navConfig.secondary.map((sec) => {
                    const Icon = sec.icon;
                    const isActive = activeTab === sec.id;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => handleTabClick(sec.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all text-left ${
                          isActive
                            ? 'bg-yellow-400 text-stone-950 font-black'
                            : 'text-stone-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{sec.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* RIGHT: Profile, Role Badge, Theme & Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/15">
              <img
                src={
                  user?.avatar ||
                  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80'
                }
                alt={user?.name}
                className="w-7 h-7 rounded-xl object-cover border border-yellow-400/40"
              />
              <div className="hidden xl:flex flex-col text-left pr-1">
                <span className="text-[11px] font-bold text-white leading-tight truncate max-w-[110px]">
                  {user?.name}
                </span>
                <span className="text-[9px] font-mono text-stone-400 truncate">
                  {user?.badge || user?.role}
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
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5 text-yellow-400" />
              <span>Sign In</span>
            </button>
          )}

          {/* Theme Switcher */}
          <ThemeSelector currentTheme={currentTheme} onSelectTheme={onSelectTheme} />

          {/* Report Button (available to Citizens and public) */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-mono font-black tracking-wider uppercase shadow-md shadow-yellow-400/20 active:scale-95 transition-all"
            title="Report a Civic Problem"
          >
            <PlusCircle className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden sm:inline">Report</span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-white/10 text-stone-300 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Sub-bar: Active Breadcrumb & Role Label (Section 6 requirement) ── */}
      <div className="bg-black/40 border-t border-white/5 py-1 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] font-mono text-stone-400">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-stone-300 font-semibold">{navConfig.roleLabel}</span>
            <span className="text-stone-600">›</span>
            <span className="text-yellow-400 font-bold">{currentTabObj.label}</span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-[10px] text-stone-500 uppercase tracking-widest">
            <span>Vadodara Municipal Corporation (VMC)</span>
            <span>•</span>
            <span>Zero-cost Civic Tech</span>
          </div>
        </div>
      </div>

      {/* ── Mobile Sidebar Drawer ────────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-stone-950/98 backdrop-blur-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1.5">
            <div className="text-[10px] font-mono text-stone-500 uppercase tracking-wider px-3 pb-1">
              {navConfig.roleLabel}
            </div>

            {/* Nav tabs */}
            {allTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all text-left ${
                    isActive
                      ? 'bg-yellow-400 text-stone-950 shadow-md font-black'
                      : 'text-stone-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded bg-black/20 font-mono">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Mobile Auth info */}
            <div className="pt-3 border-t border-white/10 mt-3">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-3 py-1">
                    <img
                      src={user?.avatar}
                      alt={user?.name}
                      className="w-8 h-8 rounded-xl object-cover border border-yellow-400/40"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{user?.name}</div>
                      <div className="text-[10px] font-mono text-stone-400">
                        {user?.badge || user?.role}
                      </div>
                    </div>
                    <div className="ml-auto">{getRoleBadge()}</div>
                  </div>
                  <button
                    onClick={handleLogoutClick}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-rose-300 hover:bg-rose-950/40 text-xs font-mono font-bold uppercase tracking-wider transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAuthModal();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-400 text-stone-950 text-xs font-mono font-bold uppercase tracking-wider"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
