'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, Building2, ExternalLink, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Sidebar } from './Sidebar';

export const Header: React.FC<{ onToggleMobile: () => void }> = ({ onToggleMobile }) => {
  const { currentRestaurant, isSuperAdmin } = useAuth();

  return (
    <header className="h-16 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#E8DEC9] px-6 flex items-center justify-between z-10 shrink-0 shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="md:hidden p-2 rounded-xl text-[#1C120C] hover:bg-[#FAF7F2] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {currentRestaurant ? (
          <div className="flex items-center gap-2 bg-[#FAF7F2] px-3.5 py-1.5 rounded-xl border border-[#E8DEC9]">
            <Building2 className="w-4 h-4 text-[#7A0C1E]" />
            <span className="text-xs font-black text-[#7A0C1E] uppercase tracking-wider">
              {currentRestaurant.name}
            </span>
            <span className="text-[11px] text-[#6E5D53] hidden sm:inline font-mono">
              ({currentRestaurant.slug})
            </span>
          </div>
        ) : isSuperAdmin ? (
          <div className="flex items-center gap-2 bg-[#FEF3C7] px-3.5 py-1.5 rounded-xl border border-[#F59E0B]/40">
            <ShieldAlert className="w-4 h-4 text-[#B45309]" />
            <span className="text-xs font-black text-[#92400E] uppercase tracking-wider">
              Super Admin Console
            </span>
          </div>
        ) : (
          <span className="text-xs font-bold text-[#6E5D53] uppercase tracking-wider">
            Restaurant Management Portal
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {currentRestaurant?.slug && (
          <Link
            href={`/r/${currentRestaurant.slug}`}
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#7A0C1E] bg-[#FEF3C7] hover:bg-[#FDE68A] uppercase tracking-wider px-3.5 py-1.5 rounded-xl transition-all border border-[#F59E0B]/40 shadow-xs"
          >
            <span>Live Menu</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
        <div className="h-4 w-px bg-[#E8DEC9] hidden sm:block" />
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8B1226] to-[#680514] text-[#FDE68A] font-black text-xs flex items-center justify-center shadow-xs">
            AR
          </div>
          <span className="text-xs font-black text-[#7A0C1E] uppercase tracking-wider hidden sm:inline">
            AR_DINE
          </span>
        </div>
      </div>
    </header>
  );
};

export const DashboardShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAF7F2]">
      {/* Desktop Sidebar (Glossy Maroon) */}
      <div className="hidden md:flex h-full">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-150">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 w-64 h-full flex flex-col shadow-2xl">
            <Sidebar onCloseMobile={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area (Milky White Canvas) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header onToggleMobile={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#FAF7F2]">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
};
