import React, { useState } from 'react';
import { AppScreen } from '../types';
import { soundFx } from '../utils/audio';

interface PrototypeCoverProps {
  onNavigate: (screen: AppScreen) => void;
  onOpenCheckInModal?: () => void;
}

export const PrototypeCover: React.FC<PrototypeCoverProps> = ({ onNavigate }) => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => {
      setShowToast(null);
    }, 3200);
  };

  const handleOkClick = () => {
    soundFx.playSuccess();
    const nextState = !isCheckedIn;
    setIsCheckedIn(nextState);
    if (nextState) {
      triggerToast('✓ Check-in verificado: Notificación de seguridad enviada a tus tutores.');
    } else {
      triggerToast('Estado de verificación restablecido.');
    }
  };

  const handleChatClick = () => {
    soundFx.playClick();
    onNavigate('chat');
  };

  const handlePinClick = () => {
    soundFx.playPop();
    onNavigate('routes');
  };

  const handleShieldClick = () => {
    soundFx.playPop();
    onNavigate('protocols');
  };

  const handleNetworkClick = () => {
    soundFx.playPop();
    onNavigate('network');
  };

  const handleComenzarClick = () => {
    soundFx.playSuccess();
    onNavigate('report');
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none bg-gradient-to-b from-[#faf6f2] via-[#f7f0eb] to-[#eeddd7]">
      {/* Toast Notification */}
      {showToast && (
        <div className="absolute top-14 left-4 right-4 z-50 bg-[#1e0712]/95 border border-[#e8a3b0]/50 text-white text-xs px-3.5 py-2.5 rounded-xl shadow-2xl backdrop-blur-md flex items-center justify-between animate-fade-in">
          <span className="leading-snug">{showToast}</span>
          <button
            onClick={() => setShowToast(null)}
            className="ml-2 text-[#f5a7b8] hover:text-white font-bold p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* ================= HEADER SECTION ================= */}
      <header className="pt-10 px-6 pb-2 flex items-center justify-start gap-4 z-20">
        {/* Shield Crest Logo with Dove & Heart */}
        <div 
          onClick={handleShieldClick}
          className="cursor-pointer group transition-transform active:scale-95 shrink-0"
          title="Escudo de Protección y Convivencia"
        >
          <div className="relative w-13 h-15 flex items-center justify-center filter drop-shadow-[0_4px_8px_rgba(74,21,37,0.25)]">
            <svg viewBox="0 0 100 120" className="w-full h-full">
              <defs>
                {/* Metallic Shield Gradients */}
                <linearGradient id="shieldRim" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d98976" />
                  <stop offset="25%" stopColor="#ffffff" />
                  <stop offset="50%" stopColor="#9a4d3d" />
                  <stop offset="75%" stopColor="#e29887" />
                  <stop offset="100%" stopColor="#672417" />
                </linearGradient>

                <linearGradient id="shieldBody" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#5a1827" />
                  <stop offset="45%" stopColor="#3c0e18" />
                  <stop offset="80%" stopColor="#22060d" />
                  <stop offset="100%" stopColor="#4a1320" />
                </linearGradient>

                <linearGradient id="doveGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffe6b8" />
                  <stop offset="50%" stopColor="#f5bf80" />
                  <stop offset="100%" stopColor="#de9c5c" />
                </linearGradient>
              </defs>

              {/* Outer Shield Rim */}
              <path
                d="M50 4 C78 4, 94 18, 94 48 C94 82, 68 106, 50 116 C32 106, 6 82, 6 48 C6 18, 22 4, 50 4 Z"
                fill="url(#shieldRim)"
              />

              {/* Inner Shield Cavity */}
              <path
                d="M50 10 C74 10, 88 22, 88 48 C88 78, 65 99, 50 108 C35 99, 12 78, 12 48 C12 22, 26 10, 50 10 Z"
                fill="url(#shieldBody)"
              />

              {/* Inner Secondary Bevel Edge */}
              <path
                d="M50 13 C72 13, 85 24, 85 48 C85 76, 63 96, 50 105 C37 96, 15 76, 15 48 C15 24, 28 13, 50 13 Z"
                fill="none"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1.5"
              />

              {/* Dove and Heart Emblem Intertwined */}
              {/* Heart contour */}
              <path
                d="M50 74 C47 70, 31 56, 31 43 C31 34, 38 29, 45 32 C48 33, 50 36, 50 36 C50 36, 52 33, 55 32 C62 29, 69 34, 69 43 C69 56, 53 70, 50 74 Z"
                fill="none"
                stroke="url(#doveGold)"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Dove peace bird inside */}
              <path
                d="M44 54 C47 50, 53 45, 59 47 C60 44, 58 40, 52 42 C49 43, 44 48, 41 52 C38 56, 35 60, 44 54 Z"
                fill="url(#doveGold)"
                opacity="0.9"
              />
              <path
                d="M48 50 C52 49, 57 45, 60 40 C62 38, 64 39, 63 42 C60 47, 54 53, 48 50 Z"
                fill="url(#doveGold)"
              />
              <circle cx="58" cy="42" r="1.2" fill="#3c0e18" />
            </svg>
          </div>
        </div>

        {/* Text Title */}
        <div className="flex flex-col select-none">
          <h1 className="font-cinzel text-[20px] font-extrabold tracking-[0.16em] text-[#481624] leading-tight drop-shadow-sm">
            ESCUELA
          </h1>
          <h1 className="font-cinzel text-[20px] font-extrabold tracking-[0.16em] text-[#481624] leading-tight drop-shadow-sm -mt-0.5">
            SEGURA
          </h1>
        </div>
      </header>

      {/* ================= CENTRAL DASHBOARD (ILLUSTRATION) ================= */}
      <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden px-3 -mt-2">
        {/* Decorative ambient sparkles in the sky */}
        <div className="absolute top-4 left-24 animate-twinkle-1 pointer-events-none">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L14 9L21 12L14 15L12 22L10 15L3 12L10 9L12 2Z" fill="#e89886" opacity="0.8" />
          </svg>
        </div>
        <div className="absolute top-16 right-10 animate-twinkle-2 pointer-events-none">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L14 9L21 12L14 15L12 22L10 15L3 12L10 9L12 2Z" fill="#d97561" opacity="0.6" />
          </svg>
        </div>
        <div className="absolute bottom-28 left-6 animate-twinkle-3 pointer-events-none">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L14 9L21 12L14 15L12 22L10 15L3 12L10 9L12 2Z" fill="#f0ab9c" opacity="0.75" />
          </svg>
        </div>

        {/* Main Canvas SVG with 3D Isometric Road & Elements */}
        <div className="relative w-full max-w-[340px] aspect-[1/1] flex items-center justify-center">
          <svg
            viewBox="0 0 400 400"
            className="w-full h-full overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Road Asphalt Gradient */}
              <linearGradient id="roadSurface" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#41303b" />
                <stop offset="60%" stopColor="#31222b" />
                <stop offset="100%" stopColor="#25161f" />
              </linearGradient>

              {/* Road Isometric Extrusion/Curb Gradient */}
              <linearGradient id="roadCurb" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ab6d79" />
                <stop offset="40%" stopColor="#8d4b58" />
                <stop offset="100%" stopColor="#602833" />
              </linearGradient>

              {/* Circular Platform Gradient */}
              <linearGradient id="pedestalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#edd8d0" />
                <stop offset="100%" stopColor="#caa49a" />
              </linearGradient>

              {/* Red Map Pin Gradient */}
              <radialGradient id="pinGloss" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#ff7070" />
                <stop offset="45%" stopColor="#d82030" />
                <stop offset="85%" stopColor="#960e1b" />
                <stop offset="100%" stopColor="#54050d" />
              </radialGradient>

              {/* Bronze OK Button Gradients */}
              <linearGradient id="okRim" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d98c7b" />
                <stop offset="35%" stopColor="#ffffff" />
                <stop offset="70%" stopColor="#a35747" />
                <stop offset="100%" stopColor="#542118" />
              </linearGradient>
              <linearGradient id="okFace" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#faf2ea" />
                <stop offset="100%" stopColor="#dfc3b5" />
              </linearGradient>

              {/* Checked State OK Rim */}
              <linearGradient id="okCheckedRim" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#87db9b" />
                <stop offset="50%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#1e7339" />
              </linearGradient>

              {/* Drop Shadows */}
              <filter id="softShadow" x="-20%" y="-20%" width="150%" height="150%">
                <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#38101a" floodOpacity="0.25" />
              </filter>
              <filter id="pinShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="2" dy="8" stdDeviation="4" floodColor="#38101a" floodOpacity="0.35" />
              </filter>
            </defs>

            {/* Subtle Isometric Ground Lines / Circuit trace */}
            <path
              d="M60 170 L60 210 M60 210 L120 210"
              stroke="#d4a89e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="4 4"
              opacity="0.6"
            />
            <path
              d="M200 230 L220 230 M220 230 L220 250"
              stroke="#d4a89e"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
            />
            <circle cx="220" cy="250" r="3.5" fill="#ab6d79" opacity="0.7" />

            {/* ================= ISOMETRIC ROADWAY S-CURVE ================= */}
            {/* 1. Road Curb / Extruded 3D Side Depth */}
            <path
              d="M 215 150
                 C 255 160, 270 195, 245 220
                 C 220 245, 120 230, 85 270
                 C 65 295, 80 340, 160 365
                 L 160 375
                 C 75 350, 55 305, 75 278
                 C 110 238, 210 252, 235 228
                 C 258 205, 248 170, 215 160
                 Z"
              fill="url(#roadCurb)"
              filter="url(#softShadow)"
            />

            {/* 2. Road Surface (Dark Asphalt) */}
            <path
              d="M 205 142
                 C 245 152, 260 185, 235 210
                 C 210 235, 110 220, 75 260
                 C 55 285, 70 330, 150 355
                 L 190 325
                 C 130 305, 105 275, 120 255
                 C 145 225, 240 240, 265 195
                 C 285 160, 255 135, 205 142
                 Z"
              fill="url(#roadSurface)"
            />

            {/* 3. Road Side Highlight Rim */}
            <path
              d="M 205 142
                 C 245 152, 260 185, 235 210
                 C 210 235, 110 220, 75 260
                 C 55 285, 70 330, 150 355"
              fill="none"
              stroke="#deb0b9"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* 4. Dashed Center Road Line */}
            <path
              d="M 225 152
                 C 245 170, 242 195, 215 215
                 C 180 240, 115 240, 95 275
                 C 80 300, 105 325, 168 340"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeDasharray="9 7"
              strokeLinecap="round"
              opacity="0.85"
            />

            {/* ================= PLATFORM & 3D RED LOCATION PIN ================= */}
            {/* Circular Platform at top of road */}
            <g 
              onClick={handlePinClick} 
              className="cursor-pointer group"
              role="button"
              tabIndex={0}
              aria-label="Punto Seguro Escolar - Toca para ver mapa"
            >
              <title>Punto Seguro Escolar - Toca para ver mapa</title>
              {/* Pedestal Bottom Shadow & 3D cylinder */}
              <ellipse cx="205" cy="154" rx="36" ry="16" fill="#a46d65" opacity="0.7" />
              <ellipse cx="205" cy="148" rx="34" ry="15" fill="url(#pedestalGradient)" />
              <ellipse cx="205" cy="146" rx="30" ry="12" fill="#ffffff" opacity="0.7" />

              {/* 3D Red Location Pin */}
              <g className="transition-transform group-hover:scale-105 group-active:scale-95 duration-200">
                {/* Pin Ground Shadow */}
                <ellipse cx="205" cy="145" rx="12" ry="5" fill="#350c14" opacity="0.45" />

                {/* 3D Pin Head & Point */}
                <path
                  d="M 205 142
                     C 195 125, 185 108, 185 92
                     C 185 75, 194 65, 205 65
                     C 216 65, 225 75, 225 92
                     C 225 108, 215 125, 205 142
                     Z"
                  fill="url(#pinGloss)"
                  filter="url(#pinShadow)"
                />

                {/* Pin Inner Eye Hole / Ring */}
                <circle cx="205" cy="88" r="7" fill="#ffffff" />
                <circle cx="205" cy="88" r="4.5" fill="#3f0a12" opacity="0.6" />

                {/* Specular curved reflection highlight */}
                <path
                  d="M 191 80 C 193 72, 200 68, 206 68"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.8"
                />
              </g>
            </g>

            {/* ================= OK BUTTON (TOP LEFT) ================= */}
            <g
              onClick={handleOkClick}
              className="cursor-pointer group transition-transform active:scale-90"
              role="button"
              tabIndex={0}
              aria-label="Verificación de Seguridad (Check-in)"
            >
              <title>Verificación de Seguridad (Check-in)</title>
              <g transform="translate(68, 140)">
                {/* Outer Shadow */}
                <circle cx="0" cy="3" r="23" fill="#3c101a" opacity="0.25" />

                {/* Metallic Bevel Ring */}
                <circle
                  cx="0"
                  cy="0"
                  r="23"
                  fill={isCheckedIn ? 'url(#okCheckedRim)' : 'url(#okRim)'}
                />

                {/* Inner Face */}
                <circle
                  cx="0"
                  cy="0"
                  r="18"
                  fill={isCheckedIn ? '#eefbf2' : 'url(#okFace)'}
                  stroke={isCheckedIn ? '#2f854b' : '#b27464'}
                  strokeWidth="1.2"
                />

                {/* OK Text */}
                <text
                  x="0"
                  y="5.5"
                  textAnchor="middle"
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                  fontWeight="800"
                  fontSize="14"
                  letterSpacing="0.05em"
                  fill={isCheckedIn ? '#1a6634' : '#4a1525'}
                >
                  {isCheckedIn ? '✓' : 'OK'}
                </text>
              </g>
            </g>

            {/* ================= CHAT BUTTON & SPEECH BUBBLE (TOP RIGHT) ================= */}
            <g
              onClick={handleChatClick}
              className="cursor-pointer group transition-transform active:scale-95"
              role="button"
              tabIndex={0}
              aria-label="Iniciar Diálogo de Mediación"
            >
              <title>Iniciar Diálogo de Mediación</title>
              <g transform="translate(295, 148)">
                {/* Floating Terracotta Speech Bubble Icon */}
                <g transform="translate(0, -32)" className="group-hover:-translate-y-1 transition-transform">
                  {/* Bubble Body */}
                  <rect
                    x="-18"
                    y="-14"
                    width="36"
                    height="24"
                    rx="8"
                    fill="#ca7b69"
                    filter="url(#softShadow)"
                  />
                  {/* Bubble Pointer Tail */}
                  <polygon points="-6,10 2,10 -2,16" fill="#ca7b69" />
                  {/* Internal Chat Conversation Lines */}
                  <line x1="-10" y1="-7" x2="10" y2="-7" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
                  <line x1="-10" y1="-1" x2="6" y2="-1" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
                  <line x1="-10" y1="5" x2="2" y2="5" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
                </g>

                {/* Dark Capsule Button with CHAT Text */}
                <rect
                  x="-28"
                  y="-4"
                  width="56"
                  height="26"
                  rx="13"
                  fill="#2c1724"
                  stroke="#ab6b7a"
                  strokeWidth="1.5"
                  filter="url(#softShadow)"
                />
                <text
                  x="0"
                  y="13"
                  textAnchor="middle"
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                  fontWeight="700"
                  fontSize="11"
                  letterSpacing="0.08em"
                  fill="#ffffff"
                >
                  CHAT
                </text>
              </g>
            </g>

            {/* ================= METALLIC SHIELD WITH CHECKMARK (BOTTOM RIGHT) ================= */}
            <g
              onClick={handleShieldClick}
              className="cursor-pointer group transition-transform active:scale-95"
              role="button"
              tabIndex={0}
              aria-label="Protocolos de Convivencia y Seguridad"
            >
              <title>Protocolos de Convivencia y Seguridad</title>
              <g transform="translate(285, 260)">
                {/* Shield Drop Shadow */}
                <path
                  d="M0 -34 C19 -34 33 -24 33 0 C33 26 14 44 0 52 C-14 44 -33 26 -33 0 C-33 -24 -19 -34 0 -34 Z"
                  fill="#2a0a14"
                  opacity="0.35"
                  transform="translate(2, 6)"
                />

                {/* Outer Rim (Metallic Copper Bronze) */}
                <path
                  d="M0 -34 C21 -34 35 -24 35 0 C35 28 15 47 0 55 C-15 47 -35 28 -35 0 C-35 -24 -21 -34 0 -34 Z"
                  fill="url(#okRim)"
                />

                {/* Middle Layer (Dark Wine) */}
                <path
                  d="M0 -30 C18 -30 30 -21 30 0 C30 24 13 41 0 48 C-13 41 -30 24 -30 0 C-30 -21 -18 -30 0 -30 Z"
                  fill="url(#roadSurface)"
                />

                {/* Inner Bevel Border */}
                <path
                  d="M0 -26 C15 -26 25 -18 25 0 C25 20 11 35 0 41 C-11 35 -25 20 -25 0 C-25 -18 -15 -26 0 -26 Z"
                  fill="#361723"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1.2"
                />

                {/* Checkmark in Shield Center */}
                <path
                  d="M -8 1 L -2 7 L 10 -5"
                  fill="none"
                  stroke="#eed6cc"
                  strokeWidth="3.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </g>

            {/* ================= NETWORK CONSTELLATION NODES (BOTTOM LEFT) ================= */}
            <g
              onClick={handleNetworkClick}
              className="cursor-pointer group transition-transform active:scale-95"
              role="button"
              tabIndex={0}
              aria-label="Red de Mediadores y Círculo de Confianza"
            >
              <title>Red de Mediadores y Círculo de Confianza</title>
              <g transform="translate(68, 258)">
                {/* Connecting Links */}
                <line x1="-16" y1="-8" x2="0" y2="-18" stroke="#a95d6f" strokeWidth="1.8" />
                <line x1="16" y1="-8" x2="0" y2="-18" stroke="#a95d6f" strokeWidth="1.8" />
                <line x1="-16" y1="-8" x2="-16" y2="12" stroke="#a95d6f" strokeWidth="1.8" />
                <line x1="16" y1="-8" x2="16" y2="12" stroke="#a95d6f" strokeWidth="1.8" />
                <line x1="-16" y1="12" x2="0" y2="20" stroke="#a95d6f" strokeWidth="1.8" />
                <line x1="16" y1="12" x2="0" y2="20" stroke="#a95d6f" strokeWidth="1.8" />
                <line x1="0" y1="-18" x2="0" y2="20" stroke="#a95d6f" strokeWidth="1.8" strokeDasharray="2 3" />

                {/* Nodes with inner ring */}
                {[
                  { cx: 0, cy: -18 },
                  { cx: -16, cy: -8 },
                  { cx: 16, cy: -8 },
                  { cx: -16, cy: 12 },
                  { cx: 16, cy: 12 },
                  { cx: 0, cy: 20 },
                ].map((node, i) => (
                  <g key={i}>
                    <circle cx={node.cx} cy={node.cy} r="6" fill="#f7eae6" stroke="#934c5e" strokeWidth="2" />
                    <circle cx={node.cx} cy={node.cy} r="2.2" fill="#581627" />
                  </g>
                ))}
              </g>
            </g>
          </svg>
        </div>
      </div>

      {/* ================= LOWER CARD SECTION (DARK BURGUNDY) ================= */}
      <section className="relative w-full z-20 pt-6 pb-6 px-6 bg-gradient-to-b from-[#240815] via-[#16040d] to-[#0d0208] text-center flex flex-col items-center">
        {/* Curved Arch Separator on top with soft glow */}
        <div className="absolute -top-6 left-0 right-0 h-7 overflow-hidden pointer-events-none">
          <svg viewBox="0 0 500 40" preserveAspectRatio="none" className="w-full h-full">
            <path
              d="M 0 40 Q 250 -10 500 40 Z"
              fill="#240815"
            />
            {/* Soft highlight rim */}
            <path
              d="M 0 40 Q 250 -10 500 40"
              fill="none"
              stroke="#e29b8c"
              strokeWidth="1.5"
              opacity="0.4"
            />
          </svg>
        </div>

        {/* Scattered twinkle stars in dark card */}
        <div className="absolute top-2 left-10 animate-twinkle-2 pointer-events-none">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="#f2a898" opacity="0.65">
            <path d="M12 2L14 9L21 12L14 15L12 22L10 15L3 12L10 9L12 2Z" />
          </svg>
        </div>
        <div className="absolute top-8 right-8 animate-twinkle-3 pointer-events-none">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#eed5b8" opacity="0.75">
            <path d="M12 2L14 9L21 12L14 15L12 22L10 15L3 12L10 9L12 2Z" />
          </svg>
        </div>
        <div className="absolute bottom-10 left-12 animate-twinkle-1 pointer-events-none">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="#f5a7b8" opacity="0.5">
            <path d="M12 2L14 9L21 12L14 15L12 22L10 15L3 12L10 9L12 2Z" />
          </svg>
        </div>

        {/* Main Title: ¡JUNTOS POR UNA CONVIVENCIA SANA! */}
        <h2 className="relative font-cinzel text-[17px] sm:text-[19px] font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#ffe1d9] via-[#f8b2c2] to-[#e8b594] drop-shadow-[0_2px_10px_rgba(248,178,194,0.35)] max-w-xs leading-snug uppercase">
          ¡JUNTOS POR UNA CONVIVENCIA SANA!
        </h2>

        {/* Subtitle */}
        <p className="mt-2 text-[12px] sm:text-[13px] font-medium text-[#e0b0bc] tracking-normal leading-relaxed max-w-[270px]">
          App para la Prevención de Conflictos y Seguridad Escolar
        </p>

        {/* Main Action Button (CTA): COMENZAR */}
        <div className="w-full max-w-[240px] mt-4 mb-2">
          <button
            onClick={handleComenzarClick}
            className="group relative w-full h-11 sm:h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 btn-comenzar overflow-hidden"
          >
            {/* Shimmer light bar across button */}
            <div className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-sheen pointer-events-none" />

            {/* Button Label */}
            <span className="relative z-10 font-cinzel text-[15px] sm:text-[16px] font-black tracking-[0.14em] text-[#2c0b0a] drop-shadow-[0_1px_0_rgba(255,255,255,0.4)] uppercase">
              COMENZAR
            </span>
          </button>
        </div>

        {/* Bottom Slogan */}
        <div className="mt-2 text-[9px] sm:text-[10px] font-semibold tracking-[0.24em] text-[#a9818e] uppercase">
          CONVIVE. COLABORA. PROTEGE.
        </div>
      </section>
    </div>
  );
};
