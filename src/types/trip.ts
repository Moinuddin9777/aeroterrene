export type TripMode = 'flight' | 'roadtrip';

export interface Trip {
  id: string;
  ownerId: string;
  tripType: TripMode;
  originCode: string;
  originCity: string;
  originCountry: string;
  originContinent: string;
  originLat: number;
  originLng: number;
  destCode: string;
  destCity: string;
  destCountry: string;
  destContinent: string;
  destLat: number;
  destLng: number;
  carrierName: string;
  equipmentType: string;
  routeNumber: string;
  travelDate: string; // YYYY-MM-DD
  distanceMiles: number;
  durationHours: number;
  goodMemories: string;
  badMemories: string;
  photos: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type TripFormInput = Omit<Trip, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>;

export interface LocationEntry {
  code: string;
  city: string;
  name: string;
  country: string;
  continent: string;
  lat: number;
  lng: number;
  kind: 'airport' | 'city';
}

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  category: 'Flight' | 'Exploration' | 'Road' | 'Journal';
  currentValue: number;
  targetValue: number;
  unit: string;
  unlocked: boolean;
}
