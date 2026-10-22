'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
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
  X,
  Menu as MenuIcon,
  User as UserIcon,
  Star,
  ExternalLink,
  Clock,
  Compass,
  Check,
  RotateCw,
} from 'lucide-react';

// Dynamic import for 3D ModelViewer to avoid SSR window issues
const ModelViewer = dynamic(
  () => import('@/components/3d/ModelViewer').then((mod) => mod.ModelViewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[360px] flex flex-col items-center justify-center bg-[#15120E] rounded-3xl border border-amber-900/30 text-amber-200/60 p-6 text-center">
        <RotateCw className="w-8 h-8 animate-spin text-amber-400 mb-3" />
        <p className="text-xs uppercase tracking-widest font-semibold">Loading 3D Spatial Engine...</p>
      </div>
    ),
  },
);

interface DishItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  tag: string;
  isVeg: boolean;
  image: string;
  modelUrl: string;
  calories: string;
  prepTime: string;
  spiceLevel: 'Mild' | 'Medium' | 'Rich & Fragrant';
  ingredients: string[];
}

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroViewMode, setHeroViewMode] = useState<'3d' | 'photo'>('3d');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [inspectDish, setInspectDish] = useState<DishItem | null>(null);

  const dishes: DishItem[] = [
    {
      id: 'royal-biryani',
      name: 'Royal Dum Biryani',
      category: 'signature',
      description:
        'Aged Dehradun basmati rice layered with caramelized onions, saffron-infused milk, crushed green cardamom, and slow-dum spices.',
      price: '₹340',
      tag: 'Chef Signature',
      isVeg: true,
      image: '/images/chicken_biryani.jpg',
      modelUrl: '/models/biryani_rice.glb',
      calories: '490 kcal',
      prepTime: '25 mins',
      spiceLevel: 'Rich & Fragrant',
      ingredients: ['Aged Basmati', 'Kashmiri Saffron', 'Ghee', 'Whole Spices', 'Mint Leaves'],
    },
    {
      id: 'paneer-tikka',
      name: 'Char-Grilled Paneer Tikka',
      category: 'tandoor',
      description:
        'Fresh artisan paneer cubes marinated in hung curd, yellow mustard oil, and hand-ground Degi mirch, slow-cooked over charcoal embers.',
      price: '₹280',
      tag: 'Tandoor Special',
      isVeg: true,
      image: '/images/paneer_butter_masala.jpg',
      modelUrl: '/models/paneer_tikka_platter.glb',
      calories: '380 kcal',
      prepTime: '20 mins',
      spiceLevel: 'Medium',
      ingredients: ['Artisan Malai Paneer', 'Hung Curd', 'Mustard Oil', 'Bell Peppers', 'Kasuri Methi'],
    },
    {
      id: 'dal-makhani',
      name: 'Overnight Slow-Simmered Dal',
      category: 'gravy',
      description:
        'Traditional whole black urad lentils and red kidney beans simmered for 18 hours with vine-ripened tomatoes, white churned butter, and cream.',
      price: '₹240',
      tag: 'Heritage Recipe',
      isVeg: true,
      image: '/images/dal_makhani.jpg',
      modelUrl: '/models/dal_curry.glb',
      calories: '340 kcal',
      prepTime: '15 mins',
      spiceLevel: 'Mild',
      ingredients: ['Whole Black Lentils', 'Makhan', 'Tomato Reduction', 'Cream', 'Fenugreek'],
    },
    {
      id: 'crispy-dosa',
      name: 'Golden Mysore Masala Dosa',
      category: 'traditional',
      description:
        'Stone-ground fermented rice and urad batter spread paper-thin, layered with fiery red garlic chutney and spiced potato bhaji.',
      price: '₹190',
      tag: 'Classic Feast',
      isVeg: true,
      image: '/images/masala_dosa.jpg',
      modelUrl: '/models/pizza.glb',
      calories: '290 kcal',
      prepTime: '12 mins',
      spiceLevel: 'Medium',
      ingredients: ['Fermented Batter', 'Mysore Chutney', 'Potato Masala', 'Coconut Chutney', 'Sambar'],
    },
    {
      id: 'kesari-halwa',
      name: 'Royal Kesari Halwa',
      category: 'dessert',
      description:
        'Moong dal roasted in golden cow ghee, infused with saffron strands, crushed green cardamom, and slivers of toasted almonds.',
      price: '₹180',
      tag: 'Sweet Offering',
      isVeg: true,
      image: '/images/hero_thali.jpg',
      modelUrl: '/models/halwa_dessert.glb',
      calories: '320 kcal',
      prepTime: '10 mins',
      spiceLevel: 'Mild',
      ingredients: ['Moong Dal', 'Pure Desi Ghee', 'Saffron', 'California Almonds', 'Green Cardamom'],
    },
    {
      id: 'kulhad-chai',
      name: 'Kulhad Elaichi Chai',
      category: 'beverage',
      description:
        'Single-estate Assam tea leaves brewed with crushed ginger, whole green cardamom pods, and farm milk, served in an earthen clay kulhad.',
      price: '₹90',
      tag: 'Artisan Brew',
      isVeg: true,
      image: '/images/biryani_ar.jpg',
      modelUrl: '/models/masala_chai.glb',
      calories: '110 kcal',
      prepTime: '8 mins',
      spiceLevel: 'Mild',
      ingredients: ['Assam CTC Tea', 'Whole Cardamom', 'Fresh Ginger', 'Farm Milk', 'Clay Pot'],
    },
  ];

  const filteredDishes =
    selectedCategory === 'all'
      ? dishes
      : dishes.filter((dish) => dish.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#0C0B09] text-[#EDE7DE] font-sans selection:bg-[#C8922C]/30 selection:text-white">
      {/* ==================================================================== */}
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      {/* ==================================================================== */}
      <div className="bg-gradient-to-r from-[#2A080D] via-[#4A0E17] to-[#2A080D] border-b border-amber-500/20 py-2.5 px-4 text-center text-xs tracking-wider font-medium text-amber-200/90 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>Experience Sacred Gastronomy in 3D AR — Live at <strong>Prasadam Divine Heritage</strong></span>
        <Link
          href="/r/prasadam-divine"
          className="underline decoration-amber-400/50 hover:decoration-amber-400 text-amber-300 font-semibold ml-1.5 transition"
        >
          View Live Table Menu →
        </Link>
      </div>

      {/* ==================================================================== */}
      {/* 2. HEADER & NAVIGATION BAR */}
      {/* ==================================================================== */}
      <header className="sticky top-0 z-40 bg-[#0C0B09]/90 backdrop-blur-xl border-b border-[#2D2419]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Identity */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#851E28] via-[#5E0B15] to-[#2D060B] border border-amber-500/30 flex items-center justify-center text-amber-300 shadow-lg shadow-black/60 group-hover:border-amber-400 transition-all">
              <span className="font-luxury font-black text-2xl tracking-tighter">P</span>
            </div>
            <div className="flex flex-col">
              <span className="font-luxury font-bold tracking-[0.22em] text-white text-lg sm:text-xl leading-tight group-hover:text-amber-200 transition-colors">
                PRASADAM DINE
              </span>
              <span className="text-[9px] font-semibold tracking-[0.3em] text-[#C8922C] uppercase">
                Spatial Culinary Dining
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-[#A69C8E]">
            <a href="#signature-dishes" className="hover:text-amber-300 transition-colors">
              Signature Menu
            </a>
            <a href="#how-it-works" className="hover:text-amber-300 transition-colors">
              How It Works
            </a>
            <a href="#spatial-experience" className="hover:text-amber-300 transition-colors">
              3D AR Experience
            </a>
            <Link href="/r/prasadam-divine" className="hover:text-amber-300 transition-colors">
              Featured Restaurant
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3.5">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 border border-[#3E3224] hover:border-[#C8922C]/60 text-[#D8CFBF] hover:text-white px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-[0.15em] transition-all bg-[#17140F]/60"
            >
              <UserIcon className="w-3.5 h-3.5 text-[#C8922C]" />
              <span>Manager Portal</span>
            </Link>

            <Link
              href="/r/prasadam-divine"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C8922C] via-[#E2A740] to-[#C8922C] text-[#161005] font-bold text-xs uppercase tracking-[0.16em] px-6 py-2.5 rounded-full shadow-lg shadow-amber-900/20 hover:brightness-110 hover:scale-[1.02] transition-all"
            >
              <span>Explore Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#C8922C] hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#120F0C] border-b border-[#2D2419] px-6 py-6 flex flex-col gap-4 text-xs font-bold uppercase tracking-widest text-[#D8CFBF]">
            <a
              href="#signature-dishes"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-amber-300"
            >
              Signature Menu
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-amber-300"
            >
              How It Works
            </a>
            <a
              href="#spatial-experience"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-amber-300"
            >
              3D AR Experience
            </a>
            <Link
              href="/r/prasadam-divine"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-amber-300"
            >
              Featured Restaurant
            </Link>
            <div className="pt-3 border-t border-[#2D2419] flex flex-col gap-2.5">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 text-center rounded-xl bg-[#1D1812] border border-[#3E3224] text-white"
              >
                Manager Portal
              </Link>
              <Link
                href="/r/prasadam-divine"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 text-center rounded-xl bg-gradient-to-r from-[#C8922C] to-[#E2A740] text-[#161005] font-bold"
              >
                Explore Live Menu
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ==================================================================== */}
      {/* 3. HERO SECTION — LUXURY DINING MEETS SPATIAL AR */}
      {/* ==================================================================== */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden">
        {/* Subtle Warm Amber Gradient Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-amber-600/10 via-[#4A0E17]/10 to-transparent blur-[140px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Left Narrative Column */}
            <div className="lg:col-span-6 z-10">
              {/* Prestigious Editorial Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1F1710] border border-[#4D361D] text-[#E0A845] text-[11px] font-bold uppercase tracking-[0.24em] mb-7 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#E0A845]" />
                <span>Sacred Flavors • Spatial Gastronomy</span>
              </div>

              {/* Master Headline */}
              <h1 className="font-luxury text-4xl sm:text-6xl xl:text-[68px] font-bold text-white tracking-tight leading-[1.08] mb-6">
                Savor Every Dish in{' '}
                <span className="italic font-normal bg-gradient-to-r from-[#FCE5B8] via-[#E2A740] to-[#C8922C] bg-clip-text text-transparent">
                  True 3D
                </span>{' '}
                Before You Order
              </h1>

              {/* Sophisticated Subtitle */}
              <p className="text-base sm:text-lg text-[#BDB2A3] leading-relaxed max-w-xl mb-9 font-normal">
                Scan your table QR code to project realistic, true-to-scale culinary creations directly onto
                your physical table. Inspect portions, artisan garnishes, and authentic Vedic ingredients with
                Augmented Reality.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 mb-12">
                <Link
                  href="/r/prasadam-divine"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-[#C8922C] via-[#E2A740] to-[#C8922C] text-[#161005] font-bold text-xs uppercase tracking-[0.18em] px-8 py-4 rounded-full shadow-xl shadow-amber-950/40 hover:scale-105 transition-all duration-300"
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>Explore Table Menu</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>

                <a
                  href="#signature-dishes"
                  className="inline-flex items-center gap-2.5 bg-[#17140F] border border-[#3E3224] hover:border-[#C8922C]/70 text-[#D8CFBF] hover:text-white text-xs font-semibold uppercase tracking-[0.18em] px-7 py-4 rounded-full transition-all duration-200"
                >
                  <Box className="w-4 h-4 text-[#C8922C]" />
                  <span>Inspect 3D Dishes</span>
                </a>
              </div>

              {/* Quality & Heritage Metrics */}
              <div className="grid grid-cols-3 gap-6 pt-7 border-t border-[#262017]">
                <div>
                  <div className="text-2xl sm:text-3xl font-luxury font-bold text-white leading-tight">100%</div>
                  <div className="text-[11px] text-[#A69C8E] uppercase tracking-wider font-semibold mt-1">
                    Authentic Recipes
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-luxury font-bold text-[#E0A845] leading-tight">Zero</div>
                  <div className="text-[11px] text-[#A69C8E] uppercase tracking-wider font-semibold mt-1">
                    App Installs Needed
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-luxury font-bold text-white leading-tight">Sub-mm</div>
                  <div className="text-[11px] text-[#A69C8E] uppercase tracking-wider font-semibold mt-1">
                    3D Scale Accuracy
                  </div>
                </div>
              </div>
            </div>

            {/* Right Interactive Showcase Box */}
            <div className="lg:col-span-6 relative">
              {/* Decorative Frame Glow */}
              <div className="relative rounded-3xl bg-gradient-to-br from-[#1E1710] to-[#110E0A] p-2 sm:p-3 border border-[#3E3224] shadow-2xl shadow-black/80">
                {/* Mode Selector Header Bar */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#16120C] rounded-2xl border border-[#2D2419] mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-200/90">
                      Live Interactive Showcase
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-[#0C0A07] p-1 rounded-xl border border-[#282015]">
                    <button
                      onClick={() => setHeroViewMode('3d')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
                        heroViewMode === '3d'
                          ? 'bg-[#C8922C] text-[#161005] shadow'
                          : 'text-[#8E8475] hover:text-white'
                      }`}
                    >
                      3D Spatial View
                    </button>
                    <button
                      onClick={() => setHeroViewMode('photo')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
                        heroViewMode === 'photo'
                          ? 'bg-[#C8922C] text-[#161005] shadow'
                          : 'text-[#8E8475] hover:text-white'
                      }`}
                    >
                      Artisan Photo
                    </button>
                  </div>
                </div>

                {/* Display Canvas: 3D Model Viewer or Royal Thali Image */}
                <div className="relative w-full h-[380px] sm:h-[420px] rounded-2xl overflow-hidden bg-[#0A0806] border border-[#282015] flex items-center justify-center">
                  {heroViewMode === '3d' ? (
                    <div className="w-full h-full relative">
                      <ModelViewer
                        src="/models/biryani_rice.glb"
                        alt="Royal Dum Biryani 3D Interactive Model"
                        dishName="Royal Dum Biryani"
                        category="Signature Biryani"
                        className="w-full h-full"
                      />
                      {/* Interactive Touch Hint Overlay */}
                      <div className="absolute top-4 left-4 pointer-events-none bg-[#110D08]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/30 text-[10px] font-bold text-amber-300 flex items-center gap-2 shadow-lg">
                        <Box className="w-3.5 h-3.5 text-amber-400" />
                        <span>Interactive 3D • Drag to Rotate & Zoom</span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <Image
                        src="/images/hero_thali.jpg"
                        alt="Prasadam Dine Royal Indian Thali Feast"
                        fill
                        priority
                        className="object-cover object-center"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0C0B09]/80 via-transparent to-transparent" />
                    </div>
                  )}
                </div>

                {/* Bottom Spec Sheet Strip */}
                <div className="mt-3 px-4 py-3 bg-[#16120C] rounded-2xl border border-[#2D2419] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </span>
                    <div>
                      <div className="font-bold text-white font-luxury text-sm">Royal Dum Biryani</div>
                      <div className="text-[10px] text-[#A69C8E]">Saffron, Whole Spices, Aged Basmati</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-bold text-[#E0A845] font-luxury">₹340</div>
                    <div className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                      Available On Table
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. THE 3-STEP SPATIAL DINING EXPERIENCE */}
      {/* ==================================================================== */}
      <section id="how-it-works" className="py-20 md:py-28 bg-[#110E0B] border-y border-[#262017] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#C8922C]">
              Frictionless Tabletop Journey
            </span>
            <h2 className="font-luxury text-3xl sm:text-5xl font-bold text-white mt-3">
              How PRASADAM DINE Works
            </h2>
            <p className="text-sm text-[#A69C8E] mt-3 max-w-lg mx-auto leading-relaxed">
              Elevating the restaurant visit into an unforgettable feast for the senses, powered by simple QR interaction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative bg-[#17130F] rounded-3xl p-8 border border-[#2E2419] hover:border-[#C8922C]/50 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-16 h-16 rounded-2xl bg-[#241B12] border border-amber-500/20 flex items-center justify-center text-[#E0A845] mb-6 group-hover:scale-105 group-hover:border-amber-400 transition-all shadow-md">
                <Scan className="w-8 h-8 stroke-[1.8]" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#8E8475] mb-2">
                Stage 01
              </div>
              <h3 className="font-luxury text-2xl font-bold text-white mb-3">Scan Table QR Stand</h3>
              <p className="text-sm text-[#A69C8E] leading-relaxed">
                Aim your phone camera at the customized wooden or metallic QR stand on your table. The interactive restaurant menu opens instantly in your mobile browser without any app download.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative bg-[#17130F] rounded-3xl p-8 border border-[#2E2419] hover:border-[#C8922C]/50 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-16 h-16 rounded-2xl bg-[#241B12] border border-amber-500/20 flex items-center justify-center text-[#E0A845] mb-6 group-hover:scale-105 group-hover:border-amber-400 transition-all shadow-md">
                <Smartphone className="w-8 h-8 stroke-[1.8]" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#8E8475] mb-2">
                Stage 02
              </div>
              <h3 className="font-luxury text-2xl font-bold text-white mb-3">Project in Augmented Reality</h3>
              <p className="text-sm text-[#A69C8E] leading-relaxed">
                Tap &ldquo;View in your space&rdquo; on any dish. Using WebXR and ARKit, the dish appears at 100% scale right on your table so you can inspect portions, garnishes, and appearance before ordering.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative bg-[#17130F] rounded-3xl p-8 border border-[#2E2419] hover:border-[#C8922C]/50 transition-all duration-300 group hover:-translate-y-1">
              <div className="w-16 h-16 rounded-2xl bg-[#241B12] border border-amber-500/20 flex items-center justify-center text-[#E0A845] mb-6 group-hover:scale-105 group-hover:border-amber-400 transition-all shadow-md">
                <ShieldCheck className="w-8 h-8 stroke-[1.8]" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#8E8475] mb-2">
                Stage 03
              </div>
              <h3 className="font-luxury text-2xl font-bold text-white mb-3">Order with Total Peace of Mind</h3>
              <p className="text-sm text-[#A69C8E] leading-relaxed">
                Browse complete allergen warnings, calorie breakdowns, and spice profiles. Send your order directly to the chef&rsquo;s Kitchen Display System with instant Razorpay checkout.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. SIGNATURE DISHES SHOWCASE (With Real 3D Inspection) */}
      {/* ==================================================================== */}
      <section id="signature-dishes" className="py-20 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#C8922C]">
                Artisanal Gastronomy
              </span>
              <h2 className="font-luxury text-3xl sm:text-5xl font-bold text-white mt-2">
                Signature Culinary Creations
              </h2>
              <p className="text-sm text-[#A69C8E] mt-2">
                Select any delicacy below to inspect its detailed 3D spatial model, ingredients, and preparation notes.
              </p>
            </div>

            <Link
              href="/r/prasadam-divine"
              className="inline-flex items-center gap-2 bg-[#1B1610] border border-[#3E3224] hover:border-[#C8922C] text-[#E0A845] px-6 py-3 rounded-full text-xs uppercase tracking-wider font-bold transition shadow-sm self-start md:self-auto"
            >
              <span>Explore Complete Menu</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Dish Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDishes.map((dish) => (
              <div
                key={dish.id}
                className="bg-[#15110D] rounded-3xl overflow-hidden border border-[#2B2218] hover:border-[#C8922C]/60 transition-all duration-300 hover:shadow-2xl hover:shadow-black group flex flex-col justify-between"
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
                    <Image
                      src={dish.image}
                      alt={dish.name}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#15110D] via-transparent to-transparent opacity-80" />

                    {/* Tag Chip */}
                    <div className="absolute top-4 left-4 bg-[#110D08]/90 backdrop-blur-md px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-amber-300 border border-amber-500/30">
                      {dish.tag}
                    </div>

                    {/* 3D Action Chip */}
                    <button
                      onClick={() => setInspectDish(dish)}
                      className="absolute top-4 right-4 bg-[#C8922C] text-[#161005] px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg hover:brightness-110 transition"
                    >
                      <Box className="w-3 h-3" />
                      <span>Inspect 3D</span>
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full border border-emerald-500 bg-emerald-950 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        </span>
                        <span className="text-[11px] font-semibold text-[#8E8475] uppercase tracking-wider">
                          {dish.spiceLevel}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-[#8E8475] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#C8922C]" />
                        <span>{dish.prepTime}</span>
                      </span>
                    </div>

                    <h3 className="font-luxury text-xl font-bold text-white mb-2 group-hover:text-amber-200 transition-colors">
                      {dish.name}
                    </h3>
                    <p className="text-xs text-[#A69C8E] leading-relaxed line-clamp-2 mb-4">
                      {dish.description}
                    </p>

                    {/* Ingredients preview tags */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {dish.ingredients.slice(0, 3).map((ing, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium text-[#B8AE9F] bg-[#1F1913] border border-[#2E2419] px-2.5 py-0.5 rounded-md"
                        >
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Strip */}
                <div className="px-6 py-4 bg-[#1A1510] border-t border-[#262017] flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-[#E0A845] font-luxury">
                      {dish.price}
                    </span>
                    <span className="text-[10px] text-[#8E8475] ml-1.5">net</span>
                  </div>

                  <button
                    onClick={() => setInspectDish(dish)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 hover:text-white transition"
                  >
                    <span>View in 3D</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 6. IMMERSIVE VISUAL EXPERIENCE SECTION (Tabletop AR) */}
      {/* ==================================================================== */}
      <section id="spatial-experience" className="py-20 md:py-28 bg-[#110E0B] border-y border-[#262017] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Visual Photography */}
            <div className="lg:col-span-6 relative flex justify-center">
              <div className="relative w-full max-w-lg aspect-[4/3] rounded-3xl overflow-hidden border border-[#3E3224] shadow-2xl bg-black">
                <Image
                  src="/images/phone_ar.jpg"
                  alt="Diner using mobile camera to project steaming dish on restaurant table"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0C0B09]/80 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 bg-[#17130F]/90 backdrop-blur-md p-4 rounded-2xl border border-amber-500/20 text-xs text-[#D8CFBF]">
                  <div className="flex items-center gap-2 text-amber-300 font-bold mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Real-Time Spatial Depth Mapping</span>
                  </div>
                  <p className="text-[11px] text-[#A69C8E]">
                    Built with Apple ARKit & Google ARCore web standards. No app installation required.
                  </p>
                </div>
              </div>
            </div>

            {/* Editorial Content */}
            <div className="lg:col-span-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#C8922C]">
                Gastronomy Meets Space
              </span>
              <h2 className="font-luxury text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight mt-3 mb-6">
                See What You Eat, Before You Take a Seat
              </h2>
              <p className="text-sm sm:text-base text-[#BDB2A3] leading-relaxed mb-8">
                Eliminate order uncertainty forever. PRASADAM DINE bridges centuries-old Vedic recipes
                with precision spatial photogrammetry so you know the exact portion size, garnish balance,
                and visual splendor before the dish is cooked.
              </p>

              {/* 4 Feature Badges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#17130F] border border-[#2B2218]">
                  <Leaf className="w-5 h-5 text-emerald-400 mb-2" />
                  <div className="text-xs font-bold text-white">Satvik & Vegan Badges</div>
                  <div className="text-[10px] text-[#8E8475] mt-1">Verified ingredient sourcing</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#17130F] border border-[#2B2218]">
                  <ShieldCheck className="w-5 h-5 text-[#E0A845] mb-2" />
                  <div className="text-xs font-bold text-white">Allergen Safety</div>
                  <div className="text-[10px] text-[#8E8475] mt-1">Nut, dairy & gluten tags</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#17130F] border border-[#2B2218]">
                  <Box className="w-5 h-5 text-amber-400 mb-2" />
                  <div className="text-xs font-bold text-white">True 3D Models</div>
                  <div className="text-[10px] text-[#8E8475] mt-1">Sub-millimeter mesh precision</div>
                </div>

                <div className="p-4 rounded-2xl bg-[#17130F] border border-[#2B2218]">
                  <Smartphone className="w-5 h-5 text-sky-400 mb-2" />
                  <div className="text-xs font-bold text-white">Zero App Installs</div>
                  <div className="text-[10px] text-[#8E8475] mt-1">Works in iOS & Android browser</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 7. RESTAURANT PARTNER & MANAGEMENT PORTAL */}
      {/* ==================================================================== */}
      <section className="py-20 md:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#C8922C]">
                For Restaurant Owners & Managers
              </span>
              <h2 className="font-luxury text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight mt-3 mb-6">
                Modern Operations for Modern Hospitality
              </h2>
              <p className="text-sm sm:text-base text-[#BDB2A3] leading-relaxed mb-8">
                Empower your restaurant with an enterprise multi-tenant management portal.
                Upload 3D food models, print high-resolution branded table QR stands, monitor live kitchen orders
                with SSE, and accept automated Razorpay payments.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  'Instant QR Code Table Stand Generator with High-Res Download',
                  'Cloudinary 3D Model Asset Pipeline (.glb / .gltf support)',
                  'Real-Time Kitchen Display System (KDS) with SSE Live Feeds',
                  'Role-Based Multi-Tenant Access for Owners, Managers & Kitchen Staff',
                  'Instant Razorpay Payment Verification & Tenant-Isolated Refunds',
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#241A11] border border-amber-500/30 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-[#E0A845]" />
                    </div>
                    <span className="text-xs font-semibold text-[#D8CFBF]">{feat}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/login"
                className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#C8922C] via-[#E2A740] to-[#C8922C] text-[#161005] font-bold text-xs uppercase tracking-[0.16em] px-8 py-4 rounded-full shadow-lg shadow-amber-950/40 hover:scale-105 transition-all"
              >
                <span>Access Management Portal</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>

            {/* Right Visual: Laptop Dashboard */}
            <div className="lg:col-span-7 order-1 lg:order-2 relative flex justify-center">
              <div className="relative w-full max-w-xl aspect-[4/3] rounded-3xl overflow-hidden border border-[#3E3224] shadow-2xl bg-black">
                <Image
                  src="/images/laptop_dashboard.jpg"
                  alt="Prasadam Dine Restaurant Management Dashboard on Laptop"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0C0B09]/70 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 bg-[#17130F]/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">Platform Administrator Portal</div>
                    <div className="text-[11px] text-[#A69C8E]">Live metrics, order volume & kitchen display</div>
                  </div>
                  <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[10px] rounded-full uppercase">
                    Admin Ready
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 8. FOOTER */}
      {/* ==================================================================== */}
      <footer className="bg-[#080705] border-t border-[#262017] pt-16 pb-8 text-[#8E8475]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#262017]">
            {/* Logo Col */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#851E28] to-[#5E0B15] border border-amber-500/30 flex items-center justify-center text-amber-300 font-luxury font-black text-xl">
                  P
                </div>
                <div>
                  <span className="font-luxury font-bold tracking-[0.2em] text-white text-base block leading-none">
                    PRASADAM DINE
                  </span>
                  <span className="text-[8px] font-semibold tracking-[0.28em] text-[#C8922C] uppercase mt-1 block">
                    Spatial Culinary Dining
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#8E8475] max-w-sm leading-relaxed mb-6 font-normal">
                Next-generation augmented reality restaurant platform. Blending centuries-old culinary heritage with modern spatial computing.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-4">
                Guest Experience
              </h4>
              <ul className="flex flex-col gap-2.5 text-xs">
                <li><a href="#signature-dishes" className="hover:text-amber-300 transition-colors">Signature Menu</a></li>
                <li><Link href="/r/prasadam-divine" className="hover:text-amber-300 transition-colors">Explore Restaurant</Link></li>
                <li><a href="#how-it-works" className="hover:text-amber-300 transition-colors">How It Works</a></li>
                <li><a href="#spatial-experience" className="hover:text-amber-300 transition-colors">3D AR Technology</a></li>
              </ul>
            </div>

            {/* For Restaurants */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-4">
                Hospitality Partners
              </h4>
              <ul className="flex flex-col gap-2.5 text-xs">
                <li><Link href="/login" className="hover:text-amber-300 transition-colors">Owner & Staff Login</Link></li>
                <li><Link href="/login" className="hover:text-amber-300 transition-colors">Partner With Us</Link></li>
                <li><a href="#" className="hover:text-amber-300 transition-colors">Table QR Stands</a></li>
                <li><a href="#" className="hover:text-amber-300 transition-colors">Kitchen Display KDS</a></li>
              </ul>
            </div>

            {/* Safety & Compliance */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-4">
                Standards
              </h4>
              <ul className="flex flex-col gap-2.5 text-xs">
                <li><span className="text-[#A69C8E]">100% Satvik Verified</span></li>
                <li><span className="text-[#A69C8E]">FSSAI Allergen Tagging</span></li>
                <li><span className="text-[#A69C8E]">Secure Razorpay PCI-DSS</span></li>
                <li><span className="text-[#A69C8E]">GDPR & Privacy First</span></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#6E6557] gap-4">
            <div>
              © 2026 PRASADAM DINE. All rights reserved. Built with devotion & spatial technology.
            </div>
            <div className="flex items-center gap-3">
              <span>Pure Food</span>
              <span className="w-1 h-1 rounded-full bg-[#3D3528]" />
              <span>Realistic 3D Models</span>
              <span className="w-1 h-1 rounded-full bg-[#3D3528]" />
              <span>Augmented Reality Dining</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ==================================================================== */}
      {/* 9. REAL 3D DISH INSPECTION MODAL */}
      {/* ==================================================================== */}
      {inspectDish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[#15110D] border border-[#3E3224] rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8">
            {/* Close Button */}
            <button
              onClick={() => setInspectDish(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-[#241B12] border border-[#3E3224] text-[#D8CFBF] hover:text-white transition z-20"
              aria-label="Close 3D Preview"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Live 3D Model Viewer Inside Modal */}
            <div className="relative w-full h-[320px] sm:h-[360px] rounded-2xl overflow-hidden border border-[#2E2419] bg-[#0A0806] mb-6">
              <ModelViewer
                src={inspectDish.modelUrl}
                poster={inspectDish.image}
                alt={inspectDish.name}
                dishName={inspectDish.name}
                category={inspectDish.category}
                className="w-full h-full"
              />
              <div className="absolute top-3 left-3 bg-[#110D08]/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-amber-300 border border-amber-500/30">
                Interactive 3D • Rotate & Zoom
              </div>
            </div>

            {/* Dish Title & Price */}
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="font-luxury text-2xl sm:text-3xl font-bold text-white">
                {inspectDish.name}
              </h3>
              <span className="font-luxury text-2xl font-bold text-[#E0A845]">
                {inspectDish.price}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#BDB2A3] leading-relaxed mb-5">
              {inspectDish.description}
            </p>

            {/* Artisan Ingredients List */}
            <div className="mb-6">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#C8922C] mb-2">
                Artisan Ingredients & Highlights
              </div>
              <div className="flex flex-wrap gap-2">
                {inspectDish.ingredients.map((ing, i) => (
                  <span
                    key={i}
                    className="text-xs font-medium text-[#D8CFBF] bg-[#221A13] border border-[#382C1F] px-3 py-1 rounded-lg"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-3 pt-4 border-t border-[#262017]">
              <Link
                href="/r/prasadam-divine"
                className="flex-1 text-center bg-gradient-to-r from-[#C8922C] via-[#E2A740] to-[#C8922C] text-[#161005] font-bold text-xs uppercase tracking-[0.16em] py-4 rounded-full shadow-lg shadow-amber-950/40 hover:brightness-110 transition"
              >
                Order On Table Menu
              </Link>
              <button
                onClick={() => setInspectDish(null)}
                className="border border-[#3E3224] text-[#D8CFBF] text-xs font-bold uppercase tracking-wider px-6 py-4 rounded-full hover:bg-[#241B12] transition"
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
