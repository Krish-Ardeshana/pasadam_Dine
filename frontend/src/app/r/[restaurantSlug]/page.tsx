'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  UtensilsCrossed,
  Sparkles,
  MapPin,
  Phone,
  ChevronRight,
  AlertTriangle,
  Plus,
  Minus,
  ShoppingBag,
  Clock,
  Search,
} from 'lucide-react';
import { Badge } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Table';
import { api } from '@/lib/api';
import { Dish, PublicMenuResponse } from '@/lib/types';
import { CartProvider, useCart } from '@/context/cart-context';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { OrderStatusModal } from '@/components/cart/OrderStatusModal';

function PublicMenuInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const restaurantSlug = params.restaurantSlug as string;
  const tableParam = searchParams.get('table');

  const [menuData, setMenuData] = useState<PublicMenuResponse | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const {
    items,
    addItem,
    updateQuantity,
    totalItems,
    subtotal,
    setIsCartOpen,
    setTableNumber,
    activeOrder,
  } = useCart();

  // If table was passed via query parameter (e.g. table QR code scan), set it in cart
  useEffect(() => {
    if (tableParam) {
      setTableNumber(tableParam.startsWith('Table') ? tableParam : `Table ${tableParam}`);
    }
  }, [tableParam, setTableNumber]);

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
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E8DEC9] shadow-xl p-8 text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl border border-red-200 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-red-600" />
          </div>
          <h1 className="text-lg font-bold text-[#7A0C1E] uppercase tracking-wider mb-2 font-luxury">
            Menu Unavailable
          </h1>
          <p className="text-xs text-[#6E5D53] mb-6 leading-relaxed">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-[#8B1226] to-[#680514] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:from-[#9E152D] hover:to-[#7A0C1E] transition-all shadow-md"
          >
            Return to AR_DINE
          </Link>
        </div>
      </div>
    );
  }

  const restaurant = menuData?.restaurant;
  const categories = menuData?.categories || [];

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

  const currency = restaurant?.settings?.currency || allDishes[0]?.currency || 'USD';

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C120C] pb-24 selection:bg-[#F59E0B]/30 selection:text-[#7A0C1E]">
      {/* Restaurant Header & Cover */}
      <header className="bg-[#FFFDF9] border-b border-[#E8DEC9] shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {restaurant?.logoUrl ? (
              <img
                src={api.resolveMediaUrl(restaurant.logoUrl)}
                alt={restaurant.name}
                className="w-24 h-24 object-cover rounded-2xl border border-[#E8DEC9] shadow-xs"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-[#8B1226] to-[#680514] text-[#FDE68A] rounded-2xl flex items-center justify-center font-luxury font-black text-4xl shadow-md">
                {restaurant?.name?.[0] || 'P'}
              </div>
            )}

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-black text-[#7A0C1E] uppercase tracking-wide font-luxury">
                  {restaurant?.name || 'AR_DINE Venue'}
                </h1>
                <Badge variant="success">OPEN FOR DINING</Badge>
                {tableParam && (
                  <span className="text-xs font-bold bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/40 px-3 py-0.5 rounded-full uppercase tracking-wider">
                    Table {tableParam}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-[#6E5D53] max-w-2xl mb-4 leading-relaxed">
                {restaurant?.description ||
                  'Pure traditional Sattvic culinary offerings prepared with devotion and spiritual hygiene.'}
              </p>

              {restaurant?.address && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#6E5D53]">
                  {restaurant.address.city && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#B45309]" />
                      {restaurant.address.street ? `${restaurant.address.street}, ` : ''}
                      {restaurant.address.city}
                    </span>
                  )}
                  {restaurant.contactDetails?.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#B45309]" />
                      {restaurant.contactDetails.phone}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Active Order Banner if order exists */}
      {activeOrder && (
        <div className="bg-gradient-to-r from-[#5E0513] via-[#7A0C1E] to-[#5E0513] text-white py-2.5 px-4 sticky top-0 z-40 border-b border-[#680514] shadow-md">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FDE68A] animate-pulse" />
              <span>
                Active Order <strong className="font-mono text-[#FDE68A]">#{activeOrder.orderNumber}</strong>:
              </span>
              <span className="bg-white/20 px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] tracking-wider">
                {activeOrder.status}
              </span>
            </div>
            <button
              onClick={() => setShowStatusModal(true)}
              className="px-3.5 py-1 bg-[#FEF3C7] text-[#7A0C1E] font-bold uppercase text-[11px] rounded-xl hover:bg-[#FDE68A] transition-all cursor-pointer shadow-xs"
            >
              Track Live Order
            </button>
          </div>
        </div>
      )}

      {/* Sticky Category & Search Navigation */}
      <div className="sticky top-0 z-30 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#E8DEC9] shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Category Pills with smooth rounded styling */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto py-1">
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full cursor-pointer shrink-0 transition-all ${
                activeCategory === 'ALL'
                  ? 'bg-gradient-to-r from-[#8B1226] to-[#680514] text-white shadow-sm'
                  : 'bg-[#FAF7F2] text-[#6E5D53] hover:text-[#7A0C1E] hover:bg-[#FEF3C7] border border-[#E8DEC9]'
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
                    ? 'bg-gradient-to-r from-[#8B1226] to-[#680514] text-white shadow-sm'
                    : 'bg-[#FAF7F2] text-[#6E5D53] hover:text-[#7A0C1E] hover:bg-[#FEF3C7] border border-[#E8DEC9]'
                }`}
              >
                {cat.name} ({cat.dishes.length})
              </button>
            ))}
          </div>

          {/* Quick Search with rounded-xl */}
          <div className="w-full md:w-64 relative">
            <input
              type="text"
              placeholder="SEARCH DISHES..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF7F2] rounded-xl border border-[#E8DEC9] focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] uppercase placeholder-[#8C7A6F] text-[#1C120C]"
            />
            <Search className="w-3.5 h-3.5 text-[#8C7A6F] absolute left-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Menu Grid */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
          </div>
        ) : filteredDishes.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E8DEC9] p-12 text-center shadow-sm">
            <UtensilsCrossed className="w-8 h-8 text-[#B45309] mx-auto mb-2" />
            <p className="text-xs font-bold uppercase text-[#6E5D53]">
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

              const cartItem = items.find((i) => i.dish._id === dish._id);
              const quantityInCart = cartItem ? cartItem.quantity : 0;

              return (
                <div
                  key={dish._id}
                  className="bg-white rounded-2xl border border-[#E8DEC9] hover:border-[#F59E0B]/50 transition-all p-5 flex flex-col justify-between shadow-sm hover:shadow-md"
                >
                  <div className="flex gap-4">
                    {/* Dish Thumbnail */}
                    <div className="w-24 h-24 bg-[#FAF7F2] rounded-xl border border-[#E8DEC9] shrink-0 flex items-center justify-center overflow-hidden relative shadow-2xs">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={dish.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UtensilsCrossed className="w-8 h-8 text-[#E8DEC9]" />
                      )}
                      {has3D && (
                        <span className="absolute top-1.5 left-1.5 bg-gradient-to-r from-[#8B1226] to-[#680514] text-[#FDE68A] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
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
                        <span className="font-mono text-sm font-black text-[#7A0C1E] shrink-0">
                          {dish.currency} {dish.price.toFixed(2)}
                        </span>
                      </div>

                      <p className="text-xs text-[#6E5D53] line-clamp-2 mb-2.5 leading-relaxed">
                        {dish.description || 'Authentic traditional recipe.'}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {dish.dietaryFlags?.map((flag) => (
                          <Badge key={flag} variant="dietary" className="text-[9px] py-0 px-2 rounded-full">
                            {flag}
                          </Badge>
                        ))}
                        {has3D && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#92400E] bg-[#FEF3C7] border border-[#F59E0B]/30 px-2 py-0.5 rounded-full uppercase">
                            <Sparkles className="w-2.5 h-2.5 text-[#F59E0B]" /> 3D AR Model
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Link to 3D AR Experience and Add to Cart */}
                  <div className="mt-4 pt-3 border-t border-[#E8DEC9] flex items-center justify-between gap-2">
                    <Link
                      href={`/r/${restaurantSlug}/d/${dish.slug}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#FEF3C7] text-[#7A0C1E] hover:text-[#5E0513] text-xs font-bold uppercase tracking-wider rounded-xl transition-all border border-[#E8DEC9]"
                    >
                      <span>{has3D ? '3D AR View' : 'Details'}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#F59E0B]" />
                    </Link>

                    {dish.isAvailable ? (
                      quantityInCart > 0 ? (
                        <div className="flex items-center border border-[#E8DEC9] bg-[#FAF7F2] rounded-xl overflow-hidden shadow-2xs">
                          <button
                            type="button"
                            onClick={() => updateQuantity(dish._id, quantityInCart - 1)}
                            className="p-1.5 hover:bg-[#7A0C1E] hover:text-white text-[#7A0C1E] transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold font-mono text-[#7A0C1E]">
                            {quantityInCart}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(dish._id, quantityInCart + 1)}
                            className="p-1.5 hover:bg-[#7A0C1E] hover:text-white text-[#7A0C1E] transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addItem(dish, 1)}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[#8B1226] to-[#680514] hover:from-[#9E152D] hover:to-[#7A0C1E] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer hover:scale-102"
                        >
                          <Plus className="w-3.5 h-3.5 text-[#FDE68A]" />
                          <span>Add</span>
                        </button>
                      )
                    ) : (
                      <span className="text-[11px] font-bold text-[#8C7A6F] uppercase">
                        Sold Out
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Cart Trigger Bar */}
      {totalItems > 0 && (
        <aside aria-label="Cart summary" className="fixed bottom-4 left-4 right-4 z-40 max-w-xl mx-auto">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-gradient-to-r from-[#8B1226] to-[#680514] hover:from-[#9E152D] hover:to-[#7A0C1E] text-white p-4 rounded-2xl flex items-center justify-between border border-amber-300/40 shadow-2xl transition-all cursor-pointer hover:scale-101"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-sm text-[#FDE68A]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-black uppercase tracking-wider">
                  {totalItems} {totalItems === 1 ? 'Offering' : 'Offerings'} in Cart
                </p>
                <p className="text-[11px] text-[#FEF3C7] font-medium">Tap to review & send to kitchen</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-black text-[#FDE68A]">
                {currency} {subtotal.toFixed(2)}
              </span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
        </aside>
      )}

      {/* Cart Drawer & Order Status Modal */}
      <CartDrawer restaurantSlug={restaurantSlug} currency={currency} />
      {showStatusModal && <OrderStatusModal restaurantSlug={restaurantSlug} />}

      {/* Footer */}
      <footer className="border-t border-[#E8DEC9] bg-[#FFFDF9] py-8 mt-12 text-center text-xs text-[#6E5D53]">
        <div className="max-w-5xl mx-auto px-4 space-y-2">
          <p className="font-black text-[#7A0C1E] uppercase tracking-widest font-luxury">
            AR_DINE — AR SMART RESTAURANT SYSTEM
          </p>
          <p className="text-[11px] text-[#8C7A6F]">
            Powered by AR_DINE centralized multi-tenant restaurant cloud.
          </p>
        </div>
      </footer>
    </div>
  );
}

function PublicMenuContainer() {
  const params = useParams();
  const restaurantSlug = params.restaurantSlug as string;

  return (
    <CartProvider restaurantSlug={restaurantSlug}>
      <PublicMenuInner />
    </CartProvider>
  );
}

export default function PublicRestaurantMenuPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#7A0C1E] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PublicMenuContainer />
    </React.Suspense>
  );
}
