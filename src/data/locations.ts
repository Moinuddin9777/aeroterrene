import { LocationEntry, Trip } from '../types/trip';
import tokyoImg from '../assets/images/trip_tokyo_skyline_1791139655887.jpg';
import alpsImg from '../assets/images/trip_swiss_alps_road_1791139668984.jpg';
import lisbonImg from '../assets/images/trip_lisbon_tram_1791139681076.jpg';

export const PRESET_GALLERY_IMAGES = [
  { label: 'Tokyo Blue Hour Skyline', url: tokyoImg },
  { label: 'Swiss Alps Furka Pass', url: alpsImg },
  { label: 'Lisbon Alfama Tram 28', url: lisbonImg },
];

export const GLOBAL_LOCATIONS: LocationEntry[] = [
  // North America
  { code: 'SFO', city: 'San Francisco', name: 'San Francisco International', country: 'United States', continent: 'North America', lat: 37.6213, lng: -122.379, kind: 'airport' },
  { code: 'JFK', city: 'New York', name: 'John F. Kennedy International', country: 'United States', continent: 'North America', lat: 40.6413, lng: -73.7781, kind: 'airport' },
  { code: 'LAX', city: 'Los Angeles', name: 'Los Angeles International', country: 'United States', continent: 'North America', lat: 33.9416, lng: -118.4085, kind: 'airport' },
  { code: 'ORD', city: 'Chicago', name: "O'Hare International", country: 'United States', continent: 'North America', lat: 41.9742, lng: -87.9073, kind: 'airport' },
  { code: 'SEA', city: 'Seattle', name: 'Seattle-Tacoma International', country: 'United States', continent: 'North America', lat: 47.4502, lng: -122.3088, kind: 'airport' },
  { code: 'MIA', city: 'Miami', name: 'Miami International', country: 'United States', continent: 'North America', lat: 25.7959, lng: -80.287, kind: 'airport' },
  { code: 'DEN', city: 'Denver', name: 'Denver International', country: 'United States', continent: 'North America', lat: 39.8561, lng: -104.6737, kind: 'airport' },
  { code: 'BOS', city: 'Boston', name: 'Logan International', country: 'United States', continent: 'North America', lat: 42.3656, lng: -71.0096, kind: 'airport' },
  { code: 'YVR', city: 'Vancouver', name: 'Vancouver International', country: 'Canada', continent: 'North America', lat: 49.1967, lng: -123.1815, kind: 'airport' },
  { code: 'YYZ', city: 'Toronto', name: 'Toronto Pearson International', country: 'Canada', continent: 'North America', lat: 43.6777, lng: -79.6248, kind: 'airport' },
  { code: 'YUL', city: 'Montreal', name: 'Montreal-Trudeau International', country: 'Canada', continent: 'North America', lat: 45.4657, lng: -73.7455, kind: 'airport' },
  { code: 'MEX', city: 'Mexico City', name: 'Benito Juarez International', country: 'Mexico', continent: 'North America', lat: 19.4361, lng: -99.0719, kind: 'airport' },
  { code: 'MRY', city: 'Big Sur / Monterey', name: 'Pacific Coast Highway Hub', country: 'United States', continent: 'North America', lat: 36.2704, lng: -121.8081, kind: 'city' },
  { code: 'BNF', city: 'Banff', name: 'Icefields Parkway Alpine Hub', country: 'Canada', continent: 'North America', lat: 51.1784, lng: -115.5708, kind: 'city' },
  { code: 'MOA', city: 'Moab', name: 'Arches & Canyonlands Scenic Byway', country: 'United States', continent: 'North America', lat: 38.5733, lng: -109.5498, kind: 'city' },

  // Europe
  { code: 'LHR', city: 'London', name: 'Heathrow Airport', country: 'United Kingdom', continent: 'Europe', lat: 51.47, lng: -0.4543, kind: 'airport' },
  { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle Airport', country: 'France', continent: 'Europe', lat: 49.0097, lng: 2.5479, kind: 'airport' },
  { code: 'ZRH', city: 'Zurich', name: 'Zurich Airport', country: 'Switzerland', continent: 'Europe', lat: 47.4582, lng: 8.5555, kind: 'airport' },
  { code: 'LIS', city: 'Lisbon', name: 'Humberto Delgado Airport', country: 'Portugal', continent: 'Europe', lat: 38.7756, lng: -9.1354, kind: 'airport' },
  { code: 'FRA', city: 'Frankfurt', name: 'Frankfurt Airport', country: 'Germany', continent: 'Europe', lat: 50.0379, lng: 8.5622, kind: 'airport' },
  { code: 'MUC', city: 'Munich', name: 'Munich International', country: 'Germany', continent: 'Europe', lat: 48.3537, lng: 11.775, kind: 'airport' },
  { code: 'AMS', city: 'Amsterdam', name: 'Schiphol Airport', country: 'Netherlands', continent: 'Europe', lat: 52.3105, lng: 4.7683, kind: 'airport' },
  { code: 'FCO', city: 'Rome', name: 'Leonardo da Vinci-Fiumicino', country: 'Italy', continent: 'Europe', lat: 41.8003, lng: 12.2389, kind: 'airport' },
  { code: 'MXP', city: 'Milan', name: 'Milan Malpensa Airport', country: 'Italy', continent: 'Europe', lat: 45.6301, lng: 8.7255, kind: 'airport' },
  { code: 'BCN', city: 'Barcelona', name: 'Josep Tarradellas Barcelona-El Prat', country: 'Spain', continent: 'Europe', lat: 41.2974, lng: 2.0833, kind: 'airport' },
  { code: 'MAD', city: 'Madrid', name: 'Adolfo Suarez Madrid-Barajas', country: 'Spain', continent: 'Europe', lat: 40.4983, lng: -3.5676, kind: 'airport' },
  { code: 'KEF', city: 'Reykjavik', name: 'Keflavik International', country: 'Iceland', continent: 'Europe', lat: 63.985, lng: -22.6056, kind: 'airport' },
  { code: 'CPH', city: 'Copenhagen', name: 'Copenhagen Airport', country: 'Denmark', continent: 'Europe', lat: 55.618, lng: 12.6508, kind: 'airport' },
  { code: 'ARN', city: 'Stockholm', name: 'Stockholm Arlanda', country: 'Sweden', continent: 'Europe', lat: 59.6498, lng: 17.9238, kind: 'airport' },
  { code: 'ATH', city: 'Athens', name: 'Athens International', country: 'Greece', continent: 'Europe', lat: 37.9364, lng: 23.9445, kind: 'airport' },
  { code: 'IST', city: 'Istanbul', name: 'Istanbul Airport', country: 'Turkey', continent: 'Europe', lat: 41.2753, lng: 28.7519, kind: 'airport' },
  { code: 'ZMT', city: 'Zermatt / Furka Pass', name: 'Swiss Grand Tour Alpine Route', country: 'Switzerland', continent: 'Europe', lat: 46.0207, lng: 7.7491, kind: 'city' },
  { code: 'INN', city: 'Innsbruck', name: 'Tyrolean Brenner Pass Hub', country: 'Austria', continent: 'Europe', lat: 47.2692, lng: 11.4041, kind: 'city' },
  { code: 'COMO', city: 'Lake Como', name: 'Lombardy Scenic Lakefront', country: 'Italy', continent: 'Europe', lat: 45.986, lng: 9.2618, kind: 'city' },
  { code: 'OPO', city: 'Porto', name: 'Francisco Sa Carneiro / Atlantic Coast', country: 'Portugal', continent: 'Europe', lat: 41.2481, lng: -8.6814, kind: 'airport' },

  // Asia
  { code: 'HND', city: 'Tokyo', name: 'Tokyo Haneda International', country: 'Japan', continent: 'Asia', lat: 35.5494, lng: 139.7798, kind: 'airport' },
  { code: 'NRT', city: 'Tokyo Narita', name: 'Narita International', country: 'Japan', continent: 'Asia', lat: 35.772, lng: 140.3929, kind: 'airport' },
  { code: 'KIX', city: 'Osaka / Kyoto', name: 'Kansai International', country: 'Japan', continent: 'Asia', lat: 34.432, lng: 135.2304, kind: 'airport' },
  { code: 'SIN', city: 'Singapore', name: 'Singapore Changi Airport', country: 'Singapore', continent: 'Asia', lat: 1.3644, lng: 103.9915, kind: 'airport' },
  { code: 'ICN', city: 'Seoul', name: 'Incheon International', country: 'South Korea', continent: 'Asia', lat: 37.4602, lng: 126.4407, kind: 'airport' },
  { code: 'HKG', city: 'Hong Kong', name: 'Hong Kong International', country: 'China', continent: 'Asia', lat: 22.308, lng: 113.9185, kind: 'airport' },
  { code: 'TPE', city: 'Taipei', name: 'Taiwan Taoyuan International', country: 'Taiwan', continent: 'Asia', lat: 25.0797, lng: 121.2342, kind: 'airport' },
  { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi Airport', country: 'Thailand', continent: 'Asia', lat: 13.69, lng: 100.7501, kind: 'airport' },
  { code: 'DXB', city: 'Dubai', name: 'Dubai International', country: 'United Arab Emirates', continent: 'Asia', lat: 25.2532, lng: 55.3657, kind: 'airport' },
  { code: 'DOH', city: 'Doha', name: 'Hamad International', country: 'Qatar', continent: 'Asia', lat: 25.2731, lng: 51.6081, kind: 'airport' },
  { code: 'DEL', city: 'New Delhi', name: 'Indira Gandhi International', country: 'India', continent: 'Asia', lat: 28.5562, lng: 77.1, kind: 'airport' },
  { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj', country: 'India', continent: 'Asia', lat: 19.0896, lng: 72.8656, kind: 'airport' },
  { code: 'DPS', city: 'Bali', name: 'I Gusti Ngurah Rai International', country: 'Indonesia', continent: 'Asia', lat: -8.7482, lng: 115.1672, kind: 'airport' },

  // Oceania
  { code: 'SYD', city: 'Sydney', name: 'Sydney Kingsford Smith', country: 'Australia', continent: 'Oceania', lat: -33.9399, lng: 151.1753, kind: 'airport' },
  { code: 'MEL', city: 'Melbourne', name: 'Melbourne Tullamarine', country: 'Australia', continent: 'Oceania', lat: -37.669, lng: 144.841, kind: 'airport' },
  { code: 'AKL', city: 'Auckland', name: 'Auckland Airport', country: 'New Zealand', continent: 'Oceania', lat: -37.0082, lng: 174.785, kind: 'airport' },
  { code: 'ZQN', city: 'Queenstown', name: 'Southern Alps Scenic Hub', country: 'New Zealand', continent: 'Oceania', lat: -45.0211, lng: 168.7392, kind: 'airport' },

  // South America
  { code: 'GRU', city: 'Sao Paulo', name: 'Guarulhos International', country: 'Brazil', continent: 'South America', lat: -23.4356, lng: -46.4731, kind: 'airport' },
  { code: 'EZE', city: 'Buenos Aires', name: 'Ministro Pistarini Ezeiza', country: 'Argentina', continent: 'South America', lat: -34.8222, lng: -58.5358, kind: 'airport' },
  { code: 'SCL', city: 'Santiago', name: 'Arturo Merino Benitez', country: 'Chile', continent: 'South America', lat: -33.393, lng: -70.7858, kind: 'airport' },
  { code: 'LIM', city: 'Lima', name: 'Jorge Chavez International', country: 'Peru', continent: 'South America', lat: -12.0219, lng: -77.1143, kind: 'airport' },
  { code: 'BOG', city: 'Bogota', name: 'El Dorado International', country: 'Colombia', continent: 'South America', lat: 4.7016, lng: -74.1469, kind: 'airport' },

  // Africa
  { code: 'CPT', city: 'Cape Town', name: 'Cape Town International', country: 'South Africa', continent: 'Africa', lat: -33.9715, lng: 18.6021, kind: 'airport' },
  { code: 'JNB', city: 'Johannesburg', name: 'O.R. Tambo International', country: 'South Africa', continent: 'Africa', lat: -26.1367, lng: 28.2411, kind: 'airport' },
  { code: 'CMN', city: 'Casablanca', name: 'Mohammed V International', country: 'Morocco', continent: 'Africa', lat: 33.3675, lng: -7.5898, kind: 'airport' },
  { code: 'CAI', city: 'Cairo', name: 'Cairo International', country: 'Egypt', continent: 'Africa', lat: 30.1219, lng: 31.4056, kind: 'airport' },
  { code: 'NBO', city: 'Nairobi', name: 'Jomo Kenyatta International', country: 'Kenya', continent: 'Africa', lat: -1.3192, lng: 36.9278, kind: 'airport' },
];

export const POPULAR_AIRLINES = [
  'ANA All Nippon Airways',
  'Singapore Airlines',
  'Swiss International Air Lines',
  'TAP Air Portugal',
  'United Airlines',
  'Delta Air Lines',
  'British Airways',
  'Air France',
  'Lufthansa',
  'Qatar Airways',
  'Emirates',
  'Japan Airlines (JAL)',
  'Cathay Pacific',
  'Air Canada',
  'Qantas',
];

export const POPULAR_AIRCRAFT = [
  'Boeing 777-300ER',
  'Airbus A350-900',
  'Boeing 787-9 Dreamliner',
  'Airbus A321neo',
  'Airbus A320-200',
  'Boeing 737 MAX 8',
  'Airbus A380-800',
  'Boeing 747-8 Intercontinental',
  'Airbus A220-300',
  'Embraer E195-E2',
];

export const POPULAR_ROAD_VEHICLES = [
  'Alpine Grand Tourer Coupe',
  'Electric Touring Sedan',
  '4x4 Overland Expedition SUV',
  'Classic Convertible Roadster',
  'Westfalia Camper Van',
  'Adventure Touring Motorcycle',
];

/**
 * Calculates great-circle distance in statute miles between two lat/lng points using the Haversine formula.
 */
export function calculateDistanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  mode: 'flight' | 'roadtrip' = 'flight'
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 3958.8; // Earth radius in statute miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightMiles = R * c;
  // Road trips typically wind ~1.26x straight-line geodesic distance
  const multiplier = mode === 'roadtrip' ? 1.26 : 1.0;
  return Math.max(5, Math.round(straightMiles * multiplier));
}

export function estimateDurationHours(distanceMiles: number, mode: 'flight' | 'roadtrip'): number {
  if (mode === 'roadtrip') {
    return Number(Math.max(0.5, distanceMiles / 52).toFixed(1));
  }
  // Flight speed ~510 mph plus 0.6 hr taxi/climb overhead
  return Number(Math.max(0.8, distanceMiles / 510 + 0.6).toFixed(1));
}

/**
 * Generates smooth curved geodesic-style Bezier points between two coordinates for Leaflet rendering.
 * Avoids antimeridian horizontal line artifacts by unwrapping longitudes when shorter across the Pacific.
 */
export function getGeodesicArcPoints(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  mode: 'flight' | 'roadtrip' = 'flight',
  segments = 56
): [number, number][] {
  let targetLng2 = lng2;
  const deltaLng = lng2 - lng1;
  // If crossing the Pacific is shorter, unwrap target longitude for continuous arc rendering
  if (deltaLng > 180) {
    targetLng2 -= 360;
  } else if (deltaLng < -180) {
    targetLng2 += 360;
  }

  const midLat = (lat1 + lat2) / 2;
  const midLng = (lng1 + targetLng2) / 2;

  const dLat = lat2 - lat1;
  const dLng = targetLng2 - lng1;
  const chordLen = Math.sqrt(dLat * dLat + dLng * dLng);

  // Perpendicular normal vector arched northward in Northern Hemisphere or southward in Southern Hemisphere
  const archFactor = mode === 'flight' ? 0.22 : 0.11;
  const hemisphereSign = midLat >= -10 ? 1 : -1;
  const offsetLat = Math.min(24, chordLen * archFactor) * hemisphereSign;
  const offsetLng = -dLat * (archFactor * 0.35);

  const ctrlLat = Math.max(-82, Math.min(82, midLat + offsetLat));
  const ctrlLng = midLng + offsetLng;

  const points: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const inv = 1 - t;
    const lat = inv * inv * lat1 + 2 * inv * t * ctrlLat + t * t * lat2;
    const lng = inv * inv * lng1 + 2 * inv * t * ctrlLng + t * t * targetLng2;
    points.push([lat, lng]);
  }
  return points;
}

/**
 * Compresses an uploaded image File into a lightweight JPEG data URL (< 65KB) suitable for Firestore storage.
 */
export async function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image'));
      img.onload = () => {
        const maxDim = 760;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.72);
        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const INITIAL_SAMPLE_TRIPS: Trip[] = [
  {
    id: 'sample-flight-sfo-hnd',
    ownerId: 'local-guest',
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
    travelDate: '2026-04-12',
    distanceMiles: 5160,
    durationHours: 11.2,
    goodMemories:
      '• Window seat view of Mount Fuji glowing at dusk during descent into Haneda\n• Midnight tonkotsu ramen in Shinjuku Golden Gai\n• Morning stroll through Meiji Jingu forest sanctuary',
    badMemories:
      '• 45-minute holding pattern over Chiba due to crosswinds\n• Jet lag hit hard on day two at 4:00 AM',
    photos: [tokyoImg],
  },
  {
    id: 'sample-road-zrh-como',
    ownerId: 'local-guest',
    tripType: 'roadtrip',
    originCode: 'ZRH',
    originCity: 'Zurich',
    originCountry: 'Switzerland',
    originContinent: 'Europe',
    originLat: 47.4582,
    originLng: 8.5555,
    destCode: 'COMO',
    destCity: 'Lake Como',
    destCountry: 'Italy',
    destContinent: 'Europe',
    destLat: 45.986,
    destLng: 9.2618,
    carrierName: 'Grand Tour Route 19 / Furka Pass',
    equipmentType: 'Alpine Grand Tourer Coupe',
    routeNumber: 'CH-19 / SS340',
    travelDate: '2026-06-21',
    distanceMiles: 194,
    durationHours: 4.8,
    goodMemories:
      '• Crisp hairpin switchbacks across the Furka and Gotthard passes at golden hour\n• Espresso stop overlooking the Rhone Glacier\n• Sunset ferry crossing between Bellagio and Varenna',
    badMemories:
      '• Sudden mountain fog bank near Andermatt reduced visibility to 30 meters\n• Narrow stone walls along western Lake Como required extreme caution',
    photos: [alpsImg],
  },
  {
    id: 'sample-flight-jfk-lis',
    ownerId: 'local-guest',
    tripType: 'flight',
    originCode: 'JFK',
    originCity: 'New York',
    originCountry: 'United States',
    originContinent: 'North America',
    originLat: 40.6413,
    originLng: -73.7781,
    destCode: 'LIS',
    destCity: 'Lisbon',
    destCountry: 'Portugal',
    destContinent: 'Europe',
    destLat: 38.7756,
    destLng: -9.1354,
    carrierName: 'TAP Air Portugal',
    equipmentType: 'Airbus A321neo',
    routeNumber: 'TP 208',
    travelDate: '2026-02-18',
    distanceMiles: 3366,
    durationHours: 7.1,
    goodMemories:
      '• Warm pastel de nata fresh from the oven in Belem\n• Riding historic yellow Tram 28 through Alfama terracotta streets\n• Acoustic fado performance in Bairro Alto',
    badMemories:
      '• Terminal 1 boarding queue at JFK was delayed by 50 minutes\n• Slippery wet cobblestones after an evening Atlantic rain shower',
    photos: [lisbonImg],
  },
  {
    id: 'sample-flight-hnd-sin',
    ownerId: 'local-guest',
    tripType: 'flight',
    originCode: 'HND',
    originCity: 'Tokyo',
    originCountry: 'Japan',
    originContinent: 'Asia',
    originLat: 35.5494,
    originLng: 139.7798,
    destCode: 'SIN',
    destCity: 'Singapore',
    destCountry: 'Singapore',
    destContinent: 'Asia',
    destLat: 1.3644,
    destLng: 103.9915,
    carrierName: 'Singapore Airlines',
    equipmentType: 'Airbus A350-900',
    routeNumber: 'SQ 633',
    travelDate: '2025-11-09',
    distanceMiles: 3288,
    durationHours: 7.3,
    goodMemories:
      '• Impeccable cabin service and satay course onboard SQ 633\n• Exploring the Jewel Changi indoor rainforest vortex right after landing\n• Hainanese chicken rice at Maxwell Food Centre',
    badMemories:
      '• Intense equatorial humidity immediately outside the terminal',
    photos: [],
  },
  {
    id: 'sample-road-sfo-mry',
    ownerId: 'local-guest',
    tripType: 'roadtrip',
    originCode: 'SFO',
    originCity: 'San Francisco',
    originCountry: 'United States',
    originContinent: 'North America',
    originLat: 37.6213,
    originLng: -122.379,
    destCode: 'MRY',
    destCity: 'Big Sur / Monterey',
    destCountry: 'United States',
    destContinent: 'North America',
    destLat: 36.2704,
    destLng: -121.8081,
    carrierName: 'Pacific Coast Highway CA-1',
    equipmentType: 'Electric Touring Sedan',
    routeNumber: 'CA-1 South',
    travelDate: '2025-09-14',
    distanceMiles: 148,
    durationHours: 3.4,
    goodMemories:
      '• Crossing Bixby Creek Bridge as coastal mist lifted off the Pacific cliffs\n• Sea otters spotted near Point Lobos cove\n• Fresh sourdough chowder in Monterey harbor',
    badMemories:
      '• Single-lane construction signal south of Carmel added a 25-minute wait',
    photos: [],
  },
];
