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
  ChevronRight,
  Layers,
  Sparkles,
  CheckCircle2,
  Menu as MenuIcon,
  X,
  User as UserIcon,
  Building2,
  ShoppingBag,
} from 'lucide-react';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C120C] font-sans antialiased selection:bg-[#F59E0B]/30 selection:text-[#7A0C1E]">
      {/* ==================================================================== */}
      {/* 1. TOP UTILITY STRIP */}
      {/* ==================================================================== */}
      <div className="bg-gradient-to-r from-[#5E0513] via-[#7A0C1E] to-[#5E0513] text-[#FAF7F2] text-xs font-medium py-2 px-4 border-b border-[#680514]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FBBF24] shadow-xs" />
            <span className="font-semibold tracking-wide">AR_DINE — AR-Enabled Restaurant Dining & Management Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[#FEF3C7]">
            <Link href="/r/prasadam-divine" className="hover:text-white underline underline-offset-2 transition-colors">
              Explore Live Venue
            </Link>
            <span className="text-amber-400/50">•</span>
            <Link href="/login" className="hover:text-white transition-colors">
              Manager Portal
            </Link>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. HEADER & NAVIGATION BAR */}
      {/* ==================================================================== */}
      <header className="sticky top-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#E8DEC9] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B1226] to-[#680514] text-[#FDE68A] flex items-center justify-center font-luxury font-black text-sm tracking-tighter shadow-sm group-hover:scale-102 transition-transform">
              AR
            </div>
            <div className="flex flex-col">
              <span className="font-luxury font-bold tracking-[0.16em] text-[#7A0C1E] text-lg leading-tight">
                AR_DINE
              </span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#B45309] uppercase">
                Digital Menus & Restaurant Ops
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-[0.14em] text-[#6E5D53]">
            <Link href="/" className="text-[#7A0C1E] font-black border-b-2 border-[#7A0C1E] pb-0.5">
              Home
            </Link>
            <Link href="/r/prasadam-divine" className="hover:text-[#7A0C1E] transition-colors">
              Explore Restaurants
            </Link>
            <a href="#features" className="hover:text-[#7A0C1E] transition-colors">
              Platform Features
            </a>
            <a href="#how-it-works" className="hover:text-[#7A0C1E] transition-colors">
              How It Works
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#1C120C] hover:text-[#7A0C1E] px-4 py-2.5 rounded-xl border border-[#E8DEC9] hover:border-[#F59E0B] bg-[#FFFDF9] transition-all shadow-2xs hover:shadow-xs"
            >
              <UserIcon className="w-3.5 h-3.5 text-[#B45309]" />
              <span>Manager Login</span>
            </Link>

            <Link
              href="/r/prasadam-divine"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8B1226] to-[#680514] hover:from-[#9E152D] hover:to-[#7A0C1E] text-white font-bold text-xs uppercase tracking-[0.14em] px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-101"
            >
              <span>Explore Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#1C120C] hover:bg-[#FAF7F2] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#FFFDF9] border-b border-[#E8DEC9] px-6 py-5 flex flex-col gap-4 text-xs font-bold uppercase tracking-wider text-[#6E5D53]">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="py-1 text-[#7A0C1E] font-black">
              Home
            </Link>
            <Link href="/r/prasadam-divine" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#7A0C1E]">
              Explore Restaurants
            </Link>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#7A0C1E]">
              Platform Features
            </a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#7A0C1E]">
              How It Works
            </a>
            <div className="pt-3 border-t border-[#E8DEC9] flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-center rounded-xl border border-[#E8DEC9] text-[#1C120C] font-bold bg-[#FAF7F2]"
              >
                Manager Login
              </Link>
              <Link
                href="/r/prasadam-divine"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-center rounded-xl bg-gradient-to-r from-[#8B1226] to-[#680514] text-white font-bold"
              >
                Explore Live Menu
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ==================================================================== */}
      {/* 3. HERO SECTION */}
      {/* ==================================================================== */}
      <section className="relative pt-12 pb-20 md:pt-16 md:pb-24 border-b border-[#E8DEC9] bg-[#FFFDF9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7">
              {/* Category Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FEF3C7] border border-[#F59E0B]/30 text-[#92400E] text-xs font-bold uppercase tracking-wider mb-5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>AR-Enabled Restaurant Technology</span>
              </div>

              {/* Primary Headline */}
              <h1 className="font-luxury text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1C120C] tracking-tight leading-[1.12] mb-6">
                Modern Digital Menus & Spatial AR for <span className="text-[#7A0C1E]">Restaurants</span>
              </h1>

              {/* Informative Subtitle */}
              <p className="text-base sm:text-lg text-[#6E5D53] leading-relaxed max-w-2xl mb-8">
                AR_DINE is a multi-tenant restaurant platform providing contactless QR-based menus,
                interactive 3D and Augmented Reality food previews, live order dispatch, and comprehensive back-office management.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 mb-10">
                <Link
                  href="/r/prasadam-divine"
                  className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#8B1226] to-[#680514] hover:from-[#9E152D] hover:to-[#7A0C1E] text-white text-xs font-bold uppercase tracking-[0.14em] px-7 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-102"
                >
                  <UtensilsCrossed className="w-4 h-4 text-[#FDE68A]" />
                  <span>Explore Restaurants</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/r/prasadam-divine/d/royal-saffron-badam-halwa"
                  className="inline-flex items-center gap-2 bg-[#FEF3C7] border border-[#F59E0B] hover:bg-[#FDE68A] text-[#7A0C1E] text-xs font-bold uppercase tracking-[0.14em] px-6 py-3.5 rounded-xl transition-all shadow-xs hover:shadow-md hover:scale-102"
                >
                  <Sparkles className="w-4 h-4 text-[#B45309]" />
                  <span>Try 3D AR Dish</span>
                </Link>

                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-[#6E5D53] hover:text-[#7A0C1E] text-xs font-bold uppercase tracking-[0.14em] px-4 py-3.5 transition-colors"
                >
                  <Building2 className="w-4 h-4 text-[#B45309]" />
                  <span>Manager Portal</span>
                </Link>
              </div>

              {/* Feature Highlights List */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-[#E8DEC9] text-xs font-semibold text-[#6E5D53]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F59E0B] shrink-0" />
                  <span>Instant Table QR Menus</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F59E0B] shrink-0" />
                  <span>Supported 3D / AR Models</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F59E0B] shrink-0" />
                  <span>Multi-Tenant Manager Portal</span>
                </div>
              </div>
            </div>

            {/* Right Photography Frame with Hover Lift & 3D Badge */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border border-[#E8DEC9] bg-gradient-to-b from-[#250308] to-[#120104] shadow-2xl transition-all">
                <div className="relative aspect-square w-full sm:max-h-[420px] max-h-[360px] flex items-center justify-center p-4">
                  <Image
                    src="/images/golden_enigma.png"
                    alt="The Golden Enigma — Royal Saffron Almond Halwa"
                    fill
                    priority
                    className="object-contain p-2"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-200 shadow-md flex items-center gap-2 text-[11px] font-bold text-[#7A0C1E]">
                    <Sparkles className="w-3.5 h-3.5 text-[#F59E0B] animate-pulse" />
                    <span>3D AR Experience</span>
                  </div>
                </div>
                <div className="p-4 sm:p-5 bg-[#FFFDF9] border-t border-[#E8DEC9] flex items-center justify-between text-xs text-[#6E5D53]">
                  <div className="flex items-center gap-2 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] animate-ping" />
                    <span className="font-bold text-[#1C120C]">Signature Dish: The Golden Enigma</span>
                  </div>
                  <Link
                    href="/r/prasadam-divine/d/royal-saffron-badam-halwa"
                    className="text-[#7A0C1E] font-bold hover:underline inline-flex items-center gap-1 text-xs"
                  >
                    <span>View 3D View</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#F59E0B]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. PLATFORM FEATURES */}
      {/* ==================================================================== */}
      <section id="features" className="py-16 md:py-24 bg-[#FAF7F2] border-b border-[#E8DEC9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#B45309]">
              Platform Architecture
            </span>
            <h2 className="font-luxury text-3xl sm:text-4xl font-bold text-[#1C120C] mt-2 mb-4">
              Core Capabilities for Modern Restaurants
            </h2>
            <p className="text-sm text-[#6E5D53] leading-relaxed">
              Essential dining and management modules designed for restaurant owners, kitchen personnel, and dining patrons.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E8DEC9] shadow-sm hover:shadow-md hover:border-[#F59E0B]/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#FEF3C7] border border-[#F59E0B]/30 text-[#7A0C1E] flex items-center justify-center mb-5 shadow-2xs">
                <QrCode className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="font-luxury text-lg font-bold text-[#1C120C] mb-2">QR-Based Digital Menus</h3>
              <p className="text-xs text-[#6E5D53] leading-relaxed">
                Contactless dining menus accessible directly in standard mobile browsers. Diners scan the tabletop stand to browse categories and dishes without installing third-party apps.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E8DEC9] shadow-sm hover:shadow-md hover:border-[#F59E0B]/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#FEF3C7] border border-[#F59E0B]/30 text-[#7A0C1E] flex items-center justify-center mb-5 shadow-2xs">
                <Box className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="font-luxury text-lg font-bold text-[#1C120C] mb-2">Dish Images & 3D/AR Previews</h3>
              <p className="text-xs text-[#6E5D53] leading-relaxed">
                Dishes support high-resolution culinary photography and optional dish-specific 3D GLB/GLTF models. Diners can inspect realistic presentations and place supported items on their table.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E8DEC9] shadow-sm hover:shadow-md hover:border-[#F59E0B]/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#FEF3C7] border border-[#F59E0B]/30 text-[#7A0C1E] flex items-center justify-center mb-5 shadow-2xs">
                <ShoppingBag className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="font-luxury text-lg font-bold text-[#1C120C] mb-2">Online Table Ordering</h3>
              <p className="text-xs text-[#6E5D53] leading-relaxed">
                When enabled by the restaurant, guests select items, specify dietary preferences or table numbers, and submit orders directly with integrated digital payment verification.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E8DEC9] shadow-sm hover:shadow-md hover:border-[#F59E0B]/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#FEF3C7] border border-[#F59E0B]/30 text-[#7A0C1E] flex items-center justify-center mb-5 shadow-2xs">
                <Layers className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="font-luxury text-lg font-bold text-[#1C120C] mb-2">Menu & Order Operations</h3>
              <p className="text-xs text-[#6E5D53] leading-relaxed">
                Dedicated manager dashboard for updating menu categories, adjusting prices, toggling kitchen availability, generating QR stands, and tracking orders in real time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. HOW IT WORKS */}
      {/* ==================================================================== */}
      <section id="how-it-works" className="py-16 md:py-24 bg-[#FFFDF9] border-b border-[#E8DEC9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#B45309]">
              Step-by-Step Flow
            </span>
            <h2 className="font-luxury text-3xl sm:text-4xl font-bold text-[#1C120C] mt-2 mb-4">
              How AR_DINE Operates
            </h2>
            <p className="text-sm text-[#6E5D53] leading-relaxed">
              A straightforward process connecting customer table discovery to restaurant kitchen management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-[#FAF7F2] rounded-2xl p-6 border border-[#E8DEC9] shadow-2xs">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8B1226] to-[#680514] text-[#FDE68A] flex items-center justify-center font-bold text-xs mb-4 shadow-sm">
                1
              </div>
              <h3 className="font-luxury text-base font-bold text-[#1C120C] mb-2">Scan or Open Menu</h3>
              <p className="text-xs text-[#6E5D53] leading-relaxed">
                Customer scans the table QR code with their mobile device or accesses the restaurant&rsquo;s public menu URL directly in their web browser.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#FAF7F2] rounded-2xl p-6 border border-[#E8DEC9] shadow-2xs">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8B1226] to-[#680514] text-[#FDE68A] flex items-center justify-center font-bold text-xs mb-4 shadow-sm">
                2
              </div>
              <h3 className="font-luxury text-base font-bold text-[#1C120C] mb-2">Browse & Preview in 3D</h3>
              <p className="text-xs text-[#6E5D53] leading-relaxed">
                Customer reviews categories, ingredients, prices, and allergen details. Supported items can be previewed in 3D or projected into physical space using AR.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#FAF7F2] rounded-2xl p-6 border border-[#E8DEC9] shadow-2xs">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8B1226] to-[#680514] text-[#FDE68A] flex items-center justify-center font-bold text-xs mb-4 shadow-sm">
                3
              </div>
              <h3 className="font-luxury text-base font-bold text-[#1C120C] mb-2">Place Order</h3>
              <p className="text-xs text-[#6E5D53] leading-relaxed">
                If the restaurant has enabled online table ordering, the customer adds dishes to their cart, selects dine-in table options, and completes payment.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-[#FAF7F2] rounded-2xl p-6 border border-[#E8DEC9] shadow-2xs">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8B1226] to-[#680514] text-[#FDE68A] flex items-center justify-center font-bold text-xs mb-4 shadow-sm">
                4
              </div>
              <h3 className="font-luxury text-base font-bold text-[#1C120C] mb-2">Kitchen Management</h3>
              <p className="text-xs text-[#6E5D53] leading-relaxed">
                Restaurant staff receive incoming orders on the dashboard or Kitchen Display System (KDS), manage preparation status, and fulfill service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 6. RESTAURANT MANAGER CALLOUT */}
      {/* ==================================================================== */}
      <section className="py-16 md:py-20 bg-[#FAF7F2] border-b border-[#E8DEC9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-[#E8DEC9] p-8 md:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-[#B45309]">
                Restaurant Management Portal
              </span>
              <h2 className="font-luxury text-2xl sm:text-3xl font-bold text-[#1C120C] mt-2 mb-3">
                Are you a Restaurant Owner or Manager?
              </h2>
              <p className="text-xs sm:text-sm text-[#6E5D53] leading-relaxed">
                Log in to your authenticated restaurant portal to update menus, manage dish availability, upload dish-specific 3D assets, configure table QR codes, and monitor live orders.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Link
                href="/login"
                className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#8B1226] to-[#680514] hover:from-[#9E152D] hover:to-[#7A0C1E] text-white font-bold text-xs uppercase tracking-[0.14em] px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-101"
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
      <footer className="bg-[#FFFDF9] pt-12 pb-8 text-[#6E5D53] border-t border-[#E8DEC9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#E8DEC9]">
            {/* Brand column */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8B1226] to-[#680514] text-[#FDE68A] flex items-center justify-center font-luxury font-bold text-xs shadow-xs">
                  AR
                </div>
                <span className="font-luxury font-bold tracking-[0.16em] text-[#7A0C1E] text-base">
                  AR_DINE
                </span>
              </div>
              <p className="text-xs text-[#8C7A6F] max-w-sm leading-relaxed mb-4">
                AR-enabled digital restaurant menu and operations platform. Empowering hospitality teams with spatial visualization and seamless guest dining.
              </p>
            </div>

            {/* Navigation links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-[#1C120C] mb-3">
                Platform Navigation
              </h4>
              <ul className="flex flex-col gap-2 text-xs font-medium">
                <li>
                  <Link href="/" className="hover:text-[#7A0C1E] transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/r/prasadam-divine" className="hover:text-[#7A0C1E] transition-colors">
                    Explore Restaurants
                  </Link>
                </li>
                <li>
                  <a href="#features" className="hover:text-[#7A0C1E] transition-colors">
                    Platform Features
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-[#7A0C1E] transition-colors">
                    How It Works
                  </a>
                </li>
              </ul>
            </div>

            {/* Access links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-[#1C120C] mb-3">
                Staff & Administration
              </h4>
              <ul className="flex flex-col gap-2 text-xs font-medium">
                <li>
                  <Link href="/login" className="hover:text-[#7A0C1E] transition-colors">
                    Restaurant Manager Login
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-[#7A0C1E] transition-colors">
                    Platform Administrator Login
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright bar */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#A89D95] gap-2">
            <div>© 2026 AR_DINE. All rights reserved.</div>
            <div className="flex items-center gap-3 font-semibold text-[#8C7A6F]">
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
