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
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E8DEC9] shadow-xl p-8 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl border border-red-200 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-red-600" />
          </div>
          <h1 className="text-lg font-bold text-[#7A0C1E] uppercase tracking-wider mb-2 font-luxury">
            Dish Not Available
          </h1>
          <p className="text-xs text-[#6E5D53] mb-6 leading-relaxed">{error}</p>
          <Link
            href={`/r/${restaurantSlug}`}
            className="inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-[#8B1226] to-[#680514] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:from-[#9E152D] hover:to-[#7A0C1E] transition-all shadow-md"
          >
            Back to Restaurant Menu
          </Link>
        </div>
      </div>
    );
  }

  const has3D = !!dish?.model3dUrl;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C120C] selection:bg-[#F59E0B]/30 selection:text-[#7A0C1E]">
      {/* Top Navbar */}
      <header className="bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#E8DEC9] px-4 py-4 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href={`/r/${restaurantSlug}`}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7A0C1E] hover:text-[#5E0513] px-3.5 py-1.5 rounded-xl hover:bg-[#FEF3C7] transition-all border border-transparent hover:border-[#F59E0B]/30"
          >
            <ArrowLeft className="w-4 h-4 text-[#F59E0B]" />
            <span>{restaurant?.name || 'Menu'}</span>
          </Link>

          <span className="text-[11px] font-bold uppercase tracking-wider text-[#92400E] bg-[#FEF3C7] px-3 py-1 rounded-full border border-[#F59E0B]/30 shadow-2xs">
            AR_DINE 3D AR
          </span>
        </div>
      </header>

      {/* Main Experience Container */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-96 w-full rounded-3xl" />
            <Skeleton className="h-28 w-full rounded-3xl" />
          </div>
        ) : (
          dish && (
            <>
              {/* Media Viewer Area */}
              <div className="bg-white rounded-3xl border border-[#E8DEC9] shadow-sm overflow-hidden">
                {/* Mode Switcher Tabs */}
                <div className="flex border-b border-[#E8DEC9] bg-[#FAF7F2] p-2 gap-2">
                  <button
                    onClick={() => setActiveTab('3D')}
                    className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl cursor-pointer transition-all ${
                      activeTab === '3D'
                        ? 'bg-gradient-to-r from-[#8B1226] to-[#680514] text-white shadow-sm'
                        : 'bg-white text-[#6E5D53] hover:bg-[#FEF3C7] hover:text-[#7A0C1E] border border-[#E8DEC9]'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-[#FDE68A]" />
                    <span>Interactive 3D / AR View {has3D ? '' : '(Pending 3D Model)'}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('2D')}
                    className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl cursor-pointer transition-all ${
                      activeTab === '2D'
                        ? 'bg-gradient-to-r from-[#8B1226] to-[#680514] text-white shadow-sm'
                        : 'bg-white text-[#6E5D53] hover:bg-[#FEF3C7] hover:text-[#7A0C1E] border border-[#E8DEC9]'
                    }`}
                  >
                    <UtensilsCrossed className="w-4 h-4 text-[#B45309]" />
                    <span>High-Res 2D Photography</span>
                  </button>
                </div>

                {/* 3D AR Tab */}
                {activeTab === '3D' && (
                  <div className="p-4 sm:p-6 bg-white min-h-[420px]">
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
                    <div className="w-full max-h-[420px] h-80 bg-[#FAF7F2] rounded-2xl border border-[#E8DEC9] flex items-center justify-center overflow-hidden mb-4">
                      {selectedImage ? (
                        <img
                          src={api.resolveMediaUrl(selectedImage)}
                          alt={dish.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-center p-8">
                          <UtensilsCrossed className="w-16 h-16 text-[#E8DEC9] mx-auto mb-2" />
                          <p className="text-xs font-bold text-[#6E5D53] uppercase">
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
                                ? 'border-[#7A0C1E] shadow-sm scale-105'
                                : 'border-[#E8DEC9] opacity-70 hover:opacity-100'
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
              <div className="bg-white rounded-3xl border border-[#E8DEC9] p-7 sm:p-8 space-y-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#E8DEC9] pb-5">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-[#7A0C1E] uppercase tracking-wide font-luxury">
                      {dish.name}
                    </h1>
                    <p className="text-xs font-bold text-[#B45309] uppercase tracking-wider mt-1">
                      {restaurant?.name}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-[#7A0C1E] block">
                      {dish.currency} {dish.price.toFixed(2)}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {dish.isAvailable ? (
                        <span className="text-[#1E562A] flex items-center gap-1.5 sm:justify-end mt-1">
                          Fresh & Available
                        </span>
                      ) : (
                        <span className="text-[#8C7A6F] flex items-center gap-1.5 sm:justify-end mt-1">
                          Sold Out
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Dietary & Recipe Attributes */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#7A0C1E] mb-2.5">
                    Dietary Classification & Hygiene
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {dish.dietaryFlags?.map((flag) => (
                      <Badge key={flag} variant="dietary" className="rounded-full">
                        {flag}
                      </Badge>
                    ))}
                    {has3D && (
                      <Badge variant="success" className="rounded-full">3D DIGITAL MODEL CERTIFIED</Badge>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#7A0C1E] mb-1.5">
                    Preparation & Ingredients
                  </h3>
                  <p className="text-sm text-[#1C120C] leading-relaxed">
                    {dish.description ||
                      'Prepared strictly using pure vegetarian and traditional devotional cooking guidelines.'}
                  </p>
                </div>

                {/* AR Instructions Box */}
                {has3D && (
                  <div className="p-5 bg-[#FEF3C7]/60 rounded-2xl border border-[#F59E0B]/30 flex items-start gap-3 shadow-2xs">
                    <Smartphone className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
                    <div className="text-xs text-[#6E5D53] leading-relaxed">
                      <strong className="text-[#7A0C1E] uppercase block mb-1">
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
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#7A0C1E] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PublicDishDetailContent />
    </React.Suspense>
  );
}
