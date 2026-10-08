import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  signInWithGoogle,
  logOutUser,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection,
} from '../lib/firebase';
import { Trip, TripFormInput } from '../types/trip';
import { INITIAL_SAMPLE_TRIPS } from '../data/locations';

const LOCAL_STORAGE_KEY = 'aeroterrene_trips_v1';

interface TripContextValue {
  trips: Trip[];
  user: User | null;
  authReady: boolean;
  loading: boolean;
  selectedTripId: string | null;
  setSelectedTripId: (id: string | null) => void;
  addTrip: (input: TripFormInput) => Promise<string>;
  updateTrip: (id: string, input: TripFormInput) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  seedSampleTrips: () => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  errorBanner: string | null;
  clearErrorBanner: () => void;
}

const TripContext = createContext<TripContextValue | undefined>(undefined);

/**
 * Defensive payload sanitization matching firebase-blueprint.json and firestore.rules verbatim.
 */
function sanitizeTripInput(input: TripFormInput): TripFormInput {
  const cleanStr = (val: string, min: number, max: number, fallback = 'N/A') => {
    const trimmed = (val || '').trim();
    if (trimmed.length < min) return fallback.slice(0, max);
    return trimmed.slice(0, max);
  };

  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(input.travelDate)
    ? input.travelDate
    : new Date().toISOString().slice(0, 10);

  const safePhotos = Array.isArray(input.photos)
    ? input.photos
        .filter((p): p is string => typeof p === 'string' && p.length > 0 && p.length <= 150000)
        .slice(0, 4)
    : [];

  return {
    tripType: input.tripType === 'roadtrip' ? 'roadtrip' : 'flight',
    originCode: cleanStr(input.originCode.toUpperCase(), 2, 16, 'ORG'),
    originCity: cleanStr(input.originCity, 1, 100, 'Origin City'),
    originCountry: cleanStr(input.originCountry, 1, 100, 'Unknown'),
    originContinent: cleanStr(input.originContinent, 1, 60, 'Global'),
    originLat: Math.max(-90, Math.min(90, Number(input.originLat) || 0)),
    originLng: Math.max(-180, Math.min(180, Number(input.originLng) || 0)),
    destCode: cleanStr(input.destCode.toUpperCase(), 2, 16, 'DST'),
    destCity: cleanStr(input.destCity, 1, 100, 'Destination City'),
    destCountry: cleanStr(input.destCountry, 1, 100, 'Unknown'),
    destContinent: cleanStr(input.destContinent, 1, 60, 'Global'),
    destLat: Math.max(-90, Math.min(90, Number(input.destLat) || 0)),
    destLng: Math.max(-180, Math.min(180, Number(input.destLng) || 0)),
    carrierName: cleanStr(input.carrierName, 1, 100, 'Private Carrier'),
    equipmentType: cleanStr(input.equipmentType, 1, 100, 'Standard'),
    routeNumber: cleanStr(input.routeNumber, 1, 40, 'RT-01'),
    travelDate: validDate,
    distanceMiles: Math.max(0, Math.min(50000, Math.round(Number(input.distanceMiles) || 0))),
    durationHours: Math.max(0, Math.min(1000, Number(Number(input.durationHours || 1).toFixed(1)))),
    goodMemories: (input.goodMemories || '').trim().slice(0, 2000),
    badMemories: (input.badMemories || '').trim().slice(0, 2000),
    photos: safePhotos,
  };
}

function loadLocalTrips(): Trip[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_TRIPS));
      return INITIAL_SAMPLE_TRIPS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_SAMPLE_TRIPS;
  } catch {
    return INITIAL_SAMPLE_TRIPS;
  }
}

function saveLocalTrips(trips: Trip[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trips));
  } catch (err) {
    console.warn('LocalStorage quota warning:', err);
  }
}

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [trips, setTrips] = useState<Trip[]>(() => loadLocalTrips());
  const [loading, setLoading] = useState(true);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  useEffect(() => {
    testFirestoreConnection();
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!authReady) return;

    if (!user) {
      const localData = loadLocalTrips();
      setTrips(localData);
      setLoading(false);
      return;
    }

    setLoading(true);
    const tripsQuery = query(collection(db, 'trips'), where('ownerId', '==', user.uid));

    const unsubscribeSnapshot = onSnapshot(
      tripsQuery,
      (snapshot) => {
        const fetched: Trip[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ownerId: data.ownerId,
            tripType: data.tripType,
            originCode: data.originCode,
            originCity: data.originCity,
            originCountry: data.originCountry,
            originContinent: data.originContinent,
            originLat: data.originLat,
            originLng: data.originLng,
            destCode: data.destCode,
            destCity: data.destCity,
            destCountry: data.destCountry,
            destContinent: data.destContinent,
            destLat: data.destLat,
            destLng: data.destLng,
            carrierName: data.carrierName,
            equipmentType: data.equipmentType,
            routeNumber: data.routeNumber,
            travelDate: data.travelDate,
            distanceMiles: data.distanceMiles,
            durationHours: data.durationHours,
            goodMemories: data.goodMemories || '',
            badMemories: data.badMemories || '',
            photos: Array.isArray(data.photos) ? data.photos : [],
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        });

        fetched.sort((a, b) => b.travelDate.localeCompare(a.travelDate));
        setTrips(fetched);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        setErrorBanner('Unable to sync cloud trips. Check your connection or permissions.');
        handleFirestoreError(error, OperationType.LIST, 'trips');
      }
    );

    return () => unsubscribeSnapshot();
  }, [authReady, user]);

  const addTrip = useCallback(
    async (rawInput: TripFormInput): Promise<string> => {
      const sanitized = sanitizeTripInput(rawInput);
      const safeId = `trip_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      if (!user) {
        const newTrip: Trip = {
          id: safeId,
          ownerId: 'local-guest',
          ...sanitized,
        };
        const updated = [newTrip, ...trips].sort((a, b) =>
          b.travelDate.localeCompare(a.travelDate)
        );
        setTrips(updated);
        saveLocalTrips(updated);
        setSelectedTripId(safeId);
        return safeId;
      }

      const path = `trips/${safeId}`;
      try {
        await setDoc(doc(db, 'trips', safeId), {
          ownerId: user.uid,
          ...sanitized,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setSelectedTripId(safeId);
        return safeId;
      } catch (error) {
        setErrorBanner('Failed to save trip to Firebase Firestore.');
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    },
    [user, trips]
  );

  const updateTrip = useCallback(
    async (id: string, rawInput: TripFormInput): Promise<void> => {
      const sanitized = sanitizeTripInput(rawInput);

      if (!user) {
        const updated = trips
          .map((t) => (t.id === id ? { ...t, ...sanitized } : t))
          .sort((a, b) => b.travelDate.localeCompare(a.travelDate));
        setTrips(updated);
        saveLocalTrips(updated);
        return;
      }

      const path = `trips/${id}`;
      try {
        await updateDoc(doc(db, 'trips', id), {
          ...sanitized,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        setErrorBanner('Failed to update trip in Firebase Firestore.');
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    },
    [user, trips]
  );

  const deleteTrip = useCallback(
    async (id: string): Promise<void> => {
      if (selectedTripId === id) {
        setSelectedTripId(null);
      }

      if (!user) {
        const updated = trips.filter((t) => t.id !== id);
        setTrips(updated);
        saveLocalTrips(updated);
        return;
      }

      const path = `trips/${id}`;
      try {
        await deleteDoc(doc(db, 'trips', id));
      } catch (error) {
        setErrorBanner('Failed to delete trip from Firebase Firestore.');
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    },
    [user, trips, selectedTripId]
  );

  const seedSampleTrips = useCallback(async () => {
    if (!user) {
      setTrips(INITIAL_SAMPLE_TRIPS);
      saveLocalTrips(INITIAL_SAMPLE_TRIPS);
      return;
    }

    for (const sample of INITIAL_SAMPLE_TRIPS) {
      const { id: _ignoreId, ownerId: _ignoreOwner, createdAt: _c, updatedAt: _u, ...rest } = sample;
      const sanitized = sanitizeTripInput(rest);
      const safeId = `sample_${sample.originCode.toLowerCase()}_${sample.destCode.toLowerCase()}_${Date.now().toString(36)}`;
      try {
        await setDoc(doc(db, 'trips', safeId), {
          ownerId: user.uid,
          ...sanitized,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `trips/${safeId}`);
      }
    }
  }, [user]);

  const signIn = useCallback(async () => {
    try {
      setErrorBanner(null);
      await signInWithGoogle();
    } catch (err) {
      if (err instanceof Error && !err.message.includes('popup-closed-by-user')) {
        setErrorBanner(err.message);
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logOutUser();
      setSelectedTripId(null);
    } catch (err) {
      if (err instanceof Error) setErrorBanner(err.message);
    }
  }, []);

  const clearErrorBanner = useCallback(() => setErrorBanner(null), []);

  return (
    <TripContext.Provider
      value={{
        trips,
        user,
        authReady,
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
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export function useTrips(): TripContextValue {
  const ctx = useContext(TripContext);
  if (!ctx) {
    throw new Error('useTrips must be used within a TripProvider');
  }
  return ctx;
}
