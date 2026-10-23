'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UtensilsCrossed,
  Layers,
  FileImage,
  QrCode,
  Users,
  ExternalLink,
  Plus,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  ChefHat,
  AlertCircle,
  Building2,
  DollarSign,
  TrendingUp,
  Receipt,
  BellRing,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Table';
import { api } from '@/lib/api';
import {
  Category,
  Dish,
  MediaAsset,
  QrCode as QrCodeType,
  RestaurantApprovalStatus,
  Order,
  OrderStatus,
  OrderPaymentStatus,
} from '@/lib/types';

export default function DashboardOverviewPage() {
  const { currentRestaurant, user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [qrCodes, setQrCodes] = useState<QrCodeType[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      if (!currentRestaurant?._id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const [catRes, dishRes, mediaRes, qrRes, ordersRes] = await Promise.all([
          api.categories.list(currentRestaurant._id).catch(() => []),
          api.dishes.list(currentRestaurant._id, { limit: 100 }).catch(() => ({ data: [] })),
          api.media.list(currentRestaurant._id).catch(() => []),
          api.qr.list(currentRestaurant._id).catch(() => []),
          api.orders.listRestaurantOrders(currentRestaurant._id, { limit: 50 }).catch(() => ({ data: [] })),
        ]);

        setCategories(catRes || []);
        setDishes(dishRes.data || []);
        setMedia(mediaRes || []);
        setQrCodes(qrRes || []);
        setOrders(ordersRes.data || []);
      } catch (err) {
        console.error('Failed to load restaurant dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [authLoading, isAuthenticated, currentRestaurant, router]);

  // If user has no assigned restaurant, show honest setup / access pending state (PART B.6)
  if (!authLoading && !currentRestaurant) {
    return (
      <DashboardShell>
        <div className="bg-white rounded-2xl border border-[#E0DACF] p-8 md:p-12 text-center max-w-2xl mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#FEF6E9] border border-[#F4DCB5] text-[#9A6216] flex items-center justify-center mx-auto mb-5">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-[#23201C] uppercase tracking-wider mb-2">
            Restaurant Association Pending
          </h1>
          <p className="text-xs text-[#6D675E] leading-relaxed max-w-md mx-auto mb-6">
            Your account ({user?.email}) is authenticated, but no active restaurant venue is currently
            assigned to your profile. Please contact the platform administrator to assign your restaurant,
            or check back once your registration has been approved.
          </p>
          <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E0DACF] text-xs text-[#6D675E] text-left mb-6">
            <div className="font-bold text-[#23201C] mb-1">Account Diagnostic:</div>
            <div>• Name: {user?.name}</div>
            <div>• Role: {user?.role}</div>
            <div>• Assigned Venues: {user?.restaurantAssignments?.length || 0}</div>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#1B4332] text-white px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#143326] transition shadow-xs"
          >
            <span>Return to Cover Page</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </DashboardShell>
    );
  }

  // Actual Data Calculations (PART C.1)
  const totalDishes = dishes.length;
  const activeDishes = dishes.filter((d) => d.isAvailable).length;
  const publishedDishes = dishes.filter((d) => d.isPublished).length;
  const dishesWith3D = dishes.filter((d) => !!d.model3dUrl).length;

  // Real Order Pipeline Metrics
  const pendingOrders = orders.filter((o) => o.status === OrderStatus.PENDING).length;
  const preparingOrders = orders.filter(
    (o) => o.status === OrderStatus.PREPARING || o.status === OrderStatus.ACCEPTED,
  ).length;
  const readyOrServedOrders = orders.filter(
    (o) => o.status === OrderStatus.READY || o.status === OrderStatus.SERVED,
  ).length;

  // Real Today's Sales Calculation from paid orders placed today (calculated on client)
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [todayPaidCount, setTodayPaidCount] = useState(0);

  useEffect(() => {
    if (orders.length === 0) {
      setTodayRevenue(0);
      setTodayPaidCount(0);
      return;
    }
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayPaidOrders = orders.filter((o) => {
      const orderDate = new Date(o.createdAt);
      const isPaid = o.paymentStatus === OrderPaymentStatus.PAID;
      return isPaid && orderDate >= todayStart;
    });

    const rev = todayPaidOrders.reduce(
      (sum, o) => sum + (o.pricing?.total || o.totalAmount || 0),
      0,
    );
    setTodayRevenue(rev);
    setTodayPaidCount(todayPaidOrders.length);
  }, [orders]);

  const currencySymbol = currentRestaurant?.settings?.currency === 'INR' ? '₹' : '$';

  return (
    <DashboardShell>
      {/* 1. RESTAURANT STATUS BANNER */}
      <div className="bg-white rounded-2xl border border-[#E8DEC9] p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-[#7A0C1E] uppercase tracking-wider font-luxury">
              {currentRestaurant?.name}
            </h1>
            {currentRestaurant?.approvalStatus === RestaurantApprovalStatus.APPROVED ? (
              <Badge variant="success">APPROVED & ACTIVE</Badge>
            ) : (
              <Badge variant="warning">{currentRestaurant?.approvalStatus || 'PENDING'}</Badge>
            )}
            {currentRestaurant?.isActive ? (
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E562A] bg-[#EBF7EE] border border-[#BCE1C7] px-2.5 py-0.5 rounded-full">
                Live For Ordering
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E5D53] bg-[#FAF7F2] border border-[#E8DEC9] px-2.5 py-0.5 rounded-full">
                Offline
              </span>
            )}
          </div>
          <p className="text-xs text-[#6E5D53] max-w-2xl leading-relaxed">
            {currentRestaurant?.description || 'Digital AR smart restaurant menu and order management portal.'}
          </p>
        </div>

        {currentRestaurant?.slug && (
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href={`/r/${currentRestaurant.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8B1226] to-[#680514] hover:from-[#9E152D] hover:to-[#7A0C1E] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all hover:scale-101"
            >
              <span>View Customer Menu</span>
              <ExternalLink className="w-4 h-4 text-[#FDE68A]" />
            </Link>
          </div>
        )}
      </div>

      {/* 2. REAL-TIME ORDER & SALES METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Orders */}
        <Card className="border border-[#E8DEC9] bg-white rounded-2xl shadow-sm hover:border-[#F59E0B]/50 transition-all p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6E5D53] uppercase tracking-wider">
              Incoming Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] flex items-center justify-center text-[#B45309]">
              <BellRing className="w-4 h-4" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-black text-[#7A0C1E]">
              {pendingOrders}{' '}
              <span className="text-xs font-normal text-[#6E5D53]">pending review</span>
            </div>
          )}
          <Link
            href="/dashboard/orders"
            className="text-[11px] font-bold text-[#B45309] hover:text-[#7A0C1E] uppercase tracking-wider block mt-2"
          >
            Live Kitchen Display (KDS) →
          </Link>
        </Card>

        {/* Preparing in Kitchen */}
        <Card className="border border-[#E8DEC9] bg-white rounded-2xl shadow-sm hover:border-[#F59E0B]/50 transition-all p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6E5D53] uppercase tracking-wider">
              Preparing in Kitchen
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] flex items-center justify-center text-[#7A0C1E]">
              <ChefHat className="w-4 h-4" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-black text-[#1C120C]">{preparingOrders}</div>
          )}
          <span className="text-[11px] text-[#6E5D53] block mt-2">Active kitchen orders</span>
        </Card>

        {/* Ready / Served */}
        <Card className="border border-[#E8DEC9] bg-white rounded-2xl shadow-sm hover:border-[#F59E0B]/50 transition-all p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6E5D53] uppercase tracking-wider">
              Ready or Served
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-black text-[#1C120C]">{readyOrServedOrders}</div>
          )}
          <span className="text-[11px] text-[#6E5D53] block mt-2">Completed fulfillment</span>
        </Card>

        {/* Today's Sales */}
        <Card className="border border-[#E8DEC9] bg-white rounded-2xl shadow-sm hover:border-[#F59E0B]/50 transition-all p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6E5D53] uppercase tracking-wider">
              Today&rsquo;s Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] flex items-center justify-center text-[#B45309]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <div className="text-2xl font-black text-[#7A0C1E]">
              {currencySymbol}
              {todayRevenue.toFixed(2)}
            </div>
          )}
          <span className="text-[11px] text-[#6E5D53] block mt-2">
            {todayPaidCount > 0
              ? `From ${todayPaidCount} verified paid orders today`
              : 'No completed sales recorded today'}
          </span>
        </Card>
      </div>

      {/* 3. MENU & CATALOG METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Categories */}
        <Card className="border border-[#E8DEC9] bg-white rounded-2xl shadow-sm hover:border-[#F59E0B]/50 transition-all p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6E5D53] uppercase tracking-wider">
              Menu Categories
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] flex items-center justify-center text-[#B45309]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-black text-[#1C120C]">{categories.length}</div>
          )}
          <Link
            href="/dashboard/categories"
            className="text-[11px] font-bold text-[#B45309] hover:text-[#7A0C1E] uppercase tracking-wider block mt-2"
          >
            Manage Categories →
          </Link>
        </Card>

        {/* Total Dishes */}
        <Card className="border border-[#E8DEC9] bg-white rounded-2xl shadow-sm hover:border-[#F59E0B]/50 transition-all p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6E5D53] uppercase tracking-wider">
              Total Menu Dishes
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] flex items-center justify-center text-[#7A0C1E]">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-black text-[#1C120C]">
              {totalDishes}{' '}
              <span className="text-xs font-normal text-[#6E5D53]">({activeDishes} available)</span>
            </div>
          )}
          <Link
            href="/dashboard/dishes"
            className="text-[11px] font-bold text-[#B45309] hover:text-[#7A0C1E] uppercase tracking-wider block mt-2"
          >
            Manage Dishes →
          </Link>
        </Card>

        {/* 3D AR Enabled */}
        <Card className="border border-[#E8DEC9] bg-white rounded-2xl shadow-sm hover:border-[#F59E0B]/50 transition-all p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6E5D53] uppercase tracking-wider">
              3D AR Dishes
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] flex items-center justify-center text-[#B45309]">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-black text-[#7A0C1E]">
              {dishesWith3D}{' '}
              <span className="text-xs font-normal text-[#6E5D53]">of {totalDishes}</span>
            </div>
          )}
          <span className="text-[11px] text-[#6E5D53] block mt-2">Interactive 3D models assigned</span>
        </Card>

        {/* Dine-In QR Codes */}
        <Card className="border border-[#E8DEC9] bg-white rounded-2xl shadow-sm hover:border-[#F59E0B]/50 transition-all p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6E5D53] uppercase tracking-wider">
              Dine-In QR Codes
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] flex items-center justify-center text-[#7A0C1E]">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-black text-[#1C120C]">{qrCodes.length}</div>
          )}
          <Link
            href="/dashboard/qr"
            className="text-[11px] font-bold text-[#B45309] hover:text-[#7A0C1E] uppercase tracking-wider block mt-2"
          >
            Generate QR Codes →
          </Link>
        </Card>
      </div>

      {/* 4. RECENT ORDERS & OPERATIONAL MODULES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Incoming Orders */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E8DEC9] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#E8DEC9] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#7A0C1E]" />
                <h2 className="text-xs font-black uppercase tracking-wider text-[#7A0C1E]">
                  Recent Orders
                </h2>
              </div>
              <Link
                href="/dashboard/orders"
                className="text-xs font-bold uppercase tracking-wider text-[#B45309] hover:text-[#7A0C1E]"
              >
                View All Orders ({orders.length}) →
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-3 py-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#6E5D53]">
                <ShoppingBag className="w-8 h-8 text-[#8C7A6F] mx-auto mb-2 opacity-60" />
                <p className="font-bold uppercase tracking-wider text-[#7A0C1E]">No orders recorded yet</p>
                <p className="text-[11px] text-[#6E5D53] mt-1">
                  Orders placed by customers through the table QR menu will appear here in real time.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#E8DEC9] overflow-x-auto">
                {orders.slice(0, 5).map((ord) => (
                  <div key={ord._id} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="font-bold text-[#1C120C] flex items-center gap-2">
                        <span className="font-mono">{ord.orderNumber}</span>
                        {ord.tableNumber && (
                          <span className="text-[10px] bg-[#FEF3C7] text-[#92400E] font-semibold px-2 py-0.5 rounded-full border border-[#F59E0B]/30">
                            Table {ord.tableNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#6E5D53] mt-0.5">
                        {ord.items?.length || 0} items • {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold text-[#1C120C]">
                          {currencySymbol}
                          {((ord.pricing?.total ?? ord.totalAmount) || 0).toFixed(2)}
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            ord.paymentStatus === OrderPaymentStatus.PAID
                              ? 'bg-[#EBF7EE] text-[#1E562A] border border-[#BCE1C7]'
                              : 'bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/30'
                          }`}
                        >
                          {ord.paymentStatus}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          ord.status === OrderStatus.PENDING
                            ? 'bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]/30'
                            : ord.status === OrderStatus.PREPARING
                              ? 'bg-[#EEF4F8] text-[#255C82] border border-[#C6DCED]'
                              : ord.status === OrderStatus.READY
                                ? 'bg-[#EBF7EE] text-[#1E562A] border border-[#BCE1C7]'
                                : 'bg-[#FAF7F2] text-[#6E5D53] border border-[#E8DEC9]'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Operational Modules */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E8DEC9] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-[#7A0C1E] border-b border-[#E8DEC9] pb-3 mb-4">
              Management Modules
            </h2>
            <div className="space-y-2.5">
              <Link
                href="/dashboard/dishes"
                className="flex items-center justify-between p-3.5 bg-[#FFFDF9] rounded-xl border border-[#E8DEC9] hover:border-[#F59E0B] text-xs font-bold uppercase tracking-wider text-[#1C120C] hover:bg-[#FAF7F2] transition-all shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#FEF3C7] text-[#B45309] flex items-center justify-center">
                    <UtensilsCrossed className="w-3.5 h-3.5" />
                  </div>
                  <span>Dishes & 3D Model Assets</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8C7A6F]" />
              </Link>

              <Link
                href="/dashboard/categories"
                className="flex items-center justify-between p-3.5 bg-[#FFFDF9] rounded-xl border border-[#E8DEC9] hover:border-[#F59E0B] text-xs font-bold uppercase tracking-wider text-[#1C120C] hover:bg-[#FAF7F2] transition-all shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#FEF3C7] text-[#B45309] flex items-center justify-center">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <span>Menu Categories & Ordering</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8C7A6F]" />
              </Link>

              <Link
                href="/dashboard/qr"
                className="flex items-center justify-between p-3.5 bg-[#FFFDF9] rounded-xl border border-[#E8DEC9] hover:border-[#F59E0B] text-xs font-bold uppercase tracking-wider text-[#1C120C] hover:bg-[#FAF7F2] transition-all shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#FAF7F2] text-[#7A0C1E] flex items-center justify-center">
                    <QrCode className="w-3.5 h-3.5" />
                  </div>
                  <span>Generate & Print Table QR Codes</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8C7A6F]" />
              </Link>

              <Link
                href="/dashboard/staff"
                className="flex items-center justify-between p-3.5 bg-[#FFFDF9] rounded-xl border border-[#E8DEC9] hover:border-[#F59E0B] text-xs font-bold uppercase tracking-wider text-[#1C120C] hover:bg-[#FAF7F2] transition-all shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#FAF7F2] text-[#6E5D53] flex items-center justify-center">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <span>Staff Roles & Kitchen Access</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8C7A6F]" />
              </Link>

              <Link
                href="/dashboard/settings"
                className="flex items-center justify-between p-3.5 bg-[#FFFDF9] rounded-xl border border-[#E8DEC9] hover:border-[#F59E0B] text-xs font-bold uppercase tracking-wider text-[#1C120C] hover:bg-[#FAF7F2] transition-all shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#FAF7F2] text-[#7A0C1E] flex items-center justify-center">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Restaurant Profile & Settings</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#8C7A6F]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
