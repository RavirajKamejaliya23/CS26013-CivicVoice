import React from 'react';
import { X, HelpCircle, Phone, MapPin, CheckCircle, FileText, AlertCircle } from 'lucide-react';

export default function HelpModal({ isOpen, onClose, onOpenReportModal }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white border border-slate-200 shadow-2xl z-10 flex flex-col text-slate-800">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#8A6418] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-amber-100" />
            <h2 className="text-base font-bold text-white">Citizen Help & Guidance</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/20 text-amber-100 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-600 leading-relaxed">
          
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">How CivicVoice Works</h3>
            <p>
              CivicVoice is a civic issue reporting platform that connects communities with relevant local authorities across Indian cities and municipal districts. When you submit a complaint, it is automatically routed to the responsible department based on the selected category and locality.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">Duplicate Report Consolidation</h3>
            <p>
              When multiple citizens report the same road crater, water leak, or street hazard, our system identifies the canonical (primary) report and merges duplicates. This keeps the civic feed clean while consolidating community support to elevate municipal priority. Your original submission and photos are always preserved under <strong>My Complaints</strong>.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">Tracking Your Complaint</h3>
            <p>
              Every grievance is assigned a unique reference code such as <code className="bg-slate-100 text-blue-900 px-1 py-0.5 rounded font-mono">CV-2026-XXXXXX</code> (or regional prefix like <code className="bg-slate-100 text-blue-900 px-1 py-0.5 rounded font-mono">CV-VAD-...</code>). You can enter this code in the Track Complaint tool on the Home page or follow notification updates to see real-time progress.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-900" />
              National & Municipal Civic Helplines
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
              <div>National Emergency Response: <strong>112</strong></div>
              <div>Municipal Citizen Redressal: <strong>1916</strong></div>
              <div>Water Supply & Drainage: <strong>1916 / 14420</strong></div>
              <div>National Disaster Management: <strong>1077 / 1070</strong></div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              if (onOpenReportModal) onOpenReportModal();
            }}
            className="px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs transition-colors"
          >
            Report a Problem Now
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
