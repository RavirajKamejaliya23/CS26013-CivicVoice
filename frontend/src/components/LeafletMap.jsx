import React, { useEffect, useRef, useState } from 'react';
import {
  MapPin, Navigation, Loader2, AlertTriangle, ZoomIn, ZoomOut,
  Filter, Layers, ArrowUpRight, X, ExternalLink
} from 'lucide-react';
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

export const STATUS_COLORS = {
  reported: '#f59e0b',
  under_review: '#f97316',
  accepted: '#3b82f6',
  in_progress: '#a855f7',
  completed: '#14b8a6',
  citizen_verified: '#10b981',
  reopened: '#ef4444',
};

const DEFAULT_INDIA_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

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

/**
 * Escape HTML to prevent broken formatting and XSS in dynamically injected Leaflet popup HTML.
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Safely parse coordinate numbers from various formats (string, number, null).
 */
export function parseCoordinate(val) {
  if (val === null || val === undefined || val === '') return null;
  const num = typeof val === 'number' ? val : parseFloat(val);
  return isNaN(num) ? null : num;
}

/**
 * Verify coordinates are valid latitude and longitude on Earth, excluding (0,0).
 */
export function isValidCoordinate(lat, lng) {
  if (lat === null || lng === null) return false;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
  if (lat === 0 && lng === 0) return false;
  return true;
}

/**
 * Generate rich popup card HTML for an individual civic issue marker.
 */
export function createIssuePopupHtml(issue, isSelected = false) {
  const safeId = escapeHtml(String(issue.id ?? ''));
  const safeTitle = escapeHtml(String(issue.title ?? 'Untitled Report'));
  const rawDesc = String(issue.description ?? '').trim();
  const safeDesc = escapeHtml(rawDesc.length > 130 ? rawDesc.slice(0, 127) + '...' : rawDesc);

  // Category determination including custom category for Other
  let categoryLabel = 'General Civic';
  if (issue.category === 'other') {
    categoryLabel = String(issue.customCategory || issue.custom_category || issue.categoryName || 'Other');
  } else {
    const catObj = CATEGORIES.find((c) => c.id === issue.category);
    categoryLabel = catObj?.label || issue.categoryName || String(issue.category || 'General Civic').replace(/_/g, ' ');
  }
  const safeCategory = escapeHtml(categoryLabel);

  // Status badge config
  const statusKey = issue.status || 'reported';
  const statusConfig = STATUS_CONFIG[statusKey] || { label: statusKey.replace(/_/g, ' ') };
  const statusColor = STATUS_COLORS[statusKey] || '#f59e0b';
  const safeStatus = escapeHtml(statusConfig.label);

  // Location display
  const locationParts = [issue.address, issue.city, issue.state].filter(Boolean);
  const locationStr = issue.address || locationParts.join(', ') || issue.municipalityName || 'Location mapped';
  const safeLocation = escapeHtml(locationStr);

  // Submission date
  let dateStr = issue.reportedAt || null;
  if (!dateStr && (issue.createdAt || issue.created_at)) {
    const d = new Date(issue.createdAt || issue.created_at);
    if (!isNaN(d.getTime())) {
      dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  }
  const safeDate = escapeHtml(dateStr || 'Recent');

  // Supporter count
  const upvotesCount = Number(issue.upvotes ?? issue.supporters_count ?? issue.supportersCount ?? 0);
  const safeUpvotes = isNaN(upvotesCount) ? 0 : upvotesCount;

  // Reporter Name with privacy rules (hide if anonymous)
  let safeReporter = null;
  const isAnonymous = Boolean(issue.isAnonymous || issue.anonymous || issue.reportedBy?.isAnonymous);
  if (!isAnonymous) {
    const rawReporterName = issue.reportedBy?.name || issue.reporterName || null;
    if (rawReporterName && String(rawReporterName).trim() !== '') {
      safeReporter = escapeHtml(String(rawReporterName).trim());
    }
  }

  // Demo status
  const isDemo = Boolean(
    issue.isDemo ||
    issue.is_demo ||
    String(issue.id).startsWith('DEMO-') ||
    String(issue.id).startsWith('demo-')
  );

  // Thumbnail with broken image fallback
  const rawImage = issue.imageUrl || issue.image_url;
  const hasImage = typeof rawImage === 'string' && rawImage.trim().length > 0;
  const safeImage = hasImage ? escapeHtml(rawImage.trim()) : null;

  return `
    <div class="civic-map-popup" style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 12px;
      color: #1c1917;
      min-width: 250px;
      max-width: 310px;
      padding: 2px;
      box-sizing: border-box;
    ">
      ${safeImage ? `
        <div style="
          width: 100%;
          height: 110px;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 8px;
          background: #f5f5f4;
          position: relative;
        ">
          <img
            src="${safeImage}"
            alt="${safeTitle}"
            style="width: 100%; height: 100%; object-fit: cover; display: block;"
            onerror="this.parentElement.style.display='none';"
            loading="lazy"
          />
        </div>
      ` : ''}

      <!-- Top info bar -->
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 6px;">
        <div style="display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
          <span style="font-family: monospace; font-weight: 700; font-size: 11px; color: #44403c;">#${safeId}</span>
          ${isDemo ? `
            <span style="
              font-family: monospace;
              font-size: 9px;
              font-weight: 800;
              text-transform: uppercase;
              padding: 1px 5px;
              border-radius: 4px;
              background: #fef3c7;
              color: #92400e;
              border: 1px solid #fcd34d;
            ">Demo Report</span>
          ` : ''}
        </div>
        <span style="
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          padding: 2px 7px;
          border-radius: 12px;
          background: ${statusColor}18;
          color: ${statusColor};
          border: 1px solid ${statusColor}40;
          white-space: nowrap;
        ">
          ${safeStatus}
        </span>
      </div>

      <!-- Category tag -->
      <div style="
        display: inline-block;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: #78716c;
        margin-bottom: 4px;
      ">
        📂 ${safeCategory}
      </div>

      <!-- Report Title -->
      <div style="
        font-size: 13px;
        font-weight: 700;
        line-height: 1.35;
        color: #0c0a09;
        margin-bottom: 5px;
      ">
        ${safeTitle}
      </div>

      <!-- Short Description -->
      ${safeDesc ? `
        <div style="
          font-size: 11px;
          line-height: 1.4;
          color: #57534e;
          margin-bottom: 8px;
        ">
          ${safeDesc}
        </div>
      ` : ''}

      <!-- Metadata summary card -->
      <div style="
        background: #f5f5f4;
        border-radius: 8px;
        padding: 6px 8px;
        margin-bottom: 10px;
        display: flex;
        flex-direction: column;
        gap: 3px;
        font-size: 10px;
        color: #44403c;
      ">
        <div style="display: flex; align-items: flex-start; gap: 4px;">
          <span>📍</span>
          <span style="font-weight: 500; word-break: break-word;">${safeLocation}</span>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-top: 2px; padding-top: 3px; border-top: 1px solid #e7e5e4;">
          <div style="display: flex; align-items: center; gap: 3px;">
            <span>📅</span>
            <span>${safeDate}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 3px; font-weight: 600; color: #b45309;">
            <span>👍</span>
            <span>${safeUpvotes} supporters</span>
          </div>
        </div>
        ${safeReporter ? `
          <div style="display: flex; align-items: center; gap: 4px; color: #78716c; margin-top: 2px;">
            <span>👤</span>
            <span>Reported by <strong>${safeReporter}</strong></span>
          </div>
        ` : ''}
        ${issue.mergedCount > 0 ? `
          <div style="display: flex; align-items: center; gap: 4px; color: #b45309; font-weight: 600; margin-top: 3px; padding-top: 3px; border-top: 1px dashed #e7e5e4;">
            <span>📑</span>
            <span>${issue.mergedCount} related report${issue.mergedCount !== 1 ? 's' : ''} merged</span>
          </div>
        ` : ''}
      </div>

      <!-- Primary Action: View Report Button -->
      <button
        type="button"
        onclick="window._civicVoiceOpenIssue && window._civicVoiceOpenIssue('${safeId}')"
        style="
          width: 100%;
          padding: 8px 12px;
          background: #d97706;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-family: inherit;
          font-weight: 700;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 2px 6px rgba(217, 119, 6, 0.35);
          transition: background 0.15s, transform 0.1s;
        "
        onmouseover="this.style.background='#b45309';"
        onmouseout="this.style.background='#d97706';"
        onmousedown="this.style.transform='scale(0.98)';"
        onmouseup="this.style.transform='scale(1)';"
      >
        <span>View Full Report</span>
        <span>→</span>
      </button>
    </div>
  `;
}

/**
 * Generate rich popup card HTML for a cluster marker listing each complaint in the sector.
 */
export function createClusterPopupHtml(cluster, avgLat, avgLng) {
  const count = cluster.issues.length;
  const itemsHtml = cluster.issues
    .map((issue) => {
      const safeId = escapeHtml(String(issue.id ?? ''));
      const safeTitle = escapeHtml(String(issue.title ?? 'Untitled Report'));
      const statusKey = issue.status || 'reported';
      const statusConfig = STATUS_CONFIG[statusKey] || { label: statusKey };
      const statusColor = STATUS_COLORS[statusKey] || '#f59e0b';
      const safeStatus = escapeHtml(statusConfig.label);
      let categoryLabel = 'General';
      if (issue.category === 'other') {
        categoryLabel = String(issue.customCategory || issue.custom_category || 'Other');
      } else {
        const catObj = CATEGORIES.find((c) => c.id === issue.category);
        categoryLabel = catObj?.label || issue.category || 'General';
      }
      const safeCategory = escapeHtml(categoryLabel);
      const isDemo = Boolean(
        issue.isDemo ||
        issue.is_demo ||
        String(issue.id).startsWith('DEMO-') ||
        String(issue.id).startsWith('demo-')
      );

      return `
        <div style="
          padding: 8px 6px;
          border-bottom: 1px solid #f0eeee;
          display: flex;
          flex-direction: column;
          gap: 4px;
        ">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px;">
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="font-family: monospace; font-weight: 700; font-size: 10px; color: #44403c;">#${safeId}</span>
              ${isDemo ? '<span style="font-size: 8px; font-weight: 800; background: #fef3c7; color: #92400e; padding: 0 4px; border-radius: 3px;">Demo</span>' : ''}
              <span style="font-size: 9px; color: #78716c;">(${safeCategory})</span>
            </div>
            <span style="
              font-size: 9px;
              font-weight: 700;
              text-transform: uppercase;
              padding: 1px 5px;
              border-radius: 8px;
              background: ${statusColor}18;
              color: ${statusColor};
              border: 1px solid ${statusColor}30;
            ">${safeStatus}</span>
          </div>
          <div style="font-weight: 600; font-size: 11px; color: #1c1917; line-height: 1.3;">
            ${safeTitle}
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; margin-top: 2px;">
            <span style="font-size: 10px; color: #78716c;">👍 ${issue.upvotes || 0} supporters</span>
            <button
              type="button"
              onclick="window._civicVoiceOpenIssue && window._civicVoiceOpenIssue('${safeId}')"
              style="
                padding: 4px 8px;
                background: #d97706;
                color: #ffffff;
                border: none;
                border-radius: 6px;
                font-size: 10px;
                font-weight: 700;
                cursor: pointer;
                text-transform: uppercase;
              "
            >
              View Report →
            </button>
          </div>
        </div>
      `;
    })
    .join('');

  return `
    <div class="civic-map-cluster-popup" style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 12px;
      color: #1c1917;
      min-width: 260px;
      max-width: 310px;
      padding: 2px;
      box-sizing: border-box;
    ">
      <div style="
        font-weight: 800;
        color: #b45309;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 6px;
        border-bottom: 2px solid #fde68a;
        padding-bottom: 5px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      ">
        <span>📍 ${count} Complaints in this Sector</span>
      </div>
      <div style="max-height: 200px; overflow-y: auto; margin-bottom: 8px;">
        ${itemsHtml}
      </div>
      <button
        type="button"
        onclick="window._civicVoiceZoomCluster && window._civicVoiceZoomCluster(${avgLat}, ${avgLng})"
        style="
          width: 100%;
          padding: 7px 10px;
          background: #f59e0b;
          color: #1c1917;
          border: none;
          border-radius: 8px;
          font-family: monospace;
          font-weight: 800;
          font-size: 11px;
          text-transform: uppercase;
          cursor: pointer;
          letter-spacing: 0.04em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        "
      >
        <span>Zoom Into Sector</span>
        <span>🔍</span>
      </button>
    </div>
  `;
}

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
  const [currentZoom, setCurrentZoom] = useState(DEFAULT_ZOOM);
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
      const lat = parseCoordinate(issue.latitude);
      const lng = parseCoordinate(issue.longitude);
      if (lat === null || lng === null) return false;
      const dist = haversineDistance(
        userLocation.lat,
        userLocation.lng,
        lat,
        lng
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

        // Determine initial center and zoom: Centroid of issues if valid, else India-wide
        const firstWithCoords = issues.find((i) => {
          const lat = parseCoordinate(i.latitude);
          const lng = parseCoordinate(i.longitude);
          return isValidCoordinate(lat, lng);
        });

        const initialCenter = firstWithCoords
          ? [Number(firstWithCoords.latitude), Number(firstWithCoords.longitude)]
          : DEFAULT_INDIA_CENTER;
        const initialZoom = firstWithCoords ? 13 : DEFAULT_ZOOM;

        const map = L.map(mapRef.current, {
          center: initialCenter,
          zoom: initialZoom,
          zoomControl: false,
          attributionControl: true,
        });

        // OpenStreetMap tiles with attribution
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> · CivicVoice GIS Radar',
          maxZoom: 19,
        }).addTo(map);

        map.on('zoomend', () => {
          setCurrentZoom(map.getZoom());
        });

        mapInstanceRef.current = map;
        setCurrentZoom(initialZoom);
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

  // Update clustered markers when issues, filters, or zoom level change
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Filter to issues with valid, parseable coordinates
    const validIssues = filteredIssues.filter((issue) => {
      const lat = parseCoordinate(issue.latitude);
      const lng = parseCoordinate(issue.longitude);
      return isValidCoordinate(lat, lng);
    });

    // Zoom-adaptive spatial cell clustering
    const zoom = map.getZoom ? map.getZoom() : currentZoom;
    const step = zoom >= 16 ? 0.0002 : zoom >= 14 ? 0.001 : zoom >= 11 ? 0.003 : 0.008;

    const clusterMap = new Map();
    validIssues.forEach((issue) => {
      const lat = parseCoordinate(issue.latitude);
      const lng = parseCoordinate(issue.longitude);
      const cellLat = Math.round(lat / step) * step;
      const cellLng = Math.round(lng / step) * step;
      const cellKey = `${cellLat.toFixed(4)},${cellLng.toFixed(4)}`;

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
        // Multi-issue cluster badge
        const count = cluster.issues.length;
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
            <span style="font-size: 14px; font-weight: 900; line-height: 1;">${count}</span>
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
          cluster.issues.reduce((acc, i) => acc + parseCoordinate(i.latitude), 0) / count;
        const avgLng =
          cluster.issues.reduce((acc, i) => acc + parseCoordinate(i.longitude), 0) / count;

        const clusterPopupHtml = createClusterPopupHtml(cluster, avgLat, avgLng);

        const clusterMarker = L.marker([avgLat, avgLng], { icon: clusterIcon })
          .addTo(map)
          .bindPopup(clusterPopupHtml, {
            maxWidth: 320,
            minWidth: 260,
            autoPan: true,
            autoPanPadding: [20, 20],
            className: 'civic-report-leaflet-popup',
          });

        clusterMarker.on('click', () => {
          clusterMarker.openPopup();
        });

        markersRef.current.push(clusterMarker);
      } else {
        // Single issue marker
        const issue = cluster.issues[0];
        const lat = parseCoordinate(issue.latitude);
        const lng = parseCoordinate(issue.longitude);
        const color = STATUS_COLORS[issue.status] || '#f59e0b';
        const isSelected = selectedIssue?.id === issue.id;

        const markerHtml = `
          <div class="civic-issue-marker ${isSelected ? 'civic-marker-selected' : ''}" style="
            width: ${isSelected ? '42px' : '36px'};
            height: ${isSelected ? '42px' : '36px'};
            background: ${color};
            border: ${isSelected ? '3px solid #fbbf24' : '3px solid white'};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: ${isSelected ? '0 0 0 4px rgba(245, 158, 11, 0.5), 0 4px 14px rgba(0,0,0,0.6)' : '0 3px 10px rgba(0,0,0,0.4)'};
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            z-index: ${isSelected ? '1000' : '1'};
          ">
            <div style="
              transform: rotate(45deg);
              width: ${isSelected ? '14px' : '12px'};
              height: ${isSelected ? '14px' : '12px'};
              background: white;
              border-radius: 50%;
              opacity: 0.95;
            "></div>
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: '',
          iconSize: isSelected ? [42, 42] : [36, 36],
          iconAnchor: isSelected ? [21, 42] : [18, 36],
          popupAnchor: isSelected ? [0, -42] : [0, -36],
        });

        const popupHtml = createIssuePopupHtml(issue, isSelected);

        const marker = L.marker([lat, lng], { icon })
          .addTo(map)
          .bindPopup(popupHtml, {
            maxWidth: 320,
            minWidth: 260,
            autoPan: true,
            autoPanPadding: [20, 20],
            className: 'civic-report-leaflet-popup',
          });

        marker.on('click', () => {
          setSelectedIssue(issue);
          marker.openPopup();
        });

        marker.on('popupopen', () => {
          setSelectedIssue(issue);
        });

        markersRef.current.push(marker);
      }
    });

    // Update nearby count
    if (nearbyRadius && userLocation) {
      setNearbyCount(validIssues.length);
    }

    // Fit bounds if markers exist and not zoomed in yet
    if (validIssues.length > 0 && markersRef.current.length > 0 && map.getZoom() <= DEFAULT_ZOOM) {
      const group = L.featureGroup(markersRef.current);
      try {
        map.fitBounds(group.getBounds().pad(0.12), { maxZoom: 15 });
      } catch (_) { }
    }
  }, [filteredIssues, currentZoom]);

  // Global popup button handlers
  useEffect(() => {
    window._civicVoiceOpenIssue = (issueId) => {
      if (!issueId) return;
      if (typeof onSelectIssue === 'function') {
        onSelectIssue(issueId);
      }
    };
    window._civicVoiceZoomCluster = (lat, lng) => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView(
          [lat, lng],
          Math.min(mapInstanceRef.current.getZoom() + 2, 17)
        );
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
          setLocationError('Location permission was not granted. Pan or click any marker to inspect reports.');
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
            title="Locate my position on map"
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
        style={{ height: '540px' }}
      >
        {mapLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-stone-900">
            <div className="flex flex-col items-center gap-3 text-stone-400">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
              <span className="text-xs font-mono">Loading Civic GIS Radar...</span>
            </div>
          </div>
        )}

        {/* Map canvas */}
        <div ref={mapRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }} />

        {/* Map Header Overlay */}
        <div className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-xl bg-stone-950/80 backdrop-blur-md border border-stone-700 text-[11px] font-mono text-stone-300 pointer-events-none shadow-lg">
          <span className="font-bold text-amber-400">CIVIC ISSUE GEOGRAPHIC RADAR</span>
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

        {/* Selected Pin Quick Dossier Card (Bottom Floating Overlay) */}
        {selectedIssue && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:max-w-md z-10 p-3.5 rounded-2xl bg-stone-900/95 backdrop-blur-md border border-stone-700 shadow-2xl text-white font-mono animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-bold text-amber-400">#{selectedIssue.id}</span>
                  {(selectedIssue.isDemo || selectedIssue.is_demo) && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Demo
                    </span>
                  )}
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                    {selectedIssue.category === 'other'
                      ? (selectedIssue.customCategory || selectedIssue.custom_category || 'Other')
                      : (CATEGORIES.find((c) => c.id === selectedIssue.category)?.label || selectedIssue.category)}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    👍 {selectedIssue.upvotes || 0}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-stone-100 truncate mb-1">
                  {selectedIssue.title}
                </h4>
                <p className="text-[10px] text-stone-400 truncate">
                  📍 {selectedIssue.address || selectedIssue.city || 'Pinned on map'}
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof onSelectIssue === 'function') {
                      onSelectIssue(selectedIssue.id);
                    }
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold uppercase transition-all shadow-md active:scale-95"
                >
                  <span>View Report</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIssue(null)}
                  className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
                  title="Dismiss pin preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
