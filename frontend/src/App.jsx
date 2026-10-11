import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from './components/Navbar';
import CitizenHomePortal from './components/CitizenHomePortal';
import MergedReportsModal from './components/MergedReportsModal';
import HelpModal from './components/HelpModal';
import CitizenProfileModal from './components/CitizenProfileModal';
import IssueCard from './components/IssueCard';
import IssueReportModal from './components/IssueReportModal';
import IssueTimelineModal from './components/IssueTimelineModal';
import AdminActionModal from './components/AdminActionModal';
import CitizenVerifyModal from './components/CitizenVerifyModal';
import AuthModal from './components/AuthModal';
import LeafletMap from './components/LeafletMap';
import StatsDashboard from './components/StatsDashboard';
import MunicipalDashboard from './components/MunicipalDashboard';
import AdminDashboard from './components/AdminDashboard';
import CitizenDashboard from './components/CitizenDashboard';
import MunicipalOnboardingModal from './components/MunicipalOnboardingModal';
import { INITIAL_ISSUES, CATEGORIES } from './data/mockIssues';
import { THEMES } from './data/themes';
import { sound, safePlaySound } from './utils/audio';
import { useAuth } from './context/AuthContext';
import api from './services/api';
import { Search, Plus, AlertCircle, CheckCircle2, X, Loader2, RefreshCw, MapPin } from 'lucide-react';

const resolveIssueLocation = (issue) => {
  let state = issue.state || issue.municipality_state || '';
  let city = issue.city || issue.municipality_city || '';
  let locality = '';

  const address = issue.address || '';

  if (!city || !state) {
    const parts = address.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 3) {
      locality = parts[0];
      city = city || parts[parts.length - 2];
      state = state || parts[parts.length - 1];
    } else if (parts.length === 2) {
      locality = parts[0];
      city = city || parts[1];
    } else if (parts.length === 1) {
      locality = parts[0];
    }

    const munName = (issue.municipality_name || issue.municipalityName || '').toLowerCase();
    if (!city) {
      if (munName.includes('vadodara') || address.toLowerCase().includes('vadodara')) city = 'Vadodara';
      else if (munName.includes('ahmedabad') || address.toLowerCase().includes('ahmedabad')) city = 'Ahmedabad';
      else if (munName.includes('surat') || address.toLowerCase().includes('surat')) city = 'Surat';
      else if (munName.includes('bengaluru') || address.toLowerCase().includes('bengaluru') || address.toLowerCase().includes('bangalore')) city = 'Bengaluru';
      else if (munName.includes('mumbai') || address.toLowerCase().includes('mumbai')) city = 'Mumbai';
      else if (munName.includes('delhi') || address.toLowerCase().includes('delhi')) city = 'New Delhi';
    }
    if (!state) {
      if (['vadodara', 'ahmedabad', 'surat', 'rajkot', 'gandhinagar'].some(c => city.toLowerCase().includes(c))) state = 'Gujarat';
      else if (city.toLowerCase().includes('bengaluru')) state = 'Karnataka';
      else if (['mumbai', 'pune'].some(c => city.toLowerCase().includes(c))) state = 'Maharashtra';
      else if (city.toLowerCase().includes('delhi')) state = 'Delhi';
    }
  }

  return {
    state: state.trim(),
    city: city.trim(),
    locality: locality.trim() || address.trim(),
  };
};

export default function App() {
  const { user, role, isAuthenticated } = useAuth();
  const [currentTheme, setCurrentTheme] = useState('lightYellow');
  const [issues, setIssues] = useState(INITIAL_ISSUES);
  const [isLoadingIssues, setIsLoadingIssues] = useState(false);
  const [issuesError, setIssuesError] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [collectedCount, setCollectedCount] = useState(1428);

  // Location Filters (State, City, Locality)
  const [selectedState, setSelectedState] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [localityInput, setLocalityInput] = useState('');
  const [activeLocalityFilter, setActiveLocalityFilter] = useState('');

  // Modals & Notifications
  const [pendingTrackIssueId, setPendingTrackIssueId] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMunicipalOnboardingOpen, setIsMunicipalOnboardingOpen] = useState(false);
  const [mergedModalIssue, setMergedModalIssue] = useState(null);
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

  // Canonical role
  const userRole = role || 'CITIZEN';

  // ── LOAD LIVE ISSUES ────────────────────────────────────────────────────────
  const fetchIssues = useCallback(async () => {
    setIsLoadingIssues(true);
    setIssuesError(null);
    try {
      const liveIssues = await api.issues.getAll();
      const liveFormatted = (liveIssues || []).map((i) => ({ ...i, isDemo: false }));
      const liveIds = new Set(liveFormatted.map((i) => i.id));
      const demoFormatted = INITIAL_ISSUES.map((d) => ({ ...d, isDemo: true })).filter((d) => !liveIds.has(d.id));
      setIssues([...liveFormatted, ...demoFormatted]);
    } catch (err) {
      console.warn('[BACKEND API] Could not load live issues:', err.message);
      setIssuesError('Unable to load live issues from server. Showing cached data.');
      setIssues(INITIAL_ISSUES.map((d) => ({ ...d, isDemo: true })));
    } finally {
      setIsLoadingIssues(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [isAuthenticated, fetchIssues]);

  // Apply theme styles dynamically
  useEffect(() => {
    const theme = THEMES[currentTheme] || THEMES.lightYellow;
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

  // Auto-route to role home tab when role changes
  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'ADMIN') setActiveTab('admin');
      else if (role === 'MUNICIPAL') setActiveTab('municipal');
      else if (['admin', 'users', 'duplicates', 'municipal', 'departments'].includes(activeTab)) {
        setActiveTab('home');
      }
    } else {
      if (['admin', 'users', 'duplicates', 'municipal', 'departments'].includes(activeTab)) {
        setActiveTab('home');
      }
    }
  }, [isAuthenticated, role]);

  // Redirect non-privileged users away from restricted tabs
  useEffect(() => {
    if (['municipal', 'departments'].includes(activeTab) && !['MUNICIPAL', 'ADMIN'].includes(userRole)) {
      setActiveTab('home');
    }
    if (['admin', 'users', 'duplicates'].includes(activeTab) && userRole !== 'ADMIN') {
      setActiveTab('home');
    }
  }, [activeTab, userRole]);

  const scrollToVault = () => {
    sound.playPaperWhoosh();
    const vault = document.getElementById('sorting-vault');
    if (vault) vault.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMailCollected = () => setCollectedCount((prev) => prev + 1);

  const handleOpenTimeline = useCallback(async (issueOrId) => {
    const issueId = typeof issueOrId === 'string' ? issueOrId : issueOrId?.id;
    if (!issueId) return;

    setIsLoadingTimeline(true);
    try {
      const detailed = await api.issues.getById(issueId);
      if (detailed) {
        setTimelineIssue(detailed);
      } else {
        throw new Error(`Report #${issueId} could not be found or has been archived.`);
      }
    } catch (err) {
      console.warn('Failed to load detailed timeline:', err);
      const localFallback = typeof issueOrId === 'object' && issueOrId !== null
        ? issueOrId
        : issues.find((i) => i.id === issueId);
      if (localFallback) {
        setTimelineIssue(localFallback);
        return;
      }
      const isNotFound = err.status === 404 || err.message?.includes('not found') || err.message?.includes('404');
      showNotification({
        type: 'error',
        message: isNotFound
          ? `Report #${issueId} could not be found or has been archived.`
          : (err.message || 'Failed to retrieve official report details from server.'),
      });
    } finally {
      setIsLoadingTimeline(false);
    }
  }, [issues]);

  // Handle URL issue tracking (?trackIssue=CV-... or #issue-CV-...)
  useEffect(() => {
    const parseTrackingIssue = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const queryTrack = searchParams.get('trackIssue') || searchParams.get('issueId');
      if (queryTrack) return queryTrack.trim();

      const hash = window.location.hash || '';
      const hashMatch = hash.match(/^#issue-([^&?]+)/);
      if (hashMatch && hashMatch[1]) return decodeURIComponent(hashMatch[1]).trim();

      return null;
    };

    const targetIssueId = parseTrackingIssue();
    if (targetIssueId) {
      setPendingTrackIssueId(targetIssueId);
      handleOpenTimeline(targetIssueId);
    }

    const onHashChange = () => {
      const newTarget = parseTrackingIssue();
      if (newTarget) {
        setPendingTrackIssueId(newTarget);
        handleOpenTimeline(newTarget);
      }
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [handleOpenTimeline]);

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
            return { ...issue, hasUpvoted: result.hasUpvoted, upvotes: result.upvotes };
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

  const handleAddIssue = async (newIssue) => {
    sound.playSlotDrop();
    try {
      const created = await api.issues.create({
        title: newIssue.title,
        description: newIssue.description,
        category: newIssue.category,
        customCategory: newIssue.customCategory,
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
    }
  };

  const handleUpdateStatus = async (issueOrUpdateData, updateDataArg) => {
    // handleUpdateStatus can be called with (issue, updateData) from AdminDashboard
    // or with (issueId, updateData) from handleUpdateStatusById
    let issueId, updateData;
    if (typeof issueOrUpdateData === 'string') {
      issueId = issueOrUpdateData;
      updateData = updateDataArg;
    } else if (issueOrUpdateData && issueOrUpdateData.id && !updateDataArg) {
      // Called from MunicipalDashboard or AdminDashboard with just the issue object
      setAdminActionIssue(issueOrUpdateData);
      return;
    } else {
      issueId = issueOrUpdateData;
      updateData = updateDataArg;
    }

    if (!updateData) {
      setAdminActionIssue(typeof issueOrUpdateData === 'object' ? issueOrUpdateData : null);
      return;
    }

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
    }
  };

  // Wrapper for AdminActionModal callback
  const handleUpdateStatusFromModal = async (issueId, updateData) => {
    await handleUpdateStatus(issueId, updateData);
  };

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
    }
  };

  // Dynamically derive available States and Cities from issue data
  const locationCatalog = useMemo(() => {
    const statesMap = new Map();

    issues.forEach((issue) => {
      const loc = resolveIssueLocation(issue);
      if (loc.state) {
        if (!statesMap.has(loc.state)) {
          statesMap.set(loc.state, new Set());
        }
        if (loc.city) {
          statesMap.get(loc.state).add(loc.city);
        }
      }
    });

    const statesList = Array.from(statesMap.keys()).sort();
    let citiesList = [];
    if (selectedState !== 'all' && statesMap.has(selectedState)) {
      citiesList = Array.from(statesMap.get(selectedState)).sort();
    } else {
      const allCities = new Set();
      statesMap.forEach((cSet) => cSet.forEach((c) => allCities.add(c)));
      citiesList = Array.from(allCities).sort();
    }

    return { states: statesList, cities: citiesList };
  }, [issues, selectedState]);

  // Filter issues for the feed (Category, Status, Search, State, City, Locality)
  // Confirmed duplicate children are hidden from default feed to reduce clutter
  const filteredIssues = issues.filter((issue) => {
    // Hide confirmed duplicate children from the public feed
    if (issue.duplicateOf) return false;

    const matchesCategory = selectedCategory === 'all' || issue.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || issue.status === selectedStatus;
    const matchesSearch =
      searchQuery === '' ||
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.address.toLowerCase().includes(searchQuery.toLowerCase());

    const loc = resolveIssueLocation(issue);
    const matchesState = selectedState === 'all' || loc.state.toLowerCase() === selectedState.toLowerCase();
    const matchesCity = selectedCity === 'all' || loc.city.toLowerCase() === selectedCity.toLowerCase();
    const matchesLocality =
      !activeLocalityFilter ||
      loc.locality.toLowerCase().includes(activeLocalityFilter.toLowerCase()) ||
      issue.address.toLowerCase().includes(activeLocalityFilter.toLowerCase());

    return matchesCategory && matchesStatus && matchesSearch && matchesState && matchesCity && matchesLocality;
  });

  const verifiedCount = issues.filter((i) => i.status === 'citizen_verified').length;

  const openReportModal = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    } else {
      setIsReportModalOpen(true);
    }
  };

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
        onOpenReportModal={openReportModal}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenMunicipalOnboarding={() => setIsMunicipalOnboardingOpen(true)}
        issuesCount={issues.length}
      />


      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* ── TAB: CITIZEN HOME PORTAL ───────────────────────────────────────── */}
        {activeTab === 'home' && (
          <div className="pt-6">
            <CitizenHomePortal
              issues={issues}
              onOpenReportModal={openReportModal}
              onOpenTimeline={handleOpenTimeline}
              onUpvote={handleUpvote}
              onVerify={(issue, isResolved) =>
                setVerifyIssueData({ issue, isVerifyingResolved: isResolved })
              }
              onAdminAction={setAdminActionIssue}
              onViewMerged={(issue) => setMergedModalIssue(issue)}
              userRole={userRole}
              isAuthenticated={isAuthenticated}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          </div>
        )}

        {/* ── TAB: CITIZEN DASHBOARD (My Complaints & Activity) ───────────────── */}
        {(activeTab === 'citizen' || activeTab === 'activity') && (
          <div className="pt-6">
            <CitizenDashboard
              issues={issues}
              user={user}
              initialFilter={activeTab === 'activity' ? 'my_reports' : 'all'}
              onOpenReportModal={openReportModal}
              onOpenTimeline={handleOpenTimeline}
              onUpvote={handleUpvote}
              onVerify={(issue, isResolved) =>
                setVerifyIssueData({ issue, isVerifyingResolved: isResolved })
              }
              onNavigateTab={(tab) => setActiveTab(tab)}
              onViewMerged={(issue) => setMergedModalIssue(issue)}
            />
          </div>
        )}

        {/* ── TAB: FEED (Nearby Problems) ────────────────────────────────────── */}
        {activeTab === 'feed' && (
          <div className="space-y-6 pt-6">
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--theme-heading,#29261F)] tracking-tight">
                    Nearby Community Complaints
                  </h2>
                  <p className="text-xs text-[var(--theme-text-secondary,#625D52)]">
                    Verified civic reports across city localities. Merged duplicate reports are grouped to prevent feed clutter.
                  </p>
                </div>


                <div className="flex items-center gap-2">
                  {/* Reload button */}
                  <button
                    onClick={fetchIssues}
                    disabled={isLoadingIssues}
                    className="p-2.5 rounded-xl bg-white hover:bg-[var(--theme-surface-secondary,#FDF7E7)] border border-[var(--theme-card-border,#E7DDC5)] text-[var(--theme-text-primary,#29261F)] transition-all disabled:opacity-50 shadow-2xs"
                    title="Reload issues"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingIssues ? 'animate-spin text-[#8A6418]' : ''}`} />
                  </button>

                  <div className="relative w-full sm:w-80">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by ticket #CV, street, ward..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-[var(--theme-card-border,#E7DDC5)] text-[var(--theme-text-primary,#29261F)] placeholder:text-[var(--theme-text-muted,#787367)] text-xs focus:outline-none focus:ring-2 focus:ring-[#8A6418] font-mono shadow-2xs"
                    />
                    <Search className="w-4 h-4 text-[var(--theme-text-muted,#787367)] absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              {/* ── FILTER BY LOCATION CONTROL ── */}
              <div className="p-4 rounded-2xl bg-white border border-[var(--theme-card-border,#E7DDC5)] shadow-2xs space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2 text-[var(--theme-heading,#29261F)] font-bold uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-[#8A6418]" />
                    <span>Filter by Location</span>
                    {(selectedState !== 'all' || selectedCity !== 'all' || activeLocalityFilter) && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#8A6418]/15 text-[#8A6418] border border-[#8A6418]/30">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* State Selector */}
                    <div className="flex items-center gap-1.5">
                      <label className="text-[10px] text-[var(--theme-text-muted,#787367)] uppercase font-semibold">State:</label>
                      <select
                        value={selectedState}
                        onChange={(e) => {
                          const newState = e.target.value;
                          setSelectedState(newState);
                          setSelectedCity('all');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-[var(--theme-surface-secondary,#FDF7E7)] border border-[var(--theme-card-border,#E7DDC5)] text-[var(--theme-text-primary,#29261F)] text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#8A6418] cursor-pointer"
                      >
                        <option value="all">All States</option>
                        {locationCatalog.states.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* City Selector (Filtered by Selected State) */}
                    <div className="flex items-center gap-1.5">
                      <label className="text-[10px] text-[var(--theme-text-muted,#787367)] uppercase font-semibold">City:</label>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-[var(--theme-surface-secondary,#FDF7E7)] border border-[var(--theme-card-border,#E7DDC5)] text-[var(--theme-text-primary,#29261F)] text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#8A6418] cursor-pointer"
                      >
                        <option value="all">All Cities</option>
                        {locationCatalog.cities.map((ct) => (
                          <option key={ct} value={ct}>
                            {ct}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Optional Locality / Ward Search Input */}
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={localityInput}
                        onChange={(e) => setLocalityInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setActiveLocalityFilter(localityInput.trim());
                        }}
                        placeholder="Locality / Area..."
                        className="w-32 sm:w-36 px-2.5 py-1.5 rounded-lg bg-[var(--theme-surface-secondary,#FDF7E7)] border border-[var(--theme-card-border,#E7DDC5)] text-[var(--theme-text-primary,#29261F)] text-xs font-mono placeholder:text-[var(--theme-text-muted,#787367)] focus:outline-none focus:ring-1 focus:ring-[#8A6418]"
                      />
                    </div>

                    {/* Actions */}
                    <button
                      type="button"
                      onClick={() => setActiveLocalityFilter(localityInput.trim())}
                      className="px-3 py-1.5 rounded-lg bg-[#8A6418] hover:bg-[#735212] text-white text-xs font-mono font-bold transition-colors shadow-2xs"
                    >
                      Apply Filters
                    </button>

                    {(selectedState !== 'all' || selectedCity !== 'all' || activeLocalityFilter || localityInput) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedState('all');
                          setSelectedCity('all');
                          setLocalityInput('');
                          setActiveLocalityFilter('');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-[var(--theme-text-secondary,#625D52)] text-xs font-mono transition-colors"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </div>

                {/* Visible Badges for Active Location Filters */}
                {(selectedState !== 'all' || selectedCity !== 'all' || activeLocalityFilter) && (
                  <div className="pt-2 border-t border-[var(--theme-card-border,#E7DDC5)] flex items-center gap-2 flex-wrap text-[11px] font-mono">
                    <span className="text-[var(--theme-text-muted,#787367)]">Active filters:</span>
                    {selectedState !== 'all' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--theme-pill-bg,#FDF1CE)] text-[#78350F] border border-[var(--theme-card-border,#E7DDC5)]">
                        <span>State: <strong>{selectedState}</strong></span>
                        <button onClick={() => setSelectedState('all')} className="hover:text-rose-600 ml-0.5" title="Remove State filter">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {selectedCity !== 'all' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--theme-pill-bg,#FDF1CE)] text-[#78350F] border border-[var(--theme-card-border,#E7DDC5)]">
                        <span>City: <strong>{selectedCity}</strong></span>
                        <button onClick={() => setSelectedCity('all')} className="hover:text-rose-600 ml-0.5" title="Remove City filter">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {activeLocalityFilter && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--theme-pill-bg,#FDF1CE)] text-[#78350F] border border-[var(--theme-card-border,#E7DDC5)]">
                        <span>Locality: <strong>"{activeLocalityFilter}"</strong></span>
                        <button onClick={() => { setLocalityInput(''); setActiveLocalityFilter(''); }} className="hover:text-rose-600 ml-0.5" title="Remove Locality filter">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Filter Tabs: Category & Status */}
              <div className="space-y-2">
                {/* Category Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        sound.playTick();
                        setSelectedCategory(c.id);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                        selectedCategory === c.id
                          ? 'bg-[#8A6418] text-white shadow-xs'
                          : 'bg-white text-[var(--theme-text-primary,#29261F)] border border-[var(--theme-card-border,#E7DDC5)] hover:bg-[var(--theme-surface-secondary,#FDF7E7)]'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                {/* Status Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
                  {[
                    { id: 'all', label: 'All Dispatches' },
                    { id: 'reported', label: 'Reported' },
                    { id: 'under_review', label: 'Under Review' },
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
                          ? 'bg-[#8A6418] text-white shadow-xs font-bold'
                          : 'bg-white text-[var(--theme-text-primary,#29261F)] border border-[var(--theme-card-border,#E7DDC5)] hover:bg-[var(--theme-surface-secondary,#FDF7E7)]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error state */}
              {issuesError && (
                <div className="p-3.5 rounded-2xl bg-[#FDF2F2] border border-[#FECACA] text-[#7F1D1D] text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#7F1D1D] flex-shrink-0" />
                  <span>{issuesError}</span>
                  <button onClick={fetchIssues} className="ml-auto text-[#7F1D1D] hover:underline font-bold">
                    Retry
                  </button>
                </div>
              )}

              {/* Loading state */}
              {isLoadingIssues && (
                <div className="flex items-center gap-2 px-1 text-[var(--theme-text-secondary,#625D52)] text-xs font-mono">
                  <Loader2 className="w-4 h-4 animate-spin text-[#8A6418]" />
                  <span>Loading live dispatches from PostgreSQL...</span>
                </div>
              )}

              {/* Grid with Empty State */}
              {!isLoadingIssues && filteredIssues.length === 0 ? (
                <div className="py-16 px-4 flex flex-col items-center gap-4 text-center rounded-3xl bg-white border border-[var(--theme-card-border,#E7DDC5)] shadow-2xs">
                  <div className="w-12 h-12 rounded-2xl bg-[#8A6418]/15 border border-[#8A6418]/30 flex items-center justify-center text-[#8A6418]">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--theme-heading,#29261F)]">
                      No Community Reports Match Active Filters
                    </h3>
                    <p className="text-xs text-[var(--theme-text-secondary,#625D52)] font-mono max-w-md mt-1">
                      No dispatches found for{' '}
                      {selectedCity !== 'all' ? `City: ${selectedCity}` : selectedState !== 'all' ? `State: ${selectedState}` : 'the selected criteria'}
                      {activeLocalityFilter ? ` (Locality: "${activeLocalityFilter}")` : ''}.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedStatus('all');
                      setSearchQuery('');
                      setSelectedState('all');
                      setSelectedCity('all');
                      setLocalityInput('');
                      setActiveLocalityFilter('');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#8A6418] hover:bg-[#735212] text-white text-xs font-mono font-bold transition-all shadow-2xs"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
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
                      onViewMerged={(issue) => setMergedModalIssue(issue)}
                    />

                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ── TAB: MAP ────────────────────────────────────────────────────────── */}
        {activeTab === 'map' && (
          <section className="space-y-6 pt-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-monumental text-3xl sm:text-5xl text-[var(--theme-heading,#29261F)] uppercase tracking-tight">
                  Ward GIS Radar
                </h2>
                <p className="text-xs text-[var(--theme-text-secondary,#625D52)] font-mono uppercase tracking-wider">
                  Live geospatial plotting · OpenStreetMap · {issues.length} active dispatches
                </p>
              </div>
              <button
                onClick={openReportModal}
                className="px-4 py-2.5 rounded-xl bg-[#8A6418] hover:bg-[#735212] text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Drop New Pin</span>
              </button>
            </div>

            <LeafletMap
              issues={issues}
              onSelectIssue={handleOpenTimeline}
              onOpenReportModal={openReportModal}
            />
          </section>
        )}

        {/* ── TAB: ANALYTICS ──────────────────────────────────────────────────── */}
        {activeTab === 'analytics' && (
          <section className="pt-6">
            <StatsDashboard issues={issues} />
          </section>
        )}

        {/* ── TAB: MUNICIPAL DASHBOARD ────────────────────────────────────────── */}
        {['municipal', 'departments'].includes(activeTab) && (
          <section className="pt-6">
            {['MUNICIPAL', 'ADMIN'].includes(userRole) ? (
              <MunicipalDashboard
                onOpenTimeline={handleOpenTimeline}
                onUpdateStatus={(issue) => setAdminActionIssue(issue)}
                initialSection={activeTab === 'departments' ? 'departments' : 'overview'}
              />
            ) : (
              <div className="py-24 flex flex-col items-center gap-4 text-stone-500">
                <AlertCircle className="w-12 h-12 text-rose-500" />
                <p className="text-sm font-mono font-bold text-stone-300">Access Denied</p>
                <p className="text-xs text-stone-500 font-mono">Municipal Operations requires MUNICIPAL or ADMIN role.</p>
              </div>
            )}
          </section>
        )}

        {/* ── TAB: ADMIN DASHBOARD ────────────────────────────────────────────── */}
        {['admin', 'users', 'duplicates'].includes(activeTab) && (
          <section className="pt-6">
            {userRole === 'ADMIN' ? (
              <AdminDashboard
                onOpenTimeline={handleOpenTimeline}
                onUpdateStatus={(issue) => setAdminActionIssue(issue)}
                showNotification={showNotification}
                initialSection={activeTab === 'users' ? 'users' : activeTab === 'duplicates' ? 'duplicates' : 'overview'}
              />
            ) : (
              <div className="py-24 flex flex-col items-center gap-4 text-stone-500">
                <AlertCircle className="w-12 h-12 text-rose-500" />
                <p className="text-sm font-mono font-bold text-stone-300">Access Denied</p>
                <p className="text-xs text-stone-500 font-mono">Admin Panel requires ADMIN role.</p>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[var(--theme-card-border,#E7DDC5)] bg-[var(--theme-surface,#FFFDF5)] py-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[var(--theme-text-secondary,#625D52)]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--theme-heading,#29261F)] uppercase">CIVICVOICE // CIVIC ISSUE REDRESSAL PLATFORM</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[var(--theme-text-muted,#787367)]">
            <span>&copy; {new Date().getFullYear()} CivicVoice. All rights reserved.</span>
            <span>•</span>
            <span className="hidden sm:inline">Empowering Citizens & Municipalities Nationwide</span>
          </div>
        </div>
      </footer>

      {/* ── MODALS ──────────────────────────────────────────────────────────────── */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={() => safePlaySound('playSlotDrop')}
      />

      {/* Toast Notification */}
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

      {/* Timeline Loading */}
      {isLoadingTimeline && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-black/90 border border-yellow-400/40 text-yellow-300 text-xs font-mono flex items-center gap-2 shadow-2xl backdrop-blur-md animate-in fade-in">
          <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
          <span>Retrieving official dispatch updates...</span>
        </div>
      )}

      {/* Issue Report Modal */}
      {isReportModalOpen && (
        <IssueReportModal
          onClose={() => setIsReportModalOpen(false)}
          onSubmitIssue={handleAddIssue}
          existingIssues={issues}
        />
      )}

      {/* Timeline Modal */}
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

      {/* Admin/Municipal Action Modal */}
      {adminActionIssue && (
        <AdminActionModal
          issue={adminActionIssue}
          onClose={() => setAdminActionIssue(null)}
          onUpdateStatus={handleUpdateStatusFromModal}
        />
      )}

      {/* Citizen Verify Modal */}
      {verifyIssueData && (
        <CitizenVerifyModal
          issue={verifyIssueData.issue}
          isVerifyingResolved={verifyIssueData.isVerifyingResolved}
          onClose={() => setVerifyIssueData(null)}
          onConfirm={handleVerify}
        />
      )}

      {/* Merged Duplicate Reports Modal */}
      {mergedModalIssue && (
        <MergedReportsModal
          canonicalIssue={mergedModalIssue}
          isOpen={Boolean(mergedModalIssue)}
          onClose={() => setMergedModalIssue(null)}
          onSelectIssue={handleOpenTimeline}
        />
      )}

      {/* Citizen Help & Guidance Modal */}
      {isHelpModalOpen && (
        <HelpModal
          isOpen={isHelpModalOpen}
          onClose={() => setIsHelpModalOpen(false)}
          onOpenReportModal={openReportModal}
        />
      )}

      {/* Citizen & Staff Authentication Modal */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={() => {
            fetchIssues();
            showNotification({
              type: 'success',
              title: 'Welcome to CivicVoice',
              message: 'Successfully authenticated.',
            });
          }}
        />
      )}

      {/* Citizen Profile Modal */}
      {isProfileModalOpen && (
        <CitizenProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onOpenTimeline={handleOpenTimeline}
          onOpenReportModal={openReportModal}
        />
      )}

      {/* Municipal Onboarding Registration Modal */}
      {isMunicipalOnboardingOpen && (
        <MunicipalOnboardingModal
          isOpen={isMunicipalOnboardingOpen}
          onClose={() => setIsMunicipalOnboardingOpen(false)}
        />
      )}
    </div>
  );
}

