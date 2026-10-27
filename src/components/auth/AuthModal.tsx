import React, { useState, useEffect } from 'react';
import { 
  UserRole, 
  UserProfile,
  RegisteredAccount 
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
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  UserCheck,
  Sparkles,
  KeyRound,
  ShieldAlert
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  onLogout?: () => void;
  currentUser?: UserProfile | null;
}

const STORAGE_ACCOUNTS_KEY = 'escuela_segura_accounts';
const STORAGE_CURRENT_USER_KEY = 'escuela_segura_user';

export const ROLE_DETAILS: Record<UserRole, {
  label: string;
  icon: typeof GraduationCap;
  desc: string;
  badgeColor: string;
  permissions: string;
}> = {
  estudiante: {
    label: 'Estudiante',
    icon: GraduationCap,
    desc: 'Reporte confidencial con video/cámara, asistente virtual PazBot, botón SOS y mapa de zonas seguras.',
    badgeColor: 'border-rose-400 bg-rose-500/15 text-rose-300',
    permissions: 'Acceso a Botón SOS, Reporte Confidencial con Video, Mediador PazBot y Rutas Seguras.',
  },
  docente: {
    label: 'Docente / Tutor de Aula',
    icon: BookOpen,
    desc: 'Supervisión de convivencia en aula, canal de orientación temprana y mediación docente.',
    badgeColor: 'border-amber-400 bg-amber-500/15 text-amber-300',
    permissions: 'Recepción de reportes de aula, formulación de acuerdos tempranos y orientación estudiantil.',
  },
  coordinador: {
    label: 'Coordinador(a) de Convivencia',
    icon: ClipboardList,
    desc: 'Gestión formal de casos e incidentes, citación confidencial a padres y emisión de Actas de Conciliación.',
    badgeColor: 'border-purple-400 bg-purple-500/15 text-purple-300',
    permissions: 'Gestión completa de incidentes, actas de compromiso con validez institucional y citación a familias.',
  },
  rector: {
    label: 'Rector(a) / Dirección General',
    icon: Building2,
    desc: 'Supervisión integral de seguridad escolar, auditoría institucional y aprobación directiva.',
    badgeColor: 'border-emerald-400 bg-emerald-500/15 text-emerald-300',
    permissions: 'Control global del plantel, emisión de resoluciones directivas y auditoría de casos.',
  },
  padre: {
    label: 'Padre / Madre / Acudiente Legal',
    icon: Users,
    desc: 'Recepción privada de citaciones, acuerdos de mediación y firma digital exclusivamente de su hijo(a).',
    badgeColor: 'border-blue-400 bg-blue-500/15 text-blue-300',
    permissions: 'Acceso confidencial estricto a las resoluciones y actas donde su hijo(a) sea parte involucrada.',
  },
};

const ROLES_LIST: UserRole[] = ['estudiante', 'docente', 'coordinador', 'rector', 'padre'];

export function getStoredAccounts(): Record<string, RegisteredAccount> {
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error al leer cuentas registradas:', err);
  }
  return {};
}

export function saveStoredAccount(account: RegisteredAccount): void {
  const accounts = getStoredAccounts();
  accounts[account.email.trim().toLowerCase()] = account;
  localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onLogout,
  currentUser,
}) => {
  // Check if any accounts exist to default either to login or create account
  const [isLoginTab, setIsLoginTab] = useState(() => {
    const accounts = getStoredAccounts();
    return Object.keys(accounts).length > 0;
  });

  // Mode: 'form' | 'profile_card'
  const [viewMode, setViewMode] = useState<'form' | 'profile_card'>(() => {
    return currentUser ? 'profile_card' : 'form';
  });

  // Form Fields
  const [selectedRole, setSelectedRole] = useState<UserRole>('estudiante');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gradeOrTitle, setGradeOrTitle] = useState('');
  const [representedStudentInput, setRepresentedStudentInput] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync viewMode if currentUser changes
  useEffect(() => {
    if (currentUser) {
      setViewMode('profile_card');
    } else {
      setViewMode('form');
      const accounts = getStoredAccounts();
      if (Object.keys(accounts).length === 0) {
        setIsLoginTab(false);
      }
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleResetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setGradeOrTitle('');
    setRepresentedStudentInput('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleTabSwitch = (isLogin: boolean) => {
    soundFx.playClick();
    setIsLoginTab(isLogin);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handlePerformLogout = () => {
    soundFx.playPop();
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    if (onLogout) {
      onLogout();
    }
    setViewMode('form');
    setIsLoginTab(true);
    handleResetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    // Validations: Email
    if (!cleanEmail) {
      setErrorMessage('Por favor ingresa tu correo electrónico.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage('Por favor introduce una dirección de correo electrónico válida (ej: usuario@colegio.edu).');
      return;
    }

    // Validations: Password
    if (!password) {
      setErrorMessage('Por favor ingresa tu contraseña de seguridad.');
      return;
    }

    const accounts = getStoredAccounts();

    // ==========================================
    // FLUJO: INICIAR SESIÓN (LOGIN)
    // El rol NUNCA se selecciona al iniciar sesión:
    // El sistema obtiene el rol inmutable registrado con ese correo y contraseña.
    // ==========================================
    if (isLoginTab) {
      const existingAccount = accounts[cleanEmail];

      if (!existingAccount) {
        setErrorMessage(
          `No existe ninguna cuenta registrada con el correo "${cleanEmail}". Por favor haz clic en "Crear Nueva Cuenta" para registrarte con tu rol asignado.`
        );
        return;
      }

      if (existingAccount.password !== password) {
        setErrorMessage(
          'Contraseña incorrecta. Por favor verifica tus credenciales o asegúrate de haber escrito la contraseña correcta.'
        );
        return;
      }

      // Login exitoso: creamos sesión con los datos registrados y protegidos
      const userProfile: UserProfile = {
        id: existingAccount.id,
        name: existingAccount.name,
        email: existingAccount.email,
        role: existingAccount.role,
        gradeOrTitle: existingAccount.gradeOrTitle,
        campus: existingAccount.campus || 'Plantel Central · Turno Matutino',
        representedStudent: existingAccount.representedStudent,
        enrolledSince: existingAccount.enrolledSince || existingAccount.createdAt?.slice(0, 4) || '2026',
      };

      soundFx.playSuccess();
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(userProfile));
      setSuccessMessage(`¡Bienvenido(a), ${userProfile.name}! Has iniciado sesión como ${ROLE_DETAILS[userProfile.role].label}.`);

      setTimeout(() => {
        onLoginSuccess(userProfile);
        if (onClose) onClose();
      }, 700);

      return;
    }

    // ==========================================
    // FLUJO: CREAR NUEVA CUENTA (REGISTRO)
    // Aquí el usuario elige su rol por primera vez y
    // queda guardado de manera permanente y protegida.
    // ==========================================
    if (!name.trim()) {
      setErrorMessage('Por favor ingresa tu nombre completo para tu credencial institucional.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres para proteger la seguridad de tu perfil.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden. Por favor asegúrate de escribir la misma contraseña en ambos campos.');
      return;
    }

    if (selectedRole === 'padre' && !representedStudentInput.trim()) {
      setErrorMessage('Como Padre / Tutor, es obligatorio especificar el nombre y grado del alumno(a) que representas.');
      return;
    }

    // Comprobar si el correo ya existe
    if (accounts[cleanEmail]) {
      const existingRoleLabel = ROLE_DETAILS[accounts[cleanEmail].role]?.label || accounts[cleanEmail].role;
      setErrorMessage(
        `El correo "${cleanEmail}" ya está registrado en el sistema con el rol de ${existingRoleLabel}. No puedes duplicar cuentas con el mismo correo; por favor ve a "Iniciar Sesión".`
      );
      return;
    }

    // Determinar título o grado por defecto si no se especificó
    const defaultGradeOrTitle =
      gradeOrTitle.trim() ||
      (selectedRole === 'estudiante'
        ? 'Estudiante del Plantel'
        : selectedRole === 'docente'
        ? 'Docente Titular'
        : selectedRole === 'coordinador'
        ? 'Coordinación de Convivencia'
        : selectedRole === 'rector'
        ? 'Dirección General / Rectoría'
        : 'Padre / Acudiente Legal');

    const newAccount: RegisteredAccount = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      password: password,
      role: selectedRole,
      gradeOrTitle: defaultGradeOrTitle,
      campus: 'Plantel Central · Turno Matutino',
      representedStudent: selectedRole === 'padre' ? representedStudentInput.trim() : undefined,
      enrolledSince: new Date().getFullYear().toString(),
      createdAt: new Date().toISOString(),
    };

    saveStoredAccount(newAccount);

    const userProfile: UserProfile = {
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      role: newAccount.role,
      gradeOrTitle: newAccount.gradeOrTitle,
      campus: newAccount.campus,
      representedStudent: newAccount.representedStudent,
      enrolledSince: newAccount.enrolledSince,
    };

    soundFx.playSuccess();
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(userProfile));
    setSuccessMessage(`¡Cuenta creada con éxito! Tu rol fijado es: ${ROLE_DETAILS[userProfile.role].label}.`);

    setTimeout(() => {
      onLoginSuccess(userProfile);
      if (onClose) onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in select-none">
      <div className="relative w-full max-w-xl bg-[#160810] border border-[#a45768]/60 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh]">
        
        {/* Encabezado Principal */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#3c0e18] via-[#5a1827] to-[#3c0e18] flex items-center justify-between border-b border-[#a45768]/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#ffe1d9]">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="font-cinzel text-sm sm:text-base font-extrabold text-[#ffe1d9] tracking-wider block">
                ESCUELA SEGURA · ACCESO INSTITUCIONAL
              </span>
              <span className="text-[10px] text-[#e8b0bc] block">
                {currentUser 
                  ? 'Credencial Escolar y Gestión de Cuenta' 
                  : 'Para ingresar a la plataforma es necesario registrarse o iniciar sesión'}
              </span>
            </div>
          </div>

          {/* Botón de cerrar: SOLO permitido si el usuario ya está autenticado */}
          {currentUser && onClose && (
            <button
              onClick={() => {
                soundFx.playClick();
                onClose();
              }}
              title="Cerrar ventana"
              className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-4 text-left">
          
          {/* Alertas de error o éxito */}
          {errorMessage && (
            <div className="p-3 bg-rose-950/80 border border-rose-500/60 rounded-xl text-xs text-rose-200 flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-xs text-emerald-200 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {/* VISTA 1: Perfil de usuario activo (si ya está logueado) */}
          {currentUser && viewMode === 'profile_card' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#2a0c16] to-[#1a0810] border border-[#a45768]/40 shadow-inner">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c97561] to-[#5a1827] flex items-center justify-center text-white text-lg font-bold uppercase shadow-md">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-white">
                          {currentUser.name}
                        </h3>
                        <span className="w-2 h-2 rounded-full bg-emerald-400" title="Sesión activa" />
                      </div>
                      <p className="text-xs text-slate-300 font-mono">{currentUser.email}</p>
                    </div>
                  </div>

                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${ROLE_DETAILS[currentUser.role]?.badgeColor || 'border-white/20 bg-white/10 text-white'}`}>
                    {ROLE_DETAILS[currentUser.role]?.label || currentUser.role}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border-t border-white/10 pt-3 text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Cargo / Grado Escolar:</span>
                    <span className="font-semibold text-white">{currentUser.gradeOrTitle}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Sede Institucional:</span>
                    <span className="font-semibold text-white">{currentUser.campus}</span>
                  </div>
                  {currentUser.representedStudent && (
                    <div className="col-span-1 sm:col-span-2 bg-blue-950/40 p-2 rounded-xl border border-blue-500/30 text-blue-200">
                      <span className="text-[10px] text-blue-300 block font-bold">Estudiante que representa:</span>
                      <span className="font-semibold">{currentUser.representedStudent}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 p-2 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-300 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Atribuciones de tu rol:</strong> {ROLE_DETAILS[currentUser.role]?.permissions}
                  </span>
                </div>
              </div>

              {/* Botones de acción para el perfil */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    setViewMode('form');
                    setIsLoginTab(true);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <KeyRound className="w-4 h-4 text-[#f5a7b8]" />
                  <span>Iniciar con otra cuenta</span>
                </button>

                <button
                  type="button"
                  onClick={handlePerformLogout}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>

              {onClose && (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#8d2a3c] to-[#5a1827] text-white text-xs font-bold uppercase tracking-wider hover:brightness-110 cursor-pointer shadow-md transition-all"
                >
                  Continuar en Escuela Segura
                </button>
              )}
            </div>
          ) : (
            /* VISTA 2: FORMULARIO DE ACCESO (Iniciar Sesión vs Crear Cuenta) */
            <div className="space-y-4">
              
              {/* Pestañas: Iniciar Sesión vs Crear Nueva Cuenta */}
              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <button
                  type="button"
                  onClick={() => handleTabSwitch(true)}
                  className={`pb-1 px-3 text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer ${
                    isLoginTab
                      ? 'border-[#f5a7b8] text-[#ffe1d9]'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => handleTabSwitch(false)}
                  className={`pb-1 px-3 text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer ${
                    !isLoginTab
                      ? 'border-[#f5a7b8] text-[#ffe1d9]'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Crear Nueva Cuenta
                </button>
              </div>

              {/* Banner informativo según la pestaña */}
              {isLoginTab ? (
                <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#f5a7b8] shrink-0 mt-0.5" />
                  <p>
                    Ingresa con tu correo y contraseña registrados. Tu rol en la institución (estudiante, docente, coordinador, rector o padre) se cargará automáticamente y de forma segura.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p>
                    Selecciona tu rol verdadero en el plantel. Este rol quedará guardado junto a tus credenciales para garantizar la confidencialidad y responsabilidades de cada usuario.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* SELECTOR DE ROLES: SOLO VISIBLE EN "CREAR NUEVA CUENTA" */}
                {!isLoginTab && (
                  <div className="animate-fade-in">
                    <label className="block text-xs font-bold text-[#fed4cc] mb-1.5">
                      1. Selecciona tu Rol Institucional <span className="text-rose-400">*</span>:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ROLES_LIST.map((roleKey) => {
                        const r = ROLE_DETAILS[roleKey];
                        const isSelected = selectedRole === roleKey;
                        const Icon = r.icon;
                        return (
                          <button
                            key={roleKey}
                            type="button"
                            onClick={() => {
                              soundFx.playClick();
                              setSelectedRole(roleKey);
                            }}
                            className={`p-2.5 rounded-2xl border text-left transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'bg-[#5a1827] border-rose-400 text-white shadow-md ring-2 ring-rose-400/40'
                                : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1.5">
                                <Icon className={`w-4 h-4 ${isSelected ? 'text-[#ffe1d9]' : 'text-slate-400'}`} />
                                <span className="text-xs font-bold block">{r.label}</span>
                              </div>
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                            </div>
                            <span className="text-[10px] text-slate-300 leading-tight">
                              {r.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* CAMPOS DEL FORMULARIO */}
                <div className="space-y-3">
                  
                  {/* Nombre Completo (solo en Registro) */}
                  {!isLoginTab && (
                    <div className="animate-fade-in">
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
                          placeholder="Ej. Valeria Gómez / Prof. Carlos Méndez..."
                          className="w-full bg-black/40 border border-white/20 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-400"
                        />
                      </div>
                    </div>
                  )}

                  {/* Correo Electrónico (en ambos) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Correo Electrónico <span className="text-rose-400">*</span>
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

                  {/* Campo complementario según el rol (solo en Registro) */}
                  {!isLoginTab && (
                    <div className="animate-fade-in">
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        {selectedRole === 'estudiante'
                          ? 'Grado y Grupo Escolar'
                          : selectedRole === 'docente'
                          ? 'Asignatura o Especialidad a Cargo'
                          : selectedRole === 'coordinador'
                          ? 'Área de Coordinación'
                          : selectedRole === 'rector'
                          ? 'Despacho Directivo'
                          : 'Parentesco'}
                      </label>
                      <input
                        type="text"
                        value={gradeOrTitle}
                        onChange={(e) => setGradeOrTitle(e.target.value)}
                        placeholder={
                          selectedRole === 'estudiante' ? 'Ej. 3er Año Grupo A' :
                          selectedRole === 'docente' ? 'Ej. Matemáticas / Tutor 10°' :
                          selectedRole === 'coordinador' ? 'Ej. Coordinación de Convivencia y Bienestar' :
                          selectedRole === 'rector' ? 'Ej. Rectoría General' : 'Ej. Madre de Familia / Tutor Legal'
                        }
                        className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-400"
                      />
                    </div>
                  )}

                  {/* Si es Padre: Alumno representado (solo en Registro) */}
                  {!isLoginTab && selectedRole === 'padre' && (
                    <div className="bg-blue-950/40 p-3 rounded-xl border border-blue-500/30 animate-fade-in">
                      <label className="block text-[11px] font-bold text-blue-200 mb-1">
                        Nombre y Grado del Alumno(a) que Representas <span className="text-rose-400">*</span>:
                      </label>
                      <input
                        type="text"
                        required={selectedRole === 'padre'}
                        value={representedStudentInput}
                        onChange={(e) => setRepresentedStudentInput(e.target.value)}
                        placeholder="Ej. Mateo Gómez (3° Grado A)"
                        className="w-full bg-black/40 border border-blue-400/30 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                      <span className="text-[10px] text-blue-300/80 mt-1.5 block leading-tight">
                        🔒 Privacidad garantizada: Solo recibirás notificaciones y acuerdos cuando tu alumno(a) sea parte involucrada en un caso.
                      </span>
                    </div>
                  )}

                  {/* Contraseña */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Contraseña <span className="text-rose-400">*</span>
                      {!isLoginTab && <span className="text-[10px] text-slate-400 font-normal"> (mínimo 6 caracteres)</span>}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-black/40 border border-white/20 rounded-xl pl-9 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                        title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirmar Contraseña (solo en Registro) */}
                  {!isLoginTab && (
                    <div className="animate-fade-in">
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Confirmar Contraseña <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required={!isLoginTab}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-black/40 border border-white/20 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-400"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Botón de Enviar */}
                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-gradient-to-r from-[#8d2a3c] via-[#b8624d] to-[#5a1827] text-white text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg hover:from-[#a03045] hover:to-[#6d1e30] active:scale-[0.98] transition-all cursor-pointer mt-2"
                >
                  <span>{isLoginTab ? 'Ingresar a Escuela Segura' : 'Guardar y Crear Cuenta'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Acceso para cambiar de formulario rápidamente */}
                <div className="text-center pt-1">
                  {isLoginTab ? (
                    <p className="text-[11px] text-slate-400">
                      ¿Aún no tienes una cuenta registrada?{' '}
                      <button
                        type="button"
                        onClick={() => handleTabSwitch(false)}
                        className="text-[#f5a7b8] font-bold hover:underline cursor-pointer ml-1"
                      >
                        Crear una cuenta aquí
                      </button>
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400">
                      ¿Ya te habías registrado anteriormente?{' '}
                      <button
                        type="button"
                        onClick={() => handleTabSwitch(true)}
                        className="text-[#f5a7b8] font-bold hover:underline cursor-pointer ml-1"
                      >
                        Inicia sesión con tu correo
                      </button>
                    </p>
                  )}
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
