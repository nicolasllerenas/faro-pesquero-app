'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Anchor, Fish, Compass, ExternalLink } from 'lucide-react';
import { FishingSpot } from '@/lib/db';

interface FishingSpotsGuideProps {
  highContrast: boolean;
}

export const FishingSpotsGuide: React.FC<FishingSpotsGuideProps> = ({ highContrast }) => {
  const [spots, setSpots] = useState<FishingSpot[]>([]);

  useEffect(() => {
    fetch('/api/spots')
      .then((res) => res.json())
      .then((data) => {
        if (data.spots) setSpots(data.spots);
      })
      .catch((err) => console.error('Error fetching spots:', err));
  }, []);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Anchor className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
            Zonas de Pesca en Chorrillos
          </h2>
        </div>
        <span className="text-xs text-slate-400">Mar de Grau</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {spots.map((spot) => (
          <div
            key={spot.id}
            className={`p-4 rounded-2xl border-2 transition-all space-y-2 ${
              highContrast
                ? 'bg-slate-950 border-slate-700 text-white'
                : 'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-cyan-500/50'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400 shrink-0" />
                <h3 className="text-base font-black text-white leading-tight">
                  {spot.name}
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 shrink-0">
                {spot.distanceFromPierKm} km del muelle
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-snug">
              {spot.description}
            </p>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Profundidad: <strong className="text-white">{spot.depthMeters} m</strong>
              </span>
              <span className="text-amber-400 font-bold">
                {spot.recommendedNet.split('/')[0]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
