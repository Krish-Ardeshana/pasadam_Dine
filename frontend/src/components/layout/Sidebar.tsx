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
import { Role } from '@/lib/types';

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
    <aside className="w-64 bg-[#90323D] text-white flex flex-col h-full border-r border-[#782732] shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#782732] bg-[#782732]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#5E0B15] text-[#EDE1CF] flex items-center justify-center font-black text-lg border border-[#EDE1CF]/20">
            P
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-widest text-[#EDE1CF] uppercase">
              PRASADAM_DINE
            </h1>
            <p className="text-[10px] tracking-wider text-[#EDE1CF]/70 uppercase">
              AR Smart Dining System
            </p>
          </div>
        </div>
      </div>

      {/* Multi-Restaurant Switcher */}
      {!isSuperAdmin && assignedRestaurants.length > 0 && (
        <div className="px-4 py-3 bg-[#782732]/60 border-b border-[#782732]">
          <label className="text-[10px] font-bold tracking-wider text-[#EDE1CF]/70 uppercase block mb-1">
            Active Restaurant
          </label>
          <div className="relative">
            <select
              value={currentRestaurant?._id || ''}
              onChange={(e) => {
                const found = assignedRestaurants.find((r) => r._id === e.target.value);
                if (found) setCurrentRestaurant(found);
              }}
              className="w-full bg-[#5E0B15] text-[#EDE1CF] text-xs font-semibold px-2.5 py-1.5 border border-[#EDE1CF]/20 appearance-none cursor-pointer focus:outline-none"
            >
              {assignedRestaurants.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#EDE1CF]/70 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors',
                isActive
                  ? 'bg-[#5E0B15] text-[#EDE1CF] border-l-4 border-[#EDE1CF]'
                  : 'text-white/80 hover:bg-[#782732] hover:text-white',
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Super Admin Switch Mode Link */}
        {isSuperAdmin && (
          <div className="pt-4 mt-4 border-t border-[#782732]/70">
            {pathname.startsWith('/admin') ? (
              <Link
                href="/dashboard"
                onClick={onCloseMobile}
                className="flex items-center gap-3 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#EDE1CF]/80 hover:text-white"
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>Restaurant View</span>
              </Link>
            ) : (
              <Link
                href="/admin"
                onClick={onCloseMobile}
                className="flex items-center gap-3 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#EDE1CF] bg-[#5E0B15] hover:bg-[#450810]"
              >
                <ShieldCheck className="w-4 h-4 text-[#EDE1CF]" />
                <span>Super Admin Portal</span>
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Public Menu Quick Link */}
      {currentRestaurant?.slug && (
        <div className="p-3 border-t border-[#782732] bg-[#782732]/40">
          <Link
            href={`/r/${currentRestaurant.slug}`}
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs font-bold text-[#EDE1CF] bg-[#5E0B15] hover:bg-[#450810] border border-[#EDE1CF]/20 transition-colors uppercase tracking-wider"
          >
            <span>View Public Menu</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* User Footer & Logout */}
      <div className="p-4 border-t border-[#782732] bg-[#782732] flex items-center justify-between">
        <div className="truncate mr-2">
          <p className="text-xs font-bold text-[#EDE1CF] truncate uppercase tracking-wider">
            {user?.name || 'Authorized User'}
          </p>
          <p className="text-[10px] text-[#EDE1CF]/70 truncate">{user?.role}</p>
        </div>
        <button
          onClick={logout}
          title="Logout"
          className="text-[#EDE1CF]/70 hover:text-white p-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
