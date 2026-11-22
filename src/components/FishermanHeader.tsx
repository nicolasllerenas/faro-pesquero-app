'use client';

import React from 'react';
import { Compass, Sun, Moon, Volume2, VolumeX, User } from 'lucide-react';
import { UserProfile } from '@/lib/db';

interface FishermanHeaderProps {
  user: UserProfile;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onOpenProfile: () => void;
}

export const FishermanHeader: React.FC<FishermanHeaderProps> = ({
  user,
  highContrast,
  onToggleHighContrast,
  voiceEnabled,
  onToggleVoice,
  onOpenProfile
}) => {
  return (
    <header
      className={`sticky top-0 z-40 border-b ${
        highContrast
          ? 'bg-slate-950 border-cyan-400/40 text-white'
          : 'bg-[#061427]/95 backdrop-blur-md border-cyan-900/60 text-white'
      }`}
    >
      {/* Top Banner: Location and User Badge */}
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Compass className="w-6 h-6 text-slate-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                Caleta Chorrillos
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <h1 className="text-xl font-black tracking-tight leading-none text-white">
              FARO PESQUERO
            </h1>
          </div>
        </div>

        {/* Control Actions */}
        <div className="flex items-center gap-2">
          {/* High Contrast / Sun Mode Toggle */}
          <button
            onClick={onToggleHighContrast}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
              highContrast
                ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-md shadow-amber-400/20'
                : 'bg-slate-900/80 text-white border-slate-700 hover:border-amber-400'
            }`}
            title="Modo Mar Alto: Máximo contraste para sol brillante en el mar"
            aria-label="Alternar modo de alto contraste para sol"
          >
            {highContrast ? (
              <>
                <Sun className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                <span>Modo Sol</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-amber-400" />
                <span>Modo Normal</span>
              </>
            )}
          </button>

          {/* Voice Alerts Toggle */}
          <button
            onClick={onToggleVoice}
            className={`p-2 rounded-xl border transition-all active:scale-95 ${
              voiceEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                : 'bg-slate-900/80 text-slate-500 border-slate-700'
            }`}
            title={voiceEnabled ? 'Voz del Faro activada' : 'Voz silenciada'}
            aria-label="Alternar alertas de voz"
          >
            {voiceEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* User Button */}
          <button
            onClick={onOpenProfile}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-left transition-all active:scale-95 ${
              highContrast
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200'
                : 'bg-slate-900/80 border-slate-700 text-white hover:border-cyan-500'
            }`}
            aria-label="Ver perfil de pescador de prueba"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold text-xs">
              DJ
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold leading-none text-white">
                {user.nickname || user.name.split(' ')[0]}
              </p>
              <p className="text-[10px] text-cyan-200 leading-none mt-0.5">{user.boatName}</p>
            </div>
            <User className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
