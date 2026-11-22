'use client';

import React, { useEffect, useRef } from 'react';
import { Waves, Zap, Fish, Compass, Volume2, ShieldCheck, Clock } from 'lucide-react';
import { ClassificationOutput } from '@/lib/classifier';
import { speakFishermanAdvice } from '@/lib/audio-player';

interface AudioRadarProps {
  isListening: boolean;
  activeDetection: ClassificationOutput | null;
  highContrast: boolean;
  voiceEnabled: boolean;
  currentSoundName?: string;
}

export const AudioRadar: React.FC<AudioRadarProps> = ({
  isListening,
  activeDetection,
  highContrast,
  voiceEnabled,
  currentSoundName
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render animated soundwave / radar sweep
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Draw subtle grid lines
      ctx.strokeStyle = highContrast ? '#1e293b' : '#0f172a';
      ctx.lineWidth = 1;
      for (let y = 10; y < height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (isListening) {
        // Draw active animated marine waves
        ctx.lineWidth = 3;
        const wavesCount = 3;

        for (let w = 0; w < wavesCount; w++) {
          ctx.beginPath();
          ctx.strokeStyle =
            w === 0
              ? highContrast
                ? '#38bdf8'
                : '#06b6d4'
              : w === 1
              ? highContrast
                ? '#4ade80'
                : '#10b981'
              : '#f59e0b';

          for (let x = 0; x < width; x++) {
            const freq = 0.025 + w * 0.01;
            const amp = (height / 4) * (w === 0 ? 0.9 : 0.6) * Math.sin(phase * 0.5);
            const y = centerY + Math.sin(x * freq + phase * (w + 1)) * amp;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        phase += 0.08;
      } else {
        // Resting gentle wave
        ctx.beginPath();
        ctx.strokeStyle = highContrast ? '#475569' : '#334155';
        ctx.lineWidth = 2;
        for (let x = 0; x < width; x++) {
          const y = centerY + Math.sin(x * 0.02 + phase) * 8;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        phase += 0.02;
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isListening, highContrast]);

  const handleSpeak = () => {
    if (!activeDetection) return;
    const text = `Don Jacinto: ${activeDetection.commonName} detectado al ${Math.round(
      activeDetection.confidence * 100
    )} por ciento. ${activeDetection.fishIndication}. ${activeDetection.advice}`;
    speakFishermanAdvice(text, true);
  };

  const getSpeciesColor = (species: string) => {
    switch (species) {
      case 'Piquero':
        return {
          bg: 'bg-emerald-950/80',
          border: 'border-emerald-400',
          text: 'text-emerald-400',
          badge: 'bg-emerald-500 text-slate-950',
          cardGlow: 'shadow-emerald-500/20'
        };
      case 'Pelicano':
        return {
          bg: 'bg-amber-950/80',
          border: 'border-amber-400',
          text: 'text-amber-400',
          badge: 'bg-amber-500 text-slate-950',
          cardGlow: 'shadow-amber-500/20'
        };
      case 'Gaviota':
        return {
          bg: 'bg-cyan-950/80',
          border: 'border-cyan-400',
          text: 'text-cyan-400',
          badge: 'bg-cyan-500 text-slate-950',
          cardGlow: 'shadow-cyan-500/20'
        };
      default:
        return {
          bg: 'bg-slate-900/80',
          border: 'border-slate-600',
          text: 'text-slate-300',
          badge: 'bg-slate-600 text-white',
          cardGlow: 'shadow-slate-500/10'
        };
    }
  };

  const currentTheme = activeDetection
    ? getSpeciesColor(activeDetection.species)
    : {
        bg: 'bg-slate-900/80',
        border: 'border-slate-700',
        text: 'text-cyan-400',
        badge: 'bg-cyan-600 text-white',
        cardGlow: ''
      };

  return (
    <section className="space-y-4">
      {/* Visualizer Frame */}
      <div
        className={`relative overflow-hidden rounded-2xl border-2 transition-all shadow-xl ${
          highContrast
            ? 'bg-black border-cyan-400/60 shadow-cyan-950/50'
            : 'bg-[#040d1a] border-cyan-800/60 shadow-black/60'
        }`}
      >
        {/* Radar Header */}
        <div className="p-3.5 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                isListening ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
              }`}
            />
            <span className="text-sm font-black uppercase tracking-wider text-slate-200">
              {isListening ? 'Radar Acústico Activo' : 'Radar Acústico en Espera'}
            </span>
          </div>

          {currentSoundName && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-900/60 text-cyan-300 border border-cyan-500/30">
              {currentSoundName}
            </span>
          )}
        </div>

        {/* Oscilloscope Canvas */}
        <div className="relative h-28 w-full bg-gradient-to-b from-transparent to-slate-950/60">
          <canvas
            ref={canvasRef}
            width={600}
            height={112}
            className="w-full h-full block"
          />

          {/* Center Target Marker */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full border border-cyan-500/20 border-dashed animate-spin-slow" />
          </div>
        </div>
      </div>

      {/* Detection Result Card (Senior-First Design: Huge readable card) */}
      {activeDetection ? (
        <div
          className={`rounded-2xl border-3 p-5 transition-all shadow-2xl ${currentTheme.bg} ${
            currentTheme.border
          } ${currentTheme.cardGlow} ${
            highContrast ? 'ring-2 ring-white/20' : ''
          }`}
          role="region"
          aria-live="polite"
        >
          {/* Header row with species badge and confidence */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                {activeDetection.species === 'Piquero' && (
                  <Zap className="w-7 h-7 text-emerald-300" />
                )}
                {activeDetection.species === 'Pelicano' && (
                  <Fish className="w-7 h-7 text-amber-300" />
                )}
                {activeDetection.species === 'Gaviota' && (
                  <Compass className="w-7 h-7 text-cyan-300" />
                )}
                {activeDetection.species === 'Ruido_Fondo' && (
                  <Waves className="w-7 h-7 text-slate-300" />
                )}
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Ave Marina Detectada
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {activeDetection.commonName}
                </h2>
                <p className="text-xs italic text-slate-300">
                  {activeDetection.scientificName}
                </p>
              </div>
            </div>

            {/* Confidence Badge */}
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                Certeza del Modelo
              </span>
              <span
                className={`text-2xl font-black px-3 py-1 rounded-xl shadow-lg ${currentTheme.badge}`}
              >
                {Math.round(activeDetection.confidence * 100)}%
              </span>
            </div>
          </div>

          {/* Confidence Progress Bar */}
          <div className="mt-4 w-full h-3 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                activeDetection.species === 'Piquero'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-300'
                  : activeDetection.species === 'Pelicano'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-300'
                  : activeDetection.species === 'Gaviota'
                  ? 'bg-gradient-to-r from-cyan-500 to-sky-300'
                  : 'bg-slate-500'
              }`}
              style={{ width: `${Math.round(activeDetection.confidence * 100)}%` }}
            />
          </div>

          {/* Fisher Advice Box (High Contrast, Large Font) */}
          <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
            <div className="flex items-start gap-2.5">
              <Fish className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase text-amber-400">
                  Indicación de Pesca:
                </p>
                <p className="text-base sm:text-lg font-bold text-white leading-snug">
                  {activeDetection.fishIndication}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase text-emerald-400">
                  Consejo para Don Jacinto:
                </p>
                <p className="text-sm sm:text-base font-semibold text-slate-200">
                  {activeDetection.advice}
                </p>
              </div>
            </div>
          </div>

          {/* Voice Announce Button */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              onClick={handleSpeak}
              className="flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-white text-slate-950 font-black text-base shadow-lg hover:bg-slate-100 active:scale-95 transition-all"
            >
              <Volume2 className="w-5 h-5 text-slate-950" />
              Escuchar Consejo con Voz
            </button>

            <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5" />
              {activeDetection.executionTimeMs}ms
            </span>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div
          className={`rounded-2xl border-2 border-dashed p-6 text-center space-y-2 ${
            highContrast
              ? 'border-slate-700 bg-slate-950/40 text-slate-300'
              : 'border-slate-800 bg-slate-900/40 text-slate-400'
          }`}
        >
          <Waves className="w-10 h-10 mx-auto text-cyan-400/60 animate-bounce" />
          <h3 className="text-lg font-black text-white">
            El Mar está en Silencio
          </h3>
          <p className="text-sm max-w-md mx-auto text-slate-300">
            Use el <strong className="text-emerald-400">Banco de Pruebas</strong> abajo para probar
            el detector de inmediato o active el micrófono en vivo.
          </p>
        </div>
      )}
    </section>
  );
};
