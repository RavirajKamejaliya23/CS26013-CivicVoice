import React, { useState } from 'react';
import { X, Send, MapPin, Camera, AlertTriangle, Check, Upload, Sparkles, Navigation } from 'lucide-react';
import { CATEGORIES } from '../data/mockIssues';
import confetti from 'canvas-confetti';

const SAMPLE_EVIDENCE_PHOTOS = [
  { label: 'Pothole / Road Damage', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80' },
  { label: 'Broken Streetlight', url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80' },
  { label: 'Blocked Drain / Flood', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?w=800&auto=format&fit=crop&q=80' },
  { label: 'Overflowing Garbage Dumpster', url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80' }
];

export default function IssueReportModal({ onClose, onSubmitIssue, existingIssues }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('roads_potholes');
  const [address, setAddress] = useState('742 Evergreen Terrace, Ward 3');
  const [selectedImage, setSelectedImage] = useState(SAMPLE_EVIDENCE_PHOTOS[0].url);
  const [customImageFile, setCustomImageFile] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [step, setStep] = useState(1);

  // Duplicate detection check
  const duplicateCandidate = existingIssues.find(i => 
    i.category === category && (
      i.title.toLowerCase().includes(title.toLowerCase().slice(0, 5)) ||
      category === 'roads_potholes'
    )
  );

  const handleSimulateGPS = () => {
    setIsLocating(true);
    setTimeout(() => {
      setAddress('318 Valencia St, Mission District, Ward 9 (GPS Locked)');
      setIsLocating(false);
    }, 600);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    // Fire confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      // Ignore if confetti blocked
    }

    const newIssue = {
      id: `CV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: title.trim(),
      description: description.trim(),
      category,
      status: 'reported',
      address: address.trim(),
      latitude: 37.775 + (Math.random() - 0.5) * 0.02,
      longitude: -122.42 + (Math.random() - 0.5) * 0.02,
      reportedBy: {
        name: 'You (Citizen Steward)',
        badge: 'Verified Citizen',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
      },
      reportedAt: 'Just now',
      imageUrl: selectedImage,
      upvotes: 1,
      hasUpvoted: true,
      timeline: [
        {
          status: 'reported',
          title: 'Citizen Dispatch Created',
          date: 'Just now',
          author: 'You',
          role: 'Citizen Reporter',
          note: 'Ticket queued for automated municipal dispatch & ward triage.'
        }
      ]
    };

    onSubmitIssue(newIssue);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Background backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-stone-900 border border-stone-800/20 dark:border-stone-700 shadow-2xl z-10 flex flex-col">
        
        {/* Airmail Border Accent */}
        <div className="h-2 w-full airmail-border" />

        {/* Modal Header */}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Category Chips */}
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
                    onClick={() => setCategory(cat.id)}
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

          {/* Duplicate Detection Alert Banner */}
          {duplicateCandidate && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-bold text-amber-900 dark:text-amber-200">
                  Potential Duplicate Issue Detected in this Ward
                </div>
                <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                  "{duplicateCandidate.title}" was already reported nearby ({duplicateCandidate.id}). Co-signing existing reports accelerates municipal squad prioritization!
                </p>
              </div>
            </div>
          )}

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
                onChange={(e) => setTitle(e.target.value)}
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
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe exact location markers, severity, how long it has existed, and safety risks..."
                className="w-full px-4 py-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>
          </div>

          {/* Location Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400 font-bold">
                4. Location & Ward
              </label>
              <button
                type="button"
                onClick={handleSimulateGPS}
                className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Acquiring GPS...' : 'Use My GPS Location'}</span>
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Photographic Evidence Dropzone */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-2 font-bold">
              5. Photographic Evidence
            </label>

            {/* Quick Sample Photos Picker or Custom Upload */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SAMPLE_EVIDENCE_PHOTOS.map((sample, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => {
                      setSelectedImage(sample.url);
                      setCustomImageFile(null);
                    }}
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
                  </button>
                ))}
              </div>

              {/* Upload Own File */}
              <label className="flex items-center justify-center gap-2 p-3 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 hover:border-amber-500 dark:hover:border-amber-500 cursor-pointer text-xs text-stone-600 dark:text-stone-400 bg-stone-50/50 dark:bg-stone-800/30 transition-colors">
                <Upload className="w-4 h-4 text-stone-400" />
                <span>Or upload file from camera / gallery</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Submit Action */}
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
              className="px-7 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Certify & Dispatch Report</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
