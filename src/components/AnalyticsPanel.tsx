import React, { useMemo, useEffect, useRef } from 'react';
import { animate } from 'animejs';
import { Plane, Car, Globe, ArrowUpRight } from 'lucide-react';
import { Trip } from '../types/trip';

interface AnalyticsPanelProps {
  trips: Trip[];
  onSelectTrip: (id: string) => void;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ trips, onSelectTrip }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const stats = useMemo(() => {
    const flights = trips.filter((t) => t.tripType === 'flight');
    const roadtrips = trips.filter((t) => t.tripType === 'roadtrip');

    const totalMiles = trips.reduce((acc, t) => acc + t.distanceMiles, 0);
    const flightMiles = flights.reduce((acc, t) => acc + t.distanceMiles, 0);
    const roadMiles = roadtrips.reduce((acc, t) => acc + t.distanceMiles, 0);
    const totalHours = Number(trips.reduce((acc, t) => acc + t.durationHours, 0).toFixed(1));

    const countriesSet = new Set<string>();
    const citiesSet = new Set<string>();
    const continentsSet = new Set<string>();

    trips.forEach((t) => {
      countriesSet.add(t.originCountry);
      countriesSet.add(t.destCountry);
      citiesSet.add(`${t.originCity}, ${t.originCountry}`);
      citiesSet.add(`${t.destCity}, ${t.destCountry}`);
      continentsSet.add(t.originContinent);
      continentsSet.add(t.destContinent);
    });

    // Carrier breakdown
    const carrierMap = new Map<string, { count: number; miles: number; mode: string }>();
    trips.forEach((t) => {
      const prev = carrierMap.get(t.carrierName) || { count: 0, miles: 0, mode: t.tripType };
      carrierMap.set(t.carrierName, {
        count: prev.count + 1,
        miles: prev.miles + t.distanceMiles,
        mode: t.tripType,
      });
    });
    const topCarriers = Array.from(carrierMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count || b.miles - a.miles);

    // Aircraft / Equipment breakdown
    const equipmentMap = new Map<string, { count: number; miles: number; mode: string }>();
    trips.forEach((t) => {
      const prev = equipmentMap.get(t.equipmentType) || { count: 0, miles: 0, mode: t.tripType };
      equipmentMap.set(t.equipmentType, {
        count: prev.count + 1,
        miles: prev.miles + t.distanceMiles,
        mode: t.tripType,
      });
    });
    const equipmentBreakdown = Array.from(equipmentMap.entries())
      .map(([model, data]) => ({ model, ...data }))
      .sort((a, b) => b.miles - a.miles);

    // Longest trip
    const longestTrip =
      trips.length > 0
        ? [...trips].sort((a, b) => b.distanceMiles - a.distanceMiles)[0]
        : null;

    // Earth circumferences (24,901 miles at equator)
    const earthOrbits = (totalMiles / 24901).toFixed(2);

    return {
      totalMiles,
      flightMiles,
      roadMiles,
      totalHours,
      flightCount: flights.length,
      roadCount: roadtrips.length,
      countriesCount: countriesSet.size,
      citiesCount: citiesSet.size,
      continentsCount: continentsSet.size,
      topCarrier: topCarriers[0] || null,
      topCarriers,
      equipmentBreakdown,
      longestTrip,
      earthOrbits,
    };
  }, [trips]);

  useEffect(() => {
    if (!containerRef.current) return;
    const bars = containerRef.current.querySelectorAll('.analytics-bar-fill');
    if (bars.length > 0) {
      animate(bars, {
        scaleX: [0, 1],
        duration: 600,
        delay: (_el, i) => (i ?? 0) * 55,
        ease: 'outCubic',
      });
    }
  }, [stats]);

  if (trips.length === 0) {
    return (
      <div className="min-h-full w-full py-12 px-6 max-w-7xl mx-auto text-center">
        <p className="text-sm text-[#4F5D75] dark:text-[#BFC0C0]">
          No trips logged yet. Log your first flight or road trip to unlock telemetry analytics.
        </p>
      </div>
    );
  }

  const maxEquipmentMiles = Math.max(
    1,
    ...stats.equipmentBreakdown.map((item) => item.miles)
  );

  return (
    <div ref={containerRef} className="min-h-full w-full py-8 px-4 sm:px-8 max-w-7xl mx-auto space-y-8">
      {/* Corporate Geometric Section Header */}
      <div className="pb-6 border-b border-[#BFC0C0]/70 dark:border-[#4F5D75]/40 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-[#2563EB] dark:text-[#38BDF8] mb-1">
            Quantitative Travel Intelligence
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#2D3142] dark:text-[#FAFAFA] tracking-tight">
            Flight & Overland Telemetry
          </h1>
        </div>
        <div className="text-xs font-mono text-[#4F5D75] dark:text-[#BFC0C0] tabular-nums">
          Equatorial Ratio:{' '}
          <span className="font-bold text-[#2563EB] dark:text-[#38BDF8]">
            {stats.earthOrbits}× Earth Circumference
          </span>
        </div>
      </div>

      {/* Primary KPI Grid (4-Column Architectural Stat Strip) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="travelog-card-3d bg-[#2D3142] text-[#FAFAFA] p-6 rounded-2xl border border-[#4F5D75]/50 shadow-md">
          <div className="text-xs font-mono uppercase tracking-wider text-[#BFC0C0]">
            Total Statute Miles
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-[#38BDF8] mt-2">
            {stats.totalMiles.toLocaleString()}
          </div>
          <div className="text-xs text-[#BFC0C0] mt-2 font-mono tabular-nums">
            {stats.flightMiles.toLocaleString()} air · {stats.roadMiles.toLocaleString()} road
          </div>
        </div>

        <div className="travelog-card-3d bg-white dark:bg-[#181D2C] p-6 rounded-2xl border border-[#BFC0C0]/80 dark:border-[#4F5D75]/45 shadow-sm">
          <div className="text-xs font-mono uppercase tracking-wider text-[#4F5D75] dark:text-[#BFC0C0]">
            Geographic Reach
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-[#2D3142] dark:text-[#FAFAFA] mt-2">
            {stats.countriesCount}{' '}
            <span className="text-sm font-normal text-[#4F5D75] dark:text-[#BFC0C0]">countries</span>
          </div>
          <div className="text-xs text-[#4F5D75] dark:text-[#BFC0C0] mt-2 font-mono tabular-nums">
            {stats.citiesCount} cities · {stats.continentsCount}/6 continents
          </div>
        </div>

        <div className="travelog-card-3d bg-white dark:bg-[#181D2C] p-6 rounded-2xl border border-[#BFC0C0]/80 dark:border-[#4F5D75]/45 shadow-sm">
          <div className="text-xs font-mono uppercase tracking-wider text-[#4F5D75] dark:text-[#BFC0C0]">
            Primary Carrier Used
          </div>
          <div className="font-display text-xl font-bold text-[#2D3142] dark:text-[#FAFAFA] mt-2 truncate">
            {stats.topCarrier ? stats.topCarrier.name : '—'}
          </div>
          <div className="text-xs text-[#4F5D75] dark:text-[#BFC0C0] mt-2 font-mono tabular-nums">
            {stats.topCarrier
              ? `${stats.topCarrier.count} ${stats.topCarrier.count === 1 ? 'sector' : 'sectors'} · ${stats.topCarrier.miles.toLocaleString()} mi`
              : 'No carrier data'}
          </div>
        </div>

        <div className="travelog-card-3d bg-white dark:bg-[#181D2C] p-6 rounded-2xl border border-[#BFC0C0]/80 dark:border-[#4F5D75]/45 shadow-sm">
          <div className="text-xs font-mono uppercase tracking-wider text-[#4F5D75] dark:text-[#BFC0C0]">
            Logged Transit Time
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-[#2D3142] dark:text-[#FAFAFA] mt-2">
            {stats.totalHours}h
          </div>
          <div className="text-xs text-[#4F5D75] dark:text-[#BFC0C0] mt-2 font-mono tabular-nums">
            {stats.flightCount} flights · {stats.roadCount} road trips
          </div>
        </div>
      </div>

      {/* Two-Column Breakdown: Aircraft/Vehicle Fleet + Ranked Carriers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Columns: Fleet Breakdown */}
        <div className="lg:col-span-7 bg-white dark:bg-[#181D2C] border border-[#BFC0C0]/80 dark:border-[#4F5D75]/45 rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#BFC0C0]/50 dark:border-[#4F5D75]/35">
            <div>
              <h2 className="font-display text-xl font-bold text-[#2D3142] dark:text-[#FAFAFA]">
                Aircraft & Vehicle Fleet Distribution
              </h2>
              <p className="text-xs text-[#4F5D75] dark:text-[#BFC0C0]">
                Statute mileage logged per airframe or overland vehicle model
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums text-[#2563EB] dark:text-[#38BDF8] font-semibold">
              {stats.equipmentBreakdown.length} distinct models
            </span>
          </div>

          <div className="space-y-4">
            {stats.equipmentBreakdown.map((item) => {
              const pct = Math.max(6, Math.round((item.miles / maxEquipmentMiles) * 100));
              const isFlight = item.mode === 'flight';
              return (
                <div key={item.model} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#2D3142] dark:text-[#FAFAFA] flex items-center gap-2 truncate">
                      {isFlight ? (
                        <Plane className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#38BDF8]" />
                      ) : (
                        <Car className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#38BDF8]" />
                      )}
                      <span>{item.model}</span>
                    </span>
                    <span className="font-mono tabular-nums text-[#4F5D75] dark:text-[#BFC0C0] shrink-0">
                      {item.count} {item.count === 1 ? 'leg' : 'legs'} · {item.miles.toLocaleString()} mi
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[#FAFAFA] dark:bg-[#111521] border border-[#BFC0C0]/50 dark:border-[#4F5D75]/30 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%`, transformOrigin: 'left center' }}
                      className={`analytics-bar-fill h-full rounded-full ${
                        isFlight
                          ? 'bg-gradient-to-r from-[#2563EB] to-[#38BDF8]'
                          : 'bg-[#0284C7] dark:bg-[#0EA5E9]'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Columns: Carrier Ledger & Longest Sector */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-[#181D2C] border border-[#BFC0C0]/80 dark:border-[#4F5D75]/45 rounded-2xl p-6 space-y-4 shadow-xs">
            <h2 className="font-display text-xl font-bold text-[#2D3142] dark:text-[#FAFAFA] pb-2 border-b border-[#BFC0C0]/50 dark:border-[#4F5D75]/35">
              Airlines & Scenic Routes Ranked
            </h2>
            <div className="divide-y divide-[#BFC0C0]/40 dark:divide-[#4F5D75]/30">
              {stats.topCarriers.map((carrier, idx) => (
                <div
                  key={carrier.name}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono tabular-nums text-[#2563EB] dark:text-[#38BDF8] w-5 font-semibold">
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    <span className="font-medium text-[#2D3142] dark:text-[#FAFAFA] truncate">
                      {carrier.name}
                    </span>
                  </div>
                  <div className="font-mono tabular-nums text-[#4F5D75] dark:text-[#BFC0C0] shrink-0">
                    {carrier.count} {carrier.count === 1 ? 'trip' : 'trips'} ·{' '}
                    {carrier.miles.toLocaleString()} mi
                  </div>
                </div>
              ))}
            </div>
          </div>

          {stats.longestTrip && (
            <div className="travelog-card-3d bg-[#2D3142] text-[#FAFAFA] rounded-2xl p-6 border border-[#4F5D75]/60 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-widest text-[#38BDF8]">
                  Longest Single Sector Record
                </span>
                <span className="font-mono tabular-nums text-sm font-bold text-[#38BDF8]">
                  {stats.longestTrip.distanceMiles.toLocaleString()} mi
                </span>
              </div>

              <div className="font-display text-xl font-bold text-[#FAFAFA]">
                {stats.longestTrip.originCity} ({stats.longestTrip.originCode}) →{' '}
                {stats.longestTrip.destCity} ({stats.longestTrip.destCode})
              </div>

              <div className="text-xs text-[#BFC0C0]">
                {stats.longestTrip.carrierName} · {stats.longestTrip.equipmentType} ·{' '}
                <span className="font-mono">{stats.longestTrip.routeNumber}</span>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onSelectTrip(stats.longestTrip!.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Inspect Sector on 3D Globe</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
