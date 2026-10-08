import React, { useMemo } from 'react';
import { CheckCircle2, Lock } from 'lucide-react';
import { Trip, BadgeDefinition } from '../types/trip';

interface PassportPanelProps {
  trips: Trip[];
}

interface CountryStamp {
  country: string;
  continent: string;
  cities: string[];
  firstVisited: string;
  visitCount: number;
}

export const PassportPanel: React.FC<PassportPanelProps> = ({ trips }) => {
  const { badges, countryStamps, continentsVisited } = useMemo(() => {
    const flights = trips.filter((t) => t.tripType === 'flight');
    const roadtrips = trips.filter((t) => t.tripType === 'roadtrip');
    const totalMiles = trips.reduce((acc, t) => acc + t.distanceMiles, 0);

    const countriesMap = new Map<string, CountryStamp>();
    const continentsSet = new Set<string>();
    const aircraftSet = new Set<string>();

    const registerPlace = (
      country: string,
      continent: string,
      city: string,
      travelDate: string
    ) => {
      continentsSet.add(continent);
      const existing = countriesMap.get(country);
      if (existing) {
        existing.visitCount += 1;
        if (!existing.cities.includes(city)) {
          existing.cities.push(city);
        }
        if (travelDate < existing.firstVisited) {
          existing.firstVisited = travelDate;
        }
      } else {
        countriesMap.set(country, {
          country,
          continent,
          cities: [city],
          firstVisited: travelDate,
          visitCount: 1,
        });
      }
    };

    trips.forEach((t) => {
      registerPlace(t.originCountry, t.originContinent, t.originCity, t.travelDate);
      registerPlace(t.destCountry, t.destContinent, t.destCity, t.travelDate);
      if (t.tripType === 'flight') {
        aircraftSet.add(t.equipmentType);
      }
    });

    const honestLogsCount = trips.filter(
      (t) => t.goodMemories.trim().length > 0 && t.badMemories.trim().length > 0
    ).length;

    const photoTripsCount = trips.filter((t) => t.photos && t.photos.length > 0).length;

    const badgeList: BadgeDefinition[] = [
      {
        id: 'first-takeoff',
        title: 'First Takeoff',
        description: 'Log your first commercial or private air flight in the journal.',
        category: 'Flight',
        currentValue: flights.length,
        targetValue: 1,
        unit: 'flight',
        unlocked: flights.length >= 1,
      },
      {
        id: 'frequent-flyer',
        title: 'Frequent Flyer',
        description: 'Log 10 or more air flights across global airways.',
        category: 'Flight',
        currentValue: flights.length,
        targetValue: 10,
        unit: 'flights',
        unlocked: flights.length >= 10,
      },
      {
        id: 'continent-hopper',
        title: 'Continent Hopper',
        description: 'Touch down or drive across 3 or more continents.',
        category: 'Exploration',
        currentValue: continentsSet.size,
        targetValue: 3,
        unit: 'continents',
        unlocked: continentsSet.size >= 3,
      },
      {
        id: 'global-citizen',
        title: 'Global Citizen',
        description: 'Collect passport stamps across 5 or more countries.',
        category: 'Exploration',
        currentValue: countriesMap.size,
        targetValue: 5,
        unit: 'countries',
        unlocked: countriesMap.size >= 5,
      },
      {
        id: 'open-road-pioneer',
        title: 'Open Road Pioneer',
        description: 'Log an overland road trip along a scenic highway or mountain pass.',
        category: 'Road',
        currentValue: roadtrips.length,
        targetValue: 1,
        unit: 'road trip',
        unlocked: roadtrips.length >= 1,
      },
      {
        id: 'widebody-connoisseur',
        title: 'Fleet Connoisseur',
        description: 'Fly aboard 3 or more distinct aircraft models (e.g., 777, A350, A321neo).',
        category: 'Flight',
        currentValue: aircraftSet.size,
        targetValue: 3,
        unit: 'aircraft types',
        unlocked: aircraftSet.size >= 3,
      },
      {
        id: 'stratosphere-25k',
        title: 'Circum-Equatorial Voyager',
        description: 'Accumulate 10,000+ statute miles across flights and road trips.',
        category: 'Exploration',
        currentValue: totalMiles,
        targetValue: 10000,
        unit: 'miles',
        unlocked: totalMiles >= 10000,
      },
      {
        id: 'honest-chronicler',
        title: 'Honest Chronicler',
        description: 'Record both Good Memories and Challenges on 3 or more journeys.',
        category: 'Journal',
        currentValue: honestLogsCount,
        targetValue: 3,
        unit: 'honest logs',
        unlocked: honestLogsCount >= 3,
      },
      {
        id: 'visual-storyteller',
        title: 'Visual Storyteller',
        description: 'Attach highlight photography to 3 or more logged trips.',
        category: 'Journal',
        currentValue: photoTripsCount,
        targetValue: 3,
        unit: 'photo logs',
        unlocked: photoTripsCount >= 3,
      },
    ];

    const stamps = Array.from(countriesMap.values()).sort((a, b) =>
      b.firstVisited.localeCompare(a.firstVisited)
    );

    return {
      badges: badgeList,
      countryStamps: stamps,
      continentsVisited: Array.from(continentsSet),
    };
  }, [trips]);

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="min-h-full w-full py-8 px-4 sm:px-8 max-w-7xl mx-auto space-y-10">
      {/* Corporate Geometric Passport Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-[#BFC0C0]/70 dark:border-[#4F5D75]/40">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-[#2563EB] dark:text-[#38BDF8] mb-1">
            Diplomatic & Aviation Credentials
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#2D3142] dark:text-[#FAFAFA] tracking-tight">
            Digital Travel Passport & Badges
          </h1>
          <p className="text-xs text-[#4F5D75] dark:text-[#BFC0C0] mt-1">
            Continents Reached: {continentsVisited.join(' · ') || 'None yet'}
          </p>
        </div>

        <div className="px-5 py-3 rounded-2xl bg-[#2D3142] text-[#FAFAFA] border border-[#4F5D75]/50 font-mono tabular-nums flex items-center gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#BFC0C0]">
              Country Stamps
            </div>
            <div className="text-xl font-bold text-[#38BDF8]">{countryStamps.length}</div>
          </div>
          <div className="h-8 w-px bg-[#4F5D75]" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#BFC0C0]">
              Badges Unlocked
            </div>
            <div className="text-xl font-bold text-[#FAFAFA]">
              {unlockedCount}/{badges.length}
            </div>
          </div>
        </div>
      </div>

      {/* Country Visa Stamps Grid */}
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-[#2D3142] dark:text-[#FAFAFA]">
          Official Country Entry Stamps
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {countryStamps.map((stamp) => (
            <div
              key={stamp.country}
              className="travelog-card-3d p-5 rounded-2xl border border-[#BFC0C0]/80 dark:border-[#4F5D75]/50 bg-white dark:bg-[#181D2C] flex items-start justify-between gap-4 shadow-xs"
            >
              <div className="min-w-0 space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#2563EB] dark:text-[#38BDF8]">
                  {stamp.continent}
                </div>
                <div className="font-display text-xl font-bold text-[#2D3142] dark:text-[#FAFAFA] truncate">
                  {stamp.country}
                </div>
                <div className="text-xs text-[#4F5D75] dark:text-[#BFC0C0] truncate">
                  Ports: {stamp.cities.join(', ')}
                </div>
              </div>

              {/* Stylized Ink Visa Stamp */}
              <div className="shrink-0 px-3 py-2 rounded-xl border-2 border-dashed border-[#2563EB] dark:border-[#38BDF8] text-center font-mono -rotate-3">
                <div className="text-[10px] font-bold tracking-widest text-[#2563EB] dark:text-[#38BDF8]">
                  ADMITTED
                </div>
                <div className="text-[10px] text-[#4F5D75] dark:text-[#BFC0C0] mt-0.5">
                  {stamp.firstVisited}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gamified Milestone Badges Grid */}
      <div className="space-y-4 pt-4 border-t border-[#BFC0C0]/60 dark:border-[#4F5D75]/40">
        <h2 className="font-display text-2xl font-bold text-[#2D3142] dark:text-[#FAFAFA]">
          Aviation & Exploration Milestones
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {badges.map((badge) => {
            const pct = Math.min(
              100,
              Math.round((badge.currentValue / badge.targetValue) * 100)
            );
            return (
              <div
                key={badge.id}
                className={`travelog-card-3d p-5 rounded-2xl border flex flex-col justify-between gap-4 ${
                  badge.unlocked
                    ? 'bg-[#2D3142] text-[#FAFAFA] border-[#38BDF8]/50 shadow-md'
                    : 'bg-white/80 dark:bg-[#181D2C]/60 text-[#4F5D75] dark:text-[#BFC0C0] border-[#BFC0C0]/70 dark:border-[#4F5D75]/35'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider opacity-80">
                      {badge.category}
                    </span>
                    {badge.unlocked ? (
                      <CheckCircle2 className="w-4 h-4 text-[#38BDF8]" />
                    ) : (
                      <Lock className="w-4 h-4 opacity-50" />
                    )}
                  </div>

                  <h3
                    className={`font-display text-lg font-bold ${
                      badge.unlocked ? 'text-[#FAFAFA]' : 'text-[#2D3142] dark:text-[#FAFAFA]'
                    }`}
                  >
                    {badge.title}
                  </h3>

                  <p className="text-xs leading-relaxed opacity-85">{badge.description}</p>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                    <span className={badge.unlocked ? 'text-[#38BDF8] font-semibold' : ''}>
                      {badge.unlocked ? 'UNLOCKED' : 'IN PROGRESS'}
                    </span>
                    <span>
                      {badge.currentValue.toLocaleString()} / {badge.targetValue.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-black/20 dark:bg-black/40 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full transition-all duration-300 ${
                        badge.unlocked
                          ? 'bg-gradient-to-r from-[#2563EB] to-[#38BDF8]'
                          : 'bg-[#4F5D75]'
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
