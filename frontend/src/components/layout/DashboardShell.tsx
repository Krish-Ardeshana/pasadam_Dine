'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Building2, ExternalLink, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Sidebar } from './Sidebar';

export const Header: React.FC<{ onToggleMobile: () => void }> = ({ onToggleMobile }) => {
  const { currentRestaurant, isSuperAdmin } = useAuth();

  return (
    <header className="h-14 bg-white border-b border-[#DECDB5] px-6 flex items-center justify-between z-10 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="md:hidden p-1.5 text-[#5E0B15] hover:bg-[#EDE1CF] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {currentRestaurant ? (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#90323D]" />
            <span className="text-xs font-bold text-[#1C120C] uppercase tracking-wider">
              {currentRestaurant.name}
            </span>
            <span className="text-[10px] text-[#594B42] hidden sm:inline">
              ({currentRestaurant.slug})
            </span>
          </div>
        ) : isSuperAdmin ? (
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#90323D]" />
            <span className="text-xs font-bold text-[#1C120C] uppercase tracking-wider">
              Super Admin Console
            </span>
          </div>
        ) : (
          <span className="text-xs font-semibold text-[#594B42] uppercase tracking-wider">
            Restaurant Management Portal
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {currentRestaurant?.slug && (
          <Link
            href={`/r/${currentRestaurant.slug}`}
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#90323D] hover:text-[#5E0B15] uppercase tracking-wider"
          >
            <span>Live Menu</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
        <div className="h-4 w-px bg-[#DECDB5] hidden sm:block" />
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#5E0B15] text-[#EDE1CF] font-bold text-xs flex items-center justify-center">
            PD
          </div>
          <span className="text-xs font-bold text-[#1C120C] uppercase tracking-wider hidden sm:inline">
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
    <div className="flex h-screen w-screen overflow-hidden bg-[#EDE1CF]">
      {/* Desktop Sidebar (30% Cordovan) */}
      <div className="hidden md:flex h-full">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 w-64 h-full flex flex-col">
            <Sidebar onCloseMobile={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area (60% Almond) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header onToggleMobile={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6 bg-[#EDE1CF]">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
};
