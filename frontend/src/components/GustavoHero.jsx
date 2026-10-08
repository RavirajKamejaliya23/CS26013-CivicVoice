import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { Send, ArrowDown, Music2, Sparkles, Volume2, ShieldCheck, FileText, CheckCircle2, X } from 'lucide-react';

export default function GustavoHero({ onOpenReportModal, onScrollToVault, totalIssues, verifiedCount }) {
  const [isManifestoOpen, setIsManifestoOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 24;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 24;
    setMousePos({ x, y });
  };

  const handleEnvelopeClick = () => {
    sound.playOrchestralChime();
    setIsManifestoOpen(true);
  };

  return (
    <section className="relative w-full pt-8 pb-16 overflow-hidden select-none">
      
      {/* Top Movement Marker */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded bg-yellow-400 text-black font-mono font-black text-xs uppercase tracking-widest">
            OVERTURE 01
          </span>
          <span className="font-mono text-xs text-stone-400 tracking-widest uppercase hidden sm:inline">
            // DIRECT CITIZEN SCORE & DISPATCH
          </span>
        </div>

        {/* Live Audio Visualizer Bars */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <Music2 className="w-3.5 h-3.5 text-yellow-400" />
          <div className="flex items-end gap-1 h-4">
            <span className="w-1 bg-yellow-400 rounded-full animate-waveform-1" />
            <span className="w-1 bg-yellow-400 rounded-full animate-waveform-2" />
            <span className="w-1 bg-yellow-400 rounded-full animate-waveform-3" />
            <span className="w-1 bg-yellow-400 rounded-full animate-waveform-4" />
            <span className="w-1 bg-yellow-400 rounded-full animate-waveform-5" />
          </div>
          <span className="font-mono text-[10px] text-stone-400 uppercase tracking-widest ml-1">
            ALL 12 WARDS ACTIVE
          </span>
        </div>
      </div>

      {/* Monumental Condensed Headline (NY Phil / JKR style) */}
      <div className="text-center sm:text-left space-y-2 mb-10">
        <h1
          className="font-monumental text-6xl sm:text-8xl md:text-9xl lg:text-[11.5rem] tracking-tighter uppercase select-none drop-shadow-2xl"
          style={{ color: 'var(--theme-heading, #ffffff)' }}
        >
          THIS CITY <br />
          <span className="text-yellow-400 underline decoration-white/20 underline-offset-8">
            BELONGS TO YOU.
          </span>
        </h1>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
          <p
            className="font-mono text-xs sm:text-sm uppercase tracking-wider max-w-xl"
            style={{ color: 'var(--theme-text-secondary, #d6d3d1)' }}
          >
            You are the conductor of your street. Report infrastructure hazards, co-sign neighbor dispatches, and certify city hall resolutions with photographic proof.
          </p>

          <div className="flex items-center gap-4">
            <div className="text-right font-mono">
              <div className="text-2xl font-black text-yellow-400">{totalIssues}</div>
              <div className="text-[10px] text-stone-400 uppercase tracking-widest">Dispatches Logged</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-right font-mono">
              <div className="text-2xl font-black text-emerald-400">92.4%</div>
              <div className="text-[10px] text-stone-400 uppercase tracking-widest">Resolution Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Center 3D Floating Airmail Artifact (User Uploaded Image 1) */}
      <div 
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
        className="relative w-full max-w-3xl mx-auto my-10 aspect-[16/9] flex items-center justify-center cursor-pointer group"
        onClick={handleEnvelopeClick}
        title="Click to unfold the Citizen Manifesto & Score"
      >
        {/* Glow Behind Envelope */}
        <div className="absolute inset-12 rounded-full bg-yellow-400/20 blur-3xl group-hover:bg-yellow-400/35 transition-all duration-500" />

        {/* 3D Envelope Container with Interactive Tilt */}
        <div 
          style={{
            transform: `perspective(1000px) rotateY(${mousePos.x}deg) rotateX(${-mousePos.y}deg) scale(${isManifestoOpen ? 0.95 : 1})`,
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          className="relative w-full max-w-xl"
        >
          <img
            src="/assets/envelope-airmail.png"
            alt="Airmail Envelope"
            className="w-full h-auto object-contain studio-shadow rounded-2xl group-hover:scale-102 transition-transform duration-300"
          />

          {/* Interactive Postal Stamps & Badges on the Envelope */}
          <div className="absolute top-4 left-6 px-3 py-1 rounded bg-black/80 backdrop-blur-md border border-yellow-400 text-yellow-400 font-mono text-[10px] font-bold tracking-widest uppercase shadow-xl">
            AIRMAIL DISPATCH // 2026
          </div>

          <div className="absolute bottom-6 right-6 px-3 py-1.5 rounded-xl bg-yellow-400 text-black font-mono text-xs font-black tracking-wider uppercase shadow-xl flex items-center gap-1.5 group-hover:scale-105 transition-transform">
            <FileText className="w-3.5 h-3.5" />
            <span>CLICK TO UNFOLD SCORE</span>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 border-dashed border-red-500/80 flex items-center justify-center font-mono text-[9px] font-black text-red-500 uppercase rotate-12 bg-white/70 backdrop-blur-sm pointer-events-none">
            SEALED
          </div>
        </div>
      </div>

      {/* JKR Style Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 my-8">
        <button
          onClick={() => {
            sound.playTimpani();
            onOpenReportModal();
          }}
          className="w-full sm:w-auto px-9 py-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-mono font-black text-sm uppercase tracking-widest shadow-2xl transition-all transform active:scale-95 flex items-center justify-center gap-3"
        >
          <Send className="w-4 h-4 stroke-[2.5]" />
          <span>DISPATCH YOUR VOICE</span>
        </button>

        <button
          onClick={onScrollToVault}
          className="w-full sm:w-auto px-8 py-4 rounded-xl bg-transparent hover:bg-white/10 text-white border-2 border-white/20 hover:border-yellow-400 font-mono font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2"
        >
          <span>ENTER THE SORTING DEPOT</span>
          <ArrowDown className="w-4 h-4 text-yellow-400 animate-bounce" />
        </button>
      </div>

      {/* Fullscreen Kinetic Marquee Ticker */}
      <div className="w-full overflow-hidden border-y-2 border-yellow-400/40 bg-black py-3.5 my-8">
        <div className="animate-marquee font-monumental text-2xl sm:text-3xl tracking-tight text-white uppercase whitespace-nowrap flex items-center gap-8">
          <span>CIVICVOICE × NEW YORK DISPATCH</span>
          <span className="text-yellow-400">★</span>
          <span>THIS CITY SINGS WHEN IT'S HEARD</span>
          <span className="text-yellow-400">★</span>
          <span>REPORTED → HEARD → RESOLVED</span>
          <span className="text-yellow-400">★</span>
          <span>ALL 12 WARDS CONDUCTED</span>
          <span className="text-yellow-400">★</span>
          <span>NO BUREAUCRATIC BLACK HOLES</span>
          <span className="text-yellow-400">★</span>
          <span>CIVICVOICE × NEW YORK DISPATCH</span>
          <span className="text-yellow-400">★</span>
          <span>THIS CITY SINGS WHEN IT'S HEARD</span>
          <span className="text-yellow-400">★</span>
        </div>
      </div>

      {/* Origami Unfolded Letter Modal */}
      {isManifestoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setIsManifestoOpen(false)} />

          <div className="relative w-full max-w-2xl bg-[#faf6ea] text-stone-900 rounded-3xl p-6 sm:p-10 shadow-2xl z-10 border-4 border-yellow-400 flex flex-col max-h-[90vh] overflow-y-auto">
            
            {/* Airmail Border on Top */}
            <div className="h-2 w-full airmail-border rounded-full mb-6" />

            <div className="flex items-start justify-between border-b-2 border-stone-300 pb-4 mb-6">
              <div>
                <span className="font-mono text-xs font-bold text-red-700 uppercase tracking-widest">
                  OFFICIAL CITIZEN SCORE & DISPATCH MANIFESTO
                </span>
                <h3 className="font-monumental text-3xl sm:text-4xl text-black uppercase mt-1">
                  The Symphony of the Street
                </h3>
              </div>
              <button
                onClick={() => setIsManifestoOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs sm:text-sm text-stone-800 leading-relaxed">
              <p className="font-bold">
                To the Mayor, Municipal Council, and All City Stewards:
              </p>
              <p>
                Every pothole on Main Street is an interrupted rhythm. Every dark streetlamp on South Boulevard is a chord missing in the night. Every flooded storm drain is a discordance in our public life.
              </p>
              <p>
                Through <strong>CivicVoice</strong>, we do not merely complain into a void. We dispatch verified coordinates. We co-sign as a neighborhood orchestra. And when the municipal repair squad arrives with hot asphalt, we audit the resolution before signing off.
              </p>
              
              <div className="p-4 rounded-2xl bg-amber-100/60 border border-amber-300 space-y-2 mt-4">
                <div className="font-bold text-black uppercase text-xs">
                  The 3 Civic Movements:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div><strong>I. The Dispatch:</strong> Pin & photograph the problem.</div>
                  <div><strong>II. The Co-Sign:</strong> Community amplifies priority.</div>
                  <div><strong>III. The Finale:</strong> Citizen certifies completion.</div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t-2 border-stone-300 flex items-center justify-between">
              <div className="text-[10px] font-mono text-stone-500 uppercase">
                CERTIFIED OCTOBER 2026 // ALL WARDS
              </div>
              <button
                onClick={() => {
                  setIsManifestoOpen(false);
                  onOpenReportModal();
                }}
                className="px-6 py-2.5 rounded-xl bg-black text-yellow-400 font-mono font-bold text-xs uppercase tracking-wider hover:bg-stone-800 transition-colors"
              >
                Dispatch Report Now →
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
