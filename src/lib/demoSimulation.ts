/**
 * TerraSentinel Demo Simulation Engine
 * Handles the hardcoded happy path for the Earth Intelligence Swarm.
 */

export type AgentStatus = 'IDLE' | 'BUSY' | 'SCANNING' | 'PROCESSING' | 'ACTIVE' | 'COMPLETE' | 'OFFLINE';

export interface SimFinding {
  id: string;
  region: string;
  country: string;
  flag: string;
  coords: [number, number];
  miningType: string;
  severity: number;
  confidence: number;
  ndviDelta: number;
  disturbanceKm2: number;
  features: string[];
  explanation: string;
  impact: string;
  recommendations: string[];
  imageUrl: string;
  gisFindings: {
    ndvi_delta: number;
    disturbance_km2: number;
    features: string[];
    spread_velocity: string;
    mercury_risk?: boolean;
    conflict_mineral?: boolean;
    river_contamination?: boolean;
  };
  spreadVelocity: string;
  confirmedAt: string;
  imageDetails?: {
    hero: string;
    overview: string;
    evidence: string[];
    credit: string;
  };
}

export interface SimLogEntry {
  timestamp: string;
  agent: string;
  message: string;
  type: 'info' | 'alert' | 'success';
}

export interface MapOverlay {
  id: string;
  coords: [number, number];
  status: 'scanning' | 'candidate' | 'analyzing' | 'confirmed';
  radius: number;
  label: string;
}

const IMAGES = {
  amazon: {
    hero: "https://www.maapprogram.org/wp-content/uploads/2023/02/maaproject.org-maap-181-illegal-gold-mining-in-yanomami-indigenous-territory-brazil-Panel-A-Yanomani-20230210.jpg",
    overview: "https://www.maapprogram.org/wp-content/uploads/2023/02/maaproject.org-maap-181-illegal-gold-mining-in-yanomami-indigenous-territory-brazil-BaseMap-Yanomani-20230210-v4.jpg",
    evidence: [
      "https://www.maapprogram.org/wp-content/uploads/2023/02/maaproject.org-maap-181-illegal-gold-mining-in-yanomami-indigenous-territory-brazil-Panel-B-Yanomani-20230210.jpg",
      "https://www.maapprogram.org/wp-content/uploads/2023/02/maaproject.org-maap-181-illegal-gold-mining-in-yanomami-indigenous-territory-brazil-Panel-C-Yanomani-20230210.jpg",
      "https://www.maapprogram.org/wp-content/uploads/2023/02/maaproject.org-maap-181-illegal-gold-mining-in-yanomami-indigenous-territory-brazil-Panel-D-Yanomani-20230210.jpg",
      "https://www.maapprogram.org/wp-content/uploads/2023/02/maaproject.org-maap-181-illegal-gold-mining-in-yanomami-indigenous-territory-brazil-Panel-E-Yanomani-20230210.jpg"
    ],
    credit: "MAAP / Amazon Conservation Association, Sentinel-2, 2023"
  },
  congo: {
    hero: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/SRSG_visits_coltan_mine_in_Rubaya_%2813406579753%29.jpg/1280px-SRSG_visits_coltan_mine_in_Rubaya_%2813406579753%29.jpg",
    overview: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/SRSG_visits_coltan_mine_in_Rubaya_%2813406579753%29.jpg/1280px-SRSG_visits_coltan_mine_in_Rubaya_%2813406579753%29.jpg",
    evidence: [],
    credit: "UN/Sylvain Liechti via Wikimedia Commons, 2014"
  },
  indonesia: {
    hero: "https://eoimages.gsfc.nasa.gov/images/imagerecords/78000/78461/borneo.A2000198.0210.500m.jpg",
    overview: "https://eoimages.gsfc.nasa.gov/images/imagerecords/78000/78461/borneo.A2000198.0210.500m.jpg",
    evidence: [
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Illegal_Mining_West_Kalimantan.jpg/1280px-Illegal_Mining_West_Kalimantan.jpg"
    ],
    credit: "NASA Earth Observatory / Landsat 7 ETM+"
  }
};

export const DEMO_FINDINGS: SimFinding[] = [
  {
    id: "FINDING-AMZ-001",
    region: "Yanomami Territory",
    country: "Brazil",
    flag: "🇧🇷",
    coords: [3.5, -63.8],
    miningType: "Artisanal Gold (Garimpo)",
    severity: 9,
    confidence: 0.94,
    ndviDelta: -0.61,
    disturbanceKm2: 3272,
    features: ["open_pit", "bare_soil", "water_turbidity", "deforestation"],
    explanation: "High-confidence illegal artisanal gold mining detected across 3,272 km². Spectral analysis confirms active excavation, mercury-laden tailings ponds, and riparian deforestation. Immediate humanitarian and environmental intervention required.",
    impact: "Severe mercury contamination in Uraricoera river system. Critical threat to Yanomami indigenous health and biodiversity.",
    recommendations: [
      "Immediate federal law enforcement intervention (IBAMA/PF)",
      "Humanitarian medical deployment to Yanomami villages",
      "Satellite-monitored blockade of supply rivers"
    ],
    imageUrl: IMAGES.amazon.hero,
    gisFindings: {
      ndvi_delta: -0.61,
      disturbance_km2: 3272,
      features: ["open_pit", "bare_soil", "water_turbidity", "deforestation"],
      spread_velocity: "fast",
      mercury_risk: true
    },
    spreadVelocity: "Fast",
    confirmedAt: new Date().toISOString(),
    imageDetails: IMAGES.amazon
  },
  {
    id: "FINDING-COG-002",
    region: "Orientale Province",
    country: "DRC",
    flag: "🇨🇩",
    coords: [2.1, 27.4],
    miningType: "Conflict Minerals (Coltan/Gold)",
    severity: 10,
    confidence: 0.91,
    ndviDelta: -0.54,
    disturbanceKm2: 45,
    features: ["open_pit", "tunnel_collapse_risk", "bare_soil", "armed_activity_proxy"],
    explanation: "Confirmed illegal conflict mineral extraction. Pit morphology consistent with coltan/cassiterite operations. Absence of legal concession boundaries confirmed via cadastre overlay. UN referral recommended. Armed group territorial signature detected.",
    impact: "Funding of illegal armed groups (FDLR). Documented child labor and primary forest destruction.",
    recommendations: [
      "Referral to UN Panel of Experts on the DRC",
      "OECD due diligence audit of regional supply chains",
      "MONUSCO security assessment of mining perimeter"
    ],
    imageUrl: IMAGES.congo.hero,
    gisFindings: {
      ndvi_delta: -0.54,
      disturbance_km2: 45,
      features: ["open_pit", "tunnel_collapse_risk", "bare_soil", "armed_activity_proxy"],
      spread_velocity: "moderate",
      conflict_mineral: true
    },
    spreadVelocity: "Moderate",
    confirmedAt: new Date().toISOString(),
    imageDetails: IMAGES.congo
  },
  {
    id: "FINDING-IDN-003",
    region: "West Kalimantan",
    country: "Indonesia",
    flag: "🇮🇩",
    coords: [-0.5, 111.2],
    miningType: "PETI (Unlicensed Gold)",
    severity: 8,
    confidence: 0.88,
    ndviDelta: -0.38,
    disturbanceKm2: 28,
    features: ["dredge_mining", "river_turbidity", "mercury_plume", "riparian_loss"],
    explanation: "Illegal dredge mining operation confirmed along Kapuas river tributaries. Turbidity index indicates active mercury amalgamation. Dredge vessel signatures detected in SAR overlay. Indonesian ESDM ministry notification and PROPER enforcement flagged.",
    impact: "Mercury levels 40x safe limit in downstream communities. Destruction of 2,800 hectares of riparian forest.",
    recommendations: [
      "ESDM Ministry enforcement of PETI regulations",
      "River water quality remediation program",
      "Community-based alternative livelihood development"
    ],
    imageUrl: IMAGES.indonesia.hero,
    gisFindings: {
      ndvi_delta: -0.38,
      disturbance_km2: 28,
      features: ["dredge_mining", "river_turbidity", "mercury_plume", "riparian_loss"],
      spread_velocity: "moderate",
      river_contamination: true
    },
    spreadVelocity: "Moderate",
    confirmedAt: new Date().toISOString(),
    imageDetails: IMAGES.indonesia
  }
];

export interface SimCallbacks {
  onStatusChange: (agents: Record<string, AgentStatus>) => void;
  onLog: (entry: SimLogEntry) => void;
  onMapUpdate: (overlays: MapOverlay[]) => void;
  onFindingConfirmed: (finding: SimFinding) => void;
  onMissionComplete: (summary: string) => void;
}

export function runDemoSimulation(callbacks: SimCallbacks) {
  const getTimestamp = () => new Date().toLocaleTimeString();

  const agents: Record<string, AgentStatus> = {
    orchestrator: 'IDLE',
    scout_1: 'IDLE',
    scout_2: 'IDLE',
    scout_3: 'IDLE',
    priority_queue: 'IDLE',
    memory: 'IDLE',
    gis_analyst: 'IDLE',
    vision: 'IDLE',
    reasoner: 'IDLE',
    judge: 'IDLE',
    reporter: 'IDLE',
    voice: 'IDLE'
  };

  const overlays: MapOverlay[] = [];

  const timeouts: NodeJS.Timeout[] = [];

  const schedule = (delay: number, fn: () => void) => {
    timeouts.push(setTimeout(fn, delay));
  };

  // T+0.0s — Launch
  schedule(0, () => {
    agents.orchestrator = 'ACTIVE';
    callbacks.onStatusChange({ ...agents });
    callbacks.onLog({ timestamp: getTimestamp(), agent: 'ORCHESTRATOR', message: 'Mission: Global Scan — 3 priority regions queued', type: 'info' });
  });

  // T+0.8s — Scouts Scanning
  schedule(800, () => {
    agents.scout_1 = 'SCANNING';
    agents.scout_2 = 'SCANNING';
    agents.scout_3 = 'SCANNING';
    callbacks.onStatusChange({ ...agents });

    DEMO_FINDINGS.forEach(f => {
      overlays.push({ id: f.id, coords: f.coords, status: 'scanning', radius: 2, label: f.region });
    });
    callbacks.onMapUpdate([...overlays]);

    callbacks.onLog({ timestamp: getTimestamp(), agent: 'SCOUT_1', message: 'ScoutAgent dispatched to Amazon [3.5°N, 63.8°W]', type: 'info' });
    callbacks.onLog({ timestamp: getTimestamp(), agent: 'SCOUT_2', message: 'ScoutAgent dispatched to Congo Basin [2.1°N, 27.4°E]', type: 'info' });
    callbacks.onLog({ timestamp: getTimestamp(), agent: 'SCOUT_3', message: 'ScoutAgent dispatched to West Kalimantan [0.5°S, 111.2°E]', type: 'info' });
  });

  // T+2.0s — Priority Queue
  schedule(2000, () => {
    agents.priority_queue = 'PROCESSING';
    callbacks.onStatusChange({ ...agents });

    overlays.forEach(o => o.status = 'candidate');
    callbacks.onMapUpdate([...overlays]);

    callbacks.onLog({ timestamp: getTimestamp(), agent: 'PRIORITY_Q', message: 'Anomaly detected: NDVI deviation -0.61 (Amazon)', type: 'alert' });
    callbacks.onLog({ timestamp: getTimestamp(), agent: 'PRIORITY_Q', message: 'Anomaly detected: NDVI deviation -0.54 (Congo)', type: 'alert' });
  });

  // T+3.5s — GIS & Memory
  schedule(3500, () => {
    agents.gis_analyst = 'ACTIVE';
    agents.memory = 'ACTIVE';
    callbacks.onStatusChange({ ...agents });

    callbacks.onLog({ timestamp: getTimestamp(), agent: 'GIS_ANALYST', message: 'GIS analysis running — change mask generation...', type: 'info' });
    callbacks.onLog({ timestamp: getTimestamp(), agent: 'MEMORY', message: 'MemoryAgent: temporal diff computed, 18-month baseline', type: 'info' });
  });

  // T+5.0s — Vision
  schedule(5000, () => {
    agents.vision = 'ACTIVE';
    callbacks.onStatusChange({ ...agents });

    overlays.forEach(o => o.status = 'analyzing');
    callbacks.onMapUpdate([...overlays]);

    callbacks.onLog({ timestamp: getTimestamp(), agent: 'VISION', message: 'Prithvi-EO-2.0 inference: bare_soil, open_pit detected', type: 'info' });
    callbacks.onLog({ timestamp: getTimestamp(), agent: 'VISION', message: 'Feature extraction complete: 4 signatures confirmed', type: 'info' });
  });

  // T+7.0s — Reasoner
  schedule(7000, () => {
    agents.reasoner = 'ACTIVE';
    callbacks.onStatusChange({ ...agents });
    callbacks.onLog({ timestamp: getTimestamp(), agent: 'REASONER', message: 'Gemini 2.5 Pro reasoning: Amazon case...', type: 'info' });
  });

  // T+9.0s — Finding 1: Amazon
  schedule(9000, () => {
    agents.judge = 'ACTIVE';
    callbacks.onStatusChange({ ...agents });

    const amazon = overlays.find(o => o.id === DEMO_FINDINGS[0].id);
    if (amazon) amazon.status = 'confirmed';
    callbacks.onMapUpdate([...overlays]);

    callbacks.onFindingConfirmed(DEMO_FINDINGS[0]);
    callbacks.onLog({ timestamp: getTimestamp(), agent: 'JUDGE', message: 'ALERT: Illegal mining confirmed — Yanomami Territory', type: 'success' });
  });

  // T+11.0s — Reasoner Congo
  schedule(11000, () => {
    agents.reasoner = 'ACTIVE';
    callbacks.onStatusChange({ ...agents });
    callbacks.onLog({ timestamp: getTimestamp(), agent: 'REASONER', message: 'Gemini 2.5 Pro reasoning: Congo Basin case...', type: 'info' });
  });

  // T+13.0s — Finding 2: Congo
  schedule(13000, () => {
    const congo = overlays.find(o => o.id === DEMO_FINDINGS[1].id);
    if (congo) congo.status = 'confirmed';
    callbacks.onMapUpdate([...overlays]);

    callbacks.onFindingConfirmed(DEMO_FINDINGS[1]);
    callbacks.onLog({ timestamp: getTimestamp(), agent: 'JUDGE', message: 'ALERT: Conflict mineral operation confirmed — DRC', type: 'success' });
  });

  // T+15.5s — Reasoner Indonesia
  schedule(15500, () => {
    agents.reasoner = 'ACTIVE';
    callbacks.onStatusChange({ ...agents });
    callbacks.onLog({ timestamp: getTimestamp(), agent: 'REASONER', message: 'Gemini 2.5 Pro reasoning: West Kalimantan case...', type: 'info' });
  });

  // T+17.5s — Finding 3: Indonesia
  schedule(17500, () => {
    const indo = overlays.find(o => o.id === DEMO_FINDINGS[2].id);
    if (indo) indo.status = 'confirmed';
    callbacks.onMapUpdate([...overlays]);

    callbacks.onFindingConfirmed(DEMO_FINDINGS[2]);
    callbacks.onLog({ timestamp: getTimestamp(), agent: 'JUDGE', message: 'ALERT: Illegal dredge mining confirmed — Borneo', type: 'success' });
  });

  // T+18.5s — Reporter & Voice
  schedule(18500, () => {
    agents.reporter = 'ACTIVE';
    agents.voice = 'ACTIVE';
    agents.orchestrator = 'COMPLETE';
    callbacks.onStatusChange({ ...agents });

    callbacks.onLog({ timestamp: getTimestamp(), agent: 'REPORTER', message: 'Reports generated for 3 confirmed findings', type: 'info' });
    callbacks.onLog({ timestamp: getTimestamp(), agent: 'VOICE', message: 'Voice briefing ready', type: 'info' });
    callbacks.onMissionComplete('3 CONFIRMED FINDINGS — Mission complete');
  });

  return () => {
    timeouts.forEach(clearTimeout);
  };
}
