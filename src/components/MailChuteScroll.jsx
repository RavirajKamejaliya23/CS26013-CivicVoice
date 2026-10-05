import React, { useEffect, useState } from 'react';
import { ArrowDown, Mail, Scan, ShieldAlert, Cpu, Layers } from 'lucide-react';

export default function MailChuteScroll({ recentMails = [] }) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(window.scrollY / totalHeight);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative w-full py-20 overflow-hidden my-12 border-y border-stone-800/20 dark:border-stone-700/40 bg-stone-950 text-white select-none">
      
      {/* Metallic Chute Vertical Guidelines */}
      <div className="absolute inset-0 flex justify-around pointer-events-none opacity-20">
        <div className="w-px h-full bg-gradient-to-b from-amber-500/80 via-white/40 to-amber-500/80 border-r border-dashed" />
        <div className="w-px h-full bg-gradient-to-b from-amber-500/80 via-white/40 to-amber-500/80 border-r border-dashed" />
        <div className="w-px h-full bg-gradient-to-b from-amber-500/80 via-white/40 to-amber-500/80 border-r border-dashed" />
      </div>

      {/* Atmospheric Chute Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-red-600/30 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-amber-500/20 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-4 relative z-10 flex flex-col items-center">
        
        {/* Chute Intake Portal Marker */}
        <div className="text-center space-y-2 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-900 border border-amber-500/40 text-amber-400 font-mono text-[11px] font-bold tracking-widest uppercase shadow-lg">
            <Scan className="w-3.5 h-3.5 animate-pulse" />
            <span>GRAVITY MAIL CHUTE // INTERIOR POSTAL TRANSIT</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-stone-100 font-sans">
            Descending into Municipal Vault
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 font-mono max-w-lg mx-auto">
            Dispatched letters travel downward from street level into optical scanning chambers and department bins.
          </p>
        </div>

        {/* Dynamic Downward Flowing Envelopes */}
        <div className="relative w-full h-96 flex items-center justify-center">
          
          {/* Optical Scanner Laser Beam Bar */}
          <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#f59e0b] z-20 flex items-center justify-between px-6 pointer-events-none">
            <span className="text-[9px] font-mono font-bold text-amber-400 tracking-widest uppercase bg-stone-950 px-2 rounded">
              OPTICAL OCR SCAN
            </span>
            <span className="text-[9px] font-mono font-bold text-amber-400 tracking-widest uppercase bg-stone-950 px-2 rounded">
              GPS GEO-LOCK 99.4%
            </span>
          </div>

          {/* Letter 1: Falling from upper left */}
          <div 
            style={{ transform: `translateY(${Math.sin(scrollProgress * 8) * 35}px) rotate(${-12 + Math.sin(scrollProgress * 5) * 8}deg)` }}
            className="absolute left-4 sm:left-16 top-8 w-48 p-4 rounded-2xl bg-stone-900/90 border border-stone-700 shadow-2xl backdrop-blur-md transition-transform duration-300 z-10"
          >
            <div className="h-1 w-full airmail-border rounded-full mb-2" />
            <div className="flex items-center justify-between text-[10px] font-mono text-amber-400">
              <span>DISPATCH #9481</span>
              <span>WARD 3</span>
            </div>
            <div className="text-xs font-bold text-white mt-1 truncate">
              Main St Pothole Report
            </div>
            <div className="text-[10px] text-stone-400 font-mono mt-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Scanning Pavement Photo...</span>
            </div>
          </div>

          {/* Letter 2: Passing directly through center scanner */}
          <div 
            style={{ transform: `translateY(${Math.cos(scrollProgress * 10) * 20}px) rotate(${4}deg) scale(1.05)` }}
            className="relative w-56 p-4 rounded-2xl bg-stone-900 border-2 border-amber-500/80 shadow-[0_0_30px_rgba(245,158,11,0.25)] z-30"
          >
            <div className="h-1.5 w-full airmail-border rounded-full mb-2" />
            <div className="flex items-center justify-between text-[10px] font-mono text-stone-300">
              <span className="text-amber-400 font-bold">#9482 // IN TRANSIT</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[9px]">DRAINAGE</span>
            </div>
            <div className="text-xs font-bold text-white mt-1">
              Storm Drain Flood Overflow
            </div>
            <div className="mt-2 pt-2 border-t border-stone-800 text-[10px] font-mono text-stone-400 flex items-center justify-between">
              <span>Sorting to DPW...</span>
              <span className="text-emerald-400 font-bold">PASS ✓</span>
            </div>
          </div>

          {/* Letter 3: Falling lower right into sorting bin */}
          <div 
            style={{ transform: `translateY(${-Math.sin(scrollProgress * 8) * 35}px) rotate(${14 + Math.cos(scrollProgress * 4) * 6}deg)` }}
            className="absolute right-4 sm:right-16 bottom-8 w-48 p-4 rounded-2xl bg-stone-900/90 border border-stone-700 shadow-2xl backdrop-blur-md transition-transform duration-300 z-10"
          >
            <div className="h-1 w-full airmail-border rounded-full mb-2" />
            <div className="flex items-center justify-between text-[10px] font-mono text-amber-400">
              <span>DISPATCH #9483</span>
              <span>WARD 2</span>
            </div>
            <div className="text-xs font-bold text-white mt-1 truncate">
              South Blvd Power Outage
            </div>
            <div className="text-[10px] text-stone-400 font-mono mt-2 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span>Routing to Grid Bureau</span>
            </div>
          </div>

        </div>

        {/* Downward transit indicator */}
        <div className="mt-8 flex items-center gap-3 text-xs font-mono text-stone-400">
          <ArrowDown className="w-4 h-4 text-amber-400 animate-bounce" />
          <span>Entering Underground Sorting Depository Below</span>
          <ArrowDown className="w-4 h-4 text-amber-400 animate-bounce" />
        </div>

      </div>
    </section>
  );
}
