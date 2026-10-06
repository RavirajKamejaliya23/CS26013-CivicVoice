import React from 'react';
import { STATUS_CONFIG, CATEGORIES } from '../data/mockIssues';
import { ThumbsUp, MapPin, Clock, ArrowUpRight, CheckCircle2, RotateCcw, AlertTriangle, Shield, Check } from 'lucide-react';

export default function IssueCard({
  issue,
  userRole,
  onUpvote,
  onOpenTimeline,
  onVerify,
  onAdminAction
}) {
  const statusInfo = STATUS_CONFIG[issue.status] || STATUS_CONFIG.reported;
  const categoryInfo = CATEGORIES.find(c => c.id === issue.category) || CATEGORIES[1];

  return (
    <article className="group relative rounded-3xl bg-white/90 dark:bg-stone-900/90 border border-stone-800/10 dark:border-stone-700/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden backdrop-blur-sm">
      
      {/* Top Airmail Postal Header Bar */}
      <div className="px-5 pt-4 pb-3 border-b border-stone-200/70 dark:border-stone-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-stone-800 dark:text-stone-300 tracking-wider">
            {issue.id}
          </span>
          <span className="text-stone-400 dark:text-stone-600 font-mono text-xs">•</span>
          <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 uppercase">
            {categoryInfo.label}
          </span>
        </div>

        {/* Status Badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-mono border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
          <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
          <span>{statusInfo.label}</span>
        </div>
      </div>

      {/* Media & Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        {/* Evidence Photo Preview */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 group/img">
          <img
            src={issue.imageUrl}
            alt={issue.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
            loading="lazy"
          />
          
          {/* Postmark Category Watermark Stamp */}
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-stone-900/80 backdrop-blur-md text-white text-[10px] font-mono font-bold tracking-widest uppercase border border-white/20">
            WARD EVIDENCE
          </div>

          {/* Location Badge */}
          <div className="absolute bottom-3 left-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="truncate">{issue.address}</span>
          </div>

          {/* Completed overlay badge if resolved */}
          {issue.completionEvidenceUrl && (
            <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-mono font-bold shadow-md flex items-center gap-1">
              <Check className="w-3 h-3" />
              AFTER PHOTO ATTACHED
            </div>
          )}
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 leading-snug line-clamp-2 hover:text-amber-700 dark:hover:text-amber-400 cursor-pointer transition-colors"
              onClick={() => onOpenTimeline(issue)}>
            {issue.title}
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
            {issue.description}
          </p>
        </div>

        {/* Reporter info */}
        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-1 border-t border-stone-100 dark:border-stone-800/80">
          <div className="flex items-center gap-2">
            <img
              src={issue.reportedBy.avatar}
              alt={issue.reportedBy.name}
              className="w-6 h-6 rounded-full object-cover border border-amber-500/30"
            />
            <span className="font-medium text-stone-700 dark:text-stone-300">
              {issue.reportedBy.name}
            </span>
          </div>
          <span className="font-mono text-[11px]">{issue.reportedAt}</span>
        </div>

      </div>

      {/* Citizen Verification Banner (If Completed) */}
      {issue.status === 'completed' && (
        <div className="mx-5 mb-4 p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 flex items-center justify-between gap-3">
          <div className="text-xs text-teal-900 dark:text-teal-200">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              Resolution Proof Uploaded
            </div>
            <div className="text-[11px] text-teal-700 dark:text-teal-400">
              Citizens are requested to inspect and certify.
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onVerify(issue, true)}
              className="px-2.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1"
            >
              Verify
            </button>
            <button
              onClick={() => onVerify(issue, false)}
              className="px-2.5 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-900/60 dark:hover:bg-rose-800 text-rose-700 dark:text-rose-200 text-xs font-bold transition-all flex items-center gap-1"
            >
              Reopen
            </button>
          </div>
        </div>
      )}

      {/* Action Footer Bar */}
      <div className="px-5 py-3.5 bg-stone-50/70 dark:bg-stone-900/50 border-t border-stone-200/70 dark:border-stone-800/80 flex items-center justify-between gap-3">
        
        {/* Endorse / Upvote (+1) */}
        <button
          onClick={() => onUpvote(issue.id)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
            issue.hasUpvoted
              ? 'bg-amber-500 text-stone-950 shadow-sm border border-amber-600/30'
              : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
          }`}
          title="Co-sign this civic dispatch"
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${issue.hasUpvoted ? 'fill-current' : ''}`} />
          <span>{issue.upvotes}</span>
          <span className="hidden sm:inline font-normal">Co-signed</span>
        </button>

        {/* View Lifecycle / Admin Actions */}
        <div className="flex items-center gap-2">
          {['ADMIN', 'MUNICIPAL'].includes(userRole) && (
            <button
              onClick={() => onAdminAction(issue)}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Update Status</span>
            </button>
          )}

          <button
            onClick={() => onOpenTimeline(issue)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 text-xs font-semibold transition-all group/btn"
          >
            <span>Track Progress</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-stone-400 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </button>
        </div>

      </div>

    </article>
  );
}
