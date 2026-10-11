import React, { useState, useEffect, useRef } from 'react';
import { MapPin, X, Check, Loader2, Navigation, AlertCircle } from 'lucide-react';

let leafletCssLoaded = false;
function ensureLeafletCss() {
  if (leafletCssLoaded) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
  link.crossOrigin = '';
  document.head.appendChild(link);
  leafletCssLoaded = true;
}

export default function MapLocationPickerModal({
  isOpen,
  onClose,
  initialCoords = null,
  initialAddress = '',
  onConfirmLocation,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const leafletRef = useRef(null);

  const [selectedLat, setSelectedLat] = useState(initialCoords?.lat || null);
  const [selectedLng, setSelectedLng] = useState(initialCoords?.lng || null);
  const [resolvedAddress, setResolvedAddress] = useState(initialAddress || '');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState('');
  const [mapReady, setMapReady] = useState(false);

  // Reverse geocode helper using OpenStreetMap Nominatim
  const reverseGeocode = async (lat, lng) => {
    setIsGeocoding(true);
    setGeocodingError('');
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }

      const data = await response.json();
      if (data && data.display_name) {
        const addr = data.address || {};
        const road = addr.road || addr.pedestrian || addr.suburb || '';
        const locality = addr.neighbourhood || addr.suburb || addr.city_district || '';
        const city = addr.city || addr.town || addr.village || addr.county || '';
        const state = addr.state || '';
        const parts = [road, locality, city, state].filter(Boolean);
        const formatted = parts.length > 0 ? parts.join(', ') : data.display_name;
        setResolvedAddress(formatted);
      } else {
        setResolvedAddress(`Pin at (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
      }
    } catch (err) {
      console.warn('[REVERSE GEOCODE] Could not resolve address:', err.message);
      setGeocodingError('Could not automatically resolve street address. Coordinates recorded successfully.');
      setResolvedAddress(`Pinned Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Move or create the Leaflet marker
  const updateMarkerPosition = (lat, lng, L) => {
    setSelectedLat(lat);
    setSelectedLng(lng);

    const pinIcon = L.divIcon({
      className: 'custom-pin-marker',
      html: `
        <div style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:#8A6418;color:white;box-shadow:0 3px 8px rgba(0,0,0,0.35);border:2px solid white;cursor:pointer;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
    });

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else if (mapInstanceRef.current) {
      const newMarker = L.marker([lat, lng], {
        icon: pinIcon,
        draggable: true,
      }).addTo(mapInstanceRef.current);

      newMarker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        setSelectedLat(pos.lat);
        setSelectedLng(pos.lng);
        reverseGeocode(pos.lat, pos.lng);
      });

      markerRef.current = newMarker;
    }

    reverseGeocode(lat, lng);
  };

  useEffect(() => {
    if (!isOpen) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
      setMapReady(false);
      return;
    }

    ensureLeafletCss();

    import('leaflet').then((leafletModule) => {
      const L = leafletModule.default;
      leafletRef.current = L;

      if (!mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const initialCenter = initialCoords?.lat && initialCoords?.lng
        ? [initialCoords.lat, initialCoords.lng]
        : [20.5937, 78.9629]; // India geographic center

      const initialZoom = initialCoords?.lat && initialCoords?.lng ? 15 : 5;

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapReady(true);

      // If initial coordinates exist, place initial marker
      if (initialCoords?.lat && initialCoords?.lng) {
        updateMarkerPosition(initialCoords.lat, initialCoords.lng, L);
      }

      // Click or tap to drop / move pin
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        updateMarkerPosition(lat, lng, L);
      });

      // Invalidate size once rendered
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedLat || !selectedLng) return;
    onConfirmLocation({
      latitude: selectedLat,
      longitude: selectedLng,
      address: resolvedAddress || `Coordinates (${selectedLat.toFixed(4)}, ${selectedLng.toFixed(4)})`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-[var(--theme-card-bg,#FFFDF5)] border border-[var(--theme-card-border,#E7DDC5)] shadow-2xl z-10 flex flex-col overflow-hidden text-[var(--theme-text-primary,#29261F)] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--theme-card-border,#E7DDC5)] flex items-center justify-between bg-[var(--theme-surface-secondary,#FDF7E7)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#8A6418]/15 border border-[#8A6418]/30 flex items-center justify-center text-[#8A6418]">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[var(--theme-heading,#29261F)]">
                Choose Location on Map
              </h3>
              <p className="text-[11px] text-[var(--theme-text-secondary,#625D52)]">
                Click or tap the map to drop a pin. Drag the marker to adjust exact coordinates.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-black/5 text-[var(--theme-text-secondary,#625D52)] hover:text-[var(--theme-text-primary,#29261F)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Container */}
        <div className="relative w-full h-80 sm:h-96 bg-stone-100 dark:bg-stone-800">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Quick instructions badge */}
          <div className="absolute top-3 right-3 z-[400] px-3 py-1.5 rounded-xl bg-white/90 dark:bg-stone-900/90 backdrop-blur-xs border border-[var(--theme-card-border,#E7DDC5)] text-xs text-[var(--theme-text-secondary,#625D52)] shadow-xs pointer-events-none">
            {selectedLat && selectedLng ? (
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Pin Placed · Drag to Adjust
              </span>
            ) : (
              <span>Click anywhere on the map to drop pin</span>
            )}
          </div>
        </div>

        {/* Selected Coordinates & Resolved Address Bar */}
        <div className="p-4 sm:p-5 border-t border-[var(--theme-card-border,#E7DDC5)] bg-[var(--theme-card-bg,#FFFDF5)] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono uppercase font-bold text-[10px] tracking-wider text-[var(--theme-text-secondary,#625D52)]">
                GPS Coordinates:
              </span>
              {selectedLat && selectedLng ? (
                <span className="font-mono font-bold text-[#8A6418] bg-[var(--theme-pill-bg,#FDF1CE)] px-2.5 py-0.5 rounded-md border border-[var(--theme-card-border,#E7DDC5)]">
                  {selectedLat.toFixed(5)}° N, {selectedLng.toFixed(5)}° E
                </span>
              ) : (
                <span className="text-[var(--theme-text-muted,#787367)] italic">
                  No pin placed yet
                </span>
              )}
            </div>

            {isGeocoding && (
              <div className="flex items-center gap-1.5 text-xs text-[#8A6418] font-mono">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Resolving address...</span>
              </div>
            )}
          </div>

          {/* Resolved Address Input / Preview */}
          {selectedLat && selectedLng && (
            <div className="space-y-1">
              <label className="block text-[10px] font-mono uppercase font-bold text-[var(--theme-text-secondary,#625D52)]">
                Selected Address (Editable)
              </label>
              <input
                type="text"
                value={resolvedAddress}
                onChange={(e) => setResolvedAddress(e.target.value)}
                placeholder="Locality, Landmark, City, State..."
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-white border border-[var(--theme-card-border,#E7DDC5)] text-[var(--theme-text-primary,#29261F)] font-medium focus:outline-none focus:ring-2 focus:ring-[#8A6418]"
              />
              {geocodingError && (
                <p className="text-[11px] text-amber-700 flex items-center gap-1 pt-0.5">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>{geocodingError}</span>
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[var(--theme-card-border,#E7DDC5)] hover:bg-[var(--theme-surface-secondary,#FDF7E7)] text-xs font-semibold text-[var(--theme-text-primary,#29261F)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedLat || !selectedLng}
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl bg-[#8A6418] hover:bg-[#735212] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Confirm Location</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
