'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  UtensilsCrossed,
  Sparkles,
  MapPin,
  Phone,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Table';
import { api } from '@/lib/api';
import { Dish, PublicMenuResponse } from '@/lib/types';

function PublicRestaurantMenuContent() {
  const params = useParams();
  const restaurantSlug = params.restaurantSlug as string;

  const [menuData, setMenuData] = useState<PublicMenuResponse | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantSlug) return;

    const loadMenu = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.publicMenu.getFullMenu(restaurantSlug);
        setMenuData(data);
      } catch (err: any) {
        setError(err.message || 'Restaurant menu could not be loaded');
      } finally {
        setIsLoading(false);
      }
    };

    loadMenu();
  }, [restaurantSlug]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#E8E2D9] p-8 text-center shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-[#FDF0F1] border border-[#F6C6CC] flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-[#90323D]" />
          </div>
          <h1 className="text-lg font-bold text-[#5E0B15] uppercase tracking-wider mb-2">
            Menu Unavailable
          </h1>
          <p className="text-xs text-[#594B42] mb-6 leading-relaxed">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-[#5E0B15] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#450810] transition-colors shadow-xs"
          >
            Return to Prasadam Dine
          </Link>
        </div>
      </div>
    );
  }

  const restaurant = menuData?.restaurant;
  const categories = menuData?.categories || [];

  // Flatten or filter dishes based on selected category & search query
  let allDishes: Dish[] = [];
  categories.forEach((cat) => {
    allDishes = allDishes.concat(cat.dishes || []);
  });

  const filteredDishes = allDishes.filter((dish) => {
    if (activeCategory !== 'ALL' && dish.categoryId !== activeCategory) {
      return false;
    }
    if (
      search &&
      !dish.name.toLowerCase().includes(search.toLowerCase()) &&
      !(dish.description || '').toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1C120C]">
      {/* Restaurant Header & Cover */}
      <header className="bg-white border-b border-[#E8E2D9] shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {restaurant?.logoUrl ? (
              <img
                src={api.resolveMediaUrl(restaurant.logoUrl)}
                alt={restaurant.name}
                className="w-24 h-24 rounded-2xl object-cover border border-[#E8E2D9] shadow-xs"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-[#5E0B15] text-white flex items-center justify-center font-black text-4xl shadow-sm border border-white/10">
                {restaurant?.name?.[0] || 'P'}
              </div>
            )}

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-black text-[#5E0B15] uppercase tracking-wide">
                  {restaurant?.name || 'Prasadam Dining Venue'}
                </h1>
                <Badge variant="success">OPEN FOR DINING</Badge>
              </div>

              <p className="text-xs sm:text-sm text-[#594B42] max-w-2xl mb-4 leading-relaxed">
                {restaurant?.description ||
                  'Pure traditional Sattvic culinary offerings prepared with devotion and spiritual hygiene.'}
              </p>

              {restaurant?.address && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#594B42]">
                  {restaurant.address.city && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#90323D]" />
                      {restaurant.address.street ? `${restaurant.address.street}, ` : ''}
                      {restaurant.address.city}
                    </span>
                  )}
                  {restaurant.contactDetails?.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#90323D]" />
                      {restaurant.contactDetails.phone}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sticky Category & Search Navigation */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E8E2D9] shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto py-1">
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full cursor-pointer shrink-0 transition-all ${
                activeCategory === 'ALL'
                  ? 'bg-[#5E0B15] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#594B42] hover:bg-[#EFE9DF]'
              }`}
            >
              All Offerings
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full cursor-pointer shrink-0 transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#5E0B15] text-white shadow-xs'
                    : 'bg-[#FAF7F2] text-[#594B42] hover:bg-[#EFE9DF]'
                }`}
              >
                {cat.name} ({cat.dishes.length})
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="w-full md:w-64">
            <input
              type="text"
              placeholder="SEARCH DISHES..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3.5 py-1.5 text-xs bg-[#FAF7F2] rounded-full border border-[#E8E2D9] focus:outline-none focus:ring-2 focus:ring-[#90323D]/20 uppercase placeholder-[#9C8B7E]"
            />
          </div>
        </div>
      </div>

      {/* Main Menu Grid */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        ) : filteredDishes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8E2D9] p-12 text-center shadow-xs">
            <UtensilsCrossed className="w-8 h-8 text-[#90323D] mx-auto mb-2" />
            <p className="text-xs font-bold uppercase text-[#594B42]">
              No dishes found matching your selection.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredDishes.map((dish) => {
              const has3D = !!dish.model3dUrl;
              const imageUrl = dish.imageUrls?.[0]
                ? api.resolveMediaUrl(dish.imageUrls[0])
                : null;

              return (
                <div
                  key={dish._id}
                  className="bg-white rounded-2xl border border-[#E8E2D9] hover:border-[#90323D] transition-all duration-200 p-5 flex flex-col justify-between shadow-xs hover:shadow-md"
                >
                  <div className="flex gap-4">
                    {/* Dish Thumbnail */}
                    <div className="w-24 h-24 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] shrink-0 flex items-center justify-center overflow-hidden relative">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={dish.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UtensilsCrossed className="w-8 h-8 text-[#DECDB5]" />
                      )}
                      {has3D && (
                        <span className="absolute top-1.5 left-1.5 bg-[#5E0B15] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
                          3D
                        </span>
                      )}
                    </div>

                    {/* Dish Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="text-sm font-bold text-[#1C120C] uppercase tracking-wide">
                          {dish.name}
                        </h3>
                        <span className="font-mono text-sm font-black text-[#5E0B15] shrink-0">
                          {dish.currency} {dish.price.toFixed(2)}
                        </span>
                      </div>

                      <p className="text-xs text-[#594B42] line-clamp-2 mb-2.5 leading-relaxed">
                        {dish.description || 'Authentic traditional recipe.'}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {dish.dietaryFlags?.map((flag) => (
                          <Badge key={flag} variant="dietary" className="text-[9px] py-0 px-2">
                            {flag}
                          </Badge>
                        ))}
                        {has3D && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#1E562A] bg-[#EBF7ED] border border-[#C3E4C8] px-2 py-0.5 rounded-full uppercase">
                            <Sparkles className="w-2.5 h-2.5" /> 3D AR Model
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Link to 3D AR Experience */}
                  <div className="mt-4 pt-3 border-t border-[#F5EFE6] flex items-center justify-between">
                    <span className="text-[11px] text-[#594B42] uppercase font-bold">
                      {dish.isAvailable ? (
                        <span className="text-[#1E562A] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#1E562A] inline-block" /> In Stock
                        </span>
                      ) : (
                        <span className="text-[#90323D] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#90323D] inline-block" /> Unavailable
                        </span>
                      )}
                    </span>

                    <Link
                      href={`/r/${restaurantSlug}/d/${dish.slug}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#5E0B15] hover:bg-[#450810] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-xs"
                    >
                      <span>{has3D ? 'View in 3D AR' : 'Details'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E2D9] bg-white py-8 mt-12 text-center text-xs text-[#594B42]">
        <div className="max-w-5xl mx-auto px-4 space-y-2">
          <p className="font-bold text-[#5E0B15] uppercase tracking-widest">
            PRASADAM DINE — AR SMART RESTAURANT SYSTEM
          </p>
          <p className="text-[11px]">
            Powered by Prasadam Dine centralized multi-tenant restaurant cloud.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function PublicRestaurantMenuPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#5E0B15] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PublicRestaurantMenuContent />
    </React.Suspense>
  );
}
