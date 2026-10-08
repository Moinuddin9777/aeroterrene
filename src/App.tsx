import React, { useState, useEffect } from 'react';
import {
  Plus,
  Sun,
  Moon,
  Cloud,
  LogOut,
  X,
  Plane,
  Car,
} from 'lucide-react';
import { TripProvider, useTrips } from './context/TripContext';
import { TravelMap } from './components/TravelMap';
import { TravelogHistoryPage } from './components/TravelogHistoryPage';
import { TripLoggerPage } from './components/TripLoggerPage';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { PassportPanel } from './components/PassportPanel';
import { Trip, TripFormInput } from './types/trip';

type PageTab = 'history' | 'map' | 'logger' | 'analytics' | 'passport';

const TripWorkspace: React.FC = () => {
  const {
    trips,
    user,
    loading,
    selectedTripId,
    setSelectedTripId,
    addTrip,
    updateTrip,
    deleteTrip,
    seedSampleTrips,
    signIn,
    signOut,
    errorBanner,
    clearErrorBanner,
  } = useTrips();

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('aeroterrene_theme');
    return saved ? saved === 'dark' : false;
  });

  const [activeTab, setActiveTab] = useState<PageTab>('history');
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('aeroterrene_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('aeroterrene_theme', 'light');
    }
  }, [darkMode]);

  const handleOpenCreateLogger = () => {
    setEditingTrip(null);
    setActiveTab('logger');
  };

  const handleOpenEditLogger = (trip: Trip) => {
    setEditingTrip(trip);
    setActiveTab('logger');
  };

  const handleInspectOnMap = (tripId: string) => {
    setSelectedTripId(tripId);
    setActiveTab('map');
  };

  const handleSaveTrip = async (input: TripFormInput, existingId?: string) => {
    if (existingId) {
      await updateTrip(existingId, input);
      setSelectedTripId(existingId);
    } else {
      const createdId = await addTrip(input);
      setSelectedTripId(createdId);
    }
    setEditingTrip(null);
    setActiveTab('history');
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#FAFAFA] dark:bg-[#111521] text-[#2D3142] dark:text-[#FAFAFA] transition-colors duration-200">
      {/* Top Bar Contract: Strict 1-row, 3-zone navigation header */}
      <header className="h-16 shrink-0 flex items-center justify-between px-6 bg-[#2D3142] dark:bg-[#0D101A] text-[#FAFAFA] border-b border-[#4F5D75]/50 z-30 shadow-md">
        {/* Zone 1: Single text element wordmark in Futura corporate geometric sans */}
        <a
          href="#history"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('history');
          }}
          className="font-display text-xl font-bold uppercase tracking-wider text-[#FAFAFA] whitespace-nowrap"
        >
          AeroTerrene
        </a>

        {/* Zone 2: 5 clean text navigation links for dedicated pages */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-[#BFC0C0]">
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-1.5 transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'history'
                ? 'border-[#38BDF8] text-[#FAFAFA] font-semibold'
                : 'border-transparent hover:text-[#FAFAFA]'
            }`}
          >
            Travelog
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`py-1.5 transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'map'
                ? 'border-[#38BDF8] text-[#FAFAFA] font-semibold'
                : 'border-transparent hover:text-[#FAFAFA]'
            }`}
          >
            World Map
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingTrip(null);
              setActiveTab('logger');
            }}
            className={`py-1.5 transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'logger'
                ? 'border-[#38BDF8] text-[#FAFAFA] font-semibold'
                : 'border-transparent hover:text-[#FAFAFA]'
            }`}
          >
            Trip Logger
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`py-1.5 transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'analytics'
                ? 'border-[#38BDF8] text-[#FAFAFA] font-semibold'
                : 'border-transparent hover:text-[#FAFAFA]'
            }`}
          >
            Telemetry
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('passport')}
            className={`py-1.5 transition-colors whitespace-nowrap border-b-2 ${
              activeTab === 'passport'
                ? 'border-[#38BDF8] text-[#FAFAFA] font-semibold'
                : 'border-transparent hover:text-[#FAFAFA]'
            }`}
          >
            Passport
          </button>
        </nav>

        {/* Zone 3: Primary actions */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <button
              type="button"
              onClick={signOut}
              title={`Signed in as ${user.email || user.displayName || 'Traveler'}. Click to sign out.`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#FAFAFA] bg-[#4F5D75]/60 hover:bg-[#4F5D75] rounded-lg transition-colors whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline truncate max-w-[110px]">
                {user.displayName || user.email?.split('@')[0] || 'Cloud Sync'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={signIn}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#FAFAFA] bg-[#4F5D75]/60 hover:bg-[#4F5D75] rounded-lg transition-colors whitespace-nowrap"
            >
              <Cloud className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Cloud Sync</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setDarkMode((d) => !d)}
            aria-label="Toggle color theme"
            className="p-2 text-[#BFC0C0] hover:text-[#FAFAFA] hover:bg-[#4F5D75]/50 rounded-lg transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-[#38BDF8]" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleOpenCreateLogger}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg shadow-sm shadow-blue-600/30 transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Trip</span>
          </button>
        </div>
      </header>

      {/* Error Notification Banner if Firestore Error Occurs */}
      {errorBanner && (
        <div className="bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-800 px-6 py-2 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
          <span>{errorBanner}</span>
          <button
            type="button"
            onClick={clearErrorBanner}
            className="p-1 hover:opacity-75 transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Mobile Tab Navigation Strip */}
      <div className="flex md:hidden items-center justify-between px-4 py-2 bg-[#2D3142] text-[#BFC0C0] border-b border-[#4F5D75]/40 text-xs overflow-x-auto gap-4 shrink-0">
        {(
          [
            { id: 'history', label: 'Travelog' },
            { id: 'map', label: 'World Map' },
            { id: 'logger', label: 'Trip Logger' },
            { id: 'analytics', label: 'Telemetry' },
            { id: 'passport', label: 'Passport' },
          ] as { id: PageTab; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`py-1 font-medium whitespace-nowrap ${
              activeTab === tab.id ? 'text-[#38BDF8] font-semibold' : 'text-[#BFC0C0]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Dedicated Page Viewport */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Page 1: Travelog History Archive */}
        {activeTab === 'history' && (
          <TravelogHistoryPage
            trips={trips}
            loading={loading}
            selectedTripId={selectedTripId}
            onInspectOnMap={handleInspectOnMap}
            onEditTrip={handleOpenEditLogger}
            onDeleteTrip={deleteTrip}
            onGoToLogger={handleOpenCreateLogger}
            onSeedSamples={seedSampleTrips}
          />
        )}

        {/* Page 2: Full-Viewport Interactive 3D Globe & 2D World Map */}
        {activeTab === 'map' && (
          <div className="w-full h-full relative overflow-hidden">
            <TravelMap
              trips={trips}
              selectedTripId={selectedTripId}
              onSelectTrip={setSelectedTripId}
              onEditTrip={handleOpenEditLogger}
              darkMode={darkMode}
            />

            {/* Floating Compact Sector Switcher Strip on Left of Map */}
            <div className="hidden lg:flex flex-col w-72 max-h-[65vh] absolute top-20 left-4 z-[400] bg-white/90 dark:bg-[#1A2030]/90 backdrop-blur-xl border border-[#BFC0C0]/80 dark:border-[#4F5D75]/50 rounded-2xl shadow-xl overflow-hidden">
              <div className="px-4 py-3 bg-[#2D3142] text-[#FAFAFA] flex items-center justify-between">
                <span className="text-xs font-semibold tracking-tight">Logged Sectors</span>
                <span className="font-mono text-[11px] text-[#38BDF8]">{trips.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-[#BFC0C0]/40 dark:divide-[#4F5D75]/30">
                {trips.map((t) => {
                  const isSel = t.id === selectedTripId;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTripId(isSel ? null : t.id)}
                      className={`w-full px-4 py-2.5 text-left transition-colors flex items-center justify-between gap-2 ${
                        isSel
                          ? 'bg-[#2563EB]/12 dark:bg-[#38BDF8]/15 text-[#2563EB] dark:text-[#38BDF8]'
                          : 'hover:bg-[#FAFAFA] dark:hover:bg-[#2D3142]/60'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2D3142] dark:text-[#FAFAFA] truncate">
                          {t.tripType === 'flight' ? (
                            <Plane className="w-3 h-3 text-[#2563EB] dark:text-[#38BDF8] shrink-0" />
                          ) : (
                            <Car className="w-3 h-3 text-[#0284C7] dark:text-[#38BDF8] shrink-0" />
                          )}
                          <span>
                            {t.originCode} → {t.destCode}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#4F5D75] dark:text-[#BFC0C0] truncate">
                          {t.originCity} to {t.destCity}
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-[#4F5D75] dark:text-[#BFC0C0] tabular-nums shrink-0">
                        {t.distanceMiles.toLocaleString()} mi
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Page 3: Dedicated Trip Logger & Dispatch Desk */}
        {activeTab === 'logger' && (
          <TripLoggerPage
            initialTrip={editingTrip}
            onCancelEdit={() => {
              setEditingTrip(null);
              setActiveTab('history');
            }}
            onSaveSuccess={handleSaveTrip}
          />
        )}

        {/* Page 4: Dedicated Telemetry & Analytics Page */}
        {activeTab === 'analytics' && (
          <AnalyticsPanel
            trips={trips}
            onSelectTrip={(id) => {
              handleInspectOnMap(id);
            }}
          />
        )}

        {/* Page 5: Dedicated Digital Passport & Stamps Page */}
        {activeTab === 'passport' && <PassportPanel trips={trips} />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <TripProvider>
      <TripWorkspace />
    </TripProvider>
  );
}
