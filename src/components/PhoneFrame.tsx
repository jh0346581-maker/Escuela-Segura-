import React from 'react';

interface PhoneFrameProps {
  children: React.ReactNode;
  isFullMode?: boolean;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children, isFullMode = false }) => {
  if (isFullMode) {
    return (
      <div className="w-full max-w-md mx-auto h-[92vh] max-h-[880px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col relative">
        {children}
      </div>
    );
  }

  return (
    <div className="relative mx-auto my-auto select-none transition-all duration-300">
      {/* External Side Buttons (Volume & Power) */}
      {/* Mute switch / Action button */}
      <div className="absolute -left-[14px] top-[108px] w-[5px] h-[26px] bg-[#1a3854] rounded-l-md border-l border-y border-[#3d6589]" />
      {/* Volume Up */}
      <div className="absolute -left-[14px] top-[148px] w-[5px] h-[46px] bg-[#1a3854] rounded-l-md border-l border-y border-[#3d6589]" />
      {/* Volume Down */}
      <div className="absolute -left-[14px] top-[204px] w-[5px] h-[46px] bg-[#1a3854] rounded-l-md border-l border-y border-[#3d6589]" />
      {/* Power Button */}
      <div className="absolute -right-[14px] top-[160px] w-[5px] h-[64px] bg-[#1a3854] rounded-r-md border-r border-y border-[#3d6589]" />

      {/* Outer Smartphone Titanium/Blue Chassis */}
      <div className="relative w-[345px] sm:w-[380px] h-[720px] sm:h-[760px] rounded-[50px] p-[10px] bg-gradient-to-b from-[#1b3d5b] via-[#10273c] to-[#0a1826] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_2px_rgba(61,101,137,0.4),inset_0_1px_2px_rgba(255,255,255,0.4)]">
        
        {/* Inner Dark Bezel */}
        <div className="relative w-full h-full rounded-[42px] bg-black p-[2.5px] overflow-hidden shadow-inner flex flex-col">
          
          {/* Top Speaker Slit & Front Camera (Dynamic Island style) */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center pointer-events-none">
            <div className="w-24 h-5 bg-[#050505] rounded-full flex items-center justify-between px-2.5 border border-white/5 shadow-sm">
              {/* Camera lens */}
              <div className="w-2.5 h-2.5 rounded-full bg-[#121c24] flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-[#1e4060]/70" />
              </div>
              {/* Sensor */}
              <div className="w-1.5 h-1.5 rounded-full bg-[#0a0a0a]" />
            </div>
          </div>

          {/* Status Bar (Battery, Wifi, Time) */}
          <div className="absolute top-2 left-6 right-6 z-30 flex items-center justify-between text-[11px] font-semibold text-[#481624] tracking-tight pointer-events-none px-2 pt-1">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              {/* Cellular signal */}
              <svg className="w-3.5 h-3 fill-current" viewBox="0 0 16 12">
                <rect x="1" y="8" width="2" height="4" rx="0.5" />
                <rect x="5" y="6" width="2" height="6" rx="0.5" />
                <rect x="9" y="3" width="2" height="9" rx="0.5" />
                <rect x="13" y="1" width="2" height="11" rx="0.5" />
              </svg>
              {/* Wifi */}
              <svg className="w-3.5 h-3 fill-current" viewBox="0 0 16 12">
                <path d="M8 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm-4.2-3.2a6 6 0 018.4 0l-1.4 1.4a4 4 0 00-5.6 0l-1.4-1.4zm-2.8-2.8a10 10 0 0114 0l-1.4 1.4a8 8 0 00-11.2 0l-1.4-1.4z" />
              </svg>
              {/* Battery */}
              <div className="w-5 h-2.5 border border-current rounded-sm p-[1px] flex items-center">
                <div className="h-full w-3.5 bg-current rounded-2xs" />
              </div>
            </div>
          </div>

          {/* Screen Display Area */}
          <div className="relative w-full h-full rounded-[38px] overflow-hidden flex flex-col bg-white">
            {children}
          </div>

          {/* Home Indicator Bar */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full z-40 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
