import React, { useState } from 'react';
import { MapPin, Navigation, Eye, CheckCircle2, AlertCircle, Compass, Layers, Filter } from 'lucide-react';
import { STATUS_CONFIG, CATEGORIES } from '../data/mockIssues';

export default function InteractiveMapPreview({ issues, onSelectIssue, onOpenReportModal }) {
  const [selectedPin, setSelectedPin] = useState(issues[0]);
  const [activeWard, setActiveWard] = useState('all');

  const wards = ['all', 'Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5'];

  const filteredIssues = issues.filter(issue => {
    if (activeWard === 'all') return true;
    return issue.address.includes(activeWard);
  });

  return (
    <div className="relative rounded-3xl overflow-hidden border border-stone-800/20 dark:border-stone-700 bg-stone-900 shadow-2xl flex flex-col min-h-[580px]">
      
      {/* Map Control Top Bar */}
      <div className="p-4 bg-stone-950/80 backdrop-blur-md border-b border-stone-800 z-10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <span>GIS RADAR: CENTRAL MUNICIPAL SECTORS</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[10px] font-mono text-stone-400">
              Real-time spatial incident plotting ({filteredIssues.length} active pins)
            </div>
          </div>
        </div>

        {/* Ward Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          {wards.map((ward) => (
            <button
              key={ward}
              onClick={() => setActiveWard(ward)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all ${
                activeWard === ward
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              {ward === 'all' ? 'All Wards' : ward}
            </button>
          ))}
        </div>
      </div>

      {/* Map Canvas Simulation */}
      <div className="relative flex-1 bg-[#1a2332] overflow-hidden flex items-center justify-center min-h-[440px]">
        
        {/* Cartographic Grid Background Pattern */}
        <div 
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.08) 0%, transparent 60%),
              linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 40px 40px, 40px 40px'
          }}
        />

        {/* Stylized Municipal Roads / Arteries */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
          <path d="M 0,180 Q 250,220 500,160 T 1000,240" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="6 4" />
          <path d="M 120,0 Q 200,300 380,600" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <path d="M 680,0 Q 640,300 740,600" fill="none" stroke="#60a5fa" strokeWidth="2" />
          <path d="M 0,420 Q 400,380 900,440" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.3" />
        </svg>

        {/* Ward Labels */}
        <div className="absolute top-8 left-12 text-[10px] font-mono text-stone-500 tracking-widest uppercase pointer-events-none">
          Sector 1 // Market District
        </div>
        <div className="absolute bottom-12 left-16 text-[10px] font-mono text-stone-500 tracking-widest uppercase pointer-events-none">
          Sector 4 // Heritage Parks
        </div>
        <div className="absolute top-16 right-16 text-[10px] font-mono text-stone-500 tracking-widest uppercase pointer-events-none">
          Sector 3 // Central Civic Hub
        </div>

        {/* Interactive Pinned Issues */}
        {filteredIssues.map((issue, idx) => {
          const isSelected = selectedPin?.id === issue.id;
          const statusInfo = STATUS_CONFIG[issue.status] || STATUS_CONFIG.reported;
          
          // Generate pseudo coordinates for spatial display
          const topPercent = 25 + (idx * 14) % 55;
          const leftPercent = 18 + (idx * 21) % 65;

          return (
            <div
              key={issue.id}
              style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 group"
            >
              <button
                onClick={() => setSelectedPin(issue)}
                className={`relative flex items-center justify-center transition-all ${
                  isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                }`}
              >
                {/* Ping ring if current or reported */}
                <span className={`absolute w-8 h-8 rounded-full ${statusInfo.dot} opacity-30 animate-ping`} />

                {/* Marker Pin */}
                <div className={`w-8 h-8 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white transition-all ${
                  isSelected ? 'bg-amber-500 text-stone-950 ring-4 ring-amber-400/40' : 'bg-stone-900 text-white'
                }`}>
                  <MapPin className="w-4 h-4" />
                </div>
              </button>

              {/* Pin tooltip */}
              <div className="absolute top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-950/90 text-white text-[10px] font-mono px-2 py-1 rounded shadow-md whitespace-nowrap pointer-events-none z-30 border border-stone-800">
                {issue.id}: {issue.title.slice(0, 24)}...
              </div>
            </div>
          );
        })}

        {/* Floating Selected Pin Card (Inspector Drawer) */}
        {selectedPin && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-stone-900/95 backdrop-blur-xl border border-stone-700/80 p-4 rounded-2xl shadow-2xl z-30 text-white animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-xs font-mono font-bold text-amber-400">
                {selectedPin.id}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-800 border border-stone-700 text-stone-300 uppercase">
                {STATUS_CONFIG[selectedPin.status]?.label}
              </span>
            </div>

            <div className="flex gap-3 items-center">
              <img
                src={selectedPin.imageUrl}
                alt={selectedPin.title}
                className="w-16 h-16 rounded-xl object-cover border border-stone-700 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold leading-snug truncate">
                  {selectedPin.title}
                </h4>
                <p className="text-[11px] text-stone-400 truncate mt-0.5">
                  {selectedPin.address}
                </p>
                <div className="text-[10px] text-stone-500 font-mono mt-1">
                  Co-signed by {selectedPin.upvotes} residents
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-stone-800 flex items-center justify-between">
              <button
                onClick={() => onSelectIssue(selectedPin)}
                className="w-full py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Open Dispatch Ledger</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
