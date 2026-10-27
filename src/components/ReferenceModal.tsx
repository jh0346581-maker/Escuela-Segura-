import React from 'react';
import { X, CheckCircle, ExternalLink } from 'lucide-react';

interface ReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferenceModal: React.FC<ReferenceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#14080e] border border-[#a45768]/60 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#3c0e18] to-[#5a1827] flex items-center justify-between border-b border-[#a45768]/40">
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-sm font-bold text-[#ffe1d9] tracking-wider">
              PROTOTIPO DE REFERENCIA: ESCUELA SEGURA
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body with Image and Checklist */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex flex-col md:flex-row gap-6 items-center">
          {/* Reference Image */}
          <div className="relative w-full md:w-1/2 flex items-center justify-center rounded-2xl overflow-hidden border border-[#58212e] bg-black/40 shadow-inner">
            <img
              src="/public/assets/aistudio/Gemini_Generated_Image_q9mbzsq9mbzsq9mb_2c8fea24.jpg"
              alt="Prototipo de Referencia Escuela Segura"
              referrerPolicy="no-referrer"
              className="w-full h-auto max-h-[460px] object-contain rounded-xl"
            />
          </div>

          {/* Checklist & Spec comparison */}
          <div className="w-full md:w-1/2 flex flex-col gap-3 text-left">
            <h4 className="font-cinzel text-sm font-bold text-[#f8b2c2]">
              Fidelidad al Diseño Original
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              La aplicación recrea meticulosamente cada elemento visual y funcional del prototipo móvil "Escuela Segura":
            </p>

            <ul className="text-xs space-y-2 text-slate-200">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Marco Smartphone:</strong> Chasis azul titanio con botones laterales y pantalla estilizada.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Encabezado:</strong> Escudo metálico con paloma y corazón en dorado + tipografía serif "ESCUELA SEGURA".</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Panel Central:</strong> Camino 3D isométrico con pin rojo, botón "OK", botón "CHAT", escudo con check y red de nodos.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Tarjeta Inferior:</strong> Fondo burdeos estrellado, titular "¡JUNTOS POR UNA CONVIVENCIA SANA!", botón cobrizo metálico "COMENZAR" y lema inferior.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Interacciones Funcionales:</strong> Reporte silencioso, chat con mediadora, mapa de zonas seguras y decálogo.</span>
              </li>
            </ul>

            <button
              onClick={onClose}
              className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#8d2a3c] to-[#481624] text-white text-xs font-bold tracking-wider uppercase hover:from-[#a63348] transition-all cursor-pointer"
            >
              Cerrar y Probar la Aplicación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
