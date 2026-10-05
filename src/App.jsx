import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import GustavoHero from './components/GustavoHero';
import MailboxStage from './components/MailboxStage';
import MailChuteScroll from './components/MailChuteScroll';
import SortingVault from './components/SortingVault';
import SymphonicMovements from './components/SymphonicMovements';
import IssueCard from './components/IssueCard';
import IssueReportModal from './components/IssueReportModal';
import IssueTimelineModal from './components/IssueTimelineModal';
import AdminActionModal from './components/AdminActionModal';
import CitizenVerifyModal from './components/CitizenVerifyModal';
import InteractiveMapPreview from './components/InteractiveMapPreview';
import StatsDashboard from './components/StatsDashboard';
import { INITIAL_ISSUES, CATEGORIES, STATUS_CONFIG } from './data/mockIssues';
import { THEMES } from './data/themes';
import { sound } from './utils/audio';
import { Search, Filter, Plus, Layers, MapPin, Sparkles, CheckCircle2, RotateCcw, ArrowDown } from 'lucide-react';

export default function App() {
  const [currentTheme, setCurrentTheme] = useState('gustavoStage');
  const [issues, setIssues] = useState(INITIAL_ISSUES);
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState('citizen');
  const [collectedCount, setCollectedCount] = useState(1428);

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [timelineIssue, setTimelineIssue] = useState(null);
  const [adminActionIssue, setAdminActionIssue] = useState(null);
  const [verifyIssueData, setVerifyIssueData] = useState(null);

  // Apply theme styles dynamically
  useEffect(() => {
    const theme = THEMES[currentTheme] || THEMES.gustavoStage;
    const root = document.documentElement;

    Object.entries(theme.styles).forEach(([prop, val]) => {
      root.style.setProperty(prop, val);
    });

    if (theme.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [currentTheme]);

  // Scroll down to the sorting vault
  const scrollToVault = () => {
    sound.playPaperWhoosh();
    const vault = document.getElementById('sorting-vault');
    if (vault) {
      vault.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // When a mail drops into the mailbox slot
  const handleMailCollected = (letter) => {
    setCollectedCount(prev => prev + 1);
  };

  // Handle Upvote / Co-sign
  const handleUpvote = (issueId) => {
    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        const nextHasUpvoted = !issue.hasUpvoted;
        return {
          ...issue,
          hasUpvoted: nextHasUpvoted,
          upvotes: nextHasUpvoted ? issue.upvotes + 1 : issue.upvotes - 1
        };
      }
      return issue;
    }));
  };

  // Add new reported issue
  const handleAddIssue = (newIssue) => {
    sound.playSlotDrop();
    setCollectedCount(prev => prev + 1);
    setIssues(prev => [newIssue, ...prev]);
  };

  // Admin status update
  const handleUpdateStatus = (issueId, updateData) => {
    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        const newTimelineEntry = {
          status: updateData.status,
          title: `Status Advanced to ${STATUS_CONFIG[updateData.status]?.label}`,
          date: 'Just now',
          author: updateData.author,
          role: updateData.role,
          note: updateData.note,
          evidenceImage: updateData.evidenceUrl
        };

        return {
          ...issue,
          status: updateData.status,
          completionEvidenceUrl: updateData.evidenceUrl || issue.completionEvidenceUrl,
          timeline: [...(issue.timeline || []), newTimelineEntry]
        };
      }
      return issue;
    }));
  };

  // Citizen verification or reopen
  const handleVerify = (issueId, verifyData) => {
    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        const nextStatus = verifyData.isResolved ? 'citizen_verified' : 'reopened';
        const newTimelineEntry = {
          status: nextStatus,
          title: verifyData.isResolved
            ? 'Citizen Certified Resolution'
            : 'Reopened by Citizen Inspection',
          date: verifyData.date,
          author: verifyData.userName,
          role: 'Community Verifier',
          note: verifyData.comment
        };

        return {
          ...issue,
          status: nextStatus,
          timeline: [...(issue.timeline || []), newTimelineEntry]
        };
      }
      return issue;
    }));
  };

  // Filter issues
  const filteredIssues = issues.filter(issue => {
    const matchesCategory = selectedCategory === 'all' || issue.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || issue.status === selectedStatus;
    const matchesSearch = searchQuery === '' || 
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const verifiedCount = issues.filter(i => i.status === 'citizen_verified').length;

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-400" style={{ background: 'var(--theme-bg-gradient)' }}>
      
      {/* Top Navbar */}
      <Navbar
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        issuesCount={issues.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        
        {/* Tab 1: Live Interactive Mailbox & Community Feed */}
        {activeTab === 'feed' && (
          <div className="space-y-4">
            
            {/* STAGE 1: Monumental Overture Hero with Unfolding 3D Airmail Letter */}
            <GustavoHero
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onScrollToVault={scrollToVault}
              totalIssues={issues.length}
              verifiedCount={verifiedCount}
            />

            {/* STAGE 2: Interactive 3D Postbox & Letter Drop Stage */}
            <MailboxStage
              issues={issues}
              collectedCount={collectedCount}
              onMailCollected={handleMailCollected}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onScrollToVault={scrollToVault}
            />

            {/* STAGE 3: Vertical Downward Mail Chute Transit */}
            <MailChuteScroll
              recentMails={issues.slice(0, 3)}
            />

            {/* STAGE 4: Underground Municipal Sorting Vault */}
            <SortingVault
              issues={issues}
              onSelectIssue={setTimelineIssue}
              onUpvote={handleUpvote}
            />

            {/* STAGE 5: The 6 Symphonic Movements of Resolution */}
            <SymphonicMovements
              issues={issues}
              onSelectIssue={setTimelineIssue}
            />

            {/* STAGE 6: Community Feed Search & Full Grid */}
            <section className="space-y-6 pt-12 border-t-2 border-white/10">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-monumental text-3xl sm:text-5xl text-white uppercase tracking-tight">
                    Live Street Dispatches
                  </h3>
                  <p className="text-xs text-stone-400 font-mono uppercase tracking-wider">
                    All verified neighborhood reports under municipal investigation
                  </p>
                </div>

                <div className="relative w-full sm:w-80">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by ticket #CV, street, ward..."
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400 font-mono"
                  />
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                </div>
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
                {[
                  { id: 'all', label: 'All Dispatches' },
                  { id: 'reported', label: 'Reported' },
                  { id: 'in_progress', label: 'In Progress' },
                  { id: 'completed', label: 'Completed' },
                  { id: 'citizen_verified', label: 'Verified' },
                  { id: 'reopened', label: 'Reopened' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      sound.playTick();
                      setSelectedStatus(s.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                      selectedStatus === s.id
                        ? 'bg-yellow-400 text-black shadow-md'
                        : 'bg-white/10 text-stone-300 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Grid of Issue Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIssues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    userRole={userRole}
                    onUpvote={handleUpvote}
                    onOpenTimeline={setTimelineIssue}
                    onVerify={(issue, isResolved) => setVerifyIssueData({ issue, isVerifyingResolved: isResolved })}
                    onAdminAction={setAdminActionIssue}
                  />
                ))}
              </div>

            </section>

          </div>
        )}

        {/* Tab 2: Interactive Ward Map Radar */}
        {activeTab === 'map' && (
          <section className="space-y-6 pt-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-monumental text-3xl sm:text-5xl text-white uppercase tracking-tight">
                  Ward GIS Radar
                </h2>
                <p className="text-xs text-stone-400 font-mono uppercase tracking-wider">
                  Live geospatial plotting of civic reports across municipal districts
                </p>
              </div>
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-yellow-400 text-black text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Drop New Pin</span>
              </button>
            </div>

            <InteractiveMapPreview
              issues={issues}
              onSelectIssue={setTimelineIssue}
              onOpenReportModal={() => setIsReportModalOpen(true)}
            />
          </section>
        )}

        {/* Tab 3: Resolution Ledger & Analytics */}
        {activeTab === 'analytics' && (
          <section className="pt-6">
            <StatsDashboard issues={issues} />
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 bg-black/90 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-stone-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white uppercase">CIVICVOICE // THE MUNICIPAL SYMPHONY</span>
          </div>
          <div className="flex items-center gap-4 uppercase tracking-widest text-[11px]">
            <span>NY Phil Gustavo Theatrical Staging</span>
            <span>•</span>
            <span>Direct Citizen Conductor</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isReportModalOpen && (
        <IssueReportModal
          onClose={() => setIsReportModalOpen(false)}
          onSubmitIssue={handleAddIssue}
          existingIssues={issues}
        />
      )}

      {timelineIssue && (
        <IssueTimelineModal
          issue={timelineIssue}
          onClose={() => setTimelineIssue(null)}
          onVerify={(issue, isResolved) => setVerifyIssueData({ issue, isVerifyingResolved: isResolved })}
          userRole={userRole}
          onAdminAction={setAdminActionIssue}
        />
      )}

      {adminActionIssue && (
        <AdminActionModal
          issue={adminActionIssue}
          onClose={() => setAdminActionIssue(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {verifyIssueData && (
        <CitizenVerifyModal
          issue={verifyIssueData.issue}
          isVerifyingResolved={verifyIssueData.isVerifyingResolved}
          onClose={() => setVerifyIssueData(null)}
          onConfirm={handleVerify}
        />
      )}

    </div>
  );
}
