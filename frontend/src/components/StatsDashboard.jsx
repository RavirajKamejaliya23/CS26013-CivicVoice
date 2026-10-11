import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BarChart3, CheckCircle2, Clock, AlertTriangle, TrendingUp, ShieldCheck,
  Layers, FileCheck, Loader2, Filter, RefreshCw, Calendar, Building2,
  MapPin, AlertCircle, ArrowUpRight, Compass
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function StatsDashboard({ issues = [] }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedMunicipality, setSelectedMunicipality] = useState(
    user?.role === 'MUNICIPAL' && user?.municipality_id ? user.municipality_id : 'all'
  );
  const [selectedDays, setSelectedDays] = useState('all');

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.analytics.getOverview({
        municipalityId: selectedMunicipality,
        days: selectedDays === 'all' ? undefined : selectedDays,
      });
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics overview:', err);
      setError(err.message || 'Unable to retrieve authorized analytics data.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMunicipality, selectedDays]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const kpis = data?.kpis || {
    totalGenuineReports: 0,
    openIssues: 0,
    resolvedIssues: 0,
    overdueIssues: 0,
    resolutionRate: 0,
    avgResolutionHours: 0,
  };

  const timeSeries = data?.timeSeries || [];
  const categoryBreakdown = data?.categoryBreakdown || [];
  const statusDistribution = data?.statusDistribution || [];
  const stackedByMunicipality = data?.stackedByMunicipality || [];
  const resolutionComparison = data?.resolutionComparison || [];
  const geoHotspots = data?.geoHotspots || [];
  const municipalities = data?.municipalities || [];

  // Helper for Indian number formatting
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat('en-IN').format(num);
  };

  // SVG Line Chart calculations
  const lineChartData = useMemo(() => {
    if (!timeSeries.length) return null;
    const maxVal = Math.max(
      1,
      ...timeSeries.map((d) => Math.max(parseInt(d.submitted, 10) || 0, parseInt(d.resolved, 10) || 0))
    );
    const width = 600;
    const height = 200;
    const padding = 35;
    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2;
    const stepX = innerWidth / Math.max(1, timeSeries.length - 1);

    const submittedPoints = timeSeries.map((d, i) => {
      const x = padding + i * stepX;
      const y = height - padding - ((parseInt(d.submitted, 10) || 0) / maxVal) * innerHeight;
      return { x, y, val: d.submitted, date: d.date };
    });

    const resolvedPoints = timeSeries.map((d, i) => {
      const x = padding + i * stepX;
      const y = height - padding - ((parseInt(d.resolved, 10) || 0) / maxVal) * innerHeight;
      return { x, y, val: d.resolved, date: d.date };
    });

    const toPath = (pts) =>
      pts.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');

    return {
      width,
      height,
      padding,
      maxVal,
      submittedPath: toPath(submittedPoints),
      resolvedPath: toPath(resolvedPoints),
      submittedPoints,
      resolvedPoints,
    };
  }, [timeSeries]);

  // Donut chart calculations
  const donutData = useMemo(() => {
    const totalCount = statusDistribution.reduce((acc, curr) => acc + (parseInt(curr.count, 10) || 0), 0);
    if (!totalCount) return [];

    const statusColors = {
      reported: '#D97706', // amber
      under_review: '#F59E0B', // light amber
      accepted: '#0D9488', // teal
      in_progress: '#3B82F6', // blue
      completed: '#10B981', // light green
      citizen_verified: '#16A34A', // green
      reopened: '#DC2626', // red
    };

    let cumulativeAngle = 0;
    return statusDistribution.map((item) => {
      const count = parseInt(item.count, 10) || 0;
      const percentage = (count / totalCount) * 100;
      const angle = (count / totalCount) * 360;
      const startAngle = cumulativeAngle;
      cumulativeAngle += angle;

      return {
        status: item.status,
        label: item.status.replace('_', ' ').toUpperCase(),
        count,
        percentage: Math.round(percentage),
        color: statusColors[item.status] || '#64748B',
        startAngle,
        angle,
      };
    });
  }, [statusDistribution]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* ── Top Header & Filter Controls ─────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Civic Analytics & Performance Ledger</span>
          </div>
          <h2 className="text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">
            Municipal Operational Transparency
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time performance metrics, boundary distribution, and resolution tracking.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Municipality Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono">
            <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <select
              value={selectedMunicipality}
              onChange={(e) => setSelectedMunicipality(e.target.value)}
              disabled={user?.role === 'MUNICIPAL' && user?.municipality_id}
              className="bg-transparent text-slate-700 dark:text-slate-200 font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">All Municipalities</option>
              {municipalities.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono">
            <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <select
              value={selectedDays}
              onChange={(e) => setSelectedDays(e.target.value)}
              className="bg-transparent text-slate-700 dark:text-slate-200 font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="7">Last 7 Days</option>
              <option value="14">Last 14 Days</option>
              <option value="30">Last 30 Days</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchAnalytics}
            disabled={isLoading}
            className="p-2 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={fetchAnalytics} className="underline font-bold">
            Retry
          </button>
        </div>
      )}

      {/* ── 1. KPI Metric Cards (Section F Requirement 1) ───────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Genuine Reports */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Genuine Reports</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-[#0F172A] dark:text-white">
              {isLoading ? '...' : formatNumber(kpis.totalGenuineReports)}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">Database Verified</div>
          </div>
        </div>

        {/* Open Issues */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-amber-200 dark:border-amber-900/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Open Issues</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
              {isLoading ? '...' : formatNumber(kpis.openIssues)}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">Active Workload</div>
          </div>
        </div>

        {/* Resolved Issues */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-emerald-200 dark:border-emerald-900/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {isLoading ? '...' : formatNumber(kpis.resolvedIssues)}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">Completed & Verified</div>
          </div>
        </div>

        {/* Overdue Issues (>7 Days) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-rose-200 dark:border-rose-900/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Overdue (&gt;7d)</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400">
              {isLoading ? '...' : formatNumber(kpis.overdueIssues)}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">SLA Escalation</div>
          </div>
        </div>

        {/* Resolution Rate */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-teal-200 dark:border-teal-900/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-teal-600 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Resolution Rate</span>
            <TrendingUp className="w-4 h-4 text-teal-500" />
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-teal-600 dark:text-teal-400">
              {isLoading ? '...' : `${kpis.resolutionRate}%`}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">Efficiency Score</div>
          </div>
        </div>

        {/* Avg Resolution Time */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Avg. Resolution</span>
            <FileCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-[#0F172A] dark:text-white">
              {isLoading ? '...' : `${kpis.avgResolutionHours}h`}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">Ticket Cycle Time</div>
          </div>
        </div>
      </div>

      {/* ── 2 & 5: Line Chart & Status Donut Chart ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LINE CHART: Reports Submitted vs Resolved Over Time */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="text-[10px] font-mono text-teal-600 dark:text-teal-400 uppercase tracking-wider font-bold">
                Trend Analysis
              </div>
              <h3 className="font-bold text-base text-[#0F172A] dark:text-white">
                Reports Submitted vs. Resolved Over Time
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> Submitted
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Resolved
              </span>
            </div>
          </div>

          {lineChartData && lineChartData.submittedPoints.length > 0 ? (
            <div className="w-full overflow-x-auto pt-2">
              <svg
                viewBox={`0 0 ${lineChartData.width} ${lineChartData.height}`}
                className="w-full h-56 select-none"
              >
                {/* Horizontal Grid lines */}
                {[0, 0.33, 0.66, 1].map((pct, idx) => {
                  const y = lineChartData.padding + (1 - pct) * (lineChartData.height - lineChartData.padding * 2);
                  const labelVal = Math.round(pct * lineChartData.maxVal);
                  return (
                    <g key={idx}>
                      <line
                        x1={lineChartData.padding}
                        y1={y}
                        x2={lineChartData.width - lineChartData.padding}
                        y2={y}
                        stroke="currentColor"
                        strokeDasharray="4 4"
                        className="text-slate-200 dark:text-slate-800"
                      />
                      <text
                        x={lineChartData.padding - 6}
                        y={y + 3}
                        textAnchor="end"
                        className="text-[9px] font-mono fill-slate-400"
                      >
                        {labelVal}
                      </text>
                    </g>
                  );
                })}

                {/* Submitted Line (Teal) */}
                <path
                  d={lineChartData.submittedPath}
                  fill="none"
                  stroke="#0D9488"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Resolved Line (Green) */}
                <path
                  d={lineChartData.resolvedPath}
                  fill="none"
                  stroke="#16A34A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Submitted Points */}
                {lineChartData.submittedPoints.map((pt, i) => (
                  <circle
                    key={`sub-${i}`}
                    cx={pt.x}
                    cy={pt.y}
                    r="3.5"
                    fill="#0D9488"
                    className="hover:r-5 transition-all"
                  />
                ))}

                {/* Resolved Points */}
                {lineChartData.resolvedPoints.map((pt, i) => (
                  <circle
                    key={`res-${i}`}
                    cx={pt.x}
                    cy={pt.y}
                    r="3.5"
                    fill="#16A34A"
                    className="hover:r-5 transition-all"
                  />
                ))}

                {/* Dates on X Axis */}
                {lineChartData.submittedPoints.map((pt, i) => {
                  if (i % Math.ceil(lineChartData.submittedPoints.length / 7) === 0) {
                    const shortDate = pt.date?.slice(5) || '';
                    return (
                      <text
                        key={`x-${i}`}
                        x={pt.x}
                        y={lineChartData.height - 10}
                        textAnchor="middle"
                        className="text-[9px] font-mono fill-slate-400"
                      >
                        {shortDate}
                      </text>
                    );
                  }
                  return null;
                })}
              </svg>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 font-mono text-xs">
              No time-series data available for the selected filters.
            </div>
          )}
        </div>

        {/* DONUT CHART: Current Issue-Status Distribution */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="text-[10px] font-mono text-teal-600 dark:text-teal-400 uppercase tracking-wider font-bold">
              Dispatch Pipeline
            </div>
            <h3 className="font-bold text-base text-[#0F172A] dark:text-white">
              Current Issue Status Distribution
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
            {/* SVG Donut */}
            <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {donutData.length === 0 ? (
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#E2E8F0" strokeWidth="18" />
                ) : (
                  donutData.map((slice, i) => {
                    const circumference = 2 * Math.PI * 38;
                    const strokeDasharray = `${(slice.percentage / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = -((slice.startAngle / 360) * circumference);
                    return (
                      <circle
                        key={i}
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke={slice.color}
                        strokeWidth="18"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-300 hover:opacity-85"
                      />
                    );
                  })
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black font-mono text-[#0F172A] dark:text-white">
                  {kpis.totalGenuineReports}
                </span>
                <span className="text-[9px] font-mono uppercase text-slate-400 font-bold">Total</span>
              </div>
            </div>

            {/* Legend Slices */}
            <div className="space-y-1.5 flex-1 min-w-[140px] text-xs font-mono">
              {donutData.slice(0, 5).map((slice) => (
                <div key={slice.status} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: slice.color }} />
                    <span className="text-slate-600 dark:text-slate-300 truncate">{slice.label}</span>
                  </span>
                  <span className="font-bold text-[#0F172A] dark:text-white ml-2">
                    {slice.count} ({slice.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 text-center">
            Status updates require GPS location logging and completion evidence attachments.
          </div>
        </div>

      </div>

      {/* ── 3 & 4: Category Bar Chart & Stacked Municipality Bar Chart ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* HORIZONTAL BAR CHART: Reports by Category */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="text-[10px] font-mono text-teal-600 dark:text-teal-400 uppercase tracking-wider font-bold">
              Classification Breakdown
            </div>
            <h3 className="font-bold text-base text-[#0F172A] dark:text-white">
              Reports by Civic Category
            </h3>
          </div>

          <div className="space-y-3 pt-2">
            {categoryBreakdown.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-mono text-xs">
                No categorical records found.
              </div>
            ) : (
              categoryBreakdown.map((cat) => {
                const totalInCat = cat.count || 0;
                const maxCatTotal = Math.max(1, ...categoryBreakdown.map((c) => c.count || 0));
                const barWidth = Math.round((totalInCat / maxCatTotal) * 100);

                return (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>{cat.name}</span>
                      <span className="font-mono text-slate-400">
                        {totalInCat} reports ({cat.resolved} resolved)
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                      <div
                        className="h-full bg-teal-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(4, barWidth)}%` }}
                        title={`${totalInCat} reports`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* STACKED BAR CHART: Status by Municipality */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="text-[10px] font-mono text-teal-600 dark:text-teal-400 uppercase tracking-wider font-bold">
                Inter-Authority Workload
              </div>
              <h3 className="font-bold text-base text-[#0F172A] dark:text-white">
                Status by Municipal Body
              </h3>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-amber-600 font-bold">
                <span className="w-2 h-2 rounded bg-amber-500" /> Pending
              </span>
              <span className="flex items-center gap-1 text-teal-600 font-bold">
                <span className="w-2 h-2 rounded bg-teal-600" /> In Progress
              </span>
              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                <span className="w-2 h-2 rounded bg-emerald-600" /> Resolved
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {stackedByMunicipality.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-mono text-xs">
                No municipal workload distribution data available.
              </div>
            ) : (
              stackedByMunicipality.map((muni) => {
                const total = muni.total || 1;
                const pPct = Math.round((muni.pending / total) * 100);
                const ipPct = Math.round((muni.inProgress / total) * 100);
                const rPct = Math.max(0, 100 - pPct - ipPct);

                return (
                  <div key={muni.municipalityId} className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs font-bold text-[#0F172A] dark:text-white font-mono">
                      <span>{muni.label}</span>
                      <span className="text-slate-400 font-normal">{muni.total} Total Issues</span>
                    </div>

                    <div className="w-full h-3.5 rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
                      {muni.pending > 0 && (
                        <div
                          className="h-full bg-amber-500"
                          style={{ width: `${pPct}%` }}
                          title={`Pending: ${muni.pending}`}
                        />
                      )}
                      {muni.inProgress > 0 && (
                        <div
                          className="h-full bg-teal-600"
                          style={{ width: `${ipPct}%` }}
                          title={`In Progress: ${muni.inProgress}`}
                        />
                      )}
                      {muni.resolved > 0 && (
                        <div
                          className="h-full bg-emerald-600"
                          style={{ width: `${rPct}%` }}
                          title={`Resolved: ${muni.resolved}`}
                        />
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                      <span>Pending: {muni.pending}</span>
                      <span>In Progress: {muni.inProgress}</span>
                      <span className="text-emerald-600 font-bold">Resolved: {muni.resolved}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* ── 6 & 7: Resolution Time Comparison & Geographic Hotspots ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* RESOLUTION TIME COMPARISON ACROSS MUNICIPAL BODIES */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="text-[10px] font-mono text-teal-600 dark:text-teal-400 uppercase tracking-wider font-bold">
              Benchmark Comparison
            </div>
            <h3 className="font-bold text-base text-[#0F172A] dark:text-white">
              Resolution Time Across Municipal Bodies
            </h3>
          </div>

          <div className="space-y-4 pt-2">
            {resolutionComparison.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#0F172A] dark:text-white uppercase">
                    {m.name}
                  </span>
                  <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                    {m.avgResolutionHours} hrs avg
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Total Volume: {m.total} tickets</span>
                  <span className="text-emerald-600 font-bold">{m.resolved} resolved</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-teal-600 rounded-full"
                    style={{
                      width: `${m.total > 0 ? Math.round((m.resolved / m.total) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GEOGRAPHIC VISUALIZATION OF LOCATIONS & HOTSPOTS */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="text-[10px] font-mono text-teal-600 dark:text-teal-400 uppercase tracking-wider font-bold">
                Geospatial Distribution
              </div>
              <h3 className="font-bold text-base text-[#0F172A] dark:text-white flex items-center justify-between">
                <span>Report Locations & Unresolved Hotspots</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                  {geoHotspots.filter((h) => h.isUnresolved).length} Unresolved Hotspots
                </span>
              </h3>
            </div>

            <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800/80 max-h-72 overflow-y-auto pr-1">
              {geoHotspots.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-mono text-xs">
                  No verified coordinate reports found.
                </div>
              ) : (
                geoHotspots.slice(0, 10).map((spot) => (
                  <div key={spot.id} className="py-2.5 flex items-center justify-between gap-3 text-xs font-mono">
                    <div className="flex items-center gap-2 truncate">
                      <MapPin
                        className={`w-4 h-4 flex-shrink-0 ${
                          spot.isUnresolved ? 'text-amber-500' : 'text-emerald-500'
                        }`}
                      />
                      <div className="truncate">
                        <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {spot.title}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{spot.address}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {spot.latitude && spot.longitude && (
                        <span className="text-[10px] text-slate-400 hidden sm:inline">
                          [{parseFloat(spot.latitude).toFixed(3)}, {parseFloat(spot.longitude).toFixed(3)}]
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          spot.isUnresolved
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                        }`}
                      >
                        {spot.isUnresolved ? 'Hotspot' : 'Cleared'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-teal-600" />
              <span>Boundary Enforcement: Bounding-box verification active</span>
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {geoHotspots.length} Logged Coordinates
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
