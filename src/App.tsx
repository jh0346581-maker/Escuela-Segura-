/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MobileView } from './components/mobile/MobileView';
import { TabletView } from './components/tablet/TabletView';
import { DesktopView } from './components/desktop/DesktopView';
import { ReferenceModal } from './components/ReferenceModal';
import { AuthModal } from './components/auth/AuthModal';
import { AppScreen, DeviceMode, UserProfile } from './types';
import { useResponsiveDevice } from './utils/useResponsiveDevice';
import { soundFx } from './utils/audio';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Volume2, 
  VolumeX, 
  Eye, 
  ShieldCheck, 
  Sparkles,
  RotateCcw,
  User,
  LogIn,
  GraduationCap
} from 'lucide-react';

const ROLE_NAME_MAP: Record<string, string> = {
  estudiante: 'Estudiante',
  docente: 'Docente / Tutor',
  coordinador: 'Coord. Convivencia',
  rector: 'Rector / Director',
  padre: 'Padre / Acudiente'
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('cover');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('auto');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isRefOpen, setIsRefOpen] = useState(false);

  // Authentication State: check localStorage first, or show AuthModal if new visitor
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('escuela_segura_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.id === 'string' && parsed.id.startsWith('demo-')) {
          localStorage.removeItem('escuela_segura_user');
          return null;
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error reading escuela_segura_user:', e);
    }
    return null;
  });

  // Prompt login / registration on first entrance
  const [isAuthOpen, setIsAuthOpen] = useState(() => !currentUser);

  const { effectiveDevice, windowWidth } = useResponsiveDevice(deviceMode);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFx.enabled = next;
    if (next) soundFx.playPop();
  };

  const handleDeviceChange = (mode: DeviceMode) => {
    soundFx.playClick();
    setDeviceMode(mode);
  };

  const handleLogout = () => {
    soundFx.playPop();
    localStorage.removeItem('escuela_segura_user');
    setCurrentUser(null);
    setIsAuthOpen(true);
  };

  const handleUserLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
  };

  return (
    <div className="min-h-screen w-full bg-radial from-[#1e0d16] via-[#11070e] to-[#080206] text-slate-100 flex flex-col justify-between p-2 sm:p-4 overflow-x-hidden selection:bg-[#c97561] selection:text-white">
      {/* Top Application Control Toolbar with Device Switcher & User Profile */}
      <header className="w-full max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-black/45 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl shrink-0 z-30">
        {/* Brand logo & title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#d98976] to-[#5a1827] flex items-center justify-center text-white shadow-sm shrink-0">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-xs sm:text-sm font-extrabold text-[#ffe1d9] tracking-wider">
                ESCUELA SEGURA
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] bg-white/10 text-[#f5a7b8] px-2 py-0.5 rounded-full font-medium">
                <Sparkles className="w-2.5 h-2.5" />
                <span>3 Versiones Adaptadas</span>
              </span>
            </div>
            <p className="text-[10px] text-[#e0b0bc]">
              Celular · Tablet · Computador (100% Responsivo)
            </p>
          </div>
        </div>

        {/* User Profile Pill & Login trigger */}
        <div className="flex items-center gap-2 order-3 sm:order-2">
          {currentUser ? (
            <button
              onClick={() => {
                soundFx.playClick();
                setIsAuthOpen(true);
              }}
              title="Cambiar perfil o rol escolar"
              className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 transition-all text-left cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#c97561] to-[#5a1827] flex items-center justify-center text-white text-[11px] font-bold uppercase shadow-sm">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white max-w-[120px] truncate">
                    {currentUser.name}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[10px] text-[#f5a7b8] font-medium leading-none">
                  {ROLE_NAME_MAP[currentUser.role] || currentUser.role}
                </span>
              </div>
            </button>
          ) : (
            <button
              onClick={() => {
                soundFx.playClick();
                setIsAuthOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#d98976] to-[#8d2a3c] hover:brightness-110 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer animate-pulse"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Ingresar / Registro</span>
            </button>
          )}
        </div>

        {/* Device Mode Switcher (Celular, Tablet, Computador, Auto) */}
        <div className="flex items-center gap-1.5 sm:gap-2 order-2 sm:order-3">
          {/* Device Tabs */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
            {/* Auto (Responsive) */}
            <button
              onClick={() => handleDeviceChange('auto')}
              title={`Detectar automáticamente según pantalla (${windowWidth}px)`}
              className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer text-[11px] font-semibold ${
                deviceMode === 'auto'
                  ? 'bg-gradient-to-r from-[#8d2a3c] to-[#5a1827] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden xs:inline">Auto</span>
            </button>

            {/* Mobile (Celular) */}
            <button
              onClick={() => handleDeviceChange('mobile')}
              title="Versión adaptada para Celular"
              className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold ${
                deviceMode === 'mobile' || (deviceMode === 'auto' && effectiveDevice === 'mobile')
                  ? 'bg-gradient-to-r from-[#8d2a3c] to-[#5a1827] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Celular</span>
            </button>

            {/* Tablet */}
            <button
              onClick={() => handleDeviceChange('tablet')}
              title="Versión adaptada para Tablet"
              className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold ${
                deviceMode === 'tablet' || (deviceMode === 'auto' && effectiveDevice === 'tablet')
                  ? 'bg-gradient-to-r from-[#8d2a3c] to-[#5a1827] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Tablet</span>
            </button>

            {/* Desktop (Computador) */}
            <button
              onClick={() => handleDeviceChange('desktop')}
              title="Versión adaptada para Computador"
              className={`px-2 sm:px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold ${
                deviceMode === 'desktop' || (deviceMode === 'auto' && effectiveDevice === 'desktop')
                  ? 'bg-gradient-to-r from-[#8d2a3c] to-[#5a1827] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Computador</span>
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Silenciar Efectos de Audio' : 'Activar Efectos de Audio'}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors active:scale-95 cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Reference Image Modal Button */}
          <button
            onClick={() => {
              soundFx.playPop();
              setIsRefOpen(true);
            }}
            title="Ver imagen original de referencia"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#8d2a3c] to-[#5a1827] hover:from-[#a63348] hover:to-[#6d1e30] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prototipo Original</span>
          </button>
        </div>
      </header>

      {/* Main Center Stage (Dynamic based on selected or detected device) */}
      <main className="flex-1 flex items-center justify-center my-2 sm:my-3 relative w-full">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[750px] bg-gradient-to-tr from-[#94394f]/15 via-[#401222]/10 to-transparent blur-[140px] rounded-full pointer-events-none" />

        {/* 1. Mobile Version */}
        {effectiveDevice === 'mobile' && (
          <MobileView
            currentScreen={currentScreen}
            onNavigate={setCurrentScreen}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {/* 2. Tablet Version */}
        {effectiveDevice === 'tablet' && (
          <TabletView
            currentScreen={currentScreen}
            onNavigate={setCurrentScreen}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {/* 3. Desktop Version */}
        {effectiveDevice === 'desktop' && (
          <DesktopView
            currentScreen={currentScreen}
            onNavigate={setCurrentScreen}
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}
      </main>

      {/* Footer Info */}
      <footer className="w-full text-center py-2 text-[11px] text-slate-500 border-t border-white/5 shrink-0 flex items-center justify-between max-w-7xl mx-auto px-4">
        <span>Escuela Segura · Plataforma de Convivencia Sana y Prevención Escolar</span>
        <span className="font-mono text-[10px] text-slate-400">
          Modo activo: {effectiveDevice.toUpperCase()} ({windowWidth}px) {currentUser ? `· Sesión: ${currentUser.name} (${ROLE_NAME_MAP[currentUser.role] || currentUser.role})` : '· Sin sesión iniciada'}
        </span>
      </footer>

      {/* Auth / Onboarding Modal (Opens first time or on request) */}
      <AuthModal
        isOpen={isAuthOpen}
        currentUser={currentUser}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleUserLogin}
      />

      {/* Reference Modal for Original Prototype Inspection */}
      <ReferenceModal
        isOpen={isRefOpen}
        onClose={() => setIsRefOpen(false)}
      />
    </div>
  );
}
