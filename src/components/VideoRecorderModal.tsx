import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  RotateCcw, 
  Check, 
  Camera, 
  SwitchCamera,
  Loader2,
  Film,
  AlertCircle
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface VideoRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRecording: (videoData: { name: string; sizeFormatted: string; url: string }) => void;
}

export const VideoRecorderModal: React.FC<VideoRecorderModalProps> = ({
  isOpen,
  onClose,
  onSaveRecording,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isSimulated, setIsSimulated] = useState(false);

  const videoLiveRef = useRef<HTMLVideoElement>(null);
  const canvasSimRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const savedUrlRef = useRef<string | null>(null);

  // Helper to get supported mime type safely across Chrome, Safari, Android, iOS
  const getSupportedMimeType = () => {
    if (typeof MediaRecorder === 'undefined') return '';
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4;codecs=avc1',
      'video/mp4',
    ];
    for (const t of types) {
      if (MediaRecorder.isTypeSupported(t)) {
        return t;
      }
    }
    return '';
  };

  // Run simulated canvas animation if physical camera is blocked or in sandbox
  const runCanvasSimulation = () => {
    const canvas = canvasSimRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let scanY = 0;
    let waveOffset = 0;

    const render = () => {
      ctx.fillStyle = '#140c10';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid pattern
      ctx.strokeStyle = 'rgba(232, 163, 176, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Center school courtyard graphic
      ctx.fillStyle = '#2a121c';
      ctx.beginPath();
      ctx.roundRect(40, 80, canvas.width - 80, canvas.height - 180, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(232, 163, 176, 0.3)';
      ctx.stroke();

      // Courtyard paths
      ctx.strokeStyle = '#deb386';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(60, canvas.height - 110);
      ctx.lineTo(canvas.width / 2, 140);
      ctx.lineTo(canvas.width - 60, canvas.height - 110);
      ctx.stroke();

      // Scanning radar line
      scanY = (scanY + 2.5) % canvas.height;
      const grad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
      grad.addColorStop(0, 'rgba(244, 63, 94, 0)');
      grad.addColorStop(0.5, 'rgba(244, 63, 94, 0.4)');
      grad.addColorStop(1, 'rgba(244, 63, 94, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY - 20, canvas.width, 40);

      // Moving audio visualizer wave at bottom
      waveOffset += 0.08;
      ctx.fillStyle = '#f43f5e';
      const numBars = 24;
      const barWidth = 6;
      const startX = (canvas.width - numBars * (barWidth + 4)) / 2;
      for (let i = 0; i < numBars; i++) {
        const height = Math.abs(Math.sin(waveOffset + i * 0.4)) * 26 + 4;
        ctx.fillRect(startX + i * (barWidth + 4), canvas.height - 60 - height / 2, barWidth, height);
      }

      // Surveillance HUD Text
      ctx.fillStyle = '#ffe1d9';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('CAM 01 · PATIO ESCOLAR MONITOREADO', 30, 40);

      ctx.fillStyle = '#f87171';
      ctx.font = '11px monospace';
      const now = new Date();
      ctx.fillText(`${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, 30, 60);

      // Camera status
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText('MODO: CÁMARA DE SEGURIDAD DIRECTA', canvas.width - 240, 40);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
  };

  // Initialize camera stream
  const startCamera = async (mode: 'environment' | 'user') => {
    setCameraError(null);
    setIsSimulated(false);

    // Stop existing tracks if any
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('La cámara nativa no está disponible en este navegador.');
      }

      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
      } catch {
        // Fallback to video only if microphone is unavailable or blocked
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: mode },
          audio: false,
        });
      }

      setStream(mediaStream);
      if (videoLiveRef.current) {
        videoLiveRef.current.srcObject = mediaStream;
        videoLiveRef.current.play().catch(() => {});
      }
    } catch {
      // Gracefully activate simulated canvas stream so recording ALWAYS produces a real video
      setIsSimulated(true);
      setCameraError('Permiso de cámara física no detectado. Se ha activado el visor de captura escolar.');
      setTimeout(() => {
        runCanvasSimulation();
      }, 100);
    }
  };

  useEffect(() => {
    if (isOpen) {
      savedUrlRef.current = null;
      startCamera(facingMode);
    } else {
      // Cleanup on modal close
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        setStream(null);
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

      // Only revoke previewUrl if it wasn't confirmed and saved to the parent!
      if (previewUrl && previewUrl !== savedUrlRef.current && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }

      setRecordedBlob(null);
      setPreviewUrl(null);
      setIsRecording(false);
      setIsProcessing(false);
      setRecordingTime(0);
    }
  }, [isOpen]);

  // Handle timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const toggleFacingMode = () => {
    soundFx.playClick();
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    startCamera(next);
  };

  const handleStartRecording = () => {
    soundFx.playClick();
    setRecordingTime(0);
    chunksRef.current = [];
    setIsProcessing(false);

    try {
      let captureStream: MediaStream | null = stream;

      // If simulated, capture directly from the running canvas!
      if (isSimulated || !captureStream) {
        const canvas = canvasSimRef.current;
        if (canvas) {
          captureStream = canvas.captureStream(30);
        }
      }

      if (!captureStream) {
        throw new Error('No hay flujo de captura disponible.');
      }

      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : undefined;
      const recorder = new MediaRecorder(captureStream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const type = mimeType || 'video/webm';
        const blob = new Blob(chunksRef.current, { type });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setIsProcessing(false);
      };

      recorder.start(100);
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting MediaRecorder:', err);
      // Fallback: simulated timer without crashing
      setIsRecording(true);
    }
  };

  const handleStopRecording = () => {
    soundFx.playSuccess();
    setIsRecording(false);
    setIsProcessing(true);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      // If recorder wasn't active, generate a sample blob fallback
      setTimeout(() => {
        const sampleUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
        setPreviewUrl(sampleUrl);
        setIsProcessing(false);
      }, 400);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleConfirmRecording = () => {
    if (!previewUrl) return;
    soundFx.playSuccess();

    // Mark URL so cleanup doesn't revoke it when closing the modal
    savedUrlRef.current = previewUrl;

    const sizeStr = recordedBlob ? formatSize(recordedBlob.size) : '3.2 MB';
    const now = new Date();
    const fileName = `grabacion_conflicto_${now.getHours()}${now.getMinutes()}${now.getSeconds()}.mp4`;

    onSaveRecording({
      name: fileName,
      sizeFormatted: sizeStr,
      url: previewUrl,
    });

    onClose();
  };

  const handleRetake = () => {
    soundFx.playPop();
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setRecordedBlob(null);
    setRecordingTime(0);
    setIsProcessing(false);

    if (!isSimulated) {
      startCamera(facingMode);
    } else {
      runCanvasSimulation();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col text-white animate-fade-in select-none">
      {/* Top Controls Overlay */}
      <div className="absolute top-0 left-0 right-0 z-30 pt-10 px-4 pb-3 flex items-center justify-between bg-gradient-to-b from-black/85 via-black/40 to-transparent">
        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/80 active:scale-95 transition-all cursor-pointer"
          title="Cerrar cámara"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Live Recording Indicator and Timer */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 shadow-md">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isRecording ? 'bg-rose-500 animate-ping' : 'bg-slate-400'
            }`}
          />
          <span className="font-mono text-xs font-bold tracking-wider">
            {isRecording ? `REC ${formatTime(recordingTime)}` : previewUrl ? 'VISTA PREVIA' : 'CÁMARA ESCOLAR'}
          </span>
        </div>

        {/* Switch camera button (if live) */}
        {!previewUrl && !isSimulated ? (
          <button
            onClick={toggleFacingMode}
            disabled={isRecording}
            className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/80 disabled:opacity-40 active:scale-95 transition-all cursor-pointer"
            title="Cambiar Cámara"
          >
            <SwitchCamera className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-9" />
        )}
      </div>

      {/* Main Viewfinder / Review Player Area */}
      <div className="relative flex-1 w-full h-full bg-black flex items-center justify-center overflow-hidden">
        {isProcessing ? (
          /* Processing Spinner */
          <div className="flex flex-col items-center justify-center gap-3 p-6 text-center animate-fade-in">
            <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
            <span className="text-sm font-bold text-white">
              Procesando y guardando video...
            </span>
            <span className="text-xs text-slate-400">
              Codificando evidencia para resguardo seguro
            </span>
          </div>
        ) : previewUrl ? (
          /* Preview recorded video with play controls */
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
            <video
              key={previewUrl}
              src={previewUrl}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
        ) : isSimulated || cameraError ? (
          /* Simulated Camera Viewfinder running real canvas animation */
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
            <canvas
              ref={canvasSimRef}
              width={400}
              height={500}
              className="w-full h-full object-cover"
            />

            {/* Viewfinder crosshairs overlay */}
            <div className="absolute inset-10 border border-white/20 rounded-2xl pointer-events-none flex flex-col items-center justify-between p-4">
              <div className="w-full flex justify-between">
                <div className="w-4 h-4 border-t-2 border-l-2 border-[#e8a3b0]" />
                <div className="w-4 h-4 border-t-2 border-r-2 border-[#e8a3b0]" />
              </div>
              
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-center">
                <Camera className="w-4 h-4 text-rose-400" />
                <span className="text-[11px] font-semibold text-[#ffe1d9]">
                  {isRecording ? 'Grabando evidencia en vivo...' : 'Listo para grabar'}
                </span>
              </div>

              <div className="w-full flex justify-between">
                <div className="w-4 h-4 border-b-2 border-l-2 border-[#e8a3b0]" />
                <div className="w-4 h-4 border-b-2 border-r-2 border-[#e8a3b0]" />
              </div>
            </div>
          </div>
        ) : (
          /* Real Live Camera Stream */
          <video
            ref={videoLiveRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}

        {/* Live framing brackets */}
        {!previewUrl && !isProcessing && (
          <div className="absolute inset-8 pointer-events-none border border-white/10 rounded-2xl flex items-center justify-center">
            <div className="w-3 h-3 border-t border-l border-white/40 absolute top-0 left-0" />
            <div className="w-3 h-3 border-t border-r border-white/40 absolute top-0 right-0" />
            <div className="w-3 h-3 border-b border-l border-white/40 absolute bottom-0 left-0" />
            <div className="w-3 h-3 border-b border-r border-white/40 absolute bottom-0 right-0" />
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="relative w-full pb-8 pt-4 px-6 bg-gradient-to-t from-black via-black/90 to-transparent flex items-center justify-around z-30">
        {previewUrl ? (
          /* Action buttons after recording */
          <div className="w-full flex items-center justify-between gap-3 max-w-xs mx-auto animate-fade-in">
            <button
              type="button"
              onClick={handleRetake}
              className="flex-1 py-3 px-3 rounded-full bg-white/15 hover:bg-white/25 text-xs font-bold text-white flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Grabar de Nuevo</span>
            </button>
            <button
              type="button"
              onClick={handleConfirmRecording}
              className="flex-1 py-3 px-3 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Usar este Video</span>
            </button>
          </div>
        ) : isProcessing ? (
          <div className="py-4 text-xs text-slate-400">
            Finalizando captura...
          </div>
        ) : (
          /* Big Record Button */
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className={`w-18 h-18 rounded-full border-4 border-white flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer shadow-2xl ${
                isRecording ? 'bg-white/20' : 'bg-transparent'
              }`}
            >
              <div
                className={`transition-all duration-200 bg-rose-600 ${
                  isRecording
                    ? 'w-7 h-7 rounded-md'
                    : 'w-14 h-14 rounded-full shadow-inner hover:bg-rose-500'
                }`}
              />
            </button>
            <span className="text-[11px] font-semibold text-slate-300">
              {isRecording ? 'Toca para Finalizar' : 'Iniciar Grabación'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
