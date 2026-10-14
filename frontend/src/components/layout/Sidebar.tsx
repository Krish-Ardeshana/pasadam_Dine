'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  UtensilsCrossed,
  LayoutDashboard,
  Layers,
  FileImage,
  QrCode,
  Users,
  Settings,
  Building2,
  ExternalLink,
  ChevronDown,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const pathname = usePathname();
  const { user, isSuperAdmin, currentRestaurant, setCurrentRestaurant, logout } = useAuth();

  const assignedRestaurants = (user?.restaurantAssignments || []).filter(
    (r): r is any => typeof r === 'object' && r !== null,
  );

  const adminNav = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Restaurants', href: '/admin/restaurants', icon: Building2 },
    { label: 'Platform Users', href: '/admin/users', icon: Users },
  ];

  const restaurantNav = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Menu Categories', href: '/dashboard/categories', icon: Layers },
    { label: 'Dishes & 3D AR', href: '/dashboard/dishes', icon: UtensilsCrossed },
    { label: 'Media Assets', href: '/dashboard/media', icon: FileImage },
    { label: 'QR Dining Codes', href: '/dashboard/qr', icon: QrCode },
    { label: 'Staff Team', href: '/dashboard/staff', icon: Users },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const navItems = isSuperAdmin && pathname.startsWith('/admin') ? adminNav : restaurantNav;

  return (
    <aside className="w-64 bg-[#829582] text-white flex flex-col h-full border-r border-[#6C806C] shrink-0 select-none shadow-sm">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#667966] bg-[#728572]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#DE6C3A] text-white rounded-xl flex items-center justify-center font-black text-lg border border-white/20 shadow-sm">
            P
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-widest text-[#FAF7F2] uppercase">
              PRASADAM_DINE
            </h1>
            <p className="text-[10px] font-semibold tracking-wider text-[#E8EFE8] uppercase">
              AR Smart Dining System
            </p>
          </div>
        </div>
      </div>

      {/* Multi-Restaurant Switcher */}
      {!isSuperAdmin && assignedRestaurants.length > 0 && (
        <div className="px-4 py-3 bg-[#6C806C] border-b border-[#607360]">
          <label className="text-[10px] font-bold tracking-wider text-[#FAF7F2]/90 uppercase block mb-1.5">
            Active Restaurant
          </label>
          <div className="relative">
            <select
              value={currentRestaurant?._id || ''}
              onChange={(e) => {
                const found = assignedRestaurants.find((r) => r._id === e.target.value);
                if (found) setCurrentRestaurant(found);
              }}
              className="w-full bg-[#FAF7F2] text-[#23201C] text-xs font-semibold px-3 py-2 rounded-lg border border-[#BCD0BD] appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#829582] shadow-xs"
            >
              {assignedRestaurants.map((r) => (
                <option key={r._id} value={r._id} className="bg-white text-[#23201C]">
                  {r.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#23201C]/70 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={clsx(
                'flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all duration-150',
                isActive
                  ? 'bg-[#F4F0EA] text-[#23201C] shadow-xs font-bold'
                  : 'text-[#F4F0EA]/85 hover:bg-[#728572] hover:text-white',
              )}
            >
              <Icon className={clsx('w-4 h-4 shrink-0', isActive ? 'text-[#DE6C3A]' : 'text-white/80')} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Super Admin Switch Mode Link */}
        {isSuperAdmin && (
          <div className="pt-4 mt-4 border-t border-[#6C806C]">
            {pathname.startsWith('/admin') ? (
              <Link
                href="/dashboard"
                onClick={onCloseMobile}
                className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xl text-[#FAF7F2] hover:bg-[#728572] hover:text-white transition-colors"
              >
                <Building2 className="w-4 h-4 shrink-0 text-[#FAF7F2]" />
                <span>Go to Restaurant Ops</span>
              </Link>
            ) : (
              <Link
                href="/admin"
                onClick={onCloseMobile}
                className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xl text-[#FAF7F2] hover:bg-[#728572] hover:text-white transition-colors"
              >
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#FAF7F2]" />
                <span>Go to Super Admin</span>
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* User Footer Profile & Logout */}
      <div className="p-4 border-t border-[#607360] bg-[#728572]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#DE6C3A] border border-white/20 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#FAF7F2] truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-[#E8EFE8] uppercase truncate tracking-wider">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Log Out"
            className="p-1.5 rounded-lg text-[#FAF7F2]/80 hover:text-white hover:bg-[#607360] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
