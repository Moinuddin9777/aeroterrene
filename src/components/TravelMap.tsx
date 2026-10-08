import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { animate } from 'animejs';
import {
  Maximize2,
  Plane,
  Car,
  Edit3,
  X,
  Globe,
  Map as MapIcon,
  RotateCw,
  Pause,
} from 'lucide-react';
import { Trip } from '../types/trip';
import { getGeodesicArcPoints } from '../data/locations';
import { Globe3D } from './Globe3D';

interface TravelMapProps {
  trips: Trip[];
  selectedTripId: string | null;
  onSelectTrip: (id: string | null) => void;
  onEditTrip: (trip: Trip) => void;
  darkMode: boolean;
}

interface CityNode {
  key: string;
  code: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  visitCount: number;
  trips: Trip[];
}

const CARTO_API_KEY = import.meta.env.VITE_CARTO_API_KEY || '';

type MapTileStyle = 'atlas' | 'carto' | 'osm';
type ViewportDimension = '3d' | '2d';

export const TravelMap: React.FC<TravelMapProps> = ({
  trips,
  selectedTripId,
  onSelectTrip,
  onEditTrip,
  darkMode,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const inspectorCardRef = useRef<HTMLDivElement | null>(null);

  const [dimension, setDimension] = useState<ViewportDimension>('3d');
  const [autoRotateGlobe, setAutoRotateGlobe] = useState<boolean>(true);
  const [mapModeFilter, setMapModeFilter] = useState<'all' | 'flight' | 'roadtrip'>('all');
  const [tileStyle, setTileStyle] = useState<MapTileStyle>('atlas');

  const visibleTrips = useMemo(() => {
    if (mapModeFilter === 'all') return trips;
    return trips.filter((t) => t.tripType === mapModeFilter);
  }, [trips, mapModeFilter]);

  const selectedTrip = useMemo(
    () => trips.find((t) => t.id === selectedTripId) || null,
    [trips, selectedTripId]
  );

  // Aggregate unique cities covered across visible trips
  const citiesCovered = useMemo<CityNode[]>(() => {
    const map = new Map<string, CityNode>();

    const addNode = (
      code: string,
      city: string,
      country: string,
      lat: number,
      lng: number,
      trip: Trip
    ) => {
      const key = `${code.toUpperCase()}_${city.toLowerCase()}`;
      const existing = map.get(key);
      if (existing) {
        existing.visitCount += 1;
        if (!existing.trips.some((t) => t.id === trip.id)) {
          existing.trips.push(trip);
        }
      } else {
        map.set(key, {
          key,
          code,
          city,
          country,
          lat,
          lng,
          visitCount: 1,
          trips: [trip],
        });
      }
    };

    visibleTrips.forEach((trip) => {
      addNode(trip.originCode, trip.originCity, trip.originCountry, trip.originLat, trip.originLng, trip);
      addNode(trip.destCode, trip.destCity, trip.destCountry, trip.destLat, trip.destLng, trip);
    });

    return Array.from(map.values());
  }, [visibleTrips]);

  // Initialize 2D Leaflet map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [28, 12],
      zoom: 2,
      minZoom: 2,
      maxZoom: 13,
      zoomControl: false,
      worldCopyJump: true,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const tileGroup = L.layerGroup().addTo(map);
    tileLayerGroupRef.current = tileGroup;

    const layerGroup = L.layerGroup().addTo(map);
    routeLayerGroupRef.current = layerGroup;
    mapInstanceRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Re-invalidate Leaflet size when switching from 3D to 2D
  useEffect(() => {
    if (dimension === '2d' && mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 60);
    }
  }, [dimension]);

  // Switch 2D tile layer on dark/light mode or map style toggle
  useEffect(() => {
    const map = mapInstanceRef.current;
    const tileGroup = tileLayerGroupRef.current;
    if (!map || !tileGroup) return;

    tileGroup.clearLayers();

    if (tileStyle === 'carto') {
      const cartoUrl = darkMode
        ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?api_key=${encodeURIComponent(CARTO_API_KEY)}`
        : `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?api_key=${encodeURIComponent(CARTO_API_KEY)}`;

      L.tileLayer(cartoUrl, {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
        referrerPolicy: 'no-referrer',
      }).addTo(tileGroup);
    } else if (tileStyle === 'osm') {
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
        className: darkMode ? 'osm-dark-tiles' : '',
      }).addTo(tileGroup);
    } else {
      const baseUrl = darkMode
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';

      const refUrl = darkMode
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}'
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}';

      L.tileLayer(baseUrl, {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
        maxZoom: 16,
      }).addTo(tileGroup);

      L.tileLayer(refUrl, {
        maxZoom: 16,
        opacity: 0.9,
      }).addTo(tileGroup);
    }
  }, [darkMode, tileStyle]);

  // Draw curved geodesic arcs and city markers in 2D Leaflet view
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = routeLayerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    visibleTrips.forEach((trip) => {
      const isSelected = trip.id === selectedTripId;
      const isFlight = trip.tripType === 'flight';
      const arcPoints = getGeodesicArcPoints(
        trip.originLat,
        trip.originLng,
        trip.destLat,
        trip.destLng,
        trip.tripType
      );

      const primaryColor = isFlight
        ? darkMode
          ? '#38BDF8'
          : '#2563EB'
        : darkMode
        ? '#60A5FA'
        : '#0284C7';

      const glowLine = L.polyline(arcPoints, {
        color: primaryColor,
        weight: isSelected ? 8 : 5,
        opacity: isSelected ? 0.35 : 0.14,
        smoothFactor: 1,
        interactive: false,
      });
      glowLine.addTo(group);

      const mainArc = L.polyline(arcPoints, {
        color: primaryColor,
        weight: isSelected ? 3.5 : 2.2,
        opacity: isSelected ? 1 : 0.82,
        dashArray: isFlight ? (isSelected ? undefined : '6, 6') : '3, 5',
        className: isSelected ? 'geodesic-arc-selected' : 'geodesic-arc-line',
      });

      const memoryPreview = trip.goodMemories
        ? trip.goodMemories.replace(/^•\s*/gm, '').split('\n')[0].slice(0, 75)
        : 'Click to view full memory journal';

      const tooltipHtml = `
        <div class="font-sans p-1 min-w-[210px]">
          <div class="flex items-center justify-between gap-3 text-xs font-semibold tracking-tight mb-1">
            <span>${trip.originCode} → ${trip.destCode}</span>
            <span class="font-mono">${trip.distanceMiles.toLocaleString()} mi</span>
          </div>
          <div class="text-[11px] opacity-90 mb-1">
            ${trip.originCity} to ${trip.destCity} · ${trip.travelDate}
          </div>
          <div class="text-[11px] opacity-75 mb-1.5">
            ${trip.carrierName} · ${trip.equipmentType} (${trip.routeNumber})
          </div>
          <div class="text-[11px] italic opacity-85 border-t border-current/15 pt-1">
            "${memoryPreview}${memoryPreview.length >= 75 ? '…' : ''}"
          </div>
        </div>
      `;

      mainArc.bindTooltip(tooltipHtml, {
        sticky: true,
        direction: 'top',
        offset: [0, -8],
        className: darkMode ? 'leaflet-tooltip-dark' : 'leaflet-tooltip-light',
      });

      mainArc.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectTrip(trip.id);
      });

      mainArc.on('mouseover', () => {
        mainArc.setStyle({ weight: 4, opacity: 1 });
      });

      mainArc.on('mouseout', () => {
        mainArc.setStyle({
          weight: isSelected ? 3.5 : 2.2,
          opacity: isSelected ? 1 : 0.82,
        });
      });

      mainArc.addTo(group);
    });

    citiesCovered.forEach((cityNode) => {
      const isEndpointOfSelected =
        selectedTrip &&
        ((selectedTrip.originCode === cityNode.code && selectedTrip.originCity === cityNode.city) ||
          (selectedTrip.destCode === cityNode.code && selectedTrip.destCity === cityNode.city));

      const hasFlight = cityNode.trips.some((t) => t.tripType === 'flight');
      const dotColorClass = isEndpointOfSelected
        ? 'bg-[#2563EB] dark:bg-[#38BDF8] ring-4 ring-[#38BDF8]/40 scale-110'
        : hasFlight
        ? 'bg-[#2563EB] dark:bg-[#38BDF8] ring-2 ring-white dark:ring-slate-900'
        : 'bg-[#0284C7] dark:bg-[#60A5FA] ring-2 ring-white dark:ring-slate-900';

      const icon = L.divIcon({
        className: 'custom-city-marker',
        html: `
          <div class="group relative flex items-center justify-center cursor-pointer">
            <div class="w-3.5 h-3.5 rounded-full transition-transform duration-150 ${dotColorClass}"></div>
            <span class="ml-1.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold tracking-tight rounded bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200/80 dark:border-slate-700/80 whitespace-nowrap">
              ${cityNode.code}
            </span>
          </div>
        `,
        iconSize: [52, 20],
        iconAnchor: [7, 10],
      });

      const marker = L.marker([cityNode.lat, cityNode.lng], { icon });

      const recentTripsHtml = cityNode.trips
        .slice(0, 3)
        .map(
          (t) =>
            `<div class="text-[11px] opacity-85">• ${t.originCode} → ${t.destCode} (${t.travelDate}) · ${t.carrierName}</div>`
        )
        .join('');

      const cityTooltip = `
        <div class="font-sans p-1 min-w-[190px]">
          <div class="flex items-center justify-between gap-2 text-xs font-semibold mb-0.5">
            <span>${cityNode.city}, ${cityNode.country}</span>
            <span class="font-mono text-[11px] opacity-80">${cityNode.code}</span>
          </div>
          <div class="text-[11px] opacity-75 mb-1.5">
            Logged across ${cityNode.visitCount} ${cityNode.visitCount === 1 ? 'journey' : 'journeys'}
          </div>
          <div class="space-y-0.5 border-t border-current/15 pt-1">
            ${recentTripsHtml}
          </div>
        </div>
      `;

      marker.bindTooltip(cityTooltip, {
        direction: 'top',
        offset: [0, -10],
        className: darkMode ? 'leaflet-tooltip-dark' : 'leaflet-tooltip-light',
      });

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        if (cityNode.trips.length > 0) {
          onSelectTrip(cityNode.trips[0].id);
        }
      });

      marker.addTo(group);
    });
  }, [visibleTrips, citiesCovered, selectedTripId, selectedTrip, darkMode, onSelectTrip]);

  // Smooth camera flight + anime.js entrance when a trip is selected
  useEffect(() => {
    if (selectedTrip && inspectorCardRef.current) {
      animate(inspectorCardRef.current, {
        opacity: [0, 1],
        translateY: [18, 0],
        duration: 240,
        ease: 'outCubic',
      });
    }

    const map = mapInstanceRef.current;
    if (!map || !selectedTrip || dimension !== '2d') return;

    const arcPoints = getGeodesicArcPoints(
      selectedTrip.originLat,
      selectedTrip.originLng,
      selectedTrip.destLat,
      selectedTrip.destLng,
      selectedTrip.tripType
    );
    const bounds = L.latLngBounds(arcPoints);
    map.flyToBounds(bounds, {
      paddingTopLeft: [50, 60],
      paddingBottomRight: [50, 240],
      maxZoom: 6,
      duration: 1.1,
    });
  }, [selectedTrip, dimension]);

  const handleFitAllRoutes = () => {
    onSelectTrip(null);
    const map = mapInstanceRef.current;
    if (!map || dimension !== '2d') return;

    if (visibleTrips.length === 0) {
      map.flyTo([25, 10], 2, { duration: 0.9 });
      return;
    }

    const allPoints: [number, number][] = [];
    visibleTrips.forEach((t) => {
      allPoints.push([t.originLat, t.originLng]);
      allPoints.push([t.destLat, t.destLng]);
    });
    const bounds = L.latLngBounds(allPoints);
    map.flyToBounds(bounds, { padding: [60, 60], maxZoom: 5, duration: 1.0 });
  };

  return (
    <div className="relative w-full h-full min-h-[420px] bg-slate-950 overflow-hidden select-none">
      {/* 1. Interactive 3D WebGL Globe Viewport */}
      {dimension === '3d' && (
        <div className="w-full h-full">
          <Globe3D
            trips={visibleTrips}
            selectedTripId={selectedTripId}
            onSelectTrip={onSelectTrip}
            darkMode={darkMode}
            autoRotate={autoRotateGlobe && !selectedTripId}
          />
        </div>
      )}

      {/* 2. Interactive 2D Leaflet Cartographic Map Viewport */}
      <div
        ref={mapContainerRef}
        className={`w-full h-full z-0 ${dimension === '2d' ? 'block' : 'hidden'}`}
      />

      {/* Top Spatial HUD Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left HUD: Route Layer Filter */}
        <div className="pointer-events-auto flex items-center gap-1 p-1 rounded-xl bg-white/90 dark:bg-[#181D2C]/90 backdrop-blur-xl border border-[#BFC0C0]/80 dark:border-[#4F5D75]/50 shadow-lg">
          <button
            type="button"
            onClick={() => setMapModeFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              mapModeFilter === 'all'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#4F5D75] dark:text-[#BFC0C0] hover:text-[#2D3142] dark:hover:text-[#FAFAFA]'
            }`}
          >
            All Routes ({trips.length})
          </button>
          <button
            type="button"
            onClick={() => setMapModeFilter('flight')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              mapModeFilter === 'flight'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#4F5D75] dark:text-[#BFC0C0] hover:text-[#2D3142] dark:hover:text-[#FAFAFA]'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            <span>Flights ({trips.filter((t) => t.tripType === 'flight').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setMapModeFilter('roadtrip')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              mapModeFilter === 'roadtrip'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#4F5D75] dark:text-[#BFC0C0] hover:text-[#2D3142] dark:hover:text-[#FAFAFA]'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Road ({trips.filter((t) => t.tripType === 'roadtrip').length})</span>
          </button>
        </div>

        {/* Right HUD: 3D Globe vs 2D Atlas Dimension Switcher + Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* 3D / 2D Dimension Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/90 dark:bg-[#181D2C]/90 backdrop-blur-xl border border-[#BFC0C0]/80 dark:border-[#4F5D75]/50 shadow-lg">
            <button
              type="button"
              onClick={() => setDimension('3d')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                dimension === '3d'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-[#4F5D75] dark:text-[#BFC0C0] hover:text-[#2D3142] dark:hover:text-[#FAFAFA]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>3D Globe</span>
            </button>
            <button
              type="button"
              onClick={() => setDimension('2d')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                dimension === '2d'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-[#4F5D75] dark:text-[#BFC0C0] hover:text-[#2D3142] dark:hover:text-[#FAFAFA]'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>2D Atlas</span>
            </button>
          </div>

          {dimension === '3d' ? (
            <button
              type="button"
              onClick={() => setAutoRotateGlobe((r) => !r)}
              title="Toggle 3D orbital spin"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/90 dark:bg-[#181D2C]/90 backdrop-blur-xl border border-[#BFC0C0]/80 dark:border-[#4F5D75]/50 text-xs font-medium text-[#2D3142] dark:text-[#FAFAFA] hover:bg-white dark:hover:bg-[#2D3142] transition-colors shadow-lg whitespace-nowrap"
            >
              {autoRotateGlobe ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#38BDF8]" />
                  <span className="hidden sm:inline">Orbiting</span>
                </>
              ) : (
                <>
                  <RotateCw className="w-3.5 h-3.5 text-[#4F5D75] dark:text-[#BFC0C0]" />
                  <span className="hidden sm:inline">Spin Paused</span>
                </>
              )}
            </button>
          ) : (
            <select
              value={tileStyle}
              onChange={(e) => setTileStyle(e.target.value as MapTileStyle)}
              aria-label="Select map basemap style"
              className="px-3 py-2 rounded-xl bg-white/90 dark:bg-[#181D2C]/90 backdrop-blur-xl border border-[#BFC0C0]/80 dark:border-[#4F5D75]/50 text-xs font-medium text-[#2D3142] dark:text-[#FAFAFA] shadow-lg focus:outline-none focus:border-[#2563EB]"
            >
              <option value="atlas">Atlas Canvas</option>
              <option value="carto">Carto (API Key)</option>
              <option value="osm">Street Map</option>
            </select>
          )}

          <button
            type="button"
            onClick={handleFitAllRoutes}
            title="Reset camera view"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/90 dark:bg-[#181D2C]/90 backdrop-blur-xl border border-[#BFC0C0]/80 dark:border-[#4F5D75]/50 text-xs font-medium text-[#2D3142] dark:text-[#FAFAFA] hover:bg-white dark:hover:bg-[#2D3142] transition-colors shadow-lg whitespace-nowrap"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset View</span>
          </button>
        </div>
      </div>

      {/* Bottom-Left Subtle Telemetry Legend */}
      {!selectedTrip && (
        <div className="pointer-events-none absolute bottom-5 left-5 z-[400] hidden sm:flex items-center gap-3 px-3.5 py-2 rounded-xl bg-white/85 dark:bg-[#111521]/85 backdrop-blur-md border border-[#BFC0C0]/70 dark:border-[#4F5D75]/45 text-xs text-[#2D3142] dark:text-[#BFC0C0] shadow-md">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] dark:bg-[#38BDF8] shadow-[0_0_8px_#38bdf8]" />
            <span>Geodesic Flight Arc</span>
          </span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9] dark:bg-[#60A5FA] shadow-[0_0_8px_#60a5fa]" />
            <span>Overland Route</span>
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">
            {citiesCovered.length} Cities Covered
          </span>
        </div>
      )}

      {/* Selected Trip Floating 3D Boarding Pass & Travelog Folio Inspector */}
      {selectedTrip && (
        <div
          ref={inspectorCardRef}
          className="absolute bottom-5 left-4 right-14 sm:right-auto sm:max-w-2xl z-[400] bg-white/95 dark:bg-[#181D2C]/95 backdrop-blur-2xl border border-[#BFC0C0]/90 dark:border-[#4F5D75]/60 rounded-2xl p-5 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.65)]"
        >
          {/* Boarding Pass Top Header */}
          <div className="flex items-start justify-between gap-4 pb-3.5 border-b border-dashed border-[#BFC0C0] dark:border-[#4F5D75]/80">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#4F5D75] dark:text-[#BFC0C0] mb-1">
                <span className="font-semibold text-[#2563EB] dark:text-[#38BDF8]">
                  {selectedTrip.tripType === 'flight' ? 'Aviation Sector Pass' : 'Overland Grand Tour'}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{selectedTrip.travelDate}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {selectedTrip.distanceMiles.toLocaleString()} mi
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{selectedTrip.durationHours}h</span>
              </div>

              <div className="flex items-baseline gap-3">
                <h3 className="font-display text-2xl font-bold text-[#2D3142] dark:text-[#FAFAFA] tracking-tight">
                  {selectedTrip.originCity}{' '}
                  <span className="font-mono text-sm font-semibold text-[#2563EB] dark:text-[#38BDF8]">
                    {selectedTrip.originCode}
                  </span>
                  <span className="mx-2 text-[#4F5D75] dark:text-[#BFC0C0]">→</span>
                  {selectedTrip.destCity}{' '}
                  <span className="font-mono text-sm font-semibold text-[#2563EB] dark:text-[#38BDF8]">
                    {selectedTrip.destCode}
                  </span>
                </h3>
              </div>

              <p className="text-xs text-[#4F5D75] dark:text-[#BFC0C0] mt-1">
                {selectedTrip.carrierName} · {selectedTrip.equipmentType} ·{' '}
                <span className="font-mono">{selectedTrip.routeNumber}</span>
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onEditTrip(selectedTrip)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg transition-colors whitespace-nowrap"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Log</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectTrip(null)}
                aria-label="Close route inspector"
                className="p-1.5 text-[#4F5D75] hover:text-[#2D3142] dark:text-[#BFC0C0] dark:hover:text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Honest Memory Journal Spread */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3.5">
            <div>
              <div className="text-[11px] font-semibold text-[#2563EB] dark:text-[#38BDF8] mb-1">
                🌟 Good Memories
              </div>
              <p className="text-xs text-[#4F5D75] dark:text-[#BFC0C0] whitespace-pre-line line-clamp-3 leading-relaxed">
                {selectedTrip.goodMemories || 'No highlights recorded yet.'}
              </p>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-[#4F5D75] dark:text-sky-300 mb-1">
                ⚠️ Challenges / Bad Memories
              </div>
              <p className="text-xs text-[#4F5D75] dark:text-[#BFC0C0] whitespace-pre-line line-clamp-3 leading-relaxed">
                {selectedTrip.badMemories || 'Smooth journey with no reported issues.'}
              </p>
            </div>
          </div>

          {selectedTrip.photos.length > 0 && (
            <div className="flex items-center gap-2.5 mt-3.5 pt-3 border-t border-slate-200/80 dark:border-white/10 overflow-x-auto">
              {selectedTrip.photos.map((photoUrl, idx) => (
                <div
                  key={idx}
                  className="relative w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-white/10"
                >
                  <img
                    src={photoUrl}
                    alt={`${selectedTrip.destCity} highlight ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
