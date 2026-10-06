import React, { useState } from 'react';
import { X, Shield, CheckCircle, Camera, AlertCircle, ArrowRight } from 'lucide-react';
import { STATUS_CONFIG } from '../data/mockIssues';

export default function AdminActionModal({ issue, onClose, onUpdateStatus }) {
  if (!issue) return null;

  const [nextStatus, setNextStatus] = useState('in_progress');
  const [officerName, setOfficerName] = useState('Supervisor R. Vance');
  const [department, setDepartment] = useState('Dept of Public Works — Field Squad');
  const [note, setNote] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!note.trim()) return;

    onUpdateStatus(issue.id, {
      status: nextStatus,
      author: officerName,
      role: department,
      note: note.trim(),
      evidenceUrl: nextStatus === 'completed' ? evidenceUrl : null
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Background backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-stone-900 border border-stone-800/20 dark:border-stone-700 shadow-2xl z-10 flex flex-col overflow-hidden">
        
        {/* Purple Admin Banner */}
        <div className="px-6 py-4 bg-purple-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-amber-300" />
            <div>
              <div className="text-xs font-mono tracking-widest uppercase text-purple-200">
                Municipal Authority Console
              </div>
              <div className="font-bold text-sm">
                Advance Lifecycle: {issue.id}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Target Status Selector */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-2 font-bold">
              New Lifecycle Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'under_review', label: 'Under Review' },
                { key: 'accepted', label: 'Accepted (Work Order)' },
                { key: 'in_progress', label: 'In Progress (Crew Onsite)' },
                { key: 'completed', label: 'Completed (Requires Proof)' }
              ].map((s) => (
                <button
                  type="button"
                  key={s.key}
                  onClick={() => setNextStatus(s.key)}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                    nextStatus === s.key
                      ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Officer Credentials */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-stone-500 mb-1">
                Authorized Officer
              </label>
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-stone-500 mb-1">
                Department / Agency
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
              />
            </div>
          </div>

          {/* Action Note */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5 font-bold">
              Dispatch Update Note
            </label>
            <textarea
              required
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Squad dispatched with asphalt roller. Work scheduled to finish by 16:00."
              className="w-full px-3 py-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Evidence photo if completed */}
          {nextStatus === 'completed' && (
            <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-2">
              <div className="text-xs font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-teal-600" />
                Completion Photographic Evidence (Mandatory)
              </div>
              <div className="flex items-center gap-3">
                <div className="w-16 h-12 rounded-lg overflow-hidden bg-stone-200 flex-shrink-0">
                  <img src={evidenceUrl} alt="Evidence" className="w-full h-full object-cover" />
                </div>
                <div className="text-[11px] text-teal-700 dark:text-teal-300 leading-tight">
                  Proof of resolution attached to enable Citizen Verification protocol.
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
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
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 shadow-md"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Commit Status Update</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
