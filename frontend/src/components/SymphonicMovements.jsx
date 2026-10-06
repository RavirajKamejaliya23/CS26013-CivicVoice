import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { Music, CheckCircle2, RotateCcw, Clock, Sparkles, Volume2, Shield } from 'lucide-react';

export default function SymphonicMovements({ issues, onSelectIssue }) {
  const [activeMovementIndex, setActiveMovementIndex] = useState(0);

  const movements = [
    {
      roman: 'I',
      tempo: 'ALLEGRO',
      title: 'The Citizen Dispatch',
      statusKey: 'reported',
      subtitle: 'The initial civic report is struck with GPS coordinates and photographic evidence.',
      badgeColor: 'bg-amber-400 text-black',
      tone: 'timpani'
    },
    {
      roman: 'II',
      tempo: 'ANDANTE',
      title: 'Municipal Review',
      statusKey: 'under_review',
      subtitle: 'Ward dispatch supervisor inspects GIS location and assesses public safety severity.',
      badgeColor: 'bg-orange-400 text-black',
      tone: 'brass'
    },
    {
      roman: 'III',
      tempo: 'MODERATO',
      title: 'Department Accepted',
      statusKey: 'accepted',
      subtitle: 'Formal work order generated and routed to specialized squad (Asphalt, Electrical, Drain).',
      badgeColor: 'bg-blue-400 text-black',
      tone: 'harp'
    },
    {
      roman: 'IV',
      tempo: 'CRESCENDO',
      title: 'Squads In Progress',
      statusKey: 'in_progress',
      subtitle: 'Heavy rollers, hydro-jetting, and maintenance teams dispatched directly to the street.',
      badgeColor: 'bg-purple-400 text-black',
      tone: 'timpani'
    },
    {
      roman: 'V',
      tempo: 'FORTE',
      title: 'Repair Completed',
      statusKey: 'completed',
      subtitle: 'Field team finishes construction and attaches mandatory Before/After photo evidence.',
      badgeColor: 'bg-teal-400 text-black',
      tone: 'chime'
    },
    {
      roman: 'VI',
      tempo: 'HARMONICO',
      title: 'Citizen Certified',
      statusKey: 'citizen_verified',
      subtitle: 'Residents audit the physical street and grant community certification of resolution.',
      badgeColor: 'bg-emerald-400 text-black',
      tone: 'chime'
    }
  ];

  const handleSelectMovement = (idx) => {
    setActiveMovementIndex(idx);
    const m = movements[idx];
    if (m.tone === 'chime') sound.playOrchestralChime();
    else if (m.tone === 'timpani') sound.playTimpani();
    else sound.playStampThud();
  };

  const currentMovement = movements[activeMovementIndex];
  const matchingIssues = issues.filter(i => i.status === currentMovement.statusKey);

  return (
    <section className="w-full py-16 border-t-2 border-white/10 select-none">
      
      {/* Movement Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-yellow-400 uppercase tracking-widest mb-1.5">
            <Music className="w-4 h-4" />
            <span>THE 6 MOVEMENTS OF RESOLUTION</span>
          </div>
          <h2 className="font-monumental text-4xl sm:text-6xl text-white uppercase tracking-tight">
            How The City Orchestrates Change
          </h2>
        </div>

        <div className="font-mono text-xs text-stone-400 uppercase tracking-wider">
          Click any movement below to inspect corresponding dispatches
        </div>
      </div>

      {/* Movement Selector Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {movements.map((movement, idx) => {
          const isActive = activeMovementIndex === idx;

          return (
            <button
              key={movement.roman}
              onClick={() => handleSelectMovement(idx)}
              className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col justify-between h-36 ${
                isActive
                  ? 'bg-yellow-400 border-yellow-400 text-black shadow-[0_0_30px_rgba(255,221,0,0.3)] scale-102'
                  : 'bg-stone-900/80 border-white/15 text-white hover:border-yellow-400/50 hover:bg-stone-800'
              }`}
            >
              <div className="flex items-center justify-between w-full font-mono text-xs">
                <span className="font-black text-lg">{movement.roman}.</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                  isActive ? 'bg-black text-yellow-400' : 'bg-white/10 text-stone-300'
                }`}>
                  {movement.tempo}
                </span>
              </div>

              <div>
                <div className="font-bold text-xs uppercase leading-tight font-sans">
                  {movement.title}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Movement Dossier Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-stone-900/90 border-2 border-white/15 backdrop-blur-md shadow-2xl flex flex-col lg:flex-row items-start justify-between gap-6">
        
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded bg-yellow-400 text-black font-mono font-black text-xs uppercase">
              MOVEMENT {currentMovement.roman} // {currentMovement.tempo}
            </span>
            <span className="font-mono text-xs text-stone-400 uppercase">
              {matchingIssues.length} ACTIVE DISPATCHES IN THIS STAGE
            </span>
          </div>

          <h3 className="font-monumental text-3xl sm:text-4xl text-white uppercase tracking-tight">
            {currentMovement.title}
          </h3>

          <p className="font-mono text-xs sm:text-sm text-stone-300 leading-relaxed">
            {currentMovement.subtitle}
          </p>
        </div>

        {/* Mini Dispatches preview in this movement */}
        <div className="w-full lg:w-96 space-y-2">
          <div className="font-mono text-[11px] text-stone-400 uppercase tracking-widest pb-1 border-b border-white/10">
            Dispatches in {currentMovement.title}:
          </div>

          {matchingIssues.length === 0 ? (
            <div className="p-4 rounded-xl bg-black/40 text-stone-500 font-mono text-xs text-center">
              All tickets have advanced past this movement.
            </div>
          ) : (
            matchingIssues.slice(0, 2).map((issue) => (
              <div
                key={issue.id}
                onClick={() => onSelectIssue(issue)}
                className="p-3 rounded-xl bg-black/50 hover:bg-black border border-white/10 hover:border-yellow-400 cursor-pointer transition-all flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="font-mono text-xs font-bold text-yellow-400 truncate">
                    {issue.id}
                  </div>
                  <div className="text-xs text-white truncate font-medium">
                    {issue.title}
                  </div>
                </div>
                <span className="font-mono text-[10px] text-stone-400 uppercase flex-shrink-0">
                  Inspect →
                </span>
              </div>
            ))
          )}
        </div>

      </div>

    </section>
  );
}
