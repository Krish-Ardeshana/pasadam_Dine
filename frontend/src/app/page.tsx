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
  Play,
  RotateCcw,
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
    modelUrl?: string;
  } | null>(null);

  const dishes = [
    {
      id: 'paneer-butter-masala',
      name: 'Paneer Butter Masala',
      description: 'Rich and creamy North Indian classic with aromatic spices and soft cottage cheese.',
      price: '₹260',
      tag: 'Vegetarian',
      isVeg: true,
      image: '/images/paneer_butter_masala.jpg',
      modelUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    },
    {
      id: 'dal-makhani',
      name: 'Dal Makhani',
      description: 'Slow cooked black lentils with butter, cream and traditional stone-ground spices.',
      price: '₹220',
      tag: 'Vegetarian',
      isVeg: true,
      image: '/images/dal_makhani.jpg',
      modelUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    },
    {
      id: 'chicken-biryani',
      name: 'Chicken Biryani',
      description: 'A royal blend of aromatic saffron basmati rice, succulent spiced meat and nuts.',
      price: '₹320',
      tag: 'Non-Vegetarian',
      isVeg: false,
      image: '/images/chicken_biryani.jpg',
      modelUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    },
    {
      id: 'masala-dosa',
      name: 'Masala Dosa',
      description: 'Crispy fermented crepe with spiced potato filling served with chutney and sambar.',
      price: '₹180',
      tag: 'Vegetarian',
      isVeg: true,
      image: '/images/masala_dosa.jpg',
      modelUrl: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    },
  ];

  return (
    <div className="min-h-screen bg-[#06130B] text-[#EDE1CF] font-sans-clean overflow-x-hidden selection:bg-[#D4AF37]/30 selection:text-white">
      {/* ==================================================================== */}
      {/* 1. TOP NAVBAR */}
      {/* ==================================================================== */}
      <header className="sticky top-0 z-50 bg-[#06130B]/90 backdrop-blur-md border-b border-[#D4AF37]/15 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo with Golden Lotus */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 flex items-center justify-center text-[#D4AF37] transition-transform duration-300 group-hover:scale-105">
              <svg viewBox="0 0 40 40" className="w-10 h-10 fill-current drop-shadow-[0_2px_8px_rgba(212,175,55,0.4)]">
                {/* Stylized Royal Golden Lotus */}
                <path d="M20 5 C22 12, 28 17, 28 23 C28 28, 24 33, 20 35 C16 33, 12 28, 12 23 C12 17, 18 12, 20 5 Z" fill="#ECC876" opacity="0.95" />
                <path d="M20 10 C25 15, 35 18, 35 25 C35 30, 28 34, 20 35 C28 32, 30 26, 28 22 C26 18, 22 14, 20 10 Z" fill="#D4AF37" opacity="0.8" />
                <path d="M20 10 C15 15, 5 18, 5 25 C5 30, 12 34, 20 35 C12 32, 10 26, 12 22 C14 18, 18 14, 20 10 Z" fill="#D4AF37" opacity="0.8" />
                <circle cx="20" cy="34" r="2.5" fill="#FFF2BD" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-luxury font-bold tracking-[0.22em] text-[#FFF4D4] text-lg sm:text-xl leading-none">
                PRASADAM DINE
              </span>
              <span className="text-[9px] font-semibold tracking-[0.35em] text-[#D4AF37]/80 uppercase mt-1">
                Divine Food Experience
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium uppercase tracking-[0.15em] text-[#C2D1C2]">
            <a href="#popular-dishes" className="hover:text-[#F3D079] transition-colors">
              Menu
            </a>
            <Link href="/r/prasadam-divine" className="hover:text-[#F3D079] transition-colors">
              Explore Restaurants
            </Link>
            <a href="#how-it-works" className="hover:text-[#F3D079] transition-colors">
              How It Works
            </a>
            <a href="#ar-experience" className="hover:text-[#F3D079] transition-colors">
              AR Experience
            </a>
          </nav>

          {/* Login CTA Pill */}
          <div className="hidden sm:flex items-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#ECC876] via-[#D4AF37] to-[#B8860B] text-[#0A180E] font-bold text-xs uppercase tracking-[0.14em] px-5 py-2.5 rounded-full shadow-[0_2px_15px_rgba(212,175,55,0.3)] hover:brightness-110 hover:shadow-[0_4px_22px_rgba(212,175,55,0.5)] transition-all duration-200"
            >
              <UserIcon className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Login</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#D4AF37] hover:text-white"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0A1F13] border-b border-[#D4AF37]/20 px-6 py-5 flex flex-col gap-4 text-xs font-semibold uppercase tracking-widest text-[#D2DFCE]">
            <a href="#popular-dishes" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F3D079] py-1">
              Menu
            </a>
            <Link href="/r/prasadam-divine" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F3D079] py-1">
              Explore Restaurants
            </Link>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F3D079] py-1">
              How It Works
            </a>
            <a href="#ar-experience" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#F3D079] py-1">
              AR Experience
            </a>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center justify-center gap-2 bg-gold-gradient text-[#0A180E] font-bold py-2.5 rounded-full text-center mt-2"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Manager Login</span>
            </Link>
          </div>
        )}
      </header>

      {/* ==================================================================== */}
      {/* 2. HERO SECTION */}
      {/* ==================================================================== */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        {/* Ambient Warm Golden Glows */}
        <div className="absolute top-10 right-10 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-0 w-80 h-80 bg-[#144226]/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 z-10">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#D4AF37] mb-4">
                <span>Traditional Taste</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                <span>Modern Technology</span>
              </div>

              {/* Headline */}
              <h1 className="font-luxury text-5xl sm:text-6xl xl:text-7xl font-bold text-white tracking-tight leading-[1.08] mb-6">
                Discover <br />
                <span className="text-gold-gradient font-normal italic">Every Dish</span> in 3D
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-[#B3C7B2] leading-relaxed max-w-xl mb-9">
                Scan, explore and experience your favourite dishes in interactive 3D and Augmented Reality.
                A smarter, more delightful way to dine.
              </p>

              {/* CTA Button */}
              <div className="flex flex-wrap items-center gap-4 mb-12">
                <a
                  href="#popular-dishes"
                  className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#ECC876] via-[#D4AF37] to-[#B8860B] text-[#08170D] font-bold text-xs uppercase tracking-[0.16em] px-8 py-4 rounded-full shadow-[0_4px_25px_rgba(212,175,55,0.35)] hover:scale-105 hover:shadow-[0_8px_30px_rgba(212,175,55,0.5)] transition-all duration-300"
                >
                  <span>Explore Menu</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </a>
                <Link
                  href="/r/prasadam-divine"
                  className="inline-flex items-center gap-2 border border-[#D4AF37]/40 hover:border-[#D4AF37] text-[#EDE1CF] text-xs font-semibold uppercase tracking-[0.16em] px-6 py-4 rounded-full hover:bg-[#D4AF37]/10 transition-all"
                >
                  <span>View Live Demo</span>
                </Link>
              </div>

              {/* Stat Badges */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-[#D4AF37]/15">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0D2617] border border-[#D4AF37]/30 flex items-center justify-center shrink-0 text-[#D4AF37]">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-bold text-white leading-tight">50+</div>
                    <div className="text-[10px] text-[#8EA68E] uppercase tracking-wider">Partner Restaurants</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0D2617] border border-[#D4AF37]/30 flex items-center justify-center shrink-0 text-[#D4AF37]">
                    <Box className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-bold text-white leading-tight">500+</div>
                    <div className="text-[10px] text-[#8EA68E] uppercase tracking-wider">Dishes in 3D</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0D2617] border border-[#D4AF37]/30 flex items-center justify-center shrink-0 text-[#D4AF37]">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-bold text-white leading-tight">100%</div>
                    <div className="text-[10px] text-[#8EA68E] uppercase tracking-wider">Authentic Taste</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual: Royal Thali Feast with Floating Note */}
            <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
              {/* Handwritten Note floating over top right */}
              <div className="absolute -top-6 right-4 sm:right-10 z-20 font-handwriting text-[#E5C378] text-3xl sm:text-4xl rotate-6 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] select-none">
                Food Looks Better in 3D
              </div>

              {/* Main Circular/Pill Framed Hero Feast */}
              <div className="relative w-full max-w-lg aspect-[4/3] rounded-3xl overflow-hidden border-2 border-[#D4AF37]/30 shadow-[0_12px_50px_rgba(0,0,0,0.7)] group">
                <Image
                  src="/images/hero_thali.jpg"
                  alt="Royal Indian Thali Feast in 3D"
                  fill
                  priority
                  className="object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06130B]/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-xs text-[#E5C378] bg-[#06130B]/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-[#D4AF37]/20">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Pure Vegetarian & Gourmet Delicacies</span>
                  </span>
                  <span className="font-bold text-white uppercase tracking-wider text-[10px] bg-[#D4AF37]/20 px-2 py-0.5 rounded">
                    3D Enabled
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3. THREE FEATURE CARDS (Glassmorphic) */}
      {/* ==================================================================== */}
      <section id="how-it-works" className="py-12 bg-[#040E08] border-y border-[#D4AF37]/15 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Card 1: Scan & Explore */}
            <div className="bg-[#0A2114]/70 backdrop-blur-md border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-[0_10px_35px_rgba(212,175,55,0.12)] group">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#06170D] border border-[#D4AF37]/40 flex items-center justify-center text-[#ECC876] mb-6 group-hover:scale-110 transition-transform">
                <QrCode className="w-7 h-7 stroke-[1.8]" />
              </div>
              <h3 className="font-luxury text-xl font-bold text-white mb-3">Scan & Explore</h3>
              <p className="text-xs sm:text-sm text-[#9BB39A] leading-relaxed">
                Scan a QR code at your table and instantly open the digital menu on your phone with zero app download required.
              </p>
            </div>

            {/* Card 2: 3D AR Preview */}
            <div className="bg-[#0A2114]/70 backdrop-blur-md border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-[0_10px_35px_rgba(212,175,55,0.12)] group">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#06170D] border border-[#D4AF37]/40 flex items-center justify-center text-[#ECC876] mb-6 group-hover:scale-110 transition-transform">
                <Box className="w-7 h-7 stroke-[1.8]" />
              </div>
              <h3 className="font-luxury text-xl font-bold text-white mb-3">3D AR Preview</h3>
              <p className="text-xs sm:text-sm text-[#9BB39A] leading-relaxed">
                View realistic 3D models of every dish and see exactly what you&apos;re ordering with Augmented Reality right on your table.
              </p>
            </div>

            {/* Card 3: Freshly Curated Menu */}
            <div className="bg-[#0A2114]/70 backdrop-blur-md border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-[0_10px_35px_rgba(212,175,55,0.12)] group">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#06170D] border border-[#D4AF37]/40 flex items-center justify-center text-[#ECC876] mb-6 group-hover:scale-110 transition-transform">
                <Leaf className="w-7 h-7 stroke-[1.8]" />
              </div>
              <h3 className="font-luxury text-xl font-bold text-white mb-3">Freshly Curated Menu</h3>
              <p className="text-xs sm:text-sm text-[#9BB39A] leading-relaxed">
                Explore authentic recipes with portion sizes, dietary information, chef recommendations, and real-time live availability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. SECTION: A NEW WAY TO DINE (Biryani & Phone AR) */}
      {/* ==================================================================== */}
      <section className="py-20 md:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column Content */}
            <div className="lg:col-span-5">
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#C6A24D]">
                More Than Just A Menu
              </span>
              <h2 className="font-luxury text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight mt-3 mb-6">
                A New Way to Dine
              </h2>
              <p className="text-sm sm:text-base text-[#B3C7B2] leading-relaxed mb-8">
                PRASADAM DINE brings traditional dining into the future with interactive 3D visualization,
                smart digital menus and seamless dining experiences for modern restaurants.
              </p>
              <a
                href="#ar-experience"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#ECC876] via-[#D4AF37] to-[#B8860B] text-[#0A180E] font-bold text-xs uppercase tracking-[0.14em] px-7 py-3.5 rounded-full shadow-md hover:scale-105 transition-all"
              >
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </a>
            </div>

            {/* Right Column Visual: Steaming Biryani & Phone Preview */}
            <div className="lg:col-span-7 relative flex justify-center">
              <div className="absolute -top-6 right-6 font-handwriting text-[#E5C378] text-2xl sm:text-3xl -rotate-6 select-none z-10">
                See Food in Augmented Reality
              </div>
              <div className="relative w-full max-w-xl aspect-[4/3] rounded-3xl overflow-hidden border border-[#D4AF37]/30 shadow-2xl group">
                <Image
                  src="/images/biryani_ar.jpg"
                  alt="Steaming Saffron Biryani with Phone AR"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06130B]/70 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. SECTION: SEE IT BEFORE YOU TASTE IT (AR in Hand) */}
      {/* ==================================================================== */}
      <section id="ar-experience" className="py-20 md:py-28 bg-[#040E08] border-y border-[#D4AF37]/15 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Visual: Smartphone AR in hand */}
            <div className="lg:col-span-6 order-2 lg:order-1 relative flex justify-center">
              <div className="absolute -top-6 left-6 font-handwriting text-[#E5C378] text-2xl sm:text-3xl rotate-[-4deg] select-none z-10">
                From Menu to Your Table
              </div>
              <div className="relative w-full max-w-lg aspect-[4/3] rounded-3xl overflow-hidden border border-[#D4AF37]/30 shadow-2xl group">
                <Image
                  src="/images/phone_ar.jpg"
                  alt="Smartphone camera placing 3D dish on table in Augmented Reality"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06130B]/60 via-transparent to-transparent" />
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-6 order-1 lg:order-2">
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#C6A24D]">
                Interactive 3D Experience
              </span>
              <h2 className="font-luxury text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight mt-3 mb-6">
                See It Before You Taste It
              </h2>
              <p className="text-sm sm:text-base text-[#B3C7B2] leading-relaxed mb-8">
                Explore our dishes in <strong className="text-white">stunning 3D and Augmented Reality</strong>.
                Zoom, rotate and view every detail, including ingredients, portion size and dietary information,
                before you place your order.
              </p>

              {/* 4 Feature Badges in a Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#D4AF37]/15">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#081F12] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mb-2.5">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-white">Vegetarian & Vegan Tags</div>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#081F12] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mb-2.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-white">Allergen Information</div>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#081F12] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mb-2.5">
                    <Box className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-white">Interactive 3D Models</div>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#081F12] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mb-2.5">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-white">Works on All Devices</div>
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
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#C6A24D]">
                Featured Dishes
              </span>
              <h2 className="font-luxury text-4xl sm:text-5xl font-bold text-white tracking-tight mt-2">
                Our Popular Dishes
              </h2>
              <p className="text-sm text-[#A3B899] mt-2">
                Authentic flavours, beautifully presented in 3D
              </p>
            </div>

            <Link
              href="/r/prasadam-divine"
              className="inline-flex items-center gap-2 border border-[#D4AF37]/50 text-[#F3E2B8] hover:bg-[#D4AF37]/15 px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all self-start sm:self-auto"
            >
              <span>View Full Menu</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 4 Dish Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dishes.map((dish) => (
              <div
                key={dish.id}
                onClick={() => setSelectedDish(dish)}
                className="bg-[#0A2114]/80 backdrop-blur-md rounded-2xl overflow-hidden border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 transition-all duration-300 hover:shadow-[0_12px_35px_rgba(212,175,55,0.18)] hover:-translate-y-1 cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  {/* Food Image Container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#06170D]">
                    <Image
                      src={dish.image}
                      alt={dish.name}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute top-3 right-3 bg-[#06130B]/85 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-[#E5C378] border border-[#D4AF37]/30 flex items-center gap-1.5 shadow-sm">
                      <Box className="w-3 h-3" />
                      <span>3D View</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    <h3 className="font-luxury text-lg font-bold text-white mb-1.5 group-hover:text-[#F3D079] transition-colors">
                      {dish.name}
                    </h3>
                    <p className="text-xs text-[#9BB39A] leading-relaxed line-clamp-2">
                      {dish.description}
                    </p>
                  </div>
                </div>

                {/* Footer with Dietary Tag and Price */}
                <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-[#D4AF37]/10">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                        dish.isVeg ? 'border-emerald-500 bg-emerald-950/60' : 'border-red-500 bg-red-950/60'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${dish.isVeg ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    </span>
                    <span className="text-[11px] font-semibold text-[#C3D4C1]">
                      {dish.tag}
                    </span>
                  </div>

                  <span className="text-base font-bold text-[#F3D079] font-luxury">
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
      <section className="py-20 md:py-28 bg-[#040E08] border-t border-[#D4AF37]/15 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Visual: Laptop Dashboard */}
            <div className="lg:col-span-7 relative flex justify-center">
              <div className="relative w-full max-w-xl aspect-[4/3] rounded-3xl overflow-hidden border border-[#D4AF37]/30 shadow-2xl group">
                <Image
                  src="/images/laptop_dashboard.jpg"
                  alt="Prasadam Dine Restaurant Management Dashboard on Laptop"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06130B]/50 via-transparent to-transparent" />
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-5">
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#C6A24D]">
                For Restaurant Owners
              </span>
              <h2 className="font-luxury text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight mt-3 mb-6">
                Manage Your Restaurant with Ease
              </h2>
              <p className="text-sm sm:text-base text-[#B3C7B2] leading-relaxed mb-8">
                Add and manage dishes, update prices, set availability, upload 3D models,
                generate QR codes and much more from a powerful dashboard.
              </p>

              {/* 5 Features List */}
              <div className="flex flex-col gap-3.5 mb-9">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#0E2819] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-white">Menu & Dish Management</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#0E2819] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                    <Box className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-white">3D Model Uploads</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#0E2819] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                    <QrCode className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-white">QR Code Generation</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#0E2819] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-white">Staff & Role Management</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#0E2819] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-white">Real-time Updates</span>
                </div>
              </div>

              {/* CTA Button */}
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#ECC876] via-[#D4AF37] to-[#B8860B] text-[#0A180E] font-bold text-xs uppercase tracking-[0.14em] px-8 py-4 rounded-full shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:scale-105 transition-all"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 8. FOOTER */}
      {/* ==================================================================== */}
      <footer className="bg-[#030B06] border-t border-[#D4AF37]/15 pt-16 pb-8 text-[#A1B39F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#D4AF37]/10">
            {/* Logo Column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <svg viewBox="0 0 40 40" className="w-8 h-8 text-[#D4AF37] fill-current">
                  <path d="M20 5 C22 12, 28 17, 28 23 C28 28, 24 33, 20 35 C16 33, 12 28, 12 23 C12 17, 18 12, 20 5 Z" fill="#ECC876" />
                  <path d="M20 10 C25 15, 35 18, 35 25 C35 30, 28 34, 20 35 C28 32, 30 26, 28 22 C26 18, 22 14, 20 10 Z" fill="#D4AF37" opacity="0.8" />
                  <path d="M20 10 C15 15, 5 18, 5 25 C5 30, 12 34, 20 35 C12 32, 10 26, 12 22 C14 18, 18 14, 20 10 Z" fill="#D4AF37" opacity="0.8" />
                </svg>
                <div>
                  <span className="font-luxury font-bold tracking-[0.22em] text-[#FFF4D4] text-base block leading-none">
                    PRASADAM DINE
                  </span>
                  <span className="text-[8px] font-semibold tracking-[0.3em] text-[#D4AF37]/80 uppercase mt-0.5 block">
                    Divine Food Experience
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#8EA68E] max-w-sm leading-relaxed mb-6">
                Next-generation augmented reality dining platform. Transforming traditional restaurant dining
                into an immersive 3D culinary journey.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-[#FFF4D4] mb-4">
                Quick Links
              </h4>
              <ul className="flex flex-col gap-2.5 text-xs">
                <li><a href="#popular-dishes" className="hover:text-[#F3D079] transition-colors">Menu</a></li>
                <li><Link href="/r/prasadam-divine" className="hover:text-[#F3D079] transition-colors">Explore Restaurants</Link></li>
                <li><a href="#how-it-works" className="hover:text-[#F3D079] transition-colors">How It Works</a></li>
                <li><a href="#ar-experience" className="hover:text-[#F3D079] transition-colors">AR Experience</a></li>
              </ul>
            </div>

            {/* For Restaurants */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-[#FFF4D4] mb-4">
                For Restaurants
              </h4>
              <ul className="flex flex-col gap-2.5 text-xs">
                <li><Link href="/login" className="hover:text-[#F3D079] transition-colors">Partner With Us</Link></li>
                <li><Link href="/login" className="hover:text-[#F3D079] transition-colors">Dashboard Login</Link></li>
                <li><a href="#" className="hover:text-[#F3D079] transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-[#F3D079] transition-colors">Contact Sales</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-[#FFF4D4] mb-4">
                Support
              </h4>
              <ul className="flex flex-col gap-2.5 text-xs">
                <li><a href="#" className="hover:text-[#F3D079] transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-[#F3D079] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#F3D079] transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-[#F3D079] transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#789078] gap-4">
            <div>
              © 2026 PRASADAM DINE. All rights reserved.
            </div>
            <div className="flex items-center gap-3">
              <span>Authentic Food</span>
              <span className="w-1 h-1 rounded-full bg-[#D4AF37]/40" />
              <span>Modern Technology</span>
              <span className="w-1 h-1 rounded-full bg-[#D4AF37]/40" />
              <span>A Better Dining Experience</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ==================================================================== */}
      {/* 9. DISH PREVIEW MODAL */}
      {/* ==================================================================== */}
      {selectedDish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl bg-[#091F13] border border-[#D4AF37]/40 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8">
            <button
              onClick={() => setSelectedDish(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-[#06170D] border border-[#D4AF37]/30 text-[#D4AF37] hover:text-white transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-[#D4AF37]/20 mb-6 bg-[#040D07]">
              <Image
                src={selectedDish.image}
                alt={selectedDish.name}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-[#06130B]/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#E5C378] border border-[#D4AF37]/30">
                {selectedDish.tag}
              </div>
            </div>

            <div className="flex items-baseline justify-between mb-3">
              <h3 className="font-luxury text-2xl font-bold text-white">
                {selectedDish.name}
              </h3>
              <span className="font-luxury text-2xl font-bold text-[#F3D079]">
                {selectedDish.price}
              </span>
            </div>

            <p className="text-sm text-[#B3C7B2] leading-relaxed mb-6">
              {selectedDish.description}
            </p>

            <div className="flex items-center gap-3">
              <Link
                href="/r/prasadam-divine"
                className="flex-1 text-center bg-gradient-to-r from-[#ECC876] via-[#D4AF37] to-[#B8860B] text-[#08170D] font-bold text-xs uppercase tracking-wider py-3.5 rounded-full shadow-md hover:brightness-110 transition"
              >
                Order At Table
              </Link>
              <button
                onClick={() => setSelectedDish(null)}
                className="border border-[#D4AF37]/40 text-[#EDE1CF] text-xs font-semibold uppercase tracking-wider px-6 py-3.5 rounded-full hover:bg-[#D4AF37]/10 transition"
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
