'use client';

import React, { useState } from 'react';
import { Play, Loader2, Sparkles, Volume2, ShieldAlert } from 'lucide-react';
import { BIRD_SAMPLES, playSampleAudio, stopSampleAudio, speakFishermanAdvice } from '@/lib/audio-player';
import { ClassificationOutput } from '@/lib/classifier';

interface DemoSoundboardProps {
  onClassified: (result: ClassificationOutput, soundName: string) => void;
  voiceEnabled: boolean;
  highContrast: boolean;
}

export const DemoSoundboard: React.FC<DemoSoundboardProps> = ({
  onClassified,
  voiceEnabled,
  highContrast
}) => {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [playingKey, setPlayingKey] = useState<string | null>(null);

  const handleTestSound = async (sampleKey: 'piquero' | 'pelicano' | 'gaviota' | 'ruido_mar') => {
    try {
      setLoadingKey(sampleKey);
      setPlayingKey(sampleKey);

      const sample = BIRD_SAMPLES.find((s) => s.id === sampleKey);
      if (!sample) return;

      // 1. Play real audio sample through speakers
      playSampleAudio(sample.fileUrl, () => {
        setPlayingKey(null);
      });

      // 2. Call classify API endpoint
      const res = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sample: sampleKey, save: true })
      });

      if (!res.ok) {
        throw new Error('Fallo al ejecutar la clasificación del modelo');
      }

      const data: ClassificationOutput = await res.json();
      onClassified(data, sample.name);

      // 3. Voice announcement if enabled
      if (voiceEnabled) {
        const voiceText = `¡${data.commonName} detectado! ${data.fishIndication}. ${data.advice}`;
        speakFishermanAdvice(voiceText, true);
      }
    } catch (err) {
      console.error('Error en prueba de sonido:', err);
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <section className="space-y-3">
      {/* Section Title with High-Contrast Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
            Banco de Pruebas de Sonido (Demo)
          </h2>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
          Edge Impulse v3
        </span>
      </div>

      <p className="text-xs sm:text-sm text-slate-300 leading-snug">
        Toque cualquier botón para reproducir el sonido real y activar el detector
        automáticamente en vivo:
      </p>

      {/* 4 Large Senior-Friendly Buttons (Grid 2x2 or Stacked on Mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {BIRD_SAMPLES.map((sample) => {
          const isLoading = loadingKey === sample.id;
          const isPlaying = playingKey === sample.id;

          return (
            <button
              key={sample.id}
              onClick={() => handleTestSound(sample.id)}
              disabled={isLoading}
              className={`group relative overflow-hidden text-left p-4 rounded-2xl border-2 transition-all active:scale-[0.98] shadow-lg flex items-center justify-between gap-3 ${
                sample.borderColor
              } ${
                highContrast
                  ? 'bg-slate-950 text-white hover:bg-slate-900'
                  : 'bg-slate-900/90 text-white hover:bg-slate-800'
              } ${isPlaying ? 'ring-4 ring-cyan-400/50' : ''}`}
              style={{ minHeight: '74px' }}
              aria-label={`Reproducir y clasificar sonido de ${sample.name}`}
            >
              {/* Left Accent Bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-2"
                style={{ backgroundColor: sample.color }}
              />

              <div className="pl-2 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                    {sample.name}
                  </h3>
                  {isPlaying && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                    </span>
                  )}
                </div>
                <p className="text-xs font-medium text-slate-300 leading-tight">
                  {sample.tagline}
                </p>
                <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md ${sample.badgeBg}`}>
                  Objetivo: {sample.fishTarget}
                </span>
              </div>

              {/* Play / Status Icon Button */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                  isPlaying
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 animate-pulse'
                    : 'bg-white/10 text-white border-white/20 group-hover:bg-white group-hover:text-slate-950'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                ) : isPlaying ? (
                  <Volume2 className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 fill-current" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
        <span>Frecuencia del modelo: 16,000 Hz (1.0 seg)</span>
        <button
          onClick={stopSampleAudio}
          className="text-xs text-slate-400 hover:text-white underline font-bold"
        >
          Detener audio
        </button>
      </div>
    </section>
  );
};
