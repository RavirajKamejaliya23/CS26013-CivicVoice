import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MapPin, AlertTriangle, Check, Upload, Navigation, Loader2, Users, Eye, ArrowRight } from 'lucide-react';
import { CATEGORIES, STATUS_CONFIG } from '../data/mockIssues';
import api from '../services/api';
import confetti from 'canvas-confetti';

const SAMPLE_EVIDENCE_PHOTOS = [
  { label: 'Pothole / Road Damage', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80' },
  { label: 'Broken Streetlight', url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80' },
  { label: 'Blocked Drain / Flood', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=800&auto=format&fit=crop&q=80' },
  { label: 'Overflowing Garbage', url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80' },
];

export default function IssueReportModal({ onClose, onSubmitIssue, _existingIssues = [] }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('roads_potholes');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [selectedImage, setSelectedImage] = useState(SAMPLE_EVIDENCE_PHOTOS[0].url);
  const [customImageFile, setCustomImageFile] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Duplicate detection state
  const [similarIssues, setSimilarIssues] = useState([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [duplicateStep, setDuplicateStep] = useState(null); // null | 'warning' | 'dismissed'
  const [selectedDuplicate, setSelectedDuplicate] = useState(null);
  const [coSigningId, setCoSigningId] = useState(null);
  const [coSignResult, setCoSignResult] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const duplicateCheckTimer = useRef(null);

  // Check for similar issues when category, coordinates, or description change
  useEffect(() => {
    if (!latitude || !longitude || !category) return;

    clearTimeout(duplicateCheckTimer.current);
    duplicateCheckTimer.current = setTimeout(async () => {
      setIsCheckingDuplicates(true);
      try {
        const similar = await api.issues.getSimilar({
          category,
          latitude,
          longitude,
          title: title.trim(),
          description: description.trim(),
        });
        setSimilarIssues(similar);
        if (similar.length > 0 && duplicateStep === null) {
          setDuplicateStep('warning');
          setSelectedDuplicate(similar[0]);
        }
      } catch (err) {
        // Network error — proceed without check
        console.warn('[Duplicate Check] API unavailable:', err.message);
      } finally {
        setIsCheckingDuplicates(false);
      }
    }, 600);

    return () => clearTimeout(duplicateCheckTimer.current);
  }, [latitude, longitude, category, title, description]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setAddress(`GPS Location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setLocationError('Location permission denied. Please enter address manually.');
        } else {
          setLocationError('Could not acquire GPS location.');
        }
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  };

  const handleCustomImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setCustomImageFile(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleJoinComplaint = async (canonicalId) => {
    setCoSigningId(canonicalId);
    try {
      const result = await api.issues.joinCanonical(canonicalId);
      setCoSignResult({ issueId: canonicalId, ...result });
    } catch (err) {
      setCoSignResult({ issueId: canonicalId, error: err.message });
    } finally {
      setCoSigningId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !address.trim()) return;

    // If there are potential duplicates and user hasn't dismissed, warn them
    if (similarIssues.length > 0 && duplicateStep !== 'dismissed') {
      setDuplicateStep('warning');
      return;
    }

    setIsSubmitting(true);
    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch (_) {}

    onSubmitIssue({
      title: title.trim(),
      description: description.trim(),
      category,
      address: address.trim(),
      latitude: latitude || (22.3168 + (Math.random() - 0.5) * 0.02),
      longitude: longitude || (73.1495 + (Math.random() - 0.5) * 0.02),
      imageUrl: selectedImage,
    });

    setIsSubmitting(false);
    onClose();
  };

  // ─── DUPLICATE WARNING SCREEN ─────────────────────────────────────────────
  if (duplicateStep === 'warning' && selectedDuplicate) {
    const statusInfo = STATUS_CONFIG[selectedDuplicate.status] || STATUS_CONFIG.reported;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="fixed inset-0" onClick={onClose} />

        <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-stone-900 border border-amber-400/30 shadow-2xl z-10 overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-red-400" />

          <div className="p-6 space-y-5">
            {/* Alert Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                  Similar complaint already reported nearby
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                  {similarIssues.length} active matching complaint{similarIssues.length !== 1 ? 's' : ''} detected
                </p>
              </div>
              <button
                onClick={onClose}
                className="ml-auto p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Human-readable duplicate card matching Section 15 */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-3">
              <div className="flex items-center justify-between gap-2 border-b border-amber-200 dark:border-amber-800/80 pb-2">
                <div>
                  <span className="text-[10px] font-mono text-stone-500 uppercase block">Complaint ID</span>
                  <span className="font-mono text-xs font-bold text-amber-800 dark:text-amber-300">
                    {selectedDuplicate.id}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-stone-500 uppercase block">Status</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                    {statusInfo.label}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-stone-500 uppercase block mb-0.5">Complaint</span>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug">
                  {selectedDuplicate.title}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 dark:text-stone-300 pt-1">
                <div>
                  <span className="text-[10px] font-mono text-stone-500 uppercase block">Supported by</span>
                  <div className="flex items-center gap-1 font-bold text-purple-700 dark:text-purple-300 mt-0.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>{selectedDuplicate.upvotes} citizens</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-stone-500 uppercase block">Approximate location</span>
                  <div className="flex items-center gap-1 font-medium truncate mt-0.5" title={selectedDuplicate.address}>
                    <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <span className="truncate">{selectedDuplicate.address}</span>
                  </div>
                </div>
              </div>

              {selectedDuplicate.confidenceLevel && (
                <div className="flex items-center justify-between text-[11px] font-mono bg-white/60 dark:bg-black/30 p-2 rounded-xl border border-amber-200/60 dark:border-amber-800/40">
                  <span className="text-stone-500">Duplicate Confidence:</span>
                  <span className={`font-bold ${
                    selectedDuplicate.confidenceLevel === 'HIGH'
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-amber-700 dark:text-amber-400'
                  }`}>
                    {Math.round((selectedDuplicate.confidenceScore || 0.8) * 100)}% ({selectedDuplicate.confidenceLevel} MATCH)
                  </span>
                </div>
              )}
            </div>

            {/* Co-sign / Join result */}
            {coSignResult && coSignResult.issueId === selectedDuplicate.id && (
              <div className={`p-3 rounded-xl text-xs font-mono font-bold flex items-center gap-2 ${
                coSignResult.error || coSignResult.alreadySupported
                  ? 'bg-amber-950/60 border border-amber-800 text-amber-200'
                  : 'bg-emerald-950/60 border border-emerald-800 text-emerald-200'
              }`}>
                {coSignResult.error ? (
                  <>{coSignResult.error}</>
                ) : coSignResult.alreadySupported ? (
                  <>{coSignResult.message || 'You have already supported this complaint.'}</>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>You have joined and supported this canonical complaint! ({coSignResult.upvotes} total citizens)</span>
                  </>
                )}
              </div>
            )}

            {/* Action Buttons with specified default visual emphasis */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => handleJoinComplaint(selectedDuplicate.id)}
                disabled={coSigningId === selectedDuplicate.id || (coSignResult && coSignResult.success)}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-60"
              >
                {coSigningId === selectedDuplicate.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Users className="w-4 h-4" />
                )}
                <span>Join This Complaint</span>
                <span className="text-xs font-mono opacity-80">(Recommended)</span>
              </button>

              <button
                onClick={() => {
                  window.open(`#issue-${selectedDuplicate.id}`, '_self');
                  onClose();
                }}
                className="w-full py-2.5 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-sm flex items-center justify-center gap-2 transition-all border border-stone-300 dark:border-stone-700"
              >
                <Eye className="w-4 h-4" />
                <span>View Complaint</span>
              </button>

              <button
                onClick={() => setDuplicateStep('dismissed')}
                className="w-full py-2.5 rounded-2xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 font-medium text-xs flex items-center justify-center gap-2 transition-all"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Create Separate Complaint</span>
              </button>
            </div>

            {/* Other similar issues */}
            {similarIssues.length > 1 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-mono text-stone-500 uppercase tracking-wider">Other similar reports:</p>
                {similarIssues.slice(1).map(issue => (
                  <button
                    key={issue.id}
                    onClick={() => setSelectedDuplicate(issue)}
                    className="w-full text-left p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 hover:border-amber-400 transition-colors"
                  >
                    <div className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate">{issue.title}</div>
                    <div className="text-[10px] font-mono text-stone-500 mt-0.5">
                      {issue.id} · {issue.distanceMetres}m away · {issue.upvotes} co-signed
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN REPORT FORM ─────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-stone-900 border border-stone-800/20 dark:border-stone-700 shadow-2xl z-10 flex flex-col">
        <div className="h-2 w-full airmail-border" />

        {/* Header */}
        <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-600/30 flex items-center justify-center text-amber-700 dark:text-amber-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                Dispatch a Civic Report
              </h2>
              <p className="text-xs font-mono text-stone-500 dark:text-stone-400">
                Direct submission to municipal public works department
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Category */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-2 font-bold">
              1. Issue Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.filter(c => c.id !== 'all').map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => {
                      setCategory(cat.id);
                      // Reset duplicate check state when category changes
                      setDuplicateStep(null);
                      setSimilarIssues([]);
                    }}
                    className={`p-2.5 rounded-2xl text-xs font-semibold border transition-all text-left flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 border-amber-600 font-bold shadow-sm'
                        : 'bg-stone-50 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5 font-bold">
                2. Issue Headline
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Broken streetlight on 5th Ave causing safety hazard"
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1.5 font-bold">
                3. Detailed Description
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe exact location markers, severity, how long it has existed, and safety risks..."
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400 font-bold">
                4. Location
              </label>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Acquiring GPS...' : 'Use My Location'}</span>
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                required
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Street address or landmark (GPS location for precise duplicate detection)"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
            {locationError && (
              <p className="text-xs text-rose-500 mt-1 font-mono">{locationError}</p>
            )}
            {latitude && longitude && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                ✓ GPS coordinates acquired ({latitude.toFixed(4)}, {longitude.toFixed(4)})
                {isCheckingDuplicates && <span className="ml-2 animate-pulse">· Checking for nearby issues...</span>}
              </p>
            )}
          </div>

          {/* Duplicate warning inline (less severe — after dismiss) */}
          {duplicateStep === 'dismissed' && similarIssues.length > 0 && (
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center gap-3 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-amber-900 dark:text-amber-200">Reporting separately. </span>
                <span className="text-amber-700 dark:text-amber-300">
                  {similarIssues.length} similar issue{similarIssues.length !== 1 ? 's' : ''} already exist nearby. Your report will create a new independent record.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDuplicateStep('warning')}
                className="ml-auto text-amber-600 hover:underline whitespace-nowrap"
              >
                Review again
              </button>
            </div>
          )}

          {/* Photo Evidence */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-2 font-bold">
              5. Photographic Evidence
            </label>
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SAMPLE_EVIDENCE_PHOTOS.map((sample, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => { setSelectedImage(sample.url); setCustomImageFile(null); }}
                    className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all ${
                      selectedImage === sample.url && !customImageFile
                        ? 'border-amber-500 shadow-md ring-2 ring-amber-500/30'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={sample.url} alt={sample.label} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white p-1 truncate">
                      {sample.label}
                    </span>
                    {selectedImage === sample.url && !customImageFile && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-stone-950" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <label className="flex items-center justify-center gap-2 p-3 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 hover:border-amber-500 dark:hover:border-amber-500 cursor-pointer text-xs text-stone-600 dark:text-stone-400 bg-stone-50/50 dark:bg-stone-800/30 transition-colors">
                <Upload className="w-4 h-4 text-stone-400" />
                <span>{customImageFile ? `✓ ${customImageFile}` : 'Or upload from camera / gallery'}</span>
                <input type="file" accept="image/*" onChange={handleCustomImageUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-bold text-xs uppercase tracking-wide transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-7 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Certify &amp; Dispatch Report</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
