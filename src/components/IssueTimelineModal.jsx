import React from 'react';
import { X, CheckCircle, Clock, MapPin, User, Shield, Camera, AlertCircle, ArrowRight, CornerDownRight } from 'lucide-react';
import { STATUS_CONFIG } from '../data/mockIssues';

export default function IssueTimelineModal({ issue, onClose, onVerify, userRole, onAdminAction }) {
  if (!issue) return null;

  const statusInfo = STATUS_CONFIG[issue.status] || STATUS_CONFIG.reported;
  const stages = [
    { key: 'reported', label: '1. Reported' },
    { key: 'under_review', label: '2. Under Review' },
    { key: 'accepted', label: '3. Accepted' },
    { key: 'in_progress', label: '4. In Progress' },
    { key: 'completed', label: '5. Completed' },
    { key: 'citizen_verified', label: '6. Citizen Verified' }
  ];

  // Calculate current stage index
  const currentStageIndex = stages.findIndex(s => s.key === issue.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-stone-900 border border-stone-800/15 dark:border-stone-700 shadow-2xl z-10 flex flex-col">
        
        {/* Airmail Border Strip Header */}
        <div className="h-2 w-full airmail-border" />

        {/* Modal Top Bar */}
        <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700">
                {issue.id}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold font-mono border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
                <span>{statusInfo.label}</span>
              </span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 leading-snug">
              {issue.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mt-1">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>{issue.address}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lifecycle Stepper Bar */}
        <div className="px-6 py-4 bg-stone-50 dark:bg-stone-950/40 border-b border-stone-200 dark:border-stone-800">
          <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3">
            Lifecycle Progress Track
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {stages.map((stage, idx) => {
              const isPast = currentStageIndex >= idx;
              const isCurrent = issue.status === stage.key;
              const isReopened = issue.status === 'reopened' && stage.key === 'in_progress';

              return (
                <div
                  key={stage.key}
                  className={`p-2 rounded-xl text-center border text-[11px] font-mono transition-all ${
                    isCurrent
                      ? 'bg-amber-500 text-stone-950 font-bold border-amber-600 shadow-sm'
                      : isReopened
                      ? 'bg-rose-100 text-rose-800 border-rose-400 font-bold'
                      : isPast
                      ? 'bg-stone-200/70 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                      : 'bg-white/40 dark:bg-stone-900/40 text-stone-400 dark:text-stone-600 border-stone-200 dark:border-stone-800'
                  }`}
                >
                  <div className="truncate">{stage.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Evidence Photos Comparison (Before vs After) */}
        <div className="p-6 border-b border-stone-200 dark:border-stone-800">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 mb-3 flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-500" />
            <span>Photographic Evidence Dossier</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Before Photo */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono text-stone-500 dark:text-stone-400 flex items-center justify-between">
                <span>BEFORE (Initial Citizen Report)</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">REPORTED STATE</span>
              </div>
              <div className="aspect-video rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                <img
                  src={issue.imageUrl}
                  alt="Before photo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* After Photo (if available) */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono text-stone-500 dark:text-stone-400 flex items-center justify-between">
                <span>AFTER (Municipal Resolution)</span>
                <span className={issue.completionEvidenceUrl ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-stone-400"}>
                  {issue.completionEvidenceUrl ? "VERIFIED REPAIR" : "AWAITING SQUAD PROOF"}
                </span>
              </div>
              <div className="aspect-video rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center">
                {issue.completionEvidenceUrl ? (
                  <img
                    src={issue.completionEvidenceUrl}
                    alt="Resolution evidence"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4 space-y-2">
                    <Clock className="w-6 h-6 text-stone-400 mx-auto animate-pulse" />
                    <p className="text-xs text-stone-500">
                      Municipal crew has not yet uploaded completion proof.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Detailed Timeline Feed */}
        <div className="p-6 space-y-6">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Official Dispatch Log & Updates</span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200 dark:before:bg-stone-800">
            {issue.timeline?.map((step, index) => (
              <div key={index} className="relative group">
                {/* Dot */}
                <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-white dark:bg-stone-900 border-2 border-amber-500 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                </div>

                {/* Card */}
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/60 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-bold text-sm text-stone-900 dark:text-stone-100">
                      {step.title}
                    </div>
                    <div className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
                      {step.date}
                    </div>
                  </div>

                  <div className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    {step.note}
                  </div>

                  <div className="flex items-center gap-2 pt-1 text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                    <User className="w-3 h-3" />
                    <span>{step.author}</span>
                    <span>•</span>
                    <span className="text-amber-700 dark:text-amber-400">{step.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Citizen Verification Section */}
        {issue.status === 'completed' && (
          <div className="p-6 bg-amber-50 dark:bg-amber-950/40 border-t border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-amber-950 dark:text-amber-200">
              <div className="font-bold text-sm mb-0.5">
                Citizen Verification Protocol Active
              </div>
              <p>
                As a resident, did this resolution actually fix the problem on the street?
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  onVerify(issue, true);
                  onClose();
                }}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Confirm Resolved</span>
              </button>

              <button
                onClick={() => {
                  onVerify(issue, false);
                  onClose();
                }}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Reopen Issue</span>
              </button>
            </div>
          </div>
        )}

        {/* Admin Action Button in Modal */}
        {userRole === 'admin' && (
          <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border-t border-purple-200 dark:border-purple-800 flex justify-end">
            <button
              onClick={() => {
                onAdminAction(issue);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span>Update Issue Lifecycle Status</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
