import React, { useState, useEffect } from 'react';
import { X, Layers, MapPin, User, Calendar, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function MergedReportsModal({ canonicalIssue, isOpen, onClose, onSelectIssue }) {
  const [mergedList, setMergedList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !canonicalIssue) return;

    const fetchMerged = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.issues.getMerged(canonicalIssue.id);
        setMergedList(data || []);
      } catch (err) {
        console.warn('Could not load merged reports:', err.message);
        setError('Unable to load related reports from server.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMerged();
  }, [isOpen, canonicalIssue]);

  if (!isOpen || !canonicalIssue) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl bg-[#FFFFFF] border border-[#E7E3D8] shadow-2xl z-10 flex flex-col overflow-hidden text-[#22231F]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#FFFFFF] text-[#22231F] flex items-center justify-between border-b border-[#E7E3D8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FEF9EE] border border-[#FDE68A] flex items-center justify-center">
              <Layers className="w-5 h-5 text-[#78350F]" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-[#686B65] font-semibold">
                Consolidated Problem Group
              </div>
              <h2 className="text-base font-bold text-[#22231F] tracking-tight">
                {canonicalIssue.id} — Related Reports Merged ({mergedList.length || canonicalIssue.mergedCount || 0})
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#F5F0E3] text-[#686B65] hover:text-[#22231F] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Notice */}
        <div className="p-4 bg-[#FAF8F1] border-b border-[#E7E3D8] text-xs text-[#686B65] leading-relaxed">
          <strong className="text-[#22231F]">Public Service Preservation:</strong> Original reports describing this same incident are consolidated to avoid feed clutter and give municipal crews clear priority. Original reporters, descriptions, photos, and timestamps are completely preserved below.
        </div>

        {/* Body list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin text-blue-900" />
              <span className="text-xs">Loading related reports...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ) : mergedList.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs">
              No additional merged reports recorded for this complaint.
            </div>
          ) : (
            mergedList.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-colors shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {item.id}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">{item.categoryName || item.category}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{item.title}</h4>
                  </div>
                  {onSelectIssue && (
                    <button
                      onClick={() => {
                        onClose();
                        onSelectIssue(item);
                      }}
                      className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center gap-1 transition-colors"
                    >
                      <span>View Log</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>

                {item.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-28 w-auto rounded-lg object-cover border border-slate-200"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                  <div className="flex items-center gap-1.5 truncate max-w-[60%]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{item.address}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.reportedBy?.name || 'Citizen'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.reportedAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Main Canonical Complaint: <strong>{canonicalIssue.id}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
