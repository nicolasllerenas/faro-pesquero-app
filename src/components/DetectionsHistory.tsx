'use client';

import React, { useState, useEffect } from 'react';
import { History, Trash2, MapPin, Zap, Fish, Compass, Waves, CheckCircle2, RefreshCw } from 'lucide-react';
import { DetectionRecord } from '@/lib/db';

interface DetectionsHistoryProps {
  highContrast: boolean;
  refreshTrigger?: number;
}

export const DetectionsHistory: React.FC<DetectionsHistoryProps> = ({
  highContrast,
  refreshTrigger
}) => {
  const [detections, setDetections] = useState<DetectionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('todos');

  const fetchDetections = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/detections');
      if (res.ok) {
        const data = await res.json();
        setDetections(data.detections || []);
      }
    } catch (err) {
      console.error('Error al cargar bitácora:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetections();
  }, [refreshTrigger]);

  const handleClear = async () => {
    if (!confirm('¿Desea limpiar toda la bitácora de capturas acústicas?')) return;
    try {
      const res = await fetch('/api/detections', { method: 'DELETE' });
      if (res.ok) {
        setDetections([]);
      }
    } catch (err) {
      console.error('Error al limpiar bitácora:', err);
    }
  };

  const filtered = detections.filter((d) => {
    if (filter === 'todos') return true;
    return d.species === filter;
  });

  const getSpeciesIcon = (species: string) => {
    switch (species) {
      case 'Piquero':
        return <Zap className="w-5 h-5 text-emerald-400" />;
      case 'Pelicano':
        return <Fish className="w-5 h-5 text-amber-400" />;
      case 'Gaviota':
        return <Compass className="w-5 h-5 text-cyan-400" />;
      default:
        return <Waves className="w-5 h-5 text-slate-400" />;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <section className="space-y-3">
      {/* Header with Title and Clear Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
            Bitácora de Pesca (Chorrillos)
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDetections}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            title="Actualizar bitácora"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {detections.length > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-bold px-2 py-1 rounded-lg bg-red-950/40 border border-red-500/30"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['todos', 'Piquero', 'Pelicano', 'Gaviota'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 rounded-xl text-xs font-black transition-all shrink-0 ${
              filter === cat
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 text-slate-300 border border-slate-700 hover:border-slate-500'
            }`}
          >
            {cat === 'todos' ? 'Todas las Aves' : cat}
          </button>
        ))}
      </div>

      {/* List of Detections */}
      {filtered.length > 0 ? (
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border-2 transition-all ${
                highContrast
                  ? 'bg-slate-950 border-slate-700 text-white'
                  : 'bg-slate-900/90 border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-white/10 shrink-0">
                    {getSpeciesIcon(item.species)}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white leading-none">
                      {item.commonName}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      {item.location}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span className="text-xs font-bold text-slate-400">
                    {formatTime(item.timestamp)}
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mt-0.5">
                    {Math.round(item.confidence * 100)}% certeza
                  </span>
                </div>
              </div>

              {/* Catch indication */}
              <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-start gap-1.5 text-xs text-amber-300">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                <span className="font-semibold">{item.fishIndication}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-400">
          No hay registros de aves marinas en esta categoría aún.
        </div>
      )}
    </section>
  );
};
