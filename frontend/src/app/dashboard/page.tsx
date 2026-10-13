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
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Table';
import { api } from '@/lib/api';
import { Category, Dish, MediaAsset, QrCode as QrCodeType, RestaurantApprovalStatus } from '@/lib/types';

export default function DashboardOverviewPage() {
  const { currentRestaurant, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [qrCodes, setQrCodes] = useState<QrCodeType[]>([]);
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
        const [catRes, dishRes, mediaRes, qrRes] = await Promise.all([
          api.categories.list(currentRestaurant._id),
          api.dishes.list(currentRestaurant._id, { limit: 100 }),
          api.media.list(currentRestaurant._id),
          api.qr.list(currentRestaurant._id),
        ]);
        setCategories(catRes || []);
        setDishes(dishRes.data || []);
        setMedia(mediaRes || []);
        setQrCodes(qrRes || []);
      } catch (err) {
        console.error('Failed to load restaurant dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [authLoading, isAuthenticated, currentRestaurant, router]);

  const publishedDishes = dishes.filter((d) => d.isPublished).length;
  const dishesWith3D = dishes.filter((d) => !!d.model3dUrl).length;

  return (
    <DashboardShell>
      {/* Restaurant Status Banner */}
      <div className="bg-white border-2 border-[#5E0B15] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-black text-[#5E0B15] uppercase tracking-wider">
              {currentRestaurant?.name || 'Selected Dining Venue'}
            </h1>
            {currentRestaurant?.approvalStatus === RestaurantApprovalStatus.APPROVED ? (
              <Badge variant="success">APPROVED & ACTIVE</Badge>
            ) : (
              <Badge variant="warning">{currentRestaurant?.approvalStatus || 'PENDING'}</Badge>
            )}
          </div>
          <p className="text-xs text-[#594B42] max-w-xl">
            {currentRestaurant?.description || 'Authentic pure dining experience with interactive 3D AR digital menu.'}
          </p>
        </div>

        {currentRestaurant?.slug && (
          <div className="flex items-center gap-2">
            <Link
              href={`/r/${currentRestaurant.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 bg-[#5E0B15] text-[#EDE1CF] px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#450810] transition-colors border border-[#5E0B15]"
            >
              <span>View Customer Menu</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#5E0B15]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#594B42] uppercase tracking-wider">
              Menu Categories
            </span>
            <Layers className="w-5 h-5 text-[#5E0B15]" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-black text-[#1C120C]">{categories.length}</div>
          )}
          <Link
            href="/dashboard/categories"
            className="text-[11px] font-bold text-[#90323D] hover:text-[#5E0B15] uppercase tracking-wider block mt-2"
          >
            Manage Categories →
          </Link>
        </Card>

        <Card className="border-l-4 border-l-[#90323D]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#594B42] uppercase tracking-wider">
              Total Dishes
            </span>
            <UtensilsCrossed className="w-5 h-5 text-[#90323D]" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-black text-[#1C120C]">
              {dishes.length}{' '}
              <span className="text-xs font-normal text-[#594B42]">({publishedDishes} published)</span>
            </div>
          )}
          <Link
            href="/dashboard/dishes"
            className="text-[11px] font-bold text-[#90323D] hover:text-[#5E0B15] uppercase tracking-wider block mt-2"
          >
            Manage Dishes →
          </Link>
        </Card>

        <Card className="border-l-4 border-l-[#1E562A]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#594B42] uppercase tracking-wider">
              3D AR Enabled Dishes
            </span>
            <Sparkles className="w-5 h-5 text-[#1E562A]" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-black text-[#1E562A]">{dishesWith3D}</div>
          )}
          <p className="text-[11px] text-[#594B42] mt-2">Interactive GLB/GLTF models active</p>
        </Card>

        <Card className="border-l-4 border-l-[#8C5D0D]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#594B42] uppercase tracking-wider">
              Dine-In QR Codes
            </span>
            <QrCode className="w-5 h-5 text-[#8C5D0D]" />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <div className="text-2xl font-black text-[#8C5D0D]">{qrCodes.length}</div>
          )}
          <Link
            href="/dashboard/qr"
            className="text-[11px] font-bold text-[#90323D] hover:text-[#5E0B15] uppercase tracking-wider block mt-2"
          >
            Generate QR Codes →
          </Link>
        </Card>
      </div>

      {/* Quick Actions & Menu Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Dishes */}
        <div className="lg:col-span-2 bg-white border border-[#DECDB5] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#DECDB5] pb-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#5E0B15]">
              Dishes & AR Food Offerings
            </h2>
            <Link href="/dashboard/dishes">
              <Button variant="primary" size="sm" className="uppercase font-bold tracking-wider">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Dish
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-2 py-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : dishes.length === 0 ? (
            <div className="py-8 text-center text-xs font-semibold text-[#594B42] uppercase tracking-wider">
              No dishes created yet. Start by creating categories and adding items.
            </div>
          ) : (
            <div className="divide-y divide-[#DECDB5]">
              {dishes.slice(0, 5).map((d) => (
                <div key={d._id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#1C120C] uppercase tracking-wider">
                        {d.name}
                      </span>
                      {d.model3dUrl && (
                        <span className="text-[10px] bg-[#EDE1CF] text-[#5E0B15] font-extrabold px-1.5 py-0.2 border border-[#5E0B15]">
                          3D AR
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#594B42]">
                      {d.currency} {d.price.toFixed(2)} • {d.isAvailable ? 'Available' : 'Unavailable'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {d.isPublished ? (
                      <Badge variant="success">PUBLISHED</Badge>
                    ) : (
                      <Badge variant="neutral">DRAFT</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Operations Quick Links */}
        <div className="bg-white border border-[#DECDB5] p-6 space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#5E0B15] border-b border-[#DECDB5] pb-3">
            Quick Operations
          </h2>
          <div className="space-y-2">
            <Link
              href="/dashboard/categories"
              className="flex items-center justify-between p-3 bg-[#F7F3EC] border border-[#DECDB5] hover:border-[#5E0B15] text-xs font-bold uppercase tracking-wider text-[#5E0B15] transition-colors"
            >
              <span>Organize Menu Categories</span>
              <ArrowRight className="w-4 h-4 text-[#90323D]" />
            </Link>

            <Link
              href="/dashboard/media"
              className="flex items-center justify-between p-3 bg-[#F7F3EC] border border-[#DECDB5] hover:border-[#5E0B15] text-xs font-bold uppercase tracking-wider text-[#5E0B15] transition-colors"
            >
              <span>Upload 3D Models & Photos</span>
              <ArrowRight className="w-4 h-4 text-[#90323D]" />
            </Link>

            <Link
              href="/dashboard/qr"
              className="flex items-center justify-between p-3 bg-[#F7F3EC] border border-[#DECDB5] hover:border-[#5E0B15] text-xs font-bold uppercase tracking-wider text-[#5E0B15] transition-colors"
            >
              <span>Download Dine-In QR Stand</span>
              <ArrowRight className="w-4 h-4 text-[#90323D]" />
            </Link>

            <Link
              href="/dashboard/staff"
              className="flex items-center justify-between p-3 bg-[#F7F3EC] border border-[#DECDB5] hover:border-[#5E0B15] text-xs font-bold uppercase tracking-wider text-[#5E0B15] transition-colors"
            >
              <span>Manage Staff Team</span>
              <ArrowRight className="w-4 h-4 text-[#90323D]" />
            </Link>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
