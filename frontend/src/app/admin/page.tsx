'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Users,
  Clock,
  CheckCircle,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Table';
import { api } from '@/lib/api';
import { Restaurant, RestaurantApprovalStatus, Role, User } from '@/lib/types';

export default function AdminDashboardPage() {
  const { user, isSuperAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isSuperAdmin) {
      router.push('/dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [restRes, usersRes] = await Promise.all([
          api.restaurants.list({ limit: 100 }),
          api.users.list({ limit: 100 }),
        ]);
        setRestaurants(restRes.data || []);
        setUsers(usersRes.data || []);
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

  const totalRestaurants = restaurants.length;
  const activeRestaurants = restaurants.filter(
    (r) => r.approvalStatus === RestaurantApprovalStatus.APPROVED && r.isActive,
  ).length;
  const pendingApprovals = restaurants.filter(
    (r) => r.approvalStatus === RestaurantApprovalStatus.PENDING,
  ).length;
  const suspendedRestaurants = restaurants.filter(
    (r) => r.approvalStatus === RestaurantApprovalStatus.SUSPENDED || !r.isActive,
  ).length;
  const totalUsers = users.length;

  return (
    <DashboardShell>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D9] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#5E0B15] uppercase tracking-wider">
            Platform Operations Overview
          </h1>
          <p className="text-xs text-[#594B42] uppercase tracking-wider mt-0.5">
            Real-time platform statistics and multi-tenant management
          </p>
        </div>
        <Link href="/admin/restaurants">
          <Button variant="primary" size="sm" className="uppercase font-bold tracking-wider rounded-lg shadow-xs">
            Manage Restaurants <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#5E0B15]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#594B42] uppercase tracking-wider">
              Total Restaurants
            </span>
            <Building2 className="w-5 h-5 text-[#5E0B15]" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-black text-[#1C120C]">{totalRestaurants}</div>
          )}
          <p className="text-[11px] text-[#594B42] mt-1">Multi-tenant accounts registered</p>
        </Card>

        <Card className="border-l-4 border-l-[#1E562A]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#594B42] uppercase tracking-wider">
              Active Dining Venues
            </span>
            <CheckCircle className="w-5 h-5 text-[#1E562A]" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-black text-[#1E562A]">{activeRestaurants}</div>
          )}
          <p className="text-[11px] text-[#594B42] mt-1">Approved & serving customers</p>
        </Card>

        <Card className="border-l-4 border-l-[#8C5D0D]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#594B42] uppercase tracking-wider">
              Pending Approvals
            </span>
            <Clock className="w-5 h-5 text-[#8C5D0D]" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-black text-[#8C5D0D]">{pendingApprovals}</div>
          )}
          <p className="text-[11px] text-[#594B42] mt-1">Requires Super Admin action</p>
        </Card>

        <Card className="border-l-4 border-l-[#90323D]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#594B42] uppercase tracking-wider">
              Total Users
            </span>
            <Users className="w-5 h-5 text-[#90323D]" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-black text-[#1C120C]">{totalUsers}</div>
          )}
          <p className="text-[11px] text-[#594B42] mt-1">Platform staff & owners</p>
        </Card>
      </div>

      {/* Pending Approval Priority Queue */}
      <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#8C5D0D]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#5E0B15]">
              Priority Verification Queue ({pendingApprovals})
            </h2>
          </div>
          <Link
            href="/admin/restaurants"
            className="text-xs font-bold text-[#90323D] hover:text-[#5E0B15] uppercase tracking-wider"
          >
            Review All →
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3 py-2">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ) : pendingApprovals === 0 ? (
          <div className="py-8 text-center text-xs font-semibold text-[#594B42] uppercase tracking-wider">
            All registered restaurants have been verified and processed.
          </div>
        ) : (
          <div className="divide-y divide-[#F5EFE6]">
            {restaurants
              .filter((r) => r.approvalStatus === RestaurantApprovalStatus.PENDING)
              .slice(0, 5)
              .map((r) => (
                <div key={r._id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[#1C120C] uppercase tracking-wider">
                      {r.name}
                    </h3>
                    <p className="text-[11px] text-[#594B42]">Slug: /r/{r.slug}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="warning">PENDING APPROVAL</Badge>
                    <Link href={`/admin/restaurants?search=${r.name}`}>
                      <Button variant="outline" size="sm" className="uppercase font-bold rounded-lg">
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
