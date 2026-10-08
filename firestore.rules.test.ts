/**
 * Firestore Security Rules Test Specification (Dirty Dozen Verification)
 * Verifies all 12 adversarial payloads defined in security_spec.md return PERMISSION_DENIED.
 */

export interface DirtyDozenTestCase {
  id: number;
  name: string;
  operation: 'create' | 'update' | 'get' | 'list' | 'delete';
  path: string;
  auth: { uid: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

const VALID_BASE_PAYLOAD = {
  ownerId: 'user_A',
  tripType: 'flight',
  originCode: 'SFO',
  originCity: 'San Francisco',
  originCountry: 'United States',
  originContinent: 'North America',
  originLat: 37.6213,
  originLng: -122.379,
  destCode: 'HND',
  destCity: 'Tokyo',
  destCountry: 'Japan',
  destContinent: 'Asia',
  destLat: 35.5494,
  destLng: 139.7798,
  carrierName: 'ANA All Nippon Airways',
  equipmentType: 'Boeing 777-300ER',
  routeNumber: 'NH 107',
  travelDate: '2026-04-15',
  distanceMiles: 5160,
  durationHours: 11.2,
  goodMemories: 'Smooth flight across the Pacific, incredible ramen in Shinjuku.',
  badMemories: 'Brief turbulence over the Aleutian Islands.',
  photos: [],
  createdAt: '__SERVER_TIMESTAMP__',
  updatedAt: '__SERVER_TIMESTAMP__',
};

export const DIRTY_DOZEN_TESTS: DirtyDozenTestCase[] = [
  {
    id: 1,
    name: 'Identity Spoofing on Create',
    operation: 'create',
    path: '/trips/trip_01',
    auth: { uid: 'user_A', email_verified: true },
    payload: { ...VALID_BASE_PAYLOAD, ownerId: 'user_B' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified Email Write',
    operation: 'create',
    path: '/trips/trip_02',
    auth: { uid: 'user_A', email_verified: false },
    payload: { ...VALID_BASE_PAYLOAD },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Shadow Field Injection on Create',
    operation: 'create',
    path: '/trips/trip_03',
    auth: { uid: 'user_A', email_verified: true },
    payload: { ...VALID_BASE_PAYLOAD, isAdmin: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'ID Poisoning Attack',
    operation: 'create',
    path: '/trips/invalid$id!@#',
    auth: { uid: 'user_A', email_verified: true },
    payload: { ...VALID_BASE_PAYLOAD },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Memory Journal Overflow',
    operation: 'create',
    path: '/trips/trip_05',
    auth: { uid: 'user_A', email_verified: true },
    payload: { ...VALID_BASE_PAYLOAD, goodMemories: 'A'.repeat(2500) },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Photo Array Overflow (> 4 photos)',
    operation: 'create',
    path: '/trips/trip_06',
    auth: { uid: 'user_A', email_verified: true },
    payload: { ...VALID_BASE_PAYLOAD, photos: ['a', 'b', 'c', 'd', 'e'] },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Photo Element Type Poisoning',
    operation: 'create',
    path: '/trips/trip_07',
    auth: { uid: 'user_A', email_verified: true },
    payload: { ...VALID_BASE_PAYLOAD, photos: [12345] },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Invalid Travel Date Format',
    operation: 'create',
    path: '/trips/trip_08',
    auth: { uid: 'user_A', email_verified: true },
    payload: { ...VALID_BASE_PAYLOAD, travelDate: 'April 15, 2026' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Out-of-Bounds Geodesic Coordinates',
    operation: 'create',
    path: '/trips/trip_09',
    auth: { uid: 'user_A', email_verified: true },
    payload: { ...VALID_BASE_PAYLOAD, originLat: 145.0 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Forged Client Timestamp on Create',
    operation: 'create',
    path: '/trips/trip_10',
    auth: { uid: 'user_A', email_verified: true },
    payload: { ...VALID_BASE_PAYLOAD, createdAt: '2020-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Immutable Field Mutation on Update',
    operation: 'update',
    path: '/trips/trip_11',
    auth: { uid: 'user_A', email_verified: true },
    payload: { ...VALID_BASE_PAYLOAD, ownerId: 'user_B' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Cross-Tenant List Scraping',
    operation: 'list',
    path: '/trips',
    auth: { uid: 'user_A', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
];
