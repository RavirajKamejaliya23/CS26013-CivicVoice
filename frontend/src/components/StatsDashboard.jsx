import React, { useState, useEffect } from 'react';
import { BarChart3, CheckCircle2, Clock, AlertTriangle, TrendingUp, ShieldCheck, Layers, FileCheck, Loader2 } from 'lucide-react';
import { CATEGORIES } from '../data/mockIssues';
import api from '../services/api';

export default function StatsDashboard({ issues = [] }) {
  const [statsData, setStatsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.issues.getStats();
        if (isMounted && res) {
          setStatsData(res);
        }
      } catch (err) {
        console.error('Failed to load stats from backend:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load live analytics ledger.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, [issues.length]);

  // Use live stats from PostgreSQL if available, otherwise calculate from issues prop
  const total = statsData?.total ?? issues.length;
  const verified = statsData?.verified ?? issues.filter(i => i.status === 'citizen_verified').length;
  const inProgress = statsData?.inProgress ?? issues.filter(i => i.status === 'in_progress').length;
  const completed = statsData?.completed ?? issues.filter(i => i.status === 'completed').length;
  const reopened = statsData?.reopened ?? issues.filter(i => i.status === 'reopened').length;

  const resolutionRate = total > 0 ? Math.round(((verified + completed) / total) * 100) : 0;

  // Category counts from PostgreSQL category ledger
  const categoryCounts = CATEGORIES.filter(c => c.id !== 'all').map(cat => {
    const backendMatch = statsData?.categoryCounts?.find(b => b.id === cat.id);
    const count = backendMatch !== undefined
      ? parseInt(backendMatch.count, 10)
      : issues.filter(i => i.category === cat.id).length;
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return { ...cat, count, percentage };
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white/80 dark:bg-stone-900/80 border border-stone-800/10 dark:border-stone-700/40 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Municipal Transparency Ledger</span>
          </div>
          <h2 className="text-2xl font-black text-stone-900 dark:text-stone-100">
            Public Works Accountability Index
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Real-time verification audit of civic dispatches and contractor performance
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isLoading && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 font-mono text-[11px] animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Syncing Ledger...</span>
            </div>
          )}
          <div className="px-4 py-2 rounded-2xl bg-amber-500/15 border border-amber-600/30 text-amber-900 dark:text-amber-200 font-mono text-xs">
            Audit Period: <strong>Q4 2026</strong>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{error} Showing cached ledger values.</span>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-3xl bg-white/90 dark:bg-stone-900/90 border border-stone-800/10 dark:border-stone-700/40 shadow-sm">
          <div className="flex items-center justify-between mb-3 text-stone-500">
            <span className="text-xs font-mono uppercase tracking-wider">Total Dispatched</span>
            <Layers className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-3xl font-black font-mono text-stone-950 dark:text-stone-50">
            {total}
          </div>
          <div className="text-[11px] font-mono text-stone-500 mt-1">
            Across 12 Municipal Wards
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white/90 dark:bg-stone-900/90 border border-stone-800/10 dark:border-stone-700/40 shadow-sm">
          <div className="flex items-center justify-between mb-3 text-emerald-600">
            <span className="text-xs font-mono uppercase tracking-wider">Citizen Certified</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            {verified}
          </div>
          <div className="text-[11px] font-mono text-stone-500 mt-1">
            Audited & Approved by Residents
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white/90 dark:bg-stone-900/90 border border-stone-800/10 dark:border-stone-700/40 shadow-sm">
          <div className="flex items-center justify-between mb-3 text-purple-600">
            <span className="text-xs font-mono uppercase tracking-wider">Squads Onsite</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black font-mono text-purple-600 dark:text-purple-400">
            {inProgress}
          </div>
          <div className="text-[11px] font-mono text-stone-500 mt-1">
            Active repair crews working
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white/90 dark:bg-stone-900/90 border border-stone-800/10 dark:border-stone-700/40 shadow-sm">
          <div className="flex items-center justify-between mb-3 text-rose-600">
            <span className="text-xs font-mono uppercase tracking-wider">Citizen Reopened</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black font-mono text-rose-600 dark:text-rose-400">
            {reopened}
          </div>
          <div className="text-[11px] font-mono text-stone-500 mt-1">
            Contractor work rejected by public
          </div>
        </div>

      </div>

      {/* Category Breakdown & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white/90 dark:bg-stone-900/90 border border-stone-800/10 dark:border-stone-700/40 shadow-sm space-y-4">
          <div className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center justify-between">
            <span>Dispatches by Infrastructure Category</span>
            <span className="text-xs font-mono text-stone-500">Volume</span>
          </div>

          <div className="space-y-3.5 pt-2">
            {categoryCounts.map((cat) => (
              <div key={cat.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300">
                  <span>{cat.label}</span>
                  <span className="font-mono text-stone-500">{cat.count} tickets ({cat.percentage}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, cat.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resolution Velocity & Trust Card */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 dark:from-stone-900 dark:to-stone-800 border border-amber-500/20 rounded-3xl space-y-5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-800 dark:text-amber-400 uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>Anti-Corruption Verification Rate</span>
          </div>

          <div className="text-center py-4 space-y-1">
            <div className="text-5xl font-black font-mono text-amber-900 dark:text-amber-200">
              {resolutionRate}%
            </div>
            <div className="text-xs font-mono text-stone-600 dark:text-stone-400">
              Resolved & Verified Clearance Rate
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            Every issue marked "Completed" by municipal officers triggers a 7-day community challenge window. If the repair does not withstand public inspection, citizens can instantly reopen the ticket.
          </div>
        </div>

      </div>

    </div>
  );
}
