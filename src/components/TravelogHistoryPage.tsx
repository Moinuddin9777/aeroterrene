import React, { useState, useMemo } from 'react';
import {
  Search,
  Plane,
  Car,
  Edit3,
  Trash2,
  Globe,
  Plus,
  RotateCcw,
  X,
} from 'lucide-react';
import { Trip } from '../types/trip';

interface TravelogHistoryPageProps {
  trips: Trip[];
  loading: boolean;
  selectedTripId: string | null;
  onInspectOnMap: (tripId: string) => void;
  onEditTrip: (trip: Trip) => void;
  onDeleteTrip: (tripId: string) => void;
  onGoToLogger: () => void;
  onSeedSamples: () => void;
}

export const TravelogHistoryPage: React.FC<TravelogHistoryPageProps> = ({
  trips,
  loading,
  selectedTripId,
  onInspectOnMap,
  onEditTrip,
  onDeleteTrip,
  onGoToLogger,
  onSeedSamples,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedCarrier, setSelectedCarrier] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<'all' | 'flight' | 'roadtrip'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    trips.forEach((t) => {
      if (t.travelDate && t.travelDate.length >= 4) {
        years.add(t.travelDate.slice(0, 4));
      }
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [trips]);

  const availableCarriers = useMemo(() => {
    const carriers = new Set<string>();
    trips.forEach((t) => {
      if (t.carrierName) carriers.add(t.carrierName);
    });
    return Array.from(carriers).sort((a, b) => a.localeCompare(b));
  }, [trips]);

  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      if (selectedMode !== 'all' && t.tripType !== selectedMode) return false;
      if (selectedYear !== 'all' && !t.travelDate.startsWith(selectedYear)) return false;
      if (selectedCarrier !== 'all' && t.carrierName !== selectedCarrier) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const match =
          t.originCity.toLowerCase().includes(q) ||
          t.destCity.toLowerCase().includes(q) ||
          t.originCode.toLowerCase().includes(q) ||
          t.destCode.toLowerCase().includes(q) ||
          t.originCountry.toLowerCase().includes(q) ||
          t.destCountry.toLowerCase().includes(q) ||
          t.carrierName.toLowerCase().includes(q) ||
          t.equipmentType.toLowerCase().includes(q) ||
          t.routeNumber.toLowerCase().includes(q) ||
          t.goodMemories.toLowerCase().includes(q) ||
          t.badMemories.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [trips, selectedMode, selectedYear, selectedCarrier, searchQuery]);

  const summary = useMemo(() => {
    const miles = filteredTrips.reduce((sum, t) => sum + t.distanceMiles, 0);
    const hours = Number(filteredTrips.reduce((sum, t) => sum + t.durationHours, 0).toFixed(1));
    const countries = new Set<string>();
    filteredTrips.forEach((t) => {
      countries.add(t.originCountry);
      countries.add(t.destCountry);
    });
    return {
      count: filteredTrips.length,
      miles,
      hours,
      countries: countries.size,
    };
  }, [filteredTrips]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedYear('all');
    setSelectedCarrier('all');
    setSelectedMode('all');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedYear !== 'all' ||
    selectedCarrier !== 'all' ||
    selectedMode !== 'all';

  return (
    <div className="min-h-full w-full py-8 px-4 sm:px-8 max-w-7xl mx-auto space-y-8">
      {/* Corporate Geometric Travelog Masthead */}
      <div className="flex flex-wrap items-end justify-between gap-6 pb-6 border-b border-[#BFC0C0]/70 dark:border-[#4F5D75]/40">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-[#2563EB] dark:text-[#38BDF8] mb-1">
            Personal Aviation & Overland Archive
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#2D3142] dark:text-[#FAFAFA] tracking-tight">
            The Travelog Chronicle
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#4F5D75] dark:text-[#BFC0C0] mt-2 font-mono tabular-nums">
            <span className="font-semibold text-[#2563EB] dark:text-[#38BDF8]">
              {summary.count} {summary.count === 1 ? 'Logged Journey' : 'Logged Journeys'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{summary.miles.toLocaleString()} statute miles</span>
            <span aria-hidden="true">·</span>
            <span>{summary.countries} countries</span>
            <span aria-hidden="true">·</span>
            <span>{summary.hours} hours in transit</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onGoToLogger}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-md shadow-blue-600/25 transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Journey</span>
        </button>
      </div>

      {/* Filter & Search Command Bar */}
      <div className="bg-white dark:bg-[#181D2C] border border-[#BFC0C0]/70 dark:border-[#4F5D75]/40 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#4F5D75] dark:text-[#BFC0C0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by city, IATA airport code, airline, aircraft model, or memory..."
            className="w-full pl-10 pr-8 py-2 text-xs bg-[#FAFAFA] dark:bg-[#111521] border border-[#BFC0C0]/80 dark:border-[#4F5D75]/50 rounded-xl text-[#2D3142] dark:text-[#FAFAFA] placeholder:text-[#4F5D75]/70 dark:placeholder:text-[#BFC0C0]/60 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#4F5D75] hover:text-[#2D3142] dark:text-[#BFC0C0]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mode, Year, and Carrier Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 p-1 bg-[#FAFAFA] dark:bg-[#111521] border border-[#BFC0C0]/60 dark:border-[#4F5D75]/40 rounded-xl">
            <button
              type="button"
              onClick={() => setSelectedMode('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedMode === 'all'
                  ? 'bg-[#2563EB] text-white font-semibold shadow-xs'
                  : 'text-[#4F5D75] dark:text-[#BFC0C0] hover:text-[#2D3142] dark:hover:text-white'
              }`}
            >
              All ({trips.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedMode('flight')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedMode === 'flight'
                  ? 'bg-[#2563EB] text-white font-semibold shadow-xs'
                  : 'text-[#4F5D75] dark:text-[#BFC0C0] hover:text-[#2D3142] dark:hover:text-white'
              }`}
            >
              <Plane className="w-3.5 h-3.5" />
              <span>Flights</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedMode('roadtrip')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedMode === 'roadtrip'
                  ? 'bg-[#2563EB] text-white font-semibold shadow-xs'
                  : 'text-[#4F5D75] dark:text-[#BFC0C0] hover:text-[#2D3142] dark:hover:text-white'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Road Trips</span>
            </button>
          </div>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            aria-label="Filter by travel year"
            className="px-3 py-2 text-xs font-medium bg-[#FAFAFA] dark:bg-[#111521] text-[#2D3142] dark:text-[#FAFAFA] rounded-xl border border-[#BFC0C0]/80 dark:border-[#4F5D75]/50 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            <option value="all">All Years</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>

          <select
            value={selectedCarrier}
            onChange={(e) => setSelectedCarrier(e.target.value)}
            aria-label="Filter by airline or route carrier"
            className="px-3 py-2 text-xs font-medium bg-[#FAFAFA] dark:bg-[#111521] text-[#2D3142] dark:text-[#FAFAFA] rounded-xl border border-[#BFC0C0]/80 dark:border-[#4F5D75]/50 focus:outline-none focus:ring-2 focus:ring-[#2563EB] max-w-[180px] truncate"
          >
            <option value="all">All Airlines & Routes</option>
            {availableCarriers.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#2563EB] dark:text-[#38BDF8] hover:underline whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Travelog Folio Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="animate-pulse p-6 rounded-2xl bg-white dark:bg-[#181D2C] border border-[#BFC0C0]/60 dark:border-[#4F5D75]/40 space-y-4"
            >
              <div className="h-4 w-40 bg-[#BFC0C0]/40 dark:bg-[#2D3142] rounded" />
              <div className="h-10 w-full bg-[#BFC0C0]/30 dark:bg-[#2D3142] rounded" />
              <div className="h-24 w-full bg-[#BFC0C0]/20 dark:bg-[#2D3142]/60 rounded" />
            </div>
          ))}
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#181D2C] border border-[#BFC0C0]/70 dark:border-[#4F5D75]/40 rounded-2xl space-y-4">
          <h2 className="font-display text-2xl font-bold text-[#2D3142] dark:text-[#FAFAFA]">
            {trips.length === 0
              ? 'Your Travelog Chronicle Awaits Its First Sector'
              : 'No Matching Journeys Found'}
          </h2>
          <p className="text-xs text-[#4F5D75] dark:text-[#BFC0C0] max-w-md mx-auto leading-relaxed">
            {trips.length === 0
              ? 'Dispatch a new air flight or overland road trip, or load the curated sample archive to explore tactile boarding-pass cards and 3D globe paths.'
              : 'Adjust your search terms, year filter, or carrier selection above.'}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            {trips.length === 0 ? (
              <>
                <button
                  type="button"
                  onClick={onGoToLogger}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl transition-colors"
                >
                  + Log First Journey
                </button>
                <button
                  type="button"
                  onClick={onSeedSamples}
                  className="px-5 py-2.5 text-xs font-medium text-[#2D3142] dark:text-[#FAFAFA] bg-[#BFC0C0]/30 dark:bg-[#2D3142] hover:bg-[#BFC0C0]/50 rounded-xl transition-colors"
                >
                  Load Sample Archive
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={resetFilters}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-[#2563EB] rounded-xl"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
          {filteredTrips.map((trip) => {
            const isFlight = trip.tripType === 'flight';
            const isSelected = trip.id === selectedTripId;
            const heroPhoto = trip.photos && trip.photos.length > 0 ? trip.photos[0] : null;

            return (
              <article
                key={trip.id}
                className={`travelog-card-3d flex flex-col justify-between rounded-2xl overflow-hidden bg-white dark:bg-[#181D2C] border transition-all ${
                  isSelected
                    ? 'border-[#2563EB] dark:border-[#38BDF8] ring-2 ring-[#38BDF8]/50 shadow-xl'
                    : 'border-[#BFC0C0]/80 dark:border-[#4F5D75]/45 shadow-md'
                }`}
              >
                <div>
                  {/* Top Boarding Pass Header Block (#2D3142 gunmetal indigo with vibrant blue gradient bar) */}
                  <div className="relative bg-[#2D3142] text-[#FAFAFA] overflow-hidden">
                    {heroPhoto && (
                      <>
                        <img
                          src={heroPhoto}
                          alt={`${trip.originCity} to ${trip.destCity}`}
                          referrerPolicy="no-referrer"
                          className="absolute inset-0 w-full h-full object-cover opacity-40"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#2D3142] via-[#2D3142]/75 to-[#2D3142]/45" />
                      </>
                    )}

                    {/* Top Vibrant Electric Blue Accent Bar */}
                    <div className="relative h-1.5 w-full bg-gradient-to-r from-[#2563EB] via-[#0EA5E9] to-[#38BDF8]" />

                    <div className="relative p-6 space-y-4">
                      {/* Top Telemetry Kicker */}
                      <div className="flex items-center justify-between gap-2 text-xs text-[#BFC0C0] font-mono tabular-nums">
                        <div className="flex items-center gap-2">
                          <span className="text-[#38BDF8] font-semibold">
                            {isFlight ? 'FLIGHT SECTOR' : 'OVERLAND TOUR'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{trip.travelDate}</span>
                        </div>
                        <div>
                          <span>{trip.distanceMiles.toLocaleString()} mi</span>
                          <span aria-hidden="true"> · </span>
                          <span>{trip.durationHours}h</span>
                        </div>
                      </div>

                      {/* Large Boarding Pass Gate Row */}
                      <div className="flex items-center justify-between gap-4 pt-1">
                        <div className="min-w-0">
                          <div className="font-mono text-3xl font-bold text-[#FAFAFA] tracking-tight">
                            {trip.originCode}
                          </div>
                          <div className="font-display text-lg font-semibold text-[#FAFAFA]/95 truncate">
                            {trip.originCity}
                          </div>
                          <div className="text-[11px] text-[#BFC0C0] truncate">
                            {trip.originCountry}
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center px-3">
                          <span className="font-mono text-xs text-[#38BDF8] font-semibold mb-1.5">
                            {trip.routeNumber}
                          </span>
                          <div className="w-full flex items-center gap-2">
                            <span className="h-px flex-1 bg-[#BFC0C0]/40" />
                            {isFlight ? (
                              <Plane className="w-4 h-4 text-[#38BDF8] shrink-0" />
                            ) : (
                              <Car className="w-4 h-4 text-[#38BDF8] shrink-0" />
                            )}
                            <span className="h-px flex-1 bg-[#BFC0C0]/40" />
                          </div>
                          <span className="text-[11px] text-[#BFC0C0] mt-1.5 truncate max-w-[160px]">
                            {trip.equipmentType}
                          </span>
                        </div>

                        <div className="min-w-0 text-right">
                          <div className="font-mono text-3xl font-bold text-[#FAFAFA] tracking-tight">
                            {trip.destCode}
                          </div>
                          <div className="font-display text-lg font-semibold text-[#FAFAFA]/95 truncate">
                            {trip.destCity}
                          </div>
                          <div className="text-[11px] text-[#BFC0C0] truncate">
                            {trip.destCountry}
                          </div>
                        </div>
                      </div>

                      {/* Carrier & Continent Unboxed Line */}
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-[#BFC0C0]">
                        <span className="font-medium text-[#FAFAFA] truncate">
                          {trip.carrierName}
                        </span>
                        <span className="font-mono text-[11px] shrink-0">
                          {trip.originContinent === trip.destContinent
                            ? trip.destContinent
                            : `${trip.originContinent} → ${trip.destContinent}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Honest Memory Journal Body */}
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 rounded-xl bg-[#FAFAFA] dark:bg-[#111521] border border-[#BFC0C0]/50 dark:border-[#4F5D75]/35">
                        <div className="text-[11px] font-semibold text-[#2563EB] dark:text-[#38BDF8] mb-1.5">
                          🌟 Good Memories
                        </div>
                        <p className="text-[#4F5D75] dark:text-[#BFC0C0] whitespace-pre-line leading-relaxed">
                          {trip.goodMemories || 'No positive highlights recorded yet.'}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#FAFAFA] dark:bg-[#111521] border border-[#BFC0C0]/50 dark:border-[#4F5D75]/35">
                        <div className="text-[11px] font-semibold text-[#4F5D75] dark:text-sky-300 mb-1.5">
                          ⚠️ Challenges / Bad Memories
                        </div>
                        <p className="text-[#4F5D75] dark:text-[#BFC0C0] whitespace-pre-line leading-relaxed">
                          {trip.badMemories || 'Smooth journey with no reported issues.'}
                        </p>
                      </div>
                    </div>

                    {/* Photo Postcard Strip if Present */}
                    {trip.photos && trip.photos.length > 0 && (
                      <div className="flex items-center gap-2.5 overflow-x-auto pt-1">
                        {trip.photos.map((photoUrl, idx) => (
                          <div
                            key={idx}
                            className="w-24 h-16 rounded-lg overflow-hidden shrink-0 border border-[#BFC0C0] dark:border-[#4F5D75]"
                          >
                            <img
                              src={photoUrl}
                              alt={`${trip.destCity} highlight ${idx + 1}`}
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
                </div>

                {/* Perforated Boarding-Pass Footer Bar */}
                <div className="px-6 py-3.5 bg-[#FAFAFA] dark:bg-[#131826] border-t border-dashed border-[#BFC0C0] dark:border-[#4F5D75]/50 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onInspectOnMap(trip.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg shadow-xs transition-colors whitespace-nowrap"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Inspect on 3D Globe</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEditTrip(trip)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#4F5D75] dark:text-[#BFC0C0] hover:text-[#2D3142] dark:hover:text-[#FAFAFA] bg-white dark:bg-[#22283A] border border-[#BFC0C0]/70 dark:border-[#4F5D75]/50 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    {confirmDeleteId === trip.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteTrip(trip.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-2.5 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1.5 text-xs text-[#4F5D75] dark:text-[#BFC0C0]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(trip.id)}
                        aria-label="Delete trip"
                        className="p-1.5 text-[#4F5D75] dark:text-[#BFC0C0] hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
