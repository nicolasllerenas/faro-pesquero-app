'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, AlertCircle, Loader2, Volume2 } from 'lucide-react';
import { ClassificationOutput } from '@/lib/classifier';
import { speakFishermanAdvice } from '@/lib/audio-player';

interface LiveMicDetectorProps {
  onClassified: (result: ClassificationOutput, sourceName: string) => void;
  voiceEnabled: boolean;
  highContrast: boolean;
  onListeningStateChange: (listening: boolean) => void;
}

export const LiveMicDetector: React.FC<LiveMicDetectorProps> = ({
  onClassified,
  voiceEnabled,
  highContrast,
  onListeningStateChange
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusText, setStatusText] = useState('Micrófono listo');

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const bufferAccumulatorRef = useRef<number[]>([]);
  const isClassifyingRef = useRef(false);

  // Stop recording on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  const startListening = async () => {
    try {
      setErrorMessage(null);
      setStatusText('Solicitando permiso de micrófono...');

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true
        }
      });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      // Create script processor with 4096 buffer size
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      const sampleRate = audioCtx.sampleRate;
      const targetRate = 16000;
      const ratio = sampleRate / targetRate;

      bufferAccumulatorRef.current = [];

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);

        // Downsample to 16kHz
        for (let i = 0; i < inputData.length; i += ratio) {
          const index = Math.floor(i);
          const sample = inputData[index] || 0;
          // Scale to 16-bit integer equivalent float range for Edge Impulse
          bufferAccumulatorRef.current.push(sample * 32767);
        }

        // When we have 16,000 samples (1 second at 16kHz)
        if (bufferAccumulatorRef.current.length >= 16000 && !isClassifyingRef.current) {
          const chunk = bufferAccumulatorRef.current.slice(0, 16000);
          bufferAccumulatorRef.current = bufferAccumulatorRef.current.slice(8000); // 50% overlap

          classifyChunk(chunk);
        }
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);

      setIsRecording(true);
      onListeningStateChange(true);
      setStatusText('Escuchando aves en el mar de Chorrillos...');
    } catch (err) {
      console.error('Error al iniciar micrófono:', err);
      setErrorMessage(
        'No se pudo acceder al micrófono. Verifique los permisos en su navegador.'
      );
      setIsRecording(false);
      onListeningStateChange(false);
    }
  };

  const classifyChunk = async (chunk: number[]) => {
    try {
      isClassifyingRef.current = true;
      setStatusText('Analizando sonido del mar...');

      const res = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          features: chunk,
          source: 'live_mic',
          location: 'Altamar - Muelle de Chorrillos',
          save: true
        })
      });

      if (!res.ok) throw new Error('Fallo al clasificar audio en vivo');
      const data: ClassificationOutput = await res.json();

      onClassified(data, 'Micrófono en Vivo');

      if (data.species !== 'Ruido_Fondo' && data.confidence >= 0.75) {
        setStatusText(`¡${data.commonName} detectado! (${Math.round(data.confidence * 100)}%)`);
        if (voiceEnabled) {
          speakFishermanAdvice(`¡${data.commonName} detectado! ${data.fishIndication}`, true);
        }
      } else {
        setStatusText('Escuchando el mar de Chorrillos...');
      }
    } catch (err) {
      console.warn('Error en clasificación de audio en vivo:', err);
    } finally {
      isClassifyingRef.current = false;
    }
  };

  const stopListening = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    bufferAccumulatorRef.current = [];
    setIsRecording(false);
    onListeningStateChange(false);
    setStatusText('Micrófono detenido');
  };

  return (
    <section className="space-y-3">
      {/* Huge Touch Button for Fishermen */}
      <button
        onClick={isRecording ? stopListening : startListening}
        className={`w-full py-4 px-6 rounded-2xl font-black text-lg sm:text-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-2xl border-3 ${
          isRecording
            ? 'bg-red-600 hover:bg-red-500 text-white border-red-300 shadow-red-600/30 animate-pulse'
            : highContrast
            ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 border-emerald-200 shadow-emerald-400/20'
            : 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 border-emerald-300 shadow-emerald-500/20'
        }`}
        style={{ minHeight: '68px' }}
        aria-label={isRecording ? 'Detener micrófono' : 'Activar micrófono en vivo'}
      >
        {isRecording ? (
          <>
            <MicOff className="w-7 h-7 text-white" />
            <span>⏹ DETENER ESCUCHA EN VIVO</span>
          </>
        ) : (
          <>
            <Mic className="w-7 h-7 text-slate-950" />
            <span>🎤 ACTIVAR MICRÓFONO EN VIVO</span>
          </>
        )}
      </button>

      {/* Live Status text */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-300">
        <span className="flex items-center gap-1.5 font-bold">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isRecording ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
            }`}
          />
          {statusText}
        </span>
        <span className="text-[11px] text-slate-400">16 kHz Muestreo</span>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </section>
  );
};
