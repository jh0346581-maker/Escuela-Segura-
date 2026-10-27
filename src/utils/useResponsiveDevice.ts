import { useState, useEffect } from 'react';
import { DeviceMode } from '../types';

export function useResponsiveDevice(selectedMode: DeviceMode): {
  effectiveDevice: 'mobile' | 'tablet' | 'desktop';
  windowWidth: number;
} {
  const [windowWidth, setWindowWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return 1024;
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (selectedMode !== 'auto') {
    return { effectiveDevice: selectedMode, windowWidth };
  }

  // Automatic calculation based on window width
  if (windowWidth < 768) {
    return { effectiveDevice: 'mobile', windowWidth };
  } else if (windowWidth < 1180) {
    return { effectiveDevice: 'tablet', windowWidth };
  } else {
    return { effectiveDevice: 'desktop', windowWidth };
  }
}
