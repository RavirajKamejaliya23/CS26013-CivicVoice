import React, { useState } from 'react';
import {
  Building2, ShieldCheck, Mail, Phone, Globe, MapPin, FileText, CheckCircle2,
  AlertCircle, X, Loader2, ArrowRight, Upload, Lock
} from 'lucide-react';
import api from '../services/api';

export default function MunicipalOnboardingModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    applicantName: '',
    applicantEmail: '',
    applicantRole: 'Municipal Commissioner',
    applicantPhone: '',
    municipalityName: '',
    authorityType: 'MUNICIPAL_CORPORATION',
    city: '',
    state: 'Gujarat',
    officialWebsite: '',
    officeAddress: '',
    jurisdictionDetails: '',
    supportingDocuments: '',
    declarationConfirmed: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submittedApp, setSubmittedApp] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.applicantName.trim() || !formData.applicantEmail.trim()) {
      setError('Please provide applicant full name and official contact email.');
      return;
    }

    if (!formData.municipalityName.trim() || !formData.city.trim() || !formData.state.trim()) {
      setError('Please provide the official municipal body name, city, and state.');
      return;
    }

    if (!formData.declarationConfirmed) {
      setError('You must confirm that you are authorized to submit this onboarding application.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.municipalities.submitOnboarding(formData);
      setSubmittedApp(res.data?.application || res.application || true);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Failed to submit onboarding application:', err);
      setError(err.message || 'Failed to submit application. Please verify all details.');
    } finally {
      setIsSubmitting(false);
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
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] z-10">
        {/* Top Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">
                Municipal Authority Onboarding
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Connect your Municipal Corporation, Council or Nagar Palika to CivicVoice
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
          {submittedApp ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Application Submitted for Verification
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  Your municipal onboarding application has been queued with application reference{' '}
                  <span className="font-mono font-bold text-teal-700 dark:text-teal-400">
                    {typeof submittedApp === 'object' && submittedApp.applicationNo ? submittedApp.applicationNo : 'PENDING'}
                  </span>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left text-xs text-slate-600 dark:text-slate-300 space-y-2 max-w-md mx-auto font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Authority:</span>
                  <span className="font-bold">{formData.municipalityName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Applicant:</span>
                  <span>{formData.applicantName} ({formData.applicantRole})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Review Status:</span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">PENDING ADMIN VERIFICATION</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Platform administrators will verify your authority credentials and send an activation invitation link to {formData.applicantEmail}.
              </p>

              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold font-mono tracking-wider uppercase transition-all shadow-sm"
              >
                Close & Return to CivicVoice
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Informational Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  CivicVoice requires government verification for all local authorities. Applications are verified by platform administrators before administrative dispatch rights are activated.
                </p>
              </div>

              {/* Section 1: Authority Profile */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  1. Municipal Body Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Official Authority Name *
                    </label>
                    <input
                      type="text"
                      name="municipalityName"
                      value={formData.municipalityName}
                      onChange={handleChange}
                      placeholder="e.g. Surat Municipal Corporation"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Authority Type *
                    </label>
                    <select
                      name="authorityType"
                      value={formData.authorityType}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="MUNICIPAL_CORPORATION">Municipal Corporation (Mahanagar Palika)</option>
                      <option value="MUNICIPALITY">Municipality (Nagarpalika)</option>
                      <option value="CANTONMENT_BOARD">Cantonment Board</option>
                      <option value="DEVELOPMENT_AUTHORITY">Urban Development Authority (UDA)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Official Website
                    </label>
                    <input
                      type="url"
                      name="officialWebsite"
                      value={formData.officialWebsite}
                      onChange={handleChange}
                      placeholder="https://example.gov.in"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Surat"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      State / UT *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="e.g. Gujarat"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Applicant Identity */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  2. Official Applicant Credentials
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Officer Full Name *
                    </label>
                    <input
                      type="text"
                      name="applicantName"
                      value={formData.applicantName}
                      onChange={handleChange}
                      placeholder="e.g. Rajesh K. Patel"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Official Gov Email *
                    </label>
                    <input
                      type="email"
                      name="applicantEmail"
                      value={formData.applicantEmail}
                      onChange={handleChange}
                      placeholder="e.g. officer@surat.gov.in"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Designation / Role *
                    </label>
                    <input
                      type="text"
                      name="applicantRole"
                      value={formData.applicantRole}
                      onChange={handleChange}
                      placeholder="e.g. Municipal Commissioner / IT Officer"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Office Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="applicantPhone"
                      value={formData.applicantPhone}
                      onChange={handleChange}
                      placeholder="+91 261 2450000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Jurisdiction & Supporting Details */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  3. Jurisdiction & Verification Documents
                </h3>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Jurisdiction Details / Administrative Wards
                  </label>
                  <textarea
                    rows={2}
                    name="jurisdictionDetails"
                    value={formData.jurisdictionDetails}
                    onChange={handleChange}
                    placeholder="e.g. Zones: East, West, North, Central. Total 30 municipal wards covering 462 sq km."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Supporting Authorization Evidence (Document Link / Order No)
                  </label>
                  <input
                    type="text"
                    name="supportingDocuments"
                    value={formData.supportingDocuments}
                    onChange={handleChange}
                    placeholder="e.g. Govt Gazette Notification No. / Public Grievance Cell Order"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Declaration Checkbox */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name="declarationConfirmed"
                    checked={formData.declarationConfirmed}
                    onChange={handleChange}
                    className="mt-0.5 rounded border-amber-400 text-teal-600 focus:ring-teal-500"
                    required
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    I declare and certify that I am a duly authorized official representing this municipal body, and I apply to connect our jurisdiction to the CivicVoice redressal network.
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold font-mono tracking-wider uppercase transition-all shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Application</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
