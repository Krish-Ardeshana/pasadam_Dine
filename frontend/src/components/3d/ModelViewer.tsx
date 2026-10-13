'use client';

import React, { useEffect, useState } from 'react';
import { Box, Eye, AlertTriangle, Smartphone, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';

interface ModelViewerProps {
  src: string;
  poster?: string;
  alt: string;
  dishName: string;
}

export const ModelViewer: React.FC<ModelViewerProps> = ({
  src,
  poster,
  alt,
  dishName,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [canActivateAR, setCanActivateAR] = useState(false);

  const resolvedModelUrl = api.resolveMediaUrl(src);
  const resolvedPosterUrl = poster ? api.resolveMediaUrl(poster) : undefined;

  useEffect(() => {
    // Dynamically import custom element definition in browser
    import('@google/model-viewer')
      .then(() => {
        setIsLoaded(true);
      })
      .catch((err) => {
        console.error('Failed to load @google/model-viewer:', err);
        setLoadError(true);
      });
  }, []);

  if (loadError) {
    return (
      <div className="w-full h-80 bg-[#F8F7F4] rounded-2xl border border-[#E8E2D9] flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-10 h-10 text-[#90323D] mb-2" />
        <p className="text-sm font-bold text-[#5E0B15] uppercase tracking-wider mb-1">
          3D Rendering Engine Unavailable
        </p>
        <p className="text-xs text-[#594B42] max-w-sm">
          WebGL or 3D canvas could not be initialized. Please inspect the high-resolution 2D photographs.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[450px] bg-[#F8F7F4] rounded-2xl border-2 border-[#5E0B15] overflow-hidden flex flex-col">
      {/* 3D Header Badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-[#5E0B15] text-[#EDE1CF] px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest shadow-md">
        <Box className="w-4 h-4 text-[#EDE1CF]" />
        <span>Interactive 3D Dish View</span>
      </div>

      {/* Camera Guidance Tooltip */}
      <div className="absolute bottom-3 left-3 z-10 hidden sm:flex items-center gap-2 bg-white/95 rounded-lg border border-[#E8E2D9] text-[#594B42] px-2.5 py-1 text-[11px] font-medium shadow-xs">
        <RefreshCw className="w-3 h-3 text-[#90323D]" />
        <span>Drag to rotate • Scroll to zoom</span>
      </div>

      {!isLoaded ? (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#5E0B15] border-t-transparent animate-spin mb-3" />
          <p className="text-xs font-semibold text-[#5E0B15] uppercase tracking-wider">
            Loading 3D AR Model...
          </p>
        </div>
      ) : (
        <model-viewer
          src={resolvedModelUrl}
          poster={resolvedPosterUrl}
          alt={alt || `3D model of ${dishName}`}
          auto-rotate
          camera-controls
          rotation-per-second="20deg"
          shadow-intensity="1.2"
          shadow-softness="0.8"
          exposure="1.0"
          ar
          ar-modes="webxr scene-viewer quick-look"
          ar-scale="auto"
          className="w-full h-full cursor-grab active:cursor-grabbing"
          style={{ width: '100%', height: '100%', backgroundColor: '#F8F7F4' }}
        >
          {/* Custom AR Button Slot */}
          <button
            slot="ar-button"
            className="absolute top-3 right-3 z-10 flex items-center gap-2 bg-[#90323D] hover:bg-[#782732] active:bg-[#5E0B15] text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border border-[#90323D] transition-colors shadow-lg cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-white" />
            <span>View in Your Room (AR)</span>
          </button>
        </model-viewer>
      )}
    </div>
  );
};
