'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  QrCode,
  Box,
  UtensilsCrossed,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  CheckCircle2,
  Layers,
  Leaf,
  Flame,
  Award,
  Users,
  Eye,
  Scan,
  RefreshCw,
  Upload,
  Globe,
  Sliders,
  X,
  Menu as MenuIcon,
  User as UserIcon,
  Star,
  ExternalLink,
} from 'lucide-react';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<{
    name: string;
    description: string;
    price: string;
    tag: string;
    isVeg: boolean;
    image: string;
    calories?: string;
    prepTime?: string;
  } | null>(null);

  const dishes = [
    {
      id: 'paneer-butter-masala',
      name: 'Paneer Butter Masala',
      description: 'Slow-simmered cottage cheese in a velvet tomato-butter reduction with crushed kasuri methi.',
      price: '₹260',
      tag: 'Vegetarian',
      isVeg: true,
      image: '/images/paneer_butter_masala.jpg',
      calories: '380 kcal',
      prepTime: '20 mins',
    },
    {
      id: 'dal-makhani',
      name: 'Dal Makhani',
      description: 'Slow-cooked whole black lentils simmered overnight with churned butter and royal spices.',
      price: '₹220',
      tag: 'Vegetarian',
      isVeg: true,
      image: '/images/dal_makhani.jpg',
      calories: '320 kcal',
      prepTime: '25 mins',
    },
    {
      id: 'chicken-biryani',
      name: 'Royal Dum Biryani',
      description: 'Fragrant aged basmati rice layered with caramelized onions, saffron, and aromatic whole spices.',
      price: '₹320',
      tag: 'Chef Special',
      isVeg: false,
      image: '/images/chicken_biryani.jpg',
      calories: '520 kcal',
      prepTime: '30 mins',
    },
    {
      id: 'masala-dosa',
      name: 'Crispy Masala Dosa',
      description: 'Golden fermented rice-lentil crepe with spiced potato masala, coconut chutney and lentil sambar.',
      price: '₹180',
      tag: 'Vegetarian',
      isVeg: true,
      image: '/images/masala_dosa.jpg',
      calories: '280 kcal',
      prepTime: '15 mins',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0E17] text-[#F8FAFC] font-sans-clean overflow-x-hidden selection:bg-amber-500/30 selection:text-white">
      {/* Ambient Saffron & Gold Lighting Orbs */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-0 w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-10 w-[400px] h-[400px] bg-indigo-950/20 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* ==================================================================== */}
      {/* 1. TOP NAVBAR (Modern Frosted Obsidian & Saffron) */}
      {/* ==================================================================== */}
      <header className="sticky top-0 z-50 bg-[#0A0E17]/80 backdrop-blur-xl border-b border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-[1px] shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/35 transition-all">
              <div className="w-full h-full bg-[#0A0E17] rounded-[11px] flex items-center justify-center text-amber-400">
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                  <path d="M12 2C13 6 17 9 17 13C17 16 14.5 19 12 20C9.5 19 7 16 7 13C7 9 11 6 12 2Z" fill="#FBBF24" />
                  <path d="M12 6C15 9 21 11 21 15C21 18 17 21 12 22C17 20 18 16 16.5 13C15 10 13 8 12 6Z" fill="#F59E0B" opacity="0.85" />
                  <path d="M12 6C9 9 3 11 3 15C3 18 7 21 12 22C7 20 6 16 7.5 13C9 10 11 8 12 6Z" fill="#F59E0B" opacity="0.85" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-luxury font-bold tracking-[0.2em] text-white text-lg sm:text-xl leading-tight">
                PRASADAM DINE
              </span>
              <span className="text-[9px] font-semibold tracking-[0.3em] text-amber-400 uppercase">
                3D AR Smart Dining Platform
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
            <a href="#popular-dishes" className="hover:text-amber-400 transition-colors">
              Menu
            </a>
            <Link href="/r/prasadam-divine" className="hover:text-amber-400 transition-colors">
              Explore Restaurants
            </Link>
            <a href="#how-it-works" className="hover:text-amber-400 transition-colors">
              How It Works
            </a>
            <a href="#ar-experience" className="hover:text-amber-400 transition-colors">
              AR Experience
            </a>
          </nav>

          {/* Action Button */}
          <div className="hidden sm:flex items-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-[0.14em] px-6 py-2.5 rounded-full shadow-md shadow-amber-500/20 hover:brightness-110 hover:shadow-amber-500/35 transition-all duration-200"
            >
              <UserIcon className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Manager Login</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0F1422] border-b border-white/10 px-6 py-5 flex flex-col gap-4 text-xs font-semibold uppercase tracking-widest text-slate-200">
            <a href="#popular-dishes" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400 py-1">
              Menu
            </a>
            <Link href="/r/prasadam-divine" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400 py-1">
              Explore Restaurants
            </Link>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400 py-1">
              How It Works
            </a>
            <a href="#ar-experience" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-400 py-1">
              AR Experience
            </a>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold py-3 rounded-full text-center mt-2"
            >
              <UserIcon className="w-4 h-4" />
              <span>Manager Portal</span>
            </Link>
          </div>
        )}
      </header>

      {/* ==================================================================== */}
      {/* 2. HERO SECTION */}
      {/* ==================================================================== */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column Content */}
            <div className="lg:col-span-6 z-10">
              {/* Eyebrow Badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold uppercase tracking-[0.2em] mb-6 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Traditional Heritage • Modern 3D AR</span>
              </div>

              {/* Headline */}
              <h1 className="font-luxury text-5xl sm:text-6xl xl:text-7xl font-bold text-white tracking-tight leading-[1.08] mb-6">
                Discover <br />
                <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                  Every Dish
                </span>{' '}
                in 3D
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl mb-9 font-normal">
                Scan table QR codes, explore realistic 3D food models, and experience Augmented Reality
                dining before you order. A smarter, more delightful dining journey.
              </p>

              {/* Call to Actions */}
              <div className="flex flex-wrap items-center gap-4 mb-12">
                <a
                  href="#popular-dishes"
                  className="inline-flex items-center gap-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-[0.16em] px-8 py-4 rounded-full shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 transition-all duration-300"
                >
                  <span>Explore Menu</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </a>
                <Link
                  href="/r/prasadam-divine"
                  className="inline-flex items-center gap-2 bg-[#121826] border border-white/15 hover:border-amber-400/60 text-slate-200 text-xs font-semibold uppercase tracking-[0.16em] px-7 py-4 rounded-full hover:bg-slate-800 transition-all duration-200"
                >
                  <span>Live Menu Demo</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>

              {/* Stat Counters */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#121826] border border-amber-500/25 flex items-center justify-center shrink-0 text-amber-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-bold text-white leading-tight">50+</div>
                    <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Restaurants</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#121826] border border-amber-500/25 flex items-center justify-center shrink-0 text-amber-400">
                    <Box className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-bold text-white leading-tight">500+</div>
                    <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">3D Dishes</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#121826] border border-amber-500/25 flex items-center justify-center shrink-0 text-amber-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-bold text-white leading-tight">100%</div>
                    <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Authentic</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual: Royal Thali Feast */}
            <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
              {/* Handwritten Note Accent */}
              <div className="absolute -top-6 right-6 sm:right-12 z-20 font-handwriting text-amber-300 text-3xl sm:text-4xl rotate-6 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] select-none">
                Food Looks Better in 3D ✨
              </div>

              {/* Framed Image Card */}
              <div className="relative w-full max-w-lg aspect-[4/3] rounded-3xl overflow-hidden border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.8)] group bg-[#111726]">
                <Image
                  src="/images/hero_thali.jpg"
                  alt="Royal Indian Thali Feast in 3D"
                  fill
                  priority
                  className="object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17]/90 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-xs bg-[#0F1422]/85 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 shadow-lg">
                  <span className="flex items-center gap-2 text-slate-200 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pure Vegetarian & Gourmet Delicacies</span>
                  </span>
                  <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px] bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                    3D Enabled
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3. THREE FEATURE CARDS (Clean Obsidian Glass) */}
      {/* ==================================================================== */}
      <section id="how-it-works" className="py-16 bg-[#080C14] border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
              Seamless Dine-in Process
            </span>
            <h2 className="font-luxury text-3xl sm:text-4xl font-bold text-white mt-2">
              How PRASADAM DINE Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Card 1 */}
            <div className="bg-[#101625]/80 backdrop-blur-md border border-slate-800 hover:border-amber-500/40 rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 group hover:-translate-y-1">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#161F33] border border-amber-500/25 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 group-hover:border-amber-400 transition-all shadow-md">
                <QrCode className="w-7 h-7 stroke-[1.8]" />
              </div>
              <h3 className="font-luxury text-xl font-bold text-white mb-3">1. Scan & Explore</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Scan the elegant QR code stand at your restaurant table and instantly view the interactive digital menu on your phone with zero app download.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#101625]/80 backdrop-blur-md border border-slate-800 hover:border-amber-500/40 rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 group hover:-translate-y-1">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#161F33] border border-amber-500/25 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 group-hover:border-amber-400 transition-all shadow-md">
                <Box className="w-7 h-7 stroke-[1.8]" />
              </div>
              <h3 className="font-luxury text-xl font-bold text-white mb-3">2. 3D AR Preview</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Rotate, zoom, and inspect true-to-scale 3D models of every dish. Tap &quot;View in your space&quot; to place the dish right on your table.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#101625]/80 backdrop-blur-md border border-slate-800 hover:border-amber-500/40 rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 group hover:-translate-y-1">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#161F33] border border-amber-500/25 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 group-hover:border-amber-400 transition-all shadow-md">
                <Leaf className="w-7 h-7 stroke-[1.8]" />
              </div>
              <h3 className="font-luxury text-xl font-bold text-white mb-3">3. Freshly Curated Menu</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Browse detailed ingredients, dietary tags, calorie estimates, allergen warnings, and live kitchen availability in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. SECTION: A NEW WAY TO DINE (Steaming Biryani + Smartphone) */}
      {/* ==================================================================== */}
      <section className="py-20 md:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-5">
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-amber-400">
                More Than Just A Menu
              </span>
              <h2 className="font-luxury text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight mt-3 mb-6">
                A New Way to Dine
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8">
                PRASADAM DINE bridges centuries-old culinary heritage with cutting-edge spatial computing.
                Eliminate order anxiety and delight diners before the first bite arrives.
              </p>
              <a
                href="#ar-experience"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-[0.14em] px-8 py-3.5 rounded-full shadow-md shadow-amber-500/20 hover:scale-105 transition-all"
              >
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </a>
            </div>

            {/* Right Visual */}
            <div className="lg:col-span-7 relative flex justify-center">
              <div className="absolute -top-6 right-6 font-handwriting text-amber-300 text-2xl sm:text-3xl -rotate-6 select-none z-10 drop-shadow-md">
                See Food in Augmented Reality 📲
              </div>
              <div className="relative w-full max-w-xl aspect-[4/3] rounded-3xl overflow-hidden border border-white/15 shadow-2xl group bg-[#111726]">
                <Image
                  src="/images/biryani_ar.jpg"
                  alt="Steaming Saffron Biryani with Phone AR Preview"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17]/70 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. SECTION: SEE IT BEFORE YOU TASTE IT (AR in Hand) */}
      {/* ==================================================================== */}
      <section id="ar-experience" className="py-20 md:py-28 bg-[#080C14] border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Visual: Smartphone AR in hand */}
            <div className="lg:col-span-6 order-2 lg:order-1 relative flex justify-center">
              <div className="absolute -top-6 left-6 font-handwriting text-amber-300 text-2xl sm:text-3xl rotate-[-4deg] select-none z-10 drop-shadow-md">
                From Menu to Your Table ✨
              </div>
              <div className="relative w-full max-w-lg aspect-[4/3] rounded-3xl overflow-hidden border border-white/15 shadow-2xl group bg-[#111726]">
                <Image
                  src="/images/phone_ar.jpg"
                  alt="Smartphone camera placing 3D dish on restaurant table in Augmented Reality"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17]/60 via-transparent to-transparent" />
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-6 order-1 lg:order-2">
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-amber-400">
                Spatial Dining Experience
              </span>
              <h2 className="font-luxury text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight mt-3 mb-6">
                See It Before You Taste It
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8">
                Explore dishes in <strong className="text-white">stunning 3D and Augmented Reality</strong>.
                Zoom, rotate, and view every detail — portion size, garnish, ingredients, and allergen tags — before you order.
              </p>

              {/* 4 Feature Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800">
                <div className="p-3.5 rounded-2xl bg-[#111726] border border-white/5 text-center">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-[#172033] border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-white">Veg & Vegan Tags</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#111726] border border-white/5 text-center">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-[#172033] border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-white">Allergen Safety</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#111726] border border-white/5 text-center">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-[#172033] border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-2">
                    <Box className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-white">3D WebGL Models</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#111726] border border-white/5 text-center">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-[#172033] border border-sky-500/30 flex items-center justify-center text-sky-400 mb-2">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-white">Zero App Installs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 6. SECTION: OUR POPULAR DISHES */}
      {/* ==================================================================== */}
      <section id="popular-dishes" className="py-20 md:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-amber-400">
                Culinary Showcase
              </span>
              <h2 className="font-luxury text-4xl sm:text-5xl font-bold text-white tracking-tight mt-2">
                Our Popular Dishes
              </h2>
              <p className="text-sm text-slate-400 mt-2">
                Authentic recipes, beautifully visualized in interactive 3D
              </p>
            </div>

            <Link
              href="/r/prasadam-divine"
              className="inline-flex items-center gap-2 bg-[#121826] border border-white/15 hover:border-amber-400/60 text-amber-300 hover:text-white px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all self-start sm:self-auto shadow-sm"
            >
              <span>View Full Menu</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 4 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dishes.map((dish) => (
              <div
                key={dish.id}
                onClick={() => setSelectedDish(dish)}
                className="bg-[#101625] rounded-2xl overflow-hidden border border-slate-800 hover:border-amber-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1.5 cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
                    <Image
                      src={dish.image}
                      alt={dish.name}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute top-3 right-3 bg-[#0A0E17]/85 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-md">
                      <Box className="w-3 h-3" />
                      <span>Tap for 3D</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <h3 className="font-luxury text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                      {dish.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {dish.description}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 pb-5 pt-3 flex items-center justify-between border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                        dish.isVeg ? 'border-emerald-500 bg-emerald-950/60' : 'border-rose-500 bg-rose-950/60'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${dish.isVeg ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      {dish.tag}
                    </span>
                  </div>

                  <span className="text-base font-bold text-amber-400 font-luxury">
                    {dish.price}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 7. SECTION: MANAGE YOUR RESTAURANT WITH EASE (B2B Portal) */}
      {/* ==================================================================== */}
      <section className="py-20 md:py-28 bg-[#080C14] border-t border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Visual: Laptop Dashboard */}
            <div className="lg:col-span-7 relative flex justify-center">
              <div className="relative w-full max-w-xl aspect-[4/3] rounded-3xl overflow-hidden border border-white/15 shadow-2xl group bg-[#111726]">
                <Image
                  src="/images/laptop_dashboard.jpg"
                  alt="Prasadam Dine Restaurant Management Dashboard on Laptop"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17]/60 via-transparent to-transparent" />
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-5">
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-amber-400">
                For Restaurant Owners & Chefs
              </span>
              <h2 className="font-luxury text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight mt-3 mb-6">
                Manage Your Restaurant with Ease
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8">
                Empower your restaurant operations with an enterprise-grade dashboard.
                Update menu prices on the fly, upload 3D models, assign staff permissions, and download high-resolution QR stands.
              </p>

              {/* 5 Features */}
              <div className="flex flex-col gap-3.5 mb-9">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#141C2E] border border-amber-500/25 flex items-center justify-center text-amber-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">Real-time Menu & Pricing Updates</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#141C2E] border border-amber-500/25 flex items-center justify-center text-amber-400">
                    <Box className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">3D GLB/GLTF Cloudinary Storage</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#141C2E] border border-amber-500/25 flex items-center justify-center text-amber-400">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">Instant Table QR Stand Generator</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#141C2E] border border-amber-500/25 flex items-center justify-center text-amber-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">Multi-tenant Staff & Role Control</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#141C2E] border border-amber-500/25 flex items-center justify-center text-amber-400">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">Live Dine-In Availability Sync</span>
                </div>
              </div>

              {/* CTA */}
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-[0.14em] px-8 py-4 rounded-full shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 transition-all"
              >
                <span>Access Portal</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 8. FOOTER */}
      {/* ==================================================================== */}
      <footer className="bg-[#05080E] border-t border-slate-800/80 pt-16 pb-8 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
            {/* Logo Col */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M12 2C13 6 17 9 17 13C17 16 14.5 19 12 20C9.5 19 7 16 7 13C7 9 11 6 12 2Z" fill="#FBBF24" />
                    <path d="M12 6C15 9 21 11 21 15C21 18 17 21 12 22C17 20 18 16 16.5 13C15 10 13 8 12 6Z" fill="#F59E0B" opacity="0.85" />
                  </svg>
                </div>
                <div>
                  <span className="font-luxury font-bold tracking-[0.2em] text-white text-base block leading-none">
                    PRASADAM DINE
                  </span>
                  <span className="text-[8px] font-semibold tracking-[0.28em] text-amber-400 uppercase mt-1 block">
                    Divine Food Experience
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-6 font-normal">
                Next-generation augmented reality dining platform. Bridging fine dining culinary mastery
                with cutting-edge 3D visualization.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-white mb-4">
                Quick Links
              </h4>
              <ul className="flex flex-col gap-2.5 text-xs">
                <li><a href="#popular-dishes" className="hover:text-amber-400 transition-colors">Menu Showcase</a></li>
                <li><Link href="/r/prasadam-divine" className="hover:text-amber-400 transition-colors">Explore Restaurants</Link></li>
                <li><a href="#how-it-works" className="hover:text-amber-400 transition-colors">How It Works</a></li>
                <li><a href="#ar-experience" className="hover:text-amber-400 transition-colors">AR Experience</a></li>
              </ul>
            </div>

            {/* For Restaurants */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-white mb-4">
                For Restaurants
              </h4>
              <ul className="flex flex-col gap-2.5 text-xs">
                <li><Link href="/login" className="hover:text-amber-400 transition-colors">Partner With Us</Link></li>
                <li><Link href="/login" className="hover:text-amber-400 transition-colors">Manager Login</Link></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Enterprise Pricing</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">QR Table Kit</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-white mb-4">
                Platform
              </h4>
              <ul className="flex flex-col gap-2.5 text-xs">
                <li><a href="#" className="hover:text-amber-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Security & Privacy</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-amber-400 transition-colors">Contact Engineering</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
            <div>
              © 2026 PRASADAM DINE. All rights reserved.
            </div>
            <div className="flex items-center gap-3">
              <span>Authentic Food</span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span>Modern 3D Technology</span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span>Augmented Reality Dining</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ==================================================================== */}
      {/* 9. DISH PREVIEW MODAL */}
      {/* ==================================================================== */}
      {selectedDish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl bg-[#0F1523] border border-white/15 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8">
            <button
              onClick={() => setSelectedDish(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-[#161F33] border border-white/10 text-slate-300 hover:text-white transition"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-white/10 mb-6 bg-slate-950">
              <Image
                src={selectedDish.image}
                alt={selectedDish.name}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-[#0A0E17]/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-amber-400 border border-amber-500/30">
                {selectedDish.tag}
              </div>
            </div>

            <div className="flex items-baseline justify-between mb-3">
              <h3 className="font-luxury text-2xl font-bold text-white">
                {selectedDish.name}
              </h3>
              <span className="font-luxury text-2xl font-bold text-amber-400">
                {selectedDish.price}
              </span>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              {selectedDish.description}
            </p>

            <div className="flex items-center gap-3">
              <Link
                href="/r/prasadam-divine"
                className="flex-1 text-center bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider py-3.5 rounded-full shadow-lg shadow-amber-500/20 hover:brightness-110 transition"
              >
                Order On Table Menu
              </Link>
              <button
                onClick={() => setSelectedDish(null)}
                className="border border-white/15 text-slate-300 text-xs font-semibold uppercase tracking-wider px-6 py-3.5 rounded-full hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
