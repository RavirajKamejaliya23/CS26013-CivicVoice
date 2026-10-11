import React, { useState, useEffect } from 'react';
import { X, Shield, CheckCircle, Camera, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { safePlaySound } from '../utils/audio';
import api from '../services/api';

export default function AdminActionModal({ issue, onClose, onUpdateStatus }) {
  const { user } = useAuth();
  const [nextStatus, setNextStatus] = useState('in_progress');
  const [officerName, setOfficerName] = useState('');
  const [department, setDepartment] = useState('');
  const [note, setNote] = useState('');
  const [evidenceMode, setEvidenceMode] = useState('upload'); // 'upload' | 'url'
  const [evidenceUrl, setEvidenceUrl] = useState('https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80');
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidencePreview, setEvidencePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (issue) {
      setNextStatus(issue.status || 'in_progress');
      setOfficerName(user?.name || 'Administrator');
      setDepartment(user?.department || 'Executive Municipal Oversight Board');
      setError('');
      setEvidenceFile(null);
      setEvidencePreview(null);
    }
  }, [issue, user]);

  if (!issue) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid photographic image file (JPEG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size exceeds 5MB limit. Please upload a smaller photo.');
      return;
    }

    setError('');
    setEvidenceFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setEvidencePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!note.trim()) {
      setError('Please provide an action/progress update note.');
      return;
    }

    let finalEvidenceUrl = null;
    if (nextStatus === 'completed') {
      if (evidenceMode === 'upload') {
        if (!evidenceFile && !evidencePreview) {
          setError('Please upload a completion photograph showing the resolved work.');
          return;
        }
      } else {
        if (!evidenceUrl.trim()) {
          setError('Please provide a completion photographic evidence URL.');
          return;
        }
        finalEvidenceUrl = evidenceUrl.trim();
      }
    }

    setIsSubmitting(true);
    setError('');
    try {
      if (nextStatus === 'completed' && evidenceFile) {
        const uploadResult = await api.issues.uploadEvidence(issue.id, evidenceFile);
        if (!uploadResult?.evidenceUrl) {
          throw new Error('Image upload failed to generate valid evidence reference on server.');
        }
        finalEvidenceUrl = uploadResult.evidenceUrl;
      }

      if (onUpdateStatus) {
        await onUpdateStatus(issue.id, {
          status: nextStatus,
          author: officerName.trim() || user?.name || 'Administrator',
          role: department.trim() || user?.department || 'Executive Municipal Board',
          note: note.trim(),
          evidenceUrl: nextStatus === 'completed' ? finalEvidenceUrl : null,
        });
      }
      safePlaySound('playStampThud');
      setNote('');
      onClose();
    } catch (err) {
      console.error('[Admin Action Status Update Failed]:', err);
      setError(err.message || 'Failed to update status on server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
      />

      <div
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-2xl z-10 flex flex-col overflow-hidden text-stone-900 dark:text-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Purple Admin Banner */}
        <div className="px-6 py-4 bg-purple-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-amber-300" />
            <div>
              <div className="text-[10px] font-mono tracking-widest uppercase text-purple-200 font-bold">
                MUNICIPAL AUTHORITY CONSOLE
              </div>
              <div className="font-bold text-sm text-white">
                Advance Lifecycle: {issue.id}
              </div>
            </div>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs font-mono flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span className="flex-1 leading-snug">{error}</span>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target Status Selector */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2 font-bold">
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
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left font-mono ${
                    nextStatus === s.key
                      ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-750'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Officer Credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-stone-600 dark:text-stone-400 mb-1 font-semibold">
                Authorized Officer
              </label>
              <input
                type="text"
                required
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-stone-600 dark:text-stone-400 mb-1 font-semibold">
                Department / Agency
              </label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Action Note */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="admin-action-note"
                className="block text-xs font-mono uppercase tracking-wider text-stone-800 dark:text-stone-200 font-bold"
              >
                Dispatch Update Note <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] font-mono text-stone-400">
                {note.length} characters
              </span>
            </div>
            <textarea
              id="admin-action-note"
              name="note"
              required
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Squad dispatched with asphalt roller. Work scheduled to finish by 16:00."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
            />
          </div>

          {/* Evidence photo if completed */}
          {nextStatus === 'completed' && (
            <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5 font-mono">
                  <Camera className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Completion Photographic Evidence (Mandatory)</span>
                </div>
                <div className="flex items-center gap-1 bg-teal-100 dark:bg-teal-900/60 p-0.5 rounded-lg text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => setEvidenceMode('upload')}
                    className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                      evidenceMode === 'upload' ? 'bg-teal-700 text-white shadow-2xs' : 'text-teal-800 dark:text-teal-300'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvidenceMode('url')}
                    className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                      evidenceMode === 'url' ? 'bg-teal-700 text-white shadow-2xs' : 'text-teal-800 dark:text-teal-300'
                    }`}
                  >
                    Image URL
                  </button>
                </div>
              </div>

              {evidenceMode === 'upload' ? (
                <div className="space-y-2">
                  {evidencePreview ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-teal-300 dark:border-teal-700 bg-stone-900">
                      <img
                        src={evidencePreview}
                        alt="Completion preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setEvidenceFile(null);
                          setEvidencePreview(null);
                        }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-black/70 hover:bg-black text-white text-xs"
                        title="Remove photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono">
                        ✓ {evidenceFile?.name} ({(evidenceFile?.size / 1024).toFixed(0)} KB)
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-teal-300 dark:border-teal-700 hover:border-teal-500 bg-teal-50/50 dark:bg-teal-900/20 cursor-pointer text-center transition-colors">
                      <Camera className="w-6 h-6 text-teal-600 dark:text-teal-400 mb-1" />
                      <span className="text-xs font-bold text-teal-900 dark:text-teal-200">
                        Choose / Take Completed Work Photo
                      </span>
                      <span className="text-[10px] text-teal-700 dark:text-teal-300">
                        JPEG, PNG, WebP up to 5MB (Mobile camera or desktop)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              ) : (
                <div>
                  <input
                    type="url"
                    required
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-stone-900 border border-teal-300 dark:border-teal-700 text-stone-900 dark:text-stone-100 font-mono"
                  />
                </div>
              )}

              <p className="text-[10px] text-teal-700 dark:text-teal-300 font-mono">
                * Uploaded evidence will appear immediately on the citizen verification timeline.
              </p>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold font-mono transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !note.trim()}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold font-mono flex items-center gap-2 shadow-md transition-all active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Commit Status Update</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
