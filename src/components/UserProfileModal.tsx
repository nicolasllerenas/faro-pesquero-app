'use client';

import React, { useState } from 'react';
import { X, User, Anchor, Shield, Volume2, Sun, Award, Check } from 'lucide-react';
import { UserProfile } from '@/lib/db';
import { speakFishermanAdvice } from '@/lib/audio-player';

interface UserProfileModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser: (updated: UserProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdateUser
}) => {
  const [formData, setFormData] = useState<UserProfile>(user);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleTogglePref = (key: keyof UserProfile['preferences']) => {
    setFormData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: !prev.preferences[key]
      }
    }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const data = await res.json();
        onUpdateUser(data.user);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2000);
      }
    } catch (err) {
      console.error('Error al guardar perfil:', err);
    }
  };

  const testVoice = () => {
    speakFishermanAdvice(
      `Hola Don Jacinto. El Faro Pesquero de Chorrillos está listo para acompañarlo en la chalana ${formData.boatName}. ¡Buena pesca hoy en el mar!`,
      true
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-cyan-500/40 p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20">
            DJ
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase text-amber-400">
                Usuario de Prueba Activo
              </span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {formData.name}
            </h2>
            <p className="text-xs text-slate-300 italic">
              Conocido en la caleta como: <strong className="text-cyan-300">"{formData.nickname}"</strong>
            </p>
          </div>
        </div>

        {/* Fishing Credential Card */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Anchor className="w-4 h-4 text-cyan-400" />
            Credenciales de Pesca Artesanal (Chorrillos)
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400">Embarcación:</span>
              <p className="text-sm font-bold text-white">{formData.boatName}</p>
            </div>
            <div>
              <span className="text-slate-400">Matrícula DICAPI:</span>
              <p className="text-sm font-bold text-cyan-300 font-mono">
                {formData.registrationNumber}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Caleta base:</span>
              <p className="text-sm font-bold text-white">{formData.cove}</p>
            </div>
            <div>
              <span className="text-slate-400">Experiencia:</span>
              <p className="text-sm font-bold text-emerald-400">
                {formData.yearsOfExperience} años en altamar
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>{formData.association}</span>
          </div>
        </div>

        {/* Accessibility & Voice Preferences */}
        <div className="mt-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Ajustes de Accesibilidad para Don Jacinto
          </h3>

          {/* Voice Alerts Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-sm font-bold text-white">Voz del Faro (Lectura en Alta Voz)</p>
                <p className="text-xs text-slate-400">
                  Anuncia con voz alta cuando se detecte un ave
                </p>
              </div>
            </div>
            <button
              onClick={() => handleTogglePref('voiceAlerts')}
              className={`w-12 h-7 rounded-full transition-colors relative p-1 ${
                formData.preferences.voiceAlerts ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  formData.preferences.voiceAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* High Contrast Mode */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700">
            <div className="flex items-center gap-2.5">
              <Sun className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-sm font-bold text-white">Modo Mar Alto (Alto Contraste)</p>
                <p className="text-xs text-slate-400">
                  Máxima legibilidad bajo el sol directo del mar
                </p>
              </div>
            </div>
            <button
              onClick={() => handleTogglePref('highContrastMode')}
              className={`w-12 h-7 rounded-full transition-colors relative p-1 ${
                formData.preferences.highContrastMode ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  formData.preferences.highContrastMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={testVoice}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 text-cyan-300 border border-cyan-500/40 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-700 active:scale-95 transition-all"
          >
            <Volume2 className="w-4 h-4" />
            Probar Voz Ahora
          </button>

          <button
            onClick={handleSave}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                Guardado
              </>
            ) : (
              'Guardar Preferencias'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
