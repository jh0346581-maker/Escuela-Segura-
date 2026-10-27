import React, { useState } from 'react';
import { ArrowLeft, Users, ShieldCheck, Heart, CheckCircle2 } from 'lucide-react';
import { AppScreen } from '../types';
import { soundFx } from '../utils/audio';

interface NetworkViewProps {
  onBack: () => void;
  onNavigate: (screen: AppScreen) => void;
}

interface Mediator {
  id: string;
  name: string;
  grade: string;
  role: string;
  status: 'disponible' | 'en_clase';
  specialty: string;
}

const MEDIATORS: Mediator[] = [
  { id: '1', name: 'Sofía Navarro', grade: '3er Año B', role: 'Mediadora Estudiantil', status: 'disponible', specialty: 'Resolución de malentendidos y apoyo entre pares' },
  { id: '2', name: 'Mateo Morales', grade: '4to Año A', role: 'Mediador Estudiantil', status: 'disponible', specialty: 'Integración grupal y prevención de acoso' },
  { id: '3', name: 'Prof. Javier Ramos', grade: 'Docente Tutor', role: 'Coordinador de Convivencia', status: 'disponible', specialty: 'Mediación formal de conflictos y acuerdos de paz' },
  { id: '4', name: 'Valentina Cruz', grade: '2do Año C', role: 'Mediadora Par', status: 'en_clase', specialty: 'Acompañamiento a alumnos de nuevo ingreso' },
];

export const NetworkView: React.FC<NetworkViewProps> = ({ onBack, onNavigate }) => {
  const [requestedId, setRequestedId] = useState<string | null>(null);

  const handleRequest = (id: string) => {
    soundFx.playSuccess();
    setRequestedId(id);
    setTimeout(() => {
      setRequestedId(null);
    }, 3000);
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
          RED DE MEDIADORES
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar space-y-3">
        {requestedId && (
          <div className="bg-emerald-800 text-white p-3 rounded-2xl text-xs flex items-center gap-2 animate-fade-in shadow-md">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-300" />
            <span>¡Solicitud enviada! El mediador se pondrá en contacto contigo en el recreo de forma discreta.</span>
          </div>
        )}

        {/* Info card */}
        <div className="bg-white rounded-2xl p-3.5 border border-[#deb386]/50 shadow-xs text-left">
          <div className="flex items-center gap-2 text-[#481624]">
            <Users className="w-4 h-4 text-[#8d2a3c]" />
            <h4 className="font-cinzel text-xs font-bold">Círculo de Mediación y Confianza</h4>
          </div>
          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
            Compañeros y docentes capacitados en técnicas de comunicación no violenta listos para escucharte y ayudarte a dialogar.
          </p>
        </div>

        {/* Mediators List */}
        <div className="space-y-2 text-left">
          {MEDIATORS.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs flex flex-col gap-2 hover:border-[#ab6d79]/60 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="text-xs font-bold text-[#481624] flex items-center gap-1.5">
                    <span>{m.name}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </h5>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {m.role} · {m.grade}
                  </p>
                </div>
                <span
                  className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                    m.status === 'disponible'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {m.status === 'disponible' ? 'En Guardia' : 'En Clase'}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 italic">
                "{m.specialty}"
              </p>

              <button
                onClick={() => handleRequest(m.id)}
                className="w-full py-1.5 px-3 rounded-xl bg-[#faf2ee] hover:bg-[#ffe8e0] text-[#481624] border border-[#deb386]/50 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 text-[#ca7b69]" />
                <span>Solicitar Mediación con {m.name.split(' ')[0]}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
