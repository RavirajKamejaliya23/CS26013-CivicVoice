import React, { useState } from 'react';
import { X, CheckCircle2, RotateCcw, AlertCircle, Camera, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CitizenVerifyModal({ issue, isVerifyingResolved, onClose, onConfirm }) {
  const [comment, setComment] = useState(
    isVerifyingResolved
      ? 'Inspected in person. The work was completed satisfactorily!'
      : 'The reported issue still exists. Debris remains scattered.'
  );

  if (!issue) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    if (isVerifyingResolved) {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (err) {}
    }

    onConfirm(issue.id, {
      isResolved: isVerifyingResolved,
      comment: comment.trim(),
      userName: 'You (Citizen Verifier)',
      date: 'Just now'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-stone-900 border border-stone-800/20 dark:border-stone-700 shadow-2xl z-10 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between text-white ${
          isVerifyingResolved ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          <div className="flex items-center gap-2.5">
            {isVerifyingResolved ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            ) : (
              <RotateCcw className="w-5 h-5 text-rose-200" />
            )}
            <div>
              <div className="text-[10px] font-mono tracking-widest uppercase opacity-80">
                CITIZEN AUDIT & VERIFICATION
              </div>
              <div className="font-bold text-sm">
                {isVerifyingResolved ? 'Certify Issue as Resolved' : 'Reopen Unresolved Issue'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-1">
            <div className="text-xs font-mono text-stone-500 dark:text-stone-400">
              {issue.id} • {issue.address}
            </div>
            <div className="font-bold text-sm text-stone-900 dark:text-stone-100">
              {issue.title}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5 font-bold">
              {isVerifyingResolved ? 'Citizen Inspection Notes' : 'Reason for Reopening'}
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Provide constructive feedback regarding the municipal squad's work..."
              className="w-full px-4 py-3 text-sm rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md flex items-center gap-2 ${
                isVerifyingResolved
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {isVerifyingResolved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Certify Resolution</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Reopen Ticket</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
