import React, { useState, useMemo } from 'react';
import {
  MapPin, PlusCircle, CheckCircle2, Clock, ThumbsUp, AlertTriangle,
  ArrowRight, ShieldCheck, Search, Filter, Sparkles, Navigation, Layers
} from 'lucide-react';
import { CATEGORIES, STATUS_CONFIG } from '../data/mockIssues';
import IssueCard from './IssueCard';
import LeafletMap from './LeafletMap';

export default function CitizenDashboard({
  issues = [],
  user,
  onOpenReportModal,
  onOpenTimeline,
  onUpvote,
  onVerify,
  onNavigateTab,
  initialFilter = 'all',
}) {
  const [activeFilter, setActiveFilter] = useState(initialFilter); // 'all', 'my_reports', 'supported', 'needs_verify'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMiniMap, setShowMiniMap] = useState(false);

  React.useEffect(() => {
    if (initialFilter) {
      setActiveFilter(initialFilter);
    }
  }, [initialFilter]);

  // Time-aware greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Compute citizen statistics
  const userStats = useMemo(() => {
    const userName = user?.name?.toLowerCase() || '';
    const userId = user?.id;

    // Issues reported by this citizen
    const myReports = issues.filter((i) => {
      const repName = i.reportedBy?.name?.toLowerCase() || '';
      return repName === userName || (userId && i.reported_by_id === userId);
    });

    // Issues co-signed/supported by this citizen
    const supported = issues.filter((i) => i.hasUpvoted);

    // Issues completed by municipal crews awaiting citizen verification
    const awaitingVerify = issues.filter((i) => i.status === 'completed');

    // Fully verified resolved issues
    const resolved = issues.filter((i) => i.status === 'citizen_verified');

    return {
      myReportsCount: myReports.length,
      supportedCount: supported.length,
      awaitingVerifyCount: awaitingVerify.length,
      resolvedCount: resolved.length,
    };
  }, [issues, user]);

  // Filtered issues based on citizen active subtab
  const filteredIssues = useMemo(() => {
    const userName = user?.name?.toLowerCase() || '';
    const userId = user?.id;

    return issues.filter((issue) => {
      // Subtab filter
      if (activeFilter === 'my_reports') {
        const repName = issue.reportedBy?.name?.toLowerCase() || '';
        const isMine = repName === userName || (userId && issue.reported_by_id === userId);
        if (!isMine) return false;
      } else if (activeFilter === 'supported') {
        if (!issue.hasUpvoted) return false;
      } else if (activeFilter === 'needs_verify') {
        if (issue.status !== 'completed') return false;
      } else if (activeFilter === 'resolved') {
        if (issue.status !== 'citizen_verified') return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && issue.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = issue.title?.toLowerCase().includes(q);
        const matchesDesc = issue.description?.toLowerCase().includes(q);
        const matchesAddr = issue.address?.toLowerCase().includes(q);
        const matchesId = issue.id?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesAddr && !matchesId) return false;
      }

      return true;
    });
  }, [issues, activeFilter, selectedCategory, searchQuery, user]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ── Welcome & Location Header ────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border border-stone-800 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Vadodara Municipal Corporation · Ward 6 (Gotri & Alkapuri)</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {greeting}, {user?.name || 'Citizen'}!
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 font-mono max-w-2xl leading-relaxed">
              Report civic complaints in your locality, support nearby community issues, and verify municipal work after completion.
            </p>
          </div>

          {/* Quick Action: Report a Problem & Map */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={onOpenReportModal}
              className="px-6 py-3.5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-black font-mono font-black text-xs uppercase tracking-wider shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4 stroke-[3]" />
              <span>Report a Problem</span>
            </button>
            <button
              type="button"
              onClick={() => setShowMiniMap((prev) => !prev)}
              className="px-4 py-3.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              <Navigation className="w-4 h-4 text-amber-400" />
              <span>{showMiniMap ? 'Hide Ward Map' : 'View Ward Map'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Citizen Stat & Filter Cards (Section 4 Requirements) ──────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Nearby Issues */}
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeFilter === 'all'
              ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/30'
              : 'bg-stone-900 border-stone-800 hover:border-stone-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-amber-400 font-mono text-xs uppercase tracking-wider font-bold">
              Nearby Issues
            </span>
            <MapPin className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {issues.length}
          </div>
          <div className="text-[10px] font-mono text-stone-400 mt-1">
            Ward complaints
          </div>
        </button>

        {/* My Complaints */}
        <button
          type="button"
          onClick={() => setActiveFilter('my_reports')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeFilter === 'my_reports'
              ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/30'
              : 'bg-stone-900 border-stone-800 hover:border-stone-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-amber-400 font-mono text-xs uppercase tracking-wider font-bold">
              My Complaints
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {userStats.myReportsCount}
          </div>
          <div className="text-[10px] font-mono text-stone-400 mt-1">
            Reported by you
          </div>
        </button>

        {/* Supported Complaints */}
        <button
          type="button"
          onClick={() => setActiveFilter('supported')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeFilter === 'supported'
              ? 'bg-blue-500/20 border-blue-400 ring-2 ring-blue-400/30'
              : 'bg-stone-900 border-stone-800 hover:border-stone-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-400 font-mono text-xs uppercase tracking-wider font-bold">
              Supported
            </span>
            <ThumbsUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {userStats.supportedCount}
          </div>
          <div className="text-[10px] font-mono text-stone-400 mt-1">
            Co-signed issues
          </div>
        </button>

        {/* Awaiting Verification */}
        <button
          type="button"
          onClick={() => setActiveFilter('needs_verify')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeFilter === 'needs_verify'
              ? 'bg-teal-500/20 border-teal-400 ring-2 ring-teal-400/30'
              : 'bg-stone-900 border-stone-800 hover:border-stone-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-teal-400 font-mono text-xs uppercase tracking-wider font-bold">
              Verification
            </span>
            <Clock className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black font-mono text-teal-300">
            {userStats.awaitingVerifyCount}
          </div>
          <div className="text-[10px] font-mono text-stone-400 mt-1">
            Awaiting inspection
          </div>
        </button>

        {/* Resolved Complaints */}
        <button
          type="button"
          onClick={() => setActiveFilter('resolved')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeFilter === 'resolved'
              ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-400/30'
              : 'bg-stone-900 border-stone-800 hover:border-stone-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-400 font-mono text-xs uppercase tracking-wider font-bold">
              Resolved
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {userStats.resolvedCount}
          </div>
          <div className="text-[10px] font-mono text-stone-400 mt-1">
            Citizen certified
          </div>
        </button>
      </div>

      {/* ── Optional GIS Radar Map Preview ──────────────────────────────── */}
      {showMiniMap && (
        <div className="rounded-3xl bg-stone-900 border border-stone-800 p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-amber-400">
              <Navigation className="w-4 h-4" />
              <span>Interactive Ward GIS Radar</span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('map')}
              className="text-xs font-mono text-stone-400 hover:text-white underline"
            >
              Open Full Screen Map →
            </button>
          </div>
          <LeafletMap
            issues={issues}
            onSelectIssue={onOpenTimeline}
            onOpenReportModal={onOpenReportModal}
          />
        </div>
      )}

      {/* ── Main Citizen Dispatches Section ──────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white font-mono uppercase tracking-tight">
              {activeFilter === 'my_reports'
                ? 'My Reported Dispatches'
                : activeFilter === 'supported'
                ? 'My Co-Signed Issues'
                : activeFilter === 'needs_verify'
                ? 'Completed Work Requiring Citizen Verification'
                : 'Neighborhood Civic Dispatches'}
            </h2>
            <p className="text-xs text-stone-400 font-mono mt-0.5">
              Showing {filteredIssues.length} active neighborhood issue{filteredIssues.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket #, street..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-white placeholder:text-stone-500 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          </div>
        </div>

        {/* Subtab filter navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-stone-800">
          {[
            { id: 'all', label: 'All Community Dispatches' },
            { id: 'my_reports', label: `My Reports (${userStats.myReportsCount})` },
            { id: 'supported', label: `Supported (${userStats.supportedCount})` },
            { id: 'needs_verify', label: `Needs Verification (${userStats.awaitingVerifyCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                activeFilter === tab.id
                  ? 'bg-yellow-400 text-black shadow-md'
                  : 'bg-stone-900 text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                selectedCategory === c.id
                  ? 'bg-white text-black shadow-md'
                  : 'bg-stone-900 text-stone-400 hover:bg-stone-800 hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Empty state or Grid */}
        {filteredIssues.length === 0 ? (
          <div className="p-16 rounded-3xl bg-stone-900 border border-stone-800 text-center space-y-4">
            <Search className="w-10 h-10 text-stone-600 mx-auto" />
            <div className="space-y-1">
              <div className="text-sm font-bold text-stone-300 font-mono">
                No civic issues match your current filters.
              </div>
              <p className="text-xs text-stone-500 font-mono">
                Try switching subtabs, choosing "All Issues", or clear your search query.
              </p>
            </div>
            <button
              onClick={() => {
                setActiveFilter('all');
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-400 text-xs font-mono font-bold uppercase transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                userRole="CITIZEN"
                onUpvote={onUpvote}
                onOpenTimeline={onOpenTimeline}
                onVerify={onVerify}
                onAdminAction={() => {}}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
