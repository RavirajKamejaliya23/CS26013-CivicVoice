import React from 'react';
import { STATUS_CONFIG, CATEGORIES } from '../data/mockIssues';
import { ThumbsUp, MapPin, Clock, ArrowUpRight, CheckCircle2, Shield, Check, Layers, ExternalLink } from 'lucide-react';

const READABLE_STATUS = {
  reported: { label: 'Reported', bg: 'bg-blue-50 text-blue-800 border-blue-200' },
  under_review: { label: 'Under Review', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
  accepted: { label: 'Scheduled for Action', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  in_progress: { label: 'Work in Progress', bg: 'bg-purple-50 text-purple-800 border-purple-200' },
  completed: { label: 'Work Completed', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  citizen_verified: { label: 'Verified & Closed', bg: 'bg-teal-50 text-teal-800 border-teal-200' },
  reopened: { label: 'Reopened', bg: 'bg-rose-50 text-rose-800 border-rose-200' },
};

export default function IssueCard({
  issue,
  userRole,
  onUpvote,
  onOpenTimeline,
  onVerify,
  onAdminAction,
  onViewMerged,
}) {
  const statusMeta = READABLE_STATUS[issue.status] || {
    label: issue.status?.replace('_', ' '),
    bg: 'bg-slate-100 text-slate-800 border-slate-200',
  };
  const categoryInfo = CATEGORIES.find((c) => c.id === issue.category) || { label: issue.categoryName || 'General Civic' };

  const isMergedChild = Boolean(issue.duplicateOf);
  const mergedCount = issue.mergedCount || 0;

  return (
    <article className="group relative rounded-2xl bg-[var(--theme-card-bg,#FFFDF5)] border border-[var(--theme-card-border,#E7DDC5)] hover:border-[#8A6418]/40 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col overflow-hidden">
      
      {/* Merged Duplicate Banner (When shown in My Complaints) */}
      {isMergedChild && (
        <div className="bg-[var(--theme-pill-bg,#FDF1CE)] border-b border-[var(--theme-card-border,#E7DDC5)] px-4 py-2 text-xs text-[#78350F] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 truncate">
            <Layers className="w-3.5 h-3.5 text-[#8A6418] flex-shrink-0" />
            <span className="truncate">
              Grouped into Main Complaint <strong>#{issue.duplicateOf}</strong>
              {issue.canonicalTitle ? ` (${issue.canonicalTitle})` : ''}
            </span>
          </div>
          <button
            onClick={() => onOpenTimeline({ id: issue.duplicateOf })}
            className="text-[11px] font-bold text-[#78350F] hover:text-[#22231F] underline flex items-center gap-1 flex-shrink-0"
          >
            <span>View Main Complaint</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="px-5 py-3 border-b border-[var(--theme-card-border,#E7DDC5)] flex items-center justify-between gap-2 bg-[var(--theme-surface-secondary,#FDF7E7)]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs font-bold text-[var(--theme-heading,#29261F)] tracking-wider">
            {issue.id}
          </span>
          {issue.isDemo && (
            <span className="px-1.5 py-0.2 rounded-sm text-[10px] font-mono uppercase font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
              Demo
            </span>
          )}
          {issue.municipality_name && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/10 text-teal-800 dark:text-teal-300 border border-teal-500/30">
              {issue.municipality_name}
            </span>
          )}
          <span className="text-[var(--theme-text-muted,#787367)] text-xs">•</span>
          <span className="text-[11px] text-[var(--theme-text-secondary,#625D52)] font-medium uppercase tracking-wide">
            {issue.category === 'other' ? (issue.customCategory || issue.custom_category || issue.categoryName || 'Other') : categoryInfo.label}
          </span>
        </div>

        {/* Status Badge */}
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusMeta.bg}`}>
          <span>{statusMeta.label}</span>
        </div>
      </div>

      {/* Authority Not Onboarded Banner */}
      {issue.jurisdiction_status === 'AUTHORITY_NOT_ONBOARDED' && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-xs text-amber-900 dark:text-amber-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span className="font-medium">
              <strong>Authority Not Onboarded:</strong> Area outside active municipal corporations. Recorded on Civic Ledger.
            </span>
          </div>
        </div>
      )}

      {/* Media & Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
        
        {/* Photo Preview if attached */}
        {issue.imageUrl && (
          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 group/img border border-[var(--theme-card-border,#E7DDC5)]">
            <img
              src={issue.imageUrl}
              alt={issue.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-[1.02]"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80';
              }}
            />
            
            {/* Location Tag */}
            <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-xs text-white text-xs flex items-center gap-1.5 truncate">
              <MapPin className="w-3 h-3 text-amber-400 flex-shrink-0" />
              <span className="truncate">{issue.address}</span>
            </div>

            {/* Completion photo badge */}
            {issue.completionEvidenceUrl && (
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-700 text-white text-[10px] font-semibold flex items-center gap-1 shadow-xs">
                <Check className="w-3 h-3" />
                <span>Work Photo Attached</span>
              </div>
            )}
          </div>
        )}

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h3
            className="text-base font-bold text-[var(--theme-heading,#29261F)] leading-snug line-clamp-2 hover:text-[#8A6418] cursor-pointer transition-colors"
            onClick={() => onOpenTimeline(issue)}
          >
            {issue.title}
          </h3>
          <p className="text-xs text-[var(--theme-text-secondary,#625D52)] line-clamp-2 leading-relaxed">
            {issue.description}
          </p>
        </div>

        {/* Merged Reports Indicator Badge */}
        {mergedCount > 0 && (
          <div className="pt-1">
            <button
              onClick={() => (onViewMerged ? onViewMerged(issue) : onOpenTimeline(issue))}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--theme-pill-bg,#FDF1CE)] hover:bg-[#FDF1CE]/80 border border-[var(--theme-card-border,#E7DDC5)] text-[#8A6418] text-xs font-semibold transition-colors"
              title="Click to view all merged citizen reports"
            >
              <Layers className="w-3.5 h-3.5 text-[#8A6418]" />
              <span>{mergedCount} related report{mergedCount > 1 ? 's' : ''} merged</span>
              <span className="text-[10px] text-[#8A6418]/80 font-normal">(View details)</span>
            </button>
          </div>
        )}

        {/* Reporter info */}
        <div className="flex items-center justify-between text-xs text-[var(--theme-text-secondary,#625D52)] pt-2 border-t border-[var(--theme-card-border,#E7DDC5)]">
          <div className="flex items-center gap-2">
            <img
              src={issue.reportedBy?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
              alt={issue.reportedBy?.name || 'Citizen'}
              className="w-5 h-5 rounded-full object-cover border border-[var(--theme-card-border,#E7DDC5)]"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80';
              }}
            />
            <span className="font-medium text-[var(--theme-text-primary,#29261F)]">
              {issue.reportedBy?.name || 'Citizen'}
            </span>
          </div>
          <span className="text-[11px] text-[var(--theme-text-secondary,#625D52)]">{issue.reportedAt}</span>
        </div>

      </div>

      {/* Citizen Verification Prompt (If Completed) */}
      {issue.status === 'completed' && (
        <div className="mx-5 mb-3 p-3 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between gap-3">
          <div className="text-xs text-teal-900">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              Municipal Work Completed
            </div>
            <div className="text-[11px] text-teal-700">
              Please inspect the location and verify or reopen.
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onVerify(issue, true)}
              className="px-2.5 py-1 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-xs transition-all"
            >
              Verify
            </button>
            <button
              onClick={() => onVerify(issue, false)}
              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-all"
            >
              Reopen
            </button>
          </div>
        </div>
      )}

      {/* Action Footer Bar */}
      <div className="px-5 py-3 bg-[var(--theme-surface-secondary,#FDF7E7)] border-t border-[var(--theme-card-border,#E7DDC5)] flex items-center justify-between gap-3">
        
        {/* Supporter Count & Action */}
        <button
          onClick={() => onUpvote(issue.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            issue.hasUpvoted
              ? 'bg-[#8A6418] text-white shadow-xs'
              : 'bg-white text-[var(--theme-text-primary,#29261F)] border border-[var(--theme-card-border,#E7DDC5)] hover:bg-[var(--theme-surface-secondary,#FDF7E7)]'
          }`}
          title="Support this complaint"
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${issue.hasUpvoted ? 'fill-current' : ''}`} />
          <span>{issue.upvotes}</span>
          <span className="hidden sm:inline font-normal">
            {issue.upvotes === 1 ? 'supporter' : 'supporters'}
          </span>
        </button>

        {/* View Lifecycle / Officer Actions */}
        <div className="flex items-center gap-2">
          {['ADMIN', 'MUNICIPAL'].includes(userRole) && (
            <button
              onClick={() => onAdminAction(issue)}
              className="px-2.5 py-1.5 rounded-xl bg-[#8A6418] hover:bg-[#735212] text-white text-xs font-semibold transition-all flex items-center gap-1 shadow-xs"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Update Status</span>
            </button>
          )}

          <button
            onClick={() => onOpenTimeline(issue)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-[var(--theme-surface-secondary,#FDF7E7)] text-[var(--theme-text-primary,#29261F)] border border-[var(--theme-card-border,#E7DDC5)] text-xs font-semibold transition-all shadow-2xs"
          >
            <span>View Progress</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[var(--theme-text-secondary,#625D52)]" />
          </button>
        </div>

      </div>

    </article>
  );
}
