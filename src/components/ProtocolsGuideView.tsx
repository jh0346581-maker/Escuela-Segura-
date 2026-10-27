import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, Heart, AlertOctagon, PhoneCall } from 'lucide-react';
import { AppScreen } from '../types';
import { soundFx } from '../utils/audio';

interface ProtocolsGuideViewProps {
  onBack: () => void;
  onNavigate: (screen: AppScreen) => void;
}

const PRINCIPLES = [
  {
    title: '1. Diálogo y Escucha Asertiva',
    desc: 'Expresa tus desacuerdos con respeto, sin gritos ni descalificaciones. Escuchar al otro es el primer paso para desactivar la rabia.',
    icon: Heart,
  },
  {
    title: '2. Cero Tolerancia al Hostigamiento',
    desc: 'Los apodos hirientes, las risas burlonas y la exclusión sistemática no son bromas; son formas de violencia que lastiman.',
    icon: ShieldCheck,
  },
  {
    title: '3. Mediación con Terceros',
    desc: 'Cuando no sea posible llegar a un acuerdo entre pares, solicita la intervención neutral de un mediador escolar.',
    icon: ShieldCheck,
  },
  {
    title: '4. No Ser Espectador Pasivo',
    desc: 'Quien observa una agresión y no pide ayuda también permite que ocurra. Reporta discreetamente para proteger a la víctima.',
    icon: Heart,
  },
  {
    title: '5. Cuidado del Entorno Digital',
    desc: 'No compartas capturas de pantalla, rumores ni stickers denigrantes en grupos de WhatsApp o redes sociales escolares.',
    icon: ShieldCheck,
  },
];

export const ProtocolsGuideView: React.FC<ProtocolsGuideViewProps> = ({ onBack, onNavigate }) => {
  const [sosActivated, setSosActivated] = useState(false);

  const handleSos = () => {
    soundFx.playSuccess();
    setSosActivated(true);
    setTimeout(() => {
      setSosActivated(false);
    }, 4000);
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
          DECÁLOGO & SEGURIDAD
        </span>
        <button
          onClick={() => {
            soundFx.playPop();
            onNavigate('report');
          }}
          className="text-[11px] text-[#ffe1d9] bg-white/10 px-2 py-1 rounded-lg"
        >
          Reportar
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar space-y-3">
        {sosActivated && (
          <div className="bg-rose-900 text-white p-3 rounded-2xl text-xs flex items-center gap-2 animate-bounce shadow-lg">
            <AlertOctagon className="w-5 h-5 shrink-0 text-amber-300" />
            <div>
              <strong>¡Alerta SOS Notificada!</strong> El personal de prefectura y orientación escolar ha recibido tu llamada de urgencia.
            </div>
          </div>
        )}

        {/* Hero Card */}
        <div className="bg-gradient-to-br from-[#481624] to-[#250812] text-white rounded-2xl p-4 shadow-sm text-left">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#e8a3b0]">
            Compromiso Institucional
          </span>
          <h3 className="font-cinzel text-sm font-bold text-[#ffe1d9] mt-0.5">
            Decálogo de Convivencia Sana
          </h3>
          <p className="text-xs text-[#eed8dd] mt-1 leading-relaxed">
            Una escuela segura se construye todos los días cuando elegimos la empatía sobre el conflicto y el diálogo sobre la agresión.
          </p>
        </div>

        {/* SOS Button */}
        <div className="bg-white rounded-2xl p-3 border border-rose-200 shadow-xs flex items-center justify-between">
          <div className="text-left">
            <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
              <span>Botón de Auxilio Escolar</span>
            </h4>
            <p className="text-[10px] text-slate-500">Úsalo ante agresión física activa</p>
          </div>
          <button
            onClick={handleSos}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold active:scale-95 transition-transform shadow-xs cursor-pointer"
          >
            ACTIVAR SOS
          </button>
        </div>

        {/* Principles List */}
        <div className="space-y-2 text-left">
          {PRINCIPLES.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-2xs hover:border-[#ab6d79]/60 transition-colors"
            >
              <h5 className="text-xs font-bold text-[#481624]">
                {item.title}
              </h5>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Emergency Contacts */}
        <div className="bg-[#f2e6e2] rounded-2xl p-3 border border-[#deb386]/60 text-left space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#481624]">
            <PhoneCall className="w-3.5 h-3.5 text-[#8d2a3c]" />
            <span>Líneas de Atención Inmediata:</span>
          </div>
          <div className="text-[11px] text-slate-700 space-y-1 pl-1">
            <p><strong>Orientación Escolar:</strong> Anexo 104 (Horario escolar)</p>
            <p><strong>Línea Nacional contra el Acoso:</strong> 800-ESCUELA (Gratuito 24/7)</p>
            <p><strong>Emergencias Generales:</strong> 911 / 112</p>
          </div>
        </div>
      </div>
    </div>
  );
};
