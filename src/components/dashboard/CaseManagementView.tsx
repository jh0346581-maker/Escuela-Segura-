import React, { useState, useEffect } from 'react';
import { 
  IncidentReport, 
  UserProfile, 
  AppScreen, 
  SolutionPlan,
  TargetGuardianNotification 
} from '../../types';
import { soundFx } from '../../utils/audio';
import { 
  ArrowLeft, 
  Film, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Search, 
  Users, 
  MapPin, 
  Play, 
  Send, 
  FileText, 
  HeartHandshake, 
  Bell, 
  BadgeCheck, 
  Home, 
  PenTool, 
  Sparkles, 
  AlertTriangle,
  GraduationCap,
  MessageCircle,
  HelpCircle,
  Lock,
  Printer,
  X,
  Check,
  ShieldCheck,
  FolderCheck,
  PlusCircle
} from 'lucide-react';

interface CaseManagementViewProps {
  currentUser: UserProfile | null;
  onBack: () => void;
  onNavigate: (screen: AppScreen) => void;
}

export const CaseManagementView: React.FC<CaseManagementViewProps> = ({
  currentUser,
  onBack,
  onNavigate,
}) => {
  const [cases, setCases] = useState<IncidentReport[]>(() => {
    try {
      const saved = localStorage.getItem('escuela_segura_cases');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out any previous mock seed IDs to ensure only real user reports exist
          const realReports = parsed.filter(
            (p: IncidentReport) => !['ES-2026-9481', 'ES-2026-8812', 'ES-2026-7734'].includes(p.id)
          );
          return realReports;
        }
      }
    } catch (e) {
      console.error('Error loading cases:', e);
    }
    return [];
  });

  const [selectedCase, setSelectedCase] = useState<IncidentReport | null>(cases[0] || null);
  const [filterUrgency, setFilterUrgency] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Solution formulation state (staff only)
  const [isSolving, setIsSolving] = useState(false);
  const [solutionType, setSolutionType] = useState<SolutionPlan['solutionType']>('compromiso_convivencia');
  const [diagnosisInput, setDiagnosisInput] = useState('');
  const [agreementsInput, setAgreementsInput] = useState('');
  const [restorativeInput, setRestorativeInput] = useState('');
  const [guidanceInput, setGuidanceInput] = useState('');

  // Targeted guardians state in form
  const [formGuardians, setFormGuardians] = useState<Array<{
    studentName: string;
    guardianName: string;
    relationship: string;
    phoneOrEmail: string;
    channel: string;
    selected: boolean;
  }>>([]);

  // Parent signature state
  const [parentNameInput, setParentNameInput] = useState(currentUser?.role === 'padre' ? currentUser.name : '');
  const [parentCommentInput, setParentCommentInput] = useState('');
  const [showSignModal, setShowSignModal] = useState(false);

  // Official Mediation Certificate Modal
  const [showActaModal, setShowActaModal] = useState(false);

  const isStaff = currentUser?.role === 'coordinador' || currentUser?.role === 'rector' || currentUser?.role === 'docente';
  const isParent = currentUser?.role === 'padre';

  // Privacy Access Control for Parents:
  const isParentAuthorizedForCase = (report: IncidentReport | null): boolean => {
    if (!report) return false;
    if (!isParent) return true;
    if (!currentUser) return false;

    const rep = currentUser.representedStudent?.toLowerCase() || '';
    const parentName = currentUser.name.toLowerCase();

    // Check targetGuardians
    if (report.solutionPlan?.targetGuardians) {
      const match = report.solutionPlan.targetGuardians.some((tg) => {
        const sName = tg.studentName.toLowerCase();
        const gName = tg.guardianName.toLowerCase();
        return (
          (rep && (sName.includes(rep.split(' ')[0]) || rep.includes(sName.split(' ')[0]))) ||
          parentName.includes(gName) ||
          gName.includes(parentName)
        );
      });
      if (match) return true;
    }

    // Check involvedPersons
    if (report.involvedPersons && rep) {
      const firstWord = rep.split(' ')[0].replace(/[^a-zA-Z]/g, '').toLowerCase();
      if (firstWord && report.involvedPersons.toLowerCase().includes(firstWord)) {
        return true;
      }
    }

    // Check parent signature
    if (report.solutionPlan?.parentSignatures?.some(sig => sig.parentName.toLowerCase().includes(parentName))) {
      return true;
    }

    return false;
  };

  // Sync with real-time incoming reports
  useEffect(() => {
    const handleNewCase = (event: any) => {
      const newCase = event.detail as IncidentReport;
      if (newCase) {
        setCases((prev) => [newCase, ...prev.filter((c) => c.id !== newCase.id)]);
        setSelectedCase(newCase);
        soundFx.playPop();
        setActionSuccess(`¡Nuevo reporte recibido: Folio ${newCase.id}!`);
      }
    };

    window.addEventListener('escuela_segura_new_case', handleNewCase);
    return () => window.removeEventListener('escuela_segura_new_case', handleNewCase);
  }, []);

  const saveCases = (updated: IncidentReport[]) => {
    setCases(updated);
    try {
      localStorage.setItem('escuela_segura_cases', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = (caseId: string, nextStatus: IncidentReport['status']) => {
    soundFx.playSuccess();
    const updated = cases.map((c) => (c.id === caseId ? { ...c, status: nextStatus } : c));
    saveCases(updated);
    if (selectedCase && selectedCase.id === caseId) {
      setSelectedCase((prev) => prev ? { ...prev, status: nextStatus } : null);
    }
    setActionSuccess(`Estado actualizado a: ${nextStatus.replace('_', ' ').toUpperCase()}`);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  // Open Solution Formulation Drawer and parse involved students
  const handleOpenSolutionForm = (report: IncidentReport) => {
    soundFx.playClick();
    setSelectedCase(report);

    // Parse involved students from string
    const involved = (report.involvedPersons || '')
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const initialGuardians = (involved.length > 0 ? involved : ['Estudiante']).map(student => ({
      studentName: student,
      guardianName: '',
      relationship: 'Padre / Madre / Tutor Legal',
      phoneOrEmail: '',
      channel: 'WhatsApp & Notificación App',
      selected: true
    }));

    setFormGuardians(initialGuardians);

    if (report.solutionPlan) {
      setSolutionType(report.solutionPlan.solutionType);
      setDiagnosisInput(report.solutionPlan.diagnosis);
      setAgreementsInput(report.solutionPlan.agreements.join('\n'));
      setRestorativeInput(report.solutionPlan.restorativeMeasure);
      setGuidanceInput(report.solutionPlan.guidanceForParents);
    } else {
      setSolutionType('compromiso_convivencia');
      setDiagnosisInput(`Intervención pedagógica en el reporte '${report.category}'. Se convocó a las partes para acordar compromisos de no agresión y respeto.`);
      setAgreementsInput('1. Disculpa mutua y respeto recíproco permanente.\n2. Cumplimiento de turnos y espacios pacíficos.\n3. Acudir al mediador escolar ante discrepancias.');
      setRestorativeInput('Actividad comunitaria formativa de integración en el plantel.');
      setGuidanceInput('Acompañar al estudiante en casa reforzando la resolución dialogada de desacuerdos. Mantener enlace directo con el tutor docente.');
    }

    setIsSolving(true);
  };

  // Save and publish solution strictly to involved guardians
  const handlePublishSolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    soundFx.playSuccess();

    const agreementsList = agreementsInput
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const targetGuardiansList: TargetGuardianNotification[] = formGuardians
      .filter(g => g.selected)
      .map(g => ({
        studentName: g.studentName,
        guardianName: g.guardianName.trim() || `Tutor de ${g.studentName}`,
        relationship: g.relationship,
        contactChannel: g.channel,
        phoneOrEmail: g.phoneOrEmail.trim() || 'Canal Escolar Oficial',
        status: 'entregado',
        notifiedAt: `Hoy · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      }));

    const newSolution: SolutionPlan = {
      resolvedByRole: (currentUser?.role as any) || 'coordinador',
      resolvedByName: currentUser?.name || 'Comité de Convivencia Escolar',
      resolvedAt: `Hoy · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      solutionType,
      diagnosis: diagnosisInput.trim() || 'Diagnóstico de convivencia concluido favorablemente.',
      agreements: agreementsList.length > 0 ? agreementsList : ['Compromiso formal de respeto y diálogo.'],
      restorativeMeasure: restorativeInput.trim() || 'Medida pedagógica restaurativa escolar.',
      guidanceForParents: guidanceInput.trim() || 'Reforzar en casa el respeto mutuo y la empatía.',
      notifiedToParents: true,
      isConfidentialToInvolved: true,
      targetGuardians: targetGuardiansList.length > 0 ? targetGuardiansList : [
        {
          studentName: selectedCase.involvedPersons || 'Estudiante involucrado',
          guardianName: 'Acudiente Titular',
          relationship: 'Padre / Tutor',
          contactChannel: 'WhatsApp Institucional & App',
          phoneOrEmail: 'Canal Oficial',
          status: 'entregado',
          notifiedAt: 'Hoy · En este momento'
        }
      ],
      parentSignatures: selectedCase.solutionPlan?.parentSignatures || []
    };

    const updated = cases.map((c) =>
      c.id === selectedCase.id
        ? {
            ...c,
            status: 'solucionado_notificado' as const,
            solutionPlan: newSolution,
            assignedMediator: currentUser?.name || c.assignedMediator,
          }
        : c
    );

    saveCases(updated);
    setSelectedCase((prev) => prev ? {
      ...prev,
      status: 'solucionado_notificado',
      solutionPlan: newSolution,
    } : null);
    setIsSolving(false);
    setActionSuccess(`¡Solución aprobada y despachada confidencialmente a los tutores de los alumnos involucrados!`);
    setTimeout(() => setActionSuccess(null), 5000);
  };

  // Parent registers signature of acknowledgment
  const handleParentSign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentNameInput.trim() || !selectedCase) return;
    soundFx.playSuccess();

    const cryptoSimHash = `SHA-256: ${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 6)}`;

    const newSignature = {
      parentName: parentNameInput.trim(),
      studentName: currentUser?.representedStudent || selectedCase.solutionPlan?.targetGuardians?.[0]?.studentName || 'Alumno Representado',
      signedAt: `Hoy · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      comment: parentCommentInput.trim() || 'Enterado y conforme con la solución implementada por el plantel.',
      signatureHash: cryptoSimHash
    };

    const updated = cases.map((c) => {
      if (c.id === selectedCase.id && c.solutionPlan) {
        const signatures = c.solutionPlan.parentSignatures || [];
        const updatedTargetGuardians = (c.solutionPlan.targetGuardians || []).map(tg => {
          if (tg.guardianName.toLowerCase().includes(parentNameInput.trim().toLowerCase()) ||
              parentNameInput.trim().toLowerCase().includes(tg.guardianName.toLowerCase()) ||
              (currentUser?.representedStudent && tg.studentName.toLowerCase().includes(currentUser.representedStudent.toLowerCase().split(' ')[0]))) {
            return { ...tg, status: 'firmado' as const };
          }
          return tg;
        });

        return {
          ...c,
          solutionPlan: {
            ...c.solutionPlan,
            targetGuardians: updatedTargetGuardians,
            parentSignatures: [...signatures, newSignature]
          }
        };
      }
      return c;
    });

    saveCases(updated);
    if (selectedCase.solutionPlan) {
      setSelectedCase((prev) => prev ? {
        ...prev,
        solutionPlan: {
          ...prev.solutionPlan!,
          targetGuardians: (prev.solutionPlan?.targetGuardians || []).map(tg => {
            if (tg.guardianName.toLowerCase().includes(parentNameInput.trim().toLowerCase()) ||
                parentNameInput.trim().toLowerCase().includes(tg.guardianName.toLowerCase())) {
              return { ...tg, status: 'firmado' as const };
            }
            return tg;
          }),
          parentSignatures: [...(prev.solutionPlan?.parentSignatures || []), newSignature]
        }
      } : null);
    }

    setShowSignModal(false);
    setParentCommentInput('');
    setActionSuccess('¡Firma de acudiente registrada exitosamente! El colegio ha recibido tu acuse oficial.');
    setTimeout(() => setActionSuccess(null), 4000);
  };

  const filteredCases = cases.filter((c) => {
    const matchesUrgency = filterUrgency === 'todos' || c.urgency === filterUrgency;
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.reporterName && c.reporterName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.involvedPersons && c.involvedPersons.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesUrgency && matchesSearch;
  });

  const isCurrentParentAuthorized = isParentAuthorizedForCase(selectedCase);

  return (
    <div className="w-full h-full flex flex-col bg-[#faf6f2] text-slate-800 overflow-hidden text-left relative">
      {/* Top Header */}
      <header className="pt-10 px-4 pb-3 bg-gradient-to-r from-[#3c0e18] to-[#5a1827] text-white flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFx.playClick();
              onBack();
            }}
            className="flex items-center gap-1.5 text-xs text-[#fed4cc] hover:text-white px-2 py-1 rounded-lg bg-white/10 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-cinzel text-xs font-bold tracking-wider text-[#ffe1d9]">
                {isStaff
                  ? 'BANDEJA DE GESTIÓN & RESOLUCIONES ESCOLARES'
                  : isParent
                  ? 'CANAL DE CITACIONES & SOLUCIONES FAMILIARES'
                  : 'CASOS & ACUERDOS DE CONVIVENCIA'}
              </h3>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.2 rounded-full font-bold">
                {isStaff ? 'Panel Directivo' : isParent ? 'Privacidad Acudientes' : 'Comunidad'}
              </span>
            </div>
            <span className="text-[10px] text-[#e8b0bc]">
              {isStaff
                ? `Personal activo: ${currentUser?.name || 'Directivo'} (${currentUser?.role || 'Docente'})`
                : isParent
                ? `Acudiente: ${currentUser?.name || 'Familia'} · Alumno: ${currentUser?.representedStudent || 'Registrado'}`
                : 'Consulta los reportes y las resoluciones de la institución'}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            soundFx.playPop();
            onNavigate('report');
          }}
          className="text-xs bg-white/10 hover:bg-white/20 text-[#ffe1d9] px-2.5 py-1 rounded-lg font-medium cursor-pointer"
        >
          Nuevo Reporte
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
        {/* Banner Alert for Action Feedback */}
        {actionSuccess && (
          <div className="p-3 bg-emerald-800 text-white rounded-xl text-xs flex items-center gap-2 animate-fade-in shadow-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span className="font-medium">{actionSuccess}</span>
          </div>
        )}

        {/* Informative Role Banner */}
        <div className="bg-gradient-to-r from-[#2a121c] to-[#14060d] text-white p-3 rounded-2xl border border-[#deb386]/30 shadow-xs flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#5a1827] flex items-center justify-center text-[#deb386] shrink-0">
              {isStaff ? <GraduationCap className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <span className="font-bold text-[#fed4cc] block text-xs">
                {isStaff
                  ? 'Despacho Exclusivo al Acudiente de los Involucrados'
                  : isParent
                  ? 'Garantía de Confidencialidad y Protección de Datos'
                  : 'Espacio Seguro de Resolución y Acuerdos'}
              </span>
              <p className="text-[11px] text-[#e0b0bc] leading-tight mt-0.5">
                {isStaff
                  ? 'Al formular la solución, el acta se notifica única y exclusivamente a los padres o tutores de los alumnos que participaron en el conflicto.'
                  : isParent
                  ? 'Solo puedes ver los detalles y acuerdos de los casos donde tu hijo(a) sea parte involucrada. Las situaciones de otros alumnos están legalmente reservadas.'
                  : 'Los acuerdos buscan reparar el daño y restaurar la convivencia pacífica sin estigmatizaciones.'}
              </p>
            </div>
          </div>
        </div>

        {/* If no cases exist in the database, show clean empty state */}
        {cases.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-xs flex flex-col items-center justify-center space-y-3 min-h-[340px]">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-inner">
              <FolderCheck className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-cinzel text-base font-bold text-slate-800">
                Bandeja Limpia · Sin Incidentes Reportados
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                Actualmente no hay reportes de peleas o conflictos pendientes de resolución en el sistema. Todos los casos registrados por la comunidad escolar aparecerán aquí en tiempo real.
              </p>
            </div>
            <button
              onClick={() => {
                soundFx.playPop();
                onNavigate('report');
              }}
              className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8d2a3c] to-[#5a1827] text-white font-bold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Crear Nuevo Reporte Escolar</span>
            </button>
          </div>
        ) : (
          <>
            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por folio, alumnos o categoría..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#8d2a3c]"
                />
              </div>

              <div className="flex items-center gap-1 text-xs">
                {['todos', 'alta', 'moderada'].map((u) => (
                  <button
                    key={u}
                    onClick={() => setFilterUrgency(u)}
                    className={`px-2.5 py-1 rounded-lg capitalize transition-colors text-[11px] font-semibold cursor-pointer ${
                      filterUrgency === u
                        ? 'bg-[#481624] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            {/* Cases Split Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              {/* Left Column: Cases List */}
              <div className="md:col-span-5 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Bandeja de Casos ({filteredCases.length})
                </span>

                {filteredCases.map((c) => {
                  const isSelected = selectedCase?.id === c.id;
                  const hasSolution = !!c.solutionPlan;
                  const isAuthorized = !isParent || isParentAuthorizedForCase(c);

                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        soundFx.playPop();
                        setSelectedCase(c);
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#fff5f2] to-white border-[#8d2a3c] shadow-md ring-1 ring-[#8d2a3c]'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono font-bold text-[#481624] text-[11px]">
                          {c.id}
                        </span>
                        <div className="flex items-center gap-1">
                          {hasSolution && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Solucionado</span>
                            </span>
                          )}
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              c.urgency === 'alta'
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {c.urgency}
                          </span>
                        </div>
                      </div>

                      <h5 className="text-xs font-bold text-slate-800 line-clamp-1">
                        {c.category}
                      </h5>

                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{c.location}</span>
                      </div>

                      {/* Privacy Badge for Parent View */}
                      {isParent && (
                        <div className="mt-1.5">
                          {isAuthorized ? (
                            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                              <Bell className="w-3 h-3 text-emerald-600" />
                              <span>Citación para tu familia ({currentUser?.representedStudent})</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                              <Lock className="w-3 h-3 text-slate-400" />
                              <span>Reservado a los tutores de los involucrados</span>
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-100">
                        <span>{c.isAnonymous ? '🔒 Reporte Anónimo' : `👤 ${c.reporterName}`}</span>
                        {c.videoEvidence && (
                          <span className="text-rose-700 font-semibold flex items-center gap-1">
                            <Film className="w-3 h-3" />
                            <span>Video</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Case Inspection & Solution Formulation / Reading */}
              {selectedCase && (
                <div className="md:col-span-7 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
                  {/* Header of Selected Case */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#481624] block">
                        {selectedCase.id}
                      </span>
                      <h4 className="text-sm font-bold text-slate-800">
                        {selectedCase.category}
                      </h4>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        selectedCase.status === 'solucionado_notificado'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : selectedCase.status === 'acuerdo_firmado'
                          ? 'bg-teal-100 text-teal-800'
                          : selectedCase.status === 'mediacion_iniciada'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {selectedCase.status === 'solucionado_notificado'
                        ? 'Notificado a Tutores de Involucrados'
                        : selectedCase.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* IF CURRENT USER IS PARENT AND IS NOT AUTHORIZED -> DISPLAY CONFIDENTIALITY SHIELD */}
                  {isParent && !isCurrentParentAuthorized ? (
                    <div className="py-8 px-4 text-center space-y-4 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200">
                      <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center mx-auto text-slate-500 shadow-inner">
                        <Lock className="w-8 h-8 text-slate-600" />
                      </div>
                      <div>
                        <h4 className="font-cinzel text-sm font-bold text-slate-800">
                          EXPEDIENTE DISCIPLINARIO CONFIDENCIAL Y RESERVADO
                        </h4>
                        <p className="text-xs text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
                          Por respeto a la dignidad y en cumplimiento de la <strong>Ley de Protección de Datos de Niñas, Niños y Adolescentes</strong>, este reporte y su plan de solución han sido notificados <strong>ÚNICA Y EXCLUSIVAMENTE</strong> al padre o tutor legal de los estudiantes involucrados en el suceso.
                        </p>
                      </div>

                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 max-w-md mx-auto text-left space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-amber-950">
                          <ShieldCheck className="w-4 h-4 text-amber-700" />
                          <span>Protección Familiar Garantizada</span>
                        </div>
                        <p className="leading-tight">
                          Tu cuenta como acudiente de <strong>{currentUser?.representedStudent || 'tu hijo(a)'}</strong> solo tiene acceso a las citaciones y resoluciones que le conciernen de forma directa. La institución educativa nunca divulgará problemas de tu hijo a otros padres ni viceversa.
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* AUTHORIZED VIEW (STAFF, STUDENTS, OR AUTHORIZED INVOLVED PARENT) */
                    <>
                      {/* Specific Guardian Notice Banner for Parents */}
                      {isParent && isCurrentParentAuthorized && (
                        <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-950 text-white flex items-center justify-between gap-3 shadow-sm border border-emerald-400/40">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center shrink-0">
                              <Bell className="w-4 h-4 text-emerald-200" />
                            </div>
                            <div className="text-xs">
                              <span className="font-bold text-emerald-200 block">
                                Citación & Plan de Acompañamiento Dirigido a tu Hogar
                              </span>
                              <span className="text-[11px] text-emerald-100/90">
                                Notificación oficial confidencial para el acudiente de {currentUser?.representedStudent}
                              </span>
                            </div>
                          </div>
                          {selectedCase.solutionPlan && (
                            <button
                              onClick={() => setShowActaModal(true)}
                              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-[11px] font-bold text-emerald-200 cursor-pointer flex items-center gap-1 shrink-0"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Ver Acta</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Case Details Box */}
                      <div className="text-xs space-y-1.5 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                        <p>
                          <strong>Fecha de reporte:</strong> {selectedCase.date}
                        </p>
                        <p>
                          <strong>Ubicación:</strong> {selectedCase.location}
                        </p>
                        <p>
                          <strong>Modalidad de reporte:</strong>{' '}
                          {selectedCase.isAnonymous ? (
                            '🔒 Confidencial Anónimo'
                          ) : (
                            <span>👤 Identificado ({selectedCase.reporterName})</span>
                          )}
                        </p>
                        {selectedCase.involvedPersons && (
                          <p>
                            <strong>Alumnos Involucrados:</strong>{' '}
                            <span className="font-semibold text-[#481624]">{selectedCase.involvedPersons}</span>
                          </p>
                        )}
                        {selectedCase.assignedMediator && (
                          <p>
                            <strong>Responsable / Mediador:</strong>{' '}
                            <span className="text-emerald-700 font-semibold">{selectedCase.assignedMediator}</span>
                          </p>
                        )}
                      </div>

                      {/* Incident Description */}
                      <div>
                        <span className="text-[11px] font-bold text-slate-700 block mb-1">
                          Descripción de los Hechos:
                        </span>
                        <p className="text-xs text-slate-700 bg-[#fffbf9] border border-[#deb386]/40 p-3 rounded-xl leading-relaxed">
                          "{selectedCase.description}"
                        </p>
                      </div>

                      {/* Video Evidence Preview */}
                      {selectedCase.videoEvidence ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#481624] flex items-center gap-1.5">
                              <Film className="w-4 h-4 text-rose-600" />
                              <span>Evidencia en Video Registrada:</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {selectedCase.videoEvidence.size}
                            </span>
                          </div>

                          <div className="rounded-xl overflow-hidden bg-black p-1 shadow-inner border border-slate-300">
                            <video
                              key={selectedCase.videoEvidence.url}
                              src={selectedCase.videoEvidence.url}
                              controls
                              playsInline
                              preload="auto"
                              className="w-full max-h-48 rounded-lg object-contain bg-black"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-slate-100 text-slate-500 text-[11px] italic text-center">
                          Sin video probatorio adjunto.
                        </div>
                      )}

                      {/* SOLUTION SECTION */}
                      {selectedCase.solutionPlan ? (
                        <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-2 border-emerald-300 rounded-2xl p-4 space-y-3 shadow-xs">
                          <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                            <div className="flex items-center gap-2">
                              <BadgeCheck className="w-5 h-5 text-emerald-600" />
                              <div>
                                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                                  Solución Institucional Implementada
                                </h4>
                                <span className="text-[10px] text-emerald-700 font-medium">
                                  Resuelto por: {selectedCase.solutionPlan.resolvedByName} ({selectedCase.solutionPlan.resolvedAt})
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setShowActaModal(true)}
                                className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer flex items-center gap-1 transition-all"
                              >
                                <Printer className="w-3 h-3" />
                                <span>Acta Oficial</span>
                              </button>
                            </div>
                          </div>

                          {/* TARGETED GUARDIANS DISPATCH STATUS */}
                          <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Despacho Confidencial a Acudientes Involucrados:</span>
                              </span>
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                                🔒 Privado (No masivo)
                              </span>
                            </div>

                            <p className="text-[10px] text-slate-500 leading-tight">
                              Este plan fue transmitido exclusivamente al padre o tutor de cada alumno involucrado mediante canales institucionales cifrados.
                            </p>

                            <div className="space-y-1.5 pt-1">
                              {selectedCase.solutionPlan.targetGuardians?.map((tg, idx) => (
                                <div
                                  key={idx}
                                  className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between text-xs"
                                >
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-slate-800">{tg.guardianName}</span>
                                      <span className="text-[10px] text-slate-500">({tg.relationship} de <strong>{tg.studentName}</strong>)</span>
                                    </div>
                                    <span className="text-[10px] text-emerald-700 block">
                                      {tg.contactChannel} · {tg.phoneOrEmail}
                                    </span>
                                  </div>

                                  <div className="text-right">
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                      tg.status === 'firmado'
                                        ? 'bg-emerald-600 text-white'
                                        : tg.status === 'leido'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}>
                                      {tg.status === 'firmado' && <Check className="w-2.5 h-2.5" />}
                                      <span>{tg.status === 'firmado' ? 'Firmado' : tg.status === 'leido' ? 'Leído' : 'Entregado'}</span>
                                    </span>
                                    <span className="text-[9px] text-slate-400 block font-mono mt-0.5">{tg.notifiedAt}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Diagnosis */}
                          <div>
                            <span className="text-[11px] font-bold text-emerald-900 block">
                              Conclusión Pedagógica:
                            </span>
                            <p className="text-xs text-slate-700 bg-white/80 p-2.5 rounded-xl border border-emerald-100 mt-1">
                              {selectedCase.solutionPlan.diagnosis}
                            </p>
                          </div>

                          {/* Agreements list */}
                          <div>
                            <span className="text-[11px] font-bold text-emerald-900 block mb-1">
                              Acuerdos y Compromisos Firmados:
                            </span>
                            <ul className="space-y-1">
                              {selectedCase.solutionPlan.agreements.map((agr, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs text-slate-800 bg-white/90 p-2 rounded-lg border border-emerald-100">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                                  <span>{agr}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Restorative Measure */}
                          <div className="bg-teal-50/70 p-2.5 rounded-xl border border-teal-200 text-xs">
                            <span className="font-bold text-teal-900 block text-[11px]">
                              Medida Restaurativa Escolar:
                            </span>
                            <p className="text-teal-800 mt-0.5">{selectedCase.solutionPlan.restorativeMeasure}</p>
                          </div>

                          {/* Guidance for Parents in the Home */}
                          <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 text-xs space-y-1">
                            <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                              <Home className="w-3.5 h-3.5 text-amber-700" />
                              <span>Pautas y Recomendaciones para Padres de Familia en Casa:</span>
                            </div>
                            <p className="text-amber-900/90 leading-relaxed text-[11px]">
                              {selectedCase.solutionPlan.guidanceForParents}
                            </p>
                          </div>

                          {/* Parent Signatures & Acknowledgment Section */}
                          <div className="pt-2 border-t border-emerald-200 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-700 flex items-center gap-1">
                                <PenTool className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Firmas de Enterado de Acudientes ({selectedCase.solutionPlan.parentSignatures?.length || 0})</span>
                              </span>
                              <button
                                onClick={() => setShowSignModal(true)}
                                className="text-[11px] font-bold bg-[#8d2a3c] hover:bg-[#a63348] text-white px-2.5 py-1 rounded-lg cursor-pointer transition-all shadow-xs flex items-center gap-1"
                              >
                                <PenTool className="w-3 h-3" />
                                <span>Firmar de Enterado</span>
                              </button>
                            </div>

                            {selectedCase.solutionPlan.parentSignatures && selectedCase.solutionPlan.parentSignatures.length > 0 ? (
                              <div className="space-y-1.5">
                                {selectedCase.solutionPlan.parentSignatures.map((sig, i) => (
                                  <div key={i} className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                                      <div>
                                        <span className="font-bold text-slate-800">{sig.parentName}</span>
                                        {sig.studentName && (
                                          <span className="text-[10px] text-slate-500 ml-1">· Acudiente de {sig.studentName}</span>
                                        )}
                                      </div>
                                      <span className="text-slate-400 font-mono text-[10px]">{sig.signedAt}</span>
                                    </div>
                                    {sig.comment && (
                                      <p className="text-slate-600 text-[11px] italic mt-1">"{sig.comment}"</p>
                                    )}
                                    {sig.signatureHash && (
                                      <span className="text-[9px] text-emerald-700 font-mono block mt-1">
                                        ✓ Certificación Digital: {sig.signatureHash}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[11px] text-slate-500 italic bg-white/60 p-2 rounded-lg text-center">
                                Pendiente de firma por los acudientes notificados. Pulsa el botón "Firmar de Enterado" para rubricar el acta.
                              </p>
                            )}
                          </div>

                          {/* Edit solution button for staff */}
                          {isStaff && (
                            <button
                              onClick={() => handleOpenSolutionForm(selectedCase)}
                              className="w-full mt-2 py-1.5 px-3 rounded-xl border border-emerald-600 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition-all text-center cursor-pointer"
                            >
                              Actualizar Plan o Reenviar Notificación a Acudientes
                            </button>
                          )}
                        </div>
                      ) : (
                        /* Case Pending Solution */
                        <div className="space-y-3">
                          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>Caso en proceso. El comité directivo y docentes están evaluando las medidas conciliatorias.</span>
                            </div>
                          </div>

                          {isStaff ? (
                            <button
                              onClick={() => handleOpenSolutionForm(selectedCase)}
                              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#8d2a3c] to-[#5a1827] hover:brightness-110 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Sparkles className="w-4 h-4 text-[#fed4cc]" />
                              <span>⚡ Formular Solución & Notificar a los Acudientes Involucrados</span>
                            </button>
                          ) : (
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                              En cuanto el equipo docente determine el plan de solución, se notificará de manera confidencial a tu teléfono o aplicación.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Quick Status Bar for Teachers / Coordinators */}
                      {isStaff && (
                        <div className="pt-2 border-t border-slate-100 space-y-1.5">
                          <span className="text-[10px] font-bold text-[#481624] block uppercase tracking-wider">
                            Etapa Procesal:
                          </span>
                          <div className="grid grid-cols-3 gap-1.5 text-center">
                            <button
                              onClick={() => handleUpdateStatus(selectedCase.id, 'en_revision')}
                              className={`py-1 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                                selectedCase.status === 'en_revision'
                                  ? 'bg-amber-600 text-white border-amber-700'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              1. En Revisión
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(selectedCase.id, 'mediacion_iniciada')}
                              className={`py-1 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                                selectedCase.status === 'mediacion_iniciada'
                                  ? 'bg-blue-600 text-white border-blue-700'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              2. En Mediación
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(selectedCase.id, 'solucionado_notificado')}
                              className={`py-1 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer border ${
                                selectedCase.status === 'solucionado_notificado'
                                  ? 'bg-emerald-600 text-white border-emerald-700'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              3. Solucionado
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ============================================================ */}
      {/* MODAL: FORMULAR SOLUCIÓN CON DESTINATARIOS ESPECÍFICOS       */}
      {/* ============================================================ */}
      {isSolving && selectedCase && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 text-left">
            <header className="px-5 py-3.5 bg-gradient-to-r from-[#3c0e18] to-[#5a1827] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-[#fed4cc]" />
                <div>
                  <h3 className="font-cinzel text-xs font-bold text-[#ffe1d9]">
                    RESOLUCIÓN ESCOLAR & NOTIFICACIÓN A ACUDIENTES INVOLUCRADOS
                  </h3>
                  <span className="text-[10px] text-[#e0b0bc]">
                    Expediente: {selectedCase.id} · {selectedCase.category}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsSolving(false)}
                className="text-white/70 hover:text-white text-xs px-2 py-1 rounded-lg bg-white/10 cursor-pointer"
              >
                ✕ Cancelar
              </button>
            </header>

            <form onSubmit={handlePublishSolution} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-xs">
              {/* Privacy Directive Highlight */}
              <div className="bg-emerald-50 border-2 border-emerald-400/80 p-3 rounded-2xl text-emerald-950 text-xs space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Principio de Confidencialidad y Despacho Exclusivo:</span>
                </div>
                <p className="text-[11px] text-emerald-900/90 leading-relaxed">
                  Por normativa de privacidad estudiantil, <strong>esta resolución NO se enviará a todos los padres de familia del colegio</strong>. Se despachará <em>única y directamente</em> al padre, madre o tutor legal de los alumnos involucrados para su seguimiento en el hogar.
                </p>
              </div>

              {/* TARGET GUARDIANS SELECTION */}
              <div className="bg-slate-50 border border-slate-300 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Users className="w-4 h-4 text-[#8d2a3c]" />
                    <span>Acudientes de los Alumnos Involucrados a Notificar:</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-semibold">Seleccionados: {formGuardians.filter(g => g.selected).length}</span>
                </div>

                <div className="space-y-2">
                  {formGuardians.map((g, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border transition-all text-xs space-y-2 ${
                        g.selected ? 'bg-white border-emerald-400 shadow-xs' : 'bg-slate-100 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={g.selected}
                            onChange={(e) => {
                              const updated = [...formGuardians];
                              updated[idx].selected = e.target.checked;
                              setFormGuardians(updated);
                            }}
                            className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                          />
                          <span className="font-bold text-slate-900">
                            Alumno: <span className="text-[#8d2a3c]">{g.studentName}</span>
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pl-6">
                        <div>
                          <label className="block text-[10px] text-slate-500 font-medium mb-0.5">Nombre del Acudiente / Tutor</label>
                          <input
                            type="text"
                            value={g.guardianName}
                            onChange={(e) => {
                              const updated = [...formGuardians];
                              updated[idx].guardianName = e.target.value;
                              setFormGuardians(updated);
                            }}
                            placeholder="Nombre del padre o tutor..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 font-medium mb-0.5">Teléfono o Correo de Contacto</label>
                          <input
                            type="text"
                            value={g.phoneOrEmail}
                            onChange={(e) => {
                              const updated = [...formGuardians];
                              updated[idx].phoneOrEmail = e.target.value;
                              setFormGuardians(updated);
                            }}
                            placeholder="Teléfono / WhatsApp o email..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500 font-medium mb-0.5">Canal de Despacho</label>
                          <select
                            value={g.channel}
                            onChange={(e) => {
                              const updated = [...formGuardians];
                              updated[idx].channel = e.target.value;
                              setFormGuardians(updated);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 cursor-pointer"
                          >
                            <option value="WhatsApp & Notificación App">WhatsApp & App</option>
                            <option value="SMS Seguro + Correo">SMS Seguro + Correo</option>
                            <option value="Citación Presencial + App">Citación Presencial + App</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Solution Type */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tipo de Estrategia Restaurativa:
                </label>
                <select
                  value={solutionType}
                  onChange={(e) => setSolutionType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#8d2a3c]"
                >
                  <option value="compromiso_convivencia">📜 Compromiso de Convivencia y Respeto Mutuo</option>
                  <option value="mediacion_dialogo">🤝 Mediación y Diálogo Reflexivo</option>
                  <option value="taller_paz">🕊️ Taller de Paz y Habilidades Socioemocionales</option>
                  <option value="reparacion_restaurativa">🧹 Medida Restaurativa / Servicio Escolar Formativo</option>
                  <option value="intervencion_directiva">🏛️ Intervención Directiva Formal</option>
                </select>
              </div>

              {/* Diagnosis */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  1. Diagnóstico y Conclusiones del Caso:
                </label>
                <textarea
                  value={diagnosisInput}
                  onChange={(e) => setDiagnosisInput(e.target.value)}
                  rows={2}
                  required
                  placeholder="Explica qué causó el conflicto y la conclusión del equipo..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8d2a3c]"
                />
              </div>

              {/* Agreements */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  2. Acuerdos y Compromisos de los Estudiantes (uno por línea):
                </label>
                <textarea
                  value={agreementsInput}
                  onChange={(e) => setAgreementsInput(e.target.value)}
                  rows={3}
                  required
                  placeholder="Ej:&#10;1. Cese inmediato de provocaciones&#10;2. Acompañamiento en recreo"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8d2a3c] font-mono text-[11px]"
                />
              </div>

              {/* Restorative Measure */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  3. Medida Restaurativa o Formativa Escolar:
                </label>
                <input
                  type="text"
                  value={restorativeInput}
                  onChange={(e) => setRestorativeInput(e.target.value)}
                  required
                  placeholder="Ej: Actividad solidaria comunitaria, taller pedagógico, etc."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8d2a3c]"
                />
              </div>

              {/* Guidance for Parents */}
              <div>
                <label className="font-bold text-amber-900 block mb-1">
                  4. Pautas y Recomendaciones Exclusivas para los Padres de los Alumnos en Casa:
                </label>
                <textarea
                  value={guidanceInput}
                  onChange={(e) => setGuidanceInput(e.target.value)}
                  rows={3}
                  required
                  placeholder="Escribe consejos para que los tutores apoyen y fortalezcan la solución desde el hogar..."
                  className="w-full bg-amber-50/60 border border-amber-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSolving(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Aprobar Solución y Despachar a Acudientes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: FIRMA DE ENTERADO PARA PADRES DE FAMILIA / ACUDIENTES */}
      {/* ============================================================ */}
      {showSignModal && selectedCase && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden border border-slate-200 text-left">
            <header className="px-5 py-3.5 bg-gradient-to-r from-[#3c0e18] to-[#5a1827] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-[#fed4cc]" />
                <h3 className="font-cinzel text-xs font-bold text-[#ffe1d9]">
                  FIRMA DE ENTERADO (ACUDIENTE / FAMILIA)
                </h3>
              </div>
              <button
                onClick={() => setShowSignModal(false)}
                className="text-white/70 hover:text-white text-xs px-2 py-1 rounded-lg bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </header>

            <form onSubmit={handleParentSign} className="p-5 space-y-3.5 text-xs">
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Al registrar tu firma de enterado, confirmas que has leído el reporte del caso <strong>{selectedCase.id}</strong> y que apoyas la solución y compromisos establecidos por la institución escolar para tu representado.
              </p>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nombre Completo del Acudiente / Padre / Madre:
                </label>
                <input
                  type="text"
                  value={parentNameInput}
                  onChange={(e) => setParentNameInput(e.target.value)}
                  required
                  placeholder="Tu nombre y apellidos..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8d2a3c]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Comentario o Compromiso Familiar desde el Hogar:
                </label>
                <textarea
                  value={parentCommentInput}
                  onChange={(e) => setParentCommentInput(e.target.value)}
                  rows={2}
                  placeholder="Ej: Enterado y conforme. Apoyamos los acuerdos en casa."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#8d2a3c]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowSignModal(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8d2a3c] to-[#5a1827] hover:brightness-110 text-white font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Confirmar Firma y Enviar Acuse</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: ACTA OFICIAL DE MEDIACIÓN Y CONVIVENCIA ESCOLAR       */}
      {/* ============================================================ */}
      {showActaModal && selectedCase && selectedCase.solutionPlan && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 text-left">
            <header className="px-5 py-3.5 bg-gradient-to-r from-[#2a121c] to-[#14060d] text-white flex items-center justify-between shrink-0 border-b border-[#deb386]/30">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#deb386]" />
                <div>
                  <h3 className="font-cinzel text-xs font-bold text-[#ffe1d9]">
                    ACTA OFICIAL DE CONVIVENCIA Y MEDIACIÓN ESCOLAR
                  </h3>
                  <span className="text-[10px] text-[#e0b0bc]">
                    Expediente Institucional N° {selectedCase.id}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[#fed4cc] cursor-pointer flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / PDF</span>
                </button>
                <button
                  onClick={() => setShowActaModal(false)}
                  className="text-white/70 hover:text-white text-xs px-2 py-1 rounded-lg bg-white/10 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar text-xs text-slate-800 bg-[#fffdfa]">
              {/* Institutional Header */}
              <div className="text-center pb-3 border-b-2 border-slate-300 space-y-1">
                <span className="font-cinzel text-xs font-bold tracking-widest text-slate-900 block uppercase">
                  INSTITUTO EDUCATIVO NACIONAL · COMITÉ DE CONVIVENCIA Y PAZ ESCOLAR
                </span>
                <span className="text-[11px] text-slate-600 block">
                  Acta de Compromiso Restaurativo y Notificación Familiar Reservada
                </span>
                <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500 font-mono mt-1">
                  <span>FOLIO: {selectedCase.id}</span>
                  <span>FECHA: {selectedCase.solutionPlan.resolvedAt}</span>
                  <span>SEDE: Plantel Central</span>
                </div>
              </div>

              {/* Data Table */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <strong>Tipo de Falta / Conflicto:</strong>
                  <p className="text-slate-700">{selectedCase.category}</p>
                </div>
                <div>
                  <strong>Lugar de los Hechos:</strong>
                  <p className="text-slate-700">{selectedCase.location}</p>
                </div>
                <div>
                  <strong>Estudiantes Participantes:</strong>
                  <p className="text-slate-900 font-semibold">{selectedCase.involvedPersons || 'Alumnos registrados'}</p>
                </div>
                <div>
                  <strong>Autoridad / Mediador Responsable:</strong>
                  <p className="text-emerald-800 font-semibold">{selectedCase.solutionPlan.resolvedByName}</p>
                </div>
              </div>

              {/* Conclusión */}
              <div>
                <span className="font-bold text-slate-900 block text-xs mb-1 uppercase tracking-wider">
                  I. Diagnóstico y Síntesis Institucional:
                </span>
                <p className="p-3 rounded-xl bg-white border border-slate-200 text-slate-700 leading-relaxed text-[11px]">
                  {selectedCase.solutionPlan.diagnosis}
                </p>
              </div>

              {/* Acuerdos */}
              <div>
                <span className="font-bold text-slate-900 block text-xs mb-1 uppercase tracking-wider">
                  II. Acuerdos y Compromisos Asumidos:
                </span>
                <div className="space-y-1">
                  {selectedCase.solutionPlan.agreements.map((agr, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-white border border-slate-200 flex items-start gap-2 text-[11px]">
                      <span className="font-bold text-emerald-700">{idx + 1}.</span>
                      <span>{agr}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medida Restaurativa */}
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs">
                <span className="font-bold text-teal-950 block text-[11px] uppercase tracking-wider">
                  III. Medida Restaurativa y Pedagógica:
                </span>
                <p className="text-teal-900 mt-0.5 text-[11px]">{selectedCase.solutionPlan.restorativeMeasure}</p>
              </div>

              {/* Pautas para el Hogar */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                <span className="font-bold text-amber-950 block text-[11px] uppercase tracking-wider">
                  IV. Pautas Vinculantes para el Hogar:
                </span>
                <p className="text-amber-900 mt-0.5 text-[11px]">{selectedCase.solutionPlan.guidanceForParents}</p>
              </div>

              {/* Target Guardians Dispatched */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    V. Destinatarios Familiares Notificados (Confidencial):
                  </span>
                  <span className="text-[10px] text-emerald-800 font-bold">🔒 No difundido a otros padres</span>
                </div>
                <div className="space-y-1">
                  {selectedCase.solutionPlan.targetGuardians?.map((tg, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] bg-white p-2 rounded-lg border border-slate-200">
                      <span><strong>{tg.guardianName}</strong> ({tg.relationship} de {tg.studentName})</span>
                      <span className="text-emerald-700 font-mono text-[10px]">{tg.contactChannel} · {tg.status.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signatures & Seal Box */}
              <div className="pt-4 border-t-2 border-slate-300 grid grid-cols-2 gap-4 text-center">
                <div className="p-3 border border-slate-200 rounded-xl bg-white space-y-2">
                  <div className="h-10 flex items-center justify-center">
                    <span className="font-serif italic text-slate-700 font-bold text-xs">
                      {selectedCase.solutionPlan.resolvedByName}
                    </span>
                  </div>
                  <div className="border-t border-slate-300 pt-1 text-[10px] text-slate-600">
                    <strong>Mediación / Dirección Escolar</strong>
                    <span className="block text-slate-400">Sello Institucional Convivencia</span>
                  </div>
                </div>

                <div className="p-3 border border-slate-200 rounded-xl bg-white space-y-2">
                  <div className="h-10 flex items-center justify-center">
                    <span className="font-serif italic text-emerald-800 font-bold text-xs">
                      {selectedCase.solutionPlan.parentSignatures?.[0]?.parentName || 'Firma de Acudiente Notificado'}
                    </span>
                  </div>
                  <div className="border-t border-slate-300 pt-1 text-[10px] text-slate-600">
                    <strong>Padre / Madre / Acudiente del Involucrado</strong>
                    <span className="block text-emerald-700 font-mono text-[9px]">
                      {selectedCase.solutionPlan.parentSignatures?.[0]?.signatureHash || 'Acuse Digital Certificado'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <footer className="px-5 py-3 bg-slate-100 flex items-center justify-between border-t border-slate-200 text-xs">
              <span className="text-[10px] text-slate-500">
                Documento oficial emitido conforme a la directriz escolar de resguardo de datos personales de menores.
              </span>
              <button
                onClick={() => setShowActaModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 cursor-pointer"
              >
                Cerrar
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};
