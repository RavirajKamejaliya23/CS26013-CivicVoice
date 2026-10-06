import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { STATUS_CONFIG, CATEGORIES } from '../data/mockIssues';
import { Mail, CheckCircle2, MapPin, Eye, ThumbsUp, ArrowUpRight, FolderDown, Sparkles } from 'lucide-react';

export default function SortingVault({ issues, onSelectIssue, onUpvote }) {
  const [selectedVaultTab, setSelectedVaultTab] = useState('all');

  const vaultBins = [
    { id: 'all', label: 'All Collected Mails', count: issues.length },
    { id: 'roads_potholes', label: 'Road Hazards', count: issues.filter(i => i.category === 'roads_potholes').length },
    { id: 'water_drainage', label: 'Drainage & Floods', count: issues.filter(i => i.category === 'water_drainage').length },
    { id: 'streetlights_power', label: 'Grid & Lighting', count: issues.filter(i => i.category === 'streetlights_power').length },
    { id: 'garbage_sanitation', label: 'Sanitation', count: issues.filter(i => i.category === 'garbage_sanitation').length },
  ];

  const filteredIssues = selectedVaultTab === 'all'
    ? issues
    : issues.filter(i => i.category === selectedVaultTab);

  return (
    <div id="sorting-vault" className="w-full py-12 scroll-mt-24">
      
      {/* Vault Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white/90 dark:bg-stone-900/90 border border-stone-800/15 dark:border-stone-700 shadow-xl backdrop-blur-md mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">
            <FolderDown className="w-4 h-4" />
            <span>MUNICIPAL COLLECTION VAULT // SORTING DEPOT</span>
          </div>
          <h3 className="text-2xl font-black text-stone-950 dark:text-stone-50">
            Collected Letters & Dispatches
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 font-mono mt-0.5">
            Physical correspondence retrieved from street postboxes, sorted by department
          </p>
        </div>

        {/* Vault Postal Stamping Seal */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full border-2 border-dashed border-amber-600/60 dark:border-amber-400/60 flex flex-col items-center justify-center text-center p-1 font-mono rotate-6 bg-amber-500/10">
            <span className="text-[7px] font-bold text-amber-900 dark:text-amber-300">CERTIFIED</span>
            <span className="text-[10px] font-black text-amber-800 dark:text-amber-400">OCT 26</span>
            <span className="text-[6px] tracking-widest text-stone-500">MUNICIPAL</span>
          </div>
        </div>
      </div>

      {/* Sorting Cubbies / Bins Filter Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
        {vaultBins.map((bin) => {
          const isActive = selectedVaultTab === bin.id;
          return (
            <button
              key={bin.id}
              onClick={() => {
                sound.playPaperWhoosh(0.08);
                setSelectedVaultTab(bin.id);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-mono font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-stone-950 text-white dark:bg-stone-100 dark:text-stone-950 border-stone-950 shadow-md scale-102'
                  : 'bg-white/70 dark:bg-stone-900/70 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-white'
              }`}
            >
              <span>{bin.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                isActive ? 'bg-amber-400 text-stone-950 font-black' : 'bg-stone-200 dark:bg-stone-800 text-stone-600'
              }`}>
                {bin.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid of Stacked Letter Cards (Tactile Postal Aesthetic) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIssues.map((issue, idx) => {
          const statusInfo = STATUS_CONFIG[issue.status] || STATUS_CONFIG.reported;
          const categoryInfo = CATEGORIES.find(c => c.id === issue.category) || CATEGORIES[1];

          return (
            <div
              key={issue.id}
              className="group relative rounded-3xl bg-white/95 dark:bg-stone-900/95 border border-stone-800/10 dark:border-stone-700/60 p-5 shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer hover:-translate-y-1"
              onClick={() => onSelectIssue(issue)}
            >
              {/* Airmail top fringe border */}
              <div className="h-1.5 w-full airmail-border rounded-full mb-3" />

              {/* Envelope Letterhead */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-stone-900 dark:text-stone-100">
                      {issue.id}
                    </span>
                    <span className="text-[10px] font-mono text-stone-400 uppercase">
                      // {categoryInfo.label}
                    </span>
                  </div>

                  <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                    {statusInfo.label}
                  </div>
                </div>

                {/* Evidence Thumbnail */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 mb-3 border border-stone-200 dark:border-stone-700 group-hover:scale-101 transition-transform">
                  <img
                    src={issue.imageUrl}
                    alt={issue.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-white text-[11px] truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400 flex-shrink-0" />
                    <span className="truncate">{issue.address}</span>
                  </div>
                </div>

                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 leading-snug line-clamp-2 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                  {issue.title}
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mt-1 leading-relaxed">
                  {issue.description}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playTick();
                    onUpvote(issue.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    issue.hasUpvoted
                      ? 'bg-amber-500 text-stone-950'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                  }`}
                >
                  <ThumbsUp className={`w-3 h-3 ${issue.hasUpvoted ? 'fill-current' : ''}`} />
                  <span>{issue.upvotes}</span>
                </button>

                <div className="flex items-center gap-1 font-mono text-[11px] text-amber-600 dark:text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform">
                  <span>Inspect Docket</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
