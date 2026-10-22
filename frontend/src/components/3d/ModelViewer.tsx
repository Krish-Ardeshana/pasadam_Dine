'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Smartphone,
  RefreshCw,
  RotateCcw,
  AlertCircle,
  Sparkles,
  Info,
  Maximize2,
  CheckCircle2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { findFoodModelByUrl } from '@/lib/food-models';

interface ModelViewerProps {
  src?: string;
  poster?: string;
  alt: string;
  dishName: string;
  category?: string;
  iosSrc?: string;
  className?: string;
  onRetry?: () => void;
}

export const ModelViewer: React.FC<ModelViewerProps> = ({
  src,
  poster,
  alt,
  dishName,
  category,
  iosSrc,
  className = '',
  onRetry,
}) => {
  const viewerRef = useRef<any>(null);
  const [viewerNode, setViewerNode] = useState<any>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [retryKey, setRetryKey] = useState(0);
  const [showARGuide, setShowARGuide] = useState(false);

  const modelMeta = findFoodModelByUrl(src);
  const resolvedModelUrl = src ? api.resolveMediaUrl(src) : '';
  const resolvedPosterUrl = poster ? api.resolveMediaUrl(poster) : undefined;
  const targetIosSrc = iosSrc || modelMeta?.usdzUrl;
  const resolvedIosSrc = targetIosSrc ? api.resolveMediaUrl(targetIosSrc) : undefined;

  // Dynamically import @google/model-viewer in client-side environment
  useEffect(() => {
    let isMounted = true;
    import('@google/model-viewer')
      .then(() => {
        if (isMounted) setIsScriptLoaded(true);
      })
      .catch((err) => {
        console.error('Failed to initialize 3D AR engine (@google/model-viewer):', err);
        if (isMounted) {
          setLoadError(true);
          setErrorMessage('WebGL 3D engine could not be initialized in this browser.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Attach event listeners to model-viewer element for load and error events
  useEffect(() => {
    const el = viewerNode || viewerRef.current;
    if (!el) return;

    const markLoaded = () => {
      setIsModelLoaded(true);
      setLoadError(false);
    };

    if (el.loaded || el.modelIsVisible) {
      markLoaded();
    }

    const handleLoad = () => markLoaded();
    const handleModelVisibility = (e: any) => {
      if (e?.detail?.visible) markLoaded();
    };
    const handleProgress = (event: any) => {
      if (event?.detail?.totalProgress === 1) markLoaded();
    };

    const handleError = (event: any) => {
      console.warn(`3D Food Model failed to load for ${dishName}:`, event?.detail);
      setLoadError(true);
      setErrorMessage(
        'The 3D model asset could not be loaded or network request was interrupted. High-resolution dish photography is displayed.'
      );
    };

    const handleARStatus = (event: any) => {
      if (event?.detail?.status === 'failed') {
        setShowARGuide(true);
      }
    };

    el.addEventListener('load', handleLoad);
    el.addEventListener('model-visibility', handleModelVisibility);
    el.addEventListener('progress', handleProgress);
    el.addEventListener('error', handleError);
    el.addEventListener('ar-status', handleARStatus);

    // Continuous interval check for fast resolution
    const checkInterval = setInterval(() => {
      if (el.loaded || el.modelIsVisible) {
        markLoaded();
        clearInterval(checkInterval);
      }
    }, 150);

    // Fallback: dismiss calibrating overlay after 4 seconds max so model is immediately interactive
    const timer = setTimeout(() => {
      clearInterval(checkInterval);
      markLoaded();
    }, 4000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(timer);
      el.removeEventListener('load', handleLoad);
      el.removeEventListener('model-visibility', handleModelVisibility);
      el.removeEventListener('progress', handleProgress);
      el.removeEventListener('error', handleError);
      el.removeEventListener('ar-status', handleARStatus);
    };
  }, [viewerNode, isScriptLoaded, retryKey, resolvedModelUrl, dishName]);

  const handleResetCamera = () => {
    if (viewerRef.current) {
      if (typeof viewerRef.current.resetTurntableRotation === 'function') {
        viewerRef.current.resetTurntableRotation();
      }
      if (modelMeta?.scaleConfig?.cameraOrbit) {
        viewerRef.current.cameraOrbit = modelMeta.scaleConfig.cameraOrbit;
      } else {
        viewerRef.current.cameraOrbit = '0deg 75deg auto';
      }
    }
  };

  const handleManualRetry = () => {
    setLoadError(false);
    setIsModelLoaded(false);
    setRetryKey((prev) => prev + 1);
    if (onRetry) onRetry();
  };

  // Case 1: No 3D model URL provided for this dish
  if (!src) {
    return (
      <div className={`relative w-full h-[380px] sm:h-[450px] bg-[#FAF7F2] rounded-2xl border-2 border-dashed border-[#D6C5A9] overflow-hidden flex flex-col items-center justify-center p-6 text-center ${className}`}>
        {resolvedPosterUrl ? (
          <div className="absolute inset-0 opacity-20">
            <img src={resolvedPosterUrl} alt={alt} className="w-full h-full object-cover blur-xs" />
          </div>
        ) : null}
        <div className="relative z-10 max-w-sm flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs flex items-center justify-center mb-3">
            <Sparkles className="w-7 h-7 text-[#90323D]" />
          </div>
          <h3 className="text-sm font-bold text-[#5E0B15] uppercase tracking-wider mb-1">
            3D AR Model In Preparation
          </h3>
          <p className="text-xs text-[#594B42] leading-relaxed mb-4">
            Our culinary 3D team is currently scanning and calibrating the photorealistic 3D asset for{' '}
            <strong className="text-[#1C120C]">{dishName}</strong>. Please explore the high-resolution photographs below.
          </p>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#594B42] bg-white border border-[#E8E2D9] px-3 py-1.5 rounded-lg shadow-xs">
            <Info className="w-3.5 h-3.5 text-[#90323D]" />
            <span>Full menu ordering and ingredients active</span>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: 3D model failed to load (network 404, invalid binary, WebGL crash)
  if (loadError) {
    return (
      <div className={`relative w-full h-[380px] sm:h-[450px] bg-[#FAF7F2] rounded-2xl border border-[#F6C6CC] overflow-hidden flex flex-col items-center justify-center p-6 text-center shadow-xs ${className}`}>
        {resolvedPosterUrl && (
          <div className="absolute inset-0 opacity-25">
            <img src={resolvedPosterUrl} alt={alt} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="relative z-10 max-w-md bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-[#E8E2D9] shadow-md flex flex-col items-center">
          <AlertCircle className="w-10 h-10 text-[#90323D] mb-2" />
          <h3 className="text-sm font-bold text-[#5E0B15] uppercase tracking-wider mb-1">
            3D Food Preview Temporarily Unavailable
          </h3>
          <p className="text-xs text-[#594B42] leading-relaxed mb-4">
            {errorMessage || `Unable to render the 3D model for ${dishName}. Authentic 2D photographs remain accessible.`}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleManualRetry}
              className="inline-flex items-center gap-1.5 bg-[#5E0B15] hover:bg-[#450810] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry 3D Load</span>
            </button>
            {resolvedPosterUrl && (
              <span className="text-[11px] font-bold text-[#1E562A] bg-[#EBF7ED] border border-[#C3E4C8] px-3 py-2 rounded-xl">
                ✓ 2D Photography Available
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Active Realistic 3D Food Experience
  return (
    <div className={`relative w-full h-[400px] sm:h-[480px] bg-gradient-to-b from-[#FAF7F2] to-[#F2EDE4] rounded-2xl border-2 border-[#5E0B15] overflow-hidden flex flex-col shadow-sm ${className}`}>
      {/* Top Left: Authentic Food 3D Badge */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        <div className="flex items-center gap-2 bg-[#5E0B15] text-[#EDE1CF] px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest shadow-md">
          <Box className="w-4 h-4 text-[#EDE1CF]" />
          <span>Interactive 3D Food View</span>
        </div>
        {modelMeta && (
          <span className="text-[10px] font-black uppercase tracking-wider text-[#5E0B15] bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-md border border-[#E8E2D9] shadow-xs w-fit">
            {modelMeta.foodName}
          </span>
        )}
      </div>

      {/* Top Right: Reset Camera Control */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        <button
          onClick={handleResetCamera}
          title="Reset Camera View"
          className="flex items-center gap-1.5 bg-white/95 hover:bg-white text-[#594B42] hover:text-[#5E0B15] px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-[#E8E2D9] transition-colors shadow-xs cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#90323D]" />
          <span className="hidden sm:inline">Reset Angle</span>
        </button>
      </div>

      {/* Bottom Left: Rotation & Zoom Guidance */}
      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-xs rounded-lg border border-[#E8E2D9] text-[#594B42] px-3 py-1.5 text-[11px] font-medium shadow-xs">
        <RefreshCw className="w-3 h-3 text-[#90323D] animate-spin" style={{ animationDuration: '8s' }} />
        <span>Drag to rotate 360° • Pinch / Scroll to zoom</span>
      </div>

      {/* Bottom Right: Asset Info Tooltip */}
      {modelMeta && (
        <div className="absolute bottom-3 right-3 z-10 hidden md:flex items-center gap-1.5 text-[10px] text-[#594B42] bg-white/90 backdrop-blur-xs border border-[#E8E2D9] px-2 py-1 rounded-md shadow-2xs">
          <CheckCircle2 className="w-3 h-3 text-[#1E562A]" />
          <span>Verified Realistic Food Asset ({modelMeta.fileSizeFormatted})</span>
        </div>
      )}

      {/* Loading State Spinner */}
      {(!isScriptLoaded || !isModelLoaded) && (
        <div className="absolute inset-0 z-5 bg-[#FAF7F2]/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 pointer-events-none transition-opacity duration-300">
          <div className="w-10 h-10 rounded-full border-3 border-[#5E0B15] border-t-transparent animate-spin mb-3" />
          <p className="text-xs font-bold text-[#5E0B15] uppercase tracking-wider mb-1">
            Calibrating 3D Food Model...
          </p>
          <p className="text-[11px] text-[#594B42] max-w-xs text-center">
            Loading realistic geometry and high-fidelity culinary textures for {dishName}.
          </p>
        </div>
      )}

      {/* Google Model Viewer Web Component */}
      {isScriptLoaded && (
        <model-viewer
          key={`${resolvedModelUrl}-${retryKey}`}
          ref={(el: any) => {
            viewerRef.current = el;
            if (el && el !== viewerNode) {
              setViewerNode(el);
            }
          }}
          src={resolvedModelUrl}
          ios-src={resolvedIosSrc}
          poster={resolvedPosterUrl}
          alt={alt || `Realistic 3D model of ${dishName}`}
          auto-rotate
          camera-controls
          bounds="tight"
          camera-orbit={modelMeta?.scaleConfig?.cameraOrbit || '0deg 70deg auto'}
          field-of-view={modelMeta?.scaleConfig?.fieldOfView || '30deg'}
          rotation-per-second="18deg"
          shadow-intensity={modelMeta?.scaleConfig?.shadowIntensity || '1.2'}
          shadow-softness={modelMeta?.scaleConfig?.shadowSoftness || '0.7'}
          exposure={modelMeta?.scaleConfig?.exposure || '1.05'}
          environment-image="neutral"
          ar
          ar-modes="webxr scene-viewer quick-look"
          ar-scale={modelMeta?.scaleConfig?.arScale || 'auto'}
          loading="eager"
          reveal="auto"
          className="w-full h-full cursor-grab active:cursor-grabbing"
          style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
        >
          {/* Custom AR Trigger Button Slot */}
          <button
            slot="ar-button"
            className="absolute top-14 sm:top-3 right-3 z-10 flex items-center gap-2 bg-[#90323D] hover:bg-[#782732] active:bg-[#5E0B15] text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-[#90323D] transition-all shadow-md cursor-pointer hover:scale-102"
          >
            <Smartphone className="w-4 h-4 text-white" />
            <span>Place on Table (AR)</span>
          </button>
        </model-viewer>
      )}

      {/* AR Device Guidance Modal if triggered */}
      {showARGuide && (
        <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-[#E8E2D9] shadow-xl text-center">
            <Smartphone className="w-10 h-10 text-[#90323D] mx-auto mb-2" />
            <h4 className="text-sm font-bold text-[#5E0B15] uppercase tracking-wider mb-2">
              Augmented Reality Dining
            </h4>
            <p className="text-xs text-[#594B42] mb-4 leading-relaxed">
              AR requires a mobile device with Google Chrome (Android ARCore) or Safari (iOS AR Quick Look).
              Point your phone camera at your dining table to project the dish at true life-size scale.
            </p>
            <button
              onClick={() => setShowARGuide(false)}
              className="w-full py-2 bg-[#5E0B15] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#450810] transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
