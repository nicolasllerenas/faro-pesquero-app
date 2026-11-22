import fs from 'fs';
import path from 'path';
import vm from 'vm';

export interface ClassificationRawResult {
  label: string;
  value: number;
}

export interface ClassificationOutput {
  success: boolean;
  species: 'Piquero' | 'Pelicano' | 'Gaviota' | 'Ruido_Fondo';
  commonName: string;
  scientificName: string;
  confidence: number;
  results: ClassificationRawResult[];
  fishIndication: string;
  advice: string;
  urgency: 'alta' | 'media' | 'baja' | 'ninguna';
  iconName: string;
  executionTimeMs: number;
}

interface EdgeImpulseClassifierInstance {
  init(): Promise<void>;
  getProjectInfo(): { name: string; owner: string; deploy_version: number };
  classify(features: Float32Array): {
    anomaly: number;
    results: Array<{ label: string; value: number }>;
  };
}

let cachedClassifier: EdgeImpulseClassifierInstance | null = null;
let initPromise: Promise<EdgeImpulseClassifierInstance> | null = null;

async function getOrInitClassifier(): Promise<EdgeImpulseClassifierInstance> {
  if (cachedClassifier) return cachedClassifier;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const wasmPath = path.join(process.cwd(), 'public', 'ei', 'edge-impulse-standalone.wasm');
    const jsPath = path.join(process.cwd(), 'public', 'ei', 'edge-impulse-standalone.js');
    const runPath = path.join(process.cwd(), 'public', 'ei', 'run-impulse.js');

    const wasmBinary = fs.readFileSync(wasmPath);
    const jsCode = fs.readFileSync(jsPath, 'utf8');
    const runCode = fs.readFileSync(runPath, 'utf8');

    const sandbox: Record<string, unknown> = {
      window: {},
      document: { currentScript: null, createElement: () => ({}) },
      location: { href: 'http://localhost:3000' },
      navigator: { userAgent: 'Mozilla/5.0' },
      self: {},
      WebAssembly: WebAssembly,
      Float32Array: Float32Array,
      Uint8Array: Uint8Array,
      console: console,
      setTimeout: setTimeout,
      clearTimeout: clearTimeout
    };
    sandbox.self = sandbox.window;
    // @ts-expect-error Mocking window.self
    sandbox.window.self = sandbox.window;

    vm.createContext(sandbox);

    // Prepare Module before runCode
    sandbox.Module = { wasmBinary: wasmBinary };
    vm.runInContext(runCode + '\nwindow.EdgeImpulseClassifier = EdgeImpulseClassifier;', sandbox);

    await new Promise<void>((resolve, reject) => {
      // @ts-expect-error Emscripten module hooks
      const origInit = sandbox.Module.onRuntimeInitialized;
      // @ts-expect-error Emscripten module hooks
      sandbox.Module.onRuntimeInitialized = () => {
        try {
          if (origInit) origInit();
          // @ts-expect-error Emscripten module init
          sandbox.Module.init();
          resolve();
        } catch (e) {
          reject(e);
        }
      };
      vm.runInContext(jsCode, sandbox);
    });

    // @ts-expect-error EdgeImpulseClassifier constructor
    const instance = new sandbox.window.EdgeImpulseClassifier() as EdgeImpulseClassifierInstance;
    await instance.init();
    cachedClassifier = instance;
    return instance;
  })();

  return initPromise;
}

export function getSpeciesMetadata(label: string): {
  species: 'Piquero' | 'Pelicano' | 'Gaviota' | 'Ruido_Fondo';
  commonName: string;
  scientificName: string;
  fishIndication: string;
  advice: string;
  urgency: 'alta' | 'media' | 'baja' | 'ninguna';
  iconName: string;
} {
  switch (label) {
    case 'Piquero':
      return {
        species: 'Piquero',
        commonName: 'Piquero Peruano',
        scientificName: 'Sula variegata',
        fishIndication: '¡Cardumen denso de Anchoveta y Pejerrey en superficie!',
        advice: 'Piqueros lanzándose en picada vertical. Echar red de cerco o cortina a 2 brazas de inmediato.',
        urgency: 'alta',
        iconName: 'Zap'
      };
    case 'Pelicano':
      return {
        species: 'Pelicano',
        commonName: 'Pelícano Peruano',
        scientificName: 'Pelecanus thagus',
        fishIndication: 'Peces mayores de costa: Corvina, Machete y Lisa.',
        advice: 'Pelícanos acuatizando cerca a los peñeros. Probar con espinel o pinta manual manteniendo distancia del oleaje.',
        urgency: 'media',
        iconName: 'Fish'
      };
    case 'Gaviota':
      return {
        species: 'Gaviota',
        commonName: 'Gaviota Peruana',
        scientificName: 'Larus belcheri',
        fishIndication: 'Peces carnada dispersos y Lorna en movimiento superficial.',
        advice: 'Bandada comiendo en superficie. Buen momento para curricán o anzuelo número 5.',
        urgency: 'media',
        iconName: 'Compass'
      };
    case 'Ruido_Fondo':
    default:
      return {
        species: 'Ruido_Fondo',
        commonName: 'Ruido de Fondo (Mar y Motor)',
        scientificName: 'Acústica Marina Ambiental',
        fishIndication: 'Sin cardumen evidente en la zona de escucha.',
        advice: 'Mar tranquilo o ruido del motor de la chalana. Avanzar 500 metros hacia el Morro Solar.',
        urgency: 'ninguna',
        iconName: 'Waves'
      };
  }
}

export async function runClassification(audioSamples: Float32Array): Promise<ClassificationOutput> {
  const startTime = Date.now();
  const classifier = await getOrInitClassifier();

  // Ensure length matches 16000 samples (1.0 sec at 16kHz)
  let input = audioSamples;
  if (input.length !== 16000) {
    const padded = new Float32Array(16000);
    const len = Math.min(input.length, 16000);
    for (let i = 0; i < len; i++) {
      padded[i] = input[i];
    }
    input = padded;
  }

  const raw = classifier.classify(input);
  const results = raw.results || [];

  // Sort by confidence value descending
  results.sort((a, b) => b.value - a.value);
  const topResult = results[0] || { label: 'Ruido_Fondo', value: 1.0 };

  const meta = getSpeciesMetadata(topResult.label);

  return {
    success: true,
    species: meta.species,
    commonName: meta.commonName,
    scientificName: meta.scientificName,
    confidence: Number(topResult.value.toFixed(4)),
    results: results.map((r) => ({
      label: r.label,
      value: Number(r.value.toFixed(4))
    })),
    fishIndication: meta.fishIndication,
    advice: meta.advice,
    urgency: meta.urgency,
    iconName: meta.iconName,
    executionTimeMs: Date.now() - startTime
  };
}

export async function runSampleClassification(sampleKey: 'piquero' | 'pelicano' | 'gaviota' | 'ruido_mar'): Promise<ClassificationOutput> {
  const wavPath = path.join(process.cwd(), 'public', 'audio', `${sampleKey}.wav`);
  if (!fs.existsSync(wavPath)) {
    throw new Error(`Sample file not found: ${wavPath}`);
  }

  const buf = fs.readFileSync(wavPath);
  const data = buf.subarray(44);
  const samples = new Float32Array(data.length / 2);
  for (let i = 0; i < samples.length; i++) {
    samples[i] = data.readInt16LE(i * 2);
  }

  return runClassification(samples);
}
