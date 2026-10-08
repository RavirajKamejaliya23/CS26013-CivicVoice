import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Loader2, AlertTriangle, ZoomIn, ZoomOut, Filter, Layers } from 'lucide-react';
import { STATUS_CONFIG, CATEGORIES } from '../data/mockIssues';

// Leaflet CSS must be loaded once
let leafletLoaded = false;
function ensureLeafletCss() {
  if (leafletLoaded) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
  link.crossOrigin = '';
  document.head.appendChild(link);
  leafletLoaded = true;
}

const STATUS_COLORS = {
  reported: '#f59e0b',
  under_review: '#f97316',
  accepted: '#3b82f6',
  in_progress: '#a855f7',
  completed: '#14b8a6',
  citizen_verified: '#10b981',
  reopened: '#ef4444',
};

const VADODARA_CENTER = [22.3072, 73.1812];

const WARDS_LIST = [
  'All Wards',
  'Ward 1',
  'Ward 2',
  'Ward 3',
  'Ward 4',
  'Ward 5',
  'Ward 6',
  'Ward 7',
  'Ward 8',
  'Ward 9',
  'Ward 10',
  'Ward 11',
];

export default function LeafletMap({ issues = [], onSelectIssue, onOpenReportModal }) {
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);

  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [activeWardFilter, setActiveWardFilter] = useState('All Wards');
  const [nearbyRadius, setNearbyRadius] = useState(null);
  const [nearbyCount, setNearbyCount] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);

  // Filter issues
  const filteredIssues = issues.filter((issue) => {
    if (activeStatusFilter !== 'all' && issue.status !== activeStatusFilter) return false;
    if (activeCategoryFilter !== 'all' && issue.category !== activeCategoryFilter) return false;
    if (activeWardFilter !== 'All Wards') {
      const addr = (issue.address || '').toLowerCase();
      const wardStr = activeWardFilter.toLowerCase();
      if (!addr.includes(wardStr)) return false;
    }
    if (nearbyRadius && userLocation) {
      const dist = haversineDistance(
        userLocation.lat,
        userLocation.lng,
        issue.latitude,
        issue.longitude
      );
      return dist <= nearbyRadius;
    }
    return true;
  });

  // Haversine distance in metres
  function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // Initialize Leaflet map
  useEffect(() => {
    ensureLeafletCss();

    import('leaflet')
      .then((leafletModule) => {
        const L = leafletModule.default;
        leafletRef.current = L;

        if (!mapRef.current || mapInstanceRef.current) return;

        // Default center — Vadodara, Gujarat (VMC municipal center)
        const map = L.map(mapRef.current, {
          center: VADODARA_CENTER,
          zoom: 13,
          zoomControl: false,
          attributionControl: true,
        });

        // OpenStreetMap tiles with attribution
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> · Vadodara Municipal Corporation GIS',
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;
        setMapLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load Leaflet:', err);
        setMapLoading(false);
      });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update clustered markers when issues or filters change
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Lightweight spatial cell clustering: ~250m cell grid (0.0025 deg)
    const clusterMap = new Map();
    filteredIssues.forEach((issue) => {
      if (!issue.latitude || !issue.longitude) return;
      const cellLat = Math.round(issue.latitude / 0.003) * 0.003;
      const cellLng = Math.round(issue.longitude / 0.003) * 0.003;
      const cellKey = `${cellLat.toFixed(3)},${cellLng.toFixed(3)}`;

      if (!clusterMap.has(cellKey)) {
        clusterMap.set(cellKey, {
          cellLat,
          cellLng,
          issues: [],
        });
      }
      clusterMap.get(cellKey).issues.push(issue);
    });

    // Render cluster or individual markers
    clusterMap.forEach((cluster) => {
      if (cluster.issues.length > 1) {
        // Multi-issue cluster badge (Section 21 requirement)
        const clusterHtml = `
          <div style="
            width: 46px; height: 46px;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            border: 3px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 4px 14px rgba(0,0,0,0.5);
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            cursor: pointer; color: #1c1917; font-family: monospace; font-weight: 900;
            transition: transform 0.2s;
          ">
            <span style="font-size: 14px; font-weight: 900; line-height: 1;">${cluster.issues.length}</span>
            <span style="font-size: 8px; text-transform: uppercase; font-weight: 800; letter-spacing: -0.05em;">issues</span>
          </div>
        `;

        const clusterIcon = L.divIcon({
          html: clusterHtml,
          className: '',
          iconSize: [46, 46],
          iconAnchor: [23, 23],
          popupAnchor: [0, -23],
        });

        // Compute average center of cluster
        const avgLat =
          cluster.issues.reduce((acc, i) => acc + i.latitude, 0) /
          cluster.issues.length;
        const avgLng =
          cluster.issues.reduce((acc, i) => acc + i.longitude, 0) /
          cluster.issues.length;

        const clusterMarker = L.marker([avgLat, avgLng], { icon: clusterIcon })
          .addTo(map)
          .bindPopup(
            `
            <div style="font-family: monospace; font-size: 12px; min-width: 240px; max-width: 280px;">
              <div style="font-weight: bold; color: #d97706; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; border-bottom: 1px solid #e7e5e4; padding-bottom: 4px;">
                📍 ${cluster.issues.length} Complaints in this area
              </div>
              <div style="max-height: 180px; overflow-y: auto; margin-bottom: 8px; space-y: 4px;">
                ${cluster.issues
                  .map(
                    (i) => `
                  <div style="padding: 4px 0; border-bottom: 1px dashed #f5f5f4;">
                    <div style="font-weight: bold; font-size: 11px; color: #1c1917;">${i.id}: ${i.title}</div>
                    <div style="font-size: 10px; color: #78716c;">${i.address} · 👍 ${i.upvotes} supporters</div>
                  </div>
                `
                  )
                  .join('')}
              </div>
              <button
                onclick="window._civicVoiceZoomCluster && window._civicVoiceZoomCluster(${avgLat}, ${avgLng})"
                style="
                  width: 100%; padding: 6px 12px;
                  background: #f59e0b; color: #1c1917;
                  border: none; border-radius: 8px;
                  font-family: monospace; font-weight: bold;
                  font-size: 11px; text-transform: uppercase;
                  cursor: pointer; letter-spacing: 0.05em;
                "
              >
                Zoom Into Cluster 🔍
              </button>
            </div>
          `,
            { maxWidth: 300 }
          );

        clusterMarker.on('click', () => {
          map.setView([avgLat, avgLng], Math.min(map.getZoom() + 2, 17));
        });

        markersRef.current.push(clusterMarker);
      } else {
        // Single issue marker
        const issue = cluster.issues[0];
        const color = STATUS_COLORS[issue.status] || '#f59e0b';
        const statusInfo = STATUS_CONFIG[issue.status] || STATUS_CONFIG.reported;

        const markerHtml = `
          <div style="
            width: 36px; height: 36px;
            background: ${color};
            border: 3px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 3px 10px rgba(0,0,0,0.4);
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
          ">
            <div style="
              transform: rotate(45deg);
              width: 12px; height: 12px;
              background: white;
              border-radius: 50%;
              opacity: 0.95;
            "></div>
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: '',
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36],
        });

        const marker = L.marker([issue.latitude, issue.longitude], { icon })
          .addTo(map)
          .bindPopup(
            `
            <div style="font-family: monospace; font-size: 12px; min-width: 230px;">
              <div style="font-weight: bold; color: ${color}; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">
                ${issue.id} · ${statusInfo.label}
              </div>
              <div style="font-weight: bold; color: #1c1917; font-size: 13px; margin-bottom: 4px; line-height: 1.3;">
                ${issue.title}
              </div>
              <div style="color: #78716c; font-size: 11px; margin-bottom: 4px;">
                📍 ${issue.address}
              </div>
              <div style="color: #57534e; font-size: 11px; margin-bottom: 8px;">
                👥 ${issue.upvotes} citizens supported
              </div>
              <button
                onclick="window._civicVoiceOpenIssue && window._civicVoiceOpenIssue('${issue.id}')"
                style="
                  width: 100%; padding: 6px 12px;
                  background: #f59e0b; color: #1c1917;
                  border: none; border-radius: 8px;
                  font-family: monospace; font-weight: bold;
                  font-size: 11px; text-transform: uppercase;
                  cursor: pointer; letter-spacing: 0.05em;
                "
              >
                Track Complaint Progress →
              </button>
            </div>
          `,
            { maxWidth: 280 }
          );

        marker.on('click', () => setSelectedIssue(issue));
        markersRef.current.push(marker);
      }
    });

    // Update nearby count
    if (nearbyRadius && userLocation) {
      setNearbyCount(filteredIssues.length);
    }

    // Fit bounds if markers exist
    if (filteredIssues.length > 0 && markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      try {
        map.fitBounds(group.getBounds().pad(0.12), { maxZoom: 15 });
      } catch (_) {}
    }
  }, [filteredIssues, leafletRef.current, mapInstanceRef.current]);

  // Global popup handlers
  useEffect(() => {
    window._civicVoiceOpenIssue = (issueId) => {
      onSelectIssue(issueId);
    };
    window._civicVoiceZoomCluster = (lat, lng) => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([lat, lng], 16);
      }
    };
    return () => {
      delete window._civicVoiceOpenIssue;
      delete window._civicVoiceZoomCluster;
    };
  }, [onSelectIssue]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        const map = mapInstanceRef.current;
        const L = leafletRef.current;
        if (!map || !L) return;

        map.setView([latitude, longitude], 15);

        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([latitude, longitude]);
        } else {
          const userIcon = L.divIcon({
            html: `
              <div style="
                width: 20px; height: 20px;
                background: #3b82f6;
                border: 3px solid white;
                border-radius: 50%;
                box-shadow: 0 0 0 6px rgba(59,130,246,0.3);
              "></div>
            `,
            className: '',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon })
            .addTo(map)
            .bindPopup(
              '<div style="font-family:monospace;font-size:12px;font-weight:bold;">📍 Your Location</div>'
            );
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setLocationError('Location permission denied. Defaulting to Vadodara central.');
        } else {
          setLocationError('Could not determine GPS location.');
        }
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  };

  const handleZoom = (dir) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (dir === 'in') map.zoomIn();
    else map.zoomOut();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Controls Bar: Status, Category & Ward Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white/5 border border-stone-800">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter chips */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Statuses' },
              { id: 'reported', label: 'Reported' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'completed', label: 'Completed' },
              { id: 'citizen_verified', label: 'Verified' },
              { id: 'reopened', label: 'Reopened' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveStatusFilter(s.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold whitespace-nowrap transition-all ${
                  activeStatusFilter === s.id
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-white/10 text-stone-300 hover:bg-white/20'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Ward Filter Dropdown */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
            <span className="text-[10px] font-mono text-stone-400 uppercase">Ward:</span>
            <select
              value={activeWardFilter}
              onChange={(e) => setActiveWardFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-700 text-stone-200 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-400"
            >
              {WARDS_LIST.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter Dropdown */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
            <span className="text-[10px] font-mono text-stone-400 uppercase">Dept:</span>
            <select
              value={activeCategoryFilter}
              onChange={(e) => setActiveCategoryFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-700 text-stone-200 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-400"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* GPS Location & Radius */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleGetLocation}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-200 text-xs font-mono font-bold uppercase tracking-wider transition-all"
            title="Locate my position in Vadodara"
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5" />
            )}
            <span>GPS Pin</span>
          </button>

          {userLocation && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-mono text-stone-400">Within:</span>
              {[null, 500, 1000, 2000, 5000].map((r) => (
                <button
                  key={r ?? 'all'}
                  onClick={() => setNearbyRadius(r)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                    nearbyRadius === r
                      ? 'bg-blue-500 text-white font-bold'
                      : 'bg-white/10 text-stone-300 hover:bg-white/20'
                  }`}
                >
                  {r === null ? 'All' : r >= 1000 ? `${r / 1000}km` : `${r}m`}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {locationError && (
        <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-200 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>{locationError}</span>
        </div>
      )}

      {/* Map Container */}
      <div
        className="relative rounded-3xl overflow-hidden border border-stone-800 shadow-2xl"
        style={{ height: '520px' }}
      >
        {mapLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-stone-900">
            <div className="flex flex-col items-center gap-3 text-stone-400">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
              <span className="text-xs font-mono">Loading Vadodara OpenStreetMap...</span>
            </div>
          </div>
        )}

        {/* Map canvas */}
        <div ref={mapRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }} />

        {/* Map Header Overlay */}
        <div className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-xl bg-stone-950/80 backdrop-blur-md border border-stone-700 text-[11px] font-mono text-stone-300 pointer-events-none shadow-lg">
          <span className="font-bold text-amber-400">VADODARA MUNICIPAL GIS RADAR</span>
          <span className="mx-1.5 opacity-40">|</span>
          <span>{filteredIssues.length} active complaints</span>
        </div>

        {/* Custom zoom buttons */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
          <button
            onClick={() => handleZoom('in')}
            className="w-8 h-8 rounded-xl bg-stone-900/90 backdrop-blur-sm border border-stone-700 text-white flex items-center justify-center hover:bg-stone-800 transition-colors shadow-lg"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom('out')}
            className="w-8 h-8 rounded-xl bg-stone-900/90 backdrop-blur-sm border border-stone-700 text-white flex items-center justify-center hover:bg-stone-800 transition-colors shadow-lg"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
