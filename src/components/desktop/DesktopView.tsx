import React, { useState } from 'react';
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
  Monitor, 
  ShieldCheck, 
  ShieldAlert, 
  MessageSquare, 
  MapPin, 
  BookOpen, 
  Users, 
  Sparkles, 
  AlertOctagon, 
  CheckCircle2, 
  PhoneCall, 
  HeartHandshake, 
  ChevronRight,
  FolderLock,
  UserCheck,
  LogIn
} from 'lucide-react';

interface DesktopViewProps {
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

export const DesktopView: React.FC<DesktopViewProps> = ({ 
  currentScreen, 
  onNavigate,
  currentUser,
  onOpenAuth
}) => {
  const [checkedInStatus, setCheckedInStatus] = useState(false);
  const [sosBanner, setSosBanner] = useState(false);

  const isStaff = currentUser && ['docente', 'coordinador', 'rector'].includes(currentUser.role);

  const handleQuickCheckIn = () => {
    soundFx.playSuccess();
    setCheckedInStatus(true);
  };

  const handleSos = () => {
    soundFx.playPop();
    setSosBanner(true);
    setTimeout(() => setSosBanner(false), 5000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-4 py-2 animate-fade-in text-slate-100">
      {/* Desktop Command Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 bg-black/50 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-white/10 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d98976] to-[#5a1827] flex items-center justify-center text-white shadow-md">
            <Monitor className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-cinzel text-base font-extrabold text-[#ffe1d9] tracking-wider">
                ESCUELA SEGURA · CENTRO DE CONTROL ESCOLAR
              </h1>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Monitoreo Activo</span>
              </span>
            </div>
            <p className="text-xs text-[#e0b0bc]">
              Plataforma integral de prevención, mediación pacífica y resguardo estudiantil para computadoras de escritorio
            </p>
          </div>
        </div>

        {/* User Identity Pill & Quick SOS */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs cursor-pointer transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#d98976] to-[#5a1827] flex items-center justify-center text-white font-bold text-xs uppercase shadow-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left">
                <span className="font-semibold block leading-tight">{currentUser.name}</span>
                <span className="text-[10px] text-[#f5a7b8] uppercase font-bold leading-none">
                  {ROLE_LABELS[currentUser.role] || currentUser.role}
                </span>
              </div>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/30 to-rose-500/30 border border-amber-500/50 hover:brightness-110 text-white text-xs font-bold cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-amber-300" />
              <span>Iniciar Sesión / Registro</span>
            </button>
          )}

          <div className="hidden xl:flex items-center gap-4 bg-white/5 px-4 py-1.5 rounded-xl border border-white/5 text-xs text-slate-300">
            <div>
              <span className="text-[10px] text-slate-400 block">Convivencia</span>
              <span className="font-bold text-emerald-400">98.4%</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div>
              <span className="text-[10px] text-slate-400 block">Mediadores</span>
              <span className="font-bold text-[#fed4cc]">4 Activos</span>
            </div>
          </div>

          <button
            onClick={handleSos}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold shadow-lg shadow-rose-900/30 active:scale-95 transition-all cursor-pointer"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Alerta SOS</span>
          </button>
        </div>
      </header>

      {/* SOS Alert Banner */}
      {sosBanner && (
        <div className="bg-rose-900/95 border-2 border-rose-500 text-white p-3.5 rounded-2xl flex items-center justify-between shadow-2xl animate-fade-in">
          <div className="flex items-center gap-3 text-xs">
            <AlertOctagon className="w-6 h-6 text-amber-300 shrink-0 animate-bounce" />
            <div>
              <strong className="text-amber-200">¡Alerta SOS Notificada a Dirección y Prefectura!</strong>
              <p className="text-slate-200 text-[11px] mt-0.5">
                El equipo de vigilancia escolar ha sido convocado para intervención preventiva inmediata.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSosBanner(false)}
            className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg cursor-pointer"
          >
            Entendido
          </button>
        </div>
      )}

      {/* Main 3-Column Desktop Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ================= COLUMN 1: SIDEBAR (NAVIGATION & STATS) ================= */}
        <aside className="lg:col-span-3 flex flex-col gap-4">
          {/* User Profile Card */}
          {currentUser && (
            <div className="bg-gradient-to-br from-[#2a121c] to-[#14060d] rounded-2xl p-3.5 border border-[#deb386]/30 shadow-md">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-xl bg-[#5a1827] flex items-center justify-center text-white font-bold text-xs">
                  <UserCheck className="w-4 h-4 text-[#deb386]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                  <div className="text-[10px] text-[#f5a7b8] uppercase font-bold">
                    {ROLE_LABELS[currentUser.role] || currentUser.role}
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-slate-300 bg-black/30 p-2 rounded-xl space-y-0.5">
                <div className="truncate"><strong>Plantel:</strong> {currentUser.campus}</div>
                {currentUser.gradeOrTitle && (
                  <div className="truncate"><strong>Detalle:</strong> {currentUser.gradeOrTitle}</div>
                )}
              </div>
              <button
                onClick={onOpenAuth}
                className="w-full mt-2 py-1 px-2 rounded-lg bg-white/10 hover:bg-white/15 text-[10px] font-semibold text-slate-200 transition-colors text-center cursor-pointer"
              >
                Cambiar de Rol / Perfil
              </button>
            </div>
          )}

          {/* Navigation Card */}
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-3 border border-white/10 shadow-lg space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 py-1 block">
              Módulos del Sistema
            </span>

            {[
              { id: 'cover' as AppScreen, label: 'Portada / Dispositivo', icon: Sparkles, desc: 'Prototipo Central' },
              { id: 'report' as AppScreen, label: 'Reporte de Conflictos', icon: ShieldAlert, desc: 'Con video en vivo' },
              { id: 'chat' as AppScreen, label: 'PazBot (ChatBot IA)', icon: MessageSquare, desc: 'Mediación 24/7' },
              { id: 'routes' as AppScreen, label: 'Rutas & Zonas Seguras', icon: MapPin, desc: 'Mapa interactivo' },
              { id: 'protocols' as AppScreen, label: 'Decálogo & Protocolos', icon: BookOpen, desc: 'Resolución pacífica' },
              { 
                id: 'cases' as AppScreen, 
                label: isStaff ? 'Gestión, Solución & Familias' : currentUser?.role === 'padre' ? 'Soluciones & Casos para Familias' : 'Soluciones & Acuerdos Escolares', 
                icon: isStaff ? FolderLock : HeartHandshake, 
                desc: isStaff ? 'Recepción de reportes y formulación' : 'Notificaciones oficiales con firma de enterado' 
              },
              { id: 'network' as AppScreen, label: 'Red de Mediadores', icon: Users, desc: 'Pares estudiantiles' },
            ].map((item) => {
              const active = currentScreen === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    soundFx.playClick();
                    onNavigate(item.id);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-[#8d2a3c] to-[#5a1827] text-white font-bold shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-[#ffe1d9]' : item.id === 'cases' ? 'text-amber-400' : 'text-slate-400'}`} />
                    <div>
                      <span className="text-xs block leading-tight">{item.label}</span>
                      <span className="text-[10px] text-slate-400 font-normal block leading-none">
                        {item.desc}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${active ? 'text-white' : 'text-slate-500'}`} />
                </button>
              );
            })}
          </div>

          {/* Quick Check-in Card */}
          <div className="bg-gradient-to-br from-[#2a121c] to-[#14060d] rounded-2xl p-4 border border-[#deb386]/30 shadow-lg text-left space-y-2">
            <div className="flex items-center gap-2 text-[#fed4cc]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="font-cinzel text-xs font-bold">Check-in de Seguridad</h3>
            </div>
            <p className="text-[11px] text-[#e0b0bc] leading-relaxed">
              {checkedInStatus
                ? '✓ Asistencia y seguridad registrada con éxito hoy a las 9:41.'
                : 'Notifica que te encuentras a salvo en las instalaciones del colegio.'}
            </p>
            <button
              onClick={handleQuickCheckIn}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                checkedInStatus
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#8d2a3c] hover:bg-[#a63348] text-white active:scale-95'
              }`}
            >
              {checkedInStatus ? 'Check-in Confirmado' : 'Registrar Check-in Ahora'}
            </button>
          </div>

          {/* Emergency Direct Hotlines Card */}
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-md text-left text-xs space-y-2">
            <div className="flex items-center gap-2 text-[#fed4cc]">
              <PhoneCall className="w-4 h-4 text-rose-400" />
              <h4 className="font-cinzel text-xs font-bold">Líneas de Asistencia</h4>
            </div>
            <div className="text-[11px] text-slate-300 space-y-1.5 pl-1">
              <p><strong>Orientación Escolar:</strong> Ext. 104</p>
              <p><strong>Prefectura General:</strong> Ext. 108</p>
              <p><strong>Línea Nacional Antiacoso:</strong> 800-ESCUELA</p>
            </div>
          </div>
        </aside>

        {/* ================= COLUMN 2: PROTOTYPE PHONE VISUALIZER ================= */}
        <section className="lg:col-span-4 flex flex-col items-center">
          <div className="w-full max-w-[360px] h-[720px] rounded-[44px] p-2 bg-gradient-to-b from-[#1b3d5b] via-[#10273c] to-[#0a1826] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_2px_rgba(61,101,137,0.4)] relative flex flex-col">
            {/* Inner Phone Screen Display */}
            <div className="w-full h-full rounded-[36px] overflow-hidden bg-white shadow-inner flex flex-col">
              <PrototypeCover onNavigate={onNavigate} />
            </div>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 text-center">
            Vista Móvil Escuela Segura · Totalmente interactiva
          </span>
        </section>

        {/* ================= COLUMN 3: EXPANDED WORKSPACE CANVAS ================= */}
        <section className="lg:col-span-5 flex flex-col">
          <div className="w-full h-[720px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex flex-col relative text-slate-800">
            {currentScreen === 'cover' ? (
              /* Desktop Overview Hub */
              <div className="w-full h-full p-6 flex flex-col justify-between bg-gradient-to-br from-[#faf6f2] via-[#f7f0eb] to-[#eeddd7] overflow-y-auto custom-scrollbar">
                <div>
                  <div className="flex items-center gap-2.5 text-[#481624] mb-2 pb-2 border-b border-[#deb386]/30">
                    <Sparkles className="w-5 h-5 text-[#deb386]" />
                    <h2 className="font-cinzel text-base font-bold">
                      Centro de Monitoreo & Convivencia Escolar
                    </h2>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Este panel de escritorio te permite gestionar la convivencia escolar, revisar rutas seguras, realizar reportes confidenciales con evidencia en video o interactuar con el asistente inteligente <strong>PazBot</strong>.
                  </p>

                  {/* 4 Feature Action Cards + Case Desk */}
                  <div className="grid grid-cols-2 gap-3 text-left mb-4">
                    <div
                      onClick={() => {
                        soundFx.playClick();
                        onNavigate('report');
                      }}
                      className="p-3 rounded-2xl bg-white border border-[#deb386]/60 shadow-xs cursor-pointer hover:border-[#8d2a3c] hover:shadow-md transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#8d2a3c] text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-[#481624]">Reporte con Video</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Grabación en vivo o archivo con custodia cifrada.
                      </p>
                    </div>

                    <div
                      onClick={() => {
                        soundFx.playClick();
                        onNavigate('chat');
                      }}
                      className="p-3 rounded-2xl bg-white border border-[#deb386]/60 shadow-xs cursor-pointer hover:border-[#8d2a3c] hover:shadow-md transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#5a1827] text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-[#481624]">PazBot IA</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Mediación pacífica y apoyo emocional con IA.
                      </p>
                    </div>

                    <div
                      onClick={() => {
                        soundFx.playClick();
                        onNavigate('cases');
                      }}
                      className="p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 shadow-xs cursor-pointer hover:border-amber-400 hover:shadow-md transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        {isStaff ? <FolderLock className="w-4 h-4" /> : <HeartHandshake className="w-4 h-4" />}
                      </div>
                      <h4 className="text-xs font-bold text-amber-950">
                        {isStaff ? 'Gestión & Soluciones' : currentUser?.role === 'padre' ? 'Soluciones a Familias' : 'Casos & Soluciones'}
                      </h4>
                      <p className="text-[11px] text-amber-800/80 mt-0.5">
                        {isStaff ? 'Formular resoluciones y notificar a los acudientes.' : 'Reportes resueltos por el colegio y firma de enterado.'}
                      </p>
                    </div>

                    <div
                      onClick={() => {
                        soundFx.playClick();
                        onNavigate('routes');
                      }}
                      className="p-3 rounded-2xl bg-white border border-[#deb386]/60 shadow-xs cursor-pointer hover:border-[#8d2a3c] hover:shadow-md transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#8d2a3c] text-white flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-[#481624]">Zonas Protegidas</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Mapa interactivo de corredores de seguridad.
                      </p>
                    </div>
                  </div>

                  {/* Anti-bullying Commitment Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#3c0e18] to-[#5a1827] text-white text-left space-y-1.5 shadow-sm">
                    <div className="flex items-center gap-2">
                      <HeartHandshake className="w-4 h-4 text-[#ffe1d9]" />
                      <span className="font-cinzel text-xs font-bold tracking-wider text-[#ffe1d9]">
                        COMPROMISO DE NO VIOLENCIA
                      </span>
                    </div>
                    <p className="text-xs text-[#eed8dd] leading-relaxed">
                      "Fomentar el diálogo antes que la agresión, cuidar al compañero y mantener nuestras escuelas como espacios libres de miedo."
                    </p>
                  </div>
                </div>

                {/* Bottom Trust Stamp */}
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 font-medium text-emerald-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Protocolo Oficial Escuela Segura</span>
                  </span>
                  <span>{currentUser ? currentUser.campus : 'Sede Central'}</span>
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
        </section>
      </div>
    </div>
  );
};
