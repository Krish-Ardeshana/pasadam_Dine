'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, Building2, ExternalLink, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Sidebar } from './Sidebar';

export const Header: React.FC<{ onToggleMobile: () => void }> = ({ onToggleMobile }) => {
  const { currentRestaurant, isSuperAdmin } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-[#DCD5C9] px-6 flex items-center justify-between z-10 shrink-0 shadow-none rounded-none">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="md:hidden p-2 rounded-none text-[#1C120C] hover:bg-[#EDE1CF] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {currentRestaurant ? (
          <div className="flex items-center gap-2 bg-[#FAF8F5] px-3.5 py-1.5 rounded-none border border-[#DCD5C9]">
            <Building2 className="w-4 h-4 text-[#90323D]" />
            <span className="text-xs font-black text-[#5E0B15] uppercase tracking-wider">
              {currentRestaurant.name}
            </span>
            <span className="text-[11px] text-[#594B42] hidden sm:inline font-mono">
              ({currentRestaurant.slug})
            </span>
          </div>
        ) : isSuperAdmin ? (
          <div className="flex items-center gap-2 bg-[#EDE1CF] px-3.5 py-1.5 rounded-none border border-[#DCD5C9]">
            <ShieldAlert className="w-4 h-4 text-[#90323D]" />
            <span className="text-xs font-black text-[#5E0B15] uppercase tracking-wider">
              Super Admin Console
            </span>
          </div>
        ) : (
          <span className="text-xs font-bold text-[#594B42] uppercase tracking-wider">
            Restaurant Management Portal
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {currentRestaurant?.slug && (
          <Link
            href={`/r/${currentRestaurant.slug}`}
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 text-xs font-black text-[#90323D] hover:text-[#7A2731] uppercase tracking-wider px-3 py-1.5 rounded-none hover:bg-[#EDE1CF] transition-colors border border-transparent hover:border-[#DCD5C9]"
          >
            <span>Live Menu</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
        <div className="h-4 w-px bg-[#DCD5C9] hidden sm:block" />
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-none bg-[#90323D] text-[#EDE1CF] font-black text-xs flex items-center justify-center border border-[#7A2731]">
            PD
          </div>
          <span className="text-xs font-black text-[#5E0B15] uppercase tracking-wider hidden sm:inline">
            PRASADAM DINE
          </span>
        </div>
      </div>
    </header>
  );
};

export const DashboardShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8F5F0]">
      {/* Desktop Sidebar (Cordovan/Chocolate) */}
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

      {/* Main Content Area (Warm Almond Canvas) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header onToggleMobile={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#F8F5F0]">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
};
