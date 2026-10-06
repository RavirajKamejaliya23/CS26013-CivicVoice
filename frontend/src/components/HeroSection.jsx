import React from 'react';
import { Send, MapPin, CheckCircle2, ShieldAlert, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export default function HeroSection({ onOpenReportModal, onViewMap, onFilterCategory, totalIssues, resolvedCount }) {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-12 md:pb-24">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-amber-400/20 dark:bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Postal Dispatch Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-stone-900/80 border border-stone-800/15 dark:border-stone-700/50 backdrop-blur-md shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-stone-800 dark:text-stone-200">
              MUNICIPAL DISPATCH PROTOCOL // ALL 12 WARDS ONLINE
            </span>
          </div>
        </div>

        {/* Main Grid: Headline + 3D Physical Artifacts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Mission & Controls (7 Cols) */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-950 dark:text-stone-50 leading-[1.08]">
              Your Street's Problems.{' '}
              <span className="text-amber-800 dark:text-amber-400 underline decoration-amber-500/40 decoration-wavy underline-offset-8">
                Straight to City Hall.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-stone-700 dark:text-stone-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              No lost emails. No municipal black holes. Dispatch potholes, broken streetlights, or drainage failures directly onto the city map with photo evidence, community endorsements, and citizen-verified resolution.
            </p>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={onOpenReportModal}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-stone-950 hover:bg-stone-800 text-white dark:bg-white dark:text-stone-950 dark:hover:bg-stone-100 font-bold text-sm tracking-wide shadow-xl shadow-stone-950/20 active:scale-95 transition-all flex items-center justify-center gap-3 group"
              >
                <Send className="w-4 h-4 text-amber-400 dark:text-amber-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                <span>Dispatch a Civic Report</span>
              </button>

              <button
                onClick={onViewMap}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/80 dark:bg-stone-900/80 hover:bg-white dark:hover:bg-stone-900 text-stone-900 dark:text-stone-100 font-bold text-sm border border-stone-800/15 dark:border-stone-700/50 shadow-md backdrop-blur-sm transition-all flex items-center justify-center gap-2 group"
              >
                <MapPin className="w-4 h-4 text-stone-500 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
                <span>Explore Ward Radar</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Live Trust Metrics Strip */}
            <div className="pt-6 border-t border-stone-800/10 dark:border-stone-700/40 grid grid-cols-3 gap-4 max-w-xl mx-auto lg:mx-0">
              <div className="bg-white/50 dark:bg-stone-900/40 p-3 rounded-xl border border-stone-800/5 dark:border-stone-700/30">
                <div className="text-2xl font-black font-mono text-stone-900 dark:text-stone-100">
                  {totalIssues}
                </div>
                <div className="text-[11px] font-mono text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                  Active Dispatches
                </div>
              </div>

              <div className="bg-white/50 dark:bg-stone-900/40 p-3 rounded-xl border border-stone-800/5 dark:border-stone-700/30">
                <div className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400">
                  92.4%
                </div>
                <div className="text-[11px] font-mono text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                  Resolution Rate
                </div>
              </div>

              <div className="bg-white/50 dark:bg-stone-900/40 p-3 rounded-xl border border-stone-800/5 dark:border-stone-700/30">
                <div className="text-2xl font-black font-mono text-amber-700 dark:text-amber-400">
                  4.8h
                </div>
                <div className="text-[11px] font-mono text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                  Avg Squad Response
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: 3D Physical Postal Studio Artifacts (5 Cols) */}
          <div className="lg:col-span-5 relative flex justify-center items-center py-6">
            
            {/* Studio Platform Lighting Ring */}
            <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
              
              {/* Studio Backdrop Floor Glow */}
              <div className="absolute inset-8 rounded-full bg-amber-500/20 blur-2xl transform scale-110 pointer-events-none" />

              {/* Element 1: Floating Red Pillarbox */}
              <div className="absolute -left-2 sm:left-4 top-2 sm:top-6 w-36 sm:w-44 z-20 animate-float-gentle transition-transform hover:scale-105 cursor-pointer">
                <div className="relative group">
                  <img
                    src="/assets/postbox-pillar.png"
                    alt="Postal Mailbox"
                    className="w-full h-auto object-contain studio-shadow rounded-2xl"
                  />
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-red-700 text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-md whitespace-nowrap opacity-90 group-hover:opacity-100">
                    Municipal Box #12
                  </div>
                </div>
              </div>

              {/* Element 2: Floating Airmail Envelope */}
              <div className="absolute right-0 sm:right-6 top-8 sm:top-14 w-40 sm:w-48 z-10 animate-float-reverse transition-transform hover:scale-105 cursor-pointer">
                <div className="relative group">
                  <img
                    src="/assets/envelope-airmail.png"
                    alt="Airmail Envelope"
                    className="w-full h-auto object-contain studio-shadow rounded-2xl"
                  />
                  <div className="absolute -top-3 right-2 px-2 py-0.5 rounded bg-amber-500 text-stone-950 text-[9px] font-mono font-extrabold uppercase tracking-wider shadow-sm border border-amber-600/30">
                    AIRMAIL DISPATCH
                  </div>
                </div>
              </div>

              {/* Element 3: Physical Cardboard Parcel Box */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-48 sm:w-60 z-30 transition-transform hover:scale-105 cursor-pointer">
                <div className="relative group">
                  <img
                    src="/assets/parcel-box.png"
                    alt="Postal Parcel"
                    className="w-full h-auto object-contain studio-shadow-subtle"
                  />
                  <div className="absolute bottom-1 right-2 px-2 py-0.5 rounded bg-white/95 dark:bg-stone-900/95 border border-stone-300 dark:border-stone-700 text-[10px] font-mono text-stone-800 dark:text-stone-200 shadow-md">
                    TRACK #CV-2026-9481
                  </div>
                </div>
              </div>

              {/* Floating Postal Verification Badge */}
              <div className="absolute top-0 right-10 z-30 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-stone-900/95 border border-amber-500/40 shadow-lg backdrop-blur-md flex items-center gap-2 animate-bounce duration-1000">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] font-mono font-bold text-stone-900 dark:text-stone-100">
                  Citizen Verified
                </span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
