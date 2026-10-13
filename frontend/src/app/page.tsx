'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  QrCode,
  ShieldCheck,
  Building2,
  ArrowRight,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { api } from '@/lib/api';
import { Restaurant } from '@/lib/types';

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    api.restaurants
      .list({ limit: 4 })
      .then((res) => setRestaurants(res.data || []))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1C120C] flex flex-col justify-between">
      {/* Navigation Topbar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-[#E8E2D9] px-6 py-4 sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#5E0B15] text-[#EDE1CF] rounded-xl flex items-center justify-center font-black text-xl shadow-xs">
              P
            </div>
            <div>
              <span className="text-base font-black tracking-widest text-[#5E0B15] uppercase">
                PRASADAM_DINE
              </span>
              <span className="hidden sm:inline-block ml-2.5 text-[11px] font-bold text-[#90323D] uppercase tracking-wider bg-[#FAF7F2] px-2 py-0.5 rounded-full border border-[#E8E2D9]">
                AR Smart Dining Platform
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="primary" size="sm" className="uppercase font-bold tracking-wider rounded-lg shadow-xs">
                Manager Login <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 sm:py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border border-[#E8E2D9] text-[#5E0B15] text-xs font-bold uppercase tracking-wider mb-8 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#90323D]" />
          <span>Interactive 3D AR Digital Menus & Multi-Restaurant Operations</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#5E0B15] uppercase tracking-tight max-w-4xl mx-auto leading-[1.15] mb-6">
          Augmented Reality Dining for Pure Devotional Restaurants
        </h1>

        <p className="text-sm sm:text-base text-[#594B42] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          A centralized multi-tenant platform empowering restaurants to showcase true-to-scale 3D food models,
          generate smart table QR stands, and streamline kitchen and staff workflows.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/login">
            <Button variant="primary" size="lg" className="uppercase font-bold tracking-wider rounded-xl shadow-md hover:shadow-lg">
              Access Management Portal
            </Button>
          </Link>
          <a
            href="#venues"
            className="inline-flex items-center justify-center px-6 py-3 bg-white rounded-xl border border-[#E8E2D9] hover:border-[#90323D] text-[#90323D] hover:bg-[#FAF7F2] text-sm font-bold uppercase tracking-wider transition-all shadow-xs hover:shadow-sm"
          >
            <Compass className="w-4 h-4 mr-2" />
            Explore Public Menus
          </a>
        </div>
      </section>

      {/* Feature Pillars Grid */}
      <section className="max-w-6xl mx-auto px-6 py-12 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-2xl border border-[#E8E2D9] shadow-xs hover:shadow-md transition-all p-7 bg-white">
            <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-center mb-5">
              <Sparkles className="w-6 h-6 text-[#5E0B15]" />
            </div>
            <h3 className="text-base font-bold text-[#1C120C] uppercase tracking-wider mb-2">
              Interactive 3D & WebXR AR
            </h3>
            <p className="text-xs text-[#594B42] leading-relaxed">
              Customers view interactive 3D models of authentic dishes before ordering, placing them directly
              on their dining tables using Apple Quick Look and Google Scene Viewer.
            </p>
          </Card>

          <Card className="rounded-2xl border border-[#E8E2D9] shadow-xs hover:shadow-md transition-all p-7 bg-white">
            <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-center mb-5">
              <QrCode className="w-6 h-6 text-[#90323D]" />
            </div>
            <h3 className="text-base font-bold text-[#1C120C] uppercase tracking-wider mb-2">
              Dine-In QR Code Engine
            </h3>
            <p className="text-xs text-[#594B42] leading-relaxed">
              Generate restaurant-wide table stands and individual dish QR cards with high-resolution PNG
              downloads and printable table placards.
            </p>
          </Card>

          <Card className="rounded-2xl border border-[#E8E2D9] shadow-xs hover:shadow-md transition-all p-7 bg-white">
            <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6 text-[#5E0B15]" />
            </div>
            <h3 className="text-base font-bold text-[#1C120C] uppercase tracking-wider mb-2">
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
        <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-4 mb-6">
          <h2 className="text-base font-bold text-[#5E0B15] uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#90323D]" /> Registered Dining Venues
          </h2>
          <span className="text-xs text-[#594B42] uppercase font-semibold">Public Digital Menus</span>
        </div>

        {restaurants.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8E2D9] p-10 text-center text-xs text-[#594B42] font-semibold uppercase shadow-xs">
            No public restaurants listed yet. Use the Manager Portal to register your venue.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {restaurants.map((r) => (
              <Link
                key={r._id}
                href={`/r/${r.slug}`}
                className="bg-white rounded-2xl border border-[#E8E2D9] hover:border-[#90323D] p-5 flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-1 group"
              >
                <div>
                  <h3 className="text-sm font-bold text-[#1C120C] uppercase tracking-wide group-hover:text-[#5E0B15] mb-1.5">
                    {r.name}
                  </h3>
                  <p className="text-xs text-[#594B42] line-clamp-2 mb-4 leading-relaxed">
                    {r.description || 'Traditional pure dining experience.'}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-[#90323D] uppercase pt-3 border-t border-[#F4EFE6]">
                  <span>Explore Menu</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E8E2D9] py-8 text-center text-xs text-[#594B42] mt-12">
        <div className="max-w-6xl mx-auto px-6 space-y-2">
          <p className="font-extrabold text-[#5E0B15] tracking-widest uppercase">
            PRASADAM DINE — MULTI-RESTAURANT AR DIGITAL DINING PLATFORM
          </p>
          <p className="text-[11px] text-[#594B42]">
            Curated Luxury Palette: Almond, Cordovan, and Chocolate Cosmos.
          </p>
        </div>
      </footer>
    </div>
  );
}
