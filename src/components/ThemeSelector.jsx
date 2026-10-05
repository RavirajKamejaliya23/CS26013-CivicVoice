import React, { useState } from 'react';
import { THEMES } from '../data/themes';
import { Palette, Check, Sparkles, ChevronDown } from 'lucide-react';

export default function ThemeSelector({ currentTheme, onSelectTheme }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Theme Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3.5 py-2 rounded-full border border-stone-800/15 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md shadow-sm hover:shadow-md transition-all text-xs font-semibold tracking-wide uppercase"
        title="Change Background Theme"
      >
        <span
          className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-inner flex-shrink-0"
          style={{ backgroundColor: THEMES[currentTheme].previewColor }}
        />
        <span className="hidden sm:inline font-mono">
          {THEMES[currentTheme].name}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 z-50 w-72 p-2 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl rounded-2xl border border-stone-800/10 dark:border-stone-700/50 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 border-b border-stone-200/60 dark:border-stone-800 flex items-center justify-between">
              <span className="text-[11px] font-mono tracking-widest uppercase text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                Select Theme Atmosphere
              </span>
              <Sparkles className="w-3 h-3 text-amber-500" />
            </div>

            <div className="p-1.5 space-y-1">
              {Object.values(THEMES).map((theme) => {
                const isSelected = currentTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      onSelectTheme(theme.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all group ${
                      isSelected
                        ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                        : 'hover:bg-stone-100 dark:hover:bg-stone-800/70 text-stone-800 dark:text-stone-200'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full border-2 border-white/60 shadow-md flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: theme.previewColor }}
                    >
                      {isSelected && (
                        <Check className="w-3 h-3 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] stroke-[3]" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold leading-tight truncate">
                        {theme.name}
                      </div>
                      <div className={`text-[10px] truncate ${isSelected ? 'text-stone-300 dark:text-stone-600' : 'text-stone-500 dark:text-stone-400'}`}>
                        {theme.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
