'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  UtensilsCrossed,
  Sparkles,
  Smartphone,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Share2,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
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
        if (data.dish.imageUrls?.length > 0) {
          setSelectedImage(data.dish.imageUrls[0]);
        }
        // If dish has no 3D model, default tab to 2D
        if (!data.dish.model3dUrl) {
          setActiveTab('2D');
        }
      } catch (err: any) {
        setError(err.message || 'Dish not found or currently unavailable');
      } finally {
        setIsLoading(false);
      }
    };

    loadDish();
  }, [restaurantSlug, dishSlug]);

  if (error || (!isLoading && !dish)) {
    return (
      <div className="min-h-screen bg-[#EDE1CF] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white border-2 border-[#5E0B15] p-8 shadow-xl">
          <AlertTriangle className="w-12 h-12 text-[#90323D] mx-auto mb-4" />
          <h1 className="text-lg font-black text-[#5E0B15] uppercase tracking-wider mb-2">
            Dish Unavailable
          </h1>
          <p className="text-xs text-[#594B42] mb-6">{error || 'Culinary offering could not be found.'}</p>
          <Link
            href={`/r/${restaurantSlug}`}
            className="inline-block px-5 py-2.5 bg-[#5E0B15] text-[#EDE1CF] text-xs font-bold uppercase tracking-wider"
          >
            ← Back to Restaurant Menu
          </Link>
        </div>
      </div>
    );
  }

  const has3D = !!dish?.model3dUrl;

  return (
    <div className="min-h-screen bg-[#EDE1CF] text-[#1C120C]">
      {/* Top Bar Navigation */}
      <header className="bg-white border-b border-[#DECDB5] px-4 py-3 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href={`/r/${restaurantSlug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5E0B15] hover:text-[#450810] uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{restaurant?.name || 'Menu'}</span>
          </Link>

          <span className="text-[11px] font-black uppercase tracking-widest text-[#90323D]">
            PRASADAM DINE 3D AR
          </span>
        </div>
      </header>

      {/* Main Experience Container */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          dish && (
            <>
              {/* Media Viewer Area */}
              <div className="bg-white border-2 border-[#5E0B15] overflow-hidden shadow-md">
                {/* Mode Switcher Tabs */}
                <div className="flex border-b border-[#DECDB5] bg-[#F7F3EC]">
                  {has3D && (
                    <button
                      onClick={() => setActiveTab('3D')}
                      className={`flex-1 py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-r border-[#DECDB5] cursor-pointer transition-colors ${
                        activeTab === '3D'
                          ? 'bg-[#5E0B15] text-[#EDE1CF]'
                          : 'text-[#594B42] hover:bg-white'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Interactive 3D / AR Food View</span>
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab('2D')}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                      activeTab === '2D'
                        ? 'bg-[#5E0B15] text-[#EDE1CF]'
                        : 'text-[#594B42] hover:bg-white'
                    }`}
                  >
                    <UtensilsCrossed className="w-4 h-4" />
                    <span>High-Res 2D Photography</span>
                  </button>
                </div>

                {/* 3D AR Tab */}
                {activeTab === '3D' && has3D && (
                  <div>
                    <ModelViewer
                      src={dish.model3dUrl!}
                      poster={selectedImage ? api.resolveMediaUrl(selectedImage) : undefined}
                      alt={dish.name}
                      dishName={dish.name}
                    />
                  </div>
                )}

                {/* 2D Photography Tab */}
                {(activeTab === '2D' || !has3D) && (
                  <div className="p-6 bg-white flex flex-col items-center">
                    <div className="w-full max-h-[420px] h-80 bg-[#F7F3EC] border border-[#DECDB5] flex items-center justify-center overflow-hidden mb-4">
                      {selectedImage ? (
                        <img
                          src={api.resolveMediaUrl(selectedImage)}
                          alt={dish.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-center p-8">
                          <UtensilsCrossed className="w-16 h-16 text-[#DECDB5] mx-auto mb-2" />
                          <p className="text-xs font-bold text-[#594B42] uppercase">
                            No photograph uploaded
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Gallery Thumbnails */}
                    {dish.imageUrls && dish.imageUrls.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto w-full py-2">
                        {dish.imageUrls.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImage(img)}
                            className={`w-16 h-16 border-2 shrink-0 overflow-hidden cursor-pointer ${
                              selectedImage === img
                                ? 'border-[#5E0B15]'
                                : 'border-[#DECDB5] opacity-70 hover:opacity-100'
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
              <div className="bg-white border border-[#DECDB5] p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#DECDB5] pb-4">
                  <div>
                    <h1 className="text-2xl font-black text-[#5E0B15] uppercase tracking-wide">
                      {dish.name}
                    </h1>
                    <p className="text-xs font-semibold text-[#90323D] uppercase tracking-wider mt-1">
                      {restaurant?.name}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-2xl font-black font-mono text-[#5E0B15] block">
                      {dish.currency} {dish.price.toFixed(2)}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {dish.isAvailable ? (
                        <span className="text-[#1E562A]">● Fresh & Available</span>
                      ) : (
                        <span className="text-[#90323D]">● Currently Sold Out</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Dietary & Recipe Attributes */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#594B42] mb-2">
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
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#594B42] mb-1">
                    Preparation & Ingredients
                  </h3>
                  <p className="text-sm text-[#1C120C] leading-relaxed">
                    {dish.description ||
                      'Prepared strictly using pure vegetarian and traditional devotional cooking guidelines.'}
                  </p>
                </div>

                {/* AR Instructions Box */}
                {has3D && (
                  <div className="p-4 bg-[#F7F3EC] border border-[#DECDB5] flex items-start gap-3">
                    <Smartphone className="w-5 h-5 text-[#90323D] shrink-0 mt-0.5" />
                    <div className="text-xs text-[#594B42] leading-relaxed">
                      <strong className="text-[#5E0B15] uppercase block mb-0.5">
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
        <div className="min-h-screen bg-[#EDE1CF] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#5E0B15] border-t-transparent animate-spin" />
        </div>
      }
    >
      <PublicDishDetailContent />
    </React.Suspense>
  );
}
