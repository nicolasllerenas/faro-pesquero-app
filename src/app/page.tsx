'use client';

import React, { useState, useEffect } from 'react';
import { FishermanHeader } from '@/components/FishermanHeader';
import { AudioRadar } from '@/components/AudioRadar';
import { DemoSoundboard } from '@/components/DemoSoundboard';
import { LiveMicDetector } from '@/components/LiveMicDetector';
import { DetectionsHistory } from '@/components/DetectionsHistory';
import { FishingSpotsGuide } from '@/components/FishingSpotsGuide';
import { UserProfileModal } from '@/components/UserProfileModal';
import { ClassificationOutput } from '@/lib/classifier';
import { UserProfile } from '@/lib/db';
import { Anchor, Shield } from 'lucide-react';

const fallbackUser: UserProfile = {
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
  avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&h=200&fit=crop',
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

export default function Home() {
  const [user, setUser] = useState<UserProfile>(fallbackUser);
  const [activeDetection, setActiveDetection] = useState<ClassificationOutput | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [highContrast, setHighContrast] = useState<boolean>(true);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [currentSoundName, setCurrentSoundName] = useState<string>('');

  useEffect(() => {
    fetch('/api/user')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          if (typeof data.user.preferences?.highContrastMode === 'boolean') {
            setHighContrast(data.user.preferences.highContrastMode);
          }
          if (typeof data.user.preferences?.voiceAlerts === 'boolean') {
            setVoiceEnabled(data.user.preferences.voiceAlerts);
          }
        }
      })
      .catch((err) => console.warn('Could not fetch user, using fallback:', err));
  }, []);

  const handleClassified = (result: ClassificationOutput, soundName: string) => {
    setActiveDetection(result);
    setCurrentSoundName(soundName);
    setIsListening(true);
    setRefreshTrigger((prev) => prev + 1);

    setTimeout(() => {
      setIsListening(false);
    }, 4000);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 font-sans ${
        highContrast
          ? 'bg-slate-950 text-white selection:bg-cyan-500 selection:text-black'
          : 'bg-[#040C18] text-white selection:bg-cyan-500 selection:text-black'
      }`}
    >
      {/* Top Fisherman Header */}
      <FishermanHeader
        user={user}
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast((prev) => !prev)}
        voiceEnabled={voiceEnabled}
        onToggleVoice={() => setVoiceEnabled((prev) => !prev)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 py-5 space-y-6">
        {/* Greeting & Boat Status Card */}
        <div
          className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-3 ${
            highContrast
              ? 'bg-slate-900/90 border-cyan-400/40 text-white'
              : 'bg-[#081B33]/80 border-cyan-800/60 text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center shrink-0">
              <Anchor className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-cyan-400">
                  Patrón de Chalana
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  Listo en el Mar
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                {user.name} ({user.boatName})
              </h2>
              <p className="text-xs text-cyan-100">
                Matrícula: <strong className="text-cyan-300 font-mono">{user.registrationNumber}</strong> · Caleta Chorrillos
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsProfileOpen(true)}
            className="shrink-0 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 transition-all active:scale-95"
          >
            Ver Datos
          </button>
        </div>

        {/* Audio Radar & Active Detection Component */}
        <AudioRadar
          isListening={isListening}
          activeDetection={activeDetection}
          highContrast={highContrast}
          voiceEnabled={voiceEnabled}
          currentSoundName={currentSoundName}
        />

        {/* Live Microphone Detector (Senior-First: Big Button) */}
        <LiveMicDetector
          onClassified={handleClassified}
          voiceEnabled={voiceEnabled}
          highContrast={highContrast}
          onListeningStateChange={setIsListening}
        />

        {/* Demo Soundboard (Essential for User Testing & Presentation) */}
        <DemoSoundboard
          onClassified={handleClassified}
          voiceEnabled={voiceEnabled}
          highContrast={highContrast}
        />

        {/* Detections History (Lightweight DB log) */}
        <DetectionsHistory
          highContrast={highContrast}
          refreshTrigger={refreshTrigger}
        />

        {/* Fishing Spots Guide (Morro Solar, Salto del Fraile, etc.) */}
        <FishingSpotsGuide highContrast={highContrast} />

        {/* Model Attribution Footer */}
        <footer className="pt-4 pb-8 border-t border-slate-800 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-300">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>
              Modelo Acústico: <strong>Edge Impulse #1134969 (Faro_Pesquero_IA)</strong>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 max-w-md mx-auto">
            Desarrollado para la Asociación de Pescadores Artesanales José Olaya Balandra de Chorrillos.
            Diseñado para operar en altamar con o sin conexión a internet.
          </p>
        </footer>
      </main>

      {/* User Profile Modal */}
      <UserProfileModal
        user={user}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onUpdateUser={setUser}
      />
    </div>
  );
}
