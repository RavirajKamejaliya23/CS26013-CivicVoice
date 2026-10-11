import React, { useState, useEffect } from 'react';
import {
  User, Mail, Calendar, Shield, Award, CheckCircle2, Clock, AlertTriangle,
  FileText, ExternalLink, X, Loader2, MapPin, Building2, ChevronRight, Edit3
} from 'lucide-react';
import { CATEGORIES, STATUS_CONFIG } from '../data/mockIssues';
import api from '../services/api';

const ROLE_COLORS = {
  CITIZEN: 'text-amber-800 bg-amber-100 border-amber-300 dark:text-yellow-300 dark:bg-yellow-500/15 dark:border-yellow-500/30',
  MUNICIPAL: 'text-purple-800 bg-purple-100 border-purple-300 dark:text-purple-300 dark:bg-purple-500/15 dark:border-purple-500/30',
  ADMIN: 'text-rose-800 bg-rose-100 border-rose-300 dark:text-amber-300 dark:bg-amber-500/15 dark:border-amber-500/30',
};

export default function AdminUserProfileModal({
  userId,
  isOpen,
  onClose,
  onOpenTimeline,
  onRoleUpdated,
  currentAdminId,
}) {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  useEffect(() => {
    if (!isOpen || !userId) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const fetchUserProfile = async () => {
      try {
        const data = await api.admin.getUserProfile(userId);
        if (isMounted) {
          setProfileData(data);
        }
      } catch (err) {
        console.error('Failed to load user profile in admin console:', err);
        if (isMounted) {
          setError(err.message || 'Failed to retrieve administrative user dossier.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUserProfile();

    return () => {
      isMounted = false;
    };
  }, [isOpen, userId]);

  if (!isOpen || !userId) return null;

  const user = profileData?.user;
  const issues = profileData?.issues || [];
  const stats = profileData?.stats || { total: 0, byStatus: {} };

  const handleRoleChange = async (newRole) => {
    if (!user) return;
    setIsUpdatingRole(true);
    try {
      const updated = await api.admin.updateRole(user.id, newRole);
      if (updated) {
        setProfileData((prev) => ({
          ...prev,
          user: { ...prev.user, role: updated.role },
        }));
        if (onRoleUpdated) {
          onRoleUpdated(user.id, updated.role);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to update user role.');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const formatDate = (dateVal) => {
    if (!dateVal) return 'Registered Member';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return 'Registered Member';
      return d.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Registered Member';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="relative w-full max-w-2xl max-h-[90vh] rounded-3xl bg-[var(--theme-card-bg,#FFFDF5)] border border-[var(--theme-card-border,#E7DDC5)] shadow-2xl z-10 flex flex-col overflow-hidden text-[var(--theme-text-primary,#29261F)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--theme-card-border,#E7DDC5)] flex items-center justify-between bg-stone-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <span>Administrative User Dossier</span>
                <span className="text-[10px] font-mono font-normal text-stone-400">
                  #{userId}
                </span>
              </h3>
              <p className="text-[11px] text-stone-400">
                Official citizen identity, privileges &amp; submission ledger
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {isLoading && (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-xs font-mono text-[var(--theme-text-secondary,#625D52)]">
              <Loader2 className="w-6 h-6 animate-spin text-[#8A6418]" />
              <span>Retrieving user account record from PostgreSQL...</span>
            </div>
          )}

          {error && !isLoading && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono">
              {error}
            </div>
          )}

          {!isLoading && user && (
            <>
              {/* Profile Card */}
              <div className="p-4 rounded-2xl bg-white border border-[var(--theme-card-border,#E7DDC5)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-center gap-3.5">
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
                    alt={user.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-[var(--theme-card-border,#E7DDC5)] shadow-xs"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-extrabold text-[var(--theme-heading,#29261F)]">
                        {user.name}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${ROLE_COLORS[user.role] || ''}`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--theme-text-secondary,#625D52)]">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[var(--theme-text-muted,#787367)]">
                      <Calendar className="w-3 h-3" />
                      <span>Registered: {formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Role Management Dropdown */}
                <div className="sm:text-right space-y-1 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--theme-card-border,#E7DDC5)]">
                  <label className="block text-[10px] font-mono uppercase font-bold text-[var(--theme-text-secondary,#625D52)]">
                    System Role Privileges
                  </label>
                  <div className="flex items-center sm:justify-end gap-2">
                    {isUpdatingRole && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8A6418]" />}
                    <select
                      value={user.role}
                      disabled={isUpdatingRole || user.id === currentAdminId}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className="px-2.5 py-1.5 text-xs font-mono font-bold rounded-xl border border-[var(--theme-card-border,#E7DDC5)] bg-white text-[var(--theme-text-primary,#29261F)] focus:outline-none focus:ring-2 focus:ring-[#8A6418] disabled:opacity-50"
                    >
                      <option value="CITIZEN">CITIZEN</option>
                      <option value="MUNICIPAL">MUNICIPAL</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                  {user.id === currentAdminId && (
                    <p className="text-[10px] text-amber-700 dark:text-amber-400 italic">
                      * Cannot modify your own active admin account.
                    </p>
                  )}
                </div>
              </div>

              {/* Status Breakdown Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="p-3 rounded-2xl bg-white border border-[var(--theme-card-border,#E7DDC5)] shadow-2xs">
                  <div className="text-xl font-black text-[var(--theme-heading,#29261F)]">
                    {stats.total}
                  </div>
                  <div className="text-[10px] font-mono text-[var(--theme-text-secondary,#625D52)] uppercase">
                    Total Reports
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-[var(--theme-card-border,#E7DDC5)] shadow-2xs">
                  <div className="text-xl font-black text-amber-800">
                    {(stats.byStatus?.reported || 0) + (stats.byStatus?.under_review || 0)}
                  </div>
                  <div className="text-[10px] font-mono text-[var(--theme-text-secondary,#625D52)] uppercase">
                    Triage &amp; Review
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-[var(--theme-card-border,#E7DDC5)] shadow-2xs">
                  <div className="text-xl font-black text-purple-800">
                    {(stats.byStatus?.accepted || 0) + (stats.byStatus?.in_progress || 0)}
                  </div>
                  <div className="text-[10px] font-mono text-[var(--theme-text-secondary,#625D52)] uppercase">
                    Active Crews
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-[var(--theme-card-border,#E7DDC5)] shadow-2xs">
                  <div className="text-xl font-black text-emerald-800">
                    {(stats.byStatus?.completed || 0) + (stats.byStatus?.citizen_verified || 0)}
                  </div>
                  <div className="text-[10px] font-mono text-[var(--theme-text-secondary,#625D52)] uppercase">
                    Resolved
                  </div>
                </div>
              </div>

              {/* Submitted Issues List */}
              <div className="space-y-3">
                <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--theme-heading,#29261F)]">
                  Dispatches Filed by this Citizen ({issues.length})
                </h5>

                {issues.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[var(--theme-text-muted,#787367)] font-mono border border-dashed border-[var(--theme-card-border,#E7DDC5)] rounded-2xl bg-white/50">
                    No reports registered by this user account in PostgreSQL.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {issues.map((issue) => {
                      const statusMeta = STATUS_CONFIG[issue.status] || STATUS_CONFIG.reported;

                      return (
                        <div
                          key={issue.id}
                          onClick={() => {
                            onClose();
                            if (onOpenTimeline) onOpenTimeline(issue);
                          }}
                          className="group p-3 rounded-xl bg-white border border-[var(--theme-card-border,#E7DDC5)] hover:border-[#8A6418]/60 cursor-pointer transition-all flex items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {issue.imageUrl && (
                              <img
                                src={issue.imageUrl}
                                alt={issue.title}
                                className="w-10 h-10 rounded-lg object-cover border border-[var(--theme-card-border,#E7DDC5)] flex-shrink-0"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80';
                                }}
                              />
                            )}
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] font-bold text-[#8A6418]">
                                  #{issue.id}
                                </span>
                                <span className={`px-2 py-0.2 rounded-full text-[9px] font-semibold border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}>
                                  {statusMeta.label}
                                </span>
                              </div>
                              <h6 className="text-xs font-bold text-[var(--theme-heading,#29261F)] truncate group-hover:text-[#8A6418] transition-colors">
                                {issue.title}
                              </h6>
                              <p className="text-[10px] text-[var(--theme-text-secondary,#625D52)] truncate flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#8A6418] flex-shrink-0" />
                                <span className="truncate">{issue.address}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-[11px] font-bold text-[#8A6418] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <span>Inspect</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[var(--theme-card-border,#E7DDC5)] bg-[var(--theme-surface-secondary,#FDF7E7)] flex items-center justify-between text-xs text-[var(--theme-text-secondary,#625D52)] font-mono">
          <span>Protected Administrative Protocol</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-[var(--theme-card-border,#E7DDC5)] hover:bg-black/5 font-semibold text-[var(--theme-text-primary,#29261F)] transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
