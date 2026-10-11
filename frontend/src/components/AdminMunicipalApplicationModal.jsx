import React, { useState } from 'react';
import {
  Building2, ShieldCheck, Mail, Phone, Globe, MapPin, FileText, CheckCircle2,
  XCircle, Clock, AlertTriangle, ArrowRight, X, Loader2, UserCheck, MessageSquare
} from 'lucide-react';
import api from '../services/api';

export default function AdminMunicipalApplicationModal({
  application,
  isOpen,
  onClose,
  onUpdated,
}) {
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  if (!isOpen || !application) return null;

  const handleReviewAction = async (targetStatus) => {
    setIsSubmitting(true);
    setError(null);
    setActionSuccess(null);

    try {
      const res = await api.admin.reviewApplication(application.id, {
        status: targetStatus,
        adminNotes: adminNotes.trim() || undefined,
        rejectionReason: targetStatus === 'REJECTED' ? rejectionReason.trim() : undefined,
        createBody: true,
      });

      setActionSuccess(`Application updated to status: ${targetStatus}`);
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error('Failed to review municipal application:', err);
      setError(err.message || 'Failed to update application status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">APPROVED</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold text-xs">REJECTED</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs">UNDER REVIEW</span>;
      case 'NEEDS_INFORMATION':
        return <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 font-bold text-xs">NEEDS INFO</span>;
      default:
        return <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs">PENDING</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] z-10">
        {/* Top Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  {application.municipalityName}
                </h2>
                {getStatusBadge(application.status)}
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Application #{application.applicationNo} • Submitted {new Date(application.createdAt).toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {actionSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Grid Information Dossier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Municipal Body Profile */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Municipal Authority Details
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {application.municipalityName}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <div>Type: <span className="font-semibold">{application.authorityType}</span></div>
                <div>Location: <span className="font-semibold">{application.city}, {application.state}</span></div>
                {application.officialWebsite && (
                  <div>
                    Website:{' '}
                    <a
                      href={application.officialWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:underline"
                    >
                      {application.officialWebsite}
                    </a>
                  </div>
                )}
                {application.officeAddress && (
                  <div>Office: {application.officeAddress}</div>
                )}
              </div>
            </div>

            {/* Applicant Profile */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Official Applicant Credentials
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {application.applicantName}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <div>Role: <span className="font-semibold">{application.applicantRole}</span></div>
                <div>Email: <span className="font-semibold">{application.applicantEmail}</span></div>
                {application.applicantPhone && (
                  <div>Phone: {application.applicantPhone}</div>
                )}
              </div>
            </div>
          </div>

          {/* Jurisdiction & Supporting Documents */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Jurisdiction & Authorization Evidence
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-300 space-y-2">
              <div>
                <span className="font-semibold">Jurisdiction / Ward Details:</span>{' '}
                {application.jurisdictionDetails || 'Standard municipal boundary.'}
              </div>
              <div>
                <span className="font-semibold">Supporting Documents / Gazette Order:</span>{' '}
                {application.supportingDocuments || 'Verified official email domain declaration.'}
              </div>
            </div>
          </div>

          {/* Review Audit History */}
          {Array.isArray(application.reviews) && application.reviews.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Review Decision History
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {application.reviews.map((r, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] text-slate-500">
                      <span>{r.reviewerName} • {r.action}</span>
                      <span>{new Date(r.createdAt).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      Status changed from <span className="text-slate-500">{r.fromStatus}</span> to{' '}
                      <span className="text-teal-600 font-bold">{r.toStatus}</span>
                    </div>
                    {r.notes && <div className="text-slate-600 dark:text-slate-300">{r.notes}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Platform Administrator Review Actions */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Platform Admin Review Actions
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Admin Evaluation Notes / Reason
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Enter verification notes, checklist results, or instructions for the applicant..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Decision Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                disabled={isSubmitting || application.status === 'UNDER_REVIEW'}
                onClick={() => handleReviewAction('UNDER_REVIEW')}
                className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold font-mono transition-all disabled:opacity-40"
              >
                Mark Under Review
              </button>

              <button
                type="button"
                disabled={isSubmitting || application.status === 'NEEDS_INFORMATION'}
                onClick={() => handleReviewAction('NEEDS_INFORMATION')}
                className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold font-mono transition-all disabled:opacity-40"
              >
                Request Information
              </button>

              <button
                type="button"
                disabled={isSubmitting || application.status === 'APPROVED'}
                onClick={() => handleReviewAction('APPROVED')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-sm disabled:opacity-40 ml-auto flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve Municipality</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting || application.status === 'REJECTED'}
                onClick={() => handleReviewAction('REJECTED')}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-sm disabled:opacity-40 flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
