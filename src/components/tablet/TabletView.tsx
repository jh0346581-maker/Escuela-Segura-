import React from 'react';
import { AppScreen, UserProfile } from '../../types';
import { PrototypeCover } from '../PrototypeCover';
import { ReportIncidentView } from '../ReportIncidentView';
import { ChatMediationView } from '../ChatMediationView';
import { SafeRouteMapView } from '../SafeRouteMapView';
import { ProtocolsGuideView } from '../ProtocolsGuideView';
import { NetworkView } from '../NetworkView';
import { CaseManagementView } from '../dashboard/CaseManagementView';
import { soundFx } from '../../utils/audio';
import { 
  Tablet, 
  ShieldAlert, 
  MessageSquare, 
  MapPin, 
  BookOpen, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  AlertOctagon,
  FolderLock,
  UserCheck,
  LogIn,
  HeartHandshake
} from 'lucide-react';

interface TabletViewProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  currentUser?: UserProfile | null;
  onOpenAuth?: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  estudiante: 'Estudiante',
  docente: 'Docente / Tutor',
  coordinador: 'Coord. Convivencia',
  rector: 'Rector / Director',
  padre: 'Padre de Familia'
};

export const TabletView: React.FC<TabletViewProps> = ({ 
  currentScreen, 
  onNavigate,
  currentUser,
  onOpenAuth
}) => {
  const isStaff = currentUser && ['docente', 'coordinador', 'rector'].includes(currentUser.role);

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-4 py-2 animate-fade-in">
      {/* Tablet Top Info Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-black/40 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d98976] to-[#5a1827] flex items-center justify-center text-white shadow-sm">
            <Tablet className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-cinzel text-sm font-bold text-[#ffe1d9] tracking-wider">
                ESCUELA SEGURA · VERSIÓN TABLET
              </h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-semibold">
                ● Convivencia Activa
              </span>
            </div>
            <p className="text-xs text-[#e0b0bc]">
              Visualización optimizada en doble panel para iPad y tabletas táctiles
            </p>
          </div>
        </div>

        {/* User Pill & Quick Emergency Button */}
        <div className="flex items-center gap-2.5">
          {currentUser ? (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs cursor-pointer transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <div className="text-left">
                <span className="font-semibold block leading-tight truncate max-w-[120px]">{currentUser.name}</span>
                <span className="text-[9px] text-[#f5a7b8] uppercase font-bold leading-none">
                  {ROLE_LABELS[currentUser.role] || currentUser.role}
                </span>
              </div>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-200 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-bold cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Registrarse</span>
            </button>
          )}

          <button
            onClick={() => {
              soundFx.playPop();
              onNavigate('protocols');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Alerta SOS</span>
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Container */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
        {/* Left Pane (Master: Escuela Segura Device Card) */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[370px] h-[720px] rounded-[36px] overflow-hidden shadow-2xl border-4 border-[#1b3d5b] bg-[#10273c] relative flex flex-col p-1.5">
            {/* Inner Screen */}
            <div className="w-full h-full rounded-[30px] overflow-hidden bg-white shadow-inner flex flex-col">
              <PrototypeCover onNavigate={onNavigate} />
            </div>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 text-center">
            Panel táctil interactivo: Toca los botones, el pin o el camino para interactuar.
          </span>
        </div>

        {/* Right Pane (Detail: Active Workspace & Navigation) */}
        <div className="md:col-span-7 flex flex-col gap-3">
          {/* Tablet Tab Bar */}
          <div className="grid grid-cols-6 gap-1.5 bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-sm text-xs">
            <button
              onClick={() => {
                soundFx.playClick();
                onNavigate('report');
              }}
              className={`py-2 px-1.5 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                currentScreen === 'report'
                  ? 'bg-gradient-to-r from-[#8d2a3c] to-[#5a1827] text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldAlert className="w-4 h-4 mb-1" />
              <span className="text-[10px] truncate">Reporte</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                onNavigate('chat');
              }}
              className={`py-2 px-1.5 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                currentScreen === 'chat'
                  ? 'bg-gradient-to-r from-[#8d2a3c] to-[#5a1827] text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <MessageSquare className="w-4 h-4 mb-1" />
              <span className="text-[10px] truncate">PazBot</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                onNavigate('routes');
              }}
              className={`py-2 px-1.5 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                currentScreen === 'routes'
                  ? 'bg-gradient-to-r from-[#8d2a3c] to-[#5a1827] text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <MapPin className="w-4 h-4 mb-1" />
              <span className="text-[10px] truncate">Rutas</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                onNavigate('protocols');
              }}
              className={`py-2 px-1.5 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                currentScreen === 'protocols'
                  ? 'bg-gradient-to-r from-[#8d2a3c] to-[#5a1827] text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-4 h-4 mb-1" />
              <span className="text-[10px] truncate">Decálogo</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                onNavigate('network');
              }}
              className={`py-2 px-1.5 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                currentScreen === 'network'
                  ? 'bg-gradient-to-r from-[#8d2a3c] to-[#5a1827] text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4 mb-1" />
              <span className="text-[10px] truncate">Red</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                onNavigate('cases');
              }}
              className={`py-2 px-1.5 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                currentScreen === 'cases'
                  ? 'bg-amber-600 text-white shadow-md font-bold'
                  : 'text-amber-400 hover:text-amber-300 hover:bg-white/5'
              }`}
            >
              {isStaff ? (
                <FolderLock className="w-4 h-4 mb-1" />
              ) : (
                <HeartHandshake className="w-4 h-4 mb-1" />
              )}
              <span className="text-[10px] truncate font-bold">
                {isStaff ? 'Solución' : currentUser?.role === 'padre' ? 'Familias' : 'Acuerdos'}
              </span>
            </button>
          </div>

          {/* Active Tablet Feature Canvas */}
          <div className="w-full h-[650px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex flex-col relative text-slate-800">
            {currentScreen === 'cover' ? (
              /* When cover is selected in right pane, show quick welcome & dashboard summary */
              <div className="w-full h-full p-6 flex flex-col justify-between bg-gradient-to-br from-[#faf6f2] via-[#f7f0eb] to-[#eeddd7]">
                <div>
                  <div className="flex items-center gap-2 text-[#481624] mb-2">
                    <Sparkles className="w-5 h-5 text-[#deb386]" />
                    <h3 className="font-cinzel text-lg font-bold">
                      Bienvenido al Portal de Convivencia Escolar
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Selecciona una pestaña superior o interactúa con el panel de la izquierda para reportar un incidente, dialogar con PazBot (ChatBot IA) o verificar rutas seguras.
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div
                      onClick={() => onNavigate('report')}
                      className="p-3.5 rounded-2xl bg-white border border-[#deb386]/60 shadow-xs cursor-pointer hover:border-[#8d2a3c] transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#8d2a3c] text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-[#481624]">Reporte con Video</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Grabación en vivo o subida de evidencia protegida.
                      </p>
                    </div>

                    <div
                      onClick={() => onNavigate('chat')}
                      className="p-3.5 rounded-2xl bg-white border border-[#deb386]/60 shadow-xs cursor-pointer hover:border-[#8d2a3c] transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#5a1827] text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-[#481624]">PazBot (IA 24/7)</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Mediación pacífica y desescalamiento de discusiones.
                      </p>
                    </div>

                    <div
                      onClick={() => onNavigate('routes')}
                      className="p-3.5 rounded-2xl bg-white border border-[#deb386]/60 shadow-xs cursor-pointer hover:border-[#8d2a3c] transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#8d2a3c] text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-[#481624]">Rutas y Puntos Seguros</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Patio, biblioteca, enfermería y botón de check-in.
                      </p>
                    </div>

                    <div
                      onClick={() => onNavigate(isStaff ? 'cases' : 'protocols')}
                      className="p-3.5 rounded-2xl bg-white border border-[#deb386]/60 shadow-xs cursor-pointer hover:border-[#8d2a3c] transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#5a1827] text-white flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                        {isStaff ? <FolderLock className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                      </div>
                      <h4 className="text-xs font-bold text-[#481624]">
                        {isStaff ? 'Bandeja de Casos' : 'Decálogo de Paz'}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {isStaff ? 'Gestión y análisis de videos probatorios.' : 'Pautas antibullying y líneas telefónicas.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 border border-[#deb386]/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-slate-700">Protocolo de Custodia Escolar Activo</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {currentUser ? currentUser.campus : 'Plantel Central'}
                  </span>
                </div>
              </div>
            ) : currentScreen === 'report' ? (
              <ReportIncidentView onBack={() => onNavigate('cover')} onNavigate={onNavigate} currentUser={currentUser || null} />
            ) : currentScreen === 'chat' ? (
              <ChatMediationView onBack={() => onNavigate('cover')} onNavigate={onNavigate} />
            ) : currentScreen === 'routes' ? (
              <SafeRouteMapView onBack={() => onNavigate('cover')} onNavigate={onNavigate} />
            ) : currentScreen === 'protocols' ? (
              <ProtocolsGuideView onBack={() => onNavigate('cover')} onNavigate={onNavigate} />
            ) : currentScreen === 'cases' ? (
              <CaseManagementView onBack={() => onNavigate('cover')} onNavigate={onNavigate} currentUser={currentUser || null} />
            ) : (
              <NetworkView onBack={() => onNavigate('cover')} onNavigate={onNavigate} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
