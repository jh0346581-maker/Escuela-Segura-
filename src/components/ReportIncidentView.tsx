import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  ShieldAlert, 
  CheckCircle, 
  Lock, 
  AlertTriangle, 
  Send, 
  User, 
  Users, 
  Video, 
  UploadCloud, 
  X, 
  Film,
  Play,
  Camera,
  Radio
} from 'lucide-react';
import { VideoRecorderModal } from './VideoRecorderModal';
import { AppScreen, IncidentUrgency, UserProfile } from '../types';
import { soundFx } from '../utils/audio';

interface ReportIncidentViewProps {
  onBack: () => void;
  onNavigate: (screen: AppScreen) => void;
  currentUser?: UserProfile | null;
}

interface AttachedVideo {
  name: string;
  sizeFormatted: string;
  url: string;
}

const CATEGORIES = [
  'Acoso verbal o apodos',
  'Exclusión o ley del hielo',
  'Agresión física o empujones',
  'Ciberacoso en redes sociales',
  'Amenazas o intimidación',
  'Daño a pertenencias escolares',
];

const LOCATIONS = [
  'Patio central / Recreo',
  'Pasillos / Gradas',
  'Aulas de clase',
  'Baños / Vestidores',
  'Entrada / Salida escolar',
  'Transporte escolar',
  'Redes sociales / Grupos de chat',
];

export const ReportIncidentView: React.FC<ReportIncidentViewProps> = ({ onBack, onNavigate, currentUser }) => {
  const [category, setCategory] = useState(CATEGORIES[2]); // Default: Agresión física o empujones
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [urgency, setUrgency] = useState<IncidentUrgency>('moderada');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [reporterName, setReporterName] = useState(currentUser?.name || '');
  const [involvedPersons, setInvolvedPersons] = useState('');
  const [attachedVideo, setAttachedVideo] = useState<AttachedVideo | null>(null);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [folio, setFolio] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundFx.playPop();
    const url = URL.createObjectURL(file);
    setAttachedVideo({
      name: file.name,
      sizeFormatted: formatFileSize(file.size),
      url,
    });
  };

  const handleRemoveVideo = () => {
    soundFx.playClick();
    if (attachedVideo?.url && attachedVideo.url.startsWith('blob:')) {
      URL.revokeObjectURL(attachedVideo.url);
    }
    setAttachedVideo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (nativeCameraInputRef.current) {
      nativeCameraInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundFx.playSuccess();
    const newFolio = `ES-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setFolio(newFolio);

    // Build the IncidentReport object to send directly to teachers, coordinator and rector
    const newReport: any = {
      id: newFolio,
      category,
      location,
      urgency,
      description,
      isAnonymous,
      reporterName: isAnonymous ? undefined : (reporterName.trim() || currentUser?.name || 'Estudiante'),
      reporterRole: currentUser?.role || 'estudiante',
      involvedPersons: involvedPersons.trim() || undefined,
      videoEvidence: attachedVideo ? {
        name: attachedVideo.name,
        size: attachedVideo.sizeFormatted,
        url: attachedVideo.url
      } : undefined,
      date: 'Hoy · Recién recibido',
      status: 'recibido',
    };

    try {
      const existing = JSON.parse(localStorage.getItem('escuela_segura_cases') || '[]');
      const updated = [newReport, ...existing];
      localStorage.setItem('escuela_segura_cases', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('escuela_segura_new_case', { detail: newReport }));
    } catch (err) {
      console.error('Error saving case report:', err);
    }

    setSubmitted(true);
  };

  const handleToggleAnonymous = () => {
    soundFx.playClick();
    const nextState = !isAnonymous;
    setIsAnonymous(nextState);
    if (nextState) {
      setReporterName('');
    } else if (currentUser?.name) {
      setReporterName(currentUser.name);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#faf6f2] text-slate-800 overflow-hidden">
      {/* Top Header */}
      <header className="pt-10 px-4 pb-3 bg-gradient-to-r from-[#3c0e18] to-[#5a1827] text-white flex items-center justify-between shrink-0 shadow-md">
        <button
          onClick={() => {
            soundFx.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 text-xs text-[#fed4cc] hover:text-white px-2 py-1 rounded-lg bg-white/10 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Portada</span>
        </button>
        <span className="font-cinzel text-xs font-bold tracking-wider text-[#ffe1d9]">
          PREVENCIÓN Y REPORTE
        </span>
        <button
          onClick={() => {
            soundFx.playPop();
            onNavigate('chat');
          }}
          className="text-xs text-[#fed4cc] hover:text-white font-medium bg-white/10 px-2 py-1 rounded-lg cursor-pointer"
        >
          Chat
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
        {submitted ? (
          <div className="flex flex-col items-center text-center py-5 px-2 animate-fade-in">
            <div className="w-15 h-15 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 shadow-inner">
              <CheckCircle className="w-9 h-9" />
            </div>

            <h3 className="font-cinzel text-lg font-bold text-[#481624]">
              Reporte Recibido con Éxito
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-[280px]">
              El equipo de convivencia y mediación escolar ha sido notificado para activar los protocolos de resguardo.
            </p>

            {/* Folio Card */}
            <div className="w-full bg-white border border-[#deb386]/40 rounded-2xl p-4 my-3.5 shadow-sm text-left">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                <span>Código de Seguimiento</span>
                <span className="font-mono font-bold text-[#481624]">{folio}</span>
              </div>
              <div className="pt-2 text-xs text-slate-600 space-y-1.5">
                <p>
                  <strong>Modalidad:</strong>{' '}
                  <span className={isAnonymous ? 'text-slate-700' : 'text-[#8d2a3c] font-semibold'}>
                    {isAnonymous ? '🔒 Confidencial Anónimo' : '👤 Reporte Identificado'}
                  </span>
                </p>
                {!isAnonymous && reporterName && (
                  <p>
                    <strong>Reportante:</strong> <span className="font-medium text-slate-800">{reporterName}</span>
                  </p>
                )}
                {involvedPersons && (
                  <p>
                    <strong>Involucrados:</strong>{' '}
                    <span className="font-medium text-slate-800">{involvedPersons}</span>
                  </p>
                )}
                <p><strong>Categoría:</strong> {category}</p>
                <p><strong>Ubicación:</strong> {location}</p>
                
                {/* Attached Video Details in Receipt */}
                {attachedVideo && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <p className="text-[#481624] font-bold flex items-center gap-1.5 mb-1.5">
                      <Film className="w-3.5 h-3.5 text-rose-600" />
                      <span>Evidencia en Video Registrada:</span>
                    </p>
                    <div className="rounded-xl overflow-hidden bg-black p-1 border border-slate-200">
                      <video
                        key={attachedVideo.url}
                        src={attachedVideo.url}
                        controls
                        playsInline
                        preload="auto"
                        className="w-full max-h-36 rounded-lg object-contain bg-black"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1">
                      {attachedVideo.name} · {attachedVideo.sizeFormatted} (Custodia segura cifrada)
                    </span>
                  </div>
                )}

                <p className="pt-1">
                  <strong>Estado:</strong>{' '}
                  <span className="text-amber-700 font-semibold">En revisión por orientación y prefectura</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col w-full gap-2 mt-1">
              <button
                onClick={() => {
                  soundFx.playClick();
                  onNavigate('chat');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#481624] text-white text-xs font-semibold hover:bg-[#5e1e30] transition-colors cursor-pointer"
              >
                Hablar con PazBot en el Chat
              </button>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setSubmitted(false);
                  setDescription('');
                  setReporterName('');
                  setInvolvedPersons('');
                  handleRemoveVideo();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300 transition-colors cursor-pointer"
              >
                Crear Otro Reporte
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Banner of Safe Space */}
            <div className="bg-gradient-to-r from-[#ffece8] to-[#fce4ec] border border-[#f5b2b2] rounded-2xl p-3 flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#8d2a3c] text-white flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-[#481624]">Espacio 100% Protegido y Seguro</h4>
                <p className="text-[11px] text-slate-600 leading-tight mt-0.5">
                  Tu testimonio es confidencial. Ayúdanos a erradicar el conflicto y fomentar la paz escolar.
                </p>
              </div>
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 shadow-2xs">
              <div className="flex items-center gap-2">
                <ShieldAlert className={`w-4 h-4 ${isAnonymous ? 'text-[#8d2a3c]' : 'text-slate-400'}`} />
                <div className="text-left">
                  <span className="text-xs font-semibold text-slate-800 block">Modo Anónimo</span>
                  <span className="text-[10px] text-slate-500 block leading-tight">
                    {isAnonymous ? 'No se solicitará tu nombre' : 'Reporte con identificación'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleAnonymous}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                  isAnonymous ? 'bg-[#481624]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    isAnonymous ? 'translate-x-4.5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Non-Anonymous Identity Fields (When Anonymous Mode is OFF) */}
            {!isAnonymous && (
              <div className="bg-gradient-to-b from-[#fff7f5] to-white border-2 border-[#e8a3b0] rounded-2xl p-3.5 space-y-3 shadow-xs animate-fade-in text-left">
                <div className="flex items-center gap-2 pb-1.5 border-b border-[#e8a3b0]/40">
                  <User className="w-4 h-4 text-[#8d2a3c]" />
                  <span className="text-xs font-bold text-[#481624]">
                    Identificación del Reportante
                  </span>
                </div>

                {/* Reporter Name Field */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tu Nombre Completo <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required={!isAnonymous}
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="Ej. Sofía Morales (Grado y Grupo opcional)"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8d2a3c]"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Permite al equipo de convivencia brindarte acompañamiento directo y protección.
                  </span>
                </div>
              </div>
            )}

            {/* Involved Persons Field */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 text-left shadow-2xs">
              <div className="flex items-center gap-2 mb-1.5">
                <Users className="w-4 h-4 text-[#8d2a3c]" />
                <label className="text-xs font-bold text-[#481624]">
                  Nombres de los Alumnos Involucrados en el Conflicto {!isAnonymous && <span className="text-rose-600">*</span>}
                </label>
              </div>
              <input
                type="text"
                required={!isAnonymous}
                value={involvedPersons}
                onChange={(e) => setInvolvedPersons(e.target.value)}
                placeholder="Ej. Nombre(s) y apellidos de los alumnos, grados o grupos..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#8d2a3c]"
              />
              <div className="mt-2 p-2 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 text-[10px] flex items-start gap-1.5">
                <span className="shrink-0">🔒</span>
                <span>
                  <strong>Garantía de Privacidad Familiar:</strong> Al formular la solución escolar, la dirección y docentes enviarán el plan y las pautas <em>única y exclusivamente</em> a los padres o acudientes de estos alumnos involucrados, protegiendo sus datos frente al resto de la comunidad escolar.
                </span>
              </div>
            </div>

            {/* Video Evidence Module (NEW) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 text-left shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-[#8d2a3c]" />
                  <label className="text-xs font-bold text-[#481624]">
                    Evidencia en Video de la Pelea / Conflicto
                  </label>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Opcional</span>
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
              />

              {/* Hidden native device camera capture */}
              <input
                type="file"
                ref={nativeCameraInputRef}
                accept="video/*"
                capture="environment"
                onChange={handleVideoSelect}
                className="hidden"
              />

              {attachedVideo ? (
                /* Video Preview Card with instant playback */
                <div className="bg-slate-900 rounded-xl p-3 text-white space-y-2 border border-slate-700 animate-fade-in shadow-md">
                  <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-800">
                    <div className="flex items-center gap-1.5 truncate pr-2">
                      <Film className="w-4 h-4 text-rose-400 shrink-0" />
                      <span className="truncate font-semibold text-xs text-white">{attachedVideo.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveVideo}
                      className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors cursor-pointer text-[10px] font-semibold flex items-center gap-1 shrink-0"
                      title="Eliminar o cambiar video"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cambiar</span>
                    </button>
                  </div>

                  {/* Playable Video Frame */}
                  <div className="relative rounded-lg overflow-hidden bg-black flex items-center justify-center min-h-[140px] shadow-inner">
                    <video
                      key={attachedVideo.url}
                      src={attachedVideo.url}
                      controls
                      playsInline
                      preload="auto"
                      className="w-full max-h-48 rounded-lg object-contain bg-black"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-300 pt-1">
                    <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                      {attachedVideo.sizeFormatted}
                    </span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Grabación lista para adjuntar</span>
                    </span>
                  </div>
                </div>
              ) : (
                /* Action Zone: Live In-App Recording OR Native Device Camera OR File Upload */
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* 1. Direct Live Camera Recording Button */}
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playPop();
                        setIsRecorderOpen(true);
                      }}
                      className="relative overflow-hidden border-2 border-rose-300 hover:border-rose-600 bg-gradient-to-b from-[#fff0f2] to-[#ffe5e8] rounded-xl p-2.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-[0.98] group shadow-2xs"
                    >
                      <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                        <span className="text-[8px] font-bold text-rose-700 tracking-wider uppercase">VIVO</span>
                      </div>
                      <div className="w-9 h-9 rounded-full bg-rose-600 text-white shadow-xs flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                        <Camera className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-bold text-[#481624] leading-tight">
                        Grabar en Vivo
                      </span>
                      <span className="text-[9px] text-slate-500 mt-0.5">
                        Cámara directa de la app
                      </span>
                    </button>

                    {/* 2. File Upload Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#deb386]/80 hover:border-[#8d2a3c] bg-[#faf6f3] hover:bg-[#f6eee8] rounded-xl p-2.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-[0.98] group shadow-2xs"
                    >
                      <div className="w-9 h-9 rounded-full bg-white shadow-xs flex items-center justify-center text-[#8d2a3c] mb-1 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-bold text-[#481624] leading-tight">
                        Subir Archivo
                      </span>
                      <span className="text-[9px] text-slate-500 mt-0.5">
                        Galería / Carrete
                      </span>
                    </button>
                  </div>

                  {/* Native mobile camera shortcut */}
                  <div className="flex items-center justify-center pt-0.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => nativeCameraInputRef.current?.click()}
                      className="font-medium text-slate-600 hover:text-[#8d2a3c] flex items-center gap-1.5 hover:underline cursor-pointer bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#8d2a3c]" />
                      <span>Abrir cámara nativa del dispositivo</span>
                    </button>
                  </div>
                </div>
              )}

              <p className="text-[10px] text-slate-500 leading-tight">
                🔒 La evidencia en video se encripta para resguardar la identidad de los estudiantes y será utilizada exclusivamente por el comité escolar para esclarecer los hechos.
              </p>
            </div>

            {/* Category Selection */}
            <div className="text-left">
              <label className="block text-xs font-bold text-[#481624] mb-1">
                Tipo de Situación o Conflicto
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#8d2a3c]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Selection */}
            <div className="text-left">
              <label className="block text-xs font-bold text-[#481624] mb-1">
                Lugar de la Escuela o Entorno
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#8d2a3c]"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Urgency */}
            <div className="text-left">
              <label className="block text-xs font-bold text-[#481624] mb-1">
                Nivel de Urgencia
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['baja', 'moderada', 'alta'] as IncidentUrgency[]).map((level) => {
                  const active = urgency === level;
                  return (
                    <button
                      type="button"
                      key={level}
                      onClick={() => {
                        soundFx.playClick();
                        setUrgency(level);
                      }}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold capitalize transition-all border cursor-pointer ${
                        active
                          ? level === 'alta'
                            ? 'bg-rose-700 text-white border-rose-800 shadow-sm'
                            : level === 'moderada'
                            ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                            : 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="text-left">
              <label className="block text-xs font-bold text-[#481624] mb-1">
                ¿Qué ocurrió? (Describe la situación)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Por favor relata brevemente qué pasó, qué se observa en el video y cómo podemos ayudarte..."
                required
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#8d2a3c] resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#8d2a3c] to-[#481624] text-white text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-md hover:from-[#a03045] hover:to-[#5e1e30] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {isAnonymous ? 'Enviar Reporte Anónimo con Video' : 'Enviar Reporte Identificado con Video'}
              </span>
            </button>
          </form>
        )}
      </div>

      {/* Bottom Emergency Fast Bar */}
      <div className="p-2.5 bg-[#f0e6e2] border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600 shrink-0">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          <span>¿Peligro físico inminente?</span>
        </div>
        <button
          onClick={() => {
            soundFx.playPop();
            onNavigate('protocols');
          }}
          className="text-rose-700 font-bold hover:underline cursor-pointer"
        >
          SOS Escolar
        </button>
      </div>

      {/* In-App Direct Video Camera Recorder Modal */}
      <VideoRecorderModal
        isOpen={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        onSaveRecording={(data) => {
          setAttachedVideo(data);
          soundFx.playSuccess();
        }}
      />
    </div>
  );
};
