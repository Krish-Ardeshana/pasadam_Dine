'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  UtensilsCrossed,
  Sparkles,
  Smartphone,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Table';
import { ModelViewer } from '@/components/3d/ModelViewer';
import { api } from '@/lib/api';
import { Dish, Restaurant } from '@/lib/types';

function PublicDishDetailContent() {
  const params = useParams();
  const restaurantSlug = params.restaurantSlug as string;
  const dishSlug = params.dishSlug as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dish, setDish] = useState<Dish | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'3D' | '2D'>('3D');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantSlug || !dishSlug) return;

    const loadDish = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.publicMenu.getDish(restaurantSlug, dishSlug);
        setRestaurant(data.restaurant);
        setDish(data.dish);
        if (data.dish.imageUrls?.[0]) {
          setSelectedImage(data.dish.imageUrls[0]);
        }
        // If dish has no 3D model, default to 2D
        if (!data.dish.model3dUrl) {
          setActiveTab('2D');
        }
      } catch (err: any) {
        setError(err.message || 'Dish details could not be loaded');
      } finally {
        setIsLoading(false);
      }
    };

    loadDish();
  }, [restaurantSlug, dishSlug]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#E8E2D9] p-8 text-center shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-[#FDF0F1] border border-[#F6C6CC] flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-[#90323D]" />
          </div>
          <h1 className="text-lg font-bold text-[#5E0B15] uppercase tracking-wider mb-2">
            Dish Not Available
          </h1>
          <p className="text-xs text-[#594B42] mb-6 leading-relaxed">{error}</p>
          <Link
            href={`/r/${restaurantSlug}`}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-[#5E0B15] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#450810] transition-colors shadow-xs"
          >
            Back to Restaurant Menu
          </Link>
        </div>
      </div>
    );
  }

  const has3D = !!dish?.model3dUrl;

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1C120C]">
      {/* Top Navbar */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#E8E2D9] px-4 py-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href={`/r/${restaurantSlug}`}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5E0B15] hover:text-[#90323D] px-3 py-1.5 rounded-lg hover:bg-[#FAF7F2] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{restaurant?.name || 'Menu'}</span>
          </Link>

          <span className="text-[11px] font-black uppercase tracking-widest text-[#90323D] bg-[#FAF7F2] px-2.5 py-1 rounded-full border border-[#E8E2D9]">
            PRASADAM DINE 3D AR
          </span>
        </div>
      </header>

      {/* Main Experience Container */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-96 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
        ) : (
          dish && (
            <>
              {/* Media Viewer Area */}
              <div className="bg-white rounded-2xl border border-[#E8E2D9] overflow-hidden shadow-sm">
                {/* Mode Switcher Tabs */}
                <div className="flex border-b border-[#E8E2D9] bg-[#FAF8F5] p-2 gap-2">
                  <button
                    onClick={() => setActiveTab('3D')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl cursor-pointer transition-all ${
                      activeTab === '3D'
                        ? 'bg-white text-[#1B4332] shadow-sm border border-[#E8E2D9]'
                        : 'text-[#57534E] hover:text-[#1B4332] hover:bg-white/60'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-[#2D6A4F]" />
                    <span>Interactive 3D / AR View {has3D ? '' : '(Coming Soon)'}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('2D')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl cursor-pointer transition-all ${
                      activeTab === '2D'
                        ? 'bg-white text-[#1B4332] shadow-sm border border-[#E8E2D9]'
                        : 'text-[#57534E] hover:text-[#1B4332] hover:bg-white/60'
                    }`}
                  >
                    <UtensilsCrossed className="w-4 h-4 text-[#2D6A4F]" />
                    <span>High-Res 2D Photography</span>
                  </button>
                </div>

                {/* 3D AR Tab */}
                {activeTab === '3D' && (
                  <div className="p-4 sm:p-6 bg-white">
                    <ModelViewer
                      src={dish.model3dUrl || undefined}
                      poster={selectedImage ? api.resolveMediaUrl(selectedImage) : undefined}
                      alt={dish.name}
                      dishName={dish.name}
                    />
                  </div>
                )}

                {/* 2D Photography Tab */}
                {(activeTab === '2D' || !has3D) && (
                  <div className="p-6 bg-white flex flex-col items-center">
                    <div className="w-full max-h-[420px] h-80 bg-[#FAF7F2] rounded-xl border border-[#E8E2D9] flex items-center justify-center overflow-hidden mb-4">
                      {selectedImage ? (
                        <img
                          src={api.resolveMediaUrl(selectedImage)}
                          alt={dish.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-center p-8">
                          <UtensilsCrossed className="w-16 h-16 text-[#DCD5C9] mx-auto mb-2" />
                          <p className="text-xs font-bold text-[#594B42] uppercase">
                            No photograph uploaded
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Gallery Thumbnails */}
                    {dish.imageUrls && dish.imageUrls.length > 1 && (
                      <div className="flex gap-2.5 overflow-x-auto w-full py-2">
                        {dish.imageUrls.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImage(img)}
                            className={`w-16 h-16 rounded-xl border-2 shrink-0 overflow-hidden cursor-pointer transition-all ${
                              selectedImage === img
                                ? 'border-[#5E0B15] shadow-xs scale-105'
                                : 'border-[#E8E2D9] opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={api.resolveMediaUrl(img)}
                              alt={`Thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dish Specification & Details Card */}
              <div className="bg-white rounded-2xl border border-[#E8E2D9] p-7 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#E8E2D9] pb-5">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-[#5E0B15] uppercase tracking-wide">
                      {dish.name}
                    </h1>
                    <p className="text-xs font-bold text-[#90323D] uppercase tracking-wider mt-1">
                      {restaurant?.name}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-[#5E0B15] block">
                      {dish.currency} {dish.price.toFixed(2)}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {dish.isAvailable ? (
                        <span className="text-[#1E562A] flex items-center gap-1.5 sm:justify-end mt-1">
                          <span className="w-2 h-2 rounded-full bg-[#1E562A] inline-block" /> Fresh & Available
                        </span>
                      ) : (
                        <span className="text-[#90323D] flex items-center gap-1.5 sm:justify-end mt-1">
                          <span className="w-2 h-2 rounded-full bg-[#90323D] inline-block" /> Sold Out
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Dietary & Recipe Attributes */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#594B42] mb-2.5">
                    Dietary Classification & Hygiene
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {dish.dietaryFlags?.map((flag) => (
                      <Badge key={flag} variant="dietary">
                        {flag}
                      </Badge>
                    ))}
                    {has3D && (
                      <Badge variant="success">3D DIGITAL MODEL CERTIFIED</Badge>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#594B42] mb-1.5">
                    Preparation & Ingredients
                  </h3>
                  <p className="text-sm text-[#1C120C] leading-relaxed">
                    {dish.description ||
                      'Prepared strictly using pure vegetarian and traditional devotional cooking guidelines.'}
                  </p>
                </div>

                {/* AR Instructions Box */}
                {has3D && (
                  <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8E2D9] flex items-start gap-3">
                    <Smartphone className="w-5 h-5 text-[#90323D] shrink-0 mt-0.5" />
                    <div className="text-xs text-[#594B42] leading-relaxed">
                      <strong className="text-[#5E0B15] uppercase block mb-1">
                        How to place in Augmented Reality:
                      </strong>
                      On mobile devices (iOS Safari with AR Quick Look or Android Chrome with Scene Viewer),
                      tap the <strong>&quot;View in Your Room (AR)&quot;</strong> button located on the 3D canvas
                      to visualize the dish scaled to actual plate size on your table.
                    </div>
                  </div>
                )}
              </div>
            </>
          )
        )}
      </main>
    </div>
  );
}

export default function PublicDishDetailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#5E0B15] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PublicDishDetailContent />
    </React.Suspense>
  );
}
