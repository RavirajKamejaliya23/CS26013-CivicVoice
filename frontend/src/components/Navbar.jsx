import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck, UserCheck, Shield, LogOut, LogIn,
  MapPin, BarChart3, Newspaper, Building2, Settings, Menu, X, Users,
  ListTodo, Layers, Eye, ChevronDown, PlusCircle, HelpCircle
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
  onOpenHelpModal,
  onOpenProfileModal,
  onOpenMunicipalOnboarding,
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
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
        <UserCheck className="w-3 h-3 text-blue-300" />
        <span>Citizen</span>
      </span>
    );
  };

  // Role-specific primary and secondary navigation
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
      roleLabel: 'Citizen Public Service Portal',
      primary: [
        { id: 'home', label: 'Home', icon: UserCheck },
        { id: 'feed', label: 'Nearby Problems', icon: Newspaper, badge: issuesCount },
        { id: 'activity', label: 'My Complaints', icon: ListTodo },
        { id: 'map', label: 'City Map', icon: MapPin },
      ],
      secondary: [
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
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[var(--theme-surface,#FFFDF5)]/95 border-b border-[var(--theme-card-border,#E7DDC5)] shadow-xs transition-colors">
      {/* ── Main Top Navigation Bar ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3">
        {/* LEFT: Brand / Logo with Indian Municipal Context */}
        <div
          className="flex items-center gap-3 flex-shrink-0 cursor-pointer"
          onClick={() =>
            handleTabClick(
              role === 'MUNICIPAL' ? 'municipal' : role === 'ADMIN' ? 'admin' : 'home'
            )
          }
        >
          <div className="w-10 h-10 rounded-xl bg-[#E9B928] p-1 flex items-center justify-center font-black text-[#22231F] font-monumental text-2xl tracking-tighter shadow-sm">
            CV
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="font-monumental text-xl tracking-tight text-[var(--theme-heading,#29261F)] uppercase">
                CIVIC<span className="text-[#E9B928]">VOICE</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-widest uppercase bg-[#F5F0E3] text-[#22231F] border border-[#E7E3D8]">
                {role || 'CITIZEN'}
              </span>
            </div>
            <p className="text-[10px] font-mono text-[var(--theme-text-secondary,#625D52)] tracking-wider">
              Report local problems. Track real solutions.
            </p>
          </div>
        </div>

        {/* CENTER/LEFT: Responsive Role-specific Navigation */}
        <nav className="hidden lg:flex items-center p-1 rounded-2xl bg-[var(--theme-pill-bg,#F5F0E3)] border border-[var(--theme-card-border,#E7DDC5)] font-mono text-xs flex-shrink-0">
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
                    ? 'bg-[#E9B928] text-[#22231F] shadow-xs font-black'
                    : 'text-[var(--theme-text-primary,#29261F)] hover:text-[#22231F] hover:bg-black/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-black/10 text-[var(--theme-text-secondary,#625D52)]'
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
                    ? 'bg-[#8A6418]/15 text-[#8A6418] border border-[#8A6418]/30 font-black'
                    : 'text-[var(--theme-text-primary,#29261F)] hover:text-[#8A6418] hover:bg-black/5'
                }`}
              >
                <span>{isSecondaryActive ? currentTabObj.label : 'More'}</span>
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </button>

              {isMoreOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 rounded-2xl bg-[var(--theme-surface,#FFFDF5)] border border-[var(--theme-card-border,#E7DDC5)] shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  {navConfig.secondary.map((sec) => {
                    const Icon = sec.icon;
                    const isActive = activeTab === sec.id;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => handleTabClick(sec.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all text-left ${
                          isActive
                            ? 'bg-[#8A6418] text-white font-black'
                            : 'text-[var(--theme-text-primary,#29261F)] hover:bg-black/5 hover:text-[#8A6418]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{sec.label}</span>
                      </button>
                    );
                  })}
                  {onOpenMunicipalOnboarding && (
                    <>
                      <div className="border-t border-[var(--theme-card-border,#E7DDC5)] my-1" />
                      <button
                        type="button"
                        onClick={() => {
                          setIsMoreOpen(false);
                          onOpenMunicipalOnboarding();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all text-left text-teal-700 dark:text-teal-400 hover:bg-teal-500/10 cursor-pointer"
                      >
                        <Building2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>Onboard Authority</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* RIGHT: Profile, Role Badge, Theme & Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-1.5 bg-[var(--theme-pill-bg,#FDF1CE)] p-1.5 rounded-2xl border border-[var(--theme-card-border,#E7DDC5)]">
              <button
                onClick={() => onOpenProfileModal && onOpenProfileModal()}
                className="flex items-center gap-2 px-1.5 py-0.5 rounded-xl hover:bg-black/5 transition-all text-left group cursor-pointer"
                title="View My Profile & Submitted Reports"
              >
                <img
                  src={
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80'
                  }
                  alt={user?.name}
                  className="w-7 h-7 rounded-xl object-cover border border-[#8A6418]/30 group-hover:scale-105 transition-transform"
                />
                <div className="hidden xl:flex flex-col text-left pr-1">
                  <span className="text-[11px] font-bold text-[var(--theme-heading,#29261F)] leading-tight truncate max-w-[110px] group-hover:text-[#8A6418] transition-colors">
                    {user?.name}
                  </span>
                  <span className="text-[9px] font-mono text-[var(--theme-text-secondary,#625D52)] truncate">
                    {user?.badge || user?.role}
                  </span>
                </div>
              </button>
              {getRoleBadge()}
              <button
                onClick={handleLogoutClick}
                className="p-1.5 rounded-xl hover:bg-black/5 text-[var(--theme-text-secondary,#625D52)] hover:text-rose-600 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-[#22231F] hover:bg-[#34362F] text-white shadow-xs transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Citizen Help Button */}
          <button
            onClick={onOpenHelpModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#FFFFFF] hover:bg-[#F5F0E3] text-[#22231F] border border-[#E7E3D8] transition-all shadow-xs"
            title="Citizen Guidance & Helplines"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#686B65]" />
            <span>Help</span>
          </button>

          {/* Theme Switcher */}
          <ThemeSelector currentTheme={currentTheme} onSelectTheme={onSelectTheme} />

          {/* Report Button (available to Citizens and public) */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E9B928] hover:bg-[#D5A313] text-[#22231F] text-xs font-extrabold tracking-wide shadow-xs active:scale-95 transition-all"
            title="Report a Civic Problem"
          >
            <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Report an Issue</span>
          </button>


          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-black/5 text-[var(--theme-text-primary,#29261F)] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Sub-bar: Active Breadcrumb & Role Label (Section 6 requirement) ── */}
      <div className="bg-[var(--theme-surface-secondary,#FDF7E7)] border-t border-[var(--theme-card-border,#E7DDC5)] py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] font-mono text-[var(--theme-text-secondary,#625D52)]">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-[var(--theme-text-primary,#29261F)] font-semibold">{navConfig.roleLabel}</span>
            <span className="text-[var(--theme-text-muted,#787367)]">›</span>
            <span className="text-[#8A6418] font-bold">{currentTabObj.label}</span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-[10px] text-[var(--theme-text-muted,#787367)] uppercase tracking-widest">
            <span>Civic Issue Redressal</span>
            <span>•</span>
            <span>Connected Local Authorities</span>
          </div>
        </div>
      </div>

      {/* ── Mobile Sidebar Drawer ────────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[var(--theme-card-border,#E7DDC5)] bg-[var(--theme-surface,#FFFDF5)] shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1.5">
            <div className="text-[10px] font-mono text-[var(--theme-text-secondary,#625D52)] uppercase tracking-wider px-3 pb-1">
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
                      ? 'bg-[#8A6418] text-white shadow-sm font-black'
                      : 'text-[var(--theme-text-primary,#29261F)] hover:bg-[var(--theme-pill-bg,#FDF1CE)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded bg-black/10 font-mono">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Mobile Help Button */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (onOpenHelpModal) onOpenHelpModal();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-[var(--theme-text-primary,#29261F)] hover:bg-[var(--theme-pill-bg,#FDF1CE)] transition-all text-left"
            >
              <HelpCircle className="w-4 h-4 text-[#8A6418]" />
              <span>Help & Helplines</span>
            </button>

            {/* Mobile Municipal Onboarding Button */}
            {onOpenMunicipalOnboarding && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenMunicipalOnboarding();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-teal-700 dark:text-teal-400 hover:bg-teal-500/10 transition-all text-left"
              >
                <Building2 className="w-4 h-4 text-teal-600" />
                <span>Onboard Authority</span>
              </button>
            )}

            {/* Mobile Auth info */}
            <div className="pt-3 border-t border-[var(--theme-card-border,#E7DDC5)] mt-3">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (onOpenProfileModal) onOpenProfileModal();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-black/5 transition-all text-left"
                    title="View My Profile & Submitted Reports"
                  >
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80'}
                      alt={user?.name}
                      className="w-8 h-8 rounded-xl object-cover border border-[#8A6418]/30"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-[var(--theme-heading,#29261F)] truncate">{user?.name}</div>
                      <div className="text-[10px] font-mono text-[#8A6418] font-bold">
                        View Profile & Reports ›
                      </div>
                    </div>
                    <div>{getRoleBadge()}</div>
                  </button>
                  <button
                    onClick={handleLogoutClick}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-mono font-bold uppercase tracking-wider transition-colors"
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
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#8A6418] text-white text-xs font-mono font-bold uppercase tracking-wider"
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
