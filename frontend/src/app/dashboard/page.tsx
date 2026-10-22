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
    (o) =>
      o.status === OrderStatus.READY ||
      o.status === OrderStatus.SERVED ||
      o.status === OrderStatus.DELIVERED,
  ).length;

  // Real Today's Sales Calculation from paid orders placed today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayPaidOrders = orders.filter((o) => {
    const orderDate = new Date(o.createdAt);
    const isPaid = o.paymentStatus === OrderPaymentStatus.PAID;
    return isPaid && orderDate >= todayStart;
  });

  const todayRevenue = todayPaidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const currencySymbol = currentRestaurant?.settings?.currency === 'INR' ? '₹' : '$';

  return (
    <DashboardShell>
      {/* 1. RESTAURANT STATUS BANNER */}
      <div className="bg-[#FAF8F5] rounded-2xl border border-[#E0DACF] p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs">
        <div>
          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-[#23201C] uppercase tracking-wider">
              {currentRestaurant?.name}
            </h1>
            {currentRestaurant?.approvalStatus === RestaurantApprovalStatus.APPROVED ? (
              <Badge variant="success">APPROVED & ACTIVE</Badge>
            ) : (
              <Badge variant="warning">{currentRestaurant?.approvalStatus || 'PENDING'}</Badge>
            )}
            {currentRestaurant?.isActive ? (
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                Live For Ordering
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-600 bg-stone-200 border border-stone-300 px-2.5 py-0.5 rounded-full">
                Offline
              </span>
            )}
          </div>
          <p className="text-xs text-[#6D675E] max-w-2xl leading-relaxed">
            {currentRestaurant?.description || 'Digital AR smart restaurant menu and order management portal.'}
          </p>
        </div>

        {currentRestaurant?.slug && (
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href={`/r/${currentRestaurant.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 bg-[#1B4332] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#143326] transition-colors rounded-xl shadow-xs"
            >
              <span>View Customer Menu</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* 2. REAL-TIME ORDER & SALES METRICS (PART C.1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Orders */}
        <Card className="border-l-4 border-l-[#D97706] bg-[#FAF8F5]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6D675E] uppercase tracking-wider">
              Incoming Orders
            </span>
            <BellRing className="w-5 h-5 text-[#D97706]" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-black text-[#23201C]">
              {pendingOrders}{' '}
              <span className="text-xs font-normal text-[#6D675E]">pending review</span>
            </div>
          )}
          <Link
            href="/dashboard/orders"
            className="text-[11px] font-bold text-[#1B4332] hover:text-[#143326] uppercase tracking-wider block mt-2"
          >
            Live Kitchen Display (KDS) →
          </Link>
        </Card>

        {/* Preparing in Kitchen */}
        <Card className="border-l-4 border-l-[#2563EB] bg-[#FAF8F5]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6D675E] uppercase tracking-wider">
              Preparing in Kitchen
            </span>
            <ChefHat className="w-5 h-5 text-[#2563EB]" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-black text-[#23201C]">{preparingOrders}</div>
          )}
          <span className="text-[11px] text-[#6D675E] block mt-2">Active kitchen orders</span>
        </Card>

        {/* Ready / Served */}
        <Card className="border-l-4 border-l-[#16A34A] bg-[#FAF8F5]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6D675E] uppercase tracking-wider">
              Ready or Served
            </span>
            <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-black text-[#23201C]">{readyOrServedOrders}</div>
          )}
          <span className="text-[11px] text-[#6D675E] block mt-2">Completed fulfillment</span>
        </Card>

        {/* Today's Sales (Real Payment Data Only) */}
        <Card className="border-l-4 border-l-[#1B4332] bg-[#FAF8F5]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6D675E] uppercase tracking-wider">
              Today&rsquo;s Revenue
            </span>
            <DollarSign className="w-5 h-5 text-[#1B4332]" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <div className="text-2xl font-black text-[#1B4332]">
              {currencySymbol}
              {todayRevenue.toFixed(2)}
            </div>
          )}
          <span className="text-[11px] text-[#6D675E] block mt-2">
            {todayPaidOrders.length > 0
              ? `From ${todayPaidOrders.length} verified paid orders today`
              : 'No completed sales recorded today'}
          </span>
        </Card>
      </div>

      {/* 3. MENU & CATALOG METRICS (PART C.1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Categories */}
        <Card className="border-l-4 border-l-[#829582] bg-[#FAF8F5]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6D675E] uppercase tracking-wider">
              Menu Categories
            </span>
            <Layers className="w-5 h-5 text-[#829582]" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-black text-[#23201C]">{categories.length}</div>
          )}
          <Link
            href="/dashboard/categories"
            className="text-[11px] font-bold text-[#DE6C3A] hover:text-[#C85929] uppercase tracking-wider block mt-2"
          >
            Manage Categories →
          </Link>
        </Card>

        {/* Total Dishes */}
        <Card className="border-l-4 border-l-[#DE6C3A] bg-[#FAF8F5]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6D675E] uppercase tracking-wider">
              Total Menu Dishes
            </span>
            <UtensilsCrossed className="w-5 h-5 text-[#DE6C3A]" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-black text-[#23201C]">
              {totalDishes}{' '}
              <span className="text-xs font-normal text-[#6D675E]">({activeDishes} available)</span>
            </div>
          )}
          <Link
            href="/dashboard/dishes"
            className="text-[11px] font-bold text-[#DE6C3A] hover:text-[#C85929] uppercase tracking-wider block mt-2"
          >
            Manage Dishes →
          </Link>
        </Card>

        {/* 3D AR Enabled */}
        <Card className="border-l-4 border-l-[#5F735F] bg-[#FAF8F5]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6D675E] uppercase tracking-wider">
              3D AR Dishes
            </span>
            <Sparkles className="w-5 h-5 text-[#5F735F]" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-black text-[#5F735F]">
              {dishesWith3D}{' '}
              <span className="text-xs font-normal text-[#6D675E]">of {totalDishes}</span>
            </div>
          )}
          <span className="text-[11px] text-[#6D675E] block mt-2">Interactive 3D models assigned</span>
        </Card>

        {/* Dine-In QR Codes */}
        <Card className="border-l-4 border-l-[#B57E2F] bg-[#FAF8F5]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6D675E] uppercase tracking-wider">
              Dine-In QR Codes
            </span>
            <QrCode className="w-5 h-5 text-[#B57E2F]" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-black text-[#B57E2F]">{qrCodes.length}</div>
          )}
          <Link
            href="/dashboard/qr"
            className="text-[11px] font-bold text-[#DE6C3A] hover:text-[#C85929] uppercase tracking-wider block mt-2"
          >
            Generate QR Codes →
          </Link>
        </Card>
      </div>

      {/* 4. RECENT ORDERS (PART C.1) & MENU DISHES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Incoming Orders (Real backend orders) */}
        <div className="lg:col-span-7 bg-[#FAF8F5] rounded-2xl border border-[#E0DACF] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#E0DACF] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#1B4332]" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#23201C]">
                  Recent Orders
                </h2>
              </div>
              <Link
                href="/dashboard/orders"
                className="text-xs font-bold uppercase tracking-wider text-[#1B4332] hover:underline"
              >
                View All Orders ({orders.length}) →
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-3 py-2">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#6D675E]">
                <ShoppingBag className="w-8 h-8 text-[#A69C8E] mx-auto mb-2 opacity-60" />
                <p className="font-semibold uppercase tracking-wider">No orders recorded yet</p>
                <p className="text-[11px] text-[#A69C8E] mt-1">
                  Orders placed by customers through the table QR menu will appear here in real time.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#ECE6DC] overflow-x-auto">
                {orders.slice(0, 5).map((ord) => (
                  <div key={ord._id} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="font-bold text-[#23201C] flex items-center gap-2">
                        <span>{ord.orderNumber}</span>
                        {ord.tableNumber && (
                          <span className="text-[10px] bg-[#EAF0E9] text-[#2B522C] font-semibold px-2 py-0.5 rounded-md">
                            Table {ord.tableNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#6D675E] mt-0.5">
                        {ord.items?.length || 0} items • {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold text-[#23201C]">
                          {currencySymbol}
                          {(ord.totalAmount || 0).toFixed(2)}
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            ord.paymentStatus === OrderPaymentStatus.PAID
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.paymentStatus}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                          ord.status === OrderStatus.PENDING
                            ? 'bg-amber-100 text-amber-800'
                            : ord.status === OrderStatus.PREPARING
                              ? 'bg-blue-100 text-blue-800'
                              : ord.status === OrderStatus.READY
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-200 text-stone-700'
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

        {/* Right: Quick Operational Links (PART C.2 - C.7) */}
        <div className="lg:col-span-5 bg-[#FAF8F5] rounded-2xl border border-[#E0DACF] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#23201C] border-b border-[#E0DACF] pb-3 mb-4">
              Management Modules
            </h2>
            <div className="space-y-2.5">
              <Link
                href="/dashboard/dishes"
                className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-[#E0DACF] hover:border-[#1B4332] text-xs font-bold uppercase tracking-wider text-[#23201C] transition-all shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <UtensilsCrossed className="w-4 h-4 text-[#DE6C3A]" />
                  <span>Dishes & 3D Model Assets</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#A69C8E]" />
              </Link>

              <Link
                href="/dashboard/categories"
                className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-[#E0DACF] hover:border-[#1B4332] text-xs font-bold uppercase tracking-wider text-[#23201C] transition-all shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 text-[#829582]" />
                  <span>Menu Categories & Ordering</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#A69C8E]" />
              </Link>

              <Link
                href="/dashboard/qr"
                className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-[#E0DACF] hover:border-[#1B4332] text-xs font-bold uppercase tracking-wider text-[#23201C] transition-all shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <QrCode className="w-4 h-4 text-[#B57E2F]" />
                  <span>Generate & Print Table QR Codes</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#A69C8E]" />
              </Link>

              <Link
                href="/dashboard/staff"
                className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-[#E0DACF] hover:border-[#1B4332] text-xs font-bold uppercase tracking-wider text-[#23201C] transition-all shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-[#5F735F]" />
                  <span>Staff Roles & Kitchen Access</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#A69C8E]" />
              </Link>

              <Link
                href="/dashboard/settings"
                className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-[#E0DACF] hover:border-[#1B4332] text-xs font-bold uppercase tracking-wider text-[#23201C] transition-all shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-[#2D6A4F]" />
                  <span>Restaurant Profile & Settings</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#A69C8E]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
