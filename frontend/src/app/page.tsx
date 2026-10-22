'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  QrCode,
  Box,
  UtensilsCrossed,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  Layers,
  Sparkles,
  CheckCircle2,
  Menu as MenuIcon,
  X,
  User as UserIcon,
  Clock,
  Building2,
  FileText,
  ShoppingBag,
} from 'lucide-react';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#1C1917] font-sans antialiased selection:bg-[#1B4332]/20 selection:text-[#1B4332]">
      {/* ==================================================================== */}
      {/* 1. TOP UTILITY STRIP */}
      {/* ==================================================================== */}
      <div className="bg-[#1B4332] text-[#F4F9F5] text-xs font-medium py-2 px-4 border-b border-[#143326]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>PRASADAM DINE — AR-Enabled Restaurant Dining & Management Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-emerald-100/80">
            <Link href="/r/prasadam-divine" className="hover:text-white underline underline-offset-2 transition">
              Explore Live Venue
            </Link>
            <span className="text-emerald-300/40">•</span>
            <Link href="/login" className="hover:text-white transition">
              Manager Portal
            </Link>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. HEADER & NAVIGATION BAR */}
      {/* ==================================================================== */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E7E2D9] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#1B4332] text-white flex items-center justify-center font-luxury font-black text-xl shadow-xs group-hover:bg-[#143326] transition-colors">
              P
            </div>
            <div className="flex flex-col">
              <span className="font-luxury font-bold tracking-[0.16em] text-[#1C1917] text-lg leading-tight">
                PRASADAM DINE
              </span>
              <span className="text-[10px] font-semibold tracking-[0.2em] text-[#2D6A4F] uppercase">
                Digital Menus & Restaurant Ops
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-[0.14em] text-[#57534E]">
            <Link href="/" className="text-[#1B4332] font-bold">
              Home
            </Link>
            <Link href="/r/prasadam-divine" className="hover:text-[#1B4332] transition-colors">
              Explore Restaurants
            </Link>
            <a href="#features" className="hover:text-[#1B4332] transition-colors">
              Platform Features
            </a>
            <a href="#how-it-works" className="hover:text-[#1B4332] transition-colors">
              How It Works
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#292524] hover:text-[#1B4332] px-4 py-2.5 rounded-lg border border-[#D6CEBF] hover:border-[#1B4332]/40 bg-white transition-all shadow-2xs"
            >
              <UserIcon className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>Manager Login</span>
            </Link>

            <Link
              href="/r/prasadam-divine"
              className="inline-flex items-center gap-2 bg-[#1B4332] hover:bg-[#143326] text-white font-semibold text-xs uppercase tracking-[0.14em] px-5 py-2.5 rounded-lg transition-all shadow-xs"
            >
              <span>Explore Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#292524] hover:bg-[#F2EFE9]"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#E7E2D9] px-6 py-5 flex flex-col gap-4 text-xs font-semibold uppercase tracking-wider text-[#44403C]">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="py-1 text-[#1B4332] font-bold">
              Home
            </Link>
            <Link href="/r/prasadam-divine" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#1B4332]">
              Explore Restaurants
            </Link>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#1B4332]">
              Platform Features
            </a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#1B4332]">
              How It Works
            </a>
            <div className="pt-3 border-t border-[#E7E2D9] flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-center rounded-lg border border-[#D6CEBF] text-[#292524] font-bold"
              >
                Manager Login
              </Link>
              <Link
                href="/r/prasadam-divine"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-center rounded-lg bg-[#1B4332] text-white font-bold"
              >
                Explore Live Menu
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ==================================================================== */}
      {/* 3. HERO SECTION — CLEAN & RESTRAINED */}
      {/* ==================================================================== */}
      <section className="relative pt-12 pb-20 md:pt-16 md:pb-24 border-b border-[#E7E2D9] bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7">
              {/* Category Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#EDF5F0] border border-[#C5DEC9] text-[#1B4332] text-xs font-semibold uppercase tracking-wider mb-5">
                <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>AR-Enabled Restaurant Technology</span>
              </div>

              {/* Primary Headline */}
              <h1 className="font-luxury text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1C1917] tracking-tight leading-[1.12] mb-6">
                Modern Digital Menus & Spatial AR for Restaurants
              </h1>

              {/* Informative Subtitle */}
              <p className="text-base sm:text-lg text-[#57534E] leading-relaxed max-w-2xl mb-8">
                PRASADAM DINE is a multi-tenant restaurant platform providing contactless QR-based menus,
                interactive 3D and Augmented Reality food previews, live order dispatch, and comprehensive back-office management.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 mb-10">
                <Link
                  href="/r/prasadam-divine"
                  className="inline-flex items-center gap-2.5 bg-[#1B4332] hover:bg-[#143326] text-white text-xs font-bold uppercase tracking-[0.14em] px-7 py-3.5 rounded-lg shadow-sm transition-all"
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>Explore Restaurants</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-[#FAF8F5] border border-[#D6CEBF] hover:border-[#1B4332] text-[#292524] hover:text-[#1B4332] text-xs font-bold uppercase tracking-[0.14em] px-6 py-3.5 rounded-lg transition-all"
                >
                  <Building2 className="w-4 h-4 text-[#2D6A4F]" />
                  <span>Restaurant Manager Login</span>
                </Link>
              </div>

              {/* Feature Highlights List */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-[#EAE5DC] text-xs text-[#57534E]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                  <span>Instant Table QR Menus</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                  <span>Supported 3D / AR Models</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                  <span>Multi-Tenant Manager Portal</span>
                </div>
              </div>
            </div>

            {/* Right Photography Frame */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-[#D6CEBF] bg-[#F7F5EE] shadow-md">
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src="/images/hero_thali.jpg"
                    alt="Authentic restaurant dining table presentation"
                    fill
                    priority
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                </div>
                <div className="p-4 bg-white border-t border-[#EAE5DC] flex items-center justify-between text-xs text-[#57534E]">
                  <div className="flex items-center gap-2 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span>Featured Dining Venue: Prasadam Divine Heritage</span>
                  </div>
                  <Link
                    href="/r/prasadam-divine"
                    className="text-[#1B4332] font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <span>View Menu</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. PLATFORM FEATURES (PART A.3) */}
      {/* ==================================================================== */}
      <section id="features" className="py-16 md:py-24 bg-[#FBFBF9] border-b border-[#E7E2D9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#2D6A4F]">
              Platform Architecture
            </span>
            <h2 className="font-luxury text-3xl sm:text-4xl font-bold text-[#1C1917] mt-2 mb-4">
              Core Capabilities for Modern Restaurants
            </h2>
            <p className="text-sm text-[#57534E] leading-relaxed">
              Essential dining and management modules designed for restaurant owners, kitchen personnel, and dining patrons.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-6 border border-[#E7E2D9] shadow-2xs hover:border-[#1B4332]/40 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-[#EDF5F0] border border-[#C5DEC9] text-[#1B4332] flex items-center justify-center mb-5">
                <QrCode className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="font-luxury text-lg font-bold text-[#1C1917] mb-2">QR-Based Digital Menus</h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Contactless dining menus accessible directly in standard mobile browsers. Diners scan the tabletop stand to browse categories and dishes without installing third-party apps.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-6 border border-[#E7E2D9] shadow-2xs hover:border-[#1B4332]/40 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-[#EDF5F0] border border-[#C5DEC9] text-[#1B4332] flex items-center justify-center mb-5">
                <Box className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="font-luxury text-lg font-bold text-[#1C1917] mb-2">Dish Images & 3D/AR Previews</h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Dishes support high-resolution culinary photography and optional dish-specific 3D GLB/GLTF models. Diners can inspect realistic presentations and place supported items on their table.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-6 border border-[#E7E2D9] shadow-2xs hover:border-[#1B4332]/40 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-[#EDF5F0] border border-[#C5DEC9] text-[#1B4332] flex items-center justify-center mb-5">
                <ShoppingBag className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="font-luxury text-lg font-bold text-[#1C1917] mb-2">Online Table Ordering</h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                When enabled by the restaurant, guests select items, specify dietary preferences or table numbers, and submit orders directly with integrated digital payment verification.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl p-6 border border-[#E7E2D9] shadow-2xs hover:border-[#1B4332]/40 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-[#EDF5F0] border border-[#C5DEC9] text-[#1B4332] flex items-center justify-center mb-5">
                <Layers className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="font-luxury text-lg font-bold text-[#1C1917] mb-2">Menu & Order Operations</h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Dedicated manager dashboard for updating menu categories, adjusting prices, toggling kitchen availability, generating QR stands, and tracking orders in real time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. HOW IT WORKS (PART A.4) */}
      {/* ==================================================================== */}
      <section id="how-it-works" className="py-16 md:py-24 bg-[#FFFFFF] border-b border-[#E7E2D9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#2D6A4F]">
              Step-by-Step Flow
            </span>
            <h2 className="font-luxury text-3xl sm:text-4xl font-bold text-[#1C1917] mt-2 mb-4">
              How PRASADAM DINE Operates
            </h2>
            <p className="text-sm text-[#57534E] leading-relaxed">
              A straightforward process connecting customer table discovery to restaurant kitchen management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-[#FAF8F5] rounded-xl p-6 border border-[#E7E2D9]">
              <div className="w-8 h-8 rounded-full bg-[#1B4332] text-white flex items-center justify-center font-bold text-xs mb-4">
                1
              </div>
              <h3 className="font-luxury text-base font-bold text-[#1C1917] mb-2">Scan or Open Menu</h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Customer scans the table QR code with their mobile device or accesses the restaurant&rsquo;s public menu URL directly in their web browser.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#FAF8F5] rounded-xl p-6 border border-[#E7E2D9]">
              <div className="w-8 h-8 rounded-full bg-[#1B4332] text-white flex items-center justify-center font-bold text-xs mb-4">
                2
              </div>
              <h3 className="font-luxury text-base font-bold text-[#1C1917] mb-2">Browse & Preview in 3D</h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Customer reviews categories, ingredients, prices, and allergen details. Supported items can be previewed in 3D or projected into physical space using AR.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#FAF8F5] rounded-xl p-6 border border-[#E7E2D9]">
              <div className="w-8 h-8 rounded-full bg-[#1B4332] text-white flex items-center justify-center font-bold text-xs mb-4">
                3
              </div>
              <h3 className="font-luxury text-base font-bold text-[#1C1917] mb-2">Place Order</h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                If the restaurant has enabled online table ordering, the customer adds dishes to their cart, selects dine-in table options, and completes payment.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-[#FAF8F5] rounded-xl p-6 border border-[#E7E2D9]">
              <div className="w-8 h-8 rounded-full bg-[#1B4332] text-white flex items-center justify-center font-bold text-xs mb-4">
                4
              </div>
              <h3 className="font-luxury text-base font-bold text-[#1C1917] mb-2">Kitchen Management</h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Restaurant staff receive incoming orders on the dashboard or Kitchen Display System (KDS), manage preparation status, and fulfill service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 6. RESTAURANT MANAGER CALLOUT */}
      {/* ==================================================================== */}
      <section className="py-16 md:py-20 bg-[#F4F2EC] border-b border-[#E7E2D9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-[#D6CEBF] p-8 md:p-12 shadow-xs flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#2D6A4F]">
                Restaurant Management Portal
              </span>
              <h2 className="font-luxury text-2xl sm:text-3xl font-bold text-[#1C1917] mt-2 mb-3">
                Are you a Restaurant Owner or Manager?
              </h2>
              <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                Log in to your authenticated restaurant portal to update menus, manage dish availability, upload dish-specific 3D assets, configure table QR codes, and monitor live orders.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Link
                href="/login"
                className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-2 bg-[#1B4332] hover:bg-[#143326] text-white font-bold text-xs uppercase tracking-[0.14em] px-8 py-3.5 rounded-lg transition-all shadow-xs"
              >
                <span>Manager Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 7. FOOTER */}
      {/* ==================================================================== */}
      <footer className="bg-[#FFFFFF] pt-12 pb-8 text-[#57534E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#E7E2D9]">
            {/* Brand column */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#1B4332] text-white flex items-center justify-center font-luxury font-bold text-sm">
                  P
                </div>
                <span className="font-luxury font-bold tracking-[0.16em] text-[#1C1917] text-base">
                  PRASADAM DINE
                </span>
              </div>
              <p className="text-xs text-[#78716C] max-w-sm leading-relaxed mb-4">
                AR-enabled digital restaurant menu and operations platform. Empowering hospitality teams with spatial visualization and seamless guest dining.
              </p>
            </div>

            {/* Navigation links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-[#1C1917] mb-3">
                Platform Navigation
              </h4>
              <ul className="flex flex-col gap-2 text-xs">
                <li>
                  <Link href="/" className="hover:text-[#1B4332] transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/r/prasadam-divine" className="hover:text-[#1B4332] transition-colors">
                    Explore Restaurants
                  </Link>
                </li>
                <li>
                  <a href="#features" className="hover:text-[#1B4332] transition-colors">
                    Platform Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-[#1B4332] transition-colors">
                    How It Works
                  </a>
                </li>
              </ul>
            </div>

            {/* Access links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-[#1C1917] mb-3">
                Staff & Administration
              </h4>
              <ul className="flex flex-col gap-2 text-xs">
                <li>
                  <Link href="/login" className="hover:text-[#1B4332] transition-colors">
                    Restaurant Manager Login
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-[#1B4332] transition-colors">
                    Platform Administrator Login
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright bar */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#A8A29E] gap-2">
            <div>© 2026 PRASADAM DINE. All rights reserved.</div>
            <div className="flex items-center gap-3">
              <span>Digital Menus</span>
              <span>•</span>
              <span>3D/AR Visualization</span>
              <span>•</span>
              <span>Restaurant Operations</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
