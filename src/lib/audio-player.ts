export interface BirdAudioSample {
  id: 'piquero' | 'pelicano' | 'gaviota' | 'ruido_mar';
  name: string;
  scientificName: string;
  tagline: string;
  fileUrl: string;
  color: string;
  borderColor: string;
  badgeBg: string;
  fishTarget: string;
}

export const BIRD_SAMPLES: BirdAudioSample[] = [
  {
    id: 'piquero',
    name: 'Piquero Peruano',
    scientificName: 'Sula variegata',
    tagline: 'Picada vertical = Cardumen de Anchoveta',
    fileUrl: '/audio/piquero.wav',
    color: '#10B981',
    borderColor: 'border-emerald-500',
    badgeBg: 'bg-emerald-500/20 text-emerald-300',
    fishTarget: 'Anchoveta / Pejerrey'
  },
  {
    id: 'pelicano',
    name: 'Pelícano Peruano',
    scientificName: 'Pelecanus thagus',
    tagline: 'Vuelo costero = Corvina y Machete',
    fileUrl: '/audio/pelicano.wav',
    color: '#F59E0B',
    borderColor: 'border-amber-500',
    badgeBg: 'bg-amber-500/20 text-amber-300',
    fishTarget: 'Corvina / Lisa'
  },
  {
    id: 'gaviota',
    name: 'Gaviota Peruana',
    scientificName: 'Larus belcheri',
    tagline: 'Graznido superficial = Lorna y Pez carnada',
    fileUrl: '/audio/gaviota.wav',
    color: '#06B6D4',
    borderColor: 'border-cyan-500',
    badgeBg: 'bg-cyan-500/20 text-cyan-300',
    fishTarget: 'Lorna / Pez carnada'
  },
  {
    id: 'ruido_mar',
    name: 'Ruido Marino y Motor',
    scientificName: 'Acústica Ambiental',
    tagline: 'Oleaje chorrillano y motor de chalana',
    fileUrl: '/audio/ruido_mar.wav',
    color: '#64748B',
    borderColor: 'border-slate-500',
    badgeBg: 'bg-slate-500/20 text-slate-300',
    fishTarget: 'Sin cardumen activo'
  }
];

let globalAudio: HTMLAudioElement | null = null;

export function playSampleAudio(fileUrl: string, onEnded?: () => void): HTMLAudioElement {
  if (globalAudio) {
    globalAudio.pause();
    globalAudio.currentTime = 0;
  }

  const audio = new Audio(fileUrl);
  globalAudio = audio;
  audio.volume = 1.0;

  audio.play().catch((err) => {
    console.warn('Audio play restricted by browser policy:', err);
  });

  if (onEnded) {
    audio.onended = onEnded;
  }

  return audio;
}

export function stopSampleAudio(): void {
  if (globalAudio) {
    globalAudio.pause();
    globalAudio.currentTime = 0;
    globalAudio = null;
  }
}

export function speakFishermanAdvice(text: string, enabled = true): void {
  if (!enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-PE';
  utterance.rate = 0.95;
  utterance.pitch = 0.95;
  utterance.volume = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const spanishVoice = voices.find((v) => v.lang.startsWith('es-PE') || v.lang.startsWith('es'));
  if (spanishVoice) {
    utterance.voice = spanishVoice;
  }

  window.speechSynthesis.speak(utterance);
}
