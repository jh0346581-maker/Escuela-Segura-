import React, { useState } from 'react';
import { 
  UserRole, 
  UserProfile 
} from '../../types';
import { soundFx } from '../../utils/audio';
import { 
  GraduationCap, 
  BookOpen, 
  ClipboardList, 
  Building2, 
  Users, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  X,
  AlertCircle
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  currentUser?: UserProfile | null;
}

const ROLES: Array<{
  id: UserRole;
  label: string;
  icon: typeof GraduationCap;
  desc: string;
  badgeColor: string;
}> = [
  {
    id: 'estudiante',
    label: 'Estudiante',
    icon: GraduationCap,
    desc: 'Reporte confidencial, grabación en vivo, PazBot y rutas seguras',
    badgeColor: 'border-rose-400 bg-rose-500/10 text-rose-300',
  },
  {
    id: 'docente',
    label: 'Docente / Tutor',
    icon: BookOpen,
    desc: 'Supervisión de aula, registro de incidentes y mediación temprana',
    badgeColor: 'border-amber-400 bg-amber-500/10 text-amber-300',
  },
  {
    id: 'coordinador',
    label: 'Coordinador',
    icon: ClipboardList,
    desc: 'Gestión de casos, formulación de resoluciones y protocolos',
    badgeColor: 'border-purple-400 bg-purple-500/10 text-purple-300',
  },
  {
    id: 'rector',
    label: 'Rector / Director',
    icon: Building2,
    desc: 'Auditoría integral del plantel, métricas y resoluciones oficiales',
    badgeColor: 'border-emerald-400 bg-emerald-500/10 text-emerald-300',
  },
  {
    id: 'padre',
    label: 'Padre / Tutor',
    icon: Users,
    desc: 'Recepción confidencial de citaciones y acuerdos de su hijo(a)',
    badgeColor: 'border-blue-400 bg-blue-500/10 text-blue-300',
  },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser,
}) => {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>('estudiante');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gradeOrTitle, setGradeOrTitle] = useState('');
  const [representedStudentInput, setRepresentedStudentInput] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password.trim()) {
      setErrorMessage('Por favor ingresa tu correo y contraseña.');
      return;
    }

    if (!isLoginTab && !name.trim()) {
      setErrorMessage('Por favor ingresa tu nombre completo.');
      return;
    }

    if (!isLoginTab && selectedRole === 'padre' && !representedStudentInput.trim()) {
      setErrorMessage('Por favor especifica el nombre y grado del alumno(a) que representas.');
      return;
    }

    soundFx.playSuccess();

    // Check or register in local accounts store
    let accounts: Record<string, UserProfile> = {};
    try {
      accounts = JSON.parse(localStorage.getItem('escuela_segura_accounts') || '{}');
    } catch (err) {
      console.error(err);
    }

    let user: UserProfile;

    if (isLoginTab) {
      // Find existing account or construct verified session
      const existing = accounts[cleanEmail];
      if (existing) {
        user = existing;
      } else {
        // Build session based on login input
        const derivedName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
        user = {
          id: `usr-${Date.now()}`,
          name: derivedName.charAt(0).toUpperCase() + derivedName.slice(1),
          email: cleanEmail,
          role: selectedRole,
          gradeOrTitle: selectedRole === 'estudiante' ? 'Estudiante del Plantel' :
                        selectedRole === 'docente' ? 'Docente Titular' :
                        selectedRole === 'coordinador' ? 'Coordinación Escolar' :
                        selectedRole === 'rector' ? 'Dirección General' : 'Padre / Acudiente',
          campus: 'Plantel Central · Turno Matutino',
          representedStudent: selectedRole === 'padre' ? representedStudentInput.trim() : undefined,
          enrolledSince: new Date().getFullYear().toString(),
        };
        accounts[cleanEmail] = user;
        localStorage.setItem('escuela_segura_accounts', JSON.stringify(accounts));
      }
    } else {
      // Create new registered account
      user = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: cleanEmail,
        role: selectedRole,
        gradeOrTitle: gradeOrTitle.trim() || (
          selectedRole === 'estudiante' ? 'Estudiante' : 
          selectedRole === 'docente' ? 'Profesor' : 
          selectedRole === 'coordinador' ? 'Coordinación' : 
          selectedRole === 'rector' ? 'Dirección' : 'Acudiente Legal'
        ),
        campus: 'Plantel Central · Turno Matutino',
        representedStudent: selectedRole === 'padre' ? representedStudentInput.trim() : undefined,
        enrolledSince: new Date().getFullYear().toString(),
      };
      accounts[cleanEmail] = user;
      localStorage.setItem('escuela_segura_accounts', JSON.stringify(accounts));
    }

    localStorage.setItem('escuela_segura_user', JSON.stringify(user));
    onLoginSuccess(user);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in select-none">
      <div className="relative w-full max-w-xl bg-[#160810] border border-[#a45768]/60 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh]">
        {/* Header bar */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#3c0e18] via-[#5a1827] to-[#3c0e18] flex items-center justify-between border-b border-[#a45768]/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#ffe1d9]">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="font-cinzel text-sm sm:text-base font-extrabold text-[#ffe1d9] tracking-wider block">
                ESCUELA SEGURA · AUTENTICACIÓN
              </span>
              <span className="text-[10px] text-[#e8b0bc] block">
                Identifícate con tus credenciales escolares para acceder a tus funciones
              </span>
            </div>
          </div>

          {onClose && (
            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-4 text-left">
          {errorMessage && (
            <div className="p-3 bg-rose-900/80 border border-rose-500/50 rounded-xl text-xs text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Tabs: Login vs Register */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setIsLoginTab(true);
                setErrorMessage(null);
              }}
              className={`pb-1 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                isLoginTab
                  ? 'border-[#f5a7b8] text-[#ffe1d9]'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                setIsLoginTab(false);
                setErrorMessage(null);
              }}
              className={`pb-1 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                !isLoginTab
                  ? 'border-[#f5a7b8] text-[#ffe1d9]'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Crear Nueva Cuenta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection Grid */}
            <div>
              <label className="block text-xs font-bold text-[#fed4cc] mb-1.5">
                Selecciona tu Rol en el Plantel:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ROLES.map((r) => {
                  const isSelected = selectedRole === r.id;
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        soundFx.playClick();
                        setSelectedRole(r.id);
                      }}
                      className={`p-2.5 rounded-2xl border text-left transition-all active:scale-95 cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#5a1827] border-rose-400 text-white shadow-md ring-2 ring-rose-400/30'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-[#ffe1d9]' : 'text-slate-400'}`} />
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <span className="text-xs font-bold block">{r.label}</span>
                      <span className="text-[9px] text-slate-400 leading-tight mt-0.5 line-clamp-2">
                        {r.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inputs based on Role & Form Type */}
            <div className="space-y-3">
              {!isLoginTab && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Nombre Completo <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required={!isLoginTab}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ingresa tu nombre y apellidos..."
                      className="w-full bg-black/40 border border-white/20 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-400"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Correo Electrónico Institucional o Personal <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@colegio.edu"
                    className="w-full bg-black/40 border border-white/20 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-400"
                  />
                </div>
              </div>

              {!isLoginTab && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    {selectedRole === 'estudiante'
                      ? 'Grado y Grupo'
                      : selectedRole === 'docente'
                      ? 'Asignatura o Especialidad'
                      : selectedRole === 'coordinador'
                      ? 'Área de Coordinación'
                      : selectedRole === 'rector'
                      ? 'Cargo Directivo'
                      : 'Parentesco'}
                  </label>
                  <input
                    type="text"
                    value={gradeOrTitle}
                    onChange={(e) => setGradeOrTitle(e.target.value)}
                    placeholder={
                      selectedRole === 'estudiante' ? 'Ej. 3er Año Grupo A' :
                      selectedRole === 'docente' ? 'Ej. Matemáticas / Tutor' :
                      selectedRole === 'coordinador' ? 'Ej. Convivencia Escolar' :
                      selectedRole === 'rector' ? 'Ej. Rectoría' : 'Ej. Madre de Familia'
                    }
                    className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-400"
                  />
                </div>
              )}

              {selectedRole === 'padre' && (
                <div className="bg-blue-950/40 p-2.5 rounded-xl border border-blue-500/30">
                  <label className="block text-[11px] font-bold text-blue-200 mb-1">
                    Nombre y Grado del Alumno(a) que Representas <span className="text-rose-400">*</span>:
                  </label>
                  <input
                    type="text"
                    required={selectedRole === 'padre'}
                    value={representedStudentInput}
                    onChange={(e) => setRepresentedStudentInput(e.target.value)}
                    placeholder="Ej. Nombre completo del estudiante (Grado y Grupo)"
                    className="w-full bg-black/40 border border-blue-400/30 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  <span className="text-[10px] text-blue-300/80 mt-1 block">
                    🔒 Recibirás en privado citaciones y acuerdos exclusivamente cuando tu hijo(a) sea parte en una resolución.
                  </span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Contraseña de Seguridad <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/40 border border-white/20 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-400"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#8d2a3c] via-[#b8624d] to-[#5a1827] text-white text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg hover:from-[#a03045] hover:to-[#6d1e30] active:scale-[0.98] transition-all cursor-pointer mt-2"
            >
              <span>{isLoginTab ? 'Ingresar a Escuela Segura' : 'Crear Cuenta Escolar'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
