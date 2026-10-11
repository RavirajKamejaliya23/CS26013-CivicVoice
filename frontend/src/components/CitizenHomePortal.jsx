import React, { useState } from 'react';
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  FileText,
  Wrench,
  Users,
  Copy,
  Layers,
  Map as MapIcon,
  Sparkles,
  Building2,
  Check
} from 'lucide-react';
import IssueCard from './IssueCard';

export default function CitizenHomePortal({
  issues,
  onOpenReportModal,
  onOpenTimeline,
  onUpvote,
  onVerify,
  onAdminAction,
  onViewMerged,
  userRole,
  isAuthenticated,
  onOpenAuthModal,
  onNavigateTab,
}) {
  const [trackCode, setTrackCode] = useState('');
  const [trackError, setTrackError] = useState('');
  const [localityFilter, setLocalityFilter] = useState('all');

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    setTrackError('');
    const code = trackCode.trim().toUpperCase();
    if (!code) {
      setTrackError('Please enter a complaint reference code (e.g. CV-VAD-2026-1001).');
      return;
    }

    const match = issues.find(
      (i) => i.id.toUpperCase() === code || i.id.toUpperCase().includes(code)
    );

    if (match) {
      onOpenTimeline(match);
    } else {
      setTrackError(`No complaint found with reference "${code}". Please verify your ticket code.`);
    }
  };

  // Metrics derived from live complaints
  const realIssues = issues.filter((i) => !i.isDemo);
  const displayMetrics = realIssues.length > 0 ? realIssues : issues;
  const activeCount = displayMetrics.filter((i) =>
    ['reported', 'under_review', 'accepted', 'in_progress', 'reopened'].includes(i.status)
  ).length;
  const completedCount = displayMetrics.filter((i) =>
    ['completed', 'citizen_verified'].includes(i.status)
  ).length;
  const mergedCount = displayMetrics.filter((i) => Boolean(i.duplicateOf)).length;

  // Filter issues for feed (hide duplicate child records from public display)
  const canonicalIssues = issues.filter((i) => !i.duplicateOf);
  const recentIssues = localityFilter === 'all'
    ? canonicalIssues.slice(0, 6)
    : canonicalIssues.filter((i) => i.address?.toLowerCase().includes(localityFilter.toLowerCase())).slice(0, 6);

  return (
    <div className="space-y-12 pb-20">

      {/* ── HERO BANNER: CLARIMOL & BUZZYBOX INSPIRED CIVIC PORTAL ─────────────── */}
      <section className="relative overflow-hidden rounded-3xl p-1 sm:p-2 clarimol-ambient-backdrop">
        <div className="clarimol-hero-card p-8 sm:p-14 transition-all">
          <div className="max-w-4xl mx-auto text-center space-y-7">
            
            {/* Tagline pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F5F0E3] border border-[#E7E3D8] text-xs font-semibold text-[#22231F] shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#E9B928] animate-pulse" />
              <span>Civic Voice Redressal · Nationwide Municipality Network</span>
            </div>

            {/* Editorial hero headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#22231F] leading-[1.12]">
              Civic Action, Reimagined.<br />
              <span className="text-[#686B65] font-normal">Report Problems. Track Solutions.</span>
            </h1>

            {/* Supporting description */}
            <p className="text-base sm:text-lg text-[#686B65] max-w-2xl mx-auto leading-relaxed">
              Connect directly with verified municipal squads. Report potholes, drainage overflow, street hazards, and waste buildup. Smart duplicate detection groups neighborhood voices to resolve issues faster.
            </p>

            {/* Primary Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <button
                onClick={onOpenReportModal}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#E9B928] hover:bg-[#D5A313] text-[#22231F] font-extrabold text-sm tracking-wide shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.99]"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
                <span>Report an Issue</span>
              </button>

              <a
                href="#track-section"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#FFFFFF] hover:bg-[#F5F0E3] text-[#22231F] font-bold text-sm border border-[#E7E3D8] flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <Search className="w-4 h-4 text-[#686B65]" />
                <span>Track My Complaint</span>
              </a>

              <button
                onClick={() => onNavigateTab('map')}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#F5F0E3] hover:bg-[#E7E3D8] text-[#22231F] font-bold text-sm border border-[#E7E3D8] flex items-center justify-center gap-2 transition-all"
              >
                <MapIcon className="w-4 h-4 text-[#E9B928]" />
                <span>Explore Map</span>
              </button>
            </div>

            {/* Key platform metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 max-w-3xl mx-auto pt-8 border-t border-[#E7E3D8] text-center gap-4">
              <div className="p-3 rounded-2xl bg-[#FAF8F1] border border-[#E7E3D8]">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#22231F]">{displayMetrics.length}</div>
                <div className="text-xs text-[#686B65] mt-0.5">Total Registered</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAF8F1] border border-[#E7E3D8]">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#78350F]">{activeCount}</div>
                <div className="text-xs text-[#686B65] mt-0.5">In Active Squads</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAF8F1] border border-[#E7E3D8]">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#1E4620]">{completedCount}</div>
                <div className="text-xs text-[#686B65] mt-0.5">Verified Resolved</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAF8F1] border border-[#E7E3D8]">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#1E3A8A]">{mergedCount > 0 ? mergedCount : '100%'}</div>
                <div className="text-xs text-[#686B65] mt-0.5">{mergedCount > 0 ? 'Duplicates Grouped' : 'Transparent Redressal'}</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 4-STEP HOW IT WORKS (REPORT → COMMUNITY SUPPORT → ACTION → RESOLUTION) */}
      <section className="bg-[#FFFFFF] rounded-3xl border border-[#E7E3D8] p-8 sm:p-12 shadow-sm">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl font-extrabold text-[#22231F] tracking-tight">
            How CivicVoice Works
          </h2>
          <p className="text-sm text-[#686B65]">
            A transparent 4-stage pipeline connecting neighborhood reports directly to municipal action.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-[#FAF8F1] border border-[#E7E3D8] space-y-4 hover:border-[#E9B928] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#E9B928] text-[#22231F] flex items-center justify-center font-extrabold text-base shadow-xs">
              1
            </div>
            <h3 className="text-base font-bold text-[#22231F]">Report an Issue</h3>
            <p className="text-xs text-[#686B65] leading-relaxed">
              Pin the hazard location on OpenStreetMap, provide a photo, and specify the category. You receive a unique tracking reference code immediately.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-[#FAF8F1] border border-[#E7E3D8] space-y-4 hover:border-[#E9B928] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#F5F0E3] text-[#22231F] border border-[#E7E3D8] flex items-center justify-center font-extrabold text-base shadow-xs">
              2
            </div>
            <h3 className="text-base font-bold text-[#22231F]">Community Support</h3>
            <p className="text-xs text-[#686B65] leading-relaxed">
              Nearby citizens co-sign and upvote the issue instead of filing duplicates. Smart clustering consolidates urgency so critical problems get prioritized.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-[#FAF8F1] border border-[#E7E3D8] space-y-4 hover:border-[#E9B928] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#F5F0E3] text-[#22231F] border border-[#E7E3D8] flex items-center justify-center font-extrabold text-base shadow-xs">
              3
            </div>
            <h3 className="text-base font-bold text-[#22231F]">Municipal Action</h3>
            <p className="text-xs text-[#686B65] leading-relaxed">
              Authorized municipal officers review reports in their jurisdiction, dispatch repair squads, and log live timestamped status updates.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-2xl bg-[#FAF8F1] border border-[#E7E3D8] space-y-4 hover:border-[#E9B928] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#EAF5EC] text-[#1E4620] border border-[#BCE2C5] flex items-center justify-center font-extrabold text-base shadow-xs">
              4
            </div>
            <h3 className="text-base font-bold text-[#22231F]">Citizen Resolution</h3>
            <p className="text-xs text-[#686B65] leading-relaxed">
              Once crews upload proof photos of the completed repair, citizens inspect the site and confirm closure, ensuring genuine accountability.
            </p>
          </div>
        </div>
      </section>

      {/* ── SMART DUPLICATE PREVENTION & COMMUNITY PARTICIPATION SPOTLIGHT ─── */}
      <section className="bg-[#FAF8F1] rounded-3xl border border-[#E7E3D8] p-8 sm:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#E7E3D8] text-xs font-bold text-[#22231F]">
              <Sparkles className="w-3.5 h-3.5 text-[#E9B928]" />
              <span>Smart Duplicate Detection</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#22231F] tracking-tight">
              One problem. One unified voice.
            </h2>
            <p className="text-sm text-[#686B65] leading-relaxed">
              When multiple neighbors report the same pothole or broken streetlight, CivicVoice alerts you before submission. Instead of cluttering municipal queues with redundant tickets, you can instantly co-sign the existing complaint.
            </p>
            <div className="space-y-2.5 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#EAF5EC] text-[#1E4620] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <p className="text-xs text-[#22231F]"><strong>Pre-submission matching:</strong> Checks location, category, and description within a ~200m radius.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#EAF5EC] text-[#1E4620] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <p className="text-xs text-[#22231F]"><strong>Preserves your submission:</strong> If your issue is distinct, you can always submit a separate report.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#EAF5EC] text-[#1E4620] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <p className="text-xs text-[#22231F]"><strong>Reversible municipal moderation:</strong> Authorized officers can link or unlink records with an immutable audit trail.</p>
              </div>
            </div>
          </div>

          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E7E3D8] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E3D8]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FAF8F1] border border-[#E7E3D8] flex items-center justify-center">
                  <Copy className="w-4 h-4 text-[#E9B928]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#22231F]">Duplicate Suggestion Preview</div>
                  <div className="text-[11px] text-[#686B65]">Interactive pre-submission dialog</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#FEF9EE] border border-[#FDE68A] text-[10px] font-bold text-[#78350F]">
                Smart Match
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F1] border border-[#E7E3D8] space-y-2 text-xs">
              <div className="font-bold text-[#22231F]">“A similar complaint may already exist nearby.”</div>
              <p className="text-[#686B65] text-[11px]">
                CV-VAD-2026-1001 · 45m away · Roads & Potholes · 14 supporters
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-[#E9B928] text-[#22231F] font-bold text-xs"
                >
                  Support Existing Complaint
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#E7E3D8] text-[#686B65] font-semibold text-xs"
                >
                  Report a Different Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRACK COMPLAINT SECTION ─────────────────────────────────────────── */}
      <section id="track-section" className="bg-[#FFFFFF] rounded-3xl border border-[#E7E3D8] p-8 sm:p-10 shadow-sm">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-[#22231F]">Track Complaint Status</h2>
            <p className="text-xs text-[#686B65]">
              Enter your complaint reference code to view real-time municipal inspection and resolution logs.
            </p>
          </div>

          <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={trackCode}
                onChange={(e) => setTrackCode(e.target.value)}
                placeholder="Enter Reference (e.g. CV-VAD-2026-1001)"
                className="w-full pl-10 pr-3 py-3.5 rounded-xl bg-[#FAF8F1] border border-[#E7E3D8] text-[#22231F] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#E9B928]"
              />
              <Search className="w-4 h-4 text-[#686B65] absolute left-3.5 top-4" />
            </div>
            <button
              type="submit"
              className="px-7 py-3.5 rounded-xl bg-[#22231F] hover:bg-[#34362F] text-white font-bold text-xs tracking-wide transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Track Complaint</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {trackError && (
            <div className="p-3.5 rounded-xl bg-[#FDF2F2] border border-[#FECACA] text-[#7F1D1D] text-xs leading-relaxed">
              {trackError}
            </div>
          )}
        </div>
      </section>

      {/* ── NEARBY COMMUNITY PROBLEMS (CANONICAL COMPLAINTS ONLY) ───────────── */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E7E3D8]">
          <div>
            <h2 className="text-xl font-bold text-[#22231F]">Nearby Civic Issues</h2>
            <p className="text-xs text-[#686B65]">
              Canonical reports across supported municipalities. Confirmed duplicates are grouped under their main complaint.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={localityFilter}
              onChange={(e) => setLocalityFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#E7E3D8] bg-[#FFFFFF] text-xs font-medium text-[#22231F] focus:outline-none focus:ring-2 focus:ring-[#E9B928]"
            >
              <option value="all">All Localities & Regions</option>
              <option value="Alkapuri">Alkapuri</option>
              <option value="Sayajigunj">Sayajigunj</option>
              <option value="Gotri">Gotri</option>
              <option value="Manjalpur">Manjalpur</option>
              <option value="Akota">Akota</option>
              <option value="Fatehgunj">Fatehgunj</option>
              <option value="Karelibaug">Karelibaug</option>
              <option value="Indiranagar">Indiranagar</option>
              <option value="Andheri">Andheri West</option>
              <option value="Connaught">Connaught Place</option>
            </select>

            <button
              onClick={() => onNavigateTab('feed')}
              className="px-4 py-2 rounded-xl bg-[#F5F0E3] hover:bg-[#E7E3D8] text-[#22231F] border border-[#E7E3D8] text-xs font-bold transition-colors"
            >
              View Full Feed
            </button>
          </div>
        </div>

        {recentIssues.length === 0 ? (
          <div className="py-12 text-center bg-[#FFFFFF] rounded-3xl border border-[#E7E3D8] p-8 space-y-2">
            <p className="text-sm font-semibold text-[#22231F]">No complaints reported for this locality.</p>
            <p className="text-xs text-[#686B65]">Be the first citizen to report an issue in this area.</p>
            <button
              onClick={onOpenReportModal}
              className="mt-3 px-5 py-2.5 rounded-xl bg-[#E9B928] hover:bg-[#D5A313] text-[#22231F] text-xs font-bold inline-flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Report an Issue</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                userRole={userRole}
                onUpvote={onUpvote}
                onOpenTimeline={onOpenTimeline}
                onVerify={onVerify}
                onAdminAction={onAdminAction}
                onViewMerged={onViewMerged}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
