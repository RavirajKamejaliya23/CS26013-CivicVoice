import React, { useState, useRef } from 'react';
import { sound } from '../utils/audio';
import { Send, Sparkles, Key, ArrowDown, Check, Volume2, VolumeX, MailOpen, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MailboxStage({ 
  issues, 
  onMailCollected, 
  onOpenReportModal, 
  onScrollToVault,
  collectedCount 
}) {
  const [isSlotHovered, setIsSlotHovered] = useState(false);
  const [isDoorOpen, setIsDoorOpen] = useState(false);
  const [droppingLetterId, setDroppingLetterId] = useState(null);
  const [mailboxShake, setMailboxShake] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [recentDropToast, setRecentDropToast] = useState(null);

  // Queue of uncollected demo letters waiting around the mailbox
  const [queueLetters, setQueueLetters] = useState([
    {
      id: 'CV-DISPATCH-01',
      title: 'Pothole on 4th Ave',
      category: 'Road Hazard',
      stampColor: '#ef4444',
      positionClass: 'top-10 -left-6 sm:top-16 sm:-left-12 rotate-[-8deg]'
    },
    {
      id: 'CV-DISPATCH-02',
      title: 'Broken Streetlamp #14',
      category: 'Night Safety',
      stampColor: '#eab308',
      positionClass: 'top-2 -right-4 sm:top-8 sm:-right-8 rotate-[6deg]'
    },
    {
      id: 'CV-DISPATCH-03',
      title: 'Storm Drain Blocked',
      category: 'Water Overflow',
      stampColor: '#3b82f6',
      positionClass: 'bottom-20 -left-4 sm:bottom-28 sm:-left-10 rotate-[12deg]'
    }
  ]);

  const handleToggleSound = () => {
    const next = sound.toggle();
    setSoundEnabled(next);
  };

  const handleDropLetterIntoSlot = (letter) => {
    if (droppingLetterId) return;

    sound.playPaperWhoosh();
    setDroppingLetterId(letter.id);

    // After animation travels to slot (400ms), trigger mechanical clank
    setTimeout(() => {
      sound.playSlotDrop();
      setMailboxShake(true);

      try {
        confetti({
          particleCount: 35,
          spread: 45,
          origin: { y: 0.45 },
          colors: ['#ef4444', '#f59e0b', '#3b82f6', '#ffffff']
        });
      } catch (e) {}

      setTimeout(() => setMailboxShake(false), 250);

      // Remove letter from stage queue and notify parent
      setQueueLetters(prev => prev.filter(l => l.id !== letter.id));
      setDroppingLetterId(null);
      onMailCollected(letter);

      setRecentDropToast(`Dispatch ${letter.id} slipped into Mailbox #12`);
      setTimeout(() => setRecentDropToast(null), 3500);

    }, 500);
  };

  const handleOpenDoor = () => {
    sound.playStampThud();
    setIsDoorOpen(!isDoorOpen);
  };

  return (
    <div className="relative w-full py-8 sm:py-14 flex flex-col items-center justify-center select-none overflow-hidden">
      
      {/* Top Floating Control Bar */}
      <div className="w-full max-w-4xl px-4 flex items-center justify-between mb-4 z-20">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-stone-900/90 text-amber-300 font-mono text-[11px] font-bold tracking-widest uppercase border border-amber-500/30 shadow-md">
            POSTAL RADAR // LIVE DROP ZONE
          </span>
          <button
            onClick={handleToggleSound}
            className="p-1.5 rounded-full bg-white/70 dark:bg-stone-800/70 border border-stone-300 dark:border-stone-700 hover:bg-white text-stone-700 dark:text-stone-300 transition-colors shadow-sm"
            title={soundEnabled ? 'Mute Mechanical Audio' : 'Enable Mechanical Audio'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-600" /> : <VolumeX className="w-3.5 h-3.5 text-stone-400" />}
          </button>
        </div>

        {/* Live Mail Counter Odometer */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-stone-800/15 dark:border-stone-700 shadow-md backdrop-blur-md">
          <span className="text-[10px] font-mono uppercase text-stone-500 tracking-wider">
            Total Mails Collected:
          </span>
          <span className="font-mono text-base font-black text-amber-700 dark:text-amber-400 tracking-tight">
            {collectedCount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Main Mailbox Spatial Canvas */}
      <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
        
        {/* Soft Ambient Floor Spotlight */}
        <div className="absolute inset-10 rounded-full bg-amber-400/25 blur-3xl transform scale-110 pointer-events-none" />

        {/* Center 3D Red Postbox Image */}
        <div className={`relative w-64 sm:w-80 transition-transform duration-300 ${
          mailboxShake ? 'scale-95 translate-y-2' : ''
        }`}>
          <img
            src="/assets/postbox-pillar.png"
            alt="Royal Postbox"
            className="w-full h-auto object-contain studio-shadow transition-all"
          />

          {/* Interactive Postal Mail Slot Hotspot */}
          <div
            onMouseEnter={() => {
              setIsSlotHovered(true);
              sound.playPaperWhoosh(0.08);
            }}
            onMouseLeave={() => setIsSlotHovered(false)}
            onClick={() => {
              if (queueLetters.length > 0) {
                handleDropLetterIntoSlot(queueLetters[0]);
              } else {
                onOpenReportModal();
              }
            }}
            className={`absolute top-[28%] left-1/2 -translate-x-1/2 w-44 sm:w-52 h-10 sm:h-12 rounded-lg cursor-pointer transition-all flex items-center justify-center group ${
              isSlotHovered ? 'ring-4 ring-amber-400/50 shadow-2xl' : ''
            }`}
            title="Click or drop a letter into the mailbox slot"
          >
            {/* The Animated Flap that opens backward into the box */}
            <div
              className={`w-[85%] h-5 rounded-sm bg-gradient-to-b from-red-900 to-black/90 border border-red-950 shadow-inner transition-transform duration-200 origin-top flex items-center justify-center ${
                isSlotHovered || droppingLetterId ? 'scale-y-125 -translate-y-1 bg-black shadow-2xl' : ''
              }`}
            >
              <span className="text-[9px] font-mono font-bold tracking-widest text-amber-400/80 uppercase group-hover:text-amber-300">
                {isSlotHovered ? 'SLOT OPEN // DROP MAIL' : 'POST'}
              </span>
            </div>

            {/* Glowing entry suction effect when hovering */}
            {isSlotHovered && (
              <span className="absolute -bottom-2 w-16 h-1 bg-amber-400 blur-sm animate-pulse" />
            )}
          </div>

          {/* Keyhole Door Opener */}
          <button
            onClick={handleOpenDoor}
            className="absolute bottom-[28%] left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-stone-900/60 hover:bg-amber-500 hover:text-stone-950 text-white/60 flex items-center justify-center shadow-lg transition-all group"
            title="Unlock Postal Collection Door"
          >
            <Key className="w-3.5 h-3.5 transition-transform group-hover:rotate-45" />
          </button>

          {/* Door Open State / Collection Drawer */}
          {isDoorOpen && (
            <div className="absolute top-[42%] left-1/2 -translate-x-1/2 w-56 p-4 rounded-2xl bg-stone-950/95 border border-amber-500/40 text-white shadow-2xl z-30 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between text-xs font-mono text-amber-400 mb-2 border-b border-stone-800 pb-1">
                <span>BOX #12 INNER VAULT</span>
                <span className="text-[10px] text-stone-400">UNLOCKED</span>
              </div>
              <div className="space-y-1 text-[11px] text-stone-300">
                <p>📭 {issues.length} active dispatches sorted.</p>
                <p>🚚 Next collection pickup in <strong>24 mins</strong>.</p>
              </div>
              <button
                onClick={onScrollToVault}
                className="mt-3 w-full py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[11px] uppercase tracking-wider transition-colors"
              >
                Inspect All In Vault ↓
              </button>
            </div>
          )}

        </div>

        {/* Floating Letters Waiting to be Dropped */}
        {queueLetters.map((letter, idx) => {
          const isDropping = droppingLetterId === letter.id;

          return (
            <div
              key={letter.id}
              onClick={() => handleDropLetterIntoSlot(letter)}
              className={`absolute ${letter.positionClass} z-20 cursor-pointer transition-all duration-500 group ${
                isDropping 
                  ? 'translate-x-[120px] translate-y-[-40px] scale-0 rotate-[720deg] opacity-0 pointer-events-none'
                  : 'hover:scale-110 hover:z-30'
              }`}
            >
              {/* Envelope Card */}
              <div className="relative w-36 sm:w-44 p-3 rounded-2xl bg-white/95 dark:bg-stone-900/95 border border-stone-300 dark:border-stone-700 shadow-xl backdrop-blur-md transition-all group-hover:shadow-2xl group-hover:border-amber-500">
                
                {/* Airmail top hatch */}
                <div className="h-1 w-full airmail-border rounded-full mb-2" />

                {/* Stamp */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-[9px] font-mono font-bold text-stone-500">
                    {letter.id}
                  </span>
                  <div 
                    className="w-4 h-5 rounded-sm border border-dashed border-stone-400 flex items-center justify-center text-[8px] font-mono font-bold text-white shadow-sm"
                    style={{ backgroundColor: letter.stampColor }}
                  >
                    CV
                  </div>
                </div>

                <div className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                  {letter.title}
                </div>
                <div className="text-[10px] text-stone-500 font-mono mt-0.5 truncate">
                  {letter.category}
                </div>

                <div className="mt-2.5 pt-1.5 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-[10px] text-amber-600 dark:text-amber-400 font-bold font-mono">
                  <span>Click to Mail</span>
                  <Send className="w-2.5 h-2.5 transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>
          );
        })}

        {/* Floating Instructions Toast */}
        {recentDropToast && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-mono font-bold shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>{recentDropToast}</span>
          </div>
        )}

      </div>

      {/* Prompt Strip */}
      <div className="mt-4 flex flex-col items-center gap-3 z-10 text-center">
        <p className="text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 max-w-md">
          Click any floating letter above to <strong>drop it into the mail slot</strong>, or draft a new civic letter.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenReportModal}
            className="px-5 py-2.5 rounded-full bg-stone-950 hover:bg-stone-800 text-white dark:bg-white dark:text-stone-950 text-xs font-bold tracking-wide uppercase shadow-lg active:scale-95 transition-all flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
            <span>Write New Civic Letter</span>
          </button>

          <button
            onClick={onScrollToVault}
            className="px-5 py-2.5 rounded-full bg-white/80 dark:bg-stone-900/80 hover:bg-white text-stone-900 dark:text-stone-100 text-xs font-bold tracking-wide border border-stone-800/15 dark:border-stone-700/50 shadow-md transition-all flex items-center gap-1.5"
          >
            <span>Scroll Into Mail Chute</span>
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
          </button>
        </div>
      </div>

    </div>
  );
}
