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
import AuthModal from './components/AuthModal';
import InteractiveMapPreview from './components/InteractiveMapPreview';
import StatsDashboard from './components/StatsDashboard';
import { INITIAL_ISSUES, STATUS_CONFIG } from './data/mockIssues';
import { THEMES } from './data/themes';
import { sound } from './utils/audio';
import { useAuth } from './context/AuthContext';
import { Search, Plus, AlertCircle, CheckCircle2, X, Loader2 } from 'lucide-react';

export default function App() {
  const { user, role, isAuthenticated } = useAuth();
  const [currentTheme, setCurrentTheme] = useState('gustavoStage');
  const [issues, setIssues] = useState(INITIAL_ISSUES);
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [collectedCount, setCollectedCount] = useState(1428);

  // Modals & Notifications
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [timelineIssue, setTimelineIssue] = useState(null);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);
  const [adminActionIssue, setAdminActionIssue] = useState(null);
  const [verifyIssueData, setVerifyIssueData] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (notif) => {
    setNotification(notif);
    setTimeout(() => {
      setNotification((curr) => (curr === notif ? null : curr));
    }, 6000);
  };

  // Canonical role passed to child components: 'CITIZEN' | 'MUNICIPAL' | 'ADMIN'
  const userRole = role || 'CITIZEN';

  // Load live issues from backend on mount and auth state change
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const liveIssues = await api.issues.getAll();
        if (liveIssues && liveIssues.length > 0) {
          setIssues(liveIssues);
        }
      } catch (err) {
        console.warn('[BACKEND API] Could not load live issues, falling back to cached seed dispatches.');
      }
    };
    fetchIssues();
  }, [isAuthenticated]);

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

  // Scroll down to sorting vault
  const scrollToVault = () => {
    sound.playPaperWhoosh();
    const vault = document.getElementById('sorting-vault');
    if (vault) {
      vault.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // When a mail drops into the mailbox slot
  const handleMailCollected = () => {
    setCollectedCount((prev) => prev + 1);
  };

  // Fetch full detailed issue including issue_updates timeline from backend
  const handleOpenTimeline = async (issueOrId) => {
    const issueId = typeof issueOrId === 'string' ? issueOrId : issueOrId?.id;
    if (!issueId) return;

    setIsLoadingTimeline(true);
    try {
      const detailed = await api.issues.getById(issueId);
      if (detailed) {
        setTimelineIssue(detailed);
      } else {
        throw new Error(`Official dispatch log for #${issueId} could not be retrieved.`);
      }
    } catch (err) {
      console.error('Failed to load detailed timeline:', err);
      showNotification({
        type: 'error',
        message: err.message || 'Failed to retrieve official dispatch timeline from server.',
      });
    } finally {
      setIsLoadingTimeline(false);
    }
  };

  // Handle Upvote / Co-sign with real backend sync
  const handleUpvote = async (issueId) => {
    if (!isAuthenticated) {
      sound.playTick();
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const result = await api.issues.upvote(issueId);
      setIssues((prev) =>
        prev.map((issue) => {
          if (issue.id === issueId) {
            return {
              ...issue,
              hasUpvoted: result.hasUpvoted,
              upvotes: result.upvotes,
            };
          }
          return issue;
        })
      );
    } catch (err) {
      console.error('Failed to upvote issue:', err);
      showNotification({
        type: 'error',
        message: err.message || 'Failed to register co-sign endorsement on server.',
      });
    }
  };

  // Add new reported issue to real backend (No local fallback on rejection)
  const handleAddIssue = async (newIssue) => {
    sound.playSlotDrop();

    try {
      const created = await api.issues.create({
        title: newIssue.title,
        description: newIssue.description,
        category: newIssue.category,
        address: newIssue.address,
        latitude: newIssue.latitude,
        longitude: newIssue.longitude,
        imageUrl: newIssue.imageUrl,
      });

      if (created) {
        setCollectedCount((prev) => prev + 1);
        setIssues((prev) => [created, ...prev]);
        showNotification({
          type: 'success',
          message: `Civic dispatch ${created.id} registered on municipal ledger.`,
        });
        return;
      }
    } catch (err) {
      console.error('Backend issue creation rejected:', err);
      showNotification({
        type: 'error',
        message: err.message || 'Issue submission was rejected by the server.',
      });
      // Do NOT mutate local state on failure
    }
  };

  // Municipal / Admin status update with real backend sync (No local fallback on rejection)
  const handleUpdateStatus = async (issueId, updateData) => {
    try {
      const updated = await api.issues.updateStatus(issueId, {
        status: updateData.status,
        note: updateData.note,
        evidenceUrl: updateData.evidenceUrl,
        officerName: updateData.author,
        department: updateData.role,
      });

      if (updated) {
        setIssues((prev) =>
          prev.map((issue) => (issue.id === issueId ? updated : issue))
        );
        if (timelineIssue && timelineIssue.id === issueId) {
          setTimelineIssue(updated);
        }
        showNotification({
          type: 'success',
          message: `Issue #${issueId} status advanced to '${updateData.status}'.`,
        });
        return;
      }
    } catch (err) {
      console.error('Backend status update rejected:', err);
      showNotification({
        type: 'error',
        message: err.message || 'Status update was rejected by the server.',
      });
      // Do NOT mutate local state on failure
    }
  };

  // Citizen verification or reopen with real backend sync (No local fallback on rejection)
  const handleVerify = async (issueId, verifyData) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      const verified = await api.issues.verify(issueId, {
        isResolved: verifyData.isResolved,
        comment: verifyData.comment,
      });

      if (verified) {
        setIssues((prev) =>
          prev.map((issue) => (issue.id === issueId ? verified : issue))
        );
        if (timelineIssue && timelineIssue.id === issueId) {
          setTimelineIssue(verified);
        }
        showNotification({
          type: 'success',
          message: verifyData.isResolved
            ? `Issue #${issueId} certified as resolved by citizen inspection.`
            : `Issue #${issueId} officially reopened for municipal inspection.`,
        });
        return;
      }
    } catch (err) {
      console.error('Backend verification rejected:', err);
      showNotification({
        type: 'error',
        message: err.message || 'Verification submission was rejected by the server.',
      });
      // Do NOT mutate local state on failure
    }
  };

  // Filter issues
  const filteredIssues = issues.filter((issue) => {
    const matchesCategory = selectedCategory === 'all' || issue.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || issue.status === selectedStatus;
    const matchesSearch =
      searchQuery === '' ||
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.address.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesStatus && matchesSearch;
  });

  const verifiedCount = issues.filter((i) => i.status === 'citizen_verified').length;

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-400"
      style={{ background: 'var(--theme-bg-gradient)' }}
    >
      {/* Top Navbar */}
      <Navbar
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={() => {
          if (!isAuthenticated) {
            setIsAuthModalOpen(true);
          } else {
            setIsReportModalOpen(true);
          }
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        issuesCount={issues.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Tab 1: Live Interactive Mailbox & Community Feed */}
        {activeTab === 'feed' && (
          <div className="space-y-4">
            {/* STAGE 1: Monumental Overture Hero with Unfolding 3D Airmail Letter */}
            <GustavoHero
              onOpenReportModal={() => {
                if (!isAuthenticated) setIsAuthModalOpen(true);
                else setIsReportModalOpen(true);
              }}
              onScrollToVault={scrollToVault}
              totalIssues={issues.length}
              verifiedCount={verifiedCount}
            />

            {/* STAGE 2: Interactive 3D Postbox & Letter Drop Stage */}
            <MailboxStage
              issues={issues}
              collectedCount={collectedCount}
              onMailCollected={handleMailCollected}
              onOpenReportModal={() => {
                if (!isAuthenticated) setIsAuthModalOpen(true);
                else setIsReportModalOpen(true);
              }}
              onScrollToVault={scrollToVault}
            />

            {/* STAGE 3: Vertical Downward Mail Chute Transit */}
            <MailChuteScroll recentMails={issues.slice(0, 3)} />

            {/* STAGE 4: Underground Municipal Sorting Vault */}
            <SortingVault
              issues={issues}
              onSelectIssue={handleOpenTimeline}
              onUpvote={handleUpvote}
            />

            {/* STAGE 5: The 6 Symphonic Movements of Resolution */}
            <SymphonicMovements issues={issues} onSelectIssue={handleOpenTimeline} />

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
                  { id: 'reopened', label: 'Reopened' },
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
                    onOpenTimeline={handleOpenTimeline}
                    onVerify={(issue, isResolved) =>
                      setVerifyIssueData({ issue, isVerifyingResolved: isResolved })
                    }
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
                onClick={() => {
                  if (!isAuthenticated) setIsAuthModalOpen(true);
                  else setIsReportModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-yellow-400 text-black text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Drop New Pin</span>
              </button>
            </div>

            <InteractiveMapPreview
              issues={issues}
              onSelectIssue={handleOpenTimeline}
              onOpenReportModal={() => {
                if (!isAuthenticated) setIsAuthModalOpen(true);
                else setIsReportModalOpen(true);
              }}
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

      {/* Real Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={() => sound.playSlotDrop()}
      />

      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`fixed top-24 right-6 z-50 max-w-md p-4 rounded-2xl shadow-2xl backdrop-blur-md border text-xs font-mono flex items-start gap-3 animate-in slide-in-from-top-4 duration-200 ${
            notification.type === 'error'
              ? 'bg-rose-950/95 border-rose-700/80 text-rose-100 shadow-rose-950/50'
              : 'bg-emerald-950/95 border-emerald-700/80 text-emerald-100 shadow-emerald-950/50'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1 leading-relaxed">
            <div className="font-bold uppercase tracking-wider text-[10px] opacity-80 mb-0.5">
              {notification.type === 'error' ? 'Action Rejected' : 'Server Confirmation'}
            </div>
            <div>{notification.message}</div>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Loading Timeline Indicator */}
      {isLoadingTimeline && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-black/90 border border-yellow-400/40 text-yellow-300 text-xs font-mono flex items-center gap-2 shadow-2xl backdrop-blur-md animate-in fade-in">
          <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
          <span>Retrieving official dispatch updates from server...</span>
        </div>
      )}

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
          onVerify={(issue, isResolved) =>
            setVerifyIssueData({ issue, isVerifyingResolved: isResolved })
          }
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
