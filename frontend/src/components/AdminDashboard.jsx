import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, Users, BarChart3, AlertTriangle, CheckCircle2, RefreshCw,
  Search, Loader2, X, Trash2, Copy, ChevronDown, Eye, Settings
} from 'lucide-react';
import api from '../services/api';
import { STATUS_CONFIG } from '../data/mockIssues';
import { useAuth } from '../context/AuthContext';

const ROLE_COLORS = {
  CITIZEN: 'text-yellow-300 bg-yellow-500/15 border-yellow-500/30',
  MUNICIPAL: 'text-purple-300 bg-purple-500/15 border-purple-500/30',
  ADMIN: 'text-amber-300 bg-amber-500/15 border-amber-500/30',
};

export default function AdminDashboard({ onOpenTimeline, onUpdateStatus, showNotification, initialSection = 'overview' }) {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState(initialSection);
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [issues, setIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [deletingIssueId, setDeletingIssueId] = useState(null);
  const [unlinkingId, setUnlinkingId] = useState(null);
  const [markDupState, setMarkDupState] = useState({ issueId: '', canonicalId: '' });

  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  const loadOverview = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [overviewData, usersData, issuesData] = await Promise.all([
        api.admin.getOverview(),
        api.admin.getUsers(),
        api.admin.getIssues(),
      ]);
      setOverview(overviewData);
      setUsers(usersData || []);
      setIssues(issuesData || []);
    } catch (err) {
      setError(err.message || 'Failed to load admin data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingUserId(userId);
    try {
      const updated = await api.admin.updateRole(userId, newRole);
      if (updated) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: updated.role } : u));
        showNotification({ type: 'success', message: `User role updated to ${newRole}.` });
      }
    } catch (err) {
      showNotification({ type: 'error', message: err.message || 'Failed to update role.' });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteIssue = async (issueId) => {
    if (!confirm(`Permanently delete issue ${issueId}? This cannot be undone.`)) return;
    setDeletingIssueId(issueId);
    try {
      await api.issues.delete(issueId);
      setIssues(prev => prev.filter(i => i.id !== issueId));
      showNotification({ type: 'success', message: `Issue ${issueId} deleted.` });
    } catch (err) {
      showNotification({ type: 'error', message: err.message || 'Failed to delete issue.' });
    } finally {
      setDeletingIssueId(null);
    }
  };

  const handleMarkDuplicate = async () => {
    const { issueId, canonicalId } = markDupState;
    if (!issueId.trim() || !canonicalId.trim()) return;
    try {
      await api.issues.markDuplicate(issueId.trim(), canonicalId.trim());
      showNotification({ type: 'success', message: `Issue ${issueId} marked as duplicate of canonical issue ${canonicalId}.` });
      setMarkDupState({ issueId: '', canonicalId: '' });
      loadOverview();
    } catch (err) {
      showNotification({ type: 'error', message: err.message || 'Failed to mark as duplicate.' });
    }
  };

  const handleUnlinkDuplicate = async (duplicateId) => {
    setUnlinkingId(duplicateId);
    try {
      await api.issues.unmarkDuplicate(duplicateId);
      showNotification({ type: 'success', message: `Complaint ${duplicateId} unlinked from duplicate status and restored as independent issue.` });
      loadOverview();
    } catch (err) {
      showNotification({ type: 'error', message: err.message || 'Failed to unlink duplicate.' });
    } finally {
      setUnlinkingId(null);
    }
  };

  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  const filteredIssues = issues.filter(i => {
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return i.title.toLowerCase().includes(q) || i.id.toLowerCase().includes(q) || i.address.toLowerCase().includes(q);
    }
    return true;
  });

  // Duplicates & Canonical groupings
  const duplicateIssues = issues.filter(i => Boolean(i.duplicateOf));
  const canonicalIssuesWithDuplicates = issues.filter(i => (i.mergedCount || 0) > 0);

  const navSections = [
    { id: 'overview', label: 'System Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'issues', label: 'Complaint Moderation', icon: Settings },
    { id: 'duplicates', label: `Duplicates & Merges (${duplicateIssues.length})`, icon: Copy },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-amber-950/80 to-stone-900/80 border border-amber-800/40 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mb-1">
            <Shield className="w-4 h-4" />
            <span>Administrative Control Panel</span>
          </div>
          <h2 className="text-2xl font-black text-white">
            {user?.name || 'Administrator'}
          </h2>
          <p className="text-xs text-amber-300/80 mt-0.5 font-mono">
            Full system access · ADMIN
          </p>
        </div>

        <button
          onClick={loadOverview}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-200 text-xs font-mono font-bold uppercase tracking-wider transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto p-0.5 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Section Nav */}
      <div className="flex items-center p-1 gap-1 rounded-2xl bg-white/5 border border-stone-700/40 w-fit">
        {navSections.map(sec => {
          const Icon = sec.icon;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                activeSection === sec.id
                  ? 'bg-amber-500 text-stone-950'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center gap-4 text-stone-500">
          <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
          <span className="text-xs font-mono">Loading administrative data...</span>
        </div>
      ) : (
        <>
          {/* ── OVERVIEW SECTION ── */}
          {activeSection === 'overview' && overview && (
            <div className="space-y-6">
              {/* User Stats */}
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400 mb-3">System Roles & Personnel</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Total Users', value: overview.users?.total || 0, color: 'text-white' },
                    { label: 'Total Citizens', value: overview.users?.citizens || 0, color: 'text-yellow-400' },
                    { label: 'Municipal Officers', value: overview.users?.municipal || 0, color: 'text-purple-400' },
                    { label: 'System Admins', value: overview.users?.admins || 0, color: 'text-amber-400' },
                  ].map(stat => (
                    <div key={stat.label} className="p-4 rounded-2xl bg-white/5 border border-stone-700/40">
                      <div className={`text-3xl font-black font-mono ${stat.color}`}>{stat.value}</div>
                      <div className="text-[10px] font-mono text-stone-500 uppercase tracking-wider mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Complaint Stats */}
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400 mb-3">Civic Complaint Operations</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {[
                    { label: 'Total Complaints', value: overview.issues?.total || 0, color: 'text-white' },
                    { label: 'Active Complaints', value: overview.issues?.active ?? (issues.filter(i => !['completed', 'citizen_verified'].includes(i.status)).length), color: 'text-amber-400' },
                    { label: 'Under Review', value: overview.issues?.underReview || issues.filter(i => i.status === 'under_review').length, color: 'text-orange-400' },
                    { label: 'In Progress', value: overview.issues?.inProgress || 0, color: 'text-purple-400' },
                    { label: 'Resolved (Verified)', value: (overview.issues?.verified || 0) + (overview.issues?.completed || 0), color: 'text-emerald-400' },
                    { label: 'Reopened', value: overview.issues?.reopened || 0, color: 'text-rose-400' },
                    { label: 'Merged Duplicates', value: overview.issues?.duplicatesCount || duplicateIssues.length, color: 'text-cyan-400' },
                  ].map(stat => (
                    <div key={stat.label} className="p-4 rounded-2xl bg-white/5 border border-stone-700/40">
                      <div className={`text-2xl font-black font-mono ${stat.color}`}>{stat.value}</div>
                      <div className="text-[10px] font-mono text-stone-500 uppercase tracking-wider mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Breakdown */}
              {overview.issues?.categoryCounts && (
                <div className="p-5 rounded-3xl bg-white/5 border border-stone-700/40">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400 mb-4">Category Distribution</h3>
                  <div className="space-y-3">
                    {overview.issues.categoryCounts.map(cat => {
                      const total = overview.issues.total || 1;
                      const pct = Math.round((parseInt(cat.count, 10) / total) * 100);
                      return (
                        <div key={cat.id} className="space-y-1">
                          <div className="flex justify-between text-xs font-mono text-stone-300">
                            <span>{cat.name}</span>
                            <span className="text-stone-500">{cat.count} ({pct}%)</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-stone-800">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.max(2, pct)}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── USER MANAGEMENT SECTION ── */}
          {activeSection === 'users' && (
            <div className="rounded-3xl bg-white/5 border border-stone-700/40 overflow-hidden">
              {/* Filters */}
              <div className="p-4 border-b border-stone-700/40 flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[180px]">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                </div>
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">All Roles</option>
                  <option value="CITIZEN">Citizens</option>
                  <option value="MUNICIPAL">Municipal</option>
                  <option value="ADMIN">Admins</option>
                </select>
                <span className="text-xs font-mono text-stone-500">{filteredUsers.length} users</span>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-stone-500 text-xs font-mono">No users found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="border-b border-stone-700/40">
                        <th className="text-left px-4 py-3 text-stone-500 uppercase tracking-wider font-semibold">User</th>
                        <th className="text-left px-4 py-3 text-stone-500 uppercase tracking-wider font-semibold hidden sm:table-cell">Email</th>
                        <th className="text-left px-4 py-3 text-stone-500 uppercase tracking-wider font-semibold hidden md:table-cell">Joined</th>
                        <th className="text-left px-4 py-3 text-stone-500 uppercase tracking-wider font-semibold">Role</th>
                        <th className="text-right px-4 py-3 text-stone-500 uppercase tracking-wider font-semibold">Change Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="border-b border-stone-800/60 hover:bg-white/3 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover border border-stone-700" />
                              <div>
                                <div className="font-bold text-stone-200">{u.name}</div>
                                <div className="text-stone-500 text-[10px]">ID: {u.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell text-stone-400">{u.email}</td>
                          <td className="px-4 py-3 hidden md:table-cell text-stone-500">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${ROLE_COLORS[u.role] || 'text-stone-300 bg-stone-800 border-stone-700'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {updatingUserId === u.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-amber-400 ml-auto" />
                            ) : (
                              <select
                                value={u.role}
                                onChange={e => handleRoleChange(u.id, e.target.value)}
                                disabled={u.id === user?.id}
                                className="px-2 py-1 rounded-lg bg-stone-800 border border-stone-700 text-stone-300 text-[11px] font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-40 disabled:cursor-not-allowed"
                                title={u.id === user?.id ? 'Cannot change own role' : 'Change role'}
                              >
                                <option value="CITIZEN">CITIZEN</option>
                                <option value="MUNICIPAL">MUNICIPAL</option>
                                <option value="ADMIN">ADMIN</option>
                              </select>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="p-3 border-t border-stone-800/60 text-center text-[11px] font-mono text-stone-500">
                    {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} · Roles enforced server-side
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ISSUE MODERATION SECTION ── */}
          {activeSection === 'issues' && (
            <div className="rounded-3xl bg-white/5 border border-stone-700/40 overflow-hidden">
              {/* Filters */}
              <div className="p-4 border-b border-stone-700/40 flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[180px]">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search issues..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
                </div>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">All Status</option>
                  <option value="reported">Reported</option>
                  <option value="under_review">Under Review</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="citizen_verified">Verified</option>
                  <option value="reopened">Reopened</option>
                </select>
                <span className="text-xs font-mono text-stone-500">{filteredIssues.length} issues</span>
              </div>

              {/* Mark Duplicate Modal */}
              {markDupState.issueId && (
                <div className="p-4 border-b border-amber-800/40 bg-amber-950/30">
                  <div className="text-xs font-bold text-amber-300 mb-2">
                    Mark {markDupState.issueId} as Duplicate of:
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={markDupState.canonicalId}
                      onChange={e => setMarkDupState(prev => ({ ...prev, canonicalId: e.target.value }))}
                      placeholder="e.g. CV-2026-9481"
                      className="flex-1 px-3 py-2 rounded-xl bg-stone-800 border border-amber-700 text-stone-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      onClick={handleMarkDuplicate}
                      disabled={!markDupState.canonicalId.trim()}
                      className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white text-xs font-bold transition-all"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setMarkDupState({ issueId: null, canonicalId: '' })}
                      className="px-3 py-2 rounded-xl bg-stone-700 hover:bg-stone-600 text-stone-300 text-xs font-bold transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {filteredIssues.length === 0 ? (
                <div className="p-8 text-center text-stone-500 text-xs font-mono">No issues found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="border-b border-stone-700/40">
                        <th className="text-left px-4 py-3 text-stone-500 uppercase tracking-wider font-semibold">ID</th>
                        <th className="text-left px-4 py-3 text-stone-500 uppercase tracking-wider font-semibold">Issue</th>
                        <th className="text-left px-4 py-3 text-stone-500 uppercase tracking-wider font-semibold hidden sm:table-cell">Status</th>
                        <th className="text-left px-4 py-3 text-stone-500 uppercase tracking-wider font-semibold hidden lg:table-cell">Support</th>
                        <th className="text-right px-4 py-3 text-stone-500 uppercase tracking-wider font-semibold">Moderation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredIssues.map(issue => {
                        const statusInfo = STATUS_CONFIG[issue.status] || STATUS_CONFIG.reported;
                        return (
                          <tr key={issue.id} className="border-b border-stone-800/60 hover:bg-white/3 transition-colors">
                            <td className="px-4 py-3 text-amber-400 font-bold">{issue.id}</td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-stone-200 truncate max-w-[180px]">{issue.title}</div>
                              <div className="text-stone-500 text-[10px] truncate">{issue.address}</div>
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                                {statusInfo.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 hidden lg:table-cell text-stone-400">{issue.upvotes}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => onOpenTimeline(issue)}
                                  className="px-2 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-[11px] font-bold transition-all"
                                  title="View"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => onUpdateStatus(issue)}
                                  className="px-2 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-[11px] font-bold transition-all"
                                  title="Update status"
                                >
                                  <Settings className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => setMarkDupState({ issueId: issue.id, canonicalId: '' })}
                                  className="px-2 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-600 text-white text-[11px] font-bold transition-all"
                                  title="Mark as duplicate"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteIssue(issue.id)}
                                  disabled={deletingIssueId === issue.id}
                                  className="px-2 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-600 disabled:opacity-50 text-white text-[11px] font-bold transition-all"
                                  title="Delete issue"
                                >
                                  {deletingIssueId === issue.id
                                    ? <Loader2 className="w-3 h-3 animate-spin" />
                                    : <Trash2 className="w-3 h-3" />
                                  }
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="p-3 border-t border-stone-800/60 text-center text-[11px] font-mono text-stone-500">
                    {filteredIssues.length} issues · Admin moderation powered by real PostgreSQL backend
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── DUPLICATES & MERGES SECTION ── */}
          {activeSection === 'duplicates' && (
            <div className="space-y-6">
              {/* Deduplication Policy Banner */}
              <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-stone-200">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mb-1">
                  <Copy className="w-4 h-4" />
                  <span>Civic Complaint Deduplication & Clustering Engine</span>
                </div>
                <p className="text-xs font-mono text-stone-300 leading-relaxed">
                  When multiple citizens report the same real-world civic problem (e.g. Gotri Road pothole or Manjalpur waste accumulation), CivicVoice maintains ONE canonical public complaint with consolidated supporters, while preserving each citizen's original submission, timestamp, and audit trail.
                </p>
              </div>

              {/* Manual Link Tool */}
              <div className="p-5 rounded-3xl bg-white/5 border border-stone-700/40">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  <span>Link Duplicate Complaint to Canonical Record</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-5">
                    <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">
                      Duplicate Complaint ID (will be marked as duplicate)
                    </label>
                    <input
                      type="text"
                      value={markDupState.issueId}
                      onChange={(e) => setMarkDupState((prev) => ({ ...prev, issueId: e.target.value }))}
                      placeholder="e.g. CV-VAD-2026-1002"
                      className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">
                      Canonical Complaint ID (master active record)
                    </label>
                    <input
                      type="text"
                      value={markDupState.canonicalId}
                      onChange={(e) => setMarkDupState((prev) => ({ ...prev, canonicalId: e.target.value }))}
                      placeholder="e.g. CV-VAD-2026-1001"
                      className="w-full px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleMarkDuplicate}
                      disabled={!markDupState.issueId.trim() || !markDupState.canonicalId.trim()}
                      className="w-full px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-stone-950 font-bold text-xs font-mono uppercase tracking-wider transition-all"
                    >
                      Link & Merge
                    </button>
                  </div>
                </div>
              </div>

              {/* Table 1: Canonical Records with Merged Reports */}
              <div className="rounded-3xl bg-white/5 border border-stone-700/40 overflow-hidden">
                <div className="p-4 border-b border-stone-700/40 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-200">
                      Canonical Complaints with Merged Citizen Reports
                    </h3>
                    <p className="text-[10px] font-mono text-stone-400">
                      Canonical records actively consolidating multiple citizen dispatches
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold">
                    {canonicalIssuesWithDuplicates.length} Canonical Clusters
                  </span>
                </div>

                {canonicalIssuesWithDuplicates.length === 0 ? (
                  <div className="p-8 text-center text-stone-500 text-xs font-mono">
                    No canonical issues have merged duplicates yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono">
                      <thead>
                        <tr className="border-b border-stone-700/40 text-stone-500 uppercase tracking-wider">
                          <th className="text-left px-4 py-3 font-semibold">Canonical ID</th>
                          <th className="text-left px-4 py-3 font-semibold">Master Complaint Title</th>
                          <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Ward / Locality</th>
                          <th className="text-left px-4 py-3 font-semibold">Community Supporters</th>
                          <th className="text-left px-4 py-3 font-semibold">Merged Reports</th>
                          <th className="text-left px-4 py-3 font-semibold">Status</th>
                          <th className="text-right px-4 py-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {canonicalIssuesWithDuplicates.map((issue) => {
                          const statusInfo = STATUS_CONFIG[issue.status] || STATUS_CONFIG.reported;
                          return (
                            <tr key={issue.id} className="border-b border-stone-800/60 hover:bg-white/3 transition-colors">
                              <td className="px-4 py-3 font-bold text-amber-400">{issue.id}</td>
                              <td className="px-4 py-3 text-stone-200 font-medium max-w-[220px] truncate">
                                {issue.title}
                              </td>
                              <td className="px-4 py-3 hidden md:table-cell text-stone-400 max-w-[160px] truncate">
                                {issue.address}
                              </td>
                              <td className="px-4 py-3 font-bold text-yellow-300">
                                {issue.upvotes} citizens
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
                                  {issue.mergedCount} related report{issue.mergedCount !== 1 ? 's' : ''} merged
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                                  {statusInfo.label}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => onOpenTimeline(issue)}
                                  className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-bold transition-all"
                                >
                                  View Dossier
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Table 2: All Duplicate Submissions Ledger */}
              <div className="rounded-3xl bg-white/5 border border-stone-700/40 overflow-hidden">
                <div className="p-4 border-b border-stone-700/40 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-stone-200">
                      Duplicate Submissions Registry
                    </h3>
                    <p className="text-[10px] font-mono text-stone-400">
                      Historical citizen reports linked to canonical master records
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-stone-800 text-stone-300 border border-stone-700 text-[10px] font-mono font-bold">
                    {duplicateIssues.length} Linked Records
                  </span>
                </div>

                {duplicateIssues.length === 0 ? (
                  <div className="p-8 text-center text-stone-500 text-xs font-mono">
                    No complaints are currently marked as duplicates.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono">
                      <thead>
                        <tr className="border-b border-stone-700/40 text-stone-500 uppercase tracking-wider">
                          <th className="text-left px-4 py-3 font-semibold">Duplicate ID</th>
                          <th className="text-left px-4 py-3 font-semibold">Reported Issue</th>
                          <th className="text-left px-4 py-3 font-semibold">Linked Canonical ID</th>
                          <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Original Reporter</th>
                          <th className="text-right px-4 py-3 font-semibold">Audit Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {duplicateIssues.map((dup) => (
                          <tr key={dup.id} className="border-b border-stone-800/60 hover:bg-white/3 transition-colors">
                            <td className="px-4 py-3 font-bold text-stone-400">{dup.id}</td>
                            <td className="px-4 py-3 max-w-[200px] truncate text-stone-300">
                              <div className="font-medium truncate">{dup.title}</div>
                              <div className="text-[10px] text-stone-500 truncate">{dup.address}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                                {dup.duplicateOf}
                              </span>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell text-stone-400">
                              {dup.reportedBy?.name || 'Citizen'}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => onOpenTimeline(dup)}
                                  className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-bold transition-all"
                                  title="View audit history"
                                >
                                  View
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUnlinkDuplicate(dup.id)}
                                  disabled={unlinkingId === dup.id}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-900/40 hover:bg-rose-800 text-rose-200 border border-rose-700/50 text-[11px] font-bold transition-all disabled:opacity-50"
                                  title="Unlink and restore as independent complaint"
                                >
                                  {unlinkingId === dup.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    'Unlink'
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
