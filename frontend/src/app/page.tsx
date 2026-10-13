'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  UtensilsCrossed,
  Sparkles,
  QrCode,
  ShieldCheck,
  Building2,
  ArrowRight,
  Layers,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { api } from '@/lib/api';
import { Restaurant } from '@/lib/types';

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    // Optionally fetch published restaurants for quick demo browsing
    api.restaurants
      .list({ limit: 4 })
      .then((res) => setRestaurants(res.data || []))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#EDE1CF] text-[#1C120C] flex flex-col justify-between">
      {/* Navigation Topbar */}
      <header className="bg-white border-b-2 border-[#5E0B15] px-6 py-4 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#5E0B15] text-[#EDE1CF] flex items-center justify-center font-black text-xl">
              P
            </div>
            <div>
              <span className="text-base font-black tracking-widest text-[#5E0B15] uppercase">
                PRASADAM_DINE
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold text-[#90323D] uppercase tracking-wider">
                AR Smart Dining Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="primary" size="sm" className="uppercase font-bold tracking-wider">
                Manager Login <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#5E0B15] text-[#5E0B15] text-xs font-bold uppercase tracking-wider mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#5E0B15]" />
          <span>Interactive 3D AR Digital Menus & Multi-Restaurant Operations</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-[#5E0B15] uppercase tracking-wide max-w-4xl mx-auto leading-tight mb-6">
          Augmented Reality Dining for Pure Devotional Restaurants
        </h1>

        <p className="text-sm sm:text-base text-[#594B42] max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          A centralized multi-tenant platform empowering restaurants to showcase true-to-scale 3D food models,
          generate smart table QR stands, and streamline kitchen and staff workflows.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/login">
            <Button variant="primary" size="lg" className="uppercase font-bold tracking-wider">
              Access Management Portal
            </Button>
          </Link>
          <a
            href="#venues"
            className="inline-flex items-center justify-center px-6 py-3 bg-white border border-[#90323D] text-[#90323D] hover:bg-[#F7F3EC] text-sm font-bold uppercase tracking-wider transition-colors"
          >
            Explore Public Menus
          </a>
        </div>
      </section>

      {/* Feature Pillars Grid */}
      <section className="max-w-6xl mx-auto px-6 py-12 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-t-4 border-t-[#5E0B15]">
            <Sparkles className="w-8 h-8 text-[#5E0B15] mb-4" />
            <h3 className="text-sm font-black text-[#1C120C] uppercase tracking-wider mb-2">
              Interactive 3D & WebXR AR
            </h3>
            <p className="text-xs text-[#594B42] leading-relaxed">
              Customers view interactive 3D models of authentic dishes before ordering, placing them directly
              on their dining tables using Apple Quick Look and Google Scene Viewer.
            </p>
          </Card>

          <Card className="border-t-4 border-t-[#90323D]">
            <QrCode className="w-8 h-8 text-[#90323D] mb-4" />
            <h3 className="text-sm font-black text-[#1C120C] uppercase tracking-wider mb-2">
              Dine-In QR Code Engine
            </h3>
            <p className="text-xs text-[#594B42] leading-relaxed">
              Generate restaurant-wide table stands and individual dish QR cards with high-resolution PNG
              downloads and printable table placards.
            </p>
          </Card>

          <Card className="border-t-4 border-t-[#5E0B15]">
            <ShieldCheck className="w-8 h-8 text-[#5E0B15] mb-4" />
            <h3 className="text-sm font-black text-[#1C120C] uppercase tracking-wider mb-2">
              Strict Multi-Tenant Isolation
            </h3>
            <p className="text-xs text-[#594B42] leading-relaxed">
              Server-enforced tenant boundaries, RBAC staff permissions, and compound database scoping preventing
              cross-restaurant access and IDOR attacks.
            </p>
          </Card>
        </div>
      </section>

      {/* Venues Showcase Section */}
      <section id="venues" className="max-w-6xl mx-auto px-6 py-12 w-full">
        <div className="flex items-center justify-between border-b-2 border-[#5E0B15] pb-3 mb-6">
          <h2 className="text-base font-black text-[#5E0B15] uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#90323D]" /> Registered Dining Venues
          </h2>
          <span className="text-xs text-[#594B42] uppercase font-bold">Public Digital Menus</span>
        </div>

        {restaurants.length === 0 ? (
          <div className="bg-white border border-[#DECDB5] p-8 text-center text-xs text-[#594B42] font-semibold uppercase">
            No public restaurants listed yet. Use the Manager Portal to register your venue.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {restaurants.map((r) => (
              <Link
                key={r._id}
                href={`/r/${r.slug}`}
                className="bg-white border border-[#DECDB5] hover:border-[#5E0B15] p-5 flex flex-col justify-between transition-colors shadow-xs group"
              >
                <div>
                  <h3 className="text-sm font-black text-[#1C120C] uppercase tracking-wide group-hover:text-[#5E0B15] mb-1">
                    {r.name}
                  </h3>
                  <p className="text-xs text-[#594B42] line-clamp-2 mb-4">
                    {r.description || 'Traditional pure dining experience.'}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-[#90323D] uppercase pt-2 border-t border-[#F7F3EC]">
                  <span>Explore Menu</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-[#5E0B15] py-8 text-center text-xs text-[#594B42]">
        <div className="max-w-6xl mx-auto px-6 space-y-2">
          <p className="font-extrabold text-[#5E0B15] tracking-widest uppercase">
            PRASADAM DINE — MULTI-RESTAURANT AR DIGITAL DINING PLATFORM
          </p>
          <p className="text-[11px] text-[#594B42]">
            Exact palette: Almond (#EDE1CF 60%), Cordovan (#90323D 30%), Chocolate Cosmos (#5E0B15 10%).
          </p>
        </div>
      </footer>
    </div>
  );
}
