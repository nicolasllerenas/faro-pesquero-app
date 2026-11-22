import fs from 'fs';
import path from 'path';

export interface UserProfile {
  id: string;
  name: string;
  nickname: string;
  role: string;
  boatName: string;
  registrationNumber: string;
  pier: string;
  cove: string;
  association: string;
  yearsOfExperience: number;
  avatarUrl: string;
  phone: string;
  preferences: {
    highContrastMode: boolean;
    voiceAlerts: boolean;
    largeFont: boolean;
    vibrationFeedback: boolean;
    alertVolume: number;
    autoSaveDetections: boolean;
  };
}

export interface DetectionRecord {
  id: string;
  timestamp: string;
  species: 'Piquero' | 'Pelicano' | 'Gaviota' | 'Ruido_Fondo';
  commonName: string;
  scientificName: string;
  confidence: number;
  location: string;
  coordinates: { lat: number; lng: number };
  advice: string;
  fishIndication: string;
  source: 'live_mic' | 'demo_sample' | 'audio_upload';
  verifiedByFisherman?: boolean;
}

export interface FishingSpot {
  id: string;
  name: string;
  description: string;
  depthMeters: number;
  recommendedNet: string;
  commonSpecies: string[];
  lat: number;
  lng: number;
  distanceFromPierKm: number;
}

interface DatabaseSchema {
  user: UserProfile;
  detections: DetectionRecord[];
  spots: FishingSpot[];
}

const defaultUser: UserProfile = {
  id: 'don-jacinto',
  name: 'Don Jacinto Ramos Morales',
  nickname: 'El Cholo Jacinto',
  role: 'Patrón Pescador Artesanal',
  boatName: 'Flor del Mar III',
  registrationNumber: 'CO-12948-BM',
  pier: 'Muelle Artesanal de Chorrillos',
  cove: 'Caleta Chorrillos - Agua Dulce',
  association: 'Asociación de Pescadores Artesanales José Olaya Balandra',
  yearsOfExperience: 48,
  avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&h=200&fit=crop&crop=faces',
  phone: '+51 984 512 830',
  preferences: {
    highContrastMode: true,
    voiceAlerts: true,
    largeFont: true,
    vibrationFeedback: true,
    alertVolume: 100,
    autoSaveDetections: true
  }
};

const defaultSpots: FishingSpot[] = [
  {
    id: 'morro-solar',
    name: 'Bajo del Morro Solar',
    description: 'Zona rocosa profunda con fuertes corrientes. Los piqueros se lanzan en picada vertical cuando sube la anchoveta.',
    depthMeters: 18,
    recommendedNet: 'Red de cerco / Cortina de 2 brazas',
    commonSpecies: ['Piquero', 'Pelicano'],
    lat: -12.1702,
    lng: -77.0345,
    distanceFromPierKm: 1.4
  },
  {
    id: 'salto-fraile',
    name: 'El Salto del Fraile',
    description: 'Corriente rompiente ideal para corvina y lornas. Presencia continua de gaviotas y pelícanos sobre peñas.',
    depthMeters: 12,
    recommendedNet: 'Espinel de fondo / Pinta manual',
    commonSpecies: ['Gaviota', 'Pelicano'],
    lat: -12.1768,
    lng: -77.0382,
    distanceFromPierKm: 2.3
  },
  {
    id: 'la-herradura',
    name: 'Bajo de La Herradura',
    description: 'Fondo mixto de piedra y arena. Gran afluencia de pejerrey y lorna cuando las bandadas de piqueros graznan alto.',
    depthMeters: 15,
    recommendedNet: 'Red agallera / Trasmallo',
    commonSpecies: ['Piquero', 'Gaviota'],
    lat: -12.1834,
    lng: -77.0421,
    distanceFromPierKm: 3.1
  },
  {
    id: 'muelle-chorrillos',
    name: 'Frente al Muelle de Chorrillos',
    description: 'Zona de salida y caleta mansa. Pelícanos descansan en los peñeros esperando el descarte del día.',
    depthMeters: 6,
    recommendedNet: 'Pinta costera / Línea de mano',
    commonSpecies: ['Pelicano', 'Gaviota'],
    lat: -12.1605,
    lng: -77.0312,
    distanceFromPierKm: 0.2
  }
];

const defaultDetections: DetectionRecord[] = [
  {
    id: 'det-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    species: 'Piquero',
    commonName: 'Piquero Peruano',
    scientificName: 'Sula variegata',
    confidence: 0.985,
    location: 'Bajo del Morro Solar',
    coordinates: { lat: -12.1702, lng: -77.0345 },
    advice: '¡Cardumen en superficie! Echar red de cortina a 2 brazas de profundidad.',
    fishIndication: 'Anchoveta y Pejerrey en cardumen compacto',
    source: 'live_mic',
    verifiedByFisherman: true
  },
  {
    id: 'det-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    species: 'Pelicano',
    commonName: 'Pelícano Peruano',
    scientificName: 'Pelecanus thagus',
    confidence: 0.942,
    location: 'El Salto del Fraile',
    coordinates: { lat: -12.1768, lng: -77.0382 },
    advice: 'Peces cerca a las rocas. Mantener distancia segura del reventazón.',
    fishIndication: 'Corvina y Machete de orilla',
    source: 'live_mic',
    verifiedByFisherman: true
  },
  {
    id: 'det-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    species: 'Gaviota',
    commonName: 'Gaviota Peruana',
    scientificName: 'Larus belcheri',
    confidence: 0.915,
    location: 'Bajo de La Herradura',
    coordinates: { lat: -12.1834, lng: -77.0421 },
    advice: 'Peces carnada dispersos. Usar espinel o anzuelo número 5.',
    fishIndication: 'Lorna y Pejerrey superficial',
    source: 'demo_sample',
    verifiedByFisherman: false
  }
];

const dataDir = path.join(process.cwd(), 'data');
const dbFilePath = path.join(dataDir, 'db.json');

let memoryDb: DatabaseSchema = {
  user: defaultUser,
  detections: defaultDetections,
  spots: defaultSpots
};

function ensureDbLoaded(): DatabaseSchema {
  try {
    if (fs.existsSync(dbFilePath)) {
      const content = fs.readFileSync(dbFilePath, 'utf8');
      const parsed = JSON.parse(content);
      memoryDb = {
        user: { ...defaultUser, ...parsed.user },
        detections: parsed.detections || defaultDetections,
        spots: parsed.spots || defaultSpots
      };
      return memoryDb;
    }
  } catch (err) {
    console.warn('Using in-memory DB fallback:', err);
  }

  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(dbFilePath, JSON.stringify(memoryDb, null, 2), 'utf8');
  } catch (err) {
    // If running in read-only environment (e.g. Vercel serverless), maintain in memory
  }

  return memoryDb;
}

function persistDb(): void {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(dbFilePath, JSON.stringify(memoryDb, null, 2), 'utf8');
  } catch (err) {
    // Vercel serverless filesystem read-only safe fallback
  }
}

export function getUser(): UserProfile {
  ensureDbLoaded();
  return memoryDb.user;
}

export function updateUser(updates: Partial<UserProfile>): UserProfile {
  ensureDbLoaded();
  memoryDb.user = {
    ...memoryDb.user,
    ...updates,
    preferences: {
      ...memoryDb.user.preferences,
      ...(updates.preferences || {})
    }
  };
  persistDb();
  return memoryDb.user;
}

export function getDetections(): DetectionRecord[] {
  ensureDbLoaded();
  return memoryDb.detections.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function addDetection(detection: Omit<DetectionRecord, 'id' | 'timestamp'>): DetectionRecord {
  ensureDbLoaded();
  const newRecord: DetectionRecord = {
    ...detection,
    id: `det-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString()
  };
  memoryDb.detections.unshift(newRecord);
  persistDb();
  return newRecord;
}

export function clearDetections(): void {
  ensureDbLoaded();
  memoryDb.detections = [];
  persistDb();
}

export function getSpots(): FishingSpot[] {
  ensureDbLoaded();
  return memoryDb.spots;
}
