import React, { useState } from 'react';
import { AppScreen, UserProfile } from '../../types';
import { PhoneFrame } from '../PhoneFrame';
import { PrototypeCover } from '../PrototypeCover';
import { ReportIncidentView } from '../ReportIncidentView';
import { ChatMediationView } from '../ChatMediationView';
import { SafeRouteMapView } from '../SafeRouteMapView';
import { ProtocolsGuideView } from '../ProtocolsGuideView';
import { NetworkView } from '../NetworkView';
import { CaseManagementView } from '../dashboard/CaseManagementView';
import { soundFx } from '../../utils/audio';
import { 
  Smartphone, 
  ShieldAlert, 
  MessageSquare, 
  MapPin, 
  BookOpen, 
  FolderLock,
  UserCheck,
  LogIn,
  HeartHandshake
} from 'lucide-react';

interface MobileViewProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  currentUser?: UserProfile | null;
  onOpenAuth?: () => void;
}

export const MobileView: React.FC<MobileViewProps> = ({ 
  currentScreen, 
  onNavigate,
  currentUser,
  onOpenAuth
}) => {
  const [useFrame, setUseFrame] = useState(true);
  const isStaff = currentUser && ['docente', 'coordinador', 'rector'].includes(currentUser.role);

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[720px] py-2 animate-fade-in">
      {/* Top Mobile Bar: Role pill & Frame Toggle */}
      <div className="mb-2 flex items-center justify-between w-full max-w-[390px] px-2 text-[11px] text-slate-300">
        <div className="flex items-center gap-1.5">
          {currentUser ? (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white cursor-pointer transition-colors"
            >
              <UserCheck className="w-3 h-3 text-emerald-400" />
              <span className="font-semibold truncate max-w-[130px]">{currentUser.name}</span>
              <span className="text-[9px] bg-[#5a1827] px-1.5 py-0.2 rounded text-[#f5a7b8] uppercase font-bold">
                {currentUser.role}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/40 hover:bg-amber-500/30 cursor-pointer text-[11px] font-bold"
            >
              <LogIn className="w-3 h-3" />
              <span>Identifícate</span>
            </button>
          )}
        </div>

        {/* Mockup vs Edge-to-Edge Toggle */}
        <div className="hidden sm:flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
          <button
            onClick={() => {
              soundFx.playClick();
              setUseFrame(true);
            }}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              useFrame ? 'bg-[#5a1827] text-white font-semibold' : 'hover:text-white'
            }`}
          >
            iPhone
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setUseFrame(false);
            }}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              !useFrame ? 'bg-[#5a1827] text-white font-semibold' : 'hover:text-white'
            }`}
          >
            Plano
          </button>
        </div>
      </div>

      {/* Screen container */}
      <div className="w-full flex items-center justify-center">
        {useFrame ? (
          <PhoneFrame isFullMode={false}>
            {currentScreen === 'cover' && <PrototypeCover onNavigate={onNavigate} />}
            {currentScreen === 'report' && (
              <ReportIncidentView onBack={() => onNavigate('cover')} onNavigate={onNavigate} currentUser={currentUser || null} />
            )}
            {currentScreen === 'chat' && (
              <ChatMediationView onBack={() => onNavigate('cover')} onNavigate={onNavigate} />
            )}
            {currentScreen === 'routes' && (
              <SafeRouteMapView onBack={() => onNavigate('cover')} onNavigate={onNavigate} />
            )}
            {currentScreen === 'protocols' && (
              <ProtocolsGuideView onBack={() => onNavigate('cover')} onNavigate={onNavigate} />
            )}
            {currentScreen === 'network' && (
              <NetworkView onBack={() => onNavigate('cover')} onNavigate={onNavigate} />
            )}
            {currentScreen === 'cases' && (
              <CaseManagementView onBack={() => onNavigate('cover')} onNavigate={onNavigate} currentUser={currentUser || null} />
            )}
          </PhoneFrame>
        ) : (
          <div className="w-full max-w-[390px] h-[780px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-white flex flex-col relative">
            {currentScreen === 'cover' && <PrototypeCover onNavigate={onNavigate} />}
            {currentScreen === 'report' && (
              <ReportIncidentView onBack={() => onNavigate('cover')} onNavigate={onNavigate} currentUser={currentUser || null} />
            )}
            {currentScreen === 'chat' && (
              <ChatMediationView onBack={() => onNavigate('cover')} onNavigate={onNavigate} />
            )}
            {currentScreen === 'routes' && (
              <SafeRouteMapView onBack={() => onNavigate('cover')} onNavigate={onNavigate} />
            )}
            {currentScreen === 'protocols' && (
              <ProtocolsGuideView onBack={() => onNavigate('cover')} onNavigate={onNavigate} />
            )}
            {currentScreen === 'network' && (
              <NetworkView onBack={() => onNavigate('cover')} onNavigate={onNavigate} />
            )}
            {currentScreen === 'cases' && (
              <CaseManagementView onBack={() => onNavigate('cover')} onNavigate={onNavigate} currentUser={currentUser || null} />
            )}
          </div>
        )}
      </div>

      {/* Thumb-friendly Bottom Navigation Bar */}
      <div className="w-full max-w-sm mt-3 flex items-center justify-around bg-black/75 backdrop-blur-lg border border-white/10 rounded-2xl py-2 px-2 shadow-xl">
        <button
          onClick={() => {
            soundFx.playClick();
            onNavigate('cover');
          }}
          className={`flex flex-col items-center text-[10px] transition-colors cursor-pointer px-1.5 py-0.5 rounded-lg ${
            currentScreen === 'cover' ? 'text-[#f5a7b8] font-bold bg-white/5' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-4 h-4 mb-0.5" />
          <span>Inicio</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            onNavigate('report');
          }}
          className={`flex flex-col items-center text-[10px] transition-colors cursor-pointer px-1.5 py-0.5 rounded-lg ${
            currentScreen === 'report' ? 'text-[#f5a7b8] font-bold bg-white/5' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4 mb-0.5" />
          <span>Reporte</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            onNavigate('chat');
          }}
          className={`flex flex-col items-center text-[10px] transition-colors cursor-pointer px-1.5 py-0.5 rounded-lg ${
            currentScreen === 'chat' ? 'text-[#f5a7b8] font-bold bg-white/5' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4 mb-0.5" />
          <span>PazBot</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            onNavigate('routes');
          }}
          className={`flex flex-col items-center text-[10px] transition-colors cursor-pointer px-1.5 py-0.5 rounded-lg ${
            currentScreen === 'routes' ? 'text-[#f5a7b8] font-bold bg-white/5' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MapPin className="w-4 h-4 mb-0.5" />
          <span>Rutas</span>
        </button>

        {/* Cases & Solutions Tab (Staff: Gestión y Solución, Padres: Soluciones Notificadas, Estudiantes: Acuerdos) */}
        <button
          onClick={() => {
            soundFx.playClick();
            onNavigate('cases');
          }}
          className={`flex flex-col items-center text-[10px] transition-colors cursor-pointer px-1.5 py-0.5 rounded-lg ${
            currentScreen === 'cases' ? 'text-amber-300 font-bold bg-amber-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          {isStaff ? (
            <FolderLock className="w-4 h-4 mb-0.5 text-amber-400" />
          ) : (
            <HeartHandshake className="w-4 h-4 mb-0.5 text-emerald-400" />
          )}
          <span>{isStaff ? 'Soluciones' : currentUser?.role === 'padre' ? 'Familias' : 'Acuerdos'}</span>
        </button>

        <button
          onClick={() => {
            soundFx.playClick();
            onNavigate('protocols');
          }}
          className={`flex flex-col items-center text-[10px] transition-colors cursor-pointer px-1.5 py-0.5 rounded-lg ${
            currentScreen === 'protocols' ? 'text-[#f5a7b8] font-bold bg-white/5' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4 mb-0.5" />
          <span>Guía</span>
        </button>
      </div>
    </div>
  );
};
