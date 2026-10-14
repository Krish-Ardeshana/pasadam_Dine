'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, Building2, ExternalLink, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Sidebar } from './Sidebar';

export const Header: React.FC<{ onToggleMobile: () => void }> = ({ onToggleMobile }) => {
  const { currentRestaurant, isSuperAdmin } = useAuth();

  return (
    <header className="h-16 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E0DACF] px-6 flex items-center justify-between z-10 shrink-0 shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="md:hidden p-2 rounded-xl text-[#23201C] hover:bg-[#EFECE5] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {currentRestaurant ? (
          <div className="flex items-center gap-2.5 bg-[#EAF0E9] px-3.5 py-1.5 rounded-xl border border-[#BCD0BD]">
            <Building2 className="w-4 h-4 text-[#5F735F]" />
            <span className="text-xs font-bold text-[#23201C] uppercase tracking-wider">
              {currentRestaurant.name}
            </span>
            <span className="text-[11px] text-[#6D675E] hidden sm:inline">
              ({currentRestaurant.slug})
            </span>
          </div>
        ) : isSuperAdmin ? (
          <div className="flex items-center gap-2.5 bg-[#FEF6E9] px-3.5 py-1.5 rounded-xl border border-[#F4DCB5]">
            <ShieldAlert className="w-4 h-4 text-[#9A6216]" />
            <span className="text-xs font-bold text-[#9A6216] uppercase tracking-wider">
              Super Admin Console
            </span>
          </div>
        ) : (
          <span className="text-xs font-semibold text-[#6D675E] uppercase tracking-wider">
            Restaurant Management Portal
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {currentRestaurant?.slug && (
          <Link
            href={`/r/${currentRestaurant.slug}`}
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#DE6C3A] hover:text-[#C85929] uppercase tracking-wider px-3 py-1.5 rounded-xl hover:bg-[#FDF2EC] transition-colors"
          >
            <span>Live Menu</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
        <div className="h-4 w-px bg-[#E0DACF] hidden sm:block" />
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#DE6C3A] text-white font-black text-xs flex items-center justify-center shadow-xs">
            PD
          </div>
          <span className="text-xs font-bold text-[#23201C] uppercase tracking-wider hidden sm:inline">
            PRASADAM_DINE
          </span>
        </div>
      </div>
    </header>
  );
};

export const DashboardShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F4F0EA]">
      {/* Desktop Sidebar (Sage Green) */}
      <div className="hidden md:flex h-full">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 w-64 h-full flex flex-col shadow-2xl">
            <Sidebar onCloseMobile={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area (Warm Linen Canvas) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header onToggleMobile={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#F4F0EA]">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
};
