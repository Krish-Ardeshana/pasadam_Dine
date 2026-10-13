'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  UtensilsCrossed,
  Sparkles,
  MapPin,
  Phone,
  Clock,
  Search,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Table';
import { api } from '@/lib/api';
import { Dish, PublicMenuCategory, PublicMenuResponse } from '@/lib/types';

function PublicRestaurantMenuContent() {
  const params = useParams();
  const restaurantSlug = params.restaurantSlug as string;

  const [menuData, setMenuData] = useState<PublicMenuResponse | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState('');
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
        setError(err.message || 'Restaurant not found or currently unavailable');
      } finally {
        setIsLoading(false);
      }
    };

    loadMenu();
  }, [restaurantSlug]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#EDE1CF] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white border-2 border-[#5E0B15] p-8 shadow-xl">
          <AlertTriangle className="w-12 h-12 text-[#90323D] mx-auto mb-4" />
          <h1 className="text-lg font-black text-[#5E0B15] uppercase tracking-wider mb-2">
            Restaurant Unavailable
          </h1>
          <p className="text-xs text-[#594B42] mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 bg-[#5E0B15] text-[#EDE1CF] text-xs font-bold uppercase tracking-wider"
          >
            Return to Prasadam Dine
          </Link>
        </div>
      </div>
    );
  }

  const restaurant = menuData?.restaurant;
  const categories = menuData?.categories || [];

  // Flatten and filter dishes
  const allDishes: (Dish & { categoryName: string })[] = [];
  categories.forEach((cat) => {
    cat.dishes.forEach((d) => {
      allDishes.push({ ...d, categoryName: cat.name });
    });
  });

  const filteredDishes = allDishes.filter((dish) => {
    if (activeCategory !== 'ALL' && dish.categoryId !== activeCategory) {
      return false;
    }
    if (dietaryFilter && !dish.dietaryFlags?.includes(dietaryFilter)) {
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
    <div className="min-h-screen bg-[#EDE1CF] text-[#1C120C]">
      {/* Restaurant Header & Cover */}
      <header className="bg-white border-b-2 border-[#5E0B15] shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {restaurant?.logoUrl ? (
              <img
                src={api.resolveMediaUrl(restaurant.logoUrl)}
                alt={restaurant.name}
                className="w-24 h-24 object-cover border-2 border-[#5E0B15]"
              />
            ) : (
              <div className="w-24 h-24 bg-[#5E0B15] text-[#EDE1CF] flex items-center justify-center font-black text-4xl border-2 border-[#EDE1CF]">
                {restaurant?.name?.[0] || 'P'}
              </div>
            )}

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-1">
                <h1 className="text-2xl font-black text-[#5E0B15] uppercase tracking-wide">
                  {restaurant?.name || 'Prasadam Dining Venue'}
                </h1>
                <Badge variant="success">OPEN FOR DINING</Badge>
              </div>

              <p className="text-xs text-[#594B42] max-w-2xl mb-4 leading-relaxed">
                {restaurant?.description ||
                  'Pure traditional Sattvic culinary offerings prepared with devotion and spiritual hygiene.'}
              </p>

              {restaurant?.address && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#594B42]">
                  {restaurant.address.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#90323D]" />
                      {restaurant.address.street ? `${restaurant.address.street}, ` : ''}
                      {restaurant.address.city}
                    </span>
                  )}
                  {restaurant.contactDetails?.phone && (
                    <span className="flex items-center gap-1">
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
      <div className="sticky top-0 z-30 bg-[#F7F3EC] border-b border-[#DECDB5] shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto py-1">
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border cursor-pointer shrink-0 transition-colors ${
                activeCategory === 'ALL'
                  ? 'bg-[#5E0B15] text-[#EDE1CF] border-[#5E0B15]'
                  : 'bg-white text-[#594B42] border-[#DECDB5] hover:bg-[#EDE1CF]'
              }`}
            >
              All Offerings
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border cursor-pointer shrink-0 transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-[#5E0B15] text-[#EDE1CF] border-[#5E0B15]'
                    : 'bg-white text-[#594B42] border-[#DECDB5] hover:bg-[#EDE1CF]'
                }`}
              >
                {cat.name} ({cat.dishes.length})
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="w-full md:w-60 relative">
            <input
              type="text"
              placeholder="SEARCH DISH..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-[#D6C5A9] text-xs font-semibold text-[#1C120C] uppercase placeholder-[#9C8B7E] focus:outline-none focus:border-[#5E0B15]"
            />
          </div>
        </div>
      </div>

      {/* Menu Content Area (60% Almond) */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
          </div>
        ) : filteredDishes.length === 0 ? (
          <div className="bg-white border border-[#DECDB5] p-12 text-center">
            <UtensilsCrossed className="w-8 h-8 text-[#90323D] mx-auto mb-2" />
            <p className="text-xs font-bold uppercase text-[#594B42]">
              No dishes found matching your selection.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDishes.map((dish) => {
              const has3D = !!dish.model3dUrl;
              const imageUrl = dish.imageUrls?.[0]
                ? api.resolveMediaUrl(dish.imageUrls[0])
                : null;

              return (
                <div
                  key={dish._id}
                  className="bg-white border border-[#DECDB5] hover:border-[#5E0B15] transition-colors p-4 flex flex-col justify-between"
                >
                  <div className="flex gap-4">
                    {/* Dish Thumbnail */}
                    <div className="w-24 h-24 bg-[#F7F3EC] border border-[#DECDB5] shrink-0 flex items-center justify-center overflow-hidden relative">
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
                        <span className="absolute top-1 left-1 bg-[#5E0B15] text-[#EDE1CF] text-[8px] font-black px-1 uppercase tracking-widest border border-[#EDE1CF]/30">
                          3D
                        </span>
                      )}
                    </div>

                    {/* Dish Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-sm font-extrabold text-[#1C120C] uppercase tracking-wide">
                          {dish.name}
                        </h3>
                        <span className="font-mono text-sm font-black text-[#5E0B15] shrink-0">
                          {dish.currency} {dish.price.toFixed(2)}
                        </span>
                      </div>

                      <p className="text-xs text-[#594B42] line-clamp-2 mb-2 leading-relaxed">
                        {dish.description || 'Authentic traditional recipe.'}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {dish.dietaryFlags?.map((flag) => (
                          <Badge key={flag} variant="dietary" className="text-[9px] py-0">
                            {flag}
                          </Badge>
                        ))}
                        {has3D && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-[#1E562A] bg-[#EAF3EB] border border-[#BBDCBF] px-1.5 py-0 uppercase">
                            <Sparkles className="w-2.5 h-2.5" /> 3D AR Model
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Link to 3D AR Experience */}
                  <div className="mt-4 pt-3 border-t border-[#F7F3EC] flex items-center justify-between">
                    <span className="text-[11px] text-[#594B42] uppercase font-bold">
                      {dish.isAvailable ? (
                        <span className="text-[#1E562A]">● In Stock</span>
                      ) : (
                        <span className="text-[#90323D]">● Currently Unavailable</span>
                      )}
                    </span>

                    <Link
                      href={`/r/${restaurantSlug}/d/${dish.slug}`}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[#5E0B15] hover:bg-[#450810] text-[#EDE1CF] text-xs font-bold uppercase tracking-wider transition-colors"
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
      <footer className="border-t border-[#DECDB5] bg-white py-8 mt-12 text-center text-xs text-[#594B42]">
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
        <div className="min-h-screen bg-[#EDE1CF] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#5E0B15] border-t-transparent animate-spin" />
        </div>
      }
    >
      <PublicRestaurantMenuContent />
    </React.Suspense>
  );
}
