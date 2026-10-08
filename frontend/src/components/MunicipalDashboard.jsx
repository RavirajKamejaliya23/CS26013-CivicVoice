import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, BarChart3, Clock, CheckCircle2, AlertTriangle, RefreshCw,
  Search, Filter, ArrowUpRight, Loader2, X, ChevronDown, Building2,
  FileCheck, TrendingUp, RotateCcw, Eye, Edit3, MapPin
} from 'lucide-react';
import api from '../services/api';
import { STATUS_CONFIG, CATEGORIES } from '../data/mockIssues';
import { useAuth } from '../context/AuthContext';
import MunicipalProgressModal from './MunicipalProgressModal';

const STATUS_OPTIONS = [
  { id: 'all', label: 'All Dispatches' },
  { id: 'reported', label: '1. New Reports' },
  { id: 'under_review', label: '2. Under Review' },
  { id: 'accepted', label: '3. Accepted (Work Orders)' },
  { id: 'in_progress', label: '4. In Progress (Crews Active)' },
  { id: 'completed', label: '5. Awaiting Citizen Verification' },
  { id: 'citizen_verified', label: '6. Community Verified' },
  { id: 'reopened', label: '7. Reopened Work' },
];

export default function MunicipalDashboard({ onOpenTimeline, onUpdateStatus, initialSection = 'overview' }) {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState(initialSection === 'departments' ? 'departments' : 'queue');
  const [overview, setOverview] = useState(null);
  const [issues, setIssues] = useState([]);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);
  const [isLoadingIssues, setIsLoadingIssues] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dedicated modal for Municipal Progress Notes
  const [selectedIssueForProgress, setSelectedIssueForProgress] = useState(null);

  useEffect(() => {
    if (initialSection === 'departments') {
      setActiveView('departments');
    }
  }, [initialSection]);

  const loadOverview = useCallback(async () => {
    setIsLoadingOverview(true);
    try {
      const data = await api.municipal.getOverview();
      setOverview(data);
    } catch (err) {
      setError(err.message || 'Failed to load municipal operations overview.');
    } finally {
      setIsLoadingOverview(false);
    }
  }, []);

  const loadIssues = useCallback(async () => {
    setIsLoadingIssues(true);
    try {
      const data = await api.municipal.getIssues({
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery.trim() || undefined,
      });
      setIssues(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load dispatch queue.');
    } finally {
      setIsLoadingIssues(false);
    }
  }, [statusFilter, categoryFilter, searchQuery]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    const timer = setTimeout(loadIssues, 250);
    return () => clearTimeout(timer);
  }, [loadIssues]);

  const handleProgressSuccess = (updatedIssue) => {
    if (!updatedIssue) return;
    setIssues((prev) =>
      prev.map((item) => (item.id === updatedIssue.id ? updatedIssue : item))
    );
    loadOverview();
    if (onUpdateStatus) {
      onUpdateStatus(updatedIssue);
    }
  };

  const statCards = [
    {
      label: 'New Reports',
      value: overview?.reportedCount ?? 0,
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      description: 'Incoming triage',
    },
    {
      label: 'Under Review',
      value: overview?.pendingReviewCount ?? 0,
      icon: <Eye className="w-5 h-5" />,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      description: 'Desk assessment',
    },
    {
      label: 'In Progress',
      value: overview?.inProgressCount ?? 0,
      icon: <Clock className="w-5 h-5" />,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      description: 'Field squad onsite',
    },
    {
      label: 'Awaiting Verification',
      value: overview?.completedPendingVerifyCount ?? 0,
      icon: <FileCheck className="w-5 h-5" />,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
      border: 'border-teal-500/30',
      description: 'Proof uploaded',
    },
    {
      label: 'Completed & Verified',
      value: overview?.stats?.verified ?? 0,
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      description: 'Citizen approved',
    },
    {
      label: 'Reopened by Citizens',
      value: overview?.reopenedCount ?? 0,
      icon: <RotateCcw className="w-5 h-5" />,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      description: 'Requires rework',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Top Operations Banner ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-stone-900 border border-purple-800/40 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-purple-400 mb-1">
            <Shield className="w-4 h-4 text-purple-400" />
            <span>MUNICIPAL OPERATIONS COMMAND</span>
          </div>
          <h2 className="text-2xl font-black text-white">
            {user?.name || 'Municipal Officer'}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs font-mono text-stone-400">
            <span className="text-purple-300 font-bold">
              {user?.department || 'Department of Public Works'}
            </span>
            <span>·</span>
            <span className="px-2 py-0.5 rounded bg-purple-900/50 text-purple-200 border border-purple-700/50 text-[10px] uppercase font-bold">
              Authorized Dispatcher
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            loadOverview();
            loadIssues();
          }}
          disabled={isLoadingIssues || isLoadingOverview}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingIssues ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* ── Error Banner ─────────────────────────────────────────────────── */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="p-1 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Operations Stat Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`p-4 rounded-2xl border ${card.bg} ${card.border} flex flex-col justify-between transition-all hover:scale-[1.01]`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={card.color}>{card.icon}</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                {card.description}
              </span>
            </div>
            <div>
              <div className={`text-2xl font-black font-mono ${card.color}`}>
                {isLoadingOverview ? '...' : card.value}
              </div>
              <div className="text-[11px] font-mono text-stone-300 uppercase tracking-wide mt-0.5 font-bold">
                {card.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Subtab View Switcher: Operational Queue | Department Workload | Ward-wise Distribution ── */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-stone-900 border border-stone-800 w-fit">
        <button
          type="button"
          onClick={() => setActiveView('queue')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
            activeView === 'queue'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-stone-400 hover:text-white hover:bg-stone-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Operational Queue</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveView('departments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
            activeView === 'departments'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-stone-400 hover:text-white hover:bg-stone-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Department Workload</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveView('wards')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
            activeView === 'wards'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-stone-400 hover:text-white hover:bg-stone-800'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Ward-wise Complaints</span>
        </button>
      </div>

      {/* ── VIEW 1: Operational Dispatch Queue Table ────────────────────────────── */}
      {activeView === 'queue' && (
        <div className="rounded-3xl bg-stone-900 border border-stone-800 shadow-xl overflow-hidden">
          {/* Table Filters Bar */}
          <div className="p-4 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 bg-stone-950/50">
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by ticket #CV, address, keyword..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder:text-stone-500 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs font-mono text-stone-400">
              {issues.length} active ticket{issues.length !== 1 ? 's' : ''} in view
            </div>
          </div>

          {/* Table Content */}
          {isLoadingIssues ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3 text-stone-400">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              <span className="text-xs font-mono">Synchronizing dispatch queue from PostgreSQL...</span>
            </div>
          ) : issues.length === 0 ? (
            <div className="p-12 text-center text-stone-400">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-80" />
              <p className="text-sm font-bold text-stone-200 font-mono">No Tickets in Current Queue</p>
              <p className="text-xs text-stone-500 font-mono mt-1">
                All dispatches in this category/status have been handled or no records match your filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-stone-300">
                <thead>
                  <tr className="border-b border-stone-800 bg-stone-950/80 text-[11px] text-stone-400 uppercase tracking-wider">
                    <th className="text-left px-4 py-3.5 font-bold">Ticket ID</th>
                    <th className="text-left px-4 py-3.5 font-bold">Issue Description & Merges</th>
                    <th className="text-left px-4 py-3.5 font-bold hidden sm:table-cell">Ward / Location</th>
                    <th className="text-left px-4 py-3.5 font-bold hidden md:table-cell">Category</th>
                    <th className="text-left px-4 py-3.5 font-bold">Current Status</th>
                    <th className="text-left px-4 py-3.5 font-bold hidden lg:table-cell">Citizen Support</th>
                    <th className="text-right px-4 py-3.5 font-bold">Operational Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/80">
                  {issues.map((issue) => {
                    const statusInfo = STATUS_CONFIG[issue.status] || STATUS_CONFIG.reported;
                    const catInfo = CATEGORIES.find((c) => c.id === issue.category) || CATEGORIES[1];
                    return (
                      <tr
                        key={issue.id}
                        className="hover:bg-white/[0.03] transition-colors group"
                      >
                        {/* ID */}
                        <td className="px-4 py-3.5 font-bold text-amber-400 whitespace-nowrap">
                          {issue.id}
                        </td>

                        {/* Title, Reporter & Canonical/Duplicate Badges */}
                        <td className="px-4 py-3.5 max-w-[260px]">
                          <div className="font-bold text-white truncate" title={issue.title}>
                            {issue.title}
                          </div>
                          <div className="text-[10px] text-stone-500 truncate mt-0.5">
                            Reported by {issue.reportedBy?.name || 'Citizen'} · {issue.reportedAt}
                          </div>

                          {/* Section 18: Canonical Complaint & Merged Reports badge */}
                          {issue.mergedCount > 0 && (
                            <div className="mt-1 flex items-center gap-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-700/60">
                                <span>{issue.mergedCount} related report{issue.mergedCount !== 1 ? 's' : ''} merged</span>
                              </span>
                            </div>
                          )}
                          {issue.duplicateOf && (
                            <div className="mt-1 flex items-center gap-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-700/60">
                                <span>Duplicate of {issue.duplicateOf}</span>
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Location / Ward */}
                        <td className="px-4 py-3.5 hidden sm:table-cell text-stone-300 max-w-[180px] truncate">
                          <div className="flex items-center gap-1 truncate" title={issue.address}>
                            <MapPin className="w-3 h-3 text-amber-400 flex-shrink-0" />
                            <span className="truncate">{issue.address}</span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3.5 hidden md:table-cell text-stone-400 whitespace-nowrap">
                          {catInfo.label}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                            {statusInfo.label}
                          </span>
                        </td>

                        {/* Citizen Support & Reports Volume (Section 18) */}
                        <td className="px-4 py-3.5 hidden lg:table-cell text-stone-300 whitespace-nowrap">
                          <div className="font-bold text-yellow-400">{issue.upvotes} supporters</div>
                          {issue.mergedCount > 0 && (
                            <div className="text-[10px] font-mono text-cyan-300">
                              {issue.upvotes + issue.mergedCount} total reports
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => onOpenTimeline(issue)}
                              className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-[11px] font-bold transition-all flex items-center gap-1 border border-stone-700"
                              title="View Dispatch Timeline & Dossier"
                            >
                              <Eye className="w-3 h-3" />
                              <span className="hidden sm:inline">Dossier</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedIssueForProgress(issue)}
                              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold transition-all flex items-center gap-1 shadow-md active:scale-95"
                              title="Update Work Progress & Lifecycle Status"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Update Progress</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-3 border-t border-stone-800 text-center text-[11px] font-mono text-stone-500 bg-stone-950/60">
            Showing {issues.length} dispatch ticket{issues.length !== 1 ? 's' : ''} · Official Municipal Operations Ledger
          </div>
        </div>
      )}

      {/* ── VIEW 2: Department Workload Breakdown ────────────────────────────────── */}
      {activeView === 'departments' && (
        <div className="rounded-3xl bg-stone-900 border border-stone-800 shadow-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white font-mono uppercase tracking-tight flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                <span>Vadodara Municipal Department Workloads</span>
              </h3>
              <p className="text-xs text-stone-400 font-mono mt-0.5">
                Active municipal work orders assigned across specialized engineering wings
              </p>
            </div>
            <span className="text-xs font-mono text-purple-300 bg-purple-900/30 px-3 py-1.5 rounded-xl border border-purple-700/40 font-bold">
              7 Active Departments
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CATEGORIES.filter((c) => c.id !== 'all').map((dept) => {
              const deptIssues = issues.filter((i) => i.category === dept.id);
              const activeCount = deptIssues.filter((i) => ['reported', 'under_review', 'accepted', 'in_progress', 'reopened'].includes(i.status)).length;
              const inProgressCount = deptIssues.filter((i) => i.status === 'in_progress').length;
              const completedCount = deptIssues.filter((i) => ['completed', 'citizen_verified'].includes(i.status)).length;
              const pct = deptIssues.length > 0 ? Math.round((completedCount / deptIssues.length) * 100) : 0;

              return (
                <div key={dept.id} className="p-5 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white font-mono">{dept.label}</h4>
                      <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                        {deptIssues.length} total dispatches · {activeCount} active work orders
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      {inProgressCount} Crews Onsite
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-stone-400">
                      <span>Resolution Clearance</span>
                      <span className="text-purple-300 font-bold">{pct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(5, pct)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 pt-1 border-t border-stone-800/60">
                    <span>Under Investigation: {deptIssues.filter((i) => i.status === 'reported' || i.status === 'under_review').length}</span>
                    <span>Certified: {completedCount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── VIEW 3: Ward-wise Complaints Distribution ──────────────────────────── */}
      {activeView === 'wards' && (
        <div className="rounded-3xl bg-stone-900 border border-stone-800 shadow-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white font-mono uppercase tracking-tight flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-400" />
                <span>Ward-wise Complaint Distribution (Vadodara)</span>
              </h3>
              <p className="text-xs text-stone-400 font-mono mt-0.5">
                Geographic volume and unresolved ticket load across municipal administrative wards
              </p>
            </div>
            <span className="text-xs font-mono text-amber-300 bg-amber-900/30 px-3 py-1.5 rounded-xl border border-amber-700/40 font-bold">
              Vadodara Municipal Corporation
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { ward: 'Ward 6', name: 'Gotri & Alkapuri (West)', pincode: '390021' },
              { ward: 'Ward 9', name: 'Manjalpur & GIDC (South)', pincode: '390011' },
              { ward: 'Ward 2', name: 'Fatehgunj & Sama (North)', pincode: '390002' },
              { ward: 'Ward 4', name: 'Sayajigunj & Tower (Central)', pincode: '390005' },
              { ward: 'Ward 8', name: 'Waghodia Road (East)', pincode: '390019' },
              { ward: 'Ward 7', name: 'Akota & Stadium (West)', pincode: '390020' },
              { ward: 'Ward 3', name: 'Karelibaug & Garden (North)', pincode: '390018' },
              { ward: 'Ward 10', name: 'Vasna-Bhayli (South-West)', pincode: '390012' },
              { ward: 'Ward 11', name: 'Makarpura & Industrial (South)', pincode: '390010' },
            ].map((wardInfo) => {
              const wardIssues = issues.filter(
                (i) => i.address && i.address.toLowerCase().includes(wardInfo.ward.toLowerCase())
              );
              const unresolved = wardIssues.filter((i) =>
                ['reported', 'under_review', 'accepted', 'in_progress', 'reopened'].includes(i.status)
              ).length;
              const resolved = wardIssues.filter((i) =>
                ['completed', 'citizen_verified'].includes(i.status)
              ).length;

              return (
                <div key={wardInfo.ward} className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      {wardInfo.ward}
                    </span>
                    <span className="text-[10px] font-mono text-stone-500">PIN: {wardInfo.pincode}</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-mono">{wardInfo.name}</h4>
                    <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                      {wardIssues.length} Total Complaints · {unresolved} Unresolved
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-stone-800/60 text-[10px] font-mono">
                    <span className="text-emerald-400 font-bold">{resolved} Resolved</span>
                    <span className="text-stone-600">•</span>
                    <span className="text-amber-400 font-bold">{unresolved} In Progress</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Dedicated Municipal Work Progress Modal ─────────────────────── */}
      <MunicipalProgressModal
        issue={selectedIssueForProgress}
        isOpen={Boolean(selectedIssueForProgress)}
        onClose={() => setSelectedIssueForProgress(null)}
        onSuccess={handleProgressSuccess}
      />
    </div>
  );
}
