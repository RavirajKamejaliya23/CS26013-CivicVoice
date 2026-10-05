import React from 'react';
import { Mail, PlusCircle, ShieldCheck, UserCheck, MapPin, BarChart3, Newspaper, Sparkles, Volume2 } from 'lucide-react';
import ThemeSelector from './ThemeSelector';

export default function Navbar({
  currentTheme,
  onSelectTheme,
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  onOpenReportModal,
  issuesCount
}) {
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
          
          {/* Role Switcher */}
          <button
            onClick={() => setUserRole(userRole === 'citizen' ? 'admin' : 'citizen')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider border transition-all ${
              userRole === 'admin'
                ? 'bg-purple-600 text-white border-purple-500 shadow-md'
                : 'bg-white/10 text-stone-200 border-white/15 hover:bg-white/15'
            }`}
            title="Toggle Citizen vs Municipal Officer"
          >
            {userRole === 'admin' ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-yellow-300" />
                <span className="hidden sm:inline">Officer</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5 text-stone-400" />
                <span className="hidden sm:inline">Citizen</span>
              </>
            )}
          </button>

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
