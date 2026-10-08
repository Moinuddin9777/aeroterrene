import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plane,
  Car,
  Upload,
  Trash2,
  Check,
  RotateCcw,
} from 'lucide-react';
import { Trip, TripFormInput, TripMode, LocationEntry } from '../types/trip';
import {
  GLOBAL_LOCATIONS,
  POPULAR_AIRLINES,
  POPULAR_AIRCRAFT,
  POPULAR_ROAD_VEHICLES,
  PRESET_GALLERY_IMAGES,
  calculateDistanceMiles,
  estimateDurationHours,
  compressImageFile,
} from '../data/locations';

interface TripLoggerPageProps {
  initialTrip?: Trip | null;
  onCancelEdit: () => void;
  onSaveSuccess: (input: TripFormInput, existingId?: string) => Promise<void>;
}

export const TripLoggerPage: React.FC<TripLoggerPageProps> = ({
  initialTrip,
  onCancelEdit,
  onSaveSuccess,
}) => {
  const [tripType, setTripType] = useState<TripMode>('flight');

  // Origin fields
  const [originSearch, setOriginSearch] = useState('');
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [originLocation, setOriginLocation] = useState<LocationEntry>(GLOBAL_LOCATIONS[0]);

  // Destination fields
  const [destSearch, setDestSearch] = useState('');
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [destLocation, setDestLocation] = useState<LocationEntry>(GLOBAL_LOCATIONS[15]); // ZRH

  // Flight / Vehicle details
  const [carrierName, setCarrierName] = useState('Swiss International Air Lines');
  const [equipmentType, setEquipmentType] = useState('Airbus A350-900');
  const [routeNumber, setRouteNumber] = useState('LX 39');
  const [travelDate, setTravelDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [distanceMiles, setDistanceMiles] = useState<number>(5825);
  const [durationHours, setDurationHours] = useState<number>(11.8);

  // Memory Journal
  const [goodMemories, setGoodMemories] = useState('');
  const [badMemories, setBadMemories] = useState('');

  // Media Gallery (max 4 photos)
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setFormError(null);

    if (initialTrip) {
      setTripType(initialTrip.tripType);
      const origEntry: LocationEntry = {
        code: initialTrip.originCode,
        city: initialTrip.originCity,
        name: initialTrip.originCity,
        country: initialTrip.originCountry,
        continent: initialTrip.originContinent,
        lat: initialTrip.originLat,
        lng: initialTrip.originLng,
        kind: initialTrip.tripType === 'flight' ? 'airport' : 'city',
      };
      const dstEntry: LocationEntry = {
        code: initialTrip.destCode,
        city: initialTrip.destCity,
        name: initialTrip.destCity,
        country: initialTrip.destCountry,
        continent: initialTrip.destContinent,
        lat: initialTrip.destLat,
        lng: initialTrip.destLng,
        kind: initialTrip.tripType === 'flight' ? 'airport' : 'city',
      };
      setOriginLocation(origEntry);
      setOriginSearch(`${origEntry.city} (${origEntry.code})`);
      setDestLocation(dstEntry);
      setDestSearch(`${dstEntry.city} (${dstEntry.code})`);
      setCarrierName(initialTrip.carrierName);
      setEquipmentType(initialTrip.equipmentType);
      setRouteNumber(initialTrip.routeNumber);
      setTravelDate(initialTrip.travelDate);
      setDistanceMiles(initialTrip.distanceMiles);
      setDurationHours(initialTrip.durationHours);
      setGoodMemories(initialTrip.goodMemories);
      setBadMemories(initialTrip.badMemories);
      setPhotos(initialTrip.photos || []);
    } else {
      const defaultOrig = GLOBAL_LOCATIONS[0]; // SFO
      const defaultDest = GLOBAL_LOCATIONS[15]; // ZRH
      setTripType('flight');
      setOriginLocation(defaultOrig);
      setOriginSearch(`${defaultOrig.city} (${defaultOrig.code})`);
      setDestLocation(defaultDest);
      setDestSearch(`${defaultDest.city} (${defaultDest.code})`);
      const dist = calculateDistanceMiles(
        defaultOrig.lat,
        defaultOrig.lng,
        defaultDest.lat,
        defaultDest.lng,
        'flight'
      );
      setDistanceMiles(dist);
      setDurationHours(estimateDurationHours(dist, 'flight'));
      setCarrierName('Swiss International Air Lines');
      setEquipmentType('Airbus A350-900');
      setRouteNumber('LX 39');
      setTravelDate(new Date().toISOString().slice(0, 10));
      setGoodMemories('');
      setBadMemories('');
      setPhotos([]);
    }
  }, [initialTrip]);

  const filteredOriginOptions = useMemo(() => {
    const q = originSearch.trim().toLowerCase();
    if (!q) return GLOBAL_LOCATIONS.slice(0, 12);
    return GLOBAL_LOCATIONS.filter(
      (loc) =>
        loc.city.toLowerCase().includes(q) ||
        loc.code.toLowerCase().includes(q) ||
        loc.country.toLowerCase().includes(q) ||
        loc.name.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [originSearch]);

  const filteredDestOptions = useMemo(() => {
    const q = destSearch.trim().toLowerCase();
    if (!q) return GLOBAL_LOCATIONS.slice(0, 12);
    return GLOBAL_LOCATIONS.filter(
      (loc) =>
        loc.city.toLowerCase().includes(q) ||
        loc.code.toLowerCase().includes(q) ||
        loc.country.toLowerCase().includes(q) ||
        loc.name.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [destSearch]);

  const handleSelectOrigin = (loc: LocationEntry) => {
    setOriginLocation(loc);
    setOriginSearch(`${loc.city} (${loc.code})`);
    setShowOriginDropdown(false);
    const dist = calculateDistanceMiles(loc.lat, loc.lng, destLocation.lat, destLocation.lng, tripType);
    setDistanceMiles(dist);
    setDurationHours(estimateDurationHours(dist, tripType));
  };

  const handleSelectDest = (loc: LocationEntry) => {
    setDestLocation(loc);
    setDestSearch(`${loc.city} (${loc.code})`);
    setShowDestDropdown(false);
    const dist = calculateDistanceMiles(originLocation.lat, originLocation.lng, loc.lat, loc.lng, tripType);
    setDistanceMiles(dist);
    setDurationHours(estimateDurationHours(dist, tripType));
  };

  const handleSwapEndpoints = () => {
    const prevOrigin = originLocation;
    const prevDest = destLocation;
    setOriginLocation(prevDest);
    setOriginSearch(`${prevDest.city} (${prevDest.code})`);
    setDestLocation(prevOrigin);
    setDestSearch(`${prevOrigin.city} (${prevOrigin.code})`);
  };

  const handleModeSwitch = (newMode: TripMode) => {
    setTripType(newMode);
    const dist = calculateDistanceMiles(
      originLocation.lat,
      originLocation.lng,
      destLocation.lat,
      destLocation.lng,
      newMode
    );
    setDistanceMiles(dist);
    setDurationHours(estimateDurationHours(dist, newMode));

    if (!initialTrip) {
      if (newMode === 'roadtrip') {
        setCarrierName('Grand Alpine Route / Scenic Highway');
        setEquipmentType('Alpine Grand Tourer Coupe');
        setRouteNumber('CH-19 / Route 1');
      } else {
        setCarrierName('Swiss International Air Lines');
        setEquipmentType('Airbus A350-900');
        setRouteNumber('LX 39');
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhoto(true);
    setFormError(null);
    try {
      const remainingSlots = 4 - photos.length;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      const compressedUrls: string[] = [];
      for (const file of filesToProcess) {
        const dataUrl = await compressImageFile(file);
        compressedUrls.push(dataUrl);
      }
      setPhotos((prev) => [...prev, ...compressedUrls].slice(0, 4));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not process image file.');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const appendBullet = (target: 'good' | 'bad', promptText: string) => {
    if (target === 'good') {
      setGoodMemories((prev) => {
        const prefix = prev.trim().length > 0 ? `${prev.trim()}\n• ` : '• ';
        return `${prefix}${promptText}`;
      });
    } else {
      setBadMemories((prev) => {
        const prefix = prev.trim().length > 0 ? `${prev.trim()}\n• ` : '• ';
        return `${prefix}${promptText}`;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originLocation || !destLocation) {
      setFormError('Please select both an Origin and Destination city/airport.');
      return;
    }
    if (!carrierName.trim() || !equipmentType.trim() || !routeNumber.trim()) {
      setFormError('Please complete the carrier, aircraft/vehicle type, and route number fields.');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      await onSaveSuccess(
        {
          tripType,
          originCode: originLocation.code,
          originCity: originLocation.city,
          originCountry: originLocation.country,
          originContinent: originLocation.continent,
          originLat: originLocation.lat,
          originLng: originLocation.lng,
          destCode: destLocation.code,
          destCity: destLocation.city,
          destCountry: destLocation.country,
          destContinent: destLocation.continent,
          destLat: destLocation.lat,
          destLng: destLocation.lng,
          carrierName: carrierName.trim(),
          equipmentType: equipmentType.trim(),
          routeNumber: routeNumber.trim(),
          travelDate,
          distanceMiles: Number(distanceMiles) || 100,
          durationHours: Number(durationHours) || 1,
          goodMemories: goodMemories.trim(),
          badMemories: badMemories.trim(),
          photos: photos.slice(0, 4),
        },
        initialTrip?.id
      );
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save trip entry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-full w-full py-8 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Corporate Geometric Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-6 mb-8 border-b border-[#BFC0C0]/60 dark:border-[#4F5D75]/40">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-[#2563EB] dark:text-[#38BDF8] mb-1">
            {initialTrip ? 'Update Existing Dispatch Record' : 'Flight & Overland Dispatch Desk'}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#2D3142] dark:text-[#FAFAFA] tracking-tight">
            {initialTrip
              ? `Editing ${initialTrip.originCity} to ${initialTrip.destCity}`
              : 'Log a New Journey'}
          </h1>
        </div>

        {initialTrip && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#2D3142] dark:text-[#FAFAFA] bg-[#BFC0C0]/30 dark:bg-[#2D3142] hover:bg-[#BFC0C0]/50 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Cancel Edit</span>
          </button>
        )}
      </div>

      {/* Main 12-Column Grid: Left 7 Cols Dispatch Form + Right 5 Cols Live 3D Boarding Pass Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: Interactive Dispatch Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-white dark:bg-[#181D2C] border border-[#BFC0C0]/70 dark:border-[#4F5D75]/40 rounded-2xl p-6 sm:p-8 shadow-sm space-y-8"
        >
          {formError && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300">
              {formError}
            </div>
          )}

          {/* 01. Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#BFC0C0]/50 dark:border-[#4F5D75]/30">
            <div>
              <h2 className="text-sm font-semibold text-[#2D3142] dark:text-[#FAFAFA]">
                01. Travel Classification
              </h2>
              <p className="text-xs text-[#4F5D75] dark:text-[#BFC0C0]">
                Choose between commercial/private aviation or overland road touring
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-[#FAFAFA] dark:bg-[#111521] border border-[#BFC0C0]/60 dark:border-[#4F5D75]/40 rounded-xl">
              <button
                type="button"
                onClick={() => handleModeSwitch('flight')}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  tripType === 'flight'
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-[#4F5D75] dark:text-[#BFC0C0] hover:text-[#2D3142] dark:hover:text-white'
                }`}
              >
                <Plane className="w-3.5 h-3.5" />
                <span>Air Flight</span>
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('roadtrip')}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  tripType === 'roadtrip'
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-[#4F5D75] dark:text-[#BFC0C0] hover:text-[#2D3142] dark:hover:text-white'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Road Trip</span>
              </button>
            </div>
          </div>

          {/* 02. Geodesic Origin & Destination Pickers */}
          <div className="space-y-4 pb-6 border-b border-[#BFC0C0]/50 dark:border-[#4F5D75]/30">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#2D3142] dark:text-[#FAFAFA]">
                02. Geodesic Endpoints
              </h2>
              <button
                type="button"
                onClick={handleSwapEndpoints}
                className="text-xs font-medium text-[#2563EB] dark:text-[#38BDF8] hover:underline"
              >
                ⇄ Swap Origin & Destination
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Origin Picker */}
              <div className="relative">
                <label className="block text-xs font-medium text-[#4F5D75] dark:text-[#BFC0C0] mb-1.5">
                  From (Origin City / Airport)
                </label>
                <input
                  type="text"
                  value={originSearch}
                  onFocus={() => setShowOriginDropdown(true)}
                  onBlur={() => setTimeout(() => setShowOriginDropdown(false), 180)}
                  onChange={(e) => {
                    setOriginSearch(e.target.value);
                    setShowOriginDropdown(true);
                  }}
                  placeholder="Search city or IATA code (e.g. SFO, LHR)..."
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAFAFA] dark:bg-[#111521] border border-[#BFC0C0]/80 dark:border-[#4F5D75]/50 rounded-xl text-[#2D3142] dark:text-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
                <div className="mt-1.5 text-[11px] text-[#4F5D75] dark:text-[#BFC0C0] font-mono">
                  {originLocation.city}, {originLocation.country} ({originLocation.code})
                </div>

                {showOriginDropdown && filteredOriginOptions.length > 0 && (
                  <div className="absolute left-0 right-0 top-[72px] z-30 bg-white dark:bg-[#22283A] border border-[#BFC0C0] dark:border-[#4F5D75] rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-[#BFC0C0]/40 dark:divide-[#4F5D75]/40">
                    {filteredOriginOptions.map((loc) => (
                      <button
                        key={`${loc.code}-${loc.city}`}
                        type="button"
                        onMouseDown={() => handleSelectOrigin(loc)}
                        className="w-full px-3.5 py-2.5 text-left hover:bg-[#FAFAFA] dark:hover:bg-[#2D3142] transition-colors flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="text-xs font-semibold text-[#2D3142] dark:text-[#FAFAFA]">
                            {loc.city}, {loc.country}
                          </div>
                          <div className="text-[11px] text-[#4F5D75] dark:text-[#BFC0C0]">
                            {loc.name} · {loc.continent}
                          </div>
                        </div>
                        <span className="font-mono text-xs font-semibold text-[#2563EB] dark:text-[#38BDF8] shrink-0">
                          {loc.code}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Destination Picker */}
              <div className="relative">
                <label className="block text-xs font-medium text-[#4F5D75] dark:text-[#BFC0C0] mb-1.5">
                  To (Destination City / Airport)
                </label>
                <input
                  type="text"
                  value={destSearch}
                  onFocus={() => setShowDestDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDestDropdown(false), 180)}
                  onChange={(e) => {
                    setDestSearch(e.target.value);
                    setShowDestDropdown(true);
                  }}
                  placeholder="Search city or IATA code (e.g. HND, ZRH)..."
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAFAFA] dark:bg-[#111521] border border-[#BFC0C0]/80 dark:border-[#4F5D75]/50 rounded-xl text-[#2D3142] dark:text-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
                <div className="mt-1.5 text-[11px] text-[#4F5D75] dark:text-[#BFC0C0] font-mono">
                  {destLocation.city}, {destLocation.country} ({destLocation.code})
                </div>

                {showDestDropdown && filteredDestOptions.length > 0 && (
                  <div className="absolute left-0 right-0 top-[72px] z-30 bg-white dark:bg-[#22283A] border border-[#BFC0C0] dark:border-[#4F5D75] rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-[#BFC0C0]/40 dark:divide-[#4F5D75]/40">
                    {filteredDestOptions.map((loc) => (
                      <button
                        key={`${loc.code}-${loc.city}`}
                        type="button"
                        onMouseDown={() => handleSelectDest(loc)}
                        className="w-full px-3.5 py-2.5 text-left hover:bg-[#FAFAFA] dark:hover:bg-[#2D3142] transition-colors flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="text-xs font-semibold text-[#2D3142] dark:text-[#FAFAFA]">
                            {loc.city}, {loc.country}
                          </div>
                          <div className="text-[11px] text-[#4F5D75] dark:text-[#BFC0C0]">
                            {loc.name} · {loc.continent}
                          </div>
                        </div>
                        <span className="font-mono text-xs font-semibold text-[#2563EB] dark:text-[#38BDF8] shrink-0">
                          {loc.code}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 03. Carrier, Aircraft & Telemetry */}
          <div className="space-y-4 pb-6 border-b border-[#BFC0C0]/50 dark:border-[#4F5D75]/30">
            <h2 className="text-sm font-semibold text-[#2D3142] dark:text-[#FAFAFA]">
              03. {tripType === 'flight' ? 'Flight & Aircraft Specifications' : 'Route & Vehicle Specifications'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-[#4F5D75] dark:text-[#BFC0C0] mb-1.5">
                  {tripType === 'flight' ? 'Airline Name' : 'Scenic Route / Highway Name'}
                </label>
                <input
                  type="text"
                  list="logger-carrier-suggestions"
                  value={carrierName}
                  onChange={(e) => setCarrierName(e.target.value)}
                  required
                  maxLength={100}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAFAFA] dark:bg-[#111521] border border-[#BFC0C0]/80 dark:border-[#4F5D75]/50 rounded-xl text-[#2D3142] dark:text-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
                <datalist id="logger-carrier-suggestions">
                  {POPULAR_AIRLINES.map((airline) => (
                    <option key={airline} value={airline} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4F5D75] dark:text-[#BFC0C0] mb-1.5">
                  {tripType === 'flight' ? 'Aircraft Type' : 'Vehicle Model / Class'}
                </label>
                <input
                  type="text"
                  list="logger-equipment-suggestions"
                  value={equipmentType}
                  onChange={(e) => setEquipmentType(e.target.value)}
                  required
                  maxLength={100}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAFAFA] dark:bg-[#111521] border border-[#BFC0C0]/80 dark:border-[#4F5D75]/50 rounded-xl text-[#2D3142] dark:text-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
                <datalist id="logger-equipment-suggestions">
                  {(tripType === 'flight' ? POPULAR_AIRCRAFT : POPULAR_ROAD_VEHICLES).map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4F5D75] dark:text-[#BFC0C0] mb-1.5">
                  {tripType === 'flight' ? 'Flight Number' : 'Highway / Route Code'}
                </label>
                <input
                  type="text"
                  value={routeNumber}
                  onChange={(e) => setRouteNumber(e.target.value)}
                  required
                  maxLength={40}
                  className="w-full px-3.5 py-2.5 text-sm font-mono bg-[#FAFAFA] dark:bg-[#111521] border border-[#BFC0C0]/80 dark:border-[#4F5D75]/50 rounded-xl text-[#2D3142] dark:text-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4F5D75] dark:text-[#BFC0C0] mb-1.5">
                  Date of Travel
                </label>
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-sm font-mono bg-[#FAFAFA] dark:bg-[#111521] border border-[#BFC0C0]/80 dark:border-[#4F5D75]/50 rounded-xl text-[#2D3142] dark:text-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4F5D75] dark:text-[#BFC0C0] mb-1.5">
                  Distance (Statute Miles)
                </label>
                <input
                  type="number"
                  min={1}
                  max={50000}
                  value={distanceMiles}
                  onChange={(e) => setDistanceMiles(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums bg-[#FAFAFA] dark:bg-[#111521] border border-[#BFC0C0]/80 dark:border-[#4F5D75]/50 rounded-xl text-[#2D3142] dark:text-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4F5D75] dark:text-[#BFC0C0] mb-1.5">
                  Duration (Hours)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={0.2}
                  max={1000}
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums bg-[#FAFAFA] dark:bg-[#111521] border border-[#BFC0C0]/80 dark:border-[#4F5D75]/50 rounded-xl text-[#2D3142] dark:text-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
            </div>
          </div>

          {/* 04. Honest Memory Journal */}
          <div className="space-y-4 pb-6 border-b border-[#BFC0C0]/50 dark:border-[#4F5D75]/30">
            <h2 className="text-sm font-semibold text-[#2D3142] dark:text-[#FAFAFA]">
              04. Honest Field Notes & Memory Journal
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#2563EB] dark:text-[#38BDF8]">
                    🌟 Good Memories
                  </label>
                  <button
                    type="button"
                    onClick={() => appendBullet('good', 'Standout moment at ')}
                    className="text-[11px] font-medium text-[#2563EB] dark:text-[#38BDF8] hover:underline"
                  >
                    + Add bullet
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={goodMemories}
                  onChange={(e) => setGoodMemories(e.target.value)}
                  maxLength={2000}
                  placeholder="• Golden hour window view during approach&#10;• Memorable local dish or cafe&#10;• Smooth crew hospitality"
                  className="w-full px-3.5 py-2.5 text-xs leading-relaxed bg-[#FAFAFA] dark:bg-[#111521] border border-[#BFC0C0]/80 dark:border-[#4F5D75]/50 rounded-xl text-[#2D3142] dark:text-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#4F5D75] dark:text-sky-300">
                    ⚠️ Challenges / Bad Memories
                  </label>
                  <button
                    type="button"
                    onClick={() => appendBullet('bad', 'Delayed by ')}
                    className="text-[11px] font-medium text-[#2563EB] dark:text-[#38BDF8] hover:underline"
                  >
                    + Add bullet
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={badMemories}
                  onChange={(e) => setBadMemories(e.target.value)}
                  maxLength={2000}
                  placeholder="• Gate holding delay or turbulence&#10;• Lost luggage or tight terminal transfer&#10;• Unexpected weather shift"
                  className="w-full px-3.5 py-2.5 text-xs leading-relaxed bg-[#FAFAFA] dark:bg-[#111521] border border-[#BFC0C0]/80 dark:border-[#4F5D75]/50 rounded-xl text-[#2D3142] dark:text-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
            </div>
          </div>

          {/* 05. Postcard Media Studio */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#2D3142] dark:text-[#FAFAFA]">
                  05. Highlight Photography ({photos.length}/4)
                </h2>
                <p className="text-xs text-[#4F5D75] dark:text-[#BFC0C0]">
                  Attach up to 4 photos or choose an editorial postcard preset
                </p>
              </div>

              {photos.length < 4 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-[#FAFAFA] dark:bg-[#111521] border border-[#BFC0C0] dark:border-[#4F5D75] text-[#2D3142] dark:text-[#FAFAFA] rounded-xl hover:bg-[#BFC0C0]/20 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingPhoto ? 'Compressing…' : 'Upload Photo'}</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {photos.length < 4 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-[#4F5D75] dark:text-[#BFC0C0]">
                  Quick attach sample postcard:
                </span>
                {PRESET_GALLERY_IMAGES.map((preset) => {
                  const alreadyAdded = photos.includes(preset.url);
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => setPhotos((prev) => [...prev, preset.url].slice(0, 4))}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                        alreadyAdded
                          ? 'border-[#BFC0C0]/40 text-[#BFC0C0] cursor-not-allowed'
                          : 'border-[#BFC0C0] dark:border-[#4F5D75] text-[#2D3142] dark:text-[#FAFAFA] hover:bg-[#2563EB]/10'
                      }`}
                    >
                      + {preset.label}
                    </button>
                  );
                })}
              </div>
            )}

            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {photos.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#BFC0C0] dark:border-[#4F5D75]"
                  >
                    <img
                      src={url}
                      alt={`Highlight ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== idx))}
                      aria-label="Remove photo"
                      className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-[#2D3142]/85 text-white hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#BFC0C0]/50 dark:border-[#4F5D75]/30">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-md shadow-blue-600/25 transition-all disabled:opacity-50 whitespace-nowrap"
            >
              <Check className="w-4 h-4" />
              <span>
                {submitting
                  ? 'Recording to Chronicle…'
                  : initialTrip
                  ? 'Save Updated Journey'
                  : 'Commit Journey to Chronicle'}
              </span>
            </button>
          </div>
        </form>

        {/* Right 5 Columns: Sticky Live 3D Tactile Boarding Pass & Folio Preview */}
        <div className="lg:col-span-5 lg:sticky lg:top-8 space-y-5">
          <div className="text-xs font-mono uppercase tracking-widest text-[#2563EB] dark:text-[#38BDF8]">
            Live 3D Boarding Pass Preview
          </div>

          <div className="travelog-card-3d rounded-2xl overflow-hidden bg-[#2D3142] text-[#FAFAFA] border border-[#4F5D75]/60 shadow-2xl">
            {/* Top Vibrant Electric Blue Accent Bar */}
            <div className="h-2 w-full bg-gradient-to-r from-[#2563EB] via-[#0EA5E9] to-[#38BDF8]" />

            {photos.length > 0 && (
              <div className="relative h-44 w-full overflow-hidden">
                <img
                  src={photos[0]}
                  alt="Preview header"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2D3142] via-[#2D3142]/40 to-transparent" />
              </div>
            )}

            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between text-xs text-[#BFC0C0] font-mono">
                <span className="text-[#38BDF8] font-semibold">
                  {tripType === 'flight' ? 'AVIATION BOARDING PASS' : 'OVERLAND GRAND TOUR'}
                </span>
                <span>{travelDate}</span>
              </div>

              {/* Gate Endpoints */}
              <div className="flex items-center justify-between gap-4 py-4 border-y border-dashed border-[#4F5D75]">
                <div>
                  <div className="font-mono text-3xl font-bold text-[#FAFAFA] tracking-tight">
                    {originLocation.code}
                  </div>
                  <div className="font-display text-lg font-semibold text-[#FAFAFA]/90">
                    {originLocation.city}
                  </div>
                  <div className="text-[11px] text-[#BFC0C0]/75">{originLocation.country}</div>
                </div>

                <div className="flex-1 flex flex-col items-center px-2">
                  <span className="font-mono text-xs text-[#38BDF8] font-semibold mb-1">
                    {routeNumber || '—'}
                  </span>
                  <div className="w-full flex items-center gap-2">
                    <span className="h-px flex-1 bg-[#4F5D75]" />
                    {tripType === 'flight' ? (
                      <Plane className="w-4 h-4 text-[#38BDF8]" />
                    ) : (
                      <Car className="w-4 h-4 text-[#38BDF8]" />
                    )}
                    <span className="h-px flex-1 bg-[#4F5D75]" />
                  </div>
                  <span className="font-mono text-[11px] text-[#BFC0C0] mt-1 tabular-nums">
                    {distanceMiles.toLocaleString()} mi · {durationHours}h
                  </span>
                </div>

                <div className="text-right">
                  <div className="font-mono text-3xl font-bold text-[#FAFAFA] tracking-tight">
                    {destLocation.code}
                  </div>
                  <div className="font-display text-lg font-semibold text-[#FAFAFA]/90">
                    {destLocation.city}
                  </div>
                  <div className="text-[11px] text-[#BFC0C0]/75">{destLocation.country}</div>
                </div>
              </div>

              {/* Carrier & Fleet Metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-[10px] font-mono uppercase text-[#BFC0C0]/70">
                    Carrier / Route
                  </div>
                  <div className="font-medium text-[#FAFAFA] mt-0.5 truncate">
                    {carrierName || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-[#BFC0C0]/70">
                    Equipment / Craft
                  </div>
                  <div className="font-medium text-[#FAFAFA] mt-0.5 truncate">
                    {equipmentType || '—'}
                  </div>
                </div>
              </div>

              {/* Memory Snippets */}
              {(goodMemories || badMemories) && (
                <div className="pt-4 border-t border-[#4F5D75]/60 space-y-3 text-xs">
                  {goodMemories && (
                    <div className="pl-3 border-l-2 border-[#38BDF8]">
                      <div className="text-[11px] font-semibold text-[#38BDF8]">
                        🌟 Good Memories
                      </div>
                      <p className="text-[#BFC0C0] whitespace-pre-line line-clamp-3 mt-0.5">
                        {goodMemories}
                      </p>
                    </div>
                  )}
                  {badMemories && (
                    <div className="pl-3 border-l-2 border-sky-300/70">
                      <div className="text-[11px] font-semibold text-sky-300">
                        ⚠️ Challenges / Bad Memories
                      </div>
                      <p className="text-[#BFC0C0] whitespace-pre-line line-clamp-3 mt-0.5">
                        {badMemories}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
