import React, { useState } from 'react';
import { ArrowLeft, MapPin, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { AppScreen } from '../types';
import { soundFx } from '../utils/audio';

interface SafeRouteMapViewProps {
  onBack: () => void;
  onNavigate: (screen: AppScreen) => void;
}

interface Point {
  id: string;
  name: string;
  x: number;
  y: number;
  type: string;
  status: string;
  desc: string;
}

const POINTS: Point[] = [
  { id: 'p1', name: 'Patio Central', x: 50, y: 46, type: 'Principal', status: 'Monitoreo Activo', desc: 'Presencia constante de profesores y mediadores estudiantiles.' },
  { id: 'p2', name: 'Sala de Mediación', x: 26, y: 28, type: 'Orientación', status: 'Abierto', desc: 'Espacio confidencial para resolver desacuerdos en privado.' },
  { id: 'p3', name: 'Enfermería', x: 74, y: 30, type: 'Salud', status: 'Personal Disponible', desc: 'Atención de primeros auxilios y contención emocional.' },
  { id: 'p4', name: 'Portería Principal', x: 50, y: 82, type: 'Control', status: 'Seguridad Escolar', desc: 'Punto de acceso seguro y control de ingresos.' },
  { id: 'p5', name: 'Biblioteca', x: 78, y: 65, type: 'Estudio', status: 'Zona Tranquila', desc: 'Área libre de ruidos y descanso para recreos.' },
];

export const SafeRouteMapView: React.FC<SafeRouteMapViewProps> = ({ onBack, onNavigate }) => {
  const [selectedPoint, setSelectedPoint] = useState<Point>(POINTS[0]);
  const [checkedIn, setCheckedIn] = useState(false);

  const handleCheckIn = () => {
    soundFx.playSuccess();
    setCheckedIn(true);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#faf6f2] text-slate-800 overflow-hidden">
      {/* Header */}
      <header className="pt-10 px-4 pb-3 bg-gradient-to-r from-[#3c0e18] to-[#5a1827] text-white flex items-center justify-between shrink-0 shadow-md">
        <button
          onClick={() => {
            soundFx.playClick();
            onBack();
          }}
          className="flex items-center gap-1 text-xs text-[#ffe1d9] bg-white/10 px-2 py-1 rounded-lg hover:bg-white/20 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver</span>
        </button>
        <span className="font-cinzel text-xs font-bold tracking-wider text-[#ffe1d9]">
          RUTAS Y ZONAS SEGURAS
        </span>
        <button
          onClick={() => {
            soundFx.playPop();
            onNavigate('chat');
          }}
          className="text-[11px] text-[#ffe1d9] bg-white/10 px-2 py-1 rounded-lg"
        >
          Chat
        </button>
      </header>

      {/* Map Interactive Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar flex flex-col gap-3">
        {/* Interactive School Map SVG */}
        <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-[#f2e7e2] via-[#e8d7cf] to-[#dec3b8] rounded-2xl border border-[#d6a598]/60 shadow-inner overflow-hidden p-3 flex items-center justify-center">
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#481624_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* School paths svg lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Safe corridor paths */}
            <path d="M 50 82 L 50 46 L 26 28" stroke="#a45768" strokeWidth="2.5" strokeDasharray="3 2" fill="none" />
            <path d="M 50 46 L 74 30" stroke="#a45768" strokeWidth="2.5" strokeDasharray="3 2" fill="none" />
            <path d="M 50 46 L 78 65" stroke="#a45768" strokeWidth="2.5" strokeDasharray="3 2" fill="none" />
          </svg>

          {/* School Buildings boxes */}
          <div className="absolute top-[16%] left-[16%] w-16 h-10 rounded-lg bg-white/80 border border-[#a45768]/40 shadow-xs flex items-center justify-center text-[9px] font-bold text-[#481624]">
            Edificio A
          </div>
          <div className="absolute top-[18%] right-[14%] w-16 h-10 rounded-lg bg-white/80 border border-[#a45768]/40 shadow-xs flex items-center justify-center text-[9px] font-bold text-[#481624]">
            Edificio B
          </div>
          <div className="absolute bottom-[10%] left-[34%] w-28 h-8 rounded-lg bg-white/80 border border-[#a45768]/40 shadow-xs flex items-center justify-center text-[9px] font-bold text-[#481624]">
            Acceso Principal
          </div>

          {/* Interactive Map Pins */}
          {POINTS.map((pt) => {
            const isSelected = selectedPoint.id === pt.id;
            return (
              <button
                key={pt.id}
                onClick={() => {
                  soundFx.playPop();
                  setSelectedPoint(pt);
                }}
                style={{ top: `${pt.y}%`, left: `${pt.x}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-200 cursor-pointer ${
                  isSelected ? 'scale-125 z-20' : 'scale-100 hover:scale-110 z-10'
                }`}
                title={pt.name}
              >
                <div
                  className={`relative flex items-center justify-center w-8 h-8 rounded-full shadow-md transition-all ${
                    isSelected
                      ? 'bg-rose-600 text-white ring-4 ring-rose-300'
                      : 'bg-[#481624] text-[#ffe1d9] ring-2 ring-white'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 text-white text-[8px] font-semibold px-1.5 py-0.5 rounded shadow pointer-events-none">
                  {pt.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Point Details Card */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-sm text-left">
          <div className="flex items-center justify-between">
            <h4 className="font-cinzel text-xs font-bold text-[#481624]">
              {selectedPoint.name}
            </h4>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
              {selectedPoint.status}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {selectedPoint.desc}
          </p>
        </div>

        {/* Check-in Quick Card */}
        <div className="bg-gradient-to-r from-[#ffece8] to-[#fce4ec] rounded-2xl p-3.5 border border-[#f5b2b2] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#8d2a3c] text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#481624]">Check-in de Asistencia Segura</p>
              <p className="text-[10px] text-slate-600">
                {checkedIn ? '✓ Confirmado hoy a las 9:41' : 'Avisa que llegaste bien al aula'}
              </p>
            </div>
          </div>
          <button
            onClick={handleCheckIn}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
              checkedIn
                ? 'bg-emerald-600 text-white'
                : 'bg-[#481624] text-white hover:bg-[#5e1e30] active:scale-95'
            }`}
          >
            {checkedIn ? 'Listo' : 'Check-in'}
          </button>
        </div>

        {/* Safe Corridor Tips */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200 text-left text-xs text-slate-600 space-y-1.5">
          <p className="font-bold text-[#481624] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Reglas de Tránsito Escolar Seguro:</span>
          </p>
          <ul className="text-[11px] list-disc list-inside space-y-1 text-slate-600 pl-1">
            <li>Camina siempre por zonas iluminadas y transitadas.</li>
            <li>Evita aislarte en rincones oscuros o deshabitados en los cambios de hora.</li>
            <li>Si ves a alguien en apuros, busca al mediador más cercano de inmediato.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
