'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Box,
  Layers,
  UtensilsCrossed,
  Activity,
  SlidersHorizontal,
  IndianRupee,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Table';
import { api } from '@/lib/api';
import { AdminOverviewStats, Restaurant, RestaurantApprovalStatus, User } from '@/lib/types';

export default function AdminDashboardPage() {
  const { isSuperAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isSuperAdmin) {
      router.push('/dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [restRes, usersRes, statsRes] = await Promise.all([
          api.restaurants.list({ limit: 100 }),
          api.users.list({ limit: 100 }),
          api.restaurants.getOverviewStats().catch((err) => {
            console.warn('Overview stats call error (will use fallback aggregation):', err);
            return null;
          }),
        ]);
        setRestaurants(restRes.data || []);
        setUsers(usersRes.data || []);
        setStats(statsRes);
      } catch (err) {
        console.error('Failed to load admin metrics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isSuperAdmin) {
      fetchData();
    }
  }, [authLoading, isSuperAdmin, router]);

  const totalRestaurants = stats?.restaurants.total ?? restaurants.length;
  const activeRestaurants = stats?.restaurants.active ?? restaurants.filter(
    (r) => r.approvalStatus === RestaurantApprovalStatus.APPROVED && r.isActive,
  ).length;
  const pendingApprovals = stats?.restaurants.pending ?? restaurants.filter(
    (r) => r.approvalStatus === RestaurantApprovalStatus.PENDING,
  ).length;
  const totalUsers = stats?.users.total ?? users.length;

  const totalCategories = stats?.menu.totalCategories ?? 0;
  const totalDishes = stats?.menu.totalDishes ?? 0;
  const dishesWith3d = stats?.menu.dishesWith3d ?? 0;
  const dishesWithout3d = stats?.menu.dishesWithout3d ?? 0;

  const totalOrders = stats?.orders.totalOrders ?? 0;
  const completedOrders = stats?.orders.completedOrders ?? 0;
  const totalRevenue = stats?.orders.totalRevenue ?? 0;

  return (
    <DashboardShell>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DEC9] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#7A0C1E] uppercase tracking-wider font-luxury">
            Platform Super Admin Operations
          </h1>
          <p className="text-xs text-[#6E5D53] uppercase tracking-wider mt-0.5">
            Real-time multi-tenant telemetry, restaurant approvals, and 3D catalog status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/activity">
            <Button variant="outline" size="sm">
              <Activity className="w-3.5 h-3.5 mr-1.5 text-[#B45309]" />
              Activity Audit
            </Button>
          </Link>
          <Link href="/admin/restaurants">
            <Button variant="primary" size="sm">
              Manage Restaurants <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Row 1: Restaurant & Platform Scope */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-[#E8DEC9] bg-white rounded-2xl shadow-sm hover:border-[#F59E0B]/50 transition-all p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black text-[#6E5D53] uppercase tracking-wider">
              Total Restaurants
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] text-[#7A0C1E] flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <div className="text-2xl font-black text-[#7A0C1E] font-mono">{totalRestaurants}</div>
          )}
          <p className="text-[10px] text-[#8C7A6F] mt-1 font-bold uppercase tracking-wider">Registered platform tenants</p>
        </Card>

        <Card className="border border-[#E8DEC9] bg-white rounded-2xl shadow-sm hover:border-[#F59E0B]/50 transition-all p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black text-[#6E5D53] uppercase tracking-wider">
              Active Dining Venues
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <div className="text-2xl font-black text-emerald-700 font-mono">{activeRestaurants}</div>
          )}
          <p className="text-[10px] text-[#8C7A6F] mt-1 font-bold uppercase tracking-wider">Approved & serving customers</p>
        </Card>

        <Card className="border border-[#E8DEC9] bg-white rounded-2xl shadow-sm hover:border-[#F59E0B]/50 transition-all p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black text-[#6E5D53] uppercase tracking-wider">
              Pending Approvals
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#92400E] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <div className="text-2xl font-black text-[#B45309] font-mono">{pendingApprovals}</div>
          )}
          <p className="text-[10px] text-[#8C7A6F] mt-1 font-bold uppercase tracking-wider">Requires Super Admin action</p>
        </Card>

        <Card className="border border-[#E8DEC9] bg-white rounded-2xl shadow-sm hover:border-[#F59E0B]/50 transition-all p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black text-[#6E5D53] uppercase tracking-wider">
              Platform Accounts
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] text-[#7A0C1E] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <div className="text-2xl font-black text-[#1C120C] font-mono">{totalUsers}</div>
          )}
          <p className="text-[10px] text-[#8C7A6F] mt-1 font-bold uppercase tracking-wider">Owners, managers & staff</p>
        </Card>
      </div>

      {/* Row 2: Menu, 3D Models & Financial Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-[#E8DEC9] bg-white rounded-2xl shadow-sm hover:border-[#F59E0B]/50 transition-all p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black text-[#6E5D53] uppercase tracking-wider">
              Menu Categories
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#92400E] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <div className="text-2xl font-black text-[#1C120C] font-mono">{totalCategories}</div>
          )}
          <p className="text-[10px] text-[#8C7A6F] mt-1 font-bold uppercase tracking-wider">Across all dining menus</p>
        </Card>

        <Card className="border border-[#E8DEC9] bg-white rounded-2xl shadow-sm hover:border-[#F59E0B]/50 transition-all p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black text-[#6E5D53] uppercase tracking-wider">
              Total Menu Dishes
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] text-[#7A0C1E] flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <div className="text-2xl font-black text-[#1C120C] font-mono">{totalDishes}</div>
          )}
          <p className="text-[10px] text-[#8C7A6F] mt-1 font-bold uppercase tracking-wider">Published culinary items</p>
        </Card>

        <Card className="border border-[#E8DEC9] bg-white rounded-2xl shadow-sm hover:border-[#F59E0B]/50 transition-all p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black text-[#6E5D53] uppercase tracking-wider">
              3D AR Enabled Dishes
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#92400E] flex items-center justify-center">
              <Box className="w-4 h-4" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <div className="text-2xl font-black text-[#7A0C1E] font-mono">{dishesWith3d}</div>
          )}
          <p className="text-[10px] text-[#8C7A6F] mt-1 font-bold uppercase tracking-wider">
            {dishesWithout3d} dishes without 3D models
          </p>
        </Card>

        <Card className="border border-[#E8DEC9] bg-white rounded-2xl shadow-sm hover:border-[#F59E0B]/50 transition-all p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black text-[#6E5D53] uppercase tracking-wider">
              Verified Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#92400E] flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <div className="text-2xl font-black text-[#7A0C1E] font-mono">
              ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          )}
          <p className="text-[10px] text-[#8C7A6F] mt-1 font-bold uppercase tracking-wider">
            {totalOrders} orders ({completedOrders} completed)
          </p>
        </Card>
      </div>

      {/* Priority Verification Queue */}
      <div className="bg-white rounded-2xl border border-[#E8DEC9] p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E8DEC9] pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#B45309]" />
            <h2 className="text-xs font-black uppercase tracking-wider text-[#5E0B15]">
              Priority Verification Queue ({pendingApprovals})
            </h2>
          </div>
          <Link
            href="/admin/restaurants"
            className="text-[11px] font-black text-[#90323D] hover:text-[#5E0B15] uppercase tracking-wider"
          >
            Review All Restaurants →
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3 py-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : pendingApprovals === 0 ? (
          <div className="py-8 text-center text-xs font-bold text-[#594B42] uppercase tracking-wider">
            All registered restaurants have been verified and processed.
          </div>
        ) : (
          <div className="divide-y divide-[#DCD5C9]">
            {restaurants
              .filter((r) => r.approvalStatus === RestaurantApprovalStatus.PENDING)
              .slice(0, 5)
              .map((r) => (
                <div key={r._id} className="py-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black text-[#1C120C] uppercase tracking-wider">
                      {r.name}
                    </h3>
                    <p className="text-[11px] text-[#594B42] font-mono">Slug: /r/{r.slug}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="warning">PENDING APPROVAL</Badge>
                    <Link href={`/admin/restaurants?search=${r.name}`}>
                      <Button variant="outline" size="sm">
                        Review
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
