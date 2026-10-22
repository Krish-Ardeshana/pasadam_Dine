'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  SlidersHorizontal,
  ShieldCheck,
  Database,
  Cloud,
  CreditCard,
  Lock,
  Server,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AdminSettingsPage() {
  const { isSuperAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();

  if (!authLoading && !isSuperAdmin) {
    router.push('/dashboard');
    return null;
  }

  return (
    <DashboardShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCD5C9] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#5E0B15] uppercase tracking-wider flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-[#90323D]" />
            Platform Architecture & Security Settings
          </h1>
          <p className="text-xs text-[#594B42] uppercase tracking-wider mt-0.5">
            Operational guards, database tenancy status, storage engines, and payment safety parameters
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin">
            <Button variant="primary" size="sm">
              Super Admin Overview <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Multi-Tenant Security Rules */}
        <Card className="border-t-4 border-t-[#5E0B15] space-y-4">
          <div className="flex items-center justify-between border-b border-[#DCD5C9] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#5E0B15]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-[#5E0B15]">
                Multi-Tenant Isolation Engine
              </h2>
            </div>
            <Badge variant="success">ENFORCED</Badge>
          </div>
          <p className="text-xs text-[#594B42] leading-relaxed">
            Every administrative mutation, dish upload, QR generation, and order dispatch requires
            server-side tenant validation via <code className="bg-[#FAF8F5] text-[#90323D] px-1 font-mono text-[11px]">TenantGuard</code>.
            Client-provided tenant IDs without cryptographic session validation are strictly blocked.
          </p>
          <div className="space-y-2 border-t border-[#DCD5C9] pt-3 text-[11px]">
            <div className="flex justify-between items-center py-1">
              <span className="font-bold text-[#594B42]">Cross-Tenant Read/Write Protection:</span>
              <span className="font-mono text-[#1E562A] font-bold">ACTIVE (HTTP 403)</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-bold text-[#594B42]">Dishes & Categories Tenancy Scope:</span>
              <span className="font-mono text-[#1E562A] font-bold">RESTAURANT SCOPED</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-bold text-[#594B42]">Super Admin Last-Account Protection:</span>
              <span className="font-mono text-[#1E562A] font-bold">ACTIVE (Demotion Blocked)</span>
            </div>
          </div>
        </Card>

        {/* Database & Persistence */}
        <Card className="border-t-4 border-t-[#90323D] space-y-4">
          <div className="flex items-center justify-between border-b border-[#DCD5C9] pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[#90323D]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-[#5E0B15]">
                Database Connectivity & Schemas
              </h2>
            </div>
            <Badge variant="success">ONLINE</Badge>
          </div>
          <p className="text-xs text-[#594B42] leading-relaxed">
            Data layer is managed via MongoDB Atlas Mongoose integration with strict indexing on restaurant slugs,
            compound tenant IDs, and order numbers.
          </p>
          <div className="space-y-2 border-t border-[#DCD5C9] pt-3 text-[11px]">
            <div className="flex justify-between items-center py-1">
              <span className="font-bold text-[#594B42]">Database Engine:</span>
              <span className="font-mono text-[#1C120C]">MongoDB Atlas (Mongoose 9)</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-bold text-[#594B42]">Tenant Uniqueness Indexes:</span>
              <span className="font-mono text-[#1E562A] font-bold">slug: 1, restaurantId: 1</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-bold text-[#594B42]">Audit Logging Persistence:</span>
              <span className="font-mono text-[#1E562A] font-bold">PERSISTENT IN DB</span>
            </div>
          </div>
        </Card>

        {/* 3D AR Assets & Media Storage */}
        <Card className="border-t-4 border-t-[#5E0B15] space-y-4">
          <div className="flex items-center justify-between border-b border-[#DCD5C9] pb-3">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-[#5E0B15]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-[#5E0B15]">
                3D Model Storage & Media Adapter
              </h2>
            </div>
            <Badge variant="info">VERIFIED</Badge>
          </div>
          <p className="text-xs text-[#594B42] leading-relaxed">
            3D GLB/GLTF assets and high-definition photography are processed through the configured storage
            adapter. Binary header inspection verifies genuine <code className="bg-[#FAF8F5] text-[#90323D] px-1 font-mono text-[11px]">glTF</code> magic bytes before storing.
          </p>
          <div className="space-y-2 border-t border-[#DCD5C9] pt-3 text-[11px]">
            <div className="flex justify-between items-center py-1">
              <span className="font-bold text-[#594B42]">Max Binary Upload Limit:</span>
              <span className="font-mono text-[#1C120C]">15 MB per 3D asset</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-bold text-[#594B42]">3D Asset Magic Header Verification:</span>
              <span className="font-mono text-[#1E562A] font-bold">glTF 4-byte check</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-bold text-[#594B42]">Dish-Asset Binding:</span>
              <span className="font-mono text-[#1E562A] font-bold">Strict 1:1 Dish Scoped</span>
            </div>
          </div>
        </Card>

        {/* Payment Gateway Safety Safeguards */}
        <Card className="border-t-4 border-t-[#90323D] space-y-4">
          <div className="flex items-center justify-between border-b border-[#DCD5C9] pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#90323D]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-[#5E0B15]">
                Payment Security & Test-Mode Safeguards
              </h2>
            </div>
            <Badge variant="warning">TEST MODE ENFORCED</Badge>
          </div>
          <p className="text-xs text-[#594B42] leading-relaxed">
            Razorpay payment processing is strictly restricted to test mode. Client-provided prices are never trusted;
            order totals are computed authoritatively on the backend, and webhook signatures are cryptographically validated.
          </p>
          <div className="space-y-2 border-t border-[#DCD5C9] pt-3 text-[11px]">
            <div className="flex justify-between items-center py-1">
              <span className="font-bold text-[#594B42]">Gateway Operating Mode:</span>
              <span className="font-mono text-[#9A6216] font-bold">TEST MODE ONLY</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-bold text-[#594B42]">Webhook Idempotency:</span>
              <span className="font-mono text-[#1E562A] font-bold">Duplicate Rejection (ProcessedWebhooks)</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-bold text-[#594B42]">Credentials & Secrets Protection:</span>
              <span className="font-mono text-[#1E562A] font-bold">Zero Dashboard Exposure</span>
            </div>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
