import React, { useState, useEffect } from 'react';
import {
  User, Mail, Calendar, Shield, Award, CheckCircle2, Clock, AlertTriangle,
  FileText, ExternalLink, X, Loader2, Plus, MapPin, Building2, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, STATUS_CONFIG } from '../data/mockIssues';
import api from '../services/api';

export default function CitizenProfileModal({
  isOpen,
  onClose,
  onOpenTimeline,
  onOpenReportModal,
}) {
  const { user, role } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [userIssues, setUserIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !user) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const loadProfileAndIssues = async () => {
      try {
        // Fetch fresh profile data
        const authData = await api.auth.getMe();
        const currentUser = authData?.user || user;
        if (isMounted) setProfileData(currentUser);

        // Fetch user's own submitted reports from PostgreSQL
        const issues = await api.issues.getAll({
          reporterId: currentUser.id,
          canonicalOnly: false,
        });

        if (isMounted) {
          setUserIssues(issues || []);
        }
      } catch (err) {
        console.error('Failed to load profile details:', err);
        if (isMounted) {
          setError(err.message || 'Unable to retrieve profile from server.');
          // Fallback to currently cached auth user
          setProfileData(user);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadProfileAndIssues();

    return () => {
      isMounted = false;
    };
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const displayUser = profileData || user;

  // Format creation date
  const formatRegistrationDate = (dateVal) => {
    if (!dateVal) return 'Active Member';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return 'Active Member';
      return d.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Active Member';
    }
  };

  // Status breakdown
  const statusCounts = {
    total: userIssues.length,
    active: userIssues.filter((i) => ['reported', 'under_review', 'accepted', 'in_progress', 'reopened'].includes(i.status)).length,
    resolved: userIssues.filter((i) => ['completed', 'citizen_verified'].includes(i.status)).length,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] rounded-3xl bg-[var(--theme-card-bg,#FFFDF5)] border border-[var(--theme-card-border,#E7DDC5)] shadow-2xl z-10 flex flex-col overflow-hidden text-[var(--theme-text-primary,#29261F)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[var(--theme-card-border,#E7DDC5)] flex items-center justify-between bg-[var(--theme-surface-secondary,#FDF7E7)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#8A6418]/15 border border-[#8A6418]/30 flex items-center justify-center text-[#8A6418]">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[var(--theme-heading,#29261F)]">
                Citizen Account Profile
              </h3>
              <p className="text-[11px] text-[var(--theme-text-secondary,#625D52)]">
                Verified registration details and personal dispatch records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-black/5 text-[var(--theme-text-secondary,#625D52)] hover:text-[var(--theme-text-primary,#29261F)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* User Profile Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[var(--theme-card-border,#E7DDC5)] shadow-2xs">
            <div className="flex items-center gap-4">
              <img
                src={displayUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                alt={displayUser.name || 'Citizen'}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#8A6418]/30 shadow-xs"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80';
                }}
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-extrabold text-[var(--theme-heading,#29261F)]">
                    {displayUser.name || 'Citizen'}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[var(--theme-pill-bg,#FDF1CE)] text-[#8A6418] border border-[var(--theme-card-border,#E7DDC5)]">
                    {displayUser.role || role || 'CITIZEN'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[var(--theme-text-secondary,#625D52)]">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{displayUser.email || 'No email registered'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--theme-text-muted,#787367)]">
                  <Calendar className="w-3 h-3" />
                  <span>Member Since: {formatRegistrationDate(displayUser.createdAt || displayUser.created_at)}</span>
                </div>
              </div>
            </div>

            {displayUser.badge && (
              <div className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>{displayUser.badge}</span>
              </div>
            )}
          </div>

          {/* Activity Metrics Ledger */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-white border border-[var(--theme-card-border,#E7DDC5)] shadow-2xs">
              <div className="text-xl sm:text-2xl font-black text-[var(--theme-heading,#29261F)]">
                {isLoading ? '-' : statusCounts.total}
              </div>
              <div className="text-[11px] font-medium text-[var(--theme-text-secondary,#625D52)]">
                Total Filed
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-[var(--theme-card-border,#E7DDC5)] shadow-2xs">
              <div className="text-xl sm:text-2xl font-black text-amber-800">
                {isLoading ? '-' : statusCounts.active}
              </div>
              <div className="text-[11px] font-medium text-[var(--theme-text-secondary,#625D52)]">
                Under Action
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-[var(--theme-card-border,#E7DDC5)] shadow-2xs">
              <div className="text-xl sm:text-2xl font-black text-emerald-800">
                {isLoading ? '-' : statusCounts.resolved}
              </div>
              <div className="text-[11px] font-medium text-[var(--theme-text-secondary,#625D52)]">
                Resolved
              </div>
            </div>
          </div>

          {/* User's Submitted Complaints Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-heading,#29261F)]">
                My Submitted Complaints ({userIssues.length})
              </h5>
              {onOpenReportModal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenReportModal();
                  }}
                  className="text-xs font-bold text-[#8A6418] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Report New</span>
                </button>
              )}
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-[var(--theme-text-secondary,#625D52)] font-mono">
                <Loader2 className="w-5 h-5 animate-spin text-[#8A6418]" />
                <span>Fetching your records from database...</span>
              </div>
            )}

            {/* Error */}
            {error && !isLoading && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {error}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && userIssues.length === 0 && (
              <div className="py-12 px-4 rounded-2xl border border-dashed border-[var(--theme-card-border,#E7DDC5)] text-center space-y-3 bg-white/50">
                <FileText className="w-8 h-8 text-[var(--theme-text-muted,#787367)] mx-auto" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[var(--theme-heading,#29261F)]">
                    No Complaints Filed Yet
                  </p>
                  <p className="text-[11px] text-[var(--theme-text-secondary,#625D52)] max-w-sm mx-auto">
                    When you report civic issues like potholes, drainage blocks, or dark streetlights, they will appear here with live resolution updates.
                  </p>
                </div>
                {onOpenReportModal && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenReportModal();
                    }}
                    className="px-4 py-2 rounded-xl bg-[#8A6418] hover:bg-[#735212] text-white text-xs font-bold shadow-sm inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>File Your First Report</span>
                  </button>
                )}
              </div>
            )}

            {/* Reports List */}
            {!isLoading && userIssues.length > 0 && (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {userIssues.map((issue) => {
                  const statusMeta = STATUS_CONFIG[issue.status] || STATUS_CONFIG.reported;
                  const cat = CATEGORIES.find((c) => c.id === issue.category) || { label: issue.categoryName || 'General' };

                  return (
                    <div
                      key={issue.id}
                      onClick={() => {
                        onClose();
                        if (onOpenTimeline) onOpenTimeline(issue);
                      }}
                      className="group p-3.5 rounded-2xl bg-white border border-[var(--theme-card-border,#E7DDC5)] hover:border-[#8A6418]/50 hover:shadow-sm cursor-pointer transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {issue.imageUrl && (
                          <img
                            src={issue.imageUrl}
                            alt={issue.title}
                            className="w-12 h-12 rounded-xl object-cover border border-[var(--theme-card-border,#E7DDC5)] flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80';
                            }}
                          />
                        )}
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold text-[#8A6418]">
                              #{issue.id}
                            </span>
                            <span className={`px-2 py-0.2 rounded-full text-[10px] font-semibold border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}>
                              {statusMeta.label}
                            </span>
                          </div>
                          <h6 className="text-xs font-bold text-[var(--theme-heading,#29261F)] truncate group-hover:text-[#8A6418] transition-colors">
                            {issue.title}
                          </h6>
                          <div className="flex items-center gap-3 text-[10px] text-[var(--theme-text-secondary,#625D52)]">
                            <span className="truncate flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#8A6418] flex-shrink-0" />
                              <span className="truncate">{issue.address}</span>
                            </span>
                            <span>•</span>
                            <span className="whitespace-nowrap">{issue.reportedAt || 'Recent'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-1.5 rounded-xl group-hover:bg-[var(--theme-surface-secondary,#FDF7E7)] text-[var(--theme-text-muted,#787367)] group-hover:text-[#8A6418] transition-colors flex-shrink-0">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[var(--theme-card-border,#E7DDC5)] bg-[var(--theme-surface-secondary,#FDF7E7)] flex items-center justify-between text-xs text-[var(--theme-text-secondary,#625D52)]">
          <span>Official Civic Registry Record</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-[var(--theme-card-border,#E7DDC5)] hover:bg-black/5 font-semibold text-[var(--theme-text-primary,#29261F)] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
